"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Hourglass,
  Layers,
  Pill,
  RotateCcw,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";

interface PharmacyNavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
  badgeVariant?: "default" | "destructive" | "outline" | "secondary";
}

const navItems: PharmacyNavItem[] = [
  {
    label: "Inventory & Formulary",
    href: "/hospital-admin/pharmacy",
    icon: Pill,
    badge: "15 SKUs",
  },
  {
    label: "Prescriptions Queue",
    href: "/hospital-admin/pharmacy/prescriptions",
    icon: FileText,
    badge: "4 Orders",
    badgeVariant: "destructive",
  },
  {
    label: "Dispensing Console",
    href: "/hospital-admin/pharmacy/dispensing",
    icon: CheckCircle2,
    badge: "Active",
  },
  {
    label: "Low Stock Alerts",
    href: "/hospital-admin/pharmacy/low-stock",
    icon: AlertTriangle,
    badge: "3 Low",
    badgeVariant: "destructive",
  },
  {
    label: "Expiry & FEFO",
    href: "/hospital-admin/pharmacy/expiry",
    icon: Calendar,
    badge: "2 Expiring",
    badgeVariant: "secondary",
  },
  {
    label: "Pending POs",
    href: "/hospital-admin/pharmacy/pending-orders",
    icon: Hourglass,
    badge: "3 Orders",
  },
  {
    label: "Suppliers",
    href: "/hospital-admin/pharmacy/suppliers",
    icon: Truck,
    badge: "4 Vendors",
  },
  {
    label: "Pharmacy Staff",
    href: "/hospital-admin/pharmacy/staff",
    icon: Users,
    badge: "3 On Duty",
  },
  {
    label: "Sales & Returns",
    href: "/hospital-admin/pharmacy/sales-returns",
    icon: RotateCcw,
  },
];

export function PharmacyNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/80 text-xs scrollbar-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/pharmacy"
            ? pathname === "/hospital-admin/pharmacy"
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
