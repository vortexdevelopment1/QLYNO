export type StaffLifecycleStatus =
  | "Invited"
  | "Pending"
  | "Active"
  | "On Leave"
  | "Suspended"
  | "Removed"
  | "Archived";

export type NurseAvailabilityStatus =
  | "Available"
  | "On Duty"
  | "Break"
  | "Off Duty"
  | "Leave"
  | "Absent"
  | "Temporarily Reassigned";

export type SupportStaffCategory =
  | "Ward / Patient-care Attendant"
  | "Housekeeping / Cleaning Staff"
  | "Nursing Assistant"
  | "Other Support Staff";

export type TaskPriority = "High" | "Medium" | "Routine";

export type TaskStatus = "Pending" | "In Progress" | "Completed" | "Unable / Blocked";

export type NursingRole = "Nurse Station Lead" | "Senior Nurse" | "Nurse";

export type AppUserRole =
  | "admin"
  | "nurse_lead"
  | "senior_nurse"
  | "nurse"
  | "support_staff"
  | "doctor";

export interface NurseStationEntity {
  station_id: string;
  name: string;
  organization_id: string;
  location_id: string;
  location_name: string;
  department_id: string;
  department_name: string;
  lead_id: string;
  lead_name: string;
  status: "Active" | "Inactive";
  totalBeds: number;
  occupiedBeds: number;
}

export interface NurseStaffEntity {
  staff_id: string;
  name: string;
  role: NursingRole;
  email: string;
  phone: string;
  employee_id: string;
  organization_id: string;
  station_id: string;
  station_name: string;
  department_id: string;
  department_name: string;
  status: StaffLifecycleStatus;
  availability: NurseAvailabilityStatus;
  qualifications: string[];
  councilRegistrationId: string;
  defaultShiftPattern: string;
  avatarUrl?: string;
  assignedPatientsCount: number;
  pendingTasksCount: number;
}

export interface SupportStaffEntity {
  staff_id: string;
  name: string;
  category: SupportStaffCategory;
  station_id: string;
  station_name: string;
  department_name: string;
  status: StaffLifecycleStatus;
  availability: NurseAvailabilityStatus;
  phone: string;
  email: string;
  assignedTasksCount: number;
}

export interface ShiftDefinition {
  shift_id: string;
  name: "Morning" | "Evening" | "Night" | "Custom";
  start_time: string;
  end_time: string;
  break_duration_mins: number;
  grace_period_mins: number;
  department_id: string;
  is_default?: boolean;
}

export interface RosterAssignment {
  roster_id: string;
  shift_id: string;
  shift_name: string;
  staff_id: string;
  staff_name: string;
  staff_role: string;
  staff_type: "Nurse" | "SupportStaff";
  station_id: string;
  date: string; // YYYY-MM-DD
  status: "Scheduled" | "Confirmed" | "Swapped" | "Cancelled";
  changeReason?: string;
  changedBy?: string;
}

export interface PatientCareAssignment {
  assignment_id: string;
  patient_id: string;
  patient_name: string;
  qlyno_patient_id: string;
  age: number;
  gender: string;
  ward: string;
  room: string;
  bed: string;
  station_id: string;
  nurse_id: string;
  nurse_name: string;
  shift_id: string;
  start_time: string;
  care_level: "Critical" | "Intermediate" | "General";
  diagnosis_preview?: string; // Restricted for non-clinical
  pending_tasks_count: number;
  vitals_status: "Normal" | "Attention" | "Critical" | "Pending";
  last_vitals_time?: string;
}

export interface NursingTaskEntity {
  task_id: string;
  patient_id?: string;
  patient_name?: string;
  bed_info?: string;
  owner_id: string;
  owner_name: string;
  owner_role: "Nurse" | "SupportStaff";
  station_id: string;
  title: string;
  description: string;
  task_type:
    | "Medication"
    | "Vitals Check"
    | "Wound Dressing"
    | "Doctor Order"
    | "Bed Sanitation"
    | "Patient Escort"
    | "General Care";
  priority: TaskPriority;
  due_at: string;
  status: TaskStatus;
  created_at: string;
  completed_at?: string;
  blocked_reason?: string;
  is_overdue: boolean;
  escalated_to?: string;
  doctor_order_id?: string;
}

export interface ShiftHandoverEntity {
  handover_id: string;
  station_id: string;
  shift_id: string;
  shift_name: string;
  outgoing_nurse_id: string;
  outgoing_nurse_name: string;
  incoming_nurse_id: string;
  incoming_nurse_name: string;
  timestamp: string;
  patients_count: number;
  patient_summaries: Array<{
    patient_id: string;
    patient_name: string;
    bed: string;
    key_updates: string;
    pending_tasks: string[];
    critical_alerts?: string;
    medication_status: string;
    doctor_instructions: string;
  }>;
  structured_notes: string;
  status: "Draft" | "Pending Acknowledgement" | "Acknowledged" | "Exceptions Logged";
  acknowledged_at?: string;
  unresolved_items: string[];
}

export interface DoctorInstructionEntity {
  instruction_id: string;
  doctor_id: string;
  doctor_name: string;
  patient_id: string;
  patient_name: string;
  bed: string;
  station_id: string;
  assigned_nurse_id?: string;
  assigned_nurse_name?: string;
  instruction_text: string;
  urgency: "Stat / Urgent" | "Routine" | "Clarification Needed";
  created_at: string;
  status: "New / Pending" | "Acknowledged" | "In Progress" | "Completed" | "Clarification Requested";
  clarification_note?: string;
  updated_instruction?: string;
}

export interface StaffRequestEntity {
  request_id: string;
  staff_id: string;
  staff_name: string;
  staff_role: string;
  station_id: string;
  type: "Shift Change" | "Shift Swap" | "Leave Request" | "Availability Change";
  details: string;
  target_date?: string;
  target_shift?: string;
  swap_with_staff_name?: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  created_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

export type NotificationEvent =
  | "Nurse Invited"
  | "Shift Assigned"
  | "Shift Changed"
  | "Shift Swap Request"
  | "Patient Assigned"
  | "Task Assigned"
  | "Task Overdue"
  | "Doctor Instruction"
  | "Clinical Escalation"
  | "Handover Pending"
  | "Handover Completed"
  | "Announcement";

export interface StaffNotificationEntity {
  notification_id: string;
  recipient_id: string;
  recipient_name: string;
  station_id: string;
  event: NotificationEvent;
  title: string;
  message: string;
  created_at: string;
  read_at?: string;
  status: "Unread" | "Read";
  entity_id?: string;
}

export interface ClinicalEscalationEntity {
  escalation_id: string;
  patient_id: string;
  patient_name: string;
  station_id: string;
  raised_by_id: string;
  raised_by_name: string;
  responsible_doctor: string;
  reason: string;
  priority: "Urgent" | "Routine";
  status: "Open" | "Acknowledged" | "Resolved";
  created_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
}

export interface NursingAuditEvent {
  id: string;
  actor: string;
  role: string;
  action: string;
  entity: string;
  timestamp: string;
  reason: string;
  stationScope: string;
  before?: string;
  after?: string;
}

export interface NursingClinicalActivity {
  activity_id: string;
  patient_id: string;
  station_id: string;
  nurse_id: string;
  nurse_name: string;
  type: "Vitals" | "Medication Administration" | "Nursing Note";
  summary: string;
  recorded_at: string;
}
