"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import {
  AlertTriangle,
  Biohazard,
  CheckCircle2,
  Filter,
  Flame,
  Gauge,
  Plus,
  Radio,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Wind,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { WardsBedsNav } from "@/hospital-admin/components/wards-beds/wards-beds-nav";
import { Bed } from "@/hospital-admin/lib/types";

export default function IsolationTierPage() {
  const [mounted, setMounted] = useState(false);
  const { beds } = useSelector((state: RootState) => state.wardsBeds);

  const [search, setSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const isolationBeds = useMemo(() => {
    return beds.filter((b) => {
      const isIso = b.tier === "Isolation" || (b.isolationFlags && b.isolationFlags !== "None");
      const matchesSearch =
        b.bedNumber.toLowerCase().includes(search.toLowerCase()) ||
        b.wardName.toLowerCase().includes(search.toLowerCase()) ||
        (b.currentPatientName && b.currentPatientName.toLowerCase().includes(search.toLowerCase()));
      return isIso && matchesSearch;
    });
  }, [beds, search]);

  const totalIso = isolationBeds.length;
  const occupiedIso = isolationBeds.filter((b) => b.status === "Occupied").length;
  const negativePressureCount = isolationBeds.filter((b) => b.negativePressure).length;

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Infection Control &amp; Isolation Units Console"
          description="Negative-pressure isolation suites, droplet/airborne pathogen containment, and terminal disinfection gates."
          crumbs={[{ label: "Clinical Operations" }, { label: "Wards & Beds", href: "/hospital-admin/wards-beds" }, { label: "Isolation" }]}
        />
        <WardsBedsNav />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading isolation suites...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Infection Control &amp; Isolation Units Console"
        description="Negative-pressure isolation suites, droplet/airborne pathogen containment, and terminal disinfection gates."
        crumbs={[{ label: "Clinical Operations" }, { label: "Wards & Beds", href: "/hospital-admin/wards-beds" }, { label: "Isolation" }]}
      />

      <WardsBedsNav />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Isolation Units Total</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{totalIso} Suites</p>
          <span className="text-[10px] text-amber-600 font-medium">Pathogen containment</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Negative Pressure Rooms</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">{negativePressureCount} Rooms</p>
          <span className="text-[10px] text-cyan-600 font-medium">-2.5 Pa differential pressure</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Active Isolated Patients</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">{occupiedIso} Patients</p>
          <span className="text-[10px] text-rose-600 font-medium">Airborne / Droplet precautions</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Terminal Disinfection</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">Mandatory</p>
          <span className="text-[10px] text-primary font-medium">UV-C &amp; gas fogging protocol</span>
        </Card>
      </div>

      {/* Isolation Suites Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Isolation Suites &amp; Infection Control Roster</CardTitle>
          <CardDescription className="text-xs">
            Pathogen isolation containment status, pressure gauges, and enhanced PPE protocols.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search suite number, patient, or ward..."
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
                  <TableHead className="text-xs font-bold">Suite #</TableHead>
                  <TableHead className="text-xs font-bold">Ward &amp; Floor</TableHead>
                  <TableHead className="text-xs font-bold">Isolation Precaution Flag</TableHead>
                  <TableHead className="text-xs font-bold">Negative Pressure</TableHead>
                  <TableHead className="text-xs font-bold">Admitted Patient</TableHead>
                  <TableHead className="text-xs font-bold">Cleaning Requirement</TableHead>
                  <TableHead className="text-xs font-bold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isolationBeds.map((bed) => (
                  <TableRow key={bed.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-amber-600">
                      {bed.bedNumber}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-semibold text-foreground">{bed.wardName}</div>
                      <div className="text-[10px] text-muted-foreground">{bed.floor}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          bed.isolationFlags === "Airborne"
                            ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px]"
                            : bed.isolationFlags === "Droplet"
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                            : "text-[10px]"
                        }
                      >
                        {bed.isolationFlags || "Standard Isolation"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {bed.negativePressure ? (
                        <Badge className="bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 text-[10px]">
                          <Wind className="h-3 w-3 mr-1" /> Active (-2.5 Pa)
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Neutral</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {bed.status === "Occupied" ? (
                        <div>
                          <div className="text-xs font-semibold text-foreground">{bed.currentPatientName}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{bed.currentPatientId} • {bed.lengthOfStayDays}d LOS</div>
                        </div>
                      ) : (
                        <span className="text-xs text-emerald-600 font-semibold">Vacant &amp; Ready</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-amber-700 dark:text-amber-300">
                      Terminal-Isolation Required
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
