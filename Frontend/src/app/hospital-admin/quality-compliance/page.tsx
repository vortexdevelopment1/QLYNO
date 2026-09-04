"use client";

import React from "react";
import Link from "next/link";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Badge } from "@/hospital-admin/components/ui/badge";
import {
  ShieldCheck,
  Award,
  AlertOctagon,
  FileSpreadsheet,
  BookOpen,
  ArrowRight
} from "lucide-react";
import { mockVerificationCases } from "@/hospital-admin/lib/mock-data/verification-cases";

export default function QualityComplianceHubPage() {
  const verifiedDoctors = mockVerificationCases.filter((c) => c.status === "Verified").length;
  const pendingCases = mockVerificationCases.filter((c) => c.status === "Under Review" || c.status === "Pending" || c.status === "Needs More Information").length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Quality, Accreditation & Compliance"
        description="Governance console for NABH/NABL hospital clinical policies, doctor credentialing, statutory audits, and incident reporting."
        crumbs={[{ label: "Governance" }, { label: "Quality & Compliance" }]}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Hospital Quality &amp; Clinical Safety Board" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Statutory Compliance &amp; Accreditation Standards Enforced</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Credentialed Staff</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{verifiedDoctors} Verified</p>
          <span className="text-[10px] text-muted-foreground">State Medical Council verified</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Pending Audits</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{pendingCases} Cases</p>
          <span className="text-[10px] text-amber-600 font-medium">Awaiting primary source checks</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Hospital SOPs</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">Active</p>
          <span className="text-[10px] text-primary font-medium">NABH 5th Edition standards</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Compliance Rate</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">99.4%</p>
          <span className="text-[10px] text-emerald-600 font-medium">Zero critical regulatory breaches</span>
        </Card>
      </div>

      {/* Primary Sub-Section Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Verifications */}
        <Card className="border-border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <Award className="h-4 w-4" />
              </div>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                Licensure Gate
              </Badge>
            </div>
            <CardTitle className="text-base font-bold mt-2">Doctor &amp; Staff Credentialing</CardTitle>
            <CardDescription className="text-xs">
              Primary source verification for Medical Council registrations, specialty board degrees, and hospital privilege delegations.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="font-mono font-semibold text-foreground">{mockVerificationCases.length} Verification Dossiers</span>
              <Link href="/hospital-admin/verification" className="text-primary font-semibold hover:underline flex items-center gap-1">
                Open Credential Desk <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Incident Management */}
        <Card className="border-border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600">
                <AlertOctagon className="h-4 w-4" />
              </div>
              <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30">
                Clinical Safety
              </Badge>
            </div>
            <CardTitle className="text-base font-bold mt-2">Operational &amp; Clinical Incidents</CardTitle>
            <CardDescription className="text-xs">
              Sentinel event reporting, near-miss logging, root cause analysis (RCA), and corrective action plan (CAPA) tracking.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="font-mono font-semibold text-foreground">Continuous Quality Improvement</span>
              <Link href="/hospital-admin/incidents" className="text-primary font-semibold hover:underline flex items-center gap-1">
                View Incident Board <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Nursing Audit Logs */}
        <Card className="border-border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
              <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30">
                Clinical Audits
              </Badge>
            </div>
            <CardTitle className="text-base font-bold mt-2">Nursing &amp; Care Audit Logs</CardTitle>
            <CardDescription className="text-xs">
              Medication administration records (MAR), handover checks, patient safety round verifications, and compliance checklists.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="font-mono font-semibold text-foreground">Inpatient Quality Metrics</span>
              <Link href="/hospital-admin/nursing-audit-logs" className="text-primary font-semibold hover:underline flex items-center gap-1">
                Open Care Audits <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Documents & SOPs */}
        <Card className="border-border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <BookOpen className="h-4 w-4" />
              </div>
              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                Hospital SOPs
              </Badge>
            </div>
            <CardTitle className="text-base font-bold mt-2">Hospital Policies &amp; Guidelines</CardTitle>
            <CardDescription className="text-xs">
              NABH/NABL hospital protocols, infection control guidelines, clinical practice protocols, and statutory regulatory filings.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="font-mono font-semibold text-foreground">Document Version Control</span>
              <Link href="/hospital-admin/documents" className="text-primary font-semibold hover:underline flex items-center gap-1">
                Access Policy Repository <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
