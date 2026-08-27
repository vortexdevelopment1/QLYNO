"use client";

import { Drawer } from "@/components/ui/Drawer";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useApp } from "@/context/AppContext";
import { formatDateTime } from "@/lib/utils";

const EVENT_LABEL: Record<string, string> = {
  invoice_issued: "Invoice Issued",
  payment_received: "Payment Received",
  partial_payment: "Partial Payment",
  outstanding_reminder: "Outstanding Reminder",
  refund_update: "Refund Update",
  insurance_update: "Insurance Update",
};

export function NotificationPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { notifications, currentOrg, patients } = useApp();
  const orgNotifs = notifications.filter((n) => n.organizationId === currentOrg.id).slice(0, 30);

  return (
    <Drawer open={open} onClose={onClose} title="WhatsApp Notification Center">
      <p className="mb-4 text-xs text-ink-500">
        Simulated patient-facing WhatsApp messages triggered by billing events. No real WhatsApp integration is used.
      </p>
      {orgNotifs.length === 0 ? (
        <EmptyState title="No notifications yet" description="Billing events will appear here as they occur." />
      ) : (
        <ul className="space-y-3">
          {orgNotifs.map((n) => {
            const patient = patients.find((p) => p.id === n.patientId);
            return (
              <li key={n.id} className="rounded-xl border border-ink-100 p-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink-700">{EVENT_LABEL[n.event]}</span>
                  <StatusBadge status={n.status} />
                </div>
                <p className="text-sm text-ink-700">{n.message}</p>
                <p className="mt-1.5 text-[11px] text-ink-400">
                  To {patient?.name ?? "Patient"} · {formatDateTime(n.timestamp)}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </Drawer>
  );
}
