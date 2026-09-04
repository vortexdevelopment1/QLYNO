"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import {
  FileText,
  Building2,
  Users,
  Award,
  ShieldCheck,
  BookOpen,
  Briefcase,
  LayoutDashboard,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { mockDmsAnalyticsSummary } from "@/hospital-admin/lib/mock-data/documents";

export function DocumentsNav() {
  const pathname = usePathname();
  const documents = useSelector((s: RootState) => s.documents?.documents || []);
  const analytics = useSelector((s: RootState) => s.documents?.analytics || mockDmsAnalyticsSummary);

  const hospitalDocsCount = documents.filter((d) => d.category === "Hospital Documents").length;
  const staffDocsCount = documents.filter((d) => d.category === "Staff Documents").length;
  const licensesCount = documents.filter((d) => d.category === "Licenses").length;
  const certsCount = documents.filter((d) => d.category === "Certificates").length;
  const policiesCount = documents.filter((d) => d.category === "Policies").length;
  const contractsCount = documents.filter((d) => d.category === "Contracts").length;

  const navItems = [
    {
      label: "DMS Workstation",
      href: "/hospital-admin/documents",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Hospital Documents",
      href: "/hospital-admin/documents/hospital-documents",
      icon: Building2,
      badge: hospitalDocsCount,
    },
    {
      label: "Staff Documents",
      href: "/hospital-admin/documents/staff-documents",
      icon: Users,
      badge: staffDocsCount,
    },
    {
      label: "Licenses",
      href: "/hospital-admin/documents/licenses",
      icon: Award,
      badge: licensesCount,
    },
    {
      label: "Certificates",
      href: "/hospital-admin/documents/certificates",
      icon: ShieldCheck,
      badge: certsCount,
    },
    {
      label: "Policies & Templates",
      href: "/hospital-admin/documents/policies",
      icon: BookOpen,
      badge: policiesCount,
    },
    {
      label: "Contracts",
      href: "/hospital-admin/documents/contracts",
      icon: Briefcase,
      badge: contractsCount,
    },
  ];

  return (
    <div className="border-b border-border bg-card/60 backdrop-blur px-6">
      <div className="flex items-center space-x-1 overflow-x-auto py-2 scrollbar-none">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href) && (item.href === "/documents" ? pathname === "/hospital-admin/documents" : true);

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
                  className="ml-1 h-4 px-1 text-[10px] font-semibold"
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
