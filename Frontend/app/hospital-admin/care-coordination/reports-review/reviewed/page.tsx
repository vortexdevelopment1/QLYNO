"use client";

import React, { useState, useMemo } from "react";
import {
  FileCheck2,
  Search,
  CheckCircle2,
  Lock,
  Stethoscope,
  Building2,
  Eye,
  Send,
  Sparkles,
  ShieldCheck,
  Calendar,
  Layers,
  FlaskConical,
  Scan,
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
import { RecordPatientNotificationModal } from "@/hospital-admin/components/care-coordination/RecordPatientNotificationModal";
import { ViewReportDetailDrawer } from "@/hospital-admin/components/care-coordination/ViewReportDetailDrawer";
import {
  mockCareCoordinationReportsReview,
  mockPatientNotificationRecords,
} from "@/hospital-admin/lib/mock-data/reports-review-extended";
import { CareCoordinationReportReviewItem, PatientNotificationRecord } from "@/hospital-admin/lib/types";

export default function ReviewedReportsArchivePage() {
  const [reports, setReports] = useState<CareCoordinationReportReviewItem[]>(mockCareCoordinationReportsReview);
  const [notifications, setNotifications] = useState<PatientNotificationRecord[]>(mockPatientNotificationRecords);
  const [search, setSearch] = useState("");

  // Modal States
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<CareCoordinationReportReviewItem | null>(null);

  // Reviewed Reports (status === 'reviewed')
  const reviewedReports = useMemo(() => {
    return reports.filter((r) => {
      if (r.status !== "reviewed") return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          r.patientName.toLowerCase().includes(q) ||
          r.patientUhid.toLowerCase().includes(q) ||
          r.testOrStudyName.toLowerCase().includes(q) ||
          (r.signedOffBy && r.signedOffBy.toLowerCase().includes(q)) ||
          (r.auditStamp && r.auditStamp.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [reports, search]);

  const handleNotificationRecorded = (
    newRecord: PatientNotificationRecord,
    updatedReport: CareCoordinationReportReviewItem
  ) => {
    setNotifications((prev) => [newRecord, ...prev]);
    setReports((prev) => prev.map((r) => (r.id === updatedReport.id ? updatedReport : r)));
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Reviewed Diagnostic Archive"
        description="Immutable ledger of physician signed-off reports, clinical review stamps, and downstream care authorizations"
        crumbs={[
          { label: "Care Coordination", href: "/hospital-admin/care-coordination/patient-journey" },
          { label: "Reports Awaiting Review", href: "/hospital-admin/care-coordination/reports-review" },
          { label: "Reviewed Archive" },
        ]}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Permanent Review Archive" />
        <div className="flex items-center gap-2 text-xs font-mono">
          <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-bold">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {reviewedReports.length} Authenticated Sign-Offs
          </Badge>
        </div>
      </div>

      <ReportsReviewNav />

      {/* Audit Guarantee Banner */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-1.5 text-xs">
        <div className="flex items-center gap-2 text-emerald-950 dark:text-emerald-200 font-bold text-sm">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Clinical Audit Immutability &amp; Longitudinal Sync (Rules F22-CAN-11, 12 &amp; CANNOT-8)
        </div>
        <p className="text-emerald-900/90 dark:text-emerald-300/90 leading-relaxed">
          Signed-off diagnostic records are permanently timestamped and cryptographically locked. Every sign-off satisfies downstream clinical gates in <code className="font-mono text-emerald-700 dark:text-emerald-300 font-bold">workflow-sequencing-guard.ts</code> for Operating Theater scheduling and Inpatient Discharge.
        </p>
      </div>

      {/* Reviewed Table Card */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-emerald-600" /> Authenticated Report Reviews
              </CardTitle>
              <CardDescription className="text-xs">
                Permanent sign-off records with clinician digital stamp, date/time, and downstream synchronization.
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search signed-off reports, UHID, doctor..."
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
              <TableRow className="bg-muted/40 text-[11px]">
                <TableHead className="w-[180px] font-bold">Patient &amp; UHID</TableHead>
                <TableHead className="font-bold">Test / Study</TableHead>
                <TableHead className="font-bold">Signing Clinician &amp; Reg No</TableHead>
                <TableHead className="font-bold">Sign-Off Timestamp &amp; Audit Hash</TableHead>
                <TableHead className="font-bold">Workflow &amp; Patient Status</TableHead>
                <TableHead className="text-right font-bold pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviewedReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8">
                    <EmptyState
                      icon={FileCheck2}
                      title="No Signed-Off Reports Found"
                      description="No diagnostic reports match the current query."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                reviewedReports.map((report) => (
                  <TableRow key={report.id} className="hover:bg-muted/30">
                    {/* Patient */}
                    <TableCell className="py-3">
                      <div className="font-semibold text-xs text-foreground">{report.patientName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {report.patientUhid} • {report.patientAgeGender}
                      </div>
                    </TableCell>

                    {/* Test */}
                    <TableCell className="py-3">
                      <div className="font-medium text-xs text-foreground flex items-center gap-1.5">
                        {report.sourceModule === "lab" ? (
                          <FlaskConical className="h-3.5 w-3.5 text-primary shrink-0" />
                        ) : (
                          <Scan className="h-3.5 w-3.5 text-cyan-600 shrink-0" />
                        )}
                        <span>{report.testOrStudyName}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate max-w-[220px]">
                        {report.signOffNote || report.impression}
                      </div>
                    </TableCell>

                    {/* Signing Clinician */}
                    <TableCell className="py-3">
                      <div className="font-semibold text-xs text-foreground flex items-center gap-1">
                        <Stethoscope className="h-3 w-3 text-emerald-600" /> {report.signedOffBy || report.attendingDoctorName}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {report.signedOffDoctorRegNo || "MCI-Registered"}
                      </div>
                    </TableCell>

                    {/* Timestamp & Audit Stamp */}
                    <TableCell className="py-3">
                      <div className="text-xs font-mono text-foreground">
                        {report.signedOffAt ? new Date(report.signedOffAt).toLocaleString() : "Recently Signed"}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono mt-0.5">
                        <Lock className="h-2.5 w-2.5 text-emerald-600" />
                        <span className="truncate max-w-[170px]">{report.auditStamp || "AUTH-SIG-VERIFIED"}</span>
                      </div>
                    </TableCell>

                    {/* Workflow & Patient Status */}
                    <TableCell className="py-3">
                      <div className="flex flex-col gap-1 items-start">
                        <Badge
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[9px] font-semibold"
                        >
                          <Sparkles className="h-2.5 w-2.5 mr-1" /> OT / IPD Unblocked
                        </Badge>
                        {report.isPatientNotified ? (
                          <Badge
                            variant="outline"
                            className="bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 text-[9px]"
                          >
                            <Send className="h-2.5 w-2.5 mr-1" /> Patient Notified
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[9px]"
                          >
                            Awaiting Patient Notice
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
                          title="View Full Report & Audit Trail"
                          onClick={() => {
                            setSelectedReport(report);
                            setDetailDrawerOpen(true);
                          }}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {!report.isPatientNotified && (
                          <Button
                            size="sm"
                            className="h-7 text-xs px-2.5 font-semibold bg-cyan-600 hover:bg-cyan-700 text-white gap-1 shadow-xs"
                            onClick={() => {
                              setSelectedReport(report);
                              setNotifyModalOpen(true);
                            }}
                          >
                            <Send className="h-3 w-3" /> Notify Patient
                          </Button>
                        )}
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
      <RecordPatientNotificationModal
        open={notifyModalOpen}
        onOpenChange={setNotifyModalOpen}
        report={selectedReport}
        onSuccess={handleNotificationRecorded}
      />

      <ViewReportDetailDrawer
        open={detailDrawerOpen}
        onOpenChange={setDetailDrawerOpen}
        report={selectedReport}
        onSignOffClick={() => {}}
        onClarificationClick={() => {}}
        onPatientNotifyClick={(r) => {
          setSelectedReport(r);
          setNotifyModalOpen(true);
        }}
      />
    </div>
  );
}
