"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  badge?: React.ReactNode;
}

export function Tabs({ items, defaultTabId }: { items: TabItem[]; defaultTabId?: string }) {
  const [active, setActive] = useState(defaultTabId ?? items[0]?.id);
  const activeItem = items.find((i) => i.id === active) ?? items[0];

  return (
    <div>
      <div role="tablist" aria-label="Section tabs" className="scrollbar-none flex gap-1 overflow-x-auto border-b border-app-border">
        {items.map((item) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={active === item.id}
            onClick={() => setActive(item.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue",
              active === item.id
                ? "border-brand-blue text-brand-blue"
                : "border-transparent text-text-muted hover:text-text-main"
            )}
          >
            {item.label}
            {item.badge}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="pt-4">
        {activeItem?.content}
      </div>
    </div>
  );
}
