import { z } from "zod";
import { prisma } from "../../db/prisma";
import { rejectAuditorWrites, requireAnyPermission, requirePermission } from "../../middleware/authorize";
import { protectedRouter } from "../../middleware/protected";
import { validate } from "../../middleware/validate";
import { audit } from "../../services/audit";
import { asyncHandler } from "../../utils/async-handler";
import { notFound } from "../../utils/errors";

const createTicket = z.object({ subject: z.string().min(3).max(200), category: z.string().min(2).max(80), severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]), details: z.string().min(5).max(5000) }).strict();
const id = z.object({ id: z.string().min(1).max(100) }).strict();
const updateTicket = z.object({ status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]), resolutionNote: z.string().min(3).max(2000).optional() }).strict();

export const supportRoutes = protectedRouter();
supportRoutes.get("/", requireAnyPermission("dashboard.read", "orders.read.own", "orders.read.client"), asyncHandler(async (req, res) => {
  const canSeeAll = req.context!.roles.some((role) => ["tenant_admin", "auditor"].includes(role));
  res.json({ data: await prisma.supportTicket.findMany({ where: { tenantId: req.context!.tenantId, ...(canSeeAll ? {} : { requesterUserId: req.context!.userId }) }, orderBy: { createdAt: "desc" }, take: 500 }) });
}));
supportRoutes.post("/", rejectAuditorWrites, requireAnyPermission("dashboard.read", "orders.read.own", "orders.read.client"), validate({ body: createTicket }), asyncHandler(async (req, res) => {
  const data = await prisma.supportTicket.create({ data: { tenantId: req.context!.tenantId, requesterUserId: req.context!.userId, status: "OPEN", ...req.body } });
  res.status(201).json({ data });
}));
supportRoutes.patch("/:id", rejectAuditorWrites, requirePermission("admin.users"), validate({ params: id, body: updateTicket }), asyncHandler(async (req, res) => {
  const before = await prisma.supportTicket.findFirst({ where: { id: String(req.params.id), tenantId: req.context!.tenantId } });
  if (!before) throw notFound("Support ticket");
  const data = await prisma.supportTicket.update({ where: { id: before.id }, data: { status: req.body.status, resolvedAt: ["RESOLVED", "CLOSED"].includes(req.body.status) ? new Date() : null } });
  await audit(req, "SupportTicket", before.id, "SUPPORT_STATUS_CHANGED", before, { ...data, resolutionNote: req.body.resolutionNote });
  res.json({ data });
}));
