"use client";

import Link from "next/link";
import { EntityHeader } from "@/components/ui/EntityHeader";
import { IntegrationStatusCard } from "@/components/domain/IntegrationStatusCard";
import { MOCK_INTEGRATIONS } from "@/data/mock/integrations";

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <EntityHeader
        eyebrow="Module 12 · Analytics & Administration"
        title="Integrations"
        subtitle="Mock connectivity status for HIS/EMR, analyzers, printers, reference labs, payments, messaging and SSO."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_INTEGRATIONS.map((i) => (
          <IntegrationStatusCard key={i.id} integration={i} />
        ))}
      </div>
      <p className="text-xs text-text-muted">
        Hospital central billing status has a dedicated view: <Link href="/integrations/hms-billing" className="font-medium text-brand-blue hover:underline">Integrations → HMS Billing</Link>.
      </p>
    </div>
  );
}
