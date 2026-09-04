"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import {
  Activity,
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
  Cpu,
  HeartPulse,
  Plus,
  Radio,
  Search,
  Shield,
  Zap,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { WardsBedsNav } from "@/hospital-admin/components/wards-beds/wards-beds-nav";
import { Bed } from "@/hospital-admin/lib/types";

export default function ICUTierPage() {
  const [mounted, setMounted] = useState(false);
  const { beds } = useSelector((state: RootState) => state.wardsBeds);

  const [search, setSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const icuBeds = useMemo(() => {
    return beds.filter((b) => {
      const isCritical = b.tier === "ICU" || b.tier === "CCU" || b.tier === "HDU" || b.tier === "NICU";
      const matchesSearch =
        b.bedNumber.toLowerCase().includes(search.toLowerCase()) ||
        b.wardName.toLowerCase().includes(search.toLowerCase()) ||
        (b.currentPatientName && b.currentPatientName.toLowerCase().includes(search.toLowerCase()));
      return isCritical && matchesSearch;
    });
  }, [beds, search]);

  const totalICUBeds = icuBeds.length;
  const occupiedICU = icuBeds.filter((b) => b.status === "Occupied").length;
  const availableICU = icuBeds.filter((b) => b.status === "Available").length;
  const ventilatorCount = icuBeds.filter(
    (b) => b.attachedEquipment?.some((eq) => eq.toLowerCase().includes("ventilator"))
  ).length;

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="ICU &amp; Critical Care Tier Console"
          description="High-acuity intensive care units, invasive ventilator monitoring, and 1:1 nursing ratios."
          crumbs={[{ label: "Clinical Operations" }, { label: "Wards & Beds", href: "/hospital-admin/wards-beds" }, { label: "ICU" }]}
        />
        <WardsBedsNav />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading ICU infrastructure...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="ICU &amp; Critical Care Tier Console"
        description="High-acuity intensive care units, invasive ventilator monitoring, and 1:1 nursing ratios."
        crumbs={[{ label: "Clinical Operations" }, { label: "Wards & Beds", href: "/hospital-admin/wards-beds" }, { label: "ICU" }]}
      />

      <WardsBedsNav />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Critical Care Beds</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{totalICUBeds} Beds</p>
          <span className="text-[10px] text-muted-foreground">ICU, CCU &amp; HDU units</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Ventilators Active</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">{ventilatorCount} Active</p>
          <span className="text-[10px] text-rose-600 font-medium">Invasive respiratory support</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Available ICU Beds</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{availableICU} Ready</p>
          <span className="text-[10px] text-emerald-600 font-medium">Emergency intake ready</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Clinical Tier Guard</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">Enforced</p>
          <span className="text-[10px] text-amber-600 font-medium">Requires critical care order</span>
        </Card>
      </div>

      {/* ICU Beds Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Critical Care &amp; ICU Bed Roster</CardTitle>
          <CardDescription className="text-xs">
            Live telemetry, invasive life-support equipment, and allocated critical care specialists.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bed, patient, or equipment..."
                className="pl-8 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Bed #</TableHead>
                  <TableHead className="text-xs font-bold">Unit &amp; Tier</TableHead>
                  <TableHead className="text-xs font-bold">Admitted Patient / Status</TableHead>
                  <TableHead className="text-xs font-bold">Critical Care Lead</TableHead>
                  <TableHead className="text-xs font-bold">Attached Life Support Equipment</TableHead>
                  <TableHead className="text-xs font-bold">Nurse Ratio</TableHead>
                  <TableHead className="text-xs font-bold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {icuBeds.map((bed) => (
                  <TableRow key={bed.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-rose-600">
                      {bed.bedNumber}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-semibold text-foreground">{bed.wardName}</div>
                      <Badge variant="outline" className="text-[10px] text-rose-600 border-rose-500/30">
                        {bed.tier}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {bed.status === "Occupied" ? (
                        <div>
                          <div className="text-xs font-semibold text-foreground">{bed.currentPatientName}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{bed.currentPatientId} • {bed.lengthOfStayDays}d LOS</div>
                        </div>
                      ) : (
                        <span className="text-xs text-emerald-600 font-semibold">Ready for Critical Intake</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-foreground font-medium">
                      {bed.admittingDoctor || "Dr. Kavita Verma (Intensivist)"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[280px]">
                        {bed.attachedEquipment && bed.attachedEquipment.length > 0 ? (
                          bed.attachedEquipment.map((eq) => (
                            <Badge key={eq} variant="secondary" className="text-[9px]">
                              {eq}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-[11px] text-muted-foreground">Standard Consoles</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {bed.nurseToPatientRatio || "1:1"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          bed.status === "Occupied"
                            ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px]"
                            : bed.status === "Available"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                            : "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 text-[10px]"
                        }
                      >
                        {bed.status}
                      </Badge>
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
