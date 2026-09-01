"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { formatINR, formatDate } from "@/lib/utils";
import { filterPendingByAccess } from "@/lib/selectors";
import { PendingBillingItem } from "@/types";
import { NewInvoiceModal } from "@/components/billing/NewInvoiceModal";
import { PermissionGuard } from "@/components/billing/PermissionGuard";
import { ReceptionHandOffTab } from "@/components/billing/ReceptionHandOffTab";

const SOURCE_LABEL: Record<string, string> = {
  doctor_opd: "Doctor / OPD", diagnostics: "Diagnostics", pharmacy: "Pharmacy", ipd: "IPD", surgery: "Surgery", other: "Other Services",
};

export default function PendingBillingPage() {
  const { currentOrg, currentUser, pendingBillingItems, patients, encounters } = useApp();
  const [invoiceModal, setInvoiceModal] = useState<PendingBillingItem | PendingBillingItem[] | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "reception">("pending");

  const items = useMemo(
    () => filterPendingByAccess(pendingBillingItems, currentOrg.id, currentUser.scopes).filter((i) => i.status === "pending"),
    [pendingBillingItems, currentOrg.id, currentUser.scopes]
  );

  function toggleSelectItem(item: PendingBillingItem) {
    setSelectedItemIds((prev) => {
      const isSelected = prev.includes(item.id);
      const next = isSelected ? prev.filter((x) => x !== item.id) : [...prev, item.id];
      if (next.length === 0) {
        setSelectedPatientId(null);
      } else if (!selectedPatientId) {
        setSelectedPatientId(item.patientId);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    const targetPatientId = selectedPatientId ?? items[0]?.patientId;
    if (!targetPatientId) return;
    const targetItems = items.filter((i) => i.patientId === targetPatientId);
    const targetIds = targetItems.map((i) => i.id);
    const allTargetSelected = targetIds.every((id) => selectedItemIds.includes(id));

    if (allTargetSelected) {
      const next = selectedItemIds.filter((id) => !targetIds.includes(id));
      setSelectedItemIds(next);
      if (next.length === 0) setSelectedPatientId(null);
    } else {
      const next = Array.from(new Set([...selectedItemIds, ...targetIds]));
      setSelectedItemIds(next);
      setSelectedPatientId(targetPatientId);
    }
  }

  const targetPatientId = selectedPatientId ?? items[0]?.patientId;
  const targetItems = targetPatientId ? items.filter((i) => i.patientId === targetPatientId) : [];
  const isHeaderChecked = targetItems.length > 0 && targetItems.every((i) => selectedItemIds.includes(i.id));

  const columns: Column<PendingBillingItem>[] = [
    {
      header: (
        <input
          type="checkbox"
          checked={isHeaderChecked}
          onChange={toggleSelectAll}
          title="Select all items for the current patient"
          className="rounded border-ink-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
        />
      ),
      accessor: (r) => {
        const isRowDisabled = selectedPatientId !== null && r.patientId !== selectedPatientId;
        return (
          <input
            type="checkbox"
            checked={selectedItemIds.includes(r.id)}
            disabled={isRowDisabled}
            onChange={() => toggleSelectItem(r)}
            title={isRowDisabled ? "Select pending items for one patient at a time to combine into an invoice" : undefined}
            className={`rounded border-ink-300 text-brand-600 focus:ring-brand-500 ${isRowDisabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
          />
        );
      },
    },
    { header: "Patient", accessor: (r) => { const p = patients.find((x) => x.id === r.patientId); return <span>{p?.name}<span className="block text-xs text-ink-400">{p?.uhid}</span></span>; } },
    { header: "Encounter", accessor: (r) => { const e = encounters.find((x) => x.id === r.encounterId); return e ? `${e.type.toUpperCase()} · ${e.department}` : "—"; } },
    { header: "Source", accessor: (r) => SOURCE_LABEL[r.source] },
    { header: "Date", accessor: (r) => formatDate(r.date) },
    { header: "Amount", accessor: (r) => formatINR(r.amount) },
    {
      header: "Action",
      accessor: (r) => (
        <div className="flex gap-2">
          <button onClick={() => setInvoiceModal(r)} className="rounded-md bg-brand-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-brand-700">Create Invoice</button>
          <Link href={`/patients/${r.patientId}`} className="rounded-md border border-ink-200 px-2.5 py-1 text-xs font-medium text-ink-600 hover:bg-ink-50">View Patient</Link>
        </div>
      ),
    },
  ];

  const selectedPatientName = selectedPatientId ? patients.find((p) => p.id === selectedPatientId)?.name : null;
  const selectedItems = items.filter((i) => selectedItemIds.includes(i.id));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Pending Billing &amp; Module Handoffs"
        description="Billable events generated by clinical/reception modules waiting to be invoiced. Billing Staff cannot modify underlying clinical records."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {selectedItemIds.length > 0 && (
              <button
                onClick={() => setInvoiceModal(selectedItems)}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-700"
              >
                + Create Combined Invoice{selectedPatientName ? ` for ${selectedPatientName}` : ""} ({selectedItemIds.length})
              </button>
            )}
            <div className="flex overflow-hidden rounded-lg border border-ink-200 bg-white">
              <button
                onClick={() => setActiveTab("pending")}
                className={`px-3 py-1.5 text-xs font-medium ${activeTab === "pending" ? "bg-brand-600 text-white" : "text-ink-600 hover:bg-ink-50"}`}
              >
                Pending Billable ({items.length})
              </button>
              <button
                onClick={() => setActiveTab("reception")}
                className={`px-3 py-1.5 text-xs font-medium ${activeTab === "reception" ? "bg-brand-600 text-white" : "text-ink-600 hover:bg-ink-50"}`}
              >
                Reception Hand-off Matrix
              </button>
            </div>
          </div>
        }
      />
      <PermissionGuard permission="viewBills">
        {activeTab === "pending" ? (
          <>
            <div className="rounded-lg border border-ink-200 bg-ink-50 p-2.5 text-xs text-ink-600 flex items-center justify-between">
              <div>
                💡 <span className="font-semibold text-ink-800">Service Policy:</span> Independent external lab &amp; pharmacy services are billed separately unless integrated. Select items below to generate a combined invoice.
              </div>
              {selectedItemIds.length > 0 && (
                <span className="shrink-0 font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                  {selectedItemIds.length} item(s) selected {selectedPatientName ? `(${selectedPatientName})` : ""}
                </span>
              )}
            </div>
            <DataTable columns={columns} rows={items} rowKey={(r) => r.id} emptyTitle="Nothing pending" emptyDescription="All billable events for your scope have been invoiced." />
          </>
        ) : (
          <ReceptionHandOffTab />
        )}
      </PermissionGuard>
      <NewInvoiceModal
        open={!!invoiceModal}
        onClose={() => {
          setInvoiceModal(null);
          setSelectedItemIds([]);
          setSelectedPatientId(null);
        }}
        prefillPending={invoiceModal ?? undefined}
      />
    </div>
  );
}

