"use client";

import { useMemo } from "react";
import { Payment, PaymentMethod } from "@/types";
import { formatINR } from "@/lib/utils";

interface PaymentMethodBarChartProps {
  payments: Payment[];
}

const METHOD_CONFIG: Record<PaymentMethod, { label: string; color: string; badgeBg: string }> = {
  cash: { label: "Cash", color: "bg-emerald-500", badgeBg: "bg-emerald-50 text-emerald-700" },
  card: { label: "Card (POS)", color: "bg-brand-500", badgeBg: "bg-brand-50 text-brand-700" },
  upi: { label: "UPI / QR", color: "bg-violet-500", badgeBg: "bg-violet-50 text-violet-700" },
  online: { label: "NetBanking / Gateway", color: "bg-sky-500", badgeBg: "bg-sky-50 text-sky-700" },
  other: { label: "Cheque / Other", color: "bg-slate-400", badgeBg: "bg-slate-50 text-slate-700" },
};

export function PaymentMethodBarChart({ payments }: PaymentMethodBarChartProps) {
  const chartData = useMemo(() => {
    const successPayments = payments.filter((p) => p.status === "success");
    const methodTotals: Record<PaymentMethod, { amount: number; count: number }> = {
      cash: { amount: 0, count: 0 },
      card: { amount: 0, count: 0 },
      upi: { amount: 0, count: 0 },
      online: { amount: 0, count: 0 },
      other: { amount: 0, count: 0 },
    };

    successPayments.forEach((p) => {
      const m = p.method in methodTotals ? p.method : "other";
      methodTotals[m].amount += p.amount;
      methodTotals[m].count += 1;
    });

    const totalCollected = Object.values(methodTotals).reduce((sum, item) => sum + item.amount, 0);

    const methodsList = (Object.keys(methodTotals) as PaymentMethod[])
      .map((method) => ({
        method,
        ...METHOD_CONFIG[method],
        amount: methodTotals[method].amount,
        count: methodTotals[method].count,
        percent: totalCollected > 0 ? (methodTotals[method].amount / totalCollected) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const maxAmount = Math.max(...methodsList.map((m) => m.amount), 1);

    return { methodsList, totalCollected, maxAmount };
  }, [payments]);

  if (chartData.totalCollected === 0) {
    return (
      <div className="flex h-44 flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-ink-50/50 p-6 text-center">
        <p className="text-sm font-semibold text-ink-700">No Payment Collections Yet</p>
        <p className="mt-1 text-xs text-ink-500">Collections broken down by method will appear here as payments arrive.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {chartData.methodsList.map((item) => {
        const barWidthPercent = Math.max((item.amount / chartData.maxAmount) * 100, 4);

        return (
          <div key={item.method} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                <span className="font-medium text-ink-800">{item.label}</span>
                <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${item.badgeBg}`}>
                  {item.count} txns
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-ink-400 text-[11px] font-mono">{item.percent.toFixed(1)}%</span>
                <span className="font-mono font-semibold text-ink-900">{formatINR(item.amount)}</span>
              </div>
            </div>

            {/* Horizontal Bar */}
            <div className="h-3 w-full overflow-hidden rounded-full bg-ink-100/70 p-0.5">
              <div
                tabIndex={0}
                role="img"
                aria-label={`${item.label}: ${formatINR(item.amount)} (${item.percent.toFixed(1)}%)`}
                style={{ width: `${barWidthPercent}%` }}
                className={`h-full rounded-full transition-all duration-500 shadow-sm ${item.color}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
