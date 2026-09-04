"use client";

import { notFound } from "next/navigation";
import { useRouter } from "next/navigation";
import { Lock, AlertTriangle } from "lucide-react";
import { EntityHeader } from "@/components/ui/EntityHeader";
import { Tabs } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { AuditTimeline, Timeline } from "@/components/ui/Timeline";
import { StatusBadge } from "@/components/ui/Badge";
import { DataTable } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/States";
import { MOCK_PATIENTS, MOCK_ENCOUNTERS } from "@/data/mock/patients";
import { MOCK_ORDERS, MOCK_ORDER_ITEMS } from "@/data/mock/orders";
import { MOCK_SPECIMENS } from "@/data/mock/specimens";
import { MOCK_REPORT_VERSIONS } from "@/data/mock/results";
import { MOCK_AUDIT_EVENTS } from "@/data/mock/integrations";
import { ORDER_SOURCE_LABEL } from "@/config/tenant-modes";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import { useDemo } from "@/state/demo-context";
import { HmsBillingStatusCard } from "@/components/domain/ChargeSummary";
import { chargeLinesForOrderWithFallback, postingForOrder } from "@/data/mock/charges";
import { useHospitalWorkflow } from "@/state/hospital-workflow-context";

export default function PatientDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const { session } = useDemo();
  const { registeredPatients, dynamicOrders, workflow, activeOrderItems } = useHospitalWorkflow();
  const expectedAuthority = session?.billingOwner === "HMS_CENTRAL" ? "HMS_CENTRAL" : session?.billingOwner === "LIS_INTERNAL" ? "LIS_INTERNAL" : session?.billingOwner === "B2B_CONTRACT" ? "EXTERNAL_CLIENT" : "NO_CHARGE";
  const permittedOrders = [...dynamicOrders, ...MOCK_ORDERS].filter((o) => o.patientId === id && o.billingAuthority === expectedAuthority);
  const registered = registeredPatients.find((record) => record.id === id && record.tenantId === session?.tenantId);
  const patient = MOCK_PATIENTS.find((p) => p.id === id && permittedOrders.length > 0) ?? (registered ? { id: registered.id, mrn: registered.hospitalMrn, name: registered.displayName, age: registered.dateOfBirth ? new Date().getFullYear() - new Date(registered.dateOfBirth).getFullYear() : registered.estimatedAge?.value ?? 0, sex: registered.sexAtBirth === "MALE" ? "M" as const : registered.sexAtBirth === "FEMALE" ? "F" as const : "O" as const, contact: registered.primaryMobile ?? "Not provided", source: "hospital_encounter" as const, branchOrWard: registered.ward, lastOrderDate: registered.updatedAt.slice(0, 10) } : undefined);
  if (!patient || !session) notFound();

  const encounter = MOCK_ENCOUNTERS.find((e) => e.patientId === patient.id) ?? (registered?.encounterId ? { id: registered.encounterId, patientId: registered.id, encounterNo: registered.encounterNumber ?? registered.encounterId, ward: registered.ward ?? "Lab-only encounter", bed: registered.bed ?? "—", admittingDoctor: "HMS registration service", status: "active" as const } : undefined);
  const orders = permittedOrders;
  const specimens = MOCK_SPECIMENS.filter((s) => orders.some((o) => o.id === s.orderId));
  const reportVersions = MOCK_REPORT_VERSIONS.filter((r) => orders.some((o) => o.id === r.orderId));
  const latestReports = Array.from(reportVersions.reduce((latest, report) => {
    const reportId = report.id.split("-v")[0];
    const current = latest.get(reportId);
    if (!current || report.version > current.version) latest.set(reportId, report);
    return latest;
  }, new Map<string, (typeof MOCK_REPORT_VERSIONS)[number]>()).values());

  return (
    <div className="space-y-6">
      <EntityHeader
        eyebrow="Module 2 · Patients & Network"
        title={patient.name}
        subtitle={`${patient.mrn ?? patient.id} · ${patient.age} yrs · ${patient.sex} · ${patient.contact}`}
        badges={
          <>
            <span className="inline-flex items-center gap-1 rounded-full border border-app-border bg-app-sidebar px-2.5 py-1 text-xs text-text-muted">
              {ORDER_SOURCE_LABEL[patient.source]}
            </span>
            {patient.privacyFlag && (
              <span className="inline-flex items-center gap-1 rounded-full border border-app-border bg-app-sidebar px-2.5 py-1 text-xs text-text-muted">
                <Lock className="h-3 w-3" aria-hidden="true" /> Privacy restricted
              </span>
            )}
            {patient.duplicateWarning && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs text-status-warning">
                <AlertTriangle className="h-3 w-3" aria-hidden="true" /> Possible duplicate
              </span>
            )}
          </>
        }
      />

      {session.billingOwner === "HMS_CENTRAL" && orders[0] && (
        <HmsBillingStatusCard lines={chargeLinesForOrderWithFallback(orders[0], orders[0].id === workflow.orderId ? activeOrderItems : MOCK_ORDER_ITEMS.filter((item) => item.orderId === orders[0].id), session.tenantId)} posting={postingForOrder(orders[0].id, session.tenantId)} canRetry={session.permissions.includes("billing.post.retry")} />
      )}

      <Tabs
        items={[
          {
            id: "overview", label: "Overview",
            content: (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card className="p-5">
                  <h3 className="mb-3 text-sm font-semibold text-text-main">Demographics</h3>
                  <dl className="space-y-2 text-sm">
                    <Row label="Full name" value={patient.name} />
                    <Row label="Age / Sex" value={`${patient.age} / ${patient.sex}`} />
                    <Row label="Contact" value={patient.contact} />
                    <Row label="Source" value={ORDER_SOURCE_LABEL[patient.source]} />
                    <Row label="Branch / Ward" value={patient.branchOrWard ?? "—"} />
                    <Row label="Last order" value={formatDate(patient.lastOrderDate)} />
                  </dl>
                </Card>
                <Card className="p-5">
                  <h3 className="mb-3 text-sm font-semibold text-text-main">Active encounter</h3>
                  {encounter ? (
                    <dl className="space-y-2 text-sm">
                      <Row label="Encounter no." value={encounter.encounterNo} />
                      <Row label="Ward / Bed" value={`${encounter.ward} / ${encounter.bed}`} />
                      <Row label="Admitting doctor" value={encounter.admittingDoctor} />
                      <Row label="Status" value={<StatusBadge status={encounter.status} />} />
                    </dl>
                  ) : (
                    <p className="text-xs text-text-muted">No active inpatient encounter — this is a standalone / community order source.</p>
                  )}
                </Card>
              </div>
            ),
          },
          {
            id: "identifiers", label: "Identifiers",
            content: (
              <Card className="p-5">
                <dl className="space-y-2 text-sm">
                  <Row label="Patient ID" value={patient.id} />
                  <Row label="MRN" value={patient.mrn ?? "Not applicable (non-hospital patient)"} />
                  <Row label="ABDM Health ID" value="Not linked (prototype)" />
                </dl>
              </Card>
            ),
          },
          {
            id: "encounters", label: "Encounters",
            content: encounter ? (
              <Timeline entries={[{ id: encounter.id, label: `Encounter ${encounter.encounterNo} — ${encounter.status}`, description: `${encounter.ward} / Bed ${encounter.bed} · ${encounter.admittingDoctor}` }]} />
            ) : (
              <EmptyState title="No encounters" description="This patient has no hospital encounter history." />
            ),
          },
          {
            id: "orders", label: "Orders", badge: <span className="ml-1 rounded-full bg-app-bg px-1.5 text-[10px] text-text-muted">{orders.length}</span>,
            content: (
              <DataTable
                rows={orders}
                rowKey={(o) => o.id}
                onRowClick={(o) => router.push(`/orders/${o.id}`)}
                columns={[
                  { key: "id", header: "Order ID", render: (o) => o.id },
                  { key: "status", header: "Status", render: (o) => <StatusBadge status={o.status} /> },
                  { key: "dept", header: "Department", render: (o) => o.departmentIds.join(", ") },
                  { key: "placed", header: "Placed", render: (o) => formatDateTime(o.placedAt) },
                ]}
              />
            ),
          },
          {
            id: "specimens", label: "Specimens",
            content: (
              <DataTable
                rows={specimens}
                rowKey={(s) => s.id}
                columns={[
                  { key: "id", header: "Specimen ID", render: (s) => s.id },
                  { key: "type", header: "Type", render: (s) => s.type },
                  { key: "status", header: "Status", render: (s) => <StatusBadge status={s.status} /> },
                ]}
                emptyDescription="No specimens recorded for this patient yet."
              />
            ),
          },
          {
            id: "reports", label: "Reports",
            content: (
              <DataTable
                rows={latestReports}
                rowKey={(r) => r.id}
                columns={[
                  { key: "date", header: "Date", render: (r) => formatDateTime(r.releasedAt) },
                  { key: "order", header: "Order ID", render: (r) => r.orderId },
                  { key: "report", header: "Report ID / Group", render: (r) => `${r.id.split("-v")[0]} · Laboratory report` },
                  { key: "version", header: "Version", render: (r) => `v${r.version}` },
                  { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
                  { key: "doctor", header: "Authorized by", render: (r) => r.authorizedBy },
                  { key: "action", header: "Action", render: () => <span className="font-medium text-brand-blue">View / download</span> },
                ]}
                emptyDescription="No reports released for this patient yet."
              />
            ),
          },
          {
            id: "consent", label: "Consent",
            content: <EmptyState title="No consent records" description="Consent capture is out of scope for this frontend prototype." />,
          },
          {
            id: "relationships", label: "Relationships",
            content: <EmptyState title="No linked guardians" description="Guardian / relationship linking is not populated in demo data." />,
          },
          {
            id: "audit", label: "Audit Timeline",
            content: <AuditTimeline entries={MOCK_AUDIT_EVENTS.slice(0, 3)} />,
          },
        ]}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-app-border/60 pb-2 last:border-0">
      <dt className="text-text-muted">{label}</dt>
      <dd className="font-medium text-text-main">{value}</dd>
    </div>
  );
}
