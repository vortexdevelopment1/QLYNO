import type { Prisma } from "../generated/prisma";
import type { RequestContext } from "../types/security";
import { forbidden } from "../utils/errors";

export function requireSite(context: RequestContext, siteId: string): void { if (!context.siteIds.includes(siteId) && !context.roles.includes("tenant_admin") && !context.roles.includes("auditor") && !context.roles.includes("lab_director")) throw forbidden(); }
export function requireDepartment(context: RequestContext, departmentId: string): void { if (!context.departmentIds.includes(departmentId) && !context.roles.includes("tenant_admin") && !context.roles.includes("auditor") && !context.roles.includes("lab_director")) throw forbidden(); }
export function orderReadScope(context: RequestContext): Prisma.LaboratoryOrderWhereInput {
  const base: Prisma.LaboratoryOrderWhereInput = { tenantId: context.tenantId };
  if (context.roles.includes("referring_clinician")) return { ...base, practitionerId: context.practitionerId ?? "__none__" };
  if (context.roles.includes("client_lab_user")) return { ...base, clientOrganizationId: context.clientOrganizationId ?? "__none__" };
  if (!context.roles.some((role) => ["tenant_admin", "auditor", "lab_director", "quality_manager"].includes(role))) return { ...base, siteId: { in: context.siteIds } };
  return base;
}
export function patientReadScope(context: RequestContext): Prisma.PatientWhereInput {
  if (context.permissions.includes("patients.read")) return { tenantId: context.tenantId };
  if (context.roles.includes("referring_clinician") || context.roles.includes("client_lab_user")) return { tenantId: context.tenantId, orders: { some: orderReadScope(context) } };
  return { tenantId: context.tenantId };
}
export function specimenReadScope(context: RequestContext): Prisma.SpecimenWhereInput { const ownershipScoped = context.roles.some((role) => ["referring_clinician", "client_lab_user"].includes(role)); return { tenantId: context.tenantId, ...(ownershipScoped || context.roles.some((role) => ["tenant_admin", "auditor", "lab_director", "quality_manager"].includes(role)) ? {} : { siteId: { in: context.siteIds } }), order: orderReadScope(context) }; }
