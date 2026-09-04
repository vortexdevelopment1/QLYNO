"use client";

import React, { useState } from "react";
import {
  Send,
  Smartphone,
  Phone,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Users,
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
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { CareCoordinationReportReviewItem, PatientNotificationChannel, PatientNotificationRecord } from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";

interface RecordPatientNotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: CareCoordinationReportReviewItem | null;
  onSuccess: (notification: PatientNotificationRecord, updatedReport: CareCoordinationReportReviewItem) => void;
}

export function RecordPatientNotificationModal({
  open,
  onOpenChange,
  report,
  onSuccess,
}: RecordPatientNotificationModalProps) {
  const { toast } = useToast();
  const [channel, setChannel] = useState<PatientNotificationChannel>("whatsapp");
  const [notifiedBy, setNotifiedBy] = useState("Sister Mary Varghese");
  const [notifiedByRole, setNotifiedByRole] = useState("Care Coordinator / OPD Nurse");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!report) return null;

  const handleRecord = () => {
    if (!notifiedBy.trim()) {
      toast({
        title: "Staff Attribution Required",
        description: "Please specify the care coordinator or nurse who informed the patient (Rule F22-CANNOT-4).",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const notifId = `NOTIF-REC-${Math.floor(100 + Math.random() * 900)}`;
      const timestamp = new Date().toISOString();

      const newRecord: PatientNotificationRecord = {
        id: notifId,
        reviewItemId: report.id,
        reportId: report.reportId,
        patientId: report.patientId,
        patientName: report.patientName,
        patientPhone: report.patientPhone,
        testName: report.testOrStudyName,
        channel,
        notifiedBy,
        notifiedByRole,
        notifiedAt: timestamp,
        notes: notes || `Patient briefed regarding ${report.testOrStudyName} results via ${channel.toUpperCase()}.`,
        deliveryStatus: "Delivered",
      };

      const updatedReport: CareCoordinationReportReviewItem = {
        ...report,
        isPatientNotified: true,
        patientNotificationId: notifId,
      };

      onSuccess(newRecord, updatedReport);
      setSubmitting(false);
      onOpenChange(false);
      setNotes("");

      toast({
        title: "Patient Notification Recorded",
        description: `${report.patientName} successfully recorded as notified via ${channel.toUpperCase()}.`,
      });
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
            <Send className="h-5 w-5 text-cyan-600" />
            Record Patient Diagnostic Notification
          </DialogTitle>
          <DialogDescription className="text-xs">
            Log patient communication for <span className="font-semibold text-foreground">{report.patientName}</span> ({report.patientUhid}).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Report Summary */}
          <div className="rounded-lg border border-border/80 bg-muted/20 p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">{report.testOrStudyName}</span>
              <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30 bg-emerald-500/5">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Doctor Reviewed
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Patient Contact: <span className="font-mono text-foreground">{report.patientPhone}</span> • Signed off by{" "}
              <span className="font-semibold text-foreground">{report.signedOffBy || report.attendingDoctorName}</span>
            </p>
          </div>

          {/* Delivery Channel (Rule F22-CANNOT-4) */}
          <div className="space-y-1.5">
            <Label htmlFor="notif-channel" className="text-xs font-semibold">
              Communication Channel (Rule F22-CANNOT-4)
            </Label>
            <Select value={channel} onValueChange={(val: any) => setChannel(val)}>
              <SelectTrigger id="notif-channel" className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">WhatsApp Diagnostic PDF &amp; Summary</SelectItem>
                <SelectItem value="sms">SMS Text Alert with Patient Portal Link</SelectItem>
                <SelectItem value="phone_call">Direct Telephonic Briefing</SelectItem>
                <SelectItem value="portal">Qlyno Patient Health Portal / Mobile App</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notified By Attribution */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="notif-staff" className="text-xs font-semibold">
                Informed By (Staff Name)
              </Label>
              <Input
                id="notif-staff"
                value={notifiedBy}
                onChange={(e) => setNotifiedBy(e.target.value)}
                className="text-xs h-8"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notif-role" className="text-xs font-semibold">
                Staff Role / Station
              </Label>
              <Input
                id="notif-role"
                value={notifiedByRole}
                onChange={(e) => setNotifiedByRole(e.target.value)}
                className="text-xs h-8"
              />
            </div>
          </div>

          {/* Communication Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notif-notes" className="text-xs font-semibold">
              Briefing / Counseling Notes (Optional)
            </Label>
            <Textarea
              id="notif-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Patient informed of normal CBC results. Fasting instructions reiterated for ultrasound."
              className="text-xs min-h-[75px]"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            className="font-semibold bg-cyan-600 hover:bg-cyan-700 text-white gap-1.5"
            onClick={handleRecord}
            disabled={submitting}
          >
            <Send className="h-3.5 w-3.5" />
            {submitting ? "Saving Record..." : "Log Patient Notification"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
