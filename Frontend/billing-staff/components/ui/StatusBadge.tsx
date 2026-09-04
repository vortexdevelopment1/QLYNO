import { classNames } from "@/billing-staff/lib/utils";

type Tone = "neutral" | "info" | "warning" | "success" | "danger" | "purple";

const STATUS_CONFIG: Record<string, { label: string; tone: Tone; icon: string }> = {
  draft: { label: "Draft", tone: "neutral", icon: "●" },
  pending: { label: "Pending", tone: "warning", icon: "◐" },
  issued: { label: "Issued", tone: "info", icon: "→" },
  partially_paid: { label: "Partially Paid", tone: "warning", icon: "◐" },
  paid: { label: "Paid", tone: "success", icon: "✓" },
  outstanding: { label: "Outstanding", tone: "danger", icon: "!" },
  cancelled: { label: "Cancelled", tone: "neutral", icon: "✕" },
  refunded: { label: "Refunded", tone: "purple", icon: "↩" },
  adjusted: { label: "Adjusted", tone: "purple", icon: "±" },
  requested: { label: "Requested", tone: "info", icon: "→" },
  approved: { label: "Approved", tone: "success", icon: "✓" },
  rejected: { label: "Rejected", tone: "danger", icon: "✕" },
  processing: { label: "Processing", tone: "warning", icon: "◐" },
  completed: { label: "Completed", tone: "success", icon: "✓" },
  failed: { label: "Failed", tone: "danger", icon: "!" },
  suspended: { label: "Suspended", tone: "warning", icon: "!" },
  active: { label: "Active", tone: "success", icon: "✓" },
  invited: { label: "Invited", tone: "info", icon: "→" },
  removed: { label: "Removed", tone: "neutral", icon: "✕" },
  archived: { label: "Archived", tone: "neutral", icon: "●" },
  success: { label: "Success", tone: "success", icon: "✓" },
  reversed: { label: "Reversed", tone: "purple", icon: "↩" },
  not_required: { label: "Not Required", tone: "neutral", icon: "—" },
  pending_verification: { label: "Pending Verification", tone: "warning", icon: "◐" },
  verified: { label: "Verified", tone: "success", icon: "✓" },
  preauth_pending: { label: "Pre-auth Pending", tone: "warning", icon: "◐" },
  claim_submitted: { label: "Claim Submitted", tone: "info", icon: "→" },
  under_review: { label: "Under Review", tone: "warning", icon: "◐" },
  partially_settled: { label: "Partially Settled", tone: "warning", icon: "◐" },
  settled: { label: "Settled", tone: "success", icon: "✓" },
  open: { label: "Open", tone: "danger", icon: "!" },
  investigating: { label: "Investigating", tone: "warning", icon: "◐" },
  resolved: { label: "Resolved", tone: "success", icon: "✓" },
};

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-ink-100 text-ink-700",
  info: "bg-brand-50 text-brand-700",
  warning: "bg-amber-50 text-amber-700",
  success: "bg-emerald-50 text-emerald-700",
  danger: "bg-red-50 text-red-700",
  purple: "bg-violet-50 text-violet-700",
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const config = STATUS_CONFIG[status] ?? { label: label ?? status, tone: "neutral" as Tone, icon: "●" };
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        TONE_CLASSES[config.tone]
      )}
    >
      <span aria-hidden="true">{config.icon}</span>
      {label ?? config.label}
    </span>
  );
}
