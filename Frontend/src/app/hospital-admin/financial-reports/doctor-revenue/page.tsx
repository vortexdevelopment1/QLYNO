"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Lock,
  Search,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  TrendingUp,
  Users,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { FinancialReportsNav } from "@/hospital-admin/components/financial-reports/financial-reports-nav";
import {
  mockDoctorRevenues,
  getScaledDoctorRevenues,
} from "@/hospital-admin/lib/mock-data/financial-reports";

export default function DoctorRevenueReportPage() {
  const [mounted, setMounted] = useState(false);
  const [period, setPeriod] = useState("This Month");
  const [search, setSearch] = useState("");

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
  const scaledDoctors = getScaledDoctorRevenues(multiplier);

  const totalDoctorGross = scaledDoctors.reduce((acc, curr) => acc + curr.totalAttributedRevenue, 0);
  const totalConsultations = scaledDoctors.reduce((acc, curr) => acc + curr.consultationRevenue, 0);
  const totalSurgeries = scaledDoctors.reduce((acc, curr) => acc + curr.surgicalProcedureRevenue, 0);
  const totalIpdSupervised = scaledDoctors.reduce((acc, curr) => acc + curr.ipdRevenueAttributed, 0);

  const filteredDoctors = scaledDoctors.filter((d) =>
    d.doctorName.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Scope & Header */}
      <div className="flex flex-col gap-2">
        <ScopeIndicator scope="Hospital Admin" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/hospital-admin/financial-reports">
              <Button variant="outline" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <PageHeader
              title="Doctor-Wise Revenue Attribution Report"
              description="Revenue generated per physician: OPD consultations, surgical procedures performed, and inpatient admissions supervised."
              crumbs={[
                { label: "Finance" },
                { label: "Financial Reports", href: "/hospital-admin/financial-reports" },
                { label: "Doctor Revenue" },
              ]}
            />
          </div>
          <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30">
            Integrated Source: Clinician Invoicing &amp; Consultation Ledger
          </Badge>
        </div>
      </div>

      <FinancialReportsNav period={period} onPeriodChange={setPeriod} />

      {/* Sensitive Compensation Notice */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200">
        <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
        <div>
          <span className="font-bold">Sensitive Compensation-Adjacent Financial Data:</span> Physician revenue attribution is governed by data-minimization and role-based access policies (Section 14). Access logs are recorded.
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Attributed Revenue</span>
          <p className="text-xl font-bold font-mono text-foreground mt-1">₹{(totalDoctorGross / 100000).toFixed(2)} L</p>
          <span className="text-[10px] text-muted-foreground">Across all medical staff</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Surgical Procedures</span>
          <p className="text-xl font-bold font-mono text-primary mt-1">₹{(totalSurgeries / 100000).toFixed(2)} L</p>
          <span className="text-[10px] text-muted-foreground">OT &amp; Cath Lab cases</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">IPD Care Supervision</span>
          <p className="text-xl font-bold font-mono text-blue-600 mt-1">₹{(totalIpdSupervised / 100000).toFixed(2)} L</p>
          <span className="text-[10px] text-muted-foreground">Inpatient admissions</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">OPD Consultations</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-1">₹{(totalConsultations / 100000).toFixed(2)} L</p>
          <span className="text-[10px] text-muted-foreground">Outpatient visits</span>
        </Card>
      </div>

      {/* Doctor Revenue Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-3 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold">Physician Financial Attribution Ledger</CardTitle>
              <CardDescription className="text-xs">
                Calculated by summing consultation receipts, procedure charges, and attending physician inpatient fees.
              </CardDescription>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Filter physician..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 text-xs">
                <TableHead className="font-bold">Doctor Name &amp; Specialty</TableHead>
                <TableHead className="font-bold text-right">Patient Volume</TableHead>
                <TableHead className="font-bold text-right">OPD Consultations</TableHead>
                <TableHead className="font-bold text-right">Surgical Procedures</TableHead>
                <TableHead className="font-bold text-right">IPD Admissions</TableHead>
                <TableHead className="font-bold text-right">Total Attributed Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDoctors.map((doc) => (
                <TableRow key={doc.doctorId} className="hover:bg-muted/30 text-xs transition-colors">
                  <TableCell className="font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-3.5 w-3.5 text-primary" />
                      <span>{doc.doctorName}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-normal ml-5.5">{doc.specialty}</span>
                  </TableCell>
                  <TableCell className="font-mono text-right text-muted-foreground">{doc.patientVolume}</TableCell>
                  <TableCell className="font-mono text-right">₹{doc.consultationRevenue.toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-right text-primary font-semibold">
                    ₹{doc.surgicalProcedureRevenue.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-mono text-right text-blue-600 font-semibold">
                    ₹{doc.ipdRevenueAttributed.toLocaleString()} ({doc.ipdAdmissionsSupervised} admits)
                  </TableCell>
                  <TableCell className="font-mono font-bold text-right text-emerald-600">
                    ₹{doc.totalAttributedRevenue.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
