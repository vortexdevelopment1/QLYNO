"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { BillingGuard } from "@/components/domain/BillingGuard";
import { DataTable } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { MOCK_INVOICES } from "@/data/mock/billing";
import { formatCurrencyINR } from "@/lib/utils/format";

export default function EstimatesPage() {
  const { showToast } = useToast();
  const estimates = MOCK_INVOICES.filter((i) => i.status === "estimate");

  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 10 · Commercial & Billing" title="Estimates" subtitle="Pre-order cost estimates for standalone and hybrid billing." />
      <BillingGuard>
        <DataTable
          rows={estimates}
          rowKey={(i) => i.id}
          columns={[
            { key: "id", header: "Estimate", render: (i) => i.id },
            { key: "patient", header: "Patient", render: (i) => i.patientName },
            { key: "amount", header: "Amount", render: (i) => formatCurrencyINR(i.amount) },
            { key: "status", header: "Status", render: (i) => <StatusBadge status={i.status} /> },
            {
              key: "actions", header: "Actions",
              render: (i) => (
                <Button size="sm" variant="secondary" onClick={() => showToast({ title: "Converted to invoice (simulated)", description: i.id, tone: "success" })}>
                  Convert to invoice
                </Button>
              ),
            },
          ]}
          emptyDescription="No open estimates."
        />
      </BillingGuard>
    </div>
  );
}
