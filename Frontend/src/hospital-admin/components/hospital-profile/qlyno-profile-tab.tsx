"use client";

import React from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import { updateQlynoSettings } from "@/hospital-admin/store/slices/hospitalProfileSlice";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import {
  Globe,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Activity,
  Zap,
  Lock,
  AlertTriangle,
  ArrowRight,
  Info,
  Radio,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Label } from "@/hospital-admin/components/ui/label";
import { Button } from "@/hospital-admin/components/ui/button";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Switch } from "@/hospital-admin/components/ui/switch";

export function QlynoProfileTab() {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const qlynoSettings = useSelector((state: RootState) => state.hospitalProfile.qlynoSettings);

  const isVerified = qlynoSettings.verificationStatus === "Verified";

  const handleToggleNetwork = (checked: boolean) => {
    dispatch(updateQlynoSettings({ networkParticipation: checked }));
    toast({
      title: "Network Participation Updated",
      description: checked
        ? "Hospital enabled for Qlyno healthcare network syndication."
        : "Hospital disabled from network syndication.",
    });
  };

  const handleToggleEmergencySignal = (checked: boolean) => {
    dispatch(updateQlynoSettings({ emergencyCapacitySignalEnabled: checked }));
    toast({
      title: "Emergency Capacity Signal Configured (Proposed Feature)",
      description: checked
        ? "Live emergency bed availability signal broadcasting enabled (PDF Module 22 proposed standard)."
        : "Emergency capacity signal broadcasting disabled.",
    });
  };

  const handleToggleServiceAvailability = (checked: boolean) => {
    dispatch(updateQlynoSettings({ serviceAvailabilityPublished: checked }));
    toast({
      title: "Service Availability Publishing Configured (Proposed Feature)",
      description: checked
        ? "Real-time doctor appointment and diagnostic slot availability publishing enabled."
        : "Service availability publishing disabled.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Read-Only Verification Standing Card (F24 CANNOT #4, #10, Dep Rule #1) */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-3 border-b border-border/80">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Globe className="h-4 w-4 text-primary" />
                Qlyno Platform Integration &amp; Public Indexation Standing
              </CardTitle>
              <CardDescription className="text-xs">
                Public search visibility is governed strictly by Module 13 Verification and the Rule 13.1 Data Scrubbing Protocol.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/hospital-admin/verification">
                <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 border-primary/30 text-primary">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Module 13 Verification Center</span>
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Verification Gate Card */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Platform Verification Status
                </span>
                {isVerified ? (
                  <Badge className="bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs gap-1 font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Verified Institution
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-700 bg-amber-500/10 border-amber-500/30 text-xs gap-1">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    {qlynoSettings.verificationStatus}
                  </Badge>
                )}
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  Current Verification Gate: <strong className="text-foreground">{qlynoSettings.verificationStatus}</strong>
                </p>
                {qlynoSettings.lastVerifiedDate && (
                  <p className="text-[11px] font-mono">Last Certified: {qlynoSettings.lastVerifiedDate}</p>
                )}
              </div>

              <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/60">
                Managed strictly by platform credentialing reviewers in Module 13. This flag cannot be toggled directly from the Hospital Profile module.
              </p>
            </div>

            {/* Public Search Visibility Indexation Card */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Public Search Visibility Status
                </span>
                <Badge
                  className={
                    isVerified
                      ? "bg-primary/10 text-primary border-primary/20 text-xs font-semibold"
                      : "bg-muted text-muted-foreground text-xs"
                  }
                >
                  <Lock className="h-3 w-3 mr-1" />
                  {isVerified ? "Live / Searchable" : "Draft Only"}
                </Badge>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  Patient Search Engine Indexation: <strong className="text-foreground">{qlynoSettings.publicSearchVisibility}</strong>
                </p>
                <p className="text-[11px]">
                  {isVerified
                    ? "Sanitized public profile, verified doctor roster, and booking widgets active on Qlyno.com."
                    : "Public access withheld until all compliance criteria reach Verified state."}
                </p>
              </div>

              <div className="pt-1 border-t border-border/60 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Sanitization Gate: Rule 13.1 Active</span>
                <Link href="/hospital-admin/verification/public-preview">
                  <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1 text-primary p-1">
                    <span>Preview Live Card</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Participation & Proposed Signal Publishing Toggles */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-3 border-b border-border/80">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
            <Radio className="h-4 w-4 text-primary" />
            Platform Network &amp; Telemetry Signal Configuration
          </CardTitle>
          <CardDescription className="text-xs">
            Configure integration settings and opt into proposed platform features.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 space-y-4 text-xs">
          {/* Toggle 1: Qlyno Network Participation */}
          <div className="p-3.5 rounded-xl border border-border bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="network-participation" className="text-xs font-bold text-foreground cursor-pointer">
                  Qlyno Healthcare Network Syndication
                </Label>
                <Badge variant="outline" className="text-[9px] font-mono">
                  Production Standard
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Allows verified doctor bios, department specialties, and facility highlights to syndicate across the regional healthcare provider registry.
              </p>
            </div>

            <Switch
              id="network-participation"
              checked={qlynoSettings.networkParticipation}
              onCheckedChange={handleToggleNetwork}
            />
          </div>

          {/* Toggle 2: Emergency Capacity Signal (Proposed Feature — PDF Module 22) */}
          <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Label htmlFor="emergency-signal" className="text-xs font-bold text-amber-950 dark:text-amber-200 cursor-pointer flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-amber-600" />
                  Live Emergency Capacity Signal Publishing
                </Label>
                <Badge className="bg-amber-500/20 text-amber-900 dark:text-amber-300 border-amber-500/40 text-[9px] font-semibold gap-1">
                  <Sparkles className="h-2.5 w-2.5" /> Proposed Feature — PDF Module 22
                </Badge>
              </div>
              <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80">
                Broadcasting dynamic ER resuscitation bay load and ICU bed availability signals to city-wide 108 emergency dispatchers. Flagged as proposed specification per <code className="font-mono">22-rules-proposed-features.md</code>.
              </p>
            </div>

            <Switch
              id="emergency-signal"
              checked={qlynoSettings.emergencyCapacitySignalEnabled}
              onCheckedChange={handleToggleEmergencySignal}
            />
          </div>

          {/* Toggle 3: Hospital Service Availability (Proposed Feature — PDF Module 22) */}
          <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Label htmlFor="service-availability" className="text-xs font-bold text-amber-950 dark:text-amber-200 cursor-pointer flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-600" />
                  Real-Time Clinical Service Availability Publishing
                </Label>
                <Badge className="bg-amber-500/20 text-amber-900 dark:text-amber-300 border-amber-500/40 text-[9px] font-semibold gap-1">
                  <Sparkles className="h-2.5 w-2.5" /> Proposed Feature — PDF Module 22
                </Badge>
              </div>
              <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80">
                Publishing real-time OPD token availability, CT/MRI diagnostic same-day slot wait times, and elective OT scheduling readiness to patient apps.
              </p>
            </div>

            <Switch
              id="service-availability"
              checked={qlynoSettings.serviceAvailabilityPublished}
              onCheckedChange={handleToggleServiceAvailability}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
