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
  patientPortion: number;
  payerPortion: number;
  invoices: Invoice[];
}

export default function OutstandingPage() {
  const { currentOrg, currentUser, invoices, patients, payers, insuranceClaims, dispatch } = useApp();
  const [payInvoice, setPayInvoice] = useState<Invoice | null>(null);
  const [reminded, setReminded] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"invoice" | "patient">("invoice");
  const [outstandingType, setOutstandingType] = useState<"all" | "patient" | "payer">("all");

  const outstanding = useMemo(
    () => filterInvoicesByAccess(invoices, currentOrg.id, currentUser.scopes).filter((i) => i.outstanding > 0 && (i.status === "issued" || i.status === "partially_paid")),
    [invoices, currentOrg.id, currentUser.scopes]
  );

  // Compute breakdown of Patient vs Payer (TPA) outstanding
  const totals = useMemo(() => {
    let totalAll = 0;
    let totalPatient = 0;
    let totalPayer = 0;

    outstanding.forEach((inv) => {
      totalAll += inv.outstanding;
      const claim = insuranceClaims.find((c) => c.invoiceId === inv.id);
      if (claim) {
        const payerPart = Math.min(inv.outstanding, claim.payerOutstanding);
        const patientPart = Math.max(0, inv.outstanding - payerPart);
        totalPayer += payerPart;
        totalPatient += patientPart;
      } else {
        totalPatient += inv.outstanding;
      }
    });

    return { totalAll, totalPatient, totalPayer };
  }, [outstanding, insuranceClaims]);

  const filteredInvoices = useMemo(() => {
    if (outstandingType === "all") return outstanding;
    if (outstandingType === "patient") {
      return outstanding.filter((inv) => {
        const claim = insuranceClaims.find((c) => c.invoiceId === inv.id);
        if (!claim) return true;
        return (inv.outstanding - claim.payerOutstanding) > 0;
      });
    }
    // payer
    return outstanding.filter((inv) => {
      const claim = insuranceClaims.find((c) => c.invoiceId === inv.id);
      return claim && claim.payerOutstanding > 0;
    });
  }, [outstanding, insuranceClaims, outstandingType]);

  const patientGroups = useMemo<PatientOutstandingGroup[]>(() => {
    const map = new Map<string, Invoice[]>();
    filteredInvoices.forEach((inv) => {
      const list = map.get(inv.patientId) ?? [];
      list.push(inv);
      map.set(inv.patientId, list);
    });

    return Array.from(map.entries()).map(([patientId, invs]) => {
      const pt = patients.find((p) => p.id === patientId);
      let patientPortion = 0;
      let payerPortion = 0;

      invs.forEach((inv) => {
        const claim = insuranceClaims.find((c) => c.invoiceId === inv.id);
        if (claim) {
          const payerPart = Math.min(inv.outstanding, claim.payerOutstanding);
          const patientPart = Math.max(0, inv.outstanding - payerPart);
          payerPortion += payerPart;
          patientPortion += patientPart;
        } else {
          patientPortion += inv.outstanding;
        }
      });

      return {
        patientId,
        patientName: pt?.name ?? "Unknown Patient",
        uhid: pt?.uhid ?? "—",
        invoicesCount: invs.length,
        totalOutstanding: invs.reduce((s, i) => s + i.outstanding, 0),
        patientPortion,
        payerPortion,
        invoices: invs,
      };
    });
  }, [filteredInvoices, patients, insuranceClaims]);

  function sendReminder(inv: Invoice) {
    setReminded((prev) => new Set(prev).add(inv.id));
    dispatch({ type: "SEND_REMINDER", invoice: inv });
  }

  const columns: Column<Invoice>[] = [
    {
      header: "Patient",
      accessor: (r) => {
        const p = patients.find((x) => x.id === r.patientId);
        return (
          <span>
            {p?.name}
            <span className="block text-xs text-ink-400">{p?.uhid}</span>
          </span>
        );
      },
    },
    { header: "Invoice", accessor: (r) => r.invoiceNumber },
    { header: "Invoice Date", accessor: (r) => formatDate(r.date) },
    {
      header: "Payer / Claim",
      accessor: (r) => {
        const claim = insuranceClaims.find((c) => c.invoiceId === r.id);
        const payer = payers.find((p) => p.id === r.payerId);
        if (!claim) return <span className="text-xs text-ink-500">{payer?.name || "Self Pay"}</span>;
        return (
          <div className="text-xs">
            <span className="font-semibold text-brand-700">{payer?.name}</span>
            <span className="block text-[11px] text-ink-400">Payer Owes: {formatINR(claim.payerOutstanding)}</span>
          </div>
        );
      },
    },
    { header: "Net Outstanding", accessor: (r) => <span className="font-medium text-red-600">{formatINR(r.outstanding)}</span> },
    {
      header: "Portion Breakdown",
      accessor: (r) => {
        const claim = insuranceClaims.find((c) => c.invoiceId === r.id);
        if (!claim) return <span className="text-xs text-ink-600">Patient: {formatINR(r.outstanding)}</span>;
        const payerPart = Math.min(r.outstanding, claim.payerOutstanding);
        const patientPart = Math.max(0, r.outstanding - payerPart);
        return (
          <div className="text-xs space-y-0.5">
            {patientPart > 0 && <span className="block text-red-600 font-medium">Patient: {formatINR(patientPart)}</span>}
            {payerPart > 0 && <span className="block text-amber-700 font-medium">Payer: {formatINR(payerPart)}</span>}
          </div>
        );
      },
    },
    { header: "Ageing", accessor: (r) => ageingBucket(ageingDays(r.date)) },
    { header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
    {
      header: "Action",
      accessor: (r) => (
        <div className="flex gap-2">
          <PermissionGuard permission="collectPayment">
            <button onClick={() => setPayInvoice(r)} className="rounded-md bg-brand-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-brand-700">
              Collect
            </button>
          </PermissionGuard>
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
        description="Overview of unpaid and partially paid invoices with explicit separation of Patient Outstanding vs Insurance Payer / TPA Outstanding."
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

      {/* Metric Cards with Patient vs Payer breakdown */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div
          onClick={() => setOutstandingType("all")}
          className={`cursor-pointer rounded-xl border p-4 shadow-card transition-all ${
            outstandingType === "all" ? "border-brand-500 bg-brand-50/20 ring-2 ring-brand-200" : "border-ink-100 bg-white hover:border-ink-200"
          }`}
        >
          <p className="text-xs font-medium text-ink-500">Total Combined Outstanding</p>
          <p className="mt-1 text-2xl font-bold text-ink-900">{formatINR(totals.totalAll)}</p>
          <p className="mt-1 text-[11px] text-ink-400">{outstanding.length} pending invoice(s)</p>
        </div>

        <div
          onClick={() => setOutstandingType("patient")}
          className={`cursor-pointer rounded-xl border p-4 shadow-card transition-all ${
            outstandingType === "patient" ? "border-red-500 bg-red-50/20 ring-2 ring-red-200" : "border-ink-100 bg-white hover:border-ink-200"
          }`}
        >
          <p className="text-xs font-medium text-red-600">Patient Responsibility Outstanding</p>
          <p className="mt-1 text-2xl font-bold text-red-700">{formatINR(totals.totalPatient)}</p>
          <p className="mt-1 text-[11px] text-ink-400">Direct patient payable portion</p>
        </div>

        <div
          onClick={() => setOutstandingType("payer")}
          className={`cursor-pointer rounded-xl border p-4 shadow-card transition-all ${
            outstandingType === "payer" ? "border-amber-500 bg-amber-50/20 ring-2 ring-amber-200" : "border-ink-100 bg-white hover:border-ink-200"
          }`}
        >
          <p className="text-xs font-medium text-amber-700">Payer (Insurance / TPA) Outstanding</p>
          <p className="mt-1 text-2xl font-bold text-amber-800">{formatINR(totals.totalPayer)}</p>
          <p className="mt-1 text-[11px] text-ink-400">Pending TPA claim settlements</p>
        </div>
      </div>

      <PermissionGuard permission="viewBills">
        {viewMode === "invoice" ? (
          <DataTable columns={columns} rows={filteredInvoices} rowKey={(r) => r.id} emptyTitle="No outstanding balances found" />
        ) : (
          <div className="space-y-4">
            {patientGroups.length === 0 ? (
              <div className="rounded-xl border border-ink-100 bg-white p-8 text-center text-sm text-ink-500">
                No patient-wise outstanding balances found for selected filter.
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
                      <div className="text-[11px] text-ink-500">
                        Patient: <span className="font-semibold text-red-600">{formatINR(pg.patientPortion)}</span> · Payer: <span className="font-semibold text-amber-700">{formatINR(pg.payerPortion)}</span>
                      </div>
                    </div>
                  </div>

                  <ul className="divide-y divide-ink-50 text-xs mb-3">
                    {pg.invoices.map((inv) => {
                      const claim = insuranceClaims.find((c) => c.invoiceId === inv.id);
                      return (
                        <li key={inv.id} className="flex justify-between py-2 items-center">
                          <div>
                            <span className="font-medium text-ink-800">{inv.invoiceNumber}</span>
                            <span className="text-ink-400 ml-2">({formatDate(inv.date)})</span>
                            <span className="ml-2 text-ink-500">Ageing: {ageingBucket(ageingDays(inv.date))}</span>
                            {claim && (
                              <span className="ml-2 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-800 font-semibold">
                                TPA: {payers.find((p) => p.id === claim.payerId)?.name} (Owes {formatINR(claim.payerOutstanding)})
                              </span>
                            )}
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
                      );
                    })}
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
