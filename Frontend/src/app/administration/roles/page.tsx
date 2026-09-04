"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { DataTable } from "@/components/ui/Table";
import { Chip } from "@/components/ui/Badge";
import { ROLE_LIST } from "@/config/roles";

export default function AdminRolesPage() {
  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 12 · Analytics & Administration" title="Roles" subtitle="Prototype role definitions — frontend simulation only, not real backend authorization." />
      <DataTable
        rows={ROLE_LIST}
        rowKey={(r) => r.id}
        columns={[
          { key: "label", header: "Role", render: (r) => <span className="font-medium">{r.label}</span> },
          { key: "scope", header: "Scope", render: (r) => r.scopeNote },
          { key: "approve", header: "Can approve results", render: (r) => (r.canApproveResults ? <Chip tone="success">Yes</Chip> : <Chip tone="neutral">No</Chip>) },
          { key: "quality", header: "Quality access", render: (r) => (r.canAccessQuality ? <Chip tone="success">Yes</Chip> : <Chip tone="neutral">No</Chip>) },
          { key: "inventory", header: "Inventory access", render: (r) => (r.canAccessInventory ? <Chip tone="success">Yes</Chip> : <Chip tone="neutral">No</Chip>) },
        ]}
      />
    </div>
  );
}
