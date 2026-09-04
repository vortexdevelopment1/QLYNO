"use client";

import { useRouter } from "next/navigation";
import { EntityHeader } from "@/components/ui/EntityHeader";
import { DataTable } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { MOCK_QC_RUNS } from "@/data/mock/quality";
import { formatDateTime } from "@/lib/utils/format";

export default function QcRunsPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 8 · Quality Management" title="QC Runs" subtitle="Internal quality-control runs across departments, with Westgard rule monitoring." />
      <DataTable
        rows={MOCK_QC_RUNS}
        rowKey={(q) => q.id}
        onRowClick={(q) => router.push(`/quality/qc/${q.id}`)}
        columns={[
          { key: "analyte", header: "Analyte", render: (q) => <span className="font-medium">{q.analyte}</span> },
          { key: "dept", header: "Department", render: (q) => q.department },
          { key: "lot", header: "Control lot", render: (q) => q.controlLot },
          { key: "level", header: "Level", render: (q) => q.level },
          { key: "violation", header: "Westgard", render: (q) => q.westgardViolation ?? "—" },
          { key: "status", header: "Status", render: (q) => <StatusBadge status={q.status} /> },
          { key: "runAt", header: "Run at", render: (q) => formatDateTime(q.runAt) },
        ]}
      />
    </div>
  );
}
