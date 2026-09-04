"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GitFork,
  CheckCircle2,
  Calendar,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Filter,
  Layers,
  FileSpreadsheet,
  Building,
  UserX,
  XCircle,
  RotateCcw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from "recharts";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { AnalyticsNav } from "@/hospital-admin/components/analytics/analytics-nav";
import { mockAppointmentConversionData } from "@/hospital-admin/lib/mock-data/analytics-extended";

export default function AppointmentConversionPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const funnelStages = mockAppointmentConversionData.stages;

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Appointment Conversion &amp; Funnel Analytics"
        description="End-to-end appointment progression tracking: intake bookings, reception check-in velocity, and completed clinical consultations."
        crumbs={[{ label: "Analytics & Growth" }, { label: "Analytics" }, { label: "Appointment Conversion" }]}
        actions={
          <Button size="sm" variant="outline" className="h-8 text-xs font-semibold gap-1.5" asChild>
            <Link href="/hospital-admin/reports">
              <Layers className="h-3.5 w-3.5 text-primary" /> Open Reports Hub
            </Link>
          </Button>
        }
      />

      <AnalyticsNav />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Appointment Conversion Pipeline" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <GitFork className="h-3.5 w-3.5 text-primary" />
          <span>Rule F21-CAN-7: Sourced from F1 (Appointments) actual status progression</span>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Appointments Booked</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">
            {mockAppointmentConversionData.totalBooked.toLocaleString()}
          </p>
          <span className="text-[10px] text-muted-foreground">All intake channels</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Completed Consultations</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
            {funnelStages.find((s) => s.stage === "Completed")?.count.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Physician encounter signed</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Overall Conversion Rate</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">
            {mockAppointmentConversionData.overallConversionRate}%
          </p>
          <span className="text-[10px] text-cyan-600 font-medium">Booked ➔ Completed ratio</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Avg Booking Lead Time</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">
            {mockAppointmentConversionData.leadTimeHoursAvg} hrs
          </p>
          <span className="text-[10px] text-amber-600 font-medium">Slot request to visit</span>
        </Card>
      </div>

      {/* Conversion Funnel Progression */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <GitFork className="h-4 w-4 text-primary" /> Hospital-Wide Appointment Conversion Funnel
          </CardTitle>
          <CardDescription className="text-xs">
            Step-by-step patient volume drop-off across booking, physical reception check-in, and final physician consultation.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {funnelStages
              .filter((s) => s.stage === "Booked" || s.stage === "Checked-in" || s.stage === "Completed")
              .map((st, idx) => (
                <div
                  key={st.stage}
                  className="p-4 rounded-xl border border-border bg-muted/20 relative overflow-hidden space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase">
                      Stage {idx + 1}: {st.stage}
                    </span>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {st.percentage}%
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold font-mono text-foreground">{st.count.toLocaleString()}</p>
                  {st.dropOffRate ? (
                    <span className="text-[10px] text-rose-600 font-medium block">
                      Drop-off: -{st.dropOffRate}% from previous stage
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-600 font-medium block">Top of funnel base</span>
                  )}
                </div>
              ))}
          </div>

          {/* Outcome Split (Completed vs Cancelled / No-show / Rescheduled) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border">
            <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
              <span className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Completed
              </span>
              <p className="text-lg font-bold font-mono text-emerald-600 mt-1">
                {funnelStages.find((s) => s.stage === "Completed")?.count.toLocaleString()} (83.4%)
              </p>
            </div>
            <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/5">
              <span className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1">
                <XCircle className="h-3.5 w-3.5 text-rose-600" /> Cancelled
              </span>
              <p className="text-lg font-bold font-mono text-rose-600 mt-1">
                {funnelStages.find((s) => s.stage === "Cancelled")?.count.toLocaleString()} (6.8%)
              </p>
            </div>
            <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5">
              <span className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1">
                <UserX className="h-3.5 w-3.5 text-amber-600" /> No-Shows
              </span>
              <p className="text-lg font-bold font-mono text-amber-600 mt-1">
                {funnelStages.find((s) => s.stage === "No-show")?.count.toLocaleString()} (5.2%)
              </p>
            </div>
            <div className="p-3 rounded-lg border border-blue-500/30 bg-blue-500/5">
              <span className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1">
                <RotateCcw className="h-3.5 w-3.5 text-blue-600" /> Rescheduled
              </span>
              <p className="text-lg font-bold font-mono text-blue-600 mt-1">
                {funnelStages.find((s) => s.stage === "Rescheduled")?.count.toLocaleString()} (4.6%)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Specialty Conversion Breakdown Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Conversion Rate by Clinical Department</CardTitle>
          <CardDescription className="text-xs">
            Comparison of booking volumes, cancellations, no-shows, and completed consultations across medical wings.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Clinical Department</TableHead>
                  <TableHead className="text-xs font-bold text-center">Booked</TableHead>
                  <TableHead className="text-xs font-bold text-center">Completed</TableHead>
                  <TableHead className="text-xs font-bold text-center">Cancelled</TableHead>
                  <TableHead className="text-xs font-bold text-center">No-Show</TableHead>
                  <TableHead className="text-xs font-bold text-right">Conversion Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAppointmentConversionData.bySpecialty.map((spec) => (
                  <TableRow key={spec.department} className="hover:bg-muted/30 text-xs">
                    <TableCell className="font-semibold text-foreground">{spec.department}</TableCell>
                    <TableCell className="text-center font-mono text-muted-foreground">{spec.booked}</TableCell>
                    <TableCell className="text-center font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {spec.completed}
                    </TableCell>
                    <TableCell className="text-center font-mono text-rose-600">{spec.cancelled}</TableCell>
                    <TableCell className="text-center font-mono text-amber-600">{spec.noShow}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        className={
                          spec.conversionRate >= 85
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                            : spec.conversionRate >= 80
                            ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 text-[10px]"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                        }
                      >
                        {spec.conversionRate}%
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
