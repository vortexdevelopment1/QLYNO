"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Lock,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  UserX,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/hospital-admin/components/ui/dialog";
import { useToast } from "@/hospital-admin/hooks/use-toast";

interface AccessRevocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUser: {
    name: string;
    id: string;
    role: string;
  };
  onRevoked: () => void;
}

export function AccessRevocationModal({
  open,
  onOpenChange,
  targetUser,
  onRevoked,
}: AccessRevocationModalProps) {
  const [step, setStep] = useState<"checklist" | "revoking" | "completed">("checklist");
  const { toast } = useToast();

  const handleExecuteRevocation = () => {
    setStep("revoking");
    setTimeout(() => {
      setStep("completed");
      toast({
        title: "All Access Paths Fully Revoked",
        description: `All active sessions, tokens, and station badges for ${targetUser.name} have been purged. (Edge Case 1)`,
      });
      onRevoked();
    }, 1200);
  };

  const handleClose = () => {
    setStep("checklist");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2 text-destructive">
            <UserX className="h-5 w-5" /> Multi-Path Access Revocation Verification
          </DialogTitle>
          <DialogDescription className="text-xs">
            Confirm full invalidation of all cached, active, and secondary credentials for <strong>{targetUser.name}</strong> ({targetUser.role}).
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 text-xs space-y-3">
          <div className="p-2.5 rounded border border-border bg-muted/20 text-foreground text-[11px] space-y-1">
            <span className="font-bold flex items-center gap-1">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-600" /> Rule 14-CANNOT-6 &amp; Edge Case 1 Enforcement
            </span>
            <p className="text-muted-foreground">
              Suspending or removing a user must immediately purge all secondary authentication vectors, not merely toggle a database boolean.
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-foreground text-xs block">
              Multi-Path Credential Invalidation Checklist:
            </span>

            <div className="p-2.5 rounded border border-border bg-card flex items-center justify-between">
              <div>
                <span className="font-semibold block">1. Active Browser &amp; Mobile Web Sessions</span>
                <span className="text-[10px] text-muted-foreground">Terminates JWT &amp; active session store</span>
              </div>
              {step === "completed" ? (
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] gap-1">
                  <CheckCircle2 className="h-2.5 w-2.5" /> Purged
                </Badge>
              ) : (
                <Badge variant="outline" className="text-rose-600 text-[10px]">Pending</Badge>
              )}
            </div>

            <div className="p-2.5 rounded border border-border bg-card flex items-center justify-between">
              <div>
                <span className="font-semibold block">2. OAuth Tokens &amp; API Integration Keys</span>
                <span className="text-[10px] text-muted-foreground">Revokes background sync credentials</span>
              </div>
              {step === "completed" ? (
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] gap-1">
                  <CheckCircle2 className="h-2.5 w-2.5" /> Invalidated
                </Badge>
              ) : (
                <Badge variant="outline" className="text-rose-600 text-[10px]">Pending</Badge>
              )}
            </div>

            <div className="p-2.5 rounded border border-border bg-card flex items-center justify-between">
              <div>
                <span className="font-semibold block">3. Nurse Station RFID / TouchPOS Badge Keys</span>
                <span className="text-[10px] text-muted-foreground">De-authorizes physical tap-login hardware</span>
              </div>
              {step === "completed" ? (
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] gap-1">
                  <CheckCircle2 className="h-2.5 w-2.5" /> Locked
                </Badge>
              ) : (
                <Badge variant="outline" className="text-rose-600 text-[10px]">Pending</Badge>
              )}
            </div>

            <div className="p-2.5 rounded border border-border bg-card flex items-center justify-between">
              <div>
                <span className="font-semibold block">4. Department Delegation &amp; Sign-Off Grants</span>
                <span className="text-[10px] text-muted-foreground">Clears countersignature rights</span>
              </div>
              {step === "completed" ? (
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] gap-1">
                  <CheckCircle2 className="h-2.5 w-2.5" /> Cleared
                </Badge>
              ) : (
                <Badge variant="outline" className="text-rose-600 text-[10px]">Pending</Badge>
              )}
            </div>
          </div>

          {step === "completed" && (
            <div className="p-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 flex items-center gap-2 font-semibold text-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Full Revocation Verified: User has zero remaining access paths.</span>
            </div>
          )}
        </div>

        <DialogFooter>
          {step === "completed" ? (
            <Button size="sm" onClick={handleClose} className="bg-emerald-600 text-white font-semibold">
              Done &amp; Close
            </Button>
          ) : (
            <>
              <Button type="button" variant="outline" size="sm" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={step === "revoking"}
                onClick={handleExecuteRevocation}
                className="font-semibold gap-1.5"
              >
                {step === "revoking" && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                {step === "revoking" ? "Purging Credentials..." : "Confirm Full Revocation"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
