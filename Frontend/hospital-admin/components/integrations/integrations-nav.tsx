"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import {
  Webhook,
  MessageSquare,
  CreditCard,
  FlaskConical,
  Pill,
  ShieldCheck,
  Cpu,
  Key,
  LayoutDashboard,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { mockIntegrationsAnalyticsSummary } from "@/hospital-admin/lib/mock-data/integrations";

export function IntegrationsNav() {
  const pathname = usePathname();
  const connectors = useSelector((s: RootState) => s.integrations?.connectors || []);
  const analytics = useSelector(
    (s: RootState) => s.integrations?.analytics || mockIntegrationsAnalyticsSummary
  );

  const whatsappConn = connectors.find((c) => c.category === "WhatsApp");
  const isWhatsAppDegraded = whatsappConn?.status === "Degraded";

  const navItems = [
    {
      label: "Connectivity Hub",
      href: "/hospital-admin/integrations",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "WhatsApp Telemetry",
      href: "/hospital-admin/integrations/whatsapp",
      icon: MessageSquare,
      badgeText: isWhatsAppDegraded ? "Degraded" : "Healthy",
      badgeVariant: isWhatsAppDegraded ? "warning" : "success",
    },
    {
      label: "Payment Gateway",
      href: "/hospital-admin/integrations/payment-gateway",
      icon: CreditCard,
    },
    {
      label: "Lab Interfacing",
      href: "/hospital-admin/integrations/lab",
      icon: FlaskConical,
    },
    {
      label: "Pharmacy Scanners",
      href: "/hospital-admin/integrations/pharmacy",
      icon: Pill,
    },
    {
      label: "Insurance / TPA Switch",
      href: "/hospital-admin/integrations/insurance-tpa",
      icon: ShieldCheck,
    },
    {
      label: "External Systems",
      href: "/hospital-admin/integrations/external-systems",
      icon: Cpu,
      badgeText: "ABDM • PACS • GPS",
    },
    {
      label: "API Management",
      href: "/hospital-admin/integrations/api",
      icon: Key,
    },
  ];

  return (
    <div className="border-b border-border bg-card/60 backdrop-blur px-6">
      <div className="flex items-center space-x-1 overflow-x-auto py-2 scrollbar-none">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href) &&
              (item.href === "/integrations" ? pathname === "/hospital-admin/integrations" : true);

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
              {item.badgeText && (
                <Badge
                  variant={isActive ? "secondary" : "outline"}
                  className={`ml-1 h-4 px-1.5 text-[10px] font-semibold ${
                    item.badgeVariant === "warning" && !isActive
                      ? "bg-amber-500/10 text-amber-600 border-amber-500/30 animate-pulse"
                      : item.badgeVariant === "success" && !isActive
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                      : ""
                  }`}
                >
                  {item.badgeText}
                </Badge>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
