import type { Invoice, Payment, Contract } from "@/lib/types/domain";

export const MOCK_INVOICES: Invoice[] = [
  { id: "INV-3001", orderId: "ORD-70013", patientName: "Arjun Mehta", amount: 1850, status: "invoiced", issuedAt: "2026-08-23T08:15:00+05:30" },
  { id: "INV-3002", orderId: "ORD-70014", patientName: "Priya Nair", amount: 950, status: "estimate", issuedAt: "2026-08-23T09:22:00+05:30" },
  { id: "INV-3003", orderId: "ORD-70017", patientName: "Vikram Chauhan", amount: 1200, status: "paid", issuedAt: "2026-08-21T11:25:00+05:30" },
  { id: "INV-3004", clientOrgId: "CLI-002", patientName: "Apex Corporate Wellness — Aug batch", amount: 186500, status: "partially_paid", issuedAt: "2026-08-01T00:00:00+05:30", dueAt: "2026-08-31" },
  { id: "INV-3005", clientOrgId: "CLI-003", patientName: "CarePlus TPA — Aug statement", amount: 412300, status: "invoiced", issuedAt: "2026-08-01T00:00:00+05:30", dueAt: "2026-09-15" },
  { id: "INV-3006", orderId: "ORD-70020", patientName: "Divya Prakash", amount: 0, status: "credit", issuedAt: "2026-08-18T12:05:00+05:30" },
];

export const MOCK_PAYMENTS: Payment[] = [
  { id: "PAY-501", invoiceId: "INV-3003", amount: 1200, method: "upi", receivedAt: "2026-08-21T11:30:00+05:30" },
  { id: "PAY-502", invoiceId: "INV-3004", amount: 120000, method: "bank_transfer", receivedAt: "2026-08-15T00:00:00+05:30" },
  { id: "PAY-503", invoiceId: "INV-3001", amount: 1850, method: "card", receivedAt: "2026-08-23T08:20:00+05:30" },
];

export const MOCK_CONTRACTS: Contract[] = [
  { id: "CTR-9002", clientOrgId: "CLI-002", clientName: "Apex Corporate Wellness Pvt Ltd", rateCardVersion: "RC-2026-A", creditLimit: 500000, creditTermsDays: 30, status: "active" },
  { id: "CTR-9003", clientOrgId: "CLI-003", clientName: "CarePlus TPA Services", rateCardVersion: "RC-2026-B", creditLimit: 800000, creditTermsDays: 45, status: "active" },
  { id: "CTR-9001", clientOrgId: "CLI-001", clientName: "Sunrise Multispeciality Hospital", rateCardVersion: "RC-2025-H", creditLimit: 0, creditTermsDays: 0, status: "pending_renewal" },
];
