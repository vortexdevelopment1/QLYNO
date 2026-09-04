"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { DataTable } from "@/components/ui/Table";
import { Chip, StatusBadge } from "@/components/ui/Badge";

const PORTAL_USERS = [
  { id: "PU-1", name: "Ramesh Iyer", type: "Patient Portal", reportAccess: "active" as const },
  { id: "PU-2", name: "Dr. Nikhil Wagh", type: "Doctor / Clinic Portal", reportAccess: "active" as const },
  { id: "PU-3", name: "Apex Corporate Wellness — Admin", type: "Client Laboratory Portal", reportAccess: "active" as const },
  { id: "PU-4", name: "CarePlus TPA Services", type: "Client Laboratory Portal", reportAccess: "blocked" as const },
];

export default function PortalAccessPage() {
  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 11 · Portals & Communication" title="Portal Access" subtitle="Patient, doctor/clinic and client-laboratory portal access records." />
      <DataTable
        rows={PORTAL_USERS}
        rowKey={(p) => p.id}
        columns={[
          { key: "name", header: "User", render: (p) => <span className="font-medium">{p.name}</span> },
          { key: "type", header: "Portal type", render: (p) => <Chip tone="info">{p.type}</Chip> },
          { key: "access", header: "Report access status", render: (p) => <StatusBadge status={p.reportAccess === "active" ? "verified" : "rejected"} /> },
        ]}
      />
    </div>
  );
}
