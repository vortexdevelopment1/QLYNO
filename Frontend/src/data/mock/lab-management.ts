import type { LabAccessAuditEvent, LabUserMembership, LaboratoryRole } from "@/lib/types/laboratory-session";

export const LAB_ROLE_TEMPLATES: Array<{ id: LaboratoryRole; label: string; permissions: string[] }> = [
  { id: "LAB_DIRECTOR", label: "Laboratory Director", permissions: ["results.medical_validate", "reports.release", "reports.amend", "quality.oversee"] },
  { id: "PATHOLOGIST", label: "Pathologist", permissions: ["results.medical_validate", "reports.release", "reports.amend"] },
  { id: "QUALITY_MANAGER", label: "Quality Manager", permissions: ["quality.manage", "qc.manage", "capa.manage"] },
  { id: "SECTION_SUPERVISOR", label: "Section Supervisor", permissions: ["workbench.manage", "results.technical_review"] },
  { id: "TECHNICIAN", label: "Technician", permissions: ["workbench.use", "results.enter"] },
  { id: "ACCESSIONING_STAFF", label: "Accessioning Staff", permissions: ["specimens.receive", "specimens.reject", "specimens.aliquot"] },
  { id: "PHLEBOTOMIST", label: "Phlebotomist", permissions: ["collection.manage", "specimens.handover"] },
  { id: "COURIER", label: "Courier", permissions: ["logistics.route", "specimens.transport"] },
  { id: "INVENTORY_USER", label: "Inventory User", permissions: ["inventory.manage", "equipment.view"] },
  { id: "RECEPTION_CASHIER", label: "Reception / Cashier", permissions: ["patients.create", "orders.create", "billing.collect"] },
  { id: "AUDITOR", label: "Auditor", permissions: ["audit.view", "analytics.view"] },
];

export const MOCK_LAB_MEMBERSHIPS: LabUserMembership[] = [
  { id: "MEM-01", tenantId: "TEN-SUNRISE", hospitalUserId: "HMS-U-1001", name: "Dr. Sanjeev Kelkar", employeeId: "EMP-1001", roles: ["LAB_ADMIN", "PATHOLOGIST"], siteIds: ["SITE-01"], departmentIds: ["DEPT-01", "DEPT-05"], status: "ACTIVE", lastAccess: "2026-09-01T09:20:00+05:30", authenticationSource: "HMS_SSO" },
  { id: "MEM-02", tenantId: "TEN-SUNRISE", hospitalUserId: "HMS-U-1002", name: "Anita Rane", employeeId: "EMP-1002", roles: ["QUALITY_MANAGER"], siteIds: ["SITE-01"], departmentIds: ["DEPT-01", "DEPT-02"], status: "ACTIVE", lastAccess: "2026-09-01T08:40:00+05:30", authenticationSource: "HMS_SSO" },
  { id: "MEM-03", tenantId: "TEN-SUNRISE", hospitalUserId: "HMS-U-1004", name: "Pooja Iyer", employeeId: "EMP-1004", roles: ["TECHNICIAN"], siteIds: ["SITE-01"], departmentIds: ["DEPT-01"], status: "ACTIVE", lastAccess: "2026-09-01T07:55:00+05:30", authenticationSource: "HMS_SSO" },
  { id: "MEM-04", tenantId: "TEN-AAROGYA", hospitalUserId: "LAB-U-2001", laboratoryUserId: "USR-08", name: "Farah Sheikh", employeeId: "AAR-201", roles: ["LAB_ADMIN", "RECEPTION_CASHIER"], siteIds: ["SITE-02", "SITE-03"], departmentIds: ["DEPT-04", "DEPT-08"], status: "ACTIVE", lastAccess: "2026-09-01T09:18:00+05:30", authenticationSource: "LAB_LOGIN" },
  { id: "MEM-05", tenantId: "TEN-AAROGYA", hospitalUserId: "LAB-U-2002", name: "Rahul Salvi", employeeId: "AAR-202", roles: ["ACCESSIONING_STAFF"], siteIds: ["SITE-02"], departmentIds: ["DEPT-04"], status: "ACTIVE", lastAccess: "2026-09-01T08:12:00+05:30", authenticationSource: "LAB_LOGIN" },
  { id: "MEM-06", tenantId: "TEN-AAROGYA", hospitalUserId: "LAB-U-2003", name: "Nikita Bhosale", employeeId: "AAR-203", roles: ["PHLEBOTOMIST"], siteIds: ["SITE-03"], departmentIds: ["DEPT-08"], status: "SUSPENDED", lastAccess: "2026-08-28T12:00:00+05:30", authenticationSource: "LAB_LOGIN" },
  { id: "MEM-07", tenantId: "TEN-CENTRAL-REF", hospitalUserId: "LAB-U-3001", laboratoryUserId: "USR-10", name: "Aarti Desai", employeeId: "CLR-001", roles: ["LAB_OWNER"], siteIds: ["SITE-05"], departmentIds: ["DEPT-06", "DEPT-07"], status: "ACTIVE", lastAccess: "2026-09-01T09:00:00+05:30", authenticationSource: "LAB_LOGIN" },
];

export const MOCK_LAB_ACCESS_AUDIT: LabAccessAuditEvent[] = [
  { id: "LAA-01", tenantId: "TEN-SUNRISE", actor: "Meera Hospital Admin", targetUser: "Dr. Sanjeev Kelkar", action: "Lab Admin appointed", previousValue: "PATHOLOGIST", newValue: "LAB_ADMIN + PATHOLOGIST", timestamp: "2026-08-20T10:00:00+05:30", reason: "Delegated Central Laboratory administration" },
  { id: "LAA-02", tenantId: "TEN-SUNRISE", actor: "Dr. Sanjeev Kelkar", targetUser: "Pooja Iyer", action: "Site scope changed", previousValue: "None", newValue: "Central Lab · Chemistry", timestamp: "2026-08-24T11:15:00+05:30", reason: "New Chemistry assignment" },
  { id: "LAA-03", tenantId: "TEN-AAROGYA", actor: "Farah Sheikh", targetUser: "Nikita Bhosale", action: "User suspended", previousValue: "ACTIVE", newValue: "SUSPENDED", timestamp: "2026-08-28T12:05:00+05:30", reason: "Temporary leave" },
  { id: "LAA-04", tenantId: "TEN-CENTRAL-REF", actor: "Aarti Desai", targetUser: "Aarti Desai", action: "Lab Owner access granted", previousValue: "None", newValue: "LAB_OWNER", timestamp: "2026-08-01T09:00:00+05:30", reason: "Organization activation" },
];

export const PERMISSION_GROUPS: Record<string, string[]> = {
  Patients: ["patients.view", "patients.create"], Orders: ["orders.view", "orders.manage"], Collection: ["collection.manage"], Accessioning: ["specimens.receive", "specimens.reject"], Workbench: ["workbench.use", "workbench.manage"], Results: ["results.enter", "results.technical_review"], "Medical validation": ["results.medical_validate", "reports.release", "reports.amend"], Quality: ["quality.manage", "qc.manage"], Inventory: ["inventory.manage"], Billing: ["billing.collect", "billing.refund"], Analytics: ["analytics.view"], "Lab Management": ["lab.users.manage", "lab.audit.view"],
};
