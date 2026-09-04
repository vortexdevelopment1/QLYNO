"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowLeftRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  Filter,
  Layers,
  MapPin,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  User,
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
  mockAssetHistoryEvents,
} from "@/hospital-admin/lib/mock-data/assets-extended";
import {
  BiomedicalAsset,
  AssetAllocationRecord,
  AssetHistoryEvent,
} from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { AssetAllocationModal } from "@/hospital-admin/components/assets/AssetAllocationModal";

export default function AssetAllocationPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [assets, setAssets] = useState<BiomedicalAsset[]>(mockBiomedicalAssetsExtended);
  const [allocations, setAllocations] = useState<AssetAllocationRecord[]>(mockAssetAllocations);
  const [historyEvents, setHistoryEvents] = useState<AssetHistoryEvent[]>(mockAssetHistoryEvents);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedAsset, setSelectedAsset] = useState<BiomedicalAsset | null>(null);
  const [allocationModalOpen, setAllocationModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredAllocations = useMemo(() => {
    return allocations.filter((a) => {
      const matchesSearch =
        a.allocationNo.toLowerCase().includes(search.toLowerCase()) ||
        a.assetCode.toLowerCase().includes(search.toLowerCase()) ||
        a.assetName.toLowerCase().includes(search.toLowerCase()) ||
        a.fromDepartment.toLowerCase().includes(search.toLowerCase()) ||
        a.toDepartment.toLowerCase().includes(search.toLowerCase()) ||
        a.allocatedBy.toLowerCase().includes(search.toLowerCase());

      const matchesType = typeFilter === "all" || a.allocationType === typeFilter;
      const matchesStatus = statusFilter === "all" || a.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [allocations, search, typeFilter, statusFilter]);

  const activeLoans = useMemo(
    () => allocations.filter((a) => a.status === "Active" && a.allocationType === "Temporary Loan"),
    [allocations]
  );
  const permanentTransfersCount = useMemo(
    () => allocations.filter((a) => a.allocationType === "Permanent Transfer").length,
    [allocations]
  );

  const handleReturnLoan = (allocation: AssetAllocationRecord) => {
    const now = new Date().toISOString();
    const returnedBy = "Nurse Station Lead / Receiving Officer";

    setAllocations((prev) =>
      prev.map((a) =>
        a.id === allocation.id
          ? {
              ...a,
              status: "Returned",
              returnedAt: now,
              returnedBy,
            }
          : a
      )
    );

    setAssets((prev) =>
      prev.map((ast) =>
        ast.id === allocation.assetId
          ? {
              ...ast,
              isLoaned: false,
              currentLoanDepartment: undefined,
              expectedReturnDate: undefined,
            }
          : ast
      )
    );

    const historyEvent: AssetHistoryEvent = {
      id: `evt_${Date.now()}`,
      assetId: allocation.assetId,
      assetCode: allocation.assetCode,
      assetName: allocation.assetName,
      eventType: "Allocation / Transfer",
      timestamp: now,
      actor: returnedBy,
      title: `Temporary Loan Returned to ${allocation.fromDepartment}`,
      details: `Machine checked back in from ${allocation.toDepartment}. Loan record ${allocation.allocationNo} closed. Asset restored to home bay.`,
      referenceId: allocation.allocationNo,
    };
    setHistoryEvents((prev) => [historyEvent, ...prev]);

    toast({
      title: "Loan Returned & Checked In",
      description: `${allocation.assetCode} returned to ${allocation.fromDepartment}. Ref: ${allocation.allocationNo}.`,
    });
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

  if (!mounted) return null;

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Asset Allocation &amp; Inter-Department Loans"
        description="Formal location tracking, temporary ward surge loans, and permanent department reassignment audits."
        crumbs={[{ label: "Supply & Assets" }, { label: "Assets" }, { label: "Allocation & Transfers" }]}
        actions={
          <Button
            size="sm"
            className="gap-1.5 font-semibold text-xs"
            onClick={() => {
              setSelectedAsset(assets[0] || null);
              setAllocationModalOpen(true);
            }}
          >
            <ArrowLeftRight className="h-4 w-4" /> New Allocation / Loan
          </Button>
        }
      />

      <AssetsNav />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Inter-Department Equipment Logistics" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Rule F20-CANNOT-5: Every location shift generates an immutable allocation ledger record</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Active Temporary Loans</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{activeLoans.length} Machines</p>
          <span className="text-[10px] text-amber-600 font-medium">Currently deployed on loan</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Permanent Transfers</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{permanentTransfersCount} Records</p>
          <span className="text-[10px] text-muted-foreground">Department realignments</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Allocation Logs</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">{allocations.length} Events</p>
          <span className="text-[10px] text-muted-foreground">100% audit compliant</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">On-Time Return Rate</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">100%</p>
          <span className="text-[10px] text-emerald-600 font-medium">Zero untracked/missing assets</span>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Asset Allocation &amp; Transfer Registry</CardTitle>
          <CardDescription className="text-xs">
            Review the historical and active movement of equipment between clinical wards and departments.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search allocation #, asset, dept..."
                className="pl-8 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px] text-xs h-9">
                  <SelectValue placeholder="Allocation Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Temporary Loan">Temporary Loan</SelectItem>
                  <SelectItem value="Permanent Transfer">Permanent Transfer</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] text-xs h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Returned">Returned / Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Allocation #</TableHead>
                  <TableHead className="text-xs font-bold">Asset Details</TableHead>
                  <TableHead className="text-xs font-bold">Movement Path</TableHead>
                  <TableHead className="text-xs font-bold">Allocation Type</TableHead>
                  <TableHead className="text-xs font-bold">Date &amp; Authorizer</TableHead>
                  <TableHead className="text-xs font-bold">Expected Return</TableHead>
                  <TableHead className="text-xs font-bold">Status</TableHead>
                  <TableHead className="text-xs font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAllocations.map((alc) => (
                  <TableRow key={alc.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {alc.allocationNo}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground">{alc.assetName}</div>
                      <span className="font-mono text-[10px] text-muted-foreground">[{alc.assetCode}]</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <span className="text-muted-foreground">{alc.fromDepartment}</span>
                        <span className="mx-1 text-primary font-bold">➔</span>
                        <span className="font-semibold text-foreground">{alc.toDepartment}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {alc.toFloor} ({alc.toRoom || "Assigned Room"})
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          alc.allocationType === "Temporary Loan"
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                            : "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 text-[10px]"
                        }
                      >
                        {alc.allocationType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-foreground font-medium">{alc.allocatedBy}</div>
                      <div className="font-mono text-[10px] text-muted-foreground" suppressHydrationWarning>
                        {new Date(alc.allocatedAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold">
                      {alc.expectedReturnDate ? (
                        <span className={alc.status === "Active" ? "text-amber-600 font-bold" : "text-muted-foreground"}>
                          {alc.expectedReturnDate}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">— (Permanent)</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          alc.status === "Active"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                            : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                        }
                      >
                        {alc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {alc.status === "Active" && alc.allocationType === "Temporary Loan" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs font-semibold px-2 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                          onClick={() => handleReturnLoan(alc)}
                        >
                          <RotateCcw className="h-3 w-3 mr-1" /> Return Loan
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground font-mono">Closed</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AssetAllocationModal
        open={allocationModalOpen}
        onOpenChange={setAllocationModalOpen}
        asset={selectedAsset}
        onSaveAllocation={handleSaveAllocation}
      />
    </div>
  );
}
