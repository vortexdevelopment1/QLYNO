"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CalendarDays, CheckCircle2, MapPin, Stethoscope, UserRound } from "lucide-react";
import { Card, Pill, SectionHeading, SectionSkeleton, Skeleton, TimePicker } from "@/components/ui";
import { patients as seedPatients } from "@/lib/mock-data";
import { ApiSyncSkippedError, createBackendAppointment, getBackendBootstrap } from "@/lib/api-client";
import { CURRENT_DATE_ISO } from "@/lib/app-time";
import { AppointmentType, Doctor, Patient } from "@/lib/types";
import {
  doctorAffiliations,
  findDoctor,
  getAffiliation,
  getDoctorAffiliations,
  getOrganization,
  getService,
} from "@/lib/discovery-data";

const slots = ["09:00 AM", "10:30 AM", "12:00 PM", "04:00 PM", "05:30 PM", "06:30 PM"];

function BookingFlow() {
  const params = useSearchParams();
  const requestedAffiliation = params.get("affiliation");
  const requestedDoctor = params.get("doctor");
  const initialAffiliations = requestedAffiliation
    ? doctorAffiliations.filter((affiliation) => affiliation.id === requestedAffiliation)
    : requestedDoctor
      ? getDoctorAffiliations(requestedDoctor)
      : doctorAffiliations;

  const availableAffiliations = initialAffiliations.length > 0 ? initialAffiliations : doctorAffiliations;
  const [affiliationId, setAffiliationId] = useState(availableAffiliations[0].id);
  const affiliation = getAffiliation(affiliationId) ?? availableAffiliations[0];
  const doctor = findDoctor(affiliation.doctorId);
  const organization = getOrganization(affiliation.organizationId);
  const [patientRows, setPatientRows] = useState<Patient[]>([]);
  const [backendDoctors, setBackendDoctors] = useState<Doctor[]>([]);
  const [backendWorkplaceId, setBackendWorkplaceId] = useState("");
  const [patientId, setPatientId] = useState("");
  const [serviceId, setServiceId] = useState(affiliation.serviceIds[0]);
  const [mode, setMode] = useState(affiliation.modes[0]);
  const [slot, setSlot] = useState(slots[3]);
  const [confirmed, setConfirmed] = useState(false);
  const [isLoadingBookingData, setIsLoadingBookingData] = useState(true);
  const [syncMessage, setSyncMessage] = useState("");

  const serviceOptions = useMemo(() => affiliation.serviceIds.map((id) => getService(id)).filter(Boolean), [affiliation]);
  const patient = patientRows.find((item) => item.id === patientId);
  const service = getService(serviceId);
  const backendDoctor = backendDoctors.find((item) => item.name === doctor?.name) ?? backendDoctors[0];

  useEffect(() => {
    let cancelled = false;

    getBackendBootstrap()
      .then((data) => {
        if (cancelled) return;
        setPatientRows(data.patients);
        setBackendDoctors(data.doctors);
        setBackendWorkplaceId(data.workplaceId ?? "");
        setPatientId(data.patients[0]?.id ?? "");
      })
      .catch(() => {
        if (cancelled) return;
        setPatientRows(seedPatients);
        setSyncMessage("Backend unavailable; booking cannot be saved right now.");
      })
      .finally(() => {
        if (!cancelled) setIsLoadingBookingData(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoadingBookingData) {
    return (
      <div>
        <SectionSkeleton action={false} />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <Card>
              <Skeleton className="mb-4 h-3 w-44" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-20 w-full" />
                ))}
              </div>
            </Card>
            <Card>
              <Skeleton className="mb-4 h-3 w-44" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
              <Skeleton className="mt-5 h-10 w-40" />
            </Card>
          </div>
          <Card>
            <Skeleton className="mb-5 h-6 w-40" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex gap-2.5">
                  <Skeleton className="h-4 w-4" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="mt-2 h-3 w-28" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  function updateAffiliation(nextId: string) {
    const next = getAffiliation(nextId);
    if (!next) return;
    setAffiliationId(next.id);
    setServiceId(next.serviceIds[0]);
    setMode(next.modes[0]);
    setConfirmed(false);
  }

  async function confirmBooking() {
    setConfirmed(false);
    setSyncMessage("");

    if (!patientId || !backendDoctor?.id || !backendWorkplaceId) {
      setSyncMessage("Backend appointment data is still loading.");
      return;
    }

    const appointmentType: AppointmentType = mode === "Online" ? "Video" : "In-Person";

    try {
      await createBackendAppointment({
        patientId,
        doctorId: backendDoctor.id,
        workplaceId: backendWorkplaceId,
        date: CURRENT_DATE_ISO,
        time: slot,
        durationMins: 30,
        type: appointmentType,
        reason: service?.name ?? "Appointment booking",
      });
      setConfirmed(true);
      setSyncMessage("Appointment saved to database.");
    } catch (error) {
      setSyncMessage(error instanceof ApiSyncSkippedError ? "Backend IDs are still loading." : "Database save failed. Please try again.");
    }
  }

  return (
    <div>
      <SectionHeading
        eyebrow="Appointment Booking"
        title="Book with full care context"
        description="The appointment stores patient, doctor, organization, location, service, slot and consultation mode."
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <p className="eyebrow mb-3">1. Choose practice context</p>
            <div className="space-y-3">
              {availableAffiliations.map((option) => {
                const optionDoctor = findDoctor(option.doctorId);
                const optionOrganization = getOrganization(option.organizationId);
                const active = option.id === affiliation.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => updateAffiliation(option.id)}
                    className={`w-full rounded-md border p-4 text-left transition-colors ${
                      active ? "border-brand-500 bg-brand-50" : "border-line hover:bg-paper"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-ink">{optionDoctor?.name}</p>
                        <p className="text-xs text-ink-muted">
                          {optionOrganization?.name} - {option.label}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <Pill tone="neutral">INR {option.fee}</Pill>
                        <Pill tone="sage">{option.nextAvailable}</Pill>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card>
            <p className="eyebrow mb-3">2. Appointment details</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label>
                <span className="text-[11px] text-ink-muted block mb-1">Patient</span>
                <select value={patientId} onChange={(event) => setPatientId(event.target.value)} className="input-field">
                  {patientRows.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} - {item.mrn}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="text-[11px] text-ink-muted block mb-1">Service</span>
                <select value={serviceId} onChange={(event) => setServiceId(event.target.value)} className="input-field">
                  {serviceOptions.map((item) => (
                    <option key={item?.id} value={item?.id}>
                      {item?.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="text-[11px] text-ink-muted block mb-1">Mode</span>
                <select value={mode} onChange={(event) => setMode(event.target.value as typeof mode)} className="input-field">
                  {affiliation.modes.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="text-[11px] text-ink-muted block mb-1">Slot</span>
                <TimePicker value={slot} onChange={setSlot} format="12h" presets={slots} ariaLabel="Booking slot" />
              </label>
            </div>

            <button onClick={confirmBooking} className="btn-primary mt-5">
              <CheckCircle2 size={14} /> Confirm booking
            </button>
            {syncMessage && <p className="mt-3 text-xs text-ink-muted">{syncMessage}</p>}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="font-display text-lg text-ink mb-4">Booking summary</h2>
            <div className="space-y-4">
              <div className="flex gap-2.5">
                <UserRound size={15} className="text-brand-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-ink">{patient?.name}</p>
                  <p className="text-xs text-ink-muted">{patient?.mrn}</p>
                </div>
              </div>
              <div className="flex gap-2.5">
                <Stethoscope size={15} className="text-brand-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-ink">{doctor?.name}</p>
                  <p className="text-xs text-ink-muted">{service?.name}</p>
                </div>
              </div>
              <div className="flex gap-2.5">
                <MapPin size={15} className="text-brand-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-ink">{organization?.name}</p>
                  <p className="text-xs text-ink-muted">{affiliation.label}</p>
                </div>
              </div>
              <div className="flex gap-2.5">
                <CalendarDays size={15} className="text-brand-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-ink">Today - {slot}</p>
                  <p className="text-xs text-ink-muted">{mode} - INR {affiliation.fee}</p>
                </div>
              </div>
            </div>
          </Card>

          {confirmed && (
            <Card className="border-sage-100 bg-sage-50">
              <p className="text-sm font-medium text-sage-500 flex items-center gap-2">
                <CheckCircle2 size={15} /> Appointment context captured
              </p>
              <p className="text-xs text-ink-muted mt-2">
                Appointment saved with patient, doctor, organization, service, slot and consultation mode.
              </p>
              <Link href="/doctor/appointments" className="btn-secondary text-xs mt-4">
                View appointments
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<SectionSkeleton action={false} />}>
      <BookingFlow />
    </Suspense>
  );
}
