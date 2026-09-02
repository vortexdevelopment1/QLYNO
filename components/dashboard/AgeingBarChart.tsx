"use client";

import { useMemo } from "react";
import { Invoice } from "@/types";
import { formatINR } from "@/lib/utils";

interface AgeingBarChartProps {
  invoices: Invoice[];
}

export function AgeingBarChart({ invoices }: AgeingBarChartProps) {
  const ageingData = useMemo(() => {
    const now = new Date().getTime();
    const buckets = [
      { key: "0_30", label: "0–30 days", amount: 0, count: 0, tone: "bg-brand-500 text-brand-700 border-brand-200" },
      { key: "31_60", label: "31–60 days", amount: 0, count: 0, tone: "bg-sky-500 text-sky-700 border-sky-200" },
      { key: "61_90", label: "61–90 days", amount: 0, count: 0, tone: "bg-amber-500 text-amber-700 border-amber-200" },
      { key: "90_plus", label: "90+ days", amount: 0, count: 0, tone: "bg-rose-500 text-rose-700 border-rose-200" },
    ];

    invoices.forEach((inv) => {
      if (inv.outstanding <= 0 || inv.status === "paid" || inv.status === "cancelled") return;
      const dateMs = new Date(inv.date || inv.createdAt).getTime();
      const ageDays = Math.floor((now - dateMs) / (1000 * 60 * 60 * 24));

      if (ageDays <= 30) {
        buckets[0].amount += inv.outstanding;
        buckets[0].count += 1;
      } else if (ageDays <= 60) {
        buckets[1].amount += inv.outstanding;
        buckets[1].count += 1;
      } else if (ageDays <= 90) {
        buckets[2].amount += inv.outstanding;
        buckets[2].count += 1;
      } else {
        buckets[3].amount += inv.outstanding;
        buckets[3].count += 1;
      }
    });

    const maxAmount = Math.max(...buckets.map((b) => b.amount), 1);
    return { buckets, maxAmount };
  }, [invoices]);

  const totalOutstanding = ageingData.buckets.reduce((acc, b) => acc + b.amount, 0);

  if (totalOutstanding === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-ink-50/50 p-6 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-lg text-emerald-600 mb-2">
          ✓
        </div>
        <p className="text-sm font-semibold text-ink-800">All Collections Up to Date</p>
        <p className="mt-1 text-xs text-ink-500">No outstanding balances across ageing buckets.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Visual Bar Chart */}
      <div className="flex h-36 sm:h-44 items-end gap-1.5 sm:gap-3 rounded-xl border border-ink-100 bg-ink-50/50 p-2.5 sm:p-4">
        {ageingData.buckets.map((bucket) => {
          const heightPercent = Math.max((bucket.amount / ageingData.maxAmount) * 100, 6);
          const percentOfTotal = totalOutstanding > 0 ? ((bucket.amount / totalOutstanding) * 100).toFixed(1) : "0";

          return (
            <div key={bucket.key} className="group relative flex h-full flex-1 flex-col items-center justify-end min-w-0">
              {/* Tooltip on hover */}
              <div className="pointer-events-none absolute -top-12 z-20 hidden flex-col items-center whitespace-nowrap rounded-lg border border-ink-200 bg-white px-2 py-1 text-[11px] sm:text-xs text-ink-900 shadow-xl transition-all group-hover:flex">
                <span className="font-semibold">{bucket.label}</span>
                <span>{formatINR(bucket.amount)} ({bucket.count} inv · {percentOfTotal}%)</span>
                <div className="absolute -bottom-1 h-2 w-2 rotate-45 border-b border-r border-ink-200 bg-white" />
              </div>

              {/* Amount label above bar */}
              <span className="mb-1 font-mono text-[10px] sm:text-xs font-semibold tracking-tight text-ink-700 truncate max-w-full">
                {bucket.amount > 0 ? formatINR(bucket.amount) : "₹0"}
              </span>

              {/* Bar column */}
              <div
                tabIndex={0}
                role="img"
                aria-label={`${bucket.label}: ${formatINR(bucket.amount)}, ${bucket.count} invoices`}
                style={{ height: `${heightPercent}%` }}
                className={`w-full rounded-t-lg transition-all duration-300 shadow-sm group-hover:brightness-110 ${
                  bucket.key === "0_30"
                    ? "bg-gradient-to-t from-brand-600 to-brand-500"
                    : bucket.key === "31_60"
                    ? "bg-gradient-to-t from-sky-600 to-sky-400"
                    : bucket.key === "61_90"
                    ? "bg-gradient-to-t from-amber-600 to-amber-400"
                    : "bg-gradient-to-t from-rose-600 to-rose-500"
                }`}
              />

              {/* Bucket Label below */}
              <span className="mt-1.5 sm:mt-2 max-w-full truncate text-[10px] sm:text-xs font-medium text-ink-600">
                {bucket.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Accessible Legend & Detailed Summary Grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ageingData.buckets.map((b) => (
          <div key={b.key} className="rounded-lg border border-ink-100 bg-white p-2.5 shadow-sm">
            <div className="mb-1 flex items-center gap-1.5">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  b.key === "0_30"
                    ? "bg-brand-500"
                    : b.key === "31_60"
                    ? "bg-sky-500"
                    : b.key === "61_90"
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
              />
              <span className="text-xs font-medium text-ink-600">{b.label}</span>
            </div>
            <p className="font-mono text-sm font-semibold tracking-tight text-ink-900">{formatINR(b.amount)}</p>
            <p className="text-[11px] text-ink-400">{b.count} invoice{b.count === 1 ? "" : "s"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
