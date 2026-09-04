import { createServer } from "http";
import { createApp } from "./app";
import { getEnv } from "./config/env";
import { logger } from "./config/logger";
import { prisma } from "./db/prisma";

const env = getEnv(); const server = createServer(createApp());
server.listen(env.PORT, () => logger.info({ port: env.PORT }, "Qlyno laboratory API listening"));
async function shutdown(signal: string) { logger.info({ signal }, "Shutting down"); server.close(async () => { await prisma.$disconnect(); process.exit(0); }); setTimeout(() => process.exit(1), 10_000).unref(); }
process.on("SIGINT", () => void shutdown("SIGINT")); process.on("SIGTERM", () => void shutdown("SIGTERM"));
