import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../db/prisma";
import { protectedRouter } from "../../middleware/protected";
import { rejectAuditorWrites, requireAnyPermission, requirePermission } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/async-handler";
import { notFound } from "../../utils/errors";
import { orderReadScope, patientReadScope } from "../../services/scope";
import { audit } from "../../services/audit";

const id = z.object({ id: z.string().min(1).max(100) }).strict();
const query = z.object({ search: z.string().max(120).optional(), take: z.coerce.number().int().min(1).max(100).default(25), cursor: z.string().optional() }).strict();
const create = z.object({ mrn: z.string().max(80).optional(), name: z.string().min(2).max(160), dateOfBirth: z.coerce.date().optional(), sex: z.enum(["M", "F", "O"]), contact: z.string().min(5).max(80), source: z.enum(["HOSPITAL_ENCOUNTER", "WALK_IN", "HOME_COLLECTION", "B2B_CLIENT", "INTERNAL_NO_CHARGE"]), branchOrWard: z.string().max(160).optional() }).strict();
const update = create.partial().refine((value) => Object.keys(value).length > 0);
export const patientRoutes = protectedRouter();
patientRoutes.get("/", requireAnyPermission("patients.read", "patients.read.own", "patients.read.client"), validate({ query }), asyncHandler(async (req, res) => { const parsed = query.parse(req.query); const where = patientReadScope(req.context!); const rows = await prisma.patient.findMany({ where: { ...where, ...(parsed.search ? { OR: [{ name: { contains: parsed.search, mode: "insensitive" } }, { mrn: { contains: parsed.search, mode: "insensitive" } }] } : {}) }, take: parsed.take, ...(parsed.cursor ? { cursor: { id: parsed.cursor }, skip: 1 } : {}), orderBy: { createdAt: "desc" } }); res.json({ data: rows, nextCursor: rows.at(-1)?.id }); }));
patientRoutes.get("/:id", requireAnyPermission("patients.read", "patients.read.own", "patients.read.client"), validate({ params: id }), asyncHandler(async (req, res) => { const row = await prisma.patient.findFirst({ where: { id: String(req.params.id), ...patientReadScope(req.context!) }, include: { identifiers: true, encounters: true, orders: { where: orderReadScope(req.context!), take: 20, orderBy: { placedAt: "desc" } }, specimens: { where: { order: orderReadScope(req.context!) }, take: 50, orderBy: { createdAt: "desc" } } } }); if (!row) throw notFound("Patient"); res.json({ data: row }); }));
patientRoutes.post("/", rejectAuditorWrites, requirePermission("patients.write"), validate({ body: create }), asyncHandler(async (req, res) => { const row = await prisma.patient.create({ data: { tenantId: req.context!.tenantId, ...req.body } }); await audit(req, "Patient", row.id, "PATIENT_CREATED", undefined, { name: row.name, mrn: row.mrn ?? null }); res.status(201).json({ data: row }); }));
patientRoutes.patch("/:id", rejectAuditorWrites, requirePermission("patients.write"), validate({ params: id, body: update }), asyncHandler(async (req, res) => { const current = await prisma.patient.findFirst({ where: { id: String(req.params.id), tenantId: req.context!.tenantId } }); if (!current) throw notFound("Patient"); const row = await prisma.patient.update({ where: { id: current.id }, data: req.body }); await audit(req, "Patient", row.id, "PATIENT_UPDATED", current, row); res.json({ data: row }); }));
patientRoutes.delete("/:id", rejectAuditorWrites, requirePermission("patients.write"), validate({ params: id }), asyncHandler(async (req, res) => { const current = await prisma.patient.findFirst({ where: { id: String(req.params.id), tenantId: req.context!.tenantId } }); if (!current) throw notFound("Patient"); await prisma.patient.delete({ where: { id: current.id } }); await audit(req, "Patient", current.id, "PATIENT_DELETED", current, undefined); res.status(204).send(); }));

const encounter = z.object({ patientId: z.string().min(1), encounterNo: z.string().min(1).max(80), ward: z.string().max(100).optional(), bed: z.string().max(40).optional(), admittingDoctor: z.string().max(160).optional(), status: z.string().min(1).max(50) }).strict();
export const encounterRoutes = protectedRouter();
encounterRoutes.get("/", requirePermission("patients.read"), asyncHandler(async (req, res) => { res.json({ data: await prisma.encounter.findMany({ where: { tenantId: req.context!.tenantId, patient: patientReadScope(req.context!) }, include: { patient: true }, orderBy: { encounterNo: "desc" } }) }); }));
encounterRoutes.post("/", rejectAuditorWrites, requirePermission("patients.write"), validate({ body: encounter }), asyncHandler(async (req, res) => { const patient = await prisma.patient.findFirst({ where: { id: req.body.patientId, tenantId: req.context!.tenantId } }); if (!patient) throw notFound("Patient"); res.status(201).json({ data: await prisma.encounter.create({ data: { tenantId: req.context!.tenantId, ...req.body } }) }); }));
