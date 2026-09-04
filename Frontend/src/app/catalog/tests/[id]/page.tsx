"use client";

import { notFound } from "next/navigation";
import { EntityHeader } from "@/components/ui/EntityHeader";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { MOCK_CATALOG } from "@/data/mock/catalog";

export default function CatalogTestDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const test = MOCK_CATALOG.find((t) => t.id === id);
  if (!test) notFound();

  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 3 · Orders & Catalog" title={test.name} subtitle={`${test.code} · ${test.department} · ${test.method}`} badges={<StatusBadge status={test.status} />} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-text-main">Specimen requirements</h3>
          <dl className="space-y-2 text-sm">
            <Row label="Specimen" value={test.specimen} />
            <Row label="Container" value={test.container} />
            <Row label="Minimum volume" value={test.minVolume} />
            <Row label="Stability" value={test.stability} />
          </dl>
        </Card>
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-text-main">Reporting</h3>
          <dl className="space-y-2 text-sm">
            <Row label="TAT" value={test.tat} />
            <Row label="Units" value={test.units} />
            <Row label="Reference range" value={test.referenceRange} />
            <Row label="Critical range" value={test.criticalRange ?? "Not defined"} />
            <Row label="Reflex rule" value={test.reflexRule ?? "None"} />
          </dl>
        </Card>
        <Card className="p-5 lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-text-main">Version control</h3>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div><dt className="text-xs text-text-muted">Version</dt><dd className="text-sm font-medium">{test.version}</dd></div>
            <div><dt className="text-xs text-text-muted">Status</dt><dd><StatusBadge status={test.status} /></dd></div>
            <div><dt className="text-xs text-text-muted">Effective date</dt><dd className="text-sm font-medium">{test.effectiveDate}</dd></div>
          </dl>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-app-border/60 pb-2 last:border-0">
      <dt className="text-text-muted">{label}</dt>
      <dd className="font-medium text-text-main">{value}</dd>
    </div>
  );
}
