"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Modal, Skeleton } from "@/components/ui";
import { CURRENT_DATE_ISO } from "@/lib/app-time";
import { ApiSyncSkippedError, createBackendOrder, getBackendBootstrap } from "@/lib/api-client";
import { saveLocalLabOrder } from "@/lib/lab-order-local-store";
import { patients as seedPatients, patientInWorkContext } from "@/lib/mock-data";
import { useMode } from "@/lib/mode-context";
import { LabOrder, Patient } from "@/lib/types";

const commonTests = [
  "HbA1c",
  "Complete Blood Count",
  "Lipid Profile",
  "Thyroid Panel",
  "Troponin-I",
  "Liver Function Test",
  "Kidney Function Test",
  "Urinalysis",
];

interface LabOrderIssueModalProps {
  open: boolean;
  onClose: () => void;
  patients?: Patient[];
  preselectedPatientId?: string | null;
  navigateAfterPlace?: boolean;
}

export function LabOrderIssueModal({
  open,
  onClose,
  patients = seedPatients,
  preselectedPatientId,
  navigateAfterPlace = false,
}: LabOrderIssueModalProps) {
  const router = useRouter();
  const { selectedWorkplaceId, workContext } = useMode();
  const [backendDoctorId, setBackendDoctorId] = useState("doc-1");
  const [patientId, setPatientId] = useState(preselectedPatientId ?? "");
  const [testName, setTestName] = useState("");
  const [priority, setPriority] = useState<"Routine" | "Urgent">("Routine");
  const [source, setSource] = useState<"Internal" | "Partner Lab" | "External / Manual">("Internal");
  const [syncMessage, setSyncMessage] = useState("");
  const [isLoadingDoctorData, setIsLoadingDoctorData] = useState(true);

  const contextPatients = useMemo(
    () => patients.filter((patient) => patientInWorkContext(patient, workContext)),
    [patients, workContext]
  );

  useEffect(() => {
    let cancelled = false;

    getBackendBootstrap()
      .then((data) => {
        if (!cancelled) setBackendDoctorId(data.doctors[0]?.id ?? "doc-1");
      })
      .catch(() => {
        if (!cancelled) setBackendDoctorId("doc-1");
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDoctorData(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setPatientId((current) => {
      if (preselectedPatientId && contextPatients.some((patient) => patient.id === preselectedPatientId)) {
        return preselectedPatientId;
      }
      return contextPatients.some((patient) => patient.id === current) ? current : contextPatients[0]?.id ?? current;
    });
  }, [contextPatients, preselectedPatientId]);

  async function placeOrder() {
    const title = testName.trim();
    if (!title || !patientId) return;

    const localOrder: LabOrder = {
      id: `lab-${Date.now()}`,
      patientId,
      doctorId: backendDoctorId || "doc-1",
      testName: title,
      orderedOn: CURRENT_DATE_ISO,
      status: "Ordered",
      source,
      priority,
      workContext,
    };

    try {
      const savedOrder = await createBackendOrder({
        patientId,
        doctorId: backendDoctorId,
        workplaceId: selectedWorkplaceId,
        type: "LABORATORY",
        title,
        priority,
        source,
      });
      localOrder.id = savedOrder.id;
      setSyncMessage("Lab order synced to backend.");
    } catch (error) {
      setSyncMessage(error instanceof ApiSyncSkippedError ? "Mock lab order saved locally." : "Backend sync failed; local lab order kept.");
    }

    saveLocalLabOrder(localOrder);
    setTestName("");
    onClose();

    if (navigateAfterPlace) {
      router.push(`/doctor/lab-orders?patient=${patientId}`);
    }
  }

  return (
    <Modal
      open={open}
      title="New Lab Order"
      eyebrow="Laboratory Orders"
      onClose={onClose}
      footer={
        <>
          <button onClick={placeOrder} disabled={isLoadingDoctorData || !testName.trim()} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">
            <Plus size={14} /> Place Order
          </button>
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          {syncMessage && <span className="text-xs text-ink-muted">{syncMessage}</span>}
        </>
      }
    >
      {isLoadingDoctorData ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] text-ink-muted block mb-1">Patient</label>
          <select value={patientId} onChange={(event) => setPatientId(event.target.value)} className="input-field">
            {contextPatients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[11px] text-ink-muted block mb-1">Test</label>
          <input
            list="common-tests"
            value={testName}
            onChange={(event) => setTestName(event.target.value)}
            placeholder="e.g. HbA1c"
            className="input-field"
          />
          <datalist id="common-tests">
            {commonTests.map((test) => (
              <option key={test} value={test} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="text-[11px] text-ink-muted block mb-1">Priority</label>
          <select value={priority} onChange={(event) => setPriority(event.target.value as "Routine" | "Urgent")} className="input-field">
            <option>Routine</option>
            <option>Urgent</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] text-ink-muted block mb-1">Source</label>
          <select
            value={source}
            onChange={(event) => setSource(event.target.value as "Internal" | "Partner Lab" | "External / Manual")}
            className="input-field"
          >
            <option>Internal</option>
            <option>Partner Lab</option>
            <option>External / Manual</option>
          </select>
        </div>
      </div>
      )}
    </Modal>
  );
}
