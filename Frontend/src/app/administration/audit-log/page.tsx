"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { DataTable } from "@/components/ui/Table";
import { MOCK_AUDIT_EVENTS } from "@/data/mock/integrations";
import { formatDateTime } from "@/lib/utils/format";

export default function AuditLogPage() {
  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 12 · Analytics & Administration" title="Audit Log" subtitle="System-wide audit history across entities." />
      <DataTable
        rows={MOCK_AUDIT_EVENTS}
        rowKey={(a) => a.id}
        columns={[
          { key: "entity", header: "Entity", render: (a) => `${a.entity} · ${a.entityId}` },
          { key: "action", header: "Action", render: (a) => a.action },
          { key: "actor", header: "Actor", render: (a) => a.actor },
          { key: "timestamp", header: "Timestamp", render: (a) => formatDateTime(a.timestamp), sortValue: (a) => a.timestamp },
        ]}
      />
    </div>
  );
}
