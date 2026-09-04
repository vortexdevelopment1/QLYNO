"use client";

import React, { useState } from "react";
import {
  FileCheck2,
  ShieldCheck,
  Stethoscope,
  AlertTriangle,
  Lock,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/hospital-admin/components/ui/dialog";
import { Button } from "@/hospital-admin/components/ui/button";
import { Label } from "@/hospital-admin/components/ui/label";
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { CareCoordinationReportReviewItem } from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";

interface SignOffReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: CareCoordinationReportReviewItem | null;
  onSuccess: (updatedReport: CareCoordinationReportReviewItem) => void;
}

export function SignOffReportModal({
  open,
  onOpenChange,
  report,
  onSuccess,
}: SignOffReportModalProps) {
  const { toast } = useToast();
  const [reviewNote, setReviewNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!report) return null;

  const handleSignOff = () => {
    setSubmitting(true);
    setTimeout(() => {
      const timestamp = new Date().toISOString();
      const randomHash = Math.random().toString(36).substring(2, 8).toUpperCase();
      const initials = report.attendingDoctorName
        .split(" ")
        .map((n) => n[0])
        .join("");
      const auditStamp = `AUTH-SIG-${initials}-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${randomHash}`;

      const updatedReport: CareCoordinationReportReviewItem = {
        ...report,
        status: "reviewed",
        signedOffAt: timestamp,
        signedOffBy: report.attendingDoctorName,
        signedOffDoctorRegNo: "MCI-" + Math.floor(10000 + Math.random() * 90000) + "-MH",
        signOffNote: reviewNote || "Diagnostic report clinically reviewed. Findings verified and incorporated into longitudinal care plan.",
        auditStamp,
        waitingDuration: "0m",
        waitingDurationMinutes: 0,
        isOverdue: false,
      };

      onSuccess(updatedReport);
      setSubmitting(false);
      onOpenChange(false);
      setReviewNote("");

      toast({
        title: "Report Clinically Signed Off",
        description: `${report.testOrStudyName} for ${report.patientName} signed off by ${report.attendingDoctorName}. Workflow guard unblocked.`,
      });
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
            <FileCheck2 className="h-5 w-5 text-primary" />
            Physician Digital Sign-Off &amp; Clinical Review
          </DialogTitle>
          <DialogDescription className="text-xs">
            Reviewing released {report.sourceModule === "lab" ? "Laboratory" : "Radiology"} diagnostic results for{" "}
            <span className="font-semibold text-foreground">{report.patientName}</span> ({report.patientUhid}).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Report Summary Card */}
          <div className="rounded-lg border border-border/80 bg-muted/20 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-foreground">{report.testOrStudyName}</span>
              <Badge
                variant="outline"
                className={
                  report.isCritical
                    ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px] font-bold"
                    : "bg-primary/10 text-primary border-primary/20 text-[10px]"
                }
              >
                {report.isCritical ? "CRITICAL VALUE" : "ROUTINE DIAGNOSTIC"}
              </Badge>
            </div>
            <div className="text-[11px] text-muted-foreground grid grid-cols-2 gap-2">
              <div>
                <span className="text-foreground/70">Category:</span> {report.modalityOrCategory}
              </div>
              <div>
                <span className="text-foreground/70">Source:</span>{" "}
                {report.sourceModule === "lab" ? "Central Laboratory" : "Imaging Suite"} ({report.orderId})
              </div>
            </div>
            {report.criticalDetails && (
              <div className="p-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-[11px]">
                <span className="font-bold">Panic Finding:</span> {report.criticalDetails}
              </div>
            )}
            <div className="pt-1 border-t border-border/60">
              <span className="font-semibold text-foreground">Diagnostic Impression:</span>
              <p className="text-[11px] text-foreground/90 mt-0.5">{report.impression}</p>
            </div>
          </div>

          {/* Clinician Attribution Lock (Rule F22-CANNOT-1) */}
          <div className="rounded-lg border border-border bg-card p-3 space-y-1.5 shadow-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground flex items-center gap-1 font-medium">
                <Stethoscope className="h-3.5 w-3.5 text-primary" /> Attending Physician Attribution:
              </span>
              <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30 bg-emerald-500/5">
                <ShieldCheck className="h-3 w-3 mr-1" /> Verified Clinician
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-foreground">{report.attendingDoctorName}</p>
                <p className="text-[11px] text-muted-foreground">{report.doctorSpecialty} • {report.department}</p>
              </div>
              <Lock className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <p className="text-[10px] text-muted-foreground pt-1 border-t border-border/60">
              Rule F22-CANNOT-1: Sign-off is strictly bound to the ordering physician. Digital signature stamp will be permanently locked into the audit log.
            </p>
          </div>

          {/* Clinical Review & Action Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="signoff-note" className="text-xs font-semibold">
              Clinical Review Notes &amp; Disposition Plan (Optional)
            </Label>
            <Textarea
              id="signoff-note"
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="e.g., Findings verified. Prescribed supportive medication. Cleared for scheduled surgery / discharge."
              className="text-xs min-h-[75px]"
            />
          </div>

          {/* Downstream Gating Notice */}
          <div className="flex items-center gap-2 p-2.5 rounded bg-primary/5 border border-primary/20 text-[11px] text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <span>
              Signing off will unblock downstream <strong className="text-foreground">OT surgery scheduling</strong> and <strong className="text-foreground">IPD discharge gates</strong> in <code className="text-primary font-mono text-[10px]">workflow-sequencing-guard.ts</code>.
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            className="font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
            onClick={handleSignOff}
            disabled={submitting}
          >
            <FileCheck2 className="h-4 w-4" />
            {submitting ? "Signing..." : "Confirm & Digitally Sign Off"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
