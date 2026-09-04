"use client";

import { useRouter } from "next/navigation";
import { EntityHeader } from "@/components/ui/EntityHeader";
import { DataTable } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { MOCK_MANIFESTS } from "@/data/mock/specimens";
import { formatDateTime } from "@/lib/utils/format";

export default function ManifestsPage() {
  const router = useRouter();
  const { showToast } = useToast();

  return (
    <div className="space-y-6">
      <EntityHeader
        eyebrow="Module 5 · Logistics & Referrals"
        title="Manifests"
        subtitle="Bag / box / manifest builder with seal, temperature and custody tracking."
        actions={<Button size="sm" onClick={() => showToast({ title: "New manifest builder opened (simulated)", tone: "info" })}>New manifest</Button>}
      />
      <DataTable
        rows={MOCK_MANIFESTS}
        rowKey={(m) => m.id}
        onRowClick={(m) => router.push(`/logistics/manifests/${m.id}`)}
        columns={[
          { key: "id", header: "Manifest", render: (m) => <span className="font-medium">{m.id}</span> },
          { key: "route", header: "Route", render: (m) => m.route },
          { key: "count", header: "Specimens", render: (m) => m.specimenCount },
          { key: "temp", header: "Temperature", render: (m) => m.temperature },
          { key: "status", header: "Status", render: (m) => <StatusBadge status={m.status} /> },
          { key: "created", header: "Created", render: (m) => formatDateTime(m.createdAt) },
        ]}
      />
    </div>
  );
}
