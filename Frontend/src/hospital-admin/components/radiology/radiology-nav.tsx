"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  AlertOctagon,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Cpu,
  FileCheck2,
  FileText,
  History,
  Layers,
  Radio,
  User,
  Users,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { cn } from "@/hospital-admin/lib/utils";
import {
  mockExtendedRadiologyOrders,
  mockCriticalFindingLogs,
  mockImagingSuites,
} from "@/hospital-admin/lib/mock-data/radiology-extended-operations";

export function RadiologyNav() {
  const pathname = usePathname();

  // Dynamic counts from master datasets
  const inProgressCount = mockExtendedRadiologyOrders.filter((o) => o.status === "In Progress").length;
  const awaitingReviewCount = mockExtendedRadiologyOrders.filter((o) => o.status === "Report Pending").length;
  const criticalCount = mockCriticalFindingLogs.filter((c) => !c.acknowledged || !c.clinicianNotified).length;
  const totalSuites = mockImagingSuites.length;

  const navItems = [
    {
      label: "Orders Worklist",
      href: "/hospital-admin/radiology",
      icon: Layers,
      active: pathname === "/hospital-admin/radiology",
    },
    {
      label: "Scheduling",
      href: "/hospital-admin/radiology/scheduling",
      icon: Calendar,
      active: pathname === "/hospital-admin/radiology/scheduling",
    },
    {
      label: "Imaging Queue",
      href: "/hospital-admin/radiology/imaging-queue",
      icon: Radio,
      badge: inProgressCount > 0 ? inProgressCount : undefined,
      badgeVariant: "cyan" as const,
      active: pathname === "/hospital-admin/radiology/imaging-queue",
    },
    {
      label: "Reports Archive",
      href: "/hospital-admin/radiology/reports",
      icon: FileCheck2,
      active: pathname === "/hospital-admin/radiology/reports",
    },
    {
      label: "Awaiting Review",
      href: "/hospital-admin/radiology/awaiting-review",
      icon: Clock,
      badge: awaitingReviewCount > 0 ? awaitingReviewCount : undefined,
      badgeVariant: "amber" as const,
      active: pathname === "/hospital-admin/radiology/awaiting-review",
    },
    {
      label: "Critical Findings",
      href: "/hospital-admin/radiology/critical-findings",
      icon: AlertOctagon,
      badge: criticalCount > 0 ? criticalCount : undefined,
      badgeVariant: "destructive" as const,
      active: pathname === "/hospital-admin/radiology/critical-findings",
    },
    {
      label: "Radiologists",
      href: "/hospital-admin/radiology/radiologists",
      icon: User,
      active: pathname === "/hospital-admin/radiology/radiologists",
    },
    {
      label: "Equipment",
      href: "/hospital-admin/radiology/equipment",
      icon: Cpu,
      badge: totalSuites,
      badgeVariant: "secondary" as const,
      active: pathname === "/hospital-admin/radiology/equipment",
    },
    {
      label: "History",
      href: "/hospital-admin/radiology/history",
      icon: History,
      active: pathname === "/hospital-admin/radiology/history",
    },
  ];

  return (
    <div className="border-b border-border bg-card/60 backdrop-blur-xs -mx-4 px-4 sm:-mx-6 sm:px-6 mb-4 overflow-x-auto">
      <nav className="flex space-x-1 sm:space-x-2 py-2 min-w-max">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                item.active
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "ml-1 h-4 px-1 text-[10px] font-bold rounded-full",
                    item.badgeVariant === "destructive" && "bg-destructive text-destructive-foreground animate-pulse",
                    item.badgeVariant === "amber" && "bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30",
                    item.badgeVariant === "cyan" && "bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border-cyan-500/30",
                    item.active && "bg-primary-foreground/20 text-primary-foreground border-none"
                  )}
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
