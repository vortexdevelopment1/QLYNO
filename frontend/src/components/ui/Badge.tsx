import { AlertTriangle, CheckCircle2, Circle, Clock, XCircle, TrendingDown, TrendingUp, IndianRupee, Building2, Ban } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { BillingAuthority, Priority } from "@/lib/types/domain";
import { BILLING_AUTHORITY_LABEL } from "@/config/tenant-modes";
import { toTitleCase } from "@/lib/utils/format";

export type BadgeTone = "success" | "warning" | "critical" | "neutral" | "info" | "pending";

const toneClasses: Record<BadgeTone, string> = {
  success: "bg-green-50 text-status-success border-green-200",
  warning: "bg-amber-50 text-status-warning border-amber-200",
  critical: "bg-red-50 text-status-critical border-red-200",
  neutral: "bg-gray-100 text-text-muted border-gray-200",
  info: "bg-blue-50 text-status-info border-blue-200",
  pending: "bg-pastel-lavender/60 text-indigo-700 border-indigo-200",
};

const toneIcon: Record<BadgeTone, React.ReactNode> = {
  success: <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />,
  warning: <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />,
  critical: <XCircle className="h-3.5 w-3.5" aria-hidden="true" />,
  neutral: <Circle className="h-3.5 w-3.5" aria-hidden="true" />,
  info: <Circle className="h-3.5 w-3.5" aria-hidden="true" />,
  pending: <Clock className="h-3.5 w-3.5" aria-hidden="true" />,
};

export function Chip({ tone = "neutral", children, className }: { tone?: BadgeTone; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        toneClasses[tone],
        className
      )}
    >
      {toneIcon[tone]}
      {children}
    </span>
  );
}

const STATUS_TONE: Record<string, BadgeTone> = {
  // orders
  draft: "neutral", placed: "info", accepted: "info", collected: "pending", in_progress: "pending",
  partially_completed: "warning", completed: "success", on_hold: "warning", cancelled: "critical",
  // specimens
  expected: "neutral", label_printed: "neutral", received: "info", accessioned: "info",
  rejected: "critical", aliquoted: "pending", stored: "success", disposed: "neutral",
  // tests
  ordered: "neutral", ready: "info", running: "pending", resulted: "pending",
  technical_review: "warning", medical_review: "warning", verified: "success", released: "success",
  repeat_required: "critical", reflex_pending: "warning", outsourced: "info", blocked: "critical",
  // reports
  preliminary: "pending", final: "success", corrected: "warning", amended: "warning",
  // qc
  in_control: "success", warning: "warning", out_of_control: "critical", reviewed: "info", closed: "neutral",
  // billing
  estimate: "neutral", invoiced: "info", partially_paid: "warning", paid: "success",
  credit: "info", adjusted: "warning", refunded: "neutral",
  // hms posting
  post_pending: "warning", posted: "success", reversed: "critical", reconciliation_required: "critical",
  // generic
  connected: "success", offline: "critical", maintenance: "warning", degraded: "warning", disconnected: "critical",
  operational: "success", due_calibration: "warning", downtime: "critical",
  active: "success", investigating: "warning", capa_linked: "warning", open: "critical",
  available: "success", near_expiry: "warning", expired: "critical", quarantined: "critical",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const tone = STATUS_TONE[status] ?? "neutral";
  return (
    <Chip tone={tone} className={className}>
      {toTitleCase(status)}
    </Chip>
  );
}

const PRIORITY_TONE: Record<Priority, BadgeTone> = { routine: "neutral", urgent: "warning", stat: "critical" };
const PRIORITY_ICON: Record<Priority, React.ReactNode> = {
  routine: <Circle className="h-3.5 w-3.5" aria-hidden="true" />,
  urgent: <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />,
  stat: <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />,
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        toneClasses[PRIORITY_TONE[priority]]
      )}
    >
      {PRIORITY_ICON[priority]}
      {priority === "stat" ? "STAT" : toTitleCase(priority)}
    </span>
  );
}

const BILLING_TONE: Record<BillingAuthority, BadgeTone> = {
  HMS_CENTRAL: "info",
  LIS_INTERNAL: "success",
  EXTERNAL_CLIENT: "pending",
  NO_CHARGE: "neutral",
};
const BILLING_ICON: Record<BillingAuthority, React.ReactNode> = {
  HMS_CENTRAL: <Building2 className="h-3.5 w-3.5" aria-hidden="true" />,
  LIS_INTERNAL: <IndianRupee className="h-3.5 w-3.5" aria-hidden="true" />,
  EXTERNAL_CLIENT: <Building2 className="h-3.5 w-3.5" aria-hidden="true" />,
  NO_CHARGE: <Ban className="h-3.5 w-3.5" aria-hidden="true" />,
};

export function BillingAuthorityBadge({ authority }: { authority: BillingAuthority }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        toneClasses[BILLING_TONE[authority]]
      )}
    >
      {BILLING_ICON[authority]}
      {BILLING_AUTHORITY_LABEL[authority]}
    </span>
  );
}

const FLAG_TONE: Record<string, BadgeTone> = {
  normal: "success", high: "warning", low: "warning", critical_high: "critical", critical_low: "critical",
};
const FLAG_LABEL: Record<string, string> = {
  normal: "Normal", high: "High", low: "Low", critical_high: "Critical High", critical_low: "Critical Low",
};

export function ResultFlag({ flag }: { flag: string }) {
  const tone = FLAG_TONE[flag] ?? "neutral";
  const Icon = flag === "high" || flag === "critical_high" ? TrendingUp : flag === "low" || flag === "critical_low" ? TrendingDown : CheckCircle2;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap", toneClasses[tone])}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {FLAG_LABEL[flag] ?? flag}
    </span>
  );
}
