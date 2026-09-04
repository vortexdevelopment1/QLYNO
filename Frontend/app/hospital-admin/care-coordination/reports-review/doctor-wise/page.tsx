"use client";

import React, { useState, useMemo } from "react";
import {
  UserCheck,
  Search,
  Filter,
  Stethoscope,
  Building2,
  Clock,
  AlertOctagon,
  FileCheck2,
  Eye,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Layers,
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
import { ViewReportDetailDrawer } from "@/hospital-admin/components/care-coordination/ViewReportDetailDrawer";
import { mockCareCoordinationReportsReview } from "@/hospital-admin/lib/mock-data/reports-review-extended";
import { CareCoordinationReportReviewItem } from "@/hospital-admin/lib/types";

export default function DoctorWiseReportsReviewPage() {
  const [reports, setReports] = useState<CareCoordinationReportReviewItem[]>(mockCareCoordinationReportsReview);
  const [search, setSearch] = useState("");
  const [expandedDoctors, setExpandedDoctors] = useState<Record<string, boolean>>({
    DOC_001: true,
    DOC_002: true,
    DOC_003: true,
    DOC_004: true,
    DOC_005: true,
  });

  // Modal States
  const [signOffModalOpen, setSignOffModalOpen] = useState(false);
  const [clarificationModalOpen, setClarificationModalOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<CareCoordinationReportReviewItem | null>(null);

  // Group pending reports by doctor
  const doctorGroups = useMemo(() => {
    const pending = reports.filter((r) => r.status !== "reviewed");
    const map = new Map<
      string,
      {
        doctorId: string;
        doctorName: string;
        specialty: string;
        department: string;
        items: CareCoordinationReportReviewItem[];
        criticalCount: number;
        overdueCount: number;
      }
    >();

    pending.forEach((item) => {
      if (!map.has(item.attendingDoctorId)) {
        map.set(item.attendingDoctorId, {
          doctorId: item.attendingDoctorId,
          doctorName: item.attendingDoctorName,
          specialty: item.doctorSpecialty,
          department: item.department,
          items: [],
          criticalCount: 0,
          overdueCount: 0,
        });
      }
      const group = map.get(item.attendingDoctorId)!;
      group.items.push(item);
      if (item.isCritical) group.criticalCount++;
      if (item.isOverdue) group.overdueCount++;
    });

    let groups = Array.from(map.values());
    if (search.trim()) {
      const q = search.toLowerCase();
      groups = groups.filter(
        (g) =>
          g.doctorName.toLowerCase().includes(q) ||
          g.specialty.toLowerCase().includes(q) ||
          g.department.toLowerCase().includes(q) ||
          g.items.some((it) => it.patientName.toLowerCase().includes(q) || it.testOrStudyName.toLowerCase().includes(q))
      );
    }
    return groups;
  }, [reports, search]);

  const toggleDoctor = (id: string) => {
    const safeKey = id.replace("-", "_");
    setExpandedDoctors((prev) => ({ ...prev, [safeKey]: !prev[safeKey] }));
  };

  const handleUpdateReport = (updated: CareCoordinationReportReviewItem) => {
    setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Doctor-Wise Reports Queue"
        description="Physician-specific diagnostic sign-off queues and clinical workload distribution"
        crumbs={[
          { label: "Care Coordination", href: "/hospital-admin/care-coordination/patient-journey" },
          { label: "Reports Awaiting Review", href: "/hospital-admin/care-coordination/reports-review" },
          { label: "Doctor-wise" },
        ]}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Physician Workload View" />
        <div className="flex items-center gap-2 text-xs font-mono">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {doctorGroups.length} Active Physician Queues
          </Badge>
        </div>
      </div>

      <ReportsReviewNav />

      {/* Search Header */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filter by doctor name, medical specialty, department or patient..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 text-xs h-9"
        />
      </div>

      {/* Doctor Queues Stack */}
      {doctorGroups.length === 0 ? (
        <Card className="border-border shadow-xs">
          <CardContent className="py-10">
            <EmptyState
              icon={UserCheck}
              title="No Pending Physician Queues"
              description="All assigned attending physicians have completed their pending diagnostic report reviews."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3.5">
          {doctorGroups.map((group) => {
            const safeKey = group.doctorId.replace("-", "_");
            const isExpanded = expandedDoctors[safeKey] ?? true;

            return (
              <Card key={group.doctorId} className="border-border shadow-xs overflow-hidden">
                {/* Doctor Header Banner */}
                <div
                  className="p-4 bg-muted/20 hover:bg-muted/35 cursor-pointer transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  onClick={() => toggleDoctor(group.doctorId)}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                      <Stethoscope className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{group.doctorName}</span>
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {group.doctorId}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {group.specialty} • {group.department}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                      {group.items.length} Pending
                    </Badge>
                    {group.criticalCount > 0 && (
                      <Badge
                        variant="outline"
                        className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 font-bold text-xs"
                      >
                        <AlertOctagon className="h-3 w-3 mr-1" />
                        {group.criticalCount} Critical
                      </Badge>
                    )}
                    {group.overdueCount > 0 && (
                      <Badge
                        variant="outline"
                        className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-xs"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {group.overdueCount} Overdue
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 ml-1">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Collapsible Doctor Table */}
                {isExpanded && (
                  <CardContent className="p-0 border-t border-border/60">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40 text-[11px]">
                          <TableHead className="w-[180px] font-bold">Patient &amp; UHID</TableHead>
                          <TableHead className="font-bold">Test / Study</TableHead>
                          <TableHead className="font-bold">Modality &amp; Source</TableHead>
                          <TableHead className="font-bold">Waiting Duration</TableHead>
                          <TableHead className="font-bold">Priority</TableHead>
                          <TableHead className="text-right font-bold pr-4">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.items.map((report) => (
                          <TableRow
                            key={report.id}
                            className={
                              report.isCritical
                                ? "bg-rose-50/25 dark:bg-rose-950/20 hover:bg-rose-50/50"
                                : "hover:bg-muted/30"
                            }
                          >
                            <TableCell className="py-2.5">
                              <div className="font-semibold text-xs text-foreground">{report.patientName}</div>
                              <div className="text-[10px] text-muted-foreground font-mono">
                                {report.patientUhid} • {report.patientAgeGender}
                              </div>
                            </TableCell>

                            <TableCell className="py-2.5">
                              <div className="font-medium text-xs text-foreground">{report.testOrStudyName}</div>
                              <div className="text-[10px] text-muted-foreground truncate max-w-[260px]">
                                {report.impression}
                              </div>
                            </TableCell>

                            <TableCell className="py-2.5">
                              <div className="text-xs text-foreground">{report.modalityOrCategory}</div>
                              <span className="text-[10px] text-muted-foreground font-mono uppercase">
                                {report.sourceModule} • {report.orderId}
                              </span>
                            </TableCell>

                            <TableCell className="py-2.5">
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
                            </TableCell>

                            <TableCell className="py-2.5">
                              {report.isCritical ? (
                                <Badge
                                  variant="outline"
                                  className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[9px] font-bold"
                                >
                                  CRITICAL
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-[9px]">
                                  ROUTINE
                                </Badge>
                              )}
                            </TableCell>

                            <TableCell className="py-2.5 text-right pr-4">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  title="View Report"
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
                                  className="h-7 text-xs px-2 text-amber-700 dark:text-amber-300 border-amber-500/30"
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
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

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
