import type { AccountStatus } from "../generated/prisma";

export interface AuthenticatedUser {
  userId: string;
  membershipId: string;
  tenantId: string;
  status: AccountStatus;
  roles: string[];
  permissions: string[];
  siteIds: string[];
  departmentIds: string[];
  clientOrganizationId?: string;
  practitionerId?: string;
}
export interface RequestContext extends Readonly<AuthenticatedUser> {}
