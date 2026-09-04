import type { BillingAuthority, OrderSource, TenantMode } from "../generated/prisma";
export function resolveBillingAuthority(mode: TenantMode, source: OrderSource): BillingAuthority {
  if (source === "INTERNAL_NO_CHARGE") return "NO_CHARGE";
  if (mode === "HOSPITAL") return source === "HOSPITAL_ENCOUNTER" ? "HMS_CENTRAL" : "LIS_INTERNAL";
  if (mode === "STANDALONE") return "LIS_INTERNAL";
  if (mode === "B2B") return "EXTERNAL_CLIENT";
  if (source === "HOSPITAL_ENCOUNTER") return "HMS_CENTRAL";
  if (source === "B2B_CLIENT") return "EXTERNAL_CLIENT";
  return "LIS_INTERNAL";
}
