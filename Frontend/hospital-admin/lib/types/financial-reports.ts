export type ExpenseCategory =
  | "Payroll"
  | "Utilities"
  | "Procurement/Supplies"
  | "Maintenance"
  | "Other";

export type ExpenseStatus = "Approved" | "Pending Approval" | "Rejected";

export interface ExpenseRecord {
  id: string;
  expenseNo: string;
  category: ExpenseCategory;
  amount: number;
  department: string;
  date: string;
  approvedBy: string;
  linkedPoId?: string;
  vendorName?: string;
  notes: string;
  status: ExpenseStatus;
  paymentMethod: "Bank Transfer" | "Cheque" | "Corporate Card" | "Direct Debit";
}

export interface FinancialReportConfig {
  id: string;
  reportType:
    | "Revenue"
    | "Collections"
    | "Outstanding"
    | "Department Revenue"
    | "Doctor Revenue"
    | "Service Revenue"
    | "Payment Reports"
    | "Profit/Expense";
  period: "Today" | "This Week" | "This Month" | "This Quarter" | "FY 2025-26" | "Custom";
  startDate?: string;
  endDate?: string;
  filters?: Record<string, any>;
  schedule?: "Daily" | "Weekly" | "Monthly";
  recipients?: string[];
}

export interface RevenueStreamSummary {
  category: string;
  grossAmount: number;
  discounts: number;
  netRevenue: number;
  percentageShare: number;
  invoiceCount: number;
  trend: string;
}

export interface CollectionChannelSummary {
  method: string;
  amountCollected: number;
  transactionCount: number;
  percentageShare: number;
  gatewayFeeDeducted: number;
  reconciliationStatus: "Reconciled" | "Pending Bank Advice";
}

export interface ArAgingBucket {
  bucket: "0–30 Days" | "31–60 Days" | "61–90 Days" | "90+ Days";
  selfPayAmount: number;
  tpaInsuranceAmount: number;
  govtSchemeAmount: number;
  totalOutstanding: number;
  invoiceCount: number;
  riskLevel: "Low" | "Medium" | "High" | "Critical Bad Debt";
}

export interface DepartmentRevenueSummary {
  departmentId: string;
  departmentName: string;
  headOfDept: string;
  opdRevenue: number;
  ipdRevenue: number;
  procedureRevenue: number;
  totalGrossRevenue: number;
  directExpenses: number;
  netOperatingContribution: number;
  contributionMarginPercent: number;
}

export interface DoctorRevenueSummary {
  doctorId: string;
  doctorName: string;
  specialty: string;
  consultationRevenue: number;
  surgicalProcedureRevenue: number;
  ipdAdmissionsSupervised: number;
  ipdRevenueAttributed: number;
  totalAttributedRevenue: number;
  patientVolume: number;
}

export interface ServiceCategoryRevenueSummary {
  category: "Consultations" | "Surgeries & OT" | "Lab Diagnostics" | "Radiology & Imaging" | "Pharmacy Formulary" | "Room & Bed Charges";
  itemCount: number;
  billedAmount: number;
  concessions: number;
  netRealized: number;
  marginPercent: number;
}

export interface CashierPerformanceReport {
  cashierId: string;
  cashierName: string;
  counterName: string;
  shiftDate: string;
  openingFloat: number;
  cashCollected: number;
  posCollected: number;
  upiCollected: number;
  totalCollected: number;
  refundsProcessed: number;
  closingBalance: number;
  variance: number;
  reconciliationStatus: "Balanced" | "Variance Investigated" | "Pending Handover";
}
