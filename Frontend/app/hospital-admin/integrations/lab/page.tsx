"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import {
  FlaskConical,
  ExternalLink,
  CheckCircle2,
  Cpu,
  Layers,
  Activity,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/hospital-admin/components/ui/card";
import { IntegrationsNav } from "@/hospital-admin/components/integrations/integrations-nav";
import { mockConnectors, mockWebhookEventLogs } from "@/hospital-admin/lib/mock-data/integrations";

export default function LabIntegrationPage() {
  const connectors = useSelector(
    (s: RootState) => s.integrations?.connectors || mockConnectors
  );
  const webhookLogs = useSelector(
    (s: RootState) => s.integrations?.webhookLogs || mockWebhookEventLogs
  );

  const labConnectors = connectors.filter((c) => c.category === "Lab Integration");
  const labLogs = webhookLogs.filter(
    (l) => l.source.toLowerCase().includes("sysmex") || l.source.toLowerCase().includes("lab")
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-teal-500/10 px-2 py-0.5 text-xs font-semibold text-teal-600 dark:text-teal-400">
                LIS Interfacing
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Laboratory Information System (LIS) & Analyzer Interfacing
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Technical interfacing pipes for automated hematology/biochemistry analyzers (ASTM/HL7) and external reference laboratory networks — feeding Lab (F13).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              asChild
              className="h-8 gap-1 text-xs"
            >
              <a href="/hospital-admin/lab/external">
                <span>Open External Lab Reports</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Menu */}
      <IntegrationsNav />

      {/* Main Body */}
      <div className="flex-1 space-y-6 p-6">
        {/* Active Analyzer Connectors Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {labConnectors.map((conn) => (
            <Card key={conn.id} className="border-border/80 shadow-sm bg-card flex flex-col justify-between">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600">
                      <FlaskConical className="h-4.5 w-4.5" />
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
                <div className="space-y-1 border-t border-border/60 pt-2">
                  <div className="flex justify-between">
                    <span>Interfacing Protocol:</span>
                    <span className="font-mono text-foreground font-semibold">{conn.securityProtocol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Latency:</span>
                    <span className="font-mono text-emerald-600 font-bold">{conn.latencyMs} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Daily Samples Processed:</span>
                    <span className="font-mono text-foreground font-semibold">{conn.dailyQuotaUsed} specs</span>
                  </div>
                </div>

                <div className="p-2 rounded bg-muted/40 font-mono text-[10px] text-foreground border border-border/60 truncate">
                  Socket: {conn.endpointUrl}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Specimen Telemetry & Analyzer Logs */}
        <Card className="border-border/80 shadow-sm bg-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-teal-600" />
              <span>Analyzer Specimen Result Transmission Ledger</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Captures bidirectional barcoded sample queries and raw parameter uploads from automated hospital laboratory analyzers.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="space-y-3">
              {labLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-lg border border-border/80 p-3 bg-card flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-[10px] font-bold">
                        {log.idempotencyKey}
                      </Badge>
                      <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px]">
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
