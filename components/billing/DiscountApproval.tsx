"use client";

import { Discount } from "@/types";
import { useApp } from "@/context/AppContext";
import { formatINR, formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { can } from "@/lib/permissions";

export function DiscountApproval({ discount }: { discount: Discount }) {
  const { currentUser, invoices, dispatch } = useApp();
  const invoice = invoices.find((i) => i.id === discount.invoiceId);
  const canApprove = currentUser.role === "billing_admin" || can(currentUser, "applyHighDiscount");

  return (
    <div className="rounded-xl border border-ink-100 bg-white p-4 shadow-card">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-ink-800">{invoice?.invoiceNumber ?? discount.invoiceId}</p>
          <p className="text-xs text-ink-500 capitalize">{discount.level.replace("_", " ")} discount · requested by {discount.requestedBy}</p>
        </div>
        <StatusBadge status={discount.approvalStatus === "not_required" ? "approved" : discount.approvalStatus} />
      </div>
      <p className="text-sm text-ink-700">{discount.reason}</p>
      <div className="mt-2 flex items-center justify-between text-xs text-ink-500">
        <span>{formatINR(discount.amount)} ({discount.percent}%)</span>
        <span>{formatDateTime(discount.requestedAt)}</span>
      </div>
      {discount.approvalStatus === "pending" && (
        canApprove ? (
          <div className="mt-3 flex gap-2 border-t border-ink-100 pt-3">
            <button
              onClick={() => dispatch({ type: "APPROVE_DISCOUNT", discountId: discount.id, approver: currentUser.name })}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
            >
              Approve
            </button>
            <button
              onClick={() => dispatch({ type: "REJECT_DISCOUNT", discountId: discount.id, approver: currentUser.name })}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
            >
              Reject
            </button>
          </div>
        ) : (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 border-t border-amber-100">
            Awaiting approval from an authorized admin. You do not have approval permission.
          </p>
        )
      )}
      {discount.approvalStatus === "approved" && discount.approvedBy && (
        <p className="mt-2 text-xs text-emerald-700">Approved by {discount.approvedBy} on {discount.approvedAt && formatDateTime(discount.approvedAt)}</p>
      )}
      {discount.approvalStatus === "rejected" && discount.approvedBy && (
        <p className="mt-2 text-xs text-red-700">Rejected by {discount.approvedBy} on {discount.approvedAt && formatDateTime(discount.approvedAt)}</p>
      )}
    </div>
  );
}
