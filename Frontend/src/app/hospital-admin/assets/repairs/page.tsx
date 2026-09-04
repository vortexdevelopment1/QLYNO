"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Wrench,
  AlertCircle,
  CheckCircle2,
  Clock,
  IndianRupee,
  Plus,
  Search,
  Filter,
  ShieldAlert,
  ShieldCheck,
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
import {
  mockBiomedicalAssetsExtended,
  mockRepairTickets,
  mockAssetHistoryEvents,
} from "@/hospital-admin/lib/mock-data/assets-extended";
import {
  BiomedicalAsset,
  RepairTicket,
  RepairPriority,
  RepairStatus,
  AssetHistoryEvent,
} from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { CreateRepairTicketModal } from "@/hospital-admin/components/assets/CreateRepairTicketModal";
import { ResolveRepairModal } from "@/hospital-admin/components/assets/ResolveRepairModal";

export default function AssetRepairsPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [assets, setAssets] = useState<BiomedicalAsset[]>(mockBiomedicalAssetsExtended);
  const [repairs, setRepairs] = useState<RepairTicket[]>(mockRepairTickets);
  const [historyEvents, setHistoryEvents] = useState<AssetHistoryEvent[]>(mockAssetHistoryEvents);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [selectedTicket, setSelectedTicket] = useState<RepairTicket | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<BiomedicalAsset | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredRepairs = useMemo(() => {
    return repairs.filter((r) => {
      const matchesSearch =
        r.ticketNo.toLowerCase().includes(search.toLowerCase()) ||
        r.assetCode.toLowerCase().includes(search.toLowerCase()) ||
        r.assetName.toLowerCase().includes(search.toLowerCase()) ||
        r.faultDescription.toLowerCase().includes(search.toLowerCase()) ||
        r.assignedTechnicianOrVendor.toLowerCase().includes(search.toLowerCase()) ||
        r.department.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || r.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [repairs, search, statusFilter, priorityFilter]);

  const activeRepairsCount = useMemo(
    () => repairs.filter((r) => r.status === "Reported" || r.status === "In Progress").length,
    [repairs]
  );
  const criticalRepairsCount = useMemo(
    () => repairs.filter((r) => r.priority === "Critical" && r.status !== "Resolved").length,
    [repairs]
  );
  const totalRepairExpenditure = useMemo(
    () => repairs.filter((r) => r.status === "Resolved").reduce((sum, r) => sum + (r.repairCost || 0), 0),
    [repairs]
  );

  const handleSaveTicket = (
    ticket: RepairTicket,
    updatedAsset: BiomedicalAsset,
    historyEvent: AssetHistoryEvent
  ) => {
    setRepairs((prev) => [ticket, ...prev]);
    setAssets((prev) => prev.map((a) => (a.id === updatedAsset.id ? updatedAsset : a)));
    setHistoryEvents((prev) => [historyEvent, ...prev]);
  };

  const handleResolveTicket = (
    resolvedTicket: RepairTicket,
    updatedAsset: BiomedicalAsset,
    historyEvent: AssetHistoryEvent
  ) => {
    setRepairs((prev) => prev.map((r) => (r.id === resolvedTicket.id ? resolvedTicket : r)));
    setAssets((prev) => prev.map((a) => (a.id === updatedAsset.id ? updatedAsset : a)));
    setHistoryEvents((prev) => [historyEvent, ...prev]);
  };

  const openResolve = (ticket: RepairTicket) => {
    const matchedAsset = assets.find((a) => a.id === ticket.assetId || a.assetCode === ticket.assetCode) || assets[0];
    setSelectedTicket(ticket);
    setSelectedAsset(matchedAsset);
    setResolveModalOpen(true);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Equipment Breakdown &amp; Repair Ticketing"
        description="Corrective breakdown ticketing, emergency technician assignments, downtime tracking, spare parts, and resolution certification."
        crumbs={[{ label: "Supply & Assets" }, { label: "Assets" }, { label: "Repairs" }]}
        actions={
          <Button
            size="sm"
            className="gap-1.5 font-semibold text-xs bg-rose-600 hover:bg-rose-700 text-white"
            onClick={() => {
              setSelectedAsset(assets[0] || null);
              setCreateModalOpen(true);
            }}
          >
            <AlertCircle className="h-4 w-4" /> Report Equipment Breakdown
          </Button>
        }
      />

      <AssetsNav />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Corrective Biomedical Engineering Helpdesk" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
          <span>Rule F20-CANNOT-8: Equipment with open repair tickets cannot be scheduled for clinical/OT cases</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Active Breakdown Tickets</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">{activeRepairsCount} Under Repair</p>
          <span className="text-[10px] text-rose-600 font-medium">{criticalRepairsCount} Critical / OT Machines</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Resolved Repairs (YTD)</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
            {repairs.filter((r) => r.status === "Resolved").length} Restored
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">100% operational sign-off</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Repair &amp; Spares Cost</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">
            ₹{totalRepairExpenditure.toLocaleString("en-IN")}
          </p>
          <span className="text-[10px] text-muted-foreground">Certified parts &amp; labor</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Average MTTR (Downtime)</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">28.4 Hours</p>
          <span className="text-[10px] text-cyan-600 font-medium">Mean Time To Repair benchmark</span>
        </Card>
      </div>

      {/* Repairs Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Corrective Maintenance Ticket Roster</CardTitle>
          <CardDescription className="text-xs">
            Log of reported machinery failures, vendor dispatch status, downtime timestamps, and resolution certifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ticket #, machine, fault, technician..."
                className="pl-8 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[150px] text-xs h-9">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] text-xs h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Reported">Reported</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved &amp; Restored</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Ticket #</TableHead>
                  <TableHead className="text-xs font-bold">Equipment &amp; Dept</TableHead>
                  <TableHead className="text-xs font-bold">Priority</TableHead>
                  <TableHead className="text-xs font-bold">Reported Fault</TableHead>
                  <TableHead className="text-xs font-bold">Assigned Tech / Vendor</TableHead>
                  <TableHead className="text-xs font-bold">Downtime Start</TableHead>
                  <TableHead className="text-xs font-bold">Status</TableHead>
                  <TableHead className="text-xs font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRepairs.map((rep) => (
                  <TableRow key={rep.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {rep.ticketNo}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground">{rep.assetName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        [{rep.assetCode}] • {rep.department}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          rep.priority === "Critical"
                            ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px]"
                            : rep.priority === "High"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                            : "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 text-[10px]"
                        }
                      >
                        {rep.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[220px]">
                      <p className="line-clamp-2" title={rep.faultDescription}>
                        {rep.faultDescription}
                      </p>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="font-medium text-foreground">{rep.assignedTechnicianOrVendor}</div>
                      {rep.repairCost && (
                        <div className="text-[10px] text-muted-foreground font-mono">
                          Est: ₹{rep.repairCost.toLocaleString("en-IN")}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground" suppressHydrationWarning>
                      {new Date(rep.downtimeStart).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      {new Date(rep.downtimeStart).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          rep.status === "Resolved"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                            : rep.status === "In Progress"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                            : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px]"
                        }
                      >
                        {rep.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {rep.status !== "Resolved" ? (
                        <Button
                          size="sm"
                          className="h-7 text-xs font-semibold px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => openResolve(rep)}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Certify Resolve
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground font-mono">Completed</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <CreateRepairTicketModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        asset={selectedAsset}
        allAssets={assets}
        onSaveTicket={handleSaveTicket}
      />

      <ResolveRepairModal
        open={resolveModalOpen}
        onOpenChange={setResolveModalOpen}
        ticket={selectedTicket}
        asset={selectedAsset}
        onResolveTicket={handleResolveTicket}
      />
    </div>
  );
}
