import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  AppUserRole,
  NurseStationEntity,
  NurseStaffEntity,
  SupportStaffEntity,
  ShiftDefinition,
  RosterAssignment,
  PatientCareAssignment,
  NursingTaskEntity,
  ShiftHandoverEntity,
  DoctorInstructionEntity,
  StaffRequestEntity,
  StaffNotificationEntity,
  ClinicalEscalationEntity,
  NursingAuditEvent,
  StaffLifecycleStatus,
  NurseAvailabilityStatus,
  NursingClinicalActivity,
} from "@/hospital-admin/lib/types/nursing-module";

interface NursingOperationsState {
  currentRole: AppUserRole;
  currentUserId: string;
  currentUserName: string;
  activeStationId: string;
  stations: NurseStationEntity[];
  nurses: NurseStaffEntity[];
  supportStaff: SupportStaffEntity[];
  shiftTemplates: ShiftDefinition[];
  roster: RosterAssignment[];
  patientAssignments: PatientCareAssignment[];
  tasks: NursingTaskEntity[];
  handovers: ShiftHandoverEntity[];
  doctorInstructions: DoctorInstructionEntity[];
  staffRequests: StaffRequestEntity[];
  notifications: StaffNotificationEntity[];
  escalations: ClinicalEscalationEntity[];
  clinicalActivities: NursingClinicalActivity[];
  auditLogs: NursingAuditEvent[];
}

const timestamp = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
const audit = (state: NursingOperationsState, event: Omit<NursingAuditEvent, "id" | "timestamp">) => {
  state.auditLogs.unshift({ id: id("aud"), timestamp: timestamp(), ...event });
};
const notify = (state: NursingOperationsState, data: Omit<StaffNotificationEntity, "notification_id" | "created_at" | "status">) => {
  state.notifications.unshift({ notification_id: id("ntf"), created_at: timestamp(), status: "Unread", ...data });
};

const initialStations: NurseStationEntity[] = [
  {
    station_id: "st-1",
    name: "ICU & Critical Care Station",
    organization_id: "org-qlyno-1",
    location_id: "loc-main",
    location_name: "Main Campus - Block A, Floor 2",
    department_id: "dept-icu",
    department_name: "Intensive Care Unit",
    lead_id: "nurse-lead-1",
    lead_name: "Sister Anita Joseph, RN, BSN",
    status: "Active",
    totalBeds: 16,
    occupiedBeds: 14,
  },
  {
    station_id: "st-2",
    name: "General Medical Ward Station",
    organization_id: "org-qlyno-1",
    location_id: "loc-main",
    location_name: "Main Campus - Block B, Floor 3",
    department_id: "dept-med",
    department_name: "General Medicine",
    lead_id: "nurse-lead-2",
    lead_name: "Sister Priya Nair, RN",
    status: "Active",
    totalBeds: 24,
    occupiedBeds: 19,
  },
  {
    station_id: "st-3",
    name: "Emergency & Trauma Resuscitation Station",
    organization_id: "org-qlyno-1",
    location_id: "loc-er",
    location_name: "Ground Floor - Emergency & Trauma Block",
    department_id: "dept-er",
    department_name: "Emergency & Trauma",
    lead_id: "nurse-lead-3",
    lead_name: "Sister Anjali Desai, RN (Trauma Lead)",
    status: "Active",
    totalBeds: 12,
    occupiedBeds: 8,
  },
];

const initialNurses: NurseStaffEntity[] = [
  {
    staff_id: "nurse-1",
    name: "Sister Anita Joseph",
    role: "Nurse Station Lead",
    email: "anita.joseph@qlyno.health",
    phone: "+91 98201 11223",
    employee_id: "NUR-2022-041",
    organization_id: "org-qlyno-1",
    station_id: "st-1",
    station_name: "ICU & Critical Care Station",
    department_id: "dept-icu",
    department_name: "Intensive Care Unit",
    status: "Active",
    availability: "On Duty",
    qualifications: ["B.Sc Nursing", "Critical Care Certified (CCRN)", "BLS/ACLS"],
    councilRegistrationId: "MNC-RN-88192",
    defaultShiftPattern: "Morning (07:00-15:00)",
    assignedPatientsCount: 2,
    pendingTasksCount: 3,
  },
  {
    staff_id: "nurse-2",
    name: "Sister Sneha Kulkarni",
    role: "Senior Nurse",
    email: "sneha.kulkarni@qlyno.health",
    phone: "+91 98202 22334",
    employee_id: "NUR-2023-118",
    organization_id: "org-qlyno-1",
    station_id: "st-1",
    station_name: "ICU & Critical Care Station",
    department_id: "dept-icu",
    department_name: "Intensive Care Unit",
    status: "Active",
    availability: "On Duty",
    qualifications: ["G.N.M", "Cardiology Nursing Cert", "BLS"],
    councilRegistrationId: "MNC-RN-92014",
    defaultShiftPattern: "Morning (07:00-15:00)",
    assignedPatientsCount: 3,
    pendingTasksCount: 4,
  },
  {
    staff_id: "nurse-3",
    name: "Nurse Rahul Shinde",
    role: "Nurse",
    email: "rahul.shinde@qlyno.health",
    phone: "+91 98203 33445",
    employee_id: "NUR-2024-092",
    organization_id: "org-qlyno-1",
    station_id: "st-1",
    station_name: "ICU & Critical Care Station",
    department_id: "dept-icu",
    department_name: "Intensive Care Unit",
    status: "Active",
    availability: "On Duty",
    qualifications: ["B.Sc Nursing", "Infection Control"],
    councilRegistrationId: "MNC-RN-10492",
    defaultShiftPattern: "Morning (07:00-15:00)",
    assignedPatientsCount: 2,
    pendingTasksCount: 2,
  },
  {
    staff_id: "nurse-4",
    name: "Nurse Meera Varma",
    role: "Nurse",
    email: "meera.varma@qlyno.health",
    phone: "+91 98204 44556",
    employee_id: "NUR-2024-105",
    organization_id: "org-qlyno-1",
    station_id: "st-1",
    station_name: "ICU & Critical Care Station",
    department_id: "dept-icu",
    department_name: "Intensive Care Unit",
    status: "Active",
    availability: "Break",
    qualifications: ["B.Sc Nursing"],
    councilRegistrationId: "MNC-RN-11883",
    defaultShiftPattern: "Evening (15:00-23:00)",
    assignedPatientsCount: 2,
    pendingTasksCount: 1,
  },
  {
    staff_id: "nurse-5",
    name: "Nurse David Dsouza",
    role: "Nurse",
    email: "david.dsouza@qlyno.health",
    phone: "+91 98205 55667",
    employee_id: "NUR-2023-059",
    organization_id: "org-qlyno-1",
    station_id: "st-1",
    station_name: "ICU & Critical Care Station",
    department_id: "dept-icu",
    department_name: "Intensive Care Unit",
    status: "On Leave",
    availability: "Leave",
    qualifications: ["G.N.M"],
    councilRegistrationId: "MNC-RN-77291",
    defaultShiftPattern: "Night (23:00-07:00)",
    assignedPatientsCount: 0,
    pendingTasksCount: 0,
  },
  {
    staff_id: "nurse-6",
    name: "Sister Anjali Desai",
    role: "Nurse Station Lead",
    email: "anjali.desai@qlyno.health",
    phone: "+91 98206 66778",
    employee_id: "NUR-2021-012",
    organization_id: "org-qlyno-1",
    station_id: "st-3",
    station_name: "Emergency & Trauma Resuscitation Station",
    department_id: "dept-er",
    department_name: "Emergency & Trauma",
    status: "Active",
    availability: "On Duty",
    qualifications: ["B.Sc Nursing", "Trauma Nursing Certified (ATCN)", "ACLS/PALS Instructor"],
    councilRegistrationId: "MNC-RN-65432",
    defaultShiftPattern: "Morning (07:00-15:00)",
    assignedPatientsCount: 2,
    pendingTasksCount: 3,
  },
  {
    staff_id: "nurse-7",
    name: "Nurse Vikram Nair",
    role: "Senior Nurse",
    email: "vikram.nair@qlyno.health",
    phone: "+91 98207 77889",
    employee_id: "NUR-2022-088",
    organization_id: "org-qlyno-1",
    station_id: "st-3",
    station_name: "Emergency & Trauma Resuscitation Station",
    department_id: "dept-er",
    department_name: "Emergency & Trauma",
    status: "Active",
    availability: "On Duty",
    qualifications: ["B.Sc Nursing", "Manchester Triage Specialist", "Emergency Nursing (ENC)"],
    councilRegistrationId: "MNC-RN-78190",
    defaultShiftPattern: "Morning (07:00-15:00)",
    assignedPatientsCount: 2,
    pendingTasksCount: 2,
  },
  {
    staff_id: "nurse-8",
    name: "Nurse Pooja Sharma",
    role: "Nurse",
    email: "pooja.sharma@qlyno.health",
    phone: "+91 98208 88990",
    employee_id: "NUR-2024-142",
    organization_id: "org-qlyno-1",
    station_id: "st-3",
    station_name: "Emergency & Trauma Resuscitation Station",
    department_id: "dept-er",
    department_name: "Emergency & Trauma",
    status: "Active",
    availability: "On Duty",
    qualifications: ["G.N.M", "BLS/ACLS Certified"],
    councilRegistrationId: "MNC-RN-11204",
    defaultShiftPattern: "Morning (07:00-15:00)",
    assignedPatientsCount: 1,
    pendingTasksCount: 2,
  },
];

const initialSupportStaff: SupportStaffEntity[] = [
  {
    staff_id: "sup-1",
    name: "Ramesh Pawar",
    category: "Ward / Patient-care Attendant",
    station_id: "st-1",
    station_name: "ICU & Critical Care Station",
    department_name: "Intensive Care Unit",
    status: "Active",
    availability: "On Duty",
    phone: "+91 98111 00112",
    email: "ramesh.p@qlyno.health",
    assignedTasksCount: 2,
  },
  {
    staff_id: "sup-2",
    name: "Sunita Ghorpade",
    category: "Housekeeping / Cleaning Staff",
    station_id: "st-1",
    station_name: "ICU & Critical Care Station",
    department_name: "Intensive Care Unit",
    status: "Active",
    availability: "On Duty",
    phone: "+91 98111 00113",
    email: "sunita.g@qlyno.health",
    assignedTasksCount: 3,
  },
  {
    staff_id: "sup-3",
    name: "Karan Jadhav",
    category: "Nursing Assistant",
    station_id: "st-1",
    station_name: "ICU & Critical Care Station",
    department_name: "Intensive Care Unit",
    status: "Active",
    availability: "Available",
    phone: "+91 98111 00114",
    email: "karan.j@qlyno.health",
    assignedTasksCount: 1,
  },
  {
    staff_id: "sup-4",
    name: "Ganesh Shinde",
    category: "Ward / Patient-care Attendant",
    station_id: "st-3",
    station_name: "Emergency & Trauma Resuscitation Station",
    department_name: "Emergency & Trauma",
    status: "Active",
    availability: "On Duty",
    phone: "+91 98111 00115",
    email: "ganesh.s@qlyno.health",
    assignedTasksCount: 2,
  },
  {
    staff_id: "sup-5",
    name: "Kavita Salve",
    category: "Housekeeping / Cleaning Staff",
    station_id: "st-3",
    station_name: "Emergency & Trauma Resuscitation Station",
    department_name: "Emergency & Trauma",
    status: "Active",
    availability: "On Duty",
    phone: "+91 98111 00116",
    email: "kavita.s@qlyno.health",
    assignedTasksCount: 2,
  },
];

const initialShifts: ShiftDefinition[] = [
  {
    shift_id: "sh-1",
    name: "Morning",
    start_time: "07:00",
    end_time: "15:00",
    break_duration_mins: 45,
    grace_period_mins: 15,
    department_id: "dept-icu",
    is_default: true,
  },
  {
    shift_id: "sh-2",
    name: "Evening",
    start_time: "15:00",
    end_time: "23:00",
    break_duration_mins: 45,
    grace_period_mins: 15,
    department_id: "dept-icu",
    is_default: true,
  },
  {
    shift_id: "sh-3",
    name: "Night",
    start_time: "23:00",
    end_time: "07:00",
    break_duration_mins: 60,
    grace_period_mins: 15,
    department_id: "dept-icu",
    is_default: true,
  },
];

const initialPatients: PatientCareAssignment[] = [
  {
    assignment_id: "asg-1",
    patient_id: "pat-101",
    patient_name: "Rajesh Malhotra",
    qlyno_patient_id: "QLY-PAT-8812",
    age: 58,
    gender: "Male",
    ward: "ICU - Bed 04",
    room: "ICU Bay A",
    bed: "Bed 04",
    station_id: "st-1",
    nurse_id: "nurse-3", // Rahul Shinde
    nurse_name: "Nurse Rahul Shinde",
    shift_id: "sh-1",
    start_time: "07:00",
    care_level: "Critical",
    diagnosis_preview: "Post CABG Day 2 · Arterial Line in situ",
    pending_tasks_count: 2,
    vitals_status: "Attention",
    last_vitals_time: "10:30 AM",
  },
  {
    assignment_id: "asg-2",
    patient_id: "pat-102",
    patient_name: "Sunita Deshmukh",
    qlyno_patient_id: "QLY-PAT-9014",
    age: 64,
    gender: "Female",
    ward: "ICU - Bed 06",
    room: "ICU Bay B",
    bed: "Bed 06",
    station_id: "st-1",
    nurse_id: "nurse-3", // Rahul Shinde
    nurse_name: "Nurse Rahul Shinde",
    shift_id: "sh-1",
    start_time: "07:00",
    care_level: "Intermediate",
    diagnosis_preview: "Acute Severe Asthma · High Flow Nasal Cannula",
    pending_tasks_count: 1,
    vitals_status: "Normal",
    last_vitals_time: "11:00 AM",
  },
  {
    assignment_id: "asg-3",
    patient_id: "pat-103",
    patient_name: "Amitabh Sen",
    qlyno_patient_id: "QLY-PAT-7721",
    age: 49,
    gender: "Male",
    ward: "ICU - Bed 02",
    room: "ICU Bay A",
    bed: "Bed 02",
    station_id: "st-1",
    nurse_id: "nurse-2", // Sneha Kulkarni
    nurse_name: "Sister Sneha Kulkarni",
    shift_id: "sh-1",
    start_time: "07:00",
    care_level: "Critical",
    diagnosis_preview: "Severe Sepsis · Noradrenaline Infusion",
    pending_tasks_count: 3,
    vitals_status: "Critical",
    last_vitals_time: "11:15 AM",
  },
  {
    assignment_id: "asg-4",
    patient_id: "pat-104",
    patient_name: "Meenakshi Iyer",
    qlyno_patient_id: "QLY-PAT-6643",
    age: 72,
    gender: "Female",
    ward: "ICU - Bed 08",
    room: "ICU Bay C",
    bed: "Bed 08",
    station_id: "st-1",
    nurse_id: "nurse-2", // Sneha Kulkarni
    nurse_name: "Sister Sneha Kulkarni",
    shift_id: "sh-1",
    start_time: "07:00",
    care_level: "Intermediate",
    diagnosis_preview: "Diabetic Ketoacidosis · Insulin Sliding Scale",
    pending_tasks_count: 1,
    vitals_status: "Normal",
    last_vitals_time: "10:00 AM",
  },
  {
    assignment_id: "asg-201",
    patient_id: "pat-201",
    patient_name: "Alok Sharma",
    qlyno_patient_id: "QLY-PAT-1102",
    age: 38,
    gender: "Male",
    ward: "Emergency - Bay 01",
    room: "Resuscitation Red",
    bed: "Bay 01 (Red)",
    station_id: "st-3",
    nurse_id: "nurse-6",
    nurse_name: "Sister Anjali Desai",
    shift_id: "sh-1",
    start_time: "07:00",
    care_level: "Critical",
    diagnosis_preview: "Severe Polytrauma • GCS 8/15 • High-flow O2 • STAT Laparotomy Prep",
    pending_tasks_count: 3,
    vitals_status: "Critical",
    last_vitals_time: "11:45 AM",
  },
  {
    assignment_id: "asg-202",
    patient_id: "pat-202",
    patient_name: "Priya Desai",
    qlyno_patient_id: "QLY-PAT-1103",
    age: 34,
    gender: "Female",
    ward: "Emergency - Bay 02",
    room: "Resuscitation Red",
    bed: "Bay 02 (Red)",
    station_id: "st-3",
    nurse_id: "nurse-6",
    nurse_name: "Sister Anjali Desai",
    shift_id: "sh-1",
    start_time: "07:00",
    care_level: "Critical",
    diagnosis_preview: "Acute Anterior Wall STEMI • Ongoing Thrombolytic Infusion",
    pending_tasks_count: 2,
    vitals_status: "Critical",
    last_vitals_time: "11:50 AM",
  },
  {
    assignment_id: "asg-203",
    patient_id: "pat-203",
    patient_name: "Vikram Joshi",
    qlyno_patient_id: "QLY-PAT-1104",
    age: 45,
    gender: "Male",
    ward: "Emergency - Bay 03",
    room: "Trauma & Acute",
    bed: "Bay 03 (Acute)",
    station_id: "st-3",
    nurse_id: "nurse-7",
    nurse_name: "Nurse Vikram Nair",
    shift_id: "sh-1",
    start_time: "07:00",
    care_level: "Critical",
    diagnosis_preview: "Acute Subdural Hematoma • Cervical Collar in situ",
    pending_tasks_count: 2,
    vitals_status: "Attention",
    last_vitals_time: "11:30 AM",
  },
  {
    assignment_id: "asg-204",
    patient_id: "pat-204",
    patient_name: "Fatima Ansari",
    qlyno_patient_id: "QLY-PAT-1105",
    age: 29,
    gender: "Female",
    ward: "Emergency - Bay 07",
    room: "Observation Yellow",
    bed: "Bay 07 (Yellow)",
    station_id: "st-3",
    nurse_id: "nurse-8",
    nurse_name: "Nurse Pooja Sharma",
    shift_id: "sh-1",
    start_time: "07:00",
    care_level: "Intermediate",
    diagnosis_preview: "Severe Acute Asthma Attack • Continuous Nebulization",
    pending_tasks_count: 1,
    vitals_status: "Normal",
    last_vitals_time: "11:15 AM",
  },
];

const initialTasks: NursingTaskEntity[] = [
  {
    task_id: "tsk-101",
    patient_id: "pat-101",
    patient_name: "Rajesh Malhotra",
    bed_info: "ICU - Bed 04",
    owner_id: "nurse-3",
    owner_name: "Nurse Rahul Shinde",
    owner_role: "Nurse",
    station_id: "st-1",
    title: "Administer IV Meropenem 1g",
    description: "Infuse over 30 mins via dedicated central line lumen. Check vitals pre-infusion.",
    task_type: "Medication",
    priority: "High",
    due_at: "12:00 PM",
    status: "Pending",
    created_at: "2026-08-31T07:30:00Z",
    is_overdue: false,
  },
  {
    task_id: "tsk-102",
    patient_id: "pat-101",
    patient_name: "Rajesh Malhotra",
    bed_info: "ICU - Bed 04",
    owner_id: "nurse-3",
    owner_name: "Nurse Rahul Shinde",
    owner_role: "Nurse",
    station_id: "st-1",
    title: "Record Hourly Urine Output & Chest Drain",
    description: "Measure thoracic drain volume and check for air leaks.",
    task_type: "Vitals Check",
    priority: "Medium",
    due_at: "11:30 AM",
    status: "In Progress",
    created_at: "2026-08-31T07:30:00Z",
    is_overdue: false,
  },
  {
    task_id: "tsk-103",
    patient_id: "pat-103",
    patient_name: "Amitabh Sen",
    bed_info: "ICU - Bed 02",
    owner_id: "nurse-2",
    owner_name: "Sister Sneha Kulkarni",
    owner_role: "Nurse",
    station_id: "st-1",
    title: "ABG Sampling & Lactate Clearance Check",
    description: "Draw radial arterial line blood gas and send stat to lab.",
    task_type: "Doctor Order",
    priority: "High",
    due_at: "10:30 AM",
    status: "Completed",
    created_at: "2026-08-31T07:15:00Z",
    completed_at: "10:28 AM",
    is_overdue: false,
  },
  {
    task_id: "tsk-104",
    patient_id: "pat-102",
    patient_name: "Sunita Deshmukh",
    bed_info: "ICU - Bed 06",
    owner_id: "nurse-3",
    owner_name: "Nurse Rahul Shinde",
    owner_role: "Nurse",
    station_id: "st-1",
    title: "Nebulization Levosalbutamol 1.25mg",
    description: "Administer via ultrasonic nebulizer mask with 6L O2 flow.",
    task_type: "Medication",
    priority: "Medium",
    due_at: "10:00 AM",
    status: "Pending",
    created_at: "2026-08-31T07:30:00Z",
    is_overdue: true,
    escalated_to: "Sister Anita Joseph (Lead)",
  },
  {
    task_id: "tsk-105",
    patient_name: "Bed 09 Turnaround",
    bed_info: "ICU - Bed 09",
    owner_id: "sup-2",
    owner_name: "Sunita Ghorpade",
    owner_role: "SupportStaff",
    station_id: "st-1",
    title: "Terminal Cleaning & Disinfection - Bed 09",
    description: "Post-discharge deep sanitization with chlorine solution. Change all linen and ventilator circuits.",
    task_type: "Bed Sanitation",
    priority: "High",
    due_at: "12:30 PM",
    status: "In Progress",
    created_at: "2026-08-31T09:00:00Z",
    is_overdue: false,
  },
  {
    task_id: "tsk-106",
    patient_name: "Patient Escort - Bed 04",
    bed_info: "ICU - Bed 04",
    owner_id: "sup-1",
    owner_name: "Ramesh Pawar",
    owner_role: "SupportStaff",
    station_id: "st-1",
    title: "Escort Portable Chest X-Ray Unit to Bed 04",
    description: "Guide mobile radiography technician to patient bedside and assist positioning.",
    task_type: "Patient Escort",
    priority: "Routine",
    due_at: "01:00 PM",
    status: "Pending",
    created_at: "2026-08-31T09:30:00Z",
    is_overdue: false,
  },
  // Emergency & Trauma Tasks
  {
    task_id: "tsk-201",
    patient_id: "pat-201",
    patient_name: "Alok Sharma",
    bed_info: "Bay 01 (Red)",
    owner_id: "nurse-6",
    owner_name: "Sister Anjali Desai",
    owner_role: "Nurse",
    station_id: "st-3",
    title: "STAT Dual 16G IV Access & Trauma Panel Lab Draw",
    description: "Establish 2 large-bore peripheral IV lines, draw ABG, CBC, Crossmatch 4U O-neg, Coagulation panel.",
    task_type: "Doctor Order",
    priority: "High",
    due_at: "12:00 PM",
    status: "In Progress",
    created_at: "2026-08-31T11:40:00Z",
    is_overdue: false,
  },
  {
    task_id: "tsk-202",
    patient_id: "pat-202",
    patient_name: "Priya Desai",
    bed_info: "Bay 02 (Red)",
    owner_id: "nurse-6",
    owner_name: "Sister Anjali Desai",
    owner_role: "Nurse",
    station_id: "st-3",
    title: "Continuous 12-Lead ECG Telemetry & Thrombolytic Flow Rate",
    description: "Monitor Tenecteplase infusion, record 15-minute serial ECGs and neurological signs.",
    task_type: "Medication",
    priority: "High",
    due_at: "12:15 PM",
    status: "In Progress",
    created_at: "2026-08-31T11:45:00Z",
    is_overdue: false,
  },
  {
    task_id: "tsk-203",
    patient_id: "pat-203",
    patient_name: "Vikram Joshi",
    bed_info: "Bay 03 (Acute)",
    owner_id: "nurse-7",
    owner_name: "Nurse Vikram Nair",
    owner_role: "Nurse",
    station_id: "st-3",
    title: "FAST Ultrasound Bedside Positioning & Cervical Immobilization",
    description: "Position ultrasound transducer for E-FAST scan and log-roll exam. Keep strict C-spine collar on.",
    task_type: "Doctor Order",
    priority: "High",
    due_at: "11:30 AM",
    status: "Completed",
    created_at: "2026-08-31T11:15:00Z",
    completed_at: "11:28 AM",
    is_overdue: false,
  },
  {
    task_id: "tsk-204",
    patient_name: "Defibrillator Verification",
    bed_info: "Emergency Resuscitation Zone",
    owner_id: "nurse-8",
    owner_name: "Nurse Pooja Sharma",
    owner_role: "Nurse",
    station_id: "st-3",
    title: "Crash Cart & Biphasic Defibrillator Shift Verification",
    description: "Perform 30-joule self-test, verify laryngoscope blades, suction apparatus, and emergency drug seals.",
    task_type: "General Care",
    priority: "High",
    due_at: "08:00 AM",
    status: "Completed",
    created_at: "2026-08-31T07:15:00Z",
    completed_at: "07:45 AM",
    is_overdue: false,
  },
  {
    task_id: "tsk-205",
    patient_name: "Bay 04 Rapid Turnaround",
    bed_info: "Bay 04 (Acute)",
    owner_id: "sup-5",
    owner_name: "Kavita Salve",
    owner_role: "SupportStaff",
    station_id: "st-3",
    title: "Rapid Trauma Bay Terminal Sanitation - Bay 04",
    description: "Fast-track disinfectant mop, biohazard spill cleanup, replace sterile trauma sheet and suction liner.",
    task_type: "Bed Sanitation",
    priority: "High",
    due_at: "12:15 PM",
    status: "In Progress",
    created_at: "2026-08-31T11:50:00Z",
    is_overdue: false,
  },
  {
    task_id: "tsk-206",
    patient_name: "Emergency Stretcher Transfer",
    bed_info: "Bay 01 -> OT 3",
    owner_id: "sup-4",
    owner_name: "Ganesh Shinde",
    owner_role: "SupportStaff",
    station_id: "st-3",
    title: "Emergency Stretcher Transfer to Emergency OT 3",
    description: "Transport polytrauma patient Alok Sharma with portable oxygen cylinder and ICU transport monitor.",
    task_type: "Patient Escort",
    priority: "High",
    due_at: "12:30 PM",
    status: "Pending",
    created_at: "2026-08-31T11:55:00Z",
    is_overdue: false,
  },
];

const initialDoctorInstructions: DoctorInstructionEntity[] = [
  {
    instruction_id: "doc-inst-1",
    doctor_id: "doc-sharma",
    doctor_name: "Dr. Rajesh Sharma, MD (Cardiologist)",
    patient_id: "pat-101",
    patient_name: "Rajesh Malhotra",
    bed: "ICU - Bed 04",
    station_id: "st-1",
    assigned_nurse_id: "nurse-3",
    assigned_nurse_name: "Nurse Rahul Shinde",
    instruction_text: "Target MAP > 65 mmHg. If MAP drops below 60, titrate Noradrenaline by 0.02 mcg/kg/min and inform.",
    urgency: "Stat / Urgent",
    created_at: "2026-08-31T08:15:00Z",
    status: "Acknowledged",
  },
  {
    instruction_id: "doc-inst-2",
    doctor_id: "doc-deshmukh",
    doctor_name: "Dr. Priya Deshmukh, MD (Intensivist)",
    patient_id: "pat-103",
    patient_name: "Amitabh Sen",
    bed: "ICU - Bed 02",
    station_id: "st-1",
    assigned_nurse_id: "nurse-2",
    assigned_nurse_name: "Sister Sneha Kulkarni",
    instruction_text: "Repeat Serum Potassium in 2 hours post infusion. Restrict IV fluids to 60 ml/hr.",
    urgency: "Routine",
    created_at: "2026-08-31T09:45:00Z",
    status: "In Progress",
  },
  {
    instruction_id: "doc-inst-3",
    doctor_id: "doc-joshi",
    doctor_name: "Dr. Arvind Joshi, MS, MCh (Trauma Surgeon)",
    patient_id: "pat-201",
    patient_name: "Alok Sharma",
    bed: "Bay 01 (Red)",
    station_id: "st-3",
    assigned_nurse_id: "nurse-6",
    assigned_nurse_name: "Sister Anjali Desai",
    instruction_text: "STAT crossmatch 4 units O-neg PRBC. Prime rapid blood warmer and transfer to Emergency OT 3 as soon as crossmatched.",
    urgency: "Stat / Urgent",
    created_at: "2026-08-31T11:45:00Z",
    status: "Acknowledged",
  },
  {
    instruction_id: "doc-inst-4",
    doctor_id: "doc-rao",
    doctor_name: "Dr. K. N. Rao, MD (Emergency Physician)",
    patient_id: "pat-202",
    patient_name: "Priya Desai",
    bed: "Bay 02 (Red)",
    station_id: "st-3",
    assigned_nurse_id: "nurse-6",
    assigned_nurse_name: "Sister Anjali Desai",
    instruction_text: "Target SBP < 140 mmHg. Titrate IV Nitroglycerin infusion 5-20 mcg/min. Alert interventional cardiology lab for primary PCI standby.",
    urgency: "Stat / Urgent",
    created_at: "2026-08-31T11:50:00Z",
    status: "In Progress",
  },
];

const initialHandovers: ShiftHandoverEntity[] = [
  {
    handover_id: "hnd-2026-0830",
    station_id: "st-1",
    shift_id: "sh-3",
    shift_name: "Night (23:00-07:00)",
    outgoing_nurse_id: "nurse-5",
    outgoing_nurse_name: "Nurse David Dsouza",
    incoming_nurse_id: "nurse-1",
    incoming_nurse_name: "Sister Anita Joseph",
    timestamp: "2026-08-31T06:55:00Z",
    patients_count: 4,
    patient_summaries: [
      {
        patient_id: "pat-101",
        patient_name: "Rajesh Malhotra",
        bed: "ICU - Bed 04",
        key_updates: "Extubated successfully at 04:00 AM. Stable on 4L Nasal Prongs.",
        pending_tasks: ["Administer IV Meropenem 1g at 12:00 PM"],
        critical_alerts: "Watch for post-extubation stridor.",
        medication_status: "Morning doses charted.",
        doctor_instructions: "Dr. Sharma rounded at 06:30 AM.",
      },
    ],
    structured_notes: "Night shift passed without resuscitation codes. Bed 09 discharged to general ward at 06:00 AM.",
    status: "Acknowledged",
    acknowledged_at: "2026-08-31T07:05:00Z",
    unresolved_items: ["Pending blood culture report for Bed 02."],
  },
  {
    handover_id: "hnd-2026-er01",
    station_id: "st-3",
    shift_id: "sh-3",
    shift_name: "Night (23:00-07:00)",
    outgoing_nurse_id: "nurse-7",
    outgoing_nurse_name: "Nurse Vikram Nair",
    incoming_nurse_id: "nurse-6",
    incoming_nurse_name: "Sister Anjali Desai",
    timestamp: "2026-08-31T06:58:00Z",
    patients_count: 4,
    patient_summaries: [
      {
        patient_id: "pat-201",
        patient_name: "Alok Sharma",
        bed: "Bay 01 (Red)",
        key_updates: "Severe Polytrauma arrival via 108 Ambulance at 06:15 AM. Intubated in Bay 01.",
        pending_tasks: ["Emergency OT transfer"],
        critical_alerts: "High hemorrhagic shock risk.",
        medication_status: "TXA 1g IV administered.",
        doctor_instructions: "Dr. Arvind Joshi attending.",
      },
    ],
    structured_notes: "Rapid ER handover: 2 Red Resuscitation cases active. Defibrillator and crash cart verified. Trauma Bay 04 turnaround in progress.",
    status: "Acknowledged",
    acknowledged_at: "2026-08-31T07:05:00Z",
    unresolved_items: ["Bay 01 blood crossmatch confirmation pending from Blood Bank."],
  },
];

const initialStaffRequests: StaffRequestEntity[] = [
  {
    request_id: "req-01",
    staff_id: "nurse-4",
    staff_name: "Nurse Meera Varma",
    staff_role: "Nurse",
    station_id: "st-1",
    type: "Shift Swap",
    details: "Swap Evening Shift on Sept 02 with Nurse Rahul Shinde (Morning).",
    target_date: "2026-09-02",
    target_shift: "Morning",
    swap_with_staff_name: "Nurse Rahul Shinde",
    reason: "Personal family commitment in the evening.",
    status: "Pending",
    created_at: "2026-08-30T16:00:00Z",
  },
];

const initialEscalations: ClinicalEscalationEntity[] = [
  {
    escalation_id: "esc-101",
    patient_id: "pat-201",
    patient_name: "Alok Sharma (Bay 01 Red)",
    station_id: "st-3",
    raised_by_id: "nurse-6",
    raised_by_name: "Sister Anjali Desai",
    responsible_doctor: "Dr. Arvind Joshi (Trauma Lead)",
    reason: "GCS dropped from 10 to 8 • Pupil asymmetry noted (Left 4mm sluggish)",
    priority: "Urgent",
    status: "Open",
    created_at: "2026-08-31T11:48:00Z",
  },
  {
    escalation_id: "esc-102",
    patient_id: "pat-103",
    patient_name: "Amitabh Sen (Bed 02)",
    station_id: "st-1",
    raised_by_id: "nurse-2",
    raised_by_name: "Sister Sneha Kulkarni",
    responsible_doctor: "Dr. Priya Deshmukh (Intensivist)",
    reason: "Refractory hypotension MAP 54 mmHg on high-dose Noradrenaline",
    priority: "Urgent",
    status: "Acknowledged",
    created_at: "2026-08-31T10:15:00Z",
    acknowledged_at: "2026-08-31T10:20:00Z",
  },
  {
    escalation_id: "esc-103",
    patient_id: "pat-101",
    patient_name: "Rajesh Malhotra (Bed 04)",
    station_id: "st-1",
    raised_by_id: "nurse-3",
    raised_by_name: "Nurse Rahul Shinde",
    responsible_doctor: "Dr. Rajesh Sharma (Cardiologist)",
    reason: "Sudden spike in thoracic drain output > 200ml/hr hemorrhagic",
    priority: "Urgent",
    status: "Resolved",
    created_at: "2026-08-31T08:30:00Z",
    acknowledged_at: "2026-08-31T08:35:00Z",
    resolved_at: "2026-08-31T09:15:00Z",
  },
];

const initialNotifications: StaffNotificationEntity[] = [
  {
    notification_id: "notif-1",
    recipient_id: "nurse-6",
    recipient_name: "Sister Anjali Desai",
    station_id: "st-3",
    event: "Clinical Escalation",
    title: "🚨 Rapid Trauma Triage Alert",
    message: "Alok Sharma admitted to Bay 01 as Priority 1 Resuscitation (Red).",
    created_at: "2026-08-31T11:42:00Z",
    status: "Unread",
  },
  {
    notification_id: "notif-2",
    recipient_id: "nurse-6",
    recipient_name: "Sister Anjali Desai",
    station_id: "st-3",
    event: "Doctor Instruction",
    title: "STAT Doctor Order — Emergency OT Prep",
    message: "Dr. Arvind Joshi issued order: 4U O-neg PRBC crossmatch and OT 3 standby.",
    created_at: "2026-08-31T11:46:00Z",
    status: "Unread",
  },
  {
    notification_id: "notif-3",
    recipient_id: "nurse-1",
    recipient_name: "Sister Anita Joseph",
    station_id: "st-1",
    event: "Task Overdue",
    title: "Task Overdue Warning",
    message: "Nebulization Levosalbutamol for Bed 06 is overdue by 30 mins.",
    created_at: "2026-08-31T10:30:00Z",
    status: "Read",
  },
];

const defaultInitialState: NursingOperationsState = {
  currentRole: "admin",
  currentUserId: "usr-admin-1",
  currentUserName: "Dr. Vikram Seth (Hospital Admin)",
  activeStationId: "st-1",
  stations: initialStations,
  nurses: initialNurses,
  supportStaff: initialSupportStaff,
  shiftTemplates: initialShifts,
  roster: [
    { roster_id: "roster-1", shift_id: "sh-1", shift_name: "Morning", staff_id: "nurse-1", staff_name: "Sister Anita Joseph", staff_role: "Nurse Station Lead", staff_type: "Nurse", station_id: "st-1", date: "2026-08-31", status: "Confirmed" },
    { roster_id: "roster-2", shift_id: "sh-1", shift_name: "Morning", staff_id: "nurse-3", staff_name: "Nurse Rahul Shinde", staff_role: "Nurse", staff_type: "Nurse", station_id: "st-1", date: "2026-08-31", status: "Confirmed" },
    { roster_id: "roster-3", shift_id: "sh-1", shift_name: "Morning", staff_id: "sup-1", staff_name: "Ramesh Pawar", staff_role: "Ward / Patient-care Attendant", staff_type: "SupportStaff", station_id: "st-1", date: "2026-08-31", status: "Scheduled" },
    { roster_id: "roster-4", shift_id: "sh-1", shift_name: "Morning", staff_id: "nurse-6", staff_name: "Sister Anjali Desai", staff_role: "Nurse Station Lead", staff_type: "Nurse", station_id: "st-3", date: "2026-08-31", status: "Confirmed" },
    { roster_id: "roster-5", shift_id: "sh-1", shift_name: "Morning", staff_id: "nurse-7", staff_name: "Nurse Vikram Nair", staff_role: "Senior Nurse", staff_type: "Nurse", station_id: "st-3", date: "2026-08-31", status: "Confirmed" },
    { roster_id: "roster-6", shift_id: "sh-1", shift_name: "Morning", staff_id: "sup-4", staff_name: "Ganesh Shinde", staff_role: "Ward / Patient-care Attendant", staff_type: "SupportStaff", station_id: "st-3", date: "2026-08-31", status: "Confirmed" },
  ],
  patientAssignments: initialPatients,
  tasks: initialTasks,
  handovers: initialHandovers,
  doctorInstructions: initialDoctorInstructions,
  staffRequests: initialStaffRequests,
  notifications: initialNotifications,
  escalations: initialEscalations,
  clinicalActivities: [],
  auditLogs: [
    {
      id: "aud-01",
      actor: "Sister Anita Joseph",
      role: "Nurse Station Lead",
      action: "ASSIGN_PATIENT",
      entity: "Patient Rajesh Malhotra -> Nurse Rahul Shinde",
      timestamp: "2026-08-31T07:10:00Z",
      reason: "Morning Shift Primary ICU Allocation",
      stationScope: "ICU & Critical Care Station",
    },
    {
      id: "aud-02",
      actor: "Sister Anjali Desai",
      role: "Nurse Station Lead",
      action: "TRIAGE_ENQUEUE",
      entity: "Patient Alok Sharma -> Bay 01 (Red)",
      timestamp: "2026-08-31T11:42:00Z",
      reason: "Severe Polytrauma Immediate Resuscitation Allocation",
      stationScope: "Emergency & Trauma Resuscitation Station",
    },
  ],
};

export const initialState: NursingOperationsState = defaultInitialState;

export const nursingOperationsSlice = createSlice({
  name: "nursingOperations",
  initialState: defaultInitialState,
  reducers: {
    hydrateNursingOperations: (state, action: PayloadAction<Partial<NursingOperationsState>>) => ({
      ...state,
      ...action.payload,
      notifications: action.payload.notifications ?? state.notifications ?? [],
      escalations: action.payload.escalations ?? state.escalations ?? [],
      clinicalActivities: action.payload.clinicalActivities ?? state.clinicalActivities ?? [],
    }),
    setCurrentRole: (state, action: PayloadAction<{ role: AppUserRole; userId?: string; userName?: string }>) => {
      state.currentRole = action.payload.role;
      if (action.payload.userId) state.currentUserId = action.payload.userId;
      if (action.payload.userName) state.currentUserName = action.payload.userName;

      if (typeof window !== "undefined" && window.localStorage) {
        try {
          const saved = window.localStorage.getItem("qlyno.nursing-operations.v1");
          const existing = saved ? JSON.parse(saved) : {};
          window.localStorage.setItem(
            "qlyno.nursing-operations.v1",
            JSON.stringify({
              ...existing,
              currentRole: state.currentRole,
              currentUserId: state.currentUserId,
              currentUserName: state.currentUserName,
            })
          );
        } catch {
          // ignore
        }
      }
    },
    setActiveStation: (state, action: PayloadAction<string>) => {
      if (state.stations.some((station) => station.station_id === action.payload && station.status === "Active")) {
        state.activeStationId = action.payload;
      }
    },
    createOrUpdateStation: (state, action: PayloadAction<Omit<NurseStationEntity, "station_id"> & { station_id?: string; actor: string }>) => {
      const { actor, station_id, ...station } = action.payload;
      const existing = station_id ? state.stations.find((item) => item.station_id === station_id) : undefined;
      if (existing) {
        const before = JSON.stringify(existing);
        Object.assign(existing, station);
        audit(state, { actor, role: state.currentRole, action: "UPDATE_STATION", entity: existing.name, before, after: JSON.stringify(existing), reason: "Station configuration updated", stationScope: existing.name });
        return;
      }
      const created: NurseStationEntity = { ...station, station_id: id("station") };
      state.stations.push(created);
      audit(state, { actor, role: state.currentRole, action: "CREATE_STATION", entity: created.name, after: JSON.stringify(created), reason: "Station created", stationScope: created.name });
    },
    setStationStatus: (state, action: PayloadAction<{ stationId: string; status: NurseStationEntity["status"]; actor: string; reason: string }>) => {
      const station = state.stations.find((item) => item.station_id === action.payload.stationId);
      if (!station) return;
      const before = station.status;
      station.status = action.payload.status;
      audit(state, { actor: action.payload.actor, role: state.currentRole, action: "CHANGE_STATION_STATUS", entity: station.name, before, after: station.status, reason: action.payload.reason, stationScope: station.name });
    },
    createShiftTemplate: (state, action: PayloadAction<Omit<ShiftDefinition, "shift_id"> & { actor: string }>) => {
      const { actor, ...shift } = action.payload;
      const created: ShiftDefinition = { ...shift, shift_id: id("shift") };
      state.shiftTemplates.push(created);
      audit(state, { actor, role: state.currentRole, action: "CREATE_SHIFT", entity: created.name, after: JSON.stringify(created), reason: "Shift template created", stationScope: created.department_id });
    },
    createRosterAssignments: (state, action: PayloadAction<{ assignments: Array<Omit<RosterAssignment, "roster_id">>; actor: string; reason: string }>) => {
      for (const assignment of action.payload.assignments) {
        const conflict = state.roster.some((item) => item.staff_id === assignment.staff_id && item.date === assignment.date && item.status !== "Cancelled");
        if (conflict) continue;
        const created: RosterAssignment = { ...assignment, roster_id: id("roster") };
        state.roster.push(created);
        // Event 2: Shift assigned/changed -> Affected nurse + Nurse Station
        notify(state, { recipient_id: created.staff_id, recipient_name: created.staff_name, station_id: created.station_id, event: "Shift Assigned", title: "Shift Assignment Update", message: `${created.shift_name} shift assigned on ${created.date}.`, entity_id: created.roster_id });
        notify(state, { recipient_id: created.station_id, recipient_name: "Nurse Station Lead", station_id: created.station_id, event: "Shift Assigned", title: "Shift Assignment Confirmed", message: `${created.staff_name} assigned to ${created.shift_name} on ${created.date}.`, entity_id: created.roster_id });
      }
      audit(state, { actor: action.payload.actor, role: state.currentRole, action: "PUBLISH_ROSTER", entity: `${action.payload.assignments.length} roster assignment(s)`, reason: action.payload.reason, stationScope: "Organization" });
    },
    reassignStaffShift: (
      state,
      action: PayloadAction<{
        rosterId?: string;
        staffId: string;
        targetDate: string;
        targetShiftId: string;
        targetShiftName: string;
        swapWithStaffId?: string;
        actor: string;
        reason: string;
      }>
    ) => {
      const { rosterId, staffId, targetDate, targetShiftId, targetShiftName, swapWithStaffId, actor, reason } = action.payload;
      const staff = state.nurses.find((n) => n.staff_id === staffId) || state.supportStaff.find((s) => s.staff_id === staffId);
      const staffName = staff?.name || "Staff Member";
      const stationId = staff?.station_id || "st-1";

      if (swapWithStaffId) {
        const swapStaff = state.nurses.find((n) => n.staff_id === swapWithStaffId) || state.supportStaff.find((s) => s.staff_id === swapWithStaffId);
        const swapStaffName = swapStaff?.name || "Swap Colleague";

        const currentEntryA = state.roster.find((r) => r.staff_id === staffId && r.date === targetDate);
        const currentEntryB = state.roster.find((r) => r.staff_id === swapWithStaffId && r.date === targetDate);

        if (currentEntryA && currentEntryB) {
          const tempShiftId = currentEntryA.shift_id;
          const tempShiftName = currentEntryA.shift_name;
          currentEntryA.shift_id = currentEntryB.shift_id;
          currentEntryA.shift_name = currentEntryB.shift_name;
          currentEntryB.shift_id = tempShiftId;
          currentEntryB.shift_name = tempShiftName;
        }

        // Event 3: Shift swap request -> Nurse Station / approver / Affected nurse
        notify(state, {
          recipient_id: staffId,
          recipient_name: staffName,
          station_id: stationId,
          event: "Shift Swap Request",
          title: "Shift Swap Executed (Workflow 16.3)",
          message: `Your shift on ${targetDate} was swapped with ${swapStaffName}. Reason: ${reason}`,
        });
        notify(state, {
          recipient_id: swapWithStaffId,
          recipient_name: swapStaffName,
          station_id: stationId,
          event: "Shift Swap Request",
          title: "Shift Swap Executed (Workflow 16.3)",
          message: `Your shift on ${targetDate} was swapped with ${staffName}. Reason: ${reason}`,
        });
        notify(state, {
          recipient_id: stationId,
          recipient_name: "Nurse Station Lead",
          station_id: stationId,
          event: "Shift Swap Request",
          title: "Station Shift Swap Logged",
          message: `Shift swap completed between ${staffName} and ${swapStaffName} on ${targetDate}. Reason: ${reason}`,
        });

        audit(state, {
          actor,
          role: state.currentRole,
          action: "SWAP_STAFF_SHIFT",
          entity: `${staffName} <-> ${swapStaffName} (${targetDate})`,
          reason,
          stationScope: stationId,
        });
      } else {
        const staffRole = state.nurses.find((n) => n.staff_id === staffId)?.role || "Staff Nurse";
        let existingRosterId = "";
        const existing = state.roster.find((r) => (rosterId && r.roster_id === rosterId) || (r.staff_id === staffId && r.date === targetDate));
        const beforeShift = existing?.shift_name || "Unassigned";

        if (existing) {
          existing.shift_id = targetShiftId;
          existing.shift_name = targetShiftName;
          existing.status = "Scheduled";
          existingRosterId = existing.roster_id;
        } else {
          const newEntry: RosterAssignment = {
            roster_id: id("roster"),
            staff_id: staffId,
            staff_name: staffName,
            staff_role: staffRole,
            staff_type: state.nurses.some((n) => n.staff_id === staffId) ? "Nurse" : "SupportStaff",
            shift_id: targetShiftId,
            shift_name: targetShiftName,
            date: targetDate,
            station_id: stationId,
            status: "Scheduled",
          };
          state.roster.push(newEntry);
          existingRosterId = newEntry.roster_id;
        }

        // Event 2: Shift assigned/changed -> Affected nurse + Nurse Station
        notify(state, {
          recipient_id: staffId,
          recipient_name: staffName,
          station_id: stationId,
          event: "Shift Changed",
          title: "Shift Reassignment (Workflow 16.3)",
          message: `Your shift on ${targetDate} has been updated to ${targetShiftName}. Reason: ${reason}`,
          entity_id: existingRosterId,
        });
        notify(state, {
          recipient_id: stationId,
          recipient_name: "Nurse Station Lead",
          station_id: stationId,
          event: "Shift Changed",
          title: "Staff Shift Reassigned",
          message: `${staffName} reassigned from ${beforeShift} to ${targetShiftName} on ${targetDate}. Reason: ${reason}`,
          entity_id: existingRosterId,
        });

        audit(state, {
          actor,
          role: state.currentRole,
          action: "REASSIGN_STAFF_SHIFT",
          entity: `${staffName} (${targetDate})`,
          before: beforeShift,
          after: targetShiftName,
          reason,
          stationScope: stationId,
        });
      }
    },
    changeStaffLifecycle: (state, action: PayloadAction<{ staffId: string; staffType: "Nurse" | "SupportStaff"; status: StaffLifecycleStatus; actor: string; reason: string }>) => {
      const people = action.payload.staffType === "Nurse" ? state.nurses : state.supportStaff;
      const staff = people.find((item) => item.staff_id === action.payload.staffId);
      if (!staff) return;
      const before = staff.status;
      staff.status = action.payload.status;
      if (action.payload.status === "Removed" || action.payload.status === "Archived" || action.payload.status === "Suspended") staff.availability = "Off Duty";
      audit(state, { actor: action.payload.actor, role: state.currentRole, action: "CHANGE_STAFF_LIFECYCLE", entity: staff.name, before, after: staff.status, reason: action.payload.reason, stationScope: staff.station_name });
    },
    updateAvailability: (state, action: PayloadAction<{ staffId: string; staffType: "Nurse" | "SupportStaff"; availability: NurseAvailabilityStatus; actor: string; reason: string }>) => {
      const people = action.payload.staffType === "Nurse" ? state.nurses : state.supportStaff;
      const staff = people.find((item) => item.staff_id === action.payload.staffId);
      if (!staff) return;
      const before = staff.availability;
      staff.availability = action.payload.availability;
      audit(state, { actor: action.payload.actor, role: state.currentRole, action: "CHANGE_AVAILABILITY", entity: staff.name, before, after: staff.availability, reason: action.payload.reason, stationScope: staff.station_name });
    },
    updateTaskStatus: (
      state,
      action: PayloadAction<{ taskId: string; status: NursingTaskEntity["status"]; blockedReason?: string }>
    ) => {
      const task = state.tasks.find((t) => t.task_id === action.payload.taskId);
      if (task) {
        const before = task.status;
        task.status = action.payload.status;
        if (action.payload.status === "Completed") {
          task.completed_at = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        }
        if (action.payload.blockedReason) {
          task.blocked_reason = action.payload.blockedReason;
        }
        audit(state, { actor: state.currentUserName, role: state.currentRole, action: "UPDATE_TASK_STATUS", entity: task.title, before, after: task.status, reason: action.payload.blockedReason || "Task status updated", stationScope: task.station_id });
      }
    },
    flagOverdueTask: (state, action: PayloadAction<{ taskId: string }>) => {
      const task = state.tasks.find((t) => t.task_id === action.payload.taskId);
      if (task && task.status !== "Completed") {
        task.is_overdue = true;
        // Event 6: Task overdue -> Nurse + Nurse Station + Configured Escalation Role
        notify(state, { recipient_id: task.owner_id, recipient_name: task.owner_name, station_id: task.station_id, event: "Task Overdue", title: "⚠️ Task Overdue Alert", message: `Task "${task.title}" for ${task.patient_name || task.bed_info} has breached due time (${task.due_at}).`, entity_id: task.task_id });
        notify(state, { recipient_id: task.station_id, recipient_name: "Nurse Station Lead", station_id: task.station_id, event: "Task Overdue", title: "Station Task Overdue SLA Breach", message: `Task "${task.title}" assigned to ${task.owner_name} is overdue.`, entity_id: task.task_id });
        notify(state, { recipient_id: "station-lead-escalation", recipient_name: "Shift In-Charge / Nurse Lead", station_id: task.station_id, event: "Task Overdue", title: "Escalated Task SLA Warning", message: `Task "${task.title}" (${task.bed_info}) requires supervisor intervention.`, entity_id: task.task_id });
      }
    },
    createNursingTask: (state, action: PayloadAction<Omit<NursingTaskEntity, "task_id" | "created_at" | "is_overdue">>) => {
      const newTask: NursingTaskEntity = {
        ...action.payload,
        task_id: `tsk-${Date.now().toString().slice(-4)}`,
        created_at: new Date().toISOString(),
        is_overdue: false,
      };
      state.tasks.unshift(newTask);
      // Event 5: Task assigned -> Task owner + Nurse Station
      notify(state, { recipient_id: newTask.owner_id, recipient_name: newTask.owner_name, station_id: newTask.station_id, event: "Task Assigned", title: "New Nursing Task Assigned", message: `${newTask.title} (Priority: ${newTask.priority}, Due: ${newTask.due_at})`, entity_id: newTask.task_id });
      notify(state, { recipient_id: newTask.station_id, recipient_name: "Nurse Station Lead", station_id: newTask.station_id, event: "Task Assigned", title: "Task Created", message: `Task "${newTask.title}" assigned to ${newTask.owner_name} (${newTask.bed_info}).`, entity_id: newTask.task_id });
      audit(state, { actor: state.currentUserName, role: state.currentRole, action: "CREATE_TASK", entity: newTask.title, after: JSON.stringify(newTask), reason: "Task assigned", stationScope: newTask.station_id });
    },
    assignPatientToNurse: (
      state,
      action: PayloadAction<{ patientId: string; nurseId: string; nurseName: string; reason: string; actor: string }>
    ) => {
      const patient = state.patientAssignments.find((p) => p.patient_id === action.payload.patientId);
      if (patient) {
        const oldNurse = patient.nurse_name;
        patient.nurse_id = action.payload.nurseId;
        patient.nurse_name = action.payload.nurseName;
        audit(state, { actor: action.payload.actor, role: "Nurse Station Lead", action: "REASSIGN_PATIENT", entity: `${patient.patient_name} (${patient.bed}): ${oldNurse} -> ${action.payload.nurseName}`, reason: action.payload.reason, stationScope: patient.station_id });
        // Event 4: Patient assigned -> Assigned nurse + Nurse Station
        notify(state, { recipient_id: patient.nurse_id, recipient_name: patient.nurse_name, station_id: patient.station_id, event: "Patient Assigned", title: "Patient Care Assignment", message: `${patient.patient_name} (${patient.bed}) assigned to you. Care Level: ${patient.care_level}.`, entity_id: patient.assignment_id });
        notify(state, { recipient_id: patient.station_id, recipient_name: "Nurse Station Lead", station_id: patient.station_id, event: "Patient Assigned", title: "Patient Care Reassigned", message: `${patient.patient_name} (${patient.bed}) assigned to ${patient.nurse_name}. Reason: ${action.payload.reason}`, entity_id: patient.assignment_id });
      }
    },
    createShiftHandover: (state, action: PayloadAction<Omit<ShiftHandoverEntity, "handover_id" | "timestamp" | "status">>) => {
      const newHandover: ShiftHandoverEntity = {
        ...action.payload,
        handover_id: `hnd-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString(),
        status: "Pending Acknowledgement",
      };
      state.handovers.unshift(newHandover);
      // Event 9: Handover pending -> Outgoing/incoming nurse + Nurse Station
      notify(state, { recipient_id: newHandover.incoming_nurse_id, recipient_name: newHandover.incoming_nurse_name, station_id: newHandover.station_id, event: "Handover Pending", title: "Handover Awaiting Acknowledgement", message: `${newHandover.shift_name} handover from ${newHandover.outgoing_nurse_name}.`, entity_id: newHandover.handover_id });
      notify(state, { recipient_id: newHandover.outgoing_nurse_id, recipient_name: newHandover.outgoing_nurse_name, station_id: newHandover.station_id, event: "Handover Pending", title: "Handover Dispatched", message: `Your ${newHandover.shift_name} handover was sent to ${newHandover.incoming_nurse_name}.`, entity_id: newHandover.handover_id });
      notify(state, { recipient_id: newHandover.station_id, recipient_name: "Nurse Station Lead", station_id: newHandover.station_id, event: "Handover Pending", title: "Cross-Shift Handover Initiated", message: `${newHandover.outgoing_nurse_name} initiated handover to ${newHandover.incoming_nurse_name}.`, entity_id: newHandover.handover_id });
      audit(state, { actor: newHandover.outgoing_nurse_name, role: "Nurse", action: "CREATE_HANDOVER", entity: newHandover.shift_name, reason: "Cross-shift continuity record created", stationScope: newHandover.station_id });
    },
    acknowledgeShiftHandover: (state, action: PayloadAction<{ handoverId: string; nurseName: string }>) => {
      const handover = state.handovers.find((h) => h.handover_id === action.payload.handoverId);
      if (handover) {
        handover.status = "Acknowledged";
        handover.acknowledged_at = new Date().toISOString();
        // Event 10: Handover completed -> Nurse Station + relevant team
        notify(state, { recipient_id: handover.station_id, recipient_name: "Nurse Station Lead", station_id: handover.station_id, event: "Handover Completed", title: "Shift Handover Completed", message: `${action.payload.nurseName} acknowledged and accepted the ${handover.shift_name} handover.`, entity_id: handover.handover_id });
        notify(state, { recipient_id: handover.outgoing_nurse_id, recipient_name: handover.outgoing_nurse_name, station_id: handover.station_id, event: "Handover Completed", title: "Handover Confirmed", message: `${action.payload.nurseName} has verified and accepted your handover.`, entity_id: handover.handover_id });
        audit(state, { actor: action.payload.nurseName, role: "Staff Nurse", action: "ACKNOWLEDGE_HANDOVER", entity: `Shift Handover ${handover.handover_id} received.`, reason: "Cross-shift continuity confirmed.", stationScope: handover.station_id });
      }
    },
    createDoctorInstruction: (state, action: PayloadAction<Omit<DoctorInstructionEntity, "instruction_id" | "created_at">>) => {
      const created: DoctorInstructionEntity = { ...action.payload, instruction_id: id("doc-inst"), created_at: timestamp() };
      state.doctorInstructions.unshift(created);
      // Event 7: Doctor instruction -> Relevant nurse / station
      if (created.assigned_nurse_id) {
        notify(state, { recipient_id: created.assigned_nurse_id, recipient_name: created.assigned_nurse_name || "Assigned Nurse", station_id: created.station_id, event: "Doctor Instruction", title: "Doctor Instruction Received", message: `${created.doctor_name}: ${created.instruction_text} (${created.urgency})`, entity_id: created.instruction_id });
      }
      notify(state, { recipient_id: created.station_id, recipient_name: "Nurse Station Lead", station_id: created.station_id, event: "Doctor Instruction", title: "New Doctor Order Active", message: `New order for ${created.patient_name} (${created.bed}) from ${created.doctor_name}.`, entity_id: created.instruction_id });
      audit(state, { actor: created.doctor_name, role: "Doctor", action: "CREATE_DOCTOR_INSTRUCTION", entity: created.instruction_text, reason: created.urgency, stationScope: created.station_id });
    },
    respondDoctorInstruction: (
      state,
      action: PayloadAction<{ instructionId: string; status: DoctorInstructionEntity["status"]; note?: string }>
    ) => {
      const instruction = state.doctorInstructions.find((i) => i.instruction_id === action.payload.instructionId);
      if (instruction) {
        const before = instruction.status;
        instruction.status = action.payload.status;
        if (action.payload.note) instruction.clarification_note = action.payload.note;
        notify(state, { recipient_id: instruction.station_id, recipient_name: "Nurse Station Lead", station_id: instruction.station_id, event: "Doctor Instruction", title: `Doctor Order: ${instruction.status}`, message: `${instruction.patient_name} (${instruction.bed}): Order status changed to ${instruction.status}.`, entity_id: instruction.instruction_id });
        audit(state, { actor: state.currentUserName, role: state.currentRole, action: "RESPOND_DOCTOR_INSTRUCTION", entity: instruction.instruction_text, before, after: instruction.status, reason: action.payload.note || "Instruction status updated", stationScope: instruction.station_id });
      }
    },
    submitStaffRequest: (state, action: PayloadAction<Omit<StaffRequestEntity, "request_id" | "created_at" | "status">>) => {
      const created: StaffRequestEntity = { ...action.payload, request_id: id("req"), created_at: timestamp(), status: "Pending" };
      state.staffRequests.unshift(created);
      // Event 3: Shift swap request -> Nurse Station / approver
      notify(state, { recipient_id: created.station_id, recipient_name: "Nurse Station Approver", station_id: created.station_id, event: "Shift Swap Request", title: "New Shift Swap / Leave Request", message: `${created.staff_name} submitted a ${created.type} request: ${created.reason}`, entity_id: created.request_id });
      audit(state, { actor: created.staff_name, role: "Nurse", action: "SUBMIT_STAFF_REQUEST", entity: created.type, reason: created.reason, stationScope: created.station_id });
    },
    reviewStaffRequest: (
      state,
      action: PayloadAction<{ requestId: string; status: "Approved" | "Rejected"; reviewer: string }>
    ) => {
      const req = state.staffRequests.find((r) => r.request_id === action.payload.requestId);
      if (req) {
        req.status = action.payload.status;
        req.reviewed_by = action.payload.reviewer;
        req.reviewed_at = new Date().toISOString();
        // Event 2 & 3: Notify requesting nurse & Station on approval/rejection
        notify(state, { recipient_id: req.staff_id, recipient_name: req.staff_name, station_id: req.station_id, event: "Shift Changed", title: `Shift Request ${req.status}`, message: `Your ${req.type} request was ${req.status.toLowerCase()} by ${action.payload.reviewer}.`, entity_id: req.request_id });
        notify(state, { recipient_id: req.station_id, recipient_name: "Nurse Station Lead", station_id: req.station_id, event: "Shift Changed", title: `Staff Request ${req.status}`, message: `${req.staff_name}'s ${req.type} request was ${req.status.toLowerCase()}.`, entity_id: req.request_id });
        audit(state, { actor: action.payload.reviewer, role: state.currentRole, action: "REVIEW_STAFF_REQUEST", entity: req.type, before: "Pending", after: req.status, reason: req.reason, stationScope: req.station_id });
      }
    },
    registerNurse: (state, action: PayloadAction<Omit<NurseStaffEntity, "staff_id" | "assignedPatientsCount" | "pendingTasksCount">>) => {
      const newNurse: NurseStaffEntity = {
        ...action.payload,
        staff_id: `nurse-${Date.now().toString().slice(-4)}`,
        assignedPatientsCount: 0,
        pendingTasksCount: 0,
      };
      state.nurses.unshift(newNurse);
      // Event 1: New nurse created/invited -> Nurse + Nurse Station
      notify(state, { recipient_id: newNurse.staff_id, recipient_name: newNurse.name, station_id: newNurse.station_id, event: "Nurse Invited", title: "Nurse Account Setup", message: "Your nursing workspace is ready for activation.", entity_id: newNurse.staff_id });
      notify(state, { recipient_id: newNurse.station_id, recipient_name: "Nurse Station Lead", station_id: newNurse.station_id, event: "Nurse Invited", title: "New Nurse Onboarded", message: `${newNurse.name} (${newNurse.role}) registered to ${newNurse.station_name}.`, entity_id: newNurse.staff_id });
      audit(state, { actor: state.currentUserName, role: state.currentRole, action: "CREATE_NURSE", entity: newNurse.name, after: JSON.stringify(newNurse), reason: "Nurse onboarded", stationScope: newNurse.station_name });
    },
    registerSupportStaff: (state, action: PayloadAction<Omit<SupportStaffEntity, "staff_id" | "assignedTasksCount">>) => {
      const newStaff: SupportStaffEntity = {
        ...action.payload,
        staff_id: `sup-${Date.now().toString().slice(-4)}`,
        assignedTasksCount: 0,
      };
      state.supportStaff.unshift(newStaff);
      audit(state, { actor: state.currentUserName, role: state.currentRole, action: "CREATE_SUPPORT_STAFF", entity: newStaff.name, after: JSON.stringify(newStaff), reason: "Support staff onboarded", stationScope: newStaff.station_name });
    },
    createClinicalEscalation: (state, action: PayloadAction<Omit<ClinicalEscalationEntity, "escalation_id" | "status" | "created_at">>) => {
      const escalation: ClinicalEscalationEntity = { ...action.payload, escalation_id: id("esc"), status: "Open", created_at: timestamp() };
      state.escalations.unshift(escalation);
      // Event 8: Critical escalation -> Responsible doctor + clinical team + Nurse Station
      notify(state, { recipient_id: "doctor-team", recipient_name: escalation.responsible_doctor, station_id: escalation.station_id, event: "Clinical Escalation", title: "🚨 Critical Patient Escalation", message: `${escalation.patient_name}: ${escalation.reason}`, entity_id: escalation.escalation_id });
      notify(state, { recipient_id: escalation.station_id, recipient_name: "Nurse Station Lead", station_id: escalation.station_id, event: "Clinical Escalation", title: "Clinical Escalation Active", message: `${escalation.raised_by_name} escalated ${escalation.patient_name} to ${escalation.responsible_doctor}.`, entity_id: escalation.escalation_id });
      audit(state, { actor: escalation.raised_by_name, role: "Nurse", action: "CREATE_CLINICAL_ESCALATION", entity: escalation.patient_name, reason: escalation.reason, stationScope: escalation.station_id });
    },
    recordClinicalActivity: (state, action: PayloadAction<Omit<NursingClinicalActivity, "activity_id" | "recorded_at">>) => {
      const activity: NursingClinicalActivity = { ...action.payload, activity_id: id("activity"), recorded_at: timestamp() };
      state.clinicalActivities.unshift(activity);
      audit(state, { actor: activity.nurse_name, role: "Nurse", action: `RECORD_${activity.type.toUpperCase().replaceAll(" ", "_")}`, entity: activity.patient_id, reason: activity.summary, stationScope: activity.station_id });
    },
    updateEscalationStatus: (state, action: PayloadAction<{ escalationId: string; status: ClinicalEscalationEntity["status"]; actor: string }>) => {
      const escalation = state.escalations.find((item) => item.escalation_id === action.payload.escalationId);
      if (!escalation) return;
      const before = escalation.status;
      escalation.status = action.payload.status;
      if (action.payload.status === "Acknowledged") escalation.acknowledged_at = timestamp();
      if (action.payload.status === "Resolved") escalation.resolved_at = timestamp();
      audit(state, { actor: action.payload.actor, role: state.currentRole, action: "UPDATE_ESCALATION", entity: escalation.patient_name, before, after: escalation.status, reason: "Escalation status updated", stationScope: escalation.station_id });
    },
    sendAnnouncement: (state, action: PayloadAction<{ stationId: string; recipients: Array<{ id: string; name: string }>; message: string; actor: string }>) => {
      // Event 11: Announcement -> Selected station / team / staff group
      action.payload.recipients.forEach((recipient) => notify(state, { recipient_id: recipient.id, recipient_name: recipient.name, station_id: action.payload.stationId, event: "Announcement", title: "📢 Station Broadcast Announcement", message: action.payload.message }));
      notify(state, { recipient_id: action.payload.stationId, recipient_name: "Nurse Station Lead", station_id: action.payload.stationId, event: "Announcement", title: "Announcement Broadcasted", message: `Broadcast sent to ${action.payload.recipients.length} team member(s).` });
      audit(state, { actor: action.payload.actor, role: state.currentRole, action: "SEND_ANNOUNCEMENT", entity: `${action.payload.recipients.length} recipient(s)`, reason: action.payload.message, stationScope: action.payload.stationId });
    },
    markNotificationRead: (state, action: PayloadAction<{ notificationId: string; recipientId: string }>) => {
      const notification = state.notifications.find((item) => item.notification_id === action.payload.notificationId && item.recipient_id === action.payload.recipientId);
      if (notification) { notification.status = "Read"; notification.read_at = timestamp(); }
    },
  },
});

export const {
  hydrateNursingOperations,
  setCurrentRole,
  setActiveStation,
  createOrUpdateStation,
  setStationStatus,
  createShiftTemplate,
  createRosterAssignments,
  reassignStaffShift,
  changeStaffLifecycle,
  updateAvailability,
  updateTaskStatus,
  flagOverdueTask,
  createNursingTask,
  assignPatientToNurse,
  createShiftHandover,
  acknowledgeShiftHandover,
  createDoctorInstruction,
  respondDoctorInstruction,
  submitStaffRequest,
  reviewStaffRequest,
  registerNurse,
  registerSupportStaff,
  createClinicalEscalation,
  recordClinicalActivity,
  updateEscalationStatus,
  sendAnnouncement,
  markNotificationRead,
} = nursingOperationsSlice.actions;

export default nursingOperationsSlice.reducer;
