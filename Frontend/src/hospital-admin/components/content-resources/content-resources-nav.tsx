"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  FileText,
  Video,
  GraduationCap,
  Stethoscope,
  Building2,
  Sparkles,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";

export function ContentResourcesNav() {
  const pathname = usePathname();
  const state = useSelector((s: RootState) => s.contentResources);

  const inReviewCount =
    state.articles.filter((a) => a.status === "In Review").length +
    state.videos.filter((v) => v.status === "In Review").length +
    state.patientEducation.filter((e) => e.status === "In Review").length +
    state.doctorContent.filter((d) => d.status === "In Review").length +
    state.departmentContent.filter((d) => d.status === "In Review").length;

  const publishedArticles = state.articles.filter((a) => a.status === "Published").length;
  const patientGuidesCount = state.patientEducation.length;

  const navItems = [
    {
      label: "Overview",
      href: "/hospital-admin/content-resources",
      icon: BookOpen,
      exact: true,
    },
    {
      label: "Articles CMS",
      href: "/hospital-admin/content-resources/articles",
      icon: FileText,
      badge: publishedArticles > 0 ? `${publishedArticles} Live` : undefined,
      badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
    },
    {
      label: "Video Assets",
      href: "/hospital-admin/content-resources/videos",
      icon: Video,
      badge: `${state.videos.length}`,
      badgeColor: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30",
    },
    {
      label: "Patient Education",
      href: "/hospital-admin/content-resources/patient-education",
      icon: GraduationCap,
      badge: `${patientGuidesCount} Guides`,
      badgeColor: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30",
    },
    {
      label: "Doctor Content",
      href: "/hospital-admin/content-resources/doctor-content",
      icon: Stethoscope,
    },
    {
      label: "Department Content",
      href: "/hospital-admin/content-resources/department-content",
      icon: Building2,
    },
  ];

  return (
    <div className="flex items-center justify-between border-b border-border bg-card/60 px-4 py-2 backdrop-blur">
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-semibold leading-tight ${
                    item.badgeColor || "bg-muted text-muted-foreground"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {inReviewCount > 0 && (
        <div className="hidden items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-300 border border-amber-500/30 md:flex">
          <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
          <span>{inReviewCount} Pending Clinical Review</span>
        </div>
      )}
    </div>
  );
}
