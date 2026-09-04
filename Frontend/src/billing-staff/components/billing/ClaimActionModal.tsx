"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/billing-staff/components/ui/Modal";
import { useApp } from "@/billing-staff/context/AppContext";
import { InsuranceClaim } from "@/billing-staff/types";
import { formatINR } from "@/billing-staff/lib/utils";

export type ClaimActionMode = "verify" | "preauth" | "settlement";

interface ClaimActionModalProps {
  open: boolean;
  onClose: () => void;
  claim: InsuranceClaim | null;
  mode: ClaimActionMode;
}

export function ClaimActionModal({ open, onClose, claim, mode }: ClaimActionModalProps) {
  const { currentUser, payers, dispatch } = useApp();

  const [notes, setNotes] = useState("");
  const [preAuthNumber, setPreAuthNumber] = useState("");
  const [preAuthAmount, setPreAuthAmount] = useState<number | "">("");

  const [approvedAmount, setApprovedAmount] = useState<number | "">("");
  const [settledAmount, setSettledAmount] = useState<number | "">("");
  const [patientResponsibility, setPatientResponsibility] = useState<number | "">("");
  const [settlementReference, setSettlementReference] = useState("");
  const [error, setError] = useState("");

  const payer = payers.find((p) => p.id === claim?.payerId);

  useEffect(() => {
    if (claim) {
      setNotes(claim.verifierNotes || claim.settlementNotes || "");
      setPreAuthNumber(claim.preAuthNumber || `PA-${Math.floor(100000 + Math.random() * 899999)}`);
      setPreAuthAmount(claim.preAuthAmount || claim.claimedAmount);
      setApprovedAmount(claim.approvedAmount !== undefined ? claim.approvedAmount : claim.claimedAmount);
      setSettledAmount(claim.settledAmount !== undefined ? claim.settledAmount : claim.claimedAmount);
      setPatientResponsibility(claim.patientResponsibility || 0);
      setSettlementReference(claim.settlementReference || `NEFT-${payer?.name.substring(0, 4).toUpperCase() || "TPA"}-${Math.floor(10000 + Math.random() * 89999)}`);
      setError("");
    }
  }, [claim, payer]);

  if (!claim) return null;

  function handleApprovedAmountChange(val: number | "") {
    if (!claim) return;
    setApprovedAmount(val);
    if (typeof val === "number") {
      setSettledAmount(val);
      const computedPatientResp = Math.max(0, claim.claimedAmount - val);
      setPatientResponsibility(computedPatientResp);
    }
  }

  function handleSubmit() {
    if (!claim) return;
    setError("");
    if (mode === "verify") {
      dispatch({
        type: "VERIFY_CLAIM",
        claimId: claim.id,
        notes: notes.trim() || "Policy and coverage verified with payer desk.",
        user: currentUser.name,
      });
      onClose();
    } else if (mode === "preauth") {
      if (!preAuthNumber.trim()) {
        setError("Pre-authorization approval number is required.");
        return;
      }
      if (typeof preAuthAmount !== "number" || preAuthAmount < 0) {
        setError("Pre-authorized amount must be a valid number.");
        return;
      }
      dispatch({
        type: "UPDATE_PREAUTH",
        claimId: claim.id,
        preAuthNumber: preAuthNumber.trim(),
        preAuthAmount,
        notes: notes.trim() || undefined,
        user: currentUser.name,
      });
      onClose();
    } else if (mode === "settlement") {
      if (typeof approvedAmount !== "number" || approvedAmount < 0) {
        setError("Approved amount must be valid.");
        return;
      }
      if (typeof settledAmount !== "number" || settledAmount < 0) {
        setError("Settled amount must be valid.");
        return;
      }
      if (typeof patientResponsibility !== "number" || patientResponsibility < 0) {
        setError("Patient responsibility amount must be valid.");
        return;
      }
      dispatch({
        type: "RECORD_PAYER_SETTLEMENT",
        claimId: claim.id,
        approvedAmount,
        settledAmount,
        patientResponsibility,
        settlementReference: settlementReference.trim() || undefined,
        notes: notes.trim() || undefined,
        user: currentUser.name,
      });
      onClose();
    }
  }

  const title =
    mode === "verify"
      ? `Verify Insurance Coverage — Policy ${claim.policyNumber}`
      : mode === "preauth"
      ? `Record Pre-Authorization Approval — Policy ${claim.policyNumber}`
      : `Record Payer Settlement — Claim ${claim.policyNumber}`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-ink-200 px-4 py-2 text-xs font-medium text-ink-600 hover:bg-ink-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-medium text-white hover:bg-brand-700"
          >
            {mode === "verify"
              ? "Confirm Verification"
              : mode === "preauth"
              ? "Save Pre-Authorization"
              : "Record Settlement & Payment"}
          </button>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {error && <p className="rounded-md bg-red-50 p-2 text-red-700 font-medium">{error}</p>}

        <div className="rounded-lg border border-ink-100 bg-ink-50/50 p-3 flex justify-between items-center">
          <div>
            <p className="font-semibold text-ink-800">Payer: {payer?.name}</p>
            <p className="text-ink-500">Policy: {claim.policyNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-ink-400 text-[11px]">Claimed Amount</p>
            <p className="font-bold text-ink-900 text-sm">{formatINR(claim.claimedAmount)}</p>
          </div>
        </div>

        {mode === "verify" && (
          <div className="space-y-3">
            <p className="text-ink-600">
              Verify active policy status, co-pay clauses, and covered benefits with {payer?.name}.
            </p>
            <div>
              <label className="mb-1 block font-medium text-ink-700">Verification / Verification Desk Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Card verified active; 10% co-pay applicable per TPA agreement."
                rows={3}
                className="w-full rounded-lg border border-ink-200 p-2 text-xs focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {mode === "preauth" && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block font-medium text-ink-700">Pre-Auth Approval Number *</label>
                <input
                  type="text"
                  value={preAuthNumber}
                  onChange={(e) => setPreAuthNumber(e.target.value)}
                  placeholder="e.g. PA-STAR-88102"
                  className="w-full rounded-lg border border-ink-200 p-2 text-xs focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-ink-700">Pre-Authorized Amount (INR) *</label>
                <input
                  type="number"
                  value={preAuthAmount}
                  onChange={(e) => setPreAuthAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 45000"
                  className="w-full rounded-lg border border-ink-200 p-2 text-xs focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block font-medium text-ink-700">Pre-Authorization Notes / Remarks</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Initial approval for 3 days room stay and procedure."
                rows={2}
                className="w-full rounded-lg border border-ink-200 p-2 text-xs focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {mode === "settlement" && (
          <div className="space-y-3">
            <p className="text-ink-500">
              Enter final settlement details from insurance advice / voucher. Recording settlement automatically posts an online payment receipt and updates invoice balance.
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block font-medium text-ink-700">Approved Amount (INR) *</label>
                <input
                  type="number"
                  value={approvedAmount}
                  onChange={(e) => handleApprovedAmountChange(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full rounded-lg border border-ink-200 p-2 text-xs focus:border-brand-500 focus:outline-none font-semibold text-emerald-700"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-ink-700">Payer Settled Amount (INR) *</label>
                <input
                  type="number"
                  value={settledAmount}
                  onChange={(e) => setSettledAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full rounded-lg border border-ink-200 p-2 text-xs focus:border-brand-500 focus:outline-none font-semibold text-blue-700"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-ink-700">Patient Responsibility (INR) *</label>
                <input
                  type="number"
                  value={patientResponsibility}
                  onChange={(e) => setPatientResponsibility(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full rounded-lg border border-ink-200 p-2 text-xs focus:border-brand-500 focus:outline-none font-semibold text-red-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block font-medium text-ink-700">Payer NEFT / Cheque / UTR Ref #</label>
                <input
                  type="text"
                  value={settlementReference}
                  onChange={(e) => setSettlementReference(e.target.value)}
                  placeholder="e.g. NEFT-HDFC-991203"
                  className="w-full rounded-lg border border-ink-200 p-2 text-xs focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-ink-700">Settlement Remarks</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Deductions for non-medical consumables."
                  className="w-full rounded-lg border border-ink-200 p-2 text-xs focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
