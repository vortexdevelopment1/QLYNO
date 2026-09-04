export type VisibilityScope =
  | "Full"
  | "Full permitted"
  | "Full operational"
  | "Permitted hospital scope"
  | "Full emergency ops"
  | "Operational"
  | "Full finance scope"
  | "Full procurement scope"
  | "Hospital scope"
  | "Full audit";

export type CreateEditScope =
  | "Full"
  | "Profile/affiliation"
  | "Operational"
  | "Full operational"
  | "Schedule/resources"
  | "Permissions"
  | "Generate";

export type ApproveOverrideScope =
  | "Full"
  | "Verification workflow"
  | "Full within policy"
  | "Break-glass where allowed"
  | "Emergency routing/escalation"
  | "Allocation override"
  | "Operational override"
  | "Approval per policy"
  | "Approve per policy"
  | "Security override with audit"
  | "N/A";

export interface AdminPermissionEntry {
  id: string;
  moduleName: string;
  category: "Structure & Clinical" | "Workforce & Frontdesk" | "Patient & Emergency" | "Resources & OT" | "Finance & Supply" | "Analytics & Governance";
  viewScope: VisibilityScope;
  createEditScope: CreateEditScope;
  approveOverrideScope: ApproveOverrideScope;
  clinicalDecision: false; // ALWAYS FALSE - Universal Invariant (Rule 23.1)
  requiresStepUp: boolean;
  boundaryRule: string;
  allowedActions: string[];
  restrictedClinicalActions: string[];
}

export const CANONICAL_ADMIN_PERMISSION_MATRIX: AdminPermissionEntry[] = [
  {
    id: "mod_dept",
    moduleName: "Departments",
    category: "Structure & Clinical",
    viewScope: "Full",
    createEditScope: "Full",
    approveOverrideScope: "Full",
    clinicalDecision: false,
    requiresStepUp: false,
    boundaryRule: "Full management of department structures, ward hierarchy, and specialty configurations.",
    allowedActions: ["Create department", "Assign head of dept", "Configure operating hours", "Edit budget allocations"],
    restrictedClinicalActions: ["Diagnose patient condition", "Prescribe clinical protocols", "Dictate medical treatment"],
  },
  {
    id: "mod_doc",
    moduleName: "Doctors",
    category: "Structure & Clinical",
    viewScope: "Full permitted",
    createEditScope: "Profile/affiliation",
    approveOverrideScope: "Verification workflow",
    clinicalDecision: false,
    requiresStepUp: true,
    boundaryRule: "Admin manages profiles, affiliations, and verification lifecycle. Public search publication requires verified status.",
    allowedActions: ["Manage doctor profile", "Link hospital affiliation", "Submit for council verification", "Set consultation slots"],
    restrictedClinicalActions: ["Perform clinical consultations", "Prescribe medications", "Sign off lab/imaging reports"],
  },
  {
    id: "mod_nurse",
    moduleName: "Nurses/Staff",
    category: "Workforce & Frontdesk",
    viewScope: "Full operational",
    createEditScope: "Full",
    approveOverrideScope: "Full within policy",
    clinicalDecision: false,
    requiresStepUp: false,
    boundaryRule: "Manage nursing staff rosters, stations, biometric attendance, and skill qualifications within policy.",
    allowedActions: ["Assign nurse stations", "Create duty shifts", "Approve leave requests", "Record attendance adjustments"],
    restrictedClinicalActions: ["Formulate nursing clinical care plans", "Administer IV medication orders without doctor sign-off"],
  },
  {
    id: "mod_recep",
    moduleName: "Reception",
    category: "Workforce & Frontdesk",
    viewScope: "Full operational",
    createEditScope: "Full",
    approveOverrideScope: "Full",
    clinicalDecision: false,
    requiresStepUp: false,
    boundaryRule: "Multi-counter desk scoping, appointment slot allocation, and registration queue orchestration.",
    allowedActions: ["Assign counter desks", "Check in patients", "Generate OPD tokens", "Manage visitor passes"],
    restrictedClinicalActions: ["Triage clinical acuity (requires triage nurse)", "Provide medical counsel"],
  },
  {
    id: "mod_pat",
    moduleName: "Patients",
    category: "Patient & Emergency",
    viewScope: "Permitted hospital scope",
    createEditScope: "Operational",
    approveOverrideScope: "Break-glass where allowed",
    clinicalDecision: false,
    requiresStepUp: true,
    boundaryRule: "Data minimization enforced. Unmasking sensitive EMR records requires audited Break-Glass with mandatory justification.",
    allowedActions: ["Register patient", "Assign Qlyno ID", "Process admissions/discharges", "Request emergency break-glass"],
    restrictedClinicalActions: ["Record medical diagnoses", "Formulate surgical treatment", "Issue prescription orders"],
  },
  {
    id: "mod_emerg",
    moduleName: "Emergency",
    category: "Patient & Emergency",
    viewScope: "Full emergency ops",
    createEditScope: "Full operational",
    approveOverrideScope: "Emergency routing/escalation",
    clinicalDecision: false,
    requiresStepUp: true,
    boundaryRule: "Full command over emergency alerts, SLA escalations, ambulance fleet dispatches, and partner hospital fallbacks.",
    allowedActions: ["Acknowledge SOS beacon", "Dispatch ALS/BLS unit", "Trigger escalation ladder", "Execute partner hospital transfer"],
    restrictedClinicalActions: ["Perform emergency trauma resuscitation", "Decide clinical intubation/tPA administration"],
  },
  {
    id: "mod_beds",
    moduleName: "Beds/Wards",
    category: "Resources & OT",
    viewScope: "Full",
    createEditScope: "Full",
    approveOverrideScope: "Allocation override",
    clinicalDecision: false,
    requiresStepUp: true,
    boundaryRule: "Full ward bed allocation, cleaning turnaround tracking, and administrative allocation overrides during bed pressure.",
    allowedActions: ["Assign ward bed", "Initiate bed cleaning task", "Execute bed transfer", "Override reserved bed block with audit"],
    restrictedClinicalActions: ["Admit patient to ICU without clinical referral", "Discharge patient against medical advice"],
  },
  {
    id: "mod_ot",
    moduleName: "OT/Surgery",
    category: "Resources & OT",
    viewScope: "Operational",
    createEditScope: "Schedule/resources",
    approveOverrideScope: "Operational override",
    clinicalDecision: false,
    requiresStepUp: true,
    boundaryRule: "Operational scope only (scheduling, PAC readiness, implant coordination). Never dictates surgical procedures.",
    allowedActions: ["Schedule OT suite", "Track readiness checklist", "Summon on-call surgeon", "Override OT slot conflict"],
    restrictedClinicalActions: ["Perform surgery", "Decide surgical incision/approach", "Modify anaesthesia clearance (PAC)"],
  },
  {
    id: "mod_bill",
    moduleName: "Billing",
    category: "Finance & Supply",
    viewScope: "Full finance scope",
    createEditScope: "Full",
    approveOverrideScope: "Approval per policy",
    clinicalDecision: false,
    requiresStepUp: true,
    boundaryRule: "Full financial and ledger authority. Tariff discounts and refund approvals require role policy thresholds.",
    allowedActions: ["Generate itemized bill", "Process payment (Cash/Card/UPI)", "Submit TPA claim", "Approve tariff discount per policy"],
    restrictedClinicalActions: ["Alter clinical service codes without clinician justification"],
  },
  {
    id: "mod_vend",
    moduleName: "Vendor",
    category: "Finance & Supply",
    viewScope: "Full procurement scope",
    createEditScope: "Full",
    approveOverrideScope: "Approve per policy",
    clinicalDecision: false,
    requiresStepUp: true,
    boundaryRule: "Full procurement lifecycle. RFQs, multi-vendor quote evaluations, and purchase order authorizations per hospital threshold.",
    allowedActions: ["Create purchase requisition", "Compare vendor quotations", "Approve PO within financial limit", "Record delivery GRN"],
    restrictedClinicalActions: ["Substitute pharmaceutical formulations without Pharmacy Head approval"],
  },
  {
    id: "mod_rep",
    moduleName: "Reports",
    category: "Analytics & Governance",
    viewScope: "Hospital scope",
    createEditScope: "Generate",
    approveOverrideScope: "N/A",
    clinicalDecision: false,
    requiresStepUp: false,
    boundaryRule: "Hospital-wide operational and governance analytics. Reports are view/generate only; override cell is strictly N/A.",
    allowedActions: ["View 12 PRD reports", "Filter by period/dept/facility", "Export PDF/CSV", "Schedule recurring report delivery"],
    restrictedClinicalActions: ["Alter historical clinical dataset logs", "Approve/override analytical audit trails"],
  },
  {
    id: "mod_sec",
    moduleName: "Security",
    category: "Analytics & Governance",
    viewScope: "Full audit",
    createEditScope: "Permissions",
    approveOverrideScope: "Security override with audit",
    clinicalDecision: false,
    requiresStepUp: true,
    boundaryRule: "Full auditability, RBAC assignment, TOTP MFA policies, and audited security overrides.",
    allowedActions: ["Configure RBAC roles", "Enforce 2FA/MFA policy", "Review tamper-evident audit logs", "Terminate active sessions"],
    restrictedClinicalActions: ["Bypass clinical attribution logs", "Falsify administrator action stamps"],
  },
];

/**
 * Runtime Permission Evaluator
 */
export function evaluateAdminAccess(
  moduleName: string,
  actionType: "view" | "create_edit" | "approve_override" | "clinical_decision"
): {
  allowed: boolean;
  scope: string;
  requiresStepUp: boolean;
  message: string;
} {
  const entry = CANONICAL_ADMIN_PERMISSION_MATRIX.find(
    (m) => m.moduleName.toLowerCase() === moduleName.toLowerCase()
  );

  if (!entry) {
    return {
      allowed: false,
      scope: "None",
      requiresStepUp: false,
      message: `Unknown module '${moduleName}'. Access denied by default.`,
    };
  }

  // Hard Invariant: Clinical decision is ALWAYS denied for Admin
  if (actionType === "clinical_decision") {
    return {
      allowed: false,
      scope: "No",
      requiresStepUp: false,
      message: `CRITICAL POLICY VIOLATION: Hospital Admin is strictly prohibited from making clinical decisions in '${moduleName}' (Rule 23.1).`,
    };
  }

  if (actionType === "view") {
    return {
      allowed: true,
      scope: entry.viewScope,
      requiresStepUp: false,
      message: `Granted '${entry.viewScope}' view access to ${moduleName}.`,
    };
  }

  if (actionType === "create_edit") {
    return {
      allowed: true,
      scope: entry.createEditScope,
      requiresStepUp: false,
      message: `Granted '${entry.createEditScope}' create/edit access to ${moduleName}.`,
    };
  }

  if (actionType === "approve_override") {
    if (entry.approveOverrideScope === "N/A") {
      return {
        allowed: false,
        scope: "N/A",
        requiresStepUp: false,
        message: `Override not applicable in ${moduleName} (View/Generate only).`,
      };
    }

    return {
      allowed: true,
      scope: entry.approveOverrideScope,
      requiresStepUp: entry.requiresStepUp,
      message: `Granted '${entry.approveOverrideScope}' authority in ${moduleName}.${
        entry.requiresStepUp ? " Requires 2FA Step-Up & Override Confirmation Modal." : ""
      }`,
    };
  }

  return { allowed: false, scope: "Unknown", requiresStepUp: false, message: "Invalid action." };
}
