"use client";

import { Ban } from "lucide-react";
import { useDemo } from "@/state/demo-context";
import { TENANT_MODE_CONFIG } from "@/config/tenant-modes";

export function BillingGuard({ children }: { children: React.ReactNode }) {
  const { billingEnabled, tenantMode } = useDemo();

  if (!billingEnabled) {
    return (
      <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-app-border bg-app-surface px-6 py-16 text-center">
        <Ban className="h-8 w-8 text-text-muted" aria-hidden="true" />
        <p className="mt-3 text-sm font-semibold text-text-main">LIS billing is not enabled for this tenant mode</p>
        <p className="mt-1 max-w-sm text-xs text-text-muted">
          The current tenant is in <span className="font-medium text-text-main">{TENANT_MODE_CONFIG[tenantMode].label}</span> mode. Hospital billing status can be found under Administration → Integrations → HMS Billing.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
