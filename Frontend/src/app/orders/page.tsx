"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EntityHeader } from "@/components/ui/EntityHeader";
import { FilterBar } from "@/components/ui/FilterBar";
import { DataTable, type Column } from "@/components/ui/Table";
import { StatusBadge, PriorityBadge, BillingAuthorityBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MOCK_ORDERS } from "@/data/mock/orders";
import { ORDER_SOURCE_LABEL } from "@/config/tenant-modes";
import type { Order } from "@/lib/types/domain";
import { formatDateTime } from "@/lib/utils/format";
import { useDemo } from "@/state/demo-context";
import { useHospitalWorkflow } from "@/state/hospital-workflow-context";

export default function OrdersPage() {
  const router = useRouter();
  const { session } = useDemo();
  const { dynamicOrders, workflow } = useHospitalWorkflow();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [source, setSource] = useState("all");

  const rows = useMemo(
    () =>
      [...dynamicOrders, ...MOCK_ORDERS].map((order) => order.id === workflow.orderId ? { ...order, status: workflow.stage === "CLOSED" ? "completed" as const : ["ORDER_RECEIVED", "COLLECTION_READY", "RECEIVING", "ACCESSIONING"].includes(workflow.stage) ? "placed" as const : "in_progress" as const, reportStatus: workflow.reportStatus === "FINAL" ? "final" as const : "pending" as const } : order).filter(
        (o) =>
          o.billingAuthority === (session?.billingOwner === "HMS_CENTRAL" ? "HMS_CENTRAL" : session?.billingOwner === "LIS_INTERNAL" ? "LIS_INTERNAL" : session?.billingOwner === "B2B_CONTRACT" ? "EXTERNAL_CLIENT" : "NO_CHARGE") &&
          (status === "all" || o.status === status) &&
          (source === "all" || o.source === source) &&
          (o.patientName.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase()) || (o.accessionId ?? "").toLowerCase().includes(search.toLowerCase()))
      ),
    [search, status, source, session, dynamicOrders, workflow]
  );

  const columns: Column<Order>[] = [
    { key: "id", header: "Order ID", sortValue: (o) => o.id, render: (o) => <span className="font-medium">{o.id}</span> },
    { key: "accession", header: "Accession", render: (o) => o.accessionId ?? "—" },
    { key: "patient", header: "Patient", render: (o) => o.patientName },
    { key: "source", header: "Source", render: (o) => ORDER_SOURCE_LABEL[o.source] },
    { key: "priority", header: "Priority", render: (o) => <PriorityBadge priority={o.priority} /> },
    { key: "status", header: "Clinical Status", render: (o) => <StatusBadge status={o.status} /> },
    { key: "billing", header: "Billing Authority", render: (o) => <BillingAuthorityBadge authority={o.billingAuthority} /> },
    { key: "placed", header: "Placed", sortValue: (o) => o.placedAt, render: (o) => formatDateTime(o.placedAt) },
  ];

  return (
    <div className="space-y-6">
      <EntityHeader
        eyebrow="Module 3 · Orders & Catalog"
        title="Orders"
        subtitle="Every order shows exactly one billing authority — clinical and financial status are tracked separately."
        actions={<Button size="sm" onClick={() => router.push("/orders/new")}>New order</Button>}
      />
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search order ID, accession or patient…"
        filters={[
          {
            id: "status", label: "Status", value: status, onChange: setStatus,
            options: [
              { value: "all", label: "All" }, { value: "draft", label: "Draft" }, { value: "placed", label: "Placed" },
              { value: "collected", label: "Collected" }, { value: "in_progress", label: "In Progress" },
              { value: "completed", label: "Completed" }, { value: "on_hold", label: "On Hold" }, { value: "cancelled", label: "Cancelled" },
            ],
          },
          {
            id: "source", label: "Source", value: source, onChange: setSource,
            options: [{ value: "all", label: "All sources" }, ...Object.entries(ORDER_SOURCE_LABEL).map(([value, label]) => ({ value, label }))],
          },
        ]}
      />
      <DataTable rows={rows} columns={columns} rowKey={(o) => o.id} onRowClick={(o) => router.push(`/orders/${o.id}`)} emptyDescription="No orders match your filters." />
    </div>
  );
}
