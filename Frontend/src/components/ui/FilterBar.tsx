"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

export interface SelectFilter {
  id: string;
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
}: {
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  filters?: SelectFilter[];
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center gap-2">
        {onSearchChange && (
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
            <input
              type="search"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="h-10 w-full rounded-control border border-app-border bg-white pl-9 pr-3 text-sm text-text-main placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
            />
          </div>
        )}
        <div className="hidden flex-wrap items-center gap-2 sm:flex">
          {filters.map((f) => (
            <label key={f.id} className="flex items-center gap-1.5">
              <span className="sr-only">{f.label}</span>
              <select
                value={f.value}
                onChange={(e) => f.onChange(e.target.value)}
                className="h-10 rounded-control border border-app-border bg-white px-3 text-sm text-text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
              >
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {f.label}: {o.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        {filters.length > 0 && (
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-10 items-center gap-1.5 rounded-control border border-app-border bg-white px-3 text-sm text-text-main sm:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
            aria-expanded={mobileOpen}
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Filters
          </button>
        )}
      </div>
      {filters.length > 0 && (
        <div className={cn("mt-2 flex flex-col gap-2 sm:hidden", mobileOpen ? "flex" : "hidden")}>
          {filters.map((f) => (
            <label key={f.id} className="flex flex-col gap-1 text-xs font-medium text-text-muted">
              {f.label}
              <select
                value={f.value}
                onChange={(e) => f.onChange(e.target.value)}
                className="h-10 rounded-control border border-app-border bg-white px-3 text-sm text-text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
              >
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
