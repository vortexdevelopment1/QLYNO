import type { Order, OrderItem } from "@/lib/types/domain";

export const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-70011", accessionId: "ACC-20260823-001", patientId: "PAT-1001", patientName: "Ramesh Iyer",
    source: "hospital_encounter", billingAuthority: "HMS_CENTRAL", priority: "stat", status: "in_progress",
    reportStatus: "pending", hmsPostingStatus: "posted", orderingDoctor: "Dr. Nikhil Wagh", siteId: "SITE-01",
    departmentIds: ["Chemistry", "Hematology"], placedAt: "2026-08-23T07:12:00+05:30",
    itemIds: ["OI-1", "OI-2"],
  },
  {
    id: "ORD-70012", accessionId: "ACC-20260823-002", patientId: "PAT-1002", patientName: "Sunita Deshmukh",
    source: "hospital_encounter", billingAuthority: "HMS_CENTRAL", priority: "stat", status: "partially_completed",
    reportStatus: "preliminary", hmsPostingStatus: "post_pending", orderingDoctor: "Dr. Alka Bhosle", siteId: "SITE-01",
    departmentIds: ["Hematology", "Chemistry", "Immunology", "Urinalysis"], placedAt: "2026-08-23T06:40:00+05:30", itemIds: ["OI-3", "OI-13", "OI-14", "OI-15"],
  },
  {
    id: "ORD-70013", accessionId: "ACC-20260823-003", patientId: "PAT-1003", patientName: "Arjun Mehta",
    source: "walk_in", billingAuthority: "LIS_INTERNAL", priority: "routine", status: "collected",
    reportStatus: "pending", orderingDoctor: "Dr. Farhan Ansari", siteId: "SITE-02",
    departmentIds: ["Chemistry"], placedAt: "2026-08-23T08:05:00+05:30", itemIds: ["OI-4", "OI-5"],
  },
  {
    id: "ORD-70014", patientId: "PAT-1004", patientName: "Priya Nair",
    source: "home_collection", billingAuthority: "LIS_INTERNAL", priority: "routine", status: "placed",
    reportStatus: "pending", orderingDoctor: "Self / Direct", siteId: "SITE-02",
    departmentIds: ["Hematology"], placedAt: "2026-08-23T09:20:00+05:30", itemIds: ["OI-6"],
  },
  {
    id: "ORD-70015", accessionId: "ACC-20260822-041", patientId: "PAT-1005", patientName: "Karthik Subramaniam",
    source: "b2b_client", billingAuthority: "EXTERNAL_CLIENT", priority: "routine", status: "completed",
    reportStatus: "final", orderingDoctor: "Corporate Wellness Panel", siteId: "SITE-02",
    departmentIds: ["Chemistry", "Immunology"], placedAt: "2026-08-22T10:00:00+05:30",
    itemIds: ["OI-7", "OI-8"], clientOrgId: "CLI-002",
  },
  {
    id: "ORD-70016", accessionId: "ACC-20260823-004", patientId: "PAT-1006", patientName: "Fatima Sheikh",
    source: "hospital_encounter", billingAuthority: "HMS_CENTRAL", priority: "urgent", status: "on_hold",
    reportStatus: "pending", hmsPostingStatus: "reconciliation_required", orderingDoctor: "Dr. Sameer Joshi", siteId: "SITE-01",
    departmentIds: ["Microbiology"], placedAt: "2026-08-23T05:55:00+05:30", itemIds: ["OI-9"],
  },
  {
    id: "ORD-70017", accessionId: "ACC-20260821-018", patientId: "PAT-1007", patientName: "Vikram Chauhan",
    source: "walk_in", billingAuthority: "LIS_INTERNAL", priority: "routine", status: "completed",
    reportStatus: "corrected", orderingDoctor: "Dr. Farhan Ansari", siteId: "SITE-02",
    departmentIds: ["Chemistry"], placedAt: "2026-08-21T11:15:00+05:30", itemIds: ["OI-10"],
  },
  {
    id: "ORD-70018", patientId: "PAT-1008", patientName: "Meera Krishnan",
    source: "home_collection", billingAuthority: "LIS_INTERNAL", priority: "routine", status: "draft",
    reportStatus: "pending", orderingDoctor: "Self / Direct", siteId: "SITE-02",
    departmentIds: ["Chemistry"], placedAt: "2026-08-23T09:45:00+05:30", itemIds: [],
  },
  {
    id: "ORD-70019", accessionId: "ACC-20260823-005", patientId: "PAT-1009", patientName: "Anil Kapoor Rao",
    source: "hospital_encounter", billingAuthority: "HMS_CENTRAL", priority: "stat", status: "in_progress",
    reportStatus: "pending", hmsPostingStatus: "posted", orderingDoctor: "Dr. Rekha Pillai", siteId: "SITE-01",
    departmentIds: ["Chemistry", "Coagulation"], placedAt: "2026-08-23T07:50:00+05:30", itemIds: ["OI-11", "OI-12"],
  },
  {
    id: "ORD-70020", patientId: "PAT-1010", patientName: "Divya Prakash",
    source: "internal_no_charge", billingAuthority: "NO_CHARGE", priority: "routine", status: "cancelled",
    reportStatus: "pending", orderingDoctor: "Staff Health Check", siteId: "SITE-02",
    departmentIds: ["Chemistry"], placedAt: "2026-08-18T12:00:00+05:30", itemIds: [],
  },
];

export const MOCK_ORDER_ITEMS: OrderItem[] = [
  { id: "OI-1", orderId: "ORD-70011", testId: "TC-002", testName: "Liver Function Panel", status: "running", specimenId: "SPX-9001" },
  { id: "OI-2", orderId: "ORD-70011", testId: "TC-001", testName: "Complete Blood Count", status: "resulted", specimenId: "SPX-9002" },
  { id: "OI-3", orderId: "ORD-70012", testId: "TC-001", testName: "Complete Blood Count", status: "released", specimenId: "SPX-9003", departmentId: "Hematology", accessionId: "ACC-23401", resultIds: ["RES-3"], reportGroupId: "RG-HEM", technicalReviewer: "Pooja Iyer", medicalReviewer: "Dr. S. Kelkar", tat: "Completed in 28 min" },
  { id: "OI-13", orderId: "ORD-70012", testId: "TC-002", testName: "Liver Function Test", status: "medical_review", specimenId: "SPX-9011", departmentId: "Chemistry", accessionId: "ACC-23402", resultIds: ["RES-9"], reportGroupId: "RG-BIO", technicalReviewer: "Deepak Shetty", medicalReviewer: "Awaiting pathologist", tat: "14 min remaining" },
  { id: "OI-14", orderId: "ORD-70012", testId: "TC-004", testName: "TSH", status: "running", specimenId: "SPX-9011", departmentId: "Immunology", accessionId: "ACC-23402", resultIds: [], reportGroupId: "RG-IMM", technicalReviewer: "Pending", medicalReviewer: "Pending", tat: "32 min remaining" },
  { id: "OI-15", orderId: "ORD-70012", testId: "TC-011", testName: "Urine Routine", status: "repeat_required", specimenId: "SPX-9012", departmentId: "Urinalysis", accessionId: "ACC-23403", resultIds: [], reportGroupId: "RG-URI", technicalReviewer: "Pending", medicalReviewer: "Pending", tat: "Recollection overdue 2h" },
  { id: "OI-4", orderId: "ORD-70013", testId: "TC-009", testName: "HbA1c", status: "ready", specimenId: "SPX-9004" },
  { id: "OI-5", orderId: "ORD-70013", testId: "TC-010", testName: "Lipid Profile", status: "ready", specimenId: "SPX-9004" },
  { id: "OI-6", orderId: "ORD-70014", testId: "TC-001", testName: "Complete Blood Count", status: "ordered" },
  { id: "OI-7", orderId: "ORD-70015", testId: "TC-004", testName: "TSH", status: "released", specimenId: "SPX-9005" },
  { id: "OI-8", orderId: "ORD-70015", testId: "TC-002", testName: "Liver Function Panel", status: "released", specimenId: "SPX-9005" },
  { id: "OI-9", orderId: "ORD-70016", testId: "TC-006", testName: "Blood Culture", status: "blocked", specimenId: "SPX-9006" },
  { id: "OI-10", orderId: "ORD-70017", testId: "TC-002", testName: "Liver Function Panel", status: "released", specimenId: "SPX-9007" },
  { id: "OI-11", orderId: "ORD-70019", testId: "TC-002", testName: "Liver Function Panel", status: "technical_review", specimenId: "SPX-9008" },
  { id: "OI-12", orderId: "ORD-70019", testId: "TC-003", testName: "Prothrombin Time / INR", status: "medical_review", specimenId: "SPX-9009" },
];
