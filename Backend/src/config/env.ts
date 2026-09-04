import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_RESET_SECRET: z.string().min(32),
  JWT_ISSUER: z.string().default("qlyno-laboratory-api"),
  JWT_AUDIENCE: z.string().default("qlyno-laboratory-portal"),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_DAYS: z.coerce.number().int().min(1).max(30).default(14),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),
  COOKIE_SECURE: z.enum(["true", "false"]).default("false"),
  PASSWORD_PEPPER: z.string().min(16),
  LOG_LEVEL: z.string().default("info")
});

export type Env = z.infer<typeof schema>;
let cached: Env | undefined;
export function getEnv(): Env {
  if (!cached) cached = schema.parse(process.env);
  return cached;
}
export function resetEnvForTests(): void { cached = undefined; }
