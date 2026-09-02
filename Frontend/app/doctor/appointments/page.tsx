"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Video, MapPin, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { SectionHeading, Card, Avatar, EmptyState, Modal, Field, TimePicker, TableSkeleton } from "@/components/ui";
import {
  appointments as seedAppointments,
  clinic,
  doctors,
  getPatient,
  matchesWorkContext,
  patientInWorkContext,
  patients,
} from "@/lib/mock-data";
import { useMode } from "@/lib/mode-context";
import { Appointment, AppointmentStatus, AppointmentType, ClinicLocation, Doctor, Patient } from "@/lib/types";
import { CURRENT_DATE_ISO } from "@/lib/app-time";
import {
  ApiSyncSkippedError,
  createBackendAppointment,
  deleteBackendAppointment,
  getBackendBootstrap,
  updateBackendAppointment,
  updateBackendAppointmentStatus,
} from "@/lib/api-client";
import { ConsultationForm } from "@/components/doctor-consultation-form";

const filterTabs: { label: string; value: "today" | "upcoming" | "past" | "all" }[] = [
  { label: "Today", value: "today" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Past", value: "past" },
  { label: "All", value: "all" },
];

const statusOptions: AppointmentStatus[] = [
  "Scheduled",
  "Checked In",
  "In Consultation",
  "Completed",
  "Cancelled",
  "No Show",
];

const TODAY = CURRENT_DATE_ISO;
const hospitalLocations = [{ id: "hosp-1", name: "Aster City Hospital - Cardiology" }];

export default function AppointmentsPage() {
  const { selectedWorkplaceId, workContext } = useMode();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentPatients, setAppointmentPatients] = useState<Patient[]>([]);
  const [appointmentDoctors, setAppointmentDoctors] = useState<Doctor[]>([]);
  const [appointmentLocations, setAppointmentLocations] = useState<ClinicLocation[]>([]);
  const [backendWorkplaceId, setBackendWorkplaceId] = useState<string | null>(null);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [tab, setTab] = useState<"today" | "upcoming" | "past" | "all">("today");
  const [showForm, setShowForm] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<{
    appointmentId: string;
    patientId: string;
  } | null>(null);
  const [syncMessage, setSyncMessage] = useState("");
  const [form, setForm] = useState({
    patientId: "",
    doctorId: "",
    locationId: "",
    date: TODAY,
    time: "12:00 PM",
    durationMins: "20",
    type: "In-Person" as AppointmentType,
    reason: "",
  });

  const contextPatients = useMemo(
    () => appointmentPatients.filter((patient) => patientInWorkContext(patient, workContext)),
    [appointmentPatients, workContext]
  );
  const contextLocations = workContext === "hospital" ? hospitalLocations : appointmentLocations;
  const patientById = useMemo(
    () => new Map(appointmentPatients.map((patient) => [patient.id, patient])),
    [appointmentPatients]
  );
  const selectedConsultationPatient = selectedConsultation
    ? patientById.get(selectedConsultation.patientId) ?? getPatient(selectedConsultation.patientId)
    : undefined;
  const canScheduleAppointment = contextPatients.length > 0 && appointmentDoctors.length > 0 && contextLocations.length > 0;

  useEffect(() => {
    let cancelled = false;

    getBackendBootstrap()
      .then((data) => {
        if (cancelled) return;
        setAppointmentPatients(data.patients);
        setAppointmentDoctors(data.doctors);
        setAppointmentLocations(data.locations);
        setAppointments(data.appointments);
        if (data.workplaceId) setBackendWorkplaceId(data.workplaceId);
        setSyncMessage("Loaded backend appointment data.");
      })
      .catch(() => {
        if (cancelled) return;
        setAppointmentPatients(patients);
        setAppointmentDoctors(doctors);
        setAppointmentLocations(clinic.locations);
        setAppointments(seedAppointments);
        setSyncMessage("Backend unavailable; using local demo data.");
      })
      .finally(() => {
        if (!cancelled) setIsLoadingAppointments(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      patientId: contextPatients[0]?.id ?? prev.patientId,
      locationId: contextLocations[0]?.id ?? prev.locationId,
      doctorId: appointmentDoctors[0]?.id ?? prev.doctorId,
    }));
  }, [appointmentDoctors, contextPatients, contextLocations]);

  const filtered = useMemo(() => {
    return appointments
      .filter((a) => {
        if (!matchesWorkContext(a, workContext)) return false;
        if (tab === "today") return a.date === TODAY;
        if (tab === "upcoming") return a.date > TODAY;
        if (tab === "past") return a.date < TODAY;
        return true;
      })
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  }, [appointments, tab, workContext]);

  async function updateStatus(id: string, status: AppointmentStatus) {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    try {
      await updateBackendAppointmentStatus(id, status);
      setSyncMessage("Appointment status synced to backend.");
    } catch (error) {
      setSyncMessage(error instanceof ApiSyncSkippedError ? "Mock appointment updated locally." : "Backend sync failed; local update kept.");
    }
  }

  function resetForm() {
    setEditingAppointmentId(null);
    setForm((prev) => ({
      ...prev,
      patientId: contextPatients[0]?.id ?? prev.patientId,
      doctorId: appointmentDoctors[0]?.id ?? prev.doctorId,
      locationId: contextLocations[0]?.id ?? prev.locationId,
      date: TODAY,
      time: "12:00 PM",
      durationMins: "20",
      type: "In-Person",
      reason: "",
    }));
  }

  function openCreateForm() {
    resetForm();
    setShowForm(true);
  }

  function openEditForm(appointment: Appointment) {
    setEditingAppointmentId(appointment.id);
    setForm({
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      locationId: appointment.locationId ?? contextLocations[0]?.id ?? "",
      date: appointment.date,
      time: appointment.time,
      durationMins: String(appointment.durationMins),
      type: appointment.type,
      reason: appointment.reason,
    });
    setShowForm(true);
  }

  async function saveAppointment() {
    if (!canScheduleAppointment || !form.reason.trim()) return;
    const nextAppointment: Appointment = {
      id: editingAppointmentId ?? `local-apt-${Date.now()}`,
      patientId: form.patientId,
      doctorId: form.doctorId,
      locationId: form.locationId,
      workContext,
      date: form.date,
      time: form.time,
      durationMins: Number(form.durationMins) || 20,
      type: form.type,
      status: "Scheduled",
      reason: form.reason,
    };

    if (editingAppointmentId) {
      const existing = appointments.find((appointment) => appointment.id === editingAppointmentId);
      const localUpdate = { ...nextAppointment, status: existing?.status ?? "Scheduled" };
      try {
        const savedAppointment = await updateBackendAppointment(editingAppointmentId, {
          ...nextAppointment,
          workplaceId: backendWorkplaceId ?? selectedWorkplaceId,
        });
        setSyncMessage("Appointment changes synced to backend.");
        setAppointments((prev) =>
          prev.map((appointment) =>
            appointment.id === editingAppointmentId
              ? { ...savedAppointment, status: existing?.status ?? savedAppointment.status }
              : appointment
          )
        );
      } catch (error) {
        setSyncMessage(error instanceof ApiSyncSkippedError ? "Mock appointment updated locally." : "Backend sync failed; local appointment update kept.");
        setAppointments((prev) => prev.map((appointment) => (appointment.id === editingAppointmentId ? localUpdate : appointment)));
      }
      resetForm();
      setTab("all");
      setShowForm(false);
      return;
    }

    try {
      const savedAppointment = await createBackendAppointment({
        ...nextAppointment,
        workplaceId: backendWorkplaceId ?? selectedWorkplaceId,
      });
      setSyncMessage("Appointment saved to backend.");
      setAppointments((prev) => [savedAppointment, ...prev]);
    } catch (error) {
      setSyncMessage(error instanceof ApiSyncSkippedError ? "Mock appointment saved locally." : "Backend sync failed; local appointment kept.");
      setAppointments((prev) => [nextAppointment, ...prev]);
    }
    resetForm();
    setTab("all");
    setShowForm(false);
  }

  async function deleteAppointment(id: string) {
    if (!window.confirm("Delete this appointment from the schedule?")) return;

    try {
      await deleteBackendAppointment(id);
      setSyncMessage("Appointment deleted from backend.");
    } catch (error) {
      setSyncMessage(error instanceof ApiSyncSkippedError ? "Mock appointment deleted locally." : "Backend delete failed; local appointment removed.");
    }
    setAppointments((prev) => prev.filter((appointment) => appointment.id !== id));
  }

  return (
    <div>
      <SectionHeading
        eyebrow="03 - Appointment Management"
        title="Appointments"
        description={`View, manage and organize ${workContext} appointments only.`}
        action={
          <button
            onClick={openCreateForm}
            disabled={isLoadingAppointments || !canScheduleAppointment}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={14} /> New Appointment
          </button>
        }
      />

      <Modal
        open={showForm}
        title={editingAppointmentId ? "Edit Appointment" : "Schedule Appointment"}
        eyebrow="Appointment Management"
        onClose={() => {
          resetForm();
          setShowForm(false);
        }}
        footer={
          <>
            <button
              onClick={saveAppointment}
              disabled={!canScheduleAppointment}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {editingAppointmentId ? "Save Changes" : "Schedule Appointment"}
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Patient" className="sm:col-span-2">
            <select
              value={form.patientId}
              onChange={(event) => setForm((prev) => ({ ...prev, patientId: event.target.value }))}
              className="input-field"
            >
              {contextPatients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} ({patient.mrn})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Doctor">
            <select
              value={form.doctorId}
              onChange={(event) => setForm((prev) => ({ ...prev, doctorId: event.target.value }))}
              className="input-field"
            >
              {appointmentDoctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Location">
            <select
              value={form.locationId}
              onChange={(event) => setForm((prev) => ({ ...prev, locationId: event.target.value }))}
              className="input-field"
            >
              {contextLocations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Date">
            <input
              value={form.date}
              onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
              type="date"
              className="input-field"
            />
          </Field>
          <Field label="Time">
            <TimePicker
              value={form.time}
              onChange={(value) => setForm((prev) => ({ ...prev, time: value }))}
              format="12h"
              ariaLabel="Appointment time"
            />
          </Field>
          <Field label="Duration">
            <select
              value={form.durationMins}
              onChange={(event) => setForm((prev) => ({ ...prev, durationMins: event.target.value }))}
              className="input-field"
            >
              <option value="15">15 min</option>
              <option value="20">20 min</option>
              <option value="30">30 min</option>
              <option value="45">45 min</option>
            </select>
          </Field>
          <Field label="Type">
            <select
              value={form.type}
              onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as AppointmentType }))}
              className="input-field"
            >
              <option>In-Person</option>
              <option>Video</option>
              <option>Follow-up</option>
            </select>
          </Field>
          <Field label="Reason for Visit" className="sm:col-span-2">
            <input
              value={form.reason}
              onChange={(event) => setForm((prev) => ({ ...prev, reason: event.target.value }))}
              placeholder="Reason for visit"
              className="input-field"
            />
          </Field>
        </div>
      </Modal>

      <Modal
        open={Boolean(selectedConsultation)}
        title={selectedConsultationPatient ? `Consultation - ${selectedConsultationPatient.name}` : "Consultation"}
        eyebrow="Appointment Consultation"
        onClose={() => setSelectedConsultation(null)}
        size="xl"
      >
        {selectedConsultation && (
          <ConsultationForm
            patients={appointmentPatients.length > 0 ? appointmentPatients : patients}
            preselectedPatientId={selectedConsultation.patientId}
            labOrderMode="modal"
            prescriptionMode="modal"
            showHeading={false}
          />
        )}
      </Modal>

      <div className="flex items-center gap-1 mb-5 border-b border-line">
        {filterTabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-3.5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.value ? "border-brand-500 text-brand-700" : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {syncMessage && <p className="mb-3 text-xs text-ink-muted">{syncMessage}</p>}

      <Card padded={false}>
        {isLoadingAppointments ? (
          <TableSkeleton columns={6} rows={6} wrapped={false} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No appointments here" description={`Nothing scheduled in this ${workContext} range yet.`} />
        ) : (
          <table className="w-full table-clean">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date &amp; Time</th>
                <th>Type</th>
                <th>Reason</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((apt) => {
                const patient = patientById.get(apt.patientId) ?? getPatient(apt.patientId);
                if (!patient) return null;
                return (
                  <tr key={apt.id}>
                    <td>
                      <Link href={`/doctor/patients/${patient.id}`} className="flex items-center gap-2.5 group">
                        <Avatar initials={patient.avatarInitials} size={30} />
                        <span className="font-medium text-ink group-hover:text-brand-700">{patient.name}</span>
                      </Link>
                    </td>
                    <td>
                      <span className="font-mono text-xs">
                        {apt.date} - {apt.time}
                      </span>
                      <span className="block text-[11px] text-ink-faint">{apt.durationMins} min</span>
                    </td>
                    <td>
                      <span className="flex items-center gap-1 text-xs">
                        {apt.type === "Video" ? <Video size={12} /> : <MapPin size={12} />}
                        {apt.type}
                      </span>
                    </td>
                    <td>{apt.reason}</td>
                    <td>
                      <select
                        value={apt.status}
                        onChange={(e) => updateStatus(apt.id, e.target.value as AppointmentStatus)}
                        className="text-xs rounded-md border border-line bg-white px-2 py-1 outline-none focus:border-brand-400"
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" onClick={() => openEditForm(apt)} className="btn-ghost text-xs">
                          <Pencil size={13} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteAppointment(apt.id)}
                          className="btn-ghost text-xs text-alert-500"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedConsultation({ appointmentId: apt.id, patientId: patient.id })}
                          className="btn-ghost text-xs"
                        >
                          Open <ChevronRight size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
