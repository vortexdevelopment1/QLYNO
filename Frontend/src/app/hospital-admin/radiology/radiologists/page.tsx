"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  Layers,
  Phone,
  Search,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Timer,
  User,
  Users,
  Zap,
} from "lucide-react";

import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { RadiologyNav } from "@/hospital-admin/components/radiology/radiology-nav";
import { mockRadiologistProfiles } from "@/hospital-admin/lib/mock-data/radiology-extended-operations";
import { RadiologistProfile } from "@/hospital-admin/lib/types";

export default function RadiologistsRosterPage() {
  const [mounted, setMounted] = useState(false);
  const [radiologists] = useState<RadiologistProfile[]>(mockRadiologistProfiles);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredRadiologists = useMemo(() => {
    return radiologists.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.specialty.toLowerCase().includes(search.toLowerCase()) ||
        r.registrationNo.toLowerCase().includes(search.toLowerCase()) ||
        r.doctorId.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [radiologists, search]);

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Consultant Radiologists Directory"
          description="Read-only clinical credentialing lens from Doctor Management for authorized reporting radiologists."
          crumbs={[{ label: "Clinical Operations" }, { label: "Radiology", href: "/hospital-admin/radiology" }, { label: "Radiologists" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading radiologists directory...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Consultant Radiologists Directory"
        description="Read-only clinical credentialing lens from Doctor Management for authorized reporting radiologists."
        crumbs={[{ label: "Clinical Operations" }, { label: "Radiology", href: "/hospital-admin/radiology" }, { label: "Radiologists" }]}
        actions={
          <Button size="sm" variant="outline" asChild className="gap-1.5 font-semibold text-xs">
            <Link href="/hospital-admin/doctors">
              <Stethoscope className="h-4 w-4 text-primary" /> Hospital Doctor Directory
            </Link>
          </Button>
        }
      />

      <RadiologyNav />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Radiology Medical Staffing Console" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
          <span>Central Directory Sync: Reads from Doctor Management (Radiology Specialty) • Technologists managed in Technical Staff category</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Credentialed Radiologists</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{radiologists.length} Specialists</p>
          <span className="text-[10px] text-muted-foreground">Doctor Management sync</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">On Active Duty</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
            {radiologists.filter((r) => r.onDutyStatus === "On Duty").length} On Duty
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Currently reviewing PACS</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Today's Reports Authorized</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">
            {radiologists.reduce((acc, r) => acc + r.todayAuthorizedCount, 0)} Signed
          </p>
          <span className="text-[10px] text-cyan-600 font-medium">Published to patient charts</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Avg Interpretation TAT</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">&lt; 21.6 Mins</p>
          <span className="text-[10px] text-emerald-600 font-medium">Exceeds NABH standards</span>
        </Card>
      </div>

      {/* Radiologists Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Authorized Reporting Radiologists &amp; Performance Metrics</CardTitle>
          <CardDescription className="text-xs">
            Review qualifications, medical council registrations, active reading queue loads, and turnaround time efficiency.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search radiologist, specialty, license..."
                className="pl-8 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold w-[240px]">Radiologist &amp; Credentials</TableHead>
                  <TableHead className="text-xs font-bold w-[220px]">Sub-Specialty Focus</TableHead>
                  <TableHead className="text-xs font-bold w-[160px]">Registration / License</TableHead>
                  <TableHead className="text-xs font-bold w-[130px]">Duty Status</TableHead>
                  <TableHead className="text-xs font-bold w-[140px]">Active Queue</TableHead>
                  <TableHead className="text-xs font-bold w-[140px]">Average TAT</TableHead>
                  <TableHead className="text-xs font-bold text-right w-[140px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRadiologists.map((r) => (
                  <TableRow key={r.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-primary" />
                        {r.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <GraduationCap className="h-3 w-3 text-muted-foreground" />
                        {r.qualification}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-medium text-foreground">{r.specialty}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">Specialty Code: RAD-01</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {r.registrationNo}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          r.onDutyStatus === "On Duty"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                        }
                      >
                        {r.onDutyStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono font-bold text-xs text-primary">
                        {r.currentQueueCount} Studies Pending
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <Timer className="h-3.5 w-3.5" />
                        <span>{r.avgTatMins} Mins</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">{r.todayAuthorizedCount} signed today</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" asChild className="h-7 text-xs font-semibold text-primary hover:bg-primary/10">
                        <Link href={`/hospital-admin/doctors/${r.doctorId}`}>
                          <ExternalLink className="h-3 w-3 mr-1" /> View Profile
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
