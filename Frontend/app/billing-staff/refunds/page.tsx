"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/billing-staff/context/AppContext";
import { PageHeader } from "@/billing-staff/components/ui/PageHeader";
import { FilterBar } from "@/billing-staff/components/ui/FilterBar";
import { EmptyState } from "@/billing-staff/components/ui/EmptyState";
import { RequestRefundModal } from "@/billing-staff/components/billing/RequestRefundModal";
import { RefundCard } from "@/billing-staff/components/billing/RefundCard";
import { PermissionGuard } from "@/billing-staff/components/billing/PermissionGuard";

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Requested", value: "requested" },
  { label: "Approved", value: "approved" },
  { label: "Processing", value: "processing" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
  { label: "Failed", value: "failed" },
];

export default function RefundsPage() {
  const { currentOrg, refunds } = useApp();
  const [filter, setFilter] = useState("all");
  const [requestOpen, setRequestOpen] = useState(false);

  const orgRefunds = useMemo(
    () => refunds.filter((r) => r.organizationId === currentOrg.id).filter((r) => filter === "all" || r.status === filter).sort((a, b) => (a.requestedAt < b.requestedAt ? 1 : -1)),
    [refunds, currentOrg.id, filter]
  );

  return (
    <div>
      <PageHeader
        title="Refunds"
        description="Request → Validation → Approval → Processing → Completion. Higher-value refunds require approval and remain traceable to the original invoice/payment."
        actions={
          <PermissionGuard permission="requestRefund">
            <button onClick={() => setRequestOpen(true)} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">Create Refund Request</button>
          </PermissionGuard>
        }
      />
      <div className="mb-4"><FilterBar options={FILTERS} active={filter} onChange={setFilter} /></div>
      {orgRefunds.length === 0 ? (
        <EmptyState title="No refunds found" />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {orgRefunds.map((r) => (
            <RefundCard key={r.id} refund={r} />
          ))}
        </div>
      )}
      <RequestRefundModal open={requestOpen} onClose={() => setRequestOpen(false)} />
    </div>
  );
}
