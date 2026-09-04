"use client";

import React, { useState } from "react";
import { ArrowLeftRight, Building2, Calendar, MapPin, ShieldCheck, User } from "lucide-react";
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
import { BiomedicalAsset, AssetAllocationRecord, AssetHistoryEvent } from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";

const DEPARTMENTS_LIST = [
  { name: "Radiology & Imaging", floor: "Ground Floor - Radiology Block", defaultRoom: "Imaging Suite" },
  { name: "Intensive Care Unit (ICU)", floor: "3rd Floor - Critical Care Block", defaultRoom: "ICU Core Bay" },
  { name: "Emergency & Trauma", floor: "Ground Floor - Emergency Block", defaultRoom: "Trauma Resuscitation Bay 1" },
  { name: "Operation Theatre (OT)", floor: "3rd Floor - Surgical Suite", defaultRoom: "OT Suite 2" },
  { name: "Cardiology OPD", floor: "1st Floor - Cardiology Wing", defaultRoom: "Echo Lab 2" },
  { name: "Nephrology & Dialysis", floor: "2nd Floor - Dialysis Unit", defaultRoom: "Dialysis Bay 3" },
  { name: "CSSD (Central Sterile)", floor: "Basement 1 - Sterilization Wing", defaultRoom: "Autoclave Chamber" },
  { name: "Biomedical & Engineering", floor: "Basement 1 - Plant Room", defaultRoom: "Central Engineering Bay" },
  { name: "Inpatient Ward A (General)", floor: "2nd Floor - General Ward", defaultRoom: "Ward Room 204" },
];

interface AssetAllocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: BiomedicalAsset | null;
  onSaveAllocation: (allocation: AssetAllocationRecord, updatedAsset: BiomedicalAsset, historyEvent: AssetHistoryEvent) => void;
}

export function AssetAllocationModal({
  open,
  onOpenChange,
  asset,
  onSaveAllocation,
}: AssetAllocationModalProps) {
  const { toast } = useToast();

  const [allocationType, setAllocationType] = useState<"Permanent Transfer" | "Temporary Loan">("Temporary Loan");
  const [targetDept, setTargetDept] = useState("Emergency & Trauma");
  const [targetFloor, setTargetFloor] = useState("Ground Floor - Emergency Block");
  const [targetRoom, setTargetRoom] = useState("Trauma Resuscitation Bay 1");
  const [expectedReturnDate, setExpectedReturnDate] = useState("2026-08-30");
  const [allocatedBy, setAllocatedBy] = useState("Dr. Vikram Sethi (Medical Superintendent)");
  const [purposeNotes, setPurposeNotes] = useState("");

  const handleDeptSelect = (deptName: string) => {
    setTargetDept(deptName);
    const matched = DEPARTMENTS_LIST.find((d) => d.name === deptName);
    if (matched) {
      setTargetFloor(matched.floor);
      setTargetRoom(matched.defaultRoom);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset) return;

    if (targetDept === asset.department && allocationType === "Permanent Transfer") {
      toast({
        title: "Invalid Destination",
        description: "Target department cannot be the same as current department for permanent transfers.",
        variant: "destructive",
      });
      return;
    }

    const allocationNo = `ALC-2026-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();

    const allocationRecord: AssetAllocationRecord = {
      id: `alc_${Date.now()}`,
      allocationNo,
      assetId: asset.id,
      assetCode: asset.assetCode,
      assetName: asset.name,
      fromDepartment: asset.department,
      toDepartment: targetDept,
      fromFloor: asset.floor,
      toFloor: targetFloor,
      fromRoom: asset.installedRoom || "General Room",
      toRoom: targetRoom,
      allocatedBy,
      allocatedAt: now,
      allocationType,
      expectedReturnDate: allocationType === "Temporary Loan" ? expectedReturnDate : undefined,
      status: "Active",
      purposeNotes: purposeNotes.trim() || `${allocationType} to ${targetDept} authorized by ${allocatedBy}.`,
    };

    const updatedAsset: BiomedicalAsset = {
      ...asset,
      department: allocationType === "Permanent Transfer" ? targetDept : asset.department,
      floor: allocationType === "Permanent Transfer" ? targetFloor : asset.floor,
      installedRoom: allocationType === "Permanent Transfer" ? targetRoom : asset.installedRoom,
      isLoaned: allocationType === "Temporary Loan",
      currentLoanDepartment: allocationType === "Temporary Loan" ? targetDept : undefined,
      expectedReturnDate: allocationType === "Temporary Loan" ? expectedReturnDate : undefined,
    };

    const historyEvent: AssetHistoryEvent = {
      id: `evt_${Date.now()}`,
      assetId: asset.id,
      assetCode: asset.assetCode,
      assetName: asset.name,
      eventType: "Allocation / Transfer",
      timestamp: now,
      actor: allocatedBy,
      title: `${allocationType}: ${asset.department} ➔ ${targetDept}`,
      details: `${allocationType} logged (Ref: ${allocationNo}). New Location: ${targetFloor} (${targetRoom}). ${
        allocationType === "Temporary Loan" ? `Expected Return: ${expectedReturnDate}.` : ""
      } Purpose: ${purposeNotes.trim() || "Operational realignment"}`,
      referenceId: allocationNo,
    };

    onSaveAllocation(allocationRecord, updatedAsset, historyEvent);
    toast({
      title: `${allocationType} Logged`,
      description: `${asset.assetCode} dispatched to ${targetDept}. Ref: ${allocationNo}. (${allocatedBy})`,
    });
    onOpenChange(false);
  };

  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-primary" /> Asset Allocation &amp; Transfer
            </DialogTitle>
            <DialogDescription className="text-xs">
              Reassign physical location or record a temporary inter-departmental loan with an audit trail.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3 text-xs">
            {/* Current Asset Info Summary */}
            <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Asset Code &amp; Name:</span>
                <span className="font-mono font-bold text-foreground">{asset.assetCode} — {asset.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Current Home Department:</span>
                <span className="font-semibold text-primary">{asset.department}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Current Location / Room:</span>
                <span className="text-muted-foreground">{asset.floor} ({asset.installedRoom || "Main Bay"})</span>
              </div>
            </div>

            {/* Allocation Type Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1">
                <Label htmlFor="alc-type">Allocation Type *</Label>
                <Select
                  value={allocationType}
                  onValueChange={(v: "Permanent Transfer" | "Temporary Loan") => setAllocationType(v)}
                >
                  <SelectTrigger id="alc-type" className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Temporary Loan">Temporary Loan (With Return Date)</SelectItem>
                    <SelectItem value="Permanent Transfer">Permanent Reassignment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="alc-auth">Authorizing Official *</Label>
                <Input
                  id="alc-auth"
                  required
                  value={allocatedBy}
                  onChange={(e) => setAllocatedBy(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Destination Department Selection */}
            <div className="grid gap-1">
              <Label htmlFor="alc-dept">Destination Department *</Label>
              <Select value={targetDept} onValueChange={handleDeptSelect}>
                <SelectTrigger id="alc-dept" className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS_LIST.map((dept) => (
                    <SelectItem key={dept.name} value={dept.name}>
                      {dept.name} ({dept.floor})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1">
                <Label htmlFor="alc-floor">Target Floor &amp; Wing</Label>
                <Input
                  id="alc-floor"
                  required
                  value={targetFloor}
                  onChange={(e) => setTargetFloor(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="alc-room">Target Room / Bay</Label>
                <Input
                  id="alc-room"
                  required
                  value={targetRoom}
                  onChange={(e) => setTargetRoom(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Expected Return Date (Only for Temporary Loans) */}
            {allocationType === "Temporary Loan" && (
              <div className="p-2.5 rounded-md border border-amber-500/30 bg-amber-500/5 grid gap-1">
                <Label htmlFor="alc-return" className="text-amber-900 dark:text-amber-200 font-semibold flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-amber-600" /> Expected Return Date *
                </Label>
                <Input
                  id="alc-return"
                  type="date"
                  required
                  value={expectedReturnDate}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                  className="text-xs bg-background"
                />
                <p className="text-[10px] text-muted-foreground">
                  The asset will be marked as "On Loan" and tracked until checked back into its home department.
                </p>
              </div>
            )}

            {/* Purpose & Clinical Notes */}
            <div className="grid gap-1">
              <Label htmlFor="alc-notes">Clinical Justification / Purpose Notes</Label>
              <Textarea
                id="alc-notes"
                placeholder="e.g. Surge emergency capacity for high-volume polytrauma shift..."
                rows={2}
                value={purposeNotes}
                onChange={(e) => setPurposeNotes(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="gap-1.5">
              <ArrowLeftRight className="h-4 w-4" /> Dispatch &amp; Log Allocation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
