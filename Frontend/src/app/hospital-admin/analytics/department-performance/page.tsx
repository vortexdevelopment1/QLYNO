"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Bed,
  Clock,
  Activity,
  ShieldCheck,
  Layers,
  HeartPulse,
  Wallet,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { AnalyticsNav } from "@/hospital-admin/components/analytics/analytics-nav";
import { mockDepartmentPerformanceData } from "@/hospital-admin/lib/mock-data/analytics-extended";
import { formatCurrency } from "@/hospital-admin/lib/utils";

export default function DepartmentPerformanceAnalyticsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Department Operational &amp; Clinical Throughput"
        description="Multi-wing operational capacity: bed occupancy rates, average length of stay (ALOS), 30-day readmission benchmarks, and surgical OT utilization."
        crumbs={[{ label: "Analytics & Growth" }, { label: "Analytics" }, { label: "Department Performance" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 text-xs font-semibold gap-1.5" asChild>
              <Link href="/hospital-admin/financial-reports/department-revenue">
                <Wallet className="h-3.5 w-3.5 text-primary" /> F18 Department Revenue
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
        <ScopeIndicator scope="Hospital Admin" stationName="Departmental Operational Telemetry Deck" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Rule F21-CAN-10 &amp; CANNOT-3: Operational dimensions with F18 Department Revenue cross-reference</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Hospital Bed Occupancy</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">
            {mockDepartmentPerformanceData.hospitalBedOccupancy}%
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Sourced from Wards &amp; Beds (F12)</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Hospital-Wide ALOS</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">
            {mockDepartmentPerformanceData.hospitalAlosDays} Days
          </p>
          <span className="text-[10px] text-cyan-600 font-medium">NABH Target: 3.5 - 4.5 Days</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">30-Day Readmission Rate</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
            {mockDepartmentPerformanceData.hospitalReadmissionRate}%
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">National Benchmark: &lt;5.0%</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Monitored Specialty Wings</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">
            {mockDepartmentPerformanceData.departments.length} Super Specialties
          </p>
          <span className="text-[10px] text-muted-foreground">Full clinical governance</span>
        </Card>
      </div>

      {/* Department Performance Matrix Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Clinical Department Operational Scorecard</CardTitle>
          <CardDescription className="text-xs">
            OPD/IPD patient throughput, bed occupancy efficiency, average length of stay, and surgical procedural counts.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Clinical Department</TableHead>
                  <TableHead className="text-xs font-bold text-center">Total Volume</TableHead>
                  <TableHead className="text-xs font-bold text-center">OPD Consults</TableHead>
                  <TableHead className="text-xs font-bold text-center">IPD Admissions</TableHead>
                  <TableHead className="text-xs font-bold text-center">Bed Occupancy</TableHead>
                  <TableHead className="text-xs font-bold text-center">ALOS</TableHead>
                  <TableHead className="text-xs font-bold text-center">Readmissions</TableHead>
                  <TableHead className="text-xs font-bold text-center">OT Surgeries</TableHead>
                  <TableHead className="text-xs font-bold text-right text-emerald-700 dark:text-emerald-300">
                    F18 Revenue
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockDepartmentPerformanceData.departments.map((dept) => (
                  <TableRow key={dept.departmentId} className="hover:bg-muted/30 text-xs">
                    <TableCell className="font-semibold text-foreground">{dept.departmentName}</TableCell>
                    <TableCell className="text-center font-mono font-bold text-primary">
                      {dept.totalPatientVolume.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center font-mono text-muted-foreground">
                      {dept.opdConsultations}
                    </TableCell>
                    <TableCell className="text-center font-mono text-muted-foreground">{dept.ipdAdmissions}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={
                          dept.bedOccupancyRate >= 90
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                            : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                        }
                      >
                        {dept.bedOccupancyRate}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-mono font-semibold text-foreground">
                      {dept.alosDays}d
                    </TableCell>
                    <TableCell className="text-center font-mono text-emerald-600 dark:text-emerald-400">
                      {dept.readmissionRate30Day}%
                    </TableCell>
                    <TableCell className="text-center font-mono font-bold text-purple-600">
                      {dept.otSurgeriesPerformed}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(dept.f18GrossRevenue)}
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
