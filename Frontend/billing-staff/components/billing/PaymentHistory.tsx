import { Payment } from "@/billing-staff/types";
import { StatusBadge } from "@/billing-staff/components/ui/StatusBadge";
import { EmptyState } from "@/billing-staff/components/ui/EmptyState";
import { formatINR, formatDateTime } from "@/billing-staff/lib/utils";

export function PaymentHistory({ payments }: { payments: Payment[] }) {
  if (payments.length === 0) return <EmptyState title="No payments recorded yet" />;
  const sorted = [...payments].sort((a, b) => (a.date < b.date ? 1 : -1));
  return (
    <ul className="divide-y divide-ink-50">
      {sorted.map((p) => (
        <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
          <div>
            <p className="text-sm font-medium text-ink-800">{formatINR(p.amount)} <span className="font-normal text-ink-400">via {p.method.toUpperCase()}</span></p>
            <p className="text-xs text-ink-500">
              {formatDateTime(p.date)} · Collected by {p.collectedBy}
              {p.referenceNumber && <> · Ref: {p.referenceNumber}</>}
            </p>
            {p.failureReason && <p className="mt-0.5 text-xs text-red-600">{p.failureReason}</p>}
          </div>
          <StatusBadge status={p.status} />
        </li>
      ))}
    </ul>
  );
}
