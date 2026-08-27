"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { FilterBar } from "@/components/ui/FilterBar";
import { AuditTimeline } from "@/components/billing/AuditTimeline";

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Invoices", value: "Invoice" },
  { label: "Payments", value: "Payment" },
  { label: "Discounts", value: "Discount" },
  { label: "Refunds", value: "Refund" },
  { label: "Reconciliation", value: "Reconciliation" },
];

export default function AuditLogsPage() {
  const { currentOrg, auditLog } = useApp();
  const [filter, setFilter] = useState("all");

  const entries = useMemo(
    () => auditLog.filter((a) => a.organizationId === currentOrg.id).filter((a) => filter === "all" || a.entity === filter),
    [auditLog, currentOrg.id, filter]
  );

  return (
    <div>
      <PageHeader title="Audit Logs" description="Every invoice, payment, discount, refund and reconciliation action is logged and remains auditable — even after cancellation." />
      <div className="mb-4"><FilterBar options={FILTERS} active={filter} onChange={setFilter} /></div>
      <div className="rounded-xl border border-ink-100 bg-white p-5 shadow-card">
        <AuditTimeline entries={entries} />
      </div>
    </div>
  );
}
