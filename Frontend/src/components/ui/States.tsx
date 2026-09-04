import { AlertOctagon, Inbox } from "lucide-react";
import { Button } from "./Button";

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
}: {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-app-border bg-app-surface px-6 py-12 text-center">
      <Icon className="h-8 w-8 text-text-muted" aria-hidden="true" />
      <p className="mt-3 text-sm font-semibold text-text-main">{title}</p>
      {description && <p className="mt-1 max-w-sm text-xs text-text-muted">{description}</p>}
      {action && (
        <Button size="sm" variant="secondary" className="mt-4" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "This is a simulated error state for the frontend prototype.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-red-200 bg-red-50 px-6 py-12 text-center">
      <AlertOctagon className="h-8 w-8 text-status-critical" aria-hidden="true" />
      <p className="mt-3 text-sm font-semibold text-text-main">{title}</p>
      <p className="mt-1 max-w-sm text-xs text-text-muted">{description}</p>
      {onRetry && (
        <Button size="sm" variant="outline" className="mt-4" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

export function LoadingSkeleton({ rows = 4, className = "" }: { rows?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`} role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-11 w-full animate-pulse rounded-lg bg-app-bg motion-reduce:animate-none" />
      ))}
    </div>
  );
}
