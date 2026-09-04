"use client";

import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { formatDateTime } from "@/lib/utils/format";
import type { IntegrationEvent } from "@/lib/types/domain";

export function IntegrationStatusCard({ integration }: { integration: IntegrationEvent }) {
  const { showToast } = useToast();
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-text-main">{integration.system}</p>
          <p className="text-xs text-text-muted">{integration.category.replace(/_/g, " ")}</p>
        </div>
        <StatusBadge status={integration.status} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-text-muted">Last sync</dt>
          <dd className="font-medium text-text-main">{formatDateTime(integration.lastSync)}</dd>
        </div>
        <div>
          <dt className="text-text-muted">Error count</dt>
          <dd className={`font-medium ${integration.errorCount > 0 ? "text-status-critical" : "text-text-main"}`}>{integration.errorCount}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-text-muted">Mapping version</dt>
          <dd className="font-medium text-text-main">{integration.mappingVersion}</dd>
        </div>
      </dl>
      <Button
        size="sm"
        variant="outline"
        className="mt-3 w-full justify-center"
        onClick={() => showToast({ title: "Simulated log viewer", description: `${integration.system} has no real connection in this prototype.`, tone: "info" })}
      >
        View logs
      </Button>
    </Card>
  );
}
