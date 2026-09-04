import {
  Allergy,
  Appointment,
  Clinic,
  ClinicalAlert,
  ConsultationNote,
  Conversation,
  DiagnosisEntry,
  Doctor,
  FollowUp,
  LabOrder,
  Patient,
  Prescription,
  RadiologyOrder,
  StaffMember,
  Task,
  WorkContext,
} from "./types";
import { CURRENT_DATE_ISO, addDaysToISO } from "./app-time";

export const clinic: Clinic = {
  id: "clinic-1",
  name: "Meridian Family Clinic",
  logoInitial: "M",
  locations: [
    { id: "loc-1", name: "Meridian — MG Road", address: "14 MG Road, Bengaluru", isPrimary: true },
    { id: "loc-2", name: "Meridian — Indiranagar", address: "88 100ft Road, Indiranagar, Bengaluru" },
  ],
  services: ["General Medicine", "Pediatrics", "Dermatology", "Cardiology Consults", "Diabetes Care"],
  timings: "Mon–Sat, 9:00 AM – 8:00 PM",
};

export const currentDoctor: Doctor = {
  id: "doc-1",
  name: "Dr. Ananya Rao",
  specialty: "Internal Medicine",
  qualifications: "MBBS, MD (Internal Medicine)",
  experienceYears: 9,
  avatarInitials: "AR",
  availability: "Available",
  locationId: "loc-1",
  rating: 4.8,
  patientsCount: 482,
};

export const doctors: Doctor[] = [
  currentDoctor,
  {
    id: "doc-2",
    name: "Dr. Karan Mehta",
    specialty: "Pediatrics",
    qualifications: "MBBS, DCH",
    experienceYears: 6,
    avatarInitials: "KM",
    availability: "Busy",
    locationId: "loc-1",
    rating: 4.6,
    patientsCount: 311,
  },
  {
    id: "doc-3",
    name: "Dr. Leela Nair",
    specialty: "Dermatology",
    qualifications: "MBBS, MD (Dermatology)",
    experienceYears: 12,
    avatarInitials: "LN",
    availability: "On Leave",
    locationId: "loc-2",
    rating: 4.9,
    patientsCount: 640,
  },
  {
    id: "doc-4",
    name: "Dr. Farhan Sheikh",
    specialty: "Cardiology",
    qualifications: "MBBS, DM (Cardiology)",
    experienceYears: 15,
    avatarInitials: "FS",
    availability: "Off",
    locationId: "loc-2",
    rating: 4.7,
    patientsCount: 275,
  },
];

export const staff: StaffMember[] = [
  { id: "staff-1", name: "Priya Nambiar", role: "Receptionist", locationId: "loc-1", status: "Active" },
  { id: "staff-2", name: "Suresh Iyer", role: "Nurse", locationId: "loc-1", status: "Active" },
  { id: "staff-3", name: "Divya Shah", role: "Assistant", locationId: "loc-2", status: "Active" },
  { id: "staff-4", name: "Vikram Das", role: "Nurse", locationId: "loc-2", status: "Invited" },
];

const allergy = (substance: string, severity: Allergy["severity"], reaction: string): Allergy => ({
  substance,
  severity,
  reaction,
});

const todayISO = CURRENT_DATE_ISO;
const tomorrowISO = addDaysToISO(todayISO, 1);
const yesterdayISO = addDaysToISO(todayISO, -1);
const twoDaysAgoISO = addDaysToISO(todayISO, -2);
const fourDaysAgoISO = addDaysToISO(todayISO, -4);
const sixDaysAgoISO = addDaysToISO(todayISO, -6);
const eightDaysAgoISO = addDaysToISO(todayISO, -8);
const tenDaysAgoISO = addDaysToISO(todayISO, -10);
const fourteenDaysAgoISO = addDaysToISO(todayISO, -14);
const twentyDaysAgoISO = addDaysToISO(todayISO, -20);
const thirtyDaysAgoISO = addDaysToISO(todayISO, -30);
const ninetyDaysAgoISO = addDaysToISO(todayISO, -90);
const oneYearAgoISO = addDaysToISO(todayISO, -365);
const twoYearsAgoISO = addDaysToISO(todayISO, -730);
const threeYearsAgoISO = addDaysToISO(todayISO, -1095);
const twoDaysFromNowISO = addDaysToISO(todayISO, 2);

export const patients: Patient[] = [
  {
    id: "pat-1",
    mrn: "MRN-10231",
    name: "Ravi Kulkarni",
    age: 54,
    gender: "Male",
    phone: "+91 98450 11223",
    avatarInitials: "RK",
    primaryDoctorId: "doc-1",
    clinicId: "clinic-1",
    bloodGroup: "B+",
    allergies: [allergy("Penicillin", "Severe", "Anaphylaxis")],
    conditions: ["Type 2 Diabetes", "Hypertension"],
    lastVisit: tenDaysAgoISO,
    latestVitals: {
      recordedAt: `${tenDaysAgoISO}T09:15:00`,
      bp: "142/92",
      pulse: 88,
      temp: 98.6,
      spo2: 97,
      weight: 81,
      bmi: 27.4,
    },
    tags: ["Follow-up", "Critical"],
  },
  {
    id: "pat-2",
    mrn: "MRN-10232",
    name: "Ayesha Khan",
    age: 29,
    gender: "Female",
    phone: "+91 90080 44112",
    avatarInitials: "AK",
    primaryDoctorId: "doc-1",
    clinicId: "clinic-1",
    bloodGroup: "O+",
    allergies: [],
    conditions: ["Migraine"],
    lastVisit: sixDaysAgoISO,
    latestVitals: {
      recordedAt: `${sixDaysAgoISO}T11:00:00`,
      bp: "118/76",
      pulse: 72,
      temp: 98.2,
      spo2: 99,
      weight: 58,
      bmi: 21.6,
    },
    tags: ["New"],
  },
  {
    id: "pat-3",
    mrn: "MRN-10233",
    name: "Thomas Varghese",
    age: 67,
    gender: "Male",
    phone: "+91 94480 55321",
    avatarInitials: "TV",
    primaryDoctorId: "doc-1",
    clinicId: "clinic-1",
    bloodGroup: "A-",
    allergies: [allergy("Sulfa drugs", "Moderate", "Skin rash")],
    conditions: ["Coronary Artery Disease", "COPD"],
    lastVisit: fourDaysAgoISO,
    latestVitals: {
      recordedAt: `${fourDaysAgoISO}T15:40:00`,
      bp: "150/95",
      pulse: 96,
      temp: 99.1,
      spo2: 93,
      weight: 74,
      bmi: 25.9,
    },
    tags: ["Critical", "Shared-care"],
  },
  {
    id: "pat-4",
    mrn: "MRN-10234",
    name: "Meera Pillai",
    age: 41,
    gender: "Female",
    phone: "+91 99001 22887",
    avatarInitials: "MP",
    primaryDoctorId: "doc-1",
    clinicId: "clinic-1",
    bloodGroup: "AB+",
    allergies: [],
    conditions: ["Hypothyroidism"],
    lastVisit: twentyDaysAgoISO,
    latestVitals: {
      recordedAt: `${twentyDaysAgoISO}T10:05:00`,
      bp: "122/80",
      pulse: 78,
      temp: 98.4,
      spo2: 98,
      weight: 66,
      bmi: 24.1,
    },
    tags: ["Follow-up"],
  },
  {
    id: "pat-5",
    mrn: "MRN-10235",
    name: "Aarav Shah",
    age: 8,
    gender: "Male",
    phone: "+91 98202 33445",
    avatarInitials: "AS",
    primaryDoctorId: "doc-2",
    clinicId: "clinic-1",
    bloodGroup: "O-",
    allergies: [allergy("Peanuts", "Severe", "Swelling, hives")],
    conditions: ["Asthma"],
    lastVisit: eightDaysAgoISO,
    tags: ["Shared-care"],
  },
  {
    id: "pat-6",
    mrn: "MRN-10236",
    name: "Nisha Reddy",
    age: 35,
    gender: "Female",
    phone: "+91 96633 88120",
    avatarInitials: "NR",
    primaryDoctorId: "doc-1",
    clinicId: "clinic-1",
    bloodGroup: "B-",
    allergies: [],
    conditions: [],
    lastVisit: twoDaysAgoISO,
    latestVitals: {
      recordedAt: `${twoDaysAgoISO}T09:00:00`,
      bp: "116/74",
      pulse: 70,
      temp: 98.1,
      spo2: 99,
      weight: 60,
      bmi: 22.3,
    },
    tags: ["New"],
  },
  {
    id: "pat-7",
    mrn: "HSP-20418",
    name: "Irfan Qureshi",
    age: 59,
    gender: "Male",
    phone: "+91 98860 44510",
    avatarInitials: "IQ",
    primaryDoctorId: "doc-1",
    workContexts: ["hospital"],
    bloodGroup: "A+",
    allergies: [allergy("Contrast dye", "Moderate", "Hives")],
    conditions: ["Post angioplasty review", "Hypertension"],
    lastVisit: CURRENT_DATE_ISO,
    latestVitals: {
      recordedAt: `${CURRENT_DATE_ISO}T17:20:00`,
      bp: "136/84",
      pulse: 82,
      temp: 98.5,
      spo2: 96,
      weight: 78,
      bmi: 26.1,
    },
    tags: ["Critical", "Shared-care"],
  },
];

export const appointments: Appointment[] = [
  { id: "apt-1", patientId: "pat-1", doctorId: "doc-1", locationId: "loc-1", date: todayISO, time: "09:00 AM", durationMins: 20, type: "In-Person", status: "Checked In", reason: "Diabetes follow-up" },
  { id: "apt-2", patientId: "pat-2", doctorId: "doc-1", locationId: "loc-1", date: todayISO, time: "09:30 AM", durationMins: 15, type: "Video", status: "Scheduled", reason: "Migraine review" },
  { id: "apt-3", patientId: "pat-3", doctorId: "doc-1", locationId: "loc-1", date: todayISO, time: "10:00 AM", durationMins: 30, type: "In-Person", status: "Scheduled", reason: "Chest pain evaluation" },
  { id: "apt-4", patientId: "pat-4", doctorId: "doc-1", locationId: "loc-1", date: todayISO, time: "10:45 AM", durationMins: 15, type: "Follow-up", status: "Scheduled", reason: "Thyroid panel review" },
  { id: "apt-5", patientId: "pat-6", doctorId: "doc-1", locationId: "loc-1", date: todayISO, time: "11:15 AM", durationMins: 20, type: "In-Person", status: "In Consultation", reason: "General checkup" },
  { id: "apt-6", patientId: "pat-5", doctorId: "doc-2", locationId: "loc-1", date: todayISO, time: "09:15 AM", durationMins: 15, type: "In-Person", status: "Checked In", reason: "Asthma review" },
  { id: "apt-7", patientId: "pat-1", doctorId: "doc-1", locationId: "loc-1", date: tenDaysAgoISO, time: "09:00 AM", durationMins: 20, type: "In-Person", status: "Completed", reason: "Routine follow-up" },
  { id: "apt-8", patientId: "pat-4", doctorId: "doc-1", locationId: "loc-1", date: twoDaysFromNowISO, time: "04:00 PM", durationMins: 15, type: "Video", status: "Scheduled", reason: "Lab results discussion" },
  { id: "apt-9", patientId: "pat-7", doctorId: "doc-1", locationId: "hosp-1", workContext: "hospital", date: todayISO, time: "06:00 PM", durationMins: 30, type: "In-Person", status: "Scheduled", reason: "Post-angioplasty ward review" },
  { id: "apt-10", patientId: "pat-7", doctorId: "doc-1", locationId: "hosp-1", workContext: "hospital", date: tomorrowISO, time: "07:30 AM", durationMins: 20, type: "In-Person", status: "Scheduled", reason: "Morning discharge clearance" },
];

export const diagnoses: DiagnosisEntry[] = [
  { id: "dx-1", patientId: "pat-1", icdCode: "E11.9", description: "Type 2 diabetes mellitus without complications", diagnosedOn: twoYearsAgoISO, status: "Chronic", doctorId: "doc-1" },
  { id: "dx-2", patientId: "pat-1", icdCode: "I10", description: "Essential (primary) hypertension", diagnosedOn: twoYearsAgoISO, status: "Chronic", doctorId: "doc-1" },
  { id: "dx-3", patientId: "pat-3", icdCode: "I25.10", description: "Atherosclerotic heart disease of native coronary artery", diagnosedOn: threeYearsAgoISO, status: "Chronic", doctorId: "doc-1" },
  { id: "dx-4", patientId: "pat-3", icdCode: "J44.9", description: "Chronic obstructive pulmonary disease, unspecified", diagnosedOn: oneYearAgoISO, status: "Active", doctorId: "doc-1" },
  { id: "dx-5", patientId: "pat-2", icdCode: "G43.909", description: "Migraine, unspecified, not intractable", diagnosedOn: ninetyDaysAgoISO, status: "Active", doctorId: "doc-1" },
  { id: "dx-6", patientId: "pat-4", icdCode: "E03.9", description: "Hypothyroidism, unspecified", diagnosedOn: oneYearAgoISO, status: "Chronic", doctorId: "doc-1" },
  { id: "dx-7", patientId: "pat-7", icdCode: "Z95.5", description: "Presence of coronary angioplasty implant and graft", diagnosedOn: CURRENT_DATE_ISO, status: "Active", doctorId: "doc-1", workContext: "hospital" },
];

export const prescriptions: Prescription[] = [
  {
    id: "rx-1",
    patientId: "pat-1",
    doctorId: "doc-1",
    date: tenDaysAgoISO,
    medicines: [
      { id: "m1", name: "Metformin", dosage: "500mg", frequency: "1-0-1", duration: "30 days", instructions: "After meals" },
      { id: "m2", name: "Amlodipine", dosage: "5mg", frequency: "1-0-0", duration: "30 days", instructions: "Morning, before breakfast" },
    ],
    advice: "Low-sodium diet, 30 min walk daily, recheck BP in 2 weeks.",
    status: "Active",
  },
  {
    id: "rx-2",
    patientId: "pat-2",
    doctorId: "doc-1",
    date: thirtyDaysAgoISO,
    medicines: [
      { id: "m3", name: "Sumatriptan", dosage: "50mg", frequency: "SOS", duration: "As needed", instructions: "At onset of migraine, max 2/day" },
    ],
    advice: "Maintain headache diary, avoid trigger foods.",
    status: "Completed",
  },
  {
    id: "rx-3",
    patientId: "pat-3",
    doctorId: "doc-1",
    date: fourDaysAgoISO,
    medicines: [
      { id: "m4", name: "Atorvastatin", dosage: "20mg", frequency: "0-0-1", duration: "90 days", instructions: "At night" },
      { id: "m5", name: "Aspirin", dosage: "75mg", frequency: "1-0-0", duration: "90 days", instructions: "After breakfast" },
      { id: "m6", name: "Salbutamol Inhaler", dosage: "100mcg", frequency: "SOS", duration: "As needed", instructions: "2 puffs for breathlessness" },
    ],
    advice: "Pulmonology referral for COPD reassessment.",
    status: "Active",
  },
  {
    id: "rx-4",
    patientId: "pat-7",
    doctorId: "doc-1",
    date: CURRENT_DATE_ISO,
    medicines: [
      { id: "m7", name: "Clopidogrel", dosage: "75mg", frequency: "1-0-0", duration: "90 days", instructions: "After breakfast" },
      { id: "m8", name: "Pantoprazole", dosage: "40mg", frequency: "1-0-0", duration: "14 days", instructions: "Before breakfast" },
    ],
    advice: "Continue cardiac diet, report chest pain immediately, review before discharge.",
    status: "Active",
    workContext: "hospital",
  },
];

export const labOrders: LabOrder[] = [
  { id: "lab-1", patientId: "pat-1", doctorId: "doc-1", testName: "HbA1c", orderedOn: tenDaysAgoISO, status: "Report Ready", source: "Internal", priority: "Routine" },
  { id: "lab-2", patientId: "pat-1", doctorId: "doc-1", testName: "Lipid Profile", orderedOn: tenDaysAgoISO, status: "In Progress", source: "Internal", priority: "Routine" },
  { id: "lab-3", patientId: "pat-3", doctorId: "doc-1", testName: "Troponin-I", orderedOn: fourDaysAgoISO, status: "Report Ready", source: "Partner Lab", priority: "Urgent" },
  { id: "lab-4", patientId: "pat-3", doctorId: "doc-1", testName: "BNP", orderedOn: fourDaysAgoISO, status: "Sample Collected", source: "Partner Lab", priority: "Urgent" },
  { id: "lab-5", patientId: "pat-4", doctorId: "doc-1", testName: "TSH, Free T4", orderedOn: twentyDaysAgoISO, status: "Reviewed", source: "Internal", priority: "Routine" },
  { id: "lab-6", patientId: "pat-6", doctorId: "doc-1", testName: "Complete Blood Count", orderedOn: twoDaysAgoISO, status: "Ordered", source: "External / Manual", priority: "Routine" },
  { id: "lab-7", patientId: "pat-7", doctorId: "doc-1", testName: "Cardiac Enzymes Panel", orderedOn: CURRENT_DATE_ISO, status: "Report Ready", source: "Partner Lab", priority: "Urgent", workContext: "hospital" },
];

export const radiologyOrders: RadiologyOrder[] = [
  { id: "rad-1", patientId: "pat-3", doctorId: "doc-1", imagingType: "CT Scan", bodyRegion: "Chest (Coronary CTA)", orderedOn: fourDaysAgoISO, status: "In Progress", priority: "Urgent" },
  { id: "rad-2", patientId: "pat-1", doctorId: "doc-1", imagingType: "Ultrasound", bodyRegion: "Abdomen", orderedOn: thirtyDaysAgoISO, status: "Report Ready", priority: "Routine" },
  { id: "rad-3", patientId: "pat-4", doctorId: "doc-1", imagingType: "Ultrasound", bodyRegion: "Thyroid", orderedOn: twentyDaysAgoISO, status: "Reviewed", priority: "Routine" },
  { id: "rad-4", patientId: "pat-7", doctorId: "doc-1", imagingType: "X-Ray", bodyRegion: "Chest portable", orderedOn: CURRENT_DATE_ISO, status: "Report Ready", priority: "Urgent", workContext: "hospital" },
];

export const followUps: FollowUp[] = [
  { id: "fu-1", patientId: "pat-1", doctorId: "doc-1", dueDate: twoDaysFromNowISO, reason: "BP & glucose recheck", status: "Upcoming" },
  { id: "fu-2", patientId: "pat-3", doctorId: "doc-1", dueDate: CURRENT_DATE_ISO, reason: "Cardiology results review", status: "Due Today" },
  { id: "fu-3", patientId: "pat-4", doctorId: "doc-1", dueDate: yesterdayISO, reason: "Thyroid dose titration", status: "Overdue" },
  { id: "fu-4", patientId: "pat-2", doctorId: "doc-1", dueDate: fourteenDaysAgoISO, reason: "Migraine frequency check", status: "Completed" },
  { id: "fu-5", patientId: "pat-7", doctorId: "doc-1", dueDate: CURRENT_DATE_ISO, reason: "Discharge medication reconciliation", status: "Due Today", workContext: "hospital" },
];

export const clinicalAlerts: ClinicalAlert[] = [
  { id: "al-1", severity: "Critical", category: "Abnormal Report", patientId: "pat-3", message: "Troponin-I result flagged high — Thomas Varghese", time: "08:42 AM", acknowledged: false },
  { id: "al-2", severity: "Warning", category: "Allergy", patientId: "pat-1", message: "Severe Penicillin allergy on file — verify before prescribing", time: "Yesterday", acknowledged: false },
  { id: "al-3", severity: "Info", category: "Task", message: "3 follow-ups due this week require scheduling", time: "Yesterday", acknowledged: true },
  { id: "al-4", severity: "Critical", category: "Emergency", patientId: "pat-5", message: "Patient chat flagged possible severe allergic reaction", time: "2 days ago", acknowledged: true },
  { id: "al-5", severity: "Warning", category: "Abnormal Report", patientId: "pat-7", message: "Cardiac enzymes report ready for Irfan Qureshi", time: "12 min ago", acknowledged: false, workContext: "hospital" },
];

export const consultationNotes: ConsultationNote[] = [
  {
    id: "cn-1",
    patientId: "pat-1",
    doctorId: "doc-1",
    date: tenDaysAgoISO,
    chiefComplaint: "Follow-up for diabetes and hypertension",
    symptoms: ["Fatigue", "Occasional dizziness"],
    observations: "BP elevated at 142/92. No pedal edema. Fundus exam pending.",
    diagnosis: "Type 2 diabetes mellitus, essential hypertension — suboptimal control",
    plan: "Adjust antihypertensive, reinforce lifestyle changes, recheck in 2 weeks.",
    status: "Finalized",
  },
  {
    id: "cn-2",
    patientId: "pat-6",
    doctorId: "doc-1",
    date: todayISO,
    chiefComplaint: "General wellness checkup",
    symptoms: [],
    observations: "Vitals within normal range.",
    diagnosis: "",
    plan: "",
    status: "Draft",
  },
  {
    id: "cn-3",
    patientId: "pat-7",
    doctorId: "doc-1",
    date: todayISO,
    chiefComplaint: "Post-procedure hospital review",
    symptoms: ["Mild chest tightness"],
    observations: "Stable after angioplasty. No acute distress. Monitor enzymes before discharge.",
    diagnosis: "Post angioplasty recovery",
    plan: "Review reports, reconcile medications, discharge if stable tomorrow morning.",
    status: "Draft",
    workContext: "hospital",
  },
];

export const conversations: Conversation[] = [
  { id: "conv-1", withName: "Ravi Kulkarni", withRole: "Patient", lastMessage: "Should I take the BP medicine before or after food?", time: "10 min ago", unread: 2 },
  { id: "conv-2", withName: "Suresh Iyer", withRole: "Nurse", lastMessage: "Vitals updated for room 3, ready for you.", time: "25 min ago", unread: 1 },
  { id: "conv-3", withName: "Apollo Diagnostics (Partner Lab)", withRole: "Lab", lastMessage: "Troponin-I report uploaded for Thomas Varghese.", time: "1 hr ago", unread: 0 },
  { id: "conv-4", withName: "Dr. Karan Mehta", withRole: "Doctor", lastMessage: "Can you review Aarav Shah's inhaler technique next visit?", time: "3 hrs ago", unread: 0 },
  { id: "conv-5", withName: "MedPlus Pharmacy", withRole: "Pharmacist", lastMessage: "Confirmed stock for Atorvastatin 20mg.", time: "Yesterday", unread: 0 },
];

export const tasks: Task[] = [
  { id: "tk-1", title: "Review Troponin-I result for Thomas Varghese", ownerName: "Dr. Ananya Rao", dueDate: todayISO, priority: "High", status: "Open" },
  { id: "tk-2", title: "Sign off draft consultation note — Nisha Reddy", ownerName: "Dr. Ananya Rao", dueDate: todayISO, priority: "Medium", status: "In Progress" },
  { id: "tk-3", title: "Call Meera Pillai — overdue thyroid follow-up", ownerName: "Priya Nambiar", dueDate: yesterdayISO, priority: "Medium", status: "Open" },
  { id: "tk-4", title: "Verify allergy flag before dispensing Rx", ownerName: "Suresh Iyer", dueDate: todayISO, priority: "High", status: "Done" },
  { id: "tk-5", title: "Review hospital discharge checklist - Irfan Qureshi", ownerName: "Dr. Ananya Rao", dueDate: todayISO, priority: "High", status: "Open", workContext: "hospital" },
];

export function getPatient(id: string) {
  return patients.find((p) => p.id === id);
}
export function getDoctor(id: string) {
  return doctors.find((d) => d.id === id);
}
export function getLocation(id?: string) {
  return clinic.locations.find((l) => l.id === id);
}

export function matchesWorkContext(item: { workContext?: WorkContext }, workContext: WorkContext) {
  return (item.workContext ?? "clinic") === workContext;
}

export function patientInWorkContext(patient: Patient, workContext: WorkContext) {
  return patient.workContexts?.includes(workContext) ?? workContext === "clinic";
}
