"use client";

import React, { useState, useEffect } from "react";
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  KeyRound,
  Lock,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Users,
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
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { SecurityNav } from "@/hospital-admin/components/security/security-nav";
import { StepUpAuthModal } from "@/hospital-admin/components/security/step-up-auth-modal";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { mockMFAPolicies } from "@/hospital-admin/lib/mock-data/security-operations";
import { MFAPolicy } from "@/hospital-admin/lib/types";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within MFA Security Policy workflow";

export default function MFASettingsPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [policies, setPolicies] = useState<MFAPolicy[]>(mockMFAPolicies);

  // Edit Policy Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<MFAPolicy | null>(null);
  const [status, setStatus] = useState<"Enforced" | "Grace Period" | "Optional">("Enforced");
  const [allowTOTP, setAllowTOTP] = useState(true);
  const [allowFIDO, setAllowFIDO] = useState(true);
  const [allowSMS, setAllowSMS] = useState(false);

  // Step-Up Challenge State
  const [stepUpOpen, setStepUpOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenEdit = (policy: MFAPolicy) => {
    setSelectedPolicy(policy);
    setStatus(policy.status);
    setAllowTOTP(policy.allowedMethods.includes("TOTP Authenticator"));
    setAllowFIDO(policy.allowedMethods.includes("FIDO2 Security Key"));
    setAllowSMS(policy.allowedMethods.includes("SMS OTP"));
    setEditModalOpen(true);
  };

  const handleProceedStepUp = (e: React.FormEvent) => {
    e.preventDefault();
    setEditModalOpen(false);
    setStepUpOpen(true);
  };

  const handleCommitMFAPolicy = (reason: string) => {
    if (!selectedPolicy) return;

    const methods: ("TOTP Authenticator" | "FIDO2 Security Key" | "SMS OTP")[] = [];
    if (allowTOTP) methods.push("TOTP Authenticator");
    if (allowFIDO) methods.push("FIDO2 Security Key");
    if (allowSMS) methods.push("SMS OTP");

    setPolicies((prev) =>
      prev.map((p) =>
        p.roleId === selectedPolicy.roleId
          ? {
              ...p,
              status,
              allowedMethods: methods,
            }
          : p
      )
    );

    toast({
      title: "MFA Policy Updated",
      description: `MFA enforcement for ${selectedPolicy.roleName} set to ${status}. Reason: "${reason}". (${DELEGATION_STRING})`,
    });
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Multi-Factor Authentication (MFA) Enforcement"
          description="Role-level mandatory MFA policies, hardware token authentication, and compliance monitoring."
          crumbs={[{ label: "Administration" }, { label: "Security", href: "/hospital-admin/roles" }, { label: "MFA Settings" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading MFA policies...
        </div>
      </div>
    );
  }

  const enforcedRolesCount = policies.filter((p) => p.status === "Enforced").length;
  const graceRolesCount = policies.filter((p) => p.status === "Grace Period").length;
  const totalEnforcedUsers = policies.reduce((acc, p) => acc + (p.status !== "Optional" ? p.enforcedUserCount : 0), 0);

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Multi-Factor Authentication (MFA) Enforcement"
        description="Role-level mandatory MFA policies, hardware token authentication, and compliance monitoring."
        crumbs={[{ label: "Administration" }, { label: "Security", href: "/hospital-admin/roles" }, { label: "MFA Settings" }]}
      />

      <SecurityNav />

      {/* Scope Indicator & PRD Rules 14-CAN-7 & 8 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Privileged Access &amp; MFA Policy Engine" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
          <span>Rules 14-CAN-7 &amp; 8: Mandatory MFA required for Hospital Admin &amp; Privileged Clinical Roles</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">MFA Enforced Roles</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{enforcedRolesCount} Roles</p>
          <span className="text-[10px] text-emerald-600 font-medium">Strict zero-bypass policy</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Grace Period Active</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{graceRolesCount} Roles</p>
          <span className="text-[10px] text-amber-600 font-medium">Auto-enforce upon countdown</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Protected Accounts</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{totalEnforcedUsers} Users</p>
          <span className="text-[10px] text-muted-foreground">Admin &amp; Clinical Staff</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Hardware FIDO2 Security</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">Active</p>
          <span className="text-[10px] text-muted-foreground">YubiKey &amp; Bio-Keys supported</span>
        </Card>
      </div>

      {/* MFA Policies Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Role-Based MFA Configuration Matrix</CardTitle>
          <CardDescription className="text-xs">
            Manage second-factor authentication requirements per privileged operational role per PRD Section 14.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold w-[220px]">Role Name</TableHead>
                  <TableHead className="text-xs font-bold w-[140px]">Policy Status</TableHead>
                  <TableHead className="text-xs font-bold w-[220px]">Allowed 2FA Methods</TableHead>
                  <TableHead className="text-xs font-bold w-[130px]">User Coverage</TableHead>
                  <TableHead className="text-xs font-bold w-[140px]">Compliance Rate</TableHead>
                  <TableHead className="text-xs font-bold text-right w-[120px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((p) => (
                  <TableRow key={p.roleId} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-semibold text-xs text-foreground">
                      <div className="flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-primary shrink-0" />
                        <span>{p.roleName}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={
                          p.status === "Enforced"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                            : p.status === "Grace Period"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                            : "text-[10px]"
                        }
                      >
                        {p.status}
                      </Badge>
                      {p.graceDaysRemaining && (
                        <span className="text-[9px] text-amber-600 block mt-0.5 font-mono">
                          {p.graceDaysRemaining}d grace left
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {p.allowedMethods.map((m, idx) => (
                          <Badge key={idx} variant="outline" className="text-[9px] bg-muted/20">
                            {m}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {p.enforcedUserCount} Active Staff
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span>{p.complianceRate}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              p.complianceRate >= 90
                                ? "bg-emerald-600"
                                : p.complianceRate >= 60
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            }`}
                            style={{ width: `${p.complianceRate}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs font-semibold text-primary hover:bg-primary/10"
                        onClick={() => handleOpenEdit(p)}
                      >
                        Configure Policy
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* MODAL: CONFIGURE MFA POLICY */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleProceedStepUp}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" /> Configure MFA: {selectedPolicy?.roleName}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Adjust multi-factor authentication enforcement and allowed cryptographic tokens.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-3 text-xs">
              <div className="grid gap-1">
                <Label htmlFor="mfa-status">Enforcement Policy State</Label>
                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                  <SelectTrigger id="mfa-status" className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Enforced">Enforced (Mandatory 2FA)</SelectItem>
                    <SelectItem value="Grace Period">Grace Period (7-Day Notice)</SelectItem>
                    <SelectItem value="Optional">Optional (Staff Preference)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <span className="font-bold text-foreground text-xs block">Allowed Second Factor Methods:</span>

                <div className="flex items-center justify-between p-2 rounded bg-muted/20 border border-border">
                  <div className="space-y-0.5">
                    <span className="font-semibold block">Authenticator App (TOTP)</span>
                    <span className="text-[10px] text-muted-foreground">Google Auth, Microsoft Auth, 1Password</span>
                  </div>
                  <Switch checked={allowTOTP} onCheckedChange={setAllowTOTP} />
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-muted/20 border border-border">
                  <div className="space-y-0.5">
                    <span className="font-semibold block">FIDO2 / WebAuthn Hardware Security Key</span>
                    <span className="text-[10px] text-muted-foreground">YubiKey, TouchID, Windows Hello</span>
                  </div>
                  <Switch checked={allowFIDO} onCheckedChange={setAllowFIDO} />
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-muted/20 border border-border">
                  <div className="space-y-0.5">
                    <span className="font-semibold block">SMS OTP Fallback</span>
                    <span className="text-[10px] text-muted-foreground">Carrier SMS (Lower security tier)</span>
                  </div>
                  <Switch checked={allowSMS} onCheckedChange={setAllowSMS} />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold">
                Proceed to Step-Up Auth
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* STEP-UP AUTH MODAL */}
      <StepUpAuthModal
        open={stepUpOpen}
        onOpenChange={setStepUpOpen}
        actionTitle="Update MFA Policy Enforcement"
        actionDescription={`Authorizing MFA security policy modification for role "${selectedPolicy?.roleName}".`}
        onConfirm={handleCommitMFAPolicy}
      />
    </div>
  );
}
