"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EntityHeader } from "@/components/ui/EntityHeader";
import { FilterBar } from "@/components/ui/FilterBar";
import { DataTable } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { MOCK_CATALOG } from "@/data/mock/catalog";

export default function CatalogPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("all");

  const departments = Array.from(new Set(MOCK_CATALOG.map((t) => t.department)));
  const rows = MOCK_CATALOG.filter(
    (t) => (dept === "all" || t.department === dept) && (t.name.toLowerCase().includes(search.toLowerCase()) || t.code.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 3 · Orders & Catalog" title="Test Catalog" subtitle="Versioned test and panel definitions with specimen requirements and reference ranges." />
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search test name or code…"
        filters={[{ id: "dept", label: "Department", value: dept, onChange: setDept, options: [{ value: "all", label: "All departments" }, ...departments.map((d) => ({ value: d, label: d }))] }]}
      />
      <DataTable
        rows={rows}
        rowKey={(t) => t.id}
        onRowClick={(t) => router.push(`/catalog/tests/${t.id}`)}
        columns={[
          { key: "code", header: "Code", render: (t) => <span className="font-mono text-xs">{t.code}</span> },
          { key: "name", header: "Test / Panel", render: (t) => <span className="font-medium">{t.name}</span> },
          { key: "dept", header: "Department", render: (t) => t.department },
          { key: "specimen", header: "Specimen", render: (t) => t.specimen },
          { key: "tat", header: "TAT", render: (t) => t.tat },
          { key: "version", header: "Version", render: (t) => t.version },
          { key: "status", header: "Status", render: (t) => <StatusBadge status={t.status} /> },
        ]}
      />
    </div>
  );
}
