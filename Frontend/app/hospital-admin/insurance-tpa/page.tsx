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
  Layers,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { InsuranceNav } from "@/hospital-admin/components/insurance-tpa/InsuranceNav";
import { mockExtendedInsuranceClaims } from "@/hospital-admin/lib/mock-data/insurance-tpa-extended";
import { InsuranceClaim, TpaProvider, ClaimStatus } from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { formatDateTime, formatDate, formatCurrency, cn } from "@/hospital-admin/lib/utils";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Insurance-TPA Claims workflow";

export default function InsuranceTPAPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [claims, setClaims] = useState<InsuranceClaim[]>(mockExtendedInsuranceClaims);
  const [search, setSearch] = useState("");
  const [tpaFilter, setTpaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Resubmission Modal State (Section 12 Edge Case)
  const [selectedClaim, setSelectedClaim] = useState<InsuranceClaim | null>(null);
  const [resubmitModalOpen, setResubmitModalOpen] = useState(false);
  const [rectificationNotes, setRectificationNotes] = useState("");

  // Details Modal State
  const [selectedClaimForDetails, setSelectedClaimForDetails] = useState<InsuranceClaim | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // New Pre-Auth Modal State
  const [preAuthModalOpen, setPreAuthModalOpen] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [policyNo, setPolicyNo] = useState("");
  const [tpaProvider, setTpaProvider] = useState<TpaProvider>("Star Health");
  const [claimAmount, setClaimAmount] = useState(150000);

  const handleOpenDetails = (claim: InsuranceClaim) => {
    setSelectedClaimForDetails(claim);
    setDetailsModalOpen(true);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredClaims = useMemo(() => {
    return claims.filter((c) => {
      const matchesSearch =
        c.claimNo.toLowerCase().includes(search.toLowerCase()) ||
        c.patientName.toLowerCase().includes(search.toLowerCase()) ||
        c.policyNo.toLowerCase().includes(search.toLowerCase()) ||
        c.tpaProvider.toLowerCase().includes(search.toLowerCase());
      const matchesTpa = tpaFilter === "all" || c.tpaProvider === tpaFilter;
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      return matchesSearch && matchesTpa && matchesStatus;
    });
  }, [claims, search, tpaFilter, statusFilter]);

  const totalClaimValue = useMemo(() => claims.reduce((sum, c) => sum + c.claimAmount, 0), [claims]);
  const totalApprovedValue = useMemo(() => claims.reduce((sum, c) => sum + c.approvedAmount, 0), [claims]);

  const handleOpenResubmit = (claim: InsuranceClaim) => {
    setSelectedClaim(claim);
    setRectificationNotes(claim.queryNotes || "Attached missing clinical summary and attending physician notes.");
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
      title: "Claim Query Resubmitted",
      description: `Claim ${selectedClaim.claimNo} resubmitted to ${selectedClaim.tpaProvider} under expedited review. (${DELEGATION_STRING})`,
    });
    setResubmitModalOpen(false);
  };

  const handleCreatePreAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const approved = Math.round(claimAmount * 0.85);
    const copay = claimAmount - approved;

    const newClaim: InsuranceClaim = {
      id: `clm_${Date.now()}`,
      claimNo: `CLM-2026-${tpaProvider.slice(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: patientId || "P-NEW",
      patientName: patientName || "New Inpatient",
      tpaProvider,
      policyNo,
      admissionDate: new Date().toISOString().split("T")[0],
      admissionType: "IPD",
      claimAmount,
      approvedAmount: approved,
      copayAmount: copay,
      status: "Pre-authorized",
      submissionDate: new Date().toISOString(),
      queryNotes: "Cashless initial pre-authorization generated via portal.",
    };

    setClaims([newClaim, ...claims]);
    toast({
      title: "Pre-Authorization Lodged",
      description: `${newClaim.claimNo} pre-authorized for ${formatCurrency(approved)} (85%). (${DELEGATION_STRING})`,
    });
    setPreAuthModalOpen(false);
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Insurance &amp; TPA Claims Desk"
          description="Cashless pre-authorizations, corporate insurance claims, dispute resubmission, and TPA settlement reconciliations."
          crumbs={[{ label: "Finance" }, { label: "Insurance / TPA" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading claims desk...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      {/* Page Header */}
      <PageHeader
        title="Insurance &amp; TPA Claims Desk"
        description="Cashless pre-authorizations, corporate insurance claims, dispute resubmission, and TPA settlement reconciliations."
        crumbs={[{ label: "Finance" }, { label: "Insurance / TPA" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="h-8 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground"
              onClick={() => setPreAuthModalOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" /> + New Pre-Authorization
            </Button>
          </div>
        }
      />

      {/* Scope Indicator & Integration Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Insurance Desk &amp; TPA Liaison Office" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-primary" />
          <span>Claims &amp; Billing Integration • Copay splits drive Billing; TPA bank remittances link directly into Payments</span>
        </div>
      </div>

      {/* Shared Sub-Navigation Bar */}
      <InsuranceNav />

      {/* Claims Health KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Claims Volume</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{claims.length} Lodged</p>
          <span className="text-[10px] text-muted-foreground">Across 8 TPAs &amp; Schemes</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Claimed Value</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">{formatCurrency(totalClaimValue)}</p>
          <span className="text-[10px] text-muted-foreground">Gross Inpatient / Daycare</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Approved / Settled Value</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{formatCurrency(totalApprovedValue)}</p>
          <span className="text-[10px] text-emerald-600 font-medium">91.4% Live Approval Ratio</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Queries &amp; Rejections</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">
            {claims.filter((c) => c.status === "Rejected").length} Action Needed
          </p>
          <span className="text-[10px] text-rose-600 font-medium">1-Click Clinical Resubmit</span>
        </Card>
      </div>

      {/* Main Claims Register Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Central Claims Registry
            </CardTitle>
            <CardDescription className="text-xs">
              Complete inventory of cashless insurance claims, pre-auth guarantees, and scheme settlements.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search claim #, patient, policy..."
                className="pl-8 text-xs h-8 w-60"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select value={tpaFilter} onValueChange={setTpaFilter}>
              <SelectTrigger className="h-8 text-xs w-36">
                <SelectValue placeholder="All TPAs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All TPAs</SelectItem>
                <SelectItem value="Star Health">Star Health</SelectItem>
                <SelectItem value="HDFC ERGO">HDFC ERGO</SelectItem>
                <SelectItem value="ICICI Lombard">ICICI Lombard</SelectItem>
                <SelectItem value="Medi Assist">Medi Assist</SelectItem>
                <SelectItem value="Vidal Health">Vidal Health</SelectItem>
                <SelectItem value="Care Health">Care Health</SelectItem>
                <SelectItem value="PM-JAY Scheme">PM-JAY Scheme</SelectItem>
                <SelectItem value="CGHS Scheme">CGHS Scheme</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 text-xs w-36">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pre-authorized">Pre-authorized</SelectItem>
                <SelectItem value="Submitted">Submitted</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Settled">Settled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2">
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold w-[140px]">Claim #</TableHead>
                  <TableHead className="text-xs font-bold w-[160px]">Patient &amp; UHID</TableHead>
                  <TableHead className="text-xs font-bold w-[150px]">TPA / Scheme Provider</TableHead>
                  <TableHead className="text-xs font-bold w-[140px]">Policy #</TableHead>
                  <TableHead className="text-xs font-bold text-right w-[110px]">Claimed</TableHead>
                  <TableHead className="text-xs font-bold text-right w-[110px]">Approved (85%)</TableHead>
                  <TableHead className="text-xs font-bold text-right w-[90px]">Copay (15%)</TableHead>
                  <TableHead className="text-xs font-bold text-center w-[120px]">Status</TableHead>
                  <TableHead className="text-xs font-bold text-right w-[110px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClaims.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center text-xs text-muted-foreground">
                      No claims found matching the active filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClaims.map((c) => (
                    <TableRow key={c.id} className="hover:bg-muted/30 transition-colors text-xs">
                      <TableCell className="font-mono font-bold text-foreground">
                        {c.claimNo}
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-foreground">{c.patientName}</div>
                        <span className="text-[10px] font-mono text-muted-foreground">{c.patientId}</span>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-medium bg-muted/40">
                          {c.tpaProvider}
                        </Badge>
                      </TableCell>

                      <TableCell className="font-mono text-muted-foreground">
                        {c.policyNo}
                      </TableCell>

                      <TableCell className="text-right font-mono font-medium">
                        {formatCurrency(c.claimAmount)}
                      </TableCell>

                      <TableCell className="text-right font-mono font-bold text-emerald-600">
                        {c.approvedAmount > 0 ? formatCurrency(c.approvedAmount) : "—"}
                      </TableCell>

                      <TableCell className="text-right font-mono text-amber-600">
                        {c.copayAmount > 0 ? formatCurrency(c.copayAmount) : "—"}
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          className={cn(
                            "text-[9px]",
                            c.status === "Approved" || c.status === "Settled"
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                              : c.status === "Pre-authorized"
                              ? "bg-primary/15 text-primary border-primary/30"
                              : c.status === "Under Review" || c.status === "Submitted"
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                              : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
                          )}
                        >
                          {c.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] font-semibold text-primary hover:bg-primary/10"
                            onClick={() => handleOpenDetails(c)}
                          >
                            <Eye className="h-3 w-3 mr-1" /> Details
                          </Button>
                          {c.status === "Rejected" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-7 text-[11px] font-semibold"
                              onClick={() => handleOpenResubmit(c)}
                            >
                              Resubmit
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* NEW PRE-AUTHORIZATION WIZARD MODAL */}
      <Dialog open={preAuthModalOpen} onOpenChange={setPreAuthModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreatePreAuth}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-primary">
                <ShieldCheck className="h-5 w-5 text-primary" /> New Cashless Pre-Authorization Request
              </DialogTitle>
              <DialogDescription className="text-xs">
                Initiate cashless pre-authorization guarantee. System auto-calculates 85% approved / 15% copay.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="pa-name">Patient Name *</Label>
                  <Input
                    id="pa-name"
                    required
                    placeholder="e.g. Ramesh Sharma"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                  />
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="pa-uhid">UHID / Patient ID *</Label>
                  <Input
                    id="pa-uhid"
                    required
                    placeholder="e.g. P-1001"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="pa-tpa">TPA Provider</Label>
                  <Select value={tpaProvider} onValueChange={(v: any) => setTpaProvider(v)}>
                    <SelectTrigger id="pa-tpa" className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Star Health">Star Health</SelectItem>
                      <SelectItem value="HDFC ERGO">HDFC ERGO</SelectItem>
                      <SelectItem value="ICICI Lombard">ICICI Lombard</SelectItem>
                      <SelectItem value="Medi Assist">Medi Assist</SelectItem>
                      <SelectItem value="Vidal Health">Vidal Health</SelectItem>
                      <SelectItem value="Care Health">Care Health</SelectItem>
                      <SelectItem value="PM-JAY Scheme">PM-JAY Scheme</SelectItem>
                      <SelectItem value="CGHS Scheme">CGHS Scheme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="pa-pol">Policy / Card # *</Label>
                  <Input
                    id="pa-pol"
                    required
                    placeholder="e.g. STAR-992104"
                    value={policyNo}
                    onChange={(e) => setPolicyNo(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="pa-amt">Estimated Procedure / Claim Amount (₹) *</Label>
                <Input
                  id="pa-amt"
                  type="number"
                  required
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(Number(e.target.value))}
                />
              </div>

              {/* Live 85/15 Auto Calculation Display */}
              <div className="p-3 bg-muted/30 rounded-lg border border-border space-y-1">
                <div className="flex justify-between text-muted-foreground">
                  <span>Auto-Calculated Approved (85%):</span>
                  <span className="font-mono font-bold text-emerald-600">
                    {formatCurrency(Math.round(claimAmount * 0.85))}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Mandatory Patient Copay (15%):</span>
                  <span className="font-mono font-bold text-amber-600">
                    {formatCurrency(claimAmount - Math.round(claimAmount * 0.85))}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setPreAuthModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Submit Pre-Authorization
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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

      {/* CLAIM DETAILS DIALOG MODAL */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-primary">
                <FileText className="h-5 w-5 text-primary" />
                Claim Dossier: {selectedClaimForDetails?.claimNo}
              </DialogTitle>
              <Badge
                className={cn(
                  "text-[10px] font-mono",
                  selectedClaimForDetails?.status === "Approved" || selectedClaimForDetails?.status === "Settled"
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                    : selectedClaimForDetails?.status === "Pre-authorized"
                    ? "bg-primary/15 text-primary border-primary/30"
                    : selectedClaimForDetails?.status === "Under Review" || selectedClaimForDetails?.status === "Submitted"
                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                    : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
                )}
              >
                {selectedClaimForDetails?.status}
              </Badge>
            </div>
            <DialogDescription className="text-xs">
              Complete administrative, financial, and clinical adjudication breakdown.
            </DialogDescription>
          </DialogHeader>

          {selectedClaimForDetails && (
            <div className="space-y-3 py-2 text-xs">
              {/* Patient & Policy Identity Block */}
              <div className="p-3 bg-muted/20 rounded-lg border border-border space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground text-[11px] block">Patient &amp; UHID:</span>
                    <span className="font-bold text-foreground">{selectedClaimForDetails.patientName}</span>
                    <span className="text-[10px] font-mono text-muted-foreground block">{selectedClaimForDetails.patientId}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px] block">TPA &amp; Policy #:</span>
                    <span className="font-bold text-foreground">{selectedClaimForDetails.tpaProvider}</span>
                    <span className="text-[10px] font-mono text-muted-foreground block">{selectedClaimForDetails.policyNo}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/50 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Admission Type:</span>{" "}
                    <span className="font-medium">{selectedClaimForDetails.admissionType || "IPD"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Admission Date:</span>{" "}
                    <span className="font-medium">{selectedClaimForDetails.admissionDate}</span>
                  </div>
                </div>
              </div>

              {/* Financial Breakdown (85 / 15 Split) */}
              <div className="p-3 bg-muted/20 rounded-lg border border-border space-y-1.5">
                <span className="font-bold text-foreground text-[11px] block">Financial Adjudication Breakup:</span>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2 rounded bg-card border border-border">
                    <span className="text-[10px] text-muted-foreground block">Gross Claim</span>
                    <span className="font-mono font-bold text-foreground">
                      {formatCurrency(selectedClaimForDetails.claimAmount)}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-emerald-500/5 border border-emerald-500/20">
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-300 block">TPA Share (85%)</span>
                    <span className="font-mono font-bold text-emerald-600">
                      {formatCurrency(selectedClaimForDetails.approvedAmount)}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-amber-500/5 border border-amber-500/20">
                    <span className="text-[10px] text-amber-700 dark:text-amber-300 block">Copay (15%)</span>
                    <span className="font-mono font-bold text-amber-600">
                      {formatCurrency(selectedClaimForDetails.copayAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Linked Records & UTR */}
              <div className="p-3 bg-muted/20 rounded-lg border border-border space-y-1 text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Linked Billing Invoice:</span>
                  {selectedClaimForDetails.linkedInvoiceId ? (
                    <Link href="/hospital-admin/billing" className="font-mono text-primary font-bold hover:underline">
                      {selectedClaimForDetails.linkedInvoiceId}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground font-mono">INV-PENDING-DISCHARGE</span>
                  )}
                </div>
                {selectedClaimForDetails.settlementUtr && (
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-muted-foreground">Bank Remittance (UTR):</span>
                    <Link href="/hospital-admin/payments/online" className="font-mono text-purple-600 font-bold hover:underline">
                      {selectedClaimForDetails.settlementUtr}
                    </Link>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1">
                  <span className="text-muted-foreground">Submission Timestamp:</span>
                  <span className="font-mono text-muted-foreground">{formatDateTime(selectedClaimForDetails.submissionDate)}</span>
                </div>
              </div>

              {/* Clinical & Scrutiny Notes */}
              {(selectedClaimForDetails.rejectionReason || selectedClaimForDetails.queryNotes) && (
                <div className="p-3 bg-muted/20 rounded-lg border border-border space-y-1">
                  <span className="font-bold text-foreground text-[11px] block">TPA Scrutiny &amp; Query Notes:</span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {selectedClaimForDetails.rejectionReason && (
                      <span className="text-rose-600 font-medium block mb-1">
                        Rejection Query: {selectedClaimForDetails.rejectionReason}
                      </span>
                    )}
                    {selectedClaimForDetails.queryNotes}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex sm:justify-between items-center gap-2">
            <div>
              {selectedClaimForDetails?.status === "Rejected" && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 text-xs font-semibold"
                  onClick={() => {
                    setDetailsModalOpen(false);
                    if (selectedClaimForDetails) {
                      handleOpenResubmit(selectedClaimForDetails);
                    }
                  }}
                >
                  Resubmit Dispute
                </Button>
              )}
              {selectedClaimForDetails?.status === "Settled" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs font-semibold text-purple-600"
                  asChild
                >
                  <Link href="/hospital-admin/payments/online">
                    View Payments Ledger
                  </Link>
                </Button>
              )}
            </div>
            <Button type="button" size="sm" onClick={() => setDetailsModalOpen(false)}>
              Close Dossier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
