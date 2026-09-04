"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  History,
  CheckCircle2,
  AlertTriangle,
  ArrowLeftRight,
  ShieldCheck,
  Trash2,
  Calendar,
  Clock,
  Wrench,
  Cpu,
  Search,
  Filter,
  Printer,
  FileSpreadsheet,
  Download,
  Building,
  User,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { AssetsNav } from "@/hospital-admin/components/assets/assets-nav";
import { mockAssetHistoryEvents } from "@/hospital-admin/lib/mock-data/assets-extended";
import { AssetHistoryEvent, AssetEventType } from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";

export default function HospitalAssetHistoryPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [events, setEvents] = useState<AssetHistoryEvent[]>(mockAssetHistoryEvents);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredEvents = useMemo(() => {
    return events
      .filter((evt) => {
        const matchesSearch =
          evt.assetCode.toLowerCase().includes(search.toLowerCase()) ||
          evt.assetName.toLowerCase().includes(search.toLowerCase()) ||
          evt.title.toLowerCase().includes(search.toLowerCase()) ||
          evt.details.toLowerCase().includes(search.toLowerCase()) ||
          evt.actor.toLowerCase().includes(search.toLowerCase()) ||
          (evt.referenceId && evt.referenceId.toLowerCase().includes(search.toLowerCase()));

        const matchesType = typeFilter === "all" || evt.eventType === typeFilter;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [events, search, typeFilter]);

  const getEventBadge = (type: AssetEventType) => {
    switch (type) {
      case "Registration":
        return <Badge className="bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 text-[10px]">Registration</Badge>;
      case "PPM Certified":
        return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]">PPM Certified</Badge>;
      case "Breakdown Reported":
        return <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px]">Breakdown Reported</Badge>;
      case "Repair Completed":
        return <Badge className="bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 text-[10px]">Repair Completed</Badge>;
      case "Allocation / Transfer":
        return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]">Allocation / Transfer</Badge>;
      case "Warranty Renewed":
        return <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30 text-[10px]">Warranty Renewed</Badge>;
      case "Decommissioned":
        return <Badge className="bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30 text-[10px]">Decommissioned</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{type}</Badge>;
    }
  };

  const getEventIcon = (type: AssetEventType) => {
    switch (type) {
      case "Registration":
        return <Cpu className="h-4 w-4 text-cyan-600" />;
      case "PPM Certified":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case "Breakdown Reported":
        return <AlertTriangle className="h-4 w-4 text-rose-600" />;
      case "Repair Completed":
        return <Wrench className="h-4 w-4 text-indigo-600" />;
      case "Allocation / Transfer":
        return <ArrowLeftRight className="h-4 w-4 text-amber-600" />;
      case "Warranty Renewed":
        return <ShieldCheck className="h-4 w-4 text-purple-600" />;
      case "Decommissioned":
        return <Trash2 className="h-4 w-4 text-slate-600" />;
      default:
        return <History className="h-4 w-4 text-primary" />;
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      {/* Print Header */}
      <div className="hidden print:block mb-4 border-b pb-3 border-slate-300">
        <h1 className="text-base font-bold text-slate-900">QLYNO SUPER SPECIALTY HOSPITAL</h1>
        <p className="text-[11px] text-slate-600">Department of Biomedical Engineering &amp; Capital Assets</p>
        <h2 className="text-xs font-bold text-slate-800 mt-1 uppercase">Comprehensive Asset Lifecycle Audit Log</h2>
      </div>

      <div className="print:hidden">
        <PageHeader
          title="Hospital Asset Lifecycle Audit Timeline"
          description="Unified, append-only chronological history aggregating Registration, PPM calibrations, repair tickets, and inter-department transfers."
          crumbs={[{ label: "Supply & Assets" }, { label: "Assets" }, { label: "Asset History" }]}
          actions={
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 font-semibold text-xs"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4" /> Print Audit Report
            </Button>
          }
        />
      </div>

      <div className="print:hidden">
        <AssetsNav />
      </div>

      <div className="print:hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Central Asset Governance &amp; Audit Engine" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Rule F20-CAN-24: Aggregated across Registration, PPM, Repairs, and Allocations</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="print:hidden grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Lifecycle Events</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{events.length} Stamped</p>
          <span className="text-[10px] text-muted-foreground">Immutable audit logs</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">PPM Servicing Events</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
            {events.filter((e) => e.eventType === "PPM Certified").length} Calibrations
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Quality certified</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Repair Tickets Logged</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">
            {events.filter((e) => e.eventType === "Breakdown Reported" || e.eventType === "Repair Completed").length} Events
          </p>
          <span className="text-[10px] text-rose-600 font-medium">Downtime documented</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Allocations &amp; Loans</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">
            {events.filter((e) => e.eventType === "Allocation / Transfer").length} Dispatches
          </p>
          <span className="text-[10px] text-amber-600 font-medium">Inter-ward traceability</span>
        </Card>
      </div>

      {/* Filter and Timeline Card */}
      <Card className="border-border shadow-xs print:border-none print:shadow-none">
        <CardHeader className="p-4 pb-2 print:hidden">
          <CardTitle className="text-sm font-bold">Chronological Asset History Ledger</CardTitle>
          <CardDescription className="text-xs">
            Review every logged maintenance, repair, and transfer event across all hospital equipment.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="print:hidden flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search machine, event, actor, ref #..."
                className="pl-8 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[190px] text-xs h-9">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Event Types</SelectItem>
                  <SelectItem value="Registration">Registration</SelectItem>
                  <SelectItem value="PPM Certified">PPM Certified</SelectItem>
                  <SelectItem value="Breakdown Reported">Breakdown Reported</SelectItem>
                  <SelectItem value="Repair Completed">Repair Completed</SelectItem>
                  <SelectItem value="Allocation / Transfer">Allocation / Transfer</SelectItem>
                  <SelectItem value="Warranty Renewed">Warranty Renewed</SelectItem>
                  <SelectItem value="Decommissioned">Decommissioned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Timeline Feed */}
          <div className="relative border-l-2 border-border ml-5 pl-7 space-y-4 py-2">
            {filteredEvents.map((evt) => (
              <div key={evt.id} className="relative group">
                {/* Timeline Dot Icon Centered on Vertical Line */}
                <div className="absolute -left-[43px] top-3 h-7 w-7 rounded-full bg-background border-2 border-border flex items-center justify-center shadow-xs shrink-0 z-10">
                  {getEventIcon(evt.eventType)}
                </div>

                <div className="p-4 rounded-xl border border-border/80 bg-card hover:bg-muted/20 transition-all shadow-xs space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-foreground">{evt.title}</span>
                      <span className="font-mono text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                        [{evt.assetCode}] {evt.assetName}
                      </span>
                    </div>
                    <div className="shrink-0">{getEventBadge(evt.eventType)}</div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">{evt.details}</p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50 text-[10px] text-muted-foreground font-mono">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="font-semibold text-foreground">{evt.actor}</span>
                      {evt.referenceId && (
                        <span className="text-primary font-semibold ml-2">Ref: {evt.referenceId}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0" suppressHydrationWarning>
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        {new Date(evt.timestamp).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        {new Date(evt.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
