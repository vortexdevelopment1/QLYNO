"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Settings,
  ShieldCheck,
  Key,
  Radio,
  Clock,
  Save,
  CheckCircle2,
  Smartphone,
  Send,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Switch } from "@/hospital-admin/components/ui/switch";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/hospital-admin/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/hospital-admin/components/ui/select";
import { CommunicationNav } from "@/hospital-admin/components/care-coordination/communication/communication-nav";

export default function CommunicationSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [activeProvider, setActiveProvider] = useState("twilio");
  const [whatsappProvider, setWhatsappProvider] = useState("meta");
  const [dltCompliant, setDltCompliant] = useState(true);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
  const [emergencyBypass, setEmergencyBypass] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-xs font-semibold text-purple-600 dark:text-purple-400">
                Gateway Configuration
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Communication Gateways & DLT Settings
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Configure Twilio / AWS SNS / Meta WhatsApp Cloud API credentials, DLT Principal Entity headers, and failover policies.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              className="h-8 text-xs gap-1.5 bg-primary"
            >
              <Save className="h-3.5 w-3.5" />
              {saved ? "Saved Configuration!" : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <CommunicationNav
        unreadChatCount={3}
        activeBroadcastCount={1}
        pendingRemindersCount={8}
      />

      <div className="flex-1 space-y-6 p-6 max-w-5xl">
        {saved && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Gateway settings and DLT routing configuration successfully updated.
          </div>
        )}

        {/* SMS Gateway Config */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-sm font-semibold">
                    Primary SMS Gateway Configuration
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Configure transactional SMS providers for critical OTP, lab ready, and emergency SOS alerts.
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="text-emerald-600 bg-emerald-500/10 border-emerald-500/30 text-xs">
                Live & Connected
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Active SMS Provider</Label>
                <Select value={activeProvider} onValueChange={setActiveProvider}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="twilio" className="text-xs">Twilio Programmable SMS (Global/India)</SelectItem>
                    <SelectItem value="aws-sns" className="text-xs">AWS SNS (Transactional)</SelectItem>
                    <SelectItem value="msg91" className="text-xs">MSG91 Enterprise (DLT Certified)</SelectItem>
                    <SelectItem value="kaleyra" className="text-xs">Kaleyra Hospital Gateway</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Default Sender ID (Header)</Label>
                <Input defaultValue="QLYNO-HOSP" className="h-9 text-xs font-mono" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">API Account SID / Key</Label>
                <Input defaultValue="AC99482716492048591823904928" type="password" className="h-9 text-xs font-mono" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Auth Token / Secret</Label>
                <Input defaultValue="••••••••••••••••••••••••••••••••" type="password" className="h-9 text-xs font-mono" />
              </div>
            </div>

            {/* DLT Configuration */}
            <div className="border-t border-border/60 pt-4 mt-2">
              <div className="flex items-center justify-between mb-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    TRAI DLT (Distributed Ledger Technology) Compliance
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Required for India domestic telecom compliance to prevent transactional SMS drops.
                  </div>
                </div>
                <Switch checked={dltCompliant} onCheckedChange={setDltCompliant} />
              </div>

              {dltCompliant && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/20 p-3 rounded-lg border border-border/50">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Principal Entity ID (PE ID)</Label>
                    <Input defaultValue="170115829104829182" className="h-8 text-xs font-mono" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Registered Telemarketer ID (TM ID)</Label>
                    <Input defaultValue="1402159382019485" className="h-8 text-xs font-mono" />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Cloud API */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-emerald-600" />
                <div>
                  <CardTitle className="text-sm font-semibold">
                    WhatsApp Business Cloud API
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Meta Official Cloud API connection for 2-way patient conversations & rich media reports.
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="text-emerald-600 bg-emerald-500/10 border-emerald-500/30 text-xs">
                Green Badge Verified
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Meta WhatsApp Phone Number ID</Label>
                <Input defaultValue="109283746192847" className="h-9 text-xs font-mono" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">WhatsApp Business Account ID (WABA)</Label>
                <Input defaultValue="982374619283746" className="h-9 text-xs font-mono" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Permanent System User Access Token</Label>
                <Input defaultValue="EAAGm0PX4ZC0IBO••••••••••••••••••••••••••••" type="password" className="h-9 text-xs font-mono" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Webhook Verify Token</Label>
                <Input defaultValue="qlyno_webhook_secret_secure_99" className="h-9 text-xs font-mono" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Policy & Quiet Hours */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <div>
                <CardTitle className="text-sm font-semibold">
                  Delivery Policy, Rate Limiting & Quiet Hours
                </CardTitle>
                <CardDescription className="text-xs">
                  Govern non-urgent broadcast times and emergency SOS priority overrides.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold">Quiet Hours (21:30 - 07:00)</div>
                <div className="text-[11px] text-muted-foreground">
                  Holds general marketing and non-critical appointment reminders until 07:00 next morning.
                </div>
              </div>
              <Switch checked={quietHoursEnabled} onCheckedChange={setQuietHoursEnabled} />
            </div>

            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-red-600 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Emergency SOS & Critical Vitals Immediate Bypass
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Bypasses quiet hours, rate limits, and DND filters for CODE RED, SOS, and critical lab panic values.
                </div>
              </div>
              <Switch checked={emergencyBypass} onCheckedChange={setEmergencyBypass} />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold">Auto-Failover to SMS</div>
                <div className="text-[11px] text-muted-foreground">
                  If WhatsApp delivery fails after 30 seconds, automatically re-dispatch payload as DLT-approved SMS.
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
