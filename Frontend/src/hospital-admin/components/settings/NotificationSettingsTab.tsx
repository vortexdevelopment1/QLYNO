"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  MessageSquare,
  Mail,
  Smartphone,
  Radio,
  Send,
  CheckCircle2,
  Save,
  AlertCircle,
  ExternalLink,
  Zap,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Switch } from "@/hospital-admin/components/ui/switch";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { useToast } from "@/hospital-admin/hooks/use-toast";

interface NotificationRule {
  id: string;
  category: "Clinical" | "Patient" | "Billing" | "Operations";
  event: string;
  description: string;
  sms: boolean;
  whatsapp: boolean;
  email: boolean;
  inApp: boolean;
}

const initialRules: NotificationRule[] = [
  {
    id: "notif-1",
    category: "Patient",
    event: "Appointment Confirmation & Token Info",
    description: "Sent immediately when an appointment is booked online or at the reception desk.",
    sms: true,
    whatsapp: true,
    email: true,
    inApp: true,
  },
  {
    id: "notif-2",
    category: "Patient",
    event: "2-Hour Advance Appointment Reminder",
    description: "Automated reminder with token tracking link and doctor room number.",
    sms: true,
    whatsapp: true,
    email: false,
    inApp: false,
  },
  {
    id: "notif-3",
    category: "Clinical",
    event: "Diagnostic & Lab Reports Ready",
    description: "Notifies patient and ordering physician with secure PDF download link.",
    sms: true,
    whatsapp: true,
    email: true,
    inApp: true,
  },
  {
    id: "notif-4",
    category: "Clinical",
    event: "Critical Value Panic Alert (Lab / Radiology)",
    description: "High-priority sound/visual alert directly dispatched to on-duty doctor and ICU lead.",
    sms: true,
    whatsapp: true,
    email: false,
    inApp: true,
  },
  {
    id: "notif-5",
    category: "Billing",
    event: "Inpatient Bill Settlement & Payment Receipt",
    description: "Dispatched upon payment clearance with formal digital GST invoice.",
    sms: true,
    whatsapp: true,
    email: true,
    inApp: true,
  },
  {
    id: "notif-6",
    category: "Operations",
    event: "Emergency Code Blue / Trauma SOS Dispatch",
    description: "Multi-channel broadcast to the resuscitation team and emergency OT room.",
    sms: true,
    whatsapp: true,
    email: false,
    inApp: true,
  },
  {
    id: "notif-7",
    category: "Operations",
    event: "Nursing Shift Handover & Roster Gap Alert",
    description: "Alerts Nurse Station in-charge when minimum ward staffing ratio is breached.",
    sms: false,
    whatsapp: true,
    email: true,
    inApp: true,
  },
];

export function NotificationSettingsTab() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [rules, setRules] = useState<NotificationRule[]>(initialRules);

  const [gatewayConfig, setGatewayConfig] = useState({
    smsSenderId: "QLYNO",
    whatsappNumber: "+91 98200 12345",
    smtpSenderEmail: "no-reply@qlyno.health",
    smsBalance: "8,450",
    whatsappStatus: "Connected (Meta Business API)",
  });

  const toggleChannel = (ruleId: string, channel: "sms" | "whatsapp" | "email" | "inApp") => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id === ruleId) {
          const updated = { ...r, [channel]: !r[channel] };
          return updated;
        }
        return r;
      })
    );
  };

  const handleSendTestNotification = () => {
    toast({
      title: "Test Broadcast Dispatched",
      description: "Sample test alert sent successfully across WhatsApp, SMS, and In-App channels.",
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Notification Matrix Updated",
        description: "All automated dispatch rules and gateway configurations saved successfully.",
      });
    }, 600);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* 1. Gateway Status & API Connections */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4 border-border bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold">SMS Gateway</span>
            </div>
            <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-500/10 border-emerald-500/30">
              Active
            </Badge>
          </div>
          <p className="mt-2 text-xl font-bold font-mono text-foreground">{gatewayConfig.smsBalance}</p>
          <p className="text-[11px] text-muted-foreground">Credits Remaining · DLT Sender: {gatewayConfig.smsSenderId}</p>
        </Card>

        <Card className="p-4 border-border bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-semibold">WhatsApp Cloud API</span>
            </div>
            <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-500/10 border-emerald-500/30">
              Verified
            </Badge>
          </div>
          <p className="mt-2 text-sm font-semibold font-mono text-foreground">{gatewayConfig.whatsappNumber}</p>
          <p className="text-[11px] text-muted-foreground">{gatewayConfig.whatsappStatus}</p>
        </Card>

        <Card className="p-4 border-border bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-semibold">SMTP Transactional Email</span>
            </div>
            <Badge variant="outline" className="text-[10px] text-blue-600 bg-blue-500/10 border-blue-500/30">
              Healthy
            </Badge>
          </div>
          <p className="mt-2 text-sm font-semibold text-foreground truncate">{gatewayConfig.smtpSenderEmail}</p>
          <p className="text-[11px] text-muted-foreground">TLS 1.3 · High Deliverability</p>
        </Card>
      </div>

      {/* 2. Automated Event Dispatch Matrix */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Bell className="h-5 w-5 text-primary" /> Multi-Channel Notification Matrix
            </CardTitle>
            <CardDescription className="text-xs">
              Configure which communication channels fire for clinical, patient, billing, and operational triggers.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSendTestNotification}
            className="gap-1.5 text-xs font-semibold"
          >
            <Send className="h-3.5 w-3.5" /> Send Test Alert
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-12 bg-muted/40 p-3 text-xs font-bold text-muted-foreground">
              <div className="col-span-12 sm:col-span-6">Trigger Event &amp; Scope</div>
              <div className="hidden sm:grid sm:col-span-6 grid-cols-4 text-center">
                <span>SMS</span>
                <span>WhatsApp</span>
                <span>Email</span>
                <span>In-App</span>
              </div>
            </div>

            {/* Matrix rows */}
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="grid grid-cols-12 items-center p-3.5 hover:bg-muted/20 transition-colors gap-2 sm:gap-0"
              >
                <div className="col-span-12 sm:col-span-6 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">{rule.event}</span>
                    <Badge
                      variant="outline"
                      className={
                        rule.category === "Clinical"
                          ? "text-[9px] text-purple-600 border-purple-500/30"
                          : rule.category === "Patient"
                          ? "text-[9px] text-blue-600 border-blue-500/30"
                          : rule.category === "Billing"
                          ? "text-[9px] text-amber-600 border-amber-500/30"
                          : "text-[9px] text-emerald-600 border-emerald-500/30"
                      }
                    >
                      {rule.category}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{rule.description}</p>
                </div>

                <div className="col-span-12 sm:col-span-6 grid grid-cols-4 items-center text-center pt-2 sm:pt-0">
                  <div className="flex flex-col items-center gap-1 sm:block">
                    <span className="sm:hidden text-[10px] text-muted-foreground">SMS</span>
                    <Switch
                      checked={rule.sms}
                      onCheckedChange={() => toggleChannel(rule.id, "sms")}
                    />
                  </div>
                  <div className="flex flex-col items-center gap-1 sm:block">
                    <span className="sm:hidden text-[10px] text-muted-foreground">WhatsApp</span>
                    <Switch
                      checked={rule.whatsapp}
                      onCheckedChange={() => toggleChannel(rule.id, "whatsapp")}
                    />
                  </div>
                  <div className="flex flex-col items-center gap-1 sm:block">
                    <span className="sm:hidden text-[10px] text-muted-foreground">Email</span>
                    <Switch
                      checked={rule.email}
                      onCheckedChange={() => toggleChannel(rule.id, "email")}
                    />
                  </div>
                  <div className="flex flex-col items-center gap-1 sm:block">
                    <span className="sm:hidden text-[10px] text-muted-foreground">In-App</span>
                    <Switch
                      checked={rule.inApp}
                      onCheckedChange={() => toggleChannel(rule.id, "inApp")}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading} className="gap-2">
          <Save className="h-4 w-4" /> Save Notification Settings
        </Button>
      </div>
    </form>
  );
}
