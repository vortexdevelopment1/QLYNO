import type { RequestHandler } from "express";
import { unauthorized } from "../utils/errors";

export const tenantScope: RequestHandler = (req, _res, next) => {
  if (!req.user) return next(unauthorized());
  req.context = Object.freeze({ ...req.user, roles: Object.freeze([...req.user.roles]) as unknown as string[], permissions: Object.freeze([...req.user.permissions]) as unknown as string[], siteIds: Object.freeze([...req.user.siteIds]) as unknown as string[], departmentIds: Object.freeze([...req.user.departmentIds]) as unknown as string[] });
  return next();
};
