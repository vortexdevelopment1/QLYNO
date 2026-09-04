import {
  Organization,
  StaffUser,
  Patient,
  Encounter,
  ServiceCatalogItem,
  PendingBillingItem,
  Payer,
  Invoice,
  Payment,
  Receipt,
  Discount,
  Refund,
  InsuranceClaim,
  AuditLogEntry,
  NotificationItem,
  ReconciliationRecord,
  DashboardAlert,
  DEFAULT_STAFF_PERMISSIONS,
  ADMIN_PERMISSIONS,
} from "@/billing-staff/types";

// ============================================================================
// ORGANIZATIONS
// ============================================================================
export const organizations: Organization[] = [
  { id: "org-solo", name: "Dr. Ananya Rao — Family Clinic", type: "solo_doctor", city: "Pune", insuranceEnabled: false },
  { id: "org-clinic", name: "Sanjeevani Multispecialty Clinic", type: "clinic", city: "Bengaluru", insuranceEnabled: true },
  { id: "org-hospital", name: "Vardhman Hospital", type: "hospital", city: "Mumbai", insuranceEnabled: true },
];

// ============================================================================
// PAYERS
// ============================================================================
export const payers: Payer[] = [
  { id: "payer-self", type: "self", name: "Self Pay" },
  { id: "payer-star", type: "insurance", name: "Star Health Insurance", contact: "claims@starhealth.example" },
  { id: "payer-hdfc", type: "insurance", name: "HDFC ERGO Health", contact: "claims@hdfcergo.example" },
  { id: "payer-niva", type: "insurance", name: "Niva Bupa Health", contact: "claims@nivabupa.example" },
  { id: "payer-infosys", type: "corporate", name: "Infosys Corporate Health Plan", contact: "hr-health@infosys.example" },
];

// ============================================================================
// STAFF USERS (per organization)
// ============================================================================
export const staffUsers: StaffUser[] = [
  // Solo doctor — one active billing assignment
  {
    id: "staff-solo-1",
    name: "Meera Joshi",
    email: "meera.joshi@qlyno-demo.in",
    phone: "+91 98200 11223",
    organizationId: "org-solo",
    role: "billing_staff",
    status: "active",
    scopes: [],
    permissions: { ...DEFAULT_STAFF_PERMISSIONS, financialReports: true },
    assignedDate: "2025-01-10",
  },
  // Clinic — one active billing assignment
  {
    id: "staff-clinic-1",
    name: "Ravi Kulkarni",
    email: "ravi.kulkarni@qlyno-demo.in",
    phone: "+91 98450 33221",
    organizationId: "org-clinic",
    role: "billing_staff",
    status: "active",
    scopes: [],
    permissions: { ...DEFAULT_STAFF_PERMISSIONS, financialReports: true, insuranceTpa: true },
    assignedDate: "2024-11-02",
  },
  // Hospital — multiple staff, multiple scopes
  {
    id: "staff-hosp-central",
    name: "Priya Menon",
    email: "priya.menon@qlyno-demo.in",
    phone: "+91 90040 11111",
    organizationId: "org-hospital",
    role: "billing_admin",
    status: "active",
    scopes: ["central"],
    permissions: ADMIN_PERMISSIONS,
    assignedDate: "2023-06-01",
  },
  {
    id: "staff-hosp-opd",
    name: "Arjun Nair",
    email: "arjun.nair@qlyno-demo.in",
    phone: "+91 90040 22222",
    organizationId: "org-hospital",
    role: "billing_staff",
    status: "active",
    scopes: ["opd"],
    permissions: { ...DEFAULT_STAFF_PERMISSIONS },
    assignedDate: "2024-02-14",
  },
  {
    id: "staff-hosp-ipd",
    name: "Sneha Kulkarni",
    email: "sneha.kulkarni@qlyno-demo.in",
    phone: "+91 90040 33333",
    organizationId: "org-hospital",
    role: "billing_staff",
    status: "active",
    scopes: ["ipd", "surgery"],
    permissions: { ...DEFAULT_STAFF_PERMISSIONS, applyHighDiscount: false },
    assignedDate: "2024-05-20",
  },
  {
    id: "staff-hosp-diag",
    name: "Kabir Sheikh",
    email: "kabir.sheikh@qlyno-demo.in",
    phone: "+91 90040 44444",
    organizationId: "org-hospital",
    role: "billing_staff",
    status: "active",
    scopes: ["diagnostics", "pharmacy"],
    permissions: { ...DEFAULT_STAFF_PERMISSIONS },
    assignedDate: "2024-07-09",
  },
  {
    id: "staff-hosp-insurance",
    name: "Farah Ansari",
    email: "farah.ansari@qlyno-demo.in",
    phone: "+91 90040 55555",
    organizationId: "org-hospital",
    role: "billing_staff",
    status: "active",
    scopes: ["insurance_tpa"],
    permissions: { ...DEFAULT_STAFF_PERMISSIONS, insuranceTpa: true, financialReports: true },
    assignedDate: "2024-01-15",
  },
  {
    id: "staff-hosp-refund",
    name: "Devika Iyer",
    email: "devika.iyer@qlyno-demo.in",
    phone: "+91 90040 66666",
    organizationId: "org-hospital",
    role: "billing_staff",
    status: "active",
    scopes: ["refund_desk"],
    permissions: { ...DEFAULT_STAFF_PERMISSIONS, approveRefund: true },
    assignedDate: "2024-03-01",
  },
  {
    id: "staff-hosp-invited",
    name: "Yusuf Khan",
    email: "yusuf.khan@qlyno-demo.in",
    phone: "+91 90040 77777",
    organizationId: "org-hospital",
    role: "billing_staff",
    status: "invited",
    scopes: ["opd"],
    permissions: { ...DEFAULT_STAFF_PERMISSIONS },
    assignedDate: "2026-08-15",
  },
  {
    id: "staff-hosp-suspended",
    name: "Rohit Bhatia",
    email: "rohit.bhatia@qlyno-demo.in",
    phone: "+91 90040 88888",
    organizationId: "org-hospital",
    role: "billing_staff",
    status: "suspended",
    scopes: ["pharmacy"],
    permissions: { ...DEFAULT_STAFF_PERMISSIONS },
    assignedDate: "2023-09-01",
  },
];

// ============================================================================
// SERVICE CATALOG
// ============================================================================
export const serviceCatalog: ServiceCatalogItem[] = [
  { id: "svc-consult-solo", name: "General Consultation", category: "consultation", rate: 600, taxPercent: 0, organizationId: "org-solo" },
  { id: "svc-followup-solo", name: "Follow-up Consultation", category: "consultation", rate: 300, taxPercent: 0, organizationId: "org-solo" },
  { id: "svc-dressing-solo", name: "Minor Procedure — Dressing", category: "other", rate: 250, taxPercent: 0, organizationId: "org-solo" },

  { id: "svc-consult-clinic", name: "Specialist Consultation", category: "consultation", rate: 900, taxPercent: 0, organizationId: "org-clinic" },
  { id: "svc-ecg-clinic", name: "ECG", category: "diagnostics", rate: 450, taxPercent: 5, organizationId: "org-clinic" },
  { id: "svc-bloodtest-clinic", name: "Complete Blood Count", category: "diagnostics", rate: 550, taxPercent: 5, organizationId: "org-clinic" },
  { id: "svc-physio-clinic", name: "Physiotherapy Session", category: "other", rate: 700, taxPercent: 0, organizationId: "org-clinic" },
  { id: "svc-pharmacy-clinic", name: "Pharmacy Dispensing", category: "pharmacy", rate: 1200, taxPercent: 12, organizationId: "org-clinic" },

  { id: "svc-opd-hosp", name: "OPD Consultation — Cardiology", category: "opd", rate: 1200, taxPercent: 0, organizationId: "org-hospital" },
  { id: "svc-room-hosp", name: "Private Room (per day)", category: "ipd", rate: 4500, taxPercent: 0, organizationId: "org-hospital" },
  { id: "svc-nursing-hosp", name: "Nursing Charges (per day)", category: "ipd", rate: 800, taxPercent: 0, organizationId: "org-hospital" },
  { id: "svc-surgery-hosp", name: "Laparoscopic Surgery", category: "surgery", rate: 85000, taxPercent: 0, organizationId: "org-hospital" },
  { id: "svc-ot-hosp", name: "OT Charges", category: "surgery", rate: 15000, taxPercent: 0, organizationId: "org-hospital" },
  { id: "svc-mri-hosp", name: "MRI Scan — Brain", category: "diagnostics", rate: 6500, taxPercent: 5, organizationId: "org-hospital" },
  { id: "svc-xray-hosp", name: "X-Ray — Chest", category: "diagnostics", rate: 500, taxPercent: 5, organizationId: "org-hospital" },
  { id: "svc-pharmacy-hosp", name: "Inpatient Pharmacy Charges", category: "pharmacy", rate: 3200, taxPercent: 12, organizationId: "org-hospital" },
];

// ============================================================================
// PATIENTS
// ============================================================================
export const patients: Patient[] = [
  { id: "pat-1", uhid: "SOLO-00124", name: "Ramesh Kulkarni", age: 54, gender: "Male", phone: "+91 98220 10011", organizationId: "org-solo" },
  { id: "pat-2", uhid: "SOLO-00125", name: "Sunita Deshmukh", age: 41, gender: "Female", phone: "+91 98220 10022", organizationId: "org-solo" },
  { id: "pat-3", uhid: "SOLO-00126", name: "Aditya Pawar", age: 29, gender: "Male", phone: "+91 98220 10033", organizationId: "org-solo" },

  { id: "pat-4", uhid: "SMC-00981", name: "Kavya Reddy", age: 33, gender: "Female", phone: "+91 99010 20011", organizationId: "org-clinic" },
  { id: "pat-5", uhid: "SMC-00982", name: "Manoj Hegde", age: 47, gender: "Male", phone: "+91 99010 20022", organizationId: "org-clinic" },
  { id: "pat-6", uhid: "SMC-00983", name: "Divya Shastri", age: 38, gender: "Female", phone: "+91 99010 20033", organizationId: "org-clinic" },
  { id: "pat-7", uhid: "SMC-00984", name: "Naveen Gowda", age: 60, gender: "Male", phone: "+91 99010 20044", organizationId: "org-clinic" },

  { id: "pat-8", uhid: "VH-100234", name: "Sameer Khan", age: 45, gender: "Male", phone: "+91 90210 30011", organizationId: "org-hospital" },
  { id: "pat-9", uhid: "VH-100235", name: "Ritu Chawla", age: 62, gender: "Female", phone: "+91 90210 30022", organizationId: "org-hospital" },
  { id: "pat-10", uhid: "VH-100236", name: "Faisal Ahmed", age: 51, gender: "Male", phone: "+91 90210 30033", organizationId: "org-hospital" },
  { id: "pat-11", uhid: "VH-100237", name: "Nandini Rao", age: 34, gender: "Female", phone: "+91 90210 30044", organizationId: "org-hospital" },
  { id: "pat-12", uhid: "VH-100238", name: "Vikram Singh", age: 58, gender: "Male", phone: "+91 90210 30055", organizationId: "org-hospital" },
  { id: "pat-13", uhid: "VH-100239", name: "Anjali Bhatt", age: 27, gender: "Female", phone: "+91 90210 30066", organizationId: "org-hospital" },
];

// ============================================================================
// ENCOUNTERS
// ============================================================================
export const encounters: Encounter[] = [
  { id: "enc-1", patientId: "pat-1", type: "consultation", department: "General Medicine", doctorName: "Dr. Ananya Rao", date: "2026-08-20", status: "completed" },
  { id: "enc-2", patientId: "pat-2", type: "consultation", department: "General Medicine", doctorName: "Dr. Ananya Rao", date: "2026-08-21", status: "completed" },
  { id: "enc-3", patientId: "pat-3", type: "consultation", department: "General Medicine", doctorName: "Dr. Ananya Rao", date: "2026-08-22", status: "active" },

  { id: "enc-4", patientId: "pat-4", type: "consultation", department: "Cardiology", doctorName: "Dr. Suresh Iyer", date: "2026-08-19", status: "completed" },
  { id: "enc-5", patientId: "pat-5", type: "diagnostics", department: "Pathology", doctorName: "Dr. Suresh Iyer", date: "2026-08-20", status: "completed" },
  { id: "enc-6", patientId: "pat-6", type: "consultation", department: "Orthopedics", doctorName: "Dr. Lata Menon", date: "2026-08-21", status: "completed" },
  { id: "enc-7", patientId: "pat-7", type: "pharmacy", department: "Pharmacy", date: "2026-08-22", status: "active" },

  { id: "enc-8", patientId: "pat-8", type: "opd", department: "Cardiology", doctorName: "Dr. Rakesh Malhotra", date: "2026-08-18", status: "completed" },
  {
    id: "enc-9",
    patientId: "pat-9",
    type: "ipd",
    department: "General Ward",
    doctorName: "Dr. Sunita Verma",
    date: "2026-08-15",
    admissionId: "ADM-4521",
    roomBed: "Room 302-B",
    status: "active",
  },
  { id: "enc-10", patientId: "pat-10", type: "diagnostics", department: "Radiology", doctorName: "Dr. Rakesh Malhotra", date: "2026-08-21", status: "completed" },
  {
    id: "enc-11",
    patientId: "pat-11",
    type: "surgery",
    department: "Surgery",
    doctorName: "Dr. Nikhil Kapoor",
    date: "2026-08-19",
    admissionId: "ADM-4522",
    roomBed: "Room 210-A",
    status: "active",
  },
  { id: "enc-12", patientId: "pat-12", type: "opd", department: "Nephrology", doctorName: "Dr. Sunita Verma", date: "2026-08-22", status: "completed" },
  {
    id: "enc-13",
    patientId: "pat-13",
    type: "ipd",
    department: "Maternity Ward",
    doctorName: "Dr. Kavita Rao",
    date: "2026-08-17",
    admissionId: "ADM-4523",
    roomBed: "Room 118-C",
    status: "discharged",
  },
];

// ============================================================================
// PENDING BILLING (billable events awaiting invoice creation)
// ============================================================================
export const pendingBillingItems: PendingBillingItem[] = [
  { id: "pend-1", patientId: "pat-3", encounterId: "enc-3", serviceId: "svc-consult-solo", source: "doctor_opd", date: "2026-08-22", amount: 600, status: "pending", organizationId: "org-solo", scope: "central" },
  { id: "pend-2", patientId: "pat-7", encounterId: "enc-7", serviceId: "svc-pharmacy-clinic", source: "pharmacy", date: "2026-08-22", amount: 1200, status: "pending", organizationId: "org-clinic", scope: "central" },
  { id: "pend-3", patientId: "pat-6", encounterId: "enc-6", serviceId: "svc-physio-clinic", source: "doctor_opd", date: "2026-08-21", amount: 700, status: "pending", organizationId: "org-clinic", scope: "central" },
  { id: "pend-4", patientId: "pat-12", encounterId: "enc-12", serviceId: "svc-opd-hosp", source: "doctor_opd", date: "2026-08-22", amount: 1200, status: "pending", organizationId: "org-hospital", scope: "opd" },
  { id: "pend-5", patientId: "pat-10", encounterId: "enc-10", serviceId: "svc-xray-hosp", source: "diagnostics", date: "2026-08-21", amount: 500, status: "pending", organizationId: "org-hospital", scope: "diagnostics" },
  { id: "pend-6", patientId: "pat-9", encounterId: "enc-9", serviceId: "svc-nursing-hosp", source: "ipd", date: "2026-08-22", amount: 800, status: "pending", organizationId: "org-hospital", scope: "ipd" },
  { id: "pend-7", patientId: "pat-11", encounterId: "enc-11", serviceId: "svc-ot-hosp", source: "surgery", date: "2026-08-19", amount: 15000, status: "pending", organizationId: "org-hospital", scope: "surgery" },
];

// ============================================================================
// INVOICES  (covers demo scenarios 1,2,3,4,5,6,7,8)
// ============================================================================
export const invoices: Invoice[] = [
  // Scenario 1: new bill from consultation (solo doctor, paid)
  {
    id: "inv-1", invoiceNumber: "SOLO-INV-2026-0041", patientId: "pat-1", encounterId: "enc-1",
    organizationId: "org-solo", scope: "central", date: "2026-08-20", status: "paid",
    lineItems: [{ id: "li-1", serviceId: "svc-consult-solo", serviceName: "General Consultation", source: "doctor_opd", quantity: 1, rate: 600, discountAmount: 0, taxAmount: 0, total: 600 }],
    subtotal: 600, discountTotal: 0, taxTotal: 0, total: 600, paidTotal: 600, outstanding: 0,
    payerId: "payer-self", createdBy: "Meera Joshi", createdAt: "2026-08-20T09:15:00", finalizedBy: "Meera Joshi", finalizedAt: "2026-08-20T09:16:00",
  },
  // Scenario 6: outstanding invoice (solo doctor)
  {
    id: "inv-2", invoiceNumber: "SOLO-INV-2026-0042", patientId: "pat-2", encounterId: "enc-2",
    organizationId: "org-solo", scope: "central", date: "2026-08-21", status: "issued",
    lineItems: [{ id: "li-2", serviceId: "svc-consult-solo", serviceName: "General Consultation", source: "doctor_opd", quantity: 1, rate: 600, discountAmount: 0, taxAmount: 0, total: 600 }],
    subtotal: 600, discountTotal: 0, taxTotal: 0, total: 600, paidTotal: 0, outstanding: 600,
    payerId: "payer-self", createdBy: "Meera Joshi", createdAt: "2026-08-21T11:00:00", finalizedBy: "Meera Joshi", finalizedAt: "2026-08-21T11:01:00",
  },
  // Draft invoice (solo doctor)
  {
    id: "inv-3", invoiceNumber: "SOLO-INV-2026-0043", patientId: "pat-3", encounterId: "enc-3",
    organizationId: "org-solo", scope: "central", date: "2026-08-22", status: "draft",
    lineItems: [{ id: "li-3", serviceId: "svc-consult-solo", serviceName: "General Consultation", source: "doctor_opd", quantity: 1, rate: 600, discountAmount: 0, taxAmount: 0, total: 600 }],
    subtotal: 600, discountTotal: 0, taxTotal: 0, total: 600, paidTotal: 0, outstanding: 600,
    payerId: "payer-self", createdBy: "Meera Joshi", createdAt: "2026-08-22T08:30:00",
  },

  // Scenario 2: invoice with multiple services (clinic)
  {
    id: "inv-4", invoiceNumber: "SMC-INV-2026-0210", patientId: "pat-4", encounterId: "enc-4",
    organizationId: "org-clinic", scope: "central", date: "2026-08-19", status: "paid",
    lineItems: [
      { id: "li-4a", serviceId: "svc-consult-clinic", serviceName: "Specialist Consultation", source: "doctor_opd", quantity: 1, rate: 900, discountAmount: 0, taxAmount: 0, total: 900 },
      { id: "li-4b", serviceId: "svc-ecg-clinic", serviceName: "ECG", source: "diagnostics", quantity: 1, rate: 450, discountAmount: 0, taxAmount: 22.5, total: 472.5 },
      { id: "li-4c", serviceId: "svc-bloodtest-clinic", serviceName: "Complete Blood Count", source: "diagnostics", quantity: 1, rate: 550, discountAmount: 0, taxAmount: 27.5, total: 577.5 },
    ],
    subtotal: 1900, discountTotal: 0, taxTotal: 50, total: 1950, paidTotal: 1950, outstanding: 0,
    payerId: "payer-self", createdBy: "Ravi Kulkarni", createdAt: "2026-08-19T10:00:00", finalizedBy: "Ravi Kulkarni", finalizedAt: "2026-08-19T10:05:00",
  },
  // Scenario 4 + 5: partial then completing payment (clinic)
  {
    id: "inv-5", invoiceNumber: "SMC-INV-2026-0211", patientId: "pat-5", encounterId: "enc-5",
    organizationId: "org-clinic", scope: "central", date: "2026-08-20", status: "partially_paid",
    lineItems: [
      { id: "li-5a", serviceId: "svc-consult-clinic", serviceName: "Specialist Consultation", source: "doctor_opd", quantity: 1, rate: 900, discountAmount: 0, taxAmount: 0, total: 900 },
      { id: "li-5b", serviceId: "svc-bloodtest-clinic", serviceName: "Complete Blood Count", source: "diagnostics", quantity: 2, rate: 550, discountAmount: 0, taxAmount: 55, total: 1155 },
    ],
    subtotal: 2000, discountTotal: 0, taxTotal: 55, total: 2055, paidTotal: 1000, outstanding: 1055,
    payerId: "payer-self", createdBy: "Ravi Kulkarni", createdAt: "2026-08-20T09:30:00", finalizedBy: "Ravi Kulkarni", finalizedAt: "2026-08-20T09:32:00",
  },
  // Scenario 7: normal discount applied (clinic)
  {
    id: "inv-6", invoiceNumber: "SMC-INV-2026-0212", patientId: "pat-6", encounterId: "enc-6",
    organizationId: "org-clinic", scope: "central", date: "2026-08-21", status: "paid",
    lineItems: [{ id: "li-6", serviceId: "svc-physio-clinic", serviceName: "Physiotherapy Session", source: "doctor_opd", quantity: 1, rate: 700, discountAmount: 70, taxAmount: 0, total: 630 }],
    subtotal: 700, discountTotal: 70, taxTotal: 0, total: 630, paidTotal: 630, outstanding: 0,
    payerId: "payer-self", createdBy: "Ravi Kulkarni", createdAt: "2026-08-21T14:00:00", finalizedBy: "Ravi Kulkarni", finalizedAt: "2026-08-21T14:02:00",
  },
  // Insurance invoice — pending verification (clinic)
  {
    id: "inv-7", invoiceNumber: "SMC-INV-2026-0213", patientId: "pat-7", encounterId: "enc-7",
    organizationId: "org-clinic", scope: "central", date: "2026-08-22", status: "issued",
    lineItems: [{ id: "li-7", serviceId: "svc-pharmacy-clinic", serviceName: "Pharmacy Dispensing", source: "pharmacy", quantity: 1, rate: 1200, discountAmount: 0, taxAmount: 144, total: 1344 }],
    subtotal: 1200, discountTotal: 0, taxTotal: 144, total: 1344, paidTotal: 0, outstanding: 1344,
    payerId: "payer-star", createdBy: "Ravi Kulkarni", createdAt: "2026-08-22T10:15:00", finalizedBy: "Ravi Kulkarni", finalizedAt: "2026-08-22T10:16:00",
  },

  // Hospital: Scenario 8 high discount requiring approval (OPD)
  {
    id: "inv-8", invoiceNumber: "VH-INV-2026-3301", patientId: "pat-12", encounterId: "enc-12",
    organizationId: "org-hospital", scope: "opd", date: "2026-08-22", status: "issued",
    lineItems: [{ id: "li-8", serviceId: "svc-opd-hosp", serviceName: "OPD Consultation — Cardiology", source: "doctor_opd", quantity: 1, rate: 1200, discountAmount: 360, taxAmount: 0, total: 840 }],
    subtotal: 1200, discountTotal: 360, taxTotal: 0, total: 840, paidTotal: 0, outstanding: 840,
    payerId: "payer-self", createdBy: "Arjun Nair", createdAt: "2026-08-22T09:00:00", finalizedBy: "Arjun Nair", finalizedAt: "2026-08-22T09:05:00",
  },
  // Hospital: diagnostics, paid
  {
    id: "inv-9", invoiceNumber: "VH-INV-2026-3302", patientId: "pat-10", encounterId: "enc-10",
    organizationId: "org-hospital", scope: "diagnostics", date: "2026-08-21", status: "paid",
    lineItems: [{ id: "li-9", serviceId: "svc-xray-hosp", serviceName: "X-Ray — Chest", source: "diagnostics", quantity: 1, rate: 500, discountAmount: 0, taxAmount: 25, total: 525 }],
    subtotal: 500, discountTotal: 0, taxTotal: 25, total: 525, paidTotal: 525, outstanding: 0,
    payerId: "payer-self", createdBy: "Kabir Sheikh", createdAt: "2026-08-21T13:00:00", finalizedBy: "Kabir Sheikh", finalizedAt: "2026-08-21T13:02:00",
  },
  // Hospital: IPD large invoice with insurance — partially settled
  {
    id: "inv-10", invoiceNumber: "VH-INV-2026-3303", patientId: "pat-9", encounterId: "enc-9",
    organizationId: "org-hospital", scope: "ipd", date: "2026-08-15", status: "partially_paid",
    lineItems: [
      { id: "li-10a", serviceId: "svc-room-hosp", serviceName: "Private Room (per day)", source: "ipd", quantity: 7, rate: 4500, discountAmount: 0, taxAmount: 0, total: 31500 },
      { id: "li-10b", serviceId: "svc-nursing-hosp", serviceName: "Nursing Charges (per day)", source: "ipd", quantity: 7, rate: 800, discountAmount: 0, taxAmount: 0, total: 5600 },
      { id: "li-10c", serviceId: "svc-mri-hosp", serviceName: "MRI Scan — Brain", source: "diagnostics", quantity: 1, rate: 6500, discountAmount: 0, taxAmount: 325, total: 6825 },
      { id: "li-10d", serviceId: "svc-pharmacy-hosp", serviceName: "Inpatient Pharmacy Charges", source: "pharmacy", quantity: 1, rate: 3200, discountAmount: 0, taxAmount: 384, total: 3584 },
    ],
    subtotal: 46800, discountTotal: 0, taxTotal: 709, total: 47509, paidTotal: 20000, outstanding: 27509,
    payerId: "payer-hdfc", createdBy: "Sneha Kulkarni", createdAt: "2026-08-15T18:00:00", finalizedBy: "Priya Menon", finalizedAt: "2026-08-16T09:00:00",
  },
  // Hospital: Surgery invoice — refund requiring approval scenario 9
  {
    id: "inv-11", invoiceNumber: "VH-INV-2026-3304", patientId: "pat-11", encounterId: "enc-11",
    organizationId: "org-hospital", scope: "surgery", date: "2026-08-19", status: "paid",
    lineItems: [
      { id: "li-11a", serviceId: "svc-surgery-hosp", serviceName: "Laparoscopic Surgery", source: "surgery", quantity: 1, rate: 85000, discountAmount: 0, taxAmount: 0, total: 85000 },
      { id: "li-11b", serviceId: "svc-ot-hosp", serviceName: "OT Charges", source: "surgery", quantity: 1, rate: 15000, discountAmount: 0, taxAmount: 0, total: 15000 },
    ],
    subtotal: 100000, discountTotal: 0, taxTotal: 0, total: 100000, paidTotal: 100000, outstanding: 0,
    payerId: "payer-niva", createdBy: "Sneha Kulkarni", createdAt: "2026-08-19T16:00:00", finalizedBy: "Priya Menon", finalizedAt: "2026-08-19T17:00:00",
  },
  // Hospital: Maternity discharge — settled
  {
    id: "inv-12", invoiceNumber: "VH-INV-2026-3305", patientId: "pat-13", encounterId: "enc-13",
    organizationId: "org-hospital", scope: "central", date: "2026-08-17", status: "paid",
    lineItems: [
      { id: "li-12a", serviceId: "svc-room-hosp", serviceName: "Private Room (per day)", source: "ipd", quantity: 3, rate: 4500, discountAmount: 0, taxAmount: 0, total: 13500 },
      { id: "li-12b", serviceId: "svc-nursing-hosp", serviceName: "Nursing Charges (per day)", source: "ipd", quantity: 3, rate: 800, discountAmount: 0, taxAmount: 0, total: 2400 },
      { id: "li-12c", serviceId: "svc-ot-hosp", serviceName: "OT Charges", source: "surgery", quantity: 1, rate: 15000, discountAmount: 1500, taxAmount: 0, total: 13500 },
    ],
    subtotal: 30900, discountTotal: 1500, taxTotal: 0, total: 29400, paidTotal: 29400, outstanding: 0,
    payerId: "payer-infosys", createdBy: "Priya Menon", createdAt: "2026-08-17T20:00:00", finalizedBy: "Priya Menon", finalizedAt: "2026-08-17T20:30:00",
  },
  // Hospital: cancelled invoice — duplicate bill scenario 15
  {
    id: "inv-13", invoiceNumber: "VH-INV-2026-3306", patientId: "pat-8", encounterId: "enc-8",
    organizationId: "org-hospital", scope: "opd", date: "2026-08-18", status: "cancelled",
    lineItems: [{ id: "li-13", serviceId: "svc-opd-hosp", serviceName: "OPD Consultation — Cardiology", source: "doctor_opd", quantity: 1, rate: 1200, discountAmount: 0, taxAmount: 0, total: 1200 }],
    subtotal: 1200, discountTotal: 0, taxTotal: 0, total: 1200, paidTotal: 0, outstanding: 0,
    payerId: "payer-self", createdBy: "Arjun Nair", createdAt: "2026-08-18T09:00:00", finalizedBy: "Arjun Nair", finalizedAt: "2026-08-18T09:01:00",
    cancelledReason: "Duplicate bill raised in error for the same OPD consultation (VH-INV-2026-3307 is the valid invoice).",
  },
  {
    id: "inv-14", invoiceNumber: "VH-INV-2026-3307", patientId: "pat-8", encounterId: "enc-8",
    organizationId: "org-hospital", scope: "opd", date: "2026-08-18", status: "paid",
    lineItems: [{ id: "li-14", serviceId: "svc-opd-hosp", serviceName: "OPD Consultation — Cardiology", source: "doctor_opd", quantity: 1, rate: 1200, discountAmount: 0, taxAmount: 0, total: 1200 }],
    subtotal: 1200, discountTotal: 0, taxTotal: 0, total: 1200, paidTotal: 1200, outstanding: 0,
    payerId: "payer-self", createdBy: "Arjun Nair", createdAt: "2026-08-18T09:10:00", finalizedBy: "Arjun Nair", finalizedAt: "2026-08-18T09:11:00",
  },
];

// ============================================================================
// PAYMENTS (includes scenario 10 failed payment)
// ============================================================================
export const payments: Payment[] = [
  { id: "pay-1", invoiceId: "inv-1", patientId: "pat-1", amount: 600, method: "cash", status: "success", collectedBy: "Meera Joshi", date: "2026-08-20T09:16:00", organizationId: "org-solo" },
  { id: "pay-2", invoiceId: "inv-4", patientId: "pat-4", amount: 1950, method: "upi", referenceNumber: "UPI2026081912345", status: "success", collectedBy: "Ravi Kulkarni", date: "2026-08-19T10:05:00", organizationId: "org-clinic" },
  { id: "pay-3", invoiceId: "inv-5", patientId: "pat-5", amount: 1000, method: "card", referenceNumber: "CARD-88213", status: "success", collectedBy: "Ravi Kulkarni", date: "2026-08-20T09:35:00", organizationId: "org-clinic", notes: "First partial payment" },
  { id: "pay-4", invoiceId: "inv-6", patientId: "pat-6", amount: 630, method: "cash", status: "success", collectedBy: "Ravi Kulkarni", date: "2026-08-21T14:03:00", organizationId: "org-clinic" },
  { id: "pay-5", invoiceId: "inv-9", patientId: "pat-10", amount: 525, method: "upi", referenceNumber: "UPI2026082100981", status: "success", collectedBy: "Kabir Sheikh", date: "2026-08-21T13:03:00", organizationId: "org-hospital" },
  { id: "pay-6", invoiceId: "inv-10", patientId: "pat-9", amount: 20000, method: "online", referenceNumber: "NEFT-HDFC-77213", status: "success", collectedBy: "Priya Menon", date: "2026-08-16T09:10:00", organizationId: "org-hospital", notes: "Advance settlement from HDFC ERGO" },
  { id: "pay-7", invoiceId: "inv-11", patientId: "pat-11", amount: 100000, method: "online", referenceNumber: "NEFT-NIVA-55210", status: "success", collectedBy: "Priya Menon", date: "2026-08-19T17:05:00", organizationId: "org-hospital" },
  { id: "pay-8", invoiceId: "inv-12", patientId: "pat-13", amount: 29400, method: "online", referenceNumber: "NEFT-INFY-11209", status: "success", collectedBy: "Priya Menon", date: "2026-08-17T20:35:00", organizationId: "org-hospital" },
  { id: "pay-9", invoiceId: "inv-14", patientId: "pat-8", amount: 1200, method: "card", referenceNumber: "CARD-99120", status: "success", collectedBy: "Arjun Nair", date: "2026-08-18T09:11:00", organizationId: "org-hospital" },
  // Scenario 10: failed payment
  { id: "pay-10", invoiceId: "inv-8", patientId: "pat-12", amount: 840, method: "card", referenceNumber: "CARD-TXN-40021", status: "failed", failureReason: "Card declined by issuing bank (insufficient funds).", collectedBy: "Arjun Nair", date: "2026-08-22T09:30:00", organizationId: "org-hospital" },
];

// ============================================================================
// RECEIPTS
// ============================================================================
export const receipts: Receipt[] = [
  { id: "rcpt-1", receiptNumber: "SOLO-RCPT-0041", invoiceId: "inv-1", paymentId: "pay-1", patientId: "pat-1", amount: 600, method: "cash", date: "2026-08-20T09:16:00", receivedBy: "Meera Joshi", organizationId: "org-solo" },
  { id: "rcpt-2", receiptNumber: "SMC-RCPT-0210", invoiceId: "inv-4", paymentId: "pay-2", patientId: "pat-4", amount: 1950, method: "upi", referenceNumber: "UPI2026081912345", date: "2026-08-19T10:05:00", receivedBy: "Ravi Kulkarni", organizationId: "org-clinic" },
  { id: "rcpt-3", receiptNumber: "SMC-RCPT-0211", invoiceId: "inv-5", paymentId: "pay-3", patientId: "pat-5", amount: 1000, method: "card", referenceNumber: "CARD-88213", date: "2026-08-20T09:35:00", receivedBy: "Ravi Kulkarni", organizationId: "org-clinic" },
  { id: "rcpt-4", receiptNumber: "SMC-RCPT-0212", invoiceId: "inv-6", paymentId: "pay-4", patientId: "pat-6", amount: 630, method: "cash", date: "2026-08-21T14:03:00", receivedBy: "Ravi Kulkarni", organizationId: "org-clinic" },
  { id: "rcpt-5", receiptNumber: "VH-RCPT-3302", invoiceId: "inv-9", paymentId: "pay-5", patientId: "pat-10", amount: 525, method: "upi", referenceNumber: "UPI2026082100981", date: "2026-08-21T13:03:00", receivedBy: "Kabir Sheikh", organizationId: "org-hospital" },
  { id: "rcpt-6", receiptNumber: "VH-RCPT-3303-A", invoiceId: "inv-10", paymentId: "pay-6", patientId: "pat-9", amount: 20000, method: "online", referenceNumber: "NEFT-HDFC-77213", date: "2026-08-16T09:10:00", receivedBy: "Priya Menon", organizationId: "org-hospital" },
  { id: "rcpt-7", receiptNumber: "VH-RCPT-3304", invoiceId: "inv-11", paymentId: "pay-7", patientId: "pat-11", amount: 100000, method: "online", referenceNumber: "NEFT-NIVA-55210", date: "2026-08-19T17:05:00", receivedBy: "Priya Menon", organizationId: "org-hospital" },
  { id: "rcpt-8", receiptNumber: "VH-RCPT-3305", invoiceId: "inv-12", paymentId: "pay-8", patientId: "pat-13", amount: 29400, method: "online", referenceNumber: "NEFT-INFY-11209", date: "2026-08-17T20:35:00", receivedBy: "Priya Menon", organizationId: "org-hospital" },
  { id: "rcpt-9", receiptNumber: "VH-RCPT-3307", invoiceId: "inv-14", paymentId: "pay-9", patientId: "pat-8", amount: 1200, method: "card", referenceNumber: "CARD-99120", date: "2026-08-18T09:11:00", receivedBy: "Arjun Nair", organizationId: "org-hospital" },
];

// ============================================================================
// DISCOUNTS
// ============================================================================
export const discounts: Discount[] = [
  {
    id: "disc-1", invoiceId: "inv-6", level: "normal", amount: 70, percent: 10, reason: "Regular patient courtesy discount within configured limit",
    requestedBy: "Ravi Kulkarni", requestedAt: "2026-08-21T14:00:00", approvalStatus: "not_required", organizationId: "org-clinic",
  },
  {
    id: "disc-2", invoiceId: "inv-8", level: "higher", amount: 360, percent: 30, reason: "Financial hardship — patient requested concession beyond staff limit",
    requestedBy: "Arjun Nair", requestedAt: "2026-08-22T09:02:00", approvalStatus: "pending", organizationId: "org-hospital",
  },
  {
    id: "disc-3", invoiceId: "inv-12", level: "special_case", amount: 1500, percent: 10, reason: "Hospital welfare scheme — maternity case, approved by admin",
    requestedBy: "Priya Menon", requestedAt: "2026-08-17T20:10:00", approvalStatus: "approved", approvedBy: "Priya Menon", approvedAt: "2026-08-17T20:15:00", organizationId: "org-hospital",
  },
];

// ============================================================================
// REFUNDS (scenario 9)
// ============================================================================
export const refunds: Refund[] = [
  {
    id: "ref-1", invoiceId: "inv-11", paymentId: "pay-7", patientId: "pat-11", amount: 15000,
    reason: "OT charges billed for a procedure duration that was later revised downward by the surgical team.",
    status: "requested", requiresApproval: true, requestedBy: "Sneha Kulkarni", requestedAt: "2026-08-20T10:00:00", organizationId: "org-hospital",
  },
  {
    id: "ref-2", invoiceId: "inv-9", paymentId: "pay-5", patientId: "pat-10", amount: 525,
    reason: "X-ray repeated due to equipment malfunction; original charge refunded per policy.",
    status: "completed", requiresApproval: false, requestedBy: "Kabir Sheikh", requestedAt: "2026-08-21T15:00:00",
    approvedBy: "Devika Iyer", approvedAt: "2026-08-21T15:10:00", processedBy: "Devika Iyer", processedAt: "2026-08-21T15:20:00", organizationId: "org-hospital",
  },
  {
    id: "ref-3", invoiceId: "inv-4", paymentId: "pay-2", patientId: "pat-4", amount: 472.5,
    reason: "ECG cancelled after payment; patient did not undergo the test.",
    status: "approved", requiresApproval: false, requestedBy: "Ravi Kulkarni", requestedAt: "2026-08-19T11:00:00",
    approvedBy: "Ravi Kulkarni", approvedAt: "2026-08-19T11:05:00", organizationId: "org-clinic",
  },
];

// ============================================================================
// INSURANCE CLAIMS (scenarios 11, 12)
// ============================================================================
export const insuranceClaims: InsuranceClaim[] = [
  // Scenario 11: pending verification (clinic)
  {
    id: "claim-1", invoiceId: "inv-7", patientId: "pat-7", payerId: "payer-star", policyNumber: "STAR-PL-88213409",
    status: "pending_verification", claimedAmount: 1344, patientResponsibility: 0, payerOutstanding: 1344,
    documentsAttached: ["Prescription copy"], requiredDocuments: ["Prescription copy", "Pharmacy bill", "ID proof"], lastUpdated: "2026-08-22T10:30:00", organizationId: "org-clinic",
  },
  // Scenario 12: settlement (hospital, partially settled)
  {
    id: "claim-2", invoiceId: "inv-10", patientId: "pat-9", payerId: "payer-hdfc", policyNumber: "HDFC-EG-771029384",
    status: "partially_settled", claimedAmount: 47509, approvedAmount: 40000, settledAmount: 20000,
    patientResponsibility: 7509, payerOutstanding: 20000,
    documentsAttached: ["Admission form", "Discharge summary draft", "Itemized bill"], requiredDocuments: ["Admission form", "Discharge summary", "Itemized bill", "Investigation reports"],
    lastUpdated: "2026-08-21T12:00:00", organizationId: "org-hospital",
  },
  // Fully settled claim
  {
    id: "claim-3", invoiceId: "inv-11", patientId: "pat-11", payerId: "payer-niva", policyNumber: "NIVA-88771102",
    status: "settled", claimedAmount: 100000, approvedAmount: 100000, settledAmount: 100000,
    patientResponsibility: 0, payerOutstanding: 0,
    documentsAttached: ["Pre-auth form", "Surgical notes", "Itemized bill", "Discharge summary"], requiredDocuments: ["Pre-auth form", "Surgical notes", "Itemized bill", "Discharge summary"],
    lastUpdated: "2026-08-20T09:00:00", organizationId: "org-hospital",
  },
  // Rejected claim
  {
    id: "claim-4", invoiceId: "inv-12", patientId: "pat-13", payerId: "payer-infosys", policyNumber: "INFY-CORP-55210",
    status: "settled", claimedAmount: 29400, approvedAmount: 29400, settledAmount: 29400,
    patientResponsibility: 0, payerOutstanding: 0,
    documentsAttached: ["Corporate authorization", "Itemized bill"], requiredDocuments: ["Corporate authorization", "Itemized bill"],
    lastUpdated: "2026-08-18T10:00:00", organizationId: "org-hospital",
  },
  {
    id: "claim-5", invoiceId: "inv-9", patientId: "pat-10", payerId: "payer-star", policyNumber: "STAR-PL-11209977",
    status: "rejected", claimedAmount: 525, patientResponsibility: 525, payerOutstanding: 0,
    documentsAttached: ["X-ray report"], requiredDocuments: ["X-ray report", "Referral letter"],
    lastUpdated: "2026-08-21T16:00:00", organizationId: "org-hospital",
  },
];

// ============================================================================
// AUDIT LOG
// ============================================================================
export const auditLog: AuditLogEntry[] = [
  { id: "audit-1", action: "invoice_created", user: "Meera Joshi", timestamp: "2026-08-20T09:15:00", entity: "Invoice", entityId: "inv-1", amount: 600, organizationId: "org-solo" },
  { id: "audit-2", action: "invoice_finalized", user: "Meera Joshi", timestamp: "2026-08-20T09:16:00", entity: "Invoice", entityId: "inv-1", previousState: "draft", newState: "issued", organizationId: "org-solo" },
  { id: "audit-3", action: "payment_recorded", user: "Meera Joshi", timestamp: "2026-08-20T09:16:00", entity: "Payment", entityId: "pay-1", amount: 600, organizationId: "org-solo" },
  { id: "audit-4", action: "discount_applied", user: "Ravi Kulkarni", timestamp: "2026-08-21T14:00:00", entity: "Discount", entityId: "disc-1", amount: 70, reason: "Regular patient courtesy discount", organizationId: "org-clinic" },
  { id: "audit-5", action: "discount_applied", user: "Arjun Nair", timestamp: "2026-08-22T09:02:00", entity: "Discount", entityId: "disc-2", amount: 360, reason: "Financial hardship concession request", organizationId: "org-hospital" },
  { id: "audit-6", action: "discount_approved", user: "Priya Menon", timestamp: "2026-08-17T20:15:00", entity: "Discount", entityId: "disc-3", amount: 1500, approver: "Priya Menon", organizationId: "org-hospital" },
  { id: "audit-7", action: "refund_requested", user: "Sneha Kulkarni", timestamp: "2026-08-20T10:00:00", entity: "Refund", entityId: "ref-1", amount: 15000, reason: "OT duration revised", organizationId: "org-hospital" },
  { id: "audit-8", action: "refund_approved", user: "Devika Iyer", timestamp: "2026-08-21T15:10:00", entity: "Refund", entityId: "ref-2", amount: 525, approver: "Devika Iyer", organizationId: "org-hospital" },
  { id: "audit-9", action: "refund_completed", user: "Devika Iyer", timestamp: "2026-08-21T15:20:00", entity: "Refund", entityId: "ref-2", amount: 525, organizationId: "org-hospital" },
  { id: "audit-10", action: "invoice_cancelled", user: "Arjun Nair", timestamp: "2026-08-18T09:05:00", entity: "Invoice", entityId: "inv-13", previousState: "issued", newState: "cancelled", reason: "Duplicate bill raised in error", organizationId: "org-hospital" },
  { id: "audit-11", action: "payment_recorded", user: "Priya Menon", timestamp: "2026-08-16T09:10:00", entity: "Payment", entityId: "pay-6", amount: 20000, organizationId: "org-hospital" },
  { id: "audit-12", action: "invoice_finalized", user: "Priya Menon", timestamp: "2026-08-16T09:00:00", entity: "Invoice", entityId: "inv-10", previousState: "draft", newState: "issued", organizationId: "org-hospital" },
];

// ============================================================================
// NOTIFICATIONS (WhatsApp simulation)
// ============================================================================
export const notifications: NotificationItem[] = [
  { id: "notif-1", event: "invoice_issued", patientId: "pat-2", invoiceId: "inv-2", message: "Your invoice SOLO-INV-2026-0042 for ₹600 has been generated. Pay online or at the clinic.", channel: "whatsapp", status: "read", timestamp: "2026-08-21T11:02:00", organizationId: "org-solo" },
  { id: "notif-2", event: "payment_received", patientId: "pat-1", invoiceId: "inv-1", message: "Payment of ₹600 received for invoice SOLO-INV-2026-0041. Thank you!", channel: "whatsapp", status: "delivered", timestamp: "2026-08-20T09:17:00", organizationId: "org-solo" },
  { id: "notif-3", event: "partial_payment", patientId: "pat-5", invoiceId: "inv-5", message: "We received ₹1,000 towards invoice SMC-INV-2026-0211. Remaining balance: ₹1,055.", channel: "whatsapp", status: "delivered", timestamp: "2026-08-20T09:36:00", organizationId: "org-clinic" },
  { id: "notif-4", event: "outstanding_reminder", patientId: "pat-5", invoiceId: "inv-5", message: "Reminder: ₹1,055 is outstanding on invoice SMC-INV-2026-0211. Please clear at your earliest convenience.", channel: "whatsapp", status: "sent", timestamp: "2026-08-22T09:00:00", organizationId: "org-clinic" },
  { id: "notif-5", event: "refund_update", patientId: "pat-10", invoiceId: "inv-9", message: "Your refund of ₹525 for invoice VH-INV-2026-3302 has been completed and credited.", channel: "whatsapp", status: "read", timestamp: "2026-08-21T15:22:00", organizationId: "org-hospital" },
  { id: "notif-6", event: "insurance_update", patientId: "pat-9", invoiceId: "inv-10", message: "Your insurance claim with HDFC ERGO has been partially settled. Your responsibility: ₹7,509.", channel: "whatsapp", status: "delivered", timestamp: "2026-08-21T12:05:00", organizationId: "org-hospital" },
  { id: "notif-7", event: "outstanding_reminder", patientId: "pat-9", invoiceId: "inv-10", message: "Reminder: ₹27,509 is outstanding on invoice VH-INV-2026-3303.", channel: "whatsapp", status: "failed", timestamp: "2026-08-22T09:00:00", organizationId: "org-hospital" },
  { id: "notif-8", event: "invoice_issued", patientId: "pat-12", invoiceId: "inv-8", message: "Your invoice VH-INV-2026-3301 for ₹840 has been generated.", channel: "whatsapp", status: "delivered", timestamp: "2026-08-22T09:06:00", organizationId: "org-hospital" },
];

// ============================================================================
// RECONCILIATION (scenario 14)
// ============================================================================
export const reconciliationRecords: ReconciliationRecord[] = [
  {
    id: "recon-1", date: "2026-08-21", billingTotal: 1969, paymentTotal: 1725, expectedCollection: 1969, actualCollection: 1725, difference: 244,
    exceptions: [
      { id: "exc-1", type: "unmatched_transaction", description: "UPI credit of ₹244 received without a matching invoice reference.", amount: 244, status: "investigating" },
    ],
    organizationId: "org-clinic", scope: "central",
  },
  {
    id: "recon-2", date: "2026-08-22", billingTotal: 2040, paymentTotal: 0, expectedCollection: 2040, actualCollection: 0, difference: 2040,
    exceptions: [
      { id: "exc-2", type: "failed_transaction", description: "Card payment declined for invoice VH-INV-2026-3301 (₹840); invoice remains outstanding.", amount: 840, status: "open" },
      { id: "exc-3", type: "duplicate_payment", description: "Invoice VH-INV-2026-3306 cancelled as duplicate of VH-INV-2026-3307.", amount: 1200, status: "resolved", resolutionNotes: "Duplicate invoice cancelled; valid invoice VH-INV-2026-3307 retained and settled." },
    ],
    organizationId: "org-hospital", scope: "opd",
  },
  {
    id: "recon-3", date: "2026-08-16", billingTotal: 47509, paymentTotal: 20000, expectedCollection: 47509, actualCollection: 20000, difference: 27509,
    exceptions: [
      { id: "exc-4", type: "amount_mismatch", description: "Approved insurance amount (₹40,000) differs from claimed amount (₹47,509); ₹7,509 patient responsibility pending collection.", amount: 7509, status: "open" },
    ],
    organizationId: "org-hospital", scope: "ipd",
  },
];

// ============================================================================
// DASHBOARD ALERTS
// ============================================================================
export const dashboardAlerts: DashboardAlert[] = [
  { id: "alert-1", type: "payment_failure", message: "Card payment failed for invoice VH-INV-2026-3301 (₹840) — Nandini Rao.", severity: "critical", linkEntity: "Invoice", linkEntityId: "inv-8", timestamp: "2026-08-22T09:30:00" },
  { id: "alert-2", type: "approval_required", message: "High discount of ₹360 on invoice VH-INV-2026-3301 is pending admin approval.", severity: "warning", linkEntity: "Discount", linkEntityId: "disc-2", timestamp: "2026-08-22T09:02:00" },
  { id: "alert-3", type: "approval_required", message: "Refund request of ₹15,000 on invoice VH-INV-2026-3304 requires approval.", severity: "warning", linkEntity: "Refund", linkEntityId: "ref-1", timestamp: "2026-08-20T10:00:00" },
  { id: "alert-4", type: "duplicate_bill", message: "Duplicate invoice detected and cancelled for Sameer Khan (VH-INV-2026-3306).", severity: "info", linkEntity: "Invoice", linkEntityId: "inv-13", timestamp: "2026-08-18T09:05:00" },
  { id: "alert-5", type: "reconciliation_exception", message: "Unmatched UPI credit of ₹244 found in Sanjeevani Clinic's Aug 21 reconciliation.", severity: "warning", linkEntity: "Reconciliation", linkEntityId: "recon-1", timestamp: "2026-08-21T23:00:00" },
];
