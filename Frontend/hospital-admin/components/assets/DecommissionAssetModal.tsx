"use client";

import React, { useState } from "react";
import { AlertTriangle, Trash2, ShieldAlert, CheckCircle2, Ban } from "lucide-react";
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
import { BiomedicalAsset, AssetHistoryEvent } from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";

interface DecommissionAssetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: BiomedicalAsset | null;
  hasActiveLoan: boolean;
  hasOpenRepair: boolean;
  onConfirmDecommission: (decommissionedAsset: BiomedicalAsset, historyEvent: AssetHistoryEvent) => void;
}

export function DecommissionAssetModal({
  open,
  onOpenChange,
  asset,
  hasActiveLoan,
  hasOpenRepair,
  onConfirmDecommission,
}: DecommissionAssetModalProps) {
  const { toast } = useToast();

  const [decommissionReason, setDecommissionReason] = useState("");
  const [authorizedBy, setAuthorizedBy] = useState("Hospital Medical Superintendent & Executive Board");
  const [salvageValue, setSalvageValue] = useState<number>(0);

  const isBlocked = hasActiveLoan || hasOpenRepair;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset) return;

    if (hasActiveLoan) {
      toast({
        title: "Decommissioning Blocked",
        description: "Rule F20-CANNOT-10: Cannot decommission an asset that is currently on temporary loan.",
        variant: "destructive",
      });
      return;
    }

    if (hasOpenRepair) {
      toast({
        title: "Decommissioning Blocked",
        description: "Rule F20-CANNOT-10: Cannot decommission an asset with an active open repair ticket.",
        variant: "destructive",
      });
      return;
    }

    if (!decommissionReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Mandatory justification reason required to decommission a capital asset.",
        variant: "destructive",
      });
      return;
    }

    const now = new Date().toISOString();
    const today = now.split("T")[0];
    const refId = `DEC-2026-${Date.now().toString().slice(-4)}`;

    const updatedAsset: BiomedicalAsset = {
      ...asset,
      maintenanceStatus: "Decommissioned",
      decommissionedDate: today,
      decommissionReason: decommissionReason.trim(),
    };

    const historyEvent: AssetHistoryEvent = {
      id: `evt_${Date.now()}`,
      assetId: asset.id,
      assetCode: asset.assetCode,
      assetName: asset.name,
      eventType: "Decommissioned",
      timestamp: now,
      actor: authorizedBy,
      title: `Capital Asset Decommissioned (${refId})`,
      details: `Asset retired from clinical service. Reason: ${decommissionReason.trim()}. Salvage / scrap valuation: ₹${salvageValue.toLocaleString(
        "en-IN"
      )}. Authorized by ${authorizedBy}.`,
      referenceId: refId,
    };

    onConfirmDecommission(updatedAsset, historyEvent);
    toast({
      title: "Asset Decommissioned",
      description: `${asset.assetCode} has been retired from active inventory. Ref: ${refId}.`,
    });
    setDecommissionReason("");
    onOpenChange(false);
  };

  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-rose-600">
              <Trash2 className="h-5 w-5" /> Decommission &amp; Retire Capital Asset
            </DialogTitle>
            <DialogDescription className="text-xs">
              Permanently retire <strong>{asset.name} [{asset.assetCode}]</strong> from active clinical and operational service.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3 text-xs">
            {/* Active Guardrails Alert */}
            {isBlocked ? (
              <div className="p-3 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-900 dark:text-rose-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold">
                  <Ban className="h-4 w-4 text-rose-600" /> Action Blocked (Rule F20-CANNOT-10)
                </div>
                {hasActiveLoan && (
                  <p className="text-[11px]">
                    • This asset is currently on an active <strong>Temporary Loan</strong> to {asset.currentLoanDepartment || "another department"}. It must be checked back in before decommissioning.
                  </p>
                )}
                {hasOpenRepair && (
                  <p className="text-[11px]">
                    • This asset has an open <strong>Repair Ticket</strong> in progress. The repair must be resolved or cancelled first.
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[11px]">
                  <strong>Sensitive Action:</strong> Decommissioning removes this asset from active capacity, prevents scheduling, and stamps an irreversible lifecycle audit log.
                </div>
              </div>
            )}

            <div className="grid gap-1">
              <Label htmlFor="dec-reason">Mandatory Decommissioning Reason *</Label>
              <Textarea
                id="dec-reason"
                disabled={isBlocked}
                required
                placeholder="e.g. End of economic lifecycle, BER (Beyond Economic Repair), obsolete imaging technology..."
                rows={3}
                value={decommissionReason}
                onChange={(e) => setDecommissionReason(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1">
                <Label htmlFor="dec-salvage">Salvage / Scrap Value (₹)</Label>
                <Input
                  id="dec-salvage"
                  type="number"
                  disabled={isBlocked}
                  value={salvageValue}
                  onChange={(e) => setSalvageValue(Number(e.target.value))}
                  className="text-xs font-mono"
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="dec-auth">Authorized Signatory</Label>
                <Input
                  id="dec-auth"
                  disabled={isBlocked}
                  value={authorizedBy}
                  onChange={(e) => setAuthorizedBy(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isBlocked}
              size="sm"
              className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5"
            >
              <Trash2 className="h-4 w-4" /> Confirm Decommission
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
