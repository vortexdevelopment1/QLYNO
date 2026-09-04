"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/hospital-admin/store/store";
import {
  MessageSquare,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Clock,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/hospital-admin/components/ui/card";
import { IntegrationsNav } from "@/hospital-admin/components/integrations/integrations-nav";
import { toggleFailover } from "@/hospital-admin/store/slices/integrationsSlice";
import { mockConnectors, mockWebhookEventLogs } from "@/hospital-admin/lib/mock-data/integrations";

export default function WhatsAppTelemetryPage() {
  const dispatch = useDispatch<AppDispatch>();
  const connectors = useSelector(
    (s: RootState) => s.integrations?.connectors || mockConnectors
  );
  const webhookLogs = useSelector(
    (s: RootState) => s.integrations?.webhookLogs || mockWebhookEventLogs
  );

  const whatsappConn = connectors.find((c) => c.category === "WhatsApp") || connectors[0];
  const waLogs = webhookLogs.filter((l) => l.source.toLowerCase().includes("whatsapp"));

  const [isToggling, setIsToggling] = useState(false);

  const handleToggleFailover = () => {
    setIsToggling(true);
    setTimeout(() => {
      dispatch(
        toggleFailover({
          id: whatsappConn.id,
          failoverActive: !whatsappConn.failoverActive,
        })
      );
      setIsToggling(false);
    }, 400);
  };

  const deliveryRate = whatsappConn.uptimePercentage;
  const quotaUsedPercent = (
    (whatsappConn.dailyQuotaUsed / whatsappConn.dailyQuotaLimit) *
    100
  ).toFixed(1);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Technical Telemetry
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                WhatsApp Meta Cloud API Technical Telemetry
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Underlying Meta Graph API pipe for Communication Hub (F23) — monitors webhook latency, delivery receipts (`wamid`), and automated SMS fallback.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              asChild
              className="h-8 gap-1 text-xs"
            >
              <a href="/hospital-admin/care-coordination/communication/whatsapp">
                <span>Open F23 Templates</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>

            <Button
              size="sm"
              disabled={isToggling}
              onClick={handleToggleFailover}
              className={`h-8 gap-1 text-xs ${
                whatsappConn.failoverActive
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              {whatsappConn.failoverActive ? "Failover Active (SMS Fallback)" : "Primary Pipe Active"}
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Menu */}
      <IntegrationsNav />

      {/* Main Body */}
      <div className="flex-1 space-y-6 p-6">
        {/* Status Alert Banner */}
        <div
          className={`rounded-lg p-4 border flex items-center justify-between text-xs ${
            whatsappConn.status === "Degraded"
              ? "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-semibold block">
                API Pipe Status: {whatsappConn.status} (Failover Route: {whatsappConn.failoverTarget})
              </span>
              <p className="text-[11px] opacity-90">
                {whatsappConn.notes || "Meta Graph API webhook operating within normal parameters."}
              </p>
            </div>
          </div>
          <Badge
            variant={whatsappConn.failoverActive ? "default" : "outline"}
            className="text-[10px]"
          >
            {whatsappConn.failoverActive ? "Fallback SMS Engaged" : "Direct WhatsApp Delivery"}
          </Badge>
        </div>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/80 shadow-sm bg-card">
            <CardContent className="p-4">
              <p className="text-[10px] font-medium text-muted-foreground uppercase">Delivery Rate (24h)</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-foreground">{deliveryRate}%</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">SLA Target: &gt; 98.0%</p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm bg-card">
            <CardContent className="p-4">
              <p className="text-[10px] font-medium text-muted-foreground uppercase">Read Receipt Latency</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-foreground">{whatsappConn.latencyMs}</span>
                <span className="text-xs text-muted-foreground">ms</span>
              </div>
              <p className="text-[10px] text-amber-600 mt-1">Meta Mumbai edge degraded</p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm bg-card">
            <CardContent className="p-4">
              <p className="text-[10px] font-medium text-muted-foreground uppercase">Daily Conversation Quota</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-primary">
                  {whatsappConn.dailyQuotaUsed.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground">/ {whatsappConn.dailyQuotaLimit.toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{quotaUsedPercent}% Tier 2 limit used</p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm bg-card">
            <CardContent className="p-4">
              <p className="text-[10px] font-medium text-muted-foreground uppercase">Security Protocol</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-sm font-bold font-mono text-emerald-600">TLS 1.3 • AES-256</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">HMAC-SHA256 signature verified</p>
            </CardContent>
          </Card>
        </div>

        {/* Message Delivery & Status Transition Ledger */}
        <Card className="border-border/80 shadow-sm bg-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span>Technical Delivery Receipt (`wamid`) Event Ledger</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Direct telemetry from Meta Graph webhooks confirming Sent ➔ Delivered ➔ Read status transitions.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="space-y-3">
              {waLogs.map((log) => (
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
