"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Search,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Wallet,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { FinancialReportsNav } from "@/hospital-admin/components/financial-reports/financial-reports-nav";
import {
  mockCashierReports,
  getScaledCashierReports,
} from "@/hospital-admin/lib/mock-data/financial-reports";

export default function PaymentReportsPage() {
  const [mounted, setMounted] = useState(false);
  const [period, setPeriod] = useState("This Month");
  const [search, setSearch] = useState("");

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
  const scaledCashiers = getScaledCashierReports(multiplier);

  const totalCollected = scaledCashiers.reduce((acc, curr) => acc + curr.totalCollected, 0);
  const totalCash = scaledCashiers.reduce((acc, curr) => acc + curr.cashCollected, 0);
  const totalPos = scaledCashiers.reduce((acc, curr) => acc + curr.posCollected, 0);
  const totalUpi = scaledCashiers.reduce((acc, curr) => acc + curr.upiCollected, 0);

  const filteredCashiers = scaledCashiers.filter((c) =>
    c.cashierName.toLowerCase().includes(search.toLowerCase()) ||
    c.counterName.toLowerCase().includes(search.toLowerCase())
  );

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
              title="Payment &amp; Cashier Reconciliation Reports"
              description="Management rollup of payment methods, cashier counter balances, shift handovers, and cash drawer variances."
              crumbs={[
                { label: "Finance" },
                { label: "Financial Reports", href: "/hospital-admin/financial-reports" },
                { label: "Payment Reports" },
              ]}
            />
          </div>
          <Badge variant="outline" className="text-xs bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30">
            Integrated Source: Cashier Drawer Reconciliation
          </Badge>
        </div>
      </div>

      <FinancialReportsNav period={period} onPeriodChange={setPeriod} />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Shift Collections</span>
          <p className="text-xl font-bold font-mono text-foreground mt-1">₹{(totalCollected / 100000).toFixed(2)} L</p>
          <span className="text-[10px] text-muted-foreground">Across all active counters</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Digital UPI Realized</span>
          <p className="text-xl font-bold font-mono text-primary mt-1">₹{(totalUpi / 100000).toFixed(2)} L</p>
          <span className="text-[10px] text-muted-foreground">Instant bank credit</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">POS Terminal Cards</span>
          <p className="text-xl font-bold font-mono text-blue-600 mt-1">₹{(totalPos / 100000).toFixed(2)} L</p>
          <span className="text-[10px] text-muted-foreground">Debit &amp; Credit swipe</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Physical Cash Drawer</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-1">₹{(totalCash / 100000).toFixed(2)} L</p>
          <span className="text-[10px] text-emerald-600 font-semibold">100% Zero Drawer Variance</span>
        </Card>
      </div>

      {/* Cashier Reconciliation Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-3 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold">Counter Cashier Shift &amp; Settlement Log</CardTitle>
              <CardDescription className="text-xs">
                Audited daily drawer reconciliations aggregated from Cash Office &amp; Payments operations.
              </CardDescription>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Filter counter or cashier..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 text-xs">
                <TableHead className="font-bold">Desk / Counter Name</TableHead>
                <TableHead className="font-bold">Cashier On Duty</TableHead>
                <TableHead className="font-bold text-right">Cash</TableHead>
                <TableHead className="font-bold text-right">POS Card</TableHead>
                <TableHead className="font-bold text-right">UPI Digital</TableHead>
                <TableHead className="font-bold text-right">Total Shift Revenue</TableHead>
                <TableHead className="font-bold text-center">Reconciliation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCashiers.map((csh) => (
                <TableRow key={csh.cashierId} className="hover:bg-muted/30 text-xs transition-colors">
                  <TableCell className="font-bold text-foreground flex items-center gap-2">
                    <CreditCard className="h-3.5 w-3.5 text-primary" />
                    {csh.counterName}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{csh.cashierName}</TableCell>
                  <TableCell className="font-mono text-right">₹{csh.cashCollected.toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-right text-blue-600">₹{csh.posCollected.toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-right text-primary">₹{csh.upiCollected.toLocaleString()}</TableCell>
                  <TableCell className="font-mono font-bold text-right text-emerald-600">
                    ₹{csh.totalCollected.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                      <CheckCircle2 className="h-2.5 w-2.5 mr-1 inline" /> {csh.reconciliationStatus}
                    </Badge>
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
