"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ChevronDown, Clock3, MapPin, TestTube2, UserRound } from "lucide-react";
import { EntityHeader } from "@/components/ui/EntityHeader";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { HospitalWorkflowCard } from "@/components/domain/HospitalWorkflowCard";
import { useDemo } from "@/state/demo-context";
import { useHospitalWorkflow } from "@/state/hospital-workflow-context";
import { formatDateTime } from "@/lib/utils/format";
import type { CollectionTask } from "@/lib/types/collection-task";

const CHECKLIST = ["Confirmed patient name verbally", "Confirmed date of birth / MRN", "Matched wristband / requisition ID", "Verified every required container and label"];

export default function CollectionPage() {
  const { showToast } = useToast(); const router = useRouter(); const params = useSearchParams(); const { session } = useDemo();
  const { collectionTasks, activeSpecimens, workflow, confirmCollection } = useHospitalWorkflow();
  const [selectedId, setSelectedId] = useState<string>(); const [checked, setChecked] = useState<string[]>([]); const [selectedSpecimens, setSelectedSpecimens] = useState<string[]>([]); const [notes, setNotes] = useState("");
  const requestedOrderId = params.get("orderId"); const requestedSpecimenId = params.get("specimenId");
  const tasks = useMemo(() => collectionTasks.filter((task) => session && task.tenantId === session.tenantId && session.allowedSiteIds.includes(task.siteId) && task.status !== "COMPLETED"), [collectionTasks, session]);
  const matchingTask = requestedOrderId && requestedSpecimenId ? tasks.find((task) => task.orderId === requestedOrderId && task.specimenIds.includes(requestedSpecimenId)) : undefined;
  useEffect(() => { if (matchingTask) selectTask(matchingTask, requestedSpecimenId ?? undefined); }, [matchingTask, requestedSpecimenId]); // eslint-disable-line react-hooks/exhaustive-deps
  const selected = tasks.find((task) => task.id === selectedId); const authorized = Boolean(session?.permissions.includes("collection.confirm") && session.laboratoryRoles.some((role) => role === "PHLEBOTOMIST" || role === "WARD_COLLECTOR"));
  function expectedIds(task: CollectionTask) { return task.specimenIds.filter((id) => activeSpecimens.find((specimen) => specimen.id === id)?.status === "expected"); }
  function selectTask(task: CollectionTask, requested?: string) { setSelectedId(task.id); const expected = expectedIds(task); setSelectedSpecimens(requested && expected.includes(requested) ? [requested] : expected); setChecked([]); setNotes(""); }
  function submit() { if (!selected) return; const result = confirmCollection(selected.id, selectedSpecimens, notes); if (!result.ok) return showToast({ title: "Collection not recorded", description: result.message, tone: "warning" }); const specimenId = selectedSpecimens[0]; showToast({ title: selectedSpecimens.length === expectedIds(selected).length ? "Collection task completed" : "Partial collection recorded", description: "Specimens and pipeline updated together.", tone: "success" }); router.push(`/collection/scan?orderId=${selected.orderId}&specimenId=${specimenId}`); }

  return <div className="space-y-5">
    {session?.billingOwner === "HMS_CENTRAL" && <HospitalWorkflowCard compact />}
    <EntityHeader eyebrow="Module 4 · Collection & Specimens" title="Collection Queue" subtitle="Select a visit, verify its containers, and record collection." />
    {requestedOrderId && requestedSpecimenId && !matchingTask && <div role="alert" className="rounded-card border border-red-200 bg-red-50 p-4 text-sm font-semibold text-status-critical">Collection task missing for {requestedOrderId} / {requestedSpecimenId}</div>}
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section aria-label="Pending collection tasks" className="space-y-3">
        <div className="flex items-center justify-between"><div><h2 className="font-display text-lg font-semibold">Pending visits</h2><p className="text-xs text-text-muted">{tasks.length} task{tasks.length === 1 ? "" : "s"} in your permitted scope</p></div><span className="rounded-full bg-pastel-green px-3 py-1 text-xs font-semibold text-brand-blue">{tasks.reduce((sum, task) => sum + expectedIds(task).length, 0)} containers due</span></div>
        {!tasks.length && <Card className="p-8 text-center text-sm text-text-muted">No pending collection tasks in your permitted tenant and site scope.</Card>}
        {tasks.map((task) => { const isSelected = task.id === selectedId; const patientName = activeSpecimens.find((specimen) => task.specimenIds.includes(specimen.id))?.patientName ?? "Hospital patient"; return <Card key={task.id} className={isSelected ? "overflow-hidden border-brand-blue ring-1 ring-brand-blue/20" : "overflow-hidden"}>
          <button type="button" onClick={() => selectTask(task)} className="w-full p-4 text-left hover:bg-app-bg/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-blue">
            <div className="flex flex-wrap items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pastel-green text-brand-blue"><TestTube2 className="h-5 w-5" /></div><div className="min-w-[180px] flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-text-main">{patientName}</h3><PriorityBadge priority={task.priority} /><StatusBadge status={task.status.toLowerCase()} /></div><p className="mt-1 text-xs text-text-muted">{workflow.mrn} · {task.orderId} · {task.id}</p></div><div className="text-right"><p className="text-xs font-medium">{task.testNames.length} test{task.testNames.length === 1 ? "" : "s"}</p><p className="mt-1 text-xs text-text-muted">{task.requiredContainers.length} containers</p></div><ChevronDown className={`mt-1 h-4 w-4 text-text-muted transition ${isSelected ? "rotate-180" : ""}`} /></div>
            <div className="mt-4 grid gap-2 border-t border-app-border pt-3 text-xs sm:grid-cols-3"><p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-text-muted" />{task.collectionLocation}</p><p className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5 text-text-muted" />{formatDateTime(task.scheduledAt)}</p><p className="flex items-center gap-1.5"><UserRound className="h-3.5 w-3.5 text-text-muted" />{task.collectedBy ?? task.assignedRole.replaceAll("_", " ")}</p></div>
          </button>
          {isSelected && <div className="border-t border-app-border bg-app-bg p-4"><p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Tests and required containers</p><div className="grid gap-2 md:grid-cols-2">{task.specimenIds.map((id, index) => { const specimen = activeSpecimens.find((entry) => entry.id === id); const isExpected = specimen?.status === "expected"; return <label key={id} className={`flex gap-3 rounded-lg border p-3 ${selectedSpecimens.includes(id) ? "border-brand-blue bg-white" : "border-app-border bg-white/70"}`}><input type="checkbox" disabled={!authorized || !isExpected} checked={selectedSpecimens.includes(id)} onChange={() => setSelectedSpecimens((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id])} className="mt-0.5 h-4 w-4" /><span className="min-w-0 text-xs"><strong className="block">{id} · {task.testNames[index] ?? "Laboratory test"}</strong><span className="mt-1 block text-text-muted">{task.requiredContainers[index]}</span><span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold uppercase text-brand-blue"><CheckCircle2 className="h-3 w-3" />{specimen?.status ?? "expected"}</span></span></label>; })}</div></div>}
        </Card>; })}
      </section>
      <Card className="h-fit p-5 xl:sticky xl:top-24"><h2 className="font-display text-lg font-semibold">Collection verification</h2>{!selected ? <p className="mt-3 rounded-lg bg-app-bg p-4 text-sm text-text-muted">Select a pending visit to begin.</p> : <><p className="mt-1 text-xs text-text-muted">{selected.orderId} · {selectedSpecimens.length} of {expectedIds(selected).length} due containers selected</p><ul className="mt-5 space-y-3">{CHECKLIST.map((item) => <li key={item}><label className="flex items-start gap-2 text-sm"><input type="checkbox" disabled={!authorized} checked={checked.includes(item)} onChange={() => setChecked((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item])} className="mt-0.5 h-4 w-4" />{item}</label></li>)}</ul><label className="mt-5 block text-xs font-medium text-text-muted">Collection notes<textarea disabled={!authorized} value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} className="mt-1 w-full rounded-control border border-app-border bg-white p-3 text-sm text-text-main" placeholder="Condition, quantity, or notes" /></label></>}
        {!authorized && selected && <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-status-warning">Awaiting authorized collector</p>}
        <Button size="sm" className="mt-5 w-full justify-center" disabled={!selected || !authorized || checked.length !== CHECKLIST.length || !selectedSpecimens.length || workflow.stage !== "COLLECTION_READY"} disabledReason="Select containers and complete all identification checks" onClick={submit}>Confirm selected containers</Button>
      </Card>
    </div>
  </div>;
}
