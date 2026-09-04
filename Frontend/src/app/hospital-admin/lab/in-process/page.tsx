"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Cpu,
  FileCheck2,
  Filter,
  FlaskConical,
  RefreshCw,
  Search,
  ShieldAlert,
  TestTube,
  Zap,
} from "lucide-react";

import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/hospital-admin/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { LabNav } from "@/hospital-admin/components/lab/lab-nav";
import { mockExtendedLabOrders } from "@/hospital-admin/lib/mock-data/lab-extended-operations";
import { LabOrder } from "@/hospital-admin/lib/types";

export default function SamplesInProcessPage() {
  const [mounted, setMounted] = useState(false);
  const [orders] = useState<LabOrder[]>(mockExtendedLabOrders);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filtered view of LabOrder.status = 'processing'
  const inProcessOrders = useMemo(() => {
    return orders.filter((o) => {
      const isProcessing = o.status === "processing";
      const matchesSearch =
        o.orderNo.toLowerCase().includes(search.toLowerCase()) ||
        o.patientName.toLowerCase().includes(search.toLowerCase()) ||
        (o.assignedAnalyzer && o.assignedAnalyzer.toLowerCase().includes(search.toLowerCase())) ||
        o.test.toLowerCase().includes(search.toLowerCase());
      const matchesDept = departmentFilter === "all" || o.department === departmentFilter;
      return isProcessing && matchesSearch && matchesDept;
    });
  }, [orders, search, departmentFilter]);

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Samples in Process"
          description="Live analyzer telemetry, automated sample processing status, and real-time Turnaround Time (TAT) countdowns."
          crumbs={[{ label: "Clinical Operations" }, { label: "Laboratory" }, { label: "In Process" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading processing analyzers...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Samples in Process"
        description="Live analyzer telemetry, automated sample processing status, and real-time Turnaround Time (TAT) countdowns."
        crumbs={[{ label: "Clinical Operations" }, { label: "Laboratory" }, { label: "In Process" }]}
      />

      <LabNav />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Automated Diagnostic Analyzers Core" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
          <span>Real-time analyzer interface (LIS/ASTM/HL7 Protocol) • Zero duplicate order models</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Actively Processing</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">{inProcessOrders.length} Tests</p>
          <span className="text-[10px] text-cyan-600 font-medium">Inside auto-analyzers</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Average Run TAT</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">38 Mins</p>
          <span className="text-[10px] text-emerald-600 font-medium">Within target clinical SLA</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Active Analyzers</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">4 Systems</p>
          <span className="text-[10px] text-muted-foreground">100% online telemetry</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Next Batch Ready</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">~ 15 Mins</p>
          <span className="text-[10px] text-amber-600 font-medium">Hematology &amp; Coagulation</span>
        </Card>
      </div>

      {/* In-Process Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Analyzer Workload &amp; Live TAT Monitoring</CardTitle>
          <CardDescription className="text-xs">
            Track automated testing progress, assigned instruments, and completion schedules.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search order, patient, analyzer..."
                className="pl-8 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[160px] text-xs h-9">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Hematology">Hematology</SelectItem>
                  <SelectItem value="Biochemistry">Biochemistry</SelectItem>
                  <SelectItem value="Immunoassay">Immunoassay</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Order #</TableHead>
                  <TableHead className="text-xs font-bold">Patient Details</TableHead>
                  <TableHead className="text-xs font-bold">Investigation / Test</TableHead>
                  <TableHead className="text-xs font-bold">Assigned Laboratory Analyzer</TableHead>
                  <TableHead className="text-xs font-bold">Collected At</TableHead>
                  <TableHead className="text-xs font-bold">Estimated TAT Countdown</TableHead>
                  <TableHead className="text-xs font-bold">Status</TableHead>
                  <TableHead className="text-xs font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inProcessOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {order.orderNo}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground">{order.patientName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{order.uhid}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-medium text-foreground">{order.test}</div>
                      <div className="text-[10px] text-muted-foreground">{order.department}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                        <Cpu className="h-3.5 w-3.5 text-cyan-600 shrink-0" />
                        <span className="truncate max-w-[220px]">{order.assignedAnalyzer}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {order.collectedAt ? new Date(order.collectedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 text-[10px] font-mono flex items-center gap-1 w-fit">
                        <Clock className="h-3 w-3 animate-spin text-cyan-600" />
                        {order.tat}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 text-[10px]">
                        Processing
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" asChild className="h-7 text-xs text-primary font-semibold">
                        <Link href="/hospital-admin/lab/awaiting-review">
                          <FileCheck2 className="h-3.5 w-3.5 mr-1" /> View Worklist
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
