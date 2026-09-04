"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  PieChart,
  Receipt,
  Search,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { FinancialReportsNav } from "@/hospital-admin/components/financial-reports/financial-reports-nav";
import {
  mockServiceCategoryRevenues,
  getScaledServiceCategoryRevenues,
} from "@/hospital-admin/lib/mock-data/financial-reports";

export default function ServiceRevenueReportPage() {
  const [mounted, setMounted] = useState(false);
  const [period, setPeriod] = useState("This Month");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

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

  const multiplier = getMultiplier(period);
  const scaledServices = getScaledServiceCategoryRevenues(multiplier);

  const totalBilled = scaledServices.reduce((acc, curr) => acc + curr.billedAmount, 0);
  const totalConcessions = scaledServices.reduce((acc, curr) => acc + curr.concessions, 0);
  const totalNet = scaledServices.reduce((acc, curr) => acc + curr.netRealized, 0);
  const totalServices = scaledServices.reduce((acc, curr) => acc + curr.itemCount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Scope & Header */}
      <div className="flex flex-col gap-2">
        <ScopeIndicator scope="Hospital Admin" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/hospital-admin/financial-reports">
              <Button variant="outline" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <PageHeader
              title="Service Category Revenue Report"
              description="Revenue categorized by service line: Consultations, Surgeries/OT, Lab Diagnostics, Radiology, Pharmacy, and Room Charges."
              crumbs={[
                { label: "Finance" },
                { label: "Financial Reports", href: "/hospital-admin/financial-reports" },
                { label: "Service Revenue" },
              ]}
            />
          </div>
          <Badge variant="outline" className="text-xs bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30">
            Integrated Source: Clinical Service Invoices
          </Badge>
        </div>
      </div>

      <FinancialReportsNav period={period} onPeriodChange={setPeriod} />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Gross Service Billing</span>
          <p className="text-xl font-bold font-mono text-foreground mt-1">₹{(totalBilled / 100000).toFixed(2)} L</p>
          <span className="text-[10px] text-muted-foreground">Standard tariff value</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Service Concessions</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-1">₹{(totalConcessions / 100000).toFixed(2)} L</p>
          <span className="text-[10px] text-muted-foreground">Discounts applied</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Net Realized Value</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-1">₹{(totalNet / 100000).toFixed(2)} L</p>
          <span className="text-[10px] text-emerald-600 font-semibold">97.8% tariff realization</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Units Delivered</span>
          <p className="text-xl font-bold font-mono text-primary mt-1">{totalServices.toLocaleString()}</p>
          <span className="text-[10px] text-muted-foreground">Consults, scans, bed days</span>
        </Card>
      </div>

      {/* Service Categories Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-3 border-b border-border/60">
          <CardTitle className="text-sm font-bold">Clinical Service Line Performance</CardTitle>
          <CardDescription className="text-xs">
            Direct aggregation of individual clinical procedures and services billed across hospital departments.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 text-xs">
                <TableHead className="font-bold">Service Line Category ({period})</TableHead>
                <TableHead className="font-bold text-right">Units Billed</TableHead>
                <TableHead className="font-bold text-right">Gross Billed</TableHead>
                <TableHead className="font-bold text-right">Concessions</TableHead>
                <TableHead className="font-bold text-right">Net Realized</TableHead>
                <TableHead className="font-bold text-center">Service Margin %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scaledServices.map((svc) => (
                <TableRow key={svc.category} className="hover:bg-muted/30 text-xs transition-colors">
                  <TableCell className="font-bold text-foreground flex items-center gap-2">
                    <Receipt className="h-3.5 w-3.5 text-primary" />
                    {svc.category}
                  </TableCell>
                  <TableCell className="font-mono text-right text-muted-foreground">{svc.itemCount.toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-right">₹{svc.billedAmount.toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-right text-amber-600">-₹{svc.concessions.toLocaleString()}</TableCell>
                  <TableCell className="font-mono font-bold text-right text-emerald-600">
                    ₹{svc.netRealized.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                      {svc.marginPercent}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
