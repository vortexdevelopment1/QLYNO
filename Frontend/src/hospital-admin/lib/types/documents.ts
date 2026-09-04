export type DocumentCategory =
  | "Hospital Documents"
  | "Staff Documents"
  | "Licenses"
  | "Certificates"
  | "Policies"
  | "Contracts";

export type SecurityClassification =
  | "Public Redacted"
  | "Internal Staff Read-Only"
  | "Restricted: Clinical Leads"
  | "Confidential: Admin & Compliance";

export type RedactionStatus =
  | "Not Required"
  | "PII Redacted (Rule 13.1 Verified)"
  | "Pending Redaction";

export interface DocumentVersionEntry {
  version: string;
  modifiedAt: string;
  modifiedBy: string;
  changeSummary: string;
  fileUrl: string;
  fileSize: string;
}

export interface HospitalDocumentItem {
  id: string;
  documentCode: string;
  title: string;
  category: DocumentCategory;
  subCategory: string; // e.g. 'Clinical SOP', 'Consent Template', 'Professional License', 'Equipment Calibration', 'AMC/CMC Contract', 'Statutory Clearance'
  departmentId?: string | null;
  departmentName?: string | null;
  linkedEntityId?: string | null;
  linkedEntityName?: string | null;
  linkedEntityType?:
    | "Doctor"
    | "Nurse"
    | "SupportStaff"
    | "Asset"
    | "Vendor"
    | "Department"
    | "Institution"
    | null;
  version: string;
  versionHistory: DocumentVersionEntry[];
  issuerAuthority: string;
  issueDate: string;
  expiryDate?: string | null;
  expiryAlertDays?: 30 | 60 | 90 | null;
  isExpired: boolean;
  securityClassification: SecurityClassification;
  isPublicCertificate: boolean;
  redactionStatus: RedactionStatus;
  fileUrl: string;
  fileSize: string;
  fileType: "PDF" | "DOCX" | "IMAGE";
  uploadedBy: string;
  uploadedAt: string;
  evidenceViewerUrl?: string | null;
  tags: string[];
}

export interface PolicyTemplateItem {
  id: string;
  code: string;
  title: string;
  type: "Clinical SOP" | "Consent Template" | "Institutional Policy" | "Legal Undertaking";
  department: string;
  applicableClinicalWorkflows: string[]; // e.g. ['IPD Admission', 'OT Surgery', 'Emergency', 'Blood Transfusion']
  version: string;
  effectiveDate: string;
  reviewCycleMonths: number;
  contentBody: string;
  isApproved: boolean;
  approvedBy: string;
  documentId?: string;
}

export interface ContractItem {
  id: string;
  contractCode: string;
  title: string;
  contractType:
    | "Biomedical AMC/CMC"
    | "Consumables Supply Agreement"
    | "Pharmacy Purchase Agreement"
    | "Facility Service SLA"
    | "TPA Insurance Agreement";
  vendorId: string;
  vendorName: string;
  assetId?: string | null;
  assetName?: string | null;
  startDate: string;
  endDate: string;
  annualValue: number; // in INR
  paymentTerms: string;
  renewalStatus: "Active" | "Under Renewal" | "Expiring in 30 Days" | "Terminated";
  slaUptimeCommitment: string; // e.g. '98.5% uptime'
  documentId: string;
}

export interface DMSAnalyticsSummary {
  totalDocumentsCount: number;
  activePoliciesCount: number;
  professionalLicensesCount: number;
  regulatoryCertificatesCount: number;
  activeContractsCount: number;
  expiringIn30DaysCount: number;
  expiringIn60DaysCount: number;
  expiringIn90DaysCount: number;
  publicRedactedCertsCount: number;
}
