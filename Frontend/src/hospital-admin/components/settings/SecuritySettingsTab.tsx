"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Shield,
  KeyRound,
  Lock,
  Smartphone,
  Globe,
  AlertTriangle,
  ExternalLink,
  LogOut,
  Save,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Switch } from "@/hospital-admin/components/ui/switch";
import { Separator } from "@/hospital-admin/components/ui/separator";
import { useToast } from "@/hospital-admin/hooks/use-toast";

export function SecuritySettingsTab() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [securityConfig, setSecurityConfig] = useState({
    enforceMfaAdmins: true,
    enforceMfaDoctors: true,
    enforceMfaBilling: true,
    sessionTimeoutMinutes: "30",
    maxFailedAttempts: "5",
    passwordExpiryDays: "90",
    enforceStrongPasswordComplexity: true,
    ipAllowlistEnabled: false,
    ipAllowlistIps: "192.168.1.0/24, 10.0.0.1/16, 203.192.45.10",
    enableBreakGlassAuditLogging: true,
    blockTorAndVpnLogins: true,
  });

  const handleChange = (key: string, value: any) => {
    setSecurityConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleRevokeOtherSessions = () => {
    toast({
      title: "All Other Sessions Revoked",
      description: "Signed out of 3 other browser devices. Current active session preserved.",
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Security Policies Updated",
        description: "Authentication rules, session limits, and access guards updated successfully.",
      });
    }, 600);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* 1. Multi-Factor Authentication (MFA / 2FA) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <KeyRound className="h-5 w-5 text-primary" /> Multi-Factor Authentication (MFA / 2FA)
            </CardTitle>
            <CardDescription className="text-xs">
              Enforce TOTP authenticator apps (Google Authenticator / Duo) across privileged hospital roles.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs font-semibold">
            <Link href="/hospital-admin/security/mfa">
              <ExternalLink className="h-3.5 w-3.5" /> Setup My MFA
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3.5">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">Enforce Mandatory 2FA for Hospital Administrators</p>
              <p className="text-xs text-muted-foreground">
                Requires time-based OTP for all accounts with super-admin and IT system configuration access.
              </p>
            </div>
            <Switch
              checked={securityConfig.enforceMfaAdmins}
              onCheckedChange={(c) => handleChange("enforceMfaAdmins", c)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3.5">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">Enforce 2FA for Medical Doctors &amp; Surgeons</p>
              <p className="text-xs text-muted-foreground">
                Protects electronic prescription digital signatures and clinical case history access.
              </p>
            </div>
            <Switch
              checked={securityConfig.enforceMfaDoctors}
              onCheckedChange={(c) => handleChange("enforceMfaDoctors", c)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3.5">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">Enforce 2FA for Billing &amp; Cashier Operators</p>
              <p className="text-xs text-muted-foreground">
                Prevents unauthorized financial discounts, payment refunds, and tax invoice edits.
              </p>
            </div>
            <Switch
              checked={securityConfig.enforceMfaBilling}
              onCheckedChange={(c) => handleChange("enforceMfaBilling", c)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. Session Inactivity & Lockout Thresholds */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Lock className="h-5 w-5 text-primary" /> Session Security &amp; Account Lockout
          </CardTitle>
          <CardDescription className="text-xs">
            Auto-lock parameters preventing unattended workstation compromise in clinical corridors.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="sessionTimeoutMinutes">Auto Sign-out Inactivity Window</Label>
              <Select
                value={securityConfig.sessionTimeoutMinutes}
                onValueChange={(v) => handleChange("sessionTimeoutMinutes", v)}
              >
                <SelectTrigger id="sessionTimeoutMinutes">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 Minutes (High Security Wards)</SelectItem>
                  <SelectItem value="30">30 Minutes (Recommended Standard)</SelectItem>
                  <SelectItem value="60">1 Hour</SelectItem>
                  <SelectItem value="240">4 Hours (Consultation Desk Only)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="maxFailedAttempts">Max Failed Login Attempts Before Lockout</Label>
              <Select
                value={securityConfig.maxFailedAttempts}
                onValueChange={(v) => handleChange("maxFailedAttempts", v)}
              >
                <SelectTrigger id="maxFailedAttempts">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Attempts (Strict)</SelectItem>
                  <SelectItem value="5">5 Attempts (Standard)</SelectItem>
                  <SelectItem value="10">10 Attempts (Relaxed)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="passwordExpiryDays">Password Rotation Expiry</Label>
              <Select
                value={securityConfig.passwordExpiryDays}
                onValueChange={(v) => handleChange("passwordExpiryDays", v)}
              >
                <SelectTrigger id="passwordExpiryDays">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="60">Every 60 Days</SelectItem>
                  <SelectItem value="90">Every 90 Days (HIPAA/NABH)</SelectItem>
                  <SelectItem value="180">Every 180 Days</SelectItem>
                  <SelectItem value="0">Never Expire</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3.5">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">Block Known Anonymizing VPNs and Tor Exit Nodes</p>
              <p className="text-xs text-muted-foreground">
                Prevents unauthorized remote logins from masked external networks.
              </p>
            </div>
            <Switch
              checked={securityConfig.blockTorAndVpnLogins}
              onCheckedChange={(c) => handleChange("blockTorAndVpnLogins", c)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 3. IP Whitelisting & Geo-Fencing */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Globe className="h-5 w-5 text-primary" /> Hospital LAN &amp; IP Allowlist Restriction
          </CardTitle>
          <CardDescription className="text-xs">
            Restricts administrative console access strictly to hospital campus intranet IP subnets.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3.5">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">Enable Static IP Allowlisting for Admin Roles</p>
              <p className="text-xs text-muted-foreground">
                Connections originating outside approved IP addresses will be blocked at the gateway.
              </p>
            </div>
            <Switch
              checked={securityConfig.ipAllowlistEnabled}
              onCheckedChange={(c) => handleChange("ipAllowlistEnabled", c)}
            />
          </div>

          {securityConfig.ipAllowlistEnabled && (
            <div className="grid gap-1.5 pt-1">
              <Label htmlFor="ipAllowlistIps">Permitted IP CIDR Blocks (comma separated)</Label>
              <Input
                id="ipAllowlistIps"
                value={securityConfig.ipAllowlistIps}
                onChange={(e) => handleChange("ipAllowlistIps", e.target.value)}
                className="font-mono text-xs"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. Emergency Break-Glass & Audit Links */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-destructive">
              <ShieldAlert className="h-4 w-4" /> Emergency Break-Glass Override Protocol
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Allows authorized doctors to bypass standard role boundaries during life-or-death resuscitations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <p className="text-muted-foreground">
              Every Break-Glass activation generates high-severity audit events and sends automated SMS alerts to the
              Chief Medical Officer.
            </p>
            <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs text-destructive border-destructive/40">
              <Link href="/hospital-admin/security/break-glass">
                <AlertTriangle className="h-3.5 w-3.5" /> View Break-Glass Protocol Console
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-primary">
              <ShieldCheck className="h-4 w-4" /> Comprehensive Immutable Audit Logging
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Server-side cryptographic logs of all user actions, patient record opens, and billing edits.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <p className="text-muted-foreground">
              Maintains complete NABH/HIPAA compliance logs with user ID, IP address, timestamp, and before/after payloads.
            </p>
            <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs text-primary border-primary/40">
              <Link href="/hospital-admin/audit-logs">
                <ExternalLink className="h-3.5 w-3.5" /> Open Full Audit Trail Logs
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleRevokeOtherSessions}
          className="gap-2 text-xs font-semibold text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-3.5 w-3.5" /> Revoke Other Sessions
        </Button>
        <Button type="submit" loading={loading} className="gap-2">
          <Save className="h-4 w-4" /> Save Security Policies
        </Button>
      </div>
    </form>
  );
}
