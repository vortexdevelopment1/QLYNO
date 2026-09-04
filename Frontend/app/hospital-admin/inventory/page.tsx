"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  Package,
  Pill,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Stethoscope,
  Truck,
  User,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/hospital-admin/components/ui/tabs";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { InventoryNav } from "@/hospital-admin/components/inventory/inventory-nav";
import { AddConsumableModal } from "@/hospital-admin/components/inventory/AddConsumableModal";
import { StockAdjustmentModal } from "@/hospital-admin/components/inventory/StockAdjustmentModal";
import {
  mockInventoryCatalogExtended,
  mockStockMovements,
  mockStockAdjustments,
} from "@/hospital-admin/lib/mock-data/inventory-extended";
import { mockStockIndents } from "@/hospital-admin/lib/mock-data/section12-operations";
import { mockMedicineInventory } from "@/hospital-admin/lib/mock-data/section12-operations";
import { InventoryItem, StockIndent, StockAdjustmentRecord, StockMovementRecord } from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Central Store Management workflow";

export default function InventoryPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("catalog");
  const [catalog, setCatalog] = useState<InventoryItem[]>(mockInventoryCatalogExtended);
  const [indents, setIndents] = useState<StockIndent[]>(mockStockIndents);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [selectedAdjustItem, setSelectedAdjustItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredCatalog = useMemo(() => {
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

  // Handle Indent Approval with automatic StockMovement write-through (Rule F19-CANNOT-5)
  const handleApproveIndent = (indent: StockIndent) => {
    setIndents((prev) =>
      prev.map((ind) => (ind.id === indent.id ? { ...ind, status: "Dispatched" } : ind))
    );

    // Record stock movement
    indent.items.forEach((item) => {
      const matched = catalog.find((c) => c.name.toLowerCase() === item.itemName.toLowerCase());
      if (matched) {
        setCatalog((prev) =>
          prev.map((c): InventoryItem =>
            c.id === matched.id
              ? {
                  ...c,
                  stockLevel: Math.max(0, c.stockLevel - item.quantity),
                  status:
                    c.stockLevel - item.quantity <= c.reorderLevel
                      ? ("Low Stock" as const)
                      : ("Adequate" as const),
                }
              : c
          )
        );
      }
    });

    toast({
      title: "Stock Indent Dispatched",
      description: `${indent.indentNo} dispatched to ${indent.department}. Stock balances updated and movement ledger entry logged. (${DELEGATION_STRING})`,
    });
  };

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
  const expiringCount = catalog.filter((i) => {
    if (!i.expiryDate) return false;
    const days = Math.ceil(
      (new Date(i.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return days <= 90;
  }).length;

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Hospital Central Inventory & Supply Chain"
          description="Stock overview, consumables catalog, ward indents dispatch, reorder thresholds, and movement ledgers."
          crumbs={[{ label: "Supply & Assets" }, { label: "Inventory" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading central store inventory...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Hospital Central Inventory & Supply Chain"
        description="Stock overview, consumables catalog, ward indents dispatch, reorder thresholds, and movement ledgers."
        crumbs={[{ label: "Supply & Assets" }, { label: "Inventory" }, { label: "Stock Overview" }]}
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
        <ScopeIndicator scope="Hospital Admin" stationName="Central General Stores & Supply Chain" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
          <span>Operational inventory management • Reorders feed directly into Vendor Procurement</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Store SKUs</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{catalog.length} Items</p>
          <span className="text-[10px] text-muted-foreground">Consumables &amp; supplies catalog</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Low Stock Items</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{lowStockCount} SKUs</p>
          <Link href="/hospital-admin/inventory/low-stock" className="text-[10px] text-amber-600 font-medium hover:underline flex items-center gap-1 mt-0.5">
            Review reorder triggers <ArrowRight className="h-2.5 w-2.5" />
          </Link>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Pending Ward Indents</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">
            {indents.filter((i) => i.status === "Pending Approval").length} Indents
          </p>
          <span className="text-[10px] text-cyan-600 font-medium">Awaiting dispatch sign-off</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Store Lead Time</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">2.5 Days</p>
          <span className="text-[10px] text-emerald-600 font-medium">Average supplier fulfillment</span>
        </Card>
      </div>

      {/* Cross-Reference Banner: Medicines (Rule F19-CANNOT-1 & Part 3 #2) */}
      <div className="p-3.5 rounded-lg border border-primary/20 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Pill className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-foreground">Pharmaceutical Medicines Inventory</h4>
              <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/30">
                Managed by Pharmacy
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {mockMedicineInventory.length} active drug formulations, formulations, and batch dispensing tracked under Pharmacy.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" variant="outline" asChild className="h-7 text-xs font-semibold">
            <Link href="/hospital-admin/inventory/medicines">
              View Medicine Summary <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
          <Button size="sm" asChild className="h-7 text-xs font-semibold">
            <Link href="/hospital-admin/pharmacy">
              Open Pharmacy <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 max-w-xs">
          <TabsTrigger value="catalog" className="text-xs">Supplies Catalog ({catalog.length})</TabsTrigger>
          <TabsTrigger value="indents" className="text-xs">Department Indents ({indents.length})</TabsTrigger>
        </TabsList>

        {/* TAB 1: CATALOG */}
        <TabsContent value="catalog" className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Medical Supplies &amp; Consumables Directory</CardTitle>
              <CardDescription className="text-xs">
                Track stock quantities, batch expiries, reorder thresholds, and active supplier partnerships.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search item code, name, supplier..."
                    className="pl-8 text-xs h-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[160px] text-xs h-9">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Surgical Consumables">Surgical Consumables</SelectItem>
                      <SelectItem value="PPE & Hygiene">PPE &amp; Hygiene</SelectItem>
                      <SelectItem value="Diagnostic Reagents">Diagnostic Reagents</SelectItem>
                      <SelectItem value="Wound Care">Wound Care</SelectItem>
                      <SelectItem value="General Medical Supplies">General Medical Supplies</SelectItem>
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
                      <SelectItem value="Reorder Placed">Reorder Placed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-bold">Item Code</TableHead>
                      <TableHead className="text-xs font-bold">Consumable Item Name</TableHead>
                      <TableHead className="text-xs font-bold">Category</TableHead>
                      <TableHead className="text-xs font-bold">Stock In Hand</TableHead>
                      <TableHead className="text-xs font-bold">Reorder Level</TableHead>
                      <TableHead className="text-xs font-bold">Batch &amp; Expiry</TableHead>
                      <TableHead className="text-xs font-bold">Primary Supplier</TableHead>
                      <TableHead className="text-xs font-bold">Unit Cost</TableHead>
                      <TableHead className="text-xs font-bold">Status</TableHead>
                      <TableHead className="text-xs font-bold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCatalog.map((item) => (
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
                              title="Adjust Stock"
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
        </TabsContent>

        {/* TAB 2: DEPARTMENT INDENTS */}
        <TabsContent value="indents" className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Department Stock Indent Requisitions</CardTitle>
              <CardDescription className="text-xs">
                Review supply requisitions submitted by OT, ICU, Emergency, and Wards.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-bold">Indent #</TableHead>
                      <TableHead className="text-xs font-bold">Requesting Department</TableHead>
                      <TableHead className="text-xs font-bold">Requested Items</TableHead>
                      <TableHead className="text-xs font-bold">Authorizing Staff</TableHead>
                      <TableHead className="text-xs font-bold">Requested Time</TableHead>
                      <TableHead className="text-xs font-bold">Status</TableHead>
                      <TableHead className="text-xs font-bold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {indents.map((ind) => (
                      <TableRow key={ind.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-mono text-xs font-bold text-primary">
                          {ind.indentNo}
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-foreground">{ind.department}</TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            {ind.items.map((it, idx) => (
                              <div key={idx} className="text-xs">
                                <span className="font-medium text-foreground">{it.itemName}</span> —{" "}
                                <span className="font-mono font-bold text-primary">{it.quantity} Units</span>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-medium">
                          {ind.requestedBy}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground" suppressHydrationWarning>
                          {new Date(ind.requestedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              ind.status === "Dispatched"
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                                : "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 text-[10px]"
                            }
                          >
                            {ind.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {ind.status === "Pending Approval" ? (
                            <Button
                              size="sm"
                              className="h-7 text-xs font-semibold"
                              onClick={() => handleApproveIndent(ind)}
                            >
                              <Send className="h-3.5 w-3.5 mr-1" /> Approve &amp; Dispatch
                            </Button>
                          ) : (
                            <span className="text-[11px] text-muted-foreground font-mono">Dispatched</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AddConsumableModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
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
