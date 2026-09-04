"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/Table";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";

const WORK = [
  { id: "ORD-70019", patient: "Anil Kapoor Rao", priority: "stat" as const, stage: "Medical validation", group: "Coagulation", owner: "Dr. S. Kelkar", tat: "12 min remaining", blocker: "Critical high", action: "Authorize result" },
  { id: "ORD-70011", patient: "Ramesh Iyer", priority: "stat" as const, stage: "Technical review", group: "Chemistry", owner: "Section supervisor", tat: "18 min overdue", blocker: "Delta flag", action: "Review repeat" },
  { id: "ORD-70016", patient: "Fatima Sheikh", priority: "urgent" as const, stage: "QC blocked", group: "Microbiology", owner: "Bench technician", tat: "42 min overdue", blocker: "QC out of range", action: "Resolve QC" },
  { id: "ORD-70014", patient: "Priya Nair", priority: "routine" as const, stage: "Recollection", group: "CBC", owner: "Phlebotomy", tat: "Waiting 2 hours", blocker: "Specimen rejected", action: "Recollect" },
  { id: "ORD-70012", patient: "Sunita Deshmukh", priority: "stat" as const, stage: "Delivery pending", group: "Coagulation", owner: "Records desk", tat: "8 min remaining", blocker: "HMS acknowledgement", action: "Check delivery" },
];

export function PriorityWork() {
  const router = useRouter();
  return <Card className="p-5"><div className="mb-4 flex items-end justify-between"><div><h2 className="font-display text-xl font-semibold">Priority Work</h2><p className="mt-1 text-xs text-text-muted">Critical, STAT, breached and blocked work requiring attention.</p></div><Link href="/queues" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue">View all work <ArrowRight className="h-3.5 w-3.5" /></Link></div>
    <DataTable pageSize={5} rows={WORK} rowKey={(row) => row.id} onRowClick={(row) => router.push(`/orders/${row.id}`)} columns={[
      { key: "priority", header: "Priority", render: (r) => <PriorityBadge priority={r.priority} /> },
      { key: "order", header: "Order / Patient", render: (r) => <div><p className="font-semibold">{r.id}</p><p className="text-xs text-text-muted">{r.patient}</p></div> },
      { key: "stage", header: "Current stage", render: (r) => <StatusBadge status={r.stage.toLowerCase().replaceAll(" ", "_")} /> },
      { key: "group", header: "Department / group", render: (r) => r.group },
      { key: "owner", header: "Current owner", render: (r) => r.owner },
      { key: "tat", header: "TAT", render: (r) => <span className={r.tat.includes("overdue") ? "font-semibold text-status-critical" : "text-text-main"}>{r.tat}</span> },
      { key: "blocker", header: "Blocking reason", render: (r) => r.blocker },
      { key: "action", header: "Next action", render: (r) => <span className="font-medium text-brand-blue">{r.action}</span> },
    ]} />
  </Card>;
}
