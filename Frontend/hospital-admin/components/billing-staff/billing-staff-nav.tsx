"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/hospital-admin/lib/utils";
import {
  Users,
  CreditCard,
  Layers,
  Receipt,
  FileCheck2,
  Lock,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "Billing Officers", href: "/hospital-admin/staff/billing-staff", icon: Users },
  { label: "Invoices & Billing Hub", href: "/hospital-admin/billing", icon: Receipt },
  { label: "Payments & Collections", href: "/hospital-admin/payments", icon: CreditCard },
  { label: "Insurance & TPA", href: "/hospital-admin/insurance-tpa", icon: FileCheck2 },
  { label: "Staff Permissions", href: "/hospital-admin/staff-permissions", icon: Lock },
];

export function BillingStaffNav() {
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
