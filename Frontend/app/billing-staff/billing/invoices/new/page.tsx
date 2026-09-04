"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/billing-staff/components/ui/PageHeader";
import { InvoiceForm } from "@/billing-staff/components/billing/InvoiceForm";
import { PermissionGuard } from "@/billing-staff/components/billing/PermissionGuard";

export default function NewInvoicePage() {
  const router = useRouter();
  return (
    <div>
      <PageHeader title="Create Invoice" description="Build an invoice from chargeable services for a patient." />
      <PermissionGuard permission="createBill" fallbackLabel="You cannot create invoices">
        <div className="rounded-xl border border-ink-100 bg-white p-5 shadow-card">
          <InvoiceForm onCancel={() => router.push("/billing-staff/billing/invoices")} onCreated={(id) => router.push(`/billing-staff/billing/invoices/${id}`)} />
        </div>
      </PermissionGuard>
    </div>
  );
}
