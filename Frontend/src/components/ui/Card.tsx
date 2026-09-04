import type { LucideIcon } from "lucide-react";
import { ArrowRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-card border border-app-border bg-app-surface shadow-subtle", className)}>
      {children}
    </div>
  );
}

const PASTEL_BG = ["bg-pastel-blue", "bg-pastel-lavender", "bg-pastel-lime", "bg-pastel-teal"];

export function MetricCard({
  label,
  value,
  sublabel,
  icon: Icon,
  tone = 0,
  href,
  trend,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: LucideIcon;
  tone?: number;
  href?: string;
  trend?: { direction: "up" | "down"; value: string };
}) {
  const content = (
    <Card className="h-full p-4 transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">{label}</span>
        {Icon && (
          <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", PASTEL_BG[tone % PASTEL_BG.length])}>
            <Icon className="h-4 w-4 text-text-main" aria-hidden="true" />
          </span>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-display text-[27px] font-semibold text-text-main">{value}</span>
        {trend && (
          <span className={cn("text-xs font-medium", trend.direction === "up" ? "text-status-success" : "text-status-critical")}>
            {trend.direction === "up" ? "▲" : "▼"} {trend.value}
          </span>
        )}
      </div>
      {sublabel && <p className="mt-1 text-xs text-text-muted">{sublabel}</p>}
    </Card>
  );

  if (href) {
    return (
      <Link href={href} aria-label={`${label}: ${value}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded-card">
        {content}
      </Link>
    );
  }
  return content;
}

export function TrendCard({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-text-main">{title}</h3>
        {action}
      </div>
      {children}
    </Card>
  );
}

export function AlertCard({
  title,
  count,
  tone = "warning",
  description,
  href,
}: {
  title: string;
  count: number | string;
  tone?: "warning" | "critical" | "info";
  description?: string;
  href?: string;
}) {
  const toneClasses = {
    warning: "border-amber-200 bg-amber-50",
    critical: "border-red-200 bg-red-50",
    info: "border-blue-200 bg-blue-50",
  }[tone];
  const body = (
    <div className={cn("flex items-center justify-between rounded-xl border px-4 py-3", toneClasses)}>
      <div>
        <p className="text-sm font-medium text-text-main">{title}</p>
        {description && <p className="text-xs text-text-muted">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold text-text-main">{count}</span>
        {href && <ArrowRight className="h-4 w-4 text-text-muted" aria-hidden="true" />}
      </div>
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded-xl">
        {body}
      </Link>
    );
  }
  return body;
}

export function WorkQueueCard({
  title,
  items,
  emptyLabel = "Queue is clear",
  href,
}: {
  title: string;
  items: { id: string; primary: string; secondary?: string; badge?: React.ReactNode }[];
  emptyLabel?: string;
  href?: string;
}) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-text-main">{title}</h3>
        {href && (
          <Link href={href} className="text-xs font-medium text-brand-blue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded">
            View all
          </Link>
        )}
        <button
          type="button"
          className="rounded p-1 text-text-muted hover:bg-app-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
          aria-label={`${title} options`}
          title="Prototype only — no additional actions"
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      {items.length === 0 ? (
        <p className="py-6 text-center text-xs text-text-muted">{emptyLabel}</p>
      ) : (
        <ul className="divide-y divide-app-border">
          {items.slice(0, 6).map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text-main">{item.primary}</p>
                {item.secondary && <p className="truncate text-xs text-text-muted">{item.secondary}</p>}
              </div>
              {item.badge}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
