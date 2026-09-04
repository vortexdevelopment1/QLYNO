"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Copy, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { EntityHeader } from "@/components/ui/EntityHeader";
import { FilterBar } from "@/components/ui/FilterBar";
import { DataTable, type Column } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MOCK_PATIENTS } from "@/data/mock/patients";
import { ORDER_SOURCE_LABEL } from "@/config/tenant-modes";
import type { Patient } from "@/lib/types/domain";
import { formatDate } from "@/lib/utils/format";
import { useDemo } from "@/state/demo-context";
import { MOCK_ORDERS } from "@/data/mock/orders";
import { useHospitalWorkflow } from "@/state/hospital-workflow-context";

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("all");
  const router = useRouter();
  const { session } = useDemo();
  const { registeredPatients, dynamicOrders } = useHospitalWorkflow();
  const allowedPatientIds = useMemo(() => new Set([...dynamicOrders, ...MOCK_ORDERS].filter((order) => order.billingAuthority === (session?.billingOwner === "HMS_CENTRAL" ? "HMS_CENTRAL" : session?.billingOwner === "LIS_INTERNAL" ? "LIS_INTERNAL" : session?.billingOwner === "B2B_CONTRACT" ? "EXTERNAL_CLIENT" : "NO_CHARGE")).map((order) => order.patientId)), [session, dynamicOrders]);
  const persistedPatients: Patient[] = registeredPatients.filter((patient) => patient.tenantId === session?.tenantId).map((patient) => ({ id: patient.id, mrn: patient.hospitalMrn ?? patient.qlynoPatientId, name: patient.displayName, age: patient.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : patient.estimatedAge?.value ?? 0, sex: patient.sexAtBirth === "MALE" ? "M" : patient.sexAtBirth === "FEMALE" ? "F" : "O", contact: patient.primaryMobile ?? "Not provided", source: patient.source === "HMS" ? "hospital_encounter" : "walk_in", branchOrWard: patient.ward ? `${patient.ward}${patient.bed ? ` / Bed ${patient.bed}` : ""}` : session?.organizationName, lastOrderDate: patient.updatedAt.slice(0, 10) }));

  const rows = useMemo(
    () =>
      [...persistedPatients, ...MOCK_PATIENTS].filter(
        (p) =>
          (allowedPatientIds.has(p.id) || persistedPatients.some((patient) => patient.id === p.id)) &&
          (source === "all" || p.source === source) &&
          (p.name.toLowerCase().includes(search.toLowerCase()) || (p.mrn ?? "").toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()))
      ),
    [search, source, allowedPatientIds, persistedPatients]
  );

  const columns: Column<Patient>[] = [
    {
      key: "name", header: "Patient", sortValue: (p) => p.name,
      render: (p) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-text-main">{p.name}</span>
          {p.privacyFlag && <Lock className="h-3.5 w-3.5 text-text-muted" aria-label="Privacy-restricted record" />}
          {p.duplicateWarning && <AlertTriangle className="h-3.5 w-3.5 text-status-warning" aria-label="Possible duplicate record" />}
        </div>
      ),
    },
    { key: "idmrn", header: "Patient ID / MRN", render: (p) => <span className="text-xs text-text-muted">{p.mrn ?? p.id}</span> },
    { key: "age_sex", header: "Age / Sex", render: (p) => `${p.age} / ${p.sex}` },
    { key: "contact", header: "Contact", render: (p) => p.contact },
    { key: "source", header: "Source / Branch", render: (p) => <span>{ORDER_SOURCE_LABEL[p.source]}{p.branchOrWard ? ` · ${p.branchOrWard}` : ""}</span> },
    { key: "last", header: "Last Order", render: (p) => formatDate(p.lastOrderDate), sortValue: (p) => p.lastOrderDate ?? "" },
  ];

  return (
    <div className="space-y-6">
      <EntityHeader
        eyebrow="Module 2 · Patients & Network"
        title="Patients"
        subtitle="Unified patient index across hospital encounters, walk-in, home collection and B2B sources."
        actions={
          <Button size="sm" onClick={() => router.push("/orders/new")}>
            Register order
          </Button>
        }
      />
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, MRN or patient ID…"
        filters={[
          {
            id: "source", label: "Source", value: source, onChange: setSource,
            options: [{ value: "all", label: "All sources" }, ...Object.entries(ORDER_SOURCE_LABEL).map(([value, label]) => ({ value, label }))],
          },
        ]}
      />
      <DataTable rows={rows} columns={columns} rowKey={(p) => p.id} onRowClick={(p) => router.push(`/patients/${p.id}`)} emptyDescription="No patients match your search." />
      <p className="flex items-center gap-1.5 text-xs text-text-muted">
        <Copy className="h-3.5 w-3.5" aria-hidden="true" /> Rows flagged with a duplicate icon suggest a possible existing record — resolve during registration.
      </p>
    </div>
  );
}
