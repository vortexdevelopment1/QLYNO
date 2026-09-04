"use client";

import React, { useState, useMemo } from "react";
import {
  Clock,
  Search,
  Send,
  AlertTriangle,
  Stethoscope,
  Building2,
  FileCheck2,
  Eye,
  RotateCcw,
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

export default function OverdueReportsReviewPage() {
  const [reports, setReports] = useState<CareCoordinationReportReviewItem[]>(mockCareCoordinationReportsReview);
  const [search, setSearch] = useState("");

  // Modal States
  const [signOffModalOpen, setSignOffModalOpen] = useState(false);
  const [clarificationModalOpen, setClarificationModalOpen] = useState(false);
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<CareCoordinationReportReviewItem | null>(null);

  // Overdue reports
  const overdueReports = useMemo(() => {
    return reports.filter((r) => {
      if (!r.isOverdue || r.status === "reviewed") return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          r.patientName.toLowerCase().includes(q) ||
          r.patientUhid.toLowerCase().includes(q) ||
          r.testOrStudyName.toLowerCase().includes(q) ||
          r.attendingDoctorName.toLowerCase().includes(q)
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
        title="Overdue Report Reviews"
        description="Formal SLA tracking for diagnostic reports exceeding turnaround limits with multi-channel escalation dispatch"
        crumbs={[
          { label: "Care Coordination", href: "/hospital-admin/care-coordination/patient-journey" },
          { label: "Reports Awaiting Review", href: "/hospital-admin/care-coordination/reports-review" },
          { label: "Overdue Reviews" },
        ]}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Station Lead" stationName="Quality Compliance & Clinical SLA Center" />
        <Badge
          variant="outline"
          className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-bold text-xs"
        >
          <Clock className="h-3.5 w-3.5 mr-1" />
          {overdueReports.length} SLA Breaches Active
        </Badge>
      </div>

      <ReportsReviewNav />

      {/* SLA Policy Banner */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/20 p-4 space-y-1.5 text-xs">
        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-sm">
          <Clock className="h-4 w-4 text-amber-600" />
          NABH Clinical Quality &amp; Diagnostic SLA Protocols
        </div>
        <p className="text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
          Standard SLA thresholds: <strong>Critical panic findings &lt; 120 minutes (2 hrs)</strong>; <strong>Routine diagnostics &lt; 360 minutes (6 hrs)</strong>. Any breach triggers automated escalation tiers routing to attending clinicians and department heads.
        </p>
      </div>

      {/* Overdue Table Card */}
      <Card className="border-amber-200 dark:border-amber-900/60 shadow-xs">
        <CardHeader className="p-4 pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-900 dark:text-amber-200">
                <Clock className="h-4 w-4 text-amber-600" /> Active SLA Breach Deck
              </CardTitle>
              <CardDescription className="text-xs">
                Diagnostic reports past target turnaround time requiring immediate review or dispatch escalation.
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search patient, study, doctor..."
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
              <TableRow className="bg-amber-50/60 dark:bg-amber-950/40 text-[11px]">
                <TableHead className="w-[180px] font-bold text-amber-950 dark:text-amber-100">Patient &amp; UHID</TableHead>
                <TableHead className="font-bold text-amber-950 dark:text-amber-100">Test / Study</TableHead>
                <TableHead className="font-bold text-amber-950 dark:text-amber-100">Elapsed Waiting Time</TableHead>
                <TableHead className="font-bold text-amber-950 dark:text-amber-100">SLA Threshold</TableHead>
                <TableHead className="font-bold text-amber-950 dark:text-amber-100">Attending Doctor</TableHead>
                <TableHead className="text-right font-bold pr-4 text-amber-950 dark:text-amber-100">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overdueReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8">
                    <EmptyState
                      icon={Clock}
                      title="No Overdue Reports"
                      description="All released diagnostic reports are currently within hospital clinical SLA turnaround standards."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                overdueReports.map((report) => (
                  <TableRow key={report.id} className="bg-amber-50/20 dark:bg-amber-950/10 hover:bg-amber-50/40">
                    {/* Patient */}
                    <TableCell className="py-3">
                      <div className="font-bold text-xs text-foreground">{report.patientName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {report.patientUhid} • {report.patientAgeGender}
                      </div>
                    </TableCell>

                    {/* Test */}
                    <TableCell className="py-3">
                      <div className="font-semibold text-xs text-foreground">{report.testOrStudyName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono uppercase">
                        {report.sourceModule} • {report.department}
                      </div>
                    </TableCell>

                    {/* Elapsed Waiting */}
                    <TableCell className="py-3">
                      <Badge
                        variant="outline"
                        className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 font-bold text-xs font-mono"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {report.waitingDuration}
                      </Badge>
                    </TableCell>

                    {/* SLA Threshold */}
                    <TableCell className="py-3">
                      <span className="text-xs font-semibold text-foreground">{report.slaDeadlineMinutes} mins</span>
                      <p className="text-[10px] text-muted-foreground">
                        {report.isCritical ? "Panic Value SLA" : "Routine Diagnostic SLA"}
                      </p>
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
                          className="h-7 text-xs px-2.5 text-amber-800 dark:text-amber-200 border-amber-500/40 hover:bg-amber-500/10 font-semibold"
                          onClick={() => {
                            setSelectedReport(report);
                            setEscalateModalOpen(true);
                          }}
                        >
                          <Send className="h-3 w-3 mr-1" /> Dispatch Escalation
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 text-xs px-2.5 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-1 shadow-xs"
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
