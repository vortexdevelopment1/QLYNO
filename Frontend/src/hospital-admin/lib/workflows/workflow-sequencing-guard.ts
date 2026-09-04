export interface WorkflowStep {
  stepNumber: number;
  title: string;
  module: string;
  moduleRoute: string;
  description: string;
  responsibleRole: string;
  status: "completed" | "in-progress" | "pending" | "blocked";
  completedAt?: string;
  completedBy?: string;
  linkedEntityId?: string;
  sequencingRules: string[];
}

export interface CoreWorkflowEpisode {
  id: string;
  workflowType: "19.1-patient-treatment" | "19.2-emergency-sos" | "19.3-surgery-vendor";
  title: string;
  patientId: string;
  patientName: string;
  qlynoPatientId: string;
  caseId: string;
  currentStep: number;
  totalSteps: number;
  status: "Active" | "Completed" | "Blocked" | "SLA Escalated";
  startedAt: string;
  lastUpdated: string;
  steps: WorkflowStep[];
  blockerReason?: string;
}

// 19.1: Patient -> Hospital -> Treatment (10 Steps)
export const mockPatientTreatmentWorkflow: CoreWorkflowEpisode = {
  id: "wf-19-1-001",
  workflowType: "19.1-patient-treatment",
  title: "Longitudinal Episode: Total Knee Replacement & Post-Op Recovery",
  patientId: "pat_001",
  patientName: "Aarav Shah",
  qlynoPatientId: "QLY-PAT-2024-00841",
  caseId: "CASE-EP-8821",
  currentStep: 6,
  totalSteps: 10,
  status: "Active",
  startedAt: "2026-08-20T08:30:00Z",
  lastUpdated: "2026-08-25T11:15:00Z",
  steps: [
    {
      stepNumber: 1,
      title: "Patient Discovery",
      module: "External / Qlyno Network",
      moduleRoute: "/dashboard",
      description: "Patient discovers hospital orthopedic center and books appointment online via Qlyno app.",
      responsibleRole: "Patient / Online Platform",
      status: "completed",
      completedAt: "2026-08-20T08:30:00Z",
      completedBy: "Online Gateway",
      sequencingRules: ["Initial external trigger"],
    },
    {
      stepNumber: 2,
      title: "Arrival & Queue Intake",
      module: "Appointments (Mod 1)",
      moduleRoute: "/appointments/opd-queue",
      description: "Patient arrives at hospital reception counter for scheduled morning orthopedic consultation.",
      responsibleRole: "Receptionist / Counter 1",
      status: "completed",
      completedAt: "2026-08-20T09:15:00Z",
      completedBy: "Priya Deshmukh (Receptionist)",
      linkedEntityId: "APT-8801",
      sequencingRules: ["Appointment check-in initiated"],
    },
    {
      stepNumber: 3,
      title: "Identity Verification & Qlyno ID Search",
      module: "Patient Registry (Mod 7)",
      moduleRoute: "/patients",
      description: "Admin searches Qlyno master registry by phone/UHID to verify existing patient identity and prevent duplicate creation.",
      responsibleRole: "Admin / Receptionist",
      status: "completed",
      completedAt: "2026-08-20T09:18:00Z",
      completedBy: "Priya Deshmukh (Receptionist)",
      linkedEntityId: "QLY-PAT-2024-00841",
      sequencingRules: ["MANDATORY: Must search Qlyno ID before creating any new identity record."],
    },
    {
      stepNumber: 4,
      title: "Reception Check-In & Token Issuance",
      module: "Reception Management (Mod 6)",
      moduleRoute: "/appointments",
      description: "Completed registration, insurance policy verification, and issued OPD queue token #OPD-24.",
      responsibleRole: "Receptionist",
      status: "completed",
      completedAt: "2026-08-20T09:22:00Z",
      completedBy: "Priya Deshmukh (Receptionist)",
      linkedEntityId: "TKN-OPD-24",
      sequencingRules: ["MANDATORY: Must complete check-in before entering clinical treatment workflows."],
    },
    {
      stepNumber: 5,
      title: "Clinical Consultation & Care Intake",
      module: "OPD Management (Mod 2) & Patient (Mod 7)",
      moduleRoute: "/patients/pat_001",
      description: "Senior Orthopedic Consultant examines patient, reviews imaging, and initiates inpatient admission order.",
      responsibleRole: "Dr. Arvind Swaminathan (Consultant)",
      status: "completed",
      completedAt: "2026-08-20T10:00:00Z",
      completedBy: "Dr. Arvind Swaminathan",
      linkedEntityId: "ENC-2026-9901",
      sequencingRules: ["Clinical notes and orders created with verified doctor signature."],
    },
    {
      stepNumber: 6,
      title: "Multi-Disciplinary Team Execution",
      module: "Nurses (Mod 5) & Diagnostics/Pharmacy (Mod 12)",
      moduleRoute: "/lab",
      description: "Diagnostic pre-op blood work, ECG, Chest X-ray, and pre-anesthetic medications dispensed.",
      responsibleRole: "Nursing Staff & Lab Tech",
      status: "in-progress",
      linkedEntityId: "LAB-88213",
      sequencingRules: ["Role-specific orders executed in parallel by lab and pharmacy."],
    },
    {
      stepNumber: 7,
      title: "Automated Clinical Task Generation",
      module: "Notification & Tasks (Mod 16)",
      moduleRoute: "/notifications",
      description: "Qlyno auto-generates pre-op nursing checklist tasks, surgical pack requisition, and diet indents.",
      responsibleRole: "System Task Engine",
      status: "pending",
      sequencingRules: ["Automated task orchestration from clinical event triggers."],
    },
    {
      stepNumber: 8,
      title: "Admission, Bed Allocation, Surgery & Billing",
      module: "Wards/Beds (Mod 7), OT (Mod 10), Billing (Mod 12)",
      moduleRoute: "/wards-beds",
      description: "Inpatient bed allocation (GW-101), OT slot booking, surgical execution, and running billing ledger accumulation.",
      responsibleRole: "Ward Lead, OT Team & Billing Staff",
      status: "pending",
      sequencingRules: ["Admission, bed occupancy, and billing continue until surgical recovery concludes."],
    },
    {
      stepNumber: 9,
      title: "Clinical Discharge & Financial Settlement",
      module: "Discharge & Billing (Mod 7, 12)",
      moduleRoute: "/billing",
      description: "Physician generates discharge summary, pharmacy dispenses discharge drugs, and billing counter clears outstanding dues.",
      responsibleRole: "Attending Consultant & Cashier",
      status: "pending",
      sequencingRules: ["MANDATORY: Cannot discharge while billing has unsettled balance or pending clinical sign-off."],
    },
    {
      stepNumber: 10,
      title: "Post-Discharge Follow-Up Care",
      module: "Care Coordination (Mod 7) & Follow-ups",
      moduleRoute: "/follow-ups",
      description: "Post-op suture removal scheduled at Day 14, physiotherapy telerehab tracking, and automated reminder alerts.",
      responsibleRole: "Care Coordinator",
      status: "pending",
      sequencingRules: ["Continuous longitudinal care timeline preserved in Qlyno."],
    },
  ],
};

// 19.2: Emergency SOS -> Existing Treating Hospital (10 Steps)
export const mockEmergencySosWorkflow: CoreWorkflowEpisode = {
  id: "wf-19-2-002",
  workflowType: "19.2-emergency-sos",
  title: "Trauma Code Red: Acute STEMI & Ambulance Telemetry Response",
  patientId: "pat_002",
  patientName: "Meera Nambiar",
  qlynoPatientId: "QLY-PAT-2023-00412",
  caseId: "EM-2026-901",
  currentStep: 5,
  totalSteps: 10,
  status: "Active",
  startedAt: "2026-08-25T11:00:00Z",
  lastUpdated: "2026-08-25T11:18:00Z",
  steps: [
    {
      stepNumber: 1,
      title: "SOS Panic Button Triggered",
      module: "Patient App / Mobile SOS",
      moduleRoute: "/emergency",
      description: "Patient triggered emergency SOS button on Qlyno Mobile App with GPS coordinates.",
      responsibleRole: "Patient / Geofence",
      status: "completed",
      completedAt: "2026-08-25T11:00:10Z",
      completedBy: "GPS Gateway (Lokhandwala)",
      sequencingRules: ["Immediate high-priority packet broadcast"],
    },
    {
      stepNumber: 2,
      title: "Active Treating Hospital Resolution",
      module: "Routing Engine (Mod 8)",
      moduleRoute: "/emergency",
      description: "Qlyno identifies active treating cardiology relationship at Qlyno Main Hospital.",
      responsibleRole: "System Router",
      status: "completed",
      completedAt: "2026-08-25T11:00:15Z",
      completedBy: "Relationship Engine",
      sequencingRules: ["Flow A (Existing Relationship) prioritized over generic routing"],
    },
    {
      stepNumber: 3,
      title: "Hospital SOS Siren Alert Ingestion",
      module: "Emergency Control Board (Mod 8)",
      moduleRoute: "/emergency",
      description: "Emergency ER command board sounds Code Red audio alarm and flashes emergency banner.",
      responsibleRole: "ER Ingestion Service",
      status: "completed",
      completedAt: "2026-08-25T11:00:20Z",
      completedBy: "ER Desk Telemetry",
      linkedEntityId: "EM-2026-901",
      sequencingRules: ["SLA timer (120s) starts immediately upon ingestion"],
    },
    {
      stepNumber: 4,
      title: "Emergency Team Acknowledgment",
      module: "Emergency ER (Mod 8)",
      moduleRoute: "/emergency",
      description: "Attending Emergency Physician acknowledges alert within 32 seconds (SLA target < 120s).",
      responsibleRole: "Dr. Farhan Sheikh (ER Head)",
      status: "completed",
      completedAt: "2026-08-25T11:00:52Z",
      completedBy: "Dr. Farhan Sheikh",
      linkedEntityId: "EM-2026-901",
      sequencingRules: ["MANDATORY: Acknowledgment required before dispatching resources"],
    },
    {
      stepNumber: 5,
      title: "Trauma Resuscitation Bay Preparation",
      module: "Emergency Bay Management (Mod 8)",
      moduleRoute: "/emergency",
      description: "Resuscitation Bay 1 reserved, defibrillator calibrated, and on-call Cath Lab team alerted.",
      responsibleRole: "Trauma Nurse Lead",
      status: "in-progress",
      linkedEntityId: "BAY-RESUS-01",
      sequencingRules: ["Pre-arrival preparations run in parallel with vehicle dispatch"],
    },
    {
      stepNumber: 6,
      title: "ALS Ambulance Dispatch",
      module: "Ambulance Fleet (Mod 9)",
      moduleRoute: "/ambulance",
      description: "Advanced Life Support Ambulance #AMB-04 dispatched with paramedic team and ventilator.",
      responsibleRole: "Ambulance Dispatcher",
      status: "pending",
      linkedEntityId: "AMB-04",
      sequencingRules: ["MANDATORY: Ambulance dispatch requires alert acknowledgment"],
    },
    {
      stepNumber: 7,
      title: "Patient & Family Telemetry Updates",
      module: "Live Notification Stream",
      moduleRoute: "/ambulance/live-tracking",
      description: "Live GPS tracking link and paramedic contact number streamed to patient & emergency contacts.",
      responsibleRole: "Telemetry Dispatch",
      status: "pending",
      sequencingRules: ["Real-time status updates broadcast at each milestone"],
    },
    {
      stepNumber: 8,
      title: "SLA Fallback & Escalation Monitor",
      module: "Escalation Center (Mod 16)",
      moduleRoute: "/notifications",
      description: "Continuous SLA tracking with automated secondary hospital failover if pre-arrival TAT breaches.",
      responsibleRole: "Escalation Watchdog",
      status: "pending",
      sequencingRules: ["Fallback triggered if acknowledgement or dispatch SLA breaches"],
    },
    {
      stepNumber: 9,
      title: "Patient Care Case Cross-Linkage",
      module: "Patient Care Case (Mod 7)",
      moduleRoute: "/patients/pat_002",
      description: "Emergency incident record bound 1-to-1 to patient's longitudinal master care record.",
      responsibleRole: "EMR Case Binder",
      status: "pending",
      sequencingRules: ["MANDATORY: Emergency event must link to patient record before closure"],
    },
    {
      stepNumber: 10,
      title: "Handoff, Resolution & Audit Archival",
      module: "Security & Audits (Mod 14)",
      moduleRoute: "/audit-logs",
      description: "Patient handed off to Cath Lab, emergency incident resolved, and immutable audit record locked.",
      responsibleRole: "ER Administrator",
      status: "pending",
      sequencingRules: ["MANDATORY: Event cannot close until clinical handoff is fully documented"],
    },
  ],
};

// 19.3: Surgery -> Surgeon + Vendor (9 Steps)
export const mockSurgeryVendorWorkflow: CoreWorkflowEpisode = {
  id: "wf-19-3-003",
  workflowType: "19.3-surgery-vendor",
  title: "Surgical Case Dependency: Total Knee Replacement & Vendor RFQ",
  patientId: "pat_001",
  patientName: "Arjun Gupta",
  qlynoPatientId: "QLY-PAT-2024-00841",
  caseId: "CASE-409",
  currentStep: 6,
  totalSteps: 9,
  status: "Blocked",
  startedAt: "2026-08-22T09:00:00Z",
  lastUpdated: "2026-08-25T11:20:00Z",
  blockerReason: "Waiting for Orthotech Titanium Knee Implant delivery (PO-2026-8801)",
  steps: [
    {
      stepNumber: 1,
      title: "Surgical Indication & Determination",
      module: "Clinical Assessment",
      moduleRoute: "/doctors",
      description: "Consultant determines Grade IV Osteoarthritis requires Total Knee Arthroplasty.",
      responsibleRole: "Dr. Ramesh Sharma (Orthopedic Surgeon)",
      status: "completed",
      completedAt: "2026-08-22T09:00:00Z",
      completedBy: "Dr. Ramesh Sharma",
      sequencingRules: ["Initial clinical diagnosis requiring surgery"],
    },
    {
      stepNumber: 2,
      title: "Surgical Case Creation",
      module: "OT & Surgeries (Mod 10)",
      moduleRoute: "/surgical-cases/create",
      description: "Admin creates surgical case dossier #CASE-409 with procedure details and preferred OT slot.",
      responsibleRole: "Hospital Admin",
      status: "completed",
      completedAt: "2026-08-22T09:15:00Z",
      completedBy: "Hospital Admin",
      linkedEntityId: "CASE-409",
      sequencingRules: ["Formal surgical case dossier registered in system"],
    },
    {
      stepNumber: 3,
      title: "Readiness Dependencies Check",
      module: "OT Readiness Engine (Mod 10)",
      moduleRoute: "/surgical-cases",
      description: "System evaluates checklist: Blood cross-match (Ready), PAC Clearance (Ready), Implant (MISSING).",
      responsibleRole: "System Readiness Engine",
      status: "completed",
      completedAt: "2026-08-22T09:20:00Z",
      completedBy: "Dependency Engine",
      linkedEntityId: "CASE-409",
      sequencingRules: ["MANDATORY: Must evaluate readiness checklist before summoning external resources"],
    },
    {
      stepNumber: 4,
      title: "Surgeon Request & Summon",
      module: "Surgeon Desk (Mod 10)",
      moduleRoute: "/surgical-cases/surgeon-requests",
      description: "Lead orthopedic surgeon summoned and accepted case request within 12 minutes.",
      responsibleRole: "Dr. Ramesh Sharma",
      status: "completed",
      completedAt: "2026-08-22T09:32:00Z",
      completedBy: "Dr. Ramesh Sharma",
      linkedEntityId: "REQ-SURG-01",
      sequencingRules: ["Surgeon availability locked for scheduled window"],
    },
    {
      stepNumber: 5,
      title: "Vendor Procurement Requisition (RFQ)",
      module: "Vendor & Procurement (Mod 11)",
      moduleRoute: "/procurement/create",
      description: "Created procurement requisition PR-001 for Titanium Knee Implant Set linked to Case #CASE-409.",
      responsibleRole: "Procurement Officer",
      status: "completed",
      completedAt: "2026-08-22T10:00:00Z",
      completedBy: "Procurement Officer",
      linkedEntityId: "PR-001",
      sequencingRules: ["Requisition must explicitly reference target surgical case ID"],
    },
    {
      stepNumber: 6,
      title: "Surgeon & Vendor Response Tracking",
      module: "Procurement Deliveries (Mod 11)",
      moduleRoute: "/procurement/deliveries",
      description: "Vendor (Orthotech Implants) confirmed delivery dispatch; PO-2026-8801 in-transit (ETA: 14:00).",
      responsibleRole: "Vendor / Logistics",
      status: "in-progress",
      linkedEntityId: "PO-2026-8801",
      sequencingRules: ["Continuous delivery ETA tracking against scheduled OT window"],
    },
    {
      stepNumber: 7,
      title: "Case Readiness Verification (100% Target)",
      module: "OT Readiness Dashboard (Mod 10)",
      moduleRoute: "/surgical-cases",
      description: "Readiness score evaluated at 75% (Blocked). Once implant arrives, readiness unlocks to 100%.",
      responsibleRole: "OT Coordinator",
      status: "blocked",
      linkedEntityId: "CASE-409",
      sequencingRules: ["Case readiness must reach 100% before OT slot can be locked"],
    },
    {
      stepNumber: 8,
      title: "OT Room Scheduling & Lock",
      module: "OT Scheduling (Mod 10)",
      moduleRoute: "/ot-scheduling",
      description: "Main OR 1 booked from 14:30 - 17:00 with surgical pack and anesthesia team locked.",
      responsibleRole: "OT Floor Manager",
      status: "pending",
      linkedEntityId: "OT-201",
      sequencingRules: ["MANDATORY: Scheduling is strictly BLOCKED until Step 7 readiness is 100%"],
    },
    {
      stepNumber: 9,
      title: "Post-Op PACU, Nursing & Discharge Handover",
      module: "Nursing (Mod 5) & Pharmacy (Mod 12)",
      moduleRoute: "/post-op",
      description: "Post-anesthesia recovery scoring, pain management pump setup, and follow-up rehab task creation.",
      responsibleRole: "PACU Nurse & Floor Lead",
      status: "pending",
      sequencingRules: ["Post-op care pathway automatically generated upon OT completion"],
    },
  ],
};

// Sequencing Rule Validators enforcing Section 19 rules
export function validatePatientDischarge(outstandingBalance: number, clinicalSignoff: boolean): { canDischarge: boolean; errorReason?: string } {
  if (!clinicalSignoff) {
    return { canDischarge: false, errorReason: "Sequencing Violation (19.1 Rule 3): Clinical discharge summary must be signed off by attending physician before discharge." };
  }
  if (outstandingBalance > 0) {
    return { canDischarge: false, errorReason: `Sequencing Violation (19.1 Rule 3): Billing ledger has unsettled balance (₹${outstandingBalance.toLocaleString("en-IN")}). Final financial clearance required.` };
  }
  return { canDischarge: true };
}

export function validateAmbulanceDispatch(alertAcknowledged: boolean, isEmergencyOverride: boolean): { canDispatch: boolean; errorReason?: string } {
  if (!alertAcknowledged && !isEmergencyOverride) {
    return { canDispatch: false, errorReason: "Sequencing Violation (19.2 Rule 1): Cannot dispatch ambulance before emergency alert is formally acknowledged by hospital ER team." };
  }
  return { canDispatch: true };
}

export function validateOtScheduling(readinessPercent: number): { canSchedule: boolean; errorReason?: string } {
  if (readinessPercent < 100) {
    return { canSchedule: false, errorReason: `Sequencing Violation (19.3 Rule 1): OT Scheduling is BLOCKED. Readiness is currently ${readinessPercent}%. All required dependencies (surgeon, implants, blood, consent) must be 100% complete.` };
  }
  return { canSchedule: true };
}
