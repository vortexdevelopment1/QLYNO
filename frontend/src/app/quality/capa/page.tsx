"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { Card } from "@/components/ui/Card";
import { MOCK_CAPAS } from "@/data/mock/quality";
import type { Capa } from "@/lib/types/domain";

const STAGES: { id: Capa["stage"]; label: string }[] = [
  { id: "root_cause", label: "Root Cause" },
  { id: "action_plan", label: "Action Plan" },
  { id: "implementation", label: "Implementation" },
  { id: "effectiveness_review", label: "Effectiveness Review" },
  { id: "closed", label: "Closed" },
];

export default function CapaPage() {
  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 8 · Quality Management" title="CAPA" subtitle="Corrective and preventive action tracking, from root-cause through effectiveness review." />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {STAGES.map((stage) => {
          const items = MOCK_CAPAS.filter((c) => c.stage === stage.id);
          return (
            <div key={stage.id} className="rounded-card border border-app-border bg-app-sidebar p-3">
              <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-text-muted">
                {stage.label} <span className="text-text-muted">({items.length})</span>
              </p>
              <div className="space-y-2">
                {items.map((c) => (
                  <Card key={c.id} className="p-3">
                    <p className="text-xs font-medium text-text-main">{c.title}</p>
                    <p className="mt-1 text-[11px] text-text-muted">Owner: {c.owner}</p>
                    <p className="text-[11px] text-text-muted">Due: {c.dueDate}</p>
                  </Card>
                ))}
                {items.length === 0 && <p className="px-1 py-3 text-center text-[11px] text-text-muted">Empty</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
