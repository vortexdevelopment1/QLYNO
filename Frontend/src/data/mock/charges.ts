import type { HospitalBillingPosting, LaboratoryChargeLine } from "@/lib/types/laboratory-session";
import type { Order, OrderItem } from "@/lib/types/domain";

export const MOCK_CHARGE_LINES: LaboratoryChargeLine[] = [
  { id: "CHG-1101", tenantId: "TEN-SUNRISE", patientId: "PAT-1001", encounterId: "ENC-501", laboratoryOrderId: "ORD-70011", orderItemId: "OI-1", chargeType: "PANEL", serviceCode: "LFT-01", description: "Liver Function Panel", quantity: 1, unitPrice: 950, grossAmount: 950, discountAmount: 150, taxableAmount: 0, taxCode: "HEALTH-EXEMPT", taxRate: 0, taxAmount: 0, netAmount: 800, billingOwner: "HMS_CENTRAL" },
  { id: "CHG-1102", tenantId: "TEN-SUNRISE", patientId: "PAT-1001", encounterId: "ENC-501", laboratoryOrderId: "ORD-70011", orderItemId: "OI-2", chargeType: "TEST", serviceCode: "CBC-01", description: "Complete Blood Count", quantity: 1, unitPrice: 500, grossAmount: 500, discountAmount: 0, taxableAmount: 0, taxCode: "HEALTH-EXEMPT", taxRate: 0, taxAmount: 0, netAmount: 500, billingOwner: "HMS_CENTRAL" },
  { id: "CHG-1201", tenantId: "TEN-SUNRISE", patientId: "PAT-1002", encounterId: "ENC-502", laboratoryOrderId: "ORD-70012", orderItemId: "OI-3", chargeType: "TEST", serviceCode: "PT-INR", description: "Prothrombin Time / INR", quantity: 1, unitPrice: 620, grossAmount: 620, discountAmount: 120, taxableAmount: 0, taxCode: "HEALTH-EXEMPT", taxRate: 0, taxAmount: 0, netAmount: 500, billingOwner: "HMS_CENTRAL" },
  { id: "CHG-1601", tenantId: "TEN-SUNRISE", patientId: "PAT-1006", encounterId: "ENC-506", laboratoryOrderId: "ORD-70016", orderItemId: "OI-9", chargeType: "TEST", serviceCode: "BCULT-01", description: "Blood Culture", quantity: 1, unitPrice: 1450, grossAmount: 1450, discountAmount: 0, taxableAmount: 1450, taxCode: "HMS-SVC-05", taxRate: 5, taxAmount: 72.5, netAmount: 1522.5, billingOwner: "HMS_CENTRAL" },
  { id: "CHG-1301", tenantId: "TEN-AAROGYA", patientId: "PAT-1003", laboratoryOrderId: "ORD-70013", orderItemId: "OI-4", chargeType: "TEST", serviceCode: "HBA1C", description: "HbA1c", quantity: 1, unitPrice: 850, grossAmount: 850, discountAmount: 0, taxableAmount: 0, taxCode: "EXEMPT", taxRate: 0, taxAmount: 0, netAmount: 850, billingOwner: "LIS_INTERNAL" },
  { id: "CHG-1302", tenantId: "TEN-AAROGYA", patientId: "PAT-1003", laboratoryOrderId: "ORD-70013", orderItemId: "OI-5", chargeType: "PANEL", serviceCode: "LIPID", description: "Lipid Profile", quantity: 1, unitPrice: 1000, grossAmount: 1000, discountAmount: 0, taxableAmount: 0, taxCode: "EXEMPT", taxRate: 0, taxAmount: 0, netAmount: 1000, billingOwner: "LIS_INTERNAL" },
];

export const MOCK_HMS_POSTINGS: HospitalBillingPosting[] = [
  { id: "POST-70011-V1", tenantId: "TEN-SUNRISE", laboratoryOrderId: "ORD-70011", postingVersion: 1, status: "POSTED", hmsBillId: "HB-9011", hmsBillNumber: "SUN/2026/089011", postedAmount: 1300, postedAt: "2026-08-23T07:13:00+05:30", lastAttemptAt: "2026-08-23T07:13:00+05:30" },
  { id: "POST-70012-V1", tenantId: "TEN-SUNRISE", laboratoryOrderId: "ORD-70012", postingVersion: 1, status: "POSTED", hmsBillId: "HB-9012", hmsBillNumber: "SUN/2026/089012", postedAmount: 500, postedAt: "2026-09-01T09:01:00+05:30", lastAttemptAt: "2026-09-01T09:01:00+05:30" },
  { id: "POST-70016-V1", tenantId: "TEN-SUNRISE", laboratoryOrderId: "ORD-70016", postingVersion: 1, status: "RECONCILIATION_REQUIRED", failureReason: "HMS price-list version changed after order confirmation.", lastAttemptAt: "2026-08-23T07:00:00+05:30", reconciliationNote: "Awaiting central billing review." },
];

export function chargeLinesForOrder(orderId: string, tenantId: string) { return MOCK_CHARGE_LINES.filter((line) => line.laboratoryOrderId === orderId && line.tenantId === tenantId); }
export function chargeLinesForOrderWithFallback(order: Order, items: OrderItem[], tenantId: string) {
  const existing = chargeLinesForOrder(order.id, tenantId); if (existing.length) return existing;
  return items.map((item, index): LaboratoryChargeLine => { const unitPrice = 500 + index * 150; return { id: `CHG-${order.id}-${index + 1}`, tenantId, patientId: order.patientId, laboratoryOrderId: order.id, orderItemId: item.id, chargeType: "TEST", serviceCode: item.testId, description: item.testName, quantity: 1, unitPrice, grossAmount: unitPrice, discountAmount: 0, taxableAmount: 0, taxCode: "HEALTH-EXEMPT", taxRate: 0, taxAmount: 0, netAmount: unitPrice, billingOwner: "HMS_CENTRAL" }; });
}
export function postingForOrder(orderId: string, tenantId: string) { return MOCK_HMS_POSTINGS.find((posting) => posting.laboratoryOrderId === orderId && posting.tenantId === tenantId); }
