"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { DataTable } from "@/components/ui/Table";
import { StatusBadge, Chip } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

const TICKETS = [
  { id: "TCK-501", subject: "Report delayed for order ORD-70016", category: "Report Query", status: "open" as const },
  { id: "TCK-502", subject: "Incorrect address on invoice INV-3004", category: "Complaint", status: "investigating" as const },
  { id: "TCK-503", subject: "Positive feedback — home collection experience", category: "Feedback", status: "closed" as const },
];

export default function SupportPage() {
  const { showToast } = useToast();

  return (
    <div className="space-y-6">
      <EntityHeader
        eyebrow="Module 11 · Portals & Communication"
        title="Support"
        subtitle="Helpdesk tickets, complaints, report queries and satisfaction feedback."
        actions={<Button size="sm" onClick={() => showToast({ title: "New ticket form opened (simulated)", tone: "info" })}>New ticket</Button>}
      />
      <DataTable
        rows={TICKETS}
        rowKey={(t) => t.id}
        columns={[
          { key: "subject", header: "Subject", render: (t) => <span className="font-medium">{t.subject}</span> },
          { key: "category", header: "Category", render: (t) => <Chip tone="neutral">{t.category}</Chip> },
          { key: "status", header: "Status", render: (t) => <StatusBadge status={t.status} /> },
        ]}
      />
    </div>
  );
}
