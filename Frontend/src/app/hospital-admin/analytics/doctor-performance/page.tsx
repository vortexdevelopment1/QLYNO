"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Stethoscope,
  Star,
  Clock,
  UserX,
  Activity,
  ShieldCheck,
  ShieldAlert,
  Layers,
  Search,
  Lock,
  Unlock,
  ExternalLink,
  Wallet,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { Input } from "@/hospital-admin/components/ui/input";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { AnalyticsNav } from "@/hospital-admin/components/analytics/analytics-nav";
import { mockDoctorPerformanceData } from "@/hospital-admin/lib/mock-data/analytics-extended";
import { formatCurrency } from "@/hospital-admin/lib/utils";

export default function DoctorPerformanceAnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [hasPermission, setHasPermission] = useState(true); // Controlled by sensitive data permission rule F21-CANNOT-6

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const filteredDoctors = mockDoctorPerformanceData.doctors.filter(
    (d) =>
      d.doctorName.toLowerCase().includes(search.toLowerCase()) ||
      d.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Doctor Clinical &amp; Operational Performance"
        description="Physician consultation volumes, average encounter durations, no-show rates, patient review scores, and surgical OT throughput."
        crumbs={[{ label: "Analytics & Growth" }, { label: "Analytics" }, { label: "Doctor Performance" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 text-xs font-semibold gap-1.5" asChild>
              <Link href="/hospital-admin/financial-reports/doctor-revenue">
                <Wallet className="h-3.5 w-3.5 text-primary" /> F18 Doctor Revenue
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
        <ScopeIndicator scope="Hospital Admin" stationName="Physician Operational Governance Deck" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
          <span>Rule F21-CAN-9 &amp; CANNOT-6: Sensitive physician performance with F18 financial cross-reference</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Active Medical Consultants</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">
            {mockDoctorPerformanceData.totalActiveDoctors} Clinicians
          </p>
          <span className="text-[10px] text-muted-foreground">Across 18 super specialties</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Avg Consultation Duration</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">
            {mockDoctorPerformanceData.hospitalAvgConsultDuration} mins
          </p>
          <span className="text-[10px] text-cyan-600 font-medium">SLA Target: 15-25 mins</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Average Doctor Rating</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5 flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> {mockDoctorPerformanceData.avgDoctorRating} / 5.0
          </p>
          <span className="text-[10px] text-amber-600 font-medium">Verified patient feedback</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Avg Booking No-Show Rate</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
            {mockDoctorPerformanceData.avgNoShowRate}%
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Hospital Benchmark: &lt;6.0%</span>
        </Card>
      </div>

      {/* Sensitive Data Permission Banner */}
      <div className="p-3 bg-muted/20 rounded-xl border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          {hasPermission ? (
            <Unlock className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <Lock className="h-4 w-4 text-amber-600 shrink-0" />
          )}
          <div>
            <span className="font-bold text-foreground block">
              Sensitive Physician Governance &amp; Revenue Telemetry (Rule F21-CANNOT-6)
            </span>
            <span className="text-muted-foreground text-[11px]">
              Financial gross and net realizations are read strictly from F18 Doctor Revenue ground truth.
            </span>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs font-semibold shrink-0"
          onClick={() => setHasPermission((prev) => !prev)}
        >
          {hasPermission ? "Mask Financial Slices" : "Reveal Financial Slices"}
        </Button>
      </div>

      {/* Doctor Performance Roster Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-bold">Physician Performance Matrix</CardTitle>
            <CardDescription className="text-xs">
              Operational metrics combined with verified patient ratings and OT procedure volumes.
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search doctor or specialty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs h-8"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Doctor &amp; Specialty</TableHead>
                  <TableHead className="text-xs font-bold text-center">Consults Completed</TableHead>
                  <TableHead className="text-xs font-bold text-center">Avg Duration</TableHead>
                  <TableHead className="text-xs font-bold text-center">No-Show %</TableHead>
                  <TableHead className="text-xs font-bold text-center">Patient Rating</TableHead>
                  <TableHead className="text-xs font-bold text-center">OT Surgeries</TableHead>
                  {hasPermission && (
                    <>
                      <TableHead className="text-xs font-bold text-right text-teal-700 dark:text-teal-300">
                        F18 Gross Revenue
                      </TableHead>
                      <TableHead className="text-xs font-bold text-right text-emerald-700 dark:text-emerald-300">
                        F18 Net Realized
                      </TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDoctors.map((doc) => (
                  <TableRow key={doc.doctorId} className="hover:bg-muted/30 text-xs">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">{doc.doctorName}</span>
                        <span className="text-[11px] text-muted-foreground">{doc.department}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-mono font-semibold text-primary">
                      {doc.completedConsultations} / {doc.appointmentVolume}
                    </TableCell>
                    <TableCell className="text-center font-mono text-muted-foreground">
                      {doc.avgConsultDurationMinutes} mins
                    </TableCell>
                    <TableCell className="text-center font-mono text-amber-600">
                      {doc.noShowRate}%
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1 font-mono font-semibold text-amber-600">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        <span>{doc.patientRating}</span>
                        <span className="text-[10px] text-muted-foreground">({doc.totalReviews})</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-mono font-bold text-purple-600">
                      {doc.otProceduresCount > 0 ? doc.otProceduresCount : "—"}
                    </TableCell>
                    {hasPermission && (
                      <>
                        <TableCell className="text-right font-mono font-semibold text-teal-600 dark:text-teal-400">
                          {formatCurrency(doc.f18GrossRevenue)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(doc.f18NetRealized)}
                        </TableCell>
                      </>
                    )}
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
