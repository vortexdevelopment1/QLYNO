import { Router } from "express";
import { authenticate } from "./authenticate";
import { requireActiveAccount } from "./require-active-account";
import { tenantScope } from "./tenant-scope";
import { SYSTEM_ROLES } from "../config/permissions";
import { authorize } from "./authorize";

export function protectedRouter(): Router {
  const router = Router(); router.use(authenticate, requireActiveAccount, tenantScope, authorize(...SYSTEM_ROLES)); return router;
}
