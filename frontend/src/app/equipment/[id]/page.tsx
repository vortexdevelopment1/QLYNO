"use client";

import { notFound } from "next/navigation";
import { EntityHeader } from "@/components/ui/EntityHeader";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Timeline } from "@/components/ui/Timeline";
import { MOCK_EQUIPMENT } from "@/data/mock/inventory";

export default function EquipmentDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const eq = MOCK_EQUIPMENT.find((e) => e.id === id);
  if (!eq) notFound();

  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 9 · Inventory & Equipment" title={eq.name} subtitle={eq.department} badges={<StatusBadge status={eq.status} />} />
      {eq.status !== "operational" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-text-main">
          This equipment is currently <span className="font-semibold">{eq.status.replace(/_/g, " ")}</span> — tests routed to this instrument may be delayed or reassigned.
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-text-main">Calibration & maintenance</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-xs text-text-muted">Last service</dt><dd className="font-medium">{eq.lastServiceDate}</dd></div>
            <div><dt className="text-xs text-text-muted">Next calibration due</dt><dd className="font-medium">{eq.nextCalibrationDate}</dd></div>
          </dl>
        </Card>
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-text-main">Service history</h3>
          <Timeline
            entries={[
              { id: "s1", label: "Preventive maintenance completed", timestamp: `${eq.lastServiceDate}T09:00:00+05:30`, tone: "success" },
              { id: "s2", label: "Calibration due", timestamp: `${eq.nextCalibrationDate}T00:00:00+05:30`, tone: eq.status === "due_calibration" ? "warning" : "default" },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}
