import type { BillingAuthority, OrderSource, TenantMode } from "@/lib/types/domain";

export interface TenantModeConfig {
  id: TenantMode;
  label: string;
  description: string;
  billingEnabled: boolean;
  showRevenueCards: boolean;
  showCommercialNav: boolean;
  showCollectPayment: boolean;
}

export const TENANT_MODE_CONFIG: Record<TenantMode, TenantModeConfig> = {
  hospital: {
    id: "hospital",
    label: "Hospital (HMS-integrated)",
    description: "Hospital reception / central finance is billing system of record.",
    billingEnabled: false,
    showRevenueCards: false,
    showCommercialNav: false,
    showCollectPayment: false,
  },
  standalone: {
    id: "standalone",
    label: "Standalone / Private Lab",
    description: "Full walk-in, home collection and LIS billing enabled.",
    billingEnabled: true,
    showRevenueCards: true,
    showCommercialNav: true,
    showCollectPayment: true,
  },
  b2b: {
    id: "b2b",
    label: "Reference / B2B Lab",
    description: "Client organizations, contracts and receivables.",
    billingEnabled: true,
    showRevenueCards: true,
    showCommercialNav: true,
    showCollectPayment: false,
  },
  hybrid: {
    id: "hybrid",
    label: "Hybrid (Hospital + Walk-in + Home + B2B)",
    description: "Billing authority resolved per order source.",
    billingEnabled: true,
    showRevenueCards: true,
    showCommercialNav: true,
    showCollectPayment: true,
  },
};

// Resolves exactly one billing authority for an order — never both HMS + LIS.
export function resolveBillingAuthority(mode: TenantMode, source: OrderSource): BillingAuthority {
  if (source === "internal_no_charge") return "NO_CHARGE";

  if (mode === "hospital") {
    return source === "hospital_encounter" ? "HMS_CENTRAL" : "LIS_INTERNAL";
  }
  if (mode === "standalone") {
    return "LIS_INTERNAL";
  }
  if (mode === "b2b") {
    return "EXTERNAL_CLIENT";
  }
  // hybrid: resolve per order source
  switch (source) {
    case "hospital_encounter":
      return "HMS_CENTRAL";
    case "walk_in":
    case "home_collection":
      return "LIS_INTERNAL";
    case "b2b_client":
      return "EXTERNAL_CLIENT";
    default:
      return "LIS_INTERNAL";
  }
}

export const ORDER_SOURCE_LABEL: Record<OrderSource, string> = {
  hospital_encounter: "Hospital encounter",
  walk_in: "Walk-in",
  home_collection: "Home collection",
  b2b_client: "B2B / Corporate client",
  internal_no_charge: "Internal / No-charge",
};

export const BILLING_AUTHORITY_LABEL: Record<BillingAuthority, string> = {
  HMS_CENTRAL: "HMS Central Billing",
  LIS_INTERNAL: "LIS Internal Billing",
  EXTERNAL_CLIENT: "External Client Billing",
  NO_CHARGE: "No Charge",
};
