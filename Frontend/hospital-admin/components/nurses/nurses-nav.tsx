"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/hospital-admin/lib/utils";
import {
  Users,
  HeartPulse,
  FileSpreadsheet,
  Calendar,
  Award,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "All Nurses", href: "/hospital-admin/nurses", icon: Users },
  { label: "Nurse Stations", href: "/hospital-admin/nurse-stations", icon: HeartPulse },
  { label: "Nursing Audit Logs", href: "/hospital-admin/nursing-audit-logs", icon: FileSpreadsheet },
  { label: "Shift Roster", href: "/hospital-admin/roster", icon: Calendar },
  { label: "Attendance Live", href: "/hospital-admin/attendance", icon: Award },
];

export function NursesNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border pb-2 mb-4 scrollbar-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== "/nurses" && pathname.startsWith(item.href));
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
