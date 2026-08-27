import { AuditLogEntry } from "@/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTime, formatINR } from "@/lib/utils";

const ACTION_LABEL: Record<string, string> = {
  invoice_created: "Invoice created",
  invoice_modified: "Invoice modified",
  invoice_finalized: "Invoice finalized",
  invoice_cancelled: "Invoice cancelled",
  payment_recorded: "Payment recorded",
  payment_reversed: "Payment reversed",
  discount_applied: "Discount applied",
  discount_approved: "Discount approved",
  discount_rejected: "Discount rejected",
  refund_requested: "Refund requested",
  refund_approved: "Refund approved",
  refund_rejected: "Refund rejected",
  refund_completed: "Refund completed",
  reconciliation_resolved: "Reconciliation exception resolved",
};

export function AuditTimeline({ entries }: { entries: AuditLogEntry[] }) {
  if (entries.length === 0) return <EmptyState title="No audit history yet" />;
  const sorted = [...entries].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
  return (
    <ol className="space-y-4 border-l border-ink-100 pl-4">
      {sorted.map((e) => (
        <li key={e.id} className="relative">
          <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-brand-500" aria-hidden="true" />
          <p className="text-sm font-medium text-ink-800">{ACTION_LABEL[e.action] ?? e.action}</p>
          <p className="text-xs text-ink-500">
            {e.user} · {formatDateTime(e.timestamp)}
            {typeof e.amount === "number" && <> · {formatINR(e.amount)}</>}
          </p>
          {e.previousState && e.newState && (
            <p className="text-xs text-ink-400">{e.previousState} → {e.newState}</p>
          )}
          {e.reason && <p className="mt-0.5 text-xs text-ink-600">&ldquo;{e.reason}&rdquo;</p>}
          {e.approver && <p className="text-xs text-ink-400">Approved by {e.approver}</p>}
        </li>
      ))}
    </ol>
  );
}
