"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  UserX,
  AlertTriangle,
  Clock,
  CalendarX,
  Calendar,
  Layers,
  Building,
  TrendingDown,
  ShieldCheck,
  DollarSign,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { AnalyticsNav } from "@/hospital-admin/components/analytics/analytics-nav";
import { mockNoShowData } from "@/hospital-admin/lib/mock-data/analytics-extended";
import { formatCurrency } from "@/hospital-admin/lib/utils";

export default function NoShowsAnalyticsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Appointment &amp; Follow-up No-Show Analytics"
        description="Comprehensive missed consultation analytics: no-show distribution by specialty, attending physician, day of week, and time slots."
        crumbs={[{ label: "Analytics & Growth" }, { label: "Analytics" }, { label: "No-shows" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 text-xs font-semibold gap-1.5" asChild>
              <Link href="/hospital-admin/appointments">
                <Calendar className="h-3.5 w-3.5 text-primary" /> Appointments Registry (F1)
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
        <ScopeIndicator scope="Hospital Admin" stationName="No-Show Mitigation Engine" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Rule F21-CAN-12: Sourced from F1 Appointments &amp; F5 Follow-up no-show status flags</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Scheduled Bookings</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">
            {mockNoShowData.metrics.totalScheduled.toLocaleString()}
          </p>
          <span className="text-[10px] text-muted-foreground">Across all OPD desks</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total No-Shows Logged</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">
            {mockNoShowData.metrics.totalNoShows}
          </p>
          <span className="text-[10px] text-rose-600 font-medium">Unattended slots</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Overall No-Show Rate</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">
            {mockNoShowData.metrics.overallNoShowRate}%
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Target Benchmark: &lt;8.0% (MET)</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Est. Slot Capacity Loss</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">
            {formatCurrency(mockNoShowData.metrics.estimatedRevenueLoss)}
          </p>
          <span className="text-[10px] text-muted-foreground">Recoverable through automated reminders</span>
        </Card>
      </div>

      {/* Time Slot & Day-of-Week Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Time Slot Chart */}
        <Card className="border-border shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> No-Show Rate by Time-of-Day Window
            </CardTitle>
            <CardDescription className="text-xs">
              Early morning and mid-afternoon slots exhibit the highest cancellation and absence probability.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockNoShowData.byTimeSlot}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="timeSlot" tickLine={false} axisLine={false} fontSize={10} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} tickFormatter={(v) => `${v}%`} />
                  <RechartsTooltip formatter={(v: any) => `${v}%`} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="noShowRate" name="No-Show %" fill="#f43f5e" radius={[4, 4, 0, 0]}>
                    {mockNoShowData.byTimeSlot.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.noShowRate > 6 ? "#f43f5e" : entry.noShowRate > 4 ? "#f59e0b" : "#0d9488"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Right: Day of Week Pattern */}
        <Card className="border-border shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <CalendarX className="h-4 w-4 text-amber-600" /> No-Show Distribution by Day of Week
            </CardTitle>
            <CardDescription className="text-xs">
              Mondays and Saturdays show elevated absence rates due to weekend queue spillover.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockNoShowData.byDayOfWeek}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} tickFormatter={(v) => `${v}%`} />
                  <RechartsTooltip formatter={(v: any) => `${v}%`} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="noShowRate" name="No-Show %" fill="#0284c7" radius={[4, 4, 0, 0]}>
                    {mockNoShowData.byDayOfWeek.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.noShowRate > 6 ? "#f43f5e" : entry.noShowRate > 4.5 ? "#0284c7" : "#0d9488"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Breakdown Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">No-Show Rates by Clinical Department</CardTitle>
          <CardDescription className="text-xs">
            Elective and cosmetic departments experience higher drop-off compared to acute cardiology and oncology.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Department</TableHead>
                  <TableHead className="text-xs font-bold text-center">Scheduled Slots</TableHead>
                  <TableHead className="text-xs font-bold text-center">No-Shows</TableHead>
                  <TableHead className="text-xs font-bold text-right">No-Show Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockNoShowData.byDepartment.map((d) => (
                  <TableRow key={d.department} className="hover:bg-muted/30 text-xs">
                    <TableCell className="font-semibold text-foreground">{d.department}</TableCell>
                    <TableCell className="text-center font-mono text-muted-foreground">{d.scheduled}</TableCell>
                    <TableCell className="text-center font-mono font-semibold text-rose-600 dark:text-rose-400">
                      {d.noShows}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={
                          d.noShowRate >= 10
                            ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px]"
                            : d.noShowRate >= 6
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                            : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                        }
                      >
                        {d.noShowRate}%
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
