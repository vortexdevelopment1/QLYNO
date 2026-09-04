"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  PieChart,
  Search,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { FinancialReportsNav } from "@/hospital-admin/components/financial-reports/financial-reports-nav";
import {
  mockRevenueStreams,
  mockMonthlyRevenueTrend,
  mockDailyRevenueData,
  getScaledRevenueStreams,
} from "@/hospital-admin/lib/mock-data/financial-reports";

export default function RevenueReportPage() {
  const [mounted, setMounted] = useState(false);
  const [period, setPeriod] = useState("This Month");
  const [search, setSearch] = useState("");

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
  const scaledStreams = getScaledRevenueStreams(multiplier);

  const totalGross = scaledStreams.reduce((acc, curr) => acc + curr.grossAmount, 0);
  const totalDiscounts = scaledStreams.reduce((acc, curr) => acc + curr.discounts, 0);
  const totalNet = scaledStreams.reduce((acc, curr) => acc + curr.netRevenue, 0);
  const totalInvoices = scaledStreams.reduce((acc, curr) => acc + curr.invoiceCount, 0);

  const filteredStreams = scaledStreams.filter((s) =>
    s.category.toLowerCase().includes(search.toLowerCase())
  );

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
              title="Revenue Analysis & Billing Streams"
              description="Gross revenue over time, breakdown by billing source (OPD, IPD, OT, Diagnostics), and tariff concessions."
              crumbs={[
                { label: "Finance" },
                { label: "Financial Reports", href: "/hospital-admin/financial-reports" },
                { label: "Revenue" },
              ]}
            />
          </div>
          <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
            Integrated Source: Central Hospital Invoicing System
          </Badge>
        </div>
      </div>

      <FinancialReportsNav period={period} onPeriodChange={setPeriod} />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Gross Billed</span>
          <p className="text-xl font-bold font-mono text-foreground mt-1">₹{(totalGross / 100000).toFixed(2)} L</p>
          <span className="text-[10px] text-emerald-600 font-semibold">+9.8% vs last month</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Tariff Concessions</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-1">₹{(totalDiscounts / 100000).toFixed(2)} L</p>
          <span className="text-[10px] text-muted-foreground">Discounts &amp; Waivers</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Net Revenue Realized</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-1">₹{(totalNet / 100000).toFixed(2)} L</p>
          <span className="text-[10px] text-emerald-600 font-semibold">97.3% net realization</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Total Invoices</span>
          <p className="text-xl font-bold font-mono text-primary mt-1">{totalInvoices.toLocaleString()}</p>
          <span className="text-[10px] text-muted-foreground">Aggregated across all units</span>
        </Card>
      </div>

      {/* Monthly Trend Table / Grid */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2 border-b border-border/60">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-primary" /> 6-Month Revenue &amp; Collections Trajectory
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
            {mockMonthlyRevenueTrend.map((m) => (
              <div key={m.month} className="p-3 rounded-lg bg-muted/30 border border-border space-y-1">
                <span className="text-[11px] font-bold text-foreground block">{m.month}</span>
                <span className="font-mono font-bold text-emerald-600 block text-xs">
                  ₹{(m.grossRevenue / 100000).toFixed(1)} L
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  Coll: ₹{(m.collections / 100000).toFixed(1)} L
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue by Source Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-3 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold">Revenue Source Aggregation</CardTitle>
              <CardDescription className="text-xs">
                Computed by summing invoice line items categorized under Hospital Billing.
              </CardDescription>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Filter revenue stream..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 text-xs">
                <TableHead className="font-bold">Billing Stream Category</TableHead>
                <TableHead className="font-bold text-right">Invoices</TableHead>
                <TableHead className="font-bold text-right">Gross Billed</TableHead>
                <TableHead className="font-bold text-right">Discounts</TableHead>
                <TableHead className="font-bold text-right">Net Revenue</TableHead>
                <TableHead className="font-bold text-right">Revenue Share</TableHead>
                <TableHead className="font-bold text-center">MoM Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStreams.map((stream) => (
                <TableRow key={stream.category} className="hover:bg-muted/30 text-xs transition-colors">
                  <TableCell className="font-bold text-foreground flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    {stream.category}
                  </TableCell>
                  <TableCell className="font-mono text-right text-muted-foreground">
                    {stream.invoiceCount.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-mono font-semibold text-right">
                    ₹{stream.grossAmount.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-mono text-right text-amber-600">
                    -₹{stream.discounts.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-mono font-bold text-right text-emerald-600">
                    ₹{stream.netRevenue.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-mono font-bold text-right text-primary">
                    {stream.percentageShare}%
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                      {stream.trend}
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
