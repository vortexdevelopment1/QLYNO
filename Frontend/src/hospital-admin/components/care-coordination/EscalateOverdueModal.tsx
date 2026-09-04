"use client";

import React, { useState } from "react";
import {
  Clock,
  Flame,
  MessageSquare,
  Smartphone,
  ShieldAlert,
  Send,
  AlertTriangle,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { CareCoordinationReportReviewItem } from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";

interface EscalateOverdueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: CareCoordinationReportReviewItem | null;
  onSuccess?: () => void;
}

export function EscalateOverdueModal({
  open,
  onOpenChange,
  report,
  onSuccess,
}: EscalateOverdueModalProps) {
  const { toast } = useToast();
  const [escalationTarget, setEscalationTarget] = useState("doctor_and_hod");
  const [channel, setChannel] = useState("whatsapp_and_sms");
  const [submitting, setSubmitting] = useState(false);

  if (!report) return null;

  const handleEscalate = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onOpenChange(false);

      toast({
        title: "Urgent Escalation Dispatched",
        description: `SLA breach alert for ${report.testOrStudyName} (${report.patientName}) sent to ${report.attendingDoctorName} via WhatsApp/SMS.`,
      });

      if (onSuccess) onSuccess();
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
            <Clock className="h-5 w-5 text-amber-600" />
            Dispatch SLA Breach Escalation Alert
          </DialogTitle>
          <DialogDescription className="text-xs">
            Overdue review alert for <span className="font-semibold text-foreground">{report.patientName}</span> ({report.testOrStudyName}).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Overdue Status Card */}
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-900 dark:text-amber-200">{report.testOrStudyName}</span>
              <Badge variant="outline" className="bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-500/40 text-[10px] font-bold">
                Elapsed: {report.waitingDuration} (SLA: {report.slaDeadlineMinutes}m)
              </Badge>
            </div>
            <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90">
              Assigned Clinician: <span className="font-semibold">{report.attendingDoctorName}</span> ({report.doctorSpecialty})
            </p>
          </div>

          {/* Escalation Ladder Recipient */}
          <div className="space-y-1.5">
            <Label htmlFor="esc-target" className="text-xs font-semibold">
              Escalation Tier &amp; Recipients
            </Label>
            <Select value={escalationTarget} onValueChange={setEscalationTarget}>
              <SelectTrigger id="esc-target" className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="doctor_and_hod">
                  L2: Attending Doctor + Department HOD ({report.department})
                </SelectItem>
                <SelectItem value="hospital_admin">
                  L3: Medical Superintendent &amp; Hospital Admin Executive Command
                </SelectItem>
                <SelectItem value="direct_doctor_only">
                  L1: Direct High-Priority Clinician Recall Alert
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Broadcast Channels */}
          <div className="space-y-1.5">
            <Label htmlFor="esc-channel" className="text-xs font-semibold">
              Notification Delivery Mechanism (Rule F22-CANNOT-7)
            </Label>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger id="esc-channel" className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp_and_sms">Multi-Channel: WhatsApp Urgent Alert + SMS Fallback</SelectItem>
                <SelectItem value="whatsapp">WhatsApp Cloud API Instant Message</SelectItem>
                <SelectItem value="sms">High-Priority SMS Gateway Alert</SelectItem>
                <SelectItem value="in_app">In-App Hospital Command Center Banner</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rule F22-CANNOT-7 Note */}
          <div className="flex items-start gap-2 p-2.5 rounded bg-muted/30 border border-border text-[11px] text-muted-foreground">
            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Rule F22-CANNOT-7:</strong> Escalations route through the centralized{" "}
              <strong>Notification &amp; Escalation Center (/notifications)</strong> to maintain a single consolidated audit trail.
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
            onClick={handleEscalate}
            disabled={submitting}
          >
            <Send className="h-3.5 w-3.5" />
            {submitting ? "Dispatching..." : "Dispatch Escalation Alert"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
