import type { QcRun, Nonconformance, Capa } from "@/lib/types/domain";

export const MOCK_QC_RUNS: QcRun[] = [
  { id: "QC-4401", analyte: "Glucose", department: "Chemistry", controlLot: "LOT-CG-2291", level: "L1", status: "in_control", runAt: "2026-08-23T06:00:00+05:30" },
  { id: "QC-4402", analyte: "Glucose", department: "Chemistry", controlLot: "LOT-CG-2291", level: "L2", status: "out_of_control", westgardViolation: "1-3s violation on L2", runAt: "2026-08-23T06:02:00+05:30" },
  { id: "QC-4403", analyte: "Haemoglobin", department: "Hematology", controlLot: "LOT-HM-1187", level: "L1", status: "in_control", runAt: "2026-08-23T06:10:00+05:30" },
  { id: "QC-4404", analyte: "INR", department: "Coagulation", controlLot: "LOT-CO-0552", level: "L2", status: "warning", westgardViolation: "1-2s warning", runAt: "2026-08-23T06:15:00+05:30" },
  { id: "QC-4405", analyte: "TSH", department: "Immunology", controlLot: "LOT-IM-0871", level: "L1", status: "reviewed", runAt: "2026-08-22T06:00:00+05:30" },
  { id: "QC-4406", analyte: "Sodium", department: "Chemistry", controlLot: "LOT-CG-2291", level: "L1", status: "closed", runAt: "2026-08-21T06:00:00+05:30" },
];

export const MOCK_NONCONFORMANCES: Nonconformance[] = [
  { id: "NC-301", title: "Glucose L2 QC out-of-control not actioned within SLA", category: "Analytical", severity: "major", status: "capa_linked", raisedAt: "2026-08-23T06:20:00+05:30" },
  { id: "NC-302", title: "Blood culture bottle received with insufficient volume", category: "Pre-analytical", severity: "minor", status: "investigating", raisedAt: "2026-08-23T06:10:00+05:30" },
  { id: "NC-303", title: "Delayed manifest — Thane route cold-chain excursion risk", category: "Logistics", severity: "major", status: "open", raisedAt: "2026-08-23T08:00:00+05:30" },
  { id: "NC-304", title: "Report correction — ALT transcription error", category: "Post-analytical", severity: "critical", status: "closed", raisedAt: "2026-08-21T14:00:00+05:30" },
];

export const MOCK_CAPAS: Capa[] = [
  { id: "CAPA-101", ncId: "NC-301", title: "Retrain chemistry staff on Westgard rule escalation", stage: "action_plan", owner: "Quality Manager", dueDate: "2026-08-29" },
  { id: "CAPA-102", ncId: "NC-304", title: "Enforce dual-entry check for manual result transcription", stage: "closed", owner: "Section Supervisor — Chemistry", dueDate: "2026-08-15" },
];
