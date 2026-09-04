import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ConnectorHealthItem,
  WebhookEventLog,
  ApiKeyRecord,
  ABDMMilestoneStatus,
  IntegrationsAnalyticsSummary,
  ConnectionStatus,
} from "@/hospital-admin/lib/types/integrations";
import {
  mockConnectors,
  mockWebhookEventLogs,
  mockApiKeys,
  mockABDMMilestones,
  mockIntegrationsAnalyticsSummary,
} from "@/hospital-admin/lib/mock-data/integrations";

export interface IntegrationsState {
  connectors: ConnectorHealthItem[];
  webhookLogs: WebhookEventLog[];
  apiKeys: ApiKeyRecord[];
  abdmMilestones: ABDMMilestoneStatus[];
  analytics: IntegrationsAnalyticsSummary;
}

const initialState: IntegrationsState = {
  connectors: mockConnectors,
  webhookLogs: mockWebhookEventLogs,
  apiKeys: mockApiKeys,
  abdmMilestones: mockABDMMilestones,
  analytics: mockIntegrationsAnalyticsSummary,
};

export const integrationsSlice = createSlice({
  name: "integrations",
  initialState,
  reducers: {
    toggleConnectorStatus: (
      state,
      action: PayloadAction<{ id: string; status: ConnectionStatus; notes?: string }>
    ) => {
      const conn = state.connectors.find((c) => c.id === action.payload.id);
      if (conn) {
        conn.status = action.payload.status;
        if (action.payload.notes) {
          conn.notes = action.payload.notes;
        }

        // Recalculate summary
        state.analytics.healthyPipesCount = state.connectors.filter(
          (c) => c.status === "Healthy"
        ).length;
        state.analytics.degradedPipesCount = state.connectors.filter(
          (c) => c.status === "Degraded" || c.status === "Down"
        ).length;
      }
    },

    toggleFailover: (
      state,
      action: PayloadAction<{ id: string; failoverActive: boolean }>
    ) => {
      const conn = state.connectors.find((c) => c.id === action.payload.id);
      if (conn) {
        conn.failoverActive = action.payload.failoverActive;
        state.analytics.activeFailoverCount = state.connectors.filter(
          (c) => c.failoverActive
        ).length;
      }
    },

    addWebhookLog: (state, action: PayloadAction<WebhookEventLog>) => {
      state.webhookLogs.unshift(action.payload);
      if (state.webhookLogs.length > 50) {
        state.webhookLogs.pop();
      }
    },

    rotateApiKey: (
      state,
      action: PayloadAction<{ id: string; newMaskedKey: string }>
    ) => {
      const key = state.apiKeys.find((k) => k.id === action.payload.id);
      if (key) {
        key.keyMasked = action.payload.newMaskedKey;
        key.lastRotatedAt = new Date().toISOString().substring(0, 10);
      }
    },

    addApiKey: (state, action: PayloadAction<ApiKeyRecord>) => {
      state.apiKeys.unshift(action.payload);
    },
  },
});

export const {
  toggleConnectorStatus,
  toggleFailover,
  addWebhookLog,
  rotateApiKey,
  addApiKey,
} = integrationsSlice.actions;

export default integrationsSlice.reducer;
