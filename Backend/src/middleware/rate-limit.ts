import rateLimit from "express-rate-limit";
export const generalRateLimit = rateLimit({ windowMs: 15 * 60_000, limit: 600, standardHeaders: "draft-7", legacyHeaders: false, message: { error: { code: "RATE_LIMITED", message: "Too many requests" } } });
export const authRateLimit = rateLimit({ windowMs: 15 * 60_000, limit: 20, skipSuccessfulRequests: true, standardHeaders: "draft-7", legacyHeaders: false, message: { error: { code: "RATE_LIMITED", message: "Too many authentication attempts" } } });
