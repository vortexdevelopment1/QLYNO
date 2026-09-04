"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/hospital-admin/lib/utils";
import {
  Calendar,
  Clock,
  UserCheck,
  Stethoscope,
  ArrowLeftRight,
  ShieldAlert,
  Award,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "Shift Roster", href: "/hospital-admin/roster", icon: Calendar },
  { label: "Shift Templates", href: "/hospital-admin/shift-templates", icon: Clock },
  { label: "Attendance Live", href: "/hospital-admin/attendance", icon: Award },
  { label: "Staff Permissions", href: "/hospital-admin/staff-permissions", icon: ShieldAlert },
];

import { useSelector } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";

export function RosterNav() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const currentRole = useSelector((state: RootState) => state.nursingOperations.currentRole);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLeadOrAdmin = currentRole === "admin" || currentRole === "nurse_lead";

  // Individual staff (Staff Nurse, Support Staff, Senior Nurse) do not see administrative sub-tabs
  if (!mounted || !isLeadOrAdmin) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border pb-2 mb-4 scrollbar-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap",
              isActive
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
