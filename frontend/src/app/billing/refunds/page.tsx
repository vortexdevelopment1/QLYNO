"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { BillingGuard } from "@/components/domain/BillingGuard";
import { DataTable } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { formatCurrencyINR } from "@/lib/utils/format";

const REFUNDS = [
  { id: "REF-101", invoiceId: "INV-3006", patient: "Divya Prakash", amount: 0, reason: "Order cancelled — internal no-charge", status: "credit" as const },
  { id: "REF-102", invoiceId: "INV-3003", patient: "Vikram Chauhan", amount: 150, reason: "Duplicate charge adjustment", status: "adjusted" as const },
];

export default function RefundsPage() {
  const { showToast } = useToast();

  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 10 · Commercial & Billing" title="Refunds & Credit Notes" subtitle="Refund approvals and credit note issuance." />
      <BillingGuard>
        <DataTable
          rows={REFUNDS}
          rowKey={(r) => r.id}
          columns={[
            { key: "id", header: "Refund", render: (r) => r.id },
            { key: "invoice", header: "Invoice", render: (r) => r.invoiceId },
            { key: "patient", header: "Patient", render: (r) => r.patient },
            { key: "amount", header: "Amount", render: (r) => formatCurrencyINR(r.amount) },
            { key: "reason", header: "Reason", render: (r) => r.reason },
            { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
            {
              key: "actions", header: "Actions",
              render: (r) => <Button size="sm" variant="outline" onClick={() => showToast({ title: "Credit note issued (simulated)", description: r.id, tone: "info" })}>Issue credit note</Button>,
            },
          ]}
        />
      </BillingGuard>
    </div>
  );
}
