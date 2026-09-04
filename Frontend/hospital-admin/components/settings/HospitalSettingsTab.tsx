"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Clock,
  ShieldCheck,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Switch } from "@/hospital-admin/components/ui/switch";
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import { useToast } from "@/hospital-admin/hooks/use-toast";

export function HospitalSettingsTab() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    hospitalName: "Qlyno Multispecialty Hospital & Research Center",
    legalName: "Qlyno Healthcare Services Pvt Ltd",
    operatingModel: "hospital",
    nabhId: "NABH-2024-HOSP-0982",
    regNumber: "MOH-MH-2022-8819",
    contactEmail: "admin@qlyno.health",
    emergencyPhone: "+91 22 4000 9999",
    receptionPhone: "+91 22 4000 1200",
    website: "https://qlyno.health",
    addressLine1: "Plot 42, Healthcare City, MedTech Park",
    addressLine2: "Off Eastern Express Highway",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400076",
    country: "India",
    opdStartTime: "08:00",
    opdEndTime: "20:00",
    is24x7Emergency: true,
    visitingHours: "04:00 PM - 07:00 PM (Daily)",
    about:
      "A 300-bed state-of-the-art tertiary care multispecialty hospital offering comprehensive cardiology, orthopedics, neurology, oncology, pediatrics, and emergency trauma facilities.",
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Hospital Profile & Settings Saved",
        description: "General hospital configuration and contact details updated successfully.",
      });
    }, 600);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* 1. General Identification */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Building2 className="h-5 w-5 text-primary" /> Hospital Identification & Legal Credentials
            </CardTitle>
            <CardDescription className="text-xs">
              Configure official hospital title, government registrations, and operating framework.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs font-semibold">
            <Link href="/hospital-admin/hospital-profile">
              <ExternalLink className="h-3.5 w-3.5" /> Full Public Profile
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="hospitalName">Display Hospital Name</Label>
              <Input
                id="hospitalName"
                value={formData.hospitalName}
                onChange={(e) => handleChange("hospitalName", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="legalName">Registered Legal Entity Name</Label>
              <Input
                id="legalName"
                value={formData.legalName}
                onChange={(e) => handleChange("legalName", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="operatingModel">Operating Model</Label>
              <Select
                value={formData.operatingModel}
                onValueChange={(val) => handleChange("operatingModel", val)}
              >
                <SelectTrigger id="operatingModel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hospital">Multispecialty Hospital</SelectItem>
                  <SelectItem value="multi-doctor">Multi-Doctor Polyclinic</SelectItem>
                  <SelectItem value="solo">Single Specialist Center</SelectItem>
                  <SelectItem value="diagnostic">Diagnostic & Imaging Chain</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="nabhId">NABH Accreditation ID</Label>
              <div className="relative">
                <Input
                  id="nabhId"
                  value={formData.nabhId}
                  onChange={(e) => handleChange("nabhId", e.target.value)}
                />
                <ShieldCheck className="absolute right-3 top-2.5 h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="regNumber">Clinical Establishment Reg. No.</Label>
              <Input
                id="regNumber"
                value={formData.regNumber}
                onChange={(e) => handleChange("regNumber", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="about">Institution Overview & Specialties</Label>
            <Textarea
              id="about"
              rows={3}
              value={formData.about}
              onChange={(e) => handleChange("about", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. Official Contact & Emergency Hotlines */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Phone className="h-5 w-5 text-primary" /> Official Contact & Emergency Hotlines
          </CardTitle>
          <CardDescription className="text-xs">
            Helpline numbers used across patient communications, SMS gateways, and public portals.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="grid gap-1.5">
              <Label htmlFor="emergencyPhone" className="text-destructive font-semibold">
                Emergency Trauma Hotline (24x7)
              </Label>
              <Input
                id="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={(e) => handleChange("emergencyPhone", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="receptionPhone">Front Desk / Reception Phone</Label>
              <Input
                id="receptionPhone"
                value={formData.receptionPhone}
                onChange={(e) => handleChange("receptionPhone", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="contactEmail">Official Admin Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleChange("contactEmail", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="website">Official Web Portal</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Physical Address & Location */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <MapPin className="h-5 w-5 text-primary" /> Campus Address & Geolocation
          </CardTitle>
          <CardDescription className="text-xs">
            Primary hospital location printed on discharge summaries, pharmacy invoices, and diagnostic reports.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="addressLine1">Address Line 1</Label>
              <Input
                id="addressLine1"
                value={formData.addressLine1}
                onChange={(e) => handleChange("addressLine1", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="addressLine2">Address Line 2 / Landmark</Label>
              <Input
                id="addressLine2"
                value={formData.addressLine2}
                onChange={(e) => handleChange("addressLine2", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="grid gap-1.5">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="pincode">PIN / Postal Code</Label>
              <Input
                id="pincode"
                value={formData.pincode}
                onChange={(e) => handleChange("pincode", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleChange("country", e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Operational Hours & Shift Schedules */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Clock className="h-5 w-5 text-primary" /> Operational Hours & Facility Timings
          </CardTitle>
          <CardDescription className="text-xs">
            Standard OPD consultation windows, inpatient visiting hours, and emergency status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="opdStartTime">General OPD Start Time</Label>
              <Input
                id="opdStartTime"
                type="time"
                value={formData.opdStartTime}
                onChange={(e) => handleChange("opdStartTime", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="opdEndTime">General OPD End Time</Label>
              <Input
                id="opdEndTime"
                type="time"
                value={formData.opdEndTime}
                onChange={(e) => handleChange("opdEndTime", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="visitingHours">Inpatient Visiting Hours</Label>
              <Input
                id="visitingHours"
                value={formData.visitingHours}
                onChange={(e) => handleChange("visitingHours", e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3.5">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">24x7 Emergency & Trauma Center Active</p>
              <p className="text-xs text-muted-foreground">
                Enables immediate pre-arrival emergency triage routing and round-the-clock OT standby.
              </p>
            </div>
            <Switch
              checked={formData.is24x7Emergency}
              onCheckedChange={(checked) => handleChange("is24x7Emergency", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action footer */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading} className="gap-2">
          <Save className="h-4 w-4" /> Save Hospital Settings
        </Button>
      </div>
    </form>
  );
}
