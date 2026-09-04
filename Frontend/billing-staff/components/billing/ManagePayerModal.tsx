"use client";

import React, { useState } from "react";
import { Modal } from "@/billing-staff/components/ui/Modal";
import { useApp } from "@/billing-staff/context/AppContext";
import { Payer, PayerType } from "@/billing-staff/types";
import { nextId } from "@/billing-staff/lib/utils";

interface ManagePayerModalProps {
  open: boolean;
  onClose: () => void;
}

export function ManagePayerModal({ open, onClose }: ManagePayerModalProps) {
  const { payers, dispatch } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [editingPayer, setEditingPayer] = useState<Payer | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [type, setType] = useState<PayerType>("insurance");
  const [payerCode, setPayerCode] = useState("");
  const [contact, setContact] = useState("");
  const [tpaContactPerson, setTpaContactPerson] = useState("");
  const [tpaEmail, setTpaEmail] = useState("");
  const [error, setError] = useState("");

  function resetForm() {
    setName("");
    setType("insurance");
    setPayerCode("");
    setContact("");
    setTpaContactPerson("");
    setTpaEmail("");
    setError("");
    setIsAdding(false);
    setEditingPayer(null);
  }

  function handleStartAdd() {
    resetForm();
    setIsAdding(true);
  }

  function handleStartEdit(p: Payer) {
    setEditingPayer(p);
    setName(p.name);
    setType(p.type);
    setPayerCode(p.payerCode || "");
    setContact(p.contact || "");
    setTpaContactPerson(p.tpaContactPerson || "");
    setTpaEmail(p.tpaEmail || "");
    setIsAdding(false);
    setError("");
  }

  function handleSave() {
    setError("");
    if (!name.trim()) {
      setError("Payer/TPA name is required.");
      return;
    }

    if (editingPayer) {
      dispatch({
        type: "UPDATE_PAYER",
        payerId: editingPayer.id,
        patch: {
          name: name.trim(),
          type,
          payerCode: payerCode.trim() || undefined,
          contact: contact.trim() || undefined,
          tpaContactPerson: tpaContactPerson.trim() || undefined,
          tpaEmail: tpaEmail.trim() || undefined,
        },
      });
    } else {
      const newPayer: Payer = {
        id: nextId("payer"),
        name: name.trim(),
        type,
        payerCode: payerCode.trim() || `PAYER-${Math.floor(1000 + Math.random() * 8999)}`,
        contact: contact.trim() || undefined,
        tpaContactPerson: tpaContactPerson.trim() || undefined,
        tpaEmail: tpaEmail.trim() || undefined,
        active: true,
      };
      dispatch({ type: "ADD_PAYER", payer: newPayer });
    }

    resetForm();
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Manage Permitted Payers & TPAs"
      footer={
        <div className="flex justify-between w-full">
          {!isAdding && !editingPayer ? (
            <button
              onClick={handleStartAdd}
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700"
            >
              + Add New Payer / TPA
            </button>
          ) : (
            <button
              onClick={resetForm}
              className="rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 hover:bg-ink-50"
            >
              Cancel Edit
            </button>
          )}
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="rounded-lg bg-ink-800 px-4 py-1.5 text-xs font-medium text-white hover:bg-ink-900"
          >
            Done
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-xs text-ink-500">
          Maintain permitted health insurance companies, TPAs, and corporate billing entities for claim submissions.
        </p>

        {error && <p className="rounded-md bg-red-50 p-2 text-xs text-red-700">{error}</p>}

        {(isAdding || editingPayer) && (
          <div className="rounded-lg border border-brand-200 bg-brand-50/30 p-3 space-y-3">
            <h4 className="text-xs font-semibold text-brand-800">
              {editingPayer ? `Edit Payer: ${editingPayer.name}` : "Add New Insurance / TPA Payer"}
            </h4>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs">
              <div>
                <label className="mb-1 block font-medium text-ink-700">Payer / TPA Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. ICICI Lombard Health"
                  className="w-full rounded-md border border-ink-200 p-1.5 text-xs focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-ink-700">Payer Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as PayerType)}
                  className="w-full rounded-md border border-ink-200 p-1.5 text-xs focus:border-brand-500 focus:outline-none"
                >
                  <option value="insurance">Insurance Company</option>
                  <option value="corporate">Corporate Health Plan</option>
                  <option value="self">Self Pay</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block font-medium text-ink-700">Payer / TPA Code</label>
                <input
                  type="text"
                  value={payerCode}
                  onChange={(e) => setPayerCode(e.target.value)}
                  placeholder="e.g. ICICI-TPA-01"
                  className="w-full rounded-md border border-ink-200 p-1.5 text-xs focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-ink-700">Claims Hotline / Contact</label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="e.g. +91 1800 2666 / claims@icici.example"
                  className="w-full rounded-md border border-ink-200 p-1.5 text-xs focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-ink-700">TPA Desk Contact Person</label>
                <input
                  type="text"
                  value={tpaContactPerson}
                  onChange={(e) => setTpaContactPerson(e.target.value)}
                  placeholder="e.g. Rajesh Kumar (Desk Executive)"
                  className="w-full rounded-md border border-ink-200 p-1.5 text-xs focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-ink-700">Pre-auth Portal Email</label>
                <input
                  type="email"
                  value={tpaEmail}
                  onChange={(e) => setTpaEmail(e.target.value)}
                  placeholder="e.g. preauth@icicilombard.example"
                  className="w-full rounded-md border border-ink-200 p-1.5 text-xs focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-md border border-ink-200 px-3 py-1 text-xs font-medium text-ink-600 hover:bg-ink-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-md bg-brand-600 px-3 py-1 text-xs font-medium text-white hover:bg-brand-700"
              >
                Save Payer Information
              </button>
            </div>
          </div>
        )}

        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase text-ink-600">
            Permitted Payer List ({payers.length})
          </h4>

          <div className="max-h-60 overflow-y-auto space-y-1.5">
            {payers.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-ink-100 bg-ink-50/50 p-2.5 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink-800">{p.name}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${
                        p.type === "insurance"
                          ? "bg-blue-100 text-blue-700"
                          : p.type === "corporate"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-ink-100 text-ink-600"
                      }`}
                    >
                      {p.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-400">
                    {p.contact || "No contact specified"}
                    {p.tpaContactPerson ? ` · Contact: ${p.tpaContactPerson}` : ""}
                  </p>
                </div>

                {p.type !== "self" && (
                  <button
                    onClick={() => handleStartEdit(p)}
                    className="rounded text-xs font-medium text-brand-600 hover:underline px-2 py-1"
                  >
                    Edit Details
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
