"use client";

import { useMemo } from "react";
import { useApp } from "@/billing-staff/context/AppContext";
import { PageHeader } from "@/billing-staff/components/ui/PageHeader";
import { DataTable, Column } from "@/billing-staff/components/ui/DataTable";
import { PermissionGuard } from "@/billing-staff/components/billing/PermissionGuard";
import { ServiceCatalogItem } from "@/billing-staff/types";
import { formatINR } from "@/billing-staff/lib/utils";

const CATEGORY_LABEL: Record<string, string> = {
  opd: "OPD", ipd: "IPD", diagnostics: "Diagnostics", pharmacy: "Pharmacy", surgery: "Surgery", consultation: "Consultation", other: "Other",
};

export default function ServicesPage() {
  const { currentOrg, currentUser, serviceCatalog } = useApp();
  const orgCatalog = useMemo(() => serviceCatalog.filter((s) => s.organizationId === currentOrg.id), [serviceCatalog, currentOrg.id]);

  const columns: Column<ServiceCatalogItem>[] = [
    { header: "Service", accessor: (r) => <span className="font-medium text-ink-800">{r.name}</span> },
    { header: "Category", accessor: (r) => CATEGORY_LABEL[r.category] },
    { header: "Rate", accessor: (r) => formatINR(r.rate) },
    { header: "Tax", accessor: (r) => `${r.taxPercent}%` },
  ];

  return (
    <div>
      <PageHeader title="Services" description="Configured billable services and tariffs for this organization." />
      <PermissionGuard permission="viewBills">
        <DataTable columns={columns} rows={orgCatalog} rowKey={(r) => r.id} emptyTitle="No services configured" />
        {!currentUser.permissions.billingSettings && (
          <p className="mt-3 text-xs text-ink-400">Service pricing is configured by an authorized admin in Settings.</p>
        )}
      </PermissionGuard>
    </div>
  );
}
