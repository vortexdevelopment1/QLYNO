"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { DataTable } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { MOCK_MANIFESTS } from "@/data/mock/specimens";
import { MOCK_CLIENT_ORGS } from "@/data/mock/patients";

const SEND_OUTS = [
  { id: "SO-701", test: "Genetic Panel — Send-out", partner: "Metropolis Reference Laboratory", sla: "5 business days", status: "in_progress" as const, acknowledged: true },
  { id: "SO-702", test: "Special Immunology Assay", partner: "Metropolis Reference Laboratory", sla: "3 business days", status: "outsourced" as const, acknowledged: false },
  { id: "SO-703", test: "Histopathology — Second Opinion", partner: "Dr. Lal's Diagnostic Chain — Client Lab", sla: "7 business days", status: "resulted" as const, acknowledged: true },
];

export default function SendOutsPage() {
  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 5 · Logistics & Referrals" title="Outbound Send-outs" subtitle="Reference-lab send-outs, partner acknowledgement and SLA tracking." />
      <DataTable
        rows={SEND_OUTS}
        rowKey={(s) => s.id}
        columns={[
          { key: "id", header: "Send-out", render: (s) => s.id },
          { key: "test", header: "Test", render: (s) => s.test },
          { key: "partner", header: "Partner lab", render: (s) => s.partner },
          { key: "sla", header: "SLA", render: (s) => s.sla },
          { key: "ack", header: "Partner Ack.", render: (s) => (s.acknowledged ? <StatusBadge status="verified" /> : <StatusBadge status="ordered" />) },
          { key: "status", header: "Result Reconciliation", render: (s) => <StatusBadge status={s.status} /> },
        ]}
      />
    </div>
  );
}
