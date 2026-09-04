import type { RoleId } from "@/lib/types/domain";

export interface RoleConfig {
  id: RoleId;
  label: string;
  defaultDashboard: string;
  quickActions: string[];
  canApproveResults: boolean;
  canAccessQuality: boolean;
  canAccessInventory: boolean;
  scopeNote: string;
}

export const ROLE_CONFIG: Record<RoleId, RoleConfig> = {
  lab_director: {
    id: "lab_director",
    label: "Laboratory Director / Pathologist",
    defaultDashboard: "/dashboard",
    quickActions: ["Validate report", "Record QC", "Enter result"],
    canApproveResults: true,
    canAccessQuality: true,
    canAccessInventory: true,
    scopeNote: "All sites, full clinical & quality oversight",
  },
  quality_manager: {
    id: "quality_manager",
    label: "Quality Manager",
    defaultDashboard: "/quality",
    quickActions: ["Record QC", "Open nonconformance"],
    canApproveResults: false,
    canAccessQuality: true,
    canAccessInventory: false,
    scopeNote: "All sites, quality & compliance scope",
  },
  section_supervisor: {
    id: "section_supervisor",
    label: "Section Supervisor",
    defaultDashboard: "/workbench",
    quickActions: ["Enter result", "Validate report", "Record QC"],
    canApproveResults: true,
    canAccessQuality: true,
    canAccessInventory: false,
    scopeNote: "Assigned department scope",
  },
  technologist: {
    id: "technologist",
    label: "Technologist / Technician",
    defaultDashboard: "/workbench",
    quickActions: ["Enter result", "Scan accession"],
    canApproveResults: false,
    canAccessQuality: false,
    canAccessInventory: false,
    scopeNote: "Assigned department scope",
  },
  accessioning: {
    id: "accessioning",
    label: "Accessioning / Receiving",
    defaultDashboard: "/accessioning",
    quickActions: ["Scan accession", "Reject specimen"],
    canApproveResults: false,
    canAccessQuality: false,
    canAccessInventory: false,
    scopeNote: "Receiving desk scope",
  },
  phlebotomist: {
    id: "phlebotomist",
    label: "Phlebotomist / Ward Collector",
    defaultDashboard: "/collection",
    quickActions: ["Collect sample", "Register order"],
    canApproveResults: false,
    canAccessQuality: false,
    canAccessInventory: false,
    scopeNote: "Ward / collection round scope",
  },
  courier: {
    id: "courier",
    label: "Courier / Home Collector",
    defaultDashboard: "/logistics",
    quickActions: ["Create manifest", "Collect sample"],
    canApproveResults: false,
    canAccessQuality: false,
    canAccessInventory: false,
    scopeNote: "Route scope",
  },
  reception_cashier: {
    id: "reception_cashier",
    label: "Reception / Cashier",
    defaultDashboard: "/orders",
    quickActions: ["Register order", "Collect payment"],
    canApproveResults: false,
    canAccessQuality: false,
    canAccessInventory: false,
    scopeNote: "Front-desk scope",
  },
  inventory_procurement: {
    id: "inventory_procurement",
    label: "Inventory / Procurement",
    defaultDashboard: "/inventory",
    quickActions: ["Receive stock"],
    canApproveResults: false,
    canAccessQuality: false,
    canAccessInventory: true,
    scopeNote: "Stores & procurement scope",
  },
  tenant_admin: {
    id: "tenant_admin",
    label: "Tenant Administrator",
    defaultDashboard: "/administration/organization",
    quickActions: [],
    canApproveResults: false,
    canAccessQuality: true,
    canAccessInventory: true,
    scopeNote: "Full tenant configuration scope",
  },
  referring_clinician: {
    id: "referring_clinician",
    label: "Referring Clinician",
    defaultDashboard: "/reports",
    quickActions: [],
    canApproveResults: false,
    canAccessQuality: false,
    canAccessInventory: false,
    scopeNote: "Own patients' orders & reports",
  },
  client_lab_user: {
    id: "client_lab_user",
    label: "Client Laboratory User",
    defaultDashboard: "/orders",
    quickActions: ["Register order"],
    canApproveResults: false,
    canAccessQuality: false,
    canAccessInventory: false,
    scopeNote: "Own client-organization orders",
  },
  auditor: {
    id: "auditor",
    label: "Auditor",
    defaultDashboard: "/administration/audit-log",
    quickActions: [],
    canApproveResults: false,
    canAccessQuality: true,
    canAccessInventory: false,
    scopeNote: "Read-only across all modules",
  },
};

export const ROLE_LIST = Object.values(ROLE_CONFIG);
