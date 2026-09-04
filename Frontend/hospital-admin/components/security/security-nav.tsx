"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertOctagon,
  Flame,
  KeyRound,
  Laptop,
  Lock,
  ScrollText,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  Users,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";

interface SecurityNavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
  badgeVariant?: "default" | "destructive" | "outline" | "secondary";
}

const navItems: SecurityNavItem[] = [
  {
    label: "Roles & RBAC",
    href: "/hospital-admin/roles",
    icon: ShieldCheck,
    badge: "6 Roles",
  },
  {
    label: "MFA Enforcement",
    href: "/hospital-admin/security/mfa",
    icon: KeyRound,
    badge: "5 Enforced",
  },
  {
    label: "Active Sessions",
    href: "/hospital-admin/security/sessions",
    icon: Laptop,
    badge: "2 Suspicious",
    badgeVariant: "destructive",
  },
  {
    label: "Break-Glass Access",
    href: "/hospital-admin/security/break-glass",
    icon: Flame,
    badge: "1 Active",
    badgeVariant: "destructive",
  },
  {
    label: "Audit Logs & Diffs",
    href: "/hospital-admin/audit-logs",
    icon: ScrollText,
  },
  {
    label: "Document & Privacy",
    href: "/hospital-admin/security/privacy",
    icon: Lock,
    badge: "4 Policies",
  },
];

export function SecurityNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/80 text-xs scrollbar-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/roles"
            ? pathname === "/hospital-admin/roles"
            : item.href === "/audit-logs"
            ? pathname === "/hospital-admin/audit-logs"
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
