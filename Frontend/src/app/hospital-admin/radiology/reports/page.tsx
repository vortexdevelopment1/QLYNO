"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Camera,
  CheckCircle2,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  Layers,
  Printer,
  Radio,
  Search,
  ShieldAlert,
  ShieldCheck,
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
import { RadiologyNav } from "@/hospital-admin/components/radiology/radiology-nav";
import { mockExtendedRadiologyOrders } from "@/hospital-admin/lib/mock-data/radiology-extended-operations";
import { RadiologyOrder } from "@/hospital-admin/lib/types";

export default function RadiologyReportsArchivePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [orders] = useState<RadiologyOrder[]>(mockExtendedRadiologyOrders);
  const [search, setSearch] = useState("");
  const [modalityFilter, setModalityFilter] = useState("all");
  const [radiologistFilter, setRadiologistFilter] = useState("all");

  useEffect(() => {
    setMounted(true);
  }, []);

  const archivedReports = useMemo(() => {
    return orders.filter((o) => {
      const isReady = o.status === "Report Ready";
      const matchesSearch =
        o.orderNo.toLowerCase().includes(search.toLowerCase()) ||
        o.patientName.toLowerCase().includes(search.toLowerCase()) ||
        (o.uhid && o.uhid.toLowerCase().includes(search.toLowerCase())) ||
        o.bodyPart.toLowerCase().includes(search.toLowerCase()) ||
        o.orderingDoctor.toLowerCase().includes(search.toLowerCase());
      const matchesModality = modalityFilter === "all" || o.modality === modalityFilter;
      const matchesRadiologist =
        radiologistFilter === "all" ||
        (o.radiologistName && o.radiologistName.toLowerCase().includes(radiologistFilter.toLowerCase()));
      return isReady && matchesSearch && matchesModality && matchesRadiologist;
    });
  }, [orders, search, modalityFilter, radiologistFilter]);

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Authorized Radiology Reports Archive"
          description="Permanent digital repository of validated, authorized, and archived radiological examination reports."
          crumbs={[{ label: "Clinical Operations" }, { label: "Radiology", href: "/hospital-admin/radiology" }, { label: "Reports Archive" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading reports archive...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Authorized Radiology Reports Archive"
        description="Permanent digital repository of validated, authorized, and archived radiological examination reports."
        crumbs={[{ label: "Clinical Operations" }, { label: "Radiology", href: "/hospital-admin/radiology" }, { label: "Reports Archive" }]}
      />

      <RadiologyNav />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Central Radiology Records Repository" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-emerald-600" />
          <span>Click any row to open the complete report page with functional Print &amp; Download PDF</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Authorized Reports</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{archivedReports.length} Studies</p>
          <span className="text-[10px] text-muted-foreground">Digitally signed &amp; archived</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Published to EMR</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">100% Synced</p>
          <span className="text-[10px] text-emerald-600 font-medium">Delivered to clinicians</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Vector PDF Engine</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">Active</p>
          <span className="text-[10px] text-cyan-600 font-medium">AERB / NABH Letterhead</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Web PACS Viewer</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">DICOM Web</p>
          <span className="text-[10px] text-muted-foreground">High-res diagnostic access</span>
        </Card>
      </div>

      {/* Reports Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Authorized Imaging Reports Register</CardTitle>
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
              <Select value={modalityFilter} onValueChange={setModalityFilter}>
                <SelectTrigger className="w-[140px] text-xs h-9">
                  <SelectValue placeholder="Modality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modalities</SelectItem>
                  <SelectItem value="CT Scan">CT Scan</SelectItem>
                  <SelectItem value="MRI">3T MRI</SelectItem>
                  <SelectItem value="X-Ray">Digital X-Ray</SelectItem>
                  <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold w-[120px]">Report #</TableHead>
                  <TableHead className="text-xs font-bold w-[220px]">Patient Details</TableHead>
                  <TableHead className="text-xs font-bold w-[220px]">Modality &amp; Study</TableHead>
                  <TableHead className="text-xs font-bold w-[180px]">Ordering Physician</TableHead>
                  <TableHead className="text-xs font-bold w-[220px]">Reporting Radiologist</TableHead>
                  <TableHead className="text-xs font-bold w-[110px]">Status</TableHead>
                  <TableHead className="text-xs font-bold text-right w-[150px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {archivedReports.map((report) => (
                  <TableRow
                    key={report.id}
                    className="hover:bg-muted/40 transition-colors cursor-pointer"
                    onClick={() => router.push(`/hospital-admin/radiology/reports/${report.id}`)}
                  >
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {report.orderNo}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground">{report.patientName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{report.uhid}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px]">
                          {report.modality}
                        </Badge>
                        <span className="truncate max-w-[160px]">{report.bodyPart}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-medium">
                      {report.orderingDoctor}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-medium text-foreground">{report.radiologistName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {report.authorizedAt ? new Date(report.authorizedAt).toLocaleDateString() : "Authorized"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]">
                        Report Ready
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="h-7 text-xs font-semibold text-primary border-primary/30 hover:bg-primary hover:text-primary-foreground"
                      >
                        <Link href={`/hospital-admin/radiology/reports/${report.id}`}>
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
