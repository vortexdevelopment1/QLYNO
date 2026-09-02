"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronRight, Search, Stethoscope, UserRound } from "lucide-react";
import { Avatar, Card, EmptyState, ListSkeleton, Pill, SectionHeading, SectionSkeleton } from "@/components/ui";
import { ConsultationForm } from "@/components/doctor-consultation-form";
import { getBackendBootstrap } from "@/lib/api-client";
import { currentDoctor, getDoctor, patientInWorkContext, patients as seedPatients } from "@/lib/mock-data";
import { useMode } from "@/lib/mode-context";
import type { Doctor, Patient } from "@/lib/types";

const tagTone: Record<string, "brand" | "clay" | "alert" | "sage"> = {
  New: "brand",
  "Follow-up": "clay",
  Critical: "alert",
  "Shared-care": "sage",
};

function PatientConsultationPicker({
  doctors,
  isLoading,
  patients,
  query,
  setQuery,
  syncMessage,
}: {
  doctors: Doctor[];
  isLoading: boolean;
  patients: Patient[];
  query: string;
  setQuery: (value: string) => void;
  syncMessage: string;
}) {
  const filtered = patients.filter((patient) => {
    const q = query.trim().toLowerCase();
    return (
      !q ||
      patient.name.toLowerCase().includes(q) ||
      patient.mrn.toLowerCase().includes(q) ||
      patient.phone.toLowerCase().includes(q) ||
      patient.conditions.some((condition) => condition.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <SectionHeading
        eyebrow="05 - Consultation"
        title="Select Patient"
        description="Choose a patient first, then open the consultation session with their vitals, conditions, allergy alerts and clinical form ready."
      />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-xl">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search patient by name, MRN, phone or condition"
            className="input-field pl-9"
          />
        </div>
        {syncMessage && <p className="text-xs text-ink-muted">{syncMessage}</p>}
      </div>

      {isLoading ? (
        <>
          <SectionSkeleton action={false} />
          <ListSkeleton rows={7} />
        </>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState title="No patients found" description="Try another name, MRN, phone number or condition." />
        </Card>
      ) : (
        <Card padded={false}>
          <div className="divide-y divide-line">
            {filtered.map((patient) => {
              const doctor = doctors.find((item) => item.id === patient.primaryDoctorId) ?? getDoctor(patient.primaryDoctorId);
              const vitals = patient.latestVitals;

              return (
                <Link
                  key={patient.id}
                  href={`/doctor/consultation?patient=${patient.id}`}
                  className="group grid gap-4 px-5 py-4 transition-colors hover:bg-brand-50/40 lg:grid-cols-[minmax(0,1fr)_220px_140px]"
                >
                  <div className="flex min-w-0 items-start gap-3.5">
                    <Avatar initials={patient.avatarInitials} size={42} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-sm font-semibold text-ink group-hover:text-brand-700">{patient.name}</h2>
                        <span className="font-mono text-[11px] text-ink-faint">{patient.mrn}</span>
                      </div>
                      <p className="mt-1 text-xs text-ink-muted">
                        {patient.age} yrs - {patient.gender} - Blood group {patient.bloodGroup}
                      </p>
                      <p className="mt-1 text-[11px] text-ink-faint">{doctor?.name ?? currentDoctor.name}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {patient.conditions.length > 0 ? (
                          patient.conditions.slice(0, 3).map((condition) => (
                            <Pill key={condition} tone="brand">
                              {condition}
                            </Pill>
                          ))
                        ) : (
                          <Pill tone="neutral">No active conditions</Pill>
                        )}
                        {patient.tags?.map((tag) => (
                          <Pill key={tag} tone={tagTone[tag] ?? "neutral"}>
                            {tag}
                          </Pill>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:block lg:space-y-1">
                    {vitals ? (
                      <>
                        <p className="rounded-md border border-line bg-paper px-2 py-1 font-mono text-xs text-ink-muted">BP {vitals.bp}</p>
                        <p className="rounded-md border border-line bg-paper px-2 py-1 font-mono text-xs text-ink-muted">
                          Pulse {vitals.pulse} bpm
                        </p>
                        <p className="rounded-md border border-line bg-paper px-2 py-1 font-mono text-xs text-ink-muted">SpO2 {vitals.spo2}%</p>
                      </>
                    ) : (
                      <p className="text-xs text-ink-muted">No vitals recorded</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3 lg:justify-end">
                    {patient.allergies.length > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-alert-100 bg-alert-50 px-2 py-1 text-xs font-semibold text-alert-500">
                        <AlertTriangle size={13} />
                        Allergy
                      </span>
                    )}
                    <span className="btn-secondary text-xs">
                      <Stethoscope size={13} /> Start
                    </span>
                    <ChevronRight size={16} className="text-ink-faint transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

export function ConsultationPatientWorkspace({ initialPatientId }: { initialPatientId?: string }) {
  const { workContext } = useMode();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [syncMessage, setSyncMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    getBackendBootstrap()
      .then((data) => {
        if (cancelled) return;
        setPatients(data.patients);
        setDoctors(data.doctors);
        setSyncMessage("Loaded backend patient data.");
      })
      .catch(() => {
        if (cancelled) return;
        setPatients(seedPatients);
        setDoctors([currentDoctor]);
        setSyncMessage("Backend unavailable; using local demo patients.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const contextPatients = useMemo(
    () => patients.filter((patient) => patientInWorkContext(patient, workContext)),
    [patients, workContext]
  );
  const selectedPatient = initialPatientId
    ? contextPatients.find((patient) => patient.id === initialPatientId)
    : undefined;

  if (initialPatientId && selectedPatient) {
    return (
      <div>
        <div className="mb-4">
          <Link href="/doctor/consultation" className="btn-secondary">
            <UserRound size={14} /> All Patients
          </Link>
        </div>
        <ConsultationForm
          patients={contextPatients.length > 0 ? contextPatients : patients}
          preselectedPatientId={selectedPatient.id}
        />
      </div>
    );
  }

  return (
    <PatientConsultationPicker
      doctors={doctors}
      isLoading={isLoading}
      patients={contextPatients}
      query={query}
      setQuery={setQuery}
      syncMessage={syncMessage}
    />
  );
}
