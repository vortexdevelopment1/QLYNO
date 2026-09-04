import type { Specimen, Manifest, Analyzer, InstrumentRun } from "@/lib/types/domain";

export const MOCK_SPECIMENS: Specimen[] = [
  { id: "SPX-9001", orderId: "ORD-70011", patientName: "Ramesh Iyer", type: "Serum", container: "SST (Gold top)", status: "accessioned", collectedAt: "2026-08-23T07:20:00+05:30" },
  { id: "SPX-9002", orderId: "ORD-70011", patientName: "Ramesh Iyer", type: "Whole Blood", container: "EDTA (Lavender top)", status: "accepted", collectedAt: "2026-08-23T07:20:00+05:30" },
  { id: "SPX-9003", orderId: "ORD-70012", patientName: "Sunita Deshmukh", type: "Whole Blood", container: "EDTA (Lavender top) — CBC", status: "accepted", collectedAt: "2026-08-23T06:45:00+05:30" },
  { id: "SPX-9011", orderId: "ORD-70012", patientName: "Sunita Deshmukh", type: "Serum", container: "SST (Gold top) — LFT and TSH", status: "accepted", collectedAt: "2026-08-23T06:45:00+05:30" },
  { id: "SPX-9012", orderId: "ORD-70012", patientName: "Sunita Deshmukh", type: "Urine", container: "Sterile urine cup — Urine Routine", status: "rejected", collectedAt: "2026-08-23T06:47:00+05:30", rejectedReason: "Leaking container; recollection required" },
  { id: "SPX-9004", orderId: "ORD-70013", patientName: "Arjun Mehta", type: "Serum + Whole Blood", container: "SST + EDTA", status: "received", collectedAt: "2026-08-23T08:10:00+05:30" },
  { id: "SPX-9005", orderId: "ORD-70015", patientName: "Karthik Subramaniam", type: "Serum", container: "SST (Gold top)", status: "stored", collectedAt: "2026-08-22T10:15:00+05:30", storageLocation: "Freezer 2 / Rack C / Slot 14" },
  { id: "SPX-9006", orderId: "ORD-70016", patientName: "Fatima Sheikh", type: "Blood Culture", container: "BacT/ALERT Bottle", status: "in_transit", collectedAt: "2026-08-23T06:05:00+05:30" },
  { id: "SPX-9006R", orderId: "ORD-70016", patientName: "Fatima Sheikh", type: "Blood Culture", container: "BacT/ALERT Bottle", status: "rejected", collectedAt: "2026-08-23T05:40:00+05:30", rejectedReason: "Insufficient volume for aerobic + anaerobic bottles" },
  { id: "SPX-9007", orderId: "ORD-70017", patientName: "Vikram Chauhan", type: "Serum", container: "SST (Gold top)", status: "disposed", collectedAt: "2026-08-21T11:20:00+05:30" },
  { id: "SPX-9008", orderId: "ORD-70019", patientName: "Anil Kapoor Rao", type: "Serum", container: "SST (Gold top)", status: "aliquoted", collectedAt: "2026-08-23T07:55:00+05:30", parentSpecimenId: "SPX-9008" },
  { id: "SPX-9009", orderId: "ORD-70019", patientName: "Anil Kapoor Rao", type: "Plasma", container: "Sodium Citrate (Blue top)", status: "accepted", collectedAt: "2026-08-23T07:55:00+05:30" },
  { id: "SPX-9010", orderId: "ORD-70013", patientName: "Arjun Mehta", type: "Urine", container: "Sterile Urine Cup", status: "expected" },
  { id: "SPX-9006RC", orderId: "ORD-70016", patientName: "Fatima Sheikh", type: "Blood Culture", container: "BacT/ALERT Bottle", status: "label_printed", recollectionOfId: "SPX-9006R" },
];

export const MOCK_MANIFESTS: Manifest[] = [
  { id: "MAN-3301", route: "Andheri → Central Lab", courier: "Ravi Tambe", status: "in_transit", specimenCount: 18, temperature: "2–8°C (Cold Box)", createdAt: "2026-08-23T09:00:00+05:30" },
  { id: "MAN-3302", route: "Powai Home Collection Zone", courier: "Sandeep Yadav", status: "sealed", specimenCount: 9, temperature: "Ambient", createdAt: "2026-08-23T09:15:00+05:30" },
  { id: "MAN-3303", route: "Thane Branch → Central Lab", courier: "Imran Shaikh", status: "delayed", specimenCount: 12, temperature: "2–8°C (Cold Box)", createdAt: "2026-08-23T07:30:00+05:30" },
  { id: "MAN-3304", route: "Bandra Zone → Central Lab", courier: "Sandeep Yadav", status: "delivered", specimenCount: 14, temperature: "Ambient", createdAt: "2026-08-22T09:00:00+05:30" },
  { id: "MAN-3305", route: "Outbound → Metropolis Reference Lab", courier: "Blue Dart Courier", status: "building", specimenCount: 3, temperature: "Frozen (-20°C)", createdAt: "2026-08-23T10:00:00+05:30" },
];

export const MOCK_ANALYZERS: Analyzer[] = [
  { id: "AN-01", name: "Cobas c311", department: "Chemistry", status: "connected", lastMessageAt: "2026-08-23T09:58:00+05:30", queueDepth: 6, mappingVersion: "map-v2.3", errorCount: 0 },
  { id: "AN-02", name: "Sysmex XN-1000", department: "Hematology", status: "connected", lastMessageAt: "2026-08-23T09:59:00+05:30", queueDepth: 3, mappingVersion: "map-v1.9", errorCount: 0 },
  { id: "AN-03", name: "Stago STA Compact", department: "Coagulation", status: "maintenance", lastMessageAt: "2026-08-23T07:10:00+05:30", queueDepth: 0, mappingVersion: "map-v1.2", errorCount: 1 },
  { id: "AN-04", name: "Architect i1000SR", department: "Immunology", status: "connected", lastMessageAt: "2026-08-23T09:50:00+05:30", queueDepth: 11, mappingVersion: "map-v3.0", errorCount: 0 },
  { id: "AN-05", name: "iChem Urine Analyzer", department: "Urinalysis", status: "offline", lastMessageAt: "2026-08-23T04:22:00+05:30", queueDepth: 0, mappingVersion: "map-v1.0", errorCount: 4 },
  { id: "AN-06", name: "BacT/ALERT 3D", department: "Microbiology", status: "connected", lastMessageAt: "2026-08-23T09:40:00+05:30", queueDepth: 2, mappingVersion: "map-v1.5", errorCount: 0 },
];

export const MOCK_INSTRUMENT_RUNS: InstrumentRun[] = [
  { id: "RUN-501", analyzerId: "AN-01", runAt: "2026-08-23T09:30:00+05:30", itemCount: 24, status: "completed" },
  { id: "RUN-502", analyzerId: "AN-02", runAt: "2026-08-23T09:45:00+05:30", itemCount: 18, status: "in_progress" },
  { id: "RUN-503", analyzerId: "AN-04", runAt: "2026-08-23T09:20:00+05:30", itemCount: 11, status: "completed" },
  { id: "RUN-504", analyzerId: "AN-03", runAt: "2026-08-23T07:05:00+05:30", itemCount: 6, status: "failed" },
];
