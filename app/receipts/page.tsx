"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { SearchBar } from "@/components/ui/SearchBar";
import { Receipt } from "@/types";
import { formatINR, formatDateTime } from "@/lib/utils";

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
      <DataTable columns={columns} rows={filtered} rowKey={(r) => r.id} onRowClick={(r) => router.push(`/receipts/${r.id}`)} emptyTitle="No receipts found" />
    </div>
  );
}
