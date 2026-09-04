"use client";

import { Refund } from "@/billing-staff/types";
import { useApp } from "@/billing-staff/context/AppContext";
import { StatusBadge } from "@/billing-staff/components/ui/StatusBadge";
import { formatINR, formatDateTime } from "@/billing-staff/lib/utils";

export function RefundCard({ refund }: { refund: Refund }) {
  const { currentUser, invoices, patients, dispatch } = useApp();
  const invoice = invoices.find((i) => i.id === refund.invoiceId);
  const patient = patients.find((p) => p.id === refund.patientId);
  const canApprove = currentUser.permissions.approveRefund;

  return (
    <div className="rounded-xl border border-ink-100 bg-white p-4 shadow-card">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-ink-800">{invoice?.invoiceNumber ?? refund.invoiceId}</p>
          <p className="text-xs text-ink-500">{patient?.name} · requested by {refund.requestedBy}</p>
        </div>
        <StatusBadge status={refund.status} />
      </div>
      <p className="text-sm text-ink-700">{refund.reason}</p>
      {refund.notes && <p className="mt-0.5 text-xs text-ink-500">Notes: {refund.notes}</p>}
      <div className="mt-2 flex items-center justify-between text-xs text-ink-500">
        <span className="font-medium text-ink-800">{formatINR(refund.amount)}</span>
        <span>{formatDateTime(refund.requestedAt)}</span>
      </div>
      {refund.requiresApproval && refund.status === "requested" && (
        <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">This is a higher-value/restricted refund requiring approval.</p>
      )}

      <div className="mt-3 flex flex-wrap gap-2 border-t border-ink-100 pt-3">
        {refund.status === "requested" && refund.requiresApproval && (
          currentUser.name === refund.requestedBy ? (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 border border-amber-200 w-full">
              🔒 <strong>Approval Required:</strong> You requested this refund. Restricted refunds must be approved by another authorized admin.
            </p>
          ) : canApprove ? (
            <>
              <button onClick={() => dispatch({ type: "APPROVE_REFUND", refundId: refund.id, approver: currentUser.name })} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700">Approve</button>
              <button onClick={() => dispatch({ type: "REJECT_REFUND", refundId: refund.id, approver: currentUser.name })} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50">Reject</button>
            </>
          ) : (
            <p className="text-xs text-ink-500">Refund approval is restricted to authorized admin users.</p>
          )
        )}
        {refund.status === "requested" && !refund.requiresApproval && canApprove && (
          <button onClick={() => dispatch({ type: "APPROVE_REFUND", refundId: refund.id, approver: currentUser.name })} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700">Approve</button>
        )}
        {refund.status === "approved" && canApprove && (
          <button onClick={() => dispatch({ type: "PROCESS_REFUND", refundId: refund.id, processor: currentUser.name })} className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700">Start Processing</button>
        )}
        {refund.status === "processing" && canApprove && (
          <button onClick={() => dispatch({ type: "COMPLETE_REFUND", refundId: refund.id, processor: currentUser.name })} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700">Mark Completed</button>
        )}
      </div>
    </div>
  );
}
