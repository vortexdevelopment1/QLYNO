import { Router } from "express";
import { authenticate } from "./authenticate";
import { requireActiveAccount } from "./require-active-account";
import { tenantScope } from "./tenant-scope";
import { permissionsForRoles, SYSTEM_ROLES } from "../config/permissions";
import { authorize } from "./authorize";
import { getEnv } from "../config/env";
import { prisma } from "../db/prisma";
import type { AuthenticatedUser } from "../types/security";
import type { RequestHandler } from "express";

const DEV_AUTH_ROLES = ["tenant_admin", "lab_director", "referring_clinician", "reception_cashier"];
const DEV_TENANT_ID = "TEN-SUNRISE";
export const DEV_AUTH_USER_ID = "DEV-AUTH-BYPASS";

let devTenantReady: Promise<unknown> | undefined;

function ensureDevelopmentTenant() {
  devTenantReady ??= prisma.tenant.upsert({
    where: { id: DEV_TENANT_ID },
    create: {
      id: DEV_TENANT_ID,
      slug: "sunrise-hospital",
      legalName: "Sunrise Hospital Private Limited",
      displayName: "Sunrise Hospital",
      mode: "HOSPITAL",
      billingEnabled: false,
      accreditation: ["NABL"],
      logoInitials: "SH",
    },
    update: {},
  });
  return devTenantReady;
}

const developmentAuthBypass: RequestHandler = async (req, _res, next) => {
  try {
    await ensureDevelopmentTenant();
  } catch (error) {
    return next(error);
  }

  const roles = DEV_AUTH_ROLES;
  const user: AuthenticatedUser = {
    userId: DEV_AUTH_USER_ID,
    membershipId: "DEV-MEMBERSHIP",
    tenantId: DEV_TENANT_ID,
    status: "ACTIVE" as AuthenticatedUser["status"],
    roles,
    permissions: permissionsForRoles(roles),
    siteIds: ["SITE-01"],
    departmentIds: ["DEPT-HEMA", "DEPT-CHEM", "DEPT-01", "DEPT-02", "DEPT-03", "DEPT-05"],
    practitionerId: "PRAC-01",
  };

  req.user = user;
  return next();
};

export function protectedRouter(): Router {
  const router = Router();
  const env = getEnv();

  if (env.NODE_ENV === "development" && env.AUTH_DISABLED) {
    router.use(developmentAuthBypass, tenantScope, authorize(...SYSTEM_ROLES));
    return router;
  }

  router.use(authenticate, requireActiveAccount, tenantScope, authorize(...SYSTEM_ROLES));
  return router;
}
