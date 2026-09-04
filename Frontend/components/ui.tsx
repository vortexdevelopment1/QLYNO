import { ReactNode } from "react";
import clsx from "clsx";
import { ChevronDown, ChevronUp, Clock9, X } from "lucide-react";
import {
  AlertSeverity,
  AppointmentStatus,
  DoctorAvailability,
  OrderStatus,
} from "@/lib/types";

export function Card({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return <div className={clsx("card", padded && "p-5", className)}>{children}</div>;
}

export function Modal({
  open,
  title,
  eyebrow,
  children,
  footer,
  onClose,
  size = "lg",
}: {
  open: boolean;
  title: string;
  eyebrow?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  size?: "md" | "lg" | "xl";
}) {
  if (!open) return null;

  const sizes = {
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={clsx(
          "relative w-full rounded-card border border-line bg-white shadow-lift",
          sizes[size]
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
            <h2 id="modal-title" className="font-display text-xl text-ink">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="h-8 w-8 rounded-md border border-line text-ink-muted hover:bg-paper hover:text-ink inline-flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex items-center gap-2 border-t border-line px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={clsx("block", className)}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-muted block mb-1.5">{label}</span>
      {children}
    </label>
  );
}

type TimePickerFormat = "12h" | "24h";

function parseTimeValue(value: string, format: TimePickerFormat) {
  const fallback = format === "12h" ? { hours: 12, minutes: 0 } : { hours: 9, minutes: 0 };
  const normalized = value.trim().toUpperCase();
  const twelveHour = normalized.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  const twentyFourHour = normalized.match(/^(\d{1,2}):(\d{2})$/);

  if (twelveHour) {
    const rawHours = Number(twelveHour[1]);
    const minutes = Number(twelveHour[2]);
    if (!Number.isFinite(rawHours) || !Number.isFinite(minutes)) return fallback;
    const baseHours = rawHours % 12;
    return {
      hours: twelveHour[3] === "PM" ? baseHours + 12 : baseHours,
      minutes: Math.min(Math.max(minutes, 0), 59),
    };
  }

  if (twentyFourHour) {
    const hours = Number(twentyFourHour[1]);
    const minutes = Number(twentyFourHour[2]);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return fallback;
    return {
      hours: Math.min(Math.max(hours, 0), 23),
      minutes: Math.min(Math.max(minutes, 0), 59),
    };
  }

  return fallback;
}

function padTime(value: number) {
  return String(value).padStart(2, "0");
}

function formatTimeValue(totalMinutes: number, format: TimePickerFormat) {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;

  if (format === "24h") return `${padTime(hours)}:${padTime(minutes)}`;

  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${padTime(minutes)} ${suffix}`;
}

function TimeClockFace({ hours, minutes }: { hours: number; minutes: number }) {
  const hourAngle = (hours % 12) * 30 + minutes * 0.5;
  const minuteAngle = minutes * 6;

  return (
    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand-100 bg-brand-50 shadow-[inset_0_0_0_4px_rgba(255,255,255,0.72)]">
      <span className="absolute top-1 h-1 w-1 rounded-full bg-brand-300" />
      <span className="absolute bottom-1 h-1 w-1 rounded-full bg-brand-300" />
      <span className="absolute left-1 h-1 w-1 rounded-full bg-brand-300" />
      <span className="absolute right-1 h-1 w-1 rounded-full bg-brand-300" />
      <span className="absolute inset-0" style={{ transform: `rotate(${hourAngle}deg)` }}>
        <span className="absolute left-1/2 top-1/2 h-[12px] w-[2px] -translate-x-1/2 -translate-y-full rounded-full bg-brand-800" />
      </span>
      <span className="absolute inset-0" style={{ transform: `rotate(${minuteAngle}deg)` }}>
        <span className="absolute left-1/2 top-1/2 h-[16px] w-[2px] -translate-x-1/2 -translate-y-full rounded-full bg-clay-500" />
      </span>
      <span className="absolute h-2 w-2 rounded-full border border-white bg-brand-600 shadow-card" />
    </div>
  );
}

export function TimePicker({
  value,
  onChange,
  format = "24h",
  disabled = false,
  minuteStep = 15,
  presets = [],
  className,
  ariaLabel = "Choose time",
}: {
  value: string;
  onChange: (value: string) => void;
  format?: TimePickerFormat;
  disabled?: boolean;
  minuteStep?: number;
  presets?: string[];
  className?: string;
  ariaLabel?: string;
}) {
  const parsed = parseTimeValue(value, format);
  const currentMinutes = parsed.hours * 60 + parsed.minutes;
  const displayValue = formatTimeValue(currentMinutes, format);
  const step = Math.max(1, minuteStep);

  function shiftTime(delta: number) {
    if (disabled) return;
    onChange(formatTimeValue(currentMinutes + delta, format));
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={clsx(
        "group/time relative",
        disabled && "pointer-events-none opacity-60",
        className
      )}
    >
      <button
        type="button"
        disabled={disabled}
        className="grid w-full grid-cols-[34px_1fr_20px] items-center gap-2 rounded-md border border-line bg-white px-2.5 py-2 text-left shadow-card transition-colors hover:border-brand-100 hover:bg-brand-50/50 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 disabled:opacity-60"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-50 text-brand-700">
          <Clock9 size={16} />
        </span>
        <div className="min-w-0">
          <p className="truncate font-mono text-sm font-semibold leading-tight text-ink">{displayValue}</p>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-faint">Clock picker</p>
        </div>
        <ChevronDown size={15} className="text-ink-faint transition-transform group-focus-within/time:rotate-180" />
      </button>

      <div className="invisible absolute left-0 top-full z-30 mt-2 w-full min-w-[260px] rounded-card border border-line bg-white p-3 opacity-0 shadow-lift transition-all group-focus-within/time:visible group-focus-within/time:opacity-100">
        <div className="grid grid-cols-[52px_1fr] items-center gap-3">
          <TimeClockFace hours={parsed.hours} minutes={parsed.minutes} />
          <div>
            <p className="eyebrow">Selected Time</p>
            <p className="mt-0.5 font-mono text-xl font-semibold leading-none text-ink">{displayValue}</p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-md border border-line bg-paper p-2">
            <p className="mb-1 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-faint">Hour</p>
            <div className="grid grid-cols-[26px_1fr_26px] items-center gap-1">
              <button
                type="button"
                onClick={() => shiftTime(-60)}
                disabled={disabled}
                className="flex h-7 items-center justify-center rounded-md text-ink-muted hover:bg-white hover:text-brand-700"
                aria-label="Decrease time by one hour"
              >
                <ChevronDown size={14} />
              </button>
              <span className="text-center font-mono text-sm font-semibold text-ink">
                {format === "12h" ? parsed.hours % 12 || 12 : padTime(parsed.hours)}
              </span>
              <button
                type="button"
                onClick={() => shiftTime(60)}
                disabled={disabled}
                className="flex h-7 items-center justify-center rounded-md text-ink-muted hover:bg-white hover:text-brand-700"
                aria-label="Increase time by one hour"
              >
                <ChevronUp size={14} />
              </button>
            </div>
          </div>

          <div className="rounded-md border border-line bg-paper p-2">
            <p className="mb-1 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-faint">Minute</p>
            <div className="grid grid-cols-[26px_1fr_26px] items-center gap-1">
              <button
                type="button"
                onClick={() => shiftTime(-step)}
                disabled={disabled}
                className="flex h-7 items-center justify-center rounded-md text-ink-muted hover:bg-white hover:text-brand-700"
                aria-label={`Decrease time by ${step} minutes`}
              >
                <ChevronDown size={14} />
              </button>
              <span className="text-center font-mono text-sm font-semibold text-ink">{padTime(parsed.minutes)}</span>
              <button
                type="button"
                onClick={() => shiftTime(step)}
                disabled={disabled}
                className="flex h-7 items-center justify-center rounded-md text-ink-muted hover:bg-white hover:text-brand-700"
                aria-label={`Increase time by ${step} minutes`}
              >
                <ChevronUp size={14} />
              </button>
            </div>
          </div>
        </div>

        {format === "12h" && (
          <div className="mt-2 grid grid-cols-2 gap-1 rounded-md bg-paper p-1">
            {(["AM", "PM"] as const).map((period) => {
              const active = displayValue.endsWith(period);
              return (
                <button
                  key={period}
                  type="button"
                  onClick={() => {
                    const twelveHour = parsed.hours % 12 || 12;
                    const nextHour = period === "PM" ? (twelveHour % 12) + 12 : twelveHour % 12;
                    onChange(formatTimeValue(nextHour * 60 + parsed.minutes, format));
                  }}
                  disabled={disabled}
                  className={clsx(
                    "rounded-md px-2 py-1.5 text-xs font-semibold transition-colors",
                    active ? "bg-brand-500 text-white shadow-card" : "text-ink-muted hover:bg-white hover:text-brand-700"
                  )}
                >
                  {period}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-2 grid grid-cols-3 gap-1">
          {[-step, step, step * 2].map((delta) => (
            <button
              key={delta}
              type="button"
              onClick={() => shiftTime(delta)}
              disabled={disabled}
              className="rounded-md border border-line px-2 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-brand-100 hover:bg-brand-50 hover:text-brand-700"
            >
              {delta > 0 ? "+" : ""}
              {delta} min
            </button>
          ))}
        </div>

        {presets.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1 border-t border-line pt-2">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onChange(preset)}
                disabled={disabled}
                className={clsx(
                  "rounded-md px-2 py-1 font-mono text-[11px] font-semibold transition-colors",
                  preset === displayValue ? "bg-brand-500 text-white" : "bg-paper text-ink-muted hover:bg-brand-50 hover:text-brand-700"
                )}
              >
                {preset}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  action,
  description,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
  description?: string;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-line/80 pb-5 mb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <h1 className="font-display text-3xl leading-tight text-ink">{title}</h1>
        {description && <p className="text-sm leading-6 text-ink-muted mt-2 max-w-2xl">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

const availabilityColor: Record<DoctorAvailability, string> = {
  Available: "bg-sage-400",
  Busy: "bg-clay-400",
  Off: "bg-ink-faint",
  "On Leave": "bg-alert-400",
};

export function AvailabilityDot({ status }: { status: DoctorAvailability }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
      <span className={clsx("status-dot", availabilityColor[status])} />
      {status}
    </span>
  );
}

const appointmentStyle: Record<AppointmentStatus, string> = {
  Scheduled: "bg-brand-50 text-brand-700",
  "Checked In": "bg-clay-50 text-clay-600",
  "In Consultation": "bg-brand-500 text-white",
  Completed: "bg-sage-50 text-sage-500",
  Cancelled: "bg-ink-faint/20 text-ink-muted",
  "No Show": "bg-alert-50 text-alert-500",
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return <span className={clsx("badge", appointmentStyle[status])}>{status}</span>;
}

const orderStyle: Record<OrderStatus, string> = {
  Ordered: "bg-ink-faint/20 text-ink-soft",
  "Sample Collected": "bg-brand-50 text-brand-700",
  "In Progress": "bg-clay-50 text-clay-600",
  "Report Ready": "bg-sage-50 text-sage-500",
  Reviewed: "bg-brand-100 text-brand-800",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <span className={clsx("badge", orderStyle[status])}>{status}</span>;
}

const severityStyle: Record<AlertSeverity, string> = {
  Critical: "bg-alert-50 text-alert-500",
  Warning: "bg-clay-50 text-clay-600",
  Info: "bg-brand-50 text-brand-700",
};

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  return <span className={clsx("badge", severityStyle[severity])}>{severity}</span>;
}

export function Avatar({ initials, size = 36 }: { initials: string; size?: number }) {
  return (
    <div
      className="rounded-full bg-brand-500 text-white ring-2 ring-white flex items-center justify-center font-semibold shrink-0 shadow-card"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="mb-4 h-10 w-10 rounded-md border border-line bg-paper" />
      <h3 className="font-display text-lg text-ink mb-1">{title}</h3>
      {description && <p className="text-sm text-ink-muted max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={clsx(
        "animate-pulse rounded-md bg-gradient-to-r from-ink-faint/15 via-ink-faint/25 to-ink-faint/15 bg-[length:200%_100%]",
        className
      )}
    />
  );
}

export function SectionSkeleton({ action = true }: { action?: boolean }) {
  return (
    <div className="mb-6 flex flex-col gap-3 border-b border-line/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 flex-1">
        <Skeleton className="mb-2 h-3 w-36" />
        <Skeleton className="h-9 w-64 max-w-full" />
        <Skeleton className="mt-3 h-4 w-full max-w-xl" />
      </div>
      {action && <Skeleton className="h-10 w-36 shrink-0" />}
    </div>
  );
}

export function CardGridSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: cards }).map((_, index) => (
        <Card key={index}>
          <div className="mb-4 flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="mt-2 h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="mb-3 h-3 w-full" />
          <Skeleton className="mb-4 h-3 w-2/3" />
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 6, avatar = true }: { rows?: number; avatar?: boolean }) {
  return (
    <Card padded={false}>
      <div className="divide-y divide-line">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center gap-3.5 px-5 py-3.5">
            {avatar && <Skeleton className="h-10 w-10 rounded-full" />}
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-48 max-w-full" />
              <Skeleton className="mt-2 h-3 w-72 max-w-full" />
            </div>
            <Skeleton className="hidden h-6 w-20 sm:block" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function TableSkeleton({
  columns = 5,
  rows = 6,
  wrapped = true,
}: {
  columns?: number;
  rows?: number;
  wrapped?: boolean;
}) {
  const table = (
    <table className="w-full table-clean">
      <thead>
        <tr>
          {Array.from({ length: columns }).map((_, index) => (
            <th key={index}>
              <Skeleton className="h-3 w-20" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <tr key={rowIndex}>
            {Array.from({ length: columns }).map((_, columnIndex) => (
              <td key={columnIndex}>
                <Skeleton className={clsx("h-4", columnIndex === 0 ? "w-32" : "w-20")} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return wrapped ? <Card padded={false}>{table}</Card> : table;
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "brand" | "clay" | "alert" | "sage" }) {
  const tones: Record<string, string> = {
    neutral: "bg-paper text-ink-soft border border-line",
    brand: "bg-brand-50 text-brand-700",
    clay: "bg-clay-50 text-clay-600",
    alert: "bg-alert-50 text-alert-500",
    sage: "bg-sage-50 text-sage-500",
  };
  return <span className={clsx("badge", tones[tone])}>{children}</span>;
}
