"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/hospital-admin/store/store";
import {
  Key,
  Lock,
  RefreshCw,
  Plus,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Webhook,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Input } from "@/hospital-admin/components/ui/input";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/hospital-admin/components/ui/card";
import { IntegrationsNav } from "@/hospital-admin/components/integrations/integrations-nav";
import { RotateApiKeyModal } from "@/hospital-admin/components/integrations/RotateApiKeyModal";
import { ConfigureWebhookModal } from "@/hospital-admin/components/integrations/ConfigureWebhookModal";
import { rotateApiKey, addApiKey, addWebhookLog } from "@/hospital-admin/store/slices/integrationsSlice";
import { ApiKeyRecord } from "@/hospital-admin/lib/types/integrations";
import { mockApiKeys } from "@/hospital-admin/lib/mock-data/integrations";

export default function ApiManagementPage() {
  const dispatch = useDispatch<AppDispatch>();
  const apiKeys = useSelector(
    (s: RootState) => s.integrations?.apiKeys || mockApiKeys
  );

  const [selectedKeyForRotation, setSelectedKeyForRotation] =
    useState<ApiKeyRecord | null>(null);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);

  const handleRotate = (keyId: string, newMaskedKey: string) => {
    dispatch(rotateApiKey({ id: keyId, newMaskedKey }));
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
        payloadSummary: `New webhook registered: ${config.endpointUrl}`,
      })
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                Security & Access Substrate
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                API Management, Credentials & Webhook Endpoints
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Cryptographic key management, rate limits, token rotation, and webhook endpoint configuration — protected by PDF Module 14 security step-up patterns.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsWebhookModalOpen(true)}
              className="h-8 gap-1 text-xs"
            >
              <Webhook className="h-3.5 w-3.5" />
              Configure Ingress Webhook
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Menu */}
      <IntegrationsNav />

      {/* Main Body */}
      <div className="flex-1 space-y-6 p-6">
        {/* Security Alert */}
        <div className="rounded-lg border border-border/80 bg-muted/30 p-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-rose-500 shrink-0" />
            <div>
              <span className="font-semibold text-foreground block">
                Rule CANNOT-7 & 10 Enforced: Zero Plaintext Credential Exposure
              </span>
              <p className="text-muted-foreground text-[11px]">
                Raw API secrets are never stored or rendered in plaintext in the user interface. Generating or rotating a key requires step-up administrative verification.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono shrink-0">
            Step-Up MFA Active
          </Badge>
        </div>

        {/* API Keys Table */}
        <Card className="border-border/80 shadow-sm bg-card">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Key className="h-4 w-4 text-primary" />
                  <span>Authorized Hospital API Credential Substrate</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Active authentication tokens and rate-limiting thresholds across integration modules.
                </CardDescription>
              </div>

              <Badge variant="outline" className="text-xs font-mono">
                {apiKeys.length} Keys Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="rounded-lg border border-border/80 p-3.5 bg-card flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="font-mono text-[10px] font-bold">
                        {key.id}
                      </Badge>
                      <Badge
                        className={`text-[10px] ${
                          key.environment === "Production"
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                        }`}
                      >
                        {key.environment}
                      </Badge>
                      <span className="font-semibold text-foreground text-xs">{key.serviceName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground">Masked Token:</span>
                      <span className="font-mono text-foreground bg-muted/60 px-2 py-0.5 rounded text-[11px]">
                        {key.keyMasked}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground font-mono">
                      <span>Rate Limit: {key.rateLimitPerMin} req/min</span>
                      <span>•</span>
                      <span>Last Rotated: {key.lastRotatedAt}</span>
                      <span>•</span>
                      <span>Expires: {key.expiresAt}</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedKeyForRotation(key)}
                    className="h-8 text-xs gap-1 border-rose-500/30 text-rose-600 hover:bg-rose-500/10 shrink-0"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Rotate Key
                  </Button>
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
        onRotate={handleRotate}
      />

      <ConfigureWebhookModal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
        onSave={handleSaveWebhook}
      />
    </div>
  );
}
