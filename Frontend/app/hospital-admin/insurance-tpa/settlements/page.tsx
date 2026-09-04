"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Filter,
  Globe,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  Wallet,
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
import { InsuranceClaim } from "@/hospital-admin/lib/types";
import { formatDateTime, formatDate, formatCurrency, cn } from "@/hospital-admin/lib/utils";

export default function InsuranceSettlementsPage() {
  const [mounted, setMounted] = useState(false);
  const [claims, setClaims] = useState<InsuranceClaim[]>(mockExtendedInsuranceClaims);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const settledClaims = useMemo(() => {
    return claims.filter((c) => c.status === "Settled");
  }, [claims]);

  const filtered = useMemo(() => {
    return settledClaims.filter((c) => {
      return (
        c.claimNo.toLowerCase().includes(search.toLowerCase()) ||
        c.patientName.toLowerCase().includes(search.toLowerCase()) ||
        c.policyNo.toLowerCase().includes(search.toLowerCase()) ||
        c.tpaProvider.toLowerCase().includes(search.toLowerCase()) ||
        (c.settlementUtr && c.settlementUtr.toLowerCase().includes(search.toLowerCase()))
      );
    });
  }, [settledClaims, search]);

  const totalSettledAmount = useMemo(
    () => settledClaims.reduce((sum, c) => sum + c.approvedAmount, 0),
    [settledClaims]
  );

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="TPA Settlements &amp; Bank Remittances"
          description="Final settled insurance claims, institutional bank remittance UTRs, and direct traceability into Payments Online ledger."
          crumbs={[{ label: "Finance" }, { label: "Insurance / TPA", href: "/hospital-admin/insurance-tpa" }, { label: "Settlements" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading settlements...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="TPA Settlements &amp; Bank Remittances"
        description="Final settled insurance claims, institutional bank remittance UTRs, and direct traceability into Payments Online ledger."
        crumbs={[{ label: "Finance" }, { label: "Insurance / TPA", href: "/hospital-admin/insurance-tpa" }, { label: "Settlements" }]}
        actions={
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs font-semibold gap-1.5"
            asChild
          >
            <Link href="/hospital-admin/payments/online">
              <Wallet className="h-3.5 w-3.5 text-primary" /> Payments Online Ledger
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="TPA Bank Settlement Audit Desk" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-emerald-600" />
          <span>Settlement Audit • Every settled claim links 1-to-1 with an institutional bank transfer in Payments</span>
        </div>
      </div>

      <InsuranceNav />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Settled Claims</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{settledClaims.length} Claims</p>
          <span className="text-[10px] text-emerald-600 font-medium">100% Bank Cleared</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Bank Inflow Realized</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">{formatCurrency(totalSettledAmount)}</p>
          <span className="text-[10px] text-muted-foreground">Credited via RTGS/NEFT</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Bank UTR Match Rate</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">100% Matched</p>
          <span className="text-[10px] text-emerald-600 font-medium">Zero Reconciliation Gap</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Average Settlement Cycle</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">4.2 Days</p>
          <span className="text-[10px] text-muted-foreground">Discharge ➔ Bank Credit</span>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Settled Claims &amp; Bank Remittances
            </CardTitle>
            <CardDescription className="text-xs">
              Every finalized claim verified against hospital bank deposits and UTR records.
            </CardDescription>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search claim, UTR, patient..."
              className="pl-8 text-xs h-8 w-60"
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
                  <TableHead className="text-xs font-bold">TPA / Scheme Provider</TableHead>
                  <TableHead className="text-xs font-bold">Bank UTR Reference</TableHead>
                  <TableHead className="text-xs font-bold text-right">Settled Amount</TableHead>
                  <TableHead className="text-xs font-bold text-center">Reconciliation</TableHead>
                  <TableHead className="text-xs font-bold">Settled Date</TableHead>
                  <TableHead className="text-xs font-bold text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id} className="hover:bg-muted/30 text-xs">
                    <TableCell className="font-mono font-bold text-foreground">{c.claimNo}</TableCell>

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
                      <Badge variant="outline" className="font-mono text-[10px] bg-purple-500/5 text-purple-800 dark:text-purple-300">
                        {c.settlementUtr || "UTR-VERIFIED"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right font-mono font-bold text-emerald-600">
                      {formatCurrency(c.approvedAmount)}
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[9px]">
                        Reconciled in Payments
                      </Badge>
                    </TableCell>

                    <TableCell className="font-mono text-muted-foreground">
                      {c.settlementDate ? formatDateTime(c.settlementDate) : "—"}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px] font-semibold gap-1"
                        asChild
                      >
                        <Link href="/hospital-admin/payments/online">
                          <ArrowUpRight className="h-3 w-3" /> Trace Payment
                        </Link>
                      </Button>
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
