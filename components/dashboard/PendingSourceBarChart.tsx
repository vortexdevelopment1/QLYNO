"use client";

import { useMemo } from "react";
import { BillableSource, PendingBillingItem } from "@/types";
import { formatINR } from "@/lib/utils";

interface PendingSourceBarChartProps {
  items: PendingBillingItem[];
}

const SOURCE_CONFIG: Record<BillableSource, { label: string; color: string }> = {
  doctor_opd: { label: "OPD / Consult", color: "bg-brand-500" },
  diagnostics: { label: "Diagnostics", color: "bg-sky-500" },
  pharmacy: { label: "Pharmacy", color: "bg-emerald-500" },
  ipd: { label: "IPD Ward", color: "bg-violet-500" },
  surgery: { label: "Surgery / OT", color: "bg-amber-500" },
  other: { label: "Other", color: "bg-slate-400" },
};

export function PendingSourceBarChart({ items }: PendingSourceBarChartProps) {
  const sourceStats = useMemo(() => {
    const stats: Record<BillableSource, { amount: number; count: number }> = {
      doctor_opd: { amount: 0, count: 0 },
      diagnostics: { amount: 0, count: 0 },
      pharmacy: { amount: 0, count: 0 },
      ipd: { amount: 0, count: 0 },
      surgery: { amount: 0, count: 0 },
      other: { amount: 0, count: 0 },
    };

    items.forEach((item) => {
      const src = item.source in stats ? item.source : "other";
      stats[src].amount += item.amount;
      stats[src].count += 1;
    });

    const totalAmount = Object.values(stats).reduce((acc, curr) => acc + curr.amount, 0);

    const activeSources = (Object.keys(stats) as BillableSource[])
      .map((key) => ({
        key,
        ...SOURCE_CONFIG[key],
        amount: stats[key].amount,
        count: stats[key].count,
        percent: totalAmount > 0 ? (stats[key].amount / totalAmount) * 100 : 0,
      }))
      .filter((s) => s.count > 0)
      .sort((a, b) => b.amount - a.amount);

    return { activeSources, totalAmount };
  }, [items]);

  if (sourceStats.totalAmount === 0 || sourceStats.activeSources.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-ink-100 bg-ink-50/50 p-3 sm:p-3.5 space-y-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
        <span className="font-semibold text-ink-700">Pending Charges Breakdown by Source</span>
        <span className="font-mono text-ink-500 font-medium text-[11px] sm:text-xs">Total: {formatINR(sourceStats.totalAmount)}</span>
      </div>

      {/* Multi-Segment Stacked Progress Bar */}
      <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-ink-200/50 p-0.5 shadow-inner">
        {sourceStats.activeSources.map((source) => (
          <div
            key={source.key}
            style={{ width: `${source.percent}%` }}
            title={`${source.label}: ${formatINR(source.amount)} (${source.count} items)`}
            className={`h-full first:rounded-l-full last:rounded-r-full transition-all duration-300 ${source.color}`}
          />
        ))}
      </div>

      {/* Chips Legend */}
      <div className="flex flex-wrap gap-2 pt-1">
        {sourceStats.activeSources.map((source) => (
          <div key={source.key} className="flex items-center gap-1.5 rounded-lg border border-ink-100 bg-white px-2 py-1 text-[11px]">
            <span className={`h-2 w-2 rounded-full ${source.color}`} />
            <span className="font-medium text-ink-700">{source.label}:</span>
            <span className="font-mono font-semibold text-ink-900">{formatINR(source.amount)}</span>
            <span className="text-ink-400">({source.count})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
