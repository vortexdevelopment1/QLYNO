import { z } from "zod";
import { prisma } from "../../db/prisma";
import { requireAnyPermission } from "../../middleware/authorize";
import { protectedRouter } from "../../middleware/protected";
import { validate } from "../../middleware/validate";
import { orderReadScope, specimenReadScope } from "../../services/scope";
import { asyncHandler } from "../../utils/async-handler";

const queueParams = z.object({
  type: z.enum(["collection", "receiving", "accessioning", "processing", "technical-review", "medical-validation", "report-release", "rejections"])
}).strict();
const pagination = z.object({ limit: z.coerce.number().int().min(1).max(200).default(50), cursor: z.string().optional() }).strict();

export const queueRoutes = protectedRouter();
queueRoutes.get("/", requireAnyPermission("dashboard.read", "orders.read", "orders.read.own", "orders.read.client"), asyncHandler(async (req, res) => {
  const orderScope = orderReadScope(req.context!);
  const specimenScope = specimenReadScope(req.context!);
  const tenantId = req.context!.tenantId;
  const [collection, receiving, accessioning, processing, technicalReview, medicalValidation, reportRelease, rejections] = await Promise.all([
    prisma.collectionTask.count({ where: { tenantId, order: orderScope, status: { in: ["PENDING", "PARTIAL"] } } }),
    prisma.specimen.count({ where: { ...specimenScope, status: { in: ["COLLECTED", "IN_TRANSIT"] } } }),
    prisma.specimen.count({ where: { ...specimenScope, status: "RECEIVED", accessionId: null } }),
    prisma.workItem.count({ where: { tenantId, status: { in: ["READY", "RUNNING"] }, orderItem: { order: orderScope } } }),
    prisma.result.count({ where: { tenantId, status: "RESULTED", orderItem: { order: orderScope } } }),
    prisma.result.count({ where: { tenantId, status: "TECHNICAL_REVIEW", orderItem: { order: orderScope } } }),
    prisma.result.count({ where: { tenantId, status: "VERIFIED", orderItem: { order: orderScope } } }),
    prisma.specimen.count({ where: { ...specimenScope, status: "REJECTED" } })
  ]);
  res.json({ data: { collection, receiving, accessioning, processing, technicalReview, medicalValidation, reportRelease, rejections } });
}));

queueRoutes.get("/:type", requireAnyPermission("dashboard.read", "orders.read", "orders.read.own", "orders.read.client"), validate({ params: queueParams, query: pagination }), asyncHandler(async (req, res) => {
  const type = queueParams.parse(req.params).type;
  const { limit, cursor } = pagination.parse(req.query);
  const page = { take: limit + 1, ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}) };
  const orderScope = orderReadScope(req.context!);
  const specimenScope = specimenReadScope(req.context!);
  const tenantId = req.context!.tenantId;
  let rows: Array<{ id: string }>;
  if (type === "collection") rows = await prisma.collectionTask.findMany({ where: { tenantId, order: orderScope, status: { in: ["PENDING", "PARTIAL"] } }, include: { order: { include: { patient: true } }, specimens: { include: { specimen: { include: { containerType: true } } } } }, orderBy: { scheduledAt: "asc" }, ...page });
  else if (type === "receiving") rows = await prisma.specimen.findMany({ where: { ...specimenScope, status: { in: ["COLLECTED", "IN_TRANSIT"] } }, include: { patient: true, order: true, containerType: true }, orderBy: { collectedAt: "asc" }, ...page });
  else if (type === "accessioning") rows = await prisma.specimen.findMany({ where: { ...specimenScope, status: "RECEIVED", accessionId: null }, include: { patient: true, order: true, containerType: true }, orderBy: { receivedAt: "asc" }, ...page });
  else if (type === "processing") rows = await prisma.workItem.findMany({ where: { tenantId, status: { in: ["READY", "RUNNING"] }, orderItem: { order: orderScope } }, include: { department: true, orderItem: { include: { test: true, order: { include: { patient: true } } } } }, orderBy: { createdAt: "asc" }, ...page });
  else if (type === "technical-review") rows = await prisma.result.findMany({ where: { tenantId, status: "RESULTED", orderItem: { order: orderScope } }, include: { orderItem: { include: { test: true, order: { include: { patient: true } } } } }, orderBy: { createdAt: "asc" }, ...page });
  else if (type === "medical-validation") rows = await prisma.result.findMany({ where: { tenantId, status: "TECHNICAL_REVIEW", orderItem: { order: orderScope } }, include: { orderItem: { include: { test: true, order: { include: { patient: true } } } } }, orderBy: { createdAt: "asc" }, ...page });
  else if (type === "report-release") rows = await prisma.result.findMany({ where: { tenantId, status: "VERIFIED", orderItem: { order: orderScope } }, include: { orderItem: { include: { test: true, order: { include: { patient: true } } } } }, orderBy: { createdAt: "asc" }, ...page });
  else rows = await prisma.specimen.findMany({ where: { ...specimenScope, status: "REJECTED" }, include: { patient: true, order: true, containerType: true, recollections: true }, orderBy: { rejectedAt: "desc" }, ...page });
  const hasMore = rows.length > limit;
  if (hasMore) rows.pop();
  res.json({ data: rows, page: { nextCursor: hasMore ? rows.at(-1)?.id ?? null : null } });
}));

export const schedulingRoutes = protectedRouter();
schedulingRoutes.get("/", requireAnyPermission("orders.read", "orders.read.own", "orders.read.client"), validate({ query: pagination }), asyncHandler(async (req, res) => {
  const { limit, cursor } = pagination.parse(req.query);
  const rows = await prisma.collectionTask.findMany({
    where: { tenantId: req.context!.tenantId, order: orderReadScope(req.context!), status: { in: ["PENDING", "PARTIAL"] } },
    include: { order: { include: { patient: true, items: { include: { test: true } } } }, site: true, specimens: { include: { specimen: { include: { containerType: true } } } } },
    orderBy: { scheduledAt: "asc" }, take: limit + 1, ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {})
  });
  const hasMore = rows.length > limit;
  if (hasMore) rows.pop();
  res.json({ data: rows, page: { nextCursor: hasMore ? rows.at(-1)?.id ?? null : null } });
}));
