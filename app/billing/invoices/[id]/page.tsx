"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { PaymentHistory } from "@/components/billing/PaymentHistory";
import { AuditTimeline } from "@/components/billing/AuditTimeline";
import { PaymentForm } from "@/components/billing/PaymentForm";
import { RefundForm } from "@/components/billing/RefundForm";
import { DiscountForm } from "@/components/billing/DiscountForm";
import { PermissionGuard } from "@/components/billing/PermissionGuard";
import { formatINR, formatDate, formatDateTime } from "@/lib/utils";
import { can } from "@/lib/permissions";
import { ErrorState } from "@/components/ui/ErrorState";
import { WorkflowStepper } from "@/components/billing/WorkflowStepper";

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { invoices, patients, encounters, payers, payments, discounts, refunds, auditLog, currentUser, dispatch } = useApp();

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [shareToast, setShareToast] = useState<string | null>(null);

  const invoice = invoices.find((i) => i.id === id);
  const invoicePayments = useMemo(() => payments.filter((p) => p.invoiceId === id), [payments, id]);
  const invoiceDiscounts = useMemo(() => discounts.filter((d) => d.invoiceId === id), [discounts, id]);
  const invoiceRefunds = useMemo(() => refunds.filter((r) => r.invoiceId === id), [refunds, id]);
  const invoiceAudit = useMemo(() => auditLog.filter((a) => a.entityId === id || invoicePayments.some((p) => p.id === a.entityId) || invoiceDiscounts.some((d) => d.id === a.entityId)), [auditLog, id, invoicePayments, invoiceDiscounts]);

  if (!invoice) {
    return <ErrorState title="Invoice not found" description="This invoice does not exist or is not part of the current organization." />;
  }

  const patient = patients.find((p) => p.id === invoice.patientId);
  const encounter = encounters.find((e) => e.id === invoice.encounterId);
  const payer = payers.find((p) => p.id === invoice.payerId);

  function mockDownload(kind: string) {
    setShareToast(`${kind} generated (demo simulation — no file is actually produced).`);
    setTimeout(() => setShareToast(null), 3000);
  }

  return (
    <div>
      <PageHeader
        title={invoice.invoiceNumber}
        description={`${patient?.name ?? ""} · ${patient?.uhid ?? ""}`}
        actions={
          <>
            <StatusBadge status={invoice.status} />
          </>
        }
      />

      {shareToast && <p role="status" className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{shareToast}</p>}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          {/* 12-Step Billing Workflow Indicator */}
          <WorkflowStepper status={invoice.status} />

          {/* Header info */}
          <section className="rounded-xl border border-ink-100 bg-white p-4 sm:p-5 shadow-card">
            <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm sm:grid-cols-4">
              <div><p className="text-xs text-ink-400">Patient</p><p className="font-medium text-ink-800">{patient?.name}</p></div>
              <div><p className="text-xs text-ink-400">UHID</p><p className="font-medium text-ink-800">{patient?.uhid}</p></div>
              <div><p className="text-xs text-ink-400">Encounter</p><p className="font-medium text-ink-800">{encounter ? `${encounter.type.toUpperCase()} · ${encounter.department}` : "—"}</p></div>
              <div><p className="text-xs text-ink-400">Date</p><p className="font-medium text-ink-800">{formatDate(invoice.date)}</p></div>
              <div><p className="text-xs text-ink-400">Payer</p><p className="font-medium text-ink-800">{payer?.name}</p></div>
              <div><p className="text-xs text-ink-400">Created by</p><p className="font-medium text-ink-800">{invoice.createdBy}</p></div>
              {invoice.finalizedBy && <div><p className="text-xs text-ink-400">Finalized by</p><p className="font-medium text-ink-800">{invoice.finalizedBy}</p></div>}
              {invoice.notes && <div className="col-span-2"><p className="text-xs text-ink-400">Notes</p><p className="font-medium text-ink-800">{invoice.notes}</p></div>}
            </div>
            {invoice.status === "cancelled" && invoice.cancelledReason && (
              <p className="mt-3 rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-600">Cancellation reason: {invoice.cancelledReason}. The original financial record remains in the audit history.</p>
            )}
          </section>

          {/* Line items */}
          <section className="rounded-xl border border-ink-100 bg-white p-4 sm:p-5 shadow-card">
            <h2 className="mb-3 text-sm font-semibold text-ink-800">Line Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-xs sm:text-sm">
                <thead className="text-left text-xs uppercase text-ink-500">
                  <tr className="border-b border-ink-100"><th className="py-2">Service</th><th>Source</th><th>Qty</th><th>Rate</th><th>Discount</th><th>Tax</th><th>Total</th></tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((l) => (
                    <tr key={l.id} className="border-b border-ink-50">
                      <td className="py-2.5 font-medium">{l.serviceName}</td>
                      <td className="text-ink-500">{l.source.replace("_", " ")}</td>
                      <td>{l.quantity}</td>
                      <td>{formatINR(l.rate)}</td>
                      <td>{formatINR(l.discountAmount)}</td>
                      <td>{formatINR(l.taxAmount)}</td>
                      <td className="font-medium">{formatINR(l.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 sm:ml-auto w-full sm:max-w-xs rounded-lg bg-ink-50 p-4 text-xs sm:text-sm">
              <div className="flex justify-between py-0.5"><span className="text-ink-500">Subtotal</span><span>{formatINR(invoice.subtotal)}</span></div>
              <div className="flex justify-between py-0.5"><span className="text-ink-500">Discount</span><span>-{formatINR(invoice.discountTotal)}</span></div>
              <div className="flex justify-between py-0.5"><span className="text-ink-500">Tax / other charges</span><span>{formatINR(invoice.taxTotal)}</span></div>
              <div className="flex justify-between border-t border-ink-200 py-1 pt-1.5 font-semibold text-ink-900"><span>Total</span><span>{formatINR(invoice.total)}</span></div>
              <div className="flex justify-between py-0.5"><span className="text-ink-500">Paid</span><span>{formatINR(invoice.paidTotal)}</span></div>
              <div className="flex justify-between py-0.5 font-medium text-red-600"><span>Outstanding</span><span>{formatINR(invoice.outstanding)}</span></div>
            </div>
          </section>

          {/* Payment history */}
          <section className="rounded-xl border border-ink-100 bg-white p-5 shadow-card">
            <h2 className="mb-3 text-sm font-semibold text-ink-800">Payment History</h2>
            <PaymentHistory payments={invoicePayments} />
          </section>

          {/* Discounts */}
          {invoiceDiscounts.length > 0 && (
            <section className="rounded-xl border border-ink-100 bg-white p-5 shadow-card">
              <h2 className="mb-3 text-sm font-semibold text-ink-800">Discount History</h2>
              <ul className="space-y-2 text-sm">
                {invoiceDiscounts.map((d) => (
                  <li key={d.id} className="flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2">
                    <span>{formatINR(d.amount)} ({d.percent}%) — {d.reason}</span>
                    <StatusBadge status={d.approvalStatus === "not_required" ? "approved" : d.approvalStatus} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Refunds */}
          {invoiceRefunds.length > 0 && (
            <section className="rounded-xl border border-ink-100 bg-white p-5 shadow-card">
              <h2 className="mb-3 text-sm font-semibold text-ink-800">Refunds</h2>
              <ul className="space-y-2 text-sm">
                {invoiceRefunds.map((r) => (
                  <li key={r.id} className="flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2">
                    <span>{formatINR(r.amount)} — {r.reason}</span>
                    <StatusBadge status={r.status} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Audit history */}
          <section className="rounded-xl border border-ink-100 bg-white p-5 shadow-card">
            <h2 className="mb-3 text-sm font-semibold text-ink-800">Audit History</h2>
            <AuditTimeline entries={invoiceAudit} />
          </section>
        </div>

        {/* Actions sidebar */}
        <aside className="space-y-3">
          <div className="rounded-xl border border-ink-100 bg-white p-4 shadow-card">
            <h2 className="mb-3 text-sm font-semibold text-ink-800">Actions</h2>
            <div className="space-y-2">
              {invoice.status === "draft" && (
                <PermissionGuard permission="editDraft">
                  <button onClick={() => router.push(`/billing/invoices/new`)} className="w-full rounded-lg border border-ink-200 px-3 py-2 text-left text-sm font-medium text-ink-700 hover:bg-ink-50">Edit Draft</button>
                  {can(currentUser, "issueFinalizeBill") ? (
                    <button
                      onClick={() => dispatch({ type: "FINALIZE_INVOICE", invoiceId: invoice.id, user: currentUser.name })}
                      className="w-full rounded-lg bg-brand-600 px-3 py-2 text-left text-sm font-medium text-white hover:bg-brand-700"
                    >
                      Issue / Finalize
                    </button>
                  ) : (
                    <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">You are not assigned permission to issue/finalize invoices.</p>
                  )}
                </PermissionGuard>
              )}

              {(invoice.status === "issued" || invoice.status === "partially_paid") && (
                <PermissionGuard permission="collectPayment">
                  <button onClick={() => setPaymentOpen(true)} className="w-full rounded-lg bg-brand-600 px-3 py-2 text-left text-sm font-medium text-white hover:bg-brand-700">Collect Payment</button>
                </PermissionGuard>
              )}

              <button onClick={() => mockDownload("Invoice PDF")} className="w-full rounded-lg border border-ink-200 px-3 py-2 text-left text-sm font-medium text-ink-700 hover:bg-ink-50">Download</button>
              <button onClick={() => mockDownload("Share link")} className="w-full rounded-lg border border-ink-200 px-3 py-2 text-left text-sm font-medium text-ink-700 hover:bg-ink-50">Share</button>

              {invoice.status !== "cancelled" && invoice.status !== "draft" && (
                <PermissionGuard permission="applyNormalDiscount">
                  <button onClick={() => setDiscountOpen(true)} className="w-full rounded-lg border border-ink-200 px-3 py-2 text-left text-sm font-medium text-ink-700 hover:bg-ink-50">Apply Discount</button>
                </PermissionGuard>
              )}

              {(invoice.status === "paid" || invoice.status === "partially_paid") && (
                <PermissionGuard permission="requestRefund">
                  <button onClick={() => setRefundOpen(true)} className="w-full rounded-lg border border-ink-200 px-3 py-2 text-left text-sm font-medium text-ink-700 hover:bg-ink-50">Request Refund</button>
                </PermissionGuard>
              )}

              {invoice.status !== "cancelled" && invoice.status !== "draft" && (
                <button onClick={() => setCancelOpen(true)} className="w-full rounded-lg border border-red-200 px-3 py-2 text-left text-sm font-medium text-red-700 hover:bg-red-50">Cancel Invoice</button>
              )}
              <p className="pt-1 text-[11px] text-ink-400">Finalized financial records are never hard-deleted — cancellation is controlled and remains fully auditable.</p>
            </div>
          </div>
        </aside>
      </div>

      <Modal open={paymentOpen} onClose={() => setPaymentOpen(false)} title="Collect Payment">
        <PaymentForm invoiceId={invoice.id} onCancel={() => setPaymentOpen(false)} onDone={() => setPaymentOpen(false)} />
      </Modal>
      <Modal open={refundOpen} onClose={() => setRefundOpen(false)} title="Request Refund">
        <RefundForm invoiceId={invoice.id} onCancel={() => setRefundOpen(false)} onDone={() => setRefundOpen(false)} />
      </Modal>
      <Modal open={discountOpen} onClose={() => setDiscountOpen(false)} title="Apply Discount">
        <DiscountForm invoiceId={invoice.id} onCancel={() => setDiscountOpen(false)} onDone={() => setDiscountOpen(false)} />
      </Modal>
      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel Invoice"
        footer={
          <>
            <button onClick={() => setCancelOpen(false)} className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50">Back</button>
            <button
              onClick={() => {
                if (!cancelReason.trim()) return;
                dispatch({ type: "CANCEL_INVOICE", invoiceId: invoice.id, reason: cancelReason, user: currentUser.name });
                setCancelOpen(false);
                setCancelReason("");
              }}
              disabled={!cancelReason.trim()}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              Confirm Cancellation
            </button>
          </>
        }
      >
        <p className="mb-3 text-sm text-ink-600">Are you sure you want to cancel this invoice? The original financial record will remain in the audit history.</p>
        <label htmlFor="cancel-reason" className="mb-1 block text-xs font-medium text-ink-600">Reason <span aria-hidden="true">*</span></label>
        <textarea id="cancel-reason" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={3} className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm" />
      </Modal>
    </div>
  );
}
