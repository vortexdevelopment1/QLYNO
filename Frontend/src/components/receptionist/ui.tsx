"use client";

import * as React from "react";
import clsx from "clsx";
import { Modal } from "@/components/ui";

/**
 * Shared visual primitives for the Receptionist Portal.
 * Design tokens (see receptionist-portal.tsx <PortalStyles/>):
 *   --rp-ink, --rp-paper, --rp-panel, --rp-line, --rp-pine, --rp-pine-soft,
 *   --rp-coral, --rp-amber, --rp-slate
 */

export function Card({
  className = "",
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("card p-5", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 border-b border-line/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <h1 className="font-display text-3xl leading-tight text-ink">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

type BadgeTone = "pine" | "coral" | "amber" | "slate" | "line";

export function Badge({
  tone = "slate",
  children,
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
}) {
  const tones: Record<BadgeTone, string> = {
    pine: "bg-brand-50 text-brand-700",
    coral: "bg-alert-50 text-alert-500",
    amber: "bg-clay-50 text-clay-600",
    slate: "bg-paper text-ink-soft border border-line",
    line: "bg-white text-ink-muted border border-line",
  };

  return <span className={clsx("badge", tones[tone])}>{children}</span>;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
}) {
  const classes = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ghost: "btn-ghost",
    danger: "btn-primary bg-alert-500 hover:bg-alert-600",
  };

  return (
    <button
      className={clsx(classes[variant], size === "sm" && "text-xs px-2.5 py-1.5", className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  hint,
  required,
  className,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={clsx("block", className)}>
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
        {label}
        {required && <span className="text-alert-500"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-ink-muted">{hint}</span>}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx("input-field", props.className)} />;
}

export function Select({
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...rest} className={clsx("input-field", rest.className)}>
      {children}
    </select>
  );
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea {...props} className={clsx("input-field", props.className)} />
  );
}

export function StatCard({
  label,
  value,
  delta,
  tone = "pine",
  icon,
}: {
  label: string;
  value: string | number;
  delta?: string;
  tone?: BadgeTone;
  icon?: React.ReactNode;
}) {
  return (
    <Card className="metric-tile">
      <div className="flex items-center justify-between">
        <span className="eyebrow">{label}</span>
        {icon && <span className={`rp-stat-icon rp-stat-icon-${tone}`}>{icon}</span>}
      </div>
      <div className="mt-2 font-display text-2xl font-semibold text-ink">{value}</div>
      {delta && <div className="mt-1 text-xs text-ink-muted">{delta}</div>}
    </Card>
  );
}

export function Table({
  columns,
  children,
}: {
  columns: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="rp-table-wrap">
      <table className="rp-table table-clean">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
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
  action?: React.ReactNode;
}) {
  return (
    <div className="rp-empty">
      <div className="rp-empty-mark" aria-hidden="true" />
      <p className="rp-empty-title">{title}</p>
      {description && <p className="rp-empty-desc">{description}</p>}
      {action}
    </div>
  );
}

export function Mono({ children }: { children: React.ReactNode }) {
  return <span className="font-mono">{children}</span>;
}

export { Modal };
