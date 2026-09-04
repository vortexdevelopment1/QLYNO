"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  UserPlus,
  Share2,
  TrendingUp,
  Award,
  Layers,
  Users,
  Building,
  ShieldCheck,
  CreditCard,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
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
import { mockPatientAcquisitionData } from "@/hospital-admin/lib/mock-data/analytics-extended";
import { formatCurrency } from "@/hospital-admin/lib/utils";

const CHANNEL_COLORS = ["#0d9488", "#0284c7", "#8b5cf6", "#f59e0b", "#94a3b8", "#ec4899"];

export default function PatientAcquisitionAnalyticsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Patient Acquisition &amp; Inflow Channel Analytics"
        description="Patient intake channel attribution: self-referrals, external physician networks, insurance TPA empanelments, and digital booking gateways."
        crumbs={[{ label: "Analytics & Growth" }, { label: "Analytics" }, { label: "Patient Acquisition" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 text-xs font-semibold gap-1.5" asChild>
              <Link href="/hospital-admin/patients">
                <Users className="h-3.5 w-3.5 text-primary" /> Patient Master Registry
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
        <ScopeIndicator scope="Hospital Admin" stationName="Patient Channel Attribution Deck" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Rule F21-CAN-6: Attributed via native acquisitionChannel captured at registration</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Acquired Patients</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">
            {mockPatientAcquisitionData.totalAcquired.toLocaleString()}
          </p>
          <span className="text-[10px] text-muted-foreground">All intake channels</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Leading Inflow Channel</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">
            {mockPatientAcquisitionData.topChannel}
          </p>
          <span className="text-[10px] text-cyan-600 font-medium">32% of total new volume</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Avg Channel Conversion</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
            {mockPatientAcquisitionData.channelConversionRate}%
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Inquiry to consult success</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Fastest Growing Channel</span>
          <p className="text-xl font-bold font-mono text-purple-600 mt-0.5">Online Booking</p>
          <span className="text-[10px] text-purple-600 font-medium">+28.5% YoY acceleration</span>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Trend Stacked Bar Chart */}
        <Card className="lg:col-span-2 border-border shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Monthly Acquisition Trend by Channel
            </CardTitle>
            <CardDescription className="text-xs">
              Longitudinal tracking of monthly patient intake volume across all hospital discovery avenues.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockPatientAcquisitionData.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} />
                  <RechartsTooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Bar dataKey="selfReferral" name="Self-Referral" stackId="a" fill="#0d9488" />
                  <Bar dataKey="doctorReferral" name="Doctor Referral" stackId="a" fill="#0284c7" />
                  <Bar dataKey="insuranceNetwork" name="Insurance Network" stackId="a" fill="#8b5cf6" />
                  <Bar dataKey="onlineBooking" name="Online Booking" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="walkIn" name="Walk-in" stackId="a" fill="#94a3b8" />
                  <Bar dataKey="corporate" name="Corporate" stackId="a" fill="#ec4899" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Channel Share Donut */}
        <Card className="border-border shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-cyan-600" /> Channel Inflow Share
            </CardTitle>
            <CardDescription className="text-xs">
              Percentage breakdown of patient acquisition channels.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-3">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockPatientAcquisitionData.channelBreakdown}
                    dataKey="sharePercent"
                    nameKey="channel"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {mockPatientAcquisitionData.channelBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHANNEL_COLORS[index % CHANNEL_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(v: any) => `${v}%`} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 pt-1 text-xs">
              {mockPatientAcquisitionData.channelBreakdown.map((c, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: CHANNEL_COLORS[idx % CHANNEL_COLORS.length] }}
                    />
                    <span className="truncate text-foreground font-medium">{c.channel}</span>
                  </div>
                  <span className="font-mono font-semibold shrink-0">{c.sharePercent}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Channel Breakdown Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Acquisition Channel Performance &amp; Revenue Yield</CardTitle>
          <CardDescription className="text-xs">
            Comparison of patient intake volume, conversion efficiency, and average realized revenue per patient.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Acquisition Channel</TableHead>
                  <TableHead className="text-xs font-bold text-center">Volume</TableHead>
                  <TableHead className="text-xs font-bold text-center">Share %</TableHead>
                  <TableHead className="text-xs font-bold text-center">Conversion Rate</TableHead>
                  <TableHead className="text-xs font-bold text-center">Avg Revenue / Patient</TableHead>
                  <TableHead className="text-xs font-bold text-right">YoY Growth</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPatientAcquisitionData.channelBreakdown.map((ch) => (
                  <TableRow key={ch.channel} className="hover:bg-muted/30 text-xs">
                    <TableCell className="font-semibold text-foreground">{ch.channel}</TableCell>
                    <TableCell className="text-center font-mono font-bold text-primary">
                      {ch.volume.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center font-mono text-muted-foreground">{ch.sharePercent}%</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={
                          ch.conversionRate >= 88
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                            : "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 text-[10px]"
                        }
                      >
                        {ch.conversionRate}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-mono font-semibold text-foreground">
                      {formatCurrency(ch.avgRevenuePerPatient)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {ch.growthYoY}
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
