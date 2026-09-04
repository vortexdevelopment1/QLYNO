"use client";

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import { updateBasicInfo } from "@/hospital-admin/store/slices/hospitalProfileSlice";
import { BasicInformationData, HospitalType } from "@/hospital-admin/lib/types/hospital-profile";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import {
  Building2,
  ShieldCheck,
  AlertTriangle,
  Save,
  Award,
  Sparkles,
  Info,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import { Button } from "@/hospital-admin/components/ui/button";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";

export function BasicInformationTab() {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const basicInfo = useSelector((state: RootState) => state.hospitalProfile.basicInfo);
  const materialChangesPending = useSelector((state: RootState) => state.hospitalProfile.materialChangesPending);

  const [formData, setFormData] = useState<BasicInformationData>({ ...basicInfo });
  const [newAccreditation, setNewAccreditation] = useState("");

  const handleInputChange = (field: keyof BasicInformationData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddAccreditation = () => {
    if (newAccreditation.trim()) {
      setFormData((prev) => ({
        ...prev,
        accreditationBadges: [...prev.accreditationBadges, newAccreditation.trim()],
      }));
      setNewAccreditation("");
    }
  };

  const handleRemoveAccreditation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      accreditationBadges: prev.accreditationBadges.filter((_, idx) => idx !== index),
    }));
  };

  const handleSave = () => {
    const isMaterialChanged =
      formData.legalEntityName !== basicInfo.legalEntityName ||
      formData.registrationNumber !== basicInfo.registrationNumber ||
      formData.hospitalType !== basicInfo.hospitalType ||
      formData.nabhAccreditationNumber !== basicInfo.nabhAccreditationNumber;

    dispatch(updateBasicInfo(formData));

    toast({
      title: isMaterialChanged ? "Identity Updated (Module 13 Review Triggered)" : "Basic Information Saved",
      description: isMaterialChanged
        ? "Material identity changes detected. Verification review initiated per Rule 13.1."
        : "Hospital profile basic details successfully updated in draft storage.",
    });
  };

  const hospitalTypes: HospitalType[] = [
    "Multi-Specialty Tertiary Care",
    "Super-Specialty Hospital",
    "General Hospital",
    "Academic Medical Center",
    "Day Care Surgery Center",
  ];

  return (
    <div className="space-y-6">
      {/* Identity Context Card */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-3 border-b border-border/80">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Building2 className="h-4 w-4 text-primary" />
                Hospital Legal Identity &amp; Public Branding
              </CardTitle>
              <CardDescription className="text-xs">
                This is the editable draft of the core identity verified by Module 13. Material modifications re-trigger compliance review.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleSave} className="h-8 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground">
                <Save className="h-3.5 w-3.5" />
                <span>Save Identity Changes</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Hospital Public Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Public Display Name</Label>
              <Input
                value={formData.hospitalName}
                onChange={(e) => handleInputChange("hospitalName", e.target.value)}
                placeholder="e.g. Qlyno Multispecialty Hospital"
                className="text-xs h-9"
              />
              <p className="text-[11px] text-muted-foreground">Primary name shown on patient apps and search listings.</p>
            </div>

            {/* Tagline */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Public Tagline / Slogan</Label>
              <Input
                value={formData.tagline}
                onChange={(e) => handleInputChange("tagline", e.target.value)}
                placeholder="e.g. NABH &amp; AERB Accredited Tertiary Care Hospital"
                className="text-xs h-9"
              />
              <p className="text-[11px] text-muted-foreground">Concise headline appearing under the hospital name.</p>
            </div>

            {/* Legal Entity Name (Material Field) */}
            <div className="space-y-1.5 p-3 rounded-lg border border-amber-500/30 bg-amber-500/5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-amber-950 dark:text-amber-300 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                  Legal Registered Corporate Name (Material Field)
                </Label>
                <Badge variant="outline" className="text-[9px] font-mono border-amber-500/40 text-amber-800 dark:text-amber-300">
                  Verification Gate
                </Badge>
              </div>
              <Input
                value={formData.legalEntityName}
                onChange={(e) => handleInputChange("legalEntityName", e.target.value)}
                placeholder="e.g. Qlyno Healthcare Private Limited"
                className="text-xs h-8.5 bg-background"
              />
              <p className="text-[10px] text-amber-900/80 dark:text-amber-300/80">
                Matches Certificate of Incorporation. Changes re-trigger Module 13 review.
              </p>
            </div>

            {/* Registration / CIN Number (Material Field) */}
            <div className="space-y-1.5 p-3 rounded-lg border border-amber-500/30 bg-amber-500/5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-amber-950 dark:text-amber-300 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                  Corporate Registration / CIN / License (Material Field)
                </Label>
                <Badge variant="outline" className="text-[9px] font-mono border-amber-500/40 text-amber-800 dark:text-amber-300">
                  Verification Gate
                </Badge>
              </div>
              <Input
                value={formData.registrationNumber}
                onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
                placeholder="e.g. U85110MH2018PTC309112"
                className="text-xs h-8.5 bg-background font-mono"
              />
              <p className="text-[10px] text-amber-900/80 dark:text-amber-300/80">
                Government Clinical Establishment / MCA identification registration.
              </p>
            </div>

            {/* Hospital Tier / Type */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Hospital Type / Tier</Label>
              <Select
                value={formData.hospitalType}
                onValueChange={(val: HospitalType) => handleInputChange("hospitalType", val)}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder="Select Hospital Tier" />
                </SelectTrigger>
                <SelectContent>
                  {hospitalTypes.map((type) => (
                    <SelectItem key={type} value={type} className="text-xs">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">Classifies facility capability and emergency infrastructure tier.</p>
            </div>

            {/* Established Year & Campus Area */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Established Year</Label>
                <Input
                  type="number"
                  value={formData.establishedYear}
                  onChange={(e) => handleInputChange("establishedYear", parseInt(e.target.value) || 2020)}
                  className="text-xs h-9 font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Campus Area (Sq.Ft)</Label>
                <Input
                  type="number"
                  value={formData.totalCampusAreaSqFt}
                  onChange={(e) => handleInputChange("totalCampusAreaSqFt", parseInt(e.target.value) || 0)}
                  className="text-xs h-9 font-mono"
                />
              </div>
            </div>
          </div>

          {/* NABH & Accreditation Reference */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">NABH / Clinical Accreditation Certificate Number</Label>
            <Input
              value={formData.nabhAccreditationNumber}
              onChange={(e) => handleInputChange("nabhAccreditationNumber", e.target.value)}
              placeholder="e.g. NABH-HOSP-2024-88912"
              className="text-xs h-9 font-mono"
            />
          </div>

          {/* Accreditations & Quality Badges */}
          <div className="space-y-2 pt-2 border-t border-border/80">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-primary" />
              Accreditation Badges &amp; Quality Certifications
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {formData.accreditationBadges.map((badge, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="text-[11px] px-2.5 py-1 flex items-center gap-1.5 border border-border"
                >
                  <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                  <span>{badge}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAccreditation(idx)}
                    className="ml-1 text-muted-foreground hover:text-destructive text-xs font-bold"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1 max-w-md">
              <Input
                value={newAccreditation}
                onChange={(e) => setNewAccreditation(e.target.value)}
                placeholder="Add accreditation (e.g. ISO 9001:2015, JCI Gold)"
                className="text-xs h-8"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddAccreditation();
                  }
                }}
              />
              <Button type="button" size="sm" variant="outline" onClick={handleAddAccreditation} className="h-8 text-xs shrink-0">
                Add Badge
              </Button>
            </div>
          </div>

          {/* About Overview */}
          <div className="space-y-1.5 pt-2 border-t border-border/80">
            <Label className="text-xs font-semibold">About Hospital / Public Clinical Overview</Label>
            <Textarea
              rows={4}
              value={formData.aboutOverview}
              onChange={(e) => handleInputChange("aboutOverview", e.target.value)}
              placeholder="Detailed description of clinical philosophy, advanced technology, patient amenities, and emergency care services..."
              className="text-xs leading-relaxed"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
