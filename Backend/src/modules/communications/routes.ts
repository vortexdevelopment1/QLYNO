import { z } from "zod";
import { prisma } from "../../db/prisma";
import { protectedRouter } from "../../middleware/protected";
import { rejectAuditorWrites, requirePermission } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/async-handler";

const template = z.object({ name: z.string().min(2), channel: z.enum(["EMAIL", "SMS", "WHATSAPP", "IN_APP"]), body: z.string().min(2).max(10000), active: z.boolean().default(true) }).strict();
export const communicationRoutes = protectedRouter();
communicationRoutes.get("/templates", requirePermission("communications.read"), asyncHandler(async (req, res) => {
  const data = await prisma.communicationTemplate.findMany({
    where: { tenantId: req.context!.tenantId },
    include: { deliveries: { take: 50, orderBy: { sentAt: "desc" } } }
  });
  res.json({ data });
}));
communicationRoutes.get("/history", requirePermission("communications.read"), asyncHandler(async (req, res) => { res.json({ data: await prisma.communicationDelivery.findMany({ where: { tenantId: req.context!.tenantId }, include: { template: true }, orderBy: { sentAt: "desc" }, take: 1000 }) }); }));
communicationRoutes.get("/portal-access", requirePermission("communications.read"), asyncHandler(async (req, res) => { res.json({ data: await prisma.tenantMembership.findMany({ where: { tenantId: req.context!.tenantId, roles: { some: { role: { code: { in: ["referring_clinician", "client_lab_user"] } } } } }, include: { user: { select: { id: true, email: true, name: true, status: true, createdAt: true } }, roles: { include: { role: true } }, clientOrganization: true, practitioner: true } }) }); }));
communicationRoutes.post("/send", rejectAuditorWrites, requirePermission("communications.send"), validate({ body: z.object({ templateId: z.string().optional(), recipientMasked: z.string().min(2).max(200), channel: z.enum(["EMAIL", "SMS", "WHATSAPP", "IN_APP"]), status: z.enum(["QUEUED", "DELIVERED", "FAILED"]).default("QUEUED") }).strict() }), asyncHandler(async (req, res) => { if (req.body.templateId) { const exists = await prisma.communicationTemplate.findFirst({ where: { id: req.body.templateId, tenantId: req.context!.tenantId, active: true } }); if (!exists) return res.status(404).json({ message: "Template not found" }); } res.status(202).json({ data: await prisma.communicationDelivery.create({ data: { tenantId: req.context!.tenantId, ...req.body, sentAt: req.body.status === "QUEUED" ? undefined : new Date() } }) }); }));
communicationRoutes.post("/templates", rejectAuditorWrites, requirePermission("communications.write"), validate({ body: template }), asyncHandler(async (req, res) => { res.status(201).json({ data: await prisma.communicationTemplate.create({ data: { tenantId: req.context!.tenantId, ...req.body } }) }); }));
