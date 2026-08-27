"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FilterBar } from "@/components/ui/FilterBar";
import { CollectPaymentModal } from "@/components/billing/CollectPaymentModal";
import { PermissionGuard } from "@/components/billing/PermissionGuard";
import { Payment } from "@/types";
import { formatINR, formatDateTime } from "@/lib/utils";

const METHOD_FILTERS = [
  { label: "All Methods", value: "all" },
  { label: "Cash", value: "cash" },
  { label: "Card", value: "card" },
  { label: "UPI", value: "upi" },
  { label: "Online", value: "online" },
];

const STATUS_FILTERS = [
  { label: "All", value: "all" },
  { label: "Success", value: "success" },
  { label: "Failed", value: "failed" },
  { label: "Reversed", value: "reversed" },
];

export default function PaymentsPage() {
  const { currentOrg, payments, invoices, patients } = useApp();
  const router = useRouter();
  const [methodFilter, setMethodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [collectOpen, setCollectOpen] = useState(false);

  const orgPayments = useMemo(() => payments.filter((p) => p.organizationId === currentOrg.id), [payments, currentOrg.id]);
  const filtered = orgPayments
    .filter((p) => methodFilter === "all" || p.method === methodFilter)
    .filter((p) => statusFilter === "all" || p.status === statusFilter)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const columns: Column<Payment>[] = [
    { header: "Patient", accessor: (r) => patients.find((p) => p.id === r.patientId)?.name ?? "—" },
    { header: "Invoice", accessor: (r) => invoices.find((i) => i.id === r.invoiceId)?.invoiceNumber ?? "—" },
    { header: "Amount", accessor: (r) => formatINR(r.amount) },
    { header: "Method", accessor: (r) => <span className="uppercase">{r.method}</span> },
    { header: "Reference", accessor: (r) => r.referenceNumber ?? "—" },
    { header: "Date", accessor: (r) => formatDateTime(r.date) },
    { header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Full, partial and multiple payments across invoices. Failed payments keep the invoice outstanding."
        actions={
          <PermissionGuard permission="collectPayment">
            <button onClick={() => setCollectOpen(true)} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">Collect Payment</button>
          </PermissionGuard>
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <FilterBar options={METHOD_FILTERS} active={methodFilter} onChange={setMethodFilter} ariaLabel="Filter by payment method" />
        <FilterBar options={STATUS_FILTERS} active={statusFilter} onChange={setStatusFilter} ariaLabel="Filter by payment status" />
      </div>
      <DataTable columns={columns} rows={filtered} rowKey={(r) => r.id} onRowClick={(r) => router.push(`/payments/${r.id}`)} emptyTitle="No payments found" />
      <CollectPaymentModal open={collectOpen} onClose={() => setCollectOpen(false)} />
    </div>
  );
}
