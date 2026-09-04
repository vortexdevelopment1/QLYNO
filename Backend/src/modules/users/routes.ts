import { prisma } from "../../db/prisma";
import { protectedRouter } from "../../middleware/protected";
import { asyncHandler } from "../../utils/async-handler";

export const userRoutes = protectedRouter();
userRoutes.get("/me", asyncHandler(async (req, res) => { const membership = await prisma.tenantMembership.findFirst({ where: { id: req.context!.membershipId, tenantId: req.context!.tenantId, userId: req.context!.userId }, include: { tenant: true, user: { select: { id: true, email: true, username: true, name: true, status: true, createdAt: true } }, roles: { include: { role: true } }, siteScopes: { include: { site: true } }, departmentScopes: { include: { department: true } }, clientOrganization: true, practitioner: true } }); res.json({ data: membership, access: req.context }); }));
