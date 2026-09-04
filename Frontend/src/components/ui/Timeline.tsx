import { cn } from "@/lib/utils/cn";
import { formatDateTime } from "@/lib/utils/format";

export interface TimelineEntry {
  id: string;
  label: string;
  timestamp?: string;
  description?: string;
  tone?: "default" | "success" | "warning" | "critical";
}

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  const toneDot: Record<string, string> = {
    default: "bg-brand-blue",
    success: "bg-status-success",
    warning: "bg-status-warning",
    critical: "bg-status-critical",
  };
  return (
    <ol className="relative ml-2 space-y-5 border-l border-app-border pl-5">
      {entries.map((entry) => (
        <li key={entry.id} className="relative">
          <span
            className={cn("absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-app-surface", toneDot[entry.tone ?? "default"])}
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-text-main">{entry.label}</p>
          {entry.timestamp && <p className="text-xs text-text-muted">{formatDateTime(entry.timestamp)}</p>}
          {entry.description && <p className="mt-0.5 text-xs text-text-muted">{entry.description}</p>}
        </li>
      ))}
    </ol>
  );
}

export function AuditTimeline({ entries }: { entries: { id: string; action: string; actor: string; timestamp: string }[] }) {
  return (
    <Timeline
      entries={entries.map((e) => ({
        id: e.id,
        label: e.action,
        timestamp: e.timestamp,
        description: `by ${e.actor}`,
      }))}
    />
  );
}
