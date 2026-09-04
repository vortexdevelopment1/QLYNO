"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { DataTable } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";

const AUDITS = [
  { id: "AUD-INT-01", area: "Pre-analytical — Specimen Collection", auditor: "Anita Rane", date: "2026-08-10", findings: 2, status: "closed" as const },
  { id: "AUD-INT-02", area: "Analytical — Chemistry QC Program", auditor: "Anita Rane", date: "2026-08-18", findings: 1, status: "capa_linked" as const },
  { id: "AUD-INT-03", area: "Post-analytical — Report Release Controls", auditor: "Dr. Sanjeev Kelkar", date: "2026-08-22", findings: 0, status: "closed" as const },
  { id: "AUD-INT-04", area: "Logistics — Cold-Chain Compliance", auditor: "Anita Rane", date: "2026-08-23", findings: 3, status: "open" as const },
];

export default function QualityAuditsPage() {
  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 8 · Quality Management" title="Internal Audits" subtitle="Audit schedule, findings and accreditation evidence summary." />
      <DataTable
        rows={AUDITS}
        rowKey={(a) => a.id}
        columns={[
          { key: "area", header: "Audit area", render: (a) => <span className="font-medium">{a.area}</span> },
          { key: "auditor", header: "Auditor", render: (a) => a.auditor },
          { key: "date", header: "Date", render: (a) => a.date },
          { key: "findings", header: "Findings", render: (a) => a.findings },
          { key: "status", header: "Status", render: (a) => <StatusBadge status={a.status} /> },
        ]}
      />
      <p className="text-xs text-text-muted">
        This log supports quality operations only — it does not itself constitute or guarantee ISO 15189 / NABL accreditation.
      </p>
    </div>
  );
}
