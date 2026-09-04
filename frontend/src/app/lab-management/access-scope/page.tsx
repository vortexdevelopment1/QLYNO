"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { DataTable } from "@/components/ui/Table";
import { Chip } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useDemo } from "@/state/demo-context";
import { MOCK_LAB_MEMBERSHIPS } from "@/data/mock/lab-management";
import { MOCK_DEPARTMENTS, MOCK_SITES } from "@/data/mock/integrations";

export default function AccessScopePage() {
  const { session } = useDemo(); const { showToast } = useToast(); if (!session) return null;
  const sites = MOCK_SITES.filter((site) => session.allowedSiteIds.includes(site.id)); const departments = MOCK_DEPARTMENTS.filter((department) => session.allowedDepartmentIds.includes(department.id)); const members = MOCK_LAB_MEMBERSHIPS.filter((member) => member.tenantId === session.tenantId);
  return <div className="space-y-6"><EntityHeader eyebrow="Lab Management" title="Site & Department Scope" subtitle="Assignments are restricted to the active tenant and your delegated maximum scope." /><div className="flex flex-wrap gap-2">{sites.map((site) => <Chip key={site.id} tone="info">{site.name}</Chip>)}{departments.map((department) => <Chip key={department.id} tone="neutral">{department.name}</Chip>)}</div><DataTable rows={members} rowKey={(m) => m.id} columns={[{ key: "user", header: "Team member", render: (m) => <span className="font-medium">{m.name}</span> }, { key: "sites", header: "Authorized sites", render: (m) => m.siteIds.map((id) => sites.find((site) => site.id === id)?.name).filter(Boolean).join(", ") }, { key: "departments", header: "Departments / work areas", render: (m) => m.departmentIds.map((id) => departments.find((department) => department.id === id)?.name).filter(Boolean).join(", ") }, { key: "action", header: "Action", render: (m) => <Button size="sm" variant="outline" onClick={() => showToast({ title: "Scope editor opened", description: `${m.name} · only permitted sites and departments are available.`, tone: "info" })}>Edit scope</Button> }]} /></div>;
}
