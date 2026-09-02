"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatINR, formatDateTime } from "@/lib/utils";
import { filterInvoicesByAccess, filterPendingByAccess } from "@/lib/selectors";
import { NewInvoiceModal } from "@/components/billing/NewInvoiceModal";
import { CollectPaymentModal } from "@/components/billing/CollectPaymentModal";
import { RequestRefundModal } from "@/components/billing/RequestRefundModal";
import { DischargeSettlementModal } from "@/components/billing/DischargeSettlementModal";
import { QuickDailyCollectionModal } from "@/components/billing/QuickDailyCollectionModal";
import { AgeingBarChart } from "@/components/dashboard/AgeingBarChart";
import { PaymentMethodBarChart } from "@/components/dashboard/PaymentMethodBarChart";
import { PendingSourceBarChart } from "@/components/dashboard/PendingSourceBarChart";
import { SCOPE_LABELS } from "@/types";

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export default function DashboardPage() {
  const { currentOrg, currentUser, currentScope, invoices, payments, refunds, pendingBillingItems, patients, insuranceClaims, alerts } = useApp();
  const [newInvoiceOpen, setNewInvoiceOpen] = useState(false);
  const [collectPaymentOpen, setCollectPaymentOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [dischargeOpen, setDischargeOpen] = useState(false);
  const [dailyCollectionOpen, setDailyCollectionOpen] = useState(false);

  const orgInvoices = useMemo(() => filterInvoicesByAccess(invoices, currentOrg.id, currentUser.scopes), [invoices, currentOrg.id, currentUser.scopes]);
  const orgPending = useMemo(() => filterPendingByAccess(pendingBillingItems, currentOrg.id, currentUser.scopes).filter((p) => p.status === "pending"), [pendingBillingItems, currentOrg.id, currentUser.scopes]);
  const orgPayments = payments.filter((p) => p.organizationId === currentOrg.id);
  const orgRefunds = refunds.filter((r) => r.organizationId === currentOrg.id);
  const orgClaims = insuranceClaims.filter((c) => c.organizationId === currentOrg.id);

  const todaysInvoices = orgInvoices.filter((i) => isToday(i.createdAt));
  const todaysPayments = orgPayments.filter((p) => isToday(p.date) && p.status === "success");
  const todaysCollections = todaysPayments.reduce((s, p) => s + p.amount, 0);
  const pendingPaymentsCount = orgInvoices.filter((i) => i.status === "issued" || i.status === "partially_paid").length;
  const todaysRefunds = orgRefunds.filter((r) => isToday(r.requestedAt));

  const outstandingInvoices = orgInvoices.filter((i) => i.outstanding > 0 && (i.status === "issued" || i.status === "partially_paid"));
  const outstandingTotal = outstandingInvoices.reduce((s, i) => s + i.outstanding, 0);

  const recentPayments = [...orgPayments].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5);
  const failedPayments = orgPayments.filter((p) => p.status === "failed");

  const refundBuckets = {
    requested: orgRefunds.filter((r) => r.status === "requested").length,
    approved: orgRefunds.filter((r) => r.status === "approved").length,
    rejected: orgRefunds.filter((r) => r.status === "rejected").length,
    processing: orgRefunds.filter((r) => r.status === "processing").length,
    completed: orgRefunds.filter((r) => r.status === "completed").length,
    failed: orgRefunds.filter((r) => r.status === "failed").length,
  };

  const recentPatients = [...orgInvoices]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 6)
    .map((i) => ({ invoice: i, patient: patients.find((p) => p.id === i.patientId) }));

  const orgAlerts = alerts.slice(0, 6);

  const showInsuranceSection = currentOrg.insuranceEnabled && currentUser.permissions.insuranceTpa;

  return (
    <div className="space-y-6">
      {/* Dashboard Top Header & Quick Actions Bar */}
      <PageHeader
        title={`Welcome back, ${currentUser.name.split(" ")[0]}`}
        description={`${currentOrg.name} · ${currentScope !== "central" ? "Scope: " + SCOPE_LABELS[currentScope] : "Central Billing View"}`}
        actions={
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
            <button
              onClick={() => setNewInvoiceOpen(true)}
              className="rounded-lg bg-brand-600 px-3 sm:px-3.5 py-2 text-xs font-bold text-white hover:bg-brand-700 shadow-sm transition-all flex items-center gap-1 flex-1 sm:flex-initial justify-center"
            >
              <span>+</span> New Bill
            </button>
            <button
              onClick={() => setCollectPaymentOpen(true)}
              className="rounded-lg border border-brand-200 bg-brand-50 px-3 sm:px-3.5 py-2 text-xs font-bold text-brand-800 hover:bg-brand-100 shadow-xs transition-all flex-1 sm:flex-initial text-center"
            >
              Collect Payment
            </button>
            <Link
              href="/receipts"
              className="rounded-lg border border-ink-200 bg-white px-2.5 sm:px-3 py-2 text-xs font-semibold text-ink-700 hover:bg-ink-50 shadow-xs transition-all flex-1 sm:flex-initial text-center"
            >
              Issue Receipt
            </Link>
            <button
              onClick={() => setRefundOpen(true)}
              className="rounded-lg border border-ink-200 bg-white px-2.5 sm:px-3 py-2 text-xs font-semibold text-ink-700 hover:bg-ink-50 shadow-xs transition-all flex-1 sm:flex-initial text-center"
            >
              Refund
            </button>
            {currentOrg.type === "hospital" && (
              <button
                onClick={() => setDischargeOpen(true)}
                className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-900 hover:bg-emerald-100 shadow-xs transition-all w-full sm:w-auto text-center"
              >
                Discharge Settlement
              </button>
            )}
          </div>
        }
      />

      {/* 1. Today's Activity Stat Cards */}
      <section aria-labelledby="today-heading">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="today-heading" className="text-xs font-bold uppercase tracking-wider text-ink-500">
            Today&rsquo;s Financial Activity
          </h2>
          <span className="text-[11px] font-medium text-ink-400">Updated in real-time</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Today's Bills"
            value={String(todaysInvoices.length)}
            sublabel="▲ +12% vs yesterday"
            tone="default"
          />
          <StatCard
            label="Today's Collections"
            value={formatINR(todaysCollections)}
            sublabel={`▲ ${todaysPayments.length} successful payments`}
            tone="success"
          />
          <StatCard
            label="Pending Payments"
            value={String(pendingPaymentsCount)}
            sublabel="Issued & partially paid invoices"
            tone="warning"
          />
          <StatCard
            label="Refund Activity"
            value={String(todaysRefunds.length)}
            sublabel="Requests created today"
            tone="default"
          />
        </div>
      </section>

      {/* Main Grid: 2 Columns on Desktop */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left Column (2 Cols wide on XL) */}
        <div className="space-y-6 xl:col-span-2">
          
          {/* 2. Outstanding & Ageing Bar Chart Section */}
          <section aria-labelledby="outstanding-heading" className="rounded-2xl border border-ink-100 bg-white p-4 sm:p-6 shadow-sm">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ink-100 pb-3">
              <div>
                <h2 id="outstanding-heading" className="text-sm sm:text-base font-bold text-ink-900">
                  Outstanding Balances &amp; Ageing Analysis
                </h2>
                <p className="text-xs text-ink-500 mt-0.5">Categorized by invoice aging buckets</p>
              </div>
              <div className="sm:text-right">
                <p className="text-[11px] sm:text-xs font-medium text-ink-500">Total Outstanding</p>
                <p className="font-mono text-lg sm:text-xl font-bold text-rose-600">{formatINR(outstandingTotal)}</p>
              </div>
            </div>

            {/* Ageing Bar Chart Component */}
            <AgeingBarChart invoices={orgInvoices} />

            {/* Top Outstanding Invoices Table preview */}
            {outstandingInvoices.length > 0 && (
              <div className="mt-5 border-t border-ink-100 pt-4">
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-500">
                    High Priority Outstanding Invoices
                  </span>
                  <Link href="/outstanding" className="text-xs font-semibold text-brand-600 hover:underline">
                    View all ({outstandingInvoices.length}) &rarr;
                  </Link>
                </div>
                <div className="divide-y divide-ink-100 rounded-xl border border-ink-100 bg-ink-50/30 overflow-hidden">
                  {outstandingInvoices.slice(0, 4).map((inv) => {
                    const patient = patients.find((p) => p.id === inv.patientId);
                    return (
                      <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-2 text-xs hover:bg-white transition-colors">
                        <div>
                          <p className="font-bold text-ink-900">
                            {patient?.name} <span className="font-mono text-ink-400">· {inv.invoiceNumber}</span>
                          </p>
                          <p className="text-[11px] text-ink-500">Issued on {inv.date || inv.createdAt.split("T")[0]}</p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3">
                          <StatusBadge status={inv.status} />
                          <span className="font-mono font-bold text-rose-600">{formatINR(inv.outstanding)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* 3. Payments & Method Breakdown Bar Chart Section */}
          <section aria-labelledby="payments-heading" className="rounded-2xl border border-ink-100 bg-white p-4 sm:p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b border-ink-100 pb-3">
              <div>
                <h2 id="payments-heading" className="text-base font-bold text-ink-900">
                  Payment Collections &amp; Method Distribution
                </h2>
                <p className="text-xs text-ink-500 mt-0.5">Collections by payment channel</p>
              </div>
              <Link href="/payments" className="text-xs font-semibold text-brand-600 hover:underline">
                View all transactions &rarr;
              </Link>
            </div>

            {/* Failed Payments Callout */}
            {failedPayments.length > 0 && (
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-900">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-600 text-white text-[10px] font-bold">!</span>
                  <span className="font-semibold">{failedPayments.length} failed payment transaction(s) require immediate staff attention.</span>
                </div>
                <Link href="/payments" className="font-bold underline text-rose-700 hover:text-rose-900 shrink-0">
                  Resolve Now
                </Link>
              </div>
            )}

            {/* Payment Method Bar Chart Component */}
            <PaymentMethodBarChart payments={orgPayments} />

            {/* Recent Payments List */}
            {recentPayments.length > 0 && (
              <div className="mt-5 border-t border-ink-100 pt-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-500">Recent Collections</p>
                <ul className="divide-y divide-ink-100 rounded-xl border border-ink-100 bg-ink-50/30">
                  {recentPayments.map((p) => {
                    const patient = patients.find((pt) => pt.id === p.patientId);
                    return (
                      <li key={p.id} className="flex items-center justify-between p-3 text-xs hover:bg-white transition-colors">
                        <div>
                          <p className="font-bold text-ink-900">{patient?.name}</p>
                          <p className="text-[11px] text-ink-500 uppercase">{p.method} · {formatDateTime(p.date)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-emerald-700">{formatINR(p.amount)}</p>
                          <StatusBadge status={p.status} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </section>

          {/* 4. Pending Billing Section */}
          <section aria-labelledby="pending-heading" className="rounded-2xl border border-ink-100 bg-white p-4 sm:p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b border-ink-100 pb-3">
              <div>
                <h2 id="pending-heading" className="text-base font-bold text-ink-900">
                  Pending Billing Encounters
                </h2>
                <p className="text-xs text-ink-500 mt-0.5">Unbilled medical services waiting for invoice generation</p>
              </div>
              <Link href="/billing/pending" className="text-xs font-semibold text-brand-600 hover:underline">
                View all ({orgPending.length}) &rarr;
              </Link>
            </div>

            {/* Pending Source Mini Bar Chart */}
            <div className="mb-4">
              <PendingSourceBarChart items={orgPending} />
            </div>

            {orgPending.length === 0 ? (
              <EmptyState title="Nothing pending" description="All billable encounters have been invoiced." />
            ) : (
              <div className="divide-y divide-ink-100 rounded-xl border border-ink-100 bg-white">
                {orgPending.slice(0, 5).map((item) => {
                  const patient = patients.find((p) => p.id === item.patientId);
                  return (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-2 text-xs hover:bg-ink-50/50 transition-colors">
                      <div>
                        <p className="font-bold text-ink-900">{patient?.name}</p>
                        <p className="text-[11px] text-ink-500 capitalize">{item.source.replace("_", " ")} · {item.date}</p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <span className="font-mono font-bold text-ink-900">{formatINR(item.amount)}</span>
                        <button
                          onClick={() => setNewInvoiceOpen(true)}
                          className="rounded-lg bg-brand-50 border border-brand-200 px-2.5 py-1 text-[11px] font-bold text-brand-700 hover:bg-brand-100 transition-colors"
                        >
                          Create Invoice
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right Column (1 Col wide on XL) */}
        <div className="space-y-6">

          {/* 5. Urgent Billing Alerts Panel */}
          <section aria-labelledby="alerts-heading" className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between border-b border-ink-100 pb-2">
              <h2 id="alerts-heading" className="text-sm font-bold text-ink-900">
                Action Required Alerts
              </h2>
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                {orgAlerts.length} Active
              </span>
            </div>
            {orgAlerts.length === 0 ? (
              <EmptyState title="No active alerts" description="Everything is running smoothly." />
            ) : (
              <ul className="space-y-2">
                {orgAlerts.map((a) => (
                  <li
                    key={a.id}
                    className={`rounded-xl border p-3 text-xs transition-all ${
                      a.severity === "critical"
                        ? "border-rose-200 bg-rose-50/80 text-rose-900"
                        : a.severity === "warning"
                        ? "border-amber-200 bg-amber-50/80 text-amber-900"
                        : "border-ink-200 bg-ink-50/80 text-ink-800"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className={`mt-0.5 flex h-2 w-2 shrink-0 rounded-full ${
                        a.severity === "critical" ? "bg-rose-600" : a.severity === "warning" ? "bg-amber-600" : "bg-sky-600"
                      }`} />
                      <div className="flex-1">
                        <p className="font-medium leading-snug">{a.message}</p>
                        <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider opacity-75">
                          Severity: {a.severity}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* 6. Refunds Section */}
          <section aria-labelledby="refunds-heading" className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between border-b border-ink-100 pb-2">
              <h2 id="refunds-heading" className="text-sm font-bold text-ink-900">
                Refunds Lifecycle
              </h2>
              <Link href="/refunds" className="text-xs font-semibold text-brand-600 hover:underline">
                Manage
              </Link>
            </div>
            <dl className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(refundBuckets).map(([k, v]) => (
                <div key={k} className="rounded-xl border border-ink-100 bg-ink-50/50 p-2.5">
                  <dt className="text-[11px] font-semibold capitalize text-ink-500">{k}</dt>
                  <dd className="font-mono text-lg font-bold text-ink-900 mt-0.5">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* 7. Insurance / TPA Section (Conditional) */}
          {showInsuranceSection && (
            <section aria-labelledby="insurance-heading" className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between border-b border-ink-100 pb-2">
                <h2 id="insurance-heading" className="text-sm font-bold text-ink-900">
                  Insurance / TPA Desk
                </h2>
                <Link href="/insurance" className="text-xs font-semibold text-brand-600 hover:underline">
                  View Claims
                </Link>
              </div>
              <ul className="space-y-2 text-xs">
                <li className="flex justify-between items-center rounded-lg bg-ink-50 p-2">
                  <span className="text-ink-600 font-medium">Pending Verification</span>
                  <span className="font-mono font-bold text-ink-900">{orgClaims.filter((c) => c.status === "pending_verification").length}</span>
                </li>
                <li className="flex justify-between items-center rounded-lg bg-ink-50 p-2">
                  <span className="text-ink-600 font-medium">Under Review / Pre-Auth</span>
                  <span className="font-mono font-bold text-ink-900">{orgClaims.filter((c) => c.status === "under_review" || c.status === "preauth_pending").length}</span>
                </li>
                <li className="flex justify-between items-center rounded-lg bg-ink-50 p-2">
                  <span className="text-ink-600 font-medium">Partially Settled</span>
                  <span className="font-mono font-bold text-ink-900">{orgClaims.filter((c) => c.status === "partially_settled").length}</span>
                </li>
                <li className="flex justify-between items-center rounded-lg bg-ink-50 p-2">
                  <span className="text-ink-600 font-medium">Settled</span>
                  <span className="font-mono font-bold text-emerald-700">{orgClaims.filter((c) => c.status === "settled").length}</span>
                </li>
              </ul>
              <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs flex justify-between items-center">
                <span className="font-semibold text-sky-900">Payer Outstanding:</span>
                <span className="font-mono font-bold text-sky-900 text-sm">{formatINR(orgClaims.reduce((s, c) => s + c.payerOutstanding, 0))}</span>
              </div>
            </section>
          )}

          {/* 8. Recent Patients Activity List */}
          <section aria-labelledby="recent-patients-heading" className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
            <h2 id="recent-patients-heading" className="mb-3 text-sm font-bold text-ink-900 border-b border-ink-100 pb-2">
              Recent Patient Billing
            </h2>
            <ul className="space-y-1.5">
              {recentPatients.map(({ invoice, patient }) => (
                <li key={invoice.id}>
                  <Link
                    href={`/patients/${patient?.id}`}
                    className="flex items-center justify-between rounded-xl px-2.5 py-2 text-xs hover:bg-brand-50 transition-colors"
                  >
                    <div>
                      <p className="font-bold text-ink-900">{patient?.name}</p>
                      <p className="text-[10px] font-mono text-ink-400">UHID: {patient?.uhid}</p>
                    </div>
                    <StatusBadge status={invoice.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {/* Real Action Modals */}
      <NewInvoiceModal open={newInvoiceOpen} onClose={() => setNewInvoiceOpen(false)} />
      <CollectPaymentModal open={collectPaymentOpen} onClose={() => setCollectPaymentOpen(false)} />
      <RequestRefundModal open={refundOpen} onClose={() => setRefundOpen(false)} />
      <DischargeSettlementModal open={dischargeOpen} onClose={() => setDischargeOpen(false)} />
      <QuickDailyCollectionModal open={dailyCollectionOpen} onClose={() => setDailyCollectionOpen(false)} />
    </div>
  );
}
