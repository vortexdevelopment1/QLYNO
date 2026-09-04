import {
  Activity,
  Ambulance,
  BadgeIndianRupee,
  BarChart3,
  Bed,
  Bell,
  BookOpen,
  Boxes,
  Building2,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  Clock,
  Cpu,
  CreditCard,
  FileCheck,
  FileText,
  FlaskConical,
  Gauge,
  HeartPulse,
  LayoutDashboard,
  MessageSquare,
  Milestone,
  Pill,
  Receipt,
  Scan,
  Scissors,
  ScrollText,
  Settings,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Stethoscope,
  TrendingUp,
  Truck,
  UserCheck,
  UserCog,
  Users,
  UsersRound,
  Webhook,
} from "lucide-react";
import { AppUserRole } from "@/hospital-admin/lib/types/nursing-module";

export interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

// 1. HOSPITAL ADMIN NAVIGATION (Full Management)
export const navGroups: NavGroup[] = [
  // OVERVIEW
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/hospital-admin/dashboard", icon: LayoutDashboard },
      { label: "Command Center", href: "/hospital-admin/command-center", icon: Gauge, badge: "Proposed" },
    ],
  },

  // PATIENT CARE
  {
    title: "Patient Care",
    items: [
      { label: "Patients", href: "/hospital-admin/patients", icon: Users },
      { label: "Appointments", href: "/hospital-admin/appointments", icon: CalendarClock },
      { label: "OPD Management", href: "/hospital-admin/appointments/opd-queue", icon: Activity },
      { label: "IPD", href: "/hospital-admin/ipd", icon: Bed },
      { label: "Emergency Management", href: "/hospital-admin/emergency", icon: ShieldAlert },
      { label: "Follow-ups", href: "/hospital-admin/follow-ups", icon: CalendarDays },
    ],
  },

  // CLINICAL OPERATIONS
  {
    title: "Clinical Operations",
    items: [
      { label: "Doctors", href: "/hospital-admin/doctors", icon: Stethoscope },
      { label: "Departments", href: "/hospital-admin/departments", icon: Building2 },
      { label: "Nurse Stations (Admin)", href: "/hospital-admin/nurse-stations", icon: ShieldCheck },
      { label: "Wards & Beds", href: "/hospital-admin/wards-beds", icon: Bed },
      { label: "OT / Surgeries Management", href: "/hospital-admin/surgical-cases", icon: Scissors },
      { label: "Lab", href: "/hospital-admin/lab", icon: FlaskConical },
      { label: "Radiology", href: "/hospital-admin/radiology", icon: Scan },
      { label: "Pharmacy", href: "/hospital-admin/pharmacy", icon: Pill },
    ],
  },

  // PEOPLE & STAFF
  {
    title: "People & Staff",
    items: [
      { label: "Reception", href: "/hospital-admin/staff/receptionists", icon: ClipboardList },
      { label: "Nurses", href: "/hospital-admin/nurses", icon: HeartPulse },
      { label: "Billing Staff", href: "/hospital-admin/staff/billing-staff", icon: UserCog },
      { label: "Other Staff", href: "/hospital-admin/support-staff", icon: Users },
      { label: "Duty & Shifts", href: "/hospital-admin/roster", icon: CalendarClock },
      { label: "Attendance", href: "/hospital-admin/attendance", icon: Clock },
    ],
  },

  // CARE COORDINATION
  {
    title: "Care Coordination",
    items: [
      { label: "Patient Journey", href: "/hospital-admin/care-coordination/patient-journey", icon: Milestone },
      { label: "Reports Awaiting Review", href: "/hospital-admin/care-coordination/reports-review", icon: FileCheck },
      { label: "Communication", href: "/hospital-admin/care-coordination/communication", icon: MessageSquare },
    ],
  },

  // FINANCE
  {
    title: "Finance",
    items: [
      { label: "Billing & Invoices", href: "/hospital-admin/billing", icon: Receipt },
      { label: "Payments", href: "/hospital-admin/payments", icon: CreditCard },
      { label: "Insurance / TPA", href: "/hospital-admin/insurance-tpa", icon: ShieldCheck },
      { label: "Financial Reports", href: "/hospital-admin/financial-reports", icon: BadgeIndianRupee },
    ],
  },

  // SUPPLY & ASSETS
  {
    title: "Supply & Assets",
    items: [
      { label: "Inventory", href: "/hospital-admin/inventory", icon: Boxes },
      { label: "Procurement", href: "/hospital-admin/procurement", icon: ShoppingCart },
      { label: "Vendors", href: "/hospital-admin/procurement/vendors", icon: Truck },
      { label: "Assets", href: "/hospital-admin/assets", icon: Cpu },
      { label: "Ambulance", href: "/hospital-admin/ambulance", icon: Ambulance },
    ],
  },

  // HOSPITAL GROWTH
  {
    title: "Hospital Growth",
    items: [
      { label: "Hospital Profile", href: "/hospital-admin/hospital-profile", icon: Building2 },
      { label: "Content & Resources", href: "/hospital-admin/content-resources", icon: BookOpen },
      { label: "Reviews", href: "/hospital-admin/reviews", icon: Star },
      { label: "Analytics", href: "/hospital-admin/analytics", icon: TrendingUp },
    ],
  },

  // ADMINISTRATION
  {
    title: "Administration",
    items: [
      { label: "Verifications", href: "/hospital-admin/verification", icon: ShieldCheck },
      { label: "Hospital Admin", href: "/hospital-admin/admin-delegation", icon: UsersRound },
      { label: "Incidents", href: "/hospital-admin/incidents", icon: ShieldAlert, badge: "Proposed" },
      { label: "Reports", href: "/hospital-admin/reports", icon: Gauge },
      { label: "Roles & Permissions", href: "/hospital-admin/roles", icon: ShieldCheck },
      { label: "Audit Logs", href: "/hospital-admin/audit-logs", icon: ScrollText },
      { label: "Documents", href: "/hospital-admin/documents", icon: FileText },
      { label: "Notifications", href: "/hospital-admin/notifications", icon: Bell },
      { label: "Integrations", href: "/hospital-admin/integrations", icon: Webhook },
      { label: "Settings", href: "/hospital-admin/settings", icon: Settings },
    ],
  },
];

// 2. NURSE STATION LEAD NAVIGATION
export const nurseStationLeadNavGroups: NavGroup[] = [
  {
    title: "Station Operations",
    items: [
      { label: "Station Dashboard", href: "/hospital-admin/nurse-station", icon: LayoutDashboard },
      { label: "Patients & Bed Map", href: "/hospital-admin/wards-beds", icon: Bed },
      { label: "Shifts & Roster", href: "/hospital-admin/roster", icon: CalendarClock },
    ],
  },
  {
    title: "Workforce & Reports",
    items: [
      { label: "Nurses Directory", href: "/hospital-admin/nurses", icon: HeartPulse },
      { label: "Support Staff", href: "/hospital-admin/support-staff", icon: Sparkles },
      { label: "Station Reports", href: "/hospital-admin/reports", icon: Gauge },
      { label: "Nursing Audit Logs", href: "/hospital-admin/nursing-audit-logs", icon: ScrollText },
      { label: "Station Settings", href: "/hospital-admin/nurse-stations", icon: Settings },
    ],
  },
];

// 3. SENIOR NURSE NAVIGATION (Restricted Administration)
export const seniorNurseNavGroups: NavGroup[] = [
  {
    title: "Care Coordination",
    items: [
      { label: "Station Dashboard", href: "/hospital-admin/nurse-station", icon: LayoutDashboard },
      { label: "Bedside Patients", href: "/hospital-admin/nurse", icon: Bed },
      { label: "Wards & Bed Map", href: "/hospital-admin/wards-beds", icon: Building2 },
      { label: "Station Roster", href: "/hospital-admin/roster", icon: CalendarClock },
      { label: "Nursing Audit Logs", href: "/hospital-admin/nursing-audit-logs", icon: ScrollText },
    ],
  },
];

// 4. STAFF NURSE NAVIGATION (Individual Bedside Workspace)
export const nurseNavGroups: NavGroup[] = [
  {
    title: "My Bedside Workspace",
    items: [
      { label: "My Assigned Patients", href: "/hospital-admin/nurse", icon: Bed },
      { label: "My Shift Schedule", href: "/hospital-admin/roster", icon: CalendarClock },
    ],
  },
];

// 5. SUPPORT STAFF NAVIGATION (Non-Clinical Operational Queue)
export const supportStaffNavGroups: NavGroup[] = [
  {
    title: "Operational Service Queue",
    items: [
      { label: "My Task Queue", href: "/hospital-admin/support-staff", icon: FileCheck },
      { label: "Duty & Shift Roster", href: "/hospital-admin/roster", icon: Clock },
    ],
  },
];

export function getNavigationForRole(role?: AppUserRole): NavGroup[] {
  switch (role) {
    case "nurse_lead":
      return nurseStationLeadNavGroups;
    case "senior_nurse":
      return seniorNurseNavGroups;
    case "nurse":
      return nurseNavGroups;
    case "support_staff":
      return supportStaffNavGroups;
    case "admin":
    default:
      return navGroups;
  }
}

export interface WorkspaceMeta {
  appName: string;
  appSubname: string;
  tagline: string;
  profileName: string;
  profileRole: string;
  profileEmail: string;
  profileInitials: string;
}

export function getWorkspaceMetaForRole(role?: AppUserRole): WorkspaceMeta {
  switch (role) {
    case "nurse_lead":
      return {
        appName: "Qlyno",
        appSubname: "Nurse Station",
        tagline: "ICU & Critical Care Station",
        profileName: "Sister Anita Joseph",
        profileRole: "Nurse Station Lead",
        profileEmail: "anita.joseph@qlyno.health",
        profileInitials: "AJ",
      };
    case "senior_nurse":
      return {
        appName: "Qlyno",
        appSubname: "Nurse Station",
        tagline: "Care Coordination (Senior Nurse)",
        profileName: "Sister Sneha Kulkarni",
        profileRole: "Senior Nurse",
        profileEmail: "sneha.kulkarni@qlyno.health",
        profileInitials: "SK",
      };
    case "nurse":
      return {
        appName: "Qlyno",
        appSubname: "Nurse Portal",
        tagline: "Bedside Clinical Workspace",
        profileName: "Nurse Rahul Shinde",
        profileRole: "Staff Nurse",
        profileEmail: "rahul.shinde@qlyno.health",
        profileInitials: "RS",
      };
    case "support_staff":
      return {
        appName: "Qlyno",
        appSubname: "Support Staff",
        tagline: "Operational Service Queue",
        profileName: "Ramesh Pawar",
        profileRole: "Ward Attendant",
        profileEmail: "ramesh.p@qlyno.health",
        profileInitials: "RP",
      };
    case "admin":
    default:
      return {
        appName: "Qlyno",
        appSubname: "Admin",
        tagline: "Hospital Command Center",
        profileName: "Hospital Admin",
        profileRole: "Hospital Admin",
        profileEmail: "admin@qlyno.health",
        profileInitials: "HA",
      };
  }
}

export const currencyIcon = BadgeIndianRupee;
