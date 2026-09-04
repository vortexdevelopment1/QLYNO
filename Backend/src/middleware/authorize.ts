import type { RequestHandler } from "express";
import { forbidden, unauthorized } from "../utils/errors";

export function authorize(...allowedRoles: string[]): RequestHandler {
  return (req, _res, next) => { if (!req.context) return next(unauthorized()); if (!allowedRoles.some((role) => req.context?.roles.includes(role))) return next(forbidden()); return next(); };
}
export function requirePermission(...permissions: string[]): RequestHandler {
  return (req, _res, next) => { if (!req.context) return next(unauthorized()); if (!permissions.every((permission) => req.context?.permissions.includes(permission))) return next(forbidden()); return next(); };
}
export function requireAnyPermission(...permissions: string[]): RequestHandler {
  return (req, _res, next) => { if (!req.context) return next(unauthorized()); if (!permissions.some((permission) => req.context?.permissions.includes(permission))) return next(forbidden()); return next(); };
}
export const rejectAuditorWrites: RequestHandler = (req, _res, next) => req.context?.roles.includes("auditor") ? next(forbidden()) : next();
