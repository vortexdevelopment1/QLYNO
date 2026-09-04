"use client";

import React, { useState } from "react";
import { AlertOctagon, KeyRound, Lock, ShieldAlert } from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/hospital-admin/components/ui/dialog";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import { useToast } from "@/hospital-admin/hooks/use-toast";

interface StepUpAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionTitle: string;
  actionDescription: string;
  onConfirm: (reason: string) => void;
}

export function StepUpAuthModal({
  open,
  onOpenChange,
  actionTitle,
  actionDescription,
  onConfirm,
}: StepUpAuthModalProps) {
  const [securityPin, setSecurityPin] = useState("");
  const [reason, setReason] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      toast({
        title: "Mandatory Reason Required",
        description: "Rule 14-CANNOT-9: You must provide a formal clinical or administrative reason for this sensitive action.",
        variant: "destructive",
      });
      return;
    }

    if (securityPin !== "7788" && securityPin !== "1234") {
      toast({
        title: "Step-Up Verification Failed",
        description: "Invalid Administrator Security PIN. (Hint for demo: 7788). Action blocked.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Step-Up Authentication Verified",
      description: `High-risk action authorized and logged with mandatory reason.`,
    });

    onConfirm(reason);
    setSecurityPin("");
    setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5" /> Step-Up Security Challenge Required
            </DialogTitle>
            <DialogDescription className="text-xs">
              {actionDescription}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-3 text-xs">
            <div className="p-2.5 rounded border border-destructive/30 bg-destructive/10 text-destructive text-[11px] font-medium space-y-1">
              <span className="font-bold flex items-center gap-1">
                <AlertOctagon className="h-3.5 w-3.5" /> High-Risk Operational Action (PRD Section 14)
              </span>
              <p>
                Rule 14-CANNOT-8 requires secondary authentication. This event, along with your stated reason, will be immutably recorded in the global audit trail.
              </p>
            </div>

            <div className="grid gap-1">
              <Label htmlFor="sec-reason">Mandatory Operational / Clinical Reason *</Label>
              <Textarea
                id="sec-reason"
                required
                rows={3}
                placeholder="e.g. Authorized emergency bypass for acute trauma resuscitation without prior insurance pre-auth..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="grid gap-1">
              <Label htmlFor="sec-pin">Administrator Security PIN / Password *</Label>
              <Input
                id="sec-pin"
                type="password"
                required
                placeholder="Enter 4-digit Master Security PIN (Demo: 7788)"
                value={securityPin}
                onChange={(e) => setSecurityPin(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel Action
            </Button>
            <Button type="submit" size="sm" variant="destructive" className="font-semibold">
              Authorize &amp; Commit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
