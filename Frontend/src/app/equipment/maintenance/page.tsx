"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { DataTable } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { MOCK_EQUIPMENT } from "@/data/mock/inventory";

export default function EquipmentMaintenancePage() {
  const due = [...MOCK_EQUIPMENT].sort((a, b) => a.nextCalibrationDate.localeCompare(b.nextCalibrationDate));

  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 9 · Inventory & Equipment" title="Maintenance Schedule" subtitle="Preventive maintenance and calibration due dates, earliest first." />
      <DataTable
        rows={due}
        rowKey={(e) => e.id}
        columns={[
          { key: "name", header: "Equipment", render: (e) => <span className="font-medium">{e.name}</span> },
          { key: "dept", header: "Department", render: (e) => e.department },
          { key: "due", header: "Next calibration", render: (e) => e.nextCalibrationDate, sortValue: (e) => e.nextCalibrationDate },
          { key: "status", header: "Status", render: (e) => <StatusBadge status={e.status} /> },
        ]}
      />
    </div>
  );
}
