// Core frontend-only domain models for the HMS Laboratory Portal prototype.
// These types describe shape only — no persistence, no server calls.

export type TenantMode = "hospital" | "standalone" | "b2b" | "hybrid";

export type BillingAuthority =
  | "HMS_CENTRAL"
  | "LIS_INTERNAL"
  | "EXTERNAL_CLIENT"
  | "NO_CHARGE";

export type OrderSource =
  | "hospital_encounter"
  | "walk_in"
  | "home_collection"
  | "b2b_client"
  | "internal_no_charge";

export type Priority = "routine" | "urgent" | "stat";

export type OrderStatus =
  | "draft"
  | "placed"
  | "accepted"
  | "collected"
  | "in_progress"
  | "partially_completed"
  | "completed"
  | "on_hold"
  | "cancelled";

export type SpecimenStatus =
  | "expected"
  | "label_printed"
  | "collected"
  | "in_transit"
  | "received"
  | "accessioned"
  | "accepted"
  | "rejected"
  | "aliquoted"
  | "stored"
  | "disposed";

export type TestStatus =
  | "ordered"
  | "ready"
  | "running"
  | "resulted"
  | "technical_review"
  | "medical_review"
  | "verified"
  | "released"
  | "repeat_required"
  | "reflex_pending"
  | "outsourced"
  | "blocked";

export type ReportStatus = "draft" | "preliminary" | "final" | "corrected" | "amended";

export type QcStatus = "in_control" | "warning" | "out_of_control" | "reviewed" | "closed";

export type BillingStatus =
  | "estimate"
  | "invoiced"
  | "partially_paid"
  | "paid"
  | "credit"
  | "adjusted"
  | "refunded";

export type HmsPostingStatus = "post_pending" | "posted" | "reversed" | "reconciliation_required";

export interface Tenant {
  id: string;
  legalName: string;
  displayName: string;
  mode: TenantMode;
  billingEnabled: boolean;
  accreditation: string[];
  logoInitials: string;
}

export interface Site {
  id: string;
  name: string;
  type: "hospital_lab" | "standalone_branch" | "collection_center" | "reference_hub";
  city: string;
}

export interface Department {
  id: string;
  name: string;
  siteId: string;
}

export type RoleId =
  | "lab_director"
  | "quality_manager"
  | "section_supervisor"
  | "technologist"
  | "accessioning"
  | "phlebotomist"
  | "courier"
  | "reception_cashier"
  | "inventory_procurement"
  | "tenant_admin"
  | "referring_clinician"
  | "client_lab_user"
  | "auditor";

export interface UserAccount {
  id: string;
  name: string;
  initials: string;
  roleId: RoleId;
  siteId: string;
}

export interface Patient {
  id: string;
  mrn?: string;
  name: string;
  age: number;
  sex: "M" | "F" | "O";
  contact: string;
  source: OrderSource;
  branchOrWard?: string;
  lastOrderDate?: string;
  privacyFlag?: boolean;
  duplicateWarning?: boolean;
}

export interface Encounter {
  id: string;
  patientId: string;
  encounterNo: string;
  ward: string;
  bed: string;
  admittingDoctor: string;
  status: "active" | "discharged";
}

export interface ClientOrganization {
  id: string;
  name: string;
  type: "clinic" | "hospital" | "corporate" | "insurer_tpa" | "collection_center" | "client_lab" | "reference_lab";
  contactPerson: string;
  contactEmail: string;
  contractId?: string;
  creditLimit?: number;
  creditTermsDays?: number;
}

export interface Practitioner {
  id: string;
  name: string;
  specialty: string;
  clinicOrHospital: string;
  phone: string;
}

export interface TestCatalogItem {
  id: string;
  code: string;
  name: string;
  department: string;
  method: string;
  specimen: string;
  container: string;
  minVolume: string;
  stability: string;
  tat: string;
  units: string;
  referenceRange: string;
  criticalRange?: string;
  reflexRule?: string;
  version: string;
  status: "draft" | "active" | "retired";
  effectiveDate: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  testId: string;
  testName: string;
  status: TestStatus;
  specimenId?: string;
  departmentId?: string;
  accessionId?: string;
  resultIds?: string[];
  reportGroupId?: string;
  technicalReviewer?: string;
  medicalReviewer?: string;
  tat?: string;
}

export interface Order {
  id: string;
  accessionId?: string;
  patientId: string;
  patientName: string;
  source: OrderSource;
  billingAuthority: BillingAuthority;
  priority: Priority;
  status: OrderStatus;
  reportStatus: ReportStatus | "pending";
  hmsPostingStatus?: HmsPostingStatus;
  orderingDoctor: string;
  siteId: string;
  departmentIds: string[];
  placedAt: string;
  itemIds: string[];
  clientOrgId?: string;
}

export interface Container {
  id: string;
  type: string;
  color: string;
}

export interface Specimen {
  id: string;
  orderId: string;
  patientName: string;
  type: string;
  container: string;
  status: SpecimenStatus;
  collectedAt?: string;
  rejectedReason?: string;
  recollectionOfId?: string;
  parentSpecimenId?: string;
  storageLocation?: string;
  tenantId?: string;
  siteId?: string;
  accessionId?: string;
  receivedAt?: string;
  receivedBy?: string;
  receivedSiteId?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  patientId?: string;
  mrn?: string;
  priority?: Priority;
  collectionLocation?: string;
  collectedBy?: string;
  collectionCondition?: string;
  sealStatus?: string;
  temperature?: string;
  receiptNotes?: string;
}

export interface Manifest {
  id: string;
  route: string;
  courier: string;
  status: "building" | "sealed" | "in_transit" | "delivered" | "delayed" | "lost" | "damaged";
  specimenCount: number;
  temperature: string;
  createdAt: string;
}

export interface WorkItem {
  id: string;
  label: string;
  department: string;
  priority: Priority;
  status: TestStatus;
}

export interface Analyzer {
  id: string;
  name: string;
  department: string;
  status: "connected" | "offline" | "maintenance";
  lastMessageAt: string;
  queueDepth: number;
  mappingVersion: string;
  errorCount: number;
}

export interface InstrumentRun {
  id: string;
  analyzerId: string;
  runAt: string;
  itemCount: number;
  status: "completed" | "in_progress" | "failed";
}

export interface Result {
  id: string;
  orderItemId: string;
  testName: string;
  value: string;
  units: string;
  referenceRange: string;
  flag: "normal" | "high" | "low" | "critical_high" | "critical_low";
  status: TestStatus;
  enteredBy?: string;
  previousValue?: string;
  deltaWarning?: boolean;
}

export interface ReportVersion {
  id: string;
  orderId: string;
  patientName: string;
  version: number;
  status: ReportStatus;
  reason?: string;
  releasedAt: string;
  authorizedBy: string;
  patientId?: string;
  patientMrn?: string;
  reportGroupId?: string;
  department?: string;
  includedOrderItemIds?: string[];
  critical?: boolean;
  deliveryStatus?: "pending" | "delivered" | "failed";
}

export interface CriticalNotification {
  id: string;
  patientName: string;
  testName: string;
  value: string;
  notifiedTo: string;
  acknowledged: boolean;
  readBackAt?: string;
  timerSeconds: number;
}

export interface QcRun {
  id: string;
  analyte: string;
  department: string;
  controlLot: string;
  level: "L1" | "L2" | "L3";
  status: QcStatus;
  westgardViolation?: string;
  runAt: string;
}

export interface Nonconformance {
  id: string;
  title: string;
  category: string;
  severity: "minor" | "major" | "critical";
  status: "open" | "investigating" | "capa_linked" | "closed";
  raisedAt: string;
}

export interface Capa {
  id: string;
  ncId: string;
  title: string;
  stage: "root_cause" | "action_plan" | "implementation" | "effectiveness_review" | "closed";
  owner: string;
  dueDate: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  reorderLevel: number;
  currentStock: number;
}

export interface StockLot {
  id: string;
  itemId: string;
  itemName: string;
  lotNumber: string;
  expiryDate: string;
  quantity: number;
  status: "available" | "near_expiry" | "expired" | "quarantined";
}

export interface Equipment {
  id: string;
  name: string;
  department: string;
  status: "operational" | "due_calibration" | "downtime" | "maintenance";
  lastServiceDate: string;
  nextCalibrationDate: string;
}

export interface Invoice {
  id: string;
  orderId?: string;
  clientOrgId?: string;
  patientName: string;
  amount: number;
  status: BillingStatus;
  issuedAt: string;
  dueAt?: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: "cash" | "card" | "upi" | "bank_transfer";
  receivedAt: string;
}

export interface Contract {
  id: string;
  clientOrgId: string;
  clientName: string;
  rateCardVersion: string;
  creditLimit: number;
  creditTermsDays: number;
  status: "active" | "expired" | "pending_renewal";
}

export interface IntegrationEvent {
  id: string;
  system: string;
  category: "HIS_EMR" | "HMS_BILLING" | "ABDM_FHIR" | "ANALYZER" | "PRINTER" | "REFERENCE_LAB" | "PAYMENT" | "MESSAGING" | "SSO";
  status: "connected" | "degraded" | "disconnected";
  lastSync: string;
  errorCount: number;
  mappingVersion: string;
}

export interface AuditEvent {
  id: string;
  entity: string;
  entityId: string;
  action: string;
  actor: string;
  timestamp: string;
}
