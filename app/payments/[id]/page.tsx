"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatINR, formatDateTime } from "@/lib/utils";
import { ErrorState } from "@/components/ui/ErrorState";
import { ReversePaymentModal } from "@/components/billing/ReversePaymentModal";

export default function PaymentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { payments, invoices, patients, receipts } = useApp();
  const [reverseOpen, setReverseOpen] = useState(false);

  const payment = payments.find((p) => p.id === id);
  if (!payment) return <ErrorState title="Payment not found" description="This payment does not exist or is not part of the current organization." />;

  const invoice = invoices.find((i) => i.id === payment.invoiceId);
  const patient = patients.find((p) => p.id === payment.patientId);
  const receipt = receipts.find((r) => r.paymentId === payment.id);

  return (
    <div className="max-w-2xl">
      <PageHeader title={`Payment ${payment.id}`} actions={<StatusBadge status={payment.status} />} />
      <div className="space-y-4 rounded-xl border border-ink-100 bg-white p-5 shadow-card">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-xs text-ink-400">Patient</p><p className="font-medium text-ink-800">{patient?.name}</p></div>
          <div><p className="text-xs text-ink-400">Invoice</p>
            <button onClick={() => invoice && router.push(`/billing/invoices/${invoice.id}`)} className="font-medium text-brand-600 hover:underline">{invoice?.invoiceNumber}</button>
          </div>
          <div><p className="text-xs text-ink-400">Amount</p><p className="font-medium text-ink-800">{formatINR(payment.amount)}</p></div>
          <div><p className="text-xs text-ink-400">Method</p><p className="font-medium uppercase text-ink-800">{payment.method}</p></div>
          <div><p className="text-xs text-ink-400">Reference</p><p className="font-medium text-ink-800">{payment.referenceNumber ?? "—"}</p></div>
          <div><p className="text-xs text-ink-400">Collected by</p><p className="font-medium text-ink-800">{payment.collectedBy}</p></div>
          <div><p className="text-xs text-ink-400">Date</p><p className="font-medium text-ink-800">{formatDateTime(payment.date)}</p></div>
          {payment.notes && <div><p className="text-xs text-ink-400">Notes</p><p className="font-medium text-ink-800">{payment.notes}</p></div>}
        </div>
        {payment.failureReason && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{payment.failureReason}</p>}
        <div className="flex flex-wrap gap-3 pt-2">
          {receipt && (
            <button onClick={() => router.push(`/receipts/${receipt.id}`)} className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50">
              View Receipt {receipt.receiptNumber}
            </button>
          )}
          {payment.status === "success" && (
            <button onClick={() => setReverseOpen(true)} className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100">
              Reverse Payment (PRD Sec 10)
            </button>
          )}
        </div>
      </div>
      <ReversePaymentModal open={reverseOpen} onClose={() => setReverseOpen(false)} payment={payment} />
    </div>
  );
}
