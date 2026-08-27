"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { PaymentMethod } from "@/types";
import { formatINR, nextId } from "@/lib/utils";

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
  const { currentOrg, currentUser, invoices, patients, dispatch } = useApp();
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
          <select id="pf-invoice" value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)} className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm">
            <option value="">Select invoice with outstanding balance…</option>
            {payableInvoices.map((inv) => (
              <option key={inv.id} value={inv.id}>{inv.invoiceNumber} — {formatINR(inv.outstanding)} due</option>
            ))}
          </select>
        </div>
      )}

      {invoice && (
        <div className="rounded-lg bg-ink-50 p-3 text-sm">
          <p className="font-medium text-ink-800">{patient?.name} <span className="text-ink-400">· {patient?.uhid}</span></p>
          <div className="mt-1 flex justify-between text-xs text-ink-500">
            <span>Invoice total: {formatINR(invoice.total)}</span>
            <span>Amount due: <strong className="text-ink-800">{formatINR(invoice.outstanding)}</strong></span>
          </div>
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

      <div className="flex justify-end gap-3 border-t border-ink-100 pt-4">
        <button type="button" onClick={onCancel} className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50">Cancel</button>
        <button type="button" onClick={submit} disabled={!invoice} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">Record Payment</button>
      </div>
    </div>
  );
}
