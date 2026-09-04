"use client";

import React from "react";
import Link from "next/link";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Badge } from "@/hospital-admin/components/ui/badge";
import {
  KeyRound,
  Laptop,
  Flame,
  ArrowRight,
  Lock,
  History
} from "lucide-react";
import { mockBreakGlassSessions, mockDetailedAuditLogs } from "@/hospital-admin/lib/mock-data/security-operations";

export default function SecurityAuditHubPage() {
  const activeBreakGlass = mockBreakGlassSessions.filter((s) => s.status === "Active").length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Security, RBAC & Audit Trails"
        description="Enterprise access management, multi-role permission matrices, active session audits, break-glass overrides, and immutable system audit logs."
        crumbs={[{ label: "Governance" }, { label: "Security & Audit" }]}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Hospital Information Security Console" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <Lock className="h-3.5 w-3.5 text-primary" />
          <span>Role-Based Access Control &amp; Immutable Forensics Logging Enforced</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">RBAC Roles</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">8 System Roles</p>
          <span className="text-[10px] text-primary font-medium">Role-Based Access Active</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Break-Glass Status</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">{activeBreakGlass} Active</p>
          <span className="text-[10px] text-rose-600 font-medium">Emergency access overrides</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">MFA Enforcement</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">100% Admin</p>
          <span className="text-[10px] text-emerald-600 font-medium">FIDO2 / Authenticator app</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Audit Records</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">{mockDetailedAuditLogs.length} Events</p>
          <span className="text-[10px] text-muted-foreground">Immutable forensic ledger</span>
        </Card>
      </div>

      {/* Primary Sub-Section Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Role Permissions */}
        <Card className="border-border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <KeyRound className="h-4 w-4" />
              </div>
              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                RBAC Core
              </Badge>
            </div>
            <CardTitle className="text-base font-bold mt-2">Roles &amp; Permission Matrix</CardTitle>
            <CardDescription className="text-xs">
              Granular access controls across clinical departments, financial ledgers, emergency commands, and administrative functions.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="font-mono font-semibold text-foreground">Least Privilege Protocol</span>
              <Link href="/hospital-admin/roles" className="text-primary font-semibold hover:underline flex items-center gap-1">
                Configure Roles <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Break Glass */}
        <Card className="border-border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600">
                <Flame className="h-4 w-4" />
              </div>
              <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30">
                Emergency Overrides
              </Badge>
            </div>
            <CardTitle className="text-base font-bold mt-2">Break-Glass Emergency Protocol</CardTitle>
            <CardDescription className="text-xs">
              Time-bounded emergency record access overrides for trauma and critical care situations with mandatory audit reason logging.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="font-mono font-semibold text-rose-600">{activeBreakGlass} Override(s) Active</span>
              <Link href="/hospital-admin/security/break-glass" className="text-primary font-semibold hover:underline flex items-center gap-1">
                Open Break-Glass Desk <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Sessions & MFA */}
        <Card className="border-border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                <Laptop className="h-4 w-4" />
              </div>
              <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30">
                Terminal Governance
              </Badge>
            </div>
            <CardTitle className="text-base font-bold mt-2">Active Sessions &amp; MFA</CardTitle>
            <CardDescription className="text-xs">
              Active workstation terminal sessions, multi-factor authentication enrollment, idle logout policies, and IP anomaly monitoring.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="font-mono font-semibold text-foreground">Device Security Desk</span>
              <Link href="/hospital-admin/security/sessions" className="text-primary font-semibold hover:underline flex items-center gap-1">
                View Active Terminals <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Audit Logs */}
        <Card className="border-border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <History className="h-4 w-4" />
              </div>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                Forensics
              </Badge>
            </div>
            <CardTitle className="text-base font-bold mt-2">System Audit &amp; Event Logs</CardTitle>
            <CardDescription className="text-xs">
              Immutable telemetry log recording all patient record views, medication dispensing events, financial modifications, and privilege escalations.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="font-mono font-semibold text-foreground">Tamper-Evident Trail</span>
              <Link href="/hospital-admin/audit-logs" className="text-primary font-semibold hover:underline flex items-center gap-1">
                Inspect Audit Ledger <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
