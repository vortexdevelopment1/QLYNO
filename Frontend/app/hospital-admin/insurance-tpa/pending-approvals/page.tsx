"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Filter,
  Hourglass,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { InsuranceNav } from "@/hospital-admin/components/insurance-tpa/InsuranceNav";
import { mockExtendedInsuranceClaims } from "@/hospital-admin/lib/mock-data/insurance-tpa-extended";
import { InsuranceClaim, TpaProvider } from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { formatDateTime, formatDate, formatCurrency, cn } from "@/hospital-admin/lib/utils";

export default function PendingApprovalsPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [claims, setClaims] = useState<InsuranceClaim[]>(mockExtendedInsuranceClaims);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pending at ANY stage: Submitted, Pre-authorized (awaiting final decision), Under Review
  const pendingClaims = useMemo(() => {
    return claims.filter((c) => c.status === "Submitted" || c.status === "Pre-authorized" || c.status === "Under Review");
  }, [claims]);

  const filtered = useMemo(() => {
    return pendingClaims.filter((c) => {
      const matchSearch =
        c.claimNo.toLowerCase().includes(search.toLowerCase()) ||
        c.patientName.toLowerCase().includes(search.toLowerCase()) ||
        c.policyNo.toLowerCase().includes(search.toLowerCase()) ||
        c.tpaProvider.toLowerCase().includes(search.toLowerCase());

      const matchStage = stageFilter === "all" || c.status === stageFilter;
      return matchSearch && matchStage;
    });
  }, [pendingClaims, search, stageFilter]);

  const totalPendingAmount = useMemo(
    () => pendingClaims.reduce((sum, c) => sum + c.claimAmount, 0),
    [pendingClaims]
  );

  const underReviewCount = useMemo(
    () => pendingClaims.filter((c) => c.status === "Under Review").length,
    [pendingClaims]
  );

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Pending Approvals &amp; Multi-Stage Insurer Queue"
          description="Comprehensive pipeline of all claims awaiting decisions at initial pre-authorization, final adjudication, or query review."
          crumbs={[{ label: "Finance" }, { label: "Insurance / TPA", href: "/hospital-admin/insurance-tpa" }, { label: "Pending Approvals" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading pending approvals queue...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Pending Approvals &amp; Multi-Stage Insurer Queue"
        description="Comprehensive pipeline of all claims awaiting decisions at initial pre-authorization, final adjudication, or query review."
        crumbs={[{ label: "Finance" }, { label: "Insurance / TPA", href: "/hospital-admin/insurance-tpa" }, { label: "Pending Approvals" }]}
        actions={
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs font-semibold gap-1.5"
            onClick={() => {
              toast({
                title: "TPA Portals Polled",
                description: "Synchronized claim adjudication statuses from 8 TPA API webhooks.",
              });
            }}
          >
            <RefreshCw className="h-3.5 w-3.5 text-primary" /> Sync TPA Decision Status
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Adjudication Pipeline Monitor" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
          <span>Claims Pipeline • Covers Submitted, Pre-authorized, and Under Review query claims</span>
        </div>
      </div>

      <InsuranceNav />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Awaiting Decision</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{pendingClaims.length} Claims</p>
          <span className="text-[10px] text-muted-foreground">Across All 3 Decision Stages</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Pipeline Value Pending</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">{formatCurrency(totalPendingAmount)}</p>
          <span className="text-[10px] text-muted-foreground">Awaiting Final Settlement</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Under Expedited Review</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{underReviewCount} Claims</p>
          <span className="text-[10px] text-primary font-medium">Post-Dispute Resubmission</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">SLA Breach Risk (&gt;48h)</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">0 Claims</p>
          <span className="text-[10px] text-emerald-600 font-medium">100% Within TPA SLA</span>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Hourglass className="h-4 w-4 text-amber-600" /> Insurer Adjudication Pipeline
            </CardTitle>
            <CardDescription className="text-xs">
              Live tracking of claims currently under scrutiny with external TPA medical review desks.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search pending claims..."
                className="pl-8 text-xs h-8 w-60"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border">
              {["all", "Submitted", "Pre-authorized", "Under Review"].map((stage) => (
                <button
                  key={stage}
                  onClick={() => setStageFilter(stage)}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded-md font-medium transition-all",
                    stageFilter === stage
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {stage === "all" ? "All Stages" : stage}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2">
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Claim #</TableHead>
                  <TableHead className="text-xs font-bold">Patient &amp; UHID</TableHead>
                  <TableHead className="text-xs font-bold">TPA Provider</TableHead>
                  <TableHead className="text-xs font-bold text-right">Claim Amount</TableHead>
                  <TableHead className="text-xs font-bold text-center">Pipeline Stage</TableHead>
                  <TableHead className="text-xs font-bold">Scrutiny / Query Notes</TableHead>
                  <TableHead className="text-xs font-bold">Lodged At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id} className="hover:bg-muted/30 text-xs">
                    <TableCell className="font-mono font-bold">{c.claimNo}</TableCell>
                    <TableCell>
                      <div className="font-semibold">{c.patientName}</div>
                      <span className="text-[10px] font-mono text-muted-foreground">{c.patientId}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] bg-muted/30">
                        {c.tpaProvider}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">
                      {formatCurrency(c.claimAmount)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={cn(
                          "text-[9px]",
                          c.status === "Pre-authorized"
                            ? "bg-primary/15 text-primary border-primary/30"
                            : c.status === "Under Review"
                            ? "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                        )}
                      >
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-[11px] max-w-xs truncate">
                      {c.queryNotes || "Under initial medical officer scrutiny."}
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      {formatDateTime(c.submissionDate)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
