"use client";

import React, { useState } from "react";
import { Modal } from "@/billing-staff/components/ui/Modal";
import { useApp } from "@/billing-staff/context/AppContext";
import { InsuranceClaim } from "@/billing-staff/types";

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
  "Corporate Authorization Letter",
  "Surgical Notes & OT Log",
];

export function InsuranceClaimDocsModal({ open, onClose, claim }: InsuranceClaimDocsModalProps) {
  const { insuranceClaims, dispatch } = useApp();
  const [selectedDoc, setSelectedDoc] = useState(DOCUMENT_TYPES[0]);
  const [fileNameInput, setFileNameInput] = useState("");
  const [uploadToast, setUploadToast] = useState<string | null>(null);

  // Always bind to the live claim object from AppContext state for instant reactive updates
  const activeClaim = insuranceClaims.find((c) => c.id === claim?.id) || claim;

  if (!activeClaim) return null;

  function handleAttach() {
    if (!activeClaim) return;
    const docName = fileNameInput.trim() ? `${selectedDoc} (${fileNameInput.trim()})` : selectedDoc;
    dispatch({
      type: "ATTACH_CLAIM_DOCUMENT",
      claimId: activeClaim.id,
      documentName: docName,
    });
    setFileNameInput("");
    setUploadToast(`Attached "${docName}" successfully.`);
    setTimeout(() => setUploadToast(null), 3000);
  }

  function handleRemove(docName: string) {
    if (!activeClaim) return;
    dispatch({
      type: "REMOVE_CLAIM_DOCUMENT",
      claimId: activeClaim.id,
      documentName: docName,
    });
    setUploadToast(`Removed "${docName}".`);
    setTimeout(() => setUploadToast(null), 3000);
  }

  const attachedCount = activeClaim.documentsAttached.length;
  const requiredCount = activeClaim.requiredDocuments.length || 1;
  const isComplete = attachedCount >= requiredCount;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Billing Documents Checklist — Policy ${activeClaim.policyNumber}`}
      footer={
        <button
          onClick={onClose}
          className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-medium text-white hover:bg-brand-700"
        >
          Done
        </button>
      }
    >
      <div className="space-y-4 text-xs">
        <p className="text-ink-500">
          Insurance/TPA claims require completed supporting billing documents prior to submission and settlement.
        </p>

        {uploadToast && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700 font-medium">{uploadToast}</p>
        )}

        <div className="rounded-lg border border-ink-100 bg-ink-50/50 p-3 flex items-center justify-between">
          <div>
            <p className="font-semibold text-ink-800">Required Documents Status</p>
            <p className="text-[11px] text-ink-500">
              {attachedCount} of {requiredCount} document type(s) attached
            </p>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              isComplete ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
            }`}
          >
            {isComplete ? "✓ Document Checklist Complete" : "Pending Required Documents"}
          </span>
        </div>

        <div>
          <h4 className="mb-2 font-semibold uppercase text-ink-600">Attached Documents</h4>
          {activeClaim.documentsAttached.length === 0 ? (
            <p className="py-2 text-ink-400">No documents attached yet.</p>
          ) : (
            <ul className="space-y-1.5 max-h-48 overflow-y-auto">
              {activeClaim.documentsAttached.map((doc, idx) => (
                <li
                  key={`${doc}-${idx}`}
                  className="flex items-center justify-between rounded-lg border border-ink-100 bg-white p-2.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">📄</span>
                    <div>
                      <p className="font-medium text-ink-800">{doc}</p>
                      <p className="text-[10px] text-emerald-600 font-semibold">Attached &amp; Verified</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(doc)}
                    className="text-[11px] font-medium text-red-600 hover:underline px-2 py-1"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-ink-100 pt-3 space-y-3">
          <h4 className="font-semibold text-ink-700">Attach New Supporting Document</h4>

          <div>
            <label htmlFor="doc-type-select" className="mb-1 block font-medium text-ink-600">Document Type</label>
            <select
              id="doc-type-select"
              value={selectedDoc}
              onChange={(e) => setSelectedDoc(e.target.value)}
              className="w-full rounded-lg border border-ink-200 p-2 text-xs focus:border-brand-500 focus:outline-none"
            >
              {DOCUMENT_TYPES.map((dt) => (
                <option key={dt} value={dt}>
                  {dt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="file-name-input" className="mb-1 block font-medium text-ink-600">File Reference / Note (Optional)</label>
            <input
              id="file-name-input"
              type="text"
              value={fileNameInput}
              onChange={(e) => setFileNameInput(e.target.value)}
              placeholder="e.g. Discharge_Summary_Pat9.pdf"
              className="w-full rounded-lg border border-ink-200 p-2 text-xs focus:border-brand-500 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleAttach}
            className="w-full rounded-lg bg-brand-600 px-3 py-2 font-medium text-white hover:bg-brand-700"
          >
            + Upload &amp; Attach Document
          </button>
        </div>
      </div>
    </Modal>
  );
}
