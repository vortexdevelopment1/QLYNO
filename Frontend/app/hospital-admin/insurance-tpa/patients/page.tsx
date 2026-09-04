"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Filter,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
  Users,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { InsuranceNav } from "@/hospital-admin/components/insurance-tpa/InsuranceNav";
import { mockInsurancePatients } from "@/hospital-admin/lib/mock-data/insurance-tpa-extended";
import { InsurancePatientRecord } from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { formatDateTime, formatDate, formatCurrency, cn } from "@/hospital-admin/lib/utils";

export default function InsurancePatientsPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [patients, setPatients] = useState<InsurancePatientRecord[]>(mockInsurancePatients);
  const [search, setSearch] = useState("");
  const [tpaFilter, setTpaFilter] = useState("all");

  useEffect(() => {
    setMounted(true);
  }, []);

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const matchSearch =
        p.patientName.toLowerCase().includes(search.toLowerCase()) ||
        p.patientId.toLowerCase().includes(search.toLowerCase()) ||
        p.policyNo.toLowerCase().includes(search.toLowerCase()) ||
        p.tpaProvider.toLowerCase().includes(search.toLowerCase());

      const matchTpa = tpaFilter === "all" || p.tpaProvider === tpaFilter;
      return matchSearch && matchTpa;
    });
  }, [patients, search, tpaFilter]);

  const totalInsuredPatients = patients.length;
  const totalCoveragePool = useMemo(() => patients.reduce((sum, p) => sum + p.totalSumInsured, 0), [patients]);
  const availableCoveragePool = useMemo(() => patients.reduce((sum, p) => sum + p.availableCoverage, 0), [patients]);

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Insurance Patients Registry"
          description="Patient-centric registry of active cashless insurance coverage, policy limits, and linked claims."
          crumbs={[{ label: "Finance" }, { label: "Insurance / TPA", href: "/hospital-admin/insurance-tpa" }, { label: "Patients" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading patient registry...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Insurance Patients Registry"
        description="Patient-centric registry of active cashless insurance coverage, policy limits, and linked claims."
        crumbs={[{ label: "Finance" }, { label: "Insurance / TPA", href: "/hospital-admin/insurance-tpa" }, { label: "Patients" }]}
        actions={
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs font-semibold gap-1.5"
            asChild
          >
            <Link href="/hospital-admin/patients">
              <User className="h-3.5 w-3.5 text-primary" /> Hospital Master Patients
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Patient Insurance Relations Desk" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-primary" />
          <span>Patient Index Sync • Reads patient identity from Master Patient Index; zero duplicate records</span>
        </div>
      </div>

      <InsuranceNav />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Active Insured Patients</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{totalInsuredPatients} Enrolled</p>
          <span className="text-[10px] text-emerald-600 font-medium">Verified Active Policies</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Sum Insured Pool</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">{formatCurrency(totalCoveragePool)}</p>
          <span className="text-[10px] text-muted-foreground">Cumulative Coverage Limit</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Available Balance Pool</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{formatCurrency(availableCoveragePool)}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Unutilized Coverage</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Active Claim Admissions</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">4 Inpatients</p>
          <span className="text-[10px] text-muted-foreground">Linked to Live Claims</span>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Active Insured Patients Registry
            </CardTitle>
            <CardDescription className="text-xs">
              Patients with active TPA, corporate group health, or government scheme insurance relationships.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search patient, UHID, policy..."
                className="pl-8 text-xs h-8 w-60"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2">
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Patient &amp; UHID</TableHead>
                  <TableHead className="text-xs font-bold">Demographics</TableHead>
                  <TableHead className="text-xs font-bold">TPA &amp; Policy #</TableHead>
                  <TableHead className="text-xs font-bold">Coverage Plan</TableHead>
                  <TableHead className="text-xs font-bold text-right">Sum Insured</TableHead>
                  <TableHead className="text-xs font-bold text-right">Available Balance</TableHead>
                  <TableHead className="text-xs font-bold text-center">Active Claims</TableHead>
                  <TableHead className="text-xs font-bold text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id} className="hover:bg-muted/30 text-xs">
                    <TableCell>
                      <Link href={`/hospital-admin/patients`} className="font-semibold text-foreground hover:text-primary hover:underline">
                        {p.patientName}
                      </Link>
                      <span className="text-[10px] font-mono text-muted-foreground block">{p.patientId}</span>
                    </TableCell>

                    <TableCell>
                      <div>{p.gender}, {p.age} yrs</div>
                      <span className="text-[10px] text-muted-foreground">{p.contactNo}</span>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="text-[10px] bg-muted/30 font-medium">
                        {p.tpaProvider}
                      </Badge>
                      <span className="text-[10px] font-mono text-muted-foreground block mt-0.5">{p.policyNo}</span>
                    </TableCell>

                    <TableCell>
                      <span className="font-medium text-foreground">{p.coverageType}</span>
                      <span className="text-[10px] text-muted-foreground block">
                        Insured: {p.primaryInsuredName} ({p.relationship})
                      </span>
                    </TableCell>

                    <TableCell className="text-right font-mono font-medium">
                      {formatCurrency(p.totalSumInsured)}
                    </TableCell>

                    <TableCell className="text-right font-mono font-bold text-emerald-600">
                      {formatCurrency(p.availableCoverage)}
                    </TableCell>

                    <TableCell className="text-center">
                      {p.activeClaimsCount > 0 ? (
                        <Badge className="bg-primary/15 text-primary border-primary/30 text-[9px]">
                          {p.activeClaimsCount} Active Claim
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] text-muted-foreground">
                          0 Active
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-[11px] text-primary"
                        asChild
                      >
                        <Link href={`/hospital-admin/insurance-tpa`}>
                          View Claims
                        </Link>
                      </Button>
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
