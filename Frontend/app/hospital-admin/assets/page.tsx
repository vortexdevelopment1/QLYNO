"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowLeftRight,
  Boxes,
  Calendar,
  CheckCircle2,
  Clock,
  Cpu,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  History,
  Layers,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  Wrench,
  Zap,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { AssetsNav } from "@/hospital-admin/components/assets/assets-nav";
import {
  mockBiomedicalAssetsExtended,
  mockAssetAllocations,
  mockRepairTickets,
  mockAssetHistoryEvents,
} from "@/hospital-admin/lib/mock-data/assets-extended";
import {
  BiomedicalAsset,
  AssetCategory,
  AssetMaintenanceStatus,
  AssetAllocationRecord,
  RepairTicket,
  AssetHistoryEvent,
} from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { RegisterAssetModal } from "@/hospital-admin/components/assets/RegisterAssetModal";
import { LogPpmModal } from "@/hospital-admin/components/assets/LogPpmModal";
import { AssetAllocationModal } from "@/hospital-admin/components/assets/AssetAllocationModal";
import { CreateRepairTicketModal } from "@/hospital-admin/components/assets/CreateRepairTicketModal";
import { DecommissionAssetModal } from "@/hospital-admin/components/assets/DecommissionAssetModal";
import { AssetHistoryDrawer } from "@/hospital-admin/components/assets/AssetHistoryDrawer";

const DELEGATION_STRING = "Performed by Hospital Admin • Central Biomedical Engineering & Assets";

export default function AssetsPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  // State
  const [assets, setAssets] = useState<BiomedicalAsset[]>(mockBiomedicalAssetsExtended);
  const [allocations, setAllocations] = useState<AssetAllocationRecord[]>(mockAssetAllocations);
  const [repairs, setRepairs] = useState<RepairTicket[]>(mockRepairTickets);
  const [historyEvents, setHistoryEvents] = useState<AssetHistoryEvent[]>(mockAssetHistoryEvents);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals state
  const [selectedAsset, setSelectedAsset] = useState<BiomedicalAsset | null>(null);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [ppmModalOpen, setPpmModalOpen] = useState(false);
  const [allocationModalOpen, setAllocationModalOpen] = useState(false);
  const [repairModalOpen, setRepairModalOpen] = useState(false);
  const [decommissionModalOpen, setDecommissionModalOpen] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      const matchesSearch =
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.assetCode.toLowerCase().includes(search.toLowerCase()) ||
        a.serialNo.toLowerCase().includes(search.toLowerCase()) ||
        a.department.toLowerCase().includes(search.toLowerCase()) ||
        a.vendorName.toLowerCase().includes(search.toLowerCase());
      const matchesCat = categoryFilter === "all" || a.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || a.maintenanceStatus === statusFilter;
      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [assets, search, categoryFilter, statusFilter]);

  // Derived KPIs
  const totalValuationCr = useMemo(
    () => (assets.reduce((sum, a) => sum + a.purchaseCost, 0) / 10000000).toFixed(2),
    [assets]
  );
  const activeAmcCount = useMemo(
    () => assets.filter((a) => a.amcCmcContract === "Active").length,
    [assets]
  );
  const calibrationDueCount = useMemo(
    () => assets.filter((a) => a.maintenanceStatus === "Calibration Due").length,
    [assets]
  );
  const openRepairsCount = useMemo(
    () => repairs.filter((r) => r.status === "Reported" || r.status === "In Progress").length,
    [repairs]
  );

  // Handlers
  const handleSaveAsset = (newAsset: BiomedicalAsset, historyEvent: AssetHistoryEvent) => {
    setAssets((prev) => [newAsset, ...prev]);
    setHistoryEvents((prev) => [historyEvent, ...prev]);
  };

  const handleConfirmPpm = (updatedAsset: BiomedicalAsset, historyEvent: AssetHistoryEvent) => {
    setAssets((prev) => prev.map((a) => (a.id === updatedAsset.id ? updatedAsset : a)));
    setHistoryEvents((prev) => [historyEvent, ...prev]);
  };

  const handleSaveAllocation = (
    allocation: AssetAllocationRecord,
    updatedAsset: BiomedicalAsset,
    historyEvent: AssetHistoryEvent
  ) => {
    setAllocations((prev) => [allocation, ...prev]);
    setAssets((prev) => prev.map((a) => (a.id === updatedAsset.id ? updatedAsset : a)));
    setHistoryEvents((prev) => [historyEvent, ...prev]);
  };

  const handleSaveRepairTicket = (
    ticket: RepairTicket,
    updatedAsset: BiomedicalAsset,
    historyEvent: AssetHistoryEvent
  ) => {
    setRepairs((prev) => [ticket, ...prev]);
    setAssets((prev) => prev.map((a) => (a.id === updatedAsset.id ? updatedAsset : a)));
    setHistoryEvents((prev) => [historyEvent, ...prev]);
  };

  const handleConfirmDecommission = (
    decommissionedAsset: BiomedicalAsset,
    historyEvent: AssetHistoryEvent
  ) => {
    setAssets((prev) => prev.map((a) => (a.id === decommissionedAsset.id ? decommissionedAsset : a)));
    setHistoryEvents((prev) => [historyEvent, ...prev]);
  };

  const openAction = (
    action: "ppm" | "allocate" | "repair" | "decommission" | "history",
    asset: BiomedicalAsset
  ) => {
    setSelectedAsset(asset);
    if (action === "ppm") setPpmModalOpen(true);
    if (action === "allocate") setAllocationModalOpen(true);
    if (action === "repair") setRepairModalOpen(true);
    if (action === "decommission") setDecommissionModalOpen(true);
    if (action === "history") setHistoryDrawerOpen(true);
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Assets &amp; Biomedical Engineering Registry"
          description="Capital equipment lifecycle, AMC/CMC contracts, calibration schedules, breakdowns, and inter-department allocations."
          crumbs={[{ label: "Supply & Assets" }, { label: "Assets Registry" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading biomedical &amp; facility assets...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Assets &amp; Biomedical Engineering Registry"
        description="Capital equipment lifecycle, AMC/CMC contracts, calibration schedules, breakdowns, and inter-department allocations."
        crumbs={[{ label: "Supply & Assets" }, { label: "Assets Registry" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 font-semibold text-xs text-rose-600 hover:text-rose-700"
              onClick={() => {
                setSelectedAsset(assets[0] || null);
                setRepairModalOpen(true);
              }}
            >
              <Wrench className="h-4 w-4" /> Report Breakdown
            </Button>
            <Button
              size="sm"
              className="gap-1.5 font-semibold text-xs"
              onClick={() => setRegisterModalOpen(true)}
            >
              <Plus className="h-4 w-4" /> Register Asset
            </Button>
          </div>
        }
      />

      {/* Sub-Navigation */}
      <AssetsNav />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Central Biomedical Engineering &amp; Facility Assets" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Single source of truth for capital assets • Strict non-duplication in OT &amp; Radiology</span>
        </div>
      </div>

      {/* Calibration Due Alert Banner */}
      {calibrationDueCount > 0 && (
        <Card className="border-amber-500/40 bg-amber-500/5 shadow-xs">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  {calibrationDueCount} Critical Biomedical Device(s) Due for Scheduled Calibration / PPM
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Hamilton C6 Intensive Care Ventilator (ICU) requires bi-annual flow sensor calibration sign-off.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="text-xs shrink-0 text-amber-700 dark:text-amber-300 border-amber-500/30 font-semibold"
              onClick={() =>
                openAction(
                  "ppm",
                  assets.find((a) => a.maintenanceStatus === "Calibration Due") || assets[0]
                )
              }
            >
              <Wrench className="h-3.5 w-3.5 mr-1" /> Log Calibration PPM
            </Button>
          </CardContent>
        </Card>
      )}

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Capital Assets</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{assets.length} Machines</p>
          <span className="text-[10px] text-muted-foreground">Clinical &amp; Facility Infrastructure</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Portfolio Valuation</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">₹{totalValuationCr} Cr</p>
          <span className="text-[10px] text-muted-foreground">Original acquisition cost</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Active AMC / CMC</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{activeAmcCount} Active</p>
          <span className="text-[10px] text-emerald-600 font-medium">OEM warranty coverage</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Operational Reliability</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">98.5% Uptime</p>
          <span className="text-[10px] text-cyan-600 font-medium">{openRepairsCount} active repair ticket(s)</span>
        </Card>
      </div>

      {/* Assets Registry Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-bold">Master Capital &amp; Facility Equipment Registry</CardTitle>
              <CardDescription className="text-xs">
                Comprehensive directory across clinical suites and hospital plant infrastructure.
              </CardDescription>
            </div>
            <Link href="/hospital-admin/assets/history" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
              <History className="h-3.5 w-3.5" /> View Unified Audit Timeline
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search asset #, model, serial #, dept..."
                className="pl-8 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[170px] text-xs h-9">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Diagnostic & Imaging">Diagnostic &amp; Imaging</SelectItem>
                  <SelectItem value="Life Support">Life Support</SelectItem>
                  <SelectItem value="OT Equipment">OT Equipment</SelectItem>
                  <SelectItem value="Monitoring">Monitoring</SelectItem>
                  <SelectItem value="Facility Infrastructure">Facility Infrastructure</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] text-xs h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Operational">Operational</SelectItem>
                  <SelectItem value="Calibration Due">Calibration Due</SelectItem>
                  <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                  <SelectItem value="Decommissioned">Decommissioned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Asset Code</TableHead>
                  <TableHead className="text-xs font-bold">Equipment &amp; Model</TableHead>
                  <TableHead className="text-xs font-bold">Category</TableHead>
                  <TableHead className="text-xs font-bold">Current Location</TableHead>
                  <TableHead className="text-xs font-bold">Serial Number</TableHead>
                  <TableHead className="text-xs font-bold">AMC / Warranty</TableHead>
                  <TableHead className="text-xs font-bold">Next PPM Date</TableHead>
                  <TableHead className="text-xs font-bold">Status</TableHead>
                  <TableHead className="text-xs font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => (
                  <TableRow key={asset.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {asset.assetCode}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground">{asset.name}</div>
                      <div className="text-[10px] text-muted-foreground">{asset.model}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {asset.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-medium">{asset.department}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {asset.installedRoom || asset.floor}
                      </div>
                      {asset.isLoaned && (
                        <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[9px] mt-0.5">
                          On Loan: {asset.currentLoanDepartment}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {asset.serialNo}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          asset.amcCmcContract === "Active"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                        }
                      >
                        {asset.amcCmcContract}
                      </Badge>
                      <div className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[120px]" title={asset.vendorName}>
                        {asset.vendorName}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-foreground font-semibold">
                      {asset.nextPPMDate}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          asset.maintenanceStatus === "Operational"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                            : asset.maintenanceStatus === "Calibration Due"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                            : asset.maintenanceStatus === "Decommissioned"
                            ? "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30 text-[10px]"
                            : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px]"
                        }
                      >
                        {asset.maintenanceStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs font-semibold px-2"
                          title="View Lifecycle History"
                          onClick={() => openAction("history", asset)}
                        >
                          <History className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs font-semibold px-2"
                          title="Reassign / Loan Asset"
                          onClick={() => openAction("allocate", asset)}
                        >
                          <ArrowLeftRight className="h-3 w-3 mr-1" /> Allocate
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs font-semibold px-2"
                          title="Sign-Off PPM Calibration"
                          onClick={() => openAction("ppm", asset)}
                        >
                          <Wrench className="h-3 w-3 mr-1" /> Log PPM
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs font-semibold px-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10"
                          title="Decommission Asset"
                          onClick={() => openAction("decommission", asset)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modals & Drawers */}
      <RegisterAssetModal
        open={registerModalOpen}
        onOpenChange={setRegisterModalOpen}
        onSaveAsset={handleSaveAsset}
      />

      <LogPpmModal
        open={ppmModalOpen}
        onOpenChange={setPpmModalOpen}
        asset={selectedAsset}
        onConfirmPpm={handleConfirmPpm}
      />

      <AssetAllocationModal
        open={allocationModalOpen}
        onOpenChange={setAllocationModalOpen}
        asset={selectedAsset}
        onSaveAllocation={handleSaveAllocation}
      />

      <CreateRepairTicketModal
        open={repairModalOpen}
        onOpenChange={setRepairModalOpen}
        asset={selectedAsset}
        allAssets={assets}
        onSaveTicket={handleSaveRepairTicket}
      />

      <DecommissionAssetModal
        open={decommissionModalOpen}
        onOpenChange={setDecommissionModalOpen}
        asset={selectedAsset}
        hasActiveLoan={Boolean(selectedAsset?.isLoaned)}
        hasOpenRepair={Boolean(
          selectedAsset &&
            repairs.some(
              (r) =>
                r.assetId === selectedAsset.id &&
                (r.status === "Reported" || r.status === "In Progress")
            )
        )}
        onConfirmDecommission={handleConfirmDecommission}
      />

      <AssetHistoryDrawer
        open={historyDrawerOpen}
        onOpenChange={setHistoryDrawerOpen}
        asset={selectedAsset}
        historyEvents={historyEvents}
      />
    </div>
  );
}
