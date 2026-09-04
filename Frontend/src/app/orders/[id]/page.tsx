"use client";

import { notFound } from "next/navigation";
import { EntityHeader } from "@/components/ui/EntityHeader";
import { Card } from "@/components/ui/Card";
import { StatusBadge, PriorityBadge, BillingAuthorityBadge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { DataTable } from "@/components/ui/Table";
import { AuditTimeline } from "@/components/ui/Timeline";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";
import { MOCK_ORDERS, MOCK_ORDER_ITEMS } from "@/data/mock/orders";
import { MOCK_SPECIMENS } from "@/data/mock/specimens";
import { MOCK_PATIENTS, MOCK_ENCOUNTERS } from "@/data/mock/patients";
import { MOCK_AUDIT_EVENTS } from "@/data/mock/integrations";
import { useDemo } from "@/state/demo-context";
import { ORDER_SOURCE_LABEL } from "@/config/tenant-modes";
import { formatCurrencyINR, formatDateTime } from "@/lib/utils/format";
import { useToast } from "@/components/ui/Toast";
import { ChargeLineTable, HmsBillingStatusCard } from "@/components/domain/ChargeSummary";
import { chargeLinesForOrderWithFallback, postingForOrder } from "@/data/mock/charges";
import { HospitalWorkflowCard } from "@/components/domain/HospitalWorkflowCard";
import { useHospitalWorkflow } from "@/state/hospital-workflow-context";
import { MOCK_REPORT_VERSIONS } from "@/data/mock/results";
import { deriveOrderStatus, summarizeOrderItems } from "@/lib/orders/derive-order-status";
import { MOCK_RESULTS } from "@/data/mock/results";
import { useState } from "react";

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [expandedItemId, setExpandedItemId] = useState<string>();
  const { billingEnabled, session } = useDemo();
  const { dynamicOrders, workflow, activeOrderItems, activeSpecimens } = useHospitalWorkflow();
  const expectedAuthority = session?.billingOwner === "HMS_CENTRAL" ? "HMS_CENTRAL" : session?.billingOwner === "LIS_INTERNAL" ? "LIS_INTERNAL" : session?.billingOwner === "B2B_CONTRACT" ? "EXTERNAL_CLIENT" : "NO_CHARGE";
  const order = [...dynamicOrders, ...MOCK_ORDERS].find((o) => o.id === id && o.billingAuthority === expectedAuthority);
  if (!order || !session) notFound();
  const { showToast } = useToast();
  const patient = MOCK_PATIENTS.find((p) => p.id === order.patientId);
  const encounter = MOCK_ENCOUNTERS.find((e) => e.patientId === order.patientId);
  const items = order.id === workflow.orderId ? activeOrderItems : MOCK_ORDER_ITEMS.filter((i) => i.orderId === order.id);
  const specimens = order.id === workflow.orderId ? activeSpecimens : MOCK_SPECIMENS.filter((s) => s.orderId === order.id);
  const reportVersions = MOCK_REPORT_VERSIONS.filter((r) => r.orderId === order.id);
  const reports = Array.from(reportVersions.reduce((latest, report) => {
    const reportId = report.id.split("-v")[0];
    const current = latest.get(reportId);
    if (!current || report.version > current.version) latest.set(reportId, report);
    return latest;
  }, new Map<string, (typeof MOCK_REPORT_VERSIONS)[number]>()).values());
  const overallStatus = deriveOrderStatus(items.map((item) => item.status), order.status === "cancelled");
  const itemSummary = summarizeOrderItems(items.map((item) => item.status));
  const chargeLines = chargeLinesForOrderWithFallback(order, items, session.tenantId);
  const posting = postingForOrder(order.id, session.tenantId);

  return (
    <div className="space-y-6">
      <EntityHeader
        eyebrow="Module 3 · Orders & Catalog"
        title={order.id}
        subtitle={`${order.patientName} · ${order.accessionId ?? "Accession pending"}`}
        badges={
          <>
            <PriorityBadge priority={order.priority} />
            <StatusBadge status={order.status} />
            <BillingAuthorityBadge authority={order.billingAuthority} />
          </>
        }
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => showToast({ title: "Order placed on hold (simulated)", tone: "warning" })}>
              Place on hold
            </Button>
            {order.billingAuthority === "LIS_INTERNAL" && billingEnabled && (
              <Button size="sm" variant="secondary" onClick={() => showToast({ title: "Payment collection (simulated)", tone: "success" })}>
                Collect payment
              </Button>
            )}
          </>
        }
      />

      {encounter && (
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Hospital context</p>
          <div className="mt-2 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div><p className="text-xs text-text-muted">MRN</p><p className="font-medium">{patient?.mrn}</p></div>
            <div><p className="text-xs text-text-muted">Encounter</p><p className="font-medium">{encounter.encounterNo}</p></div>
            <div><p className="text-xs text-text-muted">Ward / Bed</p><p className="font-medium">{encounter.ward} / {encounter.bed}</p></div>
            <div><p className="text-xs text-text-muted">Ordering doctor</p><p className="font-medium">{order.orderingDoctor}</p></div>
          </div>
        </Card>
      )}

      {session.billingOwner === "HMS_CENTRAL" && (
        <HmsBillingStatusCard lines={chargeLines} posting={posting} canRetry={session.permissions.includes("billing.post.retry")} />
      )}

      {session.billingOwner === "HMS_CENTRAL" && <HospitalWorkflowCard orderId={order.id} />}

      {session.billingOwner === "LIS_INTERNAL" && chargeLines.length > 0 && (
        <Card className="p-5">
          <h3 className="font-display text-lg font-semibold">Laboratory Charge Summary</h3>
          <p className="mt-1 text-xs text-text-muted">The LIS is the billing authority. Workflow, report, invoice and payment states remain independent.</p>
          <div className="mt-4"><ChargeLineTable lines={chargeLines} /></div>
          <p className="mt-4 text-right text-sm font-semibold">Estimated total: {formatCurrencyINR(chargeLines.reduce((sum, line) => sum + line.netAmount, 0))}</p>
        </Card>
      )}

      <Tabs
        items={[
          {
            id: "overview", label: "Overview",
            content: <Card className="p-5"><div className="grid gap-4 sm:grid-cols-3"><div><p className="text-xs uppercase tracking-wide text-text-muted">Overall order status</p><div className="mt-2"><StatusBadge status={overallStatus} /></div></div><div><p className="text-xs uppercase tracking-wide text-text-muted">Test progress</p><p className="mt-2 font-semibold">{itemSummary.completed} of {items.length} test groups completed</p><p className="mt-1 text-xs text-text-muted">{itemSummary.awaitingValidation} awaiting validation · {itemSummary.recollection} requires recollection</p></div><div><p className="text-xs uppercase tracking-wide text-text-muted">Order structure</p><p className="mt-2 text-sm">{items.length} tests · {specimens.length} specimens · {reports.length} report groups</p></div></div><p className="mt-4 rounded-lg bg-app-bg p-3 text-xs text-text-muted">Overall status is calculated from child test groups. A blocked or rejected specimen affects only its dependent tests; accepted specimens continue independently.</p></Card>,
          },
          {
            id: "items", label: "Tests & Results",
            content: (
              <DataTable
                rows={items}
                rowKey={(i) => i.id}
                onRowClick={(item) => setExpandedItemId((current) => current === item.id ? undefined : item.id)}
                expandedRowKey={expandedItemId}
                rowClassName={(item) => item.id === expandedItemId ? "bg-emerald-50" : ""}
                renderExpandedRow={(item) => { const analytes = MOCK_RESULTS.filter((result) => result.orderItemId === item.id); return <div><p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Analytes, provenance and review history</p>{analytes.length ? <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{analytes.map((result) => <div key={result.id} className="rounded-lg border border-app-border bg-white p-3 text-xs"><div className="flex items-start justify-between gap-2"><strong>{result.testName}</strong><StatusBadge status={result.flag} /></div><p className="mt-2 text-sm font-semibold">{result.value} {result.units}</p><p className="mt-1 text-text-muted">Reference: {result.referenceRange}</p><p className="mt-1 text-text-muted">Source: {result.enteredBy ?? "Manual entry"}</p>{result.previousValue && <p className="mt-1 text-text-muted">Previous: {result.previousValue}</p>}</div>)}</div> : <p className="rounded-lg border border-dashed border-app-border bg-white p-4 text-xs text-text-muted">No analyte values entered yet. Repeat, validation and release history will appear here without adding another full pipeline.</p>}</div>; }}
                columns={[
                  { key: "test", header: "Test / panel", render: (i) => i.testName },
                  { key: "department", header: "Department", render: (i) => i.departmentId ?? order.departmentIds[0] ?? "General Laboratory" },
                  { key: "specimen", header: "Specimen ID", render: (i) => i.specimenId ?? "Pending collection" },
                  { key: "accession", header: "Accession ID", render: (i) => i.accessionId ?? order.accessionId ?? "Pending" },
                  { key: "status", header: "Current status", render: (i) => <StatusBadge status={i.status} /> },
                  { key: "flag", header: "Result / report", render: (i) => i.status === "released" ? "Final report available" : i.status === "blocked" ? "Action required" : "Pending" },
                  { key: "technical", header: "Technical reviewer", render: (i) => i.technicalReviewer ?? "Awaiting assignment" },
                  { key: "medical", header: "Medical reviewer", render: (i) => i.medicalReviewer ?? "Awaiting assignment" },
                  { key: "tat", header: "TAT", render: (i) => i.tat ?? "Within target" },
                  { key: "action", header: "Action", render: (i) => <span className="font-semibold text-brand-blue">{i.id === expandedItemId ? "Hide details" : "View details"}</span> },
                ]}
                emptyDescription="No test items on this order yet."
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
                  { key: "container", header: "Container", render: (s) => s.container },
                  { key: "status", header: "Status", render: (s) => <StatusBadge status={s.status} /> },
                ]}
                emptyDescription="No specimens collected for this order yet."
              />
            ),
          },
          {
            id: "reports", label: "Reports",
            content: (
              <DataTable rows={reports} rowKey={(r) => r.id} columns={[
                { key: "id", header: "Report ID", render: (r) => r.id.split("-v")[0] },
                { key: "group", header: "Report group", render: (r) => r.department ?? r.reportGroupId ?? "Laboratory report" },
                { key: "status", header: "Latest status", render: (r) => <StatusBadge status={r.status} /> },
                { key: "version", header: "Latest version", render: (r) => `v${r.version}` },
                { key: "history", header: "Version history", render: () => "View version history" },
              ]} emptyDescription="No report group has been released yet. Preliminary reports will be clearly identified while tests remain pending." />
            ),
          },
          {
            id: "financial", label: session.billingOwner === "HMS_CENTRAL" ? "HMS Billing Status" : "Billing",
            content: (
              <Card className="p-5">
                {order.billingAuthority === "HMS_CENTRAL" ? (
                  <div>
                    <p className="text-sm font-semibold text-text-main">HMS Central Billing</p>
                    <p className="mt-1 text-xs text-text-muted">This order is billed through the hospital&apos;s central finance system. No LIS invoice is generated.</p>
                    <div className="mt-3">
                      <StatusBadge status={order.hmsPostingStatus ?? "post_pending"} />
                    </div>
                  </div>
                ) : order.billingAuthority === "NO_CHARGE" ? (
                  <p className="text-sm text-text-muted">This order is marked no-charge / internal — no billing record is created.</p>
                ) : billingEnabled ? (
                  <div>
                    <p className="text-sm font-semibold text-text-main">LIS Billing</p>
                    <p className="mt-1 text-xs text-text-muted">Linked invoice: view under Billing → Invoices.</p>
                  </div>
                ) : (
                  <EmptyState title="Billing not enabled" description="LIS billing is disabled for the current tenant mode." />
                )}
              </Card>
            ),
          },
          {
            id: "audit", label: "Timeline",
            content: <AuditTimeline entries={MOCK_AUDIT_EVENTS.filter((a) => a.entityId === order.id || a.entity === "Order").slice(0, 4)} />,
          },
        ]}
      />
    </div>
  );
}
