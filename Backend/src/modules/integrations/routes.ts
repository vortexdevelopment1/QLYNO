import { z } from "zod";
import { prisma } from "../../db/prisma";
import { protectedRouter } from "../../middleware/protected";
import { rejectAuditorWrites, requirePermission } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/async-handler";
import { notFound } from "../../utils/errors";

const connection = z.object({ system: z.string().min(2).max(100), category: z.string().min(2).max(100), mappingVersion: z.string().min(1).max(50) }).strict();
const id = z.object({ id: z.string().min(1).max(100) }).strict();
export const integrationRoutes = protectedRouter();
integrationRoutes.get("/", requirePermission("integrations.manage"), asyncHandler(async (req, res) => {
  const data = await prisma.integrationConnection.findMany({
    where: { tenantId: req.context!.tenantId },
    include: { events: { take: 100, orderBy: { occurredAt: "desc" } } }
  });
  res.json({ data });
}));
integrationRoutes.post("/", rejectAuditorWrites, requirePermission("integrations.manage"), validate({ body: connection }), asyncHandler(async (req, res) => { const data = await prisma.integrationConnection.upsert({ where: { tenantId_system: { tenantId: req.context!.tenantId, system: req.body.system } }, create: { tenantId: req.context!.tenantId, ...req.body, status: "DISCONNECTED" }, update: { category: req.body.category, mappingVersion: req.body.mappingVersion } }); res.status(201).json({ data }); }));
integrationRoutes.post("/:id/test", rejectAuditorWrites, requirePermission("integrations.manage"), validate({ params: id, body: z.object({}).strict() }), asyncHandler(async (req, res) => { const row = await prisma.integrationConnection.findFirst({ where: { id: String(req.params.id), tenantId: req.context!.tenantId } }); if (!row) throw notFound("Integration"); const event = await prisma.integrationEvent.create({ data: { tenantId: req.context!.tenantId, connectionId: row.id, direction: "OUTBOUND", status: "SIMULATED", payload: { operation: "connectivity_test" } } }); res.status(202).json({ data: event, message: "Connector execution remains external; audit event recorded" }); }));
