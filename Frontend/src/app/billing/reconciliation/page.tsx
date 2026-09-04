"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { BillingGuard } from "@/components/domain/BillingGuard";
import { DataTable } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { MOCK_INVOICES, MOCK_PAYMENTS } from "@/data/mock/billing";
import { formatCurrencyINR } from "@/lib/utils/format";

export default function ReconciliationPage() {
  const rows = MOCK_INVOICES.map((i) => {
    const paid = MOCK_PAYMENTS.filter((p) => p.invoiceId === i.id).reduce((s, p) => s + p.amount, 0);
    return { ...i, paid, variance: i.amount - paid };
  });

  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 10 · Commercial & Billing" title="Reconciliation" subtitle="Invoiced vs collected amounts across all LIS-billed orders." />
      <BillingGuard>
        <DataTable
          rows={rows}
          rowKey={(r) => r.id}
          columns={[
            { key: "id", header: "Invoice", render: (r) => r.id },
            { key: "billed", header: "Invoiced", render: (r) => formatCurrencyINR(r.amount) },
            { key: "paid", header: "Collected", render: (r) => formatCurrencyINR(r.paid) },
            { key: "variance", header: "Variance", render: (r) => formatCurrencyINR(r.variance) },
            { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
          ]}
        />
      </BillingGuard>
    </div>
  );
}
