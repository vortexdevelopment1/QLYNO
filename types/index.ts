// ============================================================================
// QLYNO BILLING ENGINE — SHARED DATA MODEL
// One billing engine. Different organization contexts. Controlled staff access.
// ============================================================================

export type OrganizationType = "solo_doctor" | "clinic" | "hospital";

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  city: string;
  insuranceEnabled: boolean;
}

// ---------------------------------------------------------------------------
// Billing scopes — only meaningful for hospitals. A staff member can hold
// one or more scopes. Scopes are NOT separate organizations/billing engines.
// ---------------------------------------------------------------------------
export type BillingScope =
  | "central"
  | "opd"
  | "ipd"
  | "diagnostics"
  | "pharmacy"
  | "surgery"
  | "insurance_tpa"
  | "refund_desk";

export const SCOPE_LABELS: Record<BillingScope, string> = {
  central: "Central Billing",
  opd: "OPD Billing",
  ipd: "IPD Billing",
  diagnostics: "Diagnostics Billing",
  pharmacy: "Pharmacy Billing",
  surgery: "Surgery Billing",
  insurance_tpa: "Insurance / TPA",
  refund_desk: "Refund Desk",
};

// ---------------------------------------------------------------------------
// Staff / roles / permissions
// ---------------------------------------------------------------------------
export type StaffStatus = "invited" | "pending" | "active" | "suspended" | "removed" | "archived";

export type UserRole = "billing_staff" | "billing_admin";

export interface PermissionSet {
  viewBills: boolean;
  createBill: boolean;
  editDraft: boolean;
  issueFinalizeBill: boolean;
  collectPayment: boolean;
  applyNormalDiscount: boolean;
  applyHighDiscount: boolean; // always requires approval when true it just means "can request"
  requestRefund: boolean;
  approveRefund: boolean;
  financialReports: boolean;
  insuranceTpa: boolean;
  billingSettings: boolean;
  reconciliation: boolean;
}

export const DEFAULT_STAFF_PERMISSIONS: PermissionSet = {
  viewBills: true,
  createBill: true,
  editDraft: true,
  issueFinalizeBill: true,
  collectPayment: true,
  applyNormalDiscount: true,
  applyHighDiscount: false,
  requestRefund: true,
  approveRefund: false,
  financialReports: false,
  insuranceTpa: false,
  billingSettings: false,
  reconciliation: false,
};

export const ADMIN_PERMISSIONS: PermissionSet = {
  viewBills: true,
  createBill: true,
  editDraft: true,
  issueFinalizeBill: true,
  collectPayment: true,
  applyNormalDiscount: true,
  applyHighDiscount: true,
  requestRefund: true,
  approveRefund: true,
  financialReports: true,
  insuranceTpa: true,
  billingSettings: true,
  reconciliation: true,
};

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  organizationId: string;
  role: UserRole;
  status: StaffStatus;
  scopes: BillingScope[]; // empty/["central"] for solo doctor & clinic
  permissions: PermissionSet;
  assignedDate: string; // ISO date
}

export interface BillingAssignment {
  id: string;
  staffId: string;
  organizationId: string;
  scopes: BillingScope[];
  assignedBy: string;
  assignedDate: string;
  status: StaffStatus;
}

// ---------------------------------------------------------------------------
// Patient / encounter / service catalog
// ---------------------------------------------------------------------------
export interface Patient {
  id: string;
  uhid: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  phone: string;
  email?: string;
  address?: string;
  organizationId: string;
}

export type EncounterType = "opd" | "ipd" | "diagnostics" | "pharmacy" | "surgery" | "consultation";

export interface Encounter {
  id: string;
  patientId: string;
  type: EncounterType;
  department: string;
  doctorName?: string;
  date: string;
  admissionId?: string;
  roomBed?: string;
  status: "active" | "completed" | "discharged";
}

export interface ServiceCatalogItem {
  id: string;
  name: string;
  category: EncounterType | "other";
  rate: number; // INR
  taxPercent: number;
  organizationId: string;
}

// ---------------------------------------------------------------------------
// Pending billing (billable events from other Qlyno modules)
// ---------------------------------------------------------------------------
export type BillableSource = "doctor_opd" | "diagnostics" | "pharmacy" | "ipd" | "surgery" | "other";

export interface PendingBillingItem {
  id: string;
  patientId: string;
  encounterId: string;
  serviceId: string;
  source: BillableSource;
  date: string;
  amount: number;
  status: "pending" | "invoiced";
  organizationId: string;
  scope: BillingScope;
}

// ---------------------------------------------------------------------------
// Payer / insurance
// ---------------------------------------------------------------------------
export type PayerType = "self" | "insurance" | "corporate";

export interface Payer {
  id: string;
  type: PayerType;
  name: string; // "Self Pay" | insurer/corporate name
  contact?: string;
}

export type ClaimStatus =
  | "pending_verification"
  | "verified"
  | "preauth_pending"
  | "approved"
  | "claim_submitted"
  | "under_review"
  | "partially_settled"
  | "settled"
  | "rejected";

export interface InsuranceClaim {
  id: string;
  invoiceId: string;
  patientId: string;
  payerId: string;
  policyNumber: string;
  status: ClaimStatus;
  claimedAmount: number;
  approvedAmount?: number;
  settledAmount?: number;
  patientResponsibility: number;
  payerOutstanding: number;
  documentsAttached: string[];
  requiredDocuments: string[];
  lastUpdated: string;
  organizationId: string;
}

// ---------------------------------------------------------------------------
// Invoice / line items
// ---------------------------------------------------------------------------
export type InvoiceStatus = "draft" | "issued" | "partially_paid" | "paid" | "cancelled" | "refunded" | "adjusted";

export interface InvoiceLineItem {
  id: string;
  serviceId: string;
  serviceName: string;
  source: BillableSource;
  quantity: number;
  rate: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  encounterId?: string;
  organizationId: string;
  scope: BillingScope;
  date: string;
  status: InvoiceStatus;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  paidTotal: number;
  outstanding: number;
  payerId: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  finalizedBy?: string;
  finalizedAt?: string;
  cancelledReason?: string;
}

// ---------------------------------------------------------------------------
// Payments / receipts
// ---------------------------------------------------------------------------
export type PaymentMethod = "cash" | "card" | "upi" | "online" | "other";
export type PaymentStatus = "success" | "failed" | "reversed";

export interface Payment {
  id: string;
  invoiceId: string;
  patientId: string;
  amount: number;
  method: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
  status: PaymentStatus;
  failureReason?: string;
  collectedBy: string;
  date: string;
  organizationId: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  invoiceId: string;
  paymentId: string;
  patientId: string;
  amount: number;
  method: PaymentMethod;
  referenceNumber?: string;
  date: string;
  receivedBy: string;
  organizationId: string;
}

// ---------------------------------------------------------------------------
// Discounts
// ---------------------------------------------------------------------------
export type DiscountLevel = "normal" | "higher" | "special_case" | "post_payment_adjustment";
export type ApprovalStatus = "not_required" | "pending" | "approved" | "rejected";

export interface Discount {
  id: string;
  invoiceId: string;
  level: DiscountLevel;
  amount: number;
  percent?: number;
  reason: string;
  requestedBy: string;
  requestedAt: string;
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  organizationId: string;
}

// ---------------------------------------------------------------------------
// Refunds
// ---------------------------------------------------------------------------
export type RefundStatus = "requested" | "approved" | "rejected" | "processing" | "completed" | "failed";

export interface Refund {
  id: string;
  invoiceId: string;
  paymentId: string;
  patientId: string;
  amount: number;
  reason: string;
  notes?: string;
  status: RefundStatus;
  requiresApproval: boolean;
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  processedBy?: string;
  processedAt?: string;
  organizationId: string;
}

// ---------------------------------------------------------------------------
// Audit log
// ---------------------------------------------------------------------------
export type AuditAction =
  | "invoice_created"
  | "invoice_modified"
  | "invoice_finalized"
  | "invoice_cancelled"
  | "payment_recorded"
  | "payment_reversed"
  | "discount_applied"
  | "discount_approved"
  | "discount_rejected"
  | "refund_requested"
  | "refund_approved"
  | "refund_rejected"
  | "refund_completed"
  | "reconciliation_resolved";

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  user: string;
  timestamp: string;
  entity: string; // "Invoice" | "Payment" | "Discount" | "Refund" | "Reconciliation"
  entityId: string;
  amount?: number;
  previousState?: string;
  newState?: string;
  reason?: string;
  approver?: string;
  organizationId: string;
}

// ---------------------------------------------------------------------------
// Notifications (WhatsApp simulation)
// ---------------------------------------------------------------------------
export type NotificationEvent =
  | "invoice_issued"
  | "payment_received"
  | "partial_payment"
  | "outstanding_reminder"
  | "refund_update"
  | "insurance_update";

export interface NotificationItem {
  id: string;
  event: NotificationEvent;
  patientId: string;
  invoiceId?: string;
  message: string;
  channel: "whatsapp";
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  organizationId: string;
}

// ---------------------------------------------------------------------------
// Reconciliation
// ---------------------------------------------------------------------------
export type ReconciliationExceptionType = "unmatched_transaction" | "failed_transaction" | "duplicate_payment" | "amount_mismatch";

export interface ReconciliationRecord {
  id: string;
  date: string;
  billingTotal: number;
  paymentTotal: number;
  expectedCollection: number;
  actualCollection: number;
  difference: number;
  exceptions: {
    id: string;
    type: ReconciliationExceptionType;
    description: string;
    amount: number;
    status: "open" | "investigating" | "resolved";
    resolutionNotes?: string;
  }[];
  organizationId: string;
  scope: BillingScope;
}

// ---------------------------------------------------------------------------
// Alerts (dashboard)
// ---------------------------------------------------------------------------
export type AlertType = "payment_failure" | "duplicate_bill" | "approval_required" | "reconciliation_exception";

export interface DashboardAlert {
  id: string;
  type: AlertType;
  message: string;
  severity: "info" | "warning" | "critical";
  linkEntity?: string;
  linkEntityId?: string;
  timestamp: string;
}
