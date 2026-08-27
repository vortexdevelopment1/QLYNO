"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { InsuranceClaim } from "@/types";

interface InsuranceClaimDocsModalProps {
  open: boolean;
  onClose: () => void;
  claim: InsuranceClaim | null;
}

const DOCUMENT_TYPES = [
  "Pre-Authorization Form",
  "Final Itemized Invoice",
  "Discharge Summary",
  "Diagnostic & Radiology Reports",
  "Pharmacy Prescriptions & Receipts",
  "Patient Govt Photo ID Proof",
];

export function InsuranceClaimDocsModal({ open, onClose, claim }: InsuranceClaimDocsModalProps) {
  const { dispatch } = useApp();
  const [selectedDoc, setSelectedDoc] = useState(DOCUMENT_TYPES[0]);

  if (!claim) return null;

  function handleAttach() {
    if (!claim) return;
    dispatch({
      type: "ATTACH_CLAIM_DOCUMENT",
      claimId: claim.id,
      documentName: selectedDoc,
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Attach Supporting Documents — Claim ${claim.policyNumber}`}
      footer={
        <button
          onClick={onClose}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Done
        </button>
      }
    >
      <div className="space-y-4">
        <p className="text-xs text-ink-500">
          PRD Section 14 — Insurance/TPA claims require specific supporting billing documents before submission and settlement.
        </p>

        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase text-ink-600">
            Attached Documents ({claim.documentsAttached.length})
          </h4>
          {claim.documentsAttached.length === 0 ? (
            <p className="py-1 text-xs text-ink-400">No documents attached yet.</p>
          ) : (
            <ul className="space-y-1">
              {claim.documentsAttached.map((doc, idx) => (
                <li key={idx} className="flex items-center justify-between rounded bg-ink-50 p-2 text-xs font-medium text-ink-800">
                  <span>📄 {doc}</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">Attached</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-ink-100 pt-3">
          <label htmlFor="doc-type-select" className="mb-1 block text-xs font-medium text-ink-700">
            Attach Required Document
          </label>
          <div className="flex gap-2">
            <select
              id="doc-type-select"
              value={selectedDoc}
              onChange={(e) => setSelectedDoc(e.target.value)}
              className="flex-1 rounded-lg border border-ink-200 p-2 text-sm focus:border-brand-500 focus:outline-none"
            >
              {DOCUMENT_TYPES.map((dt) => (
                <option key={dt} value={dt}>
                  {dt}
                </option>
              ))}
            </select>
            <button
              onClick={handleAttach}
              className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-medium text-white hover:bg-brand-700"
            >
              Attach File
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
