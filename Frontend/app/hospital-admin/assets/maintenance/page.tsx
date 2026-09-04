"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  CalendarClock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Search,
  Filter,
  ShieldCheck,
  Clock,
  FileSpreadsheet,
  Download,
  Building,
  User,
  History,
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
import { mockBiomedicalAssetsExtended, mockAssetHistoryEvents } from "@/hospital-admin/lib/mock-data/assets-extended";
import { BiomedicalAsset, AssetHistoryEvent } from "@/hospital-admin/lib/types";
import { LogPpmModal } from "@/hospital-admin/components/assets/LogPpmModal";
import { AssetHistoryDrawer } from "@/hospital-admin/components/assets/AssetHistoryDrawer";

export default function AssetMaintenancePage() {
  const [mounted, setMounted] = useState(false);
  const [assets, setAssets] = useState<BiomedicalAsset[]>(mockBiomedicalAssetsExtended);
  const [historyEvents, setHistoryEvents] = useState<AssetHistoryEvent[]>(mockAssetHistoryEvents);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [selectedAsset, setSelectedAsset] = useState<BiomedicalAsset | null>(null);
  const [ppmModalOpen, setPpmModalOpen] = useState(false);
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

      const matchesStatus = statusFilter === "all" || a.maintenanceStatus === statusFilter;
      const matchesCat = categoryFilter === "all" || a.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCat;
    });
  }, [assets, search, statusFilter, categoryFilter]);

  const calibrationDue = useMemo(
    () => assets.filter((a) => a.maintenanceStatus === "Calibration Due"),
    [assets]
  );
  const upcomingThisMonth = useMemo(() => {
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7); // e.g. "2026-08" or "2026-09"
    return assets.filter((a) => a.nextPPMDate.startsWith(currentMonth));
  }, [assets]);

  const handleConfirmPpm = (updatedAsset: BiomedicalAsset, historyEvent: AssetHistoryEvent) => {
    setAssets((prev) => prev.map((a) => (a.id === updatedAsset.id ? updatedAsset : a)));
    setHistoryEvents((prev) => [historyEvent, ...prev]);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Preventive Maintenance &amp; Calibration Schedule"
        description="Statutory biomedical calibration schedules, bi-annual Planned Preventive Maintenance (PPM), and quality testing sign-offs."
        crumbs={[{ label: "Supply & Assets" }, { label: "Assets" }, { label: "Maintenance (PPM)" }]}
        actions={
          <Button
            size="sm"
            className="gap-1.5 font-semibold text-xs"
            onClick={() => {
              setSelectedAsset(calibrationDue[0] || assets[0]);
              setPpmModalOpen(true);
            }}
          >
            <Wrench className="h-4 w-4" /> Certify Calibration (PPM)
          </Button>
        }
      />

      <AssetsNav />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Central Biomedical QA &amp; Calibration Desk" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Rule F20-CAN-16: Centralized schedule of every machine's upcoming PPM calibration date</span>
        </div>
      </div>

      {/* Calibration Due Alert Banner */}
      {calibrationDue.length > 0 && (
        <Card className="border-rose-500/40 bg-rose-500/5 shadow-xs">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
                  {calibrationDue.length} Critical Device(s) Due / Overdue for Scheduled Calibration
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {calibrationDue.map((d) => `[${d.assetCode}] ${d.name} (${d.department})`).join(", ")}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="text-xs shrink-0 text-rose-700 dark:text-rose-300 border-rose-500/30 font-semibold"
              onClick={() => {
                setSelectedAsset(calibrationDue[0]);
                setPpmModalOpen(true);
              }}
            >
              <Wrench className="h-3.5 w-3.5 mr-1" /> Log PPM Sign-Off
            </Button>
          </CardContent>
        </Card>
      )}

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Calibration Due / Overdue</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">{calibrationDue.length} Devices</p>
          <span className="text-[10px] text-rose-600 font-medium">Requires immediate certification</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Scheduled in Next 30 Days</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{upcomingThisMonth.length} Machines</p>
          <span className="text-[10px] text-muted-foreground">Upcoming PPM pipeline</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">PPM Certified Operational</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
            {assets.filter((a) => a.maintenanceStatus === "Operational").length} Machines
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Calibrated &amp; tested</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">QA Compliance Rate</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">97.8%</p>
          <span className="text-[10px] text-cyan-600 font-medium">NABH biomedical audit benchmark</span>
        </Card>
      </div>

      {/* Master Maintenance Schedule Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Hospital-wide PPM &amp; Calibration Schedule</CardTitle>
          <CardDescription className="text-xs">
            Track last certified calibration date, next scheduled preventive maintenance deadline, and servicing contractor.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search machine, model, serial #, vendor..."
                className="pl-8 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] text-xs h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Calibration Due">Calibration Due</SelectItem>
                  <SelectItem value="Operational">Operational</SelectItem>
                  <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px] text-xs h-9">
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
            </div>
          </div>

          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Asset Code</TableHead>
                  <TableHead className="text-xs font-bold">Equipment &amp; Model</TableHead>
                  <TableHead className="text-xs font-bold">Department</TableHead>
                  <TableHead className="text-xs font-bold">Last Certified Date</TableHead>
                  <TableHead className="text-xs font-bold">Next PPM Deadline</TableHead>
                  <TableHead className="text-xs font-bold">AMC Contractor</TableHead>
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
                      <div className="text-[10px] text-muted-foreground">{asset.model} • SN: {asset.serialNo}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-medium">{asset.department}</div>
                      <div className="text-[10px] text-muted-foreground">{asset.installedRoom || asset.floor}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {asset.lastCalibrationDate || "— (Initial)"}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold">
                      <span
                        className={
                          asset.maintenanceStatus === "Calibration Due"
                            ? "text-rose-600 font-bold"
                            : "text-foreground"
                        }
                      >
                        {asset.nextPPMDate}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-foreground">{asset.vendorName}</div>
                      <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                        {asset.amcCmcContract}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          asset.maintenanceStatus === "Operational"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                            : asset.maintenanceStatus === "Calibration Due"
                            ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px]"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
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
                          onClick={() => {
                            setSelectedAsset(asset);
                            setHistoryDrawerOpen(true);
                          }}
                        >
                          <History className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs font-semibold px-2"
                          onClick={() => {
                            setSelectedAsset(asset);
                            setPpmModalOpen(true);
                          }}
                        >
                          <Wrench className="h-3 w-3 mr-1" /> Log PPM
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

      <LogPpmModal
        open={ppmModalOpen}
        onOpenChange={setPpmModalOpen}
        asset={selectedAsset}
        onConfirmPpm={handleConfirmPpm}
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
