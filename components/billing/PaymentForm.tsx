"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { PaymentMethod } from "@/types";
import { formatINR, nextId } from "@/lib/utils";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "upi", label: "UPI" },
  { value: "online", label: "Online / Net Banking" },
  { value: "other", label: "Other" },
];

export function PaymentForm({
  invoiceId: fixedInvoiceId, onCancel, onDone,
}: {
  invoiceId?: string; onCancel: () => void; onDone?: () => void;
}) {
  const { currentOrg, currentUser, invoices, patients, insuranceClaims, dispatch } = useApp();
  const payableInvoices = invoices.filter((i) => i.organizationId === currentOrg.id && i.outstanding > 0 && (i.status === "issued" || i.status === "partially_paid"));

  const [invoiceId, setInvoiceId] = useState(fixedInvoiceId ?? payableInvoices[0]?.id ?? "");
  const [amount, setAmount] = useState<string>("");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  const invoice = invoices.find((i) => i.id === invoiceId);
  const patient = invoice ? patients.find((p) => p.id === invoice.patientId) : undefined;
  const claim = invoice ? insuranceClaims.find((c) => c.invoiceId === invoice.id) : undefined;

  const amountNumber = Number(amount);

  function submit() {
    setError("");
    if (!invoice) return setError("Select an invoice to collect payment against.");
    if (!amount || amountNumber <= 0) return setError("Enter a valid payment amount greater than zero.");
    if (amountNumber > invoice.outstanding) return setError(`Amount cannot exceed the outstanding balance of ${formatINR(invoice.outstanding)}.`);
    if ((method === "card" || method === "upi" || method === "online") && !reference.trim() && !simulateFailure) {
      return setError("A transaction/reference number is required for this payment method.");
    }

    const paymentId = nextId("pay");
    const status = simulateFailure ? "failed" : "success";
    dispatch({
      type: "RECORD_PAYMENT",
      invoiceId: invoice.id,
      user: currentUser.name,
      payment: {
        id: paymentId, invoiceId: invoice.id, patientId: invoice.patientId, amount: amountNumber, method,
        referenceNumber: reference || undefined, notes: notes || undefined, status,
        failureReason: simulateFailure ? "Payment gateway declined the transaction (simulated)." : undefined,
        collectedBy: currentUser.name, date: new Date().toISOString(), organizationId: currentOrg.id,
      },
      receipt:
        status === "success"
          ? {
              id: nextId("rcpt"), receiptNumber: `RCPT-${Math.floor(1000 + Math.random() * 8999)}`, invoiceId: invoice.id, paymentId,
              patientId: invoice.patientId, amount: amountNumber, method, referenceNumber: reference || undefined,
              date: new Date().toISOString(), receivedBy: currentUser.name, organizationId: currentOrg.id,
            }
          : undefined,
    });

    if (status === "failed") {
      setError("Payment failed: gateway declined the transaction. The invoice remains outstanding.");
      return;
    }
    setSuccess(`Payment of ${formatINR(amountNumber)} recorded. Receipt generated and notification sent.`);
    setTimeout(() => onDone?.(), 900);
  }

  return (
    <div className="space-y-4">
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {success && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}

      {!fixedInvoiceId && (
        <div>
          <label htmlFor="pf-invoice" className="mb-1 block text-xs font-medium text-ink-600">Invoice</label>
          <SearchableSelect
            id="pf-invoice"
            value={invoiceId}
            onChange={setInvoiceId}
            placeholder="Select invoice with outstanding balance…"
            options={payableInvoices.map((inv) => {
              const p = patients.find((pat) => pat.id === inv.patientId);
              return {
                value: inv.id,
                label: `${inv.invoiceNumber} — ${p?.name || "Unknown"} (${formatINR(inv.outstanding)} due)`,
                searchKeywords: p?.name,
              };
            })}
          />
        </div>
      )}

      {invoice && (
        <div className="rounded-lg bg-ink-50 p-3 text-sm space-y-1.5">
          <p className="font-medium text-ink-800">{patient?.name} <span className="text-ink-400">· {patient?.uhid}</span></p>
          <div className="flex justify-between text-xs text-ink-500">
            <span>Invoice total: {formatINR(invoice.total)}</span>
            <span>Amount due: <strong className="text-ink-800">{formatINR(invoice.outstanding)}</strong></span>
          </div>

          {claim && (
            <div className="mt-2 pt-2 border-t border-ink-200 text-xs flex justify-between items-center bg-white p-2 rounded border border-ink-100">
              <div>
                <span className="font-semibold text-brand-700">Insurance Claim Active</span>
                <p className="text-[11px] text-ink-500">
                  Patient Resp: <strong className="text-red-600">{formatINR(claim.patientResponsibility)}</strong> · Payer Owes: <strong className="text-amber-700">{formatINR(claim.payerOutstanding)}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAmount(String(claim.patientResponsibility))}
                className="rounded bg-brand-50 border border-brand-200 px-2 py-1 text-[11px] font-semibold text-brand-700 hover:bg-brand-100"
              >
                Auto-fill Patient Portion ({formatINR(claim.patientResponsibility)})
              </button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pf-amount" className="mb-1 block text-xs font-medium text-ink-600">Amount to collect <span aria-hidden="true">*</span></label>
          <input id="pf-amount" type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="pf-method" className="mb-1 block text-xs font-medium text-ink-600">Payment method</label>
          <select id="pf-method" value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)} className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm">
            {METHODS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="pf-ref" className="mb-1 block text-xs font-medium text-ink-600">Transaction / reference number{method !== "cash" ? " *" : ""}</label>
          <input id="pf-ref" value={reference} onChange={(e) => setReference(e.target.value)} className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="pf-notes" className="mb-1 block text-xs font-medium text-ink-600">Notes</label>
          <input id="pf-notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm" />
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs text-ink-500">
        <input type="checkbox" checked={simulateFailure} onChange={(e) => setSimulateFailure(e.target.checked)} />
        Simulate a failed transaction (for demo purposes)
      </label>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 border-t border-ink-100 pt-4">
        <button type="button" onClick={onCancel} className="w-full sm:w-auto rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50">Cancel</button>
        <button type="button" onClick={submit} disabled={!invoice} className="w-full sm:w-auto rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">Record Payment</button>
      </div>
    </div>
  );
}
