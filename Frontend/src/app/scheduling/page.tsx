"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { DataTable } from "@/components/ui/Table";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { MOCK_ORDERS } from "@/data/mock/orders";
import { formatDateTime } from "@/lib/utils/format";

export default function SchedulingPage() {
  const scheduled = MOCK_ORDERS.filter((o) => o.status === "placed" || o.status === "draft");

  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 3 · Orders & Catalog" title="Scheduling" subtitle="Upcoming collection appointments across ward rounds, walk-in slots and home-collection visits." />
      <DataTable
        rows={scheduled}
        rowKey={(o) => o.id}
        columns={[
          { key: "id", header: "Order", render: (o) => o.id },
          { key: "patient", header: "Patient", render: (o) => o.patientName },
          { key: "window", header: "Scheduled window", render: (o) => formatDateTime(o.placedAt) },
          { key: "priority", header: "Priority", render: (o) => <PriorityBadge priority={o.priority} /> },
          { key: "status", header: "Status", render: (o) => <StatusBadge status={o.status} /> },
        ]}
        emptyDescription="No pending scheduled collections."
      />
    </div>
  );
}
