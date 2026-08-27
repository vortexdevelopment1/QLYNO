"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { InvoiceForm } from "@/components/billing/InvoiceForm";
import { PermissionGuard } from "@/components/billing/PermissionGuard";

export default function NewInvoicePage() {
  const router = useRouter();
  return (
    <div>
      <PageHeader title="Create Invoice" description="Build an invoice from chargeable services for a patient." />
      <PermissionGuard permission="createBill" fallbackLabel="You cannot create invoices">
        <div className="rounded-xl border border-ink-100 bg-white p-5 shadow-card">
          <InvoiceForm onCancel={() => router.push("/billing/invoices")} onCreated={(id) => router.push(`/billing/invoices/${id}`)} />
        </div>
      </PermissionGuard>
    </div>
  );
}
