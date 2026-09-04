"use client";

import { notFound } from "next/navigation";
import { EntityHeader } from "@/components/ui/EntityHeader";
import { BillingGuard } from "@/components/domain/BillingGuard";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { MOCK_INVOICES, MOCK_PAYMENTS } from "@/data/mock/billing";
import { MOCK_ORDER_ITEMS } from "@/data/mock/orders";
import { formatCurrencyINR, formatDateTime } from "@/lib/utils/format";

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const invoice = MOCK_INVOICES.find((i) => i.id === id);
  if (!invoice) notFound();

  const { showToast } = useToast();
  const payments = MOCK_PAYMENTS.filter((p) => p.invoiceId === invoice.id);
  const items = MOCK_ORDER_ITEMS.filter((i) => i.orderId === invoice.orderId);
  const paid = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 10 · Commercial & Billing" title={invoice.id} subtitle={invoice.patientName} badges={<StatusBadge status={invoice.status} />} />
      <BillingGuard>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="p-5 lg:col-span-2">
            <h3 className="mb-3 text-sm font-semibold text-text-main">Line items</h3>
            {items.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-text-muted">
                    <th className="py-2">Test</th><th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((i) => (
                    <tr key={i.id} className="border-t border-app-border">
                      <td className="py-2">{i.testName}</td>
                      <td className="py-2"><StatusBadge status={i.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-xs text-text-muted">No test line items linked (client-organization consolidated invoice).</p>
            )}
          </Card>
          <Card className="p-5">
            <h3 className="mb-3 text-sm font-semibold text-text-main">Payment summary</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-text-muted">Total amount</dt><dd className="font-medium">{formatCurrencyINR(invoice.amount)}</dd></div>
              <div className="flex justify-between"><dt className="text-text-muted">Paid</dt><dd className="font-medium text-status-success">{formatCurrencyINR(paid)}</dd></div>
              <div className="flex justify-between"><dt className="text-text-muted">Balance</dt><dd className="font-medium">{formatCurrencyINR(invoice.amount - paid)}</dd></div>
            </dl>
            <div className="mt-4 space-y-2">
              <Button size="sm" className="w-full justify-center" disabled={invoice.amount - paid <= 0} disabledReason="Invoice already fully paid" onClick={() => showToast({ title: "Payment recorded (simulated)", tone: "success" })}>
                Record payment
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-center" onClick={() => showToast({ title: "Receipt generated (simulated)", tone: "info" })}>
                Print receipt
              </Button>
            </div>
          </Card>
        </div>
        {payments.length > 0 && (
          <Card className="p-5">
            <h3 className="mb-3 text-sm font-semibold text-text-main">Payment history</h3>
            <ul className="space-y-2 text-sm">
              {payments.map((p) => (
                <li key={p.id} className="flex items-center justify-between border-b border-app-border pb-2 last:border-0">
                  <span className="text-text-muted">{p.method.toUpperCase()} · {formatDateTime(p.receivedAt)}</span>
                  <span className="font-medium">{formatCurrencyINR(p.amount)}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </BillingGuard>
    </div>
  );
}
