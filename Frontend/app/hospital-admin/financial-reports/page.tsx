"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BadgeIndianRupee,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  FileSpreadsheet,
  FileText,
  Layers,
  PieChart,
  Receipt,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { FinancialReportsNav } from "@/hospital-admin/components/financial-reports/financial-reports-nav";
import {
  mockRevenueStreams,
  mockMonthlyRevenueTrend,
  mockCollectionChannels,
  mockArAgingBuckets,
  mockExpenseRecords,
  getScaledRevenueStreams,
  getScaledCollectionChannels,
  getScaledArAgingBuckets,
  getScaledExpenses,
} from "@/hospital-admin/lib/mock-data/financial-reports";

export default function FinancialReportsHubPage() {
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
  const revenueStreams = getScaledRevenueStreams(multiplier);
  const collectionChannels = getScaledCollectionChannels(multiplier);
  const arAgingBuckets = getScaledArAgingBuckets(multiplier);
  const expenses = getScaledExpenses(multiplier);

  const totalGross = revenueStreams.reduce((acc, curr) => acc + curr.grossAmount, 0);
  const totalCollections = collectionChannels.reduce((acc, curr) => acc + curr.amountCollected, 0);
  const totalOutstanding = arAgingBuckets.reduce((acc, curr) => acc + curr.totalOutstanding, 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netSurplus = totalGross - totalExpenses;
  const marginPercent = ((netSurplus / totalGross) * 100).toFixed(1);
  const collectionEfficiency = ((totalCollections / totalGross) * 100).toFixed(1);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Scope */}
      <div className="flex flex-col gap-2">
        <ScopeIndicator scope="Hospital Admin" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <PageHeader
              title="Hospital Financial Analytics & Reports"
              description="Consolidated executive ledger, revenue attribution, collection efficiency, AR aging, and operational P&L summaries."
              crumbs={[{ label: "Finance" }, { label: "Financial Reports" }]}
            />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Ledger In-Sync for {period}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation Toolbar */}
      <FinancialReportsNav period={period} onPeriodChange={setPeriod} />

      {/* Executive Financial KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Gross Revenue</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold font-mono text-foreground mt-1">₹{(totalGross / 100000).toFixed(1)} L</p>
          <span className="text-[10px] text-emerald-600 font-semibold">+9.8% vs last month</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Total Realized</span>
            <Wallet className="h-4 w-4 text-primary" />
          </div>
          <p className="text-xl font-bold font-mono text-foreground mt-1">₹{(totalCollections / 100000).toFixed(1)} L</p>
          <span className="text-[10px] text-muted-foreground">Across all POS/UPI/NEFT</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Collection Rate</span>
            <BadgeIndianRupee className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-xl font-bold font-mono text-blue-600 mt-1">{collectionEfficiency}%</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Benchmark: &gt;85%</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Outstanding AR</span>
            <TrendingDown className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-xl font-bold font-mono text-amber-600 mt-1">₹{(totalOutstanding / 100000).toFixed(1)} L</p>
          <span className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">TPA &amp; Patient dues</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Operating Expenses</span>
            <Scale className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-xl font-bold font-mono text-purple-600 mt-1">₹{(totalExpenses / 100000).toFixed(1)} L</p>
          <span className="text-[10px] text-muted-foreground">Payroll &amp; Supplies</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs bg-linear-to-br from-card to-emerald-500/5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Operating Margin</span>
            <Sparkles className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-1">{marginPercent}%</p>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">₹{(netSurplus / 100000).toFixed(1)} L Net</span>
        </Card>
      </div>

      {/* Deep-Dive Sub-Report Cards (8 Feature Navigation Grid) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="h-4 w-4 text-primary" /> Dedicated Financial Analytics Modules
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Revenue */}
          <Card className="border-border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <CardTitle className="text-sm font-bold mt-2">Revenue Analysis</CardTitle>
              <CardDescription className="text-xs">
                Gross billing trends over time, source mix (OPD, IPD, OT, Diagnostics), and tariff concession tracking.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="font-mono font-semibold text-foreground">₹{(totalGross / 100000).toFixed(1)} L Total</span>
                <Link href="/hospital-admin/financial-reports/revenue" className="text-primary font-semibold hover:underline flex items-center gap-1">
                  Explore <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Collections */}
          <Card className="border-border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Wallet className="h-4 w-4" />
                </div>
              </div>
              <CardTitle className="text-sm font-bold mt-2">Collections &amp; Realization</CardTitle>
              <CardDescription className="text-xs">
                Period-over-period collections, payment method mix (UPI, Cards, Cash, TPA Wire), and realization rate.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="font-mono font-semibold text-foreground">{collectionEfficiency}% Realized</span>
                <Link href="/hospital-admin/financial-reports/collections" className="text-primary font-semibold hover:underline flex items-center gap-1">
                  Explore <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Outstanding */}
          <Card className="border-border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <TrendingDown className="h-4 w-4" />
                </div>
              </div>
              <CardTitle className="text-sm font-bold mt-2">Outstanding &amp; AR Aging</CardTitle>
              <CardDescription className="text-xs">
                Accounts receivable aging in 0–30, 31–60, 61–90, 90+ day buckets across Self-Pay, TPA, and Govt Schemes.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="font-mono font-semibold text-amber-600">₹{(totalOutstanding / 100000).toFixed(1)} L Pending</span>
                <Link href="/hospital-admin/financial-reports/outstanding" className="text-primary font-semibold hover:underline flex items-center gap-1">
                  Explore <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Department Revenue */}
          <Card className="border-border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                  <Building2 className="h-4 w-4" />
                </div>
              </div>
              <CardTitle className="text-sm font-bold mt-2">Department Revenue</CardTitle>
              <CardDescription className="text-xs">
                Revenue joined across clinical departments (Cardiology, Ortho, Neuro) with direct contribution margins.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="font-mono font-semibold text-foreground">6 Specialties Tracked</span>
                <Link href="/hospital-admin/financial-reports/department-revenue" className="text-primary font-semibold hover:underline flex items-center gap-1">
                  Explore <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Card 5: Doctor Revenue */}
          <Card className="border-border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600">
                  <Stethoscope className="h-4 w-4" />
                </div>
              </div>
              <CardTitle className="text-sm font-bold mt-2">Doctor Revenue</CardTitle>
              <CardDescription className="text-xs">
                Revenue generated per clinician (Consultations, Surgeries, Admissions). Gated by sensitive data policy.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="font-mono font-semibold text-foreground">Physician Attribution</span>
                <Link href="/hospital-admin/financial-reports/doctor-revenue" className="text-primary font-semibold hover:underline flex items-center gap-1">
                  Explore <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Card 6: Service Revenue */}
          <Card className="border-border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-600">
                  <Receipt className="h-4 w-4" />
                </div>
              </div>
              <CardTitle className="text-sm font-bold mt-2">Service Revenue</CardTitle>
              <CardDescription className="text-xs">
                Revenue categorized by service line: Surgeries, Lab, Radiology, Pharmacy formulary, and Room charges.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="font-mono font-semibold text-foreground">6 Service Streams</span>
                <Link href="/hospital-admin/financial-reports/service-revenue" className="text-primary font-semibold hover:underline flex items-center gap-1">
                  Explore <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Card 7: Payment Reports */}
          <Card className="border-border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                  <CreditCard className="h-4 w-4" />
                </div>
              </div>
              <CardTitle className="text-sm font-bold mt-2">Payment &amp; Reconciliation</CardTitle>
              <CardDescription className="text-xs">
                Counter collection rollups, cashier shift balances, bank clearance status, and variance tracking.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="font-mono font-semibold text-foreground">4 Cash Counters</span>
                <Link href="/hospital-admin/financial-reports/payment-reports" className="text-primary font-semibold hover:underline flex items-center gap-1">
                  Explore <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Card 8: Profit / Expense */}
          <Card className="border-border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between bg-linear-to-br from-card via-card to-primary/5">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600">
                  <Scale className="h-4 w-4" />
                </div>
              </div>
              <CardTitle className="text-sm font-bold mt-2">Profit / Expense &amp; P&amp;L</CardTitle>
              <CardDescription className="text-xs">
                Operating expenditures (Payroll, Utilities, Procurement POs), threshold approvals, and net P&amp;L summary.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="font-mono font-semibold text-emerald-600">{marginPercent}% Net Margin</span>
                <Link href="/hospital-admin/financial-reports/profit-expense" className="text-primary font-semibold hover:underline flex items-center gap-1">
                  Manage P&amp;L <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Snapshot Revenue Source Breakdown */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2 border-b border-border/60">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <PieChart className="h-3.5 w-3.5 text-primary" /> {period} Revenue Breakdown by Clinical Stream
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {revenueStreams.map((stream) => (
              <div key={stream.category} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-foreground">{stream.category}</span>
                  <span className="font-mono font-bold text-foreground">
                    ₹{(stream.netRevenue / 100000).toFixed(2)} L ({stream.percentageShare}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${stream.percentageShare}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
