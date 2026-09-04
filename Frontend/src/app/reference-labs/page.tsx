"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { DataTable } from "@/components/ui/Table";
import { Chip } from "@/components/ui/Badge";
import { MOCK_CLIENT_ORGS } from "@/data/mock/patients";

export default function ReferenceLabsPage() {
  const labs = MOCK_CLIENT_ORGS.filter((c) => c.type === "reference_lab" || c.type === "client_lab");

  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 5 · Logistics & Referrals" title="Reference Lab Network" subtitle="Partner reference laboratories and client-laboratory relationships." />
      <DataTable
        rows={labs}
        rowKey={(c) => c.id}
        columns={[
          { key: "name", header: "Organization", render: (c) => <span className="font-medium">{c.name}</span> },
          { key: "type", header: "Relationship", render: (c) => <Chip tone="info">{c.type === "reference_lab" ? "Reference Lab" : "Client Lab"}</Chip> },
          { key: "contact", header: "Contact", render: (c) => `${c.contactPerson} · ${c.contactEmail}` },
        ]}
        emptyDescription="No reference-lab partners configured."
      />
    </div>
  );
}
