"use client";

import { UserCog } from "lucide-react";
import { useDemo } from "@/state/demo-context";
import { ROLE_LIST } from "@/config/roles";
import type { RoleId } from "@/lib/types/domain";

export function RoleSwitcher() {
  const { roleId, setRoleId } = useDemo();
  return (
    <label className="flex items-center gap-1.5" title="Prototype role switcher — simulates navigation & permissions only">
      <span className="sr-only">Switch prototype role</span>
      <UserCog className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
      <select
        value={roleId}
        onChange={(e) => setRoleId(e.target.value as RoleId)}
        className="h-9 max-w-[170px] truncate rounded-control border border-app-border bg-white px-2 text-xs font-medium text-text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue sm:max-w-none sm:text-sm"
      >
        {ROLE_LIST.map((r) => (
          <option key={r.id} value={r.id}>
            {r.label}
          </option>
        ))}
      </select>
    </label>
  );
}
