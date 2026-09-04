"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { DataTable } from "@/components/ui/Table";
import { Chip } from "@/components/ui/Badge";

const MOVEMENTS = [
  { id: "MOV-1", item: "Glucose Reagent Kit", type: "consumption" as const, qty: -2, ref: "AN-01 daily run", date: "2026-08-23" },
  { id: "MOV-2", item: "EDTA Vacutainer (Lavender)", type: "consumption" as const, qty: -18, ref: "Ward 4B round", date: "2026-08-23" },
  { id: "MOV-3", item: "TSH Reagent Cartridge", type: "wastage" as const, qty: -1, ref: "Expired — LOT-1188", date: "2026-08-22" },
  { id: "MOV-4", item: "BacT/ALERT Culture Bottle (Aerobic)", type: "transfer" as const, qty: -10, ref: "SITE-01 → SITE-02", date: "2026-08-21" },
  { id: "MOV-5", item: "PT/INR Reagent", type: "receipt" as const, qty: 6, ref: "PO-2214 goods receipt", date: "2026-08-20" },
];

const TYPE_TONE = { consumption: "neutral", wastage: "critical", transfer: "info", receipt: "success" } as const;

export default function InventoryStockPage() {
  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 9 · Inventory & Equipment" title="Stock Movements" subtitle="Consumption by test/analyzer, inter-site transfers and wastage." />
      <DataTable
        rows={MOVEMENTS}
        rowKey={(m) => m.id}
        columns={[
          { key: "item", header: "Item", render: (m) => <span className="font-medium">{m.item}</span> },
          { key: "type", header: "Movement", render: (m) => <Chip tone={TYPE_TONE[m.type]}>{m.type}</Chip> },
          { key: "qty", header: "Quantity", render: (m) => (m.qty > 0 ? `+${m.qty}` : m.qty) },
          { key: "ref", header: "Reference", render: (m) => m.ref },
          { key: "date", header: "Date", render: (m) => m.date },
        ]}
      />
    </div>
  );
}
