"use client";

import { notFound } from "next/navigation";
import { EntityHeader } from "@/components/ui/EntityHeader";
import { Tabs } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";
import { MOCK_CLIENT_ORGS } from "@/data/mock/patients";
import { MOCK_ORDERS } from "@/data/mock/orders";
import { MOCK_CONTRACTS, MOCK_INVOICES } from "@/data/mock/billing";
import { useDemo } from "@/state/demo-context";
import { formatCurrencyINR, formatDateTime } from "@/lib/utils/format";

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const client = MOCK_CLIENT_ORGS.find((c) => c.id === id);
  if (!client) notFound();

  const { billingEnabled } = useDemo();
  const orders = MOCK_ORDERS.filter((o) => o.clientOrgId === client.id);
  const contract = MOCK_CONTRACTS.find((c) => c.clientOrgId === client.id);
  const invoices = MOCK_INVOICES.filter((i) => i.clientOrgId === client.id);

  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 2 · Patients & Network" title={client.name} subtitle={`${client.contactPerson} · ${client.contactEmail}`} />
      <Tabs
        items={[
          {
            id: "overview", label: "Overview",
            content: (
              <Card className="p-5">
                <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Row label="Organization type" value={client.type.replace(/_/g, " ")} />
                  <Row label="Contact person" value={client.contactPerson} />
                  <Row label="Contact email" value={client.contactEmail} />
                  <Row label="Contract" value={client.contractId ?? "None"} />
                </dl>
              </Card>
            ),
          },
          {
            id: "orders", label: "Orders",
            content: (
              <DataTable
                rows={orders}
                rowKey={(o) => o.id}
                columns={[
                  { key: "id", header: "Order ID", render: (o) => o.id },
                  { key: "patient", header: "Patient", render: (o) => o.patientName },
                  { key: "status", header: "Status", render: (o) => <StatusBadge status={o.status} /> },
                  { key: "placed", header: "Placed", render: (o) => formatDateTime(o.placedAt) },
                ]}
                emptyDescription="No orders linked to this organization yet."
              />
            ),
          },
          {
            id: "contract", label: "Contract Summary",
            content:
              billingEnabled && contract ? (
                <Card className="p-5">
                  <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Row label="Rate card version" value={contract.rateCardVersion} />
                    <Row label="Credit limit" value={formatCurrencyINR(contract.creditLimit)} />
                    <Row label="Credit terms" value={`${contract.creditTermsDays} days`} />
                    <Row label="Status" value={<StatusBadge status={contract.status} />} />
                  </dl>
                </Card>
              ) : (
                <EmptyState title="Contract summary unavailable" description="Contracts and rate cards only apply to B2B/reference or hybrid billing modes." />
              ),
          },
          {
            id: "invoices", label: "Invoices / Statements",
            content: billingEnabled ? (
              <DataTable
                rows={invoices}
                rowKey={(i) => i.id}
                columns={[
                  { key: "id", header: "Invoice", render: (i) => i.id },
                  { key: "amount", header: "Amount", render: (i) => formatCurrencyINR(i.amount) },
                  { key: "status", header: "Status", render: (i) => <StatusBadge status={i.status} /> },
                  { key: "issued", header: "Issued", render: (i) => formatDateTime(i.issuedAt) },
                ]}
                emptyDescription="No invoices issued to this organization yet."
              />
            ) : (
              <EmptyState title="Billing not enabled" description="LIS billing is disabled for the current tenant mode." />
            ),
          },
        ]}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-text-muted">{label}</dt>
      <dd className="text-sm font-medium text-text-main">{value}</dd>
    </div>
  );
}
