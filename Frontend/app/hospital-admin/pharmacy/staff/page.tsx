"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileSpreadsheet,
  Layers,
  Lock,
  Pill,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
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
import { PharmacyNav } from "@/hospital-admin/components/pharmacy/pharmacy-nav";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { mockPharmacyStaff } from "@/hospital-admin/lib/mock-data/pharmacy-extended-operations";
import { PharmacyStaffMember } from "@/hospital-admin/lib/types";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Pharmacy Operational workflow";

export default function PharmacyStaffPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [staff, setStaff] = useState<PharmacyStaffMember[]>(mockPharmacyStaff);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredStaff = staff.filter((s) => {
    return (
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase()) ||
      s.pharmacyCouncilRegNo.toLowerCase().includes(search.toLowerCase()) ||
      s.shift.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleToggleH1 = (staffId: string) => {
    setStaff((prev) =>
      prev.map((s) =>
        s.id === staffId ? { ...s, scheduleH1Authorized: !s.scheduleH1Authorized } : s
      )
    );
    const target = staff.find((s) => s.id === staffId);
    toast({
      title: "Schedule H1 Authorization Updated",
      description: `${target?.name}'s controlled substance dispensing permission updated. (${DELEGATION_STRING})`,
    });
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Pharmacy Staff &amp; Licensing Authorization Registry"
          description="Hospital pharmacist roster, duty shifts, State Council registrations, and Schedule H1 sign-off permissions."
          crumbs={[{ label: "Operations" }, { label: "Pharmacy", href: "/hospital-admin/pharmacy" }, { label: "Pharmacy Staff" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading pharmacy staff...
        </div>
      </div>
    );
  }

  const onDutyCount = staff.filter((s) => s.dutyStatus === "On Duty").length;
  const h1AuthorizedCount = staff.filter((s) => s.scheduleH1Authorized).length;
  const totalDispensedToday = staff.reduce((acc, s) => acc + s.todayDispensedCount, 0);

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Pharmacy Staff &amp; Licensing Authorization Registry"
        description="Hospital pharmacist roster, duty shifts, State Council registrations, and Schedule H1 sign-off permissions."
        crumbs={[{ label: "Operations" }, { label: "Pharmacy", href: "/hospital-admin/pharmacy" }, { label: "Pharmacy Staff" }]}
        actions={
          <Link href="/hospital-admin/roster">
            <Button size="sm" variant="outline" className="gap-1.5 font-semibold text-xs text-primary border-primary/30 hover:bg-primary/10">
              <Clock className="h-4 w-4" /> Hospital Roster Matrix
            </Button>
          </Link>
        }
      />

      <PharmacyNav />

      {/* Scope Indicator & Licensing Rule */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Pharmacy Workforce &amp; Regulatory Compliance" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Licensure Requirement: Controlled antibiotics (Schedule H1) and narcotics require verified registered pharmacist authorization</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Currently On Duty</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{onDutyCount} Staff</p>
          <span className="text-[10px] text-emerald-600 font-medium">Active dispensary coverage</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Schedule H1 Authorized</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{h1AuthorizedCount} Pharmacists</p>
          <span className="text-[10px] text-primary font-medium">Licensed for controlled drugs</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Staff in Roster</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">{staff.length} Members</p>
          <span className="text-[10px] text-muted-foreground">Chief, Clinical &amp; Techs</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Today's Dispensed Load</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">{totalDispensedToday} Rx</p>
          <span className="text-[10px] text-muted-foreground">Across all active counters</span>
        </Card>
      </div>

      {/* Staff Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold">Licensed Pharmacist &amp; Technician Roster</CardTitle>
              <CardDescription className="text-xs">
                State Pharmacy Council registration records, active shift assignments, and dispensing workload telemetry.
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search staff or reg number..."
                className="pl-8 text-xs h-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2">
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold w-[180px]">Staff Name &amp; ID</TableHead>
                  <TableHead className="text-xs font-bold w-[160px]">Clinical Role</TableHead>
                  <TableHead className="text-xs font-bold w-[180px]">Pharmacy Council Reg #</TableHead>
                  <TableHead className="text-xs font-bold w-[180px]">Assigned Shift</TableHead>
                  <TableHead className="text-xs font-bold w-[110px]">Duty Status</TableHead>
                  <TableHead className="text-xs font-bold w-[150px]">Schedule H1 Status</TableHead>
                  <TableHead className="text-xs font-bold text-right w-[110px]">Today's Rx</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((s) => (
                  <TableRow key={s.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground">{s.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{s.id}</div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs font-medium text-foreground">{s.role}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{s.contactNumber}</div>
                    </TableCell>

                    <TableCell className="font-mono text-xs text-foreground">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {s.pharmacyCouncilRegNo}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {s.shift}
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={
                          s.dutyStatus === "On Duty"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                            : "bg-muted text-muted-foreground text-[10px]"
                        }
                      >
                        {s.dutyStatus}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <button
                        type="button"
                        onClick={() => handleToggleH1(s.id)}
                        className="cursor-pointer text-left"
                      >
                        <Badge
                          className={
                            s.scheduleH1Authorized
                              ? "bg-primary/15 text-primary border-primary/30 text-[10px]"
                              : "bg-muted text-muted-foreground text-[10px]"
                          }
                        >
                          {s.scheduleH1Authorized ? "Authorized" : "Standard OTC Only"}
                        </Badge>
                      </button>
                    </TableCell>

                    <TableCell className="text-right font-mono text-xs font-bold text-foreground">
                      {s.todayDispensedCount} Rx
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
