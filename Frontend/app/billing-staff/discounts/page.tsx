"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/billing-staff/context/AppContext";
import { PageHeader } from "@/billing-staff/components/ui/PageHeader";
import { FilterBar } from "@/billing-staff/components/ui/FilterBar";
import { EmptyState } from "@/billing-staff/components/ui/EmptyState";
import { DiscountForm } from "@/billing-staff/components/billing/DiscountForm";
import { DiscountApproval } from "@/billing-staff/components/billing/DiscountApproval";
import { Modal } from "@/billing-staff/components/ui/Modal";
import { PermissionGuard } from "@/billing-staff/components/billing/PermissionGuard";

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Pending Approval", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Not Required", value: "not_required" },
];

export default function DiscountsPage() {
  const { currentOrg, discounts } = useApp();
  const [filter, setFilter] = useState("all");
  const [applyOpen, setApplyOpen] = useState(false);

  const orgDiscounts = useMemo(
    () => discounts.filter((d) => d.organizationId === currentOrg.id).filter((d) => filter === "all" || d.approvalStatus === filter).sort((a, b) => (a.requestedAt < b.requestedAt ? 1 : -1)),
    [discounts, currentOrg.id, filter]
  );

  return (
    <div>
      <PageHeader
        title="Discounts / Approvals"
        description="Normal discounts apply within configured limits. Higher and special-case discounts require approval — never a silent change to the financial amount."
        actions={
          <PermissionGuard permission="applyNormalDiscount">
            <button onClick={() => setApplyOpen(true)} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">Apply Discount</button>
          </PermissionGuard>
        }
      />
      <div className="mb-4"><FilterBar options={FILTERS} active={filter} onChange={setFilter} /></div>
      {orgDiscounts.length === 0 ? (
        <EmptyState title="No discounts recorded" />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {orgDiscounts.map((d) => (
            <DiscountApproval key={d.id} discount={d} />
          ))}
        </div>
      )}
      <Modal open={applyOpen} onClose={() => setApplyOpen(false)} title="Apply Discount">
        <DiscountForm onCancel={() => setApplyOpen(false)} onDone={() => setApplyOpen(false)} />
      </Modal>
    </div>
  );
}
