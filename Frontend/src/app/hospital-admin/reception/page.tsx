"use client";

import React from "react";
import Link from "next/link";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Badge } from "@/hospital-admin/components/ui/badge";
import {
  Users2,
  Clock,
  CalendarCheck,
  ArrowRight,
  UserCheck
} from "lucide-react";
import { receptionists } from "@/hospital-admin/lib/mock-data/staff";

export default function ReceptionHubPage() {
  const activeStaff = receptionists.filter((r) => r.status === "active").length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Reception & Front-Desk Operations"
        description="Reception desk allocation, OPD patient registration tokens, queue flow metrics, and front-desk exception management."
        crumbs={[{ label: "Workforce" }, { label: "Reception" }]}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Hospital Front-Desk &amp; Patient Access Console" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <Users2 className="h-3.5 w-3.5 text-primary" />
          <span>Patient Intake &amp; Queue Flow Optimization Active</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Front-Desk Staff</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{receptionists.length} Staff</p>
          <span className="text-[10px] text-muted-foreground">{activeStaff} Active on duty</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Average Wait Time</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">8.4 mins</p>
          <span className="text-[10px] text-emerald-600 font-medium">OPD token to consultation</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Today's Registrations</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">142 Tokens</p>
          <span className="text-[10px] text-cyan-600 font-medium">Walk-ins &amp; scheduled visits</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Desk Occupancy</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">100%</p>
          <span className="text-[10px] text-primary font-medium">All registration bays manned</span>
        </Card>
      </div>

      {/* Primary Sub-Section Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Receptionists */}
        <Card className="border-border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <UserCheck className="h-4 w-4" />
              </div>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                Front-Desk Team
              </Badge>
            </div>
            <CardTitle className="text-base font-bold mt-2">Reception Staff Directory</CardTitle>
            <CardDescription className="text-xs">
              Front-desk receptionist rosters, shift allocations, counter assignments, and performance telemetry.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="font-mono font-semibold text-foreground">Staff Management</span>
              <Link href="/hospital-admin/staff/receptionists" className="text-primary font-semibold hover:underline flex items-center gap-1">
                Manage Staff <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: OPD Queue */}
        <Card className="border-border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-600">
                <Clock className="h-4 w-4" />
              </div>
              <Badge variant="outline" className="text-[10px] bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30">
                Live Queue Flow
              </Badge>
            </div>
            <CardTitle className="text-base font-bold mt-2">OPD Queue &amp; Wait Times</CardTitle>
            <CardDescription className="text-xs">
              Real-time patient triage queue, doctor consultation progress, token calling display, and bottleneck resolution.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="font-mono font-semibold text-foreground">Live OPD Flow</span>
              <Link href="/hospital-admin/appointments/opd-queue" className="text-primary font-semibold hover:underline flex items-center gap-1">
                Monitor Queue <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Appointments */}
        <Card className="border-border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <CalendarCheck className="h-4 w-4" />
              </div>
              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                Bookings
              </Badge>
            </div>
            <CardTitle className="text-base font-bold mt-2">Appointment Scheduling</CardTitle>
            <CardDescription className="text-xs">
              Advance appointment slots, doctor availability lookup, patient SMS notifications, and walk-in scheduling.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="font-mono font-semibold text-foreground">Booking Desk</span>
              <Link href="/hospital-admin/appointments" className="text-primary font-semibold hover:underline flex items-center gap-1">
                Book Appointments <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
