"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Video,
  AlertCircle,
  Sliders,
  Shield,
  Save,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Users,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Switch } from "@/hospital-admin/components/ui/switch";
import { useToast } from "@/hospital-admin/hooks/use-toast";

export function AppointmentSettingsTab() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState({
    defaultSlotDuration: "15",
    advanceBookingDays: "30",
    maxDailyAppointmentsPerDoctor: "40",
    sameDayBookingCutoffHours: "2",
    queueStrategy: "token-priority",
    allowWalkInOverbooking: true,
    overbookingLimitPercent: "15",
    freeCancellationWindowHours: "4",
    lateCancellationFeePercent: "50",
    autoRefundCancelledSlots: true,
    enableTeleconsultation: true,
    autoSendVideoLinkWhatsapp: true,
    requirePreConsultationVitals: true,
    enableTokenDisplayScreen: true,
  });

  const handleChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Appointment Configuration Saved",
        description: "Slot timings, queue rules, and teleconsultation policies have been updated.",
      });
    }, 600);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* 1. Slot & Booking Capacity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Clock className="h-5 w-5 text-primary" /> OPD Slot Durations & Booking Horizon
            </CardTitle>
            <CardDescription className="text-xs">
              Configure standard consultation time intervals and online patient reservation limits.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs font-semibold">
            <Link href="/hospital-admin/appointments">
              <ExternalLink className="h-3.5 w-3.5" /> Live OPD Appointments
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="defaultSlotDuration">Default Consultation Slot</Label>
              <Select
                value={settings.defaultSlotDuration}
                onValueChange={(val) => handleChange("defaultSlotDuration", val)}
              >
                <SelectTrigger id="defaultSlotDuration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 Minutes (Express OPD)</SelectItem>
                  <SelectItem value="15">15 Minutes (Standard Clinical)</SelectItem>
                  <SelectItem value="20">20 Minutes (Comprehensive)</SelectItem>
                  <SelectItem value="30">30 Minutes (Specialist / Super-specialty)</SelectItem>
                  <SelectItem value="45">45 Minutes (Psychiatry / Therapy)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="advanceBookingDays">Max Advance Booking Horizon (Days)</Label>
              <Input
                id="advanceBookingDays"
                type="number"
                min={1}
                max={90}
                value={settings.advanceBookingDays}
                onChange={(e) => handleChange("advanceBookingDays", e.target.value)}
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="maxDailyAppointmentsPerDoctor">Max Appointments Per Doctor / Shift</Label>
              <Input
                id="maxDailyAppointmentsPerDoctor"
                type="number"
                min={5}
                max={150}
                value={settings.maxDailyAppointmentsPerDoctor}
                onChange={(e) => handleChange("maxDailyAppointmentsPerDoctor", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="sameDayBookingCutoffHours">Same-Day Booking Cutoff (Hours Before Slot)</Label>
              <Input
                id="sameDayBookingCutoffHours"
                type="number"
                min={0}
                max={12}
                value={settings.sameDayBookingCutoffHours}
                onChange={(e) => handleChange("sameDayBookingCutoffHours", e.target.value)}
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="queueStrategy">Queue Dispatch Strategy</Label>
              <Select
                value={settings.queueStrategy}
                onValueChange={(val) => handleChange("queueStrategy", val)}
              >
                <SelectTrigger id="queueStrategy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="token-priority">Sequential Token (First-Come-First-Serve)</SelectItem>
                  <SelectItem value="time-slot">Strict Time-Slot Window</SelectItem>
                  <SelectItem value="emergency-first">Dynamic Clinical Triage (Urgent &amp; Elderly First)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Walk-in & Overbooking Rules */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Sliders className="h-5 w-5 text-primary" /> Walk-in Overbooking & Triage Rules
          </CardTitle>
          <CardDescription className="text-xs">
            Manage reception desk walk-in surge allowance and digital waiting room displays.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3.5">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">Allow Walk-in Counter Overbooking</p>
              <p className="text-xs text-muted-foreground">
                Permits front desk staff to issue additional tokens when a doctor's scheduled slots are full.
              </p>
            </div>
            <Switch
              checked={settings.allowWalkInOverbooking}
              onCheckedChange={(c) => handleChange("allowWalkInOverbooking", c)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3.5">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">Live Waiting Area Token Display Screen</p>
              <p className="text-xs text-muted-foreground">
                Syncs real-time calling queue to waiting room TV monitors and audio announcement chime.
              </p>
            </div>
            <Switch
              checked={settings.enableTokenDisplayScreen}
              onCheckedChange={(c) => handleChange("enableTokenDisplayScreen", c)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3.5">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">Pre-Consultation Nurse Vitals Mandatory</p>
              <p className="text-xs text-muted-foreground">
                Requires Nurse Station to record BP, Pulse, Temp, and SpO2 before doctor opens consultation chart.
              </p>
            </div>
            <Switch
              checked={settings.requirePreConsultationVitals}
              onCheckedChange={(c) => handleChange("requirePreConsultationVitals", c)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 3. Cancellation, Rescheduling & Refund */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Shield className="h-5 w-5 text-primary" /> Cancellation, Reschedule &amp; Refund Policy
          </CardTitle>
          <CardDescription className="text-xs">
            Automated financial and rescheduling policies applied when a patient or hospital cancels.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="freeCancellationWindowHours">Free Cancellation Window (Hours Before Slot)</Label>
              <Input
                id="freeCancellationWindowHours"
                type="number"
                min={0}
                max={48}
                value={settings.freeCancellationWindowHours}
                onChange={(e) => handleChange("freeCancellationWindowHours", e.target.value)}
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="lateCancellationFeePercent">Late Cancellation Deduction (%)</Label>
              <Input
                id="lateCancellationFeePercent"
                type="number"
                min={0}
                max={100}
                value={settings.lateCancellationFeePercent}
                onChange={(e) => handleChange("lateCancellationFeePercent", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3.5">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">Automated Instant Refund to Source Account</p>
              <p className="text-xs text-muted-foreground">
                Instantly credits patient via UPI/PG gateway when appointment is cancelled within free window.
              </p>
            </div>
            <Switch
              checked={settings.autoRefundCancelledSlots}
              onCheckedChange={(c) => handleChange("autoRefundCancelledSlots", c)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 4. Virtual Care & Teleconsultation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Video className="h-5 w-5 text-primary" /> Teleconsultation &amp; Virtual OPD Visits
          </CardTitle>
          <CardDescription className="text-xs">
            Secure browser-based video visits and WhatsApp meeting link delivery for remote patients.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3.5">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">Enable Video Teleconsultation Module</p>
              <p className="text-xs text-muted-foreground">
                Allows doctors to host encrypted video consults with integrated prescription pad.
              </p>
            </div>
            <Switch
              checked={settings.enableTeleconsultation}
              onCheckedChange={(c) => handleChange("enableTeleconsultation", c)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3.5">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">Auto-Send Video Link via WhatsApp &amp; SMS</p>
              <p className="text-xs text-muted-foreground">
                Dispatches secure 1-click joining link 15 minutes before the scheduled time.
              </p>
            </div>
            <Switch
              checked={settings.autoSendVideoLinkWhatsapp}
              onCheckedChange={(c) => handleChange("autoSendVideoLinkWhatsapp", c)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading} className="gap-2">
          <Save className="h-4 w-4" /> Save Appointment Settings
        </Button>
      </div>
    </form>
  );
}
