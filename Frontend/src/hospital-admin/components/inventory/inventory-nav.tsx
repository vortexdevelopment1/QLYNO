"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  Pill,
  Package,
  Stethoscope,
  AlertTriangle,
  Clock,
  ArrowLeftRight,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/hospital-admin/lib/utils";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { mockInventoryCatalogExtended } from "@/hospital-admin/lib/mock-data/inventory-extended";

export function InventoryNav() {
  const pathname = usePathname();

  const lowStockCount = mockInventoryCatalogExtended.filter(
    (i) => i.status === "Low Stock"
  ).length;

  const expiringCount = mockInventoryCatalogExtended.filter((i) => {
    if (!i.expiryDate) return false;
    const days = Math.ceil(
      (new Date(i.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return days <= 90;
  }).length;

  const navItems = [
    {
      label: "Stock Overview",
      href: "/hospital-admin/inventory",
      icon: Boxes,
      badge: null,
      exact: true,
    },
    {
      label: "Medicines",
      href: "/hospital-admin/inventory/medicines",
      icon: Pill,
      badge: "Pharmacy Ref",
      exact: false,
    },
    {
      label: "Consumables",
      href: "/hospital-admin/inventory/consumables",
      icon: Package,
      badge: null,
      exact: false,
    },
    {
      label: "Medical Supplies",
      href: "/hospital-admin/inventory/medical-supplies",
      icon: Stethoscope,
      badge: null,
      exact: false,
    },
    {
      label: "Low Stock",
      href: "/hospital-admin/inventory/low-stock",
      icon: AlertTriangle,
      badge: lowStockCount > 0 ? `${lowStockCount}` : null,
      badgeVariant: "destructive" as const,
      exact: false,
    },
    {
      label: "Expiring Items",
      href: "/hospital-admin/inventory/expiring",
      icon: Clock,
      badge: expiringCount > 0 ? `${expiringCount}` : null,
      badgeVariant: "secondary" as const,
      exact: false,
    },
    {
      label: "Stock Movement",
      href: "/hospital-admin/inventory/stock-movement",
      icon: ArrowLeftRight,
      badge: null,
      exact: false,
    },
    {
      label: "Stock Adjustment",
      href: "/hospital-admin/inventory/stock-adjustment",
      icon: SlidersHorizontal,
      badge: null,
      exact: false,
    },
  ];

  return (
    <div className="border-b border-border bg-card/60 backdrop-blur-xs sticky top-0 z-10 -mx-4 px-4 sm:-mx-6 sm:px-6 mb-4">
      <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2 text-xs">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all whitespace-nowrap shrink-0",
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
              {item.badge && (
                <Badge
                  variant={item.badgeVariant || "outline"}
                  className={cn(
                    "text-[9px] px-1.5 py-0 h-4 font-mono ml-0.5",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground border-transparent"
                      : item.badgeVariant === "destructive"
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                      : "bg-muted text-muted-foreground border-border"
                  )}
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
