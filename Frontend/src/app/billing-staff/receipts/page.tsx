"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/billing-staff/context/AppContext";
import { PageHeader } from "@/billing-staff/components/ui/PageHeader";
import { DataTable, Column } from "@/billing-staff/components/ui/DataTable";
import { SearchBar } from "@/billing-staff/components/ui/SearchBar";
import { Receipt } from "@/billing-staff/types";
import { formatINR, formatDateTime } from "@/billing-staff/lib/utils";

export default function ReceiptsPage() {
  const { currentOrg, receipts, patients, invoices } = useApp();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const orgReceipts = useMemo(() => receipts.filter((r) => r.organizationId === currentOrg.id), [receipts, currentOrg.id]);
  const filtered = orgReceipts
    .filter((r) => {
      if (!query.trim()) return true;
      const p = patients.find((pt) => pt.id === r.patientId);
      const q = query.toLowerCase();
      return r.receiptNumber.toLowerCase().includes(q) || p?.name.toLowerCase().includes(q);
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const columns: Column<Receipt>[] = [
    { header: "Receipt #", accessor: (r) => <span className="font-medium text-ink-800">{r.receiptNumber}</span> },
    { header: "Invoice", accessor: (r) => invoices.find((i) => i.id === r.invoiceId)?.invoiceNumber ?? "—" },
    { header: "Patient", accessor: (r) => patients.find((p) => p.id === r.patientId)?.name ?? "—" },
    { header: "Amount", accessor: (r) => formatINR(r.amount) },
    { header: "Method", accessor: (r) => <span className="uppercase">{r.method}</span> },
    { header: "Date", accessor: (r) => formatDateTime(r.date) },
    { header: "Received By", accessor: (r) => r.receivedBy },
  ];

  return (
    <div>
      <PageHeader title="Receipts" description="Proof of payment issued to patients." />
      <div className="mb-4 max-w-sm">
        <SearchBar value={query} onChange={setQuery} placeholder="Search receipt # or patient…" ariaLabel="Search receipts" />
      </div>
      <DataTable columns={columns} rows={filtered} rowKey={(r) => r.id} onRowClick={(r) => router.push(`/billing-staff/receipts/${r.id}`)} emptyTitle="No receipts found" />
    </div>
  );
}
