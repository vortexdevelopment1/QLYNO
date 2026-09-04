"use client";

import { Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { useToast } from "@/components/ui/Toast";
import { useCurrentRole } from "@/state/demo-context";

export function QuickCreateMenu() {
  const role = useCurrentRole();
  const { showToast } = useToast();
  const actions = role.quickActions.length > 0 ? role.quickActions : ["Register order"];

  return (
    <Dropdown
      label="Quick create menu"
      trigger={({ toggle }) => (
        <Button size="sm" variant="secondary" onClick={toggle} aria-haspopup="menu">
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Quick create</span>
          <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      )}
    >
      {(close) => (
        <>
          <p className="px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">For {role.label}</p>
          {actions.map((action) => (
            <DropdownItem
              key={action}
              onClick={() => {
                showToast({ title: `${action} (simulated)`, description: "This is a client-side demo action.", tone: "info" });
                close();
              }}
            >
              {action}
            </DropdownItem>
          ))}
        </>
      )}
    </Dropdown>
  );
}
