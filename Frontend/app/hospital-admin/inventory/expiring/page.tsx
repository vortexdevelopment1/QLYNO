"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Clock,
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  ExternalLink,
  Info,
  Pill,
  Search,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { InventoryNav } from "@/hospital-admin/components/inventory/inventory-nav";
import { StockAdjustmentModal } from "@/hospital-admin/components/inventory/StockAdjustmentModal";
import { mockInventoryCatalogExtended } from "@/hospital-admin/lib/mock-data/inventory-extended";
import { InventoryItem, StockAdjustmentRecord, StockMovementRecord } from "@/hospital-admin/lib/types";

export default function InventoryExpiringPage() {
  const [catalog, setCatalog] = useState<InventoryItem[]>(
    mockInventoryCatalogExtended.filter((i) => !!i.expiryDate)
  );

  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<"all" | "30" | "60" | "90">("all");

  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [selectedAdjustItem, setSelectedAdjustItem] = useState<InventoryItem | null>(null);

  const enrichedItems = useMemo(() => {
    return catalog.map((item) => {
      const expiry = new Date(item.expiryDate!).getTime();
      const now = Date.now();
      const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

      let tier: "critical" | "urgent" | "advisory" | "safe" = "safe";
      if (daysLeft <= 30) tier = "critical";
      else if (daysLeft <= 60) tier = "urgent";
      else if (daysLeft <= 90) tier = "advisory";

      return {
        ...item,
        daysLeft,
        tier,
      };
    });
  }, [catalog]);

  const filteredItems = useMemo(() => {
    return enrichedItems.filter((it) => {
      const matchSearch =
        it.name.toLowerCase().includes(search.toLowerCase()) ||
        it.itemCode.toLowerCase().includes(search.toLowerCase()) ||
        (it.batchNumber && it.batchNumber.toLowerCase().includes(search.toLowerCase())) ||
        it.category.toLowerCase().includes(search.toLowerCase());

      const matchTier =
        tierFilter === "all" ||
        (tierFilter === "30" && it.daysLeft <= 30) ||
        (tierFilter === "60" && it.daysLeft > 30 && it.daysLeft <= 60) ||
        (tierFilter === "90" && it.daysLeft > 60 && it.daysLeft <= 90);

      return matchSearch && matchTier;
    });
  }, [enrichedItems, search, tierFilter]);

  const criticalCount = enrichedItems.filter((i) => i.daysLeft <= 30).length;
  const urgentCount = enrichedItems.filter((i) => i.daysLeft > 30 && i.daysLeft <= 60).length;
  const advisoryCount = enrichedItems.filter((i) => i.daysLeft > 60 && i.daysLeft <= 90).length;

  const handleSaveAdjustment = (
    adjustment: StockAdjustmentRecord,
    movement: StockMovementRecord
  ) => {
    setCatalog((prev) =>
      prev.map((it): InventoryItem =>
        it.id === adjustment.itemId
          ? {
              ...it,
              stockLevel: adjustment.adjustedStock,
              status:
                adjustment.adjustedStock <= it.reorderLevel
                  ? ("Low Stock" as const)
                  : ("Adequate" as const),
            }
          : it
      )
    );
  };

  const openWriteOffForItem = (item: InventoryItem) => {
    setSelectedAdjustItem(item);
    setAdjustmentModalOpen(true);
  };

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Expiring Items & Batch Quality Control"
        description="Monitor physical consumable batches and diagnostic reagents approaching expiration. Proactive rotation and quarantine."
        crumbs={[{ label: "Supply & Assets" }, { label: "Inventory" }, { label: "Expiring Items" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 font-semibold text-xs"
              onClick={() => {
                setSelectedAdjustItem(null);
                setAdjustmentModalOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4 text-rose-600" /> Write-off Expired Batch
            </Button>
          </div>
        }
      />

      {/* Sub-Navigation */}
      <InventoryNav />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Central Stores • Batch Expiry Monitoring" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <Clock className="h-3.5 w-3.5 text-cyan-600" />
          <span>Batch lot verification • FIFO / FEFO inventory dispensing enforcement</span>
        </div>
      </div>

      {/* System Disambiguation Banner (Rule F19-CANNOT-7) */}
      <div className="p-3.5 rounded-lg border border-border bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Info className="h-4 w-4 text-primary shrink-0" />
          <div>
            <p className="font-semibold text-foreground">Stock Batch Expiry vs. Regulatory Verification Expiry</p>
            <p className="text-muted-foreground text-[11px]">
              This page manages physical consumables &amp; pathology reagent lot expiries. For statutory doctor licenses, hospital fire NOCs, and accreditation validity, see{" "}
              <Link href="/hospital-admin/verification/expiry-alerts" className="text-primary underline font-medium">
                Verification Expiry Alerts
              </Link>. For drug batch expiries, see{" "}
              <Link href="/hospital-admin/pharmacy/expiry" className="text-primary underline font-medium">
                Pharmacy Expiry Tracker
              </Link>.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card
          className={`p-3.5 border-border bg-card shadow-xs cursor-pointer transition-all ${
            tierFilter === "30" ? "border-rose-500 ring-1 ring-rose-500" : ""
          }`}
          onClick={() => setTierFilter(tierFilter === "30" ? "all" : "30")}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground uppercase font-bold">&lt; 30 Days (Critical)</span>
            <Badge variant="destructive" className="text-[9px] px-1 py-0 h-4">Immediate</Badge>
          </div>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">{criticalCount} SKUs</p>
          <span className="text-[10px] text-rose-600 font-medium">Expiring this month</span>
        </Card>

        <Card
          className={`p-3.5 border-border bg-card shadow-xs cursor-pointer transition-all ${
            tierFilter === "60" ? "border-amber-500 ring-1 ring-amber-500" : ""
          }`}
          onClick={() => setTierFilter(tierFilter === "60" ? "all" : "60")}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground uppercase font-bold">&lt; 60 Days (Urgent)</span>
            <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[9px] px-1 py-0 h-4">Urgent</Badge>
          </div>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{urgentCount} SKUs</p>
          <span className="text-[10px] text-amber-600 font-medium">Rotate to high-usage wards</span>
        </Card>

        <Card
          className={`p-3.5 border-border bg-card shadow-xs cursor-pointer transition-all ${
            tierFilter === "90" ? "border-cyan-500 ring-1 ring-cyan-500" : ""
          }`}
          onClick={() => setTierFilter(tierFilter === "90" ? "all" : "90")}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground uppercase font-bold">&lt; 90 Days (Advisory)</span>
            <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">Advisory</Badge>
          </div>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">{advisoryCount} SKUs</p>
          <span className="text-[10px] text-cyan-600 font-medium">Planned consumption window</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Dispensing Protocol</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">FEFO Active</p>
          <span className="text-[10px] text-emerald-600 font-medium">First-Expiry-First-Out rule</span>
        </Card>
      </div>

      {/* Expiring Items Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-bold">Consumables &amp; Reagents Batch Roster</CardTitle>
            <CardDescription className="text-xs">
              Batch lots nearing end-of-life. Quarantine or write-off expired stock to prevent clinical use.
            </CardDescription>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search batch #, reagent, SKU..."
              className="pl-8 text-xs h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Item Code</TableHead>
                  <TableHead className="text-xs font-bold">Supply / Reagent Item</TableHead>
                  <TableHead className="text-xs font-bold">Category</TableHead>
                  <TableHead className="text-xs font-bold">Batch Lot #</TableHead>
                  <TableHead className="text-xs font-bold">Stock In Hand</TableHead>
                  <TableHead className="text-xs font-bold">Expiry Date</TableHead>
                  <TableHead className="text-xs font-bold">Days Remaining</TableHead>
                  <TableHead className="text-xs font-bold">Risk Tier</TableHead>
                  <TableHead className="text-xs font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {item.itemCode}
                    </TableCell>
                    <TableCell className="font-semibold text-xs text-foreground">
                      <div className="flex items-center gap-1.5">
                        <span>{item.name}</span>
                        {item.isCritical && (
                          <Badge variant="destructive" className="text-[8px] px-1 py-0 h-3.5">
                            Critical
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-foreground">
                      {item.batchNumber}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold">
                      {item.stockLevel} {item.unit}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {item.expiryDate}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold">
                      <span
                        className={
                          item.daysLeft <= 30
                            ? "text-rose-600 font-bold"
                            : item.daysLeft <= 60
                            ? "text-amber-600 font-semibold"
                            : "text-cyan-600"
                        }
                      >
                        {item.daysLeft} Days
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          item.tier === "critical"
                            ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px]"
                            : item.tier === "urgent"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                            : "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 text-[10px]"
                        }
                      >
                        {item.tier === "critical"
                          ? "Critical (<30d)"
                          : item.tier === "urgent"
                          ? "Urgent (<60d)"
                          : "Advisory (<90d)"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                        onClick={() => openWriteOffForItem(item)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Write-off Expiry
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        open={adjustmentModalOpen}
        onOpenChange={setAdjustmentModalOpen}
        preselectedItem={selectedAdjustItem}
        onSaveAdjustment={handleSaveAdjustment}
      />
    </div>
  );
}
