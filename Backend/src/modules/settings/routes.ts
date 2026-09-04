import { z } from "zod";
import { prisma } from "../../db/prisma";
import { rejectAuditorWrites, requireAnyPermission, requirePermission } from "../../middleware/authorize";
import { protectedRouter } from "../../middleware/protected";
import { validate } from "../../middleware/validate";
import { audit } from "../../services/audit";
import { asyncHandler } from "../../utils/async-handler";

export const settingsRoutes = protectedRouter();
settingsRoutes.get("/", requireAnyPermission("dashboard.read", "orders.read.own", "orders.read.client"), asyncHandler(async (req, res) => {
  const data = await prisma.tenant.findUnique({ where: { id: req.context!.tenantId }, select: { id: true, slug: true, legalName: true, displayName: true, mode: true, billingEnabled: true, accreditation: true, logoInitials: true, sites: { include: { departments: true }, orderBy: { name: "asc" } } } });
  res.json({ data });
}));
settingsRoutes.patch("/", rejectAuditorWrites, requirePermission("admin.users"), validate({ body: z.object({ displayName: z.string().min(2).max(180).optional(), legalName: z.string().min(2).max(240).optional(), logoInitials: z.string().min(1).max(8).optional(), accreditation: z.array(z.string().min(1).max(80)).max(50).optional() }).strict().refine((value) => Object.keys(value).length > 0, "At least one setting is required") }), asyncHandler(async (req, res) => {
  const before = await prisma.tenant.findUniqueOrThrow({ where: { id: req.context!.tenantId } });
  const data = await prisma.tenant.update({ where: { id: req.context!.tenantId }, data: req.body });
  await audit(req, "Tenant", data.id, "TENANT_SETTINGS_CHANGED", before, data);
  res.json({ data });
}));
