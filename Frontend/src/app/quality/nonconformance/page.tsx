"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { DataTable } from "@/components/ui/Table";
import { StatusBadge, Chip } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { MOCK_NONCONFORMANCES } from "@/data/mock/quality";
import { formatDateTime } from "@/lib/utils/format";

const SEVERITY_TONE = { minor: "neutral", major: "warning", critical: "critical" } as const;

export default function NonconformancePage() {
  const { showToast } = useToast();

  return (
    <div className="space-y-6">
      <EntityHeader
        eyebrow="Module 8 · Quality Management"
        title="Nonconformance"
        subtitle="Root-cause investigation workflow for quality events."
        actions={<Button size="sm" onClick={() => showToast({ title: "New nonconformance form opened (simulated)", tone: "info" })}>Log nonconformance</Button>}
      />
      <DataTable
        rows={MOCK_NONCONFORMANCES}
        rowKey={(n) => n.id}
        columns={[
          { key: "title", header: "Title", render: (n) => <span className="font-medium">{n.title}</span> },
          { key: "category", header: "Category", render: (n) => n.category },
          { key: "severity", header: "Severity", render: (n) => <Chip tone={SEVERITY_TONE[n.severity]}>{n.severity}</Chip> },
          { key: "status", header: "Status", render: (n) => <StatusBadge status={n.status} /> },
          { key: "raised", header: "Raised", render: (n) => formatDateTime(n.raisedAt) },
        ]}
      />
    </div>
  );
}
