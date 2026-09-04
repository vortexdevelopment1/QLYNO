"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  Flame,
  Layers,
  Pill,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShoppingCart,
  TrendingDown,
  Zap,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { PharmacyNav } from "@/hospital-admin/components/pharmacy/pharmacy-nav";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { mockMedicineInventory } from "@/hospital-admin/lib/mock-data/section12-operations";
import { MedicineItem } from "@/hospital-admin/lib/types";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Pharmacy Operational workflow";

export default function PharmacyLowStockPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [medicines, setMedicines] = useState<MedicineItem[]>(mockMedicineInventory);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const lowStockItems = medicines.filter((m) => m.stockLevel <= m.minThreshold);
  const criticalZeroItems = lowStockItems.filter((m) => m.stockLevel === 0);

  const filteredItems = lowStockItems.filter((m) => {
    return (
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.genericName.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase()) ||
      m.rackLocation.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleQuickRestock = (medId: string, qty: number) => {
    setMedicines((prev) =>
      prev.map((m) => (m.id === medId ? { ...m, stockLevel: m.stockLevel + qty } : m))
    );
    toast({
      title: "Stock Replenished",
      description: `Added ${qty} units to inventory stock. Single source of truth updated. (${DELEGATION_STRING})`,
    });
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Low Stock &amp; Critical Depletion Alert Center"
          description="Isolated view of all medication SKUs below minimum reorder thresholds with consumption velocity analytics."
          crumbs={[{ label: "Operations" }, { label: "Pharmacy", href: "/hospital-admin/pharmacy" }, { label: "Low Stock" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading low stock alerts...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Low Stock &amp; Critical Depletion Alert Center"
        description="Isolated view of all medication SKUs below minimum reorder thresholds with consumption velocity analytics."
        crumbs={[{ label: "Operations" }, { label: "Pharmacy", href: "/hospital-admin/pharmacy" }, { label: "Low Stock" }]}
        actions={
          <Link href="/hospital-admin/procurement/create">
            <Button size="sm" className="gap-1.5 font-semibold text-xs bg-primary text-primary-foreground">
              <ShoppingCart className="h-4 w-4" /> Create Procurement Requisition
            </Button>
          </Link>
        }
      />

      <PharmacyNav />

      {/* Scope Indicator & Stock Alert Rules */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Formulary Depletion &amp; Restock Engine" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <TrendingDown className="h-3.5 w-3.5 text-rose-600" />
          <span>Inventory Monitoring • Automated safety stock threshold monitoring triggers reorder requisitions into procurement</span>
        </div>
      </div>

      {/* Zero Stock Critical Banner */}
      {criticalZeroItems.length > 0 && (
        <Card className="border-rose-500/40 bg-rose-500/10 shadow-xs">
          <CardContent className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertOctagon className="h-6 w-6 text-rose-600 shrink-0 animate-pulse" />
              <div>
                <p className="text-xs font-bold text-rose-900 dark:text-rose-300">
                  ZERO STOCK CRITICAL: {criticalZeroItems.length} Life-Saving Medication(s) Out of Stock
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {criticalZeroItems.map((m) => m.name).join(", ")} — Immediate expedited procurement required.
                </p>
              </div>
            </div>
            <Link href="/hospital-admin/procurement/create">
              <Button size="sm" variant="destructive" className="text-xs font-semibold shrink-0 gap-1">
                Expedite Purchase Order
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Below Threshold</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">{lowStockItems.length} SKUs</p>
          <span className="text-[10px] text-rose-600 font-medium">Reorder required</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Zero Stock Outages</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">{criticalZeroItems.length} SKUs</p>
          <span className="text-[10px] text-rose-600 font-medium">Stock completely exhausted</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Avg Reorder Lead Time</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">2.4 Days</p>
          <span className="text-[10px] text-muted-foreground">Across active distributors</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Pending Procurement POs</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">3 Active</p>
          <span className="text-[10px] text-primary font-medium">Inbound shipment dispatched</span>
        </Card>
      </div>

      {/* Low Stock Items Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold">Depletion Watchlist &amp; Velocity Registry</CardTitle>
              <CardDescription className="text-xs">
                Items requiring restock actions before stockouts impact ICU, OT, and ward patient care.
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search low stock SKU..."
                className="pl-8 text-xs h-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2">
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold w-[220px]">Medicine / Formulary</TableHead>
                  <TableHead className="text-xs font-bold w-[140px]">Category</TableHead>
                  <TableHead className="text-xs font-bold w-[110px]">Location</TableHead>
                  <TableHead className="text-xs font-bold w-[160px]">Stock Level vs Threshold</TableHead>
                  <TableHead className="text-xs font-bold w-[130px]">Est. Days Left</TableHead>
                  <TableHead className="text-xs font-bold w-[110px]">Status</TableHead>
                  <TableHead className="text-xs font-bold text-right w-[160px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((m) => {
                  const percent = Math.min(100, Math.round((m.stockLevel / m.minThreshold) * 100));
                  const daysLeft = m.stockLevel === 0 ? 0 : Math.max(1, Math.round(m.stockLevel / 8));

                  return (
                    <TableRow key={m.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="font-semibold text-xs text-foreground">{m.name}</div>
                        <div className="text-[10px] text-muted-foreground italic">{m.genericName}</div>
                      </TableCell>

                      <TableCell className="text-xs font-medium text-foreground">
                        {m.category}
                      </TableCell>

                      <TableCell className="font-mono text-xs text-foreground">
                        {m.rackLocation}
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="font-bold text-foreground">{m.stockLevel} units</span>
                            <span className="text-muted-foreground">Min: {m.minThreshold}</span>
                          </div>
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                m.stockLevel === 0
                                  ? "bg-rose-600"
                                  : percent <= 50
                                  ? "bg-rose-500"
                                  : "bg-amber-500"
                              }`}
                              style={{ width: `${Math.max(5, percent)}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="font-mono text-xs">
                        <span
                          className={`font-bold ${
                            daysLeft === 0 ? "text-rose-600" : daysLeft <= 2 ? "text-amber-600" : "text-foreground"
                          }`}
                        >
                          {daysLeft === 0 ? "0 Days (Out)" : `~${daysLeft} Days left`}
                        </span>
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={
                            m.stockLevel === 0
                              ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px]"
                              : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                          }
                        >
                          {m.stockLevel === 0 ? "Out of Stock" : "Low Stock"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs font-semibold text-primary border-primary/30 hover:bg-primary/10"
                            onClick={() => handleQuickRestock(m.id, 50)}
                          >
                            +50 In
                          </Button>
                          <Link href="/hospital-admin/procurement/create">
                            <Button size="sm" className="h-7 text-xs font-semibold bg-primary text-primary-foreground">
                              Order PO
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
