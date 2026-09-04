"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StepWizard } from "@/components/ui/StepWizard";
import { EntityHeader } from "@/components/ui/EntityHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BillingAuthorityBadge, PriorityBadge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { useDemo } from "@/state/demo-context";
import { MOCK_PATIENTS, MOCK_ENCOUNTERS } from "@/data/mock/patients";
import { MOCK_CATALOG } from "@/data/mock/catalog";
import { resolveBillingAuthority, ORDER_SOURCE_LABEL } from "@/config/tenant-modes";
import type { OrderSource, Priority } from "@/lib/types/domain";
import { useHospitalWorkflow } from "@/state/hospital-workflow-context";
import { PatientSearchRegistration } from "@/components/domain/PatientSearchRegistration";

const STEPS = [
  { id: "patient", label: "Patient" },
  { id: "source", label: "Source & Context" },
  { id: "tests", label: "Tests / Panels" },
  { id: "specimen", label: "Specimen Requirements" },
  { id: "priority", label: "Priority & Collection" },
  { id: "consent", label: "Preparation & Consent" },
  { id: "billing", label: "Billing Authority" },
  { id: "review", label: "Review & Place" },
];

export default function NewOrderPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { tenantMode, session } = useDemo();
  const { createHospitalOrder, registeredPatients } = useHospitalWorkflow();
  const [step, setStep] = useState(0);
  const [patientId, setPatientId] = useState("");
  const [source, setSource] = useState<OrderSource>("hospital_encounter");
  const [selectedTests, setSelectedTests] = useState<string[]>([MOCK_CATALOG[0].id]);
  const [priority, setPriority] = useState<Priority>("routine");
  const [consentAck, setConsentAck] = useState(false);

  const registeredPatient = registeredPatients.find((patient) => patient.id === patientId);
  const patient = registeredPatient ? { id: registeredPatient.id, name: registeredPatient.displayName, mrn: registeredPatient.hospitalMrn, age: registeredPatient.dateOfBirth ? new Date().getFullYear() - new Date(registeredPatient.dateOfBirth).getFullYear() : registeredPatient.estimatedAge?.value ?? 0, sex: registeredPatient.sexAtBirth === "MALE" ? "M" as const : registeredPatient.sexAtBirth === "FEMALE" ? "F" as const : "O" as const, contact: registeredPatient.primaryMobile ?? "", source: "hospital_encounter" as const } : MOCK_PATIENTS.find((p) => p.id === patientId);
  const billingAuthority = resolveBillingAuthority(tenantMode, source);
  const tests = MOCK_CATALOG.filter((t) => selectedTests.includes(t.id));

  function toggleTest(id: string) {
    setSelectedTests((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function placeOrder() {
    if (session?.billingOwner !== "HMS_CENTRAL" || !patient) return;
    const encounter = MOCK_ENCOUNTERS.find((item) => item.patientId === patient.id);
    const order = createHospitalOrder({ patientId: patient.id, patientName: patient.name, mrn: patient.mrn ?? patient.id, encounterId: encounter?.id ?? `ENC-${Date.now().toString().slice(-5)}`, orderingDoctor: encounter?.admittingDoctor ?? "HMS ordering clinician", priority, testIds: tests.map((test) => test.id), departmentIds: Array.from(new Set(tests.map((test) => test.department))) });
    showToast({ title: "Hospital order created", description: `${order.id} is now visible in Orders and ready for confirmation.`, tone: "success" });
    router.push(`/orders/${order.id}`);
  }

  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 3 · Orders & Catalog" title="New Hospital Order" subtitle="Search or register the patient, confirm the hospital encounter, and place a connected laboratory order." />
      <Card className="p-4 sm:p-6">
        <StepWizard steps={STEPS} currentIndex={step} onStepClick={setStep} />
        <div className="mt-6 min-h-[280px]">
          {step === 0 && <PatientSearchRegistration selectedPatientId={patientId} onSelect={setPatientId} />}

          {step === 1 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-text-main">2. Select source and clinical context</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {(["hospital_encounter"] as OrderSource[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSource(s)}
                    className={`rounded-xl border px-4 py-3 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue ${
                      source === s ? "border-brand-blue bg-blue-50 text-brand-blue" : "border-app-border bg-white text-text-main hover:bg-app-bg"
                    }`}
                  >
                    {ORDER_SOURCE_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-text-main">3. Select tests / panels</h3>
              <ul className="divide-y divide-app-border rounded-card border border-app-border">
                {MOCK_CATALOG.filter((t) => t.status === "active").map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <label className="flex items-center gap-3 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedTests.includes(t.id)}
                        onChange={() => toggleTest(t.id)}
                        className="h-4 w-4 rounded border-app-border text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                      />
                      <span>
                        <span className="font-medium text-text-main">{t.name}</span>{" "}
                        <span className="text-xs text-text-muted">({t.code} · {t.department})</span>
                      </span>
                    </label>
                    <span className="text-xs text-text-muted">TAT {t.tat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-text-main">4. Specimen / container requirements</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {tests.map((t) => (
                  <Card key={t.id} className="p-4">
                    <p className="text-sm font-medium text-text-main">{t.name}</p>
                    <dl className="mt-2 space-y-1 text-xs text-text-muted">
                      <div>Specimen: <span className="text-text-main">{t.specimen}</span></div>
                      <div>Container: <span className="text-text-main">{t.container}</span></div>
                      <div>Min. volume: <span className="text-text-main">{t.minVolume}</span></div>
                      <div>Stability: <span className="text-text-main">{t.stability}</span></div>
                    </dl>
                  </Card>
                ))}
                {tests.length === 0 && <p className="text-xs text-text-muted">Select at least one test to see specimen requirements.</p>}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-text-main">5. Choose priority and collection</h3>
              <div className="flex flex-wrap gap-2">
                {(["routine", "urgent", "stat"] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue ${
                      priority === p ? "border-transparent" : "border-app-border bg-white text-text-main hover:bg-app-bg"
                    }`}
                  >
                    {priority === p ? <PriorityBadge priority={p} /> : p.toUpperCase()}
                  </button>
                ))}
              </div>
              <p className="text-xs text-text-muted">Collection mode: {source === "home_collection" ? "Home collection round" : source === "hospital_encounter" ? "Ward collection" : "Walk-in collection at branch"}</p>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-text-main">6. Review preparation and consent</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-text-muted">
                <li>Fasting required for lipid profile and glucose-related panels (if selected).</li>
                <li>Patient identity confirmed using two identifiers prior to collection.</li>
                <li>Verbal consent obtained for specimen collection and testing.</li>
              </ul>
              <label className="mt-2 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={consentAck} onChange={(e) => setConsentAck(e.target.checked)} className="h-4 w-4 rounded border-app-border text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue" />
                Preparation instructions and consent reviewed with patient
              </label>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-text-main">7. Resolve billing authority</h3>
              <p className="text-sm text-text-muted">
                Based on the current tenant mode (<span className="font-medium text-text-main">{tenantMode}</span>) and order source (
                <span className="font-medium text-text-main">{ORDER_SOURCE_LABEL[source]}</span>), this order resolves to exactly one billing authority:
              </p>
              <BillingAuthorityBadge authority={billingAuthority} />
            </div>
          )}

          {step === 7 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-text-main">8. Review and place order</h3>
              <Card className="p-4">
                <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div><dt className="text-xs text-text-muted">Patient</dt><dd className="text-sm font-medium">{patient?.name ?? "Not selected"}</dd></div>
                  <div><dt className="text-xs text-text-muted">Source</dt><dd className="text-sm font-medium">{ORDER_SOURCE_LABEL[source]}</dd></div>
                  <div><dt className="text-xs text-text-muted">Tests</dt><dd className="text-sm font-medium">{tests.map((t) => t.code).join(", ") || "None selected"}</dd></div>
                  <div><dt className="text-xs text-text-muted">Priority</dt><dd><PriorityBadge priority={priority} /></dd></div>
                  <div><dt className="text-xs text-text-muted">Billing authority</dt><dd><BillingAuthorityBadge authority={billingAuthority} /></dd></div>
                  <div><dt className="text-xs text-text-muted">Consent reviewed</dt><dd className="text-sm font-medium">{consentAck ? "Yes" : "Not confirmed"}</dd></div>
                </dl>
              </Card>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-app-border pt-4">
          <Button variant="outline" size="sm" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button size="sm" onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} disabled={(step === 0 && !patientId) || (step === 2 && tests.length === 0)} disabledReason={step === 0 && !patientId ? "Search and select or register a patient first" : undefined}>
              Continue
            </Button>
          ) : (
            <Button size="sm" onClick={placeOrder} disabled={!consentAck} disabledReason="Confirm preparation & consent review before placing the order.">
              Place order
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
