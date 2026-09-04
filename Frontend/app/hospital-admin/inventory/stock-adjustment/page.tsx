"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  SlidersHorizontal,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Scale,
  DollarSign,
  FileSpreadsheet,
  Printer,
  UserCheck,
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
import { StockAdjustmentModal } from "@/hospital-admin/components/inventory/StockAdjustmentModal";
import { mockStockAdjustments } from "@/hospital-admin/lib/mock-data/inventory-extended";
import { StockAdjustmentRecord, StockMovementRecord, AdjustmentType } from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";

export default function StockAdjustmentConsolePage() {
  const { toast } = useToast();
  const [adjustments, setAdjustments] = useState<StockAdjustmentRecord[]>(mockStockAdjustments);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [modalOpen, setModalOpen] = useState(false);

  const filteredAdjustments = useMemo(() => {
    return adjustments.filter((a) => {
      const matchSearch =
        a.adjustmentNo.toLowerCase().includes(search.toLowerCase()) ||
        a.itemName.toLowerCase().includes(search.toLowerCase()) ||
        a.itemCode.toLowerCase().includes(search.toLowerCase()) ||
        a.reason.toLowerCase().includes(search.toLowerCase()) ||
        a.authorizedBy.toLowerCase().includes(search.toLowerCase());

      const matchType = typeFilter === "all" || a.adjustmentType === typeFilter;
      const matchStatus = statusFilter === "all" || a.approvalStatus === statusFilter;

      return matchSearch && matchType && matchStatus;
    });
  }, [adjustments, search, typeFilter, statusFilter]);

  // KPIs
  const totalWriteOffValue = useMemo(
    () =>
      adjustments
        .filter((a) => a.variance < 0)
        .reduce((acc, a) => acc + a.totalVarianceValue, 0),
    [adjustments]
  );

  const totalPositiveValue = useMemo(
    () =>
      adjustments
        .filter((a) => a.variance > 0)
        .reduce((acc, a) => acc + a.totalVarianceValue, 0),
    [adjustments]
  );

  const pendingDualCount = adjustments.filter(
    (a) => a.approvalStatus === "Pending Dual Authorization"
  ).length;

  const handleSaveAdjustment = (
    adjustment: StockAdjustmentRecord,
    movement: StockMovementRecord
  ) => {
    setAdjustments((prev) => [adjustment, ...prev]);
  };

  const handleDualAuthorize = (adj: StockAdjustmentRecord) => {
    setAdjustments((prev) =>
      prev.map((a) =>
        a.id === adj.id
          ? {
              ...a,
              approvalStatus: "Approved",
              notes: `${a.notes || ""} • Dual-authorized by Medical Director`,
            }
          : a
      )
    );

    toast({
      title: "Dual Authorization Granted",
      description: `High-value adjustment ${adj.adjustmentNo} approved and finalized.`,
    });
  };

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Stock Adjustment & Variance Reconciliation"
        description="Record physical count corrections, damage write-offs, expiry quarantines, and shrinkage with mandatory justifications."
        crumbs={[{ label: "Supply & Assets" }, { label: "Inventory" }, { label: "Stock Adjustment" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="gap-1.5 font-semibold text-xs"
              onClick={() => setModalOpen(true)}
            >
              <Plus className="h-4 w-4" /> Record New Adjustment
            </Button>
          </div>
        }
      />

      {/* Sub-Navigation */}
      <InventoryNav />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Central Stores • Stock Reconciliation Console" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
          <span>Mandatory Reason Enforced (Rule F19-CANNOT-3) • Dual-Auth Threshold: ₹25,000</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Adjustments</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{adjustments.length} Audits</p>
          <span className="text-[10px] text-muted-foreground">Logged with mandatory reason</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Write-Off Loss</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">₹{totalWriteOffValue.toLocaleString("en-IN")}</p>
          <span className="text-[10px] text-rose-600 font-medium">Damage, expiry &amp; shrinkage</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Found Stock Gained</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">+₹{totalPositiveValue.toLocaleString("en-IN")}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Positive count reconciliations</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Pending Dual Auth</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{pendingDualCount} Pending</p>
          <span className="text-[10px] text-amber-600 font-medium">High-value (&gt; ₹25k) reviews</span>
        </Card>
      </div>

      {/* Table Card */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-bold">Historical Stock Adjustment Registry</CardTitle>
            <CardDescription className="text-xs">
              Every adjustment generates a corresponding Stock Movement entry and preserves full accountability.
            </CardDescription>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search adjustment #, SKU, reason, admin..."
              className="pl-8 text-xs h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px] text-xs h-9">
                <SelectValue placeholder="Adjustment Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Adjustment Types</SelectItem>
                <SelectItem value="Physical Count Correction">Physical Count Correction</SelectItem>
                <SelectItem value="Write-off: Damage">Write-off: Damage</SelectItem>
                <SelectItem value="Write-off: Expiry">Write-off: Expiry</SelectItem>
                <SelectItem value="Write-off: Shrinkage">Write-off: Shrinkage</SelectItem>
                <SelectItem value="Positive Adjustment">Positive Adjustment</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[170px] text-xs h-9">
                <SelectValue placeholder="Approval Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Approval Statuses</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Pending Dual Authorization">Pending Dual Auth</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Adjustment #</TableHead>
                  <TableHead className="text-xs font-bold">Date &amp; Time</TableHead>
                  <TableHead className="text-xs font-bold">Supply SKU</TableHead>
                  <TableHead className="text-xs font-bold">Adjustment Type</TableHead>
                  <TableHead className="text-xs font-bold">Previous ➔ New</TableHead>
                  <TableHead className="text-xs font-bold">Variance</TableHead>
                  <TableHead className="text-xs font-bold">Financial Impact</TableHead>
                  <TableHead className="text-xs font-bold">Mandatory Justification</TableHead>
                  <TableHead className="text-xs font-bold">Authorized By</TableHead>
                  <TableHead className="text-xs font-bold text-right">Approval Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdjustments.map((adj) => (
                  <TableRow key={adj.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {adj.adjustmentNo}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap" suppressHydrationWarning>
                      {new Date(adj.timestamp).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      {new Date(adj.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <span className="font-semibold text-foreground">{adj.itemName}</span>
                        <span className="text-muted-foreground font-mono text-[10px] ml-1.5">[{adj.itemCode}]</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {adj.adjustmentType}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      <span>{adj.previousStock}</span>
                      <span className="mx-1 text-foreground font-bold">➔</span>
                      <span className="font-bold text-foreground">{adj.adjustedStock} {adj.unit}</span>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold">
                      <span className={adj.variance > 0 ? "text-emerald-600" : "text-rose-600"}>
                        {adj.variance > 0 ? `+${adj.variance}` : adj.variance} {adj.unit}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold">
                      <span className={adj.variance > 0 ? "text-emerald-600" : "text-rose-600"}>
                        {adj.variance > 0 ? "+" : "-"}₹{adj.totalVarianceValue.toLocaleString("en-IN")}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-foreground max-w-[280px]">
                      <p className="line-clamp-2 leading-relaxed text-[11px]" title={adj.reason}>
                        {adj.reason}
                      </p>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {adj.authorizedBy}
                    </TableCell>
                    <TableCell className="text-right">
                      {adj.approvalStatus === "Pending Dual Authorization" ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 text-[10px] font-semibold gap-1"
                          onClick={() => handleDualAuthorize(adj)}
                        >
                          <UserCheck className="h-3 w-3" /> Dual Authorize
                        </Button>
                      ) : (
                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]">
                          Approved
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Adjustment Modal */}
      <StockAdjustmentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSaveAdjustment={handleSaveAdjustment}
      />
    </div>
  );
}
