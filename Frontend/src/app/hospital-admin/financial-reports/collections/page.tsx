"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeIndianRupee,
  CheckCircle2,
  CreditCard,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  PieChart,
  Search,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { FinancialReportsNav } from "@/hospital-admin/components/financial-reports/financial-reports-nav";
import {
  mockCollectionChannels,
  mockRevenueStreams,
  getScaledCollectionChannels,
  getScaledRevenueStreams,
} from "@/hospital-admin/lib/mock-data/financial-reports";

export default function CollectionsReportPage() {
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
  const scaledChannels = getScaledCollectionChannels(multiplier);
  const scaledStreams = getScaledRevenueStreams(multiplier);

  const totalGrossBilled = scaledStreams.reduce((acc, curr) => acc + curr.grossAmount, 0);
  const totalCollected = scaledChannels.reduce((acc, curr) => acc + curr.amountCollected, 0);
  const totalTransactions = scaledChannels.reduce((acc, curr) => acc + curr.transactionCount, 0);
  const totalMdrDeducted = scaledChannels.reduce((acc, curr) => acc + curr.gatewayFeeDeducted, 0);
  const realizationRate = ((totalCollected / totalGrossBilled) * 100).toFixed(1);

  const filteredChannels = scaledChannels.filter((c) =>
    c.method.toLowerCase().includes(search.toLowerCase())
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
              title="Collections &amp; Realization Analysis"
              description="Period-over-period collection trends, realization efficiency % (collected vs billed), and payment method distribution."
              crumbs={[
                { label: "Finance" },
                { label: "Financial Reports", href: "/hospital-admin/financial-reports" },
                { label: "Collections" },
              ]}
            />
          </div>
          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
            Integrated Source: Realized Payment Collections
          </Badge>
        </div>
      </div>

      <FinancialReportsNav period={period} onPeriodChange={setPeriod} />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Total Collected</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-1">₹{(totalCollected / 100000).toFixed(2)} L</p>
          <span className="text-[10px] text-emerald-600 font-semibold">+8.4% realization growth</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Collection Efficiency</span>
          <p className="text-xl font-bold font-mono text-primary mt-1">{realizationRate}%</p>
          <span className="text-[10px] text-muted-foreground">Collected vs Billed Gross</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Payment Transactions</span>
          <p className="text-xl font-bold font-mono text-foreground mt-1">{totalTransactions.toLocaleString()}</p>
          <span className="text-[10px] text-muted-foreground">Across Cash, POS, UPI, NEFT</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">MDR / Gateway Fees</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-1">₹{totalMdrDeducted.toLocaleString()}</p>
          <span className="text-[10px] text-muted-foreground">0.25% effective rate</span>
        </Card>
      </div>

      {/* Payment Channel Breakdown Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-3 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold">Payment Method &amp; Gateway Distribution</CardTitle>
              <CardDescription className="text-xs">
                Derived directly from hospital payment collections ledger and bank reconciliation files.
              </CardDescription>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Filter payment channel..."
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
                <TableHead className="font-bold">Payment Instrument / Channel</TableHead>
                <TableHead className="font-bold text-right">Transactions</TableHead>
                <TableHead className="font-bold text-right">Amount Collected</TableHead>
                <TableHead className="font-bold text-right">Channel Share</TableHead>
                <TableHead className="font-bold text-right">MDR / Merchant Fee</TableHead>
                <TableHead className="font-bold text-center">Bank Reconciliation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChannels.map((channel) => (
                <TableRow key={channel.method} className="hover:bg-muted/30 text-xs transition-colors">
                  <TableCell className="font-bold text-foreground flex items-center gap-2">
                    <Wallet className="h-3.5 w-3.5 text-primary" />
                    {channel.method}
                  </TableCell>
                  <TableCell className="font-mono text-right text-muted-foreground">
                    {channel.transactionCount.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-mono font-bold text-right text-emerald-600">
                    ₹{channel.amountCollected.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-mono font-bold text-right text-primary">
                    {channel.percentageShare}%
                  </TableCell>
                  <TableCell className="font-mono text-right text-muted-foreground">
                    {channel.gatewayFeeDeducted > 0 ? `₹${channel.gatewayFeeDeducted.toLocaleString()}` : "₹0 (Zero MDR)"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={
                        channel.reconciliationStatus === "Reconciled"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                      }
                    >
                      {channel.reconciliationStatus}
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
