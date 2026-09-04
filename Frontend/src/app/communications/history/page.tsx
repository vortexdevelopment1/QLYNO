"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { DataTable } from "@/components/ui/Table";
import { StatusBadge, Chip } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

const HISTORY = [
  { id: "MSG-1", patient: "Karthik Subramaniam", template: "Report Ready", channel: "WhatsApp", status: "delivered" as const },
  { id: "MSG-2", patient: "Fatima Sheikh", template: "Critical Result — Clinician Alert", channel: "SMS", status: "delivered" as const },
  { id: "MSG-3", patient: "Divya Prakash", template: "Sample Collected Confirmation", channel: "WhatsApp", status: "blocked" as const },
  { id: "MSG-4", patient: "Meera Krishnan", template: "Appointment Reminder", channel: "SMS", status: "blocked" as const },
];

export default function CommunicationHistoryPage() {
  const { showToast } = useToast();

  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 11 · Portals & Communication" title="Delivery History" subtitle="Message delivery log with failed-delivery retry." />
      <DataTable
        rows={HISTORY}
        rowKey={(m) => m.id}
        columns={[
          { key: "patient", header: "Recipient", render: (m) => m.patient },
          { key: "template", header: "Template", render: (m) => m.template },
          { key: "channel", header: "Channel", render: (m) => <Chip tone="info">{m.channel}</Chip> },
          { key: "status", header: "Status", render: (m) => <StatusBadge status={m.status === "blocked" ? "rejected" : "verified"} /> },
          {
            key: "actions", header: "Actions",
            render: (m) =>
              m.status === "blocked" ? (
                <Button size="sm" variant="outline" onClick={() => showToast({ title: "Delivery retried (simulated)", description: m.id, tone: "info" })}>
                  Retry delivery
                </Button>
              ) : (
                <span className="text-xs text-text-muted">—</span>
              ),
          },
        ]}
      />
    </div>
  );
}
