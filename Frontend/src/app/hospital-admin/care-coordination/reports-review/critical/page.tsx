"use client";

import React, { useState, useMemo } from "react";
import {
  AlertOctagon,
  Flame,
  Search,
  Clock,
  Stethoscope,
  Building2,
  FileCheck2,
  RotateCcw,
  Eye,
  Send,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Input } from "@/hospital-admin/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { EmptyState } from "@/hospital-admin/components/shared/empty-state";
import { ReportsReviewNav } from "@/hospital-admin/components/care-coordination/reports-review-nav";
import { SignOffReportModal } from "@/hospital-admin/components/care-coordination/SignOffReportModal";
import { AddendumClarificationModal } from "@/hospital-admin/components/care-coordination/AddendumClarificationModal";
import { EscalateOverdueModal } from "@/hospital-admin/components/care-coordination/EscalateOverdueModal";
import { ViewReportDetailDrawer } from "@/hospital-admin/components/care-coordination/ViewReportDetailDrawer";
import { mockCareCoordinationReportsReview } from "@/hospital-admin/lib/mock-data/reports-review-extended";
import { CareCoordinationReportReviewItem } from "@/hospital-admin/lib/types";

export default function CriticalReportsReviewPage() {
  const [reports, setReports] = useState<CareCoordinationReportReviewItem[]>(mockCareCoordinationReportsReview);
  const [search, setSearch] = useState("");

  // Modal States
  const [signOffModalOpen, setSignOffModalOpen] = useState(false);
  const [clarificationModalOpen, setClarificationModalOpen] = useState(false);
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<CareCoordinationReportReviewItem | null>(null);

  // Critical reports pending sign-off (Aggregated strictly from F13 and F14 per Rule F22-CANNOT-2)
  const criticalReports = useMemo(() => {
    return reports.filter((r) => {
      if (!r.isCritical || r.status === "reviewed") return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          r.patientName.toLowerCase().includes(q) ||
          r.patientUhid.toLowerCase().includes(q) ||
          r.testOrStudyName.toLowerCase().includes(q) ||
          r.attendingDoctorName.toLowerCase().includes(q) ||
          (r.criticalDetails && r.criticalDetails.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [reports, search]);

  const handleUpdateReport = (updated: CareCoordinationReportReviewItem) => {
    setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Critical Diagnostic Reports"
        description="Consolidated high-priority queue of lab panic values and critical radiological findings awaiting physician sign-off"
        crumbs={[
          { label: "Care Coordination", href: "/hospital-admin/care-coordination/patient-journey" },
          { label: "Reports Awaiting Review", href: "/hospital-admin/care-coordination/reports-review" },
          { label: "Critical Reports" },
        ]}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Station Lead" stationName="Emergency & Critical Care Diagnostic Protocol" />
        <Badge
          variant="outline"
          className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 font-bold text-xs"
        >
          <AlertOctagon className="h-3.5 w-3.5 mr-1" />
          {criticalReports.length} Unresolved Critical Results
        </Badge>
      </div>

      <ReportsReviewNav />

      {/* Critical Architecture Rule Banner */}
      <div className="rounded-xl border border-rose-500/30 bg-rose-50/40 dark:bg-rose-950/20 p-4 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200 font-bold text-sm">
          <ShieldAlert className="h-4 w-4 text-rose-600" />
          Aggregated Critical Findings (Rule F22-CANNOT-2 Compliant)
        </div>
        <p className="text-rose-700/90 dark:text-rose-300/90 leading-relaxed">
          This deck aggregates released critical panic values directly from the <strong>Laboratory Panic Reports Log (F13)</strong> and <strong>Radiology Critical Findings Log (F14)</strong>. It provides attending physicians with an immediate actionable sign-off window (SLA &lt;2 hours).
        </p>
      </div>

      {/* Critical Reports Table Card */}
      <Card className="border-rose-200 dark:border-rose-900/60 shadow-xs">
        <CardHeader className="p-4 pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-rose-800 dark:text-rose-200">
                <Flame className="h-4 w-4 text-rose-600" /> Critical Reports Awaiting Sign-Off
              </CardTitle>
              <CardDescription className="text-xs">
                Mandatory clinician review required to unblock downstream emergency intervention and surgical care.
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search panic findings, patient..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs h-8"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-rose-50/60 dark:bg-rose-950/40 text-[11px]">
                <TableHead className="w-[180px] font-bold text-rose-950 dark:text-rose-100">Patient &amp; UHID</TableHead>
                <TableHead className="font-bold text-rose-950 dark:text-rose-100">Test / Modality</TableHead>
                <TableHead className="min-w-[280px] max-w-[380px] font-bold text-rose-950 dark:text-rose-100">Critical Panic Findings</TableHead>
                <TableHead className="font-bold text-rose-950 dark:text-rose-100">Elapsed &amp; SLA Limit</TableHead>
                <TableHead className="font-bold text-rose-950 dark:text-rose-100">Attending Physician</TableHead>
                <TableHead className="text-right font-bold pr-4 text-rose-950 dark:text-rose-100">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {criticalReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8">
                    <EmptyState
                      icon={ShieldAlert}
                      title="No Pending Critical Reports"
                      description="All urgent panic values and red-flag imaging findings have been reviewed and signed off."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                criticalReports.map((report) => (
                  <TableRow key={report.id} className="bg-rose-50/20 dark:bg-rose-950/10 hover:bg-rose-50/40">
                    {/* Patient */}
                    <TableCell className="py-3">
                      <div className="font-bold text-xs text-foreground">{report.patientName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {report.patientUhid} • {report.patientAgeGender}
                      </div>
                    </TableCell>

                    {/* Test / Modality */}
                    <TableCell className="py-3">
                      <div className="font-semibold text-xs text-foreground">{report.testOrStudyName}</div>
                      <Badge variant="outline" className="text-[9px] font-mono uppercase mt-0.5">
                        {report.sourceModule} • {report.modalityOrCategory}
                      </Badge>
                    </TableCell>

                    {/* Critical Panic Findings */}
                    <TableCell className="py-3 min-w-[280px] max-w-[380px] whitespace-normal break-words">
                      <div className="p-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-semibold whitespace-normal break-words leading-relaxed">
                        {report.criticalDetails}
                      </div>
                    </TableCell>

                    {/* Elapsed & SLA Limit */}
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
                      <span className="text-[10px] text-muted-foreground font-medium">
                        SLA Limit: {report.slaDeadlineMinutes} mins
                      </span>
                    </TableCell>

                    {/* Attending Doctor */}
                    <TableCell className="py-3">
                      <div className="font-semibold text-xs text-foreground flex items-center gap-1">
                        <Stethoscope className="h-3 w-3 text-primary" /> {report.attendingDoctorName}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{report.doctorSpecialty}</div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-3 text-right pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          title="View Full Report"
                          onClick={() => {
                            setSelectedReport(report);
                            setDetailDrawerOpen(true);
                          }}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs px-2 text-amber-700 dark:text-amber-300 border-amber-500/30"
                          title="Dispatch Escalation Alert"
                          onClick={() => {
                            setSelectedReport(report);
                            setEscalateModalOpen(true);
                          }}
                        >
                          <Send className="h-3 w-3 mr-1" /> Escalate
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 text-xs px-2.5 font-semibold bg-rose-600 hover:bg-rose-700 text-white gap-1 shadow-xs"
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

      <EscalateOverdueModal
        open={escalateModalOpen}
        onOpenChange={setEscalateModalOpen}
        report={selectedReport}
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
