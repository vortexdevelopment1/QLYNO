"use client";

import React from "react";
import {
  FileText,
  User,
  Calendar,
  Clock,
  Stethoscope,
  Building2,
  AlertOctagon,
  CheckCircle2,
  Lock,
  FileCheck2,
  RotateCcw,
  Send,
  X,
  Sparkles,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/hospital-admin/components/ui/sheet";
import { Button } from "@/hospital-admin/components/ui/button";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { CareCoordinationReportReviewItem } from "@/hospital-admin/lib/types";

interface ViewReportDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: CareCoordinationReportReviewItem | null;
  onSignOffClick: (report: CareCoordinationReportReviewItem) => void;
  onClarificationClick: (report: CareCoordinationReportReviewItem) => void;
  onPatientNotifyClick?: (report: CareCoordinationReportReviewItem) => void;
}

export function ViewReportDetailDrawer({
  open,
  onOpenChange,
  report,
  onSignOffClick,
  onClarificationClick,
  onPatientNotifyClick,
}: ViewReportDetailDrawerProps) {
  if (!report) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl w-full overflow-y-auto p-6 space-y-5">
        <SheetHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className="text-[10px] font-mono uppercase bg-primary/10 text-primary border-primary/20"
            >
              {report.sourceModule.toUpperCase()} • {report.orderId}
            </Badge>
            <Badge
              variant="outline"
              className={
                report.isCritical
                  ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 font-bold text-[10px]"
                  : report.status === "reviewed"
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                  : "bg-muted text-muted-foreground text-[10px]"
              }
            >
              {report.isCritical
                ? "CRITICAL FINDING"
                : report.status === "reviewed"
                ? "CLINICALLY SIGNED OFF"
                : "PENDING DOCTOR SIGN-OFF"}
            </Badge>
          </div>
          <SheetTitle className="text-lg font-bold text-foreground mt-1">
            {report.testOrStudyName}
          </SheetTitle>
          <SheetDescription className="text-xs">
            {report.modalityOrCategory} • Released on {new Date(report.releasedAt).toLocaleString()}
          </SheetDescription>
        </SheetHeader>

        {/* Patient Demographic Card */}
        <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <User className="h-4 w-4 text-primary" /> {report.patientName}
            </span>
            <span className="font-mono text-muted-foreground">{report.patientUhid}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-1 border-t border-border/60">
            <div>
              <span className="text-foreground font-medium">Age / Gender:</span> {report.patientAgeGender}
            </div>
            <div>
              <span className="text-foreground font-medium">Phone:</span> {report.patientPhone}
            </div>
            <div>
              <span className="text-foreground font-medium">Department:</span> {report.department}
            </div>
            <div>
              <span className="text-foreground font-medium">Waiting Time:</span>{" "}
              <span className={report.isOverdue ? "text-rose-600 font-bold" : ""}>{report.waitingDuration}</span>
            </div>
          </div>
        </div>

        {/* Critical Banner */}
        {report.isCritical && report.criticalDetails && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertOctagon className="h-4 w-4" /> Panic Critical Value Alert
            </div>
            <p className="text-[11px] leading-relaxed">{report.criticalDetails}</p>
          </div>
        )}

        {/* Clinical Diagnostic Data */}
        <div className="space-y-3 text-xs">
          <div className="space-y-1">
            <span className="font-semibold text-foreground uppercase tracking-wider text-[10px]">
              Key Diagnostic Findings
            </span>
            <p className="p-3 rounded-lg border border-border bg-card text-foreground/90 text-xs leading-relaxed">
              {report.keyFindings}
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-semibold text-foreground uppercase tracking-wider text-[10px]">
              Diagnostic Impression / Conclusion
            </span>
            <p className="p-3 rounded-lg border border-border bg-primary/5 text-foreground text-xs leading-relaxed font-medium">
              {report.impression}
            </p>
          </div>

          {report.referenceRangesOrSummary && (
            <div className="space-y-1">
              <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
                Reference Standards / Summary
              </span>
              <p className="p-2.5 rounded border border-border bg-muted/20 text-muted-foreground font-mono text-[11px]">
                {report.referenceRangesOrSummary}
              </p>
            </div>
          )}
        </div>

        {/* Clinician Review & Audit Section */}
        <div className="rounded-xl border border-border bg-card p-3.5 space-y-2 text-xs shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Stethoscope className="h-4 w-4 text-primary" /> Ordering / Attending Physician
            </span>
            <Badge variant="outline" className="text-[10px] text-muted-foreground font-mono">
              {report.attendingDoctorId}
            </Badge>
          </div>
          <p className="text-xs font-semibold text-foreground">{report.attendingDoctorName}</p>
          <p className="text-[11px] text-muted-foreground">{report.doctorSpecialty} • {report.department}</p>

          {report.status === "reviewed" && (
            <div className="pt-2 border-t border-border/60 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Clinically Signed Off
                </span>
                <span className="font-mono text-muted-foreground text-[10px]">
                  {report.signedOffAt && new Date(report.signedOffAt).toLocaleString()}
                </span>
              </div>
              {report.signOffNote && (
                <p className="p-2 rounded bg-muted/30 border border-border/60 text-[11px] text-foreground">
                  &ldquo;{report.signOffNote}&rdquo;
                </p>
              )}
              {report.auditStamp && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                  <Lock className="h-3 w-3" /> Audit Stamp: {report.auditStamp}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Footer Buttons */}
        <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close Drawer
          </Button>
          <div className="flex items-center gap-2">
            {report.status !== "reviewed" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/10 gap-1"
                  onClick={() => {
                    onOpenChange(false);
                    onClarificationClick(report);
                  }}
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Request Addendum
                </Button>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1"
                  onClick={() => {
                    onOpenChange(false);
                    onSignOffClick(report);
                  }}
                >
                  <FileCheck2 className="h-3.5 w-3.5" /> Sign Off Report
                </Button>
              </>
            )}
            {report.status === "reviewed" && !report.isPatientNotified && onPatientNotifyClick && (
              <Button
                size="sm"
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold gap-1"
                onClick={() => {
                  onOpenChange(false);
                  onPatientNotifyClick(report);
                }}
              >
                <Send className="h-3.5 w-3.5" /> Notify Patient
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
