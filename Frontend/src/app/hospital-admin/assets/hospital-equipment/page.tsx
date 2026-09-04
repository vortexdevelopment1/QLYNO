"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Building,
  Search,
  Filter,
  Wrench,
  ArrowLeftRight,
  History,
  ShieldCheck,
  Plus,
  AlertTriangle,
  Zap,
  Gauge,
  Flame,
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
import { CreateRepairTicketModal } from "@/hospital-admin/components/assets/CreateRepairTicketModal";
import { AssetHistoryDrawer } from "@/hospital-admin/components/assets/AssetHistoryDrawer";
import { RegisterAssetModal } from "@/hospital-admin/components/assets/RegisterAssetModal";

export default function HospitalEquipmentPage() {
  const [mounted, setMounted] = useState(false);
  const [assets, setAssets] = useState<BiomedicalAsset[]>(
    mockBiomedicalAssetsExtended.filter((a) => a.category === "Facility Infrastructure")
  );
  const [historyEvents, setHistoryEvents] = useState<AssetHistoryEvent[]>(mockAssetHistoryEvents);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals state
  const [selectedAsset, setSelectedAsset] = useState<BiomedicalAsset | null>(null);
  const [ppmModalOpen, setPpmModalOpen] = useState(false);
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

      const matchesStatus = statusFilter === "all" || a.maintenanceStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [assets, search, statusFilter]);

  const totalFacilityValuationCr = useMemo(
    () => (assets.reduce((sum, a) => sum + a.purchaseCost, 0) / 10000000).toFixed(2),
    [assets]
  );

  const handleConfirmPpm = (updatedAsset: BiomedicalAsset, historyEvent: AssetHistoryEvent) => {
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
    if (newAsset.category === "Facility Infrastructure") {
      setAssets((prev) => [newAsset, ...prev]);
    }
    setHistoryEvents((prev) => [historyEvent, ...prev]);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Hospital &amp; Facility Equipment Registry"
        description="Central Medical Gas Pipeline Systems (MGPS), emergency power generators, HVAC chillers, CSSD autoclaves, and patient elevators."
        crumbs={[{ label: "Supply & Assets" }, { label: "Assets" }, { label: "Hospital Equipment" }]}
        actions={
          <Button size="sm" className="gap-1.5 font-semibold text-xs" onClick={() => setRegisterModalOpen(true)}>
            <Plus className="h-4 w-4" /> Add Facility Asset
          </Button>
        }
      />

      <AssetsNav />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Facility &amp; Biomedical Engineering Board" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <Building className="h-3.5 w-3.5 text-primary" />
          <span>Heavy Utility Infrastructure • High-reliability power, medical gases, and cleanroom air handling</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Facility Infrastructure</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{assets.length} Plant Units</p>
          <span className="text-[10px] text-muted-foreground">Power, Gas, HVAC, Elevators</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Infrastructure Valuation</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">₹{totalFacilityValuationCr} Cr</p>
          <span className="text-[10px] text-muted-foreground">Total installed plant value</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">AMC Maintenance</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">100% Covered</p>
          <span className="text-[10px] text-emerald-600 font-medium">Linde, Cummins, Daikin, Schindler</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Plant Uptime</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">99.9% Uptime</p>
          <span className="text-[10px] text-cyan-600 font-medium">Zero unmitigated utility blackouts</span>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Hospital Facility Equipment &amp; Plant Systems</CardTitle>
          <CardDescription className="text-xs">
            Monitor mechanical utility machinery, statutory maintenance schedules, and OEM maintenance contracts.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search plant, model, serial #, plant bay..."
                className="pl-8 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] text-xs h-9">
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
                  <TableHead className="text-xs font-bold">Plant Asset Code</TableHead>
                  <TableHead className="text-xs font-bold">System Name &amp; Model</TableHead>
                  <TableHead className="text-xs font-bold">Installation Location</TableHead>
                  <TableHead className="text-xs font-bold">Serial Number</TableHead>
                  <TableHead className="text-xs font-bold">OEM Contractor</TableHead>
                  <TableHead className="text-xs font-bold">Next Servicing Date</TableHead>
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
                      <div className="text-xs font-medium">{asset.department}</div>
                      <div className="text-[10px] text-muted-foreground">{asset.installedRoom || asset.floor}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {asset.serialNo}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-medium text-foreground">{asset.vendorName}</div>
                      <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 mt-0.5">
                        {asset.amcCmcContract} AMC
                      </Badge>
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
                            setPpmModalOpen(true);
                          }}
                        >
                          <Wrench className="h-3 w-3 mr-1" /> Log Service
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
