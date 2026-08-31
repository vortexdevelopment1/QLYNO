"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SCOPE_LABELS, StaffUser } from "@/types";
import { formatDate } from "@/lib/utils";
import { EditStaffScopesModal } from "@/components/billing/EditStaffScopesModal";
import { InviteStaffModal } from "@/components/billing/InviteStaffModal";

export default function StaffPage() {
  const { currentOrg, currentUser, staffUsers, dispatch } = useApp();
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const orgStaff = useMemo(() => staffUsers.filter((u) => u.organizationId === currentOrg.id), [staffUsers, currentOrg.id]);
  const isAdmin = currentUser.role === "billing_admin";
  const isSingleAssignmentOrg = currentOrg.type === "solo_doctor" || currentOrg.type === "clinic";
  const activeStaffCount = orgStaff.filter((u) => u.status === "active").length;

  const columns: Column<StaffUser>[] = [
    { header: "Name", accessor: (r) => <span className="font-medium text-ink-800">{r.name}</span> },
    { header: "Contact", accessor: (r) => <span>{r.email}<span className="block text-xs text-ink-400">{r.phone}</span></span> },
    { header: "Scope", accessor: (r) => (r.scopes.length ? r.scopes.map((s) => SCOPE_LABELS[s]).join(", ") : "Full access (unscoped)") },
    { header: "Assigned", accessor: (r) => formatDate(r.assignedDate) },
    { header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
    {
      header: "Action",
      accessor: (r) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          {isAdmin && currentOrg.type === "hospital" && (
            <button
              onClick={() => setEditingStaff(r)}
              className="rounded-md border border-brand-200 bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100"
            >
              Edit Scopes
            </button>
          )}
          {isAdmin ? (
            <>
              {r.status === "active" && (
                <button
                  onClick={() => dispatch({ type: "UPDATE_STAFF_STATUS", staffId: r.id, status: "suspended" })}
                  className="rounded-md border border-amber-200 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50"
                >
                  Suspend
                </button>
              )}
              {r.status === "suspended" && (
                <button
                  onClick={() => dispatch({ type: "UPDATE_STAFF_STATUS", staffId: r.id, status: "active" })}
                  className="rounded-md border border-emerald-200 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                >
                  Reactivate
                </button>
              )}
              {(r.status === "invited" || r.status === "pending") && (
                <button
                  onClick={() => dispatch({ type: "UPDATE_STAFF_STATUS", staffId: r.id, status: "active" })}
                  className="rounded-md border border-emerald-200 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                >
                  Mark Active
                </button>
              )}
              {r.status !== "removed" && r.status !== "archived" && (
                <button
                  onClick={() => dispatch({ type: "UPDATE_STAFF_STATUS", staffId: r.id, status: "removed" })}
                  className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                >
                  Remove
                </button>
              )}
              {r.status === "removed" && (
                <button
                  onClick={() => dispatch({ type: "UPDATE_STAFF_STATUS", staffId: r.id, status: "archived" })}
                  className="rounded-md border border-ink-200 px-2 py-1 text-xs font-medium text-ink-600 hover:bg-ink-50"
                >
                  Archive
                </button>
              )}
            </>
          ) : (
            <span className="text-xs text-ink-400">Admin only</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Staff / Assignments"
        description={
          currentOrg.type === "hospital"
            ? "Hospital billing staff are scoped by permission/function. Billing Staff is a role inside the organization — never a separate organization."
            : `${currentOrg.type === "solo_doctor" ? "Solo Doctor" : "Clinic"} organizations have exactly one active Billing Staff assignment.`
        }
        actions={
          isAdmin ? (
            <button
              onClick={() => setShowInviteModal(true)}
              className="rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-medium text-white shadow-sm hover:bg-brand-700"
            >
              + Invite Billing Staff
            </button>
          ) : undefined
        }
      />

      {isSingleAssignmentOrg && (
        <div className="rounded-lg border border-brand-200 bg-brand-50/50 p-3 text-xs text-brand-900">
          🔒 <strong>Active Staff Limit:</strong> This {currentOrg.type === "solo_doctor" ? "Solo Doctor" : "Clinic"} organization is configured for 1 active billing staff assignment. To assign a new staff member, suspend or remove the current active assignment first.
        </div>
      )}

      <DataTable columns={columns} rows={orgStaff} rowKey={(r) => r.id} emptyTitle="No staff assigned" />
      
      <div className="rounded-lg border border-ink-100 bg-ink-50/50 p-3 text-xs text-ink-500 space-y-1">
        <p className="font-semibold text-ink-700">Staff Assignment Guidelines:</p>
        <p>• Account Lifecycle: <code>Invited → Pending → Active ⇄ Suspended → Removed → Archived</code>.</p>
        <p>• Billing Staff accounts operate within the active organization context.</p>
        <p>• Historical actions performed by suspended or removed staff remain fully preserved in audit logs.</p>
      </div>

      <EditStaffScopesModal open={!!editingStaff} onClose={() => setEditingStaff(null)} staffUser={editingStaff} />
      <InviteStaffModal open={showInviteModal} onClose={() => setShowInviteModal(false)} />
    </div>
  );
}

