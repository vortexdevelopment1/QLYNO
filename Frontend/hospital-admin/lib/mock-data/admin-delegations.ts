import {
  AdminDelegationGrant,
  DelegationActionLog,
  ModuleBoundaryDefinition,
} from "@/hospital-admin/lib/types";

// ==========================================
// 1. ACTIVE & HISTORICAL ADMIN DELEGATIONS
// ==========================================
export const mockAdminDelegationGrants: AdminDelegationGrant[] = [
  {
    id: "del_01",
    grantToken: "DEL-2026-091",
    grantorName: "Akash Sharma",
    grantorRole: "Hospital Administrator",
    delegateeId: "USR-MGR-01",
    delegateeName: "Rajesh Kulkarni",
    delegateeRole: "Assistant Operations Manager",
    targetRole: "Reception & Billing Supervisor",
    capabilityScopes: ["Reception & OPD Routing", "Billing & Financial Refunds"],
    reason: "Weekend duty coverage for front office peak OPD volume and authorized dispute refunds up to ₹25,000.",
    grantedAt: "2026-08-24T06:00:00Z",
    expiresAt: "2026-08-24T22:00:00Z",
    durationHours: 16,
    status: "Active",
    actionsCount: 14,
  },
  {
    id: "del_02",
    grantToken: "DEL-2026-092",
    grantorName: "Akash Sharma",
    grantorRole: "Hospital Administrator",
    delegateeId: "USR-NUR-SUP",
    delegateeName: "Sister Mary Kuruvilla",
    delegateeRole: "Nursing Superintendent",
    targetRole: "Central Ward Operations Head",
    capabilityScopes: ["Nurse Station & Shift Rostering", "OT Scheduling & Theatre Logistics"],
    reason: "Emergency shift balancing across ICU and OT recovery units due to seasonal dengue surge.",
    grantedAt: "2026-08-24T08:00:00Z",
    expiresAt: "2026-08-25T08:00:00Z",
    durationHours: 24,
    status: "Active",
    actionsCount: 8,
  },
  {
    id: "del_03",
    grantToken: "DEL-2026-088",
    grantorName: "Akash Sharma",
    grantorRole: "Hospital Administrator",
    delegateeId: "USR-PHARM-MGR",
    delegateeName: "Dr. Sandeep Deshpande",
    delegateeRole: "Pharmacy Procurement Lead",
    targetRole: "Central Supply Administrator",
    capabilityScopes: ["Pharmacy Inventory & Batches", "Vendor Procurement Requests"],
    reason: "Authorized urgent emergency PO approvals for high-titer IV Immunoglobulins and Rabies antiserum.",
    grantedAt: "2026-08-22T09:00:00Z",
    expiresAt: "2026-08-23T09:00:00Z",
    durationHours: 24,
    status: "Expired",
    actionsCount: 22,
  },
  {
    id: "del_04",
    grantToken: "DEL-2026-079",
    grantorName: "Akash Sharma",
    grantorRole: "Hospital Administrator",
    delegateeId: "USR-OPS-TRN",
    delegateeName: "Nitin Gadve",
    delegateeRole: "Operations Intern",
    targetRole: "OPD Queue Coordinator",
    capabilityScopes: ["Reception & OPD Routing"],
    reason: "Temporary trial token for OPD queue rebalancing during software onboarding.",
    grantedAt: "2026-08-20T10:00:00Z",
    expiresAt: "2026-08-20T18:00:00Z",
    durationHours: 8,
    status: "Revoked",
    revokedAt: "2026-08-20T14:30:00Z",
    actionsCount: 3,
  },
];

// ==========================================
// 2. DOUBLE-ATTRIBUTION DELEGATION ACTION LOGS
// ==========================================
export const mockDelegationActionLogs: DelegationActionLog[] = [
  {
    id: "dlog_01",
    timestamp: "2026-08-24T11:15:00Z",
    actorName: "Rajesh Kulkarni",
    actorRole: "Assistant Operations Manager",
    delegatedBy: "Akash Sharma (Hospital Admin)",
    actionDescription: "Re-routed 18 overflow OPD queue tokens from Dr. Rao to Dr. Mansoor",
    module: "Reception & OPD Routing",
    entity: "OPD Live Queue",
    entityId: "QUEUE-CAR-04",
    attributionString: "Performed by Rajesh Kulkarni • delegated by Hospital Admin",
    reason: "Severe cardiology queue congestion due to emergency STEMI call-in.",
  },
  {
    id: "dlog_02",
    timestamp: "2026-08-24T10:45:00Z",
    actorName: "Sister Mary Kuruvilla",
    actorRole: "Nursing Superintendent",
    delegatedBy: "Akash Sharma (Hospital Admin)",
    actionDescription: "Allocated 4 reserve critical care nurses to Night Shift MICU Station B",
    module: "Nurse Station & Shift Rostering",
    entity: "Staff Roster",
    entityId: "ROST-2026-W34",
    attributionString: "Performed by Sister Mary Kuruvilla • delegated by Hospital Admin",
    reason: "ICU patient census exceeded 95% capacity.",
  },
  {
    id: "dlog_03",
    timestamp: "2026-08-24T09:30:00Z",
    actorName: "Akash Sharma",
    actorRole: "Hospital Administrator",
    actionDescription: "Approved ₹12,500 advance deposit refund for canceled elective laparoscopy",
    module: "Billing & Financial Refunds",
    entity: "Patient Advance Ledger",
    entityId: "ADV-00981",
    attributionString: "Performed by Hospital Admin • acting within Billing workflow",
    reason: "Patient opted for medical management under primary physician recommendation.",
  },
  {
    id: "dlog_04",
    timestamp: "2026-08-24T08:15:00Z",
    actorName: "Akash Sharma",
    actorRole: "Hospital Administrator",
    actionDescription: "Re-scheduled OT Suite 3 for Emergency Ruptured Ectopic Surgery",
    module: "OT Scheduling & Logistics",
    entity: "OT Slot Booking",
    entityId: "OT-SLOT-03",
    attributionString: "Performed by Hospital Admin • acting within OT Coordination workflow",
    reason: "Emergency surgical slot bumping per Chief Medical Officer directive.",
  },
  {
    id: "dlog_05",
    timestamp: "2026-08-23T16:20:00Z",
    actorName: "Dr. Sandeep Deshpande",
    actorRole: "Pharmacy Procurement Lead",
    delegatedBy: "Akash Sharma (Hospital Admin)",
    actionDescription: "Created Emergency Purchase Order for 50 Vials Rabies Antiserum",
    module: "Vendor Procurement Requests",
    entity: "Purchase Order",
    entityId: "PO-2026-1044",
    attributionString: "Performed by Dr. Sandeep Deshpande • delegated by Hospital Admin",
    reason: "Central cold-storage stock reached critical red minimum threshold.",
  },
];

// ==========================================
// 3. 10-MODULE BOUNDARY DEFINITIONS (CAN vs CANNOT)
// ==========================================
export const mockModuleBoundaries: ModuleBoundaryDefinition[] = [
  {
    module: "Reception & Front Office",
    iconName: "UserCheck",
    adminCanScope: [
      "Perform patient registration and MRN generation",
      "Book, reschedule, or cancel OPD appointments",
      "Check-in patients and issue physical/digital queue tokens",
      "Re-route patient queues across available specialty rooms",
    ],
    adminCannotBoundary: [
      "None (Front-office operations contain zero licensed clinical decision gates)",
    ],
    riskLevel: "Standard Operational",
  },
  {
    module: "Nurse Station & Ward Ops",
    iconName: "Stethoscope",
    adminCanScope: [
      "Manage nurse staffing rosters, shift swaps, and on-call coverage",
      "Allocate support staff, ward boys, and housekeeping units",
      "Oversee shift handover checklists and administrative bed allocations",
    ],
    adminCannotBoundary: [
      "Cannot alter clinical nursing care plans, medication administration logs, or clinical vital notes",
    ],
    riskLevel: "Standard Operational",
  },
  {
    module: "Doctor Operations & Schedules",
    iconName: "HeartPulse",
    adminCanScope: [
      "Manage doctor master profiles, department affiliations, and room assignments",
      "Configure OPD consulting hours, leave calendars, and slot caps",
      "Assign administrative and committee operational duties",
    ],
    adminCannotBoundary: [
      "Cannot make, modify, or alter clinical diagnoses or patient treatment plans on behalf of a doctor",
    ],
    riskLevel: "Restricted Clinical Boundary",
  },
  {
    module: "Billing, TPA & Accounts",
    iconName: "CreditCard",
    adminCanScope: [
      "Generate, adjust, and reconcile IPD/OPD/Pharmacy invoices",
      "Process permitted fee discounts, advance settlements, and refunds",
      "Manage tariff master schedules, package pricing, and TPA pre-auth settings",
    ],
    adminCannotBoundary: [
      "Must adhere to step-up authentication on high-value refunds and sensitive waiver limits",
    ],
    riskLevel: "High Financial Risk",
  },
  {
    module: "Lab & Radiology Diagnostics",
    iconName: "Activity",
    adminCanScope: [
      "Track diagnostic test orders, specimen barcodes, and modality worklists",
      "Manage analyzer maintenance downtime, test turnaround alerts, and batch exports",
    ],
    adminCannotBoundary: [
      "Clinical interpretation of imaging scans (CT/MRI/X-Ray) and pathology slides remains exclusively with licensed radiologists and pathologists",
    ],
    riskLevel: "Restricted Clinical Boundary",
  },
  {
    module: "Pharmacy & Formulary",
    iconName: "Pill",
    adminCanScope: [
      "Manage central pharmacy inventory stock levels and re-order thresholds",
      "Track batch expiry alerts, purchase orders, and item tariff masters",
    ],
    adminCannotBoundary: [
      "Medication dispensing authorizations, dosage verification, and Schedule H1 sign-offs remain strictly with licensed pharmacists",
    ],
    riskLevel: "Restricted Clinical Boundary",
  },
  {
    module: "Operation Theatres (OT)",
    iconName: "Scissors",
    adminCanScope: [
      "Schedule OT theatre slots, clean-up turnarounds, and anaesthesia assistant rosters",
      "Coordinate OT equipment logistics, sterile instrument trays, and recovery beds",
    ],
    adminCannotBoundary: [
      "Intra-operative surgical decisions, anaesthetic fitness approvals, and procedure conversions remain with the lead surgeon/anaesthetist",
    ],
    riskLevel: "Restricted Clinical Boundary",
  },
  {
    module: "Emergency & Trauma Triage",
    iconName: "Flame",
    adminCanScope: [
      "Coordinate emergency bay bed routing, trauma team call-outs, and ambulance dispatch",
      "Acknowledge critical lab panic alerts and initiate inter-facility transport logistics",
    ],
    adminCannotBoundary: [
      "Clinical triage tier assignment (ESI Level 1–5 / Red-Yellow-Green) remains with the emergency clinical triage doctor/nurse",
    ],
    riskLevel: "Restricted Clinical Boundary",
  },
  {
    module: "Vendor & Procurement",
    iconName: "Truck",
    adminCanScope: [
      "Create, review, and approve purchase requisitions and supplier contracts",
      "Manage vendor compliance credentials, delivery GRNs, and invoice payments",
    ],
    adminCannotBoundary: [
      "Subject to financial threshold approval matrix (Procurement requests over ₹5 Lakhs require two-tier administrative sign-off)",
    ],
    riskLevel: "High Financial Risk",
  },
  {
    module: "Hospital-Wide Reports",
    iconName: "BarChart3",
    adminCanScope: [
      "Generate operational bed occupancy census, OPD footfall, and revenue summaries",
      "Track staff attendance, asset utilization, and patient turnaround metrics",
    ],
    adminCannotBoundary: [
      "Sensitive clinical patient history and identifiable diagnostic data remain subject to data minimization gates (Rule 14-CAN-26)",
    ],
    riskLevel: "Standard Operational",
  },
];
