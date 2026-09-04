"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/billing-staff/components/ui/Modal";
import { useApp } from "@/billing-staff/context/AppContext";
import { InsuranceClaim } from "@/billing-staff/types";
import { nextId, formatINR } from "@/billing-staff/lib/utils";
import { SearchableSelect } from "@/billing-staff/components/ui/SearchableSelect";

interface CreateClaimModalProps {
  open: boolean;
  onClose: () => void;
  prefillInvoiceId?: string;
}

const DEFAULT_REQUIRED_DOCUMENTS = [
  "Pre-Authorization Form",
  "Final Itemized Invoice",
  "Discharge Summary",
  "Diagnostic & Radiology Reports",
  "Patient Govt Photo ID Proof",
];

export function CreateClaimModal({ open, onClose, prefillInvoiceId }: CreateClaimModalProps) {
  const { currentOrg, invoices, patients, payers, insuranceClaims, dispatch } = useApp();

  const eligibleInvoices = invoices.filter(
    (i) =>
      i.organizationId === currentOrg.id &&
      i.status !== "cancelled" &&
      !insuranceClaims.some((c) => c.invoiceId === i.id)
  );

  const [invoiceId, setInvoiceId] = useState(prefillInvoiceId || "");
  const [payerId, setPayerId] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [claimedAmount, setClaimedAmount] = useState<number | "">("");
  const [error, setError] = useState("");

  const selectedInvoice = invoices.find((i) => i.id === invoiceId);
  const selectedPatient = patients.find((p) => p.id === selectedInvoice?.patientId);

  useEffect(() => {
    if (prefillInvoiceId) {
      setInvoiceId(prefillInvoiceId);
    }
  }, [prefillInvoiceId]);

  useEffect(() => {
    if (selectedInvoice) {
      setClaimedAmount(selectedInvoice.total);
      if (selectedInvoice.payerId && selectedInvoice.payerId !== "payer-self") {
        setPayerId(selectedInvoice.payerId);
      } else {
        const firstInsurancePayer = payers.find((p) => p.type !== "self");
        if (firstInsurancePayer) setPayerId(firstInsurancePayer.id);
      }
    }
  }, [selectedInvoice, payers]);

  function handleSubmit() {
    setError("");
    if (!invoiceId || !selectedInvoice) {
      setError("Please select a valid invoice to link this insurance claim to.");
      return;
    }
    if (!payerId) {
      setError("Please select an insurance payer / TPA.");
      return;
    }
    if (!policyNumber.trim()) {
      setError("Policy / Card Number is required.");
      return;
    }
    if (typeof claimedAmount !== "number" || claimedAmount <= 0) {
      setError("Claimed amount must be greater than zero.");
      return;
    }

    const claimId = nextId("claim");
    const newClaim: InsuranceClaim = {
      id: claimId,
      invoiceId,
      patientId: selectedInvoice.patientId,
      payerId,
      policyNumber: policyNumber.trim(),
      status: "pending_verification",
      claimedAmount,
      patientResponsibility: 0,
      payerOutstanding: claimedAmount,
      documentsAttached: ["Prescription copy"],
      requiredDocuments: DEFAULT_REQUIRED_DOCUMENTS,
      lastUpdated: new Date().toISOString().split("T")[0],
      organizationId: currentOrg.id,
    };

    dispatch({ type: "CREATE_INSURANCE_CLAIM", claim: newClaim });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Initiate Insurance / TPA Claim"
      footer={
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Initiate Claim
          </button>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        <p className="text-ink-500">
          Create a new insurance claim linked to an issued or draft invoice to track verification, pre-authorization, and settlement.
        </p>

        {error && <p className="rounded-md bg-red-50 p-2 text-red-700 font-medium">{error}</p>}

        <div>
          <label htmlFor="select-invoice" className="mb-1 block font-medium text-ink-700">Select Invoice *</label>
          <SearchableSelect
            id="select-invoice"
            value={invoiceId}
            onChange={setInvoiceId}
            placeholder="Select an invoice..."
            options={eligibleInvoices.map((i) => {
              const p = patients.find((pat) => pat.id === i.patientId);
              return {
                value: i.id,
                label: `${i.invoiceNumber} — ${p?.name || "Unknown"} (${formatINR(i.total)})`,
                searchKeywords: p?.name,
              };
            })}
          />
        </div>

        {selectedInvoice && selectedPatient && (
          <div className="rounded-lg border border-ink-100 bg-ink-50/50 p-3 space-y-1">
            <p className="font-semibold text-ink-800">{selectedPatient.name} (UHID: {selectedPatient.uhid})</p>
            <p className="text-ink-500">Invoice Total: <span className="font-semibold text-ink-900">{formatINR(selectedInvoice.total)}</span> · Date: {selectedInvoice.date}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="select-payer" className="mb-1 block font-medium text-ink-700">Insurance Payer / TPA *</label>
            <select
              id="select-payer"
              value={payerId}
              onChange={(e) => setPayerId(e.target.value)}
              className="w-full rounded-lg border border-ink-200 p-2 text-sm focus:border-brand-500 focus:outline-none"
            >
              <option value="">Select Payer...</option>
              {payers
                .filter((p) => p.type !== "self")
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.type})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label htmlFor="policy-no" className="mb-1 block font-medium text-ink-700">Policy / Health Card # *</label>
            <input
              id="policy-no"
              type="text"
              value={policyNumber}
              onChange={(e) => setPolicyNumber(e.target.value)}
              placeholder="e.g. STAR-PL-99201"
              className="w-full rounded-lg border border-ink-200 p-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="claimed-amt" className="mb-1 block font-medium text-ink-700">Claimed Amount (INR) *</label>
          <input
            id="claimed-amt"
            type="number"
            value={claimedAmount}
            onChange={(e) => setClaimedAmount(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="e.g. 50000"
            className="w-full rounded-lg border border-ink-200 p-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
      </div>
    </Modal>
  );
}
