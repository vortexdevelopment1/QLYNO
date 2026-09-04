"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  RotateCcw,
  Users,
  CalendarCheck,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Layers,
  HeartPulse,
  Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { AnalyticsNav } from "@/hospital-admin/components/analytics/analytics-nav";
import { mockPatientRetentionData } from "@/hospital-admin/lib/mock-data/analytics-extended";

export default function PatientRetentionAnalyticsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Patient Retention &amp; Longitudinal Churn Analytics"
        description="Multi-window repeat visit tracking (30d, 60d, 90d, 365d), follow-up consultation adherence, and patient lifetime retention curves."
        crumbs={[{ label: "Analytics & Growth" }, { label: "Analytics" }, { label: "Patient Retention" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 text-xs font-semibold gap-1.5" asChild>
              <Link href="/hospital-admin/follow-ups">
                <CalendarCheck className="h-3.5 w-3.5 text-primary" /> Follow-ups Registry (F5)
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
        <ScopeIndicator scope="Hospital Admin" stationName="Patient Retention &amp; Churn Modeling" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Rule F21-CAN-11: Sourced from F5 Follow-up completions + unified Qlyno Patient ID history</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">30-Day Retention Rate</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">
            {mockPatientRetentionData.overall30DayRetention}%
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Benchmark: 70.0% (+8.4% surplus)</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">90-Day Retention Rate</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">
            {mockPatientRetentionData.overall90DayRetention}%
          </p>
          <span className="text-[10px] text-cyan-600 font-medium">Benchmark: 45.0%</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Avg Days Between Visits</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">
            {mockPatientRetentionData.avgDaysBetweenVisits} Days
          </p>
          <span className="text-[10px] text-amber-600 font-medium">Chronic care re-consult cadence</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Annual Churn Rate</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
            {mockPatientRetentionData.annualChurnRate}%
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Industry Average: 24.5%</span>
        </Card>
      </div>

      {/* Retention Timeframe Cohort Chart */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-primary" /> Longitudinal Patient Retention Curve vs. National Benchmark
          </CardTitle>
          <CardDescription className="text-xs">
            Percentage of eligible patient cohorts returning for follow-up care within 30, 60, 90, 180, and 365 days.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockPatientRetentionData.cohorts}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="timeframe" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} tickFormatter={(v) => `${v}%`} />
                <RechartsTooltip formatter={(v: any) => `${v}%`} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Bar dataKey="retentionRate" name="Qlyno Hospital Retention" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="benchmarkRate" name="National Benchmark" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Follow-Up Adherence Breakdown Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Follow-Up Care Adherence by Specialty (F5 Telemetry)</CardTitle>
          <CardDescription className="text-xs">
            Adherence percentage of patients completing scheduled post-discharge follow-ups and dressing/suture reviews.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Clinical Department</TableHead>
                  <TableHead className="text-xs font-bold text-center">Scheduled Follow-Ups</TableHead>
                  <TableHead className="text-xs font-bold text-center">Completed Follow-Ups</TableHead>
                  <TableHead className="text-xs font-bold text-right">Adherence Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPatientRetentionData.followUpAdherence.map((f) => (
                  <TableRow key={f.department} className="hover:bg-muted/30 text-xs">
                    <TableCell className="font-semibold text-foreground">{f.department}</TableCell>
                    <TableCell className="text-center font-mono text-muted-foreground">{f.scheduledFollowUps}</TableCell>
                    <TableCell className="text-center font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {f.completedFollowUps}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        className={
                          f.adherenceRate >= 85
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                        }
                      >
                        {f.adherenceRate}%
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
