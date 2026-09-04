"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import { ShieldCheck, UserCheck, Users, Workflow } from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";

interface DelegationActorBadgeProps {
  actorName?: string;
  actorRole?: string;
  workflowRole: string;
  delegatedBy?: string;
  variant?: "inline" | "pill" | "ribbon" | "card";
  className?: string;
}

export function DelegationActorBadge({
  actorName = "Hospital Admin",
  actorRole = "Hospital Administrator",
  workflowRole,
  delegatedBy,
  variant = "inline",
  className = "",
}: DelegationActorBadgeProps) {
  const currentRole = useSelector((state: RootState) => state.nursingOperations?.currentRole || "admin");

  // Determine role-aware label
  let effectiveActor = actorName;
  if (actorName === "Hospital Admin") {
    if (currentRole === "nurse_lead") effectiveActor = "Sister Anita Joseph (Nurse Station Lead)";
    else if (currentRole === "senior_nurse") effectiveActor = "Sister Sneha Kulkarni (Senior Nurse)";
    else if (currentRole === "nurse") effectiveActor = "Nurse Rahul Shinde (Staff Nurse)";
    else if (currentRole === "support_staff") effectiveActor = "Ramesh Pawar (Support Staff)";
  }

  const isDirectAdmin = (!delegatedBy || actorName.includes("Admin")) && currentRole === "admin";
  
  const labelText = isDirectAdmin
    ? `Performed by Hospital Admin • acting within ${workflowRole} workflow`
    : currentRole !== "admin"
    ? `Authorized action by ${effectiveActor} • ${workflowRole}`
    : `Performed by ${actorName} • delegated by ${delegatedBy || "Hospital Admin"}`;

  if (variant === "pill") {
    return (
      <Badge
        variant="outline"
        className={`text-[10px] font-medium py-0.5 px-2 bg-primary/5 text-primary border-primary/20 flex items-center gap-1.5 ${className}`}
      >
        <ShieldCheck className="h-3 w-3 text-primary shrink-0" />
        <span className="truncate">{labelText}</span>
      </Badge>
    );
  }

  if (variant === "ribbon") {
    return (
      <div
        className={`p-2 rounded-md border border-primary/20 bg-primary/5 text-primary flex items-center justify-between text-xs font-medium ${className}`}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
          <span className="font-semibold">{labelText}</span>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">Role Capability Verified</span>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={`p-3 rounded-lg border border-border bg-card space-y-1.5 ${className}`}>
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <Workflow className="h-4 w-4 text-primary" />
          <span>Workflow Execution Trace</span>
        </div>
        <p className="text-xs text-muted-foreground">{labelText}</p>
      </div>
    );
  }

  // default: inline
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium ${className}`}>
      <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
      <span>{labelText}</span>
    </span>
  );
}
