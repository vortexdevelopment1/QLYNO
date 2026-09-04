export type IncidentCategory =
  | "Equipment Failure"
  | "Staffing Shortage"
  | "Security & Access Event"
  | "Patient Flow Blockage"
  | "Facility & Utilities"
  | "IT / Network Downtime";

export type IncidentSeverity = "P1 - Critical" | "P2 - High" | "P3 - Medium" | "P4 - Low";

export type IncidentStatus = "Open" | "Investigating" | "Mitigating" | "Resolved" | "Closed";

export interface OperationalIncident {
  id: string;
  code: string;
  title: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  department: string;
  location: string;
  reporter: string;
  assignedOwner: string;
  createdAt: string;
  slaDeadline: string;
  isBreached: boolean;
  description: string;
  impact: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  auditTrail: Array<{
    timestamp: string;
    actor: string;
    action: string;
    note?: string;
  }>;
}

export interface HospitalHealthScoreComponent {
  id: string;
  category: string;
  score: number; // 0 to 100
  weight: number; // e.g. 0.25
  status: "Optimal" | "Good" | "Moderate Concern" | "Critical";
  keyMetric: string;
  details: string;
}

export interface HospitalHealthScore {
  overallScore: number; // 0 to 100
  grade: "A+" | "A" | "B" | "C" | "D";
  status: "Operational Excellence" | "Stable" | "Attention Required" | "Critical";
  lastCalculatedAt: string;
  components: HospitalHealthScoreComponent[];
}

export interface StaffCoverageCell {
  department: string;
  shift: "Morning (07:00-15:00)" | "Evening (15:00-23:00)" | "Night (23:00-07:00)";
  requiredStaff: number;
  assignedStaff: number;
  criticalSkillCovered: boolean;
  status: "Optimal" | "Minor Deficit" | "Critical Shortage";
  deficit: number;
}

export interface EmergencyPreArrivalPacket {
  caseId: string;
  patientQlynoId: string;
  patientName: string;
  age: number;
  gender: string;
  bloodGroup: string;
  allergies: string[];
  chiefComplaint: string;
  etaMinutes: number;
  vitals: {
    heartRate: number;
    bp: string;
    spo2: number;
    gcs: number;
  };
  treatingCardiologist?: string;
  activeCareCaseId?: string;
  consentVerified: boolean;
  receivingTraumaBay: string;
  preparedBy: string;
}

export interface EmergencyCapacitySignal {
  facilityId: string;
  facilityName: string;
  lastPublishedAt: string;
  isPublishedToNetwork: boolean;
  erBedAvailability: number;
  erBedTotal: number;
  traumaBayStatus: "Fully Available" | "Limited Capacity" | "Diversion Recommended";
  icuBedsAvailable: number;
  otEmergencyReadiness: "Immediate (Ready)" | "15 min Prep" | "Engaged";
  ambulanceFleetActive: number;
  bloodSupplyStatus: "Adequate" | "Moderate" | "Critical Shortage";
}
