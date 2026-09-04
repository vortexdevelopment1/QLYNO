"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { DataTable } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

const REQUESTS = [
  { id: "PR-2201", item: "Glucose Reagent Kit", qty: 10, status: "placed" as const, requestedBy: "Manoj Pillai" },
  { id: "PR-2202", item: "SST Vacutainer (Gold)", qty: 50, status: "accepted" as const, requestedBy: "Manoj Pillai" },
  { id: "PR-2203", item: "TSH Reagent Cartridge", qty: 8, status: "draft" as const, requestedBy: "Manoj Pillai" },
  { id: "PR-2200", item: "PT/INR Reagent", qty: 6, status: "completed" as const, requestedBy: "Manoj Pillai" },
];

export default function ProcurementPage() {
  const { showToast } = useToast();

  return (
    <div className="space-y-6">
      <EntityHeader
        eyebrow="Module 9 · Inventory & Equipment"
        title="Procurement"
        subtitle="Purchase requests and goods receipt tracking."
        actions={<Button size="sm" onClick={() => showToast({ title: "New purchase request opened (simulated)", tone: "info" })}>New purchase request</Button>}
      />
      <DataTable
        rows={REQUESTS}
        rowKey={(r) => r.id}
        columns={[
          { key: "id", header: "Request", render: (r) => r.id },
          { key: "item", header: "Item", render: (r) => r.item },
          { key: "qty", header: "Quantity", render: (r) => r.qty },
          { key: "by", header: "Requested by", render: (r) => r.requestedBy },
          { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
          {
            key: "actions", header: "Actions",
            render: (r) =>
              r.status === "accepted" ? (
                <Button size="sm" variant="secondary" onClick={() => showToast({ title: "Goods receipt recorded (simulated)", description: r.id, tone: "success" })}>
                  Record receipt
                </Button>
              ) : (
                <span className="text-xs text-text-muted">—</span>
              ),
          },
        ]}
      />
    </div>
  );
}
