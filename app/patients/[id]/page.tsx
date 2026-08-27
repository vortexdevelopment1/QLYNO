"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { InvoiceCard } from "@/components/billing/InvoiceCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatINR, formatDate } from "@/lib/utils";
import { ErrorState } from "@/components/ui/ErrorState";

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { patients, encounters, invoices, receipts, refunds, insuranceClaims, currentOrg } = useApp();
  const [view, setView] = useState<"staff" | "patient">("staff");

  const patient = patients.find((p) => p.id === id);
  const patientEncounters = useMemo(() => encounters.filter((e) => e.patientId === id), [encounters, id]);
  const patientInvoices = useMemo(() => invoices.filter((i) => i.patientId === id).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)), [invoices, id]);
  const patientReceipts = useMemo(() => receipts.filter((r) => r.patientId === id), [receipts, id]);
  const patientRefunds = useMemo(() => refunds.filter((r) => r.patientId === id), [refunds, id]);
  const patientClaims = useMemo(() => insuranceClaims.filter((c) => c.patientId === id), [insuranceClaims, id]);

  if (!patient) return <ErrorState title="Patient not found" description="This patient record does not exist or is not part of the current organization." />;

  const totalOutstanding = patientInvoices.reduce((s, i) => s + i.outstanding, 0);

  return (
    <div>
      <PageHeader
        title={patient.name}
        description={`${patient.uhid} · ${patient.age} yrs · ${patient.gender} · ${patient.phone}`}
        actions={
          <div className="flex overflow-hidden rounded-lg border border-ink-200">
            <button onClick={() => setView("staff")} className={`px-3 py-1.5 text-xs font-medium ${view === "staff" ? "bg-brand-600 text-white" : "bg-white text-ink-600"}`}>Staff View</button>
            <button onClick={() => setView("patient")} className={`px-3 py-1.5 text-xs font-medium ${view === "patient" ? "bg-brand-600 text-white" : "bg-white text-ink-600"}`}>Patient Billing Preview</button>
          </div>
        }
      />

      {view === "staff" && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <section className="rounded-xl border border-ink-100 bg-white p-5 shadow-card">
              <h2 className="mb-3 text-sm font-semibold text-ink-800">Encounters <span className="font-normal text-ink-400">(clinical information — read-only)</span></h2>
              {patientEncounters.length === 0 ? (
                <EmptyState title="No encounters on record" />
              ) : (
                <ul className="divide-y divide-ink-50">
                  {patientEncounters.map((e) => (
                    <li key={e.id} className="py-2.5 text-sm">
                      <p className="font-medium text-ink-800">{e.type.toUpperCase()} · {e.department}</p>
                      <p className="text-xs text-ink-500">{e.doctorName ?? "—"} · {formatDate(e.date)} {e.roomBed && `· ${e.roomBed}`}</p>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 rounded-lg bg-ink-50 px-3 py-2 text-[11px] text-ink-500">
                Billing Staff cannot modify clinical records. Encounter details are shown here for billing context only.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold text-ink-800">Billing History <span className="font-normal text-ink-400">(financial information)</span></h2>
              {patientInvoices.length === 0 ? (
                <EmptyState title="No invoices yet" />
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {patientInvoices.map((inv) => (
                    <InvoiceCard key={inv.id} invoice={inv} />
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-ink-100 bg-white p-4 shadow-card">
              <p className="text-xs text-ink-400">Total Outstanding</p>
              <p className="text-xl font-semibold text-ink-900">{formatINR(totalOutstanding)}</p>
            </div>
            {patientRefunds.length > 0 && (
              <div className="rounded-xl border border-ink-100 bg-white p-4 shadow-card">
                <h3 className="mb-2 text-sm font-semibold text-ink-800">Refund Status</h3>
                <ul className="space-y-1.5 text-xs">
                  {patientRefunds.map((r) => (
                    <li key={r.id} className="flex items-center justify-between"><span>{formatINR(r.amount)}</span><StatusBadge status={r.status} /></li>
                  ))}
                </ul>
              </div>
            )}
            {currentOrg.insuranceEnabled && patientClaims.length > 0 && (
              <div className="rounded-xl border border-ink-100 bg-white p-4 shadow-card">
                <h3 className="mb-2 text-sm font-semibold text-ink-800">Insurance Status</h3>
                <ul className="space-y-1.5 text-xs">
                  {patientClaims.map((c) => (
                    <li key={c.id} className="flex items-center justify-between"><span>{c.policyNumber}</span><StatusBadge status={c.status} /></li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      )}

      {view === "patient" && (
        <div className="mx-auto max-w-md rounded-2xl border border-ink-200 bg-white p-5 shadow-card">
          <p className="mb-4 rounded-lg bg-brand-50 px-3 py-2 text-center text-xs text-brand-700">Preview of what {patient.name.split(" ")[0]} would see in the Qlyno patient app</p>
          <h3 className="mb-2 text-sm font-semibold text-ink-800">Invoices &amp; Payment Status</h3>
          <ul className="mb-4 space-y-2">
            {patientInvoices.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2 text-sm">
                <span>{inv.invoiceNumber}</span>
                <StatusBadge status={inv.status} />
              </li>
            ))}
          </ul>
          <h3 className="mb-2 text-sm font-semibold text-ink-800">Receipts</h3>
          <ul className="mb-4 space-y-2">
            {patientReceipts.map((r) => (
              <li key={r.id} className="flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2 text-sm">
                <span>{r.receiptNumber}</span>
                <span className="font-medium">{formatINR(r.amount)}</span>
              </li>
            ))}
          </ul>
          {totalOutstanding > 0 && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              You have {formatINR(totalOutstanding)} outstanding. <button className="font-medium underline">Pay Now (demo)</button>
            </div>
          )}
          {patientRefunds.length > 0 && (
            <>
              <h3 className="mb-2 text-sm font-semibold text-ink-800">Refund Status</h3>
              <ul className="space-y-2">
                {patientRefunds.map((r) => (
                  <li key={r.id} className="flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2 text-sm"><span>{formatINR(r.amount)}</span><StatusBadge status={r.status} /></li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
