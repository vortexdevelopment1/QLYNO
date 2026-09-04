"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { InventoryNav } from "@/hospital-admin/components/inventory/inventory-nav";
import { AddConsumableModal } from "@/hospital-admin/components/inventory/AddConsumableModal";
import { StockAdjustmentModal } from "@/hospital-admin/components/inventory/StockAdjustmentModal";
import { mockInventoryCatalogExtended } from "@/hospital-admin/lib/mock-data/inventory-extended";
import { InventoryItem, StockAdjustmentRecord, StockMovementRecord } from "@/hospital-admin/lib/types";

const CONSUMABLE_CATEGORIES = [
  "Surgical Consumables",
  "PPE & Hygiene",
  "Wound Care",
];

export default function InventoryConsumablesPage() {
  const [catalog, setCatalog] = useState<InventoryItem[]>(
    mockInventoryCatalogExtended.filter((i) =>
      CONSUMABLE_CATEGORIES.includes(i.category)
    )
  );

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [selectedAdjustItem, setSelectedAdjustItem] = useState<InventoryItem | null>(null);

  const filteredItems = useMemo(() => {
    return catalog.filter((it) => {
      const matchesSearch =
        it.name.toLowerCase().includes(search.toLowerCase()) ||
        it.itemCode.toLowerCase().includes(search.toLowerCase()) ||
        it.supplierName.toLowerCase().includes(search.toLowerCase());
      const matchesCat = categoryFilter === "all" || it.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || it.status === statusFilter;
      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [catalog, search, categoryFilter, statusFilter]);

  const handleSaveNewItem = (item: InventoryItem) => {
    setCatalog((prev) => [item, ...prev]);
  };

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

  const openAdjustmentForItem = (item: InventoryItem) => {
    setSelectedAdjustItem(item);
    setAdjustmentModalOpen(true);
  };

  const lowStockCount = catalog.filter((i) => i.status === "Low Stock").length;
  const surgicalCount = catalog.filter((i) => i.category === "Surgical Consumables").length;
  const ppeCount = catalog.filter((i) => i.category === "PPE & Hygiene").length;
  const woundCount = catalog.filter((i) => i.category === "Wound Care").length;

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Consumables & Surgical Supplies"
        description="Dedicated catalog for Surgical Consumables, PPE & Hygiene products, and Wound Care dressings."
        crumbs={[{ label: "Supply & Assets" }, { label: "Inventory" }, { label: "Consumables" }]}
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
              <SlidersHorizontal className="h-4 w-4" /> Stock Adjustment
            </Button>
            <Button size="sm" variant="outline" asChild className="gap-1.5 font-semibold text-xs">
              <Link href="/hospital-admin/procurement/create">
                <ShoppingCart className="h-4 w-4 text-primary" /> Create Purchase Order
              </Link>
            </Button>
            <Button size="sm" className="gap-1.5 font-semibold text-xs" onClick={() => setAddModalOpen(true)}>
              <Plus className="h-4 w-4" /> Add Consumable SKU
            </Button>
          </div>
        }
      />

      {/* Sub-Navigation */}
      <InventoryNav />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Central Stores • Consumables Division" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <Package className="h-3.5 w-3.5 text-primary" />
          <span>Category-specific consumables tracking &amp; ward distribution</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Surgical Consumables</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{surgicalCount} SKUs</p>
          <span className="text-[10px] text-muted-foreground">Gloves, scalpel blades, drapes</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">PPE &amp; Hygiene</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">{ppeCount} SKUs</p>
          <span className="text-[10px] text-cyan-600 font-medium">N95 masks, isolation gowns</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Wound Care Dressings</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{woundCount} SKUs</p>
          <span className="text-[10px] text-emerald-600 font-medium">Bio-dressings, sterile bandages</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Low Stock Alert</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{lowStockCount} Items</p>
          <span className="text-[10px] text-amber-600 font-medium">Below safety reorder point</span>
        </Card>
      </div>

      {/* Table Card */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Consumables Directory</CardTitle>
          <CardDescription className="text-xs">
            Monitor stock levels, batch details, and unit economics for clinical consumables.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search consumable name, SKU, vendor..."
                className="pl-8 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[170px] text-xs h-9">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Consumables</SelectItem>
                  <SelectItem value="Surgical Consumables">Surgical Consumables</SelectItem>
                  <SelectItem value="PPE & Hygiene">PPE &amp; Hygiene</SelectItem>
                  <SelectItem value="Wound Care">Wound Care</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px] text-xs h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Adequate">Adequate</SelectItem>
                  <SelectItem value="Low Stock">Low Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Item Code</TableHead>
                  <TableHead className="text-xs font-bold">Consumable Item</TableHead>
                  <TableHead className="text-xs font-bold">Category</TableHead>
                  <TableHead className="text-xs font-bold">Stock In Hand</TableHead>
                  <TableHead className="text-xs font-bold">Reorder Minimum</TableHead>
                  <TableHead className="text-xs font-bold">Batch &amp; Expiry</TableHead>
                  <TableHead className="text-xs font-bold">Primary Vendor</TableHead>
                  <TableHead className="text-xs font-bold">Unit Cost</TableHead>
                  <TableHead className="text-xs font-bold">Status</TableHead>
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
                    <TableCell className="font-mono text-xs font-bold">
                      <span className={item.status === "Low Stock" ? "text-amber-600 font-bold" : "text-emerald-600"}>
                        {item.stockLevel} {item.unit}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {item.reorderLevel} {item.unit}
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      {item.batchNumber ? (
                        <div>
                          <p className="font-semibold text-foreground text-[11px]">{item.batchNumber}</p>
                          <p className="text-[10px] text-muted-foreground">Exp: {item.expiryDate || "N/A"}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.supplierName}</TableCell>
                    <TableCell className="font-mono text-xs font-semibold">₹{item.unitCost}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          item.status === "Adequate"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                        }
                      >
                        {item.status}
                      </Badge>
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
                        {item.status === "Low Stock" && (
                          <Button size="sm" variant="outline" asChild className="h-7 text-xs font-semibold">
                            <Link href="/hospital-admin/procurement/create">
                              <ShoppingCart className="h-3 w-3 mr-1 text-amber-600" /> Reorder
                            </Link>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <AddConsumableModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        defaultCategory="Surgical Consumables"
        onSaveItem={handleSaveNewItem}
      />

      <StockAdjustmentModal
        open={adjustmentModalOpen}
        onOpenChange={setAdjustmentModalOpen}
        preselectedItem={selectedAdjustItem}
        onSaveAdjustment={handleSaveAdjustment}
      />
    </div>
  );
}
