"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  ExternalLink,
  Pill,
  Plus,
  Search,
  ShieldAlert,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
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
import { mockMedicineInventory } from "@/hospital-admin/lib/mock-data/section12-operations";
import { InventoryItem, StockAdjustmentRecord, StockMovementRecord } from "@/hospital-admin/lib/types";

export default function InventoryLowStockPage() {
  const [catalog, setCatalog] = useState<InventoryItem[]>(
    mockInventoryCatalogExtended.filter((i) => i.stockLevel <= i.reorderLevel)
  );

  const [search, setSearch] = useState("");
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [selectedAdjustItem, setSelectedAdjustItem] = useState<InventoryItem | null>(null);

  const filteredItems = useMemo(() => {
    return catalog.filter((it) => {
      const match =
        it.name.toLowerCase().includes(search.toLowerCase()) ||
        it.itemCode.toLowerCase().includes(search.toLowerCase()) ||
        it.category.toLowerCase().includes(search.toLowerCase()) ||
        it.supplierName.toLowerCase().includes(search.toLowerCase());
      return match;
    });
  }, [catalog, search]);

  const pharmacyLowStockCount = mockMedicineInventory.filter(
    (m) => m.stockLevel <= m.minThreshold
  ).length;

  const criticalShortageCount = catalog.filter((i) => i.isCritical).length;

  const handleSaveAdjustment = (
    adjustment: StockAdjustmentRecord,
    movement: StockMovementRecord
  ) => {
    setCatalog((prev) =>
      prev
        .map((it): InventoryItem =>
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
        .filter((it) => it.stockLevel <= it.reorderLevel)
    );
  };

  const openAdjustmentForItem = (item: InventoryItem) => {
    setSelectedAdjustItem(item);
    setAdjustmentModalOpen(true);
  };

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Low Stock & Reorder Triggers"
        description="Active supply items operating below minimum safety thresholds. Instant purchase order generation and supplier fulfillment."
        crumbs={[{ label: "Supply & Assets" }, { label: "Inventory" }, { label: "Low Stock" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" asChild className="gap-1.5 font-semibold text-xs">
              <Link href="/hospital-admin/procurement/create">
                <ShoppingCart className="h-4 w-4" /> Bulk Purchase Requisition
              </Link>
            </Button>
          </div>
        }
      />

      {/* Sub-Navigation */}
      <InventoryNav />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Central Stores • Low Stock Monitoring Console" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
          <span>Real-time replenishment alerts • Automated PO handoff to Procurement</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Low Consumable SKUs</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{catalog.length} SKUs</p>
          <span className="text-[10px] text-amber-600 font-medium">Below reorder minimum</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Critical Shortages</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">{criticalShortageCount} Items</p>
          <span className="text-[10px] text-rose-600 font-medium">Life-sustaining supplies</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Pharmacy Low Stock</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">{pharmacyLowStockCount} Drugs</p>
          <Link href="/hospital-admin/pharmacy/low-stock" className="text-[10px] text-cyan-600 font-medium hover:underline flex items-center gap-1 mt-0.5">
            View Pharmacy Low Stock <ArrowRight className="h-2.5 w-2.5" />
          </Link>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Average Supplier Lead Time</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">2 - 4 Days</p>
          <span className="text-[10px] text-muted-foreground">Standard fulfillment window</span>
        </Card>
      </div>

      {/* Cross-Reference Notice (Rule F19-CANNOT-2) */}
      <div className="p-3.5 rounded-lg border border-amber-500/30 bg-amber-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
            <Pill className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Pharmaceutical Low-Stock Governance</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Medicines low-stock and automated drug reordering is operated separately in Pharmacy. This view handles Consumables and Medical Supplies.
            </p>
          </div>
        </div>
        <Button size="sm" variant="outline" asChild className="h-7 text-xs font-semibold shrink-0">
          <Link href="/hospital-admin/pharmacy/low-stock">
            Open Pharmacy Low Stock ({pharmacyLowStockCount}) <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      </div>

      {/* Low Stock Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-bold">Supply Reorder Trigger Roster</CardTitle>
            <CardDescription className="text-xs">
              Every item listed here is below the minimum threshold and requires immediate Purchase Order dispatch.
            </CardDescription>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search low stock items, SKUs, vendors..."
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
                  <TableHead className="text-xs font-bold">Consumable Item</TableHead>
                  <TableHead className="text-xs font-bold">Category</TableHead>
                  <TableHead className="text-xs font-bold">Current Stock</TableHead>
                  <TableHead className="text-xs font-bold">Reorder Minimum</TableHead>
                  <TableHead className="text-xs font-bold">Deficit Qty</TableHead>
                  <TableHead className="text-xs font-bold">Primary Vendor</TableHead>
                  <TableHead className="text-xs font-bold">Lead Time</TableHead>
                  <TableHead className="text-xs font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const deficit = Math.max(0, item.reorderLevel - item.stockLevel);
                  const deficitPct = Math.round((deficit / item.reorderLevel) * 100);

                  return (
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
                      <TableCell className="font-mono text-xs font-bold text-amber-600">
                        {item.stockLevel} {item.unit}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {item.reorderLevel} {item.unit}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px]">
                          -{deficit} {item.unit} ({deficitPct}% Short)
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {item.supplierName}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {item.leadTimeDays} Days
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs px-2"
                            onClick={() => openAdjustmentForItem(item)}
                          >
                            <SlidersHorizontal className="h-3.5 w-3.5 mr-1" /> Adjust
                          </Button>
                          <Button size="sm" asChild className="h-7 text-xs font-semibold gap-1">
                            <Link href="/hospital-admin/procurement/create">
                              <ShoppingCart className="h-3.5 w-3.5" /> Reorder via PO
                            </Link>
                          </Button>
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
