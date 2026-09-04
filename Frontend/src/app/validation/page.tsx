"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { DataTable } from "@/components/ui/Table";
import { ResultFlag, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useCurrentRole, useDemo } from "@/state/demo-context";
import { MOCK_RESULTS } from "@/data/mock/results";
import { MOCK_ORDER_ITEMS, MOCK_ORDERS } from "@/data/mock/orders";
import { HospitalWorkflowCard } from "@/components/domain/HospitalWorkflowCard";

export default function ValidationPage() {
  const { showToast } = useToast();
  const role = useCurrentRole();
  const { session } = useDemo();

  const pending = MOCK_RESULTS.filter((r) => r.status === "technical_review" || r.status === "medical_review").map((r) => {
    const item = MOCK_ORDER_ITEMS.find((i) => i.id === r.orderItemId);
    const order = MOCK_ORDERS.find((o) => o.id === item?.orderId);
    return { ...r, patientName: order?.patientName ?? "—", orderId: order?.id ?? "—" };
  });

  return (
    <div className="space-y-6">
      {session?.billingOwner === "HMS_CENTRAL" && <HospitalWorkflowCard compact />}
      <EntityHeader eyebrow="Module 7 · Results & Reports" title="Validation Queue" subtitle="Technical validation and medical authorization before release." />
      <DataTable
        rows={pending}
        rowKey={(r) => r.id}
        columns={[
          { key: "test", header: "Test", render: (r) => r.testName },
          { key: "patient", header: "Patient", render: (r) => r.patientName },
          { key: "value", header: "Result", render: (r) => `${r.value} ${r.units}` },
          { key: "flag", header: "Flag", render: (r) => <ResultFlag flag={r.flag} /> },
          { key: "status", header: "Stage", render: (r) => <StatusBadge status={r.status} /> },
          {
            key: "actions", header: "Actions",
            render: (r) => (
              <div className="flex gap-2">
                {r.status === "technical_review" && (
                  <Button size="sm" variant="secondary" onClick={() => showToast({ title: "Technical validation recorded (simulated)", description: r.testName, tone: "success" })}>
                    Technical validate
                  </Button>
                )}
                {r.status === "medical_review" && (
                  <Button
                    size="sm"
                    disabled={!role.canApproveResults}
                    disabledReason="Your current prototype role does not have result approval permission"
                    onClick={() => showToast({ title: "Medically authorized (simulated)", description: r.testName, tone: "success" })}
                  >
                    Medical authorize
                  </Button>
                )}
              </div>
            ),
          },
        ]}
        emptyDescription="Validation queue is clear."
      />
    </div>
  );
}
