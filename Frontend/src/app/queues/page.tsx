import Link from "next/link";
import { EntityHeader } from "@/components/ui/EntityHeader";
import { Card } from "@/components/ui/Card";

const QUEUES = [
  { id: "uncollected", label: "Uncollected Samples", description: "Orders placed but not yet collected" },
  { id: "in-transit", label: "In-Transit Samples", description: "Specimens currently with a courier" },
  { id: "pending-accession", label: "Pending Accession", description: "Received at lab, awaiting accessioning" },
  { id: "rejected", label: "Rejected Samples", description: "Specimens rejected, recollection may be required" },
  { id: "pending-processing", label: "Pending Processing", description: "Accessioned, awaiting workbench pickup" },
  { id: "tech-review", label: "Pending Technical Review", description: "Resulted, awaiting technical sign-off" },
  { id: "medical-validation", label: "Pending Medical Validation", description: "Technically reviewed, awaiting pathologist" },
  { id: "tat-breach", label: "TAT Breaches", description: "Orders exceeding turnaround-time targets" },
];

export default function QueuesIndexPage() {
  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 1 · Laboratory Operations" title="Work Queues" subtitle="Role-scoped operational queues across the specimen and result lifecycle." />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {QUEUES.map((q) => (
          <Link key={q.id} href={`/queues/${q.id}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded-card">
            <Card className="h-full p-4 transition-shadow hover:shadow-md">
              <p className="text-sm font-semibold text-text-main">{q.label}</p>
              <p className="mt-1 text-xs text-text-muted">{q.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
