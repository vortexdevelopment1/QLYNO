import { BillingScope, Invoice, PendingBillingItem, ReconciliationRecord } from "@/types";

/** A user with no assigned scopes (solo doctor / clinic) or the "central" scope sees everything in their org. */
export function scopeVisible(itemScope: BillingScope, userScopes: BillingScope[]): boolean {
  if (userScopes.length === 0) return true;
  if (userScopes.includes("central")) return true;
  return userScopes.includes(itemScope);
}

export function filterInvoicesByAccess(invoices: Invoice[], orgId: string, userScopes: BillingScope[]): Invoice[] {
  return invoices.filter((i) => i.organizationId === orgId && scopeVisible(i.scope, userScopes));
}

export function filterPendingByAccess(items: PendingBillingItem[], orgId: string, userScopes: BillingScope[]): PendingBillingItem[] {
  return items.filter((i) => i.organizationId === orgId && scopeVisible(i.scope, userScopes));
}

export function filterReconByAccess(records: ReconciliationRecord[], orgId: string, userScopes: BillingScope[]): ReconciliationRecord[] {
  return records.filter((r) => r.organizationId === orgId && scopeVisible(r.scope, userScopes));
}
