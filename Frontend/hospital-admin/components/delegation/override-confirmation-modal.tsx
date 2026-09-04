"use client";

import React, { useState } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, ShieldAlert, ShieldCheck, Workflow } from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/hospital-admin/components/ui/dialog";
import { Label } from "@/hospital-admin/components/ui/label";
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import { DelegationActorBadge } from "@/hospital-admin/components/delegation/delegation-actor-badge";
import { useToast } from "@/hospital-admin/hooks/use-toast";

interface OverrideConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionTitle: string;
  workflowRole: string;
  targetSubject: string;
  onConfirm: (reason: string) => void;
}

export function OverrideConfirmationModal({
  open,
  onOpenChange,
  actionTitle,
  workflowRole,
  targetSubject,
  onConfirm,
}: OverrideConfirmationModalProps) {
  const [reason, setReason] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      toast({
        title: "Mandatory Reason Required",
        description: "Rule 15-CANNOT-7: Administrative overrides require an explicit operational justification.",
        variant: "destructive",
      });
      return;
    }

    onConfirm(reason);
    setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Workflow className="h-5 w-5 text-primary" /> Confirm Cross-Role Administrative Action
            </DialogTitle>
            <DialogDescription className="text-xs">
              You are performing an action within the <strong>{workflowRole}</strong> workflow on <strong>{targetSubject}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-3 text-xs">
            {/* Mandatory Attribution Preview */}
            <div className="p-2.5 rounded border border-primary/30 bg-primary/5 space-y-1">
              <span className="font-bold text-primary text-[11px] block">
                Mandatory Audit Trail Attribution (PRD Section 15):
              </span>
              <DelegationActorBadge workflowRole={workflowRole} variant="inline" />
              <p className="text-[10px] text-muted-foreground mt-1">
                This action will be attributed to Hospital Admin and logged into the central audit vault.
              </p>
            </div>

            {/* Clinical Boundary Guard Alert */}
            <div className="p-2.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-300 text-[11px] space-y-1">
              <span className="font-bold flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5" /> Clinical Decision Boundary
              </span>
              <p>
                Administrative capability is strictly operational. Altering licensed medical calls (diagnoses, prescriptions, surgical decisions) remains prohibited.
              </p>
            </div>

            {/* Mandatory Reason */}
            <div className="grid gap-1">
              <Label htmlFor="ov-reason">Mandatory Operational Justification *</Label>
              <Textarea
                id="ov-reason"
                required
                rows={3}
                placeholder="e.g. Front office staff on emergency leave during peak OPD surge..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold">
              Confirm &amp; Record Action
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
