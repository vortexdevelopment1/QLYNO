import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { getEnv } from "../config/env";
import type { AuthenticatedUser } from "../types/security";

export function signAccessToken(user: AuthenticatedUser): string {
  const env = getEnv();
  return jwt.sign({ ...user, sub: user.userId, type: "access" }, env.JWT_ACCESS_SECRET, { expiresIn: env.ACCESS_TOKEN_TTL as SignOptions["expiresIn"], issuer: env.JWT_ISSUER, audience: env.JWT_AUDIENCE });
}
export function verifyAccessToken(token: string): AuthenticatedUser {
  const env = getEnv(); const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, { issuer: env.JWT_ISSUER, audience: env.JWT_AUDIENCE }) as JwtPayload & AuthenticatedUser;
  if (decoded.type !== "access" || !decoded.userId || !decoded.tenantId) throw new Error("Invalid token type");
  return decoded;
}
export function signPurposeToken(subject: string, purpose: "invite" | "password-reset", expiresIn: SignOptions["expiresIn"]): string {
  const env = getEnv(); return jwt.sign({ sub: subject, purpose }, env.JWT_RESET_SECRET, { expiresIn, issuer: env.JWT_ISSUER, audience: env.JWT_AUDIENCE });
}
export function verifyPurposeToken(token: string, purpose: "invite" | "password-reset"): string {
  const env = getEnv(); const decoded = jwt.verify(token, env.JWT_RESET_SECRET, { issuer: env.JWT_ISSUER, audience: env.JWT_AUDIENCE }) as JwtPayload; if (decoded.purpose !== purpose || !decoded.sub) throw new Error("Invalid token purpose"); return decoded.sub;
}
