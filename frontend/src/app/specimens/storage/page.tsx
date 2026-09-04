"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { DataTable } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { MOCK_SPECIMENS } from "@/data/mock/specimens";

export default function SpecimenStoragePage() {
  const { showToast } = useToast();
  const stored = MOCK_SPECIMENS.filter((s) => s.status === "stored" || s.status === "disposed");

  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 4 · Collection & Specimens" title="Specimen Storage" subtitle="Storage locations and disposal records." />
      <DataTable
        rows={stored}
        rowKey={(s) => s.id}
        columns={[
          { key: "id", header: "Specimen ID", render: (s) => s.id },
          { key: "patient", header: "Patient", render: (s) => s.patientName },
          { key: "location", header: "Storage location", render: (s) => s.storageLocation ?? "—" },
          { key: "status", header: "Status", render: (s) => <StatusBadge status={s.status} /> },
          {
            key: "actions", header: "Actions",
            render: (s) =>
              s.status === "stored" ? (
                <Button size="sm" variant="destructive" onClick={() => showToast({ title: "Disposal recorded (simulated)", description: s.id, tone: "warning" })}>
                  Record disposal
                </Button>
              ) : (
                <span className="text-xs text-text-muted">Disposed</span>
              ),
          },
        ]}
        emptyDescription="No specimens currently in storage."
      />
    </div>
  );
}
