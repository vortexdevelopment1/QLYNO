"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EntityHeader } from "@/components/ui/EntityHeader";
import { DataTable } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal, ConfirmDialog } from "@/components/ui/Overlay";
import { useToast } from "@/components/ui/Toast";
import { HospitalWorkflowCard } from "@/components/domain/HospitalWorkflowCard";
import { useDemo } from "@/state/demo-context";
import { useHospitalWorkflow } from "@/state/hospital-workflow-context";
import type { Specimen } from "@/lib/types/domain";

const REASONS = ["Insufficient volume", "Haemolysed sample", "Clotted sample", "Wrong container / anticoagulant", "Unlabelled or mislabelled", "Leaking / compromised container"];

export default function AccessioningPage() {
  const params = useSearchParams(); const router = useRouter(); const { showToast } = useToast(); const { session } = useDemo(); const { activeSpecimens, workflow, accessionSpecimen, rejectSpecimen } = useHospitalWorkflow();
  const requestedOrderId = params.get("orderId"); const requestedSpecimenId = params.get("specimenId"); const [selectedId, setSelectedId] = useState<string>(); const [acceptMode, setAcceptMode] = useState<"full" | "partial">(); const [rejectOpen, setRejectOpen] = useState(false); const [reason, setReason] = useState(REASONS[0]);
  const queue = useMemo(() => activeSpecimens.filter((specimen) => specimen.tenantId === session?.tenantId && Boolean(specimen.siteId && session?.allowedSiteIds.includes(specimen.siteId)) && specimen.status === "received" && !specimen.accessionId), [activeSpecimens, session]);
  const target = requestedOrderId && requestedSpecimenId ? queue.find((specimen) => specimen.orderId === requestedOrderId && specimen.id === requestedSpecimenId) : undefined; const targetMissing = Boolean(requestedOrderId && requestedSpecimenId && !target);
  useEffect(() => { if (target) setSelectedId(target.id); }, [target]); const selected = queue.find((specimen) => specimen.id === selectedId); const permitted = Boolean(session?.permissions.includes("specimen.accession"));
  function accept() { if (!selected) return; const result = accessionSpecimen(selected.orderId, selected.id); if (!result.ok) return showToast({ title: "Accession not created", description: result.message, tone: "warning" }); showToast({ title: acceptMode === "partial" ? "Specimen partially accepted" : "Specimen accepted and accessioned", description: "Accession events and work items were created from shared state.", tone: "success" }); setAcceptMode(undefined); router.push(`/workbench?orderId=${selected.orderId}`); }
  function reject() { if (!selected) return; const result = rejectSpecimen(selected.orderId, selected.id, reason); if (!result.ok) return showToast({ title: "Rejection not recorded", description: result.message, tone: "warning" }); showToast({ title: "Specimen rejected", description: "Original preserved; linked recollection request created.", tone: "warning" }); setRejectOpen(false); router.push(`/collection?orderId=${selected.orderId}&specimenId=${selected.id}`); }
  return <div className="space-y-6">
    {session?.billingOwner === "HMS_CENTRAL" && <HospitalWorkflowCard compact />}
    <EntityHeader eyebrow="Module 4 · Collection & Specimens" title="Accessioning Queue" subtitle="Received specimens awaiting acceptance, partial acceptance, or rejection." />
    {targetMissing && <div role="alert" className="rounded-card border border-red-200 bg-red-50 p-4 text-sm font-semibold text-status-critical">Data-integrity error: accessioning target {requestedOrderId} / {requestedSpecimenId} is missing or is not in RECEIVED state.</div>}
    <DataTable rows={queue} rowKey={(specimen) => specimen.id} onRowClick={(specimen) => setSelectedId(specimen.id)} expandedRowKey={selectedId} rowClassName={(specimen) => specimen.id === selectedId ? "bg-emerald-50 ring-1 ring-inset ring-brand-blue" : ""} renderExpandedRow={(specimen) => <div className="flex flex-wrap items-center gap-2"><p className="mr-auto text-xs text-text-muted">Received {specimen.receivedAt ?? "—"} by {specimen.receivedBy ?? "—"} at {specimen.receivedSiteId ?? specimen.siteId}</p>{permitted ? <><Button size="sm" onClick={() => setAcceptMode("full")}>Accept</Button><Button size="sm" variant="secondary" onClick={() => setAcceptMode("partial")}>Partially accept</Button><Button size="sm" variant="destructive" onClick={() => setRejectOpen(true)}>Reject</Button></> : <span className="rounded-control border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-status-warning">Requires specimen.accession permission</span>}</div>} columns={[
      { key: "specimen", header: "Specimen ID", render: (specimen) => <span className="font-semibold">{specimen.id}</span> },
      { key: "order", header: "Order ID", render: (specimen) => specimen.orderId },
      { key: "patient", header: "Patient", render: (specimen) => <div><p>{specimen.patientName}</p><p className="text-xs text-text-muted">{workflow.mrn}</p></div> },
      { key: "type", header: "Specimen / Container", render: (specimen) => <div><p>{specimen.type}</p><p className="text-xs text-text-muted">{specimen.container}</p></div> },
      { key: "received", header: "Received", render: (specimen) => specimen.receivedAt ?? "Recorded" },
      { key: "status", header: "Status", render: (specimen) => <StatusBadge status={specimen.status} /> },
      { key: "action", header: "Action", render: (specimen) => <span className="font-semibold text-brand-blue">{specimen.id === selectedId ? "Selected" : "Open"}</span> },
    ]} emptyDescription="No received specimens are waiting for accessioning in your permitted scope." />
    <ConfirmDialog open={Boolean(acceptMode)} onClose={() => setAcceptMode(undefined)} onConfirm={accept} title={acceptMode === "partial" ? "Partially accept specimen" : "Accept specimen"} description={`${selected?.id ?? "Specimen"} belongs to ${selected?.orderId ?? "the selected order"}. An accession and departmental work item will be created.`} confirmLabel={acceptMode === "partial" ? "Partially accept" : "Accept & accession"} />
    <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title="Reject specimen" footer={<><Button size="sm" variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button><Button size="sm" variant="destructive" onClick={reject}>Reject and request recollection</Button></>}><p className="mb-3 text-sm text-text-muted">The received specimen remains immutable. Rejection creates a linked expected specimen and collection task.</p><label className="text-xs font-medium text-text-muted">Coded rejection reason<select value={reason} onChange={(event) => setReason(event.target.value)} className="mt-1 h-10 w-full rounded-control border border-app-border bg-white px-3 text-sm text-text-main">{REASONS.map((entry) => <option key={entry}>{entry}</option>)}</select></label></Modal>
  </div>;
}
