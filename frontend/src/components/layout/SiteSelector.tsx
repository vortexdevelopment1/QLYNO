"use client";

import { MapPin } from "lucide-react";
import { useDemo } from "@/state/demo-context";
import { MOCK_SITES } from "@/data/mock/integrations";

export function SiteSelector({ compact = false }: { compact?: boolean }) {
  const { siteId, setSiteId } = useDemo();
  return (
    <label className="flex items-center gap-1.5">
      <span className="sr-only">Select site or branch</span>
      <MapPin className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
      <select
        value={siteId}
        onChange={(e) => setSiteId(e.target.value)}
        className="h-9 max-w-[180px] truncate rounded-control border border-app-border bg-white px-2 text-xs font-medium text-text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue sm:max-w-none sm:text-sm"
      >
        {MOCK_SITES.map((s) => (
          <option key={s.id} value={s.id}>
            {compact ? s.name.split("—")[0].trim() : s.name}
          </option>
        ))}
      </select>
    </label>
  );
}
