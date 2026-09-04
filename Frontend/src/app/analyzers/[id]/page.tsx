"use client";

import { notFound } from "next/navigation";
import { EntityHeader } from "@/components/ui/EntityHeader";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { DataTable } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/States";
import { MOCK_ANALYZERS, MOCK_INSTRUMENT_RUNS } from "@/data/mock/specimens";
import { formatDateTime } from "@/lib/utils/format";

const MOCK_ERROR_LOG: Record<string, { id: string; message: string; timestamp: string }[]> = {
  "AN-03": [{ id: "e1", message: "Preventive maintenance in progress — coagulation channel offline", timestamp: "2026-08-23T07:10:00+05:30" }],
  "AN-05": [
    { id: "e2", message: "Communication timeout to middleware", timestamp: "2026-08-23T04:22:00+05:30" },
    { id: "e3", message: "Reagent probe fault code E-14", timestamp: "2026-08-23T04:10:00+05:30" },
  ],
};

export default function AnalyzerDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const analyzer = MOCK_ANALYZERS.find((a) => a.id === id);
  if (!analyzer) notFound();

  const runs = MOCK_INSTRUMENT_RUNS.filter((r) => r.analyzerId === analyzer.id);
  const errors = MOCK_ERROR_LOG[analyzer.id] ?? [];

  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 6 · Workbench & Analyzers" title={analyzer.name} subtitle={analyzer.department} badges={<StatusBadge status={analyzer.status} />} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-text-main">Connectivity</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-xs text-text-muted">Last message</dt><dd className="font-medium">{formatDateTime(analyzer.lastMessageAt)}</dd></div>
            <div><dt className="text-xs text-text-muted">Queue depth</dt><dd className="font-medium">{analyzer.queueDepth}</dd></div>
            <div><dt className="text-xs text-text-muted">Mapping version</dt><dd className="font-medium">{analyzer.mappingVersion}</dd></div>
            <div><dt className="text-xs text-text-muted">Error count</dt><dd className={`font-medium ${analyzer.errorCount > 0 ? "text-status-critical" : ""}`}>{analyzer.errorCount}</dd></div>
          </dl>
          <p className="mt-4 rounded-lg bg-app-bg px-3 py-2 text-xs text-text-muted">This is a visual simulation only — no real device connection exists in this prototype.</p>
        </Card>
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-text-main">Error log</h3>
          {errors.length > 0 ? (
            <ul className="space-y-2">
              {errors.map((e) => (
                <li key={e.id} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs">
                  <p className="font-medium text-text-main">{e.message}</p>
                  <p className="text-text-muted">{formatDateTime(e.timestamp)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No errors logged" description="This analyzer has no recent error events." />
          )}
        </Card>
      </div>
      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold text-text-main">Recent runs</h3>
        <DataTable
          rows={runs}
          rowKey={(r) => r.id}
          columns={[
            { key: "id", header: "Run", render: (r) => r.id },
            { key: "items", header: "Items", render: (r) => r.itemCount },
            { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
            { key: "runAt", header: "Run at", render: (r) => formatDateTime(r.runAt) },
          ]}
          emptyDescription="No runs recorded for this analyzer."
        />
      </Card>
    </div>
  );
}
