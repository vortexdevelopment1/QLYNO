import type { Request } from "express";
import type { Prisma } from "../generated/prisma";
import { prisma } from "../db/prisma";
export async function audit(req: Request, entity: string, entityId: string, action: string, beforeState?: Prisma.InputJsonValue, afterState?: Prisma.InputJsonValue): Promise<void> {
  if (!req.context) return;
  await prisma.auditEvent.create({ data: { tenantId: req.context.tenantId, actorUserId: req.context.userId, entity, entityId, action, beforeState, afterState, ipAddress: req.ip, requestId: req.requestId } });
}
