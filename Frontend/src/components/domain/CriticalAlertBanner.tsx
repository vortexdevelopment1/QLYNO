"use client";

import { AlertTriangle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import type { CriticalNotification } from "@/lib/types/domain";

export function CriticalAlertBanner({ notification }: { notification: CriticalNotification }) {
  const { showToast } = useToast();
  if (notification.acknowledged) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm">
        <ShieldAlert className="h-4 w-4 shrink-0 text-status-success" aria-hidden="true" />
        <p className="text-text-main">
          <span className="font-medium">{notification.testName}</span> for {notification.patientName} — read-back acknowledged by {notification.notifiedTo}.
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-status-critical" aria-hidden="true" />
        <p className="text-text-main">
          <span className="font-semibold">Critical result:</span> {notification.testName} = {notification.value} for {notification.patientName}. Awaiting acknowledgement from {notification.notifiedTo}.
        </p>
      </div>
      <Button
        size="sm"
        variant="destructive"
        onClick={() =>
          showToast({
            title: "Read-back acknowledgement recorded (simulated)",
            description: `${notification.testName} — ${notification.patientName}`,
            tone: "success",
          })
        }
      >
        Record acknowledgement
      </Button>
    </div>
  );
}

export function QCBlockBanner({ analyte, department, reason }: { analyte: string; department: string; reason: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm">
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-status-critical" aria-hidden="true" />
      <div>
        <p className="font-semibold text-text-main">
          {department} — {analyte} is QC-blocked
        </p>
        <p className="text-xs text-text-muted">{reason}. Patient results cannot be released until QC is reviewed and closed.</p>
      </div>
    </div>
  );
}
