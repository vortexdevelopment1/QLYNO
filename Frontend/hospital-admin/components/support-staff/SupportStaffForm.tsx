"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/hospital-admin/components/ui/dialog";
import { Button } from "@/hospital-admin/components/ui/button";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { mockStations } from "@/hospital-admin/lib/mock/nursing";
import { AdminOverrideLogBanner } from "@/hospital-admin/components/shared/AdminOverrideLogBanner";

interface SupportStaffFormProps {
  isOpen: boolean;
  onClose: () => void;
  staff?: any;
  onSave?: (data: any) => void;
}

export function SupportStaffForm({ isOpen, onClose, staff, onSave }: SupportStaffFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "Support Staff",
    department: "General Wards",
    status: "active",
    stationId: "none",
    driverLicenseNumber: "",
    assignedVehicleId: "none",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: staff?.name || "",
        category: staff?.category || "Support Staff",
        department: staff?.department || "General Wards",
        status: staff?.status || "active",
        stationId: staff?.assignedStationId || "none",
        driverLicenseNumber: staff?.driverLicenseNumber || "",
        assignedVehicleId: staff?.assignedVehicleId || "none",
      });
    }
  }, [isOpen, staff]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            {staff ? "Edit Staff Profile" : "Register Hospital Workforce Staff"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 pt-2 text-xs">
          <AdminOverrideLogBanner />
          <div className="space-y-1">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              className="text-xs"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="category">Staff Category (Mandatory Assignment)</Label>
            <Select
              value={formData.category}
              onValueChange={(val: any) => setFormData({ ...formData, category: val })}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Technician">Technicians (Lab / Radiology / OT)</SelectItem>
                <SelectItem value="Housekeeping">Housekeeping &amp; Sanitation</SelectItem>
                <SelectItem value="Security">Hospital Security</SelectItem>
                <SelectItem value="Driver">Ambulance &amp; Transport Driver</SelectItem>
                <SelectItem value="Support Staff">Ward Attendant &amp; Orderly</SelectItem>
                <SelectItem value="Other Hospital Staff">Other Hospital Staff (Admin/IT/Biomed)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.category === "Driver" && (
            <>
              <div className="space-y-1">
                <Label htmlFor="license">Commercial Driving License Number</Label>
                <Input
                  id="license"
                  className="text-xs font-mono"
                  placeholder="e.g. MH-02-2018-9921"
                  value={formData.driverLicenseNumber}
                  onChange={(e) => setFormData({ ...formData, driverLicenseNumber: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="vehicle">Assigned Ambulance Fleet (Cross-Linked)</Label>
                <Select
                  value={formData.assignedVehicleId}
                  onValueChange={(val) => setFormData({ ...formData, assignedVehicleId: val })}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Select Ambulance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned / Float Driver</SelectItem>
                    <SelectItem value="AMB-01">AMB-01 (Advanced Life Support)</SelectItem>
                    <SelectItem value="AMB-02">AMB-02 (Basic Life Support)</SelectItem>
                    <SelectItem value="AMB-03">AMB-03 (Neonatal Critical Care)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-1">
            <Label htmlFor="stationId">Assigned Station / Inpatient Ward</Label>
            <Select
              value={formData.stationId}
              onValueChange={(val) => setFormData({ ...formData, stationId: val })}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Select Station" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Hospital-wide / Campus Float</SelectItem>
                {mockStations.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.department})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="status">Duty Status</Label>
            <Select
              value={formData.status}
              onValueChange={(val) => setFormData({ ...formData, status: val })}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">On Duty / Active</SelectItem>
                <SelectItem value="off-duty">Off Duty</SelectItem>
                <SelectItem value="on-leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save Profile
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
