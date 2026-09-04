import type { RoleId } from "./domain";

export type LaboratoryProfile = "HOSPITAL_INTEGRATED" | "STANDALONE_PRIVATE" | "REFERENCE_B2B";
export type BillingOwner = "HMS_CENTRAL" | "LIS_INTERNAL" | "B2B_CONTRACT" | "NO_CHARGE";
export type PatientMasterOwner = "HMS" | "LABORATORY";
export type EntrySource = "DIRECT_LOGIN" | "HMS_SSO";
export type ChargeTrigger = "ORDER_CONFIRMED" | "SPECIMEN_ACCEPTED" | "TEST_STARTED";
export type LaboratoryChargeType = "TEST" | "PANEL" | "COLLECTION" | "HOME_COLLECTION" | "STAT_SURCHARGE" | "SERVICE" | "ADD_ON_TEST" | "REVERSAL";
export type BillingPostingStatus = "NOT_REQUIRED" | "READY_TO_POST" | "POSTING" | "POSTED" | "FAILED" | "REVERSED" | "RECONCILIATION_REQUIRED";
export type AdministrativeRole = "HOSPITAL_ADMIN" | "LAB_OWNER" | "LAB_ADMIN";
export type LaboratoryRole = "LAB_DIRECTOR" | "PATHOLOGIST" | "QUALITY_MANAGER" | "SECTION_SUPERVISOR" | "TECHNICIAN" | "RECEIVING_STAFF" | "ACCESSIONING_STAFF" | "PHLEBOTOMIST" | "WARD_COLLECTOR" | "COURIER" | "INVENTORY_USER" | "RECEPTION_CASHIER" | "AUDITOR";

export interface LoginCredentials { organizationCode: string; username: string; password: string; }

export interface LaboratorySession {
  tenantId: string; organizationCode: string; organizationName: string; organizationLogo?: string;
  laboratoryProfile: LaboratoryProfile; billingOwner: BillingOwner; patientMasterOwner: PatientMasterOwner;
  userId: string; userName: string; role: RoleId; permissions: string[];
  administrativeRoles: AdministrativeRole[]; laboratoryRoles: LaboratoryRole[];
  allowedSiteIds: string[]; allowedDepartmentIds: string[]; activeSiteId: string;
  entrySource: EntrySource; hmsReturnUrl?: string; delegation?: LabAdminDelegation;
}

export interface LabAdminDelegation {
  tenantId: string; userId: string; allowedSiteIds: string[]; allowedDepartmentIds: string[];
  assignableRoleIds: LaboratoryRole[]; assignablePermissionIds: string[];
  canInviteUsers: boolean; canDeactivateUsers: boolean; canCreateCustomLabRoles: boolean; canAssignClinicalRoles: boolean;
}

export interface LabUserMembership {
  id: string; tenantId: string; hospitalUserId: string; laboratoryUserId?: string; name: string; employeeId: string;
  roles: Array<AdministrativeRole | LaboratoryRole>; siteIds: string[]; departmentIds: string[];
  status: "ACTIVE" | "SUSPENDED" | "PENDING"; lastAccess?: string; authenticationSource: "HMS_SSO" | "LAB_LOGIN";
}

export interface LabAccessAuditEvent {
  id: string; tenantId: string; actor: string; targetUser: string; action: string;
  previousValue?: string; newValue?: string; timestamp: string; reason: string;
}

export interface LaboratoryChargeLine {
  id: string; tenantId: string; patientId: string; encounterId?: string; laboratoryOrderId: string; orderItemId?: string;
  chargeType: LaboratoryChargeType; serviceCode: string; description: string; quantity: number; unitPrice: number;
  grossAmount: number; discountAmount: number; taxableAmount: number; taxCode?: string; taxRate?: number; taxAmount: number; netAmount: number;
  billingOwner: BillingOwner;
}

export interface HospitalBillingPosting {
  id: string; tenantId: string; laboratoryOrderId: string; postingVersion: number; status: BillingPostingStatus;
  hmsBillId?: string; hmsBillNumber?: string; postedAmount?: number; postedAt?: string;
  failureReason?: string; lastAttemptAt?: string; reconciliationNote?: string;
}
