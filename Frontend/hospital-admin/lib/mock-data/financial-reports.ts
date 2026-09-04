import {
  ExpenseRecord,
  RevenueStreamSummary,
  CollectionChannelSummary,
  ArAgingBucket,
  DepartmentRevenueSummary,
  DoctorRevenueSummary,
  ServiceCategoryRevenueSummary,
  CashierPerformanceReport,
} from "@/hospital-admin/lib/types/financial-reports";

// ==========================================
// 1. REVENUE STREAMS & TRENDS (Derived from F11)
// ==========================================
export const mockRevenueStreams: RevenueStreamSummary[] = [
  {
    category: "Inpatient (IPD) Ward & ICU",
    grossAmount: 7850000,
    discounts: 240000,
    netRevenue: 7610000,
    percentageShare: 41.4,
    invoiceCount: 482,
    trend: "+12.4%",
  },
  {
    category: "Surgical Operations & Cath Lab",
    grossAmount: 4120000,
    discounts: 110000,
    netRevenue: 4010000,
    percentageShare: 21.8,
    invoiceCount: 164,
    trend: "+8.2%",
  },
  {
    category: "Outpatient (OPD) Consultations",
    grossAmount: 2480000,
    discounts: 60000,
    netRevenue: 2420000,
    percentageShare: 13.2,
    invoiceCount: 4210,
    trend: "+6.5%",
  },
  {
    category: "Central Hospital Pharmacy",
    grossAmount: 1940000,
    discounts: 45000,
    netRevenue: 1895000,
    percentageShare: 10.3,
    invoiceCount: 3820,
    trend: "+9.1%",
  },
  {
    category: "Radiology & Advanced Imaging",
    grossAmount: 1380000,
    discounts: 30000,
    netRevenue: 1350000,
    percentageShare: 7.3,
    invoiceCount: 920,
    trend: "+14.0%",
  },
  {
    category: "Laboratory & Pathology Diagnostics",
    grossAmount: 1120000,
    discounts: 25000,
    netRevenue: 1095000,
    percentageShare: 6.0,
    invoiceCount: 2640,
    trend: "+5.8%",
  },
];

export const mockMonthlyRevenueTrend = [
  { month: "Mar 2026", grossRevenue: 16200000, collections: 14400000, expenses: 10800000 },
  { month: "Apr 2026", grossRevenue: 16800000, collections: 15100000, expenses: 11100000 },
  { month: "May 2026", grossRevenue: 17400000, collections: 15600000, expenses: 11300000 },
  { month: "Jun 2026", grossRevenue: 17900000, collections: 16000000, expenses: 11500000 },
  { month: "Jul 2026", grossRevenue: 18100000, collections: 16100000, expenses: 11700000 },
  { month: "Aug 2026 (MTD)", grossRevenue: 18890000, collections: 16380000, expenses: 11820000 },
];

export const mockDailyRevenueData = [
  { date: "Aug 18", opd: 82000, ipd: 254000, ot: 140000, diagnostics: 84000, pharmacy: 62000 },
  { date: "Aug 19", opd: 91000, ipd: 280000, ot: 165000, diagnostics: 92000, pharmacy: 68000 },
  { date: "Aug 20", opd: 88000, ipd: 260000, ot: 130000, diagnostics: 86000, pharmacy: 64000 },
  { date: "Aug 21", opd: 94000, ipd: 310000, ot: 180000, diagnostics: 98000, pharmacy: 72000 },
  { date: "Aug 22", opd: 98000, ipd: 295000, ot: 155000, diagnostics: 90000, pharmacy: 70000 },
  { date: "Aug 23", opd: 110000, ipd: 340000, ot: 210000, diagnostics: 115000, pharmacy: 82000 },
  { date: "Aug 24", opd: 65000, ipd: 210000, ot: 95000, diagnostics: 58000, pharmacy: 48000 },
];

// ==========================================
// 2. COLLECTIONS BY CHANNEL (Derived from F16)
// ==========================================
export const mockCollectionChannels: CollectionChannelSummary[] = [
  {
    method: "UPI & QR Instant Payments",
    amountCollected: 5840000,
    transactionCount: 5420,
    percentageShare: 35.7,
    gatewayFeeDeducted: 0,
    reconciliationStatus: "Reconciled",
  },
  {
    method: "POS Terminal (Debit / Credit Cards)",
    amountCollected: 4620000,
    transactionCount: 2180,
    percentageShare: 28.2,
    gatewayFeeDeducted: 41580,
    reconciliationStatus: "Reconciled",
  },
  {
    method: "Insurance & TPA Direct NEFT Settlement",
    amountCollected: 3820000,
    transactionCount: 142,
    percentageShare: 23.3,
    gatewayFeeDeducted: 0,
    reconciliationStatus: "Reconciled",
  },
  {
    method: "Cash Desk Collections",
    amountCollected: 1680000,
    transactionCount: 1840,
    percentageShare: 10.3,
    gatewayFeeDeducted: 0,
    reconciliationStatus: "Reconciled",
  },
  {
    method: "Net Banking & Corporate Wire",
    amountCollected: 420000,
    transactionCount: 46,
    percentageShare: 2.5,
    gatewayFeeDeducted: 1200,
    reconciliationStatus: "Pending Bank Advice",
  },
];

// ==========================================
// 3. ACCOUNTS RECEIVABLE (AR) AGING BUCKETS (Derived from F11/F17)
// ==========================================
export const mockArAgingBuckets: ArAgingBucket[] = [
  {
    bucket: "0–30 Days",
    selfPayAmount: 420000,
    tpaInsuranceAmount: 7800000,
    govtSchemeAmount: 1650000,
    totalOutstanding: 9870000,
    invoiceCount: 184,
    riskLevel: "Low",
  },
  {
    bucket: "31–60 Days",
    selfPayAmount: 280000,
    tpaInsuranceAmount: 4200000,
    govtSchemeAmount: 2450000,
    totalOutstanding: 6930000,
    invoiceCount: 92,
    riskLevel: "Medium",
  },
  {
    bucket: "61–90 Days",
    selfPayAmount: 190000,
    tpaInsuranceAmount: 1850000,
    govtSchemeAmount: 1920000,
    totalOutstanding: 3960000,
    invoiceCount: 46,
    riskLevel: "High",
  },
  {
    bucket: "90+ Days",
    selfPayAmount: 150000,
    tpaInsuranceAmount: 640000,
    govtSchemeAmount: 890000,
    totalOutstanding: 1680000,
    invoiceCount: 28,
    riskLevel: "Critical Bad Debt",
  },
];

// ==========================================
// 4. DEPARTMENT REVENUE MATRIX (Derived from F11 × Depts)
// ==========================================
export const mockDepartmentRevenues: DepartmentRevenueSummary[] = [
  {
    departmentId: "dept_cardio",
    departmentName: "Cardiology & Cath Lab",
    headOfDept: "Dr. Arvind Swaminathan",
    opdRevenue: 640000,
    ipdRevenue: 2850000,
    procedureRevenue: 2420000,
    totalGrossRevenue: 5910000,
    directExpenses: 3120000,
    netOperatingContribution: 2790000,
    contributionMarginPercent: 47.2,
  },
  {
    departmentId: "dept_ortho",
    departmentName: "Orthopaedics & Joint Replacement",
    headOfDept: "Dr. Ramesh Sharma",
    opdRevenue: 520000,
    ipdRevenue: 1980000,
    procedureRevenue: 1650000,
    totalGrossRevenue: 4150000,
    directExpenses: 2240000,
    netOperatingContribution: 1910000,
    contributionMarginPercent: 46.0,
  },
  {
    departmentId: "dept_neuro",
    departmentName: "Neurology & Neurosurgery",
    headOfDept: "Dr. Sunita Kulkarni",
    opdRevenue: 410000,
    ipdRevenue: 1820000,
    procedureRevenue: 1180000,
    totalGrossRevenue: 3410000,
    directExpenses: 1890000,
    netOperatingContribution: 1520000,
    contributionMarginPercent: 44.6,
  },
  {
    departmentId: "dept_genmed",
    departmentName: "General Medicine & Critical Care",
    headOfDept: "Dr. Ananya Patel",
    opdRevenue: 580000,
    ipdRevenue: 1420000,
    procedureRevenue: 120000,
    totalGrossRevenue: 2120000,
    directExpenses: 1180000,
    netOperatingContribution: 940000,
    contributionMarginPercent: 44.3,
  },
  {
    departmentId: "dept_emerg",
    departmentName: "Emergency & Trauma Services",
    headOfDept: "Dr. Suresh Menon",
    opdRevenue: 310000,
    ipdRevenue: 980000,
    procedureRevenue: 450000,
    totalGrossRevenue: 1740000,
    directExpenses: 1140000,
    netOperatingContribution: 600000,
    contributionMarginPercent: 34.5,
  },
  {
    departmentId: "dept_paed",
    departmentName: "Paediatrics & Neonatology",
    headOfDept: "Dr. Meera Nambiar",
    opdRevenue: 420000,
    ipdRevenue: 640000,
    procedureRevenue: 110000,
    totalGrossRevenue: 1170000,
    directExpenses: 680000,
    netOperatingContribution: 490000,
    contributionMarginPercent: 41.9,
  },
];

// ==========================================
// 5. DOCTOR REVENUE MATRIX (Derived from F11 × Doctors)
// ==========================================
export const mockDoctorRevenues: DoctorRevenueSummary[] = [
  {
    doctorId: "doc_101",
    doctorName: "Dr. Arvind Swaminathan",
    specialty: "Interventional Cardiology",
    consultationRevenue: 380000,
    surgicalProcedureRevenue: 2420000,
    ipdAdmissionsSupervised: 68,
    ipdRevenueAttributed: 1850000,
    totalAttributedRevenue: 4650000,
    patientVolume: 412,
  },
  {
    doctorId: "doc_102",
    doctorName: "Dr. Ramesh Sharma",
    specialty: "Orthopaedic & Spine Surgeon",
    consultationRevenue: 310000,
    surgicalProcedureRevenue: 1650000,
    ipdAdmissionsSupervised: 52,
    ipdRevenueAttributed: 1420000,
    totalAttributedRevenue: 3380000,
    patientVolume: 348,
  },
  {
    doctorId: "doc_103",
    doctorName: "Dr. Sunita Kulkarni",
    specialty: "Senior Neurosurgeon",
    consultationRevenue: 290000,
    surgicalProcedureRevenue: 1180000,
    ipdAdmissionsSupervised: 44,
    ipdRevenueAttributed: 1240000,
    totalAttributedRevenue: 2710000,
    patientVolume: 290,
  },
  {
    doctorId: "doc_104",
    doctorName: "Dr. Ananya Patel",
    specialty: "General Physician & Diabetologist",
    consultationRevenue: 450000,
    surgicalProcedureRevenue: 0,
    ipdAdmissionsSupervised: 72,
    ipdRevenueAttributed: 1120000,
    totalAttributedRevenue: 1570000,
    patientVolume: 620,
  },
  {
    doctorId: "doc_105",
    doctorName: "Dr. Vikram Seth",
    specialty: "Chief Radiologist",
    consultationRevenue: 120000,
    surgicalProcedureRevenue: 450000,
    ipdAdmissionsSupervised: 18,
    ipdRevenueAttributed: 380000,
    totalAttributedRevenue: 950000,
    patientVolume: 510,
  },
];

// ==========================================
// 6. SERVICE CATEGORIES REVENUE (Derived from F11)
// ==========================================
export const mockServiceCategoryRevenues: ServiceCategoryRevenueSummary[] = [
  {
    category: "Room & Bed Charges",
    itemCount: 482,
    billedAmount: 4850000,
    concessions: 120000,
    netRealized: 4730000,
    marginPercent: 62.5,
  },
  {
    category: "Surgeries & OT",
    itemCount: 164,
    billedAmount: 4120000,
    concessions: 110000,
    netRealized: 4010000,
    marginPercent: 48.0,
  },
  {
    category: "Consultations",
    itemCount: 4210,
    billedAmount: 2480000,
    concessions: 60000,
    netRealized: 2420000,
    marginPercent: 78.4,
  },
  {
    category: "Pharmacy Formulary",
    itemCount: 3820,
    billedAmount: 1940000,
    concessions: 45000,
    netRealized: 1895000,
    marginPercent: 28.5,
  },
  {
    category: "Radiology & Imaging",
    itemCount: 920,
    billedAmount: 1380000,
    concessions: 30000,
    netRealized: 1350000,
    marginPercent: 54.2,
  },
  {
    category: "Lab Diagnostics",
    itemCount: 2640,
    billedAmount: 1120000,
    concessions: 25000,
    netRealized: 1095000,
    marginPercent: 61.0,
  },
];

// ==========================================
// 7. CASHIER & COUNTER RECONCILIATION (Derived from F16)
// ==========================================
export const mockCashierReports: CashierPerformanceReport[] = [
  {
    cashierId: "csh_01",
    cashierName: "Suresh Menon",
    counterName: "Counter 1 (Main OPD Desk)",
    shiftDate: "2026-08-25",
    openingFloat: 5000,
    cashCollected: 48000,
    posCollected: 86000,
    upiCollected: 112000,
    totalCollected: 246000,
    refundsProcessed: 2000,
    closingBalance: 51000,
    variance: 0,
    reconciliationStatus: "Balanced",
  },
  {
    cashierId: "csh_02",
    cashierName: "Pooja Hegde",
    counterName: "Counter 2 (Inpatient Admissions & Discharge)",
    shiftDate: "2026-08-25",
    openingFloat: 10000,
    cashCollected: 94000,
    posCollected: 310000,
    upiCollected: 240000,
    totalCollected: 644000,
    refundsProcessed: 15000,
    closingBalance: 89000,
    variance: 0,
    reconciliationStatus: "Balanced",
  },
  {
    cashierId: "csh_03",
    cashierName: "Rahul Sharma",
    counterName: "Counter 3 (Pharmacy POS 24x7)",
    shiftDate: "2026-08-25",
    openingFloat: 5000,
    cashCollected: 32000,
    posCollected: 45000,
    upiCollected: 98000,
    totalCollected: 175000,
    refundsProcessed: 1200,
    closingBalance: 35800,
    variance: 0,
    reconciliationStatus: "Balanced",
  },
  {
    cashierId: "csh_04",
    cashierName: "Vikram Gaikwad",
    counterName: "Counter 4 (Emergency & Trauma Desk)",
    shiftDate: "2026-08-25",
    openingFloat: 10000,
    cashCollected: 62000,
    posCollected: 94000,
    upiCollected: 58000,
    totalCollected: 214000,
    refundsProcessed: 0,
    closingBalance: 72000,
    variance: 0,
    reconciliationStatus: "Balanced",
  },
];

// ==========================================
// 8. OPERATING EXPENSES (New Entity)
// ==========================================
export const mockExpenseRecords: ExpenseRecord[] = [
  {
    id: "exp_01",
    expenseNo: "EXP-2026-901",
    category: "Payroll",
    amount: 5400000,
    department: "Human Resources / All Depts",
    date: "2026-08-01",
    approvedBy: "Director of Administration",
    vendorName: "Staff Monthly Payroll Disbursal",
    notes: "Doctors, clinical nurses, allied health, and support staff salary disbursal for July 2026.",
    status: "Approved",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "exp_02",
    expenseNo: "EXP-2026-902",
    category: "Procurement/Supplies",
    amount: 2850000,
    department: "Central Store & Pharmacy",
    date: "2026-08-08",
    approvedBy: "Procurement Committee",
    linkedPoId: "PO-2026-8801",
    vendorName: "3M India & Abbott Healthcare",
    notes: "Bulk surgical consumables, cardiac stents, and pharmaceutical formulary restock.",
    status: "Approved",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "exp_03",
    expenseNo: "EXP-2026-903",
    category: "Utilities",
    amount: 980000,
    department: "Facility Operations & Maintenance",
    date: "2026-08-12",
    approvedBy: "Hospital Admin",
    vendorName: "Tata Power & Central Medical Gas Manifold",
    notes: "High-tension electricity bill, generator diesel reserve, and liquid medical oxygen refilling.",
    status: "Approved",
    paymentMethod: "Direct Debit",
  },
  {
    id: "exp_04",
    expenseNo: "EXP-2026-904",
    category: "Procurement/Supplies",
    amount: 1450000,
    department: "Radiology & Orthopaedics",
    date: "2026-08-15",
    approvedBy: "Medical Board Director",
    linkedPoId: "PO-2026-8804",
    vendorName: "Smith & Nephew Medical",
    notes: "Titanium orthopaedic implants, prosthetic knee joints, and MRI contrast reagents.",
    status: "Approved",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "exp_05",
    expenseNo: "EXP-2026-905",
    category: "Maintenance",
    amount: 640000,
    department: "Biomedical Engineering",
    date: "2026-08-20",
    approvedBy: "Hospital Admin",
    vendorName: "Siemens Healthineers CMC",
    notes: "Comprehensive maintenance contract (CMC) quarterly installment for 128-Slice CT and 3T MRI.",
    status: "Approved",
    paymentMethod: "Corporate Card",
  },
  {
    id: "exp_06",
    expenseNo: "EXP-2026-906",
    category: "Other",
    amount: 500000,
    department: "Administration & Quality",
    date: "2026-08-22",
    approvedBy: "Quality Compliance Head",
    vendorName: "NABH Accreditation Board",
    notes: "NABH Hospital Surveillance Assessment Fee and statutory biomedical waste renewal certification.",
    status: "Approved",
    paymentMethod: "Bank Transfer",
  },
];

// ==========================================
// DYNAMIC PERIOD DATA GENERATORS
// ==========================================
export function getScaledRevenueStreams(multiplier: number = 1.0): RevenueStreamSummary[] {
  return mockRevenueStreams.map((s) => ({
    ...s,
    grossAmount: Math.round(s.grossAmount * multiplier),
    discounts: Math.round(s.discounts * multiplier),
    netRevenue: Math.round(s.netRevenue * multiplier),
    invoiceCount: Math.max(1, Math.round(s.invoiceCount * multiplier)),
  }));
}

export function getScaledCollectionChannels(multiplier: number = 1.0): CollectionChannelSummary[] {
  return mockCollectionChannels.map((c) => ({
    ...c,
    amountCollected: Math.round(c.amountCollected * multiplier),
    transactionCount: Math.max(1, Math.round(c.transactionCount * multiplier)),
    gatewayFeeDeducted: Math.round(c.gatewayFeeDeducted * multiplier),
  }));
}

export function getScaledArAgingBuckets(multiplier: number = 1.0): ArAgingBucket[] {
  return mockArAgingBuckets.map((b) => ({
    ...b,
    selfPayAmount: Math.round(b.selfPayAmount * multiplier),
    tpaInsuranceAmount: Math.round(b.tpaInsuranceAmount * multiplier),
    govtSchemeAmount: Math.round(b.govtSchemeAmount * multiplier),
    totalOutstanding: Math.round(b.totalOutstanding * multiplier),
    invoiceCount: Math.max(1, Math.round(b.invoiceCount * multiplier)),
  }));
}

export function getScaledDepartmentRevenues(multiplier: number = 1.0): DepartmentRevenueSummary[] {
  return mockDepartmentRevenues.map((d) => {
    const gross = Math.round(d.totalGrossRevenue * multiplier);
    const exp = Math.round(d.directExpenses * multiplier);
    const net = gross - exp;
    return {
      ...d,
      opdRevenue: Math.round(d.opdRevenue * multiplier),
      ipdRevenue: Math.round(d.ipdRevenue * multiplier),
      procedureRevenue: Math.round(d.procedureRevenue * multiplier),
      totalGrossRevenue: gross,
      directExpenses: exp,
      netOperatingContribution: net,
    };
  });
}

export function getScaledDoctorRevenues(multiplier: number = 1.0): DoctorRevenueSummary[] {
  return mockDoctorRevenues.map((doc) => {
    const consult = Math.round(doc.consultationRevenue * multiplier);
    const surg = Math.round(doc.surgicalProcedureRevenue * multiplier);
    const ipd = Math.round(doc.ipdRevenueAttributed * multiplier);
    return {
      ...doc,
      consultationRevenue: consult,
      surgicalProcedureRevenue: surg,
      ipdRevenueAttributed: ipd,
      totalAttributedRevenue: consult + surg + ipd,
      ipdAdmissionsSupervised: Math.max(1, Math.round(doc.ipdAdmissionsSupervised * multiplier)),
      patientVolume: Math.max(1, Math.round(doc.patientVolume * multiplier)),
    };
  });
}

export function getScaledServiceCategoryRevenues(multiplier: number = 1.0): ServiceCategoryRevenueSummary[] {
  return mockServiceCategoryRevenues.map((s) => ({
    ...s,
    itemCount: Math.max(1, Math.round(s.itemCount * multiplier)),
    billedAmount: Math.round(s.billedAmount * multiplier),
    concessions: Math.round(s.concessions * multiplier),
    netRealized: Math.round(s.netRealized * multiplier),
  }));
}

export function getScaledCashierReports(multiplier: number = 1.0): CashierPerformanceReport[] {
  return mockCashierReports.map((c) => {
    const cash = Math.round(c.cashCollected * multiplier);
    const pos = Math.round(c.posCollected * multiplier);
    const upi = Math.round(c.upiCollected * multiplier);
    return {
      ...c,
      cashCollected: cash,
      posCollected: pos,
      upiCollected: upi,
      totalCollected: cash + pos + upi,
      refundsProcessed: Math.round(c.refundsProcessed * multiplier),
      closingBalance: Math.round(c.closingBalance * multiplier),
    };
  });
}

export function getScaledExpenses(multiplier: number = 1.0): ExpenseRecord[] {
  return mockExpenseRecords.map((e) => ({
    ...e,
    amount: Math.round(e.amount * multiplier),
  }));
}

