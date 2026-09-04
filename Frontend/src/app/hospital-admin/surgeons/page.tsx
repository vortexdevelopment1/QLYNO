"use client";

import { Stethoscope } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/hospital-admin/components/ui/avatar";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { StatusBadge } from "@/hospital-admin/components/shared/status-badge";
import { SurgicalNav } from "@/hospital-admin/components/surgical/surgical-nav";
import { surgeons } from "@/hospital-admin/lib/mock-data/hospital-operations";
import { getInitials } from "@/hospital-admin/lib/utils";

export default function SurgeonsPage() {
  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Surgeons Directory &amp; Credentialing"
        description="Internal and requested specialist coverage with case-specific access and staffing visibility."
        crumbs={[{ label: "OT & Surgeries" }, { label: "Surgeons" }]}
      />

      <SurgicalNav />

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        {surgeons.map((surgeon) => (
          <div key={surgeon.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11">
                  <AvatarImage src={surgeon.avatarUrl} alt={surgeon.name} />
                  <AvatarFallback>{getInitials(surgeon.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{surgeon.name}</p>
                  <p className="text-xs text-muted-foreground">{surgeon.specialty}</p>
                </div>
              </div>
              <StatusBadge status={surgeon.status} />
            </div>
            <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <div className="flex items-center justify-between gap-3">
                <span>Qualification</span>
                <span className="text-right font-medium text-foreground">{surgeon.qualification}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Access</span>
                <Badge variant="outline">{surgeon.caseAccess}</Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Location</span>
                <span className="text-right font-medium text-foreground">{surgeon.location}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Next available</span>
                <span className="text-right font-medium text-foreground">{surgeon.nextAvailable}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <Stethoscope className="h-4 w-4 text-primary" /> Specialist coordination
        </div>
        <p className="mt-2">Requested specialists, on-call coverage and case-level access are visible here for admin oversight and scheduling.</p>
      </div>
    </div>
  );
}
