"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EntityHeader } from "@/components/ui/EntityHeader";
import { FilterBar } from "@/components/ui/FilterBar";
import { DataTable } from "@/components/ui/Table";
import { Chip } from "@/components/ui/Badge";
import { MOCK_CLIENT_ORGS } from "@/data/mock/patients";
import { toTitleCase } from "@/lib/utils/format";

const TYPE_LABEL: Record<string, string> = {
  clinic: "Clinic", hospital: "Hospital", corporate: "Corporate", insurer_tpa: "Insurer / TPA",
  collection_center: "Collection Center", client_lab: "Client Laboratory", reference_lab: "Reference Laboratory",
};

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const rows = MOCK_CLIENT_ORGS.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <EntityHeader
        eyebrow="Module 2 · Patients & Network"
        title="Clients & Referring Organizations"
        subtitle="Clinics, hospitals, corporate clients, insurers/TPAs, collection centers and reference labs."
      />
      <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search client organizations…" />
      <DataTable
        rows={rows}
        rowKey={(c) => c.id}
        onRowClick={(c) => router.push(`/clients/${c.id}`)}
        columns={[
          { key: "name", header: "Organization", render: (c) => <span className="font-medium">{c.name}</span> },
          { key: "type", header: "Type", render: (c) => <Chip tone="info">{TYPE_LABEL[c.type]}</Chip> },
          { key: "contact", header: "Contact", render: (c) => `${c.contactPerson} · ${c.contactEmail}` },
          {
            key: "contract", header: "Contract",
            render: (c) => (c.contractId ? c.contractId : <span className="text-text-muted">No contract</span>),
          },
        ]}
      />
    </div>
  );
}
