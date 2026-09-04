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
import { InsuranceClaim, TpaProvider } from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { formatDateTime, formatDate, formatCurrency, cn } from "@/hospital-admin/lib/utils";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Pre-Authorization workflow";

export default function PreAuthorizationsPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [claims, setClaims] = useState<InsuranceClaim[]>(mockExtendedInsuranceClaims);
  const [search, setSearch] = useState("");
  const [tpaFilter, setTpaFilter] = useState("all");

  // New Pre-Auth Modal State
  const [preAuthModalOpen, setPreAuthModalOpen] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [policyNo, setPolicyNo] = useState("");
  const [tpaProvider, setTpaProvider] = useState<TpaProvider>("Star Health");
  const [claimAmount, setClaimAmount] = useState(150000);

  useEffect(() => {
    setMounted(true);
  }, []);

  const preAuthClaims = useMemo(() => {
    return claims.filter((c) => c.status === "Submitted" || c.status === "Pre-authorized");
  }, [claims]);

  const filtered = useMemo(() => {
    return preAuthClaims.filter((c) => {
      const matchSearch =
        c.claimNo.toLowerCase().includes(search.toLowerCase()) ||
        c.patientName.toLowerCase().includes(search.toLowerCase()) ||
        c.policyNo.toLowerCase().includes(search.toLowerCase()) ||
        c.tpaProvider.toLowerCase().includes(search.toLowerCase());

      const matchTpa = tpaFilter === "all" || c.tpaProvider === tpaFilter;
      return matchSearch && matchTpa;
    });
  }, [preAuthClaims, search, tpaFilter]);

  const totalPreAuthAmount = useMemo(
    () => preAuthClaims.reduce((sum, c) => sum + c.claimAmount, 0),
    [preAuthClaims]
  );

  const totalGuaranteedApproved = useMemo(
    () => preAuthClaims.reduce((sum, c) => sum + c.approvedAmount, 0),
    [preAuthClaims]
  );

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
          title="Cashless Pre-Authorizations Queue"
          description="Dedicated queue for initial inpatient pre-authorizations and automatic 85% approved / 15% copay split calculation."
          crumbs={[{ label: "Finance" }, { label: "Insurance / TPA", href: "/hospital-admin/insurance-tpa" }, { label: "Pre-authorizations" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading pre-authorizations...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Cashless Pre-Authorizations Queue"
        description="Dedicated queue for initial inpatient pre-authorizations and automatic 85% approved / 15% copay split calculation."
        crumbs={[{ label: "Finance" }, { label: "Insurance / TPA", href: "/hospital-admin/insurance-tpa" }, { label: "Pre-authorizations" }]}
        actions={
          <Button
            size="sm"
            className="h-8 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground"
            onClick={() => setPreAuthModalOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" /> + New Pre-Authorization
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Cashless Pre-Authorization Gateway" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-primary" />
          <span>Automated Split Calculation • System computes 85% approved amount &amp; 15% patient copay automatically</span>
        </div>
      </div>

      <InsuranceNav />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Active Pre-Auths</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{preAuthClaims.length} Active</p>
          <span className="text-[10px] text-muted-foreground">Pre-Auth / Submitted</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Estimated Value</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">{formatCurrency(totalPreAuthAmount)}</p>
          <span className="text-[10px] text-muted-foreground">Inpatient Estimates</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Guaranteed Coverage (85%)</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{formatCurrency(totalGuaranteedApproved)}</p>
          <span className="text-[10px] text-emerald-600 font-medium">TPA Pre-Approval Granted</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Average Pre-Auth TAT</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">1.8 Hours</p>
          <span className="text-[10px] text-emerald-600 font-medium">Under 2hr IRDAI Target</span>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-primary" /> Pre-Authorization Requests &amp; Guarantees
            </CardTitle>
            <CardDescription className="text-xs">
              Live status of cashless initial authorizations and pre-approval tokens.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search pre-auths..."
                className="pl-8 text-xs h-8 w-60"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
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
                  <TableHead className="text-xs font-bold">TPA Provider &amp; Policy</TableHead>
                  <TableHead className="text-xs font-bold text-right">Estimated Claim</TableHead>
                  <TableHead className="text-xs font-bold text-right">Approved (85%)</TableHead>
                  <TableHead className="text-xs font-bold text-right">Patient Copay (15%)</TableHead>
                  <TableHead className="text-xs font-bold text-center">Status</TableHead>
                  <TableHead className="text-xs font-bold">Submitted At</TableHead>
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
                      <div>{c.tpaProvider}</div>
                      <span className="text-[10px] font-mono text-muted-foreground">{c.policyNo}</span>
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {formatCurrency(c.claimAmount)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-emerald-600">
                      {c.approvedAmount > 0 ? formatCurrency(c.approvedAmount) : "Pending Scrutiny"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-amber-600">
                      {c.copayAmount > 0 ? formatCurrency(c.copayAmount) : "Pending"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={cn(
                          "text-[9px]",
                          c.status === "Pre-authorized"
                            ? "bg-primary/15 text-primary border-primary/30"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                        )}
                      >
                        {c.status}
                      </Badge>
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
    </div>
  );
}
