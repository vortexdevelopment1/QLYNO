"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Download,
  Flame,
  Layers,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  Zap,
  UserPlus,
  GitFork,
  Stethoscope,
  RotateCcw,
  UserX,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { AnalyticsNav } from "@/hospital-admin/components/analytics/analytics-nav";
import { mockExecutiveAnalytics } from "@/hospital-admin/lib/mock-data/reports-analytics";

const COLORS = ["#0d9488", "#0284c7", "#f59e0b", "#f43f5e", "#8b5cf6"];

const SUB_REPORTS = [
  {
    title: "Patient Acquisition",
    description: "Volume and trend by referral channel (self, doctor, insurance, digital)",
    href: "/hospital-admin/analytics/patient-acquisition",
    icon: UserPlus,
    badge: "6 Channels",
  },
  {
    title: "Appointment Conversion",
    description: "Funnel progression from booking to reception check-in and completed consults",
    href: "/hospital-admin/analytics/appointment-conversion",
    icon: GitFork,
    badge: "83.4% Conv",
  },
  {
    title: "New vs Returning Patients",
    description: "Monthly split between first-time registrations and repeat clinical visits",
    href: "/hospital-admin/analytics/new-vs-returning",
    icon: Users,
    badge: "58% Repeat",
  },
  {
    title: "Doctor Performance",
    description: "Physician consult durations, no-shows, reviews, and F18 financial cross-reference",
    href: "/hospital-admin/analytics/doctor-performance",
    icon: Stethoscope,
    badge: "48 Doctors",
  },
  {
    title: "Department Performance",
    description: "Bed occupancy, ALOS, 30-day readmissions, and F18 specialty revenue",
    href: "/hospital-admin/analytics/department-performance",
    icon: Building2,
    badge: "84.6% Occupancy",
  },
  {
    title: "Patient Retention",
    description: "Longitudinal cohort curves (30d, 90d, 365d) and F5 follow-up adherence",
    href: "/hospital-admin/analytics/patient-retention",
    icon: RotateCcw,
    badge: "78.4% 30d",
  },
  {
    title: "No-shows",
    description: "Missed appointment patterns by specialty, physician, time slots, and days",
    href: "/hospital-admin/analytics/no-shows",
    icon: UserX,
    badge: "5.2% Rate",
  },
  {
    title: "Revenue Analytics",
    description: "Quarterly realized revenue vs. budget trajectory and institutional payer mix",
    href: "/hospital-admin/analytics/revenue-analytics",
    icon: TrendingUp,
    badge: "+14.2% YoY",
  },
];

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Hospital Executive & Strategic Analytics"
          description="Executive KPIs, bed occupancy, ALOS trends, revenue cohorts, and clinical quality benchmarks."
          crumbs={[{ label: "Analytics & Growth" }, { label: "Executive Cockpit" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading analytics cockpit...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      {/* Page Header */}
      <PageHeader
        title="Hospital Executive &amp; Strategic Analytics"
        description="Executive KPIs, bed occupancy, ALOS trends, revenue cohorts, and clinical quality benchmarks."
        crumbs={[{ label: "Analytics & Growth" }, { label: "Executive Cockpit" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs font-semibold gap-1.5"
              asChild
            >
              <Link href="/hospital-admin/reports">
                <Layers className="h-3.5 w-3.5 text-primary" /> Operational Reports Hub
              </Link>
            </Button>
          </div>
        }
      />

      <AnalyticsNav />

      {/* Scope Indicator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Executive Strategic Analytics" />
        <Badge variant="outline" className="text-[10px] text-muted-foreground font-mono">
          Live Data Stream • Consolidated Campus Telemetry
        </Badge>
      </div>

      {/* Strategic KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {mockExecutiveAnalytics.kpis.map((kpi, idx) => (
          <Card key={idx} className="p-3.5 border-border bg-card shadow-xs">
            <span className="text-[11px] text-muted-foreground uppercase font-bold">{kpi.label}</span>
            <p className="text-xl font-bold font-mono text-primary mt-0.5">{kpi.value}</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              <span className="text-[10px] text-emerald-600 font-medium">{kpi.delta}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Revenue Growth & Target Comparison */}
        <Card className="lg:col-span-2 border-border shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <LineChartIcon className="h-4 w-4 text-primary" /> Hospital Revenue Expansion (₹ Lakhs vs Target)
              </CardTitle>
              <CardDescription className="text-xs">
                Quarterly realized operating revenue vs planned strategic budget trajectory.
              </CardDescription>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[9px]">
              +14.2% YoY Growth
            </Badge>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockExecutiveAnalytics.revenueGrowth}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="period" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} tickFormatter={(v) => `₹${v}L`} />
                  <RechartsTooltip formatter={(v: any) => `₹${v} Lakhs`} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Realized Revenue"
                    stroke="#0d9488"
                    fill="#0d9488"
                    fillOpacity={0.25}
                    strokeWidth={2.5}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    name="Strategic Target"
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Right 1 Col: Departmental Case Mix Cohorts */}
        <Card className="border-border shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-cyan-600" /> Specialty Revenue Share
            </CardTitle>
            <CardDescription className="text-xs">
              Contribution breakdown across major super-specialty wings.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-3">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockExecutiveAnalytics.departmentCohort}
                    dataKey="share"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {mockExecutiveAnalytics.departmentCohort.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(v: any) => `${v}%`} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 pt-1 text-xs">
              {mockExecutiveAnalytics.departmentCohort.map((dept, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="truncate text-foreground font-medium">{dept.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono shrink-0">
                    <span>{dept.share}%</span>
                    <span className="text-emerald-600 font-semibold">{dept.growth}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 8 Sub-Reports Quick Drill-Down Grid */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Strategic &amp; Operational Analytics Sub-Decks
          </CardTitle>
          <CardDescription className="text-xs">
            Deep-dive operational telemetry reports across conversion pipelines, physician performance, and patient cohorts.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SUB_REPORTS.map((sub) => {
              const Icon = sub.icon;
              return (
                <Link
                  key={sub.href}
                  href={sub.href}
                  className="p-3.5 rounded-xl border border-border bg-muted/15 hover:bg-muted/30 hover:border-primary/40 transition-all flex flex-col justify-between space-y-2 group shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors border border-primary/20">
                      <Icon className="h-4 w-4 text-primary transition-transform group-hover:scale-110" />
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {sub.badge}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                      <span>{sub.title}</span>
                      <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h4>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{sub.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Clinical Quality & Infection Benchmarks */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> Clinical Quality &amp; Infection Rate National Benchmarks
          </CardTitle>
          <CardDescription className="text-xs">
            NABH / JCI hospital quality indicators measured against peer tertiary centers.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Quality Indicator</TableHead>
                  <TableHead className="text-xs font-bold text-center">Qlyno Score</TableHead>
                  <TableHead className="text-xs font-bold text-center">National Benchmark</TableHead>
                  <TableHead className="text-xs font-bold text-right">Accreditation Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockExecutiveAnalytics.qualityBenchmarks.map((q, idx) => (
                  <TableRow key={idx} className="hover:bg-muted/30 text-xs">
                    <TableCell className="font-semibold text-foreground">{q.indicator}</TableCell>
                    <TableCell className="text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {q.hospitalScore}
                    </TableCell>
                    <TableCell className="text-center font-mono text-muted-foreground">
                      {q.nationalBenchmark}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[9px]">
                        {q.status}
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
