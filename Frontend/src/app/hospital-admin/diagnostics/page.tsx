"use client";

import React from "react";
import Link from "next/link";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Badge } from "@/hospital-admin/components/ui/badge";
import {
  FlaskConical,
  Scan,
  FileCheck2,
  AlertTriangle,
  ArrowRight,
  Activity
} from "lucide-react";
import { mockExtendedLabOrders } from "@/hospital-admin/lib/mock-data/lab-extended-operations";
import { mockImagingSuites, mockExtendedRadiologyOrders } from "@/hospital-admin/lib/mock-data/radiology-extended-operations";

export default function DiagnosticsHubPage() {
  const pendingLab = mockExtendedLabOrders.filter((o) => o.status === "processing" || o.status === "sample-pending" || o.status === "collected").length;
  const criticalLab = mockExtendedLabOrders.filter((o) => o.critical === true || o.priority === "Stat").length;
  const activeImaging = mockExtendedRadiologyOrders.filter((o) => o.status === "In Progress" || o.status === "Scheduled").length;
  const operationalSuites = mockImagingSuites.filter((s) => s.status === "Available" || s.status === "In Use").length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Diagnostics & Imaging Center"
        description="Unified operations center for Pathology Laboratory, Radiology Imaging, Diagnostic Reports Archive, and STAT Critical Alerts."
        crumbs={[{ label: "Clinical Operations" }, { label: "Diagnostics" }]}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Central Diagnostics &amp; Radiology Console" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <Activity className="h-3.5 w-3.5 text-primary" />
          <span>Integrated Diagnostic Workflows: Laboratory • Modality Imaging • Reports Archive</span>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Active Lab Orders</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{pendingLab} In Queue</p>
          <span className="text-[10px] text-muted-foreground">Pathology &amp; Biochemistry</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Active Imaging Worklist</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">{activeImaging} Active</p>
          <span className="text-[10px] text-cyan-600 font-medium">CT, MRI, Digital X-Ray, Echo</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Operational Suites</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{operationalSuites} / {mockImagingSuites.length}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Biomedical machines online</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">STAT Critical Findings</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">{criticalLab} Flagged</p>
          <span className="text-[10px] text-rose-600 font-medium">Immediate clinician escalation</span>
        </Card>
      </div>

      {/* Primary Sub-Section Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Lab Card */}
        <Card className="border-border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <FlaskConical className="h-4 w-4" />
              </div>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                Pathology &amp; Biochemistry
              </Badge>
            </div>
            <CardTitle className="text-base font-bold mt-2">Pathology Laboratory</CardTitle>
            <CardDescription className="text-xs">
              Sample barcode accessioning, specimen collection tracking, test execution queues, and quality verification.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="font-mono font-semibold text-foreground">{mockExtendedLabOrders.length} Total Registered Tests</span>
              <Link href="/hospital-admin/lab" className="text-primary font-semibold hover:underline flex items-center gap-1">
                Open Lab Console <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Radiology Card */}
        <Card className="border-border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-600">
                <Scan className="h-4 w-4" />
              </div>
              <Badge variant="outline" className="text-[10px] bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30">
                PACS / RIS
              </Badge>
            </div>
            <CardTitle className="text-base font-bold mt-2">Radiology &amp; Imaging</CardTitle>
            <CardDescription className="text-xs">
              Modality worklist (MWL), CT/MRI scan scheduling, imaging suite availability, and radiologist interpretation queues.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="font-mono font-semibold text-foreground">{mockExtendedRadiologyOrders.length} Imaging Studies</span>
              <Link href="/hospital-admin/radiology" className="text-primary font-semibold hover:underline flex items-center gap-1">
                Open PACS Console <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Reports Archive Card */}
        <Card className="border-border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <FileCheck2 className="h-4 w-4" />
              </div>
              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                Verified Records
              </Badge>
            </div>
            <CardTitle className="text-base font-bold mt-2">Diagnostic Reports Archive</CardTitle>
            <CardDescription className="text-xs">
              Authorized diagnostic report release repository with tamper-evident digital signoffs and patient portal dispatch.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="font-mono font-semibold text-foreground">Digital Authorization Gate</span>
              <Link href="/hospital-admin/lab/reports" className="text-primary font-semibold hover:underline flex items-center gap-1">
                Browse Archive <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Critical Alerts Card */}
        <Card className="border-border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <Badge variant="destructive" className="text-[10px]">
                STAT Panic Values
              </Badge>
            </div>
            <CardTitle className="text-base font-bold mt-2">Critical &amp; STAT Findings</CardTitle>
            <CardDescription className="text-xs">
              Life-threatening emergency alert channel with automated bedside nurse and treating consultant escalation tracking.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="font-mono font-semibold text-rose-600">Immediate Clinical Escalation</span>
              <Link href="/hospital-admin/lab/critical" className="text-primary font-semibold hover:underline flex items-center gap-1">
                View STAT Queue <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
