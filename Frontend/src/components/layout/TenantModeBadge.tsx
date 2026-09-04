"use client";

import { Building2 } from "lucide-react";
import { useDemo } from "@/state/demo-context";
import { TENANT_MODE_CONFIG } from "@/config/tenant-modes";

export function TenantModeBadge() {
  const { tenantMode } = useDemo();
  const config = TENANT_MODE_CONFIG[tenantMode];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-app-border bg-app-sidebar px-2.5 py-1 text-[11px] font-medium text-text-muted"
      title={config.description}
    >
      <Building2 className="h-3 w-3" aria-hidden="true" />
      {config.label}
    </span>
  );
}
