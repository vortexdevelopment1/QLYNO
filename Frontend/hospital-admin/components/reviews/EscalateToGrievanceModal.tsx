"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/hospital-admin/components/ui/dialog";
import { Button } from "@/hospital-admin/components/ui/button";
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import { Input } from "@/hospital-admin/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/hospital-admin/components/ui/select";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { ShieldAlert, AlertTriangle, User, Phone, CheckCircle2 } from "lucide-react";
import {
  PatientReviewItem,
  GrievanceCategory,
  GrievanceSeverity,
  GrievanceEscalationTier,
} from "@/hospital-admin/lib/types/patient-reviews";

interface EscalateToGrievanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: PatientReviewItem | null;
  onEscalate: (payload: {
    reviewId: string;
    patientId?: string;
    patientName?: string;
    patientPhone?: string;
    category: GrievanceCategory;
    severity: GrievanceSeverity;
    escalationTier: GrievanceEscalationTier;
    assignedTo: string;
    description: string;
  }) => void;
}

export function EscalateToGrievanceModal({
  isOpen,
  onClose,
  review,
  onEscalate,
}: EscalateToGrievanceModalProps) {
  const [category, setCategory] = useState<GrievanceCategory>("Billing");
  const [severity, setSeverity] = useState<GrievanceSeverity>("High");
  const [escalationTier, setEscalationTier] =
    useState<GrievanceEscalationTier>("Tier 2 - Medical Superintendent");
  const [assignedTo, setAssignedTo] = useState("Dr. Farooq Abdullah (Med Supt)");
  const [patientPhone, setPatientPhone] = useState("+91 98450 12345");
  const [description, setDescription] = useState("");

  if (!review) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEscalate({
      reviewId: review.id,
      patientId: review.patientId || "UHID-EXT-REVIEW",
      patientName: review.patientName,
      patientPhone,
      category,
      severity,
      escalationTier,
      assignedTo,
      description: description || review.reviewText,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-rose-500/10 text-rose-600">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <DialogTitle className="text-base font-bold">
              Escalate to Patient Grievance Case
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Convert this serious patient review or complaint into a formal multi-tier resolution case with SLA tracking.
          </DialogDescription>
        </DialogHeader>

        {/* Source Review Box */}
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 text-xs space-y-1">
          <div className="flex items-center justify-between font-semibold text-rose-700 dark:text-rose-400">
            <span>Review by: {review.patientName} ({review.rating}★)</span>
            <span className="text-[10px] text-muted-foreground font-mono">{review.id}</span>
          </div>
          <p className="text-muted-foreground italic text-[11px]">&ldquo;{review.reviewText}&rdquo;</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">
                Grievance Category
              </label>
              <Select value={category} onValueChange={(val) => setCategory(val as GrievanceCategory)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPD">OPD Consultation</SelectItem>
                  <SelectItem value="Billing">Billing & Insurance</SelectItem>
                  <SelectItem value="Nursing">Inpatient Nursing Care</SelectItem>
                  <SelectItem value="Clinical Care">Clinical Care & Medical Staff</SelectItem>
                  <SelectItem value="Infrastructure">Infrastructure & Hygiene</SelectItem>
                  <SelectItem value="Other">Other Operational Concern</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Severity */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">
                Severity Level
              </label>
              <Select value={severity} onValueChange={(val) => setSeverity(val as GrievanceSeverity)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Critical">Critical (Immediate 6h SLA)</SelectItem>
                  <SelectItem value="High">High (24h SLA)</SelectItem>
                  <SelectItem value="Medium">Medium (48h SLA)</SelectItem>
                  <SelectItem value="Low">Low (72h SLA)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Escalation Tier */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">
                Escalation Tier (Module 16 Pattern)
              </label>
              <Select
                value={escalationTier}
                onValueChange={(val) => setEscalationTier(val as GrievanceEscalationTier)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tier 1 - Ward Incharge">Tier 1 - Ward Incharge</SelectItem>
                  <SelectItem value="Tier 2 - Medical Superintendent">Tier 2 - Medical Superintendent</SelectItem>
                  <SelectItem value="Tier 3 - Grievance Committee">Tier 3 - Grievance & Legal Board</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assignee */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">
                Assigned Supervisor / Lead
              </label>
              <Input
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* Contact phone */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
              <Phone className="h-3 w-3" />
              Patient Contact Phone (for Resolution Callback)
            </label>
            <Input
              value={patientPhone}
              onChange={(e) => setPatientPhone(e.target.value)}
              className="h-8 text-xs font-mono"
            />
          </div>

          {/* Description & Investigation Scope */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-foreground">
              Investigation Objective & Case Notes
            </label>
            <Textarea
              rows={3}
              defaultValue={review.reviewText}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs resize-none"
              placeholder="Outline specific investigation steps for this patient grievance..."
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" size="sm" variant="outline" onClick={onClose} className="h-8 text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-8 text-xs gap-1 bg-rose-600 hover:bg-rose-700 text-white"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              Create & Route Grievance
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
