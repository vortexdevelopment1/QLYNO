"use client";

import React from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Badge } from "@/hospital-admin/components/ui/badge";
import {
  Scissors,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Stethoscope
} from "lucide-react";

export default function OTSurgeryHubPage() {
  const { cases } = useSelector((state: RootState) => state.surgical);
  const inProgressCases = cases.filter((c) => c.status === "In Progress" || c.status === "Scheduled").length;
  const emergencyCases = cases.filter((c) => c.urgency === "Emergency").length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Operation Theatre & Surgical Suite"
        description="Surgical case management, pre-op readiness clearances, OT room utilization, and surgeon schedule coordination."
        crumbs={[{ label: "Clinical Operations" }, { label: "OT & Surgery" }]}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Central Surgical Suite Command" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <Scissors className="h-3.5 w-3.5 text-primary" />
          <span>Surgical Safety Protocols &amp; Pre-Op Readiness Gate Enforced</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Surgical Cases</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{cases.length} Cases</p>
          <span className="text-[10px] text-muted-foreground">Elective &amp; emergency roster</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Active / Scheduled</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">{inProgressCases} Active</p>
          <span className="text-[10px] text-cyan-600 font-medium">OT theater utilization</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Emergency Cases</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">{emergencyCases} STAT</p>
          <span className="text-[10px] text-rose-600 font-medium">Life-critical override track</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Pre-Op Clearances</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">100% Gated</p>
          <span className="text-[10px] text-emerald-600 font-medium">Anesthesia, Blood &amp; Consent</span>
        </Card>
      </div>

      {/* Primary Sub-Section Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Surgical Cases */}
        <Card className="border-border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <Scissors className="h-4 w-4" />
              </div>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                Case Management
              </Badge>
            </div>
            <CardTitle className="text-base font-bold mt-2">Surgical Cases Registry</CardTitle>
            <CardDescription className="text-xs">
              Complete operative dossier, lead surgeon assignments, procedure coding, and post-operative recovery disposition.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="font-mono font-semibold text-foreground">Operative Registry</span>
              <Link href="/hospital-admin/surgical-cases" className="text-primary font-semibold hover:underline flex items-center gap-1">
                View Surgical Cases <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: OT Schedules */}
        <Card className="border-border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-600">
                <Calendar className="h-4 w-4" />
              </div>
              <Badge variant="outline" className="text-[10px] bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30">
                Theater Schedules
              </Badge>
            </div>
            <CardTitle className="text-base font-bold mt-2">OT Scheduling &amp; Utilization</CardTitle>
            <CardDescription className="text-xs">
              Multi-theatre visual calendar, turnover time optimization, anesthesia team allocation, and room readiness status.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="font-mono font-semibold text-foreground">Live Calendar</span>
              <Link href="/hospital-admin/ot-scheduling" className="text-primary font-semibold hover:underline flex items-center gap-1">
                Open OT Schedule <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Pre-Op Readiness Gate */}
        <Card className="border-border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                Safety Protocol
              </Badge>
            </div>
            <CardTitle className="text-base font-bold mt-2">Pre-Op Readiness Clearances</CardTitle>
            <CardDescription className="text-xs">
              Strict 4-point safety verification gate (Anesthesia PAC clearance, Blood cross-matching, Informed consent, and Implant availability).
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="font-mono font-semibold text-foreground">Safety Gate Check</span>
              <Link href="/hospital-admin/pre-op" className="text-primary font-semibold hover:underline flex items-center gap-1">
                Review Clearances <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Surgeon Requests */}
        <Card className="border-border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600">
                <Stethoscope className="h-4 w-4" />
              </div>
              <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30">
                Clinician Portal
              </Badge>
            </div>
            <CardTitle className="text-base font-bold mt-2">Surgeon Booking Requests</CardTitle>
            <CardDescription className="text-xs">
              Elective surgical slot requests submitted by attending consultants, equipment requisitions, and administrative approvals.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="font-mono font-semibold text-foreground">Consultant Requests</span>
              <Link href="/hospital-admin/surgical-cases/surgeon-requests" className="text-primary font-semibold hover:underline flex items-center gap-1">
                Process Requests <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
