"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { BillingGuard } from "@/components/domain/BillingGuard";
import { DataTable } from "@/components/ui/Table";
import { Chip } from "@/components/ui/Badge";
import { MOCK_PAYMENTS } from "@/data/mock/billing";
import { formatCurrencyINR, formatDateTime } from "@/lib/utils/format";

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 10 · Commercial & Billing" title="Payments" subtitle="Cash and online payment records." />
      <BillingGuard>
        <DataTable
          rows={MOCK_PAYMENTS}
          rowKey={(p) => p.id}
          columns={[
            { key: "id", header: "Payment", render: (p) => p.id },
            { key: "invoice", header: "Invoice", render: (p) => p.invoiceId },
            { key: "amount", header: "Amount", render: (p) => formatCurrencyINR(p.amount) },
            { key: "method", header: "Method", render: (p) => <Chip tone="info">{p.method.toUpperCase()}</Chip> },
            { key: "received", header: "Received", render: (p) => formatDateTime(p.receivedAt) },
          ]}
        />
      </BillingGuard>
    </div>
  );
}
