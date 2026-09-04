"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import {
  Activity,
  AlertTriangle,
  Building,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  Radio,
  RefreshCw,
  Scissors,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/hospital-admin/components/ui/button";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { SurgicalNav } from "@/hospital-admin/components/surgical/surgical-nav";
import { cn } from "@/hospital-admin/lib/utils";

export default function OTAvailabilityPage() {
  const { otRooms, cases } = useSelector((state: RootState) => state.surgical);

  const availableCount = otRooms.filter((r) => r.status === "Available").length;
  const occupiedCount = otRooms.filter((r) => r.status === "Occupied").length;
  const maintCount = otRooms.filter((r) => r.status === "Maintenance").length;
  const turnoverCount = otRooms.filter((r) => r.status === "Cleaning-Turnover").length;

  const totalActive = otRooms.filter((r) => r.status !== "Decommissioned").length;
  const overallOccupancy = totalActive > 0 ? Math.round((occupiedCount / totalActive) * 100) : 0;

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Real-Time OT Live Availability Snapshot"
        description="Instant visual status of all operation theatres, turnover sterilization timers, and emergency readiness."
        crumbs={[{ label: "OT & Surgeries" }, { label: "OT Live Availability" }]}
        actions={
          <Button size="sm" asChild className="bg-rose-600 hover:bg-rose-700 text-white font-semibold gap-1.5 text-xs">
            <Link href="/hospital-admin/surgical-cases/emergency">
              <Zap className="h-4 w-4" /> Fast-Track Emergency Surgery
            </Link>
          </Button>
        }
      />

      <SurgicalNav />

      {/* Real-time Status Gauge Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground uppercase font-bold">Ready for Intake</span>
            <Radio className="h-4 w-4 text-emerald-600 animate-pulse" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-600 mt-1">{availableCount} Rooms</p>
          <span className="text-[10px] text-emerald-600 font-medium">Sterile &amp; unassigned</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground uppercase font-bold">In Active Surgery</span>
            <Activity className="h-4 w-4 text-rose-600 animate-pulse" />
          </div>
          <p className="text-2xl font-bold font-mono text-rose-600 mt-1">{occupiedCount} Rooms</p>
          <span className="text-[10px] text-rose-600 font-medium">{overallOccupancy}% Current Load</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground uppercase font-bold">Cleaning / Turnover</span>
            <RefreshCw className="h-4 w-4 text-cyan-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-cyan-600 mt-1">{turnoverCount} Rooms</p>
          <span className="text-[10px] text-cyan-600 font-medium">Avg 20m turnover</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground uppercase font-bold">Maintenance</span>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-600 mt-1">{maintCount} Rooms</p>
          <span className="text-[10px] text-amber-600 font-medium">Scheduled downtime</span>
        </Card>
      </div>

      {/* Live Suite Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {otRooms.map((room) => {
          const currentCase = cases.find((c) => c.id === room.currentCaseId || c.allocatedOT?.roomId === room.id);

          return (
            <Card
              key={room.id}
              className={cn(
                "border-2 transition-all p-4 flex flex-col justify-between shadow-xs",
                room.status === "Available"
                  ? "border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500"
                  : room.status === "Occupied"
                  ? "border-rose-500/40 bg-rose-500/5 hover:border-rose-500"
                  : room.status === "Cleaning-Turnover"
                  ? "border-cyan-500/40 bg-cyan-500/5 hover:border-cyan-500"
                  : "border-amber-500/40 bg-amber-500/5 hover:border-amber-500"
              )}
            >
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-bold text-foreground">{room.name}</strong>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{room.department}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-bold",
                      room.status === "Available"
                        ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40"
                        : room.status === "Occupied"
                        ? "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40 animate-pulse"
                        : room.status === "Cleaning-Turnover"
                        ? "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/40"
                        : "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40"
                    )}
                  >
                    {room.status === "Occupied" ? "🔴 Live Surgery" : room.status}
                  </Badge>
                </div>

                <div className="py-3 space-y-2 text-xs">
                  {room.status === "Occupied" && currentCase ? (
                    <div className="p-2.5 rounded-lg bg-background border border-border/80 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-rose-600 block">Active In-Surgery Case:</span>
                      <p className="font-bold text-foreground">{currentCase.patientName}</p>
                      <p className="text-[11px] text-muted-foreground">{currentCase.procedureType}</p>
                      <span className="text-[10px] font-mono text-primary block">
                        Surgeon: {currentCase.assignedSurgeonName || "Assigned Specialist"}
                      </span>
                    </div>
                  ) : room.status === "Cleaning-Turnover" ? (
                    <div className="p-2.5 rounded-lg bg-background border border-border/80 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-cyan-600 block">Turnover Sterilization:</span>
                      <p className="text-foreground">Laminar airflow sterilization cycle in progress.</p>
                      <p className="text-[11px] font-semibold text-cyan-700 dark:text-cyan-300">
                        Ready in: {room.turnoverETA || "15 mins"}
                      </p>
                    </div>
                  ) : room.status === "Maintenance" ? (
                    <div className="p-2.5 rounded-lg bg-background border border-border/80 space-y-1 text-amber-800 dark:text-amber-300">
                      <span className="text-[10px] uppercase font-bold block">Planned Maintenance:</span>
                      <p className="text-[11px]">{room.maintenanceWindow?.reason || "HEPA Filter Replacement"}</p>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-background border border-border/80 space-y-1 text-emerald-800 dark:text-emerald-300">
                      <span className="text-[10px] uppercase font-bold block">Status: Fully Sterile &amp; Available</span>
                      <p className="text-[11px] text-muted-foreground">
                        Ready for elective booking or emergency Priority-1 intake.
                      </p>
                    </div>
                  )}

                  <div className="pt-1 flex flex-wrap gap-1">
                    {room.baseEquipment.slice(0, 3).map((eq, i) => (
                      <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-mono">
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-muted-foreground">
                  {room.utilizationStats.totalSurgeries} Surgeries Completed
                </span>
                {room.status === "Available" ? (
                  <Button size="sm" asChild className="h-7 text-xs font-semibold gap-1">
                    <Link href="/hospital-admin/surgery-schedule">
                      <Scissors className="h-3 w-3" /> Book Slot
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" asChild className="h-7 text-xs">
                    <Link href="/hospital-admin/ot-rooms">View Config</Link>
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
