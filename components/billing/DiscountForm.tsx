"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { formatINR, nextId } from "@/lib/utils";
import { ApprovalStatus, DiscountLevel } from "@/types";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

const HIGH_THRESHOLD_PERCENT = 20;
const SPECIAL_THRESHOLD_PERCENT = 40;

export function DiscountForm({ invoiceId: fixedInvoiceId, onCancel, onDone }: { invoiceId?: string; onCancel: () => void; onDone?: () => void }) {
  const { currentOrg, currentUser, invoices, patients, dispatch } = useApp();
  const eligibleInvoices = invoices.filter((i) => i.organizationId === currentOrg.id && i.status !== "cancelled" && i.status !== "draft");

  const [invoiceId, setInvoiceId] = useState(fixedInvoiceId ?? "");
  const [percent, setPercent] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  const invoice = invoices.find((i) => i.id === invoiceId);
  const percentNumber = Number(percent);
  const amount = invoice ? Math.round((invoice.subtotal * percentNumber) / 100) : 0;

  let level: DiscountLevel = "normal";
  if (percentNumber > SPECIAL_THRESHOLD_PERCENT) level = "special_case";
  else if (percentNumber > HIGH_THRESHOLD_PERCENT) level = "higher";

  const approvalStatus: ApprovalStatus = level === "normal" ? "not_required" : "pending";

  function submit() {
    setError("");
    if (!invoice) return setError("Select an invoice.");
    if (!percent || percentNumber <= 0) return setError("Enter a valid discount percentage.");
    if (!reason.trim()) return setError("A reason is required for every discount.");
    if (level !== "normal" && !currentUser.permissions.applyNormalDiscount) return setError("You do not have permission to apply discounts.");

    dispatch({
      type: "REQUEST_DISCOUNT",
      invoice,
      discount: {
        id: nextId("disc"), invoiceId: invoice.id, level, amount, percent: percentNumber, reason,
        requestedBy: currentUser.name, requestedAt: new Date().toISOString(), approvalStatus, organizationId: currentOrg.id,
      },
    });
    setSuccess(approvalStatus === "pending" ? "Discount recorded and routed for approval." : "Discount applied to the invoice.");
    setTimeout(() => onDone?.(), 900);
  }

  return (
    <div className="space-y-4">
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {success && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}

      {!fixedInvoiceId && (
        <div>
          <label htmlFor="df-invoice" className="mb-1 block text-xs font-medium text-ink-600">Invoice</label>
          <SearchableSelect
            id="df-invoice"
            value={invoiceId}
            onChange={setInvoiceId}
            placeholder="Select invoice…"
            options={eligibleInvoices.map((inv) => {
              const p = patients.find((pat) => pat.id === inv.patientId);
              return {
                value: inv.id,
                label: `${inv.invoiceNumber} — ${p?.name || "Unknown"} (subtotal ${formatINR(inv.subtotal)})`,
                searchKeywords: p?.name,
              };
            })}
          />
        </div>
      )}

      <div>
        <label htmlFor="df-percent" className="mb-1 block text-xs font-medium text-ink-600">Discount percentage <span aria-hidden="true">*</span></label>
        <input id="df-percent" type="number" min={1} max={90} value={percent} onChange={(e) => setPercent(e.target.value)} className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm" />
        {invoice && percentNumber > 0 && <p className="mt-1 text-xs text-ink-500">≈ {formatINR(amount)} discount</p>}
      </div>
      <div>
        <label htmlFor="df-reason" className="mb-1 block text-xs font-medium text-ink-600">Reason <span aria-hidden="true">*</span></label>
        <textarea id="df-reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm" />
      </div>

      {level !== "normal" && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {level === "higher"
            ? "This discount exceeds your configured normal limit and requires approval."
            : "This is a special-case discount and requires authorized admin approval."}
        </p>
      )}

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 border-t border-ink-100 pt-4">
        <button type="button" onClick={onCancel} className="w-full sm:w-auto rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50">Cancel</button>
        <button type="button" onClick={submit} disabled={!invoice} className="w-full sm:w-auto rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">Apply Discount</button>
      </div>
    </div>
  );
}
