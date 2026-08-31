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
    <div className="mb-6 flex flex-col gap-4 border-b border-ink-100 pb-5 sm:flex-row sm:items-start sm:justify-between min-w-0">
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-bold tracking-tight text-ink-900 sm:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-xs font-medium text-ink-500 sm:text-sm max-w-3xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:self-start">
          {actions}
        </div>
      )}
    </div>
  );
}
