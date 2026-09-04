import type { RequestHandler } from "express";
import { verifyAccessToken } from "../utils/tokens";
import { unauthorized } from "../utils/errors";

export const authenticate: RequestHandler = (req, _res, next) => {
  const [scheme, token] = req.get("authorization")?.split(" ") ?? [];
  if (scheme !== "Bearer" || !token) return next(unauthorized());
  try { req.user = verifyAccessToken(token); return next(); } catch { return next(unauthorized()); }
};
