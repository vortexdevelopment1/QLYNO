import type { RequestHandler } from "express";
import { prisma } from "../db/prisma";
import { forbidden, unauthorized } from "../utils/errors";

export const requireActiveAccount: RequestHandler = async (req, _res, next) => {
  if (!req.user) return next(unauthorized());
  try {
    const membership = await prisma.tenantMembership.findFirst({ where: { id: req.user.membershipId, tenantId: req.user.tenantId, userId: req.user.userId }, include: { user: { select: { status: true } } } });
    if (!membership || membership.user.status !== "ACTIVE") return next(forbidden());
    req.user.status = membership.user.status;
    return next();
  } catch (error) { return next(error); }
};
