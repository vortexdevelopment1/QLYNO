"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  UserPlus,
  GitFork,
  Users,
  Stethoscope,
  Building2,
  RotateCcw,
  UserX,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/hospital-admin/lib/utils";

export const analyticsNavItems = [
  {
    label: "Executive Cockpit",
    href: "/hospital-admin/analytics",
    icon: Activity,
    exact: true,
  },
  {
    label: "Patient Acquisition",
    href: "/hospital-admin/analytics/patient-acquisition",
    icon: UserPlus,
  },
  {
    label: "Appointment Conversion",
    href: "/hospital-admin/analytics/appointment-conversion",
    icon: GitFork,
  },
  {
    label: "New vs Returning",
    href: "/hospital-admin/analytics/new-vs-returning",
    icon: Users,
  },
  {
    label: "Doctor Performance",
    href: "/hospital-admin/analytics/doctor-performance",
    icon: Stethoscope,
  },
  {
    label: "Department Performance",
    href: "/hospital-admin/analytics/department-performance",
    icon: Building2,
  },
  {
    label: "Patient Retention",
    href: "/hospital-admin/analytics/patient-retention",
    icon: RotateCcw,
  },
  {
    label: "No-shows",
    href: "/hospital-admin/analytics/no-shows",
    icon: UserX,
  },
  {
    label: "Revenue Analytics",
    href: "/hospital-admin/analytics/revenue-analytics",
    icon: TrendingUp,
  },
];

export function AnalyticsNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-border/80 text-xs">
      {analyticsNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(item.href + "/");

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-all text-xs border border-transparent",
              isActive
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Icon className={cn("h-3.5 w-3.5", isActive ? "text-primary-foreground" : "text-primary")} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
