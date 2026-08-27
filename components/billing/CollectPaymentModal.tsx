"use client";

import { Modal } from "@/components/ui/Modal";
import { PaymentForm } from "./PaymentForm";
import { PermissionGuard } from "./PermissionGuard";

export function CollectPaymentModal({
  open, onClose, invoiceId,
}: {
  open: boolean; onClose: () => void; invoiceId?: string;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Collect Payment" size="md">
      <PermissionGuard permission="collectPayment" fallbackLabel="You cannot collect payments">
        <PaymentForm invoiceId={invoiceId} onCancel={onClose} onDone={onClose} />
      </PermissionGuard>
    </Modal>
  );
}
