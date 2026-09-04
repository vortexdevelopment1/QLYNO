"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  BarChart3,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  History,
  Layers,
  PieChart,
  Radio,
  Search,
  ShieldAlert,
  ShieldCheck,
  Timer,
  User,
  XCircle,
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
import { RadiologyNav } from "@/hospital-admin/components/radiology/radiology-nav";
import { mockStudyHistory } from "@/hospital-admin/lib/mock-data/radiology-extended-operations";
import { StudyHistoryItem } from "@/hospital-admin/lib/types";

export default function RadiologyHistoryPage() {
  const [mounted, setMounted] = useState(false);
  const [historyItems] = useState<StudyHistoryItem[]>(mockStudyHistory);
  const [search, setSearch] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState("all");
  const [modalityFilter, setModalityFilter] = useState("all");

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredHistory = useMemo(() => {
    return historyItems.filter((item) => {
      const matchesSearch =
        item.orderNo.toLowerCase().includes(search.toLowerCase()) ||
        item.patientName.toLowerCase().includes(search.toLowerCase()) ||
        item.uhid.toLowerCase().includes(search.toLowerCase()) ||
        item.bodyPart.toLowerCase().includes(search.toLowerCase()) ||
        item.radiologistName.toLowerCase().includes(search.toLowerCase()) ||
        item.orderingDoctor.toLowerCase().includes(search.toLowerCase());
      const matchesOutcome = outcomeFilter === "all" || item.outcome === outcomeFilter;
      const matchesModality = modalityFilter === "all" || item.modality === modalityFilter;
      return matchesSearch && matchesOutcome && matchesModality;
    });
  }, [historyItems, search, outcomeFilter, modalityFilter]);

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Radiology Study History &amp; Turnaround Analytics"
          description="Permanent chronological archive of completed and cancelled imaging studies with turnaround time metrics and utilization logs."
          crumbs={[{ label: "Clinical Operations" }, { label: "Radiology", href: "/hospital-admin/radiology" }, { label: "History" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading study history archive...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Radiology Study History &amp; Turnaround Analytics"
        description="Permanent chronological archive of completed and cancelled imaging studies with turnaround time metrics and utilization logs."
        crumbs={[{ label: "Clinical Operations" }, { label: "Radiology", href: "/hospital-admin/radiology" }, { label: "History" }]}
      />

      <RadiologyNav />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Radiology Quality &amp; Utilization Analytics" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-emerald-600" />
          <span>Diagnostic Study Archive: Immutable study archive with recorded outcomes and turnaround timestamps</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Studies Logged</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{historyItems.length} Studies</p>
          <span className="text-[10px] text-muted-foreground">Archived in history store</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Completed Successfully</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
            {historyItems.filter((h) => h.outcome === "Completed").length} Completed
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">96.8% procedure completion</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Average Order-To-Report TAT</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">25.6 Mins</p>
          <span className="text-[10px] text-cyan-600 font-medium">From order placement to sign-off</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Cancelled / Aborted</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">
            {historyItems.filter((h) => h.outcome === "Cancelled" || h.outcome === "Aborted").length} Studies
          </p>
          <span className="text-[10px] text-amber-600 font-medium">With recorded reason audit</span>
        </Card>
      </div>

      {/* History Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Historical Study Log &amp; Procedure Outcomes</CardTitle>
          <CardDescription className="text-xs">
            Review detailed execution records, machine suite allocation, technologist and radiologist attribution, and total turnaround time.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search history, patient, doctor, order..."
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

              <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
                <SelectTrigger className="w-[140px] text-xs h-9">
                  <SelectValue placeholder="Outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Outcomes</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Aborted">Aborted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold w-[120px]">Order #</TableHead>
                  <TableHead className="text-xs font-bold w-[220px]">Patient Details</TableHead>
                  <TableHead className="text-xs font-bold w-[220px]">Modality &amp; Study</TableHead>
                  <TableHead className="text-xs font-bold w-[200px]">Assigned Suite &amp; Tech</TableHead>
                  <TableHead className="text-xs font-bold w-[180px]">Reporting Radiologist</TableHead>
                  <TableHead className="text-xs font-bold w-[130px]">Total TAT</TableHead>
                  <TableHead className="text-xs font-bold w-[120px]">Outcome</TableHead>
                  <TableHead className="text-xs font-bold text-right w-[140px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {item.orderNo}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground">{item.patientName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{item.uhid}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px]">
                          {item.modality}
                        </Badge>
                        <span className="truncate max-w-[160px]">{item.bodyPart}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">Dr: {item.orderingDoctor}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-foreground font-medium">{item.suiteName.split(" ")[0]} Suite</div>
                      <div className="text-[10px] text-muted-foreground font-mono">Tech: {item.technologistName}</div>
                    </TableCell>
                    <TableCell className="text-xs text-foreground font-medium">
                      {item.radiologistName}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 font-mono text-xs font-bold text-emerald-600">
                        <Timer className="h-3 w-3" />
                        <span>{item.totalTurnaroundTimeMins} mins</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {new Date(item.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          item.outcome === "Completed"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                        }
                      >
                        {item.outcome}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.dicomViewerUrl ? (
                        <Button size="sm" variant="outline" asChild className="h-7 text-xs font-semibold text-cyan-600 dark:text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10">
                          <Link href={item.dicomViewerUrl}>
                            <Eye className="h-3 w-3 mr-1" /> View PACS
                          </Link>
                        </Button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">No Images</span>
                      )}
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
