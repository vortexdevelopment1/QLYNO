"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import {
  CreditCard,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Lock,
  Clock,
  Layers,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/hospital-admin/components/ui/card";
import { IntegrationsNav } from "@/hospital-admin/components/integrations/integrations-nav";
import { mockConnectors, mockWebhookEventLogs } from "@/hospital-admin/lib/mock-data/integrations";

export default function PaymentGatewayIntegrationPage() {
  const connectors = useSelector(
    (s: RootState) => s.integrations?.connectors || mockConnectors
  );
  const webhookLogs = useSelector(
    (s: RootState) => s.integrations?.webhookLogs || mockWebhookEventLogs
  );

  const paymentConnectors = connectors.filter((c) => c.category === "Payment Gateway");
  const paymentLogs = webhookLogs.filter(
    (l) => l.source.toLowerCase().includes("razorpay") || l.source.toLowerCase().includes("upi")
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Financial Telemetry
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Payment Gateway & Banking Webhook Telemetry
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Technical connection layer for Razorpay, UPI Dynamic QR, and POS smart terminals — enforces `pay_id` idempotency and cryptographic signature validation before feeding Payments (F16) & Billing (F11).
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            asChild
            className="h-8 gap-1 text-xs"
          >
            <a href="/hospital-admin/payments/online">
              <span>Open Payments Ledger</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </div>

      {/* Navigation Sub-Menu */}
      <IntegrationsNav />

      {/* Main Body */}
      <div className="flex-1 space-y-6 p-6">
        {/* Active Gateway Connectors Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {paymentConnectors.map((conn) => (
            <Card key={conn.id} className="border-border/80 shadow-sm bg-card">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                      <CreditCard className="h-4.5 w-4.5" />
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
                    <span>Uptime (30d):</span>
                    <span className="font-bold text-foreground font-mono block">
                      {conn.uptimePercentage}%
                    </span>
                  </div>
                  <div>
                    <span>Average Latency:</span>
                    <span className="font-mono text-emerald-600 font-bold block">
                      {conn.latencyMs} ms
                    </span>
                  </div>
                  <div>
                    <span>Encryption:</span>
                    <span className="font-mono text-foreground block">{conn.securityProtocol}</span>
                  </div>
                  <div>
                    <span>Daily Volume:</span>
                    <span className="font-mono text-foreground block">
                      {conn.dailyQuotaUsed.toLocaleString()} / {conn.dailyQuotaLimit.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="p-2 rounded bg-muted/40 font-mono text-[11px] text-foreground border border-border/60 truncate">
                  Endpoint: {conn.endpointUrl}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Idempotency & Webhook Ledger */}
        <Card className="border-border/80 shadow-sm bg-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Payment Idempotency (`pay_id`) Validation Ledger</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Prevents duplicate payment reconciliation in hospital accounts when network retries occur.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="space-y-3">
              {paymentLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-lg border border-border/80 p-3 bg-card flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-[10px] font-bold">
                        {log.idempotencyKey}
                      </Badge>
                      <Badge
                        className={`text-[10px] ${
                          log.status === "Processed"
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : "bg-teal-500/10 text-teal-600 border border-teal-500/20 font-bold"
                        }`}
                      >
                        {log.status}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        Latency: {log.executionTimeMs}ms
                      </span>
                    </div>
                    <p className="text-foreground text-xs">{log.payloadSummary}</p>
                  </div>

                  <div className="flex items-center gap-3 text-right text-[11px] text-muted-foreground">
                    <span className="font-mono">{log.processedAt}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      HTTP {log.responseCode}
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
