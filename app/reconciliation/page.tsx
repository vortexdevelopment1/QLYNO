"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { PermissionGuard } from "@/components/billing/PermissionGuard";
import { formatINR } from "@/lib/utils";
import { filterReconByAccess } from "@/lib/selectors";

export default function ReconciliationPage() {
  const { currentOrg, currentUser, reconciliationRecords, dispatch } = useApp();
  const [resolving, setResolving] = useState<{ reconId: string; excId: string; description: string } | null>(null);
  const [notes, setNotes] = useState("");

  const records = useMemo(() => filterReconByAccess(reconciliationRecords, currentOrg.id, currentUser.scopes), [reconciliationRecords, currentOrg.id, currentUser.scopes]);

  const totalDiff = records.reduce((s, r) => s + r.difference, 0);
  const openExceptions = records.flatMap((r) => r.exceptions).filter((e) => e.status !== "resolved").length;

  return (
    <div>
      <PageHeader title="Reconciliation" description="Review → Investigate → Resolve/Adjust → Audit. Financial records are never modified silently." />
      <PermissionGuard permission="reconciliation" fallbackLabel="Reconciliation is restricted">
        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total Difference" value={formatINR(totalDiff)} tone={totalDiff > 0 ? "warning" : "success"} />
          <StatCard label="Open Exceptions" value={String(openExceptions)} tone={openExceptions > 0 ? "danger" : "success"} />
          <StatCard label="Records Reviewed" value={String(records.length)} />
        </div>

        {records.length === 0 ? (
          <EmptyState title="No reconciliation records" />
        ) : (
          <div className="space-y-4">
            {records.map((r) => (
              <div key={r.id} className="rounded-xl border border-ink-100 bg-white p-4 sm:p-5 shadow-card">
                <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                  <p className="text-sm font-semibold text-ink-800">{r.date}</p>
                  <p className="text-xs text-ink-500">Expected {formatINR(r.expectedCollection)} · Actual {formatINR(r.actualCollection)} · Diff <span className="font-medium text-ink-800">{formatINR(r.difference)}</span></p>
                </div>
                {r.exceptions.length === 0 ? (
                  <p className="text-xs text-ink-500">No exceptions for this period.</p>
                ) : (
                  <ul className="space-y-2">
                    {r.exceptions.map((e) => (
                      <li key={e.id} className="rounded-lg bg-ink-50 p-3 text-sm">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-xs font-medium uppercase text-ink-500">{e.type.replace("_", " ")}</span>
                          <StatusBadge status={e.status} />
                        </div>
                        <p className="text-ink-700">{e.description}</p>
                        <div className="mt-1 flex flex-wrap items-center justify-between gap-1">
                          <span className="text-xs font-medium text-ink-800">{formatINR(e.amount)}</span>
                          {e.status !== "resolved" ? (
                            <button onClick={() => { setResolving({ reconId: r.id, excId: e.id, description: e.description }); setNotes(""); }} className="text-xs font-medium text-brand-600 hover:underline">Investigate &amp; Resolve</button>
                          ) : (
                            e.resolutionNotes && <span className="text-xs text-emerald-700">Resolved: {e.resolutionNotes}</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </PermissionGuard>

      <Modal
        open={!!resolving}
        onClose={() => setResolving(null)}
        title="Resolve Reconciliation Exception"
        footer={
          <>
            <button onClick={() => setResolving(null)} className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50">Cancel</button>
            <button
              onClick={() => {
                if (!resolving || !notes.trim()) return;
                dispatch({ type: "RESOLVE_EXCEPTION", reconId: resolving.reconId, excId: resolving.excId, notes, user: currentUser.name });
                setResolving(null);
              }}
              disabled={!notes.trim()}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              Mark Resolved
            </button>
          </>
        }
      >
        <p className="mb-3 text-sm text-ink-600">{resolving?.description}</p>
        <label htmlFor="resolve-notes" className="mb-1 block text-xs font-medium text-ink-600">Resolution notes <span aria-hidden="true">*</span></label>
        <textarea id="resolve-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm" />
      </Modal>
    </div>
  );
}
