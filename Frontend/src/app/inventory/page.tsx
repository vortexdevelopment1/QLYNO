"use client";

import Link from "next/link";
import { EntityHeader } from "@/components/ui/EntityHeader";
import { MetricCard, Card } from "@/components/ui/Card";
import { Boxes, AlertTriangle, PackageX, ShoppingCart, Settings2, Wrench } from "lucide-react";
import { MOCK_INVENTORY_ITEMS, MOCK_STOCK_LOTS } from "@/data/mock/inventory";
import { MOCK_EQUIPMENT } from "@/data/mock/inventory";

export default function InventoryPage() {
  const belowReorder = MOCK_INVENTORY_ITEMS.filter((i) => i.currentStock <= i.reorderLevel).length;
  const nearExpiry = MOCK_STOCK_LOTS.filter((l) => l.status === "near_expiry").length;
  const expiredQuarantined = MOCK_STOCK_LOTS.filter((l) => l.status === "expired" || l.status === "quarantined").length;
  const equipmentIssues = MOCK_EQUIPMENT.filter((e) => e.status !== "operational").length;

  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 9 · Inventory & Equipment" title="Stock Overview" subtitle="Current stock, reorder alerts, near-expiry and blocked lots." />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Below reorder level" value={belowReorder} icon={AlertTriangle} tone={1} href="/inventory/items" />
        <MetricCard label="Near-expiry lots" value={nearExpiry} icon={Boxes} tone={2} href="/inventory/lots" />
        <MetricCard label="Expired / quarantined" value={expiredQuarantined} icon={PackageX} tone={3} href="/inventory/lots" />
        <MetricCard label="Equipment needing attention" value={equipmentIssues} icon={Wrench} tone={0} href="/equipment" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/inventory/items", label: "Items", icon: Boxes, desc: "Master item list & reorder levels" },
          { href: "/inventory/lots", label: "Lots", icon: PackageX, desc: "FEFO, expiry & quarantine status" },
          { href: "/inventory/stock", label: "Stock Movements", icon: Settings2, desc: "Consumption, transfers & wastage" },
          { href: "/inventory/procurement", label: "Procurement", icon: ShoppingCart, desc: "Purchase requests & goods receipt" },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded-card">
            <Card className="flex items-start gap-3 p-4 transition-shadow hover:shadow-md">
              <item.icon className="mt-0.5 h-5 w-5 text-brand-blue" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-text-main">{item.label}</p>
                <p className="text-xs text-text-muted">{item.desc}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
