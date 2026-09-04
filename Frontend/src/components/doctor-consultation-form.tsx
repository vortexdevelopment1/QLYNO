"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, FilePlus2, FlaskConical, Save, X } from "lucide-react";
import { Avatar, Card, Pill, SectionHeading } from "@/components/ui";
import { patientInWorkContext, patients as defaultPatients } from "@/lib/mock-data";
import { useMode } from "@/lib/mode-context";
import { Patient } from "@/lib/types";
import { LabOrderIssueModal } from "@/components/lab-order-issue-modal";
import { PrescriptionIssueModal } from "@/components/prescription-issue-modal";

interface ConsultationFormProps {
  patients?: Patient[];
  preselectedPatientId?: string | null;
  showHeading?: boolean;
  prescriptionMode?: "link" | "modal";
  labOrderMode?: "link" | "modal";
}

export function ConsultationForm({
  patients = defaultPatients,
  preselectedPatientId,
  showHeading = true,
  prescriptionMode = "link",
  labOrderMode = "link",
}: ConsultationFormProps) {
  const { workContext } = useMode();
  const contextPatients = useMemo(
    () => patients.filter((patient) => patientInWorkContext(patient, workContext)),
    [patients, workContext]
  );
  const fallbackPatientId = contextPatients[0]?.id ?? patients[0]?.id ?? "";

  const [patientId, setPatientId] = useState(preselectedPatientId ?? fallbackPatientId);
  const [complaint, setComplaint] = useState("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [symptomInput, setSymptomInput] = useState("");
  const [observations, setObservations] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [plan, setPlan] = useState("");
  const [saved, setSaved] = useState<"idle" | "draft" | "final">("idle");
  const [labOrderOpen, setLabOrderOpen] = useState(false);
  const [prescriptionOpen, setPrescriptionOpen] = useState(false);

  const patient = useMemo(() => contextPatients.find((item) => item.id === patientId), [contextPatients, patientId]);

  useEffect(() => {
    setPatientId((current) => {
      if (preselectedPatientId && contextPatients.some((item) => item.id === preselectedPatientId)) {
        return preselectedPatientId;
      }
      return contextPatients.some((item) => item.id === current) ? current : contextPatients[0]?.id ?? current;
    });
    setSaved("idle");
  }, [contextPatients, preselectedPatientId]);

  function addSymptom() {
    const symptom = symptomInput.trim();
    if (symptom && !symptoms.includes(symptom)) setSymptoms([...symptoms, symptom]);
    setSymptomInput("");
  }

  const layoutClassName = showHeading
    ? "grid grid-cols-1 xl:grid-cols-3 gap-6"
    : "grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)] gap-4";

  return (
    <div>
      {showHeading && (
        <SectionHeading
          eyebrow="05 - Consultation"
          title="Consultation Session"
          description={`Record symptoms, observations, diagnosis and treatment plan for a ${workContext} visit.`}
        />
      )}

      <div className={layoutClassName}>
        <div className="space-y-4">
          <Card>
            <label className="eyebrow block mb-2">Patient</label>
            <select
              value={patientId}
              onChange={(event) => {
                setPatientId(event.target.value);
                setSaved("idle");
              }}
              className="input-field mb-4"
            >
              {contextPatients.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} - {item.mrn}
                </option>
              ))}
            </select>

            {patient && (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <Avatar initials={patient.avatarInitials} size={44} />
                  <div>
                    <p className="text-sm font-medium text-ink">{patient.name}</p>
                    <p className="text-xs text-ink-muted">
                      {patient.age} yrs - {patient.gender} - {patient.bloodGroup}
                    </p>
                  </div>
                </div>
                {patient.allergies.length > 0 && (
                  <div className="flex items-start gap-2 rounded-md border border-alert-100 bg-alert-50 px-3 py-2 mb-3">
                    <AlertTriangle size={14} className="text-alert-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-ink-soft">
                      {patient.allergies.map((allergy) => `${allergy.substance} (${allergy.severity})`).join(", ")}
                    </p>
                  </div>
                )}
                {patient.conditions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-1">
                    {patient.conditions.map((condition) => (
                      <Pill key={condition} tone="brand">
                        {condition}
                      </Pill>
                    ))}
                  </div>
                )}
              </>
            )}
          </Card>

          {patient?.latestVitals && (
            <div className="vitals-strip !flex-col divide-x-0 divide-y divide-white/10">
              <div className="vitals-cell flex-row items-center justify-between">
                <span className="vitals-label">BP</span>
                <span className="vitals-value">{patient.latestVitals.bp}</span>
              </div>
              <div className="vitals-cell flex-row items-center justify-between">
                <span className="vitals-label">Pulse</span>
                <span className="vitals-value">{patient.latestVitals.pulse} bpm</span>
              </div>
              <div className="vitals-cell flex-row items-center justify-between">
                <span className="vitals-label">SpO2</span>
                <span className="vitals-value">{patient.latestVitals.spo2}%</span>
              </div>
            </div>
          )}

          <Card>
            <p className="eyebrow mb-2">Continue to</p>
            <div className="space-y-2">
              {prescriptionMode === "modal" ? (
                <button
                  type="button"
                  onClick={() => setPrescriptionOpen(true)}
                  className="btn-secondary w-full justify-start"
                >
                  <FilePlus2 size={14} /> Write Prescription
                </button>
              ) : (
                <Link href={`/doctor/prescriptions?patient=${patientId}`} className="btn-secondary w-full justify-start">
                  <FilePlus2 size={14} /> Write Prescription
                </Link>
              )}
              {labOrderMode === "modal" ? (
                <button
                  type="button"
                  onClick={() => setLabOrderOpen(true)}
                  className="btn-secondary w-full justify-start"
                >
                  <FlaskConical size={14} /> Order Investigation
                </button>
              ) : (
                <Link href={`/doctor/lab-orders?patient=${patientId}`} className="btn-secondary w-full justify-start">
                  <FlaskConical size={14} /> Order Investigation
                </Link>
              )}
            </div>
          </Card>
        </div>

        <div className={showHeading ? "xl:col-span-2" : ""}>
          <Card>
            <div className="space-y-5">
              <div>
                <label className="eyebrow block mb-1.5">Chief Complaint</label>
                <input
                  value={complaint}
                  onChange={(event) => setComplaint(event.target.value)}
                  placeholder="e.g. Fatigue and occasional dizziness for 5 days"
                  className="input-field"
                />
              </div>

              <div>
                <label className="eyebrow block mb-1.5">Symptoms</label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={symptomInput}
                    onChange={(event) => setSymptomInput(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && (event.preventDefault(), addSymptom())}
                    placeholder="Type a symptom and press Enter"
                    className="input-field"
                  />
                  <button onClick={addSymptom} type="button" className="btn-secondary shrink-0">
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {symptoms.map((symptom) => (
                    <span key={symptom} className="badge bg-brand-50 text-brand-700">
                      {symptom}
                      <button onClick={() => setSymptoms(symptoms.filter((item) => item !== symptom))}>
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="eyebrow block mb-1.5">Observations</label>
                <textarea
                  value={observations}
                  onChange={(event) => setObservations(event.target.value)}
                  rows={3}
                  placeholder="Clinical findings on examination..."
                  className="input-field resize-none"
                />
              </div>

              <div>
                <label className="eyebrow block mb-1.5">Diagnosis</label>
                <input
                  value={diagnosis}
                  onChange={(event) => setDiagnosis(event.target.value)}
                  placeholder="e.g. Essential hypertension - suboptimal control"
                  className="input-field"
                />
                <Link href="/doctor/diagnosis" className="text-xs text-brand-600 hover:underline mt-1 inline-block">
                  Look up ICD code
                </Link>
              </div>

              <div>
                <label className="eyebrow block mb-1.5">Treatment Plan</label>
                <textarea
                  value={plan}
                  onChange={(event) => setPlan(event.target.value)}
                  rows={3}
                  placeholder="Medication changes, lifestyle advice, next steps..."
                  className="input-field resize-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-line">
                <button onClick={() => setSaved("draft")} className="btn-secondary">
                  <Save size={14} /> Save Draft
                </button>
                <button onClick={() => setSaved("final")} className="btn-primary">
                  <CheckCircle2 size={14} /> Finalize Consultation
                </button>
                {saved === "draft" && <span className="text-xs text-clay-500 ml-2">Saved as draft</span>}
                {saved === "final" && <span className="text-xs text-sage-500 ml-2">Consultation finalized</span>}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <PrescriptionIssueModal
        open={prescriptionOpen}
        onClose={() => setPrescriptionOpen(false)}
        patients={patients}
        preselectedPatientId={patientId}
      />
      <LabOrderIssueModal
        open={labOrderOpen}
        onClose={() => setLabOrderOpen(false)}
        patients={patients}
        preselectedPatientId={patientId}
        navigateAfterPlace
      />
    </div>
  );
}
