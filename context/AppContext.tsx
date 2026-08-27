"use client";

import React, { createContext, useContext, useMemo, useReducer } from "react";
import {
  Organization, StaffUser, Patient, Encounter, ServiceCatalogItem, PendingBillingItem, Payer,
  Invoice, Payment, Receipt, Discount, Refund, InsuranceClaim, AuditLogEntry, NotificationItem,
  ReconciliationRecord, DashboardAlert, BillingScope, InvoiceLineItem, InvoiceStatus, PaymentMethod,
  DiscountLevel, RefundStatus,
} from "@/types";
import * as seed from "@/lib/mock-data";
import { nextId } from "@/lib/utils";

interface AppState {
  organizations: Organization[];
  staffUsers: StaffUser[];
  patients: Patient[];
  encounters: Encounter[];
  serviceCatalog: ServiceCatalogItem[];
  pendingBillingItems: PendingBillingItem[];
  payers: Payer[];
  invoices: Invoice[];
  payments: Payment[];
  receipts: Receipt[];
  discounts: Discount[];
  refunds: Refund[];
  insuranceClaims: InsuranceClaim[];
  auditLog: AuditLogEntry[];
  notifications: NotificationItem[];
  reconciliationRecords: ReconciliationRecord[];
  alerts: DashboardAlert[];
  currentOrgId: string;
  currentUserId: string;
  currentScope: BillingScope;
}

const initialState: AppState = {
  organizations: seed.organizations,
  staffUsers: seed.staffUsers,
  patients: seed.patients,
  encounters: seed.encounters,
  serviceCatalog: seed.serviceCatalog,
  pendingBillingItems: seed.pendingBillingItems,
  payers: seed.payers,
  invoices: seed.invoices,
  payments: seed.payments,
  receipts: seed.receipts,
  discounts: seed.discounts,
  refunds: seed.refunds,
  insuranceClaims: seed.insuranceClaims,
  auditLog: seed.auditLog,
  notifications: seed.notifications,
  reconciliationRecords: seed.reconciliationRecords,
  alerts: seed.dashboardAlerts,
  currentOrgId: "org-hospital",
  currentUserId: "staff-hosp-central",
  currentScope: "central",
};

type Action =
  | { type: "SET_ORG"; orgId: string; userId: string; scope: BillingScope }
  | { type: "SET_SCOPE"; scope: BillingScope }
  | { type: "CREATE_INVOICE"; invoice: Invoice; consumedPendingIds: string[] }
  | { type: "UPDATE_INVOICE_LINES"; invoiceId: string; lineItems: InvoiceLineItem[] }
  | { type: "FINALIZE_INVOICE"; invoiceId: string; user: string }
  | { type: "CANCEL_INVOICE"; invoiceId: string; reason: string; user: string }
  | { type: "RECORD_PAYMENT"; payment: Payment; receipt?: Receipt; invoiceId: string; user: string }
  | { type: "REQUEST_DISCOUNT"; discount: Discount; invoice: Invoice }
  | { type: "APPROVE_DISCOUNT"; discountId: string; approver: string }
  | { type: "REJECT_DISCOUNT"; discountId: string; approver: string }
  | { type: "REQUEST_REFUND"; refund: Refund }
  | { type: "APPROVE_REFUND"; refundId: string; approver: string }
  | { type: "REJECT_REFUND"; refundId: string; approver: string }
  | { type: "PROCESS_REFUND"; refundId: string; processor: string }
  | { type: "COMPLETE_REFUND"; refundId: string; processor: string }
  | { type: "RESOLVE_EXCEPTION"; reconId: string; excId: string; notes: string; user: string }
  | { type: "SEND_REMINDER"; invoice: Invoice }
  | { type: "UPDATE_STAFF_STATUS"; staffId: string; status: StaffUser["status"] }
  | { type: "REVERSE_PAYMENT"; paymentId: string; reason: string; user: string }
  | { type: "UPDATE_STAFF_SCOPES"; staffId: string; scopes: BillingScope[] }
  | { type: "ATTACH_CLAIM_DOCUMENT"; claimId: string; documentName: string }
  | { type: "FINAL_DISCHARGE_SETTLEMENT"; patientId: string; invoiceId: string; user: string };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_ORG":
      return { ...state, currentOrgId: action.orgId, currentUserId: action.userId, currentScope: action.scope };
    case "SET_SCOPE":
      return { ...state, currentScope: action.scope };
    case "CREATE_INVOICE":
      return {
        ...state,
        invoices: [action.invoice, ...state.invoices],
        pendingBillingItems: state.pendingBillingItems.map((p) =>
          action.consumedPendingIds.includes(p.id) ? { ...p, status: "invoiced" } : p
        ),
        auditLog: [
          {
            id: nextId("audit"), action: "invoice_created", user: action.invoice.createdBy, timestamp: new Date().toISOString(),
            entity: "Invoice", entityId: action.invoice.id, amount: action.invoice.total, organizationId: action.invoice.organizationId,
          },
          ...state.auditLog,
        ],
      };
    case "UPDATE_INVOICE_LINES": {
      const invoices = state.invoices.map((inv) => {
        if (inv.id !== action.invoiceId) return inv;
        const subtotal = action.lineItems.reduce((s, l) => s + l.rate * l.quantity, 0);
        const discountTotal = action.lineItems.reduce((s, l) => s + l.discountAmount, 0);
        const taxTotal = action.lineItems.reduce((s, l) => s + l.taxAmount, 0);
        const total = action.lineItems.reduce((s, l) => s + l.total, 0);
        return { ...inv, lineItems: action.lineItems, subtotal, discountTotal, taxTotal, total, outstanding: total - inv.paidTotal };
      });
      return {
        ...state,
        invoices,
        auditLog: [
          { id: nextId("audit"), action: "invoice_modified", user: "You", timestamp: new Date().toISOString(), entity: "Invoice", entityId: action.invoiceId, organizationId: state.currentOrgId },
          ...state.auditLog,
        ],
      };
    }
    case "FINALIZE_INVOICE":
      return {
        ...state,
        invoices: state.invoices.map((inv) =>
          inv.id === action.invoiceId
            ? { ...inv, status: "issued" as InvoiceStatus, finalizedBy: action.user, finalizedAt: new Date().toISOString() }
            : inv
        ),
        notifications: [
          ...(() => {
            const inv = state.invoices.find((i) => i.id === action.invoiceId);
            if (!inv) return [];
            return [
              {
                id: nextId("notif"), event: "invoice_issued" as const, patientId: inv.patientId, invoiceId: inv.id,
                message: `Your invoice ${inv.invoiceNumber} for ₹${inv.total.toLocaleString("en-IN")} has been generated.`,
                channel: "whatsapp" as const, status: "sent" as const, timestamp: new Date().toISOString(), organizationId: inv.organizationId,
              },
            ];
          })(),
          ...state.notifications,
        ],
        auditLog: [
          { id: nextId("audit"), action: "invoice_finalized", user: action.user, timestamp: new Date().toISOString(), entity: "Invoice", entityId: action.invoiceId, previousState: "draft", newState: "issued", organizationId: state.currentOrgId },
          ...state.auditLog,
        ],
      };
    case "CANCEL_INVOICE":
      return {
        ...state,
        invoices: state.invoices.map((inv) =>
          inv.id === action.invoiceId ? { ...inv, status: "cancelled" as InvoiceStatus, cancelledReason: action.reason } : inv
        ),
        auditLog: [
          { id: nextId("audit"), action: "invoice_cancelled", user: action.user, timestamp: new Date().toISOString(), entity: "Invoice", entityId: action.invoiceId, previousState: "issued", newState: "cancelled", reason: action.reason, organizationId: state.currentOrgId },
          ...state.auditLog,
        ],
      };
    case "RECORD_PAYMENT": {
      const invoices = state.invoices.map((inv) => {
        if (inv.id !== action.invoiceId) return inv;
        if (action.payment.status !== "success") return inv;
        const paidTotal = inv.paidTotal + action.payment.amount;
        const outstanding = Math.max(0, inv.total - paidTotal);
        const status: InvoiceStatus = outstanding === 0 ? "paid" : "partially_paid";
        return { ...inv, paidTotal, outstanding, status };
      });
      const inv = invoices.find((i) => i.id === action.invoiceId)!;
      const notifs: NotificationItem[] = [];
      if (action.payment.status === "success" && action.receipt) {
        notifs.push({
          id: nextId("notif"),
          event: inv.outstanding > 0 ? "partial_payment" : "payment_received",
          patientId: inv.patientId, invoiceId: inv.id,
          message:
            inv.outstanding > 0
              ? `We received ₹${action.payment.amount.toLocaleString("en-IN")} towards invoice ${inv.invoiceNumber}. Remaining balance: ₹${inv.outstanding.toLocaleString("en-IN")}.`
              : `Payment of ₹${action.payment.amount.toLocaleString("en-IN")} received for invoice ${inv.invoiceNumber}. Thank you!`,
          channel: "whatsapp", status: "sent", timestamp: new Date().toISOString(), organizationId: inv.organizationId,
        });
      }
      return {
        ...state,
        invoices,
        payments: [action.payment, ...state.payments],
        receipts: action.receipt ? [action.receipt, ...state.receipts] : state.receipts,
        notifications: [...notifs, ...state.notifications],
        alerts:
          action.payment.status === "failed"
            ? [
              {
                id: nextId("alert"), type: "payment_failure",
                message: `${action.payment.method.toUpperCase()} payment failed for invoice ${inv.invoiceNumber} (₹${action.payment.amount.toLocaleString("en-IN")}).`,
                severity: "critical", linkEntity: "Invoice", linkEntityId: inv.id, timestamp: new Date().toISOString(),
              },
              ...state.alerts,
            ]
            : state.alerts,
        auditLog: [
          {
            id: nextId("audit"), action: action.payment.status === "success" ? "payment_recorded" : "payment_reversed",
            user: action.user, timestamp: new Date().toISOString(), entity: "Payment", entityId: action.payment.id,
            amount: action.payment.amount, reason: action.payment.status === "failed" ? action.payment.failureReason : undefined,
            organizationId: state.currentOrgId,
          },
          ...state.auditLog,
        ],
      };
    }
    case "REQUEST_DISCOUNT": {
      const invoices =
        action.discount.approvalStatus === "not_required"
          ? state.invoices.map((inv) => {
            if (inv.id !== action.discount.invoiceId) return inv;
            const discountTotal = inv.discountTotal + action.discount.amount;
            const total = inv.subtotal - discountTotal + inv.taxTotal;
            return { ...inv, discountTotal, total, outstanding: Math.max(0, total - inv.paidTotal) };
          })
          : state.invoices;
      return {
        ...state,
        invoices,
        discounts: [action.discount, ...state.discounts],
        alerts:
          action.discount.approvalStatus === "pending"
            ? [
              {
                id: nextId("alert"), type: "approval_required",
                message: `${action.discount.level === "higher" ? "High" : "Special case"} discount of ₹${action.discount.amount.toLocaleString("en-IN")} on invoice ${action.invoice.invoiceNumber} is pending admin approval.`,
                severity: "warning", linkEntity: "Discount", linkEntityId: action.discount.id, timestamp: new Date().toISOString(),
              },
              ...state.alerts,
            ]
            : state.alerts,
        auditLog: [
          { id: nextId("audit"), action: "discount_applied", user: action.discount.requestedBy, timestamp: new Date().toISOString(), entity: "Discount", entityId: action.discount.id, amount: action.discount.amount, reason: action.discount.reason, organizationId: state.currentOrgId },
          ...state.auditLog,
        ],
      };
    }
    case "APPROVE_DISCOUNT": {
      const discount = state.discounts.find((d) => d.id === action.discountId);
      if (!discount) return state;
      const invoices = state.invoices.map((inv) => {
        if (inv.id !== discount.invoiceId) return inv;
        const discountTotal = inv.discountTotal + discount.amount;
        const total = inv.subtotal - discountTotal + inv.taxTotal;
        return { ...inv, discountTotal, total, outstanding: Math.max(0, total - inv.paidTotal) };
      });
      return {
        ...state,
        invoices,
        discounts: state.discounts.map((d) => (d.id === action.discountId ? { ...d, approvalStatus: "approved", approvedBy: action.approver, approvedAt: new Date().toISOString() } : d)),
        auditLog: [
          { id: nextId("audit"), action: "discount_approved", user: action.approver, timestamp: new Date().toISOString(), entity: "Discount", entityId: action.discountId, amount: discount.amount, approver: action.approver, organizationId: state.currentOrgId },
          ...state.auditLog,
        ],
      };
    }
    case "REJECT_DISCOUNT": {
      const discount = state.discounts.find((d) => d.id === action.discountId);
      return {
        ...state,
        discounts: state.discounts.map((d) => (d.id === action.discountId ? { ...d, approvalStatus: "rejected", approvedBy: action.approver, approvedAt: new Date().toISOString() } : d)),
        auditLog: [
          { id: nextId("audit"), action: "discount_rejected", user: action.approver, timestamp: new Date().toISOString(), entity: "Discount", entityId: action.discountId, amount: discount?.amount, approver: action.approver, organizationId: state.currentOrgId },
          ...state.auditLog,
        ],
      };
    }
    case "REQUEST_REFUND":
      return {
        ...state,
        refunds: [action.refund, ...state.refunds],
        alerts: action.refund.requiresApproval
          ? [
            { id: nextId("alert"), type: "approval_required", message: `Refund request of ₹${action.refund.amount.toLocaleString("en-IN")} requires approval.`, severity: "warning", linkEntity: "Refund", linkEntityId: action.refund.id, timestamp: new Date().toISOString() },
            ...state.alerts,
          ]
          : state.alerts,
        auditLog: [
          { id: nextId("audit"), action: "refund_requested", user: action.refund.requestedBy, timestamp: new Date().toISOString(), entity: "Refund", entityId: action.refund.id, amount: action.refund.amount, reason: action.refund.reason, organizationId: state.currentOrgId },
          ...state.auditLog,
        ],
      };
    case "APPROVE_REFUND": {
      const refund = state.refunds.find((r) => r.id === action.refundId);
      const nextStatus: RefundStatus = "approved";
      return {
        ...state,
        refunds: state.refunds.map((r) => (r.id === action.refundId ? { ...r, status: nextStatus, approvedBy: action.approver, approvedAt: new Date().toISOString() } : r)),
        auditLog: [
          { id: nextId("audit"), action: "refund_approved", user: action.approver, timestamp: new Date().toISOString(), entity: "Refund", entityId: action.refundId, amount: refund?.amount, approver: action.approver, organizationId: state.currentOrgId },
          ...state.auditLog,
        ],
      };
    }
    case "REJECT_REFUND": {
      const refund = state.refunds.find((r) => r.id === action.refundId);
      return {
        ...state,
        refunds: state.refunds.map((r) => (r.id === action.refundId ? { ...r, status: "rejected", approvedBy: action.approver, approvedAt: new Date().toISOString() } : r)),
        auditLog: [
          { id: nextId("audit"), action: "refund_rejected", user: action.approver, timestamp: new Date().toISOString(), entity: "Refund", entityId: action.refundId, amount: refund?.amount, approver: action.approver, organizationId: state.currentOrgId },
          ...state.auditLog,
        ],
      };
    }
    case "PROCESS_REFUND":
      return {
        ...state,
        refunds: state.refunds.map((r) => (r.id === action.refundId ? { ...r, status: "processing", processedBy: action.processor } : r)),
      };
    case "COMPLETE_REFUND": {
      const refund = state.refunds.find((r) => r.id === action.refundId);
      if (!refund) return state;
      const invoices = state.invoices.map((inv) => {
        if (inv.id !== refund.invoiceId) return inv;
        return { ...inv, status: "refunded" as InvoiceStatus };
      });
      return {
        ...state,
        invoices,
        refunds: state.refunds.map((r) => (r.id === action.refundId ? { ...r, status: "completed", processedBy: action.processor, processedAt: new Date().toISOString() } : r)),
        notifications: [
          { id: nextId("notif"), event: "refund_update", patientId: refund.patientId, invoiceId: refund.invoiceId, message: `Your refund of ₹${refund.amount.toLocaleString("en-IN")} has been completed and credited.`, channel: "whatsapp", status: "sent", timestamp: new Date().toISOString(), organizationId: state.currentOrgId },
          ...state.notifications,
        ],
        auditLog: [
          { id: nextId("audit"), action: "refund_completed", user: action.processor, timestamp: new Date().toISOString(), entity: "Refund", entityId: action.refundId, amount: refund.amount, organizationId: state.currentOrgId },
          ...state.auditLog,
        ],
      };
    }
    case "RESOLVE_EXCEPTION":
      return {
        ...state,
        reconciliationRecords: state.reconciliationRecords.map((rec) =>
          rec.id !== action.reconId
            ? rec
            : { ...rec, exceptions: rec.exceptions.map((e) => (e.id === action.excId ? { ...e, status: "resolved", resolutionNotes: action.notes } : e)) }
        ),
        auditLog: [
          { id: nextId("audit"), action: "reconciliation_resolved", user: action.user, timestamp: new Date().toISOString(), entity: "Reconciliation", entityId: action.excId, reason: action.notes, organizationId: state.currentOrgId },
          ...state.auditLog,
        ],
      };
    case "SEND_REMINDER":
      return {
        ...state,
        notifications: [
          {
            id: nextId("notif"), event: "outstanding_reminder", patientId: action.invoice.patientId, invoiceId: action.invoice.id,
            message: `Reminder: ₹${action.invoice.outstanding.toLocaleString("en-IN")} is outstanding on invoice ${action.invoice.invoiceNumber}.`,
            channel: "whatsapp", status: "sent", timestamp: new Date().toISOString(), organizationId: action.invoice.organizationId,
          },
          ...state.notifications,
        ],
      };
    case "UPDATE_STAFF_STATUS":
      return {
        ...state,
        staffUsers: state.staffUsers.map((u) => (u.id === action.staffId ? { ...u, status: action.status } : u)),
      };
    case "UPDATE_STAFF_SCOPES":
      return {
        ...state,
        staffUsers: state.staffUsers.map((u) => (u.id === action.staffId ? { ...u, scopes: action.scopes } : u)),
      };
    case "REVERSE_PAYMENT": {
      const pm = state.payments.find((p) => p.id === action.paymentId);
      if (!pm) return state;
      const updatedPayments = state.payments.map((p) =>
        p.id === action.paymentId ? { ...p, status: "reversed" as const, failureReason: action.reason } : p
      );
      const invoices = state.invoices.map((inv) => {
        if (inv.id !== pm.invoiceId) return inv;
        const paidTotal = Math.max(0, inv.paidTotal - pm.amount);
        const outstanding = inv.total - paidTotal;
        const status: InvoiceStatus = paidTotal === 0 ? "issued" : "partially_paid";
        return { ...inv, paidTotal, outstanding, status };
      });
      return {
        ...state,
        payments: updatedPayments,
        invoices,
        auditLog: [
          {
            id: nextId("audit"),
            action: "payment_reversed",
            user: action.user,
            timestamp: new Date().toISOString(),
            entity: "Payment",
            entityId: action.paymentId,
            amount: pm.amount,
            reason: action.reason,
            organizationId: state.currentOrgId,
          },
          ...state.auditLog,
        ],
      };
    }
    case "ATTACH_CLAIM_DOCUMENT":
      return {
        ...state,
        insuranceClaims: state.insuranceClaims.map((c) =>
          c.id === action.claimId
            ? {
              ...c,
              documentsAttached: c.documentsAttached.includes(action.documentName)
                ? c.documentsAttached
                : [...c.documentsAttached, action.documentName],
              lastUpdated: new Date().toISOString().split("T")[0],
            }
            : c
        ),
      };
    case "FINAL_DISCHARGE_SETTLEMENT": {
      const inv = state.invoices.find((i) => i.id === action.invoiceId);
      if (!inv) return state;
      return {
        ...state,
        invoices: state.invoices.map((i) => (i.id === action.invoiceId ? { ...i, status: "paid", outstanding: 0, paidTotal: i.total } : i)),
        encounters: state.encounters.map((e) => (e.patientId === action.patientId && e.status === "active" ? { ...e, status: "discharged" } : e)),
        auditLog: [
          {
            id: nextId("audit"),
            action: "invoice_finalized",
            user: action.user,
            timestamp: new Date().toISOString(),
            entity: "Invoice",
            entityId: action.invoiceId,
            amount: inv.total,
            reason: "Final patient discharge settlement completed",
            organizationId: state.currentOrgId,
          },
          ...state.auditLog,
        ],
      };
    }
    default:
      return state;
  }
}

interface AppContextValue extends AppState {
  dispatch: React.Dispatch<Action>;
  currentOrg: Organization;
  currentUser: StaffUser;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = useMemo<AppContextValue>(() => {
    const currentOrg = state.organizations.find((o) => o.id === state.currentOrgId)!;
    const currentUser = state.staffUsers.find((u) => u.id === state.currentUserId)!;
    return { ...state, dispatch, currentOrg, currentUser };
  }, [state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
