"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { formatINR } from "@/lib/utils";

interface DischargeSettlementModalProps {
  open: boolean;
  onClose: () => void;
}

export function DischargeSettlementModal({ open, onClose }: DischargeSettlementModalProps) {
  const { currentOrg, invoices, patients, encounters, currentUser, dispatch } = useApp();
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");

  const activeEncounters = encounters.filter(
    (e) => e.status === "active" && (e.type === "ipd" || e.type === "opd")
  );

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);
  const patientInvoices = invoices.filter(
    (i) => i.patientId === selectedPatientId && i.organizationId === currentOrg.id
  );
  const unpaidInvoices = patientInvoices.filter((i) => i.outstanding > 0);
  const totalOutstanding = unpaidInvoices.reduce((s, i) => s + i.outstanding, 0);

  function handleFinalSettle() {
    if (!selectedPatientId || unpaidInvoices.length === 0) return;
    unpaidInvoices.forEach((inv) => {
      dispatch({
        type: "FINAL_DISCHARGE_SETTLEMENT",
        patientId: selectedPatientId,
        invoiceId: inv.id,
        user: currentUser.name,
      });
    });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Hospital Discharge Billing & Final Settlement"
      footer={
        <>
          <button
            onClick={onClose}
            className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
          >
            Cancel
          </button>
          <button
            onClick={handleFinalSettle}
            disabled={!selectedPatientId || totalOutstanding === 0}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Clear Balance &amp; Approve Discharge
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-900 border border-blue-200">
          <p className="font-semibold">PRD Section 18 — Hospital Patient Discharge Integration</p>
          <p className="mt-0.5">
            Integrates final billing and settlement before patient discharge. Reconciles all pending OPD, IPD, lab, pharmacy, and room charges.
          </p>
        </div>

        <div>
          <label htmlFor="patient-discharge-select" className="mb-1 block text-xs font-medium text-ink-700">
            Select Inpatient / Active Patient
          </label>
          <select
            id="patient-discharge-select"
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="w-full rounded-lg border border-ink-200 p-2 text-sm focus:border-brand-500 focus:outline-none"
          >
            <option value="">Select patient for discharge settlement…</option>
            {activeEncounters.map((e) => {
              const p = patients.find((pt) => pt.id === e.patientId);
              return (
                <option key={e.id} value={e.patientId}>
                  {p?.name} ({p?.uhid}) — {e.department} {e.roomBed ? `(${e.roomBed})` : ""}
                </option>
              );
            })}
          </select>
        </div>

        {selectedPatient && (
          <div className="rounded-lg border border-ink-200 bg-ink-50/50 p-3 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-ink-500">Patient Name:</span>
              <span className="font-semibold text-ink-900">{selectedPatient.name} ({selectedPatient.uhid})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-500">Total Unpaid Invoices:</span>
              <span className="font-semibold text-ink-900">{unpaidInvoices.length} invoice(s)</span>
            </div>
            <div className="flex justify-between border-t border-ink-200 pt-1 text-sm font-bold text-red-600">
              <span>Net Discharge Balance:</span>
              <span>{formatINR(totalOutstanding)}</span>
            </div>

            {unpaidInvoices.length > 0 && (
              <ul className="mt-2 space-y-1">
                {unpaidInvoices.map((inv) => (
                  <li key={inv.id} className="flex justify-between rounded bg-white p-1.5 border border-ink-100">
                    <span>{inv.invoiceNumber}</span>
                    <span className="font-semibold">{formatINR(inv.outstanding)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
