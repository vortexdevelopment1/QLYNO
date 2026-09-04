"use client";

import React, { useState, useMemo } from "react";
import {
  Inbox,
  Search,
  Filter,
  FileCheck2,
  RotateCcw,
  Eye,
  AlertOctagon,
  Clock,
  Stethoscope,
  Building2,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Layers,
  FlaskConical,
  Scan,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Input } from "@/hospital-admin/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { EmptyState } from "@/hospital-admin/components/shared/empty-state";
import { ReportsReviewNav } from "@/hospital-admin/components/care-coordination/reports-review-nav";
import { SignOffReportModal } from "@/hospital-admin/components/care-coordination/SignOffReportModal";
import { AddendumClarificationModal } from "@/hospital-admin/components/care-coordination/AddendumClarificationModal";
import { ViewReportDetailDrawer } from "@/hospital-admin/components/care-coordination/ViewReportDetailDrawer";
import { mockCareCoordinationReportsReview } from "@/hospital-admin/lib/mock-data/reports-review-extended";
import { CareCoordinationReportReviewItem } from "@/hospital-admin/lib/types";

export default function AllPendingReportsReviewPage() {
  const [reports, setReports] = useState<CareCoordinationReportReviewItem[]>(mockCareCoordinationReportsReview);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [doctorFilter, setDoctorFilter] = useState<string>("all");
  const [criticalOnly, setCriticalOnly] = useState(false);

  // Modal States
  const [signOffModalOpen, setSignOffModalOpen] = useState(false);
  const [clarificationModalOpen, setClarificationModalOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<CareCoordinationReportReviewItem | null>(null);

  // Doctors list for filter
  const doctorsList = useMemo(() => {
    const map = new Map<string, string>();
    reports.forEach((r) => map.set(r.attendingDoctorId, r.attendingDoctorName));
    return Array.from(map.entries());
  }, [reports]);

  // Filtered Pending Reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Must be pending review or clarification requested
      if (r.status === "reviewed") return false;

      if (sourceFilter !== "all" && r.sourceModule !== sourceFilter) return false;
      if (doctorFilter !== "all" && r.attendingDoctorId !== doctorFilter) return false;
      if (criticalOnly && !r.isCritical) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesPatient =
          r.patientName.toLowerCase().includes(q) ||
          r.patientUhid.toLowerCase().includes(q) ||
          r.testOrStudyName.toLowerCase().includes(q) ||
          r.attendingDoctorName.toLowerCase().includes(q);
        if (!matchesPatient) return false;
      }

      return true;
    });
  }, [reports, search, sourceFilter, doctorFilter, criticalOnly]);

  const handleUpdateReport = (updated: CareCoordinationReportReviewItem) => {
    setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Reports Awaiting Review"
        description="Attending physician diagnostic review inbox — clinical sign-off, panic values, and downstream OT/IPD unblocking"
        crumbs={[
          { label: "Care Coordination", href: "/hospital-admin/care-coordination/patient-journey" },
          { label: "Reports Awaiting Review" },
        ]}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Physician Review Inbox" />
        <div className="flex items-center gap-2 text-xs font-mono">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {filteredReports.length} Pending Actions
          </Badge>
          <Badge variant="outline" className="bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30">
            {reports.filter((r) => r.isCritical && r.status !== "reviewed").length} Critical
          </Badge>
        </div>
      </div>

      <ReportsReviewNav />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border shadow-xs">
          <CardHeader className="p-3.5 pb-1">
            <CardDescription className="text-[11px] font-medium">Total Pending Review</CardDescription>
            <CardTitle className="text-xl font-bold font-mono text-foreground">
              {reports.filter((r) => r.status === "pending_review").length}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3.5 pt-0 text-[10px] text-muted-foreground">
            Awaiting physician sign-off
          </CardContent>
        </Card>

        <Card className="border-rose-200 dark:border-rose-950 bg-rose-50/30 dark:bg-rose-950/20 shadow-xs">
          <CardHeader className="p-3.5 pb-1">
            <CardDescription className="text-[11px] font-medium text-rose-700 dark:text-rose-300">
              Critical Panic Values
            </CardDescription>
            <CardTitle className="text-xl font-bold font-mono text-rose-700 dark:text-rose-300">
              {reports.filter((r) => r.isCritical && r.status !== "reviewed").length}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3.5 pt-0 text-[10px] text-rose-600/80 dark:text-rose-400/80">
            Aggregated from F13 &amp; F14 logs
          </CardContent>
        </Card>

        <Card className="border-amber-200 dark:border-amber-950 bg-amber-50/30 dark:bg-amber-950/20 shadow-xs">
          <CardHeader className="p-3.5 pb-1">
            <CardDescription className="text-[11px] font-medium text-amber-700 dark:text-amber-300">
              Overdue Reviews (&gt;SLA)
            </CardDescription>
            <CardTitle className="text-xl font-bold font-mono text-amber-700 dark:text-amber-300">
              {reports.filter((r) => r.isOverdue && r.status !== "reviewed").length}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3.5 pt-0 text-[10px] text-amber-600/80 dark:text-amber-400/80">
            Exceeded SLA turn-around limit
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="p-3.5 pb-1">
            <CardDescription className="text-[11px] font-medium">Clarification Active</CardDescription>
            <CardTitle className="text-xl font-bold font-mono text-cyan-600">
              {reports.filter((r) => r.status === "clarification_requested").length}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3.5 pt-0 text-[10px] text-muted-foreground">
            Reopened in Lab / Radiology
          </CardContent>
        </Card>
      </div>

      {/* Main Inbox Table Card */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Inbox className="h-4 w-4 text-primary" /> All Pending Diagnostic Reports
              </CardTitle>
              <CardDescription className="text-xs">
                Aggregated from released Central Lab orders and Report Ready Radiology studies awaiting attending review.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant={criticalOnly ? "default" : "outline"}
                size="sm"
                className={
                  criticalOnly
                    ? "bg-rose-600 hover:bg-rose-700 text-white text-xs h-8 gap-1 font-semibold"
                    : "text-xs h-8 gap-1 text-rose-700 dark:text-rose-300 border-rose-500/30"
                }
                onClick={() => setCriticalOnly(!criticalOnly)}
              >
                <AlertOctagon className="h-3.5 w-3.5" />
                {criticalOnly ? "Showing Criticals Only" : "Critical Only"}
              </Button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-3">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search patient, UHID, study or doctor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs h-8"
              />
            </div>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="text-xs h-8">
                <SelectValue placeholder="Source Module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Diagnostic Sources</SelectItem>
                <SelectItem value="lab">Laboratory Only (F13)</SelectItem>
                <SelectItem value="radiology">Radiology Only (F14)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={doctorFilter} onValueChange={setDoctorFilter}>
              <SelectTrigger className="text-xs h-8">
                <SelectValue placeholder="Attending Doctor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Attending Physicians</SelectItem>
                {doctorsList.map(([id, name]) => (
                  <SelectItem key={id} value={id}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 text-[11px]">
                  <TableHead className="w-[180px] font-bold">Patient &amp; UHID</TableHead>
                  <TableHead className="font-bold">Test / Study Name</TableHead>
                  <TableHead className="font-bold">Source &amp; Dept</TableHead>
                  <TableHead className="font-bold">Waiting Duration</TableHead>
                  <TableHead className="font-bold">Attending Doctor</TableHead>
                  <TableHead className="font-bold">Status / Priority</TableHead>
                  <TableHead className="text-right font-bold pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8">
                      <EmptyState
                        icon={Inbox}
                        title="No Pending Reports"
                        description="All diagnostic test results and imaging studies have been reviewed and signed off."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReports.map((report) => (
                    <TableRow
                      key={report.id}
                      className={
                        report.isCritical
                          ? "bg-rose-50/25 dark:bg-rose-950/20 hover:bg-rose-50/50"
                          : "hover:bg-muted/30"
                      }
                    >
                      {/* Patient */}
                      <TableCell className="py-3">
                        <div className="font-semibold text-xs text-foreground">{report.patientName}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {report.patientUhid} • {report.patientAgeGender}
                        </div>
                      </TableCell>

                      {/* Test Name */}
                      <TableCell className="py-3">
                        <div className="font-medium text-xs text-foreground flex items-center gap-1.5">
                          {report.sourceModule === "lab" ? (
                            <FlaskConical className="h-3.5 w-3.5 text-primary shrink-0" />
                          ) : (
                            <Scan className="h-3.5 w-3.5 text-cyan-600 shrink-0" />
                          )}
                          <span>{report.testOrStudyName}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate max-w-[240px]">
                          {report.impression}
                        </div>
                      </TableCell>

                      {/* Source & Dept */}
                      <TableCell className="py-3">
                        <div className="text-[11px] font-medium text-foreground">{report.department}</div>
                        <Badge variant="outline" className="text-[9px] font-mono uppercase mt-0.5">
                          {report.sourceModule} • {report.orderId}
                        </Badge>
                      </TableCell>

                      {/* Waiting Duration (Matches Dashboard widget) */}
                      <TableCell className="py-3">
                        <div
                          className={
                            report.isOverdue
                              ? "font-bold text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1"
                              : "text-xs font-mono text-foreground flex items-center gap-1"
                          }
                        >
                          <Clock className="h-3 w-3" />
                          {report.waitingDuration}
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          SLA: {report.slaDeadlineMinutes}m limit
                        </span>
                      </TableCell>

                      {/* Attending Doctor */}
                      <TableCell className="py-3">
                        <div className="font-semibold text-xs text-foreground flex items-center gap-1">
                          <Stethoscope className="h-3 w-3 text-primary" /> {report.attendingDoctorName}
                        </div>
                        <div className="text-[10px] text-muted-foreground">{report.doctorSpecialty}</div>
                      </TableCell>

                      {/* Status / Priority */}
                      <TableCell className="py-3">
                        <div className="flex flex-col gap-1 items-start">
                          {report.isCritical && (
                            <Badge
                              variant="outline"
                              className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[9px] font-bold animate-pulse"
                            >
                              <AlertOctagon className="h-2.5 w-2.5 mr-0.5" /> CRITICAL
                            </Badge>
                          )}
                          {report.status === "clarification_requested" ? (
                            <Badge
                              variant="outline"
                              className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[9px]"
                            >
                              Clarification Sent
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-primary/10 text-primary border-primary/20 text-[9px]"
                            >
                              Pending Review
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-3 text-right pr-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            title="View Full Diagnostic Report"
                            onClick={() => {
                              setSelectedReport(report);
                              setDetailDrawerOpen(true);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs px-2 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/10"
                            title="Request Re-test or Addendum"
                            onClick={() => {
                              setSelectedReport(report);
                              setClarificationModalOpen(true);
                            }}
                          >
                            <RotateCcw className="h-3 w-3 mr-1" /> Addendum
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 text-xs px-2.5 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-1 shadow-xs"
                            title="Digitally Sign Off Report"
                            onClick={() => {
                              setSelectedReport(report);
                              setSignOffModalOpen(true);
                            }}
                          >
                            <FileCheck2 className="h-3 w-3" /> Sign Off
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modals & Drawers */}
      <SignOffReportModal
        open={signOffModalOpen}
        onOpenChange={setSignOffModalOpen}
        report={selectedReport}
        onSuccess={handleUpdateReport}
      />

      <AddendumClarificationModal
        open={clarificationModalOpen}
        onOpenChange={setClarificationModalOpen}
        report={selectedReport}
        onSuccess={handleUpdateReport}
      />

      <ViewReportDetailDrawer
        open={detailDrawerOpen}
        onOpenChange={setDetailDrawerOpen}
        report={selectedReport}
        onSignOffClick={(r) => {
          setSelectedReport(r);
          setSignOffModalOpen(true);
        }}
        onClarificationClick={(r) => {
          setSelectedReport(r);
          setClarificationModalOpen(true);
        }}
      />
    </div>
  );
}
