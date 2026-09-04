"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import {
  LayoutDashboard,
  MessageSquare,
  Star,
  AlertCircle,
  TrendingUp,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";

import { mockReviewAnalyticsSummary } from "@/hospital-admin/lib/mock-data/patient-reviews";

export function ReviewsNav() {
  const pathname = usePathname();
  const reviews = useSelector((s: RootState) => s.patientReviews?.reviews || []);
  const grievances = useSelector((s: RootState) => s.patientReviews?.grievances || []);
  const analytics = useSelector((s: RootState) => s.patientReviews?.analytics || mockReviewAnalyticsSummary);

  const unansweredCount = reviews.filter((r) => !r.responded).length;
  const activeGrievancesCount = grievances.filter((g) => g.status !== "Resolved").length;

  const navItems = [
    {
      label: "Workstation Overview",
      href: "/hospital-admin/reviews",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Patient Reviews",
      href: "/hospital-admin/reviews/patient-reviews",
      icon: MessageSquare,
      badge: reviews.length,
    },
    {
      label: "Ratings & Scorecards",
      href: "/hospital-admin/reviews/ratings",
      icon: Star,
      badgeText: `${analytics.hospitalAverageRating}★`,
    },
    {
      label: "Unanswered Queue",
      href: "/hospital-admin/reviews/unanswered",
      icon: AlertCircle,
      badge: unansweredCount,
      badgeVariant: unansweredCount > 0 ? "destructive" : "secondary",
    },
    {
      label: "Review & NPS Analytics",
      href: "/hospital-admin/reviews/analytics",
      icon: TrendingUp,
      badgeText: `NPS +${analytics.npsScore}`,
    },
    {
      label: "Grievances Desk",
      href: "/hospital-admin/reviews/grievances",
      icon: ShieldAlert,
      badge: activeGrievancesCount,
      badgeVariant: activeGrievancesCount > 0 ? "warning" : "secondary",
    },
  ];

  return (
    <div className="border-b border-border bg-card/60 backdrop-blur px-6">
      <div className="flex items-center space-x-1 overflow-x-auto py-2 scrollbar-none">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href) && (item.href === "/reviews" ? pathname === "/hospital-admin/reviews" : true);

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <Badge
                  variant={isActive ? "secondary" : "outline"}
                  className={`ml-1 h-4 px-1 text-[10px] font-semibold ${
                    item.badgeVariant === "destructive" && !isActive
                      ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
                      : item.badgeVariant === "warning" && !isActive
                      ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                      : ""
                  }`}
                >
                  {item.badge}
                </Badge>
              )}
              {item.badgeText && (
                <Badge
                  variant={isActive ? "secondary" : "outline"}
                  className="ml-1 h-4 px-1.5 text-[10px] font-semibold font-mono"
                >
                  {item.badgeText}
                </Badge>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
