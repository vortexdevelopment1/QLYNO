import type { LaboratoryRole, LaboratorySession } from "@/lib/types/laboratory-session";

// Frontend checks improve UX only. The production backend must enforce the same delegation and clinical authorization rules.
export function canManageLabUsers(session: LaboratorySession) { return session.administrativeRoles.some((role) => role === "HOSPITAL_ADMIN" || role === "LAB_OWNER" || role === "LAB_ADMIN"); }
export function canAssignLabRole(session: LaboratorySession, targetRole: LaboratoryRole) { const elevated = session.administrativeRoles.includes("HOSPITAL_ADMIN") || session.administrativeRoles.includes("LAB_OWNER"); return canManageLabUsers(session) && (session.delegation ? session.delegation.assignableRoleIds.includes(targetRole) : elevated); }
export function canDelegatePermission(session: LaboratorySession, permission: string) { const elevated = session.administrativeRoles.includes("HOSPITAL_ADMIN") || session.administrativeRoles.includes("LAB_OWNER"); return session.delegation ? session.delegation.assignablePermissionIds.includes(permission) : elevated; }
export function canManageUserAtSite(session: LaboratorySession, siteId: string) { return session.allowedSiteIds.includes(siteId) && (session.delegation?.allowedSiteIds.includes(siteId) ?? true); }
export function canManageUserInDepartment(session: LaboratorySession, departmentId: string) { return session.allowedDepartmentIds.includes(departmentId) && (session.delegation?.allowedDepartmentIds.includes(departmentId) ?? true); }
export function canMedicallyValidate(session: LaboratorySession) { return session.laboratoryRoles.includes("PATHOLOGIST") || session.laboratoryRoles.includes("LAB_DIRECTOR"); }
export function canReleaseReport(session: LaboratorySession) { return canMedicallyValidate(session) && session.permissions.includes("reports.release"); }
export function canCreateCustomLabRoles(session: LaboratorySession) { return session.delegation?.canCreateCustomLabRoles ?? session.administrativeRoles.includes("LAB_OWNER"); }
