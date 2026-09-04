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
import { Badge } from "@/hospital-admin/components/ui/badge";
import { CheckCircle2, PhoneCall, ShieldCheck } from "lucide-react";
import { GrievanceCase } from "@/hospital-admin/lib/types/patient-reviews";

interface ResolveGrievanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  grievance: GrievanceCase | null;
  onResolve: (payload: {
    caseId: string;
    resolutionNotes: string;
    resolvedBy: string;
    patientCallbackConfirmed: boolean;
  }) => void;
}

export function ResolveGrievanceModal({
  isOpen,
  onClose,
  grievance,
  onResolve,
}: ResolveGrievanceModalProps) {
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolvedBy, setResolvedBy] = useState("Hospital Operations Lead");
  const [callbackConfirmed, setCallbackConfirmed] = useState(true);

  if (!grievance) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) return;

    onResolve({
      caseId: grievance.id,
      resolutionNotes,
      resolvedBy,
      patientCallbackConfirmed: callbackConfirmed,
    });
    setResolutionNotes("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <DialogTitle className="text-base font-bold">
              Resolve Patient Grievance ({grievance.id})
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Document root-cause corrective action (CAPA) and record patient callback confirmation to close this case.
          </DialogDescription>
        </DialogHeader>

        {/* Case summary */}
        <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs space-y-1.5">
          <div className="flex items-center justify-between font-semibold">
            <span>{grievance.patientName} ({grievance.patientId})</span>
            <Badge variant="outline" className="text-[10px]">
              {grievance.category} • {grievance.severity}
            </Badge>
          </div>
          <p className="text-muted-foreground text-[11px]">{grievance.description}</p>
          <div className="text-[10px] text-muted-foreground pt-1 border-t border-border/50 flex justify-between">
            <span>Assigned: {grievance.assignedTo}</span>
            <span>Created: {grievance.createdAt}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Resolution & CAPA notes */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-foreground">
              Corrective & Preventive Actions (CAPA) Taken <span className="text-rose-500">*</span>
            </label>
            <Textarea
              required
              rows={4}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Detail the investigation findings, staff counseling, process changes, or patient settlement actions..."
              className="text-xs resize-none"
            />
          </div>

          {/* Callback Confirmation Checkbox */}
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="callback-check"
              checked={callbackConfirmed}
              onChange={(e) => setCallbackConfirmed(e.target.checked)}
              className="mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="callback-check" className="text-xs leading-snug cursor-pointer">
              <span className="font-semibold text-foreground block">
                Patient Direct Callback Verified
              </span>
              <span className="text-muted-foreground text-[11px]">
                Confirm that the patient ({grievance.patientPhone}) was telephonically contacted and the resolution was explained.
              </span>
            </label>
          </div>

          {/* Resolved By */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-foreground">
              Resolving Authority / Staff Sign-Off
            </label>
            <Input
              value={resolvedBy}
              onChange={(e) => setResolvedBy(e.target.value)}
              className="h-8 text-xs font-medium"
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" size="sm" variant="outline" onClick={onClose} className="h-8 text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!resolutionNotes.trim()}
              className="h-8 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Sign-Off & Close Case
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
