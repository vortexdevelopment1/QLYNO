export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-ink-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="shrink-0">
        <h1 className="text-xl font-bold tracking-tight text-ink-900 sm:text-2xl whitespace-nowrap">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-xs text-ink-500 font-medium sm:text-sm">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
