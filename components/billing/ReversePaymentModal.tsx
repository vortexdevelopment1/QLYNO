"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { Payment } from "@/types";
import { formatINR } from "@/lib/utils";

interface ReversePaymentModalProps {
  open: boolean;
  onClose: () => void;
  payment: Payment | null;
}

export function ReversePaymentModal({ open, onClose, payment }: ReversePaymentModalProps) {
  const { currentUser, dispatch } = useApp();
  const [reason, setReason] = useState("");

  if (!payment) return null;

  function handleConfirm() {
    if (!reason.trim() || !payment) return;
    dispatch({
      type: "REVERSE_PAYMENT",
      paymentId: payment.id,
      reason: reason.trim(),
      user: currentUser.name,
    });
    setReason("");
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Controlled Payment Reversal — Ref #${payment.referenceNumber ?? payment.id}`}
      footer={
        <>
          <button
            onClick={onClose}
            className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!reason.trim()}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            Confirm Reversal
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="rounded-lg bg-red-50 p-3 text-xs text-red-800 border border-red-200">
          <p className="font-semibold">PRD Section 10 — Controlled Payment Reversal Workflow</p>
          <p className="mt-0.5">
            Reversing this payment of <span className="font-bold">{formatINR(payment.amount)}</span> will restore the invoice outstanding balance. Financial records are never hard-deleted.
          </p>
        </div>

        <div>
          <label htmlFor="reversal-reason" className="mb-1 block text-xs font-medium text-ink-700">
            Reversal / Adjustment Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            id="reversal-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="e.g. Bank chargeback, payment recorded in error, duplicate entry…"
            className="w-full rounded-lg border border-ink-200 p-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
      </div>
    </Modal>
  );
}
