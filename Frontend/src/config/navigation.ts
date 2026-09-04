export interface NavChild {
  label: string;
  href: string;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon:
    | "layout-dashboard"
    | "users"
    | "clipboard-list"
    | "test-tube"
    | "truck"
    | "microscope"
    | "file-check-2"
    | "shield-check"
    | "boxes"
    | "wallet"
    | "message-square"
    | "bar-chart-3";
  children?: NavChild[];
  /** when true, item is hidden unless tenant billing is enabled */
  billingGated?: boolean;
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

export const NAVIGATION: NavGroup[] = [
  {
    id: "lab-operations",
    label: "Laboratory Operations",
    items: [
      {
        id: "command-center",
        label: "Command Center",
        href: "/dashboard",
        icon: "layout-dashboard",
        children: [
          { label: "Dashboard", href: "/dashboard" },
          { label: "Work Queues", href: "/queues" },
        ],
      },
      {
        id: "patients-network",
        label: "Patients & Network",
        href: "/patients",
        icon: "users",
        children: [
          { label: "Patients", href: "/patients" },
          { label: "Clients", href: "/clients" },
          { label: "Referrers", href: "/referrers" },
        ],
      },
      {
        id: "orders-catalog",
        label: "Orders & Catalog",
        href: "/orders",
        icon: "clipboard-list",
        children: [
          { label: "Orders", href: "/orders" },
          { label: "New Order", href: "/orders/new" },
          { label: "Test Catalog", href: "/catalog" },
          { label: "Scheduling", href: "/scheduling" },
        ],
      },
      {
        id: "collection-specimens",
        label: "Collection & Specimens",
        href: "/collection",
        icon: "test-tube",
        children: [
          { label: "Collection Queue", href: "/collection" },
          { label: "Scan Simulator", href: "/collection/scan" },
          { label: "Accessioning", href: "/accessioning" },
          { label: "Specimens", href: "/specimens" },
          { label: "Rejections", href: "/specimens/rejections" },
          { label: "Storage", href: "/specimens/storage" },
        ],
      },
      {
        id: "logistics-referrals",
        label: "Logistics & Referrals",
        href: "/logistics",
        icon: "truck",
        children: [
          { label: "Pickup Board", href: "/logistics" },
          { label: "Routes", href: "/logistics/routes" },
          { label: "Manifests", href: "/logistics/manifests" },
          { label: "Send-outs", href: "/send-outs" },
          { label: "Reference Labs", href: "/reference-labs" },
        ],
      },
      {
        id: "workbench-analyzers",
        label: "Workbench & Analyzers",
        href: "/workbench",
        icon: "microscope",
        children: [
          { label: "Workbench", href: "/workbench" },
          { label: "Batches", href: "/batches" },
          { label: "Analyzers", href: "/analyzers" },
        ],
      },
      {
        id: "results-reports",
        label: "Results & Reports",
        href: "/results",
        icon: "file-check-2",
        children: [
          { label: "Results", href: "/results" },
          { label: "Validation Queue", href: "/validation" },
          { label: "Reports", href: "/reports" },
          { label: "Critical Results", href: "/critical-results" },
          { label: "Amendments", href: "/amendments" },
        ],
      },
    ],
  },
  {
    id: "governance-resources",
    label: "Governance & Resources",
    items: [
      {
        id: "quality-management",
        label: "Quality Management",
        href: "/quality",
        icon: "shield-check",
        children: [
          { label: "Overview", href: "/quality" },
          { label: "QC Runs", href: "/quality/qc" },
          { label: "Nonconformance", href: "/quality/nonconformance" },
          { label: "CAPA", href: "/quality/capa" },
          { label: "Documents", href: "/quality/documents" },
          { label: "Audits", href: "/quality/audits" },
          { label: "Competency", href: "/quality/competency" },
        ],
      },
      {
        id: "inventory-equipment",
        label: "Inventory & Equipment",
        href: "/inventory",
        icon: "boxes",
        children: [
          { label: "Stock Overview", href: "/inventory" },
          { label: "Items", href: "/inventory/items" },
          { label: "Lots", href: "/inventory/lots" },
          { label: "Stock Movements", href: "/inventory/stock" },
          { label: "Procurement", href: "/inventory/procurement" },
          { label: "Equipment", href: "/equipment" },
          { label: "Maintenance", href: "/equipment/maintenance" },
        ],
      },
      {
        id: "commercial-billing",
        label: "Commercial & Billing",
        href: "/billing",
        icon: "wallet",
        billingGated: true,
        children: [
          { label: "Estimates", href: "/billing/estimates" },
          { label: "Invoices", href: "/billing/invoices" },
          { label: "Payments", href: "/billing/payments" },
          { label: "Refunds", href: "/billing/refunds" },
          { label: "Cashier", href: "/billing/cashier" },
          { label: "Contracts", href: "/billing/contracts" },
          { label: "Receivables", href: "/billing/receivables" },
          { label: "Reconciliation", href: "/billing/reconciliation" },
        ],
      },
      {
        id: "portals-communication",
        label: "Portals & Communication",
        href: "/communications",
        icon: "message-square",
        children: [
          { label: "Communications", href: "/communications" },
          { label: "Templates", href: "/communications/templates" },
          { label: "History", href: "/communications/history" },
          { label: "Portal Access", href: "/portal-access" },
          { label: "Support", href: "/support" },
        ],
      },
      {
        id: "analytics-administration",
        label: "Analytics",
        href: "/analytics",
        icon: "bar-chart-3",
        children: [
          { label: "Analytics", href: "/analytics" },
        ],
      },
    ],
  },
  {
    id: "lab-management",
    label: "Lab Management",
    items: [
      { id: "team-access", label: "Team & Access", href: "/lab-management/team", icon: "users" },
      { id: "roles-permissions", label: "Roles & Permissions", href: "/lab-management/roles", icon: "shield-check" },
      { id: "site-department-scope", label: "Site & Department Scope", href: "/lab-management/access-scope", icon: "boxes" },
      { id: "access-audit", label: "Access Audit", href: "/lab-management/audit", icon: "clipboard-list" },
    ],
  },
];
