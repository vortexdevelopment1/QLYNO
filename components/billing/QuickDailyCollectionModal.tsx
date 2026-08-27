"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { formatINR } from "@/lib/utils";
import { StatCard } from "@/components/ui/StatCard";

interface QuickDailyCollectionModalProps {
  open: boolean;
  onClose: () => void;
}

export function QuickDailyCollectionModal({ open, onClose }: QuickDailyCollectionModalProps) {
  const { currentOrg, payments, invoices } = useApp();
  const todayStr = new Date().toDateString();

  const orgPayments = payments.filter(
    (p) => p.organizationId === currentOrg.id && new Date(p.date).toDateString() === todayStr
  );
  const orgInvoices = invoices.filter(
    (i) => i.organizationId === currentOrg.id && new Date(i.createdAt).toDateString() === todayStr
  );

  const successfulPayments = orgPayments.filter((p) => p.status === "success");
  const totalCollected = successfulPayments.reduce((s, p) => s + p.amount, 0);

  const byMethod = successfulPayments.reduce<Record<string, number>>((acc, p) => {
    acc[p.method] = (acc[p.method] ?? 0) + p.amount;
    return acc;
  }, {});

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Today's Daily Collection — ${currentOrg.name}`}
      footer={
        <button
          onClick={onClose}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Close
        </button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total Collected Today" value={formatINR(totalCollected)} tone="success" />
          <StatCard label="Bills Issued Today" value={String(orgInvoices.length)} />
        </div>

        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-500">
            Collection by Payment Method
          </h4>
          {Object.keys(byMethod).length === 0 ? (
            <p className="py-2 text-xs text-ink-400">No collections recorded today yet.</p>
          ) : (
            <ul className="divide-y divide-ink-100 rounded-lg border border-ink-100 bg-ink-50/50">
              {Object.entries(byMethod).map(([method, amount]) => (
                <li key={method} className="flex justify-between px-3 py-2 text-sm">
                  <span className="font-medium uppercase text-ink-700">{method}</span>
                  <span className="font-semibold text-ink-900">{formatINR(amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-500">
            Recent Payments Recorded Today
          </h4>
          <ul className="max-h-40 overflow-y-auto space-y-1.5 text-xs">
            {successfulPayments.slice(0, 5).map((p) => (
              <li key={p.id} className="flex justify-between rounded-md bg-white p-2 border border-ink-100">
                <span className="text-ink-600">Ref: {p.referenceNumber ?? p.id} ({p.method.toUpperCase()})</span>
                <span className="font-medium text-emerald-700">{formatINR(p.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
}
