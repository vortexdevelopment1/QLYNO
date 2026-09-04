"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  ArrowRight,
  BadgeIndianRupee,
  BarChart3,
  Calendar,
  CreditCard,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  PieChart,
  Receipt,
  Scale,
  Sparkles,
  Stethoscope,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Badge } from "@/hospital-admin/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/hospital-admin/components/ui/select";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { cn } from "@/hospital-admin/lib/utils";
import {
  exportFinancialReportToCSV,
  exportFinancialReportToPDF,
} from "@/hospital-admin/lib/utils/financial-exports";

const NAV_ITEMS = [
  { label: "Overview Hub", href: "/hospital-admin/financial-reports", icon: BarChart3 },
  { label: "Revenue Analysis", href: "/hospital-admin/financial-reports/revenue", icon: TrendingUp },
  { label: "Collections", href: "/hospital-admin/financial-reports/collections", icon: Wallet },
  { label: "Outstanding & AR Aging", href: "/hospital-admin/financial-reports/outstanding", icon: TrendingDown },
  { label: "Department Revenue", href: "/hospital-admin/financial-reports/department-revenue", icon: Layers },
  { label: "Doctor Revenue", href: "/hospital-admin/financial-reports/doctor-revenue", icon: Stethoscope },
  { label: "Service Revenue", href: "/hospital-admin/financial-reports/service-revenue", icon: Receipt },
  { label: "Payment Reports", href: "/hospital-admin/financial-reports/payment-reports", icon: CreditCard },
  { label: "Profit / Expense & P&L", href: "/hospital-admin/financial-reports/profit-expense", icon: Scale },
];

interface FinancialReportsNavProps {
  period?: string;
  onPeriodChange?: (newPeriod: string) => void;
}

export function FinancialReportsNav({
  period,
  onPeriodChange,
}: FinancialReportsNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const queryPeriod = searchParams.get("period") || "This Month";
  const currentPeriod = period || queryPeriod;

  const activeNavItem = NAV_ITEMS.find((item) => item.href === pathname) || NAV_ITEMS[0];

  const getMultiplier = (p: string) => {
    switch (p) {
      case "Today": return 0.033;
      case "This Week": return 0.23;
      case "This Month": return 1.0;
      case "This Quarter": return 2.9;
      case "FY 2025-26": return 11.8;
      case "Custom": return 0.5;
      default: return 1.0;
    }
  };

  const handlePeriodSelect = (newPeriod: string) => {
    if (onPeriodChange) {
      onPeriodChange(newPeriod);
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", newPeriod);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    toast({
      title: "Accounting Period Filter Applied",
      description: `Displaying financial ledger metrics for ${newPeriod}.`,
    });
  };

  const handleExport = (format: "PDF" | "CSV") => {
    const mult = getMultiplier(currentPeriod);
    const reportName = activeNavItem.label;

    if (format === "CSV") {
      exportFinancialReportToCSV(pathname.replace("/financial-reports", "") || "overview", currentPeriod, mult);
      toast({
        title: "Financial CSV Export Downloaded",
        description: `${reportName} for ${currentPeriod} exported as CSV.`,
      });
    } else {
      exportFinancialReportToPDF(reportName, currentPeriod, mult);
      toast({
        title: "Official PDF Financial Report Generated",
        description: `Vector PDF for ${reportName} (${currentPeriod}) downloaded successfully.`,
      });
    }
  };

  return (
    <div className="space-y-3">
      {/* Top Toolbar: Period Filter & Export Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card p-3 rounded-lg border border-border shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary" /> Accounting Period:
          </span>
          <Select value={currentPeriod} onValueChange={handlePeriodSelect}>
            <SelectTrigger className="h-8 text-xs w-44 font-semibold text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Today">Today (Live 24h)</SelectItem>
              <SelectItem value="This Week">This Week (W34)</SelectItem>
              <SelectItem value="This Month">This Month (Aug 2026)</SelectItem>
              <SelectItem value="This Quarter">This Quarter (Q2 FY26)</SelectItem>
              <SelectItem value="FY 2025-26">FY 2025–26 (YTD)</SelectItem>
              <SelectItem value="Custom">Custom Date Range</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
            Real-time integrated ledger (Billing, Collections &amp; TPA)
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1.5"
            onClick={() => handleExport("CSV")}
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> Export CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1.5"
            onClick={() => handleExport("PDF")}
          >
            <FileText className="h-3.5 w-3.5 text-rose-600" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Sub-Navigation Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/50"
              )}
            >
              <Icon className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-primary-foreground" : "text-primary")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
