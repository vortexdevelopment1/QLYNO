"use client";

import { useRouter } from "next/navigation";
import { EntityHeader } from "@/components/ui/EntityHeader";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { MOCK_ANALYZERS } from "@/data/mock/specimens";
import { formatDateTime } from "@/lib/utils/format";

export default function AnalyzersPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 6 · Workbench & Analyzers" title="Analyzers" subtitle="Visual simulation of connectivity status — no real device connection." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_ANALYZERS.map((a) => (
          <button key={a.id} onClick={() => router.push(`/analyzers/${a.id}`)} className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded-card">
            <Card className="p-4 transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-text-main">{a.name}</p>
                  <p className="text-xs text-text-muted">{a.department}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div><dt className="text-text-muted">Queue depth</dt><dd className="font-medium">{a.queueDepth}</dd></div>
                <div><dt className="text-text-muted">Errors</dt><dd className={`font-medium ${a.errorCount > 0 ? "text-status-critical" : ""}`}>{a.errorCount}</dd></div>
                <div className="col-span-2"><dt className="text-text-muted">Last message</dt><dd className="font-medium">{formatDateTime(a.lastMessageAt)}</dd></div>
              </dl>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}
