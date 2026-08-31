"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CollectPaymentModal } from "@/components/billing/CollectPaymentModal";
import { PermissionGuard } from "@/components/billing/PermissionGuard";
import { Invoice } from "@/types";
import { formatINR, formatDate, ageingDays, ageingBucket } from "@/lib/utils";
import { filterInvoicesByAccess } from "@/lib/selectors";

import Link from "next/link";

interface PatientOutstandingGroup {
  patientId: string;
  patientName: string;
  uhid: string;
  invoicesCount: number;
  totalOutstanding: number;
  invoices: Invoice[];
}

export default function OutstandingPage() {
  const { currentOrg, currentUser, invoices, patients, dispatch } = useApp();
  const [payInvoice, setPayInvoice] = useState<Invoice | null>(null);
  const [reminded, setReminded] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"invoice" | "patient">("invoice");

  const outstanding = useMemo(
    () => filterInvoicesByAccess(invoices, currentOrg.id, currentUser.scopes).filter((i) => i.outstanding > 0 && (i.status === "issued" || i.status === "partially_paid")),
    [invoices, currentOrg.id, currentUser.scopes]
  );

  const total = outstanding.reduce((s, i) => s + i.outstanding, 0);

  const patientGroups = useMemo<PatientOutstandingGroup[]>(() => {
    const map = new Map<string, Invoice[]>();
    outstanding.forEach((inv) => {
      const list = map.get(inv.patientId) ?? [];
      list.push(inv);
      map.set(inv.patientId, list);
    });

    return Array.from(map.entries()).map(([patientId, invs]) => {
      const pt = patients.find((p) => p.id === patientId);
      return {
        patientId,
        patientName: pt?.name ?? "Unknown Patient",
        uhid: pt?.uhid ?? "—",
        invoicesCount: invs.length,
        totalOutstanding: invs.reduce((s, i) => s + i.outstanding, 0),
        invoices: invs,
      };
    });
  }, [outstanding, patients]);

  function sendReminder(inv: Invoice) {
    setReminded((prev) => new Set(prev).add(inv.id));
    dispatch({ type: "SEND_REMINDER", invoice: inv });
  }

  const columns: Column<Invoice>[] = [
    { header: "Patient", accessor: (r) => { const p = patients.find((x) => x.id === r.patientId); return <span>{p?.name}<span className="block text-xs text-ink-400">{p?.uhid}</span></span>; } },
    { header: "Invoice", accessor: (r) => r.invoiceNumber },
    { header: "Invoice Date", accessor: (r) => formatDate(r.date) },
    { header: "Total", accessor: (r) => formatINR(r.total) },
    { header: "Paid", accessor: (r) => formatINR(r.paidTotal) },
    { header: "Outstanding", accessor: (r) => <span className="font-medium text-red-600">{formatINR(r.outstanding)}</span> },
    { header: "Ageing", accessor: (r) => ageingBucket(ageingDays(r.date)) },
    { header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
    {
      header: "Action",
      accessor: (r) => (
        <div className="flex gap-2">
          <PermissionGuard permission="collectPayment"><button onClick={() => setPayInvoice(r)} className="rounded-md bg-brand-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-brand-700">Collect</button></PermissionGuard>
          <button onClick={() => sendReminder(r)} disabled={reminded.has(r.id)} className="rounded-md border border-ink-200 px-2.5 py-1 text-xs font-medium text-ink-600 hover:bg-ink-50 disabled:opacity-50">
            {reminded.has(r.id) ? "Reminded" : "Send Reminder"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Outstanding Balances"
        description="Overview of unpaid and partially paid invoices categorized by ageing buckets and patient balance breakdown."
        actions={
          <div className="flex overflow-hidden rounded-lg border border-ink-200 bg-white">
            <button
              onClick={() => setViewMode("invoice")}
              className={`px-3 py-1.5 text-xs font-medium ${viewMode === "invoice" ? "bg-brand-600 text-white" : "text-ink-600 hover:bg-ink-50"}`}
            >
              Invoice-Wise View
            </button>
            <button
              onClick={() => setViewMode("patient")}
              className={`px-3 py-1.5 text-xs font-medium ${viewMode === "patient" ? "bg-brand-600 text-white" : "text-ink-600 hover:bg-ink-50"}`}
            >
              Patient-Wise View ({patientGroups.length})
            </button>
          </div>
        }
      />

      <div className="mb-4 rounded-xl border border-ink-100 bg-white p-4 shadow-card flex justify-between items-center">
        <div>
          <p className="text-xs text-ink-500">Total Outstanding Balance</p>
          <p className="text-2xl font-semibold text-ink-900">{formatINR(total)}</p>
        </div>
        <div className="text-xs text-ink-500 text-right">
          <p>{outstanding.length} invoice(s) pending</p>
          <p>{patientGroups.length} patient(s) with balance</p>
        </div>
      </div>

      <PermissionGuard permission="viewBills">
        {viewMode === "invoice" ? (
          <DataTable columns={columns} rows={outstanding} rowKey={(r) => r.id} emptyTitle="No outstanding balances" />
        ) : (
          <div className="space-y-4">
            {patientGroups.length === 0 ? (
              <div className="rounded-xl border border-ink-100 bg-white p-8 text-center text-sm text-ink-500">
                No patient-wise outstanding balances found.
              </div>
            ) : (
              patientGroups.map((pg) => (
                <div key={pg.patientId} className="rounded-xl border border-ink-100 bg-white p-4 shadow-card">
                  <div className="mb-3 flex items-center justify-between border-b border-ink-100 pb-2">
                    <div>
                      <h3 className="font-semibold text-ink-900 text-sm">{pg.patientName}</h3>
                      <p className="text-xs text-ink-400">{pg.uhid} · {pg.invoicesCount} pending invoice(s)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-ink-400">Net Outstanding</p>
                      <p className="text-base font-bold text-red-600">{formatINR(pg.totalOutstanding)}</p>
                    </div>
                  </div>

                  <ul className="divide-y divide-ink-50 text-xs mb-3">
                    {pg.invoices.map((inv) => (
                      <li key={inv.id} className="flex justify-between py-2 items-center">
                        <div>
                          <span className="font-medium text-ink-800">{inv.invoiceNumber}</span>
                          <span className="text-ink-400 ml-2">({formatDate(inv.date)})</span>
                          <span className="ml-2 text-ink-500">Ageing: {ageingBucket(ageingDays(inv.date))}</span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <span className="font-semibold text-red-600">{formatINR(inv.outstanding)}</span>
                          <button
                            onClick={() => setPayInvoice(inv)}
                            className="rounded bg-brand-600 px-2 py-0.5 text-white hover:bg-brand-700"
                          >
                            Collect
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/patients/${pg.patientId}`}
                      className="rounded-lg border border-ink-200 px-3 py-1 text-xs font-medium text-ink-700 hover:bg-ink-50"
                    >
                      Patient Profile &amp; Billing History
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </PermissionGuard>
      <CollectPaymentModal open={!!payInvoice} onClose={() => setPayInvoice(null)} invoiceId={payInvoice?.id} />
    </div>
  );
}
