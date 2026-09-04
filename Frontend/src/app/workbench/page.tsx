"use client";

import Link from "next/link";
import { EntityHeader } from "@/components/ui/EntityHeader";
import { Card } from "@/components/ui/Card";
import { MOCK_ORDER_ITEMS } from "@/data/mock/orders";
import { MOCK_CATALOG } from "@/data/mock/catalog";
import { useHospitalWorkflow } from "@/state/hospital-workflow-context";

const DEPARTMENTS = ["Chemistry", "Hematology", "Coagulation", "Immunology", "Urinalysis", "Microbiology", "Molecular", "Pathology"];

export default function WorkbenchIndexPage() {
  const { activeOrderItems, workflow } = useHospitalWorkflow();
  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 6 · Workbench & Analyzers" title="Workbench" subtitle="Department work queues with master-detail result entry." />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {DEPARTMENTS.map((d) => {
          const sharedItems = activeOrderItems.filter((item) => item.orderId === workflow.orderId); const pending = [...MOCK_ORDER_ITEMS.filter((item) => !sharedItems.some((shared) => shared.id === item.id)), ...sharedItems].filter((i) => MOCK_CATALOG.find((c) => c.id === i.testId)?.department === d && ["ready", "running", "resulted", "technical_review"].includes(i.status)).length;
          return (
            <Link key={d} href={`/workbench/${d.toLowerCase()}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded-card">
              <Card className="p-4 transition-shadow hover:shadow-md">
                <p className="text-sm font-semibold text-text-main">{d}</p>
                <p className="mt-1 text-xs text-text-muted">{pending} item(s) pending</p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
