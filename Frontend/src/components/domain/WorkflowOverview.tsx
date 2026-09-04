import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";

const STAGES = [
  ["Awaiting collection", 18, "/queues/uncollected"],
  ["In transit", 7, "/queues/in-transit"],
  ["Awaiting receipt", 12, "/queues/pending-receipt"],
  ["Awaiting accessioning", 9, "/queues/pending-accession"],
  ["Processing", 34, "/queues/pending-processing"],
  ["Technical review", 15, "/queues/tech-review"],
  ["Medical validation", 11, "/queues/medical-validation"],
  ["Ready for release", 8, "/queues/report-release"],
  ["Delivery pending", 5, "/queues/delivery-pending"],
  ["Completed today", 126, "/queues/completed"],
] as const;

export function WorkflowOverview() {
  return (
    <Card className="p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-text-main">Laboratory Workflow Overview</h2>
          <p className="mt-1 text-xs text-text-muted">Aggregate workload across permitted sites. Select a stage to open its filtered queue.</p>
        </div>
        <Link href="/queues" className="hidden items-center gap-1 text-xs font-semibold text-brand-blue sm:flex">View all work <ArrowRight className="h-3.5 w-3.5" /></Link>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-5 xl:grid-cols-10">
        {STAGES.map(([label, count, href], index) => (
          <Link key={label} href={href} className="group rounded-lg border border-app-border bg-app-bg p-3 transition hover:border-brand-blue hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue">
            <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-app-border"><div className="h-full rounded-full bg-brand-blue" style={{ width: `${Math.max(24, 100 - index * 7)}%` }} /></div>
            <p className="font-display text-2xl font-semibold text-text-main">{count}</p>
            <p className="mt-1 text-[11px] leading-tight text-text-muted group-hover:text-brand-blue">{label}</p>
          </Link>
        ))}
      </div>
    </Card>
  );
}
