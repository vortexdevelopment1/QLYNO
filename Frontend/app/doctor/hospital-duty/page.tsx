"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { ArrowRight, ClipboardCheck, Hospital, LogOut, UserRoundCheck } from "lucide-react";
import { HospitalPatientCard, WorkplaceBadge } from "@/components/doctor-workflow";
import { Card, EmptyState, Field, Modal, Pill, SectionHeading, CardGridSkeleton, SectionSkeleton, Skeleton } from "@/components/ui";
import { useDoctorWorkflow } from "@/lib/doctor-workflow-context";
import { HospitalWorkStatus } from "@/lib/doctor-workflow-types";
import { CURRENT_DATE_ISO } from "@/lib/app-time";

const tabs: Array<{ label: string; value: HospitalWorkStatus | "all" }> = [
  { label: "Assigned", value: "assigned" },
  { label: "Consult Requests", value: "request" },
  { label: "Critical", value: "critical" },
  { label: "Reports", value: "reports" },
  { label: "Discharge", value: "discharge" },
  { label: "Completed", value: "completed" },
  { label: "All", value: "all" },
];

export default function HospitalDutyPage() {
  const {
    acceptHospitalRequest,
    activeShift,
    completeHospitalItem,
    completeShift,
    getWorkplace,
    handoverHospitalItem,
    hospitalWorklist,
    isLoadingWorkflow,
    shifts,
    startShift,
    workplaces,
  } = useDoctorWorkflow();
  const hospitalWorkplaces = workplaces.filter((workplace) => workplace.type === "hospital");
  const defaultHospital = hospitalWorkplaces[0]?.id ?? "wp-hospital-aster";
  const [workplaceId, setWorkplaceId] = useState(defaultHospital);
  const [tab, setTab] = useState<HospitalWorkStatus | "all">("assigned");
  const [handoverOpen, setHandoverOpen] = useState(false);
  const [handoverDoctor, setHandoverDoctor] = useState("Dr. Nisha Rao");
  const [handoverNote, setHandoverNote] = useState("");

  const workplace = getWorkplace(workplaceId);
  const dutyShift = shifts.find((shift) => shift.workplaceId === workplaceId && shift.date === CURRENT_DATE_ISO);
  const visibleList = useMemo(
    () =>
      hospitalWorklist
        .filter((item) => item.workplaceId === workplaceId)
        .filter((item) => tab === "all" || item.status === tab),
    [hospitalWorklist, tab, workplaceId]
  );
  const unresolved = hospitalWorklist.filter((item) => item.workplaceId === workplaceId && item.status !== "completed");
  const requests = hospitalWorklist.filter((item) => item.workplaceId === workplaceId && item.status === "request").length;
  const critical = hospitalWorklist.filter((item) => item.workplaceId === workplaceId && item.priority === "Critical").length;
  const pending = hospitalWorklist.filter((item) => item.workplaceId === workplaceId && item.pending && item.pending.length > 0).length;

  if (isLoadingWorkflow) {
    return (
      <div className="space-y-6">
        <SectionSkeleton />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-7 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="!p-4">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="mt-3 h-8 w-12" />
              <Skeleton className="mt-2 h-3 w-32" />
            </Card>
          ))}
        </div>
        <CardGridSkeleton cards={4} />
      </div>
    );
  }

  function finishHandover() {
    unresolved.forEach((item) => handoverHospitalItem(item.id, handoverDoctor));
    if (dutyShift?.status === "active") completeShift(dutyShift.id);
    setHandoverOpen(false);
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="05 - Hospital Duty"
        title="Hospital Duty"
        description="Manage assigned admitted patients, consult requests, critical escalations, reports, discharge reviews and shift handover."
        action={
          <div className="flex flex-wrap gap-2">
            <select value={workplaceId} onChange={(event) => setWorkplaceId(event.target.value)} className="input-field h-10 w-60">
              {hospitalWorkplaces.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            {dutyShift && dutyShift.status !== "active" && dutyShift.status !== "completed" && (
              <button type="button" onClick={() => startShift(dutyShift.id)} className="btn-primary">
                Start Duty
              </button>
            )}
            <button type="button" onClick={() => setHandoverOpen(true)} className="btn-secondary">
              <LogOut size={15} /> End Duty
            </button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <WorkplaceBadge workplace={workplace} />
        {dutyShift && (
          <Pill tone={dutyShift.status === "active" ? "sage" : "brand"}>
            {dutyShift.startTime} - {dutyShift.endTime} {dutyShift.status}
          </Pill>
        )}
        {activeShift?.workplaceId === workplaceId && <Pill tone="sage">Current hospital shift</Pill>}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Card className="!p-4">
          <p className="eyebrow">Assigned</p>
          <p className="mt-2 font-mono text-3xl text-ink">{hospitalWorklist.filter((item) => item.workplaceId === workplaceId && item.status === "assigned").length}</p>
          <p className="mt-1 text-xs text-ink-muted">Active admitted patients</p>
        </Card>
        <Card className="!p-4">
          <p className="eyebrow">Consult requests</p>
          <p className="mt-2 font-mono text-3xl text-ink">{requests}</p>
          <p className="mt-1 text-xs text-ink-muted">Waiting acceptance</p>
        </Card>
        <Card className="!p-4">
          <p className="eyebrow">Critical</p>
          <p className="mt-2 font-mono text-3xl text-alert-500">{critical}</p>
          <p className="mt-1 text-xs text-ink-muted">Priority escalations</p>
        </Card>
        <Card className="!p-4">
          <p className="eyebrow">Pending</p>
          <p className="mt-2 font-mono text-3xl text-ink">{pending}</p>
          <p className="mt-1 text-xs text-ink-muted">Reports or actions</p>
        </Card>
      </div>

      <Card padded={false}>
        <div className="flex flex-col gap-3 border-b border-line px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="eyebrow">Worklist</p>
            <h2 className="font-display text-xl text-ink">Duty Board</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {tabs.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setTab(item.value)}
                className={clsx("rounded-md px-3 py-2 text-xs font-semibold", tab === item.value ? "bg-brand-500 text-white" : "bg-paper text-ink-soft")}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {visibleList.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 p-5 xl:grid-cols-2">
            {visibleList.map((item) => (
              <HospitalPatientCard
                key={item.id}
                item={item}
                onAccept={() => acceptHospitalRequest(item.id)}
                onComplete={() => completeHospitalItem(item.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="No hospital items here" description="Try another worklist tab." />
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <Hospital size={18} className="text-brand-700" />
          <h3 className="mt-3 text-sm font-semibold text-ink">Why patient is assigned</h3>
          <p className="mt-1 text-xs leading-5 text-ink-muted">Each card shows reason, request owner and pending hospital actions.</p>
        </Card>
        <Card>
          <UserRoundCheck size={18} className="text-sage-500" />
          <h3 className="mt-3 text-sm font-semibold text-ink">Consult acceptance</h3>
          <p className="mt-1 text-xs leading-5 text-ink-muted">Requested cases move from consult request into assigned duty after acceptance.</p>
        </Card>
        <Card>
          <ClipboardCheck size={18} className="text-clay-600" />
          <h3 className="mt-3 text-sm font-semibold text-ink">Shift handover</h3>
          <p className="mt-1 text-xs leading-5 text-ink-muted">End duty records a handover doctor for unresolved hospital cases.</p>
        </Card>
      </div>

      <Modal
        open={handoverOpen}
        title="End Hospital Duty"
        eyebrow="Handover"
        onClose={() => setHandoverOpen(false)}
        footer={
          <>
            <button type="button" onClick={finishHandover} className="btn-primary">
              Confirm Handover <ArrowRight size={14} />
            </button>
            <button type="button" onClick={() => setHandoverOpen(false)} className="btn-secondary">
              Cancel
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-md border border-alert-100 bg-alert-50 px-3 py-2">
            <p className="text-sm font-semibold text-ink">{unresolved.length} unresolved cases will be handed over.</p>
            <p className="mt-1 text-xs text-ink-muted">Completed items remain closed. Active shift status will change to completed.</p>
          </div>
          <Field label="Handover doctor">
            <select value={handoverDoctor} onChange={(event) => setHandoverDoctor(event.target.value)} className="input-field">
              <option>Dr. Nisha Rao</option>
              <option>Dr. Arvind Menon</option>
              <option>Dr. Farhan Sheikh</option>
            </select>
          </Field>
          <Field label="Handover note">
            <textarea
              rows={4}
              value={handoverNote}
              onChange={(event) => setHandoverNote(event.target.value)}
              placeholder="Vitals to watch, pending reports, discharge instructions..."
              className="input-field resize-none"
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
