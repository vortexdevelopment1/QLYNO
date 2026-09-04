"use client";

import React, { useState, useMemo } from "react";
import {
  Send,
  Search,
  CheckCircle2,
  Clock,
  Smartphone,
  Phone,
  MessageSquare,
  Globe,
  UserCheck,
  Building2,
  FileCheck2,
  Eye,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Input } from "@/hospital-admin/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/hospital-admin/components/ui/tabs";
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

export default function PatientNotifiedReportsPage() {
  const [reports, setReports] = useState<CareCoordinationReportReviewItem[]>(mockCareCoordinationReportsReview);
  const [notifications, setNotifications] = useState<PatientNotificationRecord[]>(mockPatientNotificationRecords);
  const [searchAwaiting, setSearchAwaiting] = useState("");
  const [searchHistory, setSearchHistory] = useState("");

  // Modal States
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<CareCoordinationReportReviewItem | null>(null);

  // Awaiting Patient Notification (reviewed === true AND isPatientNotified === false)
  const awaitingReports = useMemo(() => {
    return reports.filter((r) => {
      if (r.status !== "reviewed" || r.isPatientNotified) return false;
      if (searchAwaiting.trim()) {
        const q = searchAwaiting.toLowerCase();
        return (
          r.patientName.toLowerCase().includes(q) ||
          r.patientUhid.toLowerCase().includes(q) ||
          r.testOrStudyName.toLowerCase().includes(q) ||
          (r.signedOffBy && r.signedOffBy.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [reports, searchAwaiting]);

  // History Log
  const filteredHistory = useMemo(() => {
    return notifications.filter((n) => {
      if (searchHistory.trim()) {
        const q = searchHistory.toLowerCase();
        return (
          n.patientName.toLowerCase().includes(q) ||
          n.testName.toLowerCase().includes(q) ||
          n.notifiedBy.toLowerCase().includes(q) ||
          n.channel.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [notifications, searchHistory]);

  const handleNotificationRecorded = (
    newRecord: PatientNotificationRecord,
    updatedReport: CareCoordinationReportReviewItem
  ) => {
    setNotifications((prev) => [newRecord, ...prev]);
    setReports((prev) => prev.map((r) => (r.id === updatedReport.id ? updatedReport : r)));
  };

  const getChannelBadge = (channel: string) => {
    switch (channel) {
      case "whatsapp":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]">
            <Smartphone className="h-3 w-3 mr-1" /> WhatsApp
          </Badge>
        );
      case "sms":
        return (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px]">
            <MessageSquare className="h-3 w-3 mr-1" /> SMS Alert
          </Badge>
        );
      case "phone_call":
        return (
          <Badge variant="outline" className="bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 text-[10px]">
            <Phone className="h-3 w-3 mr-1" /> Telephonic
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground text-[10px]">
            <Globe className="h-3 w-3 mr-1" /> Patient Portal
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Patient Diagnostic Notifications"
        description="Track patient disclosure of physician-reviewed diagnostic results across WhatsApp, SMS, and telephonic channels"
        crumbs={[
          { label: "Care Coordination", href: "/hospital-admin/care-coordination/patient-journey" },
          { label: "Reports Awaiting Review", href: "/hospital-admin/care-coordination/reports-review" },
          { label: "Patient Notified" },
        ]}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Station Lead" stationName="Patient Communication & Care Coordination" />
        <div className="flex items-center gap-2 text-xs font-mono">
          <Badge variant="outline" className="bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 font-bold">
            {awaitingReports.length} Unsent Notifications
          </Badge>
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            {notifications.length} Historical Dispatches
          </Badge>
        </div>
      </div>

      <ReportsReviewNav />

      {/* Dual-View Tabs (Rule F22-CAN-14 & CANNOT-5) */}
      <Tabs defaultValue="awaiting" className="space-y-3">
        <TabsList className="grid w-full grid-cols-2 max-w-md h-9 p-1">
          <TabsTrigger value="awaiting" className="text-xs font-semibold">
            Awaiting Notification ({awaitingReports.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs font-semibold">
            Notification Audit History ({notifications.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Awaiting Notification */}
        <TabsContent value="awaiting" className="space-y-3">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-cyan-600" /> Reviewed Reports Awaiting Patient Notification
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Signed-off reports that require care coordinator or nursing communication to the patient.
                  </CardDescription>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search patient, study..."
                    value={searchAwaiting}
                    onChange={(e) => setSearchAwaiting(e.target.value)}
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
                    <TableHead className="font-bold">Patient Contact</TableHead>
                    <TableHead className="font-bold">Signed Off By</TableHead>
                    <TableHead className="font-bold">Reviewed At</TableHead>
                    <TableHead className="text-right font-bold pr-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {awaitingReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8">
                        <EmptyState
                          icon={CheckCircle2}
                          title="All Patients Notified"
                          description="There are currently no reviewed reports awaiting patient communication."
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    awaitingReports.map((report) => (
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
                          <div className="font-medium text-xs text-foreground">{report.testOrStudyName}</div>
                          <div className="text-[10px] text-muted-foreground">{report.department}</div>
                        </TableCell>

                        {/* Contact */}
                        <TableCell className="py-3">
                          <span className="font-mono text-xs text-foreground">{report.patientPhone}</span>
                        </TableCell>

                        {/* Signed Off By */}
                        <TableCell className="py-3">
                          <div className="text-xs font-semibold text-foreground">
                            {report.signedOffBy || report.attendingDoctorName}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {report.signedOffDoctorRegNo || "Verified Clinician"}
                          </div>
                        </TableCell>

                        {/* Reviewed At */}
                        <TableCell className="py-3 font-mono text-xs text-foreground">
                          {report.signedOffAt ? new Date(report.signedOffAt).toLocaleString() : "Recently"}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="py-3 text-right pr-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              title="View Diagnostic Report"
                              onClick={() => {
                                setSelectedReport(report);
                                setDetailDrawerOpen(true);
                              }}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 text-xs px-2.5 font-semibold bg-cyan-600 hover:bg-cyan-700 text-white gap-1 shadow-xs"
                              onClick={() => {
                                setSelectedReport(report);
                                setNotifyModalOpen(true);
                              }}
                            >
                              <Send className="h-3 w-3" /> Record Notice
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
        </TabsContent>

        {/* Tab 2: Notification Audit History */}
        <TabsContent value="history" className="space-y-3">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Send className="h-4 w-4 text-emerald-600" /> Patient Notification Audit Log
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Historical record of diagnostic results communicated to patients with delivery channels and staff attributions.
                  </CardDescription>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search notification history..."
                    value={searchHistory}
                    onChange={(e) => setSearchHistory(e.target.value)}
                    className="pl-8 text-xs h-8"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 text-[11px]">
                    <TableHead className="w-[180px] font-bold">Patient &amp; Phone</TableHead>
                    <TableHead className="font-bold">Test Name</TableHead>
                    <TableHead className="font-bold">Delivery Channel</TableHead>
                    <TableHead className="font-bold">Informed By (Staff)</TableHead>
                    <TableHead className="font-bold">Timestamp</TableHead>
                    <TableHead className="font-bold">Delivery Status &amp; Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8">
                        <EmptyState
                          icon={Send}
                          title="No Notification Records"
                          description="No patient notifications match the current search query."
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredHistory.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/30">
                        {/* Patient */}
                        <TableCell className="py-3">
                          <div className="font-semibold text-xs text-foreground">{item.patientName}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{item.patientPhone}</div>
                        </TableCell>

                        {/* Test */}
                        <TableCell className="py-3 text-xs font-medium text-foreground">{item.testName}</TableCell>

                        {/* Channel */}
                        <TableCell className="py-3">{getChannelBadge(item.channel)}</TableCell>

                        {/* Staff */}
                        <TableCell className="py-3">
                          <div className="text-xs font-semibold text-foreground">{item.notifiedBy}</div>
                          <div className="text-[10px] text-muted-foreground">{item.notifiedByRole}</div>
                        </TableCell>

                        {/* Timestamp */}
                        <TableCell className="py-3 font-mono text-xs text-foreground">
                          {new Date(item.notifiedAt).toLocaleString()}
                        </TableCell>

                        {/* Delivery Status */}
                        <TableCell className="py-3">
                          <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                            <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> {item.deliveryStatus}
                          </Badge>
                          {item.notes && (
                            <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[200px]">
                              {item.notes}
                            </p>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
