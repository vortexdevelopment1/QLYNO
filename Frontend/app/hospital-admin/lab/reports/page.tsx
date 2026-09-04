"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Download,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Filter,
  FlaskConical,
  Printer,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
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

export default function ReportsArchivePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [orders] = useState<LabOrder[]>(mockExtendedLabOrders);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Archive of Released and Rejected orders
  const archivedReports = useMemo(() => {
    return orders.filter((o) => {
      const isArchived = o.status === "released" || o.status === "rejected";
      const matchesSearch =
        o.orderNo.toLowerCase().includes(search.toLowerCase()) ||
        o.patientName.toLowerCase().includes(search.toLowerCase()) ||
        (o.uhid && o.uhid.toLowerCase().includes(search.toLowerCase())) ||
        o.test.toLowerCase().includes(search.toLowerCase()) ||
        o.orderingDoctor.toLowerCase().includes(search.toLowerCase());
      const matchesDept = departmentFilter === "all" || o.department === departmentFilter;
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      return isArchived && matchesSearch && matchesDept && matchesStatus;
    });
  }, [orders, search, departmentFilter, statusFilter]);

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Diagnostic Reports Archive"
          description="Permanent digital repository of validated, authorized, and archived laboratory investigation reports."
          crumbs={[{ label: "Clinical Operations" }, { label: "Laboratory" }, { label: "Reports Archive" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading diagnostic reports archive...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Diagnostic Reports Archive"
        description="Permanent digital repository of validated, authorized, and archived laboratory investigation reports."
        crumbs={[{ label: "Clinical Operations" }, { label: "Laboratory" }, { label: "Reports Archive" }]}
      />

      <LabNav />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Central Diagnostic Records Archive" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-emerald-600" />
          <span>Click any row to open the complete report page with functional Print &amp; Download PDF</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Archived Reports</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{archivedReports.length} Reports</p>
          <span className="text-[10px] text-muted-foreground">Digitally signed &amp; encrypted</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Released to EMR</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
            {archivedReports.filter((r) => r.status === "released").length} Verified
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Published to patient charts</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">QC Rejected</span>
          <p className="text-xl font-bold font-mono text-destructive mt-0.5">
            {archivedReports.filter((r) => r.status === "rejected").length} Audited
          </p>
          <span className="text-[10px] text-destructive font-medium">Quality log archived</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">PDF Vector Engine</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">Active</p>
          <span className="text-[10px] text-cyan-600 font-medium">NABL Compliant Header</span>
        </Card>
      </div>

      {/* Reports Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Authorized Diagnostic Reports Register</CardTitle>
          <CardDescription className="text-xs">
            Click on any row or click "View Report" to open the dedicated report page with full Print and Download PDF controls.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search report #, patient, doctor..."
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
                  <SelectItem value="Hematology & Coagulation">Coagulation</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px] text-xs h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="released">Released</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Report #</TableHead>
                  <TableHead className="text-xs font-bold">Patient Details</TableHead>
                  <TableHead className="text-xs font-bold">Investigation / Test</TableHead>
                  <TableHead className="text-xs font-bold">Ordering Physician</TableHead>
                  <TableHead className="text-xs font-bold">Verifying Pathologist</TableHead>
                  <TableHead className="text-xs font-bold">Status</TableHead>
                  <TableHead className="text-xs font-bold text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {archivedReports.map((report) => (
                  <TableRow
                    key={report.id}
                    className="hover:bg-muted/40 transition-colors cursor-pointer"
                    onClick={() => router.push(`/hospital-admin/lab/${report.id}`)}
                  >
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {report.orderNo}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground">{report.patientName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{report.uhid}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-medium text-foreground">{report.test}</div>
                      <div className="text-[10px] text-muted-foreground">{report.department}</div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-medium">
                      {report.orderingDoctor}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-foreground">
                      {report.verifiedBy || "Dr. Sunita Kulkarni"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          report.status === "released"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                            : "bg-destructive/15 text-destructive border-destructive/30 text-[10px]"
                        }
                      >
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="h-7 text-xs font-semibold text-primary border-primary/30 hover:bg-primary hover:text-primary-foreground"
                      >
                        <Link href={`/hospital-admin/lab/${report.id}`}>
                          <Eye className="h-3.5 w-3.5 mr-1" /> View Report
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
