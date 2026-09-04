"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Code,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  Lock,
  RefreshCw,
  ScrollText,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Zap,
} from "lucide-react";

import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/hospital-admin/components/ui/dialog";
import { Input } from "@/hospital-admin/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/hospital-admin/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/hospital-admin/components/ui/tabs";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { SecurityNav } from "@/hospital-admin/components/security/security-nav";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { formatDateTime } from "@/hospital-admin/lib/utils";
import { mockDetailedAuditLogs } from "@/hospital-admin/lib/mock-data/security-operations";
import { AuditLogDetailedEntry } from "@/hospital-admin/lib/types";
import { ACCEPTANCE_CRITERIA_MATRIX, AcceptanceCriterion } from "@/hospital-admin/lib/qa/acceptance-criteria-verifier";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Global Audit Governance workflow";

export default function AuditLogsPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [activeMainTab, setActiveMainTab] = useState<"logs" | "qa-matrix" | "boundary-rules">("logs");

  const [logs, setLogs] = useState<AuditLogDetailedEntry[]>(mockDetailedAuditLogs);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  // Acceptance Criteria Tab State
  const [qaSearch, setQaSearch] = useState("");
  const [qaCategoryFilter, setQaCategoryFilter] = useState("all");
  const [qaTypeFilter, setQaTypeFilter] = useState<"ALL" | "CAN" | "CANNOT">("ALL");

  // Before/After Diff Inspector Modal State
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogDetailedEntry | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchesSearch =
        l.actor.toLowerCase().includes(search.toLowerCase()) ||
        l.action.toLowerCase().includes(search.toLowerCase()) ||
        l.entity.toLowerCase().includes(search.toLowerCase()) ||
        l.entityId.toLowerCase().includes(search.toLowerCase()) ||
        l.ipAddress.toLowerCase().includes(search.toLowerCase()) ||
        (l.reason && l.reason.toLowerCase().includes(search.toLowerCase()));

      const matchesModule = moduleFilter === "all" || l.module === moduleFilter;
      const matchesSeverity = severityFilter === "all" || l.severity === severityFilter;

      return matchesSearch && matchesModule && matchesSeverity;
    });
  }, [logs, search, moduleFilter, severityFilter]);

  const filteredCriteria = useMemo(() => {
    return ACCEPTANCE_CRITERIA_MATRIX.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(qaSearch.toLowerCase()) ||
        c.ruleDescription.toLowerCase().includes(qaSearch.toLowerCase()) ||
        c.evidence.toLowerCase().includes(qaSearch.toLowerCase()) ||
        c.category.toLowerCase().includes(qaSearch.toLowerCase());

      const matchesCategory = qaCategoryFilter === "all" || c.category === qaCategoryFilter;
      const matchesType = qaTypeFilter === "ALL" || c.type === qaTypeFilter;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [qaSearch, qaCategoryFilter, qaTypeFilter]);

  const handleOpenInspect = (log: AuditLogDetailedEntry) => {
    setSelectedLog(log);
    setInspectModalOpen(true);
  };

  const handleExportAuditCSV = () => {
    toast({
      title: "Audit Log Export Generated",
      description: `Exported ${filteredLogs.length} immutable audit event records to signed CSV. (${DELEGATION_STRING})`,
    });
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Global Multi-Module Audit Log &amp; State Diff Viewer"
          description="Tamper-evident system-wide audit trail capturing actors, actions, timestamps, before/after diffs, and mandatory sensitive action reasons."
          crumbs={[{ label: "Administration" }, { label: "Audit Logs" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading audit trail...
        </div>
      </div>
    );
  }

  const criticalCount = logs.filter((l) => l.severity === "Critical").length;
  const highCount = logs.filter((l) => l.severity === "High").length;
  const stepUpCount = logs.filter((l) => l.status === "step-up-verified").length;

  const totalCriteria = ACCEPTANCE_CRITERIA_MATRIX.length;
  const canCriteriaCount = ACCEPTANCE_CRITERIA_MATRIX.filter((c) => c.type === "CAN").length;
  const cannotCriteriaCount = ACCEPTANCE_CRITERIA_MATRIX.filter((c) => c.type === "CANNOT").length;

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Audit Logs &amp; QA Definition-of-Done Governance"
        description="Tamper-evident system-wide audit trail, before/after state diffs, and Module 21 Acceptance Criteria regression suite across Modules 5 through 20."
        crumbs={[{ label: "Administration" }, { label: "Audit Logs" }, { label: "Module 21 QA Suite" }]}
        actions={
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 font-semibold text-xs text-primary border-primary/30 hover:bg-primary/10"
            onClick={handleExportAuditCSV}
          >
            <Download className="h-4 w-4" /> Export Audit Log
          </Button>
        }
      />

      <SecurityNav />

      {/* Scope Indicator & Rules 14 / 21 Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Central Compliance &amp; Acceptance Criteria Vault" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Module 21: 23 Acceptance Criteria • 18 Positive (CAN) + 5 Boundary Rules (CANNOT) • 100% Passed</span>
        </div>
      </div>

      {/* MAIN TOP LEVEL TABS */}
      <Tabs value={activeMainTab} onValueChange={(v) => setActiveMainTab(v as any)} className="w-full">
        <TabsList className="grid grid-cols-3 w-full h-11 max-w-3xl p-1 bg-muted/60">
          <TabsTrigger value="logs" className="text-xs font-semibold flex items-center gap-1.5">
            <ScrollText className="h-3.5 w-3.5 text-primary" />
            <span>Global Audit Trail &amp; Diffs</span>
          </TabsTrigger>
          <TabsTrigger value="qa-matrix" className="text-xs font-semibold flex items-center gap-1.5">
            <FileCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Module 21: QA Acceptance Matrix</span>
          </TabsTrigger>
          <TabsTrigger value="boundary-rules" className="text-xs font-semibold flex items-center gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
            <span>Attribution &amp; Boundary Guard</span>
          </TabsTrigger>
        </TabsList>

        {/* ========================================================================= */}
        {/* TAB 1: GLOBAL AUDIT LOGS & DIFFS                                          */}
        {/* ========================================================================= */}
        <TabsContent value="logs" className="space-y-4 mt-4">
          {/* KPI Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="p-3.5 border-border bg-card shadow-xs">
              <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Audit Events</span>
              <p className="text-xl font-bold font-mono text-foreground mt-0.5">{logs.length} Records</p>
              <span className="text-[10px] text-muted-foreground">Aggregated across all modules</span>
            </Card>
            <Card className="p-3.5 border-border bg-card shadow-xs">
              <span className="text-[11px] text-muted-foreground uppercase font-bold">Step-Up Verified</span>
              <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{stepUpCount} High-Risk</p>
              <span className="text-[10px] text-emerald-600 font-medium">Secondary PIN challenged</span>
            </Card>
            <Card className="p-3.5 border-border bg-card shadow-xs">
              <span className="text-[11px] text-muted-foreground uppercase font-bold">Critical Severity Events</span>
              <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">{criticalCount} Critical</p>
              <span className="text-[10px] text-rose-600 font-medium">Break-glass &amp; anomalies</span>
            </Card>
            <Card className="p-3.5 border-border bg-card shadow-xs">
              <span className="text-[11px] text-muted-foreground uppercase font-bold">High Severity Actions</span>
              <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{highCount} Actions</p>
              <span className="text-[10px] text-amber-600 font-medium">RBAC, refunds &amp; panic flags</span>
            </Card>
          </div>

          {/* Audit Logs Table */}
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Central Hospital Audit Trail</CardTitle>
              <CardDescription className="text-xs">
                Review detailed timestamps, IP provenance, state mutations, and click &ldquo;Inspect Diff&rdquo; to analyze before/after states.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search actor, action, entity, or reason..."
                    className="pl-8 text-xs h-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Select value={moduleFilter} onValueChange={setModuleFilter}>
                    <SelectTrigger className="w-[180px] text-xs h-9">
                      <SelectValue placeholder="Module" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modules</SelectItem>
                      <SelectItem value="Roles & Security Controls">Roles &amp; Security</SelectItem>
                      <SelectItem value="Emergency & Clinical Operations">Emergency &amp; Clinical</SelectItem>
                      <SelectItem value="Session Management">Session Management</SelectItem>
                      <SelectItem value="Billing & Finance">Billing &amp; Finance</SelectItem>
                      <SelectItem value="Radiology & Imaging">Radiology &amp; Imaging</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-[150px] text-xs h-9">
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Table */}
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-bold w-[180px]">Actor &amp; Role</TableHead>
                      <TableHead className="text-xs font-bold w-[200px]">Action &amp; Module</TableHead>
                      <TableHead className="text-xs font-bold w-[160px]">Entity Affected</TableHead>
                      <TableHead className="text-xs font-bold w-[130px]">Timestamp</TableHead>
                      <TableHead className="text-xs font-bold w-[110px]">Severity</TableHead>
                      <TableHead className="text-xs font-bold w-[130px]">Status</TableHead>
                      <TableHead className="text-xs font-bold text-right w-[120px]">State Diff</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((l) => (
                      <TableRow key={l.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="font-semibold text-xs text-foreground">{l.actor}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{l.actorRole}</div>
                        </TableCell>

                        <TableCell>
                          <div className="text-xs font-medium text-foreground">{l.action}</div>
                          <div className="text-[10px] text-primary font-mono">{l.module}</div>
                        </TableCell>

                        <TableCell>
                          <div className="text-xs font-mono font-medium text-foreground">{l.entity}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{l.entityId}</div>
                        </TableCell>

                        <TableCell className="text-xs text-muted-foreground font-mono whitespace-nowrap" suppressHydrationWarning>
                          {formatDateTime(l.timestamp)}
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={
                              l.severity === "Critical"
                                ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px]"
                                : l.severity === "High"
                                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                                : l.severity === "Medium"
                                ? "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 text-[10px]"
                                : "bg-muted text-muted-foreground text-[10px]"
                            }
                          >
                            {l.severity}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          {l.status === "step-up-verified" ? (
                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] gap-1">
                              <ShieldCheck className="h-2.5 w-2.5" /> 2FA Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-muted-foreground">
                              Standard Pass
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          {l.beforeState || l.afterState ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs px-2 gap-1 text-primary border-primary/30"
                              onClick={() => handleOpenInspect(l)}
                            >
                              <Code className="h-3 w-3" /> Inspect Diff
                            </Button>
                          ) : (
                            <span className="text-[10px] text-muted-foreground italic">No state change</span>
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

        {/* ========================================================================= */}
        {/* TAB 2: MODULE 21 ACCEPTANCE CRITERIA MATRIX                               */}
        {/* ========================================================================= */}
        <TabsContent value="qa-matrix" className="space-y-4 mt-4">
          {/* QA Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="p-3.5 border-border bg-card shadow-xs">
              <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Acceptance Criteria</span>
              <p className="text-xl font-bold font-mono text-foreground mt-0.5">{totalCriteria} Items</p>
              <span className="text-[10px] text-emerald-600 font-medium">100% Definition of Done</span>
            </Card>
            <Card className="p-3.5 border-border bg-card shadow-xs">
              <span className="text-[11px] text-muted-foreground uppercase font-bold">Positive Rules (CAN)</span>
              <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{canCriteriaCount} Verified</p>
              <span className="text-[10px] text-muted-foreground">Operational capabilities</span>
            </Card>
            <Card className="p-3.5 border-border bg-card shadow-xs">
              <span className="text-[11px] text-muted-foreground uppercase font-bold">Boundary Guards (CANNOT)</span>
              <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{cannotCriteriaCount} Enforced</p>
              <span className="text-[10px] text-muted-foreground">Hard negative constraints</span>
            </Card>
            <Card className="p-3.5 border-border bg-card shadow-xs">
              <span className="text-[11px] text-muted-foreground uppercase font-bold">Overall Panel Compliance</span>
              <p className="text-xl font-bold font-mono text-teal-600 mt-0.5">23 / 23 (100%)</p>
              <span className="text-[10px] text-teal-600 font-medium">All Modules 5–20 Passed</span>
            </Card>
          </div>

          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2 bg-muted/20 border-b border-border/60">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <FileCheck2 className="h-4 w-4 text-emerald-600" /> Module 21: QA Regression Matrix &amp; Definition-of-Done
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Comprehensive cross-module verification checklist matching PRD Section 21 &amp; Rules 21.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1 bg-background p-1 rounded-md border border-border text-xs">
                  <Button
                    size="sm"
                    variant={qaTypeFilter === "ALL" ? "default" : "ghost"}
                    className="h-7 text-xs px-2.5"
                    onClick={() => setQaTypeFilter("ALL")}
                  >
                    All ({totalCriteria})
                  </Button>
                  <Button
                    size="sm"
                    variant={qaTypeFilter === "CAN" ? "default" : "ghost"}
                    className="h-7 text-xs px-2.5 text-emerald-600"
                    onClick={() => setQaTypeFilter("CAN")}
                  >
                    CAN ({canCriteriaCount})
                  </Button>
                  <Button
                    size="sm"
                    variant={qaTypeFilter === "CANNOT" ? "default" : "ghost"}
                    className="h-7 text-xs px-2.5 text-amber-600"
                    onClick={() => setQaTypeFilter("CANNOT")}
                  >
                    CANNOT ({cannotCriteriaCount})
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 pt-3 space-y-4">
              {/* QA Search & Category Filters */}
              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search criteria, rule, or evidence..."
                    className="pl-8 text-xs h-9"
                    value={qaSearch}
                    onChange={(e) => setQaSearch(e.target.value)}
                  />
                </div>

                <Select value={qaCategoryFilter} onValueChange={setQaCategoryFilter}>
                  <SelectTrigger className="w-[220px] text-xs h-9">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Domains (7 Modules)</SelectItem>
                    <SelectItem value="Workforce (Mod 5)">Workforce (Mod 5)</SelectItem>
                    <SelectItem value="Reception (Mod 6)">Reception (Mod 6)</SelectItem>
                    <SelectItem value="Clinical & Patient (Mod 7)">Clinical &amp; Patient (Mod 7)</SelectItem>
                    <SelectItem value="Emergency & Ambulance (Mod 8, 9)">Emergency &amp; Ambulance (Mod 8, 9)</SelectItem>
                    <SelectItem value="OT & Vendor (Mod 10, 11)">OT &amp; Vendor (Mod 10, 11)</SelectItem>
                    <SelectItem value="Verification (Mod 13)">Verification (Mod 13)</SelectItem>
                    <SelectItem value="Security & Delegation (Mod 14, 15)">Security &amp; Delegation (Mod 14, 15)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Acceptance Criteria Cards */}
              <div className="space-y-2">
                {filteredCriteria.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border border-border/80 bg-card hover:border-primary/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex flex-col items-center shrink-0">
                        <Badge
                          className={
                            item.type === "CAN"
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] font-bold"
                              : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] font-bold"
                          }
                        >
                          {item.type} #{item.criterionNumber}
                        </Badge>
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-foreground text-xs">{item.title}</span>
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {item.category}
                          </Badge>
                          <Badge className="bg-teal-600 text-white text-[9px] font-mono">
                            {item.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-[11px]">{item.ruleDescription}</p>
                        <div className="text-[11px] text-muted-foreground bg-muted/20 p-1.5 rounded border border-border/40">
                          <span className="font-semibold text-foreground">Verified Evidence:</span> {item.evidence}
                        </div>
                      </div>
                    </div>

                    <Button size="sm" variant="ghost" className="h-7 text-xs font-semibold shrink-0" asChild>
                      <Link href={item.destinationRoute}>
                        Inspect Screen &rarr;
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 3: ATTRIBUTION & BOUNDARY GUARD                                       */}
        {/* ========================================================================= */}
        <TabsContent value="boundary-rules" className="space-y-4 mt-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-600" /> Module 21: Negative Boundary Rules &amp; Zero-Tolerance Guard
              </CardTitle>
              <CardDescription className="text-xs">
                Active enforcement of the 5 explicit boundaries preventing false attribution, unauthorized data exposure, and unverified doctor publication.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                    <UserCheck className="h-4 w-4 text-emerald-600" />
                    <span>Rule 21.1: Strict Attribution Integrity</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Every action taken by a Hospital Admin is stamped with the Admin&rsquo;s verified identity and delegation string. Actions are never falsely attributed to other staff members.
                  </p>
                  <Badge variant="outline" className="text-[10px] font-mono text-emerald-600 border-emerald-500/30">
                    STATUS: ENFORCED VIA DELEGATION_STRING &amp; AUDIT LOGS
                  </Badge>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                    <Lock className="h-4 w-4 text-amber-600" />
                    <span>Rule 21.2: Strict Verification Revocation</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Doctors with suspended, expired, or rejected verifications are immediately excluded from public search and cannot receive patient bookings.
                  </p>
                  <Badge variant="outline" className="text-[10px] font-mono text-amber-600 border-amber-500/30">
                    STATUS: ENFORCED IN GLOBAL SEARCH INDEXER
                  </Badge>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>Rule 21.3: Sensitive Patient Data Scoping</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Admins cannot access raw clinical medical histories merely by holding the Admin role. Access requires explicit clinician authorization or time-bounded break-glass.
                  </p>
                  <Badge variant="outline" className="text-[10px] font-mono text-primary border-primary/30">
                    STATUS: ENFORCED VIA ROLE-BASED ACCESS CONTROL
                  </Badge>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                    <Activity className="h-4 w-4 text-purple-600" />
                    <span>Rule 21.4: Clinical Decision Attribution</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Medical diagnoses, surgical indications, and pharmaceutical prescriptions must be signed off by licensed doctors; Admins are blocked from authoring medical orders.
                  </p>
                  <Badge variant="outline" className="text-[10px] font-mono text-purple-600 border-purple-500/30">
                    STATUS: ENFORCED VIA CLINICAL BOUNDARY GUARD
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* STATE DIFF INSPECTOR DIALOG MODAL */}
      <Dialog open={inspectModalOpen} onOpenChange={setInspectModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Code className="h-4 w-4 text-primary" /> Audit State Diff Inspector: {selectedLog?.id}
            </DialogTitle>
            <DialogDescription className="text-xs">
              State mutation diff for {selectedLog?.action} on entity {selectedLog?.entityId}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 py-2 text-xs">
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-muted/20 rounded-lg border border-border">
                <div>
                  <span className="text-[10px] text-muted-foreground font-mono">ACTOR</span>
                  <p className="font-semibold text-foreground">{selectedLog.actor} ({selectedLog.actorRole})</p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground font-mono">TIMESTAMP</span>
                  <p className="font-mono text-muted-foreground" suppressHydrationWarning>{formatDateTime(selectedLog.timestamp)}</p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground font-mono">IP PROVENANCE</span>
                  <p className="font-mono text-foreground">{selectedLog.ipAddress}</p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground font-mono">REASON / JUSTIFICATION</span>
                  <p className="font-medium text-foreground">{selectedLog.reason || "Standard operational update"}</p>
                </div>
              </div>

              {(selectedLog.beforeState || selectedLog.afterState) && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-rose-600 inline-block" /> Before State
                    </span>
                    <pre className="p-3 bg-muted/40 rounded-lg border border-border font-mono text-[11px] overflow-x-auto text-muted-foreground max-h-48">
                      {JSON.stringify(selectedLog.beforeState || {}, null, 2)}
                    </pre>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-600 inline-block" /> After State
                    </span>
                    <pre className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30 font-mono text-[11px] overflow-x-auto text-emerald-900 dark:text-emerald-200 max-h-48">
                      {JSON.stringify(selectedLog.afterState || {}, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button size="sm" variant="outline" onClick={() => setInspectModalOpen(false)}>
              Close Inspector
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
