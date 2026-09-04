"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { DataTable } from "@/components/ui/Table";
import { Chip } from "@/components/ui/Badge";
import { useDemo } from "@/state/demo-context";
import { MOCK_LAB_ACCESS_AUDIT } from "@/data/mock/lab-management";
import { formatDateTime } from "@/lib/utils/format";

export default function AccessAuditPage() {
  const { session } = useDemo(); if (!session) return null; const events = MOCK_LAB_ACCESS_AUDIT.filter((event) => event.tenantId === session.tenantId);
  return <div className="space-y-6"><EntityHeader eyebrow="Lab Management" title="Access Audit" subtitle="Immutable laboratory access history for the authenticated organization. Audit records cannot be edited or deleted." badges={<Chip tone="neutral">Read only</Chip>} /><DataTable rows={events} rowKey={(event) => event.id} columns={[{ key: "action", header: "Event", render: (event) => <div><p className="font-medium">{event.action}</p><p className="text-xs text-text-muted">{event.reason}</p></div> }, { key: "actor", header: "Actor", render: (event) => event.actor }, { key: "target", header: "Target user", render: (event) => event.targetUser }, { key: "change", header: "Previous → New", render: (event) => <span className="text-xs">{event.previousValue ?? "—"} → {event.newValue ?? "—"}</span> }, { key: "timestamp", header: "Timestamp", render: (event) => formatDateTime(event.timestamp), sortValue: (event) => event.timestamp }]} /></div>;
}
