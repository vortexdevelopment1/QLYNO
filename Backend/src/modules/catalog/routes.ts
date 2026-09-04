import { z } from "zod";
import { prisma } from "../../db/prisma";
import { protectedRouter } from "../../middleware/protected";
import { rejectAuditorWrites, requireAnyPermission, requirePermission } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/async-handler";
import { notFound } from "../../utils/errors";

const createTest = z.object({ code: z.string().min(1).max(40), name: z.string().min(2).max(180), departmentId: z.string().optional(), method: z.string().min(1), specimenType: z.string().min(1), containerName: z.string().min(1), minVolume: z.string().min(1), stability: z.string().min(1), tatMinutes: z.number().int().positive(), units: z.string(), referenceRange: z.string(), criticalRange: z.string().optional(), reflexRule: z.string().optional(), effectiveDate: z.coerce.date().optional() }).strict();
const id = z.object({ id: z.string().min(1).max(100) }).strict();
export const catalogRoutes = protectedRouter();
catalogRoutes.get("/", requireAnyPermission("orders.read", "orders.read.own", "orders.read.client"), asyncHandler(async (req, res) => { res.json({ data: await prisma.testCatalogItem.findMany({ where: { tenantId: req.context!.tenantId, status: "ACTIVE" }, orderBy: [{ name: "asc" }, { version: "desc" }] }) }); }));
catalogRoutes.get("/:id", requireAnyPermission("orders.read", "orders.read.own", "orders.read.client"), validate({ params: id }), asyncHandler(async (req, res) => { const data = await prisma.testCatalogItem.findFirst({ where: { id: String(req.params.id), tenantId: req.context!.tenantId } }); if (!data) throw notFound("Catalog item"); res.json({ data }); }));
catalogRoutes.post("/", rejectAuditorWrites, requirePermission("admin.roles"), validate({ body: createTest }), asyncHandler(async (req, res) => { const latest = await prisma.testCatalogItem.findFirst({ where: { tenantId: req.context!.tenantId, code: req.body.code }, orderBy: { version: "desc" } }); res.status(201).json({ data: await prisma.testCatalogItem.create({ data: { tenantId: req.context!.tenantId, ...req.body, version: (latest?.version ?? 0) + 1, status: "ACTIVE", effectiveDate: req.body.effectiveDate ?? new Date() } }) }); }));
