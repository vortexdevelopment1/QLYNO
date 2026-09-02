"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Ban, CalendarPlus, ChevronLeft, ChevronRight, Plane, Plus } from "lucide-react";
import { ConflictNotice, ShiftCard, WorkplaceBadge } from "@/components/doctor-workflow";
import { Card, Field, Modal, Pill, SectionHeading, TimePicker, SectionSkeleton, Skeleton, TableSkeleton } from "@/components/ui";
import { useDoctorWorkflow } from "@/lib/doctor-workflow-context";
import { DoctorShift, ShiftType, shiftTypeLabel } from "@/lib/doctor-workflow-types";
import { CURRENT_DATE_ISO, CURRENT_DATE_LABEL } from "@/lib/app-time";
import { currentDoctor } from "@/lib/mock-data";
import { ApiSyncSkippedError, createBackendShift, updateBackendShiftStatus } from "@/lib/api-client";

const TODAY = CURRENT_DATE_ISO;
const views = ["Day", "Week", "Month"] as const;
type ViewMode = (typeof views)[number];

const shiftTypes: ShiftType[] = [
  "clinic_opd",
  "hospital_duty",
  "online_consultation",
  "ward_round",
  "on_call",
  "blocked",
  "leave",
];

function minutes(time: string) {
  const [hours, mins] = time.split(":").map(Number);
  return hours * 60 + mins;
}

function getConflicts(shifts: DoctorShift[]) {
  const conflicts: Array<[DoctorShift, DoctorShift]> = [];
  shifts.forEach((shift, index) => {
    shifts.slice(index + 1).forEach((next) => {
      if (shift.date !== next.date || shift.status === "cancelled" || next.status === "cancelled") return;
      if (minutes(shift.startTime) < minutes(next.endTime) && minutes(next.startTime) < minutes(shift.endTime)) {
        conflicts.push([shift, next]);
      }
    });
  });
  return conflicts;
}

export default function DoctorSchedulePage() {
  const { addShift, backendDoctorId, completeShift, getWorkplace, isLoadingWorkflow, shifts, startShift, updateShiftStatus, workplaces } = useDoctorWorkflow();
  const [view, setView] = useState<ViewMode>("Day");
  const [workplaceFilter, setWorkplaceFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  const [modal, setModal] = useState<"shift" | "add" | null>(null);
  const [formError, setFormError] = useState("");
  const [syncMessage, setSyncMessage] = useState("");
  const [draft, setDraft] = useState({
    workplaceId: workplaces[0]?.id ?? "wp-clinic-mg",
    date: TODAY,
    startTime: "10:00",
    endTime: "12:00",
    shiftType: "clinic_opd" as ShiftType,
    bookingEnabled: true,
    slotMinutes: "20",
    bufferMinutes: "5",
    bookingLimit: "",
    recurrenceRule: "",
  });

  const visibleShifts = useMemo(
    () =>
      shifts
        .filter((shift) => workplaceFilter === "all" || shift.workplaceId === workplaceFilter)
        .filter((shift) => typeFilter === "all" || shift.shiftType === typeFilter)
        .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`)),
    [shifts, typeFilter, workplaceFilter]
  );
  const conflicts = useMemo(() => getConflicts(visibleShifts), [visibleShifts]);
  const selectedShift = selectedShiftId ? shifts.find((shift) => shift.id === selectedShiftId) : undefined;
  const todayShifts = visibleShifts.filter((shift) => shift.date === TODAY);

  useEffect(() => {
    setDraft((prev) => {
      if (workplaces.some((workplace) => workplace.id === prev.workplaceId)) return prev;
      return { ...prev, workplaceId: workplaces[0]?.id ?? prev.workplaceId };
    });
  }, [workplaces]);

  if (isLoadingWorkflow) {
    return (
      <div className="space-y-6">
        <SectionSkeleton />
        <Card className="!p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex gap-2">
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-9 w-20" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-36" />
              <Skeleton className="h-9 w-52" />
            </div>
          </div>
        </Card>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
          <TableSkeleton columns={3} rows={6} />
          <div className="space-y-4">
            <Card>
              <Skeleton className="mb-4 h-3 w-32" />
              <Skeleton className="mb-3 h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </Card>
            <Card>
              <Skeleton className="mb-4 h-3 w-28" />
              <Skeleton className="mb-2 h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  function openShift(id: string) {
    setSelectedShiftId(id);
    setModal("shift");
  }

  async function persistShiftStatus(id: string, status: "active" | "completed" | "cancelled") {
    try {
      await updateBackendShiftStatus(id, status);
      setSyncMessage("Shift status synced to backend.");
    } catch (error) {
      setSyncMessage(error instanceof ApiSyncSkippedError ? "Mock shift updated locally." : "Backend sync failed; local shift update kept.");
    }
  }

  async function createShift() {
    setFormError("");
    if (minutes(draft.startTime) >= minutes(draft.endTime)) {
      setFormError("End time must be after start time.");
      return;
    }

    const overlaps = shifts.filter(
      (shift) =>
        shift.date === draft.date &&
        shift.status !== "cancelled" &&
        minutes(draft.startTime) < minutes(shift.endTime) &&
        minutes(shift.startTime) < minutes(draft.endTime)
    );

    if (overlaps.length > 0) {
      setFormError("This shift overlaps with existing availability. Adjust the time before saving.");
      return;
    }

    const nextShift: DoctorShift = {
      id: `shift-${Date.now()}`,
      workplaceId: draft.workplaceId,
      date: draft.date,
      startTime: draft.startTime,
      endTime: draft.endTime,
      shiftType: draft.shiftType,
      status: "upcoming",
      bookingEnabled: draft.bookingEnabled,
      slotMinutes: Number(draft.slotMinutes) || 20,
      bufferMinutes: Number(draft.bufferMinutes) || 0,
      bookingLimit: draft.bookingLimit ? Number(draft.bookingLimit) : undefined,
      recurrenceRule: draft.recurrenceRule || undefined,
      note: draft.shiftType === "leave" ? "Leave requested" : draft.shiftType === "blocked" ? "Blocked time" : undefined,
    };

    try {
      const savedShift = await createBackendShift({
        doctorId: backendDoctorId ?? currentDoctor.id,
        ...nextShift,
      });
      addShift(savedShift);
      setSyncMessage("Shift saved to backend.");
    } catch (error) {
      setSyncMessage(error instanceof ApiSyncSkippedError ? "Mock shift saved locally." : "Backend sync failed; local shift kept.");
      addShift(nextShift);
    }

    setModal(null);
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="02 - My Schedule"
        title="My Schedule"
        description="Manage clinic OPD, hospital duty, online consultations, leave, blocked time and conflicts from one doctor calendar."
        action={
          <button
            type="button"
            onClick={() => {
              setFormError("");
              setModal("add");
            }}
            className="btn-primary"
          >
            <Plus size={15} /> Add Availability
          </button>
        }
      />

      <Card className="!p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {views.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setView(item)}
                className={clsx("rounded-md px-3 py-2 text-sm font-semibold", view === item ? "bg-brand-500 text-white" : "bg-paper text-ink-soft")}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-ink-muted hover:bg-paper hover:text-ink" type="button" aria-label="Previous period">
              <ChevronLeft size={15} />
            </button>
            <Pill tone="brand">{CURRENT_DATE_LABEL}</Pill>
            <button className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-ink-muted hover:bg-paper hover:text-ink" type="button" aria-label="Next period">
              <ChevronRight size={15} />
            </button>
            <select value={workplaceFilter} onChange={(e) => setWorkplaceFilter(e.target.value)} className="input-field h-9 w-52">
              <option value="all">All workplaces</option>
              {workplaces.map((workplace) => (
                <option key={workplace.id} value={workplace.id}>
                  {workplace.name} {workplace.location ? `- ${workplace.location}` : ""}
                </option>
              ))}
            </select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field h-9 w-48">
              <option value="all">All shift types</option>
              {shiftTypes.map((type) => (
                <option key={type} value={type}>
                  {shiftTypeLabel(type)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <ConflictNotice conflicts={conflicts} />
      {syncMessage && <p className="text-xs text-ink-muted">{syncMessage}</p>}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        <Card padded={false}>
          <div className="border-b border-line px-5 py-4">
            <p className="eyebrow">Calendar</p>
            <h2 className="font-display text-xl text-ink">{view} view</h2>
          </div>
          <div className="divide-y divide-line">
            {visibleShifts.map((shift) => {
              const workplace = getWorkplace(shift.workplaceId);
              return (
                <div key={shift.id} className="grid grid-cols-1 gap-3 px-5 py-4 lg:grid-cols-[110px_1fr_170px] lg:items-center">
                  <div>
                    <p className="font-mono text-sm text-ink">{shift.startTime}</p>
                    <p className="text-xs text-ink-muted">{shift.endTime}</p>
                  </div>
                  <button type="button" onClick={() => openShift(shift.id)} className="text-left">
                    <p className="text-sm font-semibold text-ink">{shiftTypeLabel(shift.shiftType)}</p>
                    <div className="mt-1">
                      <WorkplaceBadge workplace={workplace} />
                    </div>
                  </button>
                  <div className="flex items-center gap-2 lg:justify-end">
                    <Pill tone={shift.status === "active" ? "sage" : shift.shiftType === "leave" ? "alert" : "neutral"}>
                      {shift.status}
                    </Pill>
                    <button type="button" onClick={() => openShift(shift.id)} className="btn-secondary text-xs">
                      Details
                    </button>
                  </div>
                </div>
              );
            })}
            {visibleShifts.length === 0 && <p className="px-5 py-10 text-center text-sm text-ink-muted">No shifts match this filter.</p>}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="border-brand-100 bg-brand-50/70">
            <p className="eyebrow text-brand-700">Today Timeline</p>
            <div className="mt-4 space-y-3">
              {todayShifts.map((shift) => (
                <ShiftCard key={shift.id} shift={shift} workplace={getWorkplace(shift.workplaceId)} onClick={() => openShift(shift.id)} />
              ))}
            </div>
          </Card>

          <Card>
            <p className="eyebrow">Quick Actions</p>
            <div className="mt-4 grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => {
                  setFormError("");
                  setModal("add");
                }}
                className="btn-secondary justify-start"
              >
                <CalendarPlus size={15} /> Add OPD / duty shift
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraft((prev) => ({ ...prev, shiftType: "blocked", bookingEnabled: false }));
                  setFormError("");
                  setModal("add");
                }}
                className="btn-secondary justify-start"
              >
                <Ban size={15} /> Block time
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraft((prev) => ({ ...prev, shiftType: "leave", startTime: "00:00", endTime: "23:59", bookingEnabled: false }));
                  setFormError("");
                  setModal("add");
                }}
                className="btn-secondary justify-start"
              >
                <Plane size={15} /> Mark leave
              </button>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={modal === "shift" && Boolean(selectedShift)}
        title={selectedShift ? shiftTypeLabel(selectedShift.shiftType) : "Shift"}
        eyebrow="Shift details"
        onClose={() => setModal(null)}
        footer={
          selectedShift && (
            <>
              {selectedShift.status !== "active" && selectedShift.status !== "completed" && (
                <button
                  type="button"
                  onClick={() => {
                    startShift(selectedShift.id);
                    persistShiftStatus(selectedShift.id, "active");
                  }}
                  className="btn-primary"
                >
                  Start Shift
                </button>
              )}
              {selectedShift.status === "active" && (
                <button
                  type="button"
                  onClick={() => {
                    completeShift(selectedShift.id);
                    persistShiftStatus(selectedShift.id, "completed");
                  }}
                  className="btn-primary"
                >
                  End Shift
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Cancel this shift and close patient booking for this time?")) {
                    updateShiftStatus(selectedShift.id, "cancelled");
                    persistShiftStatus(selectedShift.id, "cancelled");
                  }
                }}
                className="btn-secondary"
              >
                Cancel Shift
              </button>
            </>
          )
        }
      >
        {selectedShift && (
          <div className="space-y-4">
            <WorkplaceBadge workplace={getWorkplace(selectedShift.workplaceId)} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Card className="!p-3">
                <p className="eyebrow">Date</p>
                <p className="mt-1 text-sm font-semibold text-ink">{selectedShift.date}</p>
              </Card>
              <Card className="!p-3">
                <p className="eyebrow">Time</p>
                <p className="mt-1 text-sm font-semibold text-ink">
                  {selectedShift.startTime} - {selectedShift.endTime}
                </p>
              </Card>
              <Card className="!p-3">
                <p className="eyebrow">Booking</p>
                <p className="mt-1 text-sm font-semibold text-ink">{selectedShift.bookingEnabled ? "Enabled" : "Closed"}</p>
              </Card>
            </div>
            <Field label="Notes">
              <textarea className="input-field resize-none" rows={3} defaultValue={selectedShift.note ?? ""} />
            </Field>
          </div>
        )}
      </Modal>

      <Modal
        open={modal === "add"}
        title="Add Schedule"
        eyebrow="Availability"
        onClose={() => setModal(null)}
        footer={
          <>
            <button type="button" onClick={createShift} className="btn-primary">
              Save Schedule
            </button>
            <button type="button" onClick={() => setModal(null)} className="btn-secondary">
              Cancel
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {formError && (
            <div className="sm:col-span-2 rounded-md border border-alert-100 bg-alert-50 px-3 py-2 text-sm text-ink-soft">
              {formError}
            </div>
          )}
          <Field label="Workplace">
            <select value={draft.workplaceId} onChange={(e) => setDraft((prev) => ({ ...prev, workplaceId: e.target.value }))} className="input-field">
              {workplaces.map((workplace) => (
                <option key={workplace.id} value={workplace.id}>
                  {workplace.name} {workplace.location ? `- ${workplace.location}` : ""}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Shift type">
            <select value={draft.shiftType} onChange={(e) => setDraft((prev) => ({ ...prev, shiftType: e.target.value as ShiftType }))} className="input-field">
              {shiftTypes.map((type) => (
                <option key={type} value={type}>
                  {shiftTypeLabel(type)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Date">
            <input type="date" value={draft.date} onChange={(e) => setDraft((prev) => ({ ...prev, date: e.target.value }))} className="input-field" />
          </Field>
          <Field label="Start time">
            <TimePicker value={draft.startTime} onChange={(value) => setDraft((prev) => ({ ...prev, startTime: value }))} ariaLabel="Shift start time" />
          </Field>
          <Field label="End time">
            <TimePicker value={draft.endTime} onChange={(value) => setDraft((prev) => ({ ...prev, endTime: value }))} ariaLabel="Shift end time" />
          </Field>
          <Field label="Slot length">
            <select value={draft.slotMinutes} onChange={(e) => setDraft((prev) => ({ ...prev, slotMinutes: e.target.value }))} className="input-field">
              <option value="10">10 min</option>
              <option value="15">15 min</option>
              <option value="20">20 min</option>
              <option value="30">30 min</option>
              <option value="45">45 min</option>
            </select>
          </Field>
          <Field label="Buffer">
            <select value={draft.bufferMinutes} onChange={(e) => setDraft((prev) => ({ ...prev, bufferMinutes: e.target.value }))} className="input-field">
              <option value="0">No buffer</option>
              <option value="5">5 min</option>
              <option value="10">10 min</option>
              <option value="15">15 min</option>
            </select>
          </Field>
          <Field label="Booking limit">
            <input
              type="number"
              min="1"
              value={draft.bookingLimit}
              onChange={(e) => setDraft((prev) => ({ ...prev, bookingLimit: e.target.value }))}
              placeholder="No limit"
              className="input-field"
            />
          </Field>
          <Field label="Recurring rule">
            <input
              value={draft.recurrenceRule}
              onChange={(e) => setDraft((prev) => ({ ...prev, recurrenceRule: e.target.value }))}
              placeholder="Weekly, Mon-Fri, custom..."
              className="input-field"
            />
          </Field>
          <label className="mt-6 flex items-center gap-2 text-sm font-medium text-ink-soft">
            <input
              type="checkbox"
              checked={draft.bookingEnabled}
              onChange={(e) => setDraft((prev) => ({ ...prev, bookingEnabled: e.target.checked }))}
              className="h-4 w-4 accent-brand-500"
            />
            Enable patient booking
          </label>
        </div>
      </Modal>
    </div>
  );
}
