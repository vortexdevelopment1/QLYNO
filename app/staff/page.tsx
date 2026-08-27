"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SCOPE_LABELS, StaffUser } from "@/types";
import { formatDate } from "@/lib/utils";
import { EditStaffScopesModal } from "@/components/billing/EditStaffScopesModal";

export default function StaffPage() {
  const { currentOrg, currentUser, staffUsers, dispatch } = useApp();
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);

  const orgStaff = useMemo(() => staffUsers.filter((u) => u.organizationId === currentOrg.id), [staffUsers, currentOrg.id]);
  const isAdmin = currentUser.role === "billing_admin";

  const columns: Column<StaffUser>[] = [
    { header: "Name", accessor: (r) => <span className="font-medium text-ink-800">{r.name}</span> },
    { header: "Contact", accessor: (r) => <span>{r.email}<span className="block text-xs text-ink-400">{r.phone}</span></span> },
    { header: "Scope", accessor: (r) => (r.scopes.length ? r.scopes.map((s) => SCOPE_LABELS[s]).join(", ") : "Full access (unscoped)") },
    { header: "Assigned", accessor: (r) => formatDate(r.assignedDate) },
    { header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
    {
      header: "Action",
      accessor: (r) => (
        <div className="flex gap-2">
          {isAdmin && currentOrg.type === "hospital" && (
            <button
              onClick={() => setEditingStaff(r)}
              className="rounded-md border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100"
            >
              Edit Scopes
            </button>
          )}
          {isAdmin ? (
            r.status === "active" ? (
              <button onClick={() => dispatch({ type: "UPDATE_STAFF_STATUS", staffId: r.id, status: "suspended" })} className="rounded-md border border-amber-200 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50">Suspend</button>
            ) : r.status === "suspended" ? (
              <button onClick={() => dispatch({ type: "UPDATE_STAFF_STATUS", staffId: r.id, status: "active" })} className="rounded-md border border-emerald-200 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50">Reactivate</button>
            ) : r.status === "invited" ? (
              <button onClick={() => dispatch({ type: "UPDATE_STAFF_STATUS", staffId: r.id, status: "active" })} className="rounded-md border border-ink-200 px-2.5 py-1 text-xs font-medium text-ink-700 hover:bg-ink-50">Mark Active</button>
            ) : (
              <span className="text-xs text-ink-400">—</span>
            )
          ) : (
            <span className="text-xs text-ink-400">Admin only</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Staff / Assignments"
        description={
          currentOrg.type === "hospital"
            ? "Hospital billing staff are scoped by permission/function. Billing Staff is a role inside the organization — never a separate organization."
            : `${currentOrg.type === "solo_doctor" ? "Solo Doctor" : "Clinic"} organizations have one active Billing Staff assignment.`
        }
      />
      <DataTable columns={columns} rows={orgStaff} rowKey={(r) => r.id} emptyTitle="No staff assigned" />
      <p className="mt-3 text-xs text-ink-400">Lifecycle: Invited → Pending → Active → Suspended → Removed → Archived. No organization record is ever created for a Billing Staff member.</p>
      <EditStaffScopesModal open={!!editingStaff} onClose={() => setEditingStaff(null)} staffUser={editingStaff} />
    </div>
  );
}
