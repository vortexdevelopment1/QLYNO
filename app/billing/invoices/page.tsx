"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FilterBar } from "@/components/ui/FilterBar";
import { SearchBar } from "@/components/ui/SearchBar";
import { formatINR, formatDate } from "@/lib/utils";
import { filterInvoicesByAccess } from "@/lib/selectors";
import { Invoice, InvoiceStatus } from "@/types";
import { NewInvoiceModal } from "@/components/billing/NewInvoiceModal";
import { PermissionGuard } from "@/components/billing/PermissionGuard";
import { useRouter } from "next/navigation";

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Issued", value: "issued" },
  { label: "Partially Paid", value: "partially_paid" },
  { label: "Paid", value: "paid" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Refunded", value: "refunded" },
];

export default function InvoicesPage() {
  const { currentOrg, currentUser, invoices, patients } = useApp();
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [newInvoiceOpen, setNewInvoiceOpen] = useState(false);

  const orgInvoices = useMemo(() => filterInvoicesByAccess(invoices, currentOrg.id, currentUser.scopes), [invoices, currentOrg.id, currentUser.scopes]);

  const filtered = orgInvoices
    .filter((i) => filter === "all" || i.status === filter)
    .filter((i) => {
      if (!query.trim()) return true;
      const p = patients.find((pt) => pt.id === i.patientId);
      const q = query.toLowerCase();
      return i.invoiceNumber.toLowerCase().includes(q) || p?.name.toLowerCase().includes(q);
    })
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const columns: Column<Invoice>[] = [
    { header: "Invoice #", accessor: (r) => <span className="font-medium text-ink-800">{r.invoiceNumber}</span> },
    { header: "Patient", accessor: (r) => patients.find((p) => p.id === r.patientId)?.name ?? "—" },
    { header: "Date", accessor: (r) => formatDate(r.date) },
    { header: "Total", accessor: (r) => formatINR(r.total) },
    { header: "Outstanding", accessor: (r) => (r.outstanding > 0 ? <span className="font-medium text-red-600">{formatINR(r.outstanding)}</span> : formatINR(0)) },
    { header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Billing / Invoices"
        description="Create, review and manage invoices for your organization and billing scope."
        actions={
          <button onClick={() => setNewInvoiceOpen(true)} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
            + New Invoice
          </button>
        }
      />
      <PermissionGuard permission="viewBills">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <FilterBar options={STATUS_FILTERS} active={filter} onChange={setFilter} />
          <div className="w-full sm:w-72">
            <SearchBar value={query} onChange={setQuery} placeholder="Search invoice # or patient…" ariaLabel="Search invoices" />
          </div>
        </div>
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.id}
          onRowClick={(r) => router.push(`/billing/invoices/${r.id}`)}
          emptyTitle="No invoices found"
          emptyDescription="Try a different filter or search term."
        />
      </PermissionGuard>
      <NewInvoiceModal open={newInvoiceOpen} onClose={() => setNewInvoiceOpen(false)} />
    </div>
  );
}
