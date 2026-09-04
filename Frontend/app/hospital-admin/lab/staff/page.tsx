"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  Clock,
  FileCheck2,
  Filter,
  FlaskConical,
  GraduationCap,
  Layers,
  Search,
  Shield,
  ShieldAlert,
  TestTube,
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
import { LabNav } from "@/hospital-admin/components/lab/lab-nav";
import { mockLabStaff } from "@/hospital-admin/lib/mock-data/lab-extended-operations";

export default function LabStaffPage() {
  const [mounted, setMounted] = useState(false);
  const [staff] = useState(mockLabStaff);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredStaff = useMemo(() => {
    return staff.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.role.toLowerCase().includes(search.toLowerCase()) ||
        s.department.toLowerCase().includes(search.toLowerCase()) ||
        s.licenseNo.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [staff, search]);

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Laboratory Staff &amp; Operational Traceability"
          description="Technicians, Pathologists, and Phlebotomists mapped to laboratory operations with order traceability."
          crumbs={[{ label: "Clinical Operations" }, { label: "Laboratory" }, { label: "Lab Staff" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading lab staff registry...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Laboratory Staff &amp; Operational Traceability"
        description="Technicians, Pathologists, and Phlebotomists mapped to laboratory operations with order traceability."
        crumbs={[{ label: "Clinical Operations" }, { label: "Laboratory" }, { label: "Lab Staff" }]}
        actions={
          <Button size="sm" variant="outline" asChild className="gap-1.5 font-semibold text-xs">
            <Link href="/hospital-admin/support-staff">
              <Users className="h-4 w-4 text-primary" /> Hospital Staff Directory
            </Link>
          </Button>
        }
      />

      <LabNav />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Laboratory Workforce &amp; Quality Audit" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
          <span>Central Staff Registry: Personnel roster mapped directly from hospital-wide staff directory</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Duty Lab Personnel</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{staff.length} Active Staff</p>
          <span className="text-[10px] text-muted-foreground">Pathology core &amp; phlebotomy</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Today's Collections</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">52 Draws</p>
          <span className="text-[10px] text-emerald-600 font-medium">Logged across 2 phlebotomists</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Today's Tests Run</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">65 Processed</p>
          <span className="text-[10px] text-cyan-600 font-medium">Biochemistry &amp; Hematology</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Pathologist Sign-Offs</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">42 Authorized</p>
          <span className="text-[10px] text-emerald-600 font-medium">100% NABL compliant audit</span>
        </Card>
      </div>

      {/* Staff Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Laboratory Personnel &amp; Audit Traceability</CardTitle>
          <CardDescription className="text-xs">
            Review certified qualifications, license credentials, and daily investigation processing throughput.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff, role, license..."
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
                  <TableHead className="text-xs font-bold">Staff Name &amp; Credentials</TableHead>
                  <TableHead className="text-xs font-bold">Designated Clinical Role</TableHead>
                  <TableHead className="text-xs font-bold">Assigned Department</TableHead>
                  <TableHead className="text-xs font-bold">License / Registration</TableHead>
                  <TableHead className="text-xs font-bold">Today's Activity Volume</TableHead>
                  <TableHead className="text-xs font-bold">Duty Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((person) => (
                  <TableRow key={person.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-primary" />
                        {person.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <GraduationCap className="h-3 w-3 text-muted-foreground" />
                        {person.qualification}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-foreground">
                      {person.role}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {person.department}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {person.licenseNo}
                    </TableCell>
                    <TableCell>
                      {person.todayAuthorizedCount ? (
                        <span className="text-xs font-mono font-bold text-emerald-600">
                          {person.todayAuthorizedCount} Reports Authorized
                        </span>
                      ) : person.todayCollectedCount ? (
                        <span className="text-xs font-mono font-bold text-amber-600">
                          {person.todayCollectedCount} Samples Collected
                        </span>
                      ) : (
                        <span className="text-xs font-mono font-bold text-cyan-600">
                          {person.todayProcessedCount} Tests Processed
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]">
                        {person.status}
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
