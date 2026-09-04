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
import { ShieldAlert, Phone, User } from "lucide-react";
import {
  GrievanceCase,
  GrievanceCategory,
  GrievanceSeverity,
  GrievanceEscalationTier,
} from "@/hospital-admin/lib/types/patient-reviews";

interface CreateGrievanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (grievance: GrievanceCase) => void;
}

export function CreateGrievanceModal({
  isOpen,
  onClose,
  onCreate,
}: CreateGrievanceModalProps) {
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [patientPhone, setPatientPhone] = useState("+91 ");
  const [category, setCategory] = useState<GrievanceCategory>("OPD");
  const [severity, setSeverity] = useState<GrievanceSeverity>("Medium");
  const [escalationTier, setEscalationTier] =
    useState<GrievanceEscalationTier>("Tier 1 - Ward Incharge");
  const [assignedTo, setAssignedTo] = useState("Floor Supervisor");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !description.trim()) return;

    const caseId = `GRV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newGrievance: GrievanceCase = {
      id: caseId,
      patientId: patientId || `UHID-WALK-${Date.now().toString().slice(-4)}`,
      patientName,
      patientPhone,
      category,
      description,
      severity,
      escalationTier,
      assignedTo,
      status: "Open",
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      slaDeadline: new Date(Date.now() + 48 * 3600 * 1000)
        .toISOString()
        .replace("T", " ")
        .substring(0, 16),
      isOverdue: false,
      patientCallbackConfirmed: false,
    };

    onCreate(newGrievance);
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
              Log Patient Grievance / Complaint
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Directly register an in-person, phone call, or written grievance into the hospital quality and escalation queue.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">
                Patient Full Name <span className="text-rose-500">*</span>
              </label>
              <Input
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Ramesh Chandra"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">
                Patient UHID (Optional)
              </label>
              <Input
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="e.g. UHID-2026-1049"
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">
                Contact Phone <span className="text-rose-500">*</span>
              </label>
              <Input
                required
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">
                Grievance Category
              </label>
              <Select value={category} onValueChange={(val) => setCategory(val as GrievanceCategory)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPD">OPD Consultation & Token Queue</SelectItem>
                  <SelectItem value="Billing">Billing & Insurance Queries</SelectItem>
                  <SelectItem value="Nursing">Nursing Attentiveness</SelectItem>
                  <SelectItem value="Clinical Care">Clinical & Doctor Interaction</SelectItem>
                  <SelectItem value="Infrastructure">Room Hygiene & Food Quality</SelectItem>
                  <SelectItem value="Other">Other Operational Grievance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">
                Severity Level
              </label>
              <Select value={severity} onValueChange={(val) => setSeverity(val as GrievanceSeverity)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Critical">Critical (6h SLA)</SelectItem>
                  <SelectItem value="High">High (24h SLA)</SelectItem>
                  <SelectItem value="Medium">Medium (48h SLA)</SelectItem>
                  <SelectItem value="Low">Low (72h SLA)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">
                Escalation Tier
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
                  <SelectItem value="Tier 3 - Grievance Committee">Tier 3 - Grievance Committee</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-foreground">
              Assigned Lead / Supervisor
            </label>
            <Input
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-foreground">
              Grievance Description <span className="text-rose-500">*</span>
            </label>
            <Textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs resize-none"
              placeholder="State the exact patient grievance and circumstances..."
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
              File Grievance
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
