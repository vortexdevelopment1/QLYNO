"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { DataTable } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";

const DOCUMENTS = [
  { id: "SOP-001", title: "Specimen Collection & Positive Identification", version: "v4.0", status: "active" as const, owner: "Quality Manager" },
  { id: "SOP-002", title: "Specimen Rejection Criteria", version: "v2.1", status: "active" as const, owner: "Quality Manager" },
  { id: "SOP-003", title: "Internal Quality Control — Westgard Rules", version: "v3.2 (draft)", status: "draft" as const, owner: "Quality Manager" },
  { id: "SOP-004", title: "Critical Result Notification", version: "v1.5", status: "active" as const, owner: "Lab Director" },
  { id: "SOP-005", title: "Cold-Chain Transport Management", version: "v1.0", status: "retired" as const, owner: "Logistics Lead" },
];

export default function QualityDocumentsPage() {
  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 8 · Quality Management" title="Documents" subtitle="SOP register with version and approval status." />
      <DataTable
        rows={DOCUMENTS}
        rowKey={(d) => d.id}
        columns={[
          { key: "title", header: "Document", render: (d) => <span className="font-medium">{d.title}</span> },
          { key: "version", header: "Version", render: (d) => d.version },
          { key: "owner", header: "Owner", render: (d) => d.owner },
          { key: "status", header: "Approval Status", render: (d) => <StatusBadge status={d.status} /> },
        ]}
      />
    </div>
  );
}
