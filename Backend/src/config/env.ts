import "dotenv/config";
import { z } from "zod";

const LOCAL_ACCESS_SECRET = "local-development-access-secret-change-before-production-64-chars";
const LOCAL_RESET_SECRET = "local-development-reset-secret-change-before-production-64-chars";
const LOCAL_PASSWORD_PEPPER = "local-development-password-pepper";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32).default(LOCAL_ACCESS_SECRET),
  JWT_RESET_SECRET: z.string().min(32).default(LOCAL_RESET_SECRET),
  JWT_ISSUER: z.string().default("qlyno-laboratory-api"),
  JWT_AUDIENCE: z.string().default("qlyno-laboratory-portal"),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_DAYS: z.coerce.number().int().min(1).max(30).default(14),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),
  COOKIE_SECURE: z.enum(["true", "false"]).default("false"),
  PASSWORD_PEPPER: z.string().min(16).default(LOCAL_PASSWORD_PEPPER),
  AUTH_DISABLED: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
  LOG_LEVEL: z.string().default("info")
}).superRefine((env, ctx) => {
  if (env.NODE_ENV !== "production") return;

  if (env.AUTH_DISABLED) {
    ctx.addIssue({ code: "custom", path: ["AUTH_DISABLED"], message: "AUTH_DISABLED cannot be true in production" });
  }

  for (const key of ["JWT_ACCESS_SECRET", "JWT_RESET_SECRET", "PASSWORD_PEPPER"] as const) {
    if (!process.env[key]) {
      ctx.addIssue({ code: "custom", path: [key], message: "Required in production" });
    }
  }
});

export type Env = z.infer<typeof schema>;
let cached: Env | undefined;
export function getEnv(): Env {
  if (!cached) cached = schema.parse(process.env);
  return cached;
}
export function resetEnvForTests(): void { cached = undefined; }
