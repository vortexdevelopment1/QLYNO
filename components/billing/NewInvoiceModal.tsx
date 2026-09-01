"use client";

import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { InvoiceForm } from "./InvoiceForm";
import { PendingBillingItem } from "@/types";
import { PermissionGuard } from "./PermissionGuard";

export function NewInvoiceModal({
  open, onClose, prefillPending,
}: {
  open: boolean; onClose: () => void; prefillPending?: PendingBillingItem | PendingBillingItem[];
}) {
  const router = useRouter();
  return (
    <Modal open={open} onClose={onClose} title="Create Invoice" size="lg">
      <PermissionGuard permission="createBill" fallbackLabel="You cannot create invoices">
        <InvoiceForm
          onCancel={onClose}
          onCreated={(id) => {
            onClose();
            router.push(`/billing/invoices/${id}`);
          }}
          prefillPending={prefillPending}
        />
      </PermissionGuard>
    </Modal>
  );
}
