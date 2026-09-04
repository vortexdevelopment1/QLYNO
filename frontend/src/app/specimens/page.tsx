"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EntityHeader } from "@/components/ui/EntityHeader";
import { FilterBar } from "@/components/ui/FilterBar";
import { DataTable } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { useHospitalWorkflow } from "@/state/hospital-workflow-context";
import { useDemo } from "@/state/demo-context";

export default function SpecimensPage() {
  const router = useRouter(); const { activeSpecimens } = useHospitalWorkflow(); const { session } = useDemo(); const [search, setSearch] = useState(""); const [status, setStatus] = useState("all");
  const rows = useMemo(() => activeSpecimens.filter((s) => Boolean(session && s.tenantId === session.tenantId && s.siteId && session.allowedSiteIds.includes(s.siteId)) && (status === "all" || s.status === status) && [s.patientName, s.id, s.orderId, s.mrn ?? ""].some((value) => value.toLowerCase().includes(search.toLowerCase()))), [activeSpecimens, search, session, status]);
  return <div className="space-y-6"><EntityHeader eyebrow="Module 4 · Collection & Specimens" title="Specimens" subtitle="One shared registry for collection, receiving, accessioning, lifecycle and search."/><FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search specimen, order, patient or MRN…" filters={[{ id: "status", label: "Status", value: status, onChange: setStatus, options: [{ value: "all", label: "All" }, { value: "expected", label: "Expected" }, { value: "collected", label: "Collected" }, { value: "in_transit", label: "In Transit" }, { value: "received", label: "Received" }, { value: "accepted", label: "Accepted" }, { value: "rejected", label: "Rejected" }] }]}/><DataTable rows={rows} rowKey={(s) => s.id} onRowClick={(s) => router.push(`/specimens/${s.id}`)} emptyDescription="No specimens match this permitted scope and filter." columns={[{ key: "id", header: "Specimen ID", render: (s) => <span className="font-medium">{s.id}</span> }, { key: "order", header: "Order", render: (s) => s.orderId }, { key: "patient", header: "Patient / MRN", render: (s) => <div><p>{s.patientName}</p><p className="text-xs text-text-muted">{s.mrn}</p></div> }, { key: "type", header: "Type / Container", render: (s) => `${s.type} · ${s.container}` }, { key: "site", header: "Site", render: (s) => s.siteId }, { key: "status", header: "Status", render: (s) => <StatusBadge status={s.status}/> }]}/></div>;
}
