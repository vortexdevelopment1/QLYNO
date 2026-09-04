/**
 * Shared domain types for the Qlyno Hospital Admin Panel.
 * These mirror the entities defined across the Doctor, Receptionist, Nurse,
 * Lab, Vendor, Billing and Patient module PRDs so the UI layer has a single
 * source of truth ready to be wired to real API responses later.
 */

export type Status =
  | "active"
  | "inactive"
  | "pending"
  | "invited"
  | "suspended"
  | "removed"
  | "archived"
  | "on-leave"
  | "available"
  | "assigned"
  | "on-call"
  | "replaced"
  | "waiting"
  | "called"
  | "in-progress"
  | "completed"
  | "no-show"
  | "pending-route"
  | "routed"
  | "escalated"
  | "registered"
  | "in-consultation"
  | "follow-up-scheduled"
  | "under-treatment"
  | "transfer-requested"
  | "discharge-pending"
  | "discharged"
  | "admitted"
  | "new"
  | "duplicate-flagged"
  | "granted"
  | "restricted"
  | "revoked";

export interface BaseStaff {
  id: string;
  name: string;
  avatarUrl?: string;
  email: string;
  phone: string;
  status: Status;
  createdAt: string;
  location?: string;
}

/* ---------------------------------- Doctor --------------------------------- */

export type DoctorAvailability = "available" | "busy" | "off" | "on-leave";

export interface Doctor extends BaseStaff {
  specialty: string;
  subSpecialty: string;
  qualification: string;
  experienceYears: number;
  registrationNo: string;
  availability: DoctorAvailability;
  clinics: string[];
  department: string;
  privileges: string[];
  languages: string[];
  services: string[];
  consultationSettings: {
    visitMode: "In-person" | "Teleconsult" | "Hybrid";
    slotsPerDay: number;
    emergencyOnCall: boolean;
    maxPatientsPerDay: number;
  };
  verification: {
    status: "pending" | "in-review" | "verified" | "rejected";
    hospitalVerified: boolean;
    platformVerified: boolean;
    documents: string[];
    pendingDocuments: string[];
  };
  schedule: {
    dutyHours: string;
    leaveWindow?: string;
    emergencyOnCall: boolean;
    availability: string;
  };
  publicProfile: {
    published: boolean;
    searchable: boolean;
  };
  todayAppointments: number;
  totalPatients: number;
  rating: number;
  consultationFee: number;
  verified: boolean;
  role: "Doctor";
}

/* -------------------------------- Clinic Staff ------------------------------ */

export interface Receptionist extends BaseStaff {
  role: "Receptionist";
  assignedContext: "Solo Doctor" | "Clinic" | "Hospital";
  branch: string;
  desk: string;
  department: string;
  workflowScope: string[];
  scope: string[];
  appointmentsHandled: number;
  isReplacementActive?: boolean;
}

export interface Nurse extends BaseStaff {
  role: "Nurse";
  level: "Nurse" | "Senior Nurse" | "Nurse Lead";
  department: string;
  station: string;
  shift: "Morning" | "Evening" | "Night";
  assignedPatients: number;
  tasksPending: number;
  tasksOverdue: number;
  councilRegistrationId?: string;
  qualifications?: string[];
  employmentHistory?: { period: string; role: string; hospital: string }[];
  vitalsCompletionRate?: number;
  medicationComplianceRate?: number;
  avgOrderFulfillmentMins?: number;
  punctualityScore?: number;
  incidentCount?: number;
}

export interface BillingCounter {
  id: string;
  name: string;
  type: "OPD Billing" | "IPD Billing" | "Insurance/TPA Desk" | "Refund Desk";
  status: "Open" | "Closed" | "On Break";
  assignedStaffId?: string;
  assignedStaffName?: string;
  location: string;
  shift: "Morning" | "Evening" | "Night";
}

export interface BillingPermissions {
  maxRefundLimit: number;
  maxDiscountLimit: number;
  permittedCategories: string[];
  supervisorOverride: boolean;
}

export interface BillingTransaction {
  id: string;
  timestamp: string;
  patientName: string;
  patientId: string;
  type: "Invoice" | "Payment" | "Refund" | "TPA Settlement";
  amount: number;
  paymentMode: "Cash" | "Card" | "UPI" | "Insurance";
  status: "Created" | "Paid" | "Reconciled" | "Refunded";
  counterId: string;
  billingOfficerName: string;
  notes?: string;
}

export interface BillingStaff extends BaseStaff {
  role: "Billing Staff";
  scopes: string[];
  assignedCounterId?: string;
  assignedCounterName?: string;
  permissions?: BillingPermissions;
  shift?: "Morning" | "Evening" | "Night";
  collectionsToday: number;
  pendingInvoices: number;
  collectionsByMode?: {
    cash: number;
    card: number;
    upi: number;
    insurance: number;
  };
  discrepancyAmount?: number;
}

export type OtherStaffCategory =
  | "Technician"
  | "Housekeeping"
  | "Security"
  | "Driver"
  | "Support Staff"
  | "Other Hospital Staff";

export interface SupportStaff extends BaseStaff {
  role: "Support Staff" | "Attendant" | "Housekeeping" | "Assistant" | "Technician" | "Security" | "Driver" | "Other Hospital Staff";
  category?: OtherStaffCategory;
  department: string;
  taskScope: string[];
  assignment: string;
  availability: "available" | "assigned" | "off-duty";
  driverLicenseNumber?: string;
  assignedVehicleId?: string;
  assignedStationId?: string;
}

export interface LabStaff extends BaseStaff {
  role: "Lab Technician" | "Pathologist" | "Lab Front Desk" | "Collection Agent";
  labLocation: string;
  ordersHandled: number;
}

/* ----------------------------- Duty, Shifts & Attendance ----------------------------- */

export interface DoctorOnCall {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  phone: string;
  date: string;
  shiftWindow: string;
  status: "On Call" | "Consulting" | "Standby";
  activeEmergencyCases: number;
}

export interface LeaveRequest {
  id: string;
  staffId: string;
  staffName: string;
  staffRole: string;
  department: string;
  leaveType: "Sick Leave" | "Casual Leave" | "Earned Leave" | "Compensatory Off";
  startDate: string;
  endDate: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  coverageGapDetected: boolean;
  assignedBackupStaffId?: string;
  assignedBackupStaffName?: string;
  appliedOn: string;
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  staffRole: string;
  department: string;
  date: string;
  scheduledShift: string;
  punchIn?: string;
  punchOut?: string;
  status: "Present" | "Late" | "Early Departure" | "On Leave" | "Absent";
  lateMinutes?: number;
  earlyMinutes?: number;
  overtimeMinutes?: number;
  editedReason?: string;
  editedBy?: string;
}

export type DepartmentType = "OPD" | "IPD" | "ICU" | "Emergency" | "OT" | "Radiology" | "Laboratory";

export interface Department {
  id: string;
  name: string;
  type: DepartmentType;
  location: string;
  headName: string;
  activePatients: number;
  bedCapacity?: number;
  status: "active" | "warning" | "critical";
}

export interface NurseStation {
  id: string;
  name: string;
  department: string;
  location: string;
  leadName: string;
  capacity: number;
  occupancy: number;
  status: "stable" | "watch" | "critical";
  shiftCoverage: string;
}

/* ----------------------------- Wards & Beds ----------------------------- */

export type WardType = "General" | "ICU" | "CCU" | "HDU" | "Isolation" | "Maternity" | "NICU" | "Private" | "Deluxe";
export type BedTier = "General" | "Semi-Private" | "Private Suite" | "ICU" | "CCU" | "HDU" | "Isolation" | "NICU" | "Daycare";
export type BedStatus = "Available" | "Occupied" | "Reserved" | "Cleaning" | "Maintenance" | "Decommissioned";
export type IsolationType = "Droplet" | "Airborne" | "Contact" | "None";

export interface Ward {
  id: string;
  name: string;
  type: WardType;
  floor: string;
  department: string;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  status: "Active" | "Inactive";
}

export interface Bed {
  id: string;
  wardId: string;
  wardName: string;
  bedNumber: string;
  tier: BedTier;
  status: BedStatus;
  floor: string;
  currentPatientId?: string;
  currentPatientName?: string;
  admittingDoctor?: string;
  admissionDate?: string;
  lengthOfStayDays?: number;
  isolationFlags?: IsolationType;
  negativePressure?: boolean;
  attachedEquipment?: string[];
  nurseToPatientRatio?: string;
  turnoverETA?: string;
  reservedForPatientName?: string;
  reservedExpiry?: string;
}

export interface BedAllocation {
  id: string;
  bedId: string;
  bedNumber: string;
  wardName: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  admissionType: "Emergency" | "Elective IPD" | "OT Post-Op" | "Direct Transfer";
  allocatedAt: string;
  releasedAt?: string;
  isolationPrecautions?: IsolationType;
  notes?: string;
}

export interface BedTransferRequest {
  id: string;
  patientId: string;
  patientName: string;
  fromBedId: string;
  fromBedNumber: string;
  fromWard: string;
  toBedId: string;
  toBedNumber: string;
  toWard: string;
  reason: string;
  requestedBy: string;
  approvedBy?: string;
  status: "Pending" | "Approved" | "Completed" | "Rejected";
  requestedAt: string;
}

export interface BedCleaningTask {
  id: string;
  bedId: string;
  bedNumber: string;
  wardName: string;
  triggeredAt: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  status: "Pending" | "In Progress" | "Done";
  completedAt?: string;
  protocol: "Standard" | "Terminal-Isolation";
  turnaroundMinutes?: number;
  notes?: string;
}

export interface BedHistoryEntry {
  id: string;
  bedId: string;
  bedNumber: string;
  wardName: string;
  eventType: "Allocation" | "Transfer Out" | "Transfer In" | "Discharge" | "Cleaning Started" | "Cleaning Completed" | "Maintenance" | "Reservation";
  patientName?: string;
  staffName: string;
  timestamp: string;
  details: string;
}

/* ----------------------------- Section 12 Modules ----------------------------- */

// 12.2 Radiology & Imaging (Extended)
export type RadiologyModality = "X-Ray" | "CT Scan" | "MRI" | "Ultrasound" | "PET-CT" | "Mammography";
export type RadiologyStatus = "Requested" | "Scheduled" | "In Progress" | "Report Pending" | "Report Ready" | "Completed" | "Cancelled";
export type SuiteStatus = "Available" | "In Use" | "Maintenance" | "Offline";
export type PacsConnectivityStatus = "Connected" | "Degraded" | "Offline";

export interface RadiologyOrder {
  id: string;
  orderNo: string;
  patientId: string;
  patientName: string;
  uhid?: string;
  age?: number;
  gender?: string;
  modality: RadiologyModality;
  bodyPart: string;
  orderingDoctor: string;
  source?: "OPD" | "IPD" | "Emergency" | "OT";
  scheduledAt: string;
  status: RadiologyStatus;
  priority: "Routine" | "Urgent" | "Stat Emergency";
  criticalFinding?: boolean;
  criticalDetails?: string;
  roomName: string;
  suiteId?: string;
  radiologistName?: string;
  radiologistId?: string;
  technologistName?: string;
  scanStartTime?: string;
  elapsedScanMins?: number;
  patientLocation?: string;
  wardBed?: string;
  tariffId?: string;
  price?: number;
  reportNotes?: string;
  impressionNotes?: string;
  dicomViewerUrl?: string;
  authorizedAt?: string;
  amendedAt?: string;
  amendedBy?: string;
  amendmentNotes?: string;
}

export interface ImagingSuite {
  id: string;
  suiteId: string;
  name: string;
  modalityType: RadiologyModality;
  location: string;
  floor: string;
  status: SuiteStatus;
  pacsConnectivityStatus: PacsConnectivityStatus;
  currentActiveOrderId?: string;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  maintenanceNotes?: string;
}

export interface CriticalFindingLog {
  id: string;
  orderId: string;
  orderNo: string;
  patientName: string;
  uhid: string;
  patientLocation: string;
  modality: RadiologyModality;
  bodyPart: string;
  criticalDetails: string;
  flaggedAt: string;
  orderingDoctor: string;
  reportingRadiologist: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  clinicianNotified: boolean;
  notificationMethod?: "Phone" | "Direct Consultation" | "Emergency Escalation Center";
  escalationNotes?: string;
}

export interface StudyHistoryItem {
  id: string;
  orderId: string;
  orderNo: string;
  patientName: string;
  uhid: string;
  modality: RadiologyModality;
  bodyPart: string;
  orderingDoctor: string;
  radiologistName: string;
  technologistName: string;
  suiteName: string;
  outcome: "Completed" | "Cancelled" | "Aborted";
  cancellationReason?: string;
  totalTurnaroundTimeMins: number;
  completedAt: string;
  archivedAt: string;
  dicomViewerUrl?: string;
}

export interface RadiologistProfile {
  id: string;
  doctorId: string;
  name: string;
  qualification: string;
  registrationNo: string;
  specialty: string;
  onDutyStatus: "On Duty" | "Off Duty" | "On Call";
  currentQueueCount: number;
  avgTatMins: number;
  todayAuthorizedCount: number;
  contactNumber: string;
}

// 12.3 Pharmacy & Medicine Inventory
export type MedicineStatus = "In Stock" | "Low Stock" | "Out of Stock" | "Expiring Soon" | "Expired";

export interface MedicineItem {
  id: string;
  name: string;
  genericName: string;
  category: "Antibiotics" | "Cardiovascular" | "Analgesics" | "Critical Emergency" | "Anesthetics" | "Gastrointestinal" | "Fluids & Electrolytes" | string;
  dosageForm: "Tablet" | "Capsule" | "Injection / Vial" | "IV Infusion" | "Syrup" | "Ointment" | string;
  stockLevel: number;
  unit?: string;
  minThreshold: number;
  expiryDate: string;
  batchNumber: string;
  rackLocation: string;
  status: MedicineStatus;
  unitPrice: number;
  manufacturer?: string;
  scheduleH1?: boolean;
}

export interface DispensingRecord {
  id: string;
  prescriptionNo: string;
  prescriptionNumber?: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  dispensedAt?: string;
  timestamp?: string;
  pharmacistName: string;
  items: { medicineName: string; quantity: number; dosage: string }[];
  totalAmount: number;
  status: "Completed" | "Pending Collection" | "Substituted" | "Dispensed";
}

export interface PharmacyAlert {
  id: string;
  medicineName: string;
  type?: "Low Stock" | "Expiring Soon" | "Critical Zero Stock" | string;
  alertType?: string;
  severity: "High" | "Critical" | "Warning";
  currentStock: number;
  thresholdOrExpiry?: string;
  actionRequired?: string;
  message?: string;
  minThreshold?: number;
  expiryDate?: string;
}

// 12.4 Payments & Daily Counter Collections
export type PaymentMethod = "Cash" | "Credit/Debit Card" | "UPI/QR" | "Bank Transfer" | "Insurance Direct";

export interface PaymentTransaction {
  id: string;
  receiptNo: string;
  patientId: string;
  patientName: string;
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  counterNo: string;
  cashierName: string;
  timestamp: string;
  reconciliationStatus: "Reconciled" | "Pending Settlement" | "Variance";
  gatewayRefId?: string;
  terminalId?: string;
  tpaClaimNo?: string;
  tpaProvider?: string;
  cardLast4?: string;
  cardType?: string;
  department?: string;
  notes?: string;
}

export interface RefundReconciliationRecord {
  id: string;
  refundReceiptNo: string;
  invoiceId: string;
  patientId: string;
  patientName: string;
  amount: number;
  originalMethod: PaymentMethod;
  reversalChannel: "Cash Drawer" | "Card Reversal" | "UPI Gateway Reversal" | "Bank Transfer Reversal";
  counterNo: string;
  cashierName: string;
  approvedBy: string;
  approvalReference: string;
  reconciliationStatus: "Reconciled" | "Pending Gateway Reversal" | "Variance";
  timestamp: string;
  reason: string;
}

export interface CashDrawerReport {
  counterId: string;
  counterName: string;
  cashierName: string;
  openingFloat: number;
  cashCollected: number;
  posCollected: number;
  upiCollected: number;
  refundsDeducted: number;
  closingBalance: number;
  variance: number;
  status: "Balanced" | "Variance Detected" | "Open";
}

// 12.4 Insurance & TPA Claims Desk
export type TpaProvider = "Star Health" | "HDFC ERGO" | "ICICI Lombard" | "Medi Assist" | "Vidal Health" | "Care Health" | "PM-JAY Scheme" | "CGHS Scheme";
export type ClaimStatus = "Submitted" | "Pre-authorized" | "Under Review" | "Approved" | "Rejected" | "Settled";

export interface InsuranceClaim {
  id: string;
  claimNo: string;
  patientId: string;
  patientName: string;
  tpaProvider: TpaProvider;
  policyNo: string;
  admissionDate: string;
  claimAmount: number;
  approvedAmount: number;
  copayAmount: number;
  status: ClaimStatus;
  submissionDate: string;
  settlementDate?: string;
  settlementUtr?: string;
  admissionType?: "IPD" | "OPD" | "Emergency" | "Day Care";
  dischargeDate?: string;
  rejectionReason?: string;
  queryNotes?: string;
  linkedInvoiceId?: string;
}

export interface InsurancePatientRecord {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  contactNo: string;
  tpaProvider: TpaProvider;
  policyNo: string;
  coverageType: "Comprehensive Cashless" | "Government Scheme" | "Corporate Floater" | "Senior Citizen Special";
  totalSumInsured: number;
  availableCoverage: number;
  primaryInsuredName: string;
  relationship: string;
  activeClaimsCount: number;
  lastClaimDate?: string;
}

export interface TpaProviderMetric {
  provider: TpaProvider;
  totalClaims: number;
  approvedClaims: number;
  rejectedClaims: number;
  approvalRatio: number;
  avgTatDays: number;
  totalSettledAmount: number;
  pendingClaimsCount: number;
}

// Central Store Inventory & Stock
export interface InventoryItem {
  id: string;
  itemCode: string;
  name: string;
  category: "Surgical Consumables" | "PPE & Hygiene" | "Diagnostic Reagents" | "Linens & Bedding" | "Wound Care" | "General Medical Supplies";
  stockLevel: number;
  unit: string;
  reorderLevel: number;
  leadTimeDays: number;
  supplierName: string;
  unitCost: number;
  status: "Adequate" | "Low Stock" | "Reorder Placed";
  expiryDate?: string;
  batchNumber?: string;
  isCritical?: boolean;
  lastAuditDate?: string;
}

export interface StockIndent {
  id: string;
  indentNo: string;
  department: string;
  requestedBy: string;
  items: { itemName: string; quantity: number }[];
  status: "Pending Approval" | "Dispatched" | "Received";
  requestedAt: string;
}

// Module F19: Stock Movement & Adjustment Types
export type MovementType =
  | "Indent Dispatch"
  | "Procurement Delivery"
  | "Pharmacy Dispensing"
  | "Sales Return"
  | "Stock Adjustment"
  | "Initial Stock";

export type MovementDirection = "IN" | "OUT";

export interface StockMovementRecord {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  category: string;
  type: MovementType;
  direction: MovementDirection;
  quantity: number;
  unit: string;
  sourceModule: "Central Stores" | "Pharmacy" | "Procurement" | "OT" | "ICU" | "Emergency" | "Wards" | "Physical Audit";
  referenceId: string; // IND-XXXX, PO-XXXX, ADJ-XXXX, DISP-XXXX
  timestamp: string;
  performedBy: string;
  notes?: string;
}

export type AdjustmentType =
  | "Physical Count Correction"
  | "Write-off: Damage"
  | "Write-off: Expiry"
  | "Write-off: Shrinkage"
  | "Positive Adjustment";

export interface StockAdjustmentRecord {
  id: string;
  adjustmentNo: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  category: string;
  adjustmentType: AdjustmentType;
  previousStock: number;
  adjustedStock: number;
  variance: number; // e.g. -50 or +20
  unit: string;
  unitCost: number;
  totalVarianceValue: number;
  reason: string; // MANDATORY - Rule F19-CANNOT-3
  authorizedBy: string;
  timestamp: string;
  requiresDualApproval: boolean; // Rule F19-CANNOT-4 (> ₹25,000)
  approvalStatus: "Approved" | "Pending Dual Authorization";
  notes?: string;
}

// Biomedical & Facility Assets Registry
export type AssetCategory = "Diagnostic & Imaging" | "Life Support" | "OT Equipment" | "Monitoring" | "Facility Infrastructure";
export type AssetMaintenanceStatus = "Operational" | "Under Maintenance" | "Calibration Due" | "Decommissioned";

export interface BiomedicalAsset {
  id: string;
  assetCode: string;
  name: string;
  category: AssetCategory;
  model: string;
  serialNo: string;
  department: string;
  floor: string;
  installedRoom?: string;
  purchaseDate: string;
  purchaseCost: number;
  warrantyExpiry: string;
  amcCmcContract: "Active" | "Expired" | "Under Renewal";
  vendorName: string;
  nextPPMDate: string;
  maintenanceStatus: AssetMaintenanceStatus;
  lastCalibrationDate?: string;
  isLoaned?: boolean;
  currentLoanDepartment?: string;
  expectedReturnDate?: string;
  decommissionedDate?: string;
  decommissionReason?: string;
}

// Module F20: Asset Allocation & Temporary Loans
export interface AssetAllocationRecord {
  id: string;
  allocationNo: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  fromDepartment: string;
  toDepartment: string;
  fromFloor: string;
  toFloor: string;
  fromRoom?: string;
  toRoom?: string;
  allocatedBy: string;
  allocatedAt: string;
  allocationType: "Permanent Transfer" | "Temporary Loan";
  expectedReturnDate?: string;
  returnedAt?: string;
  returnedBy?: string;
  status: "Active" | "Returned";
  purposeNotes?: string;
}

// Module F20: Corrective Breakdown Repairs
export type RepairStatus = "Reported" | "In Progress" | "Resolved" | "Escalated to Vendor";
export type RepairPriority = "Low" | "Medium" | "High" | "Critical";

export interface RepairTicket {
  id: string;
  ticketNo: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  department: string;
  reportedBy: string;
  reportedAt: string;
  faultDescription: string;
  priority: RepairPriority;
  assignedTechnicianOrVendor: string;
  repairCost?: number;
  partsUsed?: string;
  downtimeStart: string;
  downtimeEnd?: string;
  resolutionNotes?: string;
  status: RepairStatus;
  resolvedBy?: string;
  resolvedAt?: string;
  requiresStepUpAuth?: boolean; // high-value repairs > ₹50,000
}

// Module F20: Asset History Audit Timeline
export type AssetEventType =
  | "Registration"
  | "PPM Certified"
  | "Breakdown Reported"
  | "Repair Completed"
  | "Allocation / Transfer"
  | "Warranty Renewed"
  | "Decommissioned";

export interface AssetHistoryEvent {
  id: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  eventType: AssetEventType;
  timestamp: string;
  actor: string;
  title: string;
  details: string;
  referenceId?: string;
}

export interface Surgeon extends BaseStaff {
  role: "Surgeon";
  specialty: string;
  qualification: string;
  caseAccess: "Internal" | "Requested" | "External";
  nextAvailable: string;
}

export interface Ambulance {
  id: string;
  vehicleNo: string;
  baseLocation: string;
  driverName: string;
  status: "available" | "en-route" | "on-call" | "maintenance";
  capacity: number;
  lastDispatchAt?: string;
}

/* ---------------------------------- Patient --------------------------------- */

export type PatientRelationshipStatus = "new" | "active" | "inactive" | "duplicate-flagged";
export type OPDStatus = "registered" | "waiting" | "in-consultation" | "follow-up-scheduled" | "completed";
export type IPDStatus = "admitted" | "under-treatment" | "transfer-requested" | "discharge-pending" | "discharged";
export type ConsentStatus = "granted" | "restricted" | "revoked";

export interface PatientConsent {
  status: ConsentStatus;
  dataSharing: string[];
  restrictions: string[];
  recordedOn: string;
  expiresOn?: string;
}

export interface OPDRecord {
  id: string;
  registrationDate: string;
  doctor: string;
  department: string;
  status: OPDStatus;
  visitReason: string;
  queueToken?: string;
  consultationNotes?: string;
  followUpDate?: string;
  prescriptions: string[];
}

export interface IPDRecord {
  id: string;
  admissionDate: string;
  dischargeDate?: string;
  department: string;
  bedAssignment: string;
  doctor: string;
  diagnosis: string;
  status: IPDStatus;
  treatmentPlan: string;
  dischargeSummary?: string;
  transferRequests: string[];
}

export interface PatientDocument {
  id: string;
  type: string;
  name: string;
  uploadedOn: string;
  generatedBy: string;
  url: string;
}

export interface HospitalRelationship {
  hospitalId: string;
  hospitalName: string;
  status: PatientRelationshipStatus;
  relationshipEstablishedOn: string;
  consent: PatientConsent;
  opdHistory: OPDRecord[];
  ipdHistory: IPDRecord[];
  documents: PatientDocument[];
  billingStatus: {
    totalOutstanding: number;
    totalSpent: number;
    lastBillingDate?: string;
  };
}

export type AcquisitionChannel =
  | "Self-Referral"
  | "Doctor Referral"
  | "Insurance Network"
  | "Walk-in"
  | "Online Booking"
  | "Corporate Health Partner";

export interface Patient {
  id: string;
  qlynoPatientId: string;
  uhid?: string;
  name: string;
  avatarUrl?: string;
  dateOfBirth: string;
  gender: "Male" | "Female" | "Other";
  phone: string;
  email: string;
  bloodGroup: string;
  address: string;
  acquisitionChannel?: AcquisitionChannel;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  identifiers: {
    aadhar?: string;
    pan?: string;
    idNo?: string;
  };
  globalStatus: "active" | "inactive";
  createdOn: string;
  lastModified: string;
  hospitalRelationships: HospitalRelationship[];
  primaryHospitalId: string;
  tags: string[];
}

/* -------------------------------- Appointment -------------------------------- */

export type AppointmentStatus =
  | "confirmed"
  | "waiting"
  | "in-consultation"
  | "completed"
  | "cancelled"
  | "no-show"
  | "rescheduled"
  | "registered";

export interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  qlynoPatientId: string;
  doctorName: string;
  doctorId: string;
  clinic: string;
  date: string;
  time: string;
  type: "In-person" | "Follow-up" | "Video";
  status: AppointmentStatus;
  reason: string;
  queueToken?: string;
  waitTime?: number;
}

/* ---------------------------------- Vendor ----------------------------------- */

export type VendorStatus = "pending" | "under-review" | "verified" | "needs-info" | "rejected" | "suspended";

export interface Vendor {
  id: string;
  name: string;
  logoUrl?: string;
  categories: string[];
  contactPerson: string;
  email: string;
  phone: string;
  serviceAreas: string[];
  status: VendorStatus;
  rating: number;
  activeOrders: number;
  onTimeDeliveryRate: number;
  outstandingPayable: number;
  joinedOn: string;
}

export type ProcurementRequestStatus =
  | "draft"
  | "open"
  | "closing-soon"
  | "closed"
  | "awarded"
  | "cancelled";

export interface ProcurementRequest {
  id: string;
  title: string;
  category: string;
  quantity: number;
  requiredBy: string;
  urgency: "normal" | "urgent" | "critical";
  status: ProcurementRequestStatus;
  quotesReceived: number;
  linkedCase?: string;
}

/* ----------------------------------- Billing ---------------------------------- */

export type InvoiceStatus = "draft" | "issued" | "partially-paid" | "paid" | "cancelled" | "refunded";
export type EncounterType = "OPD" | "IPD" | "Daycare" | "Emergency";
export type ServiceCategory = "Consultation" | "Surgery" | "Diagnostics" | "Pharmacy" | "Bed Charges" | "Package";

export interface InvoiceLineItem {
  id: string;
  name: string;
  category: ServiceCategory;
  sacCode?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // percentage e.g. 5, 12, 18
  total: number;
  procurementItemId?: string;
  labOrderId?: string;
  prescriptionId?: string;
}

export interface InterimDeposit {
  id: string;
  amount: number;
  date: string;
  mode: "Cash" | "Card" | "UPI" | "Insurance" | "Online";
  receiptNo: string;
  cashierName: string;
  notes?: string;
}

export interface DiscountApplication {
  typeId: string;
  typeName: string;
  percentage?: number;
  flatAmount: number;
  appliedBy: string;
  approvedBy?: string;
  status: "Applied" | "Pending Approval" | "Rejected";
  reason?: string;
  appliedAt: string;
}

export interface DiscountType {
  id: string;
  name: string;
  category: "Senior Citizen" | "Staff Discount" | "Corporate / Insurance Rate" | "Promotional Camp" | "Compassionate Waiver";
  defaultPercentage?: number;
  defaultFlatAmount?: number;
  eligibilityCriteria: string;
  requiresSupervisorApproval: boolean;
  isActive: boolean;
}

export interface RefundRecord {
  id: string;
  invoiceId: string;
  invoiceNo: string;
  patientName: string;
  amount: number;
  reason: string;
  reasonCategory: "Clinical Cancellation" | "Billing Dispute" | "Service Dissatisfaction" | "Duplicate Payment";
  requestedBy: string;
  approvedBy?: string;
  status: "Requested" | "Approved" | "Processed" | "Rejected";
  timestamp: string;
  paymentMode: "Cash" | "Bank Transfer" | "Original Mode";
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  patientName: string;
  patientId: string;
  service: string;
  encounterType?: EncounterType;
  serviceCategory?: ServiceCategory;
  department?: string;
  doctorName?: string;
  amount: number; // Gross amount
  subtotal?: number;
  taxAmount?: number;
  paid: number;
  outstanding: number;
  status: InvoiceStatus;
  issuedOn: string;
  method?: "Cash" | "Card" | "UPI" | "Insurance" | "Online";
  lineItems?: InvoiceLineItem[];
  interimDeposits?: InterimDeposit[];
  discount?: DiscountApplication;
  refunds?: RefundRecord[];
  linkedCaseId?: string;
  linkedProcurementItemIds?: string[];
  dischargeCleared?: boolean;
}

/* ------------------------------------- Lab ------------------------------------ */

export type LabOrderStatus =
  | "created"
  | "verified"
  | "scheduled"
  | "sample-pending"
  | "collected"
  | "processing"
  | "awaiting-validation"
  | "validated"
  | "released"
  | "amended"
  | "cancelled"
  | "rejected";

export interface LabOrder {
  id: string;
  orderNo: string;
  patientId?: string;
  patientName: string;
  uhid?: string;
  age?: number;
  gender?: "Male" | "Female" | "Other";
  test: string;
  department?: string;
  orderingDoctor: string;
  source: "Direct" | "Doctor Order" | "Clinic Referral" | "Hospital Order" | "OPD" | "IPD" | "Emergency" | "OT";
  priority?: "Routine" | "Stat";
  sampleType?: string;
  sampleId?: string;
  patientLocation?: string;
  status: LabOrderStatus;
  orderedOn: string;
  tat: string;
  critical?: boolean;
  criticalDetails?: string;
  assignedCollector?: string;
  collectedAt?: string;
  assignedAnalyzer?: string;
  expectedCompletionTime?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  clinicianNotified?: boolean;
  tariffId?: string;
  price?: number;
  isExternal?: boolean;
  referenceLabName?: string;
  reportUrl?: string;
}

export interface SampleCollectionTask {
  taskId: string;
  orderId: string;
  patientName: string;
  uhid: string;
  patientLocation: string;
  testName: string;
  sampleType: string;
  barcodeId: string;
  priority: "Routine" | "Stat";
  scheduledAt: string;
  status: "Pending" | "Collected" | "Rejected";
  assignedCollector?: string;
  collectedAt?: string;
  rejectionReason?: string;
}

export interface ExternalLabReport {
  id: string;
  orderId?: string;
  patientId: string;
  patientName: string;
  uhid: string;
  referenceLabName: string;
  testName: string;
  sampleType: string;
  receivedAt: string;
  reportFileUrl: string;
  verifyingPathologist?: string;
  verificationStatus: "Pending Verification" | "Verified" | "Rejected";
  verificationNotes?: string;
  verifiedAt?: string;
}

export interface LabTestCatalogItem {
  id: string;
  testCode: string;
  testName: string;
  department: string;
  sampleType: string;
  referenceRange: string;
  unit: string;
  turnaroundHours: number;
  tariffId: string;
  price: number;
  criticalLow?: number;
  criticalHigh?: number;
}

export interface AnalyzerRegistryItem {
  id: string;
  analyzerId: string;
  name: string;
  model: string;
  department: string;
  status: "Operational" | "Maintenance" | "Calibration Due";
  dailyTestVolume: number;
  lastCalibrationDate: string;
  nextCalibrationDate: string;
}

export interface CriticalThresholdItem {
  id: string;
  testCode: string;
  testName: string;
  lowPanic: number;
  highPanic: number;
  unit: string;
  appliesTo: "All" | "Adults" | "Pediatric" | "Neonates" | "Female Only" | "Male Only";
  lastAuditedAt: string;
  auditedBy: string;
}

export interface RejectionReasonItem {
  id: string;
  code: string;
  reason: string;
  category: "Specimen Quality" | "Identification" | "Volume" | "Transport";
  standardAction: string;
}

/* --------------------------------- Notifications -------------------------------- */

export type NotificationCategory =
  | "appointment"
  | "billing"
  | "lab"
  | "staff"
  | "vendor"
  | "emergency"
  | "system";

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  severity: "info" | "success" | "warning" | "critical";
}

/* ----------------------------------- Audit Log ----------------------------------- */

export interface AuditLogEntry {
  id: string;
  actor: string;
  actorRole: string;
  action: string;
  entity: string;
  entityId: string;
  timestamp: string;
  ipAddress: string;
  status: "success" | "failed";
}

/* --------------------------------- Roles & Permissions ---------------------------- */

export interface PermissionModule {
  module: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
}

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: PermissionModule[];
  system: boolean;
}

/* ----------------------------------- Nav / Misc ------------------------------------ */

export interface StatTrend {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
  icon?: string;
}

/* ----------------------------- 13. Hospital & Doctor Verification ----------------------------- */

export type VerificationType =
  | "Hospital Identity"
  | "Hospital Registration"
  | "Facility Evidence"
  | "Admin Identity"
  | "Doctor Affiliation"
  | "Specialty / Qualification"
  | "Ambulance Capability"
  | "Emergency Capability";

export type VerificationStatus =
  | "Pending"
  | "Under Review"
  | "Verified"
  | "Needs More Information"
  | "Rejected"
  | "Suspended";

export interface VerificationDocument {
  id: string;
  name: string;
  type: string;
  documentNumber?: string;
  fileUrl?: string;
  fileSize: string;
  uploadedAt: string;
  status: "Verified" | "Pending Review" | "Flagged / Rejected" | "Expiring Soon";
  expiryDate?: string;
  rejectionReason?: string;
}

export interface VerificationTimelineEvent {
  id: string;
  status: VerificationStatus;
  actorName: string;
  actorRole: string;
  timestamp: string;
  notes: string;
}

export interface VerificationCase {
  id: string;
  caseNo: string;
  subjectName: string;
  subjectId: string;
  subjectType: "Hospital" | "Doctor" | "Admin" | "Ambulance Service" | "Emergency Dept";
  type: VerificationType;
  status: VerificationStatus;
  submittedAt: string;
  updatedAt: string;
  reviewerName?: string;
  reviewerRole?: string;
  reviewerDecision?: "Approved" | "Rejected" | "Needs More Information";
  decisionReason?: string;
  documents: VerificationDocument[];
  timeline: VerificationTimelineEvent[];
  expiryDate?: string;
  daysUntilExpiry?: number;
  publicSearchVisible: boolean;
  metadata: {
    legalName?: string;
    registrationNo?: string;
    registeredAddress?: string;
    contactEmail?: string;
    contactPhone?: string;
    ownershipType?: string;
    facilityAreaSqFt?: number;
    specialtyClaims?: string[];
    operatingHours?: string;
    ambulanceFleetCount?: number;
  };
}

export interface DoctorAffiliationVerification {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  qualification: string;
  registrationNo: string;
  avatarUrl?: string;
  hospitalAffiliationConfirmed: boolean;
  hospitalAffirmedAt?: string;
  platformCredentialsVerified: boolean;
  platformVerifiedAt?: string;
  platformReviewerName?: string;
  publicSearchStatus: "Live / Searchable" | "Blocked (Pending Platform Review)" | "Blocked (Unconfirmed Affiliation)" | "Suspended";
  documentsCount: number;
  affiliationType: "Full-Time Consultant" | "Visiting Specialist" | "Honorary Surgeon" | "On-Call Emergency";
}

export interface CapabilityVerification {
  id: string;
  capabilityType: "Ambulance Fleet" | "24/7 Emergency & Trauma" | "ICU Critical Care" | "Blood Bank Storage";
  title: string;
  serviceDetails: string;
  operatingHours: string;
  fleetCount?: number;
  traumaLevel?: string;
  status: VerificationStatus;
  verifiedAt?: string;
  reviewerName?: string;
  publicBadgeActive: boolean;
  complianceNotes: string;
  evidenceDocs: string[];
}

export interface ExpiryAlertItem {
  id: string;
  documentName: string;
  subjectName: string;
  subjectType: "Hospital" | "Doctor" | "Fleet / Facility";
  licenseNumber: string;
  issuingAuthority: string;
  expiryDate: string;
  daysRemaining: number;
  urgency: "Critical Expired" | "High (<30 Days)" | "Medium (<60 Days)";
  publicImpact: string;
  status: "Action Required" | "Renewal Submitted" | "Verified";
}

/* ----------------------------- 14. Security, Privacy & Access Control ----------------------------- */

export type DataScope =
  | "Self Only"
  | "Department Wide"
  | "Branch Wide"
  | "Organization Wide"
  | "Restricted Clinical";

export interface RBACPermission {
  module: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
  export: boolean;
  emergencyOverride: boolean;
  dataScope: DataScope;
}

export interface RBACRole {
  id: string;
  name: string;
  description: string;
  userCount: number;
  system: boolean;
  branchScope: string;
  departmentScope: string;
  mfaEnforced: boolean;
  permissions: RBACPermission[];
}

export interface SecuritySession {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  status: "Active" | "Idle" | "Revoked" | "Expired";
  isSuspicious?: boolean;
  suspiciousReason?: string;
}

export interface MFAPolicy {
  roleId: string;
  roleName: string;
  status: "Enforced" | "Grace Period" | "Optional";
  allowedMethods: ("TOTP Authenticator" | "FIDO2 Security Key" | "SMS OTP")[];
  graceDaysRemaining?: number;
  complianceRate: number;
  enforcedUserCount: number;
}

export interface BreakGlassSession {
  id: string;
  tokenNo: string;
  requesterId: string;
  requesterName: string;
  requesterRole: string;
  targetPatientId: string;
  targetPatientName: string;
  resourceScope: string;
  reason: string;
  grantedAt: string;
  expiresAt: string;
  durationMinutes: number;
  status: "Active" | "Expired" | "Revoked";
  revokedAt?: string;
  revokedBy?: string;
}

export interface AuditLogDetailedEntry {
  id: string;
  actor: string;
  actorRole: string;
  action: string;
  module: string;
  entity: string;
  entityId: string;
  timestamp: string;
  ipAddress: string;
  status: "success" | "failed" | "step-up-verified";
  severity: "Low" | "Medium" | "High" | "Critical";
  reason?: string;
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
}

export interface DocumentSecurityPolicy {
  id: string;
  documentCategory: string;
  viewPermission: string[];
  downloadPermission: string[];
  sharePermission: string[];
  watermarkingEnforced: boolean;
  redactionRules: string[];
}

export interface PrivacyConsentRecord {
  id: string;
  patientId: string;
  patientName: string;
  externalOrgName: string;
  purpose: string;
  consentStatus: "Granted" | "Revoked" | "Expired";
  validUntil: string;
  dataMinimizationTier: "Full Medical Record" | "Restricted Diagnosis Only" | "Anonymized Billing";
}

export interface ConfigBackupSnapshot {
  id: string;
  snapshotName: string;
  type: "Full System Configuration" | "RBAC & Role Definitions" | "Audit Log Archive";
  createdAt: string;
  createdBy: string;
  fileSize: string;
  checksum: string;
  status: "Encrypted & Verified" | "Archived";
}

/* ----------------------------- 15. Admin Delegation Model ----------------------------- */

export type DelegationCapabilityScope =
  | "Reception & OPD Routing"
  | "Nurse Station & Shift Rostering"
  | "Doctor Operational Schedules"
  | "Billing & Financial Refunds"
  | "Lab & Radiology Operational Status"
  | "Pharmacy Inventory & Batches"
  | "OT Scheduling & Theatre Logistics"
  | "Emergency Escalation & Ambulance"
  | "Vendor Procurement Requests"
  | "Operational Reports";

export interface AdminDelegationGrant {
  id: string;
  grantToken: string;
  grantorName: string;
  grantorRole: string;
  delegateeId: string;
  delegateeName: string;
  delegateeRole: string;
  targetRole: string;
  capabilityScopes: DelegationCapabilityScope[];
  reason: string;
  grantedAt: string;
  expiresAt: string;
  durationHours: number;
  status: "Active" | "Expired" | "Revoked";
  revokedAt?: string;
  actionsCount: number;
}

export interface DelegationActionLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  delegatedBy?: string;
  actionDescription: string;
  module: string;
  entity: string;
  entityId: string;
  attributionString: string;
  reason: string;
}

export interface ModuleBoundaryDefinition {
  module: string;
  iconName: string;
  adminCanScope: string[];
  adminCannotBoundary: string[];
  riskLevel: "Standard Operational" | "Restricted Clinical Boundary" | "High Financial Risk";
}

/* ----------------------------- Extended Pharmacy & Dispensing ----------------------------- */

export interface PrescriptionItem {
  medicineId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  unitPrice: number;
  scheduleH1?: boolean;
  instructions?: string;
}

export interface PharmacyPrescription {
  id: string;
  prescriptionNumber: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  wardBed?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  source: "OPD" | "IPD" | "Emergency";
  priority: "Routine" | "Stat Emergency";
  status: "New" | "In Progress" | "Ready for Pickup" | "Dispensed" | "Cancelled";
  prescribedAt: string;
  items: PrescriptionItem[];
  totalAmount: number;
  clinicalDiagnosis?: string;
}

export interface PharmacyPOItem {
  medicineId: string;
  medicineName: string;
  orderedQuantity: number;
  unitCost: number;
  totalCost: number;
  batchNumber?: string;
}

export interface PharmacyPurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  supplierContact: string;
  orderedAt: string;
  expectedDelivery: string;
  status: "Ordered" | "Dispatched" | "Delayed" | "Received";
  items: PharmacyPOItem[];
  totalAmount: number;
  receivedAt?: string;
  receivedBy?: string;
}

export interface PharmacySupplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  categoriesSupplied: string[];
  leadTimeDays: number;
  reliabilityScore: number;
  activePOCount: number;
  status: "Active" | "Under Review";
}

export interface PharmacyStaffMember {
  id: string;
  name: string;
  role: "Chief Pharmacist" | "Clinical Pharmacist" | "Dispensing Pharmacist" | "Pharmacy Technician";
  shift: "Morning (08:00 - 16:00)" | "Evening (16:00 - 00:00)" | "Night (00:00 - 08:00)";
  dutyStatus: "On Duty" | "Off Duty" | "On Break";
  pharmacyCouncilRegNo: string;
  scheduleH1Authorized: boolean;
  todayDispensedCount: number;
  contactNumber: string;
}

export interface PharmacyBatchExpiry {
  id: string;
  medicineId: string;
  medicineName: string;
  category: string;
  batchNumber: string;
  manufacturer: string;
  expiryDate: string;
  daysRemaining: number;
  currentStock: number;
  unitPrice: number;
  fefoPriority: "Critical (<30d)" | "High (<60d)" | "Moderate (<90d)";
  quarantineStatus: "Active Stock" | "Quarantined" | "Written Off";
}

export interface PharmacySalesItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PharmacySalesRecord {
  id: string;
  receiptNumber: string;
  customerName: string;
  customerPhone: string;
  items: PharmacySalesItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalPaid: number;
  paymentMode: "Cash" | "UPI" | "Credit/Debit Card";
  dispensingPharmacist: string;
  timestamp: string;
}

export interface PharmacyReturnRecord {
  id: string;
  returnNumber: string;
  returnType: "Patient Return" | "Supplier Return" | "Expired / Damaged Write-Off";
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  quantity: number;
  unitPrice: number;
  totalRefundAmount: number;
  reason: string;
  linkedPrescriptionId?: string;
  patientName?: string;
  supplierName?: string;
  processedBy: string;
  timestamp: string;
  status: "Restocked & Refunded" | "Returned to Vendor" | "Written Off";
}

// ==========================================
// MODULE 16 — NOTIFICATION & ESCALATION CENTER
// ==========================================

export type HospitalNotificationEventType =
  | "Doctor delay"
  | "Emergency SOS"
  | "Surgery blocker"
  | "Vendor quote"
  | "Bed shortage"
  | "Staffing gap"
  | "Security alert"
  | "New appointment/check-in"
  | "Critical lab/result"
  | "Ambulance dispatch"
  | "Surgeon request"
  | "Vendor delivery delay";

export type HospitalNotificationCategory =
  | "Emergency"
  | "Staffing"
  | "Operational"
  | "Security"
  | "Vendor"
  | "Clinical"
  | "Appointments";

export type NotificationSeverity = "critical" | "high" | "medium" | "low" | "info";

export type NotificationStatus = "Unread" | "Read" | "Acknowledged" | "Dismissed";

export type NotificationChannel = "in-app" | "email" | "sms" | "whatsapp";

export interface HospitalNotification {
  id: string;
  title: string;
  message: string;
  eventType: HospitalNotificationEventType;
  category: HospitalNotificationCategory;
  severity: NotificationSeverity;
  timestamp: string;
  status: NotificationStatus;
  targetRoles: string[];
  adminRecipient: boolean;
  linkUrl: string;
  escalationLevel?: "L1" | "L2" | "L3" | "Not Triggered";
  sourceDepartment?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface NotificationEventRule {
  id: string;
  eventType: HospitalNotificationEventType;
  category: HospitalNotificationCategory;
  defaultRecipients: string[];
  adminDirectRecipient: boolean;
  enabledChannels: NotificationChannel[];
  enabled: boolean;
  hasEscalationLadder: boolean;
  description: string;
}

export interface EscalationLadderStep {
  level: number;
  name: string;
  role: string;
  thresholdMinutes: number;
  channel: NotificationChannel;
}

export interface EscalationLadder {
  id: string;
  name: string;
  eventType: HospitalNotificationEventType;
  department: string;
  enabled: boolean;
  steps: EscalationLadderStep[];
  fallbackRecipient: string;
  autoResolveOnAction: boolean;
}

export interface EscalationStepLog {
  step: string;
  notifiedAt: string;
  recipient: string;
  channel: NotificationChannel;
  status: "Delivered" | "Acknowledged" | "Timed Out";
}

export interface EscalationRecord {
  id: string;
  incidentCode: string;
  eventType: HospitalNotificationEventType;
  title: string;
  department: string;
  triggeredAt: string;
  currentStep: "L1" | "L2" | "L3";
  stepsTaken: EscalationStepLog[];
  status: "Not Triggered" | "In Progress" | "Escalated" | "Resolved";
  durationMinutes: number;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}

// ==========================================
// MODULE 17 — REPORTS & ANALYTICS
// ==========================================

export type HospitalReportCategory =
  | "Patient flow"
  | "Patient Flow"
  | "Bed/ward"
  | "Bed/Ward"
  | "Doctors"
  | "Nursing"
  | "Reception"
  | "Surgery"
  | "Diagnostics"
  | "Pharmacy"
  | "Finance"
  | "Vendor"
  | "Emergency"
  | "Security";

export type ReportSensitivityLevel =
  | "Standard Operational"
  | "Confidential Financial"
  | "Restricted Security"
  | "Clinical Governance";

export interface ReportKPI {
  label: string;
  value: string | number;
  delta?: string;
  trend?: "up" | "down" | "neutral";
  isPositive?: boolean;
}

export interface ReportChartKey {
  dataKey: string;
  name: string;
  color: string;
  type?: "bar" | "line" | "area";
}

export interface ReportTableColumn {
  key: string;
  label: string;
  isNumeric?: boolean;
  isBadge?: boolean;
  badgeTone?: (val: any) => string;
}

export interface HospitalReportDefinition {
  id: string;
  code: string;
  title: string;
  category: HospitalReportCategory;
  description: string;
  sensitivity: ReportSensitivityLevel;
  requiredPermission: string;
  defaultPeriod: string;
  kpis: ReportKPI[];
  chartType: "bar" | "line" | "area" | "pie" | "composed";
  chartData: any[];
  chartKeys: ReportChartKey[];
  tableColumns: ReportTableColumn[];
  tableData: any[];
}

export interface CustomReportQuery {
  id: string;
  title: string;
  category: HospitalReportCategory;
  dimension: string;
  metrics: string[];
  dateRange: string;
  visualization: "bar" | "line" | "area" | "table";
}

export interface ScheduledReportConfig {
  id: string;
  reportId: string;
  reportTitle: string;
  category: HospitalReportCategory;
  frequency: "Daily" | "Weekly" | "Monthly" | "Quarterly";
  deliveryTime: string;
  dayOfWeek?: string;
  format: "PDF" | "CSV" | "Excel";
  recipients: string[];
  enabled: boolean;
  lastSentAt?: string;
  nextRunAt: string;
}

// ==========================================
// MODULE F21 — ANALYTICS (EXECUTIVE & STRATEGIC COCKPIT) EXTENDED
// ==========================================

export interface PatientAcquisitionChannelMetric {
  channel: AcquisitionChannel;
  volume: number;
  sharePercent: number;
  conversionRate: number;
  avgRevenuePerPatient: number;
  growthYoY: string;
}

export interface PatientAcquisitionMonthlyTrend {
  month: string;
  selfReferral: number;
  doctorReferral: number;
  insuranceNetwork: number;
  walkIn: number;
  onlineBooking: number;
  corporate: number;
  total: number;
}

export interface PatientAcquisitionSummary {
  totalAcquired: number;
  topChannel: AcquisitionChannel;
  channelConversionRate: number;
  channelBreakdown: PatientAcquisitionChannelMetric[];
  monthlyTrends: PatientAcquisitionMonthlyTrend[];
}

export interface AppointmentConversionStageMetric {
  stage: "Booked" | "Checked-in" | "Completed" | "Cancelled" | "No-show" | "Rescheduled";
  count: number;
  percentage: number;
  dropOffRate?: number;
}

export interface SpecialtyConversionMetric {
  department: string;
  booked: number;
  completed: number;
  cancelled: number;
  noShow: number;
  conversionRate: number;
}

export interface AppointmentConversionSummary {
  totalBooked: number;
  overallConversionRate: number;
  leadTimeHoursAvg: number;
  stages: AppointmentConversionStageMetric[];
  bySpecialty: SpecialtyConversionMetric[];
  monthlyFunnelTrend: {
    month: string;
    booked: number;
    completed: number;
    conversionRate: number;
  }[];
}

export interface NewVsReturningCohortMetric {
  period: string;
  newPatients: number;
  returningPatients: number;
  newPatientShare: number;
  returningPatientShare: number;
}

export interface NewVsReturningSpecialtySplit {
  department: string;
  newPatients: number;
  returningPatients: number;
  newPatientRatio: number;
}

export interface NewVsReturningSummary {
  totalUniquePatients: number;
  newPatientsYTD: number;
  returningPatientsYTD: number;
  repeatVisitRatio: number;
  monthlyTrend: NewVsReturningCohortMetric[];
  specialtySplit: NewVsReturningSpecialtySplit[];
}

export interface DoctorClinicalPerformanceRecord {
  doctorId: string;
  doctorName: string;
  department: string;
  appointmentVolume: number;
  completedConsultations: number;
  avgConsultDurationMinutes: number;
  noShowRate: number;
  patientRating: number;
  totalReviews: number;
  otProceduresCount: number;
  // Financial slice cross-referenced from F18 (Doctor Revenue)
  f18GrossRevenue: number;
  f18NetRealized: number;
}

export interface DoctorPerformanceSummary {
  totalActiveDoctors: number;
  hospitalAvgConsultDuration: number;
  avgDoctorRating: number;
  avgNoShowRate: number;
  doctors: DoctorClinicalPerformanceRecord[];
}

export interface DepartmentOperationalPerformanceRecord {
  departmentId: string;
  departmentName: string;
  totalPatientVolume: number;
  opdConsultations: number;
  ipdAdmissions: number;
  bedOccupancyRate: number;
  alosDays: number;
  readmissionRate30Day: number;
  otSurgeriesPerformed: number;
  // Financial slice cross-referenced from F18 (Department Revenue)
  f18GrossRevenue: number;
  f18ContributionMargin: number;
}

export interface DepartmentPerformanceSummary {
  hospitalBedOccupancy: number;
  hospitalAlosDays: number;
  hospitalReadmissionRate: number;
  departments: DepartmentOperationalPerformanceRecord[];
}

export interface PatientRetentionCohortMetric {
  timeframe: "30 Days" | "60 Days" | "90 Days" | "180 Days" | "365 Days";
  eligibleCohortSize: number;
  returnedCount: number;
  retentionRate: number;
  benchmarkRate: number;
}

export interface FollowUpAdherenceMetric {
  department: string;
  scheduledFollowUps: number;
  completedFollowUps: number;
  adherenceRate: number;
}

export interface PatientRetentionSummary {
  overall30DayRetention: number;
  overall90DayRetention: number;
  annualChurnRate: number;
  avgDaysBetweenVisits: number;
  cohorts: PatientRetentionCohortMetric[];
  followUpAdherence: FollowUpAdherenceMetric[];
  monthlyRetentionTrend: {
    cohortMonth: string;
    m1Retention: number;
    m3Retention: number;
    m6Retention: number;
    m12Retention: number;
  }[];
}

export interface NoShowMetric {
  totalScheduled: number;
  totalNoShows: number;
  overallNoShowRate: number;
  estimatedRevenueLoss: number;
}

export interface NoShowByDepartmentMetric {
  department: string;
  scheduled: number;
  noShows: number;
  noShowRate: number;
}

export interface NoShowByDoctorMetric {
  doctorId: string;
  doctorName: string;
  department: string;
  scheduled: number;
  noShows: number;
  noShowRate: number;
}

export interface NoShowBySlotMetric {
  timeSlot: string;
  scheduled: number;
  noShows: number;
  noShowRate: number;
}

export interface NoShowSummary {
  metrics: NoShowMetric;
  byDepartment: NoShowByDepartmentMetric[];
  byDoctor: NoShowByDoctorMetric[];
  byTimeSlot: NoShowBySlotMetric[];
  byDayOfWeek: {
    day: string;
    noShowRate: number;
  }[];
}

export interface ExtendedRevenueTrajectoryMetric {
  quarter: string;
  realizedRevenueLakhs: number;
  budgetedTargetLakhs: number;
  variancePercent: number;
  opdRevenueLakhs: number;
  ipdRevenueLakhs: number;
  pharmacyDiagnosticsLakhs: number;
}

export interface PayerMixShare {
  payerCategory: "Cash & Self-Pay" | "Private TPA / Cashless" | "Government Schemes (PM-JAY/CGHS)" | "Corporate Empanelment";
  revenueLakhs: number;
  sharePercent: number;
  settlementTurnaroundDays: number;
}

export interface ExtendedRevenueAnalyticsSummary {
  currentQuarterRealizedLakhs: number;
  currentQuarterTargetLakhs: number;
  quarterlyGrowthYoY: string;
  annualProjectedLakhs: number;
  revPABDaily: number;
  trajectory: ExtendedRevenueTrajectoryMetric[];
  payerMix: PayerMixShare[];
}

// ==========================================
// MODULE F22: REPORTS AWAITING REVIEW (CARE COORDINATION)
// ==========================================

export type ReportReviewSourceModule = "lab" | "radiology";
export type ReportReviewStatus = "pending_review" | "reviewed" | "clarification_requested";
export type PatientNotificationChannel = "sms" | "whatsapp" | "phone_call" | "portal";
export type ClarificationRequestType = "re-test" | "stain_reevaluation" | "radiologist_addendum";

export interface CareCoordinationReportReviewItem {
  id: string;
  reportId: string;
  sourceModule: ReportReviewSourceModule;
  orderId: string;
  patientId: string;
  patientName: string;
  patientUhid: string;
  patientPhone: string;
  patientAgeGender: string;
  testOrStudyName: string;
  modalityOrCategory: string;
  department: string;
  attendingDoctorId: string;
  attendingDoctorName: string;
  doctorSpecialty: string;
  releasedAt: string;
  waitingDuration: string;
  waitingDurationMinutes: number;
  isCritical: boolean;
  criticalDetails?: string;
  slaDeadlineMinutes: number;
  isOverdue: boolean;
  status: ReportReviewStatus;
  keyFindings: string;
  impression: string;
  referenceRangesOrSummary?: string;
  signedOffAt?: string;
  signedOffBy?: string;
  signedOffDoctorRegNo?: string;
  signOffNote?: string;
  auditStamp?: string;
  isPatientNotified?: boolean;
  patientNotificationId?: string;
  clarificationRequestId?: string;
}

export interface PatientNotificationRecord {
  id: string;
  reviewItemId: string;
  reportId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  testName: string;
  channel: PatientNotificationChannel;
  notifiedBy: string;
  notifiedByRole: string;
  notifiedAt: string;
  notes?: string;
  deliveryStatus: "Delivered" | "Pending" | "Failed";
}

export interface AddendumClarificationRequest {
  id: string;
  reviewItemId: string;
  reportId: string;
  sourceModule: ReportReviewSourceModule;
  patientName: string;
  testOrStudyName: string;
  requestedBy: string;
  requestedAt: string;
  requestType: ClarificationRequestType;
  clinicalReason: string;
  status: "sent_to_lab" | "sent_to_radiology" | "resolved";
  responseSummary?: string;
}

// ==========================================
// MODULE F23: COMMUNICATION HUB TYPES
// ==========================================

export type MessageTemplateCategory = "Appointment" | "Report" | "Follow-up" | "Broadcast" | "Clinical";
export type MessageChannel = "WhatsApp" | "SMS" | "Portal" | "Broadcast" | "Phone Call";
export type MessageTemplateStatus = "Active" | "Draft" | "Archived";

export interface MessageTemplate {
  id: string;
  templateId: string;
  name: string;
  category: MessageTemplateCategory;
  channel: MessageChannel;
  content: string;
  variables: string[];
  status: MessageTemplateStatus;
  createdBy: string;
  createdAt: string;
  usageCount?: number;
}

export interface WhatsAppGatewayMetrics {
  deliveryRate: number;
  readRate: number;
  apiHealth: "Operational" | "Degraded" | "Down";
  latencyMs: number;
  activeSessions: number;
  totalSentToday: number;
  totalFailedToday: number;
  webhookStatus: "Connected" | "Disconnected";
  status?: "Operational" | "Degraded" | "Down";
  phoneNumber?: string;
  dailySentCount?: number;
  dailyLimit?: number;
  averageLatencyMs?: number;
  lastPing?: string;
}

export interface WhatsAppMessageLog {
  id: string;
  messageId?: string;
  recipientName: string;
  recipientPhone: string;
  moduleSource: string;
  templateUsed?: string;
  templateName?: string;
  category?: string;
  contentSnippet: string;
  status: "Sent" | "Delivered" | "Read" | "Failed";
  timestamp: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  readAt?: string;
  errorMessage?: string;
  failureReason?: string;
  cost?: number;
}

export type WhatsAppAuditLogItem = WhatsAppMessageLog;

export interface PatientChatMessage {
  id: string;
  senderType: "patient" | "care_coordinator" | "nurse" | "doctor" | "Patient" | "Staff";
  senderName: string;
  content?: string;
  text?: string;
  timestamp: string;
  readAt?: string;
  status?: "Sent" | "Delivered" | "Read" | "Failed";
  attachment?: { name: string; type: string };
  isAttachment?: boolean;
  attachmentName?: string;
  attachmentType?: string;
}

export type ChatMessage = PatientChatMessage;

export interface PatientChatThread {
  id: string;
  threadId: string;
  patientId: string;
  patientName: string;
  patientUhid: string;
  patientPhone: string;
  avatarUrl?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  channel: "Portal";
  messages: PatientChatMessage[];
  department?: string;
  attendingDoctor?: string;
}

export type AppointmentMessageTrigger =
  | "booking_confirmation"
  | "reminder_24h"
  | "reminder_2h"
  | "reschedule"
  | "rescheduled"
  | "cancellation";

export interface AppointmentMessageRecord {
  id: string;
  appointmentId: string;
  patientName: string;
  patientUhid: string;
  patientPhone: string;
  doctorName: string;
  department: string;
  appointmentDate: string;
  appointmentTime: string;
  triggerType: AppointmentMessageTrigger;
  templateId: string;
  templateName: string;
  channel: "WhatsApp" | "SMS" | MessageChannel;
  status: "Scheduled" | "Sent" | "Delivered" | "Failed" | "Read";
  dispatchedAt?: string;
  scheduledFor?: string;
  sentAt?: string;
}

export interface ClinicalNote {
  id: string;
  noteId: string;
  patientId: string;
  patientName: string;
  patientUhid: string;
  authorDoctorId: string;
  authorDoctorName: string;
  doctorSpecialty: string;
  noteText: string;
  visibility: "Care Team" | "Specific Recipients";
  recipientRoles?: string[];
  priority: "Routine" | "Urgent";
  createdAt: string;
  readBy: {
    staffId: string;
    staffName: string;
    staffRole: string;
    readAt: string;
  }[];
  isAddendum?: boolean;
  parentNoteId?: string;
}

export type BroadcastType = "Code Blue" | "Operational" | "Emergency" | "Clinical Alert";
export type BroadcastScope = "Hospital-wide" | "Department" | "Floor" | "ICU / OT Complex";
export type BroadcastChannel = "SMS" | "WhatsApp" | "PA Screens" | "App Push";

export interface BroadcastRecord {
  id: string;
  broadcastId: string;
  type: BroadcastType;
  title: string;
  message: string;
  channels: BroadcastChannel[];
  targetScope: BroadcastScope;
  targetDetail?: string;
  triggeredBy: string;
  triggeredByRole: string;
  triggeredAt: string;
  status: "Delivered" | "Active" | "Expired";
  acknowledgedCount?: number;
  targetAudienceSize?: number;
}

export interface UnifiedDeliveryLogItem {
  id: string;
  sourceModule?:
    | "F1 Appointments"
    | "F3 Emergency"
    | "F5 Follow-ups"
    | "F13 Lab"
    | "F14 Radiology"
    | "F22 Reports Review"
    | "Reception"
    | "Care Team"
    | "Hospital Operations"
    | string;
  triggerSource?: string;
  recipientName: string;
  recipientUhid?: string;
  recipientContact: string;
  channel: "WhatsApp" | "SMS" | "Portal" | "Phone Call" | "Broadcast" | string;
  templateUsed?: string;
  messageSummary?: string;
  contentSnippet?: string;
  deliveryStatus?: "Delivered" | "Read" | "Sent" | "Failed" | string;
  status?: "Delivered" | "Read" | "Sent" | "Failed" | string;
  timestamp: string;
  failureReason?: string;
  metadata?: Record<string, any>;
}

export type DeliveryAuditLog = UnifiedDeliveryLogItem;

export type ReportNotificationKind = "sign_off" | "panic_value" | "portal_ready";

export interface ReportNotificationRecord {
  id: string;
  reportId: string;
  patientName: string;
  patientUhid: string;
  patientPhone: string;
  testName: string;
  sourceModule: "F13 Lab" | "F14 Radiology" | "F22 Reports Review";
  signedOffBy: string;
  kind: ReportNotificationKind;
  isCritical: boolean;
  channel: "WhatsApp" | "SMS" | "Portal" | "Phone Call";
  templateId: string;
  status: "Scheduled" | "Sent" | "Delivered" | "Read" | "Failed";
  dispatchedAt: string;
}

export type FollowUpReminderKind = "PostOp" | "ChronicReview" | "DiagnosticRepeat";

export interface FollowUpReminderRecord {
  id: string;
  patientName: string;
  patientUhid: string;
  patientPhone: string;
  doctorName: string;
  department: string;
  dueDate: string;
  recallType: FollowUpReminderKind;
  procedureOrCondition: string;
  channel: "WhatsApp" | "SMS";
  status: "Pending" | "Sent" | "Confirmed" | "Overdue";
  scheduledFor: string;
}

export type MedicationReminderType = "Medication" | "FollowUp" | "LabTest";

export interface MedicationReminderItem {
  id: string;
  patientName: string;
  patientUhid: string;
  patientPhone: string;
  doctorName: string;
  type: MedicationReminderType;
  medicationOrService: string;
  frequency: string;
  scheduledTime: string;
  channel: "WhatsApp" | "SMS";
  status: "Pending" | "Sent";
}

export * from "./content-resources";
export * from "./patient-reviews";
export * from "./documents";
export * from "./integrations";

