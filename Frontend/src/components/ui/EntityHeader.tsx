export function EntityHeader({
  eyebrow,
  title,
  subtitle,
  badges,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  badges?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-app-border pb-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-text-muted">{eyebrow}</p>}
        <h1 className="mt-1 truncate font-display text-[30px] font-semibold leading-tight text-text-main">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-text-muted">{subtitle}</p>}
        {badges && <div className="mt-2 flex flex-wrap gap-2">{badges}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
