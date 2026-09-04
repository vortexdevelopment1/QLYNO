"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Inbox,
  UserCheck,
  AlertOctagon,
  Clock,
  FileCheck2,
  Send,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { cn } from "@/hospital-admin/lib/utils";
import { mockCareCoordinationReportsReview } from "@/hospital-admin/lib/mock-data/reports-review-extended";

export function ReportsReviewNav() {
  const pathname = usePathname();

  // Dynamic Badges
  const pendingCount = mockCareCoordinationReportsReview.filter((r) => r.status === "pending_review").length;
  const criticalCount = mockCareCoordinationReportsReview.filter((r) => r.isCritical && r.status === "pending_review").length;
  const overdueCount = mockCareCoordinationReportsReview.filter((r) => r.isOverdue && r.status === "pending_review").length;
  const reviewedCount = mockCareCoordinationReportsReview.filter((r) => r.status === "reviewed").length;
  const awaitingPatientNoticeCount = mockCareCoordinationReportsReview.filter((r) => r.status === "reviewed" && !r.isPatientNotified).length;

  const navItems = [
    {
      label: "All Pending",
      href: "/hospital-admin/care-coordination/reports-review",
      icon: Inbox,
      badge: pendingCount,
      badgeColor: "bg-primary/10 text-primary border-primary/20",
    },
    {
      label: "Doctor-wise",
      href: "/hospital-admin/care-coordination/reports-review/doctor-wise",
      icon: UserCheck,
      badge: null,
    },
    {
      label: "Critical Reports",
      href: "/hospital-admin/care-coordination/reports-review/critical",
      icon: AlertOctagon,
      badge: criticalCount,
      badgeColor: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 font-bold",
    },
    {
      label: "Overdue Reviews",
      href: "/hospital-admin/care-coordination/reports-review/overdue",
      icon: Clock,
      badge: overdueCount,
      badgeColor: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    },
    {
      label: "Reviewed",
      href: "/hospital-admin/care-coordination/reports-review/reviewed",
      icon: FileCheck2,
      badge: reviewedCount,
      badgeColor: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    },
    {
      label: "Patient Notified",
      href: "/hospital-admin/care-coordination/reports-review/patient-notified",
      icon: Send,
      badge: awaitingPatientNoticeCount > 0 ? `${awaitingPatientNoticeCount} Unsent` : null,
      badgeColor: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30",
    },
  ];

  return (
    <div className="border-b border-border/80 bg-card/60 backdrop-blur-md sticky top-0 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-1 mb-4">
      <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/care-coordination/reports-review"
              ? pathname === "/hospital-admin/care-coordination/reports-review"
              : pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold whitespace-nowrap transition-all border-b-2",
                isActive
                  ? "border-primary text-primary font-bold bg-primary/5 rounded-t-md"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-t-md"
              )}
            >
              <Icon className={cn("h-3.5 w-3.5", isActive ? "text-primary" : "text-muted-foreground")} />
              <span>{item.label}</span>
              {item.badge !== null && item.badge !== undefined && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] h-4 px-1.5 py-0 rounded-full font-mono ml-0.5",
                    item.badgeColor || "bg-muted text-muted-foreground"
                  )}
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
