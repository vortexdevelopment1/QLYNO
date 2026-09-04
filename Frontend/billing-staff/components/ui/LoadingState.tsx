export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-ink-100 bg-white px-5 py-8 text-ink-500" role="status" aria-live="polite">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-200 border-t-brand-500" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
