import pino from "pino";
import { getEnv } from "./env";

export const logger = pino({
  level: getEnv().LOG_LEVEL,
  redact: { paths: ["req.headers.authorization", "req.headers.cookie", "password", "token", "refreshToken", "accessToken", "cardNumber", "cvv"], censor: "[REDACTED]" }
});
