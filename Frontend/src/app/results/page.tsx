"use client";

import { useState } from "react";
import { EntityHeader } from "@/components/ui/EntityHeader";
import { FilterBar } from "@/components/ui/FilterBar";
import { DataTable } from "@/components/ui/Table";
import { ResultFlag, StatusBadge } from "@/components/ui/Badge";
import { MOCK_RESULTS } from "@/data/mock/results";
import { MOCK_ORDER_ITEMS, MOCK_ORDERS } from "@/data/mock/orders";

export default function ResultsPage() {
  const [search, setSearch] = useState("");

  const rows = MOCK_RESULTS.map((r) => {
    const item = MOCK_ORDER_ITEMS.find((i) => i.id === r.orderItemId);
    const order = MOCK_ORDERS.find((o) => o.id === item?.orderId);
    return { ...r, patientName: order?.patientName ?? "—", orderId: order?.id ?? "—" };
  }).filter((r) => r.testName.toLowerCase().includes(search.toLowerCase()) || r.patientName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 7 · Results & Reports" title="Results" subtitle="Result table with ranges, units, flags and delta-check comparison." />
      <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search test or patient…" />
      <DataTable
        rows={rows}
        rowKey={(r) => r.id}
        columns={[
          { key: "test", header: "Test", render: (r) => <span className="font-medium">{r.testName}</span> },
          { key: "patient", header: "Patient", render: (r) => r.patientName },
          { key: "value", header: "Result", render: (r) => `${r.value} ${r.units}` },
          { key: "range", header: "Reference range", render: (r) => r.referenceRange },
          { key: "flag", header: "Flag", render: (r) => <ResultFlag flag={r.flag} /> },
          { key: "delta", header: "Delta check", render: (r) => (r.deltaWarning ? <span className="text-xs font-medium text-status-warning">⚠ Warning</span> : <span className="text-xs text-text-muted">—</span>) },
          { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
        ]}
      />
    </div>
  );
}
