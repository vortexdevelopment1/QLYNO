"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { DataTable } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { MOCK_SPECIMENS } from "@/data/mock/specimens";

export default function SpecimenRejectionsPage() {
  const { showToast } = useToast();
  const rejected = MOCK_SPECIMENS.filter((s) => s.status === "rejected");

  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 4 · Collection & Specimens" title="Rejected Specimens" subtitle="Coded rejection reasons with recollection tracking. Rejections never overwrite the original record." />
      <DataTable
        rows={rejected}
        rowKey={(s) => s.id}
        columns={[
          { key: "id", header: "Specimen ID", render: (s) => s.id },
          { key: "patient", header: "Patient", render: (s) => s.patientName },
          { key: "reason", header: "Rejection Reason", render: (s) => s.rejectedReason ?? "—" },
          { key: "status", header: "Status", render: (s) => <StatusBadge status={s.status} /> },
          {
            key: "actions", header: "Actions",
            render: (s) => (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => showToast({ title: "Recollection created (simulated)", description: `New linked specimen raised for ${s.id}`, tone: "success" })}
              >
                Create recollection
              </Button>
            ),
          },
        ]}
        emptyDescription="No rejected specimens currently."
      />
    </div>
  );
}
