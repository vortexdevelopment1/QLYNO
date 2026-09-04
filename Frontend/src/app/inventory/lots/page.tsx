"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { DataTable } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { MOCK_STOCK_LOTS } from "@/data/mock/inventory";

export default function InventoryLotsPage() {
  const blocked = MOCK_STOCK_LOTS.filter((l) => l.status === "expired" || l.status === "quarantined");
  const sorted = [...MOCK_STOCK_LOTS].sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));

  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 9 · Inventory & Equipment" title="Lots" subtitle="FEFO-ordered lot list — earliest expiry surfaces first for issue." />

      {blocked.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-text-main">
          <span className="font-semibold">{blocked.length} lot(s) blocked from use</span> — expired or quarantined stock cannot be issued until resolved.
        </div>
      )}

      <DataTable
        rows={sorted}
        rowKey={(l) => l.id}
        columns={[
          { key: "item", header: "Item", render: (l) => <span className="font-medium">{l.itemName}</span> },
          { key: "lot", header: "Lot number", render: (l) => l.lotNumber },
          { key: "expiry", header: "Expiry date", render: (l) => l.expiryDate, sortValue: (l) => l.expiryDate },
          { key: "qty", header: "Quantity", render: (l) => l.quantity },
          { key: "status", header: "Status", render: (l) => <StatusBadge status={l.status} /> },
        ]}
      />
    </div>
  );
}
