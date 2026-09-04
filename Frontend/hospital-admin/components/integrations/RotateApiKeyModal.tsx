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
import { Input } from "@/hospital-admin/components/ui/input";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Key, ShieldAlert, Lock, CheckCircle2, RefreshCw } from "lucide-react";
import { ApiKeyRecord } from "@/hospital-admin/lib/types/integrations";

interface RotateApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: ApiKeyRecord | null;
  onRotate: (keyId: string, newMaskedKey: string) => void;
}

export function RotateApiKeyModal({
  isOpen,
  onClose,
  apiKey,
  onRotate,
}: RotateApiKeyModalProps) {
  const [adminPassword, setAdminPassword] = useState("");
  const [rotationReason, setRotationReason] = useState("Periodic 90-day statutory security key rotation");
  const [isRotating, setIsRotating] = useState(false);

  if (!apiKey) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword.trim()) return;

    setIsRotating(true);
    setTimeout(() => {
      const randHex = Math.random().toString(16).substring(2, 8);
      const newMasked = `qlyno_${apiKey.environment === "Production" ? "live" : "sbx"}_${randHex}...${Math.random().toString(16).substring(2, 6)}`;
      onRotate(apiKey.id, newMasked);
      setIsRotating(false);
      onClose();
    }, 600);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-rose-500/10 text-rose-600">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <DialogTitle className="text-base font-bold">
              Security Step-Up: Rotate API Key
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            High-sensitivity cryptographic action. Invalidates previous authorization tokens and updates live connection endpoints.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="rounded-lg bg-muted/50 p-3 border border-border/70 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Target Service:</span>
              <Badge variant="outline" className="text-[10px] font-semibold font-mono">
                {apiKey.id}
              </Badge>
            </div>
            <p className="font-semibold text-foreground text-xs">{apiKey.serviceName}</p>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Current Key:</span>
              <span className="font-mono text-foreground">{apiKey.keyMasked}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-foreground">
              Reason for Key Rotation
            </label>
            <Input
              required
              value={rotationReason}
              onChange={(e) => setRotationReason(e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
              <Lock className="h-3 w-3 text-rose-500" />
              <span>Admin Step-Up Security Password <span className="text-rose-500">*</span></span>
            </label>
            <Input
              required
              type="password"
              placeholder="Enter your administrative credentials..."
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="h-8 text-xs font-mono"
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" size="sm" variant="outline" onClick={onClose} className="h-8 text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isRotating}
              className="h-8 text-xs gap-1 bg-rose-600 hover:bg-rose-700 text-white"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRotating ? "animate-spin" : ""}`} />
              Confirm & Rotate Key
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
