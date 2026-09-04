"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { DataTable } from "@/components/ui/Table";
import { Chip, StatusBadge } from "@/components/ui/Badge";

const TEMPLATES = [
  { id: "TPL-01", name: "Report Ready — Secure Notification", channel: "SMS / WhatsApp", status: "active" as const },
  { id: "TPL-02", name: "Critical Result — Clinician Alert", channel: "SMS", status: "active" as const },
  { id: "TPL-03", name: "Sample Collected Confirmation", channel: "WhatsApp", status: "active" as const },
  { id: "TPL-04", name: "Invoice / Payment Receipt", channel: "Email", status: "active" as const },
  { id: "TPL-05", name: "Appointment Reminder — Home Collection", channel: "SMS", status: "draft" as const },
];

export default function CommunicationTemplatesPage() {
  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 11 · Portals & Communication" title="Notification Templates" subtitle="Channel-specific message templates and approval status." />
      <DataTable
        rows={TEMPLATES}
        rowKey={(t) => t.id}
        columns={[
          { key: "name", header: "Template", render: (t) => <span className="font-medium">{t.name}</span> },
          { key: "channel", header: "Channel", render: (t) => <Chip tone="info">{t.channel}</Chip> },
          { key: "status", header: "Status", render: (t) => <StatusBadge status={t.status} /> },
        ]}
      />
    </div>
  );
}
