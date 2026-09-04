"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bed,
  Bell,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Flame,
  Gauge,
  HeartPulse,
  Layers,
  Radio,
  RefreshCw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
  Zap,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Progress } from "@/hospital-admin/components/ui/progress";
import { Switch } from "@/hospital-admin/components/ui/switch";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { StaffCoverageHeatmap } from "@/hospital-admin/components/workforce/staff-coverage-heatmap";
import { useSelector } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import {
  mockHospitalHealthScore,
  mockOperationalIncidents,
  mockEmergencyPreArrivalPacket,
  mockEmergencyCapacitySignal,
} from "@/hospital-admin/lib/mock-data/proposed-features";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { cn, formatDateTime } from "@/hospital-admin/lib/utils";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Hospital Command Center";

export default function HospitalCommandCenterPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const emergencyCases = useSelector((state: RootState) => state.emergency.cases);
  const surgicalCases = useSelector((state: RootState) => state.surgical.cases);

  const [healthScore, setHealthScore] = useState(mockHospitalHealthScore);
  const [capacitySignal, setCapacitySignal] = useState(mockEmergencyCapacitySignal);
  const [incidents, setIncidents] = useState(mockOperationalIncidents);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRefreshTelemetry = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Command Telemetry Refreshed",
        description: `Live sensor feeds synchronized at ${new Date().toLocaleTimeString()}. (${DELEGATION_STRING})`,
      });
    }, 600);
  };

  const handleToggleNetworkBroadcast = (enabled: boolean) => {
    setCapacitySignal((prev) => ({
      ...prev,
      isPublishedToNetwork: enabled,
      lastPublishedAt: new Date().toISOString(),
    }));

    toast({
      title: enabled ? "Capacity Signal Published to Qlyno" : "Capacity Signal Broadcast Paused",
      description: enabled
        ? `Live ER & ICU capacity signals now streaming to central emergency routing network.`
        : `Hospital capacity hidden from automated emergency routing network.`,
    });
  };

  if (!mounted) return null;

  const activeEmergencies = emergencyCases.filter(
    (c) => c.status === "Hospital Notified" || c.status === "Ambulance Dispatched" || c.status === "Pre-Arrival"
  );
  const blockedSurgeries = surgicalCases.filter((s) => s.status === "Blocked" || s.readinessPercent < 100);
  const openIncidents = incidents.filter((i) => i.status !== "Resolved" && i.status !== "Closed");

  return (
    <div className="space-y-6 pb-12">
      {/* Scope Indicator & Header */}
      <div className="flex flex-col gap-2">
        <ScopeIndicator scope="Hospital Admin" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <PageHeader
                title="Hospital Command Center"
                description="Unified operational radar aggregating active emergencies, bed pressure, staffing shortages, surgical blockers, and safety incidents."
              />
              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30 shrink-0">
                PROPOSED FEATURE (PRD 22)
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-muted-foreground">Live Telemetry Active</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1.5"
              onClick={handleRefreshTelemetry}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
              Sync Sensors
            </Button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 1: HOSPITAL HEALTH SCORE & CAPACITY BROADCAST BAR      */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Overall Health Score Gauge */}
        <Card className="lg:col-span-2 border-border shadow-xs bg-linear-to-br from-card via-card to-primary/5">
          <CardHeader className="p-4 pb-2 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-sm font-bold">Hospital Health Score (Composite Index)</CardTitle>
                  <CardDescription className="text-[11px]">
                    Real-time operational health aggregated from 5 operational telemetry pipelines.
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                <Badge className="bg-emerald-600 text-white font-mono text-xs px-2 py-0.5">
                  Grade {healthScore.grade} • {healthScore.status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold font-mono text-primary tracking-tight">
                  {healthScore.overallScore}
                </span>
                <span className="text-sm text-muted-foreground font-mono">/ 100 Points</span>
              </div>
              <p className="text-xs text-muted-foreground max-w-md">
                Operational velocity is <strong className="text-foreground">Optimal</strong>. High emergency SLA compliance and low incident backlogs offset current peak ICU bed occupancy.
              </p>
            </div>

            {/* Sub-component progress bars */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 pt-1">
              {healthScore.components.map((comp) => (
                <div key={comp.id} className="p-2 rounded-lg border border-border/80 bg-background/60 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-muted-foreground truncate">{comp.category.split("&")[0]}</span>
                    <span className="font-mono font-bold text-primary">{comp.score}%</span>
                  </div>
                  <Progress value={comp.score} className="h-1.5" />
                  <span className="text-[9px] text-muted-foreground block truncate">{comp.keyMetric}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Capacity Signal (Feature 3) */}
        <Card className="border-border shadow-xs">
          <CardHeader className="p-4 pb-2 border-b border-border/50 bg-muted/20">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                <Radio className="h-4 w-4 text-emerald-600 animate-pulse" /> Emergency Capacity Signal
              </CardTitle>
              <Switch
                checked={capacitySignal.isPublishedToNetwork}
                onCheckedChange={handleToggleNetworkBroadcast}
              />
            </div>
            <CardDescription className="text-[11px]">
              Publish real-time emergency & bed capability to Qlyno Routing Network.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-md bg-muted/30">
              <span className="text-muted-foreground">Network Broadcast:</span>
              <Badge variant={capacitySignal.isPublishedToNetwork ? "default" : "secondary"} className="text-[10px]">
                {capacitySignal.isPublishedToNetwork ? "Broadcasting Live" : "Paused"}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-md border border-border bg-card">
                <span className="text-[10px] text-muted-foreground block">ER Bays Available</span>
                <span className="text-sm font-bold font-mono text-primary">
                  {capacitySignal.erBedAvailability}/{capacitySignal.erBedTotal}
                </span>
              </div>
              <div className="p-2 rounded-md border border-border bg-card">
                <span className="text-[10px] text-muted-foreground block">ICU Step-Down</span>
                <span className="text-sm font-bold font-mono text-primary">
                  {capacitySignal.icuBedsAvailable} Beds
                </span>
              </div>
            </div>
            <div className="pt-1 text-[10px] text-muted-foreground flex items-center justify-between">
              <span>Last Broadcast:</span>
              <span className="font-mono">{formatDateTime(capacitySignal.lastPublishedAt)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============================================================== */}
      {/* SECTION 2: COMMAND RADAR — 4 OPERATIONAL QUADRANTS            */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Quadrant 1: Active Emergencies (Features 1 & 2) */}
        <Card className="border-border shadow-xs border-l-4 border-l-rose-500">
          <CardHeader className="p-3.5 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold flex items-center gap-1.5 text-rose-600">
                <Flame className="h-4 w-4" /> Active Emergencies
              </CardTitle>
              <Badge variant="destructive" className="text-[10px] h-5">
                {activeEmergencies.length} Incoming
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-3.5 pt-0 space-y-2 text-xs">
            <p className="text-muted-foreground text-[11px]">
              Pre-arrival packet ready for {mockEmergencyPreArrivalPacket.patientName} (ETA: {mockEmergencyPreArrivalPacket.etaMinutes}m).
            </p>
            <div className="p-2 rounded-md bg-rose-500/10 border border-rose-500/20 text-[11px] space-y-1">
              <div className="flex items-center justify-between font-semibold text-rose-700 dark:text-rose-300">
                <span>{mockEmergencyPreArrivalPacket.patientName} ({mockEmergencyPreArrivalPacket.bloodGroup})</span>
                <span>{mockEmergencyPreArrivalPacket.vitals.spo2}% SpO2</span>
              </div>
              <p className="text-[10px] text-muted-foreground line-clamp-1">{mockEmergencyPreArrivalPacket.chiefComplaint}</p>
            </div>
            <Link href="/hospital-admin/emergency/emg_01" className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 pt-1">
              Open Pre-Arrival Packet <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Quadrant 2: Bed Pressure & ICU Turnaround (Features 1 & 13) */}
        <Card className="border-border shadow-xs border-l-4 border-l-amber-500">
          <CardHeader className="p-3.5 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold flex items-center gap-1.5 text-amber-600">
                <Bed className="h-4 w-4" /> Bed Pressure
              </CardTitle>
              <Badge variant="secondary" className="text-[10px] h-5 bg-amber-500/15 text-amber-700 dark:text-amber-300">
                88.4% Occupied
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-3.5 pt-0 space-y-2 text-xs">
            <p className="text-muted-foreground text-[11px]">
              MICU at 100% (12/12). 6 beds currently undergoing turnaround sanitization.
            </p>
            <div className="space-y-1.5 pt-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">General Beds:</span>
                <span className="font-semibold font-mono">18 Available</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cleaning Tasks:</span>
                <span className="font-semibold font-mono text-amber-600">6 In-Turnaround</span>
              </div>
            </div>
            <Link href="/hospital-admin/wards-beds/cleaning" className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 pt-1">
              View Turnaround Desk <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Quadrant 3: OT & Surgical Blockers (Features 1 & 7) */}
        <Card className="border-border shadow-xs border-l-4 border-l-primary">
          <CardHeader className="p-3.5 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold flex items-center gap-1.5 text-primary">
                <Zap className="h-4 w-4" /> Surgical Pipeline
              </CardTitle>
              <Badge variant="outline" className="text-[10px] h-5">
                {blockedSurgeries.length} Blocked
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-3.5 pt-0 space-y-2 text-xs">
            <p className="text-muted-foreground text-[11px]">
              1 surgical case gated pending implant delivery verification.
            </p>
            <div className="p-2 rounded-md bg-muted/40 border border-border text-[11px] space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Total Knee Replacement</span>
                <Badge variant="outline" className="text-[9px] text-amber-600 border-amber-500/30">75% Ready</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">Waiting: Zimmer Biomet Stryker Implant</p>
            </div>
            <Link href="/hospital-admin/surgical-cases" className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 pt-1">
              Open Surgical Readiness <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Quadrant 4: Operational Incidents (Features 1 & 14) */}
        <Card className="border-border shadow-xs border-l-4 border-l-indigo-500">
          <CardHeader className="p-3.5 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold flex items-center gap-1.5 text-indigo-600">
                <ShieldAlert className="h-4 w-4" /> Safety Incidents
              </CardTitle>
              <Badge variant="secondary" className="text-[10px] h-5 bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">
                {openIncidents.length} Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-3.5 pt-0 space-y-2 text-xs">
            <p className="text-muted-foreground text-[11px]">
              1 P1 equipment incident under biomedical team investigation.
            </p>
            <div className="p-2 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[11px] space-y-0.5">
              <span className="font-semibold text-indigo-900 dark:text-indigo-200 block truncate">
                {incidents[0]?.title}
              </span>
              <span className="text-[10px] text-muted-foreground">{incidents[0]?.department}</span>
            </div>
            <Link href="/hospital-admin/incidents" className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 pt-1">
              Manage Incident Registry <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* ============================================================== */}
      {/* SECTION 3: STAFF COVERAGE HEATMAP (Feature 8)                 */}
      {/* ============================================================== */}
      <StaffCoverageHeatmap />
    </div>
  );
}
