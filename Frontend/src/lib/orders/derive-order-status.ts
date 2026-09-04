import type { OrderStatus, TestStatus } from "@/lib/types/domain";

export function deriveOrderStatus(statuses: TestStatus[], orderCancelled = false): OrderStatus {
  if (orderCancelled) return "cancelled";
  if (statuses.length === 0 || statuses.every((status) => status === "ordered")) return "placed";
  const terminal = statuses.filter((status) => status === "released").length;
  const blocked = statuses.filter((status) => status === "blocked" || status === "repeat_required").length;
  if (terminal === statuses.length) return "completed";
  if (terminal > 0) return "partially_completed";
  if (blocked === statuses.length) return "on_hold";
  return "in_progress";
}

export function summarizeOrderItems(statuses: TestStatus[]) {
  return {
    completed: statuses.filter((status) => status === "released").length,
    awaitingValidation: statuses.filter((status) => status === "technical_review" || status === "medical_review").length,
    recollection: statuses.filter((status) => status === "repeat_required").length,
  };
}
