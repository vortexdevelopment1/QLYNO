"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { CriticalAlertBanner } from "@/components/domain/CriticalAlertBanner";
import { MOCK_CRITICAL_NOTIFICATIONS } from "@/data/mock/results";

export default function CriticalResultsPage() {
  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 7 · Results & Reports" title="Critical Results" subtitle="Critical-result workflow with recipient acknowledgement / read-back timer." />
      <div className="space-y-3">
        {MOCK_CRITICAL_NOTIFICATIONS.map((n) => (
          <CriticalAlertBanner key={n.id} notification={n} />
        ))}
      </div>
    </div>
  );
}
