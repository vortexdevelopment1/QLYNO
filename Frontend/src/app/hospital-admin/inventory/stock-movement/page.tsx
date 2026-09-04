"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Download,
  Filter,
  Layers,
  Printer,
  Search,
  ShieldCheck,
  Building2,
  Calendar,
  Clock,
  FileSpreadsheet,
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
import { mockStockMovements } from "@/hospital-admin/lib/mock-data/inventory-extended";
import { StockMovementRecord, MovementType, MovementDirection } from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";

export default function StockMovementLedgerPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const [movements, setMovements] = useState<StockMovementRecord[]>(mockStockMovements);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [directionFilter, setDirectionFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const matchesSearch =
        m.itemName.toLowerCase().includes(search.toLowerCase()) ||
        m.itemCode.toLowerCase().includes(search.toLowerCase()) ||
        m.referenceId.toLowerCase().includes(search.toLowerCase()) ||
        m.performedBy.toLowerCase().includes(search.toLowerCase()) ||
        (m.notes && m.notes.toLowerCase().includes(search.toLowerCase()));

      const matchesType = typeFilter === "all" || m.type === typeFilter;
      const matchesDirection = directionFilter === "all" || m.direction === directionFilter;
      const matchesSource = sourceFilter === "all" || m.sourceModule === sourceFilter;

      return matchesSearch && matchesType && matchesDirection && matchesSource;
    });
  }, [movements, search, typeFilter, directionFilter, sourceFilter]);

  // Derived KPIs
  const totalInflow = useMemo(
    () => movements.filter((m) => m.direction === "IN").reduce((acc, m) => acc + m.quantity, 0),
    [movements]
  );
  const totalOutflow = useMemo(
    () => movements.filter((m) => m.direction === "OUT").reduce((acc, m) => acc + m.quantity, 0),
    [movements]
  );

  // CSV Export Handler
  const handleExportCSV = () => {
    const headers = [
      "Movement ID",
      "Timestamp",
      "Item Code",
      "Item Name",
      "Category",
      "Type",
      "Direction",
      "Quantity",
      "Unit",
      "Source Module",
      "Reference ID",
      "Performed By",
      "Notes",
    ];

    const rows = filteredMovements.map((m) => [
      m.id,
      m.timestamp,
      `"${m.itemCode}"`,
      `"${m.itemName}"`,
      `"${m.category}"`,
      `"${m.type}"`,
      m.direction,
      m.quantity,
      `"${m.unit}"`,
      `"${m.sourceModule}"`,
      `"${m.referenceId}"`,
      `"${m.performedBy}"`,
      `"${m.notes || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Stock_Movement_Ledger_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Ledger Exported",
      description: "Stock Movement CSV download complete.",
    });
  };

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      {/* Print-Only Header */}
      <div className="hidden print:block mb-4 border-b pb-3 border-slate-300">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">QLYNO SUPER SPECIALTY HOSPITAL</h1>
            <p className="text-[11px] text-slate-600 font-medium">Department of Central Stores & Supply Chain Management</p>
            <h2 className="text-xs font-bold text-slate-800 mt-1 uppercase tracking-wide">Consolidated Stock Movement Transaction Ledger</h2>
          </div>
          <div className="text-right text-[10px] text-slate-600 font-mono" suppressHydrationWarning>
            <p>Generated: {mounted ? new Date().toLocaleString() : "2026-08-26, 16:30"}</p>
            <p>Total Records: {filteredMovements.length}</p>
            <p>Net Inflow: +{totalInflow} | Net Outflow: -{totalOutflow}</p>
          </div>
        </div>
      </div>

      <div className="print:hidden">
        <PageHeader
          title="Stock Movement Ledger"
          description="Unified, append-only transaction audit trail aggregating Indent Dispatches, Procurement Deliveries, Dispensing, and Adjustments."
          crumbs={[{ label: "Supply & Assets" }, { label: "Inventory" }, { label: "Stock Movement" }]}
          actions={
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 font-semibold text-xs"
                onClick={() => window.print()}
              >
                <Printer className="h-4 w-4" /> Print Ledger
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 font-semibold text-xs"
                onClick={handleExportCSV}
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Export CSV
              </Button>
            </div>
          }
        />
      </div>

      {/* Sub-Navigation */}
      <div className="print:hidden">
        <InventoryNav />
      </div>

      <div className="print:hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Central Stores • Transaction Ledger Engine" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Append-only immutable audit trail • Strict cross-module transaction integrity</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="print:hidden grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Inflow (IN)</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">+{totalInflow.toLocaleString()} Units</p>
          <span className="text-[10px] text-emerald-600 font-medium">Deliveries, returns &amp; found stock</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Outflow (OUT)</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">-{totalOutflow.toLocaleString()} Units</p>
          <span className="text-[10px] text-rose-600 font-medium">Ward dispatches &amp; write-offs</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Movements</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{movements.length} Transactions</p>
          <span className="text-[10px] text-muted-foreground">Aggregated across 5 sources</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Audit Reliability</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">100% Signed</p>
          <span className="text-[10px] text-cyan-600 font-medium">Every action stamped with actor</span>
        </Card>
      </div>

      {/* Movement Ledger Table */}
      <Card className="border-border shadow-xs print:border-none print:shadow-none print:p-0">
        <CardHeader className="p-4 pb-2 print:hidden">
          <CardTitle className="text-sm font-bold">Consolidated Transaction Ledger</CardTitle>
          <CardDescription className="text-xs">
            Review the real-time sequence of all stock increases and decreases across the hospital.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4 print:p-0">
          {/* Filters Bar */}
          <div className="print:hidden flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search item, code, ref #, actor..."
                className="pl-8 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[170px] text-xs h-9">
                  <SelectValue placeholder="Movement Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Movement Types</SelectItem>
                  <SelectItem value="Indent Dispatch">Indent Dispatch</SelectItem>
                  <SelectItem value="Procurement Delivery">Procurement Delivery</SelectItem>
                  <SelectItem value="Pharmacy Dispensing">Pharmacy Dispensing</SelectItem>
                  <SelectItem value="Sales Return">Sales Return</SelectItem>
                  <SelectItem value="Stock Adjustment">Stock Adjustment</SelectItem>
                </SelectContent>
              </Select>

              <Select value={directionFilter} onValueChange={setDirectionFilter}>
                <SelectTrigger className="w-[130px] text-xs h-9">
                  <SelectValue placeholder="Direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Directions</SelectItem>
                  <SelectItem value="IN">IN (Stock Added)</SelectItem>
                  <SelectItem value="OUT">OUT (Stock Issued)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[150px] text-xs h-9">
                  <SelectValue placeholder="Source Module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="Central Stores">Central Stores</SelectItem>
                  <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                  <SelectItem value="Procurement">Procurement</SelectItem>
                  <SelectItem value="OT">OT Suites</SelectItem>
                  <SelectItem value="ICU">ICU Wards</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                  <SelectItem value="Physical Audit">Physical Audit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border border-border overflow-x-auto print:border-none print:overflow-visible print:w-full">
            <Table className="print:text-[8px] print:w-full print:table-fixed">
              <colgroup className="hidden print:table-column-group">
                <col className="w-[10%]" />
                <col className="w-[8%]" />
                <col className="w-[14%]" />
                <col className="w-[10%]" />
                <col className="w-[6%]" />
                <col className="w-[7%]" />
                <col className="w-[8%]" />
                <col className="w-[9%]" />
                <col className="w-[11%]" />
                <col className="w-[17%]" />
              </colgroup>
              <TableHeader>
                <TableRow className="bg-muted/40 print:bg-slate-100 print:border-b-2 print:border-slate-400">
                  <TableHead className="text-xs font-bold print:text-[8px] print:p-1 print:text-slate-800 print:w-[10%]">Timestamp</TableHead>
                  <TableHead className="text-xs font-bold print:text-[8px] print:p-1 print:text-slate-800 print:w-[8%]">SKU Code</TableHead>
                  <TableHead className="text-xs font-bold print:text-[8px] print:p-1 print:text-slate-800 print:w-[14%]">Consumable Item</TableHead>
                  <TableHead className="text-xs font-bold print:text-[8px] print:p-1 print:text-slate-800 print:w-[10%]">Movement Type</TableHead>
                  <TableHead className="text-xs font-bold print:text-[8px] print:p-1 print:text-slate-800 print:w-[6%]">Direction</TableHead>
                  <TableHead className="text-xs font-bold print:text-[8px] print:p-1 print:text-slate-800 print:w-[7%]">Quantity</TableHead>
                  <TableHead className="text-xs font-bold print:text-[8px] print:p-1 print:text-slate-800 print:w-[8%]">Source</TableHead>
                  <TableHead className="text-xs font-bold print:text-[8px] print:p-1 print:text-slate-800 print:w-[9%]">Ref ID</TableHead>
                  <TableHead className="text-xs font-bold print:text-[8px] print:p-1 print:text-slate-800 print:w-[11%]">Performed By</TableHead>
                  <TableHead className="text-xs font-bold print:text-[8px] print:p-1 print:text-slate-800 print:w-[17%]">Audit Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.map((mov) => (
                  <TableRow key={mov.id} className="hover:bg-muted/30 transition-colors print:border-b print:border-slate-200">
                    <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap print:whitespace-normal print:p-1 print:text-[8px] print:text-slate-700 print:w-[10%]" suppressHydrationWarning>
                      {new Date(mov.timestamp).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      {new Date(mov.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-primary print:p-1 print:text-[8px] print:text-slate-900 print:w-[8%]">
                      {mov.itemCode}
                    </TableCell>
                    <TableCell className="font-semibold text-xs text-foreground print:p-1 print:text-[8px] print:text-slate-900 print:w-[14%] print:whitespace-normal print:break-words">
                      {mov.itemName}
                    </TableCell>
                    <TableCell className="print:p-1 print:text-[8px] print:w-[10%]">
                      <Badge variant="outline" className="text-[10px] print:text-[7.5px] print:px-1 print:py-0 print:border-slate-300 print:whitespace-nowrap">
                        {mov.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="print:p-1 print:text-[8px] print:w-[6%]">
                      <Badge
                        className={
                          mov.direction === "IN"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] gap-1 print:bg-emerald-50 print:text-emerald-800 print:border-emerald-300 print:text-[7.5px] print:px-1 print:py-0"
                            : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px] gap-1 print:bg-rose-50 print:text-rose-800 print:border-rose-300 print:text-[7.5px] print:px-1 print:py-0"
                        }
                      >
                        {mov.direction === "IN" ? (
                          <ArrowDownLeft className="h-3 w-3 print:hidden" />
                        ) : (
                          <ArrowUpRight className="h-3 w-3 print:hidden" />
                        )}
                        <span>{mov.direction}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold print:p-1 print:text-[8px] print:w-[7%]">
                      <span
                        className={
                          mov.direction === "IN" ? "text-emerald-600 print:text-emerald-800 font-bold" : "text-rose-600 print:text-rose-800 font-bold"
                        }
                      >
                        {mov.direction === "IN" ? `+${mov.quantity}` : `-${mov.quantity}`}{" "}
                        {mov.unit}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-medium print:p-1 print:text-[8px] print:text-slate-700 print:w-[8%]">
                      {mov.sourceModule}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-primary print:p-1 print:text-[8px] print:text-slate-900 print:w-[9%]">
                      {mov.referenceId}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground print:p-1 print:text-[8px] print:text-slate-700 print:w-[11%] print:whitespace-normal print:break-words">
                      {mov.performedBy}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[220px] truncate print:max-w-none print:whitespace-normal print:p-1 print:text-[8px] print:text-slate-800 print:w-[17%] print:break-words" title={mov.notes}>
                      {mov.notes || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Print-Only Footer Sign-off */}
          <div className="hidden print:flex items-center justify-between pt-4 mt-4 border-t border-slate-300 text-[9px] text-slate-600">
            <div>
              <p>Store Keeper / Inventory In-charge: ___________________________</p>
            </div>
            <div>
              <p>Hospital Superintendent / Finance Head: ___________________________</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Print Stylesheet */}
      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 6mm 8mm;
          }
          *, *::before, *::after {
            box-sizing: border-box !important;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background: white !important;
            color: black !important;
          }
          /* Hide sidebar, topbar, and surrounding dashboard chrome */
          aside,
          header,
          nav,
          [data-sidebar="sidebar"],
          [data-topbar="topbar"],
          .print\\:hidden {
            display: none !important;
          }
          main, .print-container {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            display: block !important;
          }
          div:has(> table),
          .relative.w-full.overflow-auto,
          .overflow-x-auto {
            overflow: visible !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          table {
            width: 100% !important;
            min-width: 100% !important;
            max-width: 100% !important;
            table-layout: fixed !important;
            border-collapse: collapse !important;
          }
          th, td {
            white-space: normal !important;
            word-break: break-word !important;
            overflow-wrap: break-word !important;
            padding: 3px 4px !important;
            font-size: 8px !important;
            line-height: 1.25 !important;
            border: 1px solid #cbd5e1 !important;
          }
          th {
            background-color: #f1f5f9 !important;
            color: #0f172a !important;
            font-weight: 700 !important;
          }
        }
      `}</style>
    </div>
  );
}
