"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { PermissionGuard } from "@/components/billing/PermissionGuard";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatINR } from "@/lib/utils";
import { filterInvoicesByAccess } from "@/lib/selectors";

type ReportKey = "daily_collection" | "outstanding" | "payment_method" | "service_revenue" | "doctor_wise" | "department_wise" | "insurance" | "refund" | "discount" | "reconciliation";

export default function ReportsPage() {
  const { currentOrg, currentUser, invoices, payments, refunds, discounts, insuranceClaims, encounters, reconciliationRecords } = useApp();
  const [report, setReport] = useState<ReportKey>("daily_collection");

  const orgInvoices = useMemo(() => filterInvoicesByAccess(invoices, currentOrg.id, currentUser.scopes), [invoices, currentOrg.id, currentUser.scopes]);
  const orgPayments = payments.filter((p) => p.organizationId === currentOrg.id);
  const orgRefunds = refunds.filter((r) => r.organizationId === currentOrg.id);
  const orgDiscounts = discounts.filter((d) => d.organizationId === currentOrg.id);
  const orgClaims = insuranceClaims.filter((c) => c.organizationId === currentOrg.id);
  const orgRecon = reconciliationRecords.filter((r) => r.organizationId === currentOrg.id);

  const availableReports: { key: ReportKey; label: string; available: boolean }[] = [
    { key: "daily_collection", label: "Daily Collection", available: true },
    { key: "outstanding", label: "Outstanding", available: true },
    { key: "payment_method", label: "Payment Method", available: true },
    { key: "service_revenue", label: "Service Revenue", available: true },
    { key: "doctor_wise", label: "Doctor-wise", available: currentOrg.type !== "solo_doctor" },
    { key: "department_wise", label: "Department-wise", available: currentOrg.type === "hospital" },
    { key: "insurance", label: "Insurance/TPA", available: currentOrg.insuranceEnabled },
    { key: "refund", label: "Refund Report", available: true },
    { key: "discount", label: "Discount Report", available: true },
    { key: "reconciliation", label: "Reconciliation", available: currentUser.permissions.reconciliation },
  ];

  const successPayments = orgPayments.filter((p) => p.status === "success");
  const totalCollections = successPayments.reduce((s, p) => s + p.amount, 0);
  const totalOutstanding = orgInvoices.reduce((s, i) => s + i.outstanding, 0);

  const byMethod = successPayments.reduce<Record<string, number>>((acc, p) => {
    acc[p.method] = (acc[p.method] ?? 0) + p.amount;
    return acc;
  }, {});

  const byService = orgInvoices.flatMap((i) => i.lineItems).reduce<Record<string, number>>((acc, l) => {
    acc[l.serviceName] = (acc[l.serviceName] ?? 0) + l.total;
    return acc;
  }, {});

  const byDoctor = orgInvoices.reduce<Record<string, number>>((acc, i) => {
    const enc = encounters.find((e) => e.id === i.encounterId);
    const doc = enc?.doctorName ?? "Unassigned";
    acc[doc] = (acc[doc] ?? 0) + i.total;
    return acc;
  }, {});

  const byDepartment = orgInvoices.reduce<Record<string, number>>((acc, i) => {
    const enc = encounters.find((e) => e.id === i.encounterId);
    const dept = enc?.department ?? "General";
    acc[dept] = (acc[dept] ?? 0) + i.total;
    return acc;
  }, {});

  const bar = (map: Record<string, number>) => {
    const max = Math.max(1, ...Object.values(map));
    return (
      <ul className="space-y-2">
        {Object.entries(map).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
          <li key={k}>
            <div className="mb-1 flex justify-between text-xs text-ink-600"><span>{k}</span><span className="font-medium">{formatINR(v)}</span></div>
            <div className="h-2 rounded-full bg-ink-100"><div className="h-2 rounded-full bg-brand-500" style={{ width: `${(v / max) * 100}%` }} /></div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div>
      <PageHeader title="Reports" description="Available reports adapt to organization type, permission and billing scope." />
      <PermissionGuard permission="financialReports">
        <div className="mb-5 flex flex-wrap gap-2">
          {availableReports.filter((r) => r.available).map((r) => (
            <button
              key={r.key}
              onClick={() => setReport(r.key)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${report === r.key ? "border-brand-600 bg-brand-600 text-white" : "border-ink-200 bg-white text-ink-600 hover:border-brand-300"}`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-ink-100 bg-white p-5 shadow-card">
          {report === "daily_collection" && (
            <>
              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard label="Total Collections" value={formatINR(totalCollections)} tone="success" />
                <StatCard label="Successful Payments" value={String(successPayments.length)} />
                <StatCard label="Invoices Generated" value={String(orgInvoices.length)} />
              </div>
              {bar(byMethod)}
            </>
          )}
          {report === "outstanding" && (
            <>
              <StatCard label="Total Outstanding" value={formatINR(totalOutstanding)} tone="warning" />
              <div className="mt-4">{bar(orgInvoices.filter((i) => i.outstanding > 0).reduce<Record<string, number>>((acc, i) => { acc[i.invoiceNumber] = i.outstanding; return acc; }, {}))}</div>
            </>
          )}
          {report === "payment_method" && bar(byMethod)}
          {report === "service_revenue" && (Object.keys(byService).length ? bar(byService) : <EmptyState title="No service revenue recorded" />)}
          {report === "doctor_wise" && (Object.keys(byDoctor).length ? bar(byDoctor) : <EmptyState title="No doctor-wise data" />)}
          {report === "department_wise" && (Object.keys(byDepartment).length ? bar(byDepartment) : <EmptyState title="No department-wise data" />)}
          {report === "insurance" && (
            orgClaims.length === 0 ? <EmptyState title="No insurance claims" /> : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard label="Claims" value={String(orgClaims.length)} />
                <StatCard label="Settled" value={String(orgClaims.filter((c) => c.status === "settled").length)} tone="success" />
                <StatCard label="Payer Outstanding" value={formatINR(orgClaims.reduce((s, c) => s + c.payerOutstanding, 0))} tone="warning" />
                <StatCard label="Rejected" value={String(orgClaims.filter((c) => c.status === "rejected").length)} tone="danger" />
              </div>
            )
          )}
          {report === "refund" && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="Total Requested" value={String(orgRefunds.length)} />
              <StatCard label="Completed" value={String(orgRefunds.filter((r) => r.status === "completed").length)} tone="success" />
              <StatCard label="Pending Approval" value={String(orgRefunds.filter((r) => r.status === "requested" && r.requiresApproval).length)} tone="warning" />
              <StatCard label="Total Refunded" value={formatINR(orgRefunds.filter((r) => r.status === "completed").reduce((s, r) => s + r.amount, 0))} />
            </div>
          )}
          {report === "discount" && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="Total Discounts" value={String(orgDiscounts.length)} />
              <StatCard label="Pending Approval" value={String(orgDiscounts.filter((d) => d.approvalStatus === "pending").length)} tone="warning" />
              <StatCard label="Approved" value={String(orgDiscounts.filter((d) => d.approvalStatus === "approved").length)} tone="success" />
              <StatCard label="Total Amount" value={formatINR(orgDiscounts.reduce((s, d) => s + d.amount, 0))} />
            </div>
          )}
          {report === "reconciliation" && (
            <PermissionGuard permission="reconciliation">
              {orgRecon.length === 0 ? <EmptyState title="No reconciliation records" /> : (
                <ul className="space-y-3">
                  {orgRecon.map((r) => (
                    <li key={r.id} className="rounded-lg bg-ink-50 p-3 text-sm">
                      <div className="flex justify-between"><span className="text-ink-500">{r.date}</span><span className="font-medium text-ink-800">Diff: {formatINR(r.difference)}</span></div>
                      <p className="text-xs text-ink-500">{r.exceptions.length} exception(s)</p>
                    </li>
                  ))}
                </ul>
              )}
            </PermissionGuard>
          )}
        </div>
      </PermissionGuard>
    </div>
  );
}
