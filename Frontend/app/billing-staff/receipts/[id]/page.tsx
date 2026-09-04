"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/billing-staff/context/AppContext";
import { PageHeader } from "@/billing-staff/components/ui/PageHeader";
import { formatINR, formatDateTime } from "@/billing-staff/lib/utils";
import { ErrorState } from "@/billing-staff/components/ui/ErrorState";

export default function ReceiptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { receipts, invoices, patients, currentOrg } = useApp();
  const [toast, setToast] = useState<string | null>(null);

  const receipt = receipts.find((r) => r.id === id);
  if (!receipt) return <ErrorState title="Receipt not found" description="This receipt does not exist or is not part of the current organization." />;
  const invoice = invoices.find((i) => i.id === receipt.invoiceId);
  const patient = patients.find((p) => p.id === receipt.patientId);

  function notify(action: string) {
    setToast(`${action} (demo simulation).`);
    setTimeout(() => setToast(null), 2500);
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Receipt" description="Print-style preview" />
      {toast && <p role="status" className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{toast}</p>}
      <div className="rounded-xl border border-ink-100 bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between border-b border-dashed border-ink-200 pb-4">
          <div>
            <p className="text-lg font-semibold text-ink-900">{currentOrg.name}</p>
            <p className="text-xs text-ink-500">{currentOrg.city}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-ink-800">{receipt.receiptNumber}</p>
            <p className="text-xs text-ink-500">{formatDateTime(receipt.date)}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-xs text-ink-400">Patient</p><p className="font-medium text-ink-800">{patient?.name}</p></div>
          <div><p className="text-xs text-ink-400">UHID</p><p className="font-medium text-ink-800">{patient?.uhid}</p></div>
          <div><p className="text-xs text-ink-400">Invoice</p><p className="font-medium text-ink-800">{invoice?.invoiceNumber}</p></div>
          <div><p className="text-xs text-ink-400">Payment Method</p><p className="font-medium uppercase text-ink-800">{receipt.method}</p></div>
          {receipt.referenceNumber && <div><p className="text-xs text-ink-400">Transaction Reference</p><p className="font-medium text-ink-800">{receipt.referenceNumber}</p></div>}
          <div><p className="text-xs text-ink-400">Received By</p><p className="font-medium text-ink-800">{receipt.receivedBy}</p></div>
        </div>
        <div className="mt-5 rounded-lg bg-ink-50 p-4 text-right">
          <p className="text-xs text-ink-500">Amount Received</p>
          <p className="text-2xl font-semibold text-ink-900">{formatINR(receipt.amount)}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button onClick={() => notify("Preview opened")} className="rounded-lg border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50">Print-style Preview</button>
        <button onClick={() => notify("Receipt downloaded")} className="rounded-lg border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50">Download</button>
        <button onClick={() => notify("Share link generated")} className="rounded-lg border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50">Share</button>
        {invoice && (
          <button onClick={() => router.push(`/billing-staff/billing/invoices/${invoice.id}`)} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">View Invoice</button>
        )}
      </div>
    </div>
  );
}
