"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/hospital-admin/lib/utils";
import {
  Building,
  Grid,
  CheckCircle2,
  Users,
  Bookmark,
  Activity,
  ShieldAlert,
  ArrowRightLeft,
  Sparkles,
  History,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "All Wards", href: "/hospital-admin/wards-beds", icon: Building },
  { label: "Interactive Bed Map", href: "/hospital-admin/wards-beds/bed-map", icon: Grid },
  { label: "Available Beds", href: "/hospital-admin/wards-beds/available", icon: CheckCircle2 },
  { label: "Occupied Beds", href: "/hospital-admin/wards-beds/occupied", icon: Users },
  { label: "Reserved Beds", href: "/hospital-admin/wards-beds/reserved", icon: Bookmark },
  { label: "ICU Critical Care", href: "/hospital-admin/wards-beds/icu", icon: Activity },
  { label: "Isolation Units", href: "/hospital-admin/wards-beds/isolation", icon: ShieldAlert },
  { label: "Bed Transfer Desk", href: "/hospital-admin/wards-beds/transfer", icon: ArrowRightLeft },
  { label: "Cleaning Turnaround", href: "/hospital-admin/wards-beds/cleaning", icon: Sparkles },
  { label: "Bed History & Audit", href: "/hospital-admin/wards-beds/history", icon: History },
];

export function WardsBedsNav() {
  const pathname = usePathname();

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
