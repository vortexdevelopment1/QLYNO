"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { DataTable } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { MOCK_MANIFESTS } from "@/data/mock/specimens";
import { formatDateTime } from "@/lib/utils/format";

export default function LogisticsPage() {
  const { showToast } = useToast();

  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 5 · Logistics & Referrals" title="Pickup Board" subtitle="Courier assignment and route status across all collection zones." />
      <DataTable
        rows={MOCK_MANIFESTS}
        rowKey={(m) => m.id}
        columns={[
          { key: "id", header: "Manifest", render: (m) => m.id },
          { key: "route", header: "Route", render: (m) => m.route },
          { key: "courier", header: "Courier", render: (m) => m.courier },
          { key: "count", header: "Specimens", render: (m) => m.specimenCount },
          { key: "temp", header: "Temperature", render: (m) => m.temperature },
          { key: "status", header: "Status", render: (m) => <StatusBadge status={m.status} /> },
          { key: "created", header: "Created", render: (m) => formatDateTime(m.createdAt) },
          {
            key: "actions", header: "Actions",
            render: (m) => (
              <Button size="sm" variant="outline" onClick={() => showToast({ title: "Courier reassigned (simulated)", description: m.id, tone: "info" })}>
                Reassign
              </Button>
            ),
          },
        ]}
      />
    </div>
  );
}
