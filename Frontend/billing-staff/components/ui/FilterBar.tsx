"use client";

export interface FilterOption {
  label: string;
  value: string;
}

export function FilterBar({
  options, active, onChange, ariaLabel = "Filter by status",
}: {
  options: FilterOption[]; active: string; onChange: (v: string) => void; ariaLabel?: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap items-center gap-1.5 sm:gap-2 max-w-full overflow-x-auto no-scrollbar pb-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={active === opt.value}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
            active === opt.value
              ? "border-brand-600 bg-brand-600 text-white"
              : "border-ink-200 bg-white text-ink-600 hover:border-brand-300 hover:text-brand-700"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
