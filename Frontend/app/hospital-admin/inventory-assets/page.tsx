"use client";

import React from "react";
import Link from "next/link";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Badge } from "@/hospital-admin/components/ui/badge";
import {
  Boxes,
  Cpu,
  Truck,
  ArrowRight,
  Package
} from "lucide-react";
import { mockBiomedicalAssets, mockInventoryCatalog } from "@/hospital-admin/lib/mock-data/section12-operations";

export default function InventoryAssetsHubPage() {
  const lowStock = mockInventoryCatalog.filter((i) => i.status === "Low Stock").length;
  const maintenanceAssets = mockBiomedicalAssets.filter((a) => a.maintenanceStatus !== "Operational").length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Inventory, Capital Assets & Supply Chain"
        description="Consolidated management of Central Stores, pharmaceutical inventory, capital biomedical equipment, and preventive maintenance contracts."
        crumbs={[{ label: "Finance & Supply" }, { label: "Inventory & Assets" }]}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Supply Chain &amp; Biomedical Engineering Board" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <Boxes className="h-3.5 w-3.5 text-primary" />
          <span>Biomedical Asset Registry &amp; Real-time Stock Levels Synced</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Cataloged SKUs</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{mockInventoryCatalog.length} Items</p>
          <span className="text-[10px] text-muted-foreground">Consumables &amp; surgical supplies</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Biomedical Assets</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">{mockBiomedicalAssets.length} Machines</p>
          <span className="text-[10px] text-cyan-600 font-medium">Ventilators, OT tables, Analyzers</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Re-order Triggers</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{lowStock} Low Stock</p>
          <span className="text-[10px] text-amber-600 font-medium">Automated PO recommendations</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Asset Servicing</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">{maintenanceAssets} Under Service</p>
          <span className="text-[10px] text-rose-600 font-medium">Active AMC / CMC contracts</span>
        </Card>
      </div>

      {/* Primary Sub-Section Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Central Stores */}
        <Card className="border-border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <Package className="h-4 w-4" />
              </div>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                Consumables
              </Badge>
            </div>
            <CardTitle className="text-base font-bold mt-2">Central Medical Stores</CardTitle>
            <CardDescription className="text-xs">
              Daily ward stock indenting, batch expiry monitoring, surgical consumables, and department distribution.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="font-mono font-semibold text-foreground">Stock Ledger</span>
              <Link href="/hospital-admin/inventory" className="text-primary font-semibold hover:underline flex items-center gap-1">
                Open Stores <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Biomedical Assets */}
        <Card className="border-border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-600">
                <Cpu className="h-4 w-4" />
              </div>
              <Badge variant="outline" className="text-[10px] bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30">
                Capital Equipment
              </Badge>
            </div>
            <CardTitle className="text-base font-bold mt-2">Biomedical Assets</CardTitle>
            <CardDescription className="text-xs">
              Capital equipment registry, calibration schedules, preventive maintenance (PPM) logs, and warranty tracking.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="font-mono font-semibold text-foreground">Equipment Registry</span>
              <Link href="/hospital-admin/assets" className="text-primary font-semibold hover:underline flex items-center gap-1">
                Manage Assets <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Procurement Indents */}
        <Card className="border-border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Truck className="h-4 w-4" />
              </div>
              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                Requisitions
              </Badge>
            </div>
            <CardTitle className="text-base font-bold mt-2">Procurement Indents</CardTitle>
            <CardDescription className="text-xs">
              Departmental purchase requisitions, approval matrices, quote comparisons, and vendor goods receipts.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="font-mono font-semibold text-foreground">Supply Chain Ops</span>
              <Link href="/hospital-admin/procurement" className="text-primary font-semibold hover:underline flex items-center gap-1">
                View Indents <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
