import type { Request } from "express";
import type { Prisma } from "../generated/prisma";
import { prisma } from "../db/prisma";
import { DEV_AUTH_USER_ID } from "../middleware/protected";
export async function audit(req: Request, entity: string, entityId: string, action: string, beforeState?: Prisma.InputJsonValue, afterState?: Prisma.InputJsonValue): Promise<void> {
  if (!req.context) return;
  const actorUserId = req.context.userId === DEV_AUTH_USER_ID ? undefined : req.context.userId;
  await prisma.auditEvent.create({ data: { tenantId: req.context.tenantId, actorUserId, entity, entityId, action, beforeState, afterState, ipAddress: req.ip, requestId: req.requestId } });
}
