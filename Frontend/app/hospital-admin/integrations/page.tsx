"use client";

import { useState } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/hospital-admin/store/store";
import {
  Webhook,
  MessageSquare,
  CreditCard,
  FlaskConical,
  Pill,
  ShieldCheck,
  Cpu,
  Key,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  Activity,
  CheckCircle2,
  Lock,
  RefreshCw,
  Zap,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Input } from "@/hospital-admin/components/ui/input";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/hospital-admin/components/ui/card";
import { IntegrationsNav } from "@/hospital-admin/components/integrations/integrations-nav";
import { RotateApiKeyModal } from "@/hospital-admin/components/integrations/RotateApiKeyModal";
import { ConfigureWebhookModal } from "@/hospital-admin/components/integrations/ConfigureWebhookModal";
import { TestFailoverModal } from "@/hospital-admin/components/integrations/TestFailoverModal";
import {
  toggleConnectorStatus,
  toggleFailover,
  rotateApiKey,
  addWebhookLog,
} from "@/hospital-admin/store/slices/integrationsSlice";
import {
  ConnectorHealthItem,
  WebhookEventLog,
  ApiKeyRecord,
} from "@/hospital-admin/lib/types/integrations";
import {
  mockConnectors,
  mockWebhookEventLogs,
  mockApiKeys,
  mockIntegrationsAnalyticsSummary,
} from "@/hospital-admin/lib/mock-data/integrations";

export default function IntegrationsOverviewPage() {
  const dispatch = useDispatch<AppDispatch>();
  const connectors = useSelector(
    (s: RootState) => s.integrations?.connectors || mockConnectors
  );
  const webhookLogs = useSelector(
    (s: RootState) => s.integrations?.webhookLogs || mockWebhookEventLogs
  );
  const apiKeys = useSelector(
    (s: RootState) => s.integrations?.apiKeys || mockApiKeys
  );
  const analytics = useSelector(
    (s: RootState) =>
      s.integrations?.analytics || mockIntegrationsAnalyticsSummary
  );

  const [selectedKeyForRotation, setSelectedKeyForRotation] =
    useState<ApiKeyRecord | null>(null);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [selectedConnectorForFailover, setSelectedConnectorForFailover] =
    useState<ConnectorHealthItem | null>(null);

  const handleRotateKey = (keyId: string, newMaskedKey: string) => {
    dispatch(rotateApiKey({ id: keyId, newMaskedKey }));
  };

  const handleToggleFailover = (id: string, active: boolean) => {
    dispatch(toggleFailover({ id, failoverActive: active }));
  };

  const handleSaveWebhook = (config: {
    provider: string;
    endpointUrl: string;
    secretHeader: string;
    retryPolicy: string;
  }) => {
    dispatch(
      addWebhookLog({
        id: `LOG-EVT-${Date.now()}`,
        idempotencyKey: `wh_reg_${Math.random().toString(36).substring(2, 10)}`,
        source: config.provider,
        eventType: "endpoint.registered",
        payloadHash: `sha256:${Math.random().toString(16).substring(2, 18)}`,
        status: "Processed",
        responseCode: 200,
        processedAt: new Date().toISOString().replace("T", " ").substring(0, 19),
        executionTimeMs: 8,
        payloadSummary: `New webhook registered: ${config.endpointUrl} with ${config.retryPolicy}`,
      })
    );
  };

  const categoryCards = [
    {
      title: "WhatsApp Telemetry",
      subtitle: "Technical layer for F23 Communication Hub",
      href: "/hospital-admin/integrations/whatsapp",
      icon: MessageSquare,
      status: connectors.find((c) => c.category === "WhatsApp")?.status || "Healthy",
      metric: "98.4% Delivery (Failover to F23 SMS Active)",
      badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    },
    {
      title: "Payment Gateway",
      subtitle: "Technical layer for F16/F11 Payments & Billing",
      href: "/hospital-admin/integrations/payment-gateway",
      icon: CreditCard,
      status: "Healthy",
      metric: "100% Idempotency Catch Rate • 82ms Latency",
      badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    },
    {
      title: "Lab Interfacing",
      subtitle: "Technical layer for F13 Lab (LIS Analyzers & Ref Labs)",
      href: "/hospital-admin/integrations/lab",
      icon: FlaskConical,
      status: "Healthy",
      metric: "Sysmex, Cobas & Dr. Lal Reference Network Active",
      badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    },
    {
      title: "Pharmacy Scanners",
      subtitle: "Technical layer for F15 Pharmacy (Dispensing Hardware)",
      href: "/hospital-admin/integrations/pharmacy",
      icon: Pill,
      status: "Healthy",
      metric: "4 Dispensing Counters Connected • Drug DB Synced",
      badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    },
    {
      title: "Insurance / TPA Switch",
      subtitle: "Technical layer for F17 Insurance & Cashless Desk",
      href: "/hospital-admin/integrations/insurance-tpa",
      icon: ShieldCheck,
      status: "Healthy",
      metric: "MediBuddy & Star Health Clearinghouse Live",
      badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    },
    {
      title: "External Systems",
      subtitle: "ABDM/ABHA (M1/M2/M3), HL7/FHIR, PACS, GPS & Biometrics",
      href: "/hospital-admin/integrations/external-systems",
      icon: Cpu,
      status: "Healthy",
      metric: "NHA ABDM Certified • PACS C-STORE Connected",
      badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                Technical Substrate (F28)
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                API & Ecosystem Connectivity Hub
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Technical connection infrastructure — manages API credentials, webhook idempotency, TLS 1.3 encryption, connection health, and failover telemetry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedConnectorForFailover(connectors[0])}
              className="h-8 gap-1 text-xs border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
            >
              <Zap className="h-3.5 w-3.5" />
              Failover Simulator
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsWebhookModalOpen(true)}
              className="h-8 gap-1 text-xs"
            >
              <Webhook className="h-3.5 w-3.5" />
              Configure Webhook
            </Button>
            <Button
              size="sm"
              onClick={() => setSelectedKeyForRotation(apiKeys[0])}
              className="h-8 gap-1 text-xs bg-primary text-primary-foreground"
            >
              <Key className="h-3.5 w-3.5" />
              Rotate API Key
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Menu */}
      <IntegrationsNav />

      {/* Main Body */}
      <div className="flex-1 space-y-6 p-6">
        {/* Telemetry KPI Strip */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <Card className="border-border/80 shadow-sm bg-card">
            <CardContent className="p-4">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Connected Pipes</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-foreground">15</span>
                <span className="text-[10px] text-muted-foreground">/ 16 active</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm bg-card">
            <CardContent className="p-4">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Delivery Rate</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-emerald-600">{analytics.webhookDeliveryRatePercent}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm bg-card">
            <CardContent className="p-4">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Daily Traffic</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-foreground">{analytics.dailyApiTrafficCalls}k</span>
                <span className="text-[10px] text-muted-foreground">calls</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm bg-card">
            <CardContent className="p-4">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Avg Latency</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-foreground">{analytics.averageLatencyMs}</span>
                <span className="text-[10px] text-muted-foreground">ms</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm bg-card">
            <CardContent className="p-4">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Idempotency Catch</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-teal-600">{analytics.idempotencyCatchRatePercent}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm bg-card">
            <CardContent className="p-4">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Degraded / Failover</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-amber-600">{analytics.activeFailoverCount}</span>
                <span className="text-[10px] text-amber-600">SMS failover</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Division of Labor Banner */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-primary shrink-0" />
            <div>
              <span className="font-semibold text-foreground block">
                Technical Layer Subordination (Rules CANNOT-1 to 5)
              </span>
              <p className="text-muted-foreground text-[11px]">
                This module owns technical connection health, idempotency verification, and failover telemetry. Business decisions, pricing, clinical reviews, and message dispatch remain fully owned by F23, F16/F11, F13, F15, and F17.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] shrink-0 font-mono">
            TLS 1.3 • AES-256
          </Badge>
        </div>

        {/* Category Connectivity Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categoryCards.map((cat) => {
            const Icon = cat.icon;
            return (
              <Card
                key={cat.title}
                className="border-border/80 shadow-sm bg-card hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold text-foreground">
                          {cat.title}
                        </CardTitle>
                        <p className="text-[10px] text-muted-foreground">{cat.subtitle}</p>
                      </div>
                    </div>

                    <Badge
                      className={`text-[10px] ${
                        cat.status === "Healthy"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/20 animate-pulse"
                      }`}
                    >
                      {cat.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-1 space-y-3">
                  <p className="text-xs text-foreground/90 font-medium">
                    {cat.metric}
                  </p>
                  <div className="pt-2 border-t border-border/60 flex justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      asChild
                      className="h-7 text-xs gap-1 text-primary hover:text-primary"
                    >
                      <Link href={cat.href}>
                        <span>Inspect Pipe Telemetry</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Global Webhook & Idempotency Event Ledger */}
        <Card className="border-border/80 shadow-sm bg-card">
          <CardHeader className="p-4 pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Webhook className="h-4 w-4 text-primary" />
                  <span>Real-Time Webhook Event Stream & Idempotency Ledger</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Inspects unique event signatures (wamid, pay_id, claim_ref) preventing duplicate billing or claim processing.
                </CardDescription>
              </div>

              <Badge variant="outline" className="text-xs font-mono">
                {webhookLogs.length} Verified Events
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4 pt-2">
            <div className="space-y-3">
              {webhookLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-lg border border-border/80 p-3.5 bg-card hover:border-primary/40 transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="font-mono text-[10px] font-bold">
                        {log.idempotencyKey}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {log.source}
                      </Badge>
                      <Badge
                        className={`text-[10px] ${
                          log.status === "Processed"
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : "bg-teal-500/10 text-teal-600 border border-teal-500/20"
                        }`}
                      >
                        {log.status}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        HTTP {log.responseCode} ({log.executionTimeMs}ms)
                      </Badge>
                    </div>

                    <p className="text-xs font-semibold text-foreground">{log.payloadSummary}</p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground font-mono">
                      <span>Hash: {log.payloadHash.substring(0, 32)}...</span>
                      <span>•</span>
                      <span>Processed: {log.processedAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold shrink-0">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Signature Validated</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <RotateApiKeyModal
        isOpen={!!selectedKeyForRotation}
        onClose={() => setSelectedKeyForRotation(null)}
        apiKey={selectedKeyForRotation}
        onRotate={handleRotateKey}
      />

      <ConfigureWebhookModal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
        onSave={handleSaveWebhook}
      />

      <TestFailoverModal
        isOpen={!!selectedConnectorForFailover}
        onClose={() => setSelectedConnectorForFailover(null)}
        connector={selectedConnectorForFailover}
        onToggleFailover={handleToggleFailover}
      />
    </div>
  );
}
