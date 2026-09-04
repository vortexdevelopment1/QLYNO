"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { DataTable } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { MOCK_INSTRUMENT_RUNS, MOCK_ANALYZERS } from "@/data/mock/specimens";
import { formatDateTime } from "@/lib/utils/format";

export default function BatchesPage() {
  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 6 · Workbench & Analyzers" title="Batches / Instrument Runs" subtitle="All analyzer batch runs across departments." />
      <DataTable
        rows={MOCK_INSTRUMENT_RUNS}
        rowKey={(r) => r.id}
        columns={[
          { key: "id", header: "Run", render: (r) => r.id },
          { key: "analyzer", header: "Analyzer", render: (r) => MOCK_ANALYZERS.find((a) => a.id === r.analyzerId)?.name ?? r.analyzerId },
          { key: "items", header: "Item count", render: (r) => r.itemCount },
          { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
          { key: "runAt", header: "Run at", render: (r) => formatDateTime(r.runAt) },
        ]}
      />
    </div>
  );
}
