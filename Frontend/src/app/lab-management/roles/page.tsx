"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { useDemo } from "@/state/demo-context";
import { LAB_ROLE_TEMPLATES, PERMISSION_GROUPS } from "@/data/mock/lab-management";
import { canAssignLabRole, canCreateCustomLabRoles } from "@/lib/laboratory-permissions";

export default function RolesPermissionsPage() {
  const { session } = useDemo(); const { showToast } = useToast(); if (!session) return null;
  return <div className="space-y-6"><EntityHeader eyebrow="Lab Management" title="Roles & Permissions" subtitle="Administrative roles never imply clinical authorization. Medical validation and report release require an explicit Pathologist or Lab Director role." actions={<Button size="sm" disabled={!canCreateCustomLabRoles(session)} disabledReason="Your delegation does not permit custom laboratory roles" onClick={() => showToast({ title: "Custom role builder opened", description: "Available permissions are limited to your delegation boundary.", tone: "info" })}>Create custom role</Button>} />
    <div className="grid gap-4 lg:grid-cols-2">{LAB_ROLE_TEMPLATES.map((role) => { const assignable = canAssignLabRole(session, role.id); return <Card key={role.id} className="p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="font-display text-lg font-semibold">{role.label}</h3><p className="mt-1 text-xs text-text-muted">{role.id.replaceAll("_", " ")}</p></div><Chip tone={assignable ? "success" : "neutral"}>{assignable ? "Assignable" : "Outside boundary"}</Chip></div><div className="mt-4 flex flex-wrap gap-1.5">{role.permissions.map((permission) => <span key={permission} className="rounded-full bg-app-bg px-2 py-1 text-[10px] text-text-muted">{permission}</span>)}</div></Card>; })}</div>
    <Card className="p-5"><h3 className="font-display text-lg font-semibold">Permission catalogue</h3><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(PERMISSION_GROUPS).map(([group, permissions]) => <div key={group}><p className="text-xs font-semibold text-text-main">{group}</p><ul className="mt-1 space-y-1">{permissions.map((permission) => <li key={permission} className="text-xs text-text-muted">{permission}</li>)}</ul></div>)}</div></Card>
  </div>;
}
