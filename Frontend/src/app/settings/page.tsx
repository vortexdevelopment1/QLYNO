"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { Card } from "@/components/ui/Card";
import { useDemo } from "@/state/demo-context";
import { TENANT_MODE_CONFIG } from "@/config/tenant-modes";
import { ROLE_CONFIG } from "@/config/roles";
import { MOCK_SITES } from "@/data/mock/integrations";

export default function SettingsPage() {
  const { tenantMode, roleId, siteId, billingEnabled } = useDemo();

  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 12 · Analytics & Administration" title="Settings" subtitle="Current prototype demo-state summary and localization preferences." />
      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold text-text-main">Active demo state</h3>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div><dt className="text-xs text-text-muted">Tenant mode</dt><dd className="text-sm font-medium">{TENANT_MODE_CONFIG[tenantMode].label}</dd></div>
          <div><dt className="text-xs text-text-muted">Billing enabled</dt><dd className="text-sm font-medium">{billingEnabled ? "Yes" : "No"}</dd></div>
          <div><dt className="text-xs text-text-muted">Active role</dt><dd className="text-sm font-medium">{ROLE_CONFIG[roleId].label}</dd></div>
          <div><dt className="text-xs text-text-muted">Active site</dt><dd className="text-sm font-medium">{MOCK_SITES.find((s) => s.id === siteId)?.name}</dd></div>
        </dl>
      </Card>
      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold text-text-main">Localization</h3>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div><dt className="text-xs text-text-muted">Locale</dt><dd className="text-sm font-medium">en-IN</dd></div>
          <div><dt className="text-xs text-text-muted">Currency</dt><dd className="text-sm font-medium">INR (₹)</dd></div>
          <div><dt className="text-xs text-text-muted">Date format</dt><dd className="text-sm font-medium">DD MMM YYYY</dd></div>
          <div><dt className="text-xs text-text-muted">Timezone</dt><dd className="text-sm font-medium">Asia/Kolkata (UTC+5:30)</dd></div>
        </dl>
      </Card>
      <p className="text-xs text-text-muted">Tenant mode, role and site can be changed from the topbar&apos;s Demo controls menu and role/site selectors — this settings page reflects the current selection.</p>
    </div>
  );
}
