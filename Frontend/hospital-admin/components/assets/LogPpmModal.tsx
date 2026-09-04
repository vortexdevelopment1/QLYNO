"use client";

import React, { useState } from "react";
import { Wrench, Calendar, ShieldCheck, User, CheckCircle2 } from "lucide-react";
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

interface LogPpmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: BiomedicalAsset | null;
  onConfirmPpm: (updatedAsset: BiomedicalAsset, historyEvent: AssetHistoryEvent) => void;
}

export function LogPpmModal({
  open,
  onOpenChange,
  asset,
  onConfirmPpm,
}: LogPpmModalProps) {
  const { toast } = useToast();

  const [technicianName, setTechnicianName] = useState("Kavita Rao (Lead Biomedical Engineer)");
  const [nextPpmDate, setNextPpmDate] = useState("2026-11-25");
  const [calibrationNotes, setCalibrationNotes] = useState(
    "All flow/voltage sensor calibrations verified against OEM test standards. Safety interlocks passed."
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset) return;

    if (!technicianName.trim()) {
      toast({
        title: "Technician Required",
        description: "Rule F20-CANNOT-2: PPM calibration cannot be signed off without a certifying technician name.",
        variant: "destructive",
      });
      return;
    }

    if (!nextPpmDate) {
      toast({
        title: "Next PPM Date Required",
        description: "Rule F20-CANNOT-2: Next scheduled PPM date must be configured.",
        variant: "destructive",
      });
      return;
    }

    const now = new Date().toISOString();
    const today = now.split("T")[0];
    const ppmRef = `PPM-2026-${Date.now().toString().slice(-4)}`;

    const updatedAsset: BiomedicalAsset = {
      ...asset,
      maintenanceStatus: "Operational",
      lastCalibrationDate: today,
      nextPPMDate: nextPpmDate,
    };

    const historyEvent: AssetHistoryEvent = {
      id: `evt_${Date.now()}`,
      assetId: asset.id,
      assetCode: asset.assetCode,
      assetName: asset.name,
      eventType: "PPM Certified",
      timestamp: now,
      actor: technicianName,
      title: `PPM & Calibration Certified (${ppmRef})`,
      details: `Calibration testing signed off. Notes: ${calibrationNotes}. Next PPM scheduled for ${nextPpmDate}. Machine status set to Operational.`,
      referenceId: ppmRef,
    };

    onConfirmPpm(updatedAsset, historyEvent);
    toast({
      title: "Calibration & PPM Certified",
      description: `${asset.assetCode} certified operational by ${technicianName}. Next PPM: ${nextPpmDate}.`,
    });
    onOpenChange(false);
  };

  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" /> Log Preventive Maintenance (PPM)
            </DialogTitle>
            <DialogDescription className="text-xs">
              Certify calibration testing and preventive servicing for <strong>{asset.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3 text-xs">
            <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Asset Code &amp; Serial:</span>
                <span className="font-mono font-semibold text-foreground">
                  {asset.assetCode} ({asset.serialNo})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Department &amp; Location:</span>
                <span className="font-medium text-foreground">{asset.department} ({asset.floor})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Vendor AMC Contract:</span>
                <span className="text-foreground">{asset.vendorName} ({asset.amcCmcContract})</span>
              </div>
            </div>

            <div className="grid gap-1">
              <Label htmlFor="ppm-tech">Certified Biomedical Engineer / Technician *</Label>
              <Input
                id="ppm-tech"
                required
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="grid gap-1">
              <Label htmlFor="ppm-next">Next Scheduled PPM / Calibration Date *</Label>
              <Input
                id="ppm-next"
                type="date"
                required
                value={nextPpmDate}
                onChange={(e) => setNextPpmDate(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="grid gap-1">
              <Label htmlFor="ppm-notes">Calibration Checklist &amp; Testing Notes</Label>
              <Textarea
                id="ppm-notes"
                rows={2}
                value={calibrationNotes}
                onChange={(e) => setCalibrationNotes(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Sign-Off &amp; Certify PPM
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
