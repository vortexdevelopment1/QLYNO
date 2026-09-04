"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import {
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  Cpu,
  Layers,
  Activity,
  Building2,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/hospital-admin/components/ui/card";
import { IntegrationsNav } from "@/hospital-admin/components/integrations/integrations-nav";
import { mockConnectors, mockWebhookEventLogs } from "@/hospital-admin/lib/mock-data/integrations";

export default function InsuranceTPAIntegrationPage() {
  const connectors = useSelector(
    (s: RootState) => s.integrations?.connectors || mockConnectors
  );
  const webhookLogs = useSelector(
    (s: RootState) => s.integrations?.webhookLogs || mockWebhookEventLogs
  );

  const tpaConnectors = connectors.filter((c) => c.category === "Insurance / TPA");
  const tpaLogs = webhookLogs.filter(
    (l) => l.source.toLowerCase().includes("tpa") || l.source.toLowerCase().includes("claim")
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                Clearinghouse Substrate
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Insurance / TPA Switch Clearinghouse Telemetry
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Technical connection health for Third-Party Administrators (MediBuddy, Star Health, Vidal Health) — enforces `claim_ref` idempotency before ingestion into Insurance/TPA Desk (F17).
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            asChild
            className="h-8 gap-1 text-xs"
          >
            <a href="/hospital-admin/insurance-tpa">
              <span>Open Claims Desk</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </div>

      {/* Navigation Sub-Menu */}
      <IntegrationsNav />

      {/* Main Body */}
      <div className="flex-1 space-y-6 p-6">
        {/* Active TPA Clearinghouse Switch Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {tpaConnectors.map((conn) => (
            <Card key={conn.id} className="border-border/80 shadow-sm bg-card flex flex-col justify-between">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                      <ShieldCheck className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold text-foreground">
                        {conn.name}
                      </CardTitle>
                      <p className="text-[10px] text-muted-foreground font-mono">{conn.provider}</p>
                    </div>
                  </div>

                  <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px]">
                    {conn.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-2.5 text-xs text-muted-foreground">
                <div className="grid grid-cols-2 gap-2 border-t border-border/60 pt-2">
                  <div>
                    <span>Clearinghouse Uptime:</span>
                    <span className="font-bold text-foreground font-mono block">
                      {conn.uptimePercentage}%
                    </span>
                  </div>
                  <div>
                    <span>Latency:</span>
                    <span className="font-mono text-emerald-600 font-bold block">
                      {conn.latencyMs} ms
                    </span>
                  </div>
                  <div>
                    <span>Encryption:</span>
                    <span className="font-mono text-foreground block">{conn.securityProtocol}</span>
                  </div>
                  <div>
                    <span>Pre-Auth Queries:</span>
                    <span className="font-mono text-foreground block">
                      {conn.dailyQuotaUsed} / {conn.dailyQuotaLimit}
                    </span>
                  </div>
                </div>

                <div className="p-2 rounded bg-muted/40 font-mono text-[10px] text-foreground border border-border/60 truncate">
                  Clearinghouse Pipe: {conn.endpointUrl}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Claim Pre-Auth & Query Webhook Ledger */}
        <Card className="border-border/80 shadow-sm bg-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <span>TPA Pre-Auth & Settlement Webhook Ledger (`claim_ref`)</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Prevents duplicate settlement ingestion and logs query notifications from health insurance switches.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="space-y-3">
              {tpaLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-lg border border-border/80 p-3 bg-card flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-[10px] font-bold">
                        {log.idempotencyKey}
                      </Badge>
                      <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[10px]">
                        {log.eventType}
                      </Badge>
                    </div>
                    <p className="text-foreground text-xs">{log.payloadSummary}</p>
                  </div>

                  <div className="flex items-center gap-3 text-right text-[11px] text-muted-foreground">
                    <span className="font-mono">{log.processedAt}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      HTTP {log.responseCode} ({log.executionTimeMs}ms)
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
