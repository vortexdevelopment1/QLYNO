"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Database,
  FileCheck,
  Download,
  Trash2,
  ShieldAlert,
  Lock,
  CheckCircle2,
  ExternalLink,
  Save,
  FileSpreadsheet,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Switch } from "@/hospital-admin/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/hospital-admin/components/ui/dialog";
import { useToast } from "@/hospital-admin/hooks/use-toast";

export function DataPrivacySettingsTab() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportType, setExportType] = useState("all-patients");

  const [privacyConfig, setPrivacyConfig] = useState({
    requireAbdmConsentForSharing: true,
    anonymizeResearchExports: true,
    maskPhoneNumbersOnReceptionDashboard: true,
    maskAadhaarNumberDisplay: true,
    inpatientRetentionYears: "10",
    opdRetentionYears: "7",
    diagnosticImageRetentionYears: "5",
    autoArchiveInactiveRecordsAfterMonths: "24",
    enablePatientDataDownloadPortal: true,
  });

  const handleChange = (key: string, value: any) => {
    setPrivacyConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleExportData = () => {
    setExportModalOpen(false);
    toast({
      title: "Encrypted Export Job Initiated",
      description: "You will receive an encrypted download link via registered admin email once compiled.",
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Privacy & Retention Governance Saved",
        description: "Data lifecycle policies, consent requirements, and masking rules updated.",
      });
    }, 600);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* 1. Patient Consent & Digital Health ID (ABDM / HIPAA) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <FileCheck className="h-5 w-5 text-primary" /> Patient Consent &amp; ABDM Gateway Rules
            </CardTitle>
            <CardDescription className="text-xs">
              Govern electronic consent workflows, Ayushman Bharat Digital Mission linking, and health records exchange.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs font-semibold">
            <Link href="/hospital-admin/security/privacy">
              <ExternalLink className="h-3.5 w-3.5" /> Privacy Management Center
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3.5">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">Require Digital Consent Artifact for Record Exchange</p>
              <p className="text-xs text-muted-foreground">
                Mandates verified OTP consent from patient before dispatching past medical records to external hospitals.
              </p>
            </div>
            <Switch
              checked={privacyConfig.requireAbdmConsentForSharing}
              onCheckedChange={(c) => handleChange("requireAbdmConsentForSharing", c)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3.5">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">Automatic Clinical Data Anonymization (De-identification)</p>
              <p className="text-xs text-muted-foreground">
                Strips Patient Name, Phone, and Aadhaar/Govt ID from clinical research and epidemiology exports.
              </p>
            </div>
            <Switch
              checked={privacyConfig.anonymizeResearchExports}
              onCheckedChange={(c) => handleChange("anonymizeResearchExports", c)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3.5">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">Mask Phone Numbers on Front Desk Screens</p>
              <p className="text-xs text-muted-foreground">
                Displays numbers as +91 98200 •••• to prevent unauthorized viewing by visitors at reception desks.
              </p>
            </div>
            <Switch
              checked={privacyConfig.maskPhoneNumbersOnReceptionDashboard}
              onCheckedChange={(c) => handleChange("maskPhoneNumbersOnReceptionDashboard", c)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3.5">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">Mask National ID / Aadhaar Number</p>
              <p className="text-xs text-muted-foreground">
                Masks first 8 digits (•••• •••• 1234) per UIDAI data protection guidelines.
              </p>
            </div>
            <Switch
              checked={privacyConfig.maskAadhaarNumberDisplay}
              onCheckedChange={(c) => handleChange("maskAadhaarNumberDisplay", c)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. Data Retention & Archival Lifecycle */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Database className="h-5 w-5 text-primary" /> Medical Records Retention &amp; Archival Schedules
          </CardTitle>
          <CardDescription className="text-xs">
            Configures legally mandated retention periods before active clinical records are moved to cold vault storage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="inpatientRetentionYears">Inpatient (IPD) Records Retention</Label>
              <Select
                value={privacyConfig.inpatientRetentionYears}
                onValueChange={(v) => handleChange("inpatientRetentionYears", v)}
              >
                <SelectTrigger id="inpatientRetentionYears">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Years</SelectItem>
                  <SelectItem value="10">10 Years (NABH / Medico-Legal)</SelectItem>
                  <SelectItem value="15">15 Years</SelectItem>
                  <SelectItem value="99">Permanent Indefinite</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="opdRetentionYears">Outpatient (OPD) Consultations</Label>
              <Select
                value={privacyConfig.opdRetentionYears}
                onValueChange={(v) => handleChange("opdRetentionYears", v)}
              >
                <SelectTrigger id="opdRetentionYears">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Years</SelectItem>
                  <SelectItem value="5">5 Years</SelectItem>
                  <SelectItem value="7">7 Years (Standard)</SelectItem>
                  <SelectItem value="10">10 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="diagnosticImageRetentionYears">DICOM / Radiology Image Archival</Label>
              <Select
                value={privacyConfig.diagnosticImageRetentionYears}
                onValueChange={(v) => handleChange("diagnosticImageRetentionYears", v)}
              >
                <SelectTrigger id="diagnosticImageRetentionYears">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Years</SelectItem>
                  <SelectItem value="5">5 Years (Standard)</SelectItem>
                  <SelectItem value="10">10 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Compliance Exports & Governance Actions */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Download className="h-5 w-5 text-primary" /> Regulatory Audit &amp; Data Export
          </CardTitle>
          <CardDescription className="text-xs">
            Generate encrypted compliance snapshots for government healthcare inspection or legal audit.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-foreground">Export Full Hospital Patient &amp; Billing Ledger</p>
            <p className="text-xs text-muted-foreground">
              Encrypted AES-256 password-protected ZIP containing FHIR JSON, HL7, and CSV audit formats.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setExportModalOpen(true)}
            className="gap-2 text-xs font-semibold shrink-0"
          >
            <Download className="h-4 w-4" /> Request Data Export
          </Button>
        </CardContent>
      </Card>

      {/* Export Modal */}
      <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" /> Request Audit Data Export
            </DialogTitle>
            <DialogDescription className="text-xs">
              Select the data package to be generated and encrypted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid gap-1.5">
              <Label className="text-xs">Export Scope</Label>
              <Select value={exportType} onValueChange={setExportType}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-patients">All Patient Clinical &amp; Demographic Data</SelectItem>
                  <SelectItem value="billing-ledger">Complete Financial &amp; GST Invoicing Ledger</SelectItem>
                  <SelectItem value="audit-security">System Access &amp; Break-Glass Security Audit Logs</SelectItem>
                  <SelectItem value="staff-registry">Staff, Doctor &amp; Nursing Credential Registry</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
              <AlertCircle className="h-4 w-4 inline mr-1 text-amber-600" />
              All data exports are logged in the immutable audit trail with your Administrator credentials.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setExportModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleExportData}>
              Generate Encrypted Package
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading} className="gap-2">
          <Save className="h-4 w-4" /> Save Data &amp; Privacy Policies
        </Button>
      </div>
    </form>
  );
}
