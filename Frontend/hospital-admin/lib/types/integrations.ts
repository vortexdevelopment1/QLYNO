export type IntegrationCategory =
  | "WhatsApp"
  | "Payment Gateway"
  | "Lab Integration"
  | "Pharmacy"
  | "Insurance / TPA"
  | "External Systems"
  | "API";

export type ConnectionStatus = "Healthy" | "Degraded" | "Down" | "Maintenance";

export type IdempotencyStatus =
  | "Processed"
  | "Duplicate Ignored (Idempotent)"
  | "Signature Failed"
  | "Retrying";

export interface ConnectorHealthItem {
  id: string;
  name: string;
  category: IntegrationCategory;
  provider: string; // e.g. 'Meta Graph API', 'Razorpay', 'Sysmex LIS', 'MediBuddy TPA', 'NDHM ABDM'
  status: ConnectionStatus;
  uptimePercentage: number; // e.g. 99.98
  latencyMs: number; // e.g. 142
  dailyQuotaUsed: number;
  dailyQuotaLimit: number;
  lastPingAt: string;
  endpointUrl: string; // masked URL
  failoverActive: boolean;
  failoverTarget?: string;
  securityProtocol: string; // e.g. 'TLS 1.3 • AES-256'
  signatureVerified: boolean;
  notes?: string;
}

export interface WebhookEventLog {
  id: string;
  idempotencyKey: string; // wamid_..., pay_..., claim_ref_...
  source: string;
  eventType: string; // message.delivered, payment.captured, claim.query_raised, etc.
  payloadHash: string;
  status: IdempotencyStatus;
  responseCode: number;
  processedAt: string;
  executionTimeMs: number;
  payloadSummary: string;
}

export interface ApiKeyRecord {
  id: string;
  serviceName: string;
  keyMasked: string; // e.g. qlyno_live_98a...b72f
  scope: string;
  rateLimitPerMin: number;
  createdAt: string;
  lastRotatedAt: string;
  expiresAt: string;
  environment: "Production" | "Staging Sandbox";
  isActive: boolean;
}

export interface ABDMMilestoneStatus {
  milestone: "M1" | "M2" | "M3";
  title: string;
  description: string;
  status: "Certified & Active" | "In Sandbox Testing" | "Pending NHA Verification";
  lastAuditDate: string;
  registeredHipId: string;
  recordsPushedCount: number;
}

export interface IntegrationsAnalyticsSummary {
  totalConnectedPipes: number;
  healthyPipesCount: number;
  degradedPipesCount: number;
  dailyApiTrafficCalls: number; // in thousands
  averageLatencyMs: number;
  webhookDeliveryRatePercent: number;
  idempotencyCatchRatePercent: number;
  activeFailoverCount: number;
}
