"use client";

import { useState } from "react";
import { EntityHeader } from "@/components/ui/EntityHeader";
import { FilterBar } from "@/components/ui/FilterBar";
import { DataTable } from "@/components/ui/Table";
import { MOCK_PRACTITIONERS } from "@/data/mock/patients";
import { MOCK_ORDERS } from "@/data/mock/orders";

export default function ReferrersPage() {
  const [search, setSearch] = useState("");
  const rows = MOCK_PRACTITIONERS.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 2 · Patients & Network" title="Referring Practitioners" subtitle="Contacts and report recipients for referring clinicians." />
      <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search referring doctors…" />
      <DataTable
        rows={rows}
        rowKey={(p) => p.id}
        columns={[
          { key: "name", header: "Practitioner", render: (p) => <span className="font-medium">{p.name}</span> },
          { key: "specialty", header: "Specialty", render: (p) => p.specialty },
          { key: "org", header: "Clinic / Hospital", render: (p) => p.clinicOrHospital },
          { key: "phone", header: "Phone", render: (p) => p.phone },
          {
            key: "orders", header: "Orders Referred",
            render: (p) => MOCK_ORDERS.filter((o) => o.orderingDoctor === p.name).length,
          },
        ]}
      />
    </div>
  );
}
