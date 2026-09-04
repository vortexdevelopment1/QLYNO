"use client";

import React, { useState } from "react";
import { AlertCircle, Wrench, ShieldAlert, User, Building, Clock } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import { BiomedicalAsset, RepairTicket, RepairPriority, AssetHistoryEvent } from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";

interface CreateRepairTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: BiomedicalAsset | null;
  allAssets: BiomedicalAsset[];
  onSaveTicket: (ticket: RepairTicket, updatedAsset: BiomedicalAsset, historyEvent: AssetHistoryEvent) => void;
}

export function CreateRepairTicketModal({
  open,
  onOpenChange,
  asset: initialAsset,
  allAssets,
  onSaveTicket,
}: CreateRepairTicketModalProps) {
  const { toast } = useToast();

  const [selectedAssetId, setSelectedAssetId] = useState<string>(initialAsset?.id || allAssets[0]?.id || "");
  const [reportedBy, setReportedBy] = useState("Staff Nurse Priya Pillai (In-Charge)");
  const [faultDescription, setFaultDescription] = useState("");
  const [priority, setPriority] = useState<RepairPriority>("High");
  const [assignedTechnicianOrVendor, setAssignedTechnicianOrVendor] = useState("Sunil Verma (Senior Biomedical Engineer)");
  const [estimatedRepairCost, setEstimatedRepairCost] = useState<number>(15000);

  const currentAsset = allAssets.find((a) => a.id === selectedAssetId) || initialAsset || allAssets[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAsset) return;

    if (!faultDescription.trim()) {
      toast({
        title: "Fault Description Required",
        description: "Rule F20-CANNOT-3: A repair ticket cannot be created without an explicit fault description.",
        variant: "destructive",
      });
      return;
    }

    const ticketNo = `REP-2026-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();

    const newTicket: RepairTicket = {
      id: `rep_${Date.now()}`,
      ticketNo,
      assetId: currentAsset.id,
      assetCode: currentAsset.assetCode,
      assetName: currentAsset.name,
      department: currentAsset.department,
      reportedBy,
      reportedAt: now,
      faultDescription: faultDescription.trim(),
      priority,
      assignedTechnicianOrVendor,
      repairCost: estimatedRepairCost,
      downtimeStart: now,
      status: "Reported",
      requiresStepUpAuth: estimatedRepairCost > 50000,
    };

    const updatedAsset: BiomedicalAsset = {
      ...currentAsset,
      maintenanceStatus: "Under Maintenance",
    };

    const historyEvent: AssetHistoryEvent = {
      id: `evt_${Date.now()}`,
      assetId: currentAsset.id,
      assetCode: currentAsset.assetCode,
      assetName: currentAsset.name,
      eventType: "Breakdown Reported",
      timestamp: now,
      actor: reportedBy,
      title: `Breakdown Ticket Raised (${ticketNo}) [${priority} Priority]`,
      details: `Fault: ${faultDescription.trim()}. Assigned to: ${assignedTechnicianOrVendor}. Device status changed to Under Maintenance.`,
      referenceId: ticketNo,
    };

    onSaveTicket(newTicket, updatedAsset, historyEvent);
    toast({
      title: "Repair Ticket Registered",
      description: `${ticketNo} created for ${currentAsset.assetCode}. Asset marked Under Maintenance. (${reportedBy})`,
    });
    setFaultDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Wrench className="h-5 w-5 text-rose-600" /> Log Unplanned Breakdown &amp; Repair
            </DialogTitle>
            <DialogDescription className="text-xs">
              Open a corrective maintenance ticket, assign an engineer or OEM vendor, and track machine downtime.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3 text-xs">
            {/* Asset Selection */}
            <div className="grid gap-1">
              <Label htmlFor="rep-asset">Target Equipment / Machine *</Label>
              <Select
                value={selectedAssetId}
                onValueChange={(id) => setSelectedAssetId(id)}
              >
                <SelectTrigger id="rep-asset" className="text-xs">
                  <SelectValue placeholder="Select asset..." />
                </SelectTrigger>
                <SelectContent>
                  {allAssets.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      [{a.assetCode}] {a.name} — {a.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Current Asset Details Card */}
            {currentAsset && (
              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Category &amp; Serial:</span>
                  <span className="font-mono font-semibold text-foreground">{currentAsset.category} • {currentAsset.serialNo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Department &amp; Floor:</span>
                  <span className="font-medium text-foreground">{currentAsset.department} ({currentAsset.floor})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">OEM Vendor &amp; AMC:</span>
                  <span className="text-foreground">{currentAsset.vendorName} ({currentAsset.amcCmcContract})</span>
                </div>
              </div>
            )}

            {/* Fault Description (Mandatory) */}
            <div className="grid gap-1">
              <Label htmlFor="rep-fault" className="text-foreground font-semibold flex items-center gap-1">
                Fault Description &amp; Symptom *
              </Label>
              <Textarea
                id="rep-fault"
                required
                placeholder="Describe error codes, physical damage, abnormal vibration, or functional failure in detail..."
                rows={3}
                value={faultDescription}
                onChange={(e) => setFaultDescription(e.target.value)}
                className="text-xs"
              />
            </div>

            {/* Priority & Reporter */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1">
                <Label htmlFor="rep-priority">Priority &amp; Urgency *</Label>
                <Select
                  value={priority}
                  onValueChange={(val: RepairPriority) => setPriority(val)}
                >
                  <SelectTrigger id="rep-priority" className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Critical">Critical (Life Support / OT Down)</SelectItem>
                    <SelectItem value="High">High (Diagnostic Impairment)</SelectItem>
                    <SelectItem value="Medium">Medium (Minor Glitch)</SelectItem>
                    <SelectItem value="Low">Low (Cosmetic / Advisory)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="rep-reporter">Reported By (Staff) *</Label>
                <Input
                  id="rep-reporter"
                  required
                  value={reportedBy}
                  onChange={(e) => setReportedBy(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Assigned Engineer / OEM Vendor */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1">
                <Label htmlFor="rep-tech">Assigned Engineer / Vendor *</Label>
                <Input
                  id="rep-tech"
                  required
                  value={assignedTechnicianOrVendor}
                  onChange={(e) => setAssignedTechnicianOrVendor(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="rep-est-cost">Est. Repair / Spares Cost (₹)</Label>
                <Input
                  id="rep-est-cost"
                  type="number"
                  value={estimatedRepairCost}
                  onChange={(e) => setEstimatedRepairCost(Number(e.target.value))}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            {estimatedRepairCost > 50000 && (
              <div className="p-2.5 rounded-md border border-amber-500/30 bg-amber-500/10 flex items-center gap-2 text-amber-900 dark:text-amber-200">
                <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
                <span className="text-[11px]">
                  High-value repair (&gt; ₹50,000): Requires secondary administrator step-up sign-off before financial settlement.
                </span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5">
              <AlertCircle className="h-4 w-4" /> Create Ticket &amp; Flag Down
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
