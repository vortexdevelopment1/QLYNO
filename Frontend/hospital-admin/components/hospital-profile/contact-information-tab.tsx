"use client";

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import {
  updateContactInfo,
  addDepartmentExtension,
  deleteDepartmentExtension,
} from "@/hospital-admin/store/slices/hospitalProfileSlice";
import { ContactInformationData, DepartmentExtension } from "@/hospital-admin/lib/types/hospital-profile";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import {
  PhoneCall,
  Mail,
  MapPin,
  Globe,
  Save,
  Plus,
  Trash2,
  HeartPulse,
  Building2,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Button } from "@/hospital-admin/components/ui/button";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Switch } from "@/hospital-admin/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/hospital-admin/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/hospital-admin/components/ui/dialog";

export function ContactInformationTab() {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const contactInfo = useSelector((state: RootState) => state.hospitalProfile.contactInfo);

  const [formData, setFormData] = useState<ContactInformationData>({ ...contactInfo });
  const [isAddExtOpen, setIsAddExtOpen] = useState(false);

  const [extDeptName, setExtDeptName] = useState("");
  const [extNumber, setExtNumber] = useState("");
  const [extDirectPhone, setExtDirectPhone] = useState("");
  const [extHours, setExtHours] = useState("24 Hours / 7 Days");
  const [extIsEmergency, setExtIsEmergency] = useState(false);

  const handleInputChange = (field: keyof ContactInformationData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveContact = () => {
    dispatch(updateContactInfo(formData));
    toast({
      title: "Contact Details Saved",
      description: "Public contact lines, address, and extensions updated successfully.",
    });
  };

  const handleAddExtension = () => {
    if (!extDeptName.trim() || !extNumber.trim()) {
      toast({
        title: "Fields Required",
        description: "Please enter department name and extension number.",
        variant: "destructive",
      });
      return;
    }

    dispatch(
      addDepartmentExtension({
        departmentName: extDeptName,
        extensionNumber: extNumber,
        directPhone: extDirectPhone.trim() || undefined,
        operatingHours: extHours,
        isEmergencyLine: extIsEmergency,
      })
    );

    toast({
      title: "Extension Added",
      description: `Extension ${extNumber} for ${extDeptName} registered.`,
    });

    setExtDeptName("");
    setExtNumber("");
    setExtDirectPhone("");
    setExtHours("24 Hours / 7 Days");
    setExtIsEmergency(false);
    setIsAddExtOpen(false);
  };

  const handleDeleteExt = (id: string, name: string) => {
    dispatch(deleteDepartmentExtension(id));
    toast({
      title: "Extension Removed",
      description: `${name} extension deleted.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Contact Form Header Card */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-3 border-b border-border/80">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <PhoneCall className="h-4 w-4 text-primary" />
                Public Contact &amp; Emergency Helpline Directory
              </CardTitle>
              <CardDescription className="text-xs">
                Configure patient telephone lines, 24/7 acute trauma helpline, official email endpoints, and geo-location for patient navigation.
              </CardDescription>
            </div>
            <Button size="sm" onClick={handleSaveContact} className="h-8 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground">
              <Save className="h-3.5 w-3.5" />
              <span>Save Contact Information</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 24/7 Emergency Helpline */}
            <div className="space-y-1.5 p-3 rounded-lg border border-rose-500/30 bg-rose-500/5 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-rose-950 dark:text-rose-300 flex items-center gap-1.5">
                  <HeartPulse className="h-4 w-4 text-rose-600" />
                  24/7 Emergency &amp; Cardiac Helpline Number
                </Label>
                <Badge className="bg-rose-600 text-white text-[9px] px-1.5 py-0">
                  Critical Hotline
                </Badge>
              </div>
              <Input
                value={formData.emergencyHelpline}
                onChange={(e) => handleInputChange("emergencyHelpline", e.target.value)}
                placeholder="e.g. 1066 / +91 22 6100 8911"
                className="text-xs h-9 bg-background font-mono font-bold text-rose-700 dark:text-rose-300"
              />
              <p className="text-[10px] text-rose-900/80 dark:text-rose-300/80">
                Prominently displayed in header badges and mobile emergency dialing widgets.
              </p>
            </div>

            {/* General Switchboard Phone */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <PhoneCall className="h-3.5 w-3.5 text-primary" />
                General Switchboard / Reception Phone
              </Label>
              <Input
                value={formData.generalPhone}
                onChange={(e) => handleInputChange("generalPhone", e.target.value)}
                placeholder="e.g. +91 22 6100 8800"
                className="text-xs h-9 font-mono"
              />
            </div>

            {/* Reception Direct Line */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                Inpatient Admissions Desk Direct Line
              </Label>
              <Input
                value={formData.receptionPhone}
                onChange={(e) => handleInputChange("receptionPhone", e.target.value)}
                placeholder="e.g. +91 22 6100 8810"
                className="text-xs h-9 font-mono"
              />
            </div>

            {/* General Email */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-primary" />
                Patient Care &amp; Enquiries Email
              </Label>
              <Input
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="e.g. care@qlyno.health"
                className="text-xs h-9"
              />
            </div>

            {/* Website URL */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-primary" />
                Official Hospital Portal Website
              </Label>
              <Input
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder="e.g. https://www.qlyno.health"
                className="text-xs h-9 font-mono"
              />
            </div>
          </div>

          {/* Physical Address & Geo Location */}
          <div className="space-y-3 pt-3 border-t border-border/80">
            <Label className="text-xs font-bold flex items-center gap-1.5 text-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Physical Hospital Address &amp; Navigation Coordinates
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-[11px] text-muted-foreground font-medium">Street Address</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Plot 42, Healthcare City, Andheri East"
                  className="text-xs h-8.5"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] text-muted-foreground font-medium">City</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Mumbai"
                  className="text-xs h-8.5"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] text-muted-foreground font-medium">Postal Code / PIN</Label>
                <Input
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange("postalCode", e.target.value)}
                  placeholder="400069"
                  className="text-xs h-8.5 font-mono"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Department-Wise Extension Directory */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-3 border-b border-border/80">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Building2 className="h-4 w-4 text-primary" />
                Department-Wise Extension Directory
              </CardTitle>
              <CardDescription className="text-xs">
                Internal and public extension lines for direct routing to triage, ICU, ambulance dispatch, and billing desks.
              </CardDescription>
            </div>
            <Button size="sm" onClick={() => setIsAddExtOpen(true)} className="h-8 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground">
              <Plus className="h-3.5 w-3.5" />
              <span>Add Department Extension</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="text-[11px]">
                <TableHead>Department / Station</TableHead>
                <TableHead>Ext No.</TableHead>
                <TableHead>Direct Contact Phone</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              {contactInfo.departmentExtensions.map((ext) => (
                <TableRow key={ext.id}>
                  <TableCell className="font-semibold text-foreground">
                    {ext.departmentName}
                  </TableCell>
                  <TableCell className="font-mono font-bold text-primary">
                    Ext: {ext.extensionNumber}
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground text-[11px]">
                    {ext.directPhone || "—"}
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {ext.operatingHours}
                    </span>
                  </TableCell>
                  <TableCell>
                    {ext.isEmergencyLine ? (
                      <Badge className="bg-rose-600/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[9px]">
                        Emergency Line
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px]">
                        General Desk
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteExt(ext.id, ext.departmentName)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Extension Modal */}
      <Dialog open={isAddExtOpen} onOpenChange={setIsAddExtOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              Add Department Extension Line
            </DialogTitle>
            <DialogDescription className="text-xs">
              Register a direct extension for automatic PBX routing and patient enquiries.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Department / Desk Name</Label>
              <Input
                value={extDeptName}
                onChange={(e) => setExtDeptName(e.target.value)}
                placeholder="e.g. Blood Bank &amp; Component Lab"
                className="text-xs h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Extension Number</Label>
                <Input
                  value={extNumber}
                  onChange={(e) => setExtNumber(e.target.value)}
                  placeholder="e.g. 501"
                  className="text-xs h-9 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Direct Phone (Optional)</Label>
                <Input
                  value={extDirectPhone}
                  onChange={(e) => setExtDirectPhone(e.target.value)}
                  placeholder="e.g. +91 22 6100 8850"
                  className="text-xs h-9 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Operating Hours</Label>
              <Input
                value={extHours}
                onChange={(e) => setExtHours(e.target.value)}
                placeholder="e.g. 24 Hours / 7 Days or 08:00 AM – 08:00 PM"
                className="text-xs h-9"
              />
            </div>

            <div className="flex items-center justify-between p-2 rounded border border-border">
              <Label htmlFor="ext-emergency" className="text-xs cursor-pointer font-medium">
                Designate as Emergency Priority Line
              </Label>
              <Switch
                id="ext-emergency"
                checked={extIsEmergency}
                onCheckedChange={setExtIsEmergency}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button size="sm" variant="outline" onClick={() => setIsAddExtOpen(false)} className="h-8 text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddExtension} className="h-8 text-xs bg-primary text-primary-foreground font-semibold">
              Add Extension
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
