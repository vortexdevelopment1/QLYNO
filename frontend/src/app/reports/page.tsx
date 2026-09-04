"use client";

import { useRouter } from "next/navigation";
import { Download, FileClock } from "lucide-react";
import { EntityHeader } from "@/components/ui/EntityHeader";
import { DataTable } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { MOCK_REPORT_VERSIONS } from "@/data/mock/results";
import { formatDateTime } from "@/lib/utils/format";
import { FilterBar } from "@/components/ui/FilterBar";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { MOCK_ORDERS } from "@/data/mock/orders";
import { MOCK_SITES } from "@/data/mock/integrations";

export default function ReportsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [department, setDepartment] = useState("all");
  const [delivery, setDelivery] = useState("all");
  const [site, setSite] = useState("all"); const [priority, setPriority] = useState("all"); const [authorizer, setAuthorizer] = useState("all"); const [source, setSource] = useState("all"); const [criticalOnly, setCriticalOnly] = useState(false); const [dateFrom, setDateFrom] = useState(""); const [dateTo, setDateTo] = useState("");
  // Show the latest immutable version per report document, while retaining separate report groups per order.
  const latestByReport = new Map<string, (typeof MOCK_REPORT_VERSIONS)[number]>();
  for (const r of MOCK_REPORT_VERSIONS) {
    const reportId = r.id.split("-v")[0];
    const existing = latestByReport.get(reportId);
    if (!existing || r.version > existing.version) latestByReport.set(reportId, r);
  }
  const rows = Array.from(latestByReport.values()).filter((r) => { const order = MOCK_ORDERS.find((candidate) => candidate.id === r.orderId); const releasedDate = r.releasedAt.slice(0, 10); return `${r.id} ${r.orderId} ${r.patientName} ${r.patientMrn ?? ""}`.toLowerCase().includes(search.toLowerCase()) && (status === "all" || r.status === status) && (department === "all" || r.department === department) && (delivery === "all" || (r.deliveryStatus ?? "delivered") === delivery) && (site === "all" || order?.siteId === site) && (priority === "all" || order?.priority === priority) && (authorizer === "all" || r.authorizedBy === authorizer) && (source === "all" || order?.source === source) && (!criticalOnly || r.critical) && (!dateFrom || releasedDate >= dateFrom) && (!dateTo || releasedDate <= dateTo); });

  function exportMetadata() {
    const csv = ["Report ID,Order ID,Patient,Department,Status,Version,Authorized by,Released at", ...rows.map((r) => [r.id.split("-v")[0], r.orderId, r.patientName, r.department ?? "Laboratory", r.status, r.version, r.authorizedBy, r.releasedAt].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "qlyno-report-metadata.csv"; anchor.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 7 · Results & Reports" title="Reports" subtitle="Released clinical reports. A released report is immutable — corrections create a new version." />
      <div className="flex flex-wrap items-start justify-between gap-3"><FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search report, order, patient or MRN…" filters={[
        { id: "department", label: "Department", value: department, onChange: setDepartment, options: [{ value: "all", label: "All departments" }, { value: "Hematology", label: "Hematology" }, { value: "Biochemistry", label: "Biochemistry" }] },
        { id: "status", label: "Report status", value: status, onChange: setStatus, options: [{ value: "all", label: "All statuses" }, { value: "preliminary", label: "Preliminary" }, { value: "final", label: "Final" }, { value: "corrected", label: "Corrected" }] },
        { id: "delivery", label: "Delivery", value: delivery, onChange: setDelivery, options: [{ value: "all", label: "All delivery states" }, { value: "pending", label: "Pending" }, { value: "delivered", label: "Delivered" }, { value: "failed", label: "Failed" }] },
        { id: "site", label: "Site", value: site, onChange: setSite, options: [{ value: "all", label: "All sites" }, ...MOCK_SITES.map((entry) => ({ value: entry.id, label: entry.name }))] },
        { id: "priority", label: "Priority", value: priority, onChange: setPriority, options: [{ value: "all", label: "All priorities" }, { value: "stat", label: "STAT" }, { value: "urgent", label: "Urgent" }, { value: "routine", label: "Routine" }] },
        { id: "authorizer", label: "Authorizer", value: authorizer, onChange: setAuthorizer, options: [{ value: "all", label: "All authorizers" }, ...Array.from(new Set(MOCK_REPORT_VERSIONS.map((entry) => entry.authorizedBy))).map((entry) => ({ value: entry, label: entry }))] },
        { id: "source", label: "Order source", value: source, onChange: setSource, options: [{ value: "all", label: "All sources" }, { value: "hospital_encounter", label: "Hospital encounter" }, { value: "walk_in", label: "Walk-in" }, { value: "b2b_client", label: "B2B client" }, { value: "home_collection", label: "Home collection" }] },
      ]} /><div className="flex flex-wrap items-center gap-2"><label className="flex items-center gap-2 rounded-control border border-app-border bg-white px-3 py-2 text-xs"><input type="checkbox" checked={criticalOnly} onChange={(event) => setCriticalOnly(event.target.checked)} /> Critical only</label><label className="text-xs text-text-muted">From <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="ml-1 rounded-control border border-app-border bg-white px-2 py-1.5 text-text-main" /></label><label className="text-xs text-text-muted">To <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="ml-1 rounded-control border border-app-border bg-white px-2 py-1.5 text-text-main" /></label><Button size="sm" variant="outline" onClick={exportMetadata}><Download className="h-3.5 w-3.5" /> Export CSV</Button></div></div>
      <DataTable
        rows={rows}
        rowKey={(r) => r.id}
        onRowClick={(r) => router.push(`/reports/${r.id.split("-v")[0]}`)}
        columns={[
          { key: "report", header: "Report ID", render: (r) => r.id.split("-v")[0] },
          { key: "order", header: "Order ID", render: (r) => r.orderId },
          { key: "patient", header: "Patient / MRN", render: (r) => <div><p>{r.patientName}</p><p className="text-xs text-text-muted">{r.patientMrn ?? "MRN not available"}</p></div> },
          { key: "group", header: "Report group", render: (r) => r.reportGroupId ?? "Consolidated laboratory" },
          { key: "department", header: "Department", render: (r) => r.department ?? "Laboratory" },
          { key: "tests", header: "Tests included", render: (r) => `${r.includedOrderItemIds?.length ?? 1} test group` },
          { key: "version", header: "Version", render: (r) => `v${r.version}` },
          { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
          { key: "released", header: "Released", render: (r) => formatDateTime(r.releasedAt) },
          { key: "by", header: "Authorized by", render: (r) => r.authorizedBy },
          { key: "critical", header: "Critical", render: (r) => r.critical ? <StatusBadge status="critical" /> : "No" },
          { key: "delivery", header: "Delivery", render: (r) => <StatusBadge status={r.deliveryStatus ?? "delivered"} /> },
          { key: "actions", header: "Actions", render: () => <span className="inline-flex items-center gap-1 font-medium text-brand-blue"><FileClock className="h-3.5 w-3.5" /> Open / history</span> },
        ]}
      />
    </div>
  );
}
