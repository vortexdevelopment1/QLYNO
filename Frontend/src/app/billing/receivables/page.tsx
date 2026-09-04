"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { BillingGuard } from "@/components/domain/BillingGuard";
import { DataTable } from "@/components/ui/Table";
import { Chip } from "@/components/ui/Badge";
import { MOCK_INVOICES } from "@/data/mock/billing";
import { formatCurrencyINR } from "@/lib/utils/format";

const AGEING_BUCKET: Record<string, { label: string; tone: "success" | "warning" | "critical" }> = {
  "INV-3004": { label: "0–30 days", tone: "success" },
  "INV-3005": { label: "31–60 days", tone: "warning" },
};

export default function ReceivablesPage() {
  const receivables = MOCK_INVOICES.filter((i) => i.clientOrgId && (i.status === "invoiced" || i.status === "partially_paid"));

  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 10 · Commercial & Billing" title="Receivables Ageing" subtitle="Outstanding B2B statements by ageing bucket." />
      <BillingGuard>
        <DataTable
          rows={receivables}
          rowKey={(i) => i.id}
          columns={[
            { key: "id", header: "Invoice", render: (i) => i.id },
            { key: "client", header: "Client statement", render: (i) => i.patientName },
            { key: "amount", header: "Outstanding", render: (i) => formatCurrencyINR(i.amount) },
            {
              key: "ageing", header: "Ageing bucket",
              render: (i) => {
                const bucket = AGEING_BUCKET[i.id] ?? { label: "0–30 days", tone: "success" as const };
                return <Chip tone={bucket.tone}>{bucket.label}</Chip>;
              },
            },
            { key: "due", header: "Due date", render: (i) => i.dueAt ?? "—" },
          ]}
        />
      </BillingGuard>
    </div>
  );
}
