"use client";

import React from "react";
import { AlertTriangle, Lock, ShieldAlert, Stethoscope } from "lucide-react";

interface ClinicalBoundaryGuardProps {
  moduleName: string;
  clinicalBoundaryText: string;
  className?: string;
}

export function ClinicalBoundaryGuard({
  moduleName,
  clinicalBoundaryText,
  className = "",
}: ClinicalBoundaryGuardProps) {
  return (
    <div
      className={`p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-300 text-xs flex items-start gap-2.5 ${className}`}
    >
      <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
      <div className="space-y-0.5">
        <span className="font-bold flex items-center gap-1">
          Clinical Decision Boundary — {moduleName}
        </span>
        <p className="text-[11px] leading-relaxed">
          {clinicalBoundaryText}
        </p>
      </div>
    </div>
  );
}
