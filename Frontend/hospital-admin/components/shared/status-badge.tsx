import { Badge, type BadgeProps } from "@/hospital-admin/components/ui/badge";
import { cn } from "@/hospital-admin/lib/utils";

/**
 * Unified status-to-color language used across every module (appointments,
 * orders, invoices, quotes, staff, vendors...). Keeping one mapping means a
 * user who learns "amber = needs attention, rose = blocked/critical, emerald
 * = complete/good" in one screen recognizes it everywhere else in the app.
 */
const STATUS_MAP: Record<string, { variant: BadgeProps["variant"]; label?: string }> = {
  active: { variant: "success" },
  available: { variant: "success" },
  verified: { variant: "success" },
  confirmed: { variant: "success" },
  completed: { variant: "success" },
  paid: { variant: "success" },
  released: { variant: "success" },
  validated: { variant: "success" },
  awarded: { variant: "success" },
  approved: { variant: "success" },
  delivered: { variant: "success" },
  resolved: { variant: "success" },

  pending: { variant: "warning" },
  invited: { variant: "warning" },
  "on-leave": { variant: "warning" },
  waiting: { variant: "warning" },
  "partially-paid": { variant: "warning" },
  processing: { variant: "warning" },
  "awaiting-validation": { variant: "warning" },
  "sample-pending": { variant: "warning" },
  "closing-soon": { variant: "warning" },
  "needs-info": { variant: "warning" },
  scheduled: { variant: "warning" },
  "under-review": { variant: "warning" },
  busy: { variant: "warning" },
  draft: { variant: "muted" },

  suspended: { variant: "destructive" },
  removed: { variant: "destructive" },
  rejected: { variant: "destructive" },
  cancelled: { variant: "destructive" },
  "no-show": { variant: "destructive" },
  overdue: { variant: "destructive" },
  failed: { variant: "destructive" },
  critical: { variant: "destructive" },
  escalated: { variant: "destructive" },
  off: { variant: "muted" },
  replaced: { variant: "warning" },

  info: { variant: "info" },
  issued: { variant: "info" },
  "in-consultation": { variant: "info" },
  rescheduled: { variant: "info" },
  collected: { variant: "info" },
  amended: { variant: "info" },
  called: { variant: "info" },
  "in-progress": { variant: "info" },
  registered: { variant: "info" },
  "follow-up-scheduled": { variant: "warning" },
  "under-treatment": { variant: "info" },
  "transfer-requested": { variant: "warning" },
  "discharge-pending": { variant: "warning" },
  discharged: { variant: "success" },
  admitted: { variant: "info" },
  "new": { variant: "info" },
  "duplicate-flagged": { variant: "destructive" },
  granted: { variant: "success" },
  restricted: { variant: "warning" },
  revoked: { variant: "destructive" },
  routed: { variant: "success" },
  "pending-route": { variant: "warning" },

  archived: { variant: "muted" },
  inactive: { variant: "muted" },
};

function formatLabel(status: string) {
  return status
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const key = status.toLowerCase();
  const mapped = STATUS_MAP[key] ?? { variant: "secondary" as const };
  return (
    <Badge variant={mapped.variant} dot className={cn(className)}>
      {mapped.label ?? formatLabel(status)}
    </Badge>
  );
}
