"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Stethoscope,
  Search,
  Filter,
  Wrench,
  ArrowLeftRight,
  History,
  ShieldCheck,
  Plus,
  AlertTriangle,
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
import { mockBiomedicalAssetsExtended, mockAssetHistoryEvents } from "@/hospital-admin/lib/mock-data/assets-extended";
import { BiomedicalAsset, AssetHistoryEvent } from "@/hospital-admin/lib/types";
import { LogPpmModal } from "@/hospital-admin/components/assets/LogPpmModal";
import { AssetAllocationModal } from "@/hospital-admin/components/assets/AssetAllocationModal";
import { CreateRepairTicketModal } from "@/hospital-admin/components/assets/CreateRepairTicketModal";
import { AssetHistoryDrawer } from "@/hospital-admin/components/assets/AssetHistoryDrawer";
import { RegisterAssetModal } from "@/hospital-admin/components/assets/RegisterAssetModal";

const MEDICAL_CATEGORIES = [
  "Diagnostic & Imaging",
  "Life Support",
  "OT Equipment",
  "Monitoring",
];

export default function MedicalEquipmentPage() {
  const [mounted, setMounted] = useState(false);
  const [assets, setAssets] = useState<BiomedicalAsset[]>(
    mockBiomedicalAssetsExtended.filter((a) => MEDICAL_CATEGORIES.includes(a.category))
  );
  const [historyEvents, setHistoryEvents] = useState<AssetHistoryEvent[]>(mockAssetHistoryEvents);

  const [search, setSearch] = useState("");
  const [subCategoryFilter, setSubCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals state
  const [selectedAsset, setSelectedAsset] = useState<BiomedicalAsset | null>(null);
  const [ppmModalOpen, setPpmModalOpen] = useState(false);
  const [allocationModalOpen, setAllocationModalOpen] = useState(false);
  const [repairModalOpen, setRepairModalOpen] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

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

      const matchesCat = subCategoryFilter === "all" || a.category === subCategoryFilter;
      const matchesStatus = statusFilter === "all" || a.maintenanceStatus === statusFilter;
      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [assets, search, subCategoryFilter, statusFilter]);

  const lifeSupportCount = assets.filter((a) => a.category === "Life Support").length;
  const imagingCount = assets.filter((a) => a.category === "Diagnostic & Imaging").length;
  const otCount = assets.filter((a) => a.category === "OT Equipment").length;
  const monitoringCount = assets.filter((a) => a.category === "Monitoring").length;

  const handleConfirmPpm = (updatedAsset: BiomedicalAsset, historyEvent: AssetHistoryEvent) => {
    setAssets((prev) => prev.map((a) => (a.id === updatedAsset.id ? updatedAsset : a)));
    setHistoryEvents((prev) => [historyEvent, ...prev]);
  };

  const handleSaveAllocation = (
    _allocation: any,
    updatedAsset: BiomedicalAsset,
    historyEvent: AssetHistoryEvent
  ) => {
    setAssets((prev) => prev.map((a) => (a.id === updatedAsset.id ? updatedAsset : a)));
    setHistoryEvents((prev) => [historyEvent, ...prev]);
  };

  const handleSaveRepairTicket = (
    _ticket: any,
    updatedAsset: BiomedicalAsset,
    historyEvent: AssetHistoryEvent
  ) => {
    setAssets((prev) => prev.map((a) => (a.id === updatedAsset.id ? updatedAsset : a)));
    setHistoryEvents((prev) => [historyEvent, ...prev]);
  };

  const handleSaveNewAsset = (newAsset: BiomedicalAsset, historyEvent: AssetHistoryEvent) => {
    if (MEDICAL_CATEGORIES.includes(newAsset.category)) {
      setAssets((prev) => [newAsset, ...prev]);
    }
    setHistoryEvents((prev) => [historyEvent, ...prev]);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Medical Equipment Registry"
        description="Clinical diagnostic systems, life support ventilators, surgical OT suites, and bedside patient monitors."
        crumbs={[{ label: "Supply & Assets" }, { label: "Assets" }, { label: "Medical Equipment" }]}
        actions={
          <Button size="sm" className="gap-1.5 font-semibold text-xs" onClick={() => setRegisterModalOpen(true)}>
            <Plus className="h-4 w-4" /> Add Medical Device
          </Button>
        }
      />

      <AssetsNav />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Clinical Engineering • Medical Devices Wing" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <Stethoscope className="h-3.5 w-3.5 text-cyan-600" />
          <span>NABH/AERB Compliant Medical Machinery • Direct reference to Radiology &amp; OT slots</span>
        </div>
      </div>

      {/* Specialty Category Filter Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card
          className={`p-3.5 border-border cursor-pointer transition-all ${
            subCategoryFilter === "Diagnostic & Imaging" ? "border-primary ring-1 ring-primary" : "hover:border-primary/50"
          }`}
          onClick={() => setSubCategoryFilter(subCategoryFilter === "Diagnostic & Imaging" ? "all" : "Diagnostic & Imaging")}
        >
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Diagnostic &amp; Imaging</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">{imagingCount} Systems</p>
          <span className="text-[10px] text-muted-foreground">CT, MRI, Ultrasound scanners</span>
        </Card>
        <Card
          className={`p-3.5 border-border cursor-pointer transition-all ${
            subCategoryFilter === "Life Support" ? "border-primary ring-1 ring-primary" : "hover:border-primary/50"
          }`}
          onClick={() => setSubCategoryFilter(subCategoryFilter === "Life Support" ? "all" : "Life Support")}
        >
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Life Support</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">{lifeSupportCount} Units</p>
          <span className="text-[10px] text-rose-600 font-medium">Ventilators, Defibrillators</span>
        </Card>
        <Card
          className={`p-3.5 border-border cursor-pointer transition-all ${
            subCategoryFilter === "OT Equipment" ? "border-primary ring-1 ring-primary" : "hover:border-primary/50"
          }`}
          onClick={() => setSubCategoryFilter(subCategoryFilter === "OT Equipment" ? "all" : "OT Equipment")}
        >
          <span className="text-[11px] text-muted-foreground uppercase font-bold">OT Surgical Suites</span>
          <p className="text-xl font-bold font-mono text-indigo-600 mt-0.5">{otCount} Machines</p>
          <span className="text-[10px] text-indigo-600 font-medium">Anesthesia workstations, C-Arms</span>
        </Card>
        <Card
          className={`p-3.5 border-border cursor-pointer transition-all ${
            subCategoryFilter === "Monitoring" ? "border-primary ring-1 ring-primary" : "hover:border-primary/50"
          }`}
          onClick={() => setSubCategoryFilter(subCategoryFilter === "Monitoring" ? "all" : "Monitoring")}
        >
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Monitoring &amp; Dialysis</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{monitoringCount} Devices</p>
          <span className="text-[10px] text-emerald-600 font-medium">BeneVision monitors, Dialysis</span>
        </Card>
      </div>

      {/* Master Medical Equipment Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Clinical Medical Devices ({filteredAssets.length})</CardTitle>
          <CardDescription className="text-xs">
            Review live operational status, PPM calibration schedules, and clinical department assignments.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search medical device, model, dept..."
                className="pl-8 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={subCategoryFilter} onValueChange={setSubCategoryFilter}>
                <SelectTrigger className="w-[180px] text-xs h-9">
                  <SelectValue placeholder="Medical Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clinical Specialties</SelectItem>
                  <SelectItem value="Diagnostic & Imaging">Diagnostic &amp; Imaging</SelectItem>
                  <SelectItem value="Life Support">Life Support</SelectItem>
                  <SelectItem value="OT Equipment">OT Equipment</SelectItem>
                  <SelectItem value="Monitoring">Monitoring &amp; Dialysis</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] text-xs h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Operational">Operational</SelectItem>
                  <SelectItem value="Calibration Due">Calibration Due</SelectItem>
                  <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Asset Code</TableHead>
                  <TableHead className="text-xs font-bold">Device Name &amp; Model</TableHead>
                  <TableHead className="text-xs font-bold">Clinical Specialty</TableHead>
                  <TableHead className="text-xs font-bold">Department &amp; Room</TableHead>
                  <TableHead className="text-xs font-bold">Serial Number</TableHead>
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
                      <div className="text-[10px] text-muted-foreground">{asset.installedRoom || asset.floor}</div>
                      {asset.isLoaned && (
                        <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[9px] mt-0.5">
                          On Loan: {asset.currentLoanDepartment}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {asset.serialNo}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-foreground">
                      {asset.nextPPMDate}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          asset.maintenanceStatus === "Operational"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                            : asset.maintenanceStatus === "Calibration Due"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
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
                            setAllocationModalOpen(true);
                          }}
                        >
                          <ArrowLeftRight className="h-3 w-3 mr-1" /> Loan/Transfer
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

      <RegisterAssetModal
        open={registerModalOpen}
        onOpenChange={setRegisterModalOpen}
        onSaveAsset={handleSaveNewAsset}
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
