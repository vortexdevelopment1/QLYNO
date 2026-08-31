"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { BillingScope, DEFAULT_STAFF_PERMISSIONS, ADMIN_PERMISSIONS, SCOPE_LABELS, StaffUser, UserRole, StaffStatus } from "@/types";
import { nextId } from "@/lib/utils";

interface InviteStaffModalProps {
  open: boolean;
  onClose: () => void;
}

const ALL_SCOPES: BillingScope[] = [
  "central",
  "opd",
  "ipd",
  "diagnostics",
  "pharmacy",
  "surgery",
  "insurance_tpa",
  "refund_desk",
];

export function InviteStaffModal({ open, onClose }: InviteStaffModalProps) {
  const { currentOrg, staffUsers, dispatch } = useApp();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+91 ");
  const [role, setRole] = useState<UserRole>("billing_staff");
  const [status, setStatus] = useState<StaffStatus>("active");
  const [selectedScopes, setSelectedScopes] = useState<BillingScope[]>(
    currentOrg.type === "hospital" ? ["opd"] : []
  );
  const [errorMsg, setErrorMsg] = useState("");

  const isSingleAssignmentOrg = currentOrg.type === "solo_doctor" || currentOrg.type === "clinic";
  const activeCount = staffUsers.filter(
    (u) => u.organizationId === currentOrg.id && u.status === "active"
  ).length;

  function toggleScope(scope: BillingScope) {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  }

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim() || !email.trim()) {
      setErrorMsg("Please enter both staff name and email address.");
      return;
    }

    // Single active assignment validation for Solo Doctor & Clinic
    if (isSingleAssignmentOrg && status === "active" && activeCount >= 1) {
      setErrorMsg(
        `This ${currentOrg.type === "solo_doctor" ? "Solo Doctor" : "Clinic"} organization already has an active Billing Staff assignment. Remove or suspend the current assignment before adding a new active one.`
      );
      return;
    }

    const newStaff: StaffUser = {
      id: nextId("staff"),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      organizationId: currentOrg.id,
      role,
      status,
      scopes: currentOrg.type === "hospital" ? selectedScopes : [],
      permissions: role === "billing_admin" ? { ...ADMIN_PERMISSIONS } : { ...DEFAULT_STAFF_PERMISSIONS },
      assignedDate: new Date().toISOString().split("T")[0],
    };

    dispatch({ type: "INVITE_STAFF", staff: newStaff });
    onClose();
    setName("");
    setEmail("");
    setPhone("+91 ");
    setErrorMsg("");
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Invite New Billing Staff"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleInvite}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Send Invite & Assign
          </button>
        </>
      }
    >
      <form onSubmit={handleInvite} className="space-y-4">
        {errorMsg && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-medium">
            ⚠️ {errorMsg}
          </div>
        )}

        {isSingleAssignmentOrg && activeCount >= 1 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            ℹ️ <strong>Note:</strong> {currentOrg.type === "solo_doctor" ? "Solo Doctor" : "Clinic"} orgs are capped at <strong>1 active assignment</strong>. You may invite this user with status &quot;Invited&quot; or &quot;Pending&quot;, but activating them requires removing/suspending the active assignee first.
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-ink-700 mb-1">Full Name (Indian Name)</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Aarav Sharma"
            className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aarav.sharma@qlyno-demo.in"
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98000 12345"
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            >
              <option value="billing_staff">Billing Staff</option>
              <option value="billing_admin">Billing Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">Initial Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StaffStatus)}
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            >
              <option value="active">Active</option>
              <option value="invited">Invited</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {currentOrg.type === "hospital" && (
          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">Assigned Scopes (Hospital)</label>
            <p className="text-xs text-ink-400 mb-2">Hospital staff are assigned department scopes to control billing visibility.</p>
            <div className="grid grid-cols-2 gap-2">
              {ALL_SCOPES.map((scope) => {
                const isChecked = selectedScopes.includes(scope);
                return (
                  <label
                    key={scope}
                    className={`flex items-center gap-2 rounded-lg border p-2 text-xs font-medium cursor-pointer ${
                      isChecked
                        ? "border-brand-500 bg-brand-50/60 text-brand-900"
                        : "border-ink-200 bg-white text-ink-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleScope(scope)}
                      className="rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span>{SCOPE_LABELS[scope]}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
