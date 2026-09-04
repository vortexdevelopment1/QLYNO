import type { Prisma, PrismaClient, SpecimenStatus, TestStatus } from "../generated/prisma";

type Db = PrismaClient | Prisma.TransactionClient;

export const PIPELINE_STAGES = ["ORDER_RECEIVED", "COLLECTION_READY", "RECEIVING", "ACCESSIONING", "PROCESSING", "TECHNICAL_REVIEW", "MEDICAL_VALIDATION", "REPORT_RELEASE", "DELIVERY_CLOSURE", "CLOSED"] as const;

export async function appendLifecycleEvent(db: Db, input: { tenantId: string; orderId: string; orderItemId?: string; specimenId?: string; type: string; actorUserId?: string; actorName: string; actorType?: string; reason?: string; metadata?: Prisma.InputJsonValue }): Promise<void> {
  await db.auditEvent.create({ data: { tenantId: input.tenantId, actorUserId: input.actorUserId, entity: "LaboratoryLifecycle", entityId: input.orderId, action: input.type, afterState: { orderId: input.orderId, orderItemId: input.orderItemId ?? null, specimenId: input.specimenId ?? null, actorType: input.actorType ?? "USER", actorName: input.actorName, reason: input.reason ?? null, metadata: input.metadata ?? null } } });
}

function allIn(values: readonly string[], accepted: readonly string[]): boolean { return values.length > 0 && values.every((value) => accepted.includes(value)); }

export async function getOrderLifecycle(db: Db, tenantId: string, orderId: string) {
  const order = await db.laboratoryOrder.findFirst({ where: { id: orderId, tenantId }, include: { specimens: true, items: true, reports: { include: { versions: { orderBy: { version: "desc" }, take: 1 } } } } });
  if (!order) return null;
  const specimenStatuses = order.specimens.map((item) => item.status as SpecimenStatus);
  const testStatuses = order.items.map((item) => item.status as TestStatus);
  const allCollected = allIn(specimenStatuses, ["COLLECTED", "IN_TRANSIT", "RECEIVED", "ACCESSIONED", "ACCEPTED", "ALIQUOTED", "STORED", "DISPOSED", "REJECTED"]);
  const allReceived = allIn(specimenStatuses, ["RECEIVED", "ACCESSIONED", "ACCEPTED", "ALIQUOTED", "STORED", "DISPOSED", "REJECTED"]);
  const allAccessioned = allIn(specimenStatuses, ["ACCESSIONED", "ACCEPTED", "ALIQUOTED", "STORED", "DISPOSED", "REJECTED"]);
  const processed = allIn(testStatuses, ["RESULTED", "TECHNICAL_REVIEW", "MEDICAL_REVIEW", "VERIFIED", "RELEASED"]);
  const technical = allIn(testStatuses, ["TECHNICAL_REVIEW", "MEDICAL_REVIEW", "VERIFIED", "RELEASED"]);
  const medical = allIn(testStatuses, ["VERIFIED", "RELEASED"]);
  const released = order.reports.some((report) => report.versions.some((version) => ["FINAL", "CORRECTED", "AMENDED"].includes(version.status)));
  const currentStage = order.status === "COMPLETED" ? "CLOSED" : !allCollected ? "COLLECTION_READY" : !allReceived ? "RECEIVING" : !allAccessioned ? "ACCESSIONING" : !processed ? "PROCESSING" : !technical ? "TECHNICAL_REVIEW" : !medical ? "MEDICAL_VALIDATION" : !released ? "REPORT_RELEASE" : "DELIVERY_CLOSURE";
  const index = PIPELINE_STAGES.indexOf(currentStage);
  return { currentStage, currentQueue: currentStage === "COLLECTION_READY" ? "/collection" : currentStage === "RECEIVING" ? "/collection/scan" : currentStage === "ACCESSIONING" ? "/accessioning" : currentStage === "PROCESSING" ? "/workbench" : currentStage === "TECHNICAL_REVIEW" ? "/results/technical-review" : currentStage === "MEDICAL_VALIDATION" ? "/results/medical-validation" : currentStage === "REPORT_RELEASE" || currentStage === "DELIVERY_CLOSURE" ? "/reports" : "/orders", progressPercent: Math.round((index / (PIPELINE_STAGES.length - 1)) * 100), stages: PIPELINE_STAGES.map((stage, stageIndex) => ({ stage, status: stageIndex < index ? "COMPLETED" : stageIndex === index ? "ACTIVE" : "NOT_STARTED" })) };
}
