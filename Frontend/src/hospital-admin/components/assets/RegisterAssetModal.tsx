"use client";

import React, { useState } from "react";
import { Cpu, Building2, Plus, ShieldCheck, IndianRupee } from "lucide-react";
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
import { BiomedicalAsset, AssetCategory, AssetHistoryEvent } from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";

const REGISTERED_VENDORS = [
  "Siemens Healthcare Pvt Ltd",
  "Philips Healthcare India",
  "Hamilton Medical India",
  "Dräger India Pvt Ltd",
  "Mindray Medical India",
  "Fresenius Medical Care",
  "Ziehm Imaging India",
  "Zoll Medical India",
  "Linde India Limited",
  "Cummins India Limited",
  "Tuttnauer Medical",
  "Daikin Airconditioning India",
  "Schindler India Pvt Ltd",
  "GE Healthcare India",
];

const DEPARTMENTS = [
  { name: "Radiology & Imaging", floor: "Ground Floor - Radiology Block" },
  { name: "Intensive Care Unit (ICU)", floor: "3rd Floor - Critical Care Block" },
  { name: "Emergency & Trauma", floor: "Ground Floor - Emergency Block" },
  { name: "Operation Theatre (OT)", floor: "3rd Floor - Surgical Suite" },
  { name: "Cardiology OPD", floor: "1st Floor - Cardiology Wing" },
  { name: "Nephrology & Dialysis", floor: "2nd Floor - Dialysis Unit" },
  { name: "CSSD (Central Sterile)", floor: "Basement 1 - Sterilization Wing" },
  { name: "Biomedical & Engineering", floor: "Basement 1 - Plant Room" },
  { name: "Inpatient Ward A (General)", floor: "2nd Floor - General Ward" },
];

interface RegisterAssetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveAsset: (newAsset: BiomedicalAsset, historyEvent: AssetHistoryEvent) => void;
}

export function RegisterAssetModal({
  open,
  onOpenChange,
  onSaveAsset,
}: RegisterAssetModalProps) {
  const { toast } = useToast();

  const [assetName, setAssetName] = useState("");
  const [assetCode, setAssetCode] = useState("");
  const [category, setCategory] = useState<AssetCategory>("Diagnostic & Imaging");
  const [model, setModel] = useState("");
  const [serialNo, setSerialNo] = useState("");
  const [department, setDepartment] = useState("Radiology & Imaging");
  const [floor, setFloor] = useState("Ground Floor - Radiology Block");
  const [installedRoom, setInstalledRoom] = useState("");
  const [purchaseCost, setPurchaseCost] = useState<number>(2500000);
  const [vendorName, setVendorName] = useState("Siemens Healthcare Pvt Ltd");
  const [warrantyYears, setWarrantyYears] = useState(3);
  const [amcCmcContract, setAmcCmcContract] = useState<"Active" | "Expired" | "Under Renewal">("Active");

  const handleDeptChange = (deptName: string) => {
    setDepartment(deptName);
    const matched = DEPARTMENTS.find((d) => d.name === deptName);
    if (matched) setFloor(matched.floor);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!assetName.trim() || !serialNo.trim()) {
      toast({
        title: "Metadata Incomplete",
        description: "Rule F20-CANNOT-1: Asset name and unique serial number are required.",
        variant: "destructive",
      });
      return;
    }

    const generatedCode =
      assetCode.trim() ||
      `BIO-${category.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    const now = new Date().toISOString();
    const today = now.split("T")[0];

    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + warrantyYears);
    const warrantyExpiry = expiryDate.toISOString().split("T")[0];

    const nextPpm = new Date();
    nextPpm.setMonth(nextPpm.getMonth() + 6);
    const nextPPMDate = nextPpm.toISOString().split("T")[0];

    const newAsset: BiomedicalAsset = {
      id: `ast_${Date.now()}`,
      assetCode: generatedCode,
      name: assetName.trim(),
      category,
      model: model.trim() || assetName.trim(),
      serialNo: serialNo.trim(),
      department,
      floor,
      installedRoom: installedRoom.trim() || "Main Department Room",
      purchaseDate: today,
      purchaseCost,
      warrantyExpiry,
      amcCmcContract,
      vendorName,
      nextPPMDate,
      maintenanceStatus: "Operational",
      lastCalibrationDate: today,
      isLoaned: false,
    };

    const historyEvent: AssetHistoryEvent = {
      id: `evt_${Date.now()}`,
      assetId: newAsset.id,
      assetCode: generatedCode,
      assetName: newAsset.name,
      eventType: "Registration",
      timestamp: now,
      actor: "Hospital Procurement & Biomedical Commissioning Board",
      title: `Capital Asset Tagged & Commissioned (${generatedCode})`,
      details: `Registered in ${department} (${floor}). OEM Vendor: ${vendorName}. Acquisition Cost: ₹${purchaseCost.toLocaleString(
        "en-IN"
      )}. Warranty active until ${warrantyExpiry}.`,
      referenceId: generatedCode,
    };

    onSaveAsset(newAsset, historyEvent);
    toast({
      title: "Asset Commissioned",
      description: `${newAsset.name} [${generatedCode}] registered successfully in ${department}.`,
    });

    // Reset form
    setAssetName("");
    setAssetCode("");
    setModel("");
    setSerialNo("");
    setInstalledRoom("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" /> Register Capital &amp; Facility Asset
            </DialogTitle>
            <DialogDescription className="text-xs">
              Onboard capital biomedical machinery or facility infrastructure into the master hospital registry.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-3 text-xs">
            <div className="grid gap-1">
              <Label htmlFor="reg-name">Equipment Name *</Label>
              <Input
                id="reg-name"
                required
                placeholder="e.g. Philips Affiniti 70 Ultrasound System"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1">
                <Label htmlFor="reg-code">Asset Code (Auto if blank)</Label>
                <Input
                  id="reg-code"
                  placeholder="e.g. BIO-US-04"
                  value={assetCode}
                  onChange={(e) => setAssetCode(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="reg-cat">Category *</Label>
                <Select value={category} onValueChange={(val: AssetCategory) => setCategory(val)}>
                  <SelectTrigger id="reg-cat" className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Diagnostic & Imaging">Diagnostic &amp; Imaging (Medical)</SelectItem>
                    <SelectItem value="Life Support">Life Support (Medical)</SelectItem>
                    <SelectItem value="OT Equipment">OT Equipment (Medical)</SelectItem>
                    <SelectItem value="Monitoring">Monitoring (Medical)</SelectItem>
                    <SelectItem value="Facility Infrastructure">Facility Infrastructure (Hospital)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1">
                <Label htmlFor="reg-model">Model Name / Number</Label>
                <Input
                  id="reg-model"
                  placeholder="e.g. Affiniti 70 Plus"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="reg-sn">OEM Serial Number *</Label>
                <Input
                  id="reg-sn"
                  required
                  placeholder="e.g. SN-PHIL-992019"
                  value={serialNo}
                  onChange={(e) => setSerialNo(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1">
                <Label htmlFor="reg-dept">Assigned Department *</Label>
                <Select value={department} onValueChange={handleDeptChange}>
                  <SelectTrigger id="reg-dept" className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d.name} value={d.name}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="reg-room">Room / Installation Bay</Label>
                <Input
                  id="reg-room"
                  placeholder="e.g. Echo Lab 2 / Bay A"
                  value={installedRoom}
                  onChange={(e) => setInstalledRoom(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1">
                <Label htmlFor="reg-cost">Purchase Cost (₹) *</Label>
                <Input
                  id="reg-cost"
                  type="number"
                  required
                  value={purchaseCost}
                  onChange={(e) => setPurchaseCost(Number(e.target.value))}
                  className="text-xs font-mono"
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="reg-warranty">Warranty Coverage</Label>
                <Select value={warrantyYears.toString()} onValueChange={(v) => setWarrantyYears(Number(v))}>
                  <SelectTrigger id="reg-warranty" className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Year Warranty</SelectItem>
                    <SelectItem value="2">2 Years Warranty</SelectItem>
                    <SelectItem value="3">3 Years Comprehensive</SelectItem>
                    <SelectItem value="5">5 Years OEM Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1">
                <Label htmlFor="reg-vendor">OEM Vendor (Procurement Registry) *</Label>
                <Select value={vendorName} onValueChange={setVendorName}>
                  <SelectTrigger id="reg-vendor" className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REGISTERED_VENDORS.map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="reg-amc">AMC / CMC Contract Status</Label>
                <Select
                  value={amcCmcContract}
                  onValueChange={(v: "Active" | "Expired" | "Under Renewal") => setAmcCmcContract(v)}
                >
                  <SelectTrigger id="reg-amc" className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active (Covered)</SelectItem>
                    <SelectItem value="Under Renewal">Under Renewal</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> Commission &amp; Tag Asset
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
