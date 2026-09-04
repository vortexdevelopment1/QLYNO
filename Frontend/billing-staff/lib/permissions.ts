import { BillingScope, PermissionSet, StaffUser } from "@/billing-staff/types";

/**
 * Central permission checks. The UI must never silently hide a control without
 * explanation where the user might reasonably expect access — pages should use
 * `explainDenial` to render a permission/approval explanation rather than just
 * disappearing the button.
 */

export function hasScope(user: StaffUser, scope: BillingScope): boolean {
  // Solo doctor / clinic staff are not scoped — treat as full (central) access.
  if (user.scopes.length === 0) return true;
  return user.scopes.includes(scope) || user.scopes.includes("central");
}

export function can(user: StaffUser, permission: keyof PermissionSet): boolean {
  return !!user.permissions[permission];
}

export function explainDenial(permission: keyof PermissionSet): string {
  const messages: Partial<Record<keyof PermissionSet, string>> = {
    approveRefund: "Refund approval is restricted to authorized admin users.",
    applyHighDiscount: "This discount exceeds your configured limit and requires approval from an authorized admin.",
    billingSettings: "Billing settings are accessible only to authorized admin users.",
    financialReports: "This report is not available for your current billing scope.",
    insuranceTpa: "Insurance/TPA access is scope dependent and not enabled for your assignment.",
    issueFinalizeBill: "You are not assigned permission to issue/finalize invoices.",
    reconciliation: "Reconciliation is restricted to authorized admin users.",
  };
  return messages[permission] ?? "You do not have permission to perform this action.";
}

export function explainScopeDenial(scope: BillingScope, label: string): string {
  return `You do not have the "${label}" billing scope assigned. Ask your hospital admin to grant this scope if you need access.`;
}
