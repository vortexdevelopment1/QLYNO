"use client";

import { useState } from "react";
import { useApp } from "@/billing-staff/context/AppContext";
import { formatINR, nextId } from "@/billing-staff/lib/utils";
import { SearchableSelect } from "@/billing-staff/components/ui/SearchableSelect";

const APPROVAL_THRESHOLD = 5000;

export function RefundForm({
  invoiceId: fixedInvoiceId, onCancel, onDone,
}: {
  invoiceId?: string; onCancel: () => void; onDone?: () => void;
}) {
  const { currentOrg, currentUser, invoices, payments, patients, dispatch } = useApp();
  const refundableInvoices = invoices.filter((i) => i.organizationId === currentOrg.id && (i.status === "paid" || i.status === "partially_paid"));

  const [invoiceId, setInvoiceId] = useState(fixedInvoiceId ?? "");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  const invoice = invoices.find((i) => i.id === invoiceId);
  const patient = invoice ? patients.find((p) => p.id === invoice.patientId) : undefined;
  const invoicePayment = invoice ? payments.filter((p) => p.invoiceId === invoice.id && p.status === "success").sort((a, b) => (a.date < b.date ? 1 : -1))[0] : undefined;

  const amountNumber = Number(amount);
  const requiresApproval = amountNumber > APPROVAL_THRESHOLD;

  function submit() {
    setError("");
    if (!invoice || !invoicePayment) return setError("Select a paid invoice to process a refund against.");
    if (!amount || amountNumber <= 0) return setError("Enter a valid refund amount.");
    if (amountNumber > invoice.paidTotal) return setError(`Refund cannot exceed the paid amount of ${formatINR(invoice.paidTotal)}.`);
    if (!reason.trim()) return setError("A refund reason is required.");

    if (!currentUser.permissions.requestRefund) {
      return setError("You do not have permission to request refunds.");
    }

    dispatch({
      type: "REQUEST_REFUND",
      refund: {
        id: nextId("ref"), invoiceId: invoice.id, paymentId: invoicePayment.id, patientId: invoice.patientId,
        amount: amountNumber, reason, notes: notes || undefined, status: "requested", requiresApproval,
        requestedBy: currentUser.name, requestedAt: new Date().toISOString(), organizationId: currentOrg.id,
      },
    });
    setSuccess(requiresApproval ? "Refund request submitted and routed for approval." : "Refund request submitted.");
    setTimeout(() => onDone?.(), 900);
  }

  return (
    <div className="space-y-4">
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {success && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}

      {!fixedInvoiceId && (
        <div>
          <label htmlFor="rf-invoice" className="mb-1 block text-xs font-medium text-ink-600">Invoice</label>
          <SearchableSelect
            id="rf-invoice"
            value={invoiceId}
            onChange={setInvoiceId}
            placeholder="Select a paid invoice…"
            options={refundableInvoices.map((inv) => {
              const p = patients.find((pat) => pat.id === inv.patientId);
              return {
                value: inv.id,
                label: `${inv.invoiceNumber} — ${p?.name || "Unknown"} (paid ${formatINR(inv.paidTotal)})`,
                searchKeywords: p?.name,
              };
            })}
          />
        </div>
      )}

      {invoice && invoicePayment && (
        <div className="rounded-lg bg-ink-50 p-3 text-sm">
          <p className="font-medium text-ink-800">{patient?.name} <span className="text-ink-400">· {patient?.uhid}</span></p>
          <p className="mt-1 text-xs text-ink-500">Original payment: {formatINR(invoicePayment.amount)} via {invoicePayment.method.toUpperCase()} on {new Date(invoicePayment.date).toLocaleDateString("en-IN")}</p>
        </div>
      )}

      <div>
        <label htmlFor="rf-amount" className="mb-1 block text-xs font-medium text-ink-600">Refund amount <span aria-hidden="true">*</span></label>
        <input id="rf-amount" type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="rf-reason" className="mb-1 block text-xs font-medium text-ink-600">Reason <span aria-hidden="true">*</span></label>
        <textarea id="rf-reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="rf-notes" className="mb-1 block text-xs font-medium text-ink-600">Notes</label>
        <input id="rf-notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm" />
      </div>

      {amountNumber > APPROVAL_THRESHOLD && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          This refund exceeds {formatINR(APPROVAL_THRESHOLD)} and is a restricted/higher-value refund. It will require approval before processing.
        </p>
      )}

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 border-t border-ink-100 pt-4">
        <button type="button" onClick={onCancel} className="w-full sm:w-auto rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50">Cancel</button>
        <button type="button" onClick={submit} disabled={!invoice} className="w-full sm:w-auto rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">Submit Refund Request</button>
      </div>
    </div>
  );
}
