"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/hospital-admin/components/ui/alert";

export function AdminOverrideLogBanner() {
  const currentRole = useSelector((state: RootState) => state.nursingOperations.currentRole);

  if (currentRole === "nurse_lead") {
    return (
      <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-800 dark:text-blue-200 mb-4 py-2.5">
        <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="font-semibold text-xs ml-2">
          Authorized Action by Nurse Station Lead (Sister Anita Joseph) • Station Audit Logged
        </AlertDescription>
      </Alert>
    );
  }

  if (currentRole === "senior_nurse") {
    return (
      <Alert className="bg-indigo-500/10 border-indigo-500/20 text-indigo-800 dark:text-indigo-200 mb-4 py-2.5">
        <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        <AlertDescription className="font-semibold text-xs ml-2">
          Authorized Action by Senior Nurse (Sister Sneha Kulkarni) • Care Coordination Scope
        </AlertDescription>
      </Alert>
    );
  }

  if (currentRole === "nurse") {
    return (
      <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-200 mb-4 py-2.5">
        <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <AlertDescription className="font-semibold text-xs ml-2">
          Authorized Action by Staff Nurse (Nurse Rahul Shinde) • Bedside Clinical Record
        </AlertDescription>
      </Alert>
    );
  }

  if (currentRole === "support_staff") {
    return (
      <Alert className="bg-purple-500/10 border-purple-500/20 text-purple-800 dark:text-purple-200 mb-4 py-2.5">
        <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        <AlertDescription className="font-semibold text-xs ml-2">
          Operational Ticket Action by Support Staff • Service Queue Logged
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-200 mb-4 py-2.5">
      <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertDescription className="font-semibold text-xs ml-2">
        Administrative Override • Performed by Hospital Admin
      </AlertDescription>
    </Alert>
  );
}
