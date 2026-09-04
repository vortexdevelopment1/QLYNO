"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  Ambulance,
  Eye,
  FileCheck2,
  Globe,
  Layers,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";

interface VerificationNavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
  badgeVariant?: "default" | "destructive" | "outline" | "secondary";
}

const navItems: VerificationNavItem[] = [
  {
    label: "Verification Cases",
    href: "/hospital-admin/verification",
    icon: FileCheck2,
    badge: "10",
  },
  {
    label: "Doctor Affiliations",
    href: "/hospital-admin/verification/doctor-affiliations",
    icon: Stethoscope,
    badge: "10 Doctors",
  },
  {
    label: "Ambulance & Emergency",
    href: "/hospital-admin/verification/capabilities",
    icon: Ambulance,
    badge: "4 Verified",
  },
  {
    label: "Expiry Alerts",
    href: "/hospital-admin/verification/expiry-alerts",
    icon: AlertTriangle,
    badge: "2 At Risk",
    badgeVariant: "destructive",
  },
  {
    label: "Public Profile Preview",
    href: "/hospital-admin/verification/public-preview",
    icon: Globe,
  },
];

export function VerificationNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/80 text-xs scrollbar-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/verification"
            ? pathname === "/hospital-admin/verification"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <Icon className={`h-3.5 w-3.5 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
            <span>{item.label}</span>
            {item.badge && (
              <Badge
                variant={item.badgeVariant || (isActive ? "secondary" : "outline")}
                className={`text-[10px] px-1.5 py-0 h-4 font-mono ${
                  isActive ? "bg-primary-foreground/20 text-primary-foreground border-transparent" : ""
                }`}
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
