"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EntityHeader } from "@/components/ui/EntityHeader";
import { FilterBar } from "@/components/ui/FilterBar";
import { DataTable, type Column } from "@/components/ui/Table";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { MOCK_ORDERS } from "@/data/mock/orders";
import { MOCK_SPECIMENS } from "@/data/mock/specimens";
import { toTitleCase } from "@/lib/utils/format";
import type { Order } from "@/lib/types/domain";

const QUEUE_LABELS: Record<string, string> = {
  uncollected: "Uncollected Samples", "in-transit": "In-Transit Samples", "pending-accession": "Pending Accession",
  rejected: "Rejected Samples", "pending-processing": "Pending Processing", "tech-review": "Pending Technical Review",
  "medical-validation": "Pending Medical Validation", "tat-breach": "TAT Breaches",
};

const columns: Column<Order>[] = [
  { key: "id", header: "Order ID", render: (o) => <span className="font-medium">{o.id}</span>, sortValue: (o) => o.id },
  { key: "patient", header: "Patient", render: (o) => o.patientName },
  { key: "dept", header: "Department", render: (o) => o.departmentIds.join(", ") },
  { key: "priority", header: "Priority", render: (o) => <PriorityBadge priority={o.priority} /> },
  { key: "status", header: "Status", render: (o) => <StatusBadge status={o.status} /> },
];

export default function QueueTypePage({ params }: { params: { type: string } }) {
  const { type } = params;
  const router = useRouter();
  const [search, setSearch] = useState("");
  const label = QUEUE_LABELS[type] ?? toTitleCase(type);

  const filtered = MOCK_ORDERS.filter((o) => o.patientName.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase()));
  const rejectedSpecimens = MOCK_SPECIMENS.filter((s) => s.status === "rejected");

  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Work Queue" title={label} subtitle="Client-side filtered view of the shared demo order dataset for this queue." />
      <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search patient or order ID…" />
      {type === "rejected" ? (
        <DataTable
          rowKey={(s) => s.id}
          rows={rejectedSpecimens}
          columns={[
            { key: "id", header: "Specimen ID", render: (s) => <span className="font-medium">{s.id}</span> },
            { key: "patient", header: "Patient", render: (s) => s.patientName },
            { key: "type", header: "Type", render: (s) => s.type },
            { key: "reason", header: "Rejection Reason", render: (s) => s.rejectedReason ?? "—" },
            { key: "status", header: "Status", render: (s) => <StatusBadge status={s.status} /> },
          ]}
        />
      ) : (
        <DataTable rowKey={(o) => o.id} rows={filtered} columns={columns} onRowClick={(o) => router.push(`/orders/${o.id}`)} emptyDescription="No orders match this queue right now." />
      )}
    </div>
  );
}
