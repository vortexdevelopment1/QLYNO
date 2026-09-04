"use client";

import React, { useState } from "react";
import { CheckCircle2, ShieldCheck, Wrench, IndianRupee, Clock, PackageCheck } from "lucide-react";
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
import { RepairTicket, BiomedicalAsset, AssetHistoryEvent } from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";

interface ResolveRepairModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: RepairTicket | null;
  asset: BiomedicalAsset | null;
  onResolveTicket: (resolvedTicket: RepairTicket, updatedAsset: BiomedicalAsset, historyEvent: AssetHistoryEvent) => void;
}

export function ResolveRepairModal({
  open,
  onOpenChange,
  ticket,
  asset,
  onResolveTicket,
}: ResolveRepairModalProps) {
  const { toast } = useToast();

  const [resolutionNotes, setResolutionNotes] = useState("");
  const [partsUsed, setPartsUsed] = useState("OEM Replacement Component (Certified)");
  const [actualCost, setActualCost] = useState<number>(ticket?.repairCost || 25000);
  const [resolvedBy, setResolvedBy] = useState("Amitabh Sen (Biomedical Lead Engineer)");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !asset) return;

    if (!resolutionNotes.trim()) {
      toast({
        title: "Resolution Notes Required",
        description: "Rule F20-CANNOT-4: A repair ticket cannot be resolved without explicit resolution and testing notes.",
        variant: "destructive",
      });
      return;
    }

    const now = new Date().toISOString();

    const resolvedTicket: RepairTicket = {
      ...ticket,
      status: "Resolved",
      resolutionNotes: resolutionNotes.trim(),
      partsUsed: partsUsed.trim() || undefined,
      repairCost: actualCost,
      downtimeEnd: now,
      resolvedBy,
      resolvedAt: now,
    };

    const updatedAsset: BiomedicalAsset = {
      ...asset,
      maintenanceStatus: "Operational",
      lastCalibrationDate: now.split("T")[0],
    };

    const historyEvent: AssetHistoryEvent = {
      id: `evt_${Date.now()}`,
      assetId: asset.id,
      assetCode: asset.assetCode,
      assetName: asset.name,
      eventType: "Repair Completed",
      timestamp: now,
      actor: resolvedBy,
      title: `Repair Completed & Certified (${ticket.ticketNo})`,
      details: `Resolution: ${resolutionNotes.trim()}. Parts: ${partsUsed}. Cost: ₹${actualCost.toLocaleString("en-IN")}. Downtime ended. Device restored to Operational status.`,
      referenceId: ticket.ticketNo,
    };

    onResolveTicket(resolvedTicket, updatedAsset, historyEvent);
    toast({
      title: "Repair Certified Operational",
      description: `${ticket.ticketNo} resolved. ${asset.assetCode} returned to active operational service. (${resolvedBy})`,
    });
    setResolutionNotes("");
    onOpenChange(false);
  };

  if (!ticket || !asset) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Certify Repair &amp; Restore Machine
            </DialogTitle>
            <DialogDescription className="text-xs">
              Record corrective technical actions, parts replaced, and return <strong>{asset.name}</strong> to operational readiness.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3 text-xs">
            {/* Ticket & Asset Summary */}
            <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ticket No &amp; Priority:</span>
                <span className="font-mono font-bold text-primary">{ticket.ticketNo} [{ticket.priority}]</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Equipment:</span>
                <span className="font-semibold text-foreground">{asset.assetCode} — {asset.name}</span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-muted-foreground shrink-0">Reported Fault:</span>
                <span className="text-right text-muted-foreground line-clamp-2">{ticket.faultDescription}</span>
              </div>
            </div>

            {/* Resolution Notes (Mandatory) */}
            <div className="grid gap-1">
              <Label htmlFor="res-notes" className="text-foreground font-semibold">
                Technical Resolution &amp; Test Verification Notes *
              </Label>
              <Textarea
                id="res-notes"
                required
                placeholder="Describe corrective mechanical/electronic actions, calibration check runs, and safety verification..."
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="text-xs"
              />
            </div>

            {/* Parts Used */}
            <div className="grid gap-1">
              <Label htmlFor="res-parts">Parts &amp; Components Replaced</Label>
              <Input
                id="res-parts"
                placeholder="e.g. Stepper motor assembly, sensor harness..."
                value={partsUsed}
                onChange={(e) => setPartsUsed(e.target.value)}
                className="text-xs"
              />
            </div>

            {/* Cost & Resolving Engineer */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1">
                <Label htmlFor="res-cost">Final Repair / Invoiced Cost (₹)</Label>
                <Input
                  id="res-cost"
                  type="number"
                  required
                  value={actualCost}
                  onChange={(e) => setActualCost(Number(e.target.value))}
                  className="text-xs font-mono"
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="res-by">Certifying Engineer / Lead *</Label>
                <Input
                  id="res-by"
                  required
                  value={resolvedBy}
                  onChange={(e) => setResolvedBy(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Resolve Ticket &amp; Restore Asset
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
