import type { Result, ReportVersion, CriticalNotification } from "@/lib/types/domain";

export const MOCK_RESULTS: Result[] = [
  { id: "RES-1", orderItemId: "OI-2", testName: "Haemoglobin", value: "10.2", units: "g/dL", referenceRange: "13.0–17.0", flag: "low", status: "resulted", enteredBy: "Analyzer AN-02", previousValue: "11.8", deltaWarning: true },
  { id: "RES-2", orderItemId: "OI-1", testName: "ALT (SGPT)", value: "142", units: "U/L", referenceRange: "7–56", flag: "high", status: "technical_review", enteredBy: "Analyzer AN-01" },
  { id: "RES-3", orderItemId: "OI-3", testName: "INR", value: "1.05", units: "ratio", referenceRange: "0.8–1.1", flag: "normal", status: "released", enteredBy: "S. Kulkarni (Tech)" },
  { id: "RES-4", orderItemId: "OI-7", testName: "TSH", value: "0.08", units: "µIU/mL", referenceRange: "0.4–4.0", flag: "critical_low", status: "released", enteredBy: "Analyzer AN-04" },
  { id: "RES-5", orderItemId: "OI-8", testName: "Total Bilirubin", value: "18.4", units: "mg/dL", referenceRange: "0.3–1.2", flag: "critical_high", status: "released", enteredBy: "Analyzer AN-01" },
  { id: "RES-6", orderItemId: "OI-9", testName: "Blood Culture — Growth", value: "Pending (QC blocked)", units: "—", referenceRange: "No growth", flag: "normal", status: "blocked", enteredBy: "—" },
  { id: "RES-7", orderItemId: "OI-11", testName: "AST (SGOT)", value: "48", units: "U/L", referenceRange: "8–48", flag: "normal", status: "technical_review", enteredBy: "Analyzer AN-01" },
  { id: "RES-8", orderItemId: "OI-12", testName: "PT (seconds)", value: "13.9", units: "sec", referenceRange: "11–13.5", flag: "high", status: "medical_review", enteredBy: "Analyzer AN-03" },
  { id: "RES-9", orderItemId: "OI-13", testName: "ALT (SGPT)", value: "61", units: "U/L", referenceRange: "7–56", flag: "high", status: "medical_review", enteredBy: "Analyzer AN-01", previousValue: "44" },
];

export const MOCK_REPORT_VERSIONS: ReportVersion[] = [
  { id: "RPT-8001-v1", orderId: "ORD-70012", patientId: "PAT-1002", patientMrn: "MRN-450002", patientName: "Sunita Deshmukh", reportGroupId: "RG-HEM", department: "Hematology", includedOrderItemIds: ["OI-3"], version: 1, status: "final", critical: false, deliveryStatus: "delivered", releasedAt: "2026-08-23T07:40:00+05:30", authorizedBy: "Dr. S. Kelkar (Pathologist)" },
  { id: "RPT-8004-v1", orderId: "ORD-70012", patientId: "PAT-1002", patientMrn: "MRN-450002", patientName: "Sunita Deshmukh", reportGroupId: "RG-BIO", department: "Biochemistry", includedOrderItemIds: ["OI-13"], version: 1, status: "preliminary", critical: false, deliveryStatus: "pending", releasedAt: "2026-08-23T08:05:00+05:30", authorizedBy: "Dr. S. Kelkar (Pathologist)" },
  { id: "RPT-8002-v1", orderId: "ORD-70015", patientName: "Karthik Subramaniam", version: 1, status: "final", releasedAt: "2026-08-22T12:10:00+05:30", authorizedBy: "Dr. S. Kelkar (Pathologist)" },
  { id: "RPT-8003-v1", orderId: "ORD-70017", patientName: "Vikram Chauhan", version: 1, status: "final", releasedAt: "2026-08-21T13:00:00+05:30", authorizedBy: "Dr. S. Kelkar (Pathologist)" },
  {
    id: "RPT-8003-v2", orderId: "ORD-70017", patientName: "Vikram Chauhan", version: 2, status: "corrected",
    reason: "ALT re-run confirmed transcription error in original entry (142 recorded, instrument value 124)",
    releasedAt: "2026-08-21T16:30:00+05:30", authorizedBy: "Dr. S. Kelkar (Pathologist)",
  },
];

export const MOCK_CRITICAL_NOTIFICATIONS: CriticalNotification[] = [
  { id: "CRIT-201", patientName: "Karthik Subramaniam", testName: "TSH", value: "0.08 µIU/mL", notifiedTo: "Dr. Nikhil Wagh", acknowledged: true, readBackAt: "2026-08-22T12:22:00+05:30", timerSeconds: 720 },
  { id: "CRIT-202", patientName: "Karthik Subramaniam", testName: "Total Bilirubin", value: "18.4 mg/dL", notifiedTo: "Dr. Nikhil Wagh", acknowledged: false, timerSeconds: 240 },
  { id: "CRIT-203", patientName: "Sunita Deshmukh", testName: "Platelet Count", value: "18 x10^3/µL", notifiedTo: "Dr. Alka Bhosle", acknowledged: true, readBackAt: "2026-08-23T06:52:00+05:30", timerSeconds: 900 },
];
