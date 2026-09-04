import { patients } from "@/hospital-admin/lib/mock-data/patients";
import { doctors } from "@/hospital-admin/lib/mock-data/doctors";
import { detailedDepartments } from "@/hospital-admin/lib/mock-data/departments";
import { invoices } from "@/hospital-admin/lib/mock-data/invoices";
import { appointments } from "@/hospital-admin/lib/mock-data/appointments";
import { mockHospitalReports } from "@/hospital-admin/lib/mock-data/reports-analytics";
import { vendors, procurementRequests } from "@/hospital-admin/lib/mock-data/vendors";
import {
  nurses,
  billingStaff,
  receptionists,
  supportStaffList,
} from "@/hospital-admin/lib/mock-data/staff";
import { mockExtendedInsuranceClaims } from "@/hospital-admin/lib/mock-data/insurance-tpa-extended";
import { formatCurrency } from "@/hospital-admin/lib/utils";

export type SearchEntityCategory =
  | "Patient"
  | "Doctor"
  | "Staff"
  | "Appointment"
  | "Department"
  | "Bed / Ward"
  | "Surgery & OT"
  | "Billing / Invoice"
  | "Procurement & PO"
  | "Emergency SOS"
  | "Vendor"
  | "Report"
  | "Insurance / TPA"
  | "Quick Action";

export interface HighlightedSnippet {
  label?: string;
  text: string;
}

export interface SearchResultItem {
  id: string;
  category: SearchEntityCategory;
  title: string;
  subtitle?: string;
  href: string;
  snippets: HighlightedSnippet[];
  urgencyLevel?: "critical" | "warning" | "standard";
  badgeText?: string;
  iconType?: string;
}

export interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  href: string;
  iconName: string;
  category: "Clinical" | "Workforce" | "Operations" | "Emergency" | "Analytics";
}

// Exactly the 10 Standard Quick Actions from PRD Section 18 & Rules 18
export const STANDARD_QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: "qa-1",
    title: "Add Doctor",
    description: "Invite/create doctor profile and begin medical council verification",
    href: "/hospital-admin/verification",
    iconName: "UserPlus",
    category: "Workforce",
  },
  {
    id: "qa-2",
    title: "Add Staff",
    description: "Create nurse, receptionist, billing staff, or support staff member",
    href: "/hospital-admin/staff",
    iconName: "Users",
    category: "Workforce",
  },
  {
    id: "qa-3",
    title: "Create Department",
    description: "Configure clinical department, floor allocation, and department head",
    href: "/hospital-admin/departments",
    iconName: "Building2",
    category: "Operations",
  },
  {
    id: "qa-4",
    title: "Emergency",
    description: "Open emergency control board and live trauma resuscitation bay",
    href: "/hospital-admin/emergency",
    iconName: "Flame",
    category: "Emergency",
  },
  {
    id: "qa-5",
    title: "Allocate Bed",
    description: "View and allocate available general ward, semi-private, or ICU bed",
    href: "/hospital-admin/wards-beds",
    iconName: "Bed",
    category: "Clinical",
  },
  {
    id: "qa-6",
    title: "Create Surgery Case",
    description: "Start surgical scheduling, OT suite booking, and surgical pack clearance",
    href: "/hospital-admin/surgical-cases/create",
    iconName: "Zap",
    category: "Clinical",
  },
  {
    id: "qa-7",
    title: "Request Surgeon",
    description: "Create internal roster summon or external visiting specialist request",
    href: "/hospital-admin/surgical-cases/surgeon-requests",
    iconName: "Stethoscope",
    category: "Clinical",
  },
  {
    id: "qa-8",
    title: "Request Vendor",
    description: "Create procurement request, medical supply requisition, or vendor RFQ",
    href: "/hospital-admin/procurement/create",
    iconName: "ShoppingBag",
    category: "Operations",
  },
  {
    id: "qa-9",
    title: "Dispatch Ambulance",
    description: "Start ambulance dispatch workflow for an eligible emergency SOS case",
    href: "/hospital-admin/ambulance",
    iconName: "Siren",
    category: "Emergency",
  },
  {
    id: "qa-10",
    title: "Generate Report",
    description: "Open hospital operational analytics and multi-department report builder",
    href: "/hospital-admin/reports",
    iconName: "FileBarChart",
    category: "Analytics",
  },
];

// Hospital Beds & Wards Dataset for Global Indexing
const hospitalBeds = [
  { id: "bed_gw_101", bedNumber: "GW-101", wardName: "General Medical Ward (Ward A)", tier: "General", floor: "2nd Floor", status: "Occupied", patientName: "Ramesh Sharma", doctor: "Dr. Ananya Patel" },
  { id: "bed_gw_102", bedNumber: "GW-102", wardName: "General Medical Ward (Ward A)", tier: "General", floor: "2nd Floor", status: "Occupied", patientName: "Sita Devi", doctor: "Dr. Arvind Swaminathan" },
  { id: "bed_gw_103", bedNumber: "GW-103", wardName: "General Medical Ward (Ward A)", tier: "General", floor: "2nd Floor", status: "Available", equipment: "Oxygen Flowmeter" },
  { id: "bed_gw_104", bedNumber: "GW-104", wardName: "General Medical Ward (Ward A)", tier: "General", floor: "2nd Floor", status: "Cleaning", equipment: "Standard Console" },
  { id: "bed_icu_301", bedNumber: "ICU-301", wardName: "Intensive Care Unit (ICU)", tier: "ICU", floor: "3rd Floor", status: "Occupied", patientName: "Vikram Malhotra", doctor: "Dr. Ananya Patel", equipment: "Dräger Ventilator + Arterial Line" },
  { id: "bed_icu_302", bedNumber: "ICU-302", wardName: "Intensive Care Unit (ICU)", tier: "ICU", floor: "3rd Floor", status: "Available", equipment: "Multipara Monitor + Infusion Array" },
  { id: "bed_ccu_305", bedNumber: "CCU-305", wardName: "Coronary Care & HDU (CCU)", tier: "CCU", floor: "3rd Floor", status: "Occupied", patientName: "Harish Iyer", doctor: "Dr. Kavita Verma" },
  { id: "bed_iso_401", bedNumber: "ISO-401", wardName: "Airborne Isolation Ward", tier: "Isolation", floor: "4th Floor", status: "Occupied", patientName: "Prakash Shinde", doctor: "Dr. Arvind Swaminathan" },
];

// Hospital Surgeries Dataset for Global Indexing
const hospitalSurgeries = [
  { id: "CASE-409", caseNumber: "CASE-409", procedureName: "Total Knee Replacement (Left)", department: "Orthopedics", surgeon: "Dr. Ramesh Sharma", otRoom: "Main OR 1 (Ortho & Trauma)", status: "Blocked", readiness: 75, patientName: "Arjun Gupta" },
  { id: "CASE-410", caseNumber: "CASE-410", procedureName: "Laparoscopic Cholecystectomy", department: "General Surgery", surgeon: "Dr. Rohan Mehta", otRoom: "General OR 1 (Laparoscopy Suite)", status: "Ready", readiness: 100, patientName: "Kavita Sharma" },
  { id: "CASE-411", caseNumber: "CASE-411", procedureName: "Emergency Craniotomy for Subdural Evacuation", department: "Neurosurgery", surgeon: "Dr. Vikram Seth", otRoom: "Emergency Fast-Track OT", status: "Scheduled", readiness: 100, patientName: "Sunil Verma", isEmergency: true },
  { id: "HIST-102", caseNumber: "CASE-395", procedureName: "Right Femoral Hernioplasty with Mesh", department: "General Surgery", surgeon: "Dr. Rohan Mehta", otRoom: "Main OR 1", status: "Completed", readiness: 100, patientName: "Mohan Das" },
  { id: "HIST-103", caseNumber: "CASE-391", procedureName: "Arthroscopic ACL Reconstruction", department: "Orthopedics", surgeon: "Dr. Ramesh Sharma", otRoom: "Main OR 1", status: "Completed", readiness: 100, patientName: "Pooja Hegde" },
];

export function executeGlobalSearch(
  rawQuery: string,
  categoryFilter: string = "All"
): SearchResultItem[] {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return [];

  const results: SearchResultItem[] = [];

  // 1. SEARCH PATIENTS
  if (categoryFilter === "All" || categoryFilter === "Patients" || categoryFilter === "Patient") {
    patients.forEach((p) => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchId = p.id.toLowerCase().includes(q) || p.qlynoPatientId.toLowerCase().includes(q) || (p.uhid && p.uhid.toLowerCase().includes(q));
      const matchPhone = p.phone.toLowerCase().includes(q);
      const matchBlood = p.bloodGroup.toLowerCase().includes(q);
      const matchAadhaar = p.identifiers?.aadhar?.toLowerCase().includes(q);
      const matchPan = p.identifiers?.pan?.toLowerCase().includes(q);
      const matchTags = p.tags?.some((t) => t.toLowerCase().includes(q));
      const opdMatch = p.hospitalRelationships?.[0]?.opdHistory?.filter(
        (o) =>
          o.visitReason?.toLowerCase().includes(q) ||
          o.consultationNotes?.toLowerCase().includes(q) ||
          o.doctor?.toLowerCase().includes(q) ||
          o.department?.toLowerCase().includes(q)
      );

      if (matchName || matchId || matchPhone || matchBlood || matchAadhaar || matchPan || matchTags || (opdMatch && opdMatch.length > 0)) {
        const snippets: HighlightedSnippet[] = [
          {
            label: "UHID & Identifiers",
            text: `Qlyno ID: ${p.qlynoPatientId} • UHID: ${p.uhid || "N/A"} • Gender: ${p.gender} • Blood: ${p.bloodGroup} • Phone: ${p.phone} • Aadhaar: ${p.identifiers?.aadhar || "N/A"} • PAN: ${p.identifiers?.pan || "N/A"}`,
          },
        ];

        if (p.tags && p.tags.length > 0) {
          snippets.push({
            label: "Medical Conditions & Tags",
            text: p.tags.join(", "),
          });
        }

        if (opdMatch && opdMatch.length > 0) {
          opdMatch.forEach((o) => {
            snippets.push({
              label: `Consultation (${o.department} - ${o.doctor})`,
              text: `Visit Reason: "${o.visitReason}" — Notes: "${o.consultationNotes || "Routine follow-up"}"`,
            });
          });
        }

        results.push({
          id: `pat_${p.id}`,
          category: "Patient",
          title: p.name,
          subtitle: `UHID: ${p.qlynoPatientId} • Phone: ${p.phone} • Blood Group: ${p.bloodGroup}`,
          href: `/hospital-admin/patients`,
          badgeText: p.gender,
          snippets,
        });
      }
    });
  }

  // 2. SEARCH DOCTORS
  if (categoryFilter === "All" || categoryFilter === "Doctors" || categoryFilter === "Doctor") {
    doctors.forEach((d) => {
      const matchName = d.name.toLowerCase().includes(q);
      const matchSpecialty = d.specialty.toLowerCase().includes(q);
      const matchDept = d.department.toLowerCase().includes(q);
      const matchSub = (d.subSpecialty || "").toLowerCase().includes(q);
      const matchReg = (d.registrationNo || "").toLowerCase().includes(q);
      const matchVerification = d.verification?.status?.toLowerCase().includes(q);

      if (matchName || matchSpecialty || matchDept || matchSub || matchReg || matchVerification) {
        results.push({
          id: `doc_${d.id}`,
          category: "Doctor",
          title: d.name,
          subtitle: `${d.specialty} • ${d.department} • Reg No: ${d.registrationNo}`,
          href: `/hospital-admin/doctors/${d.id}`,
          badgeText: d.verification?.status?.toUpperCase() || "VERIFIED",
          snippets: [
            {
              label: "Doctor Profile",
              text: `Specialty: ${d.specialty} (${d.subSpecialty || "General"}) | Department: ${d.department} | Qualification: ${d.qualification} | Registration: ${d.registrationNo} | Status: ${d.verification?.status || "verified"}`,
            },
          ],
        });
      }
    });
  }

  // 3. SEARCH STAFF (Nurses, Receptionists, Billing, Support Staff)
  if (categoryFilter === "All" || categoryFilter === "Staff") {
    const allStaff: Array<{
      id: string;
      name: string;
      role: string;
      roleCategory: string;
      department?: string;
      location?: string;
      status?: string;
      email?: string;
      href: string;
    }> = [
      ...nurses.map((n) => ({ id: n.id, name: n.name, role: n.role, roleCategory: "Nurse", department: n.department, location: n.location, status: n.status, email: n.email, href: `/hospital-admin/staff/nurses` })),
      ...billingStaff.map((b) => ({ id: b.id, name: b.name, role: b.role, roleCategory: "Billing Staff", department: b.assignedCounterName, location: b.location, status: b.status, email: b.email, href: `/hospital-admin/staff/billing-staff` })),
      ...receptionists.map((r) => ({ id: r.id, name: r.name, role: r.role, roleCategory: "Receptionist", department: r.department, location: r.location, status: r.status, email: r.email, href: `/hospital-admin/staff/receptionists` })),
      ...supportStaffList.map((s) => ({ id: s.id, name: s.name, role: s.role, roleCategory: "Support Staff", department: s.department, location: s.location, status: s.status, email: s.email, href: `/hospital-admin/staff/support-staff` })),
    ];

    allStaff.forEach((st) => {
      const matchName = st.name.toLowerCase().includes(q);
      const matchRole = st.role.toLowerCase().includes(q) || st.roleCategory.toLowerCase().includes(q);
      const matchDept = (st.department || "").toLowerCase().includes(q);
      const matchStatus = (st.status || "").toLowerCase().includes(q);
      const matchEmail = (st.email || "").toLowerCase().includes(q);

      if (matchName || matchRole || matchDept || matchStatus || matchEmail) {
        results.push({
          id: `staff_${st.id}`,
          category: "Staff",
          title: st.name,
          subtitle: `${st.role} • ${st.department || st.roleCategory} • Location: ${st.location || "Main Hospital"}`,
          href: st.href,
          badgeText: st.roleCategory,
          snippets: [
            {
              label: "Staff Roster Record",
              text: `Role: ${st.role} | Department: ${st.department || "General"} | Email: ${st.email || "staff@qlyno.health"} | Status: ${st.status || "Active"}`,
            },
          ],
        });
      }
    });
  }

  // 4. SEARCH APPOINTMENTS & ENCOUNTERS
  if (categoryFilter === "All" || categoryFilter === "Appointments") {
    appointments.forEach((a) => {
      const matchPatient = a.patientName.toLowerCase().includes(q) || a.patientId.toLowerCase().includes(q) || (a.qlynoPatientId && a.qlynoPatientId.toLowerCase().includes(q));
      const matchDoctor = a.doctorName.toLowerCase().includes(q);
      const matchClinic = (a.clinic || "").toLowerCase().includes(q);
      const matchReason = (a.reason || a.type || "").toLowerCase().includes(q);
      const matchApptId = a.id.toLowerCase().includes(q);

      if (matchPatient || matchDoctor || matchClinic || matchReason || matchApptId) {
        results.push({
          id: `appt_${a.id}`,
          category: "Appointment",
          title: `Appointment with ${a.doctorName}`,
          subtitle: `Patient: ${a.patientName} (${a.qlynoPatientId || a.patientId}) • ${a.date} at ${a.time}`,
          href: `/hospital-admin/appointments/opd-queue`,
          badgeText: a.status,
          snippets: [
            {
              label: "Consultation Booking",
              text: `Patient: ${a.patientName} | Doctor: ${a.doctorName} | Clinic: ${a.clinic} | Reason: "${a.reason || a.type}" | Status: ${a.status}`,
            },
          ],
        });
      }
    });
  }

  // 5. SEARCH BEDS & WARDS
  if (categoryFilter === "All" || categoryFilter === "Beds & Wards" || categoryFilter === "Bed / Ward") {
    hospitalBeds.forEach((b) => {
      const matchBed = b.bedNumber.toLowerCase().includes(q);
      const matchWard = b.wardName.toLowerCase().includes(q);
      const matchTier = b.tier.toLowerCase().includes(q);
      const matchPatient = (b.patientName || "").toLowerCase().includes(q);

      if (matchBed || matchWard || matchTier || matchPatient) {
        results.push({
          id: `bed_${b.id}`,
          category: "Bed / Ward",
          title: `Bed ${b.bedNumber} (${b.tier})`,
          subtitle: `${b.wardName} • ${b.floor} • Status: ${b.status} ${b.patientName ? `• ${b.patientName}` : ""}`,
          href: `/hospital-admin/wards-beds`,
          badgeText: b.status.toUpperCase(),
          snippets: [
            {
              label: "Ward Bed Information",
              text: `Ward: ${b.wardName} | Bed Number: ${b.bedNumber} | Tier: ${b.tier} | Status: ${b.status} ${b.patientName ? `| Patient: ${b.patientName} (Dr. ${b.doctor})` : ""}`,
            },
          ],
        });
      }
    });
  }

  // 6. SEARCH SURGERIES & OT CASES
  if (categoryFilter === "All" || categoryFilter === "Surgeries" || categoryFilter === "Surgery & OT") {
    hospitalSurgeries.forEach((s) => {
      const matchCase = s.caseNumber.toLowerCase().includes(q);
      const matchProc = s.procedureName.toLowerCase().includes(q);
      const matchSurgeon = s.surgeon.toLowerCase().includes(q);
      const matchDept = s.department.toLowerCase().includes(q);
      const matchPatient = s.patientName.toLowerCase().includes(q);

      if (matchCase || matchProc || matchSurgeon || matchDept || matchPatient) {
        results.push({
          id: `surg_${s.id}`,
          category: "Surgery & OT",
          title: `${s.procedureName} (${s.caseNumber})`,
          subtitle: `Surgeon: ${s.surgeon} • ${s.otRoom} • Patient: ${s.patientName}`,
          href: `/hospital-admin/surgical-cases`,
          badgeText: s.status.toUpperCase(),
          urgencyLevel: s.isEmergency ? "critical" : "standard",
          snippets: [
            {
              label: "Surgical Case Dossier",
              text: `Procedure: ${s.procedureName} | Surgeon: ${s.surgeon} | Suite: ${s.otRoom} | Readiness: ${s.readiness}% | Status: ${s.status}`,
            },
          ],
        });
      }
    });
  }

  // 7. SEARCH DEPARTMENTS
  if (categoryFilter === "All" || categoryFilter === "Departments" || categoryFilter === "Department") {
    detailedDepartments.forEach((dept) => {
      const matchName = dept.name.toLowerCase().includes(q);
      const matchHead = (dept.headName || "").toLowerCase().includes(q);
      const matchDesc = (dept.description || "").toLowerCase().includes(q);
      const matchLocation = dept.location.toLowerCase().includes(q);

      if (matchName || matchHead || matchDesc || matchLocation) {
        results.push({
          id: `dept_${dept.id}`,
          category: "Department",
          title: dept.name,
          subtitle: `Head: ${dept.headName} • Floor: ${dept.floor} • Location: ${dept.location}`,
          href: `/hospital-admin/departments/${dept.id}`,
          badgeText: dept.status,
          snippets: [
            {
              label: "Clinical Department Overview",
              text: `${dept.description || "Specialty department"} | Active Patients: ${dept.activePatients} | Status: ${dept.status}`,
            },
          ],
        });
      }
    });
  }

  // 8. SEARCH INVOICES & BILLING
  if (categoryFilter === "All" || categoryFilter === "Invoices" || categoryFilter === "Billing / Invoice") {
    invoices.forEach((inv) => {
      const matchInvNo = inv.invoiceNo.toLowerCase().includes(q);
      const matchPatient = inv.patientName.toLowerCase().includes(q);
      const matchDept = (inv.department || "").toLowerCase().includes(q);
      const matchStatus = inv.status.toLowerCase().includes(q);

      if (matchInvNo || matchPatient || matchDept || matchStatus) {
        results.push({
          id: `inv_${inv.id}`,
          category: "Billing / Invoice",
          title: `Invoice ${inv.invoiceNo}`,
          subtitle: `Patient: ${inv.patientName} (${inv.patientId}) • Amount: ${formatCurrency(inv.amount)} • Status: ${inv.status.toUpperCase()}`,
          href: `/hospital-admin/billing/${inv.id}`,
          badgeText: inv.status.toUpperCase(),
          snippets: [
            {
              label: "Financial Invoice",
              text: `Total Billed: ${formatCurrency(inv.amount)} | Paid: ${formatCurrency(inv.paid)} | Outstanding: ${formatCurrency(inv.outstanding)} | Department: ${inv.department || "General"}`,
            },
          ],
        });
      }
    });
  }

  // 9. SEARCH REPORTS & ANALYTICS
  if (categoryFilter === "All" || categoryFilter === "Reports" || categoryFilter === "Report") {
    mockHospitalReports.forEach((r) => {
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchCode = r.code.toLowerCase().includes(q);
      const matchCat = r.category.toLowerCase().includes(q);
      const matchDesc = r.description.toLowerCase().includes(q);

      if (matchTitle || matchCode || matchCat || matchDesc) {
        results.push({
          id: `rep_${r.id}`,
          category: "Report",
          title: r.title,
          subtitle: `${r.code} • Category: ${r.category} • Sensitivity: ${r.sensitivity}`,
          href: `/hospital-admin/reports`,
          badgeText: r.category,
          snippets: [
            {
              label: "Hospital Analytics Report",
              text: `${r.description} | Sensitivity: ${r.sensitivity} | Permission: ${r.requiredPermission}`,
            },
          ],
        });
      }
    });
  }

  // 10. SEARCH PROCUREMENT REQUESTS
  if (categoryFilter === "All" || categoryFilter === "Procurement" || categoryFilter === "Procurement & PO") {
    procurementRequests.forEach((pr) => {
      const matchTitle = pr.title.toLowerCase().includes(q);
      const matchCat = pr.category.toLowerCase().includes(q);
      const matchCase = (pr.linkedCase || "").toLowerCase().includes(q);

      if (matchTitle || matchCat || matchCase) {
        results.push({
          id: `pr_${pr.id}`,
          category: "Procurement & PO",
          title: pr.title,
          subtitle: `Category: ${pr.category} • Qty: ${pr.quantity} • Required by ${pr.requiredBy}`,
          href: `/hospital-admin/procurement`,
          badgeText: pr.status.toUpperCase(),
          snippets: [
            {
              label: "Procurement Requisition",
              text: `Urgency: ${pr.urgency} | Quotes Received: ${pr.quotesReceived} | ${pr.linkedCase ? `Linked to: ${pr.linkedCase}` : "General Stock Supply"}`,
            },
          ],
        });
      }
    });
  }

  // 11. SEARCH VENDORS
  if (categoryFilter === "All" || categoryFilter === "Vendors" || categoryFilter === "Vendor") {
    vendors.forEach((v) => {
      const matchName = v.name.toLowerCase().includes(q);
      const matchCat = v.categories.some((c) => c.toLowerCase().includes(q));
      const matchContact = (v.contactPerson || "").toLowerCase().includes(q);

      if (matchName || matchCat || matchContact) {
        results.push({
          id: `vnd_${v.id}`,
          category: "Vendor",
          title: v.name,
          subtitle: `Categories: ${v.categories.join(", ")} • Rating: ${v.rating}★ • Status: ${v.status}`,
          href: `/hospital-admin/vendors/${v.id}`,
          badgeText: v.status.toUpperCase(),
          snippets: [
            {
              label: "Vendor Master Record",
              text: `Contact Person: ${v.contactPerson} (${v.email}) | On-time Delivery: ${v.onTimeDeliveryRate}% | Outstanding: ₹${v.outstandingPayable.toLocaleString("en-IN")}`,
            },
          ],
        });
      }
    });
  }

  // 12. SEARCH INSURANCE / TPA CLAIMS
  if (categoryFilter === "All" || categoryFilter === "Insurance" || categoryFilter === "Insurance / TPA") {
    mockExtendedInsuranceClaims.forEach((clm) => {
      const matchClaimNo = clm.claimNo.toLowerCase().includes(q);
      const matchPatient = clm.patientName.toLowerCase().includes(q);
      const matchTpa = clm.tpaProvider.toLowerCase().includes(q);
      const matchPolicy = clm.policyNo.toLowerCase().includes(q);

      if (matchClaimNo || matchPatient || matchTpa || matchPolicy) {
        results.push({
          id: `clm_${clm.id}`,
          category: "Insurance / TPA",
          title: `Claim ${clm.claimNo}: ${clm.patientName}`,
          subtitle: `TPA: ${clm.tpaProvider} • Policy: ${clm.policyNo} • Claimed: ${formatCurrency(clm.claimAmount)}`,
          href: `/hospital-admin/insurance-tpa`,
          badgeText: clm.status,
          snippets: [
            {
              label: "Insurance Cashless Claim",
              text: `Approved: ${formatCurrency(clm.approvedAmount)} (85%) | Patient Copay: ${formatCurrency(clm.copayAmount)} (15%) | Status: ${clm.status}`,
            },
          ],
        });
      }
    });
  }

  // 13. SEARCH EMERGENCY (MOCKED PERMISSION-GATED ACTIVE SOS CASES)
  if (categoryFilter === "All" || categoryFilter === "Emergency SOS" || categoryFilter === "Emergency") {
    const mockSosCases = [
      {
        id: "em_101",
        caseNumber: "EM-2026-901",
        patientName: "Karan Singh",
        chiefComplaint: "Acute STEMI Anterolateral Myocardial Infarction — Code STEMI Active",
        triageLevel: "Red (Resuscitation)",
        assignedBay: "Resuscitation Bay 1",
        status: "Active",
      },
      {
        id: "em_102",
        caseNumber: "EM-2026-902",
        patientName: "Divya Nair",
        chiefComplaint: "Severe Polytrauma with Pelvic Fracture & Hypotension",
        triageLevel: "Red (Resuscitation)",
        assignedBay: "Trauma Bay 2",
        status: "Active",
      },
      {
        id: "em_103",
        caseNumber: "EM-2026-903",
        patientName: "Anand Joshi",
        chiefComplaint: "Acute Exacerbation of COPD with Type 2 Respiratory Failure",
        triageLevel: "Yellow (Emergent)",
        assignedBay: "Observation Bay 4",
        status: "In Progress",
      },
    ];

    mockSosCases.forEach((em) => {
      const matchCase = em.caseNumber.toLowerCase().includes(q);
      const matchPatient = em.patientName.toLowerCase().includes(q);
      const matchComplaint = em.chiefComplaint.toLowerCase().includes(q);
      const matchTriage = em.triageLevel.toLowerCase().includes(q);

      if (matchCase || matchPatient || matchComplaint || matchTriage) {
        results.push({
          id: `em_${em.id}`,
          category: "Emergency SOS",
          title: `Emergency Case ${em.caseNumber}: ${em.patientName}`,
          subtitle: `Triage: ${em.triageLevel} • ${em.assignedBay} • ${em.chiefComplaint}`,
          href: `/hospital-admin/emergency`,
          urgencyLevel: em.triageLevel.includes("Red") ? "critical" : "warning",
          badgeText: em.triageLevel.split(" ")[0].toUpperCase(),
          snippets: [
            {
              label: "Emergency SOS Response Record",
              text: `Chief Complaint: "${em.chiefComplaint}" | Location: ${em.assignedBay} | Priority: ${em.triageLevel} | Status: ${em.status}`,
            },
          ],
        });
      }
    });
  }

  // 14. SEARCH QUICK ACTIONS
  if (categoryFilter === "All" || categoryFilter === "Quick Actions" || categoryFilter === "Quick Action") {
    STANDARD_QUICK_ACTIONS.forEach((qa) => {
      const matchTitle = qa.title.toLowerCase().includes(q);
      const matchDesc = qa.description.toLowerCase().includes(q);

      if (matchTitle || matchDesc) {
        results.push({
          id: `qa_${qa.id}`,
          category: "Quick Action",
          title: qa.title,
          subtitle: qa.description,
          href: qa.href,
          badgeText: qa.category,
          snippets: [
            {
              label: "Quick Action Shortcut",
              text: `${qa.description} → Direct jump to ${qa.href}`,
            },
          ],
        });
      }
    });
  }

  return results;
}
