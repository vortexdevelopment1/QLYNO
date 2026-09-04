"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Wallet,
  Building,
  Layers,
  ArrowUpRight,
  PieChart as PieChartIcon,
  ShieldCheck,
  Calendar,
  CreditCard,
  Building2,
  FileSpreadsheet,
} from "lucide-react";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { AnalyticsNav } from "@/hospital-admin/components/analytics/analytics-nav";
import { mockExtendedRevenueData } from "@/hospital-admin/lib/mock-data/analytics-extended";

const PAYER_COLORS = ["#0d9488", "#0284c7", "#f59e0b", "#8b5cf6"];

export default function RevenueAnalyticsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Hospital Strategic Revenue &amp; Trajectory Analytics"
        description="Formalized multi-year revenue expansion models, realized operating revenue vs. planned budget trajectory, and institutional payer mix."
        crumbs={[{ label: "Analytics & Growth" }, { label: "Analytics" }, { label: "Revenue Analytics" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 text-xs font-semibold gap-1.5" asChild>
              <Link href="/hospital-admin/financial-reports">
                <Wallet className="h-3.5 w-3.5 text-primary" /> Financial Reports Ground Truth
              </Link>
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs font-semibold gap-1.5" asChild>
              <Link href="/hospital-admin/reports">
                <Layers className="h-3.5 w-3.5 text-primary" /> Reports Hub
              </Link>
            </Button>
          </div>
        }
      />

      <AnalyticsNav />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Executive Financial Strategy Deck" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Rule F21-CAN-13 &amp; CANNOT-4, 5: Sourced strictly from F18 Financial Reports</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Q2 2026 Realized Revenue</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">
            ₹{mockExtendedRevenueData.currentQuarterRealizedLakhs} Lakhs
          </p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3 text-emerald-600" />
            <span className="text-[10px] text-emerald-600 font-medium">
              {mockExtendedRevenueData.quarterlyGrowthYoY} YoY
            </span>
          </div>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Q2 Target Achievement</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">104.0%</p>
          <span className="text-[10px] text-emerald-600 font-medium">
            Target: ₹{mockExtendedRevenueData.currentQuarterTargetLakhs}L (+₹20L surplus)
          </span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Projected Annual Run Rate</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">
            ₹{mockExtendedRevenueData.annualProjectedLakhs} Lakhs
          </p>
          <span className="text-[10px] text-cyan-600 font-medium">FY 2026-27 Forecast</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Revenue Per Avail Bed (RevPAB)</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">
            ₹{mockExtendedRevenueData.revPABDaily.toLocaleString()} / day
          </p>
          <span className="text-[10px] text-amber-600 font-medium">Active bed utilization yield</span>
        </Card>
      </div>

      {/* Revenue Trajectory & Stream Mix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Area Chart */}
        <Card className="lg:col-span-2 border-border shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Quarterly Realized Revenue vs. Strategic Target
              </CardTitle>
              <CardDescription className="text-xs">
                Operating revenue performance across historical quarters against board approved targets (₹ Lakhs).
              </CardDescription>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[9px]">
              +14.2% Expansion
            </Badge>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockExtendedRevenueData.trajectory}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="quarter" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} tickFormatter={(v) => `₹${v}L`} />
                  <RechartsTooltip formatter={(v: any) => `₹${v} Lakhs`} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Area
                    type="monotone"
                    dataKey="realizedRevenueLakhs"
                    name="Realized Revenue"
                    stroke="#0d9488"
                    fill="#0d9488"
                    fillOpacity={0.25}
                    strokeWidth={2.5}
                  />
                  <Line
                    type="monotone"
                    dataKey="budgetedTargetLakhs"
                    name="Budget Target"
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Right 1 Col: Payer Mix Donut */}
        <Card className="border-border shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-cyan-600" /> Institutional Payer Mix
            </CardTitle>
            <CardDescription className="text-xs">
              Revenue distribution by insurance TPA, self-pay, and government schemes.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-3">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockExtendedRevenueData.payerMix}
                    dataKey="sharePercent"
                    nameKey="payerCategory"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {mockExtendedRevenueData.payerMix.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PAYER_COLORS[index % PAYER_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(v: any) => `${v}%`} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 pt-1 text-xs">
              {mockExtendedRevenueData.payerMix.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: PAYER_COLORS[idx % PAYER_COLORS.length] }}
                    />
                    <span className="truncate text-foreground font-medium">{p.payerCategory}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono shrink-0">
                    <span>{p.sharePercent}%</span>
                    <span className="text-muted-foreground text-[10px]">({p.settlementTurnaroundDays}d TAT)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trajectory Breakdown Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Quarterly Revenue Stream Decomposition (₹ Lakhs)</CardTitle>
          <CardDescription className="text-xs">
            OPD consults, Inpatient hospitalizations, and Pharmacy &amp; Diagnostic investigation yields.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Quarter</TableHead>
                  <TableHead className="text-xs font-bold text-center">IPD Hospitalization</TableHead>
                  <TableHead className="text-xs font-bold text-center">OPD Consultations</TableHead>
                  <TableHead className="text-xs font-bold text-center">Pharmacy &amp; Diagnostics</TableHead>
                  <TableHead className="text-xs font-bold text-center">Target</TableHead>
                  <TableHead className="text-xs font-bold text-center">Total Realized</TableHead>
                  <TableHead className="text-xs font-bold text-right">Variance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockExtendedRevenueData.trajectory.map((q) => (
                  <TableRow key={q.quarter} className="hover:bg-muted/30 text-xs">
                    <TableCell className="font-semibold text-foreground">{q.quarter}</TableCell>
                    <TableCell className="text-center font-mono font-semibold text-teal-600">
                      ₹{q.ipdRevenueLakhs}L
                    </TableCell>
                    <TableCell className="text-center font-mono font-semibold text-cyan-600">
                      ₹{q.opdRevenueLakhs}L
                    </TableCell>
                    <TableCell className="text-center font-mono font-semibold text-amber-600">
                      ₹{q.pharmacyDiagnosticsLakhs}L
                    </TableCell>
                    <TableCell className="text-center font-mono text-muted-foreground">
                      ₹{q.budgetedTargetLakhs}L
                    </TableCell>
                    <TableCell className="text-center font-mono font-bold text-primary">
                      ₹{q.realizedRevenueLakhs}L
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]">
                        +{q.variancePercent}%
                      </Badge>
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
