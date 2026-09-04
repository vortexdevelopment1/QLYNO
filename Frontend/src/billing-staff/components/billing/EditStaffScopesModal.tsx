"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/billing-staff/components/ui/Modal";
import { useApp } from "@/billing-staff/context/AppContext";
import { BillingScope, SCOPE_LABELS, StaffUser } from "@/billing-staff/types";

interface EditStaffScopesModalProps {
  open: boolean;
  onClose: () => void;
  staffUser: StaffUser | null;
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

export function EditStaffScopesModal({ open, onClose, staffUser }: EditStaffScopesModalProps) {
  const { dispatch } = useApp();
  const [selectedScopes, setSelectedScopes] = useState<BillingScope[]>([]);

  useEffect(() => {
    if (staffUser) {
      setSelectedScopes(staffUser.scopes);
    }
  }, [staffUser]);

  if (!staffUser) return null;

  function toggleScope(scope: BillingScope) {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  }

  function handleSave() {
    if (!staffUser) return;
    dispatch({
      type: "UPDATE_STAFF_SCOPES",
      staffId: staffUser.id,
      scopes: selectedScopes,
    });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Assign Billing Scopes — ${staffUser.name}`}
      footer={
        <>
          <button
            onClick={onClose}
            className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Save Scope Assignments
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-xs text-ink-500">
          Hospital Billing Staff can hold one or more permitted scopes. Scope assignments limit staff visibility to specific hospital departments.
        </p>

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
    </Modal>
  );
}
