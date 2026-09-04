"use client";

import React, { useState, useEffect } from "react";
import {
  AlertOctagon,
  AlertTriangle,
  Archive,
  CheckCircle2,
  Clock,
  Database,
  Download,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Globe,
  HardDriveDownload,
  KeyRound,
  Lock,
  Plus,
  RefreshCw,
  Search,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Upload,
  UserCheck,
  Zap,
} from "lucide-react";

import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/hospital-admin/components/ui/select";
import { Switch } from "@/hospital-admin/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/hospital-admin/components/ui/tabs";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { SecurityNav } from "@/hospital-admin/components/security/security-nav";
import { StepUpAuthModal } from "@/hospital-admin/components/security/step-up-auth-modal";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { formatDateTime, formatDate } from "@/hospital-admin/lib/utils";
import {
  mockDocumentSecurityPolicies,
  mockPrivacyConsentRecords,
  mockConfigBackupSnapshots,
} from "@/hospital-admin/lib/mock-data/security-operations";
import {
  DocumentSecurityPolicy,
  PrivacyConsentRecord,
  ConfigBackupSnapshot,
} from "@/hospital-admin/lib/types";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Privacy & Document Security workflow";

export default function DocumentPrivacySecurityPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("docs");
  const [docPolicies, setDocPolicies] = useState<DocumentSecurityPolicy[]>(mockDocumentSecurityPolicies);
  const [consents, setConsents] = useState<PrivacyConsentRecord[]>(mockPrivacyConsentRecords);
  const [backups, setBackups] = useState<ConfigBackupSnapshot[]>(mockConfigBackupSnapshots);

  // Backup Snapshot Modal State
  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [backupTitle, setBackupTitle] = useState("Hospital Master Configuration & RBAC Snapshot");
  const [backupType, setBackupType] = useState<any>("Full System Configuration");

  // Step-Up Auth State
  const [stepUpOpen, setStepUpOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggleWatermark = (id: string) => {
    setDocPolicies((prev) =>
      prev.map((p) => (p.id === id ? { ...p, watermarkingEnforced: !p.watermarkingEnforced } : p))
    );
    toast({
      title: "Document Security Policy Updated",
      description: "Digital forensic watermarking configuration updated.",
    });
  };

  const handleOpenCreateBackup = () => {
    setBackupModalOpen(true);
  };

  const handleProceedToStepUpBackup = (e: React.FormEvent) => {
    e.preventDefault();
    setBackupModalOpen(false);
    setStepUpOpen(true);
  };

  const handleCommitBackupSnapshot = (reason: string) => {
    const newSnap: ConfigBackupSnapshot = {
      id: `snap_${Date.now()}`,
      snapshotName: backupTitle,
      type: backupType,
      createdAt: new Date().toISOString(),
      createdBy: "Akash Sharma (Hospital Admin)",
      fileSize: "16.8 MB",
      checksum: `SHA256: ${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      status: "Encrypted & Verified",
    };

    setBackups((prev) => [newSnap, ...prev]);

    toast({
      title: "Encrypted Snapshot Generated",
      description: `Created snapshot: ${newSnap.snapshotName}. Checksum verified. (${DELEGATION_STRING})`,
    });
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Document Security, Data Privacy &amp; Backup Vault"
          description="Permission-gated document downloads, patient consent registry, and disaster recovery configuration snapshots."
          crumbs={[{ label: "Administration" }, { label: "Security", href: "/hospital-admin/roles" }, { label: "Document & Privacy" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading privacy settings...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Document Security, Data Privacy &amp; Backup Vault"
        description="Permission-gated document downloads, patient consent registry, and disaster recovery configuration snapshots."
        crumbs={[{ label: "Administration" }, { label: "Security", href: "/hospital-admin/roles" }, { label: "Document & Privacy" }]}
        actions={
          <Button
            size="sm"
            className="gap-1.5 font-semibold text-xs bg-primary text-primary-foreground"
            onClick={handleOpenCreateBackup}
          >
            <Database className="h-4 w-4" /> Create Encrypted Snapshot
          </Button>
        }
      />

      <SecurityNav />

      {/* Scope Indicator & Rules 14-CAN-26 to 34 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Privacy &amp; Cryptographic Storage Vault" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Rules 14-CAN-26 to 34: Strict permission-gated downloads + immutable backup controls</span>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 max-w-md">
          <TabsTrigger value="docs" className="text-xs">Document Security</TabsTrigger>
          <TabsTrigger value="consent" className="text-xs">Patient Consent</TabsTrigger>
          <TabsTrigger value="backups" className="text-xs">Backup &amp; Recovery</TabsTrigger>
        </TabsList>

        {/* TAB 1: DOCUMENT SECURITY & DOWNLOAD GATES */}
        <TabsContent value="docs" className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Document Access &amp; Export Control Gates</CardTitle>
              <CardDescription className="text-xs">
                Configure role-based view, download, and external share permissions per clinical document classification.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-bold w-[240px]">Document Classification</TableHead>
                      <TableHead className="text-xs font-bold w-[180px]">View Permissions</TableHead>
                      <TableHead className="text-xs font-bold w-[180px]">Download Permissions</TableHead>
                      <TableHead className="text-xs font-bold w-[160px]">Share Permissions</TableHead>
                      <TableHead className="text-xs font-bold text-center w-[120px]">Watermark</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {docPolicies.map((p) => (
                      <TableRow key={p.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="font-semibold text-xs text-foreground flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary shrink-0" />
                            <span>{p.documentCategory}</span>
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5 space-y-0.5">
                            {p.redactionRules.map((r, idx) => (
                              <div key={idx}>• {r}</div>
                            ))}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {p.viewPermission.map((role, idx) => (
                              <Badge key={idx} variant="outline" className="text-[9px] bg-muted/20">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {p.downloadPermission.map((role, idx) => (
                              <Badge key={idx} className="bg-primary/10 text-primary border-primary/20 text-[9px]">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {p.sharePermission.map((role, idx) => (
                              <Badge key={idx} className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[9px]">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>

                        <TableCell className="text-center">
                          <Switch
                            checked={p.watermarkingEnforced}
                            onCheckedChange={() => handleToggleWatermark(p.id)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: CROSS-ORGANIZATION PATIENT CONSENT */}
        <TabsContent value="consent" className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Cross-Organization Patient Consent Registry</CardTitle>
              <CardDescription className="text-xs">
                Enforce patient sharing and consent rules for cross-hospital records and Ayushman Bharat (ABHA) ecosystem.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-bold w-[180px]">Patient Name &amp; ID</TableHead>
                      <TableHead className="text-xs font-bold w-[220px]">External Organization</TableHead>
                      <TableHead className="text-xs font-bold w-[220px]">Authorized Clinical Purpose</TableHead>
                      <TableHead className="text-xs font-bold w-[160px]">Minimization Tier</TableHead>
                      <TableHead className="text-xs font-bold w-[120px]">Status</TableHead>
                      <TableHead className="text-xs font-bold text-right w-[120px]">Validity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consents.map((c) => (
                      <TableRow key={c.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="font-semibold text-xs text-foreground">{c.patientName}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{c.patientId}</div>
                        </TableCell>

                        <TableCell className="text-xs font-medium text-foreground">
                          {c.externalOrgName}
                        </TableCell>

                        <TableCell className="text-xs text-muted-foreground">
                          {c.purpose}
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {c.dataMinimizationTier}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={
                              c.consentStatus === "Granted"
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                                : "bg-muted text-muted-foreground text-[10px]"
                            }
                          >
                            {c.consentStatus}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right font-mono text-xs text-muted-foreground">
                          {c.validUntil}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: CONFIGURATION & AUDIT BACKUP SNAPSHOTS */}
        <TabsContent value="backups" className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Disaster Recovery &amp; Configuration Vault</CardTitle>
              <CardDescription className="text-xs">
                Enforces Rules 14-CAN-33 &amp; 34: Cryptographically signed backups of hospital configuration and immutable audit data.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-bold w-[260px]">Snapshot Description</TableHead>
                      <TableHead className="text-xs font-bold w-[180px]">Snapshot Type</TableHead>
                      <TableHead className="text-xs font-bold w-[140px]">Created Timestamp</TableHead>
                      <TableHead className="text-xs font-bold w-[100px]">File Size</TableHead>
                      <TableHead className="text-xs font-bold w-[160px]">SHA-256 Checksum</TableHead>
                      <TableHead className="text-xs font-bold text-right w-[120px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backups.map((b) => (
                      <TableRow key={b.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="font-semibold text-xs text-foreground flex items-center gap-2">
                            <Database className="h-4 w-4 text-primary shrink-0" />
                            <span>{b.snapshotName}</span>
                          </div>
                          <div className="text-[10px] text-muted-foreground">Created by: {b.createdBy}</div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {b.type}
                          </Badge>
                        </TableCell>

                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {formatDateTime(b.createdAt)}
                        </TableCell>

                        <TableCell className="font-mono text-xs font-semibold">
                          {b.fileSize}
                        </TableCell>

                        <TableCell className="font-mono text-[10px] text-muted-foreground truncate max-w-[150px]">
                          {b.checksum}
                        </TableCell>

                        <TableCell className="text-right">
                          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] gap-1">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Verified
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MODAL: CREATE BACKUP SNAPSHOT */}
      <Dialog open={backupModalOpen} onOpenChange={setBackupModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleProceedToStepUpBackup}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" /> Create Encrypted Configuration Snapshot
              </DialogTitle>
              <DialogDescription className="text-xs">
                Rules 14-CAN-33 &amp; 34: Generate a cryptographic backup of system configuration and audit datasets.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-3 text-xs">
              <div className="grid gap-1">
                <Label htmlFor="bk-title">Snapshot Label *</Label>
                <Input
                  id="bk-title"
                  required
                  value={backupTitle}
                  onChange={(e) => setBackupTitle(e.target.value)}
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="bk-type">Backup Scope</Label>
                <Select value={backupType} onValueChange={setBackupType}>
                  <SelectTrigger id="bk-type" className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full System Configuration">Full System Configuration</SelectItem>
                    <SelectItem value="RBAC & Role Definitions">RBAC & Role Definitions</SelectItem>
                    <SelectItem value="Audit Log Archive">Audit Log Archive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setBackupModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold">
                Proceed to Step-Up PIN
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* STEP-UP AUTH MODAL */}
      <StepUpAuthModal
        open={stepUpOpen}
        onOpenChange={setStepUpOpen}
        actionTitle="Authorize Configuration Snapshot Creation"
        actionDescription={`Creating an encrypted archive snapshot "${backupTitle}".`}
        onConfirm={handleCommitBackupSnapshot}
      />
    </div>
  );
}
