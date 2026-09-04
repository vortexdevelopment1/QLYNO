"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/hospital-admin/lib/utils";
import {
  Receipt,
  User,
  Bed,
  Scissors,
  FlaskConical,
  Pill,
  RotateCcw,
  Percent,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "All Invoices", href: "/hospital-admin/billing", icon: Receipt },
  { label: "OPD Billing", href: "/hospital-admin/billing/opd", icon: User },
  { label: "IPD Billing", href: "/hospital-admin/billing/ipd", icon: Bed },
  { label: "Procedure Billing", href: "/hospital-admin/billing/procedures", icon: Scissors },
  { label: "Lab Billing", href: "/hospital-admin/billing/lab", icon: FlaskConical },
  { label: "Pharmacy Billing", href: "/hospital-admin/billing/pharmacy", icon: Pill },
  { label: "Refunds Queue", href: "/hospital-admin/billing/refunds", icon: RotateCcw },
  { label: "Discounts Registry", href: "/hospital-admin/billing/discounts", icon: Percent },
];

export function BillingNav() {
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
