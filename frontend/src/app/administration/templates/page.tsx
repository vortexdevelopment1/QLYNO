"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { DataTable } from "@/components/ui/Table";
import { StatusBadge, Chip } from "@/components/ui/Badge";

const TEMPLATES = [
  { id: "LBL-01", name: "Standard Specimen Label — 50x25mm", type: "Label Template", status: "active" as const },
  { id: "LBL-02", name: "Aliquot Label — 30x15mm", type: "Label Template", status: "active" as const },
  { id: "RPT-01", name: "Clinical Report — Standard Layout", type: "Report Template", status: "active" as const },
  { id: "RPT-02", name: "Histopathology Report — Narrative Layout", type: "Report Template", status: "active" as const },
  { id: "RPT-03", name: "B2B Consolidated Report — Client Branding", type: "Report Template", status: "draft" as const },
];

export default function AdminTemplatesPage() {
  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 12 · Analytics & Administration" title="Templates" subtitle="Label templates and report templates, including branding and localization." />
      <DataTable
        rows={TEMPLATES}
        rowKey={(t) => t.id}
        columns={[
          { key: "name", header: "Template", render: (t) => <span className="font-medium">{t.name}</span> },
          { key: "type", header: "Type", render: (t) => <Chip tone="info">{t.type}</Chip> },
          { key: "status", header: "Status", render: (t) => <StatusBadge status={t.status} /> },
        ]}
      />
    </div>
  );
}
