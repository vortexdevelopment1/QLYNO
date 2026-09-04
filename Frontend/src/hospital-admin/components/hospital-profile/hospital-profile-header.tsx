"use client";

import React from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import { acknowledgeMaterialChangeReview } from "@/hospital-admin/store/slices/hospitalProfileSlice";
import {
  Building2,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent } from "@/hospital-admin/components/ui/card";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";

export function HospitalProfileHeader() {
  const dispatch = useDispatch();
  const profileState = useSelector((state: RootState) => state.hospitalProfile);
  const { basicInfo, qlynoSettings, materialChangesPending, materialChangeLogs, lastUpdatedAt } = profileState;

  const isVerified = qlynoSettings.verificationStatus === "Verified";

  return (
    <div className="space-y-4">
      <PageHeader
        title="Hospital Profile & Public Branding"
        description="Editable draft & curation workstation for public identity, featured clinical specialties, verified doctors, operational infrastructure, and Qlyno platform settings."
        crumbs={[{ label: "Hospital Growth" }, { label: "Hospital Profile" }]}
      />

      {/* Main Top Banner Card */}
      <Card className="border-border shadow-xs bg-linear-to-r from-card via-card to-primary/5">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                    {basicInfo.hospitalName}
                  </h2>
                  {isVerified ? (
                    <Badge className="bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Qlyno Verified Institution
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-700 bg-amber-500/10 border-amber-500/30 text-[10px] gap-1">
                      <Clock className="h-3 w-3" /> Draft Only — Verification Incomplete
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {basicInfo.hospitalType}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{basicInfo.tagline}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground pt-0.5 font-mono">
                  <span>Reg: <strong className="text-foreground">{basicInfo.registrationNumber}</strong></span>
                  <span>Est: <strong className="text-foreground">{basicInfo.establishedYear}</strong></span>
                  <span>Campus: <strong className="text-foreground" suppressHydrationWarning>{basicInfo.totalCampusAreaSqFt.toLocaleString("en-US")} sq.ft</strong></span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
              <Link href="/hospital-admin/verification/public-preview">
                <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10">
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Public Preview Workstation</span>
                </Button>
              </Link>
              <Link href="/hospital-admin/verification">
                <Button size="sm" className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Module 13 Verification Gate</span>
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Material Change Review Trigger Banner (F24 CANNOT #7, Dep Rule #6) */}
      {materialChangesPending && (
        <Card className="border-amber-500/40 bg-amber-500/10 shadow-xs animate-fade-in">
          <CardContent className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2 text-amber-900 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs">
                  Material Identity Changes Detected — Re-Triggering Module 13 Review
                </p>
                <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80">
                  Core identity details (legal name, registration number, or tier) have been edited. Per Rule 13.1, these modifications remain in draft mode until re-verified by platform compliance auditors.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/hospital-admin/verification">
                <Button size="sm" className="h-7 text-[11px] bg-amber-600 hover:bg-amber-700 text-white font-medium gap-1">
                  <span>Go to Module 13 Audit</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-[11px] border-amber-600/30 text-amber-900 dark:text-amber-200"
                onClick={() => dispatch(acknowledgeMaterialChangeReview())}
              >
                Dismiss Notice
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
