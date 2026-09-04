"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  Stethoscope,
  Building,
  ArrowLeftRight,
  CalendarClock,
  Wrench,
  ShieldCheck,
  History,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { cn } from "@/hospital-admin/lib/utils";
import {
  mockBiomedicalAssetsExtended,
  mockAssetAllocations,
  mockRepairTickets,
} from "@/hospital-admin/lib/mock-data/assets-extended";

export function AssetsNav() {
  const pathname = usePathname();

  // Badges
  const calibrationDueCount = mockBiomedicalAssetsExtended.filter(
    (a) => a.maintenanceStatus === "Calibration Due"
  ).length;

  const activeLoansCount = mockAssetAllocations.filter(
    (a) => a.status === "Active" && a.allocationType === "Temporary Loan"
  ).length;

  const openRepairsCount = mockRepairTickets.filter(
    (r) => r.status === "Reported" || r.status === "In Progress"
  ).length;

  const warrantyAlertsCount = mockBiomedicalAssetsExtended.filter(
    (a) => a.amcCmcContract === "Under Renewal" || a.amcCmcContract === "Expired"
  ).length;

  const navItems = [
    {
      label: "All Assets Registry",
      href: "/hospital-admin/assets",
      icon: Boxes,
      badge: null,
      exact: true,
    },
    {
      label: "Medical Equipment",
      href: "/hospital-admin/assets/medical-equipment",
      icon: Stethoscope,
      badge: null,
      exact: false,
    },
    {
      label: "Hospital Equipment",
      href: "/hospital-admin/assets/hospital-equipment",
      icon: Building,
      badge: null,
      exact: false,
    },
    {
      label: "Asset Allocation",
      href: "/hospital-admin/assets/allocation",
      icon: ArrowLeftRight,
      badge: activeLoansCount > 0 ? `${activeLoansCount} Loaned` : null,
      badgeVariant: "default" as const,
      exact: false,
    },
    {
      label: "Maintenance (PPM)",
      href: "/hospital-admin/assets/maintenance",
      icon: CalendarClock,
      badge: calibrationDueCount > 0 ? `${calibrationDueCount} Due` : null,
      badgeVariant: "destructive" as const,
      exact: false,
    },
    {
      label: "Repairs",
      href: "/hospital-admin/assets/repairs",
      icon: Wrench,
      badge: openRepairsCount > 0 ? `${openRepairsCount} Active` : null,
      badgeVariant: "destructive" as const,
      exact: false,
    },
    {
      label: "Warranty & AMC",
      href: "/hospital-admin/assets/warranty",
      icon: ShieldCheck,
      badge: warrantyAlertsCount > 0 ? `${warrantyAlertsCount} Alert` : null,
      badgeVariant: "destructive" as const,
      exact: false,
    },
    {
      label: "Asset History",
      href: "/hospital-admin/assets/history",
      icon: History,
      badge: null,
      exact: false,
    },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin border-b border-border/60">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || (item.href !== "/assets" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 shrink-0",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span>{item.label}</span>
            {item.badge && (
              <Badge
                variant={item.badgeVariant || "secondary"}
                className={cn(
                  "text-[10px] px-1.5 py-0 h-4 font-mono font-bold leading-none ml-0.5",
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30"
                    : item.badgeVariant === "destructive"
                    ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
                    : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                )}
              >
                {item.badge}
              </Badge>
            )}
          </Link>
        );
      })}
    </div>
  );
}
