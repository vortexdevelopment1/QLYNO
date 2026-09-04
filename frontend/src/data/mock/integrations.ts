import type { IntegrationEvent, AuditEvent, Site, Department, UserAccount } from "@/lib/types/domain";

export const MOCK_SITES: Site[] = [
  { id: "SITE-01", name: "Sunrise Hospital — Central Lab", type: "hospital_lab", city: "Mumbai" },
  { id: "SITE-02", name: "HMS Diagnostics — Andheri Branch", type: "standalone_branch", city: "Mumbai" },
  { id: "SITE-03", name: "HMS Diagnostics — Thane Branch", type: "standalone_branch", city: "Thane" },
  { id: "SITE-04", name: "Vashi Collection Center", type: "collection_center", city: "Navi Mumbai" },
  { id: "SITE-05", name: "Central Reference Hub", type: "reference_hub", city: "Mumbai" },
];

export const MOCK_DEPARTMENTS: Department[] = [
  { id: "DEPT-01", name: "Chemistry", siteId: "SITE-01" },
  { id: "DEPT-02", name: "Hematology", siteId: "SITE-01" },
  { id: "DEPT-03", name: "Coagulation", siteId: "SITE-01" },
  { id: "DEPT-04", name: "Immunology", siteId: "SITE-02" },
  { id: "DEPT-05", name: "Microbiology", siteId: "SITE-01" },
  { id: "DEPT-06", name: "Molecular", siteId: "SITE-05" },
  { id: "DEPT-07", name: "Pathology", siteId: "SITE-05" },
  { id: "DEPT-08", name: "Urinalysis", siteId: "SITE-02" },
];

export const MOCK_USERS: UserAccount[] = [
  { id: "USR-01", name: "Dr. Sanjeev Kelkar", initials: "SK", roleId: "lab_director", siteId: "SITE-01" },
  { id: "USR-02", name: "Anita Rane", initials: "AR", roleId: "quality_manager", siteId: "SITE-01" },
  { id: "USR-03", name: "Deepak Shetty", initials: "DS", roleId: "section_supervisor", siteId: "SITE-01" },
  { id: "USR-04", name: "Pooja Iyer", initials: "PI", roleId: "technologist", siteId: "SITE-01" },
  { id: "USR-05", name: "Rahul Salvi", initials: "RS", roleId: "accessioning", siteId: "SITE-02" },
  { id: "USR-06", name: "Nikita Bhosale", initials: "NB", roleId: "phlebotomist", siteId: "SITE-01" },
  { id: "USR-07", name: "Sandeep Yadav", initials: "SY", roleId: "courier", siteId: "SITE-04" },
  { id: "USR-08", name: "Farah Sheikh", initials: "FS", roleId: "reception_cashier", siteId: "SITE-02" },
  { id: "USR-09", name: "Manoj Pillai", initials: "MP", roleId: "inventory_procurement", siteId: "SITE-02" },
  { id: "USR-10", name: "Aarti Desai", initials: "AD", roleId: "tenant_admin", siteId: "SITE-01" },
];

export const MOCK_INTEGRATIONS: IntegrationEvent[] = [
  { id: "INT-01", system: "Sunrise HIS (HL7 v2)", category: "HIS_EMR", status: "connected", lastSync: "2026-08-23T09:58:00+05:30", errorCount: 0, mappingVersion: "hl7-map-v5.1" },
  { id: "INT-02", system: "Sunrise HMS Central Billing", category: "HMS_BILLING", status: "degraded", lastSync: "2026-08-23T07:40:00+05:30", errorCount: 3, mappingVersion: "billing-map-v2.4" },
  { id: "INT-03", system: "ABDM Health ID Gateway", category: "ABDM_FHIR", status: "connected", lastSync: "2026-08-23T09:30:00+05:30", errorCount: 0, mappingVersion: "fhir-r4-v1.2" },
  { id: "INT-04", system: "Analyzer Middleware (Instrument Manager)", category: "ANALYZER", status: "connected", lastSync: "2026-08-23T09:59:00+05:30", errorCount: 1, mappingVersion: "map-v3.0" },
  { id: "INT-05", system: "Zebra ZD621 Label Printers", category: "PRINTER", status: "connected", lastSync: "2026-08-23T09:55:00+05:30", errorCount: 0, mappingVersion: "n/a" },
  { id: "INT-06", system: "Metropolis Reference Lab Portal", category: "REFERENCE_LAB", status: "connected", lastSync: "2026-08-23T08:20:00+05:30", errorCount: 0, mappingVersion: "ref-v1.1" },
  { id: "INT-07", system: "Razorpay Payment Gateway", category: "PAYMENT", status: "connected", lastSync: "2026-08-23T08:20:00+05:30", errorCount: 0, mappingVersion: "n/a" },
  { id: "INT-08", system: "WhatsApp / SMS Gateway", category: "MESSAGING", status: "degraded", lastSync: "2026-08-23T09:10:00+05:30", errorCount: 5, mappingVersion: "n/a" },
  { id: "INT-09", system: "Azure AD SSO", category: "SSO", status: "connected", lastSync: "2026-08-23T09:00:00+05:30", errorCount: 0, mappingVersion: "n/a" },
];

export const MOCK_AUDIT_EVENTS: AuditEvent[] = [
  { id: "AUD-1", entity: "Report", entityId: "RPT-8003-v2", action: "Report corrected — version 2 released", actor: "Dr. Sanjeev Kelkar", timestamp: "2026-08-21T16:30:00+05:30" },
  { id: "AUD-2", entity: "Specimen", entityId: "SPX-9006R", action: "Specimen rejected — insufficient volume", actor: "Rahul Salvi", timestamp: "2026-08-23T05:40:00+05:30" },
  { id: "AUD-3", entity: "QC Run", entityId: "QC-4402", action: "Westgard 1-3s violation flagged, run blocked", actor: "System", timestamp: "2026-08-23T06:02:00+05:30" },
  { id: "AUD-4", entity: "Order", entityId: "ORD-70016", action: "HMS charge posting failed — reconciliation required", actor: "System", timestamp: "2026-08-23T07:00:00+05:30" },
  { id: "AUD-5", entity: "User", entityId: "USR-10", action: "Role permissions updated for Tenant Administrator", actor: "Aarti Desai", timestamp: "2026-08-20T15:12:00+05:30" },
];
