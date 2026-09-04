"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { DataTable } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { MOCK_ORDERS } from "@/data/mock/orders";

export default function HmsBillingPage() {
  const { showToast } = useToast();
  const hospitalOrders = MOCK_ORDERS.filter((o) => o.billingAuthority === "HMS_CENTRAL");

  return (
    <div className="space-y-6">
      <EntityHeader
        eyebrow="Module 12 · Analytics & Administration"
        title="HMS Central Billing — Posting & Reconciliation"
        subtitle="Charge-posting status mapped to the hospital&apos;s central finance system. This is not a laboratory invoice or cashier screen — no LIS invoice is ever created for these orders."
      />
      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold text-text-main">Charge posting records</h3>
        <DataTable
          rows={hospitalOrders}
          rowKey={(o) => o.id}
          columns={[
            { key: "order", header: "Order", render: (o) => o.id },
            { key: "patient", header: "Patient", render: (o) => o.patientName },
            { key: "encounter", header: "Encounter-linked", render: () => "Yes" },
            { key: "status", header: "HMS Posting Status", render: (o) => <StatusBadge status={o.hmsPostingStatus ?? "post_pending"} /> },
            {
              key: "actions", header: "Actions",
              render: (o) =>
                o.hmsPostingStatus === "reconciliation_required" ? (
                  <Button size="sm" variant="secondary" onClick={() => showToast({ title: "Reconciliation initiated (simulated)", description: o.id, tone: "info" })}>
                    Reconcile
                  </Button>
                ) : (
                  <span className="text-xs text-text-muted">—</span>
                ),
            },
          ]}
        />
      </Card>
      <Card className="p-5">
        <h3 className="mb-2 text-sm font-semibold text-text-main">Billing mapping</h3>
        <p className="text-xs text-text-muted">Test-to-charge-code mapping is maintained here for reference — actual charge posting occurs inside the hospital&apos;s HMS financial system, not this laboratory portal.</p>
      </Card>
    </div>
  );
}
