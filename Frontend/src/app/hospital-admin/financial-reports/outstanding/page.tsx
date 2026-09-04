"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Search,
  ShieldAlert,
  TrendingDown,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { FinancialReportsNav } from "@/hospital-admin/components/financial-reports/financial-reports-nav";
import {
  mockArAgingBuckets,
  getScaledArAgingBuckets,
} from "@/hospital-admin/lib/mock-data/financial-reports";
import { cn } from "@/hospital-admin/lib/utils";

export default function OutstandingReportPage() {
  const [mounted, setMounted] = useState(false);
  const [period, setPeriod] = useState("This Month");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getMultiplier = (p: string) => {
    switch (p) {
      case "Today": return 0.033;
      case "This Week": return 0.23;
      case "This Month": return 1.0;
      case "This Quarter": return 2.9;
      case "FY 2025-26": return 11.8;
      case "Custom": return 0.5;
      default: return 1.0;
    }
  };

  const multiplier = getMultiplier(period);
  const scaledBuckets = getScaledArAgingBuckets(multiplier);

  const totalOutstanding = scaledBuckets.reduce((acc, curr) => acc + curr.totalOutstanding, 0);
  const totalSelfPay = scaledBuckets.reduce((acc, curr) => acc + curr.selfPayAmount, 0);
  const totalTpa = scaledBuckets.reduce((acc, curr) => acc + curr.tpaInsuranceAmount, 0);
  const totalGovt = scaledBuckets.reduce((acc, curr) => acc + curr.govtSchemeAmount, 0);
  const totalOverdueInvoices = scaledBuckets.reduce((acc, curr) => acc + curr.invoiceCount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Scope & Header */}
      <div className="flex flex-col gap-2">
        <ScopeIndicator scope="Hospital Admin" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/hospital-admin/financial-reports">
              <Button variant="outline" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <PageHeader
              title="Outstanding Receivables &amp; AR Aging Analysis"
              description="Accounts receivable aging analysis across 0–30, 31–60, 61–90, 90+ day buckets split by payer type (Self-Pay, TPA, Govt Scheme)."
              crumbs={[
                { label: "Finance" },
                { label: "Financial Reports", href: "/hospital-admin/financial-reports" },
                { label: "Outstanding" },
              ]}
            />
          </div>
          <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30">
            Integrated Source: Receivables Ledger &amp; TPA Claims
          </Badge>
        </div>
      </div>

      <FinancialReportsNav period={period} onPeriodChange={setPeriod} />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Total Pending AR</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-1">₹{(totalOutstanding / 100000).toFixed(2)} L</p>
          <span className="text-[10px] text-muted-foreground">{totalOverdueInvoices} unsettled invoices</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Private TPA Claims</span>
          <p className="text-xl font-bold font-mono text-blue-600 mt-1">₹{(totalTpa / 100000).toFixed(2)} L</p>
          <span className="text-[10px] text-muted-foreground">{((totalTpa / totalOutstanding) * 100).toFixed(1)}% of total AR</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Govt Scheme Dues</span>
          <p className="text-xl font-bold font-mono text-purple-600 mt-1">₹{(totalGovt / 100000).toFixed(2)} L</p>
          <span className="text-[10px] text-muted-foreground">PM-JAY &amp; State schemes</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Self-Pay Patient Dues</span>
          <p className="text-xl font-bold font-mono text-foreground mt-1">₹{(totalSelfPay / 100000).toFixed(2)} L</p>
          <span className="text-[10px] text-muted-foreground">Discharge balance follow-ups</span>
        </Card>
      </div>

      {/* Visual Aging Bucket Summary */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2 border-b border-border/60">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" /> AR Aging Distribution &amp; Risk Concentration
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {scaledBuckets.map((bucket) => {
              const pct = ((bucket.totalOutstanding / totalOutstanding) * 100).toFixed(1);
              return (
                <div
                  key={bucket.bucket}
                  className={cn(
                    "p-3 rounded-lg border text-xs space-y-2",
                    bucket.riskLevel === "Low" && "bg-emerald-500/5 border-emerald-500/20",
                    bucket.riskLevel === "Medium" && "bg-blue-500/5 border-blue-500/20",
                    bucket.riskLevel === "High" && "bg-amber-500/5 border-amber-500/20",
                    bucket.riskLevel === "Critical Bad Debt" && "bg-rose-500/5 border-rose-500/20"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{bucket.bucket}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px]",
                        bucket.riskLevel === "Low" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
                        bucket.riskLevel === "Medium" && "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
                        bucket.riskLevel === "High" && "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
                        bucket.riskLevel === "Critical Bad Debt" && "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30"
                      )}
                    >
                      {bucket.riskLevel}
                    </Badge>
                  </div>
                  <p className="text-lg font-bold font-mono text-foreground">
                    ₹{(bucket.totalOutstanding / 100000).toFixed(2)} L
                  </p>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground block">{pct}% of total outstanding ({bucket.invoiceCount} bills)</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Aging Matrix Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-3 border-b border-border/60">
          <CardTitle className="text-sm font-bold">Aging Matrix by Payer Category ({period})</CardTitle>
          <CardDescription className="text-xs">
            Cross-tabulation of accounts receivable by delinquency period and reimbursement source.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 text-xs">
                <TableHead className="font-bold">Aging Bucket</TableHead>
                <TableHead className="font-bold text-right">Invoices</TableHead>
                <TableHead className="font-bold text-right">Self-Pay Patient</TableHead>
                <TableHead className="font-bold text-right">Private TPA / Insurer</TableHead>
                <TableHead className="font-bold text-right">Govt Schemes (PM-JAY)</TableHead>
                <TableHead className="font-bold text-right">Total Outstanding</TableHead>
                <TableHead className="font-bold text-center">Collection Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scaledBuckets.map((bucket) => (
                <TableRow key={bucket.bucket} className="hover:bg-muted/30 text-xs transition-colors">
                  <TableCell className="font-bold text-foreground">{bucket.bucket}</TableCell>
                  <TableCell className="font-mono text-right text-muted-foreground">{bucket.invoiceCount}</TableCell>
                  <TableCell className="font-mono text-right">₹{bucket.selfPayAmount.toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-right text-blue-600 font-semibold">
                    ₹{bucket.tpaInsuranceAmount.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-mono text-right text-purple-600 font-semibold">
                    ₹{bucket.govtSchemeAmount.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-mono font-bold text-right text-amber-600">
                    ₹{bucket.totalOutstanding.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button size="sm" variant="outline" className="h-6 text-[10px] px-2">
                      Follow Up
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
