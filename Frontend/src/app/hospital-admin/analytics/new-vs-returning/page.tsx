"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  UserPlus,
  RotateCcw,
  TrendingUp,
  Building,
  Layers,
  Calendar,
  ShieldCheck,
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
} from "recharts";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { AnalyticsNav } from "@/hospital-admin/components/analytics/analytics-nav";
import { mockNewVsReturningData } from "@/hospital-admin/lib/mock-data/analytics-extended";

export default function NewVsReturningPatientsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="New vs. Returning Patients Cohort Split"
        description="Longitudinal patient volume composition: first-time Qlyno registrations vs. recurring repeat patient visits."
        crumbs={[{ label: "Analytics & Growth" }, { label: "Analytics" }, { label: "New vs Returning" }]}
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
        <ScopeIndicator scope="Hospital Admin" stationName="Patient Cohort Composition Engine" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Rule F21-CAN-8 &amp; CANNOT-7: Resolved via unified Qlyno Patient ID history</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Unique Patients YTD</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">
            {mockNewVsReturningData.totalUniquePatients.toLocaleString()}
          </p>
          <span className="text-[10px] text-muted-foreground">Active hospital footprint</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">First-Time Registrations</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">
            {mockNewVsReturningData.newPatientsYTD.toLocaleString()} (42.0%)
          </p>
          <span className="text-[10px] text-cyan-600 font-medium">New patient inflow</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Returning Patients</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
            {mockNewVsReturningData.returningPatientsYTD.toLocaleString()} (58.0%)
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Repeat consultation base</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Repeat Visit Ratio</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">
            {mockNewVsReturningData.repeatVisitRatio}%
          </p>
          <span className="text-[10px] text-amber-600 font-medium">Cohort retention health</span>
        </Card>
      </div>

      {/* Monthly Volume Cohort Chart */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Monthly Patient Volume Split (New vs. Returning)
            </CardTitle>
            <CardDescription className="text-xs">
              First-time patient registrations vs recurring patient encounters tracked across monthly billing cycles.
            </CardDescription>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[9px]">
            58% Stable Retention
          </Badge>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockNewVsReturningData.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="period" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} />
                <RechartsTooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Bar dataKey="newPatients" name="New Patients (First Visit)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="returningPatients" name="Returning Patients (Repeat)" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Specialty New vs Returning Ratio Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">New Patient Inflow Ratio by Department</CardTitle>
          <CardDescription className="text-xs">
            Emergency &amp; Surgery naturally attract higher initial admissions, while Chronic Care wings maintain dominant returning cohorts.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Clinical Department</TableHead>
                  <TableHead className="text-xs font-bold text-center">New Patients</TableHead>
                  <TableHead className="text-xs font-bold text-center">Returning Patients</TableHead>
                  <TableHead className="text-xs font-bold text-center">Total Volume</TableHead>
                  <TableHead className="text-xs font-bold text-right">New Patient %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockNewVsReturningData.specialtySplit.map((s) => (
                  <TableRow key={s.department} className="hover:bg-muted/30 text-xs">
                    <TableCell className="font-semibold text-foreground">{s.department}</TableCell>
                    <TableCell className="text-center font-mono font-semibold text-cyan-600 dark:text-cyan-400">
                      {s.newPatients}
                    </TableCell>
                    <TableCell className="text-center font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {s.returningPatients}
                    </TableCell>
                    <TableCell className="text-center font-mono text-foreground">
                      {s.newPatients + s.returningPatients}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={
                          s.newPatientRatio >= 60
                            ? "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 text-[10px]"
                            : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                        }
                      >
                        {s.newPatientRatio}% New
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
