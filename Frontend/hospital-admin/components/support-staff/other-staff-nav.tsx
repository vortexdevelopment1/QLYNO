"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/hospital-admin/lib/utils";
import {
  Wrench,
  Sparkles,
  Shield,
  Truck,
  Users,
  Building,
  HeartPulse,
} from "lucide-react";

interface NavItem {
  label: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const otherStaffCategories: NavItem[] = [
  { label: "All Staff", category: "all", icon: Users },
  { label: "Technicians", category: "Technician", icon: Wrench },
  { label: "Housekeeping", category: "Housekeeping", icon: Sparkles },
  { label: "Security", category: "Security", icon: Shield },
  { label: "Ambulance Drivers", category: "Driver", icon: Truck },
  { label: "Ward Attendants & Orderlies", category: "Support Staff", icon: HeartPulse },
  { label: "Other Hospital Staff", category: "Other Hospital Staff", icon: Building },
];
