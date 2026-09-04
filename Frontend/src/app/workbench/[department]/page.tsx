"use client";

import { useMemo, useState } from "react";
import { notFound } from "next/navigation";
import { EntityHeader } from "@/components/ui/EntityHeader";
import { Card } from "@/components/ui/Card";
import { StatusBadge, ResultFlag } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/Table";
import { QCBlockBanner } from "@/components/domain/CriticalAlertBanner";
import { useToast } from "@/components/ui/Toast";
import { MOCK_ORDER_ITEMS, MOCK_ORDERS } from "@/data/mock/orders";
import { MOCK_CATALOG } from "@/data/mock/catalog";
import { MOCK_RESULTS } from "@/data/mock/results";
import { MOCK_QC_RUNS } from "@/data/mock/quality";
import { MOCK_INSTRUMENT_RUNS, MOCK_ANALYZERS } from "@/data/mock/specimens";
import { HospitalWorkflowCard } from "@/components/domain/HospitalWorkflowCard";
import { useDemo } from "@/state/demo-context";
import { useHospitalWorkflow } from "@/state/hospital-workflow-context";

const DEPT_MAP: Record<string, string> = {
  chemistry: "Chemistry", hematology: "Hematology", coagulation: "Coagulation", immunology: "Immunology",
  urinalysis: "Urinalysis", microbiology: "Microbiology", molecular: "Molecular", pathology: "Pathology",
};

export default function WorkbenchDepartmentPage({ params }: { params: { department: string } }) {
  const { department } = params;
  const deptLabel = DEPT_MAP[department];
  if (!deptLabel) notFound();

  const { showToast } = useToast();
  const { session } = useDemo();
  const { activeOrderItems, dynamicOrders, workflow } = useHospitalWorkflow();
  const items = useMemo(
    () => { const sharedItems = activeOrderItems.filter((item) => item.orderId === workflow.orderId); return [...MOCK_ORDER_ITEMS.filter((item) => !sharedItems.some((shared) => shared.id === item.id)), ...sharedItems].filter((i) => MOCK_CATALOG.find((c) => c.id === i.testId)?.department === deptLabel); },
    [deptLabel, activeOrderItems, workflow.orderId]
  );
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? "");
  const selected = items.find((i) => i.id === selectedId);
  const order = [...dynamicOrders, ...MOCK_ORDERS].find((o) => o.id === selected?.orderId);
  const result = MOCK_RESULTS.find((r) => r.orderItemId === selected?.id);
  const qcBlocked = MOCK_QC_RUNS.some((q) => q.department === deptLabel && q.status === "out_of_control");
  const analyzer = MOCK_ANALYZERS.find((a) => a.department === deptLabel);
  const runs = MOCK_INSTRUMENT_RUNS.filter((r) => r.analyzerId === analyzer?.id);

  return (
    <div className="space-y-4">
      {session?.billingOwner === "HMS_CENTRAL" && department === "coagulation" && <HospitalWorkflowCard compact />}
      <EntityHeader eyebrow="Module 6 · Workbench & Analyzers" title={`${deptLabel} Workbench`} subtitle="Left: work queue · Center: result entry · Right: flags & context · Bottom: batch runs" />

      {qcBlocked && <QCBlockBanner analyte="See QC module" department={deptLabel} reason="Westgard rule violation on latest control run" />}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr_280px]">
        {/* Left: work queue */}
        <Card className="p-3">
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-text-muted">Work queue ({items.length})</p>
          <ul className="max-h-[520px] space-y-1 overflow-y-auto">
            {items.map((i) => (
              <li key={i.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(i.id)}
                  className={`flex w-full flex-col items-start rounded-lg px-2.5 py-2 text-left text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue ${
                    selectedId === i.id ? "bg-blue-50 text-brand-blue" : "text-text-main hover:bg-app-bg"
                  }`}
                >
                  <span className="font-medium">{i.testName}</span>
                  <span className="text-[11px] text-text-muted">{i.orderId}</span>
                </button>
              </li>
            ))}
            {items.length === 0 && <p className="px-2 py-4 text-xs text-text-muted">No work items in this department.</p>}
          </ul>
        </Card>

        {/* Center: result entry */}
        <Card className="p-5">
          {selected ? (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-text-main">{selected.testName}</p>
                  <p className="text-xs text-text-muted">{selected.orderId} · {order?.patientName}</p>
                </div>
                <StatusBadge status={selected.status} />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block text-xs font-medium text-text-muted">
                  Result value
                  <input
                    defaultValue={result?.value ?? ""}
                    className="mt-1 h-10 w-full rounded-control border border-app-border bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                    disabled={qcBlocked}
                  />
                </label>
                <label className="block text-xs font-medium text-text-muted">
                  Units
                  <input defaultValue={result?.units ?? ""} className="mt-1 h-10 w-full rounded-control border border-app-border bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue" disabled />
                </label>
              </div>
              {result && (
                <div className="mt-3">
                  <ResultFlag flag={result.flag} />
                </div>
              )}
              <div className="mt-5 flex flex-wrap gap-2">
                <Button size="sm" disabled={qcBlocked} disabledReason="Results are QC-blocked for this department" onClick={() => showToast({ title: "Result saved (simulated)", tone: "success" })}>
                  Save result
                </Button>
                <Button size="sm" variant="secondary" onClick={() => showToast({ title: "Marked for repeat / rerun (simulated)", tone: "warning" })}>
                  Repeat / rerun
                </Button>
                <Button size="sm" variant="outline" onClick={() => showToast({ title: "Dilution requested (simulated)", tone: "info" })}>
                  Dilution
                </Button>
                <Button size="sm" variant="outline" onClick={() => showToast({ title: "Sent for technical review (simulated)", tone: "info" })}>
                  Technical review
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-text-muted">Select a work item from the queue.</p>
          )}
        </Card>

        {/* Right: context panel */}
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Patient context</p>
          {order && (
            <dl className="mt-2 space-y-1.5 text-xs">
              <div className="flex justify-between"><dt className="text-text-muted">Patient</dt><dd className="font-medium">{order.patientName}</dd></div>
              <div className="flex justify-between"><dt className="text-text-muted">Priority</dt><dd className="font-medium">{order.priority.toUpperCase()}</dd></div>
              <div className="flex justify-between"><dt className="text-text-muted">Ordering doctor</dt><dd className="font-medium">{order.orderingDoctor}</dd></div>
            </dl>
          )}
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-text-muted">QC status</p>
          <div className="mt-2">
            <StatusBadge status={qcBlocked ? "out_of_control" : "in_control"} />
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-text-muted">Previous result</p>
          <p className="mt-1 text-xs text-text-muted">{result?.previousValue ? `${result.previousValue} (previous visit)` : "No prior result on file"}</p>
          {result?.deltaWarning && <p className="mt-1 text-xs font-medium text-status-warning">⚠ Delta-check warning vs previous result</p>}
        </Card>
      </div>

      {/* Bottom: batch/run table */}
      <Card className="p-4">
        <p className="mb-2 text-sm font-semibold text-text-main">Instrument runs — {analyzer?.name ?? "No analyzer mapped"}</p>
        <DataTable
          rows={runs}
          rowKey={(r) => r.id}
          columns={[
            { key: "id", header: "Run", render: (r) => r.id },
            { key: "items", header: "Items", render: (r) => r.itemCount },
            { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
          ]}
          emptyDescription="No instrument runs recorded for this department."
        />
      </Card>
    </div>
  );
}
