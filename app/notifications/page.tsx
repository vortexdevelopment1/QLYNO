"use client";

import { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTime } from "@/lib/utils";

const EVENT_LABEL: Record<string, string> = {
  invoice_issued: "Invoice Issued",
  payment_received: "Payment Received",
  partial_payment: "Partial Payment",
  outstanding_reminder: "Outstanding Reminder",
  refund_update: "Refund Update",
  insurance_update: "Insurance Update",
};

export default function NotificationsPage() {
  const { currentOrg, notifications, patients } = useApp();
  const orgNotifs = useMemo(() => notifications.filter((n) => n.organizationId === currentOrg.id).sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1)), [notifications, currentOrg.id]);

  return (
    <div>
      <PageHeader title="Notifications" description="Simulated WhatsApp billing communications: invoice, payment, partial payment, outstanding, refund and insurance events." />
      {orgNotifs.length === 0 ? (
        <EmptyState title="No notifications yet" />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {orgNotifs.map((n) => {
            const patient = patients.find((p) => p.id === n.patientId);
            return (
              <div key={n.id} className="rounded-xl border border-ink-100 bg-white p-4 shadow-card">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink-700">{EVENT_LABEL[n.event]}</span>
                  <StatusBadge status={n.status} />
                </div>
                <p className="text-sm text-ink-700">{n.message}</p>
                <p className="mt-1.5 text-[11px] text-ink-400">To {patient?.name ?? "Patient"} · {formatDateTime(n.timestamp)}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
