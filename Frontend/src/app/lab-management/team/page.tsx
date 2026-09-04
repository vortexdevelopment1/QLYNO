"use client";

import { useMemo, useState } from "react";
import { EntityHeader } from "@/components/ui/EntityHeader";
import { DataTable } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { useDemo } from "@/state/demo-context";
import { MOCK_LAB_MEMBERSHIPS } from "@/data/mock/lab-management";
import { MOCK_DEPARTMENTS, MOCK_SITES } from "@/data/mock/integrations";
import { canManageUserAtSite } from "@/lib/laboratory-permissions";
import { formatDateTime } from "@/lib/utils/format";

export default function TeamAccessPage() {
  const { session } = useDemo(); const { showToast } = useToast();
  const [statusOverrides, setStatusOverrides] = useState<Record<string, "ACTIVE" | "SUSPENDED">>({});
  const rows = useMemo(() => MOCK_LAB_MEMBERSHIPS.filter((member) => member.tenantId === session?.tenantId && member.siteIds.every((siteId) => session ? canManageUserAtSite(session, siteId) : false)), [session]);
  if (!session) return null;
  const canInvite = session.delegation?.canInviteUsers ?? session.administrativeRoles.includes("LAB_OWNER");
  return <div className="space-y-6"><EntityHeader eyebrow="Lab Management" title="Team & Access" subtitle={`Manage laboratory membership inside ${session.organizationName}. Identity remains owned by ${session.patientMasterOwner === "HMS" ? "the hospital directory" : "this laboratory tenant"}.`} actions={<div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => showToast({ title: session.patientMasterOwner === "HMS" ? "Hospital directory search opened" : "Employee directory opened", tone: "info" })}>Add existing employee</Button><Button size="sm" disabled={!canInvite} disabledReason="Your delegation permits access requests, not direct invitations" onClick={() => showToast({ title: "Employee invitation started", description: "Identity approval remains with the configured identity authority.", tone: "success" })}>{session.patientMasterOwner === "HMS" ? "Request new employee" : "Invite employee"}</Button></div>} />
    <DataTable rows={rows} rowKey={(m) => m.id} columns={[
      { key: "name", header: "Team member", render: (m) => <div><p className="font-medium">{m.name}</p><p className="text-xs text-text-muted">{m.employeeId} · {m.hospitalUserId}</p></div> },
      { key: "roles", header: "Laboratory roles", render: (m) => <div className="flex flex-wrap gap-1">{m.roles.map((role) => <Chip key={role} tone={role.includes("ADMIN") || role === "LAB_OWNER" ? "warning" : "info"}>{role.replaceAll("_", " ")}</Chip>)}</div> },
      { key: "scope", header: "Site / department scope", render: (m) => <div className="text-xs"><p>{m.siteIds.map((id) => MOCK_SITES.find((s) => s.id === id)?.name).join(", ")}</p><p className="text-text-muted">{m.departmentIds.map((id) => MOCK_DEPARTMENTS.find((d) => d.id === id)?.name).join(", ")}</p></div> },
      { key: "status", header: "Status", render: (m) => <Chip tone={(statusOverrides[m.id] ?? m.status) === "ACTIVE" ? "success" : (statusOverrides[m.id] ?? m.status) === "SUSPENDED" ? "critical" : "pending"}>{statusOverrides[m.id] ?? m.status}</Chip> },
      { key: "access", header: "Last access / auth", render: (m) => <div className="text-xs"><p>{formatDateTime(m.lastAccess)}</p><p className="text-text-muted">{m.authenticationSource.replace("_", " ")}</p></div> },
      { key: "actions", header: "Actions", render: (m) => { const current = statusOverrides[m.id] ?? m.status; const canDeactivate = session.delegation?.canDeactivateUsers ?? true; return <Button size="sm" variant="outline" disabled={!canDeactivate || m.hospitalUserId === session.userId} disabledReason="You cannot change this member within your delegation boundary" onClick={() => { const next = current === "SUSPENDED" ? "ACTIVE" : "SUSPENDED"; setStatusOverrides((prev) => ({ ...prev, [m.id]: next })); showToast({ title: next === "ACTIVE" ? "Laboratory access restored" : "Laboratory access suspended", description: m.name, tone: next === "ACTIVE" ? "success" : "warning" }); }}>{current === "SUSPENDED" ? "Restore" : "Suspend"}</Button>; } },
    ]} />
  </div>;
}
