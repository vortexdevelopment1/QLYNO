"use client";

import { useRouter } from "next/navigation";
import { EntityHeader } from "@/components/ui/EntityHeader";
import { DataTable } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { MOCK_EQUIPMENT } from "@/data/mock/inventory";

export default function EquipmentPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 9 · Inventory & Equipment" title="Equipment Registry" subtitle="Calibration schedule, maintenance and downtime status." />
      <DataTable
        rows={MOCK_EQUIPMENT}
        rowKey={(e) => e.id}
        onRowClick={(e) => router.push(`/equipment/${e.id}`)}
        columns={[
          { key: "name", header: "Equipment", render: (e) => <span className="font-medium">{e.name}</span> },
          { key: "dept", header: "Department", render: (e) => e.department },
          { key: "status", header: "Status", render: (e) => <StatusBadge status={e.status} /> },
          { key: "lastService", header: "Last service", render: (e) => e.lastServiceDate },
          { key: "nextCal", header: "Next calibration", render: (e) => e.nextCalibrationDate },
        ]}
      />
    </div>
  );
}
