import type { LaboratorySession, LoginCredentials } from "@/lib/types/laboratory-session";

interface DemoAccount { credentials: LoginCredentials; session: LaboratorySession; }

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    credentials: { organizationCode: "SUNRISE-HOSP", username: "sanjeev", password: "demo123" },
    session: { tenantId: "TEN-SUNRISE", organizationCode: "SUNRISE-HOSP", organizationName: "Sunrise Hospital", laboratoryProfile: "HOSPITAL_INTEGRATED", billingOwner: "HMS_CENTRAL", patientMasterOwner: "HMS", userId: "USR-01", userName: "Dr. Sanjeev Kelkar", role: "lab_director", administrativeRoles: ["LAB_ADMIN"], laboratoryRoles: ["PATHOLOGIST"], permissions: ["billing.post.retry", "billing.reconcile", "reports.validate", "reports.release", "lab.users.manage", "lab.audit.view", "patient.search", "patient.view", "patient.create", "patient.update_demographics", "patient.override_duplicate_warning", "specimen.view", "specimen.receive"], allowedSiteIds: ["SITE-01"], allowedDepartmentIds: ["DEPT-01", "DEPT-02", "DEPT-03", "DEPT-05"], activeSiteId: "SITE-01", entrySource: "DIRECT_LOGIN", delegation: { tenantId: "TEN-SUNRISE", userId: "USR-01", allowedSiteIds: ["SITE-01"], allowedDepartmentIds: ["DEPT-01", "DEPT-02", "DEPT-03", "DEPT-05"], assignableRoleIds: ["PATHOLOGIST", "QUALITY_MANAGER", "SECTION_SUPERVISOR", "TECHNICIAN", "ACCESSIONING_STAFF", "PHLEBOTOMIST", "COURIER", "INVENTORY_USER", "RECEPTION_CASHIER", "AUDITOR"], assignablePermissionIds: ["patients.view", "orders.manage", "collection.manage", "specimen.view", "specimen.receive", "specimen.accession", "specimen.reject", "workbench.use", "results.enter", "quality.manage", "inventory.manage"], canInviteUsers: false, canDeactivateUsers: true, canCreateCustomLabRoles: false, canAssignClinicalRoles: true } },
  },
  {
    credentials: { organizationCode: "AAROGYA-LAB", username: "farah", password: "demo123" },
    session: { tenantId: "TEN-AAROGYA", organizationCode: "AAROGYA-LAB", organizationName: "Aarogya Diagnostics", laboratoryProfile: "STANDALONE_PRIVATE", billingOwner: "LIS_INTERNAL", patientMasterOwner: "LABORATORY", userId: "USR-08", userName: "Farah Sheikh", role: "reception_cashier", administrativeRoles: ["LAB_ADMIN"], laboratoryRoles: ["RECEPTION_CASHIER"], permissions: ["patients.create", "billing.collect", "billing.refund", "lab.users.manage", "lab.audit.view"], allowedSiteIds: ["SITE-02", "SITE-03"], allowedDepartmentIds: ["DEPT-04", "DEPT-08"], activeSiteId: "SITE-02", entrySource: "DIRECT_LOGIN", delegation: { tenantId: "TEN-AAROGYA", userId: "USR-08", allowedSiteIds: ["SITE-02", "SITE-03"], allowedDepartmentIds: ["DEPT-04", "DEPT-08"], assignableRoleIds: ["TECHNICIAN", "ACCESSIONING_STAFF", "PHLEBOTOMIST", "COURIER", "INVENTORY_USER", "RECEPTION_CASHIER", "AUDITOR"], assignablePermissionIds: ["patients.view", "orders.manage", "collection.manage", "billing.collect"], canInviteUsers: true, canDeactivateUsers: true, canCreateCustomLabRoles: true, canAssignClinicalRoles: true } },
  },
  {
    credentials: { organizationCode: "CENTRAL-REF", username: "aarti", password: "demo123" },
    session: { tenantId: "TEN-CENTRAL-REF", organizationCode: "CENTRAL-REF", organizationName: "Central Reference Laboratory", laboratoryProfile: "REFERENCE_B2B", billingOwner: "B2B_CONTRACT", patientMasterOwner: "LABORATORY", userId: "USR-10", userName: "Aarti Desai", role: "tenant_admin", administrativeRoles: ["LAB_OWNER"], laboratoryRoles: [], permissions: ["contracts.manage", "receivables.view", "lab.users.manage", "lab.audit.view"], allowedSiteIds: ["SITE-05"], allowedDepartmentIds: ["DEPT-06", "DEPT-07"], activeSiteId: "SITE-05", entrySource: "DIRECT_LOGIN" },
  },
  {
    credentials: { organizationCode: "SUNRISE-HOSP", username: "hospitaladmin", password: "demo123" },
    session: { tenantId: "TEN-SUNRISE", organizationCode: "SUNRISE-HOSP", organizationName: "Sunrise Hospital", laboratoryProfile: "HOSPITAL_INTEGRATED", billingOwner: "HMS_CENTRAL", patientMasterOwner: "HMS", userId: "HMS-ADMIN-01", userName: "Meera Hospital Admin", role: "tenant_admin", administrativeRoles: ["HOSPITAL_ADMIN"], laboratoryRoles: [], permissions: ["lab.admin.appoint", "lab.audit.view"], allowedSiteIds: ["SITE-01"], allowedDepartmentIds: ["DEPT-01", "DEPT-02", "DEPT-03", "DEPT-05"], activeSiteId: "SITE-01", entrySource: "DIRECT_LOGIN" },
  },
  {
    credentials: { organizationCode: "SUNRISE-HOSP", username: "collector", password: "demo123" },
    session: { tenantId: "TEN-SUNRISE", organizationCode: "SUNRISE-HOSP", organizationName: "Sunrise Hospital", laboratoryProfile: "HOSPITAL_INTEGRATED", billingOwner: "HMS_CENTRAL", patientMasterOwner: "HMS", userId: "USR-06", userName: "Nikita Bhosale", role: "phlebotomist", administrativeRoles: [], laboratoryRoles: ["PHLEBOTOMIST"], permissions: ["collection.view", "collection.confirm", "specimen.view"], allowedSiteIds: ["SITE-01"], allowedDepartmentIds: ["DEPT-01", "DEPT-02", "DEPT-03", "DEPT-05"], activeSiteId: "SITE-01", entrySource: "DIRECT_LOGIN" },
  },
  {
    credentials: { organizationCode: "SUNRISE-HOSP", username: "receiver", password: "demo123" },
    session: { tenantId: "TEN-SUNRISE", organizationCode: "SUNRISE-HOSP", organizationName: "Sunrise Hospital", laboratoryProfile: "HOSPITAL_INTEGRATED", billingOwner: "HMS_CENTRAL", patientMasterOwner: "HMS", userId: "USR-09", userName: "Asha Patil", role: "accessioning", administrativeRoles: [], laboratoryRoles: ["RECEIVING_STAFF"], permissions: ["specimen.view", "specimen.receive"], allowedSiteIds: ["SITE-01"], allowedDepartmentIds: ["DEPT-01", "DEPT-02", "DEPT-03", "DEPT-05"], activeSiteId: "SITE-01", entrySource: "DIRECT_LOGIN" },
  },
  {
    credentials: { organizationCode: "SUNRISE-HOSP", username: "accession", password: "demo123" },
    session: { tenantId: "TEN-SUNRISE", organizationCode: "SUNRISE-HOSP", organizationName: "Sunrise Hospital", laboratoryProfile: "HOSPITAL_INTEGRATED", billingOwner: "HMS_CENTRAL", patientMasterOwner: "HMS", userId: "USR-05", userName: "Rahul Salvi", role: "accessioning", administrativeRoles: [], laboratoryRoles: ["ACCESSIONING_STAFF"], permissions: ["specimen.view", "specimen.receive", "specimen.accession", "specimen.reject"], allowedSiteIds: ["SITE-01"], allowedDepartmentIds: ["DEPT-01", "DEPT-02", "DEPT-03", "DEPT-05"], activeSiteId: "SITE-01", entrySource: "DIRECT_LOGIN" },
  },
  {
    credentials: { organizationCode: "SUNRISE-HOSP", username: "technician", password: "demo123" },
    session: { tenantId: "TEN-SUNRISE", organizationCode: "SUNRISE-HOSP", organizationName: "Sunrise Hospital", laboratoryProfile: "HOSPITAL_INTEGRATED", billingOwner: "HMS_CENTRAL", patientMasterOwner: "HMS", userId: "USR-04", userName: "Pooja Iyer", role: "technologist", administrativeRoles: [], laboratoryRoles: ["TECHNICIAN"], permissions: ["workbench.use", "results.enter", "results.technical_review"], allowedSiteIds: ["SITE-01"], allowedDepartmentIds: ["DEPT-01", "DEPT-02", "DEPT-03", "DEPT-05"], activeSiteId: "SITE-01", entrySource: "DIRECT_LOGIN" },
  },
];

export function authenticateDemo(credentials: LoginCredentials) {
  return DEMO_ACCOUNTS.find((account) => account.credentials.organizationCode === credentials.organizationCode.trim().toUpperCase() && account.credentials.username.toLowerCase() === credentials.username.trim().toLowerCase() && account.credentials.password === credentials.password)?.session ?? null;
}
