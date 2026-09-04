"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { BillingGuard } from "@/components/domain/BillingGuard";
import { DataTable } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { MOCK_CONTRACTS } from "@/data/mock/billing";
import { formatCurrencyINR } from "@/lib/utils/format";

export default function ContractsPage() {
  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 10 · Commercial & Billing" title="Client Contracts" subtitle="Rate cards, credit limits and credit terms for B2B / reference clients." />
      <BillingGuard>
        <DataTable
          rows={MOCK_CONTRACTS}
          rowKey={(c) => c.id}
          columns={[
            { key: "client", header: "Client", render: (c) => <span className="font-medium">{c.clientName}</span> },
            { key: "rate", header: "Rate card", render: (c) => c.rateCardVersion },
            { key: "limit", header: "Credit limit", render: (c) => formatCurrencyINR(c.creditLimit) },
            { key: "terms", header: "Credit terms", render: (c) => `${c.creditTermsDays} days` },
            { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
          ]}
        />
      </BillingGuard>
    </div>
  );
}
