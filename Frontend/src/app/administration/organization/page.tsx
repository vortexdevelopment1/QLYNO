"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/Table";
import { Chip } from "@/components/ui/Badge";
import { useDemo } from "@/state/demo-context";
import { TENANT_MODE_CONFIG } from "@/config/tenant-modes";
import { MOCK_SITES, MOCK_DEPARTMENTS } from "@/data/mock/integrations";

export default function OrganizationPage() {
  const { tenantMode } = useDemo();
  const config = TENANT_MODE_CONFIG[tenantMode];

  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 12 · Analytics & Administration" title="Organization" subtitle="Tenant, legal entity, sites and departments configuration." />
      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold text-text-main">Tenant profile</h3>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div><dt className="text-xs text-text-muted">Legal entity</dt><dd className="text-sm font-medium">HMS Diagnostics &amp; Sunrise Hospital Network Pvt Ltd</dd></div>
          <div><dt className="text-xs text-text-muted">Operating profile</dt><dd className="text-sm font-medium">{config.label}</dd></div>
          <div><dt className="text-xs text-text-muted">Accreditation</dt><dd className="text-sm font-medium">NABL-recognized scope (demo only)</dd></div>
        </dl>
      </Card>
      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold text-text-main">Sites & branches</h3>
        <DataTable
          rows={MOCK_SITES}
          rowKey={(s) => s.id}
          columns={[
            { key: "name", header: "Site", render: (s) => <span className="font-medium">{s.name}</span> },
            { key: "type", header: "Type", render: (s) => <Chip tone="info">{s.type.replace(/_/g, " ")}</Chip> },
            { key: "city", header: "City", render: (s) => s.city },
          ]}
        />
      </Card>
      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold text-text-main">Departments / work areas</h3>
        <DataTable
          rows={MOCK_DEPARTMENTS}
          rowKey={(d) => d.id}
          columns={[
            { key: "name", header: "Department", render: (d) => d.name },
            { key: "site", header: "Site", render: (d) => MOCK_SITES.find((s) => s.id === d.siteId)?.name ?? d.siteId },
          ]}
        />
      </Card>
    </div>
  );
}
