"use client";

import { useRouter } from "next/navigation";
import { EntityHeader } from "@/components/ui/EntityHeader";
import { BillingGuard } from "@/components/domain/BillingGuard";
import { DataTable } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { MOCK_INVOICES } from "@/data/mock/billing";
import { formatCurrencyINR, formatDateTime } from "@/lib/utils/format";

export default function InvoicesPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 10 · Commercial & Billing" title="Invoices" subtitle="Standalone patient invoices and B2B client statements." />
      <BillingGuard>
        <DataTable
          rows={MOCK_INVOICES}
          rowKey={(i) => i.id}
          onRowClick={(i) => router.push(`/billing/invoices/${i.id}`)}
          columns={[
            { key: "id", header: "Invoice", render: (i) => <span className="font-medium">{i.id}</span> },
            { key: "billTo", header: "Bill to", render: (i) => i.patientName },
            { key: "amount", header: "Amount", render: (i) => formatCurrencyINR(i.amount) },
            { key: "status", header: "Status", render: (i) => <StatusBadge status={i.status} /> },
            { key: "issued", header: "Issued", render: (i) => formatDateTime(i.issuedAt) },
          ]}
        />
      </BillingGuard>
    </div>
  );
}
