"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { DataTable } from "@/components/ui/Table";
import { Chip } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { MOCK_USERS, MOCK_SITES } from "@/data/mock/integrations";
import { ROLE_CONFIG } from "@/config/roles";

export default function AdminUsersPage() {
  const { showToast } = useToast();

  return (
    <div className="space-y-6">
      <EntityHeader
        eyebrow="Module 12 · Analytics & Administration"
        title="Users"
        subtitle="This is a UI simulation only — real backend authorization must replace frontend role hiding."
        actions={<Button size="sm" onClick={() => showToast({ title: "Invite user form opened (simulated)", tone: "info" })}>Invite user</Button>}
      />
      <DataTable
        rows={MOCK_USERS}
        rowKey={(u) => u.id}
        columns={[
          { key: "name", header: "Name", render: (u) => <span className="font-medium">{u.name}</span> },
          { key: "role", header: "Role", render: (u) => <Chip tone="info">{ROLE_CONFIG[u.roleId].label}</Chip> },
          { key: "site", header: "Site scope", render: (u) => MOCK_SITES.find((s) => s.id === u.siteId)?.name ?? u.siteId },
        ]}
      />
    </div>
  );
}
