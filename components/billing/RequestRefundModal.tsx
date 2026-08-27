"use client";

import { Modal } from "@/components/ui/Modal";
import { RefundForm } from "./RefundForm";
import { PermissionGuard } from "./PermissionGuard";

export function RequestRefundModal({
  open, onClose, invoiceId,
}: {
  open: boolean; onClose: () => void; invoiceId?: string;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Request Refund" size="md">
      <PermissionGuard permission="requestRefund" fallbackLabel="You cannot request refunds">
        <RefundForm invoiceId={invoiceId} onCancel={onClose} onDone={onClose} />
      </PermissionGuard>
    </Modal>
  );
}
