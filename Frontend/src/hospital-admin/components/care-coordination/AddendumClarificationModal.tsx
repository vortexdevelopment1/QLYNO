"use client";

import React, { useState } from "react";
import {
  MessageSquareCode,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  FileQuestion,
  Layers,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { CareCoordinationReportReviewItem, ClarificationRequestType } from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";

interface AddendumClarificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: CareCoordinationReportReviewItem | null;
  onSuccess: (updatedReport: CareCoordinationReportReviewItem) => void;
}

export function AddendumClarificationModal({
  open,
  onOpenChange,
  report,
  onSuccess,
}: AddendumClarificationModalProps) {
  const { toast } = useToast();
  const [requestType, setRequestType] = useState<ClarificationRequestType>(
    report?.sourceModule === "radiology" ? "radiologist_addendum" : "re-test"
  );
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!report) return null;

  const handleSubmit = () => {
    if (!reason.trim()) {
      toast({
        title: "Clinical Justification Required",
        description: "Please specify the diagnostic reason for reopening this order.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const updatedReport: CareCoordinationReportReviewItem = {
        ...report,
        status: "clarification_requested",
        clarificationRequestId: `CLAR-${Math.floor(1000 + Math.random() * 9000)}`,
      };

      onSuccess(updatedReport);
      setSubmitting(false);
      onOpenChange(false);
      setReason("");

      toast({
        title: "Diagnostic Order Reopened",
        description: `Request for ${requestType.replace("_", " ")} dispatched to ${
          report.sourceModule === "lab" ? "Central Laboratory" : "Radiology Department"
        }.`,
      });
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
            <FileQuestion className="h-5 w-5 text-amber-600" />
            Request Diagnostic Addendum / Clarification
          </DialogTitle>
          <DialogDescription className="text-xs">
            Initiate a formal clarification request for {report.testOrStudyName} ({report.patientName}).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Target Diagnostic Target */}
          <div className="rounded-lg border border-border/80 bg-muted/20 p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">{report.testOrStudyName}</span>
              <Badge variant="outline" className="text-[10px] uppercase font-mono">
                {report.sourceModule.toUpperCase()} • {report.orderId}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Current Impression: <span className="text-foreground">{report.impression}</span>
            </p>
          </div>

          {/* Clarification Type (Rule F22-CAN-15) */}
          <div className="space-y-1.5">
            <Label htmlFor="clar-type" className="text-xs font-semibold">
              Clarification / Action Type (Rule F22-CAN-15)
            </Label>
            <Select value={requestType} onValueChange={(val: any) => setRequestType(val)}>
              <SelectTrigger id="clar-type" className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {report.sourceModule === "lab" ? (
                  <>
                    <SelectItem value="re-test">Re-Test / Repeat Sample Redraw</SelectItem>
                    <SelectItem value="stain_reevaluation">Stain / Slide Re-evaluation &amp; Second Review</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="radiologist_addendum">Radiologist Addendum / Additional Measurement</SelectItem>
                    <SelectItem value="re-test">Repeat Imaging Acquisition / Protocol Adjustment</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Clinical Reason */}
          <div className="space-y-1.5">
            <Label htmlFor="clar-reason" className="text-xs font-semibold">
              Clinical Justification &amp; Specific Areas to Address
            </Label>
            <Textarea
              id="clar-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Hemolysis detected; please redraw fresh sample or measure axial diameter of lesion in slice 24."
              className="text-xs min-h-[85px]"
            />
          </div>

          {/* Rule Note */}
          <div className="flex items-start gap-2 p-2.5 rounded bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-800 dark:text-amber-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              <strong>Rule F22-CANNOT-6:</strong> This request routes directly into the originating{" "}
              {report.sourceModule === "lab" ? "Lab Orders queue (/lab/[id])" : "Radiology Study queue (/radiology/orders/[id])"}. It will update the single source of truth diagnostic record.
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
            className="font-semibold bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
            onClick={handleSubmit}
            disabled={submitting}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {submitting ? "Dispatching..." : "Reopen Diagnostic Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
