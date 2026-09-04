"use client";

import { notFound } from "next/navigation";
import { EntityHeader } from "@/components/ui/EntityHeader";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Timeline } from "@/components/ui/Timeline";
import { MOCK_MANIFESTS } from "@/data/mock/specimens";
import { formatDateTime } from "@/lib/utils/format";

export default function ManifestDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const manifest = MOCK_MANIFESTS.find((m) => m.id === id);
  if (!manifest) notFound();

  const custodyEntries = [
    { id: "c1", label: "Manifest built & sealed", timestamp: manifest.createdAt, tone: "default" as const },
    { id: "c2", label: `Scan-out from ${manifest.route.split("→")[0]?.trim() ?? "origin"}`, tone: "default" as const },
    manifest.status === "delayed"
      ? { id: "c3", label: "Delay flagged — route congestion", tone: "warning" as const }
      : manifest.status === "delivered"
        ? { id: "c3", label: "Scan-in at central lab — reconciled", tone: "success" as const }
        : { id: "c3", label: "In transit", tone: "default" as const },
  ];

  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 5 · Logistics & Referrals" title={manifest.id} subtitle={manifest.route} badges={<StatusBadge status={manifest.status} />} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-text-main">Manifest details</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-xs text-text-muted">Courier</dt><dd className="font-medium">{manifest.courier}</dd></div>
            <div><dt className="text-xs text-text-muted">Specimen count</dt><dd className="font-medium">{manifest.specimenCount}</dd></div>
            <div><dt className="text-xs text-text-muted">Temperature / seal</dt><dd className="font-medium">{manifest.temperature}</dd></div>
            <div><dt className="text-xs text-text-muted">Created</dt><dd className="font-medium">{formatDateTime(manifest.createdAt)}</dd></div>
          </dl>
          <div className="mt-4 rounded-lg border border-app-border bg-app-bg px-3 py-2 text-xs text-text-muted">
            Expected vs received reconciliation: {manifest.status === "delivered" ? `${manifest.specimenCount}/${manifest.specimenCount} matched` : "Pending scan-in"}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-text-main">Scan-in / scan-out custody timeline</h3>
          <Timeline entries={custodyEntries} />
        </Card>
      </div>
    </div>
  );
}
