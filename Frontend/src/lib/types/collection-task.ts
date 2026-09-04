import type { Priority } from "./domain";
import type { LaboratoryRole } from "./laboratory-session";

export type CollectionTaskStatus = "PENDING" | "IN_PROGRESS" | "PARTIAL" | "COMPLETED" | "CANCELLED";

export interface CollectionTask {
  id: string;
  tenantId: string;
  siteId: string;
  orderId: string;
  patientId: string;
  encounterId: string;
  specimenIds: string[];
  requiredContainers: string[];
  testNames: string[];
  collectionLocation: string;
  priority: Priority;
  scheduledAt: string;
  assignedRole: Extract<LaboratoryRole, "PHLEBOTOMIST" | "WARD_COLLECTOR">;
  assignedUserId?: string;
  status: CollectionTaskStatus;
  collectedAt?: string;
  collectedBy?: string;
}
