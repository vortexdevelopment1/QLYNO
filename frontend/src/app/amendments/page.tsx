"use client";

import { useRouter } from "next/navigation";
import { EntityHeader } from "@/components/ui/EntityHeader";
import { DataTable } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { MOCK_REPORT_VERSIONS } from "@/data/mock/results";
import { formatDateTime } from "@/lib/utils/format";

export default function AmendmentsPage() {
  const router = useRouter();
  const amended = MOCK_REPORT_VERSIONS.filter((r) => r.status === "corrected" || r.status === "amended");

  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 7 · Results & Reports" title="Amendments" subtitle="All report corrections with reason, authorizer and recipient re-notification status." />
      <DataTable
        rows={amended}
        rowKey={(r) => r.id}
        onRowClick={(r) => router.push(`/reports/${r.orderId}`)}
        columns={[
          { key: "order", header: "Order", render: (r) => r.orderId },
          { key: "patient", header: "Patient", render: (r) => r.patientName },
          { key: "version", header: "Version", render: (r) => `v${r.version}` },
          { key: "reason", header: "Reason", render: (r) => r.reason ?? "—" },
          { key: "by", header: "Authorized by", render: (r) => r.authorizedBy },
          { key: "released", header: "Released", render: (r) => formatDateTime(r.releasedAt) },
          { key: "renotify", header: "Recipient re-notified", render: () => <StatusBadge status="verified" /> },
        ]}
        emptyDescription="No report amendments on record."
      />
    </div>
  );
}
