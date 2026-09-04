"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { DataTable } from "@/components/ui/Table";
import { Chip } from "@/components/ui/Badge";
import { MOCK_INVENTORY_ITEMS } from "@/data/mock/inventory";

export default function InventoryItemsPage() {
  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 9 · Inventory & Equipment" title="Items" subtitle="Master item list with reorder thresholds." />
      <DataTable
        rows={MOCK_INVENTORY_ITEMS}
        rowKey={(i) => i.id}
        columns={[
          { key: "name", header: "Item", render: (i) => <span className="font-medium">{i.name}</span> },
          { key: "category", header: "Category", render: (i) => i.category },
          { key: "unit", header: "Unit", render: (i) => i.unit },
          { key: "stock", header: "Current stock", render: (i) => i.currentStock },
          { key: "reorder", header: "Reorder level", render: (i) => i.reorderLevel },
          {
            key: "status", header: "Status",
            render: (i) => (i.currentStock <= i.reorderLevel ? <Chip tone="warning">Reorder needed</Chip> : <Chip tone="success">Sufficient</Chip>),
          },
        ]}
      />
    </div>
  );
}
