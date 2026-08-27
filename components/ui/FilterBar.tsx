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
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={active === opt.value}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
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
