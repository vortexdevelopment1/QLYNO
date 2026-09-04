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
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  XCircle,
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
import { Label } from "@/hospital-admin/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { InsuranceNav } from "@/hospital-admin/components/insurance-tpa/InsuranceNav";
import { mockExtendedInsuranceClaims } from "@/hospital-admin/lib/mock-data/insurance-tpa-extended";
import { InsuranceClaim } from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { formatDateTime, formatDate, formatCurrency, cn } from "@/hospital-admin/lib/utils";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Dispute Resubmission workflow";

export default function RejectedClaimsPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [claims, setClaims] = useState<InsuranceClaim[]>(mockExtendedInsuranceClaims);
  const [search, setSearch] = useState("");

  // Resubmission Modal State
  const [selectedClaim, setSelectedClaim] = useState<InsuranceClaim | null>(null);
  const [resubmitModalOpen, setResubmitModalOpen] = useState(false);
  const [rectificationNotes, setRectificationNotes] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const rejectedClaims = useMemo(() => {
    return claims.filter((c) => c.status === "Rejected");
  }, [claims]);

  const filtered = useMemo(() => {
    return rejectedClaims.filter((c) => {
      return (
        c.claimNo.toLowerCase().includes(search.toLowerCase()) ||
        c.patientName.toLowerCase().includes(search.toLowerCase()) ||
        c.policyNo.toLowerCase().includes(search.toLowerCase()) ||
        c.tpaProvider.toLowerCase().includes(search.toLowerCase()) ||
        (c.rejectionReason && c.rejectionReason.toLowerCase().includes(search.toLowerCase()))
      );
    });
  }, [rejectedClaims, search]);

  const totalRejectedValue = useMemo(
    () => rejectedClaims.reduce((sum, c) => sum + c.claimAmount, 0),
    [rejectedClaims]
  );

  const handleOpenResubmit = (claim: InsuranceClaim) => {
    setSelectedClaim(claim);
    setRectificationNotes(claim.queryNotes || "Attached attending physician statement and clinical summary.");
    setResubmitModalOpen(true);
  };

  const handleExecuteResubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim) return;

    setClaims((prev) =>
      prev.map((c) =>
        c.id === selectedClaim.id
          ? {
              ...c,
              status: "Under Review",
              queryNotes: `Resubmitted: ${rectificationNotes}`,
              rejectionReason: undefined,
            }
          : c
      )
    );

    toast({
      title: "Dispute Resubmitted Successfully",
      description: `Claim ${selectedClaim.claimNo} resubmitted to ${selectedClaim.tpaProvider} under expedited review. (${DELEGATION_STRING})`,
    });
    setResubmitModalOpen(false);
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Rejected Claims &amp; TPA Query Resubmission"
          description="Dedicated queue for rejected claims, query remediation, clinical rectification capture, and expedited re-review."
          crumbs={[{ label: "Finance" }, { label: "Insurance / TPA", href: "/hospital-admin/insurance-tpa" }, { label: "Rejected" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading rejected claims...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Rejected Claims &amp; TPA Query Resubmission"
        description="Dedicated queue for rejected claims, query remediation, clinical rectification capture, and expedited re-review."
        crumbs={[{ label: "Finance" }, { label: "Insurance / TPA", href: "/hospital-admin/insurance-tpa" }, { label: "Rejected" }]}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Dispute Remediation &amp; Query Desk" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
          <span>Grievance &amp; Appeals • Captures mandatory clinical justifications; transitions Rejected ➔ Under Review</span>
        </div>
      </div>

      <InsuranceNav />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Rejected / Query Claims</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">{rejectedClaims.length} Action Needed</p>
          <span className="text-[10px] text-rose-600 font-medium">1-Click Clinical Resubmit</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Disputed Revenue At Risk</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">{formatCurrency(totalRejectedValue)}</p>
          <span className="text-[10px] text-muted-foreground">Pending Rectification</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Historical Recovery Rate</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">88.4%</p>
          <span className="text-[10px] text-emerald-600 font-medium">Reversal on First Appeal</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Average Appeal Turnaround</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">24 Hours</p>
          <span className="text-[10px] text-muted-foreground">Expedited Resubmission</span>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <XCircle className="h-4 w-4 text-rose-600" /> Rejected &amp; Disputed Claims Queue
            </CardTitle>
            <CardDescription className="text-xs">
              Review exact TPA queries, append physician justifications, and resubmit directly to insurance scrutiny desks.
            </CardDescription>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search query, reason, claim #..."
              className="pl-8 text-xs h-8 w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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
                  <TableHead className="text-xs font-bold">TPA Rejection Query</TableHead>
                  <TableHead className="text-xs font-bold text-right">Disputed Amount</TableHead>
                  <TableHead className="text-xs font-bold text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-xs text-muted-foreground">
                      No rejected claims currently require action. Zero backlogs!
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((c) => (
                    <TableRow key={c.id} className="hover:bg-muted/30 text-xs">
                      <TableCell className="font-mono font-bold text-rose-600">{c.claimNo}</TableCell>

                      <TableCell>
                        <div className="font-semibold">{c.patientName}</div>
                        <span className="text-[10px] font-mono text-muted-foreground">{c.patientId}</span>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-[10px] bg-muted/30">
                          {c.tpaProvider}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <p className="text-[11px] text-foreground font-medium">{c.rejectionReason}</p>
                        <span className="text-[10px] text-muted-foreground block mt-0.5">
                          Query: {c.queryNotes}
                        </span>
                      </TableCell>

                      <TableCell className="text-right font-mono font-bold text-rose-600">
                        {formatCurrency(c.claimAmount)}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          className="h-7 text-[11px] font-semibold bg-rose-600 hover:bg-rose-700 text-white"
                          onClick={() => handleOpenResubmit(c)}
                        >
                          Resubmit Query
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* DISPUTE RESUBMISSION MODAL */}
      <Dialog open={resubmitModalOpen} onOpenChange={setResubmitModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleExecuteResubmission}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-rose-600">
                <XCircle className="h-5 w-5 text-rose-600" /> Resubmit Query / Dispute Rejection
              </DialogTitle>
              <DialogDescription className="text-xs">
                Provide clinical rectification and document justifications for <strong>{selectedClaim?.claimNo}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div className="p-3 bg-rose-500/5 rounded-lg border border-rose-500/20 text-rose-800 dark:text-rose-300">
                <span className="font-bold block">TPA Query / Rejection Reason:</span>
                <p className="mt-0.5 text-[11px] leading-relaxed">
                  {selectedClaim?.rejectionReason || selectedClaim?.queryNotes || "Missing clinical justifications."}
                </p>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="resub-notes">Rectification &amp; Medical Justification Notes *</Label>
                <Input
                  id="resub-notes"
                  required
                  placeholder="e.g. Attached 2-year previous medical records history and surgeon sign-off."
                  value={rectificationNotes}
                  onChange={(e) => setRectificationNotes(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setResubmitModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground">
                Resubmit to TPA
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
