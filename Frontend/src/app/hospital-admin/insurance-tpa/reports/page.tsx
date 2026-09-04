"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  BarChart3,
  Building2,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Filter,
  Flame,
  Layers,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { InsuranceNav } from "@/hospital-admin/components/insurance-tpa/InsuranceNav";
import {
  mockTpaProviderMetrics,
  mockRejectionReasonBreakdown,
} from "@/hospital-admin/lib/mock-data/insurance-tpa-extended";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { formatCurrency, cn } from "@/hospital-admin/lib/utils";

const COLORS = ["#0d9488", "#0284c7", "#6366f1", "#8b5cf6", "#f59e0b", "#10b981"];
const DELEGATION_STRING = "Performed by Hospital Admin • acting within TPA Institutional Analytics workflow";

export default function TpaReportsPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalClaimsAll = useMemo(
    () => mockTpaProviderMetrics.reduce((sum, m) => sum + m.totalClaims, 0),
    []
  );

  const totalSettledValue = useMemo(
    () => mockTpaProviderMetrics.reduce((sum, m) => sum + m.totalSettledAmount, 0),
    []
  );

  const avgHospitalApprovalRatio = useMemo(
    () =>
      (
        mockTpaProviderMetrics.reduce((sum, m) => sum + m.approvalRatio, 0) /
        mockTpaProviderMetrics.length
      ).toFixed(1),
    []
  );

  const handleExportCSV = () => {
    const headers = "TPA Provider,Total Claims,Approved Claims,Rejected Claims,Approval Ratio (%),Avg TAT (Days),Settled Value (INR)\n";
    const rows = mockTpaProviderMetrics
      .map(
        (m) =>
          `"${m.provider}",${m.totalClaims},${m.approvedClaims},${m.rejectedClaims},${m.approvalRatio},${m.avgTatDays},${m.totalSettledAmount}`
      )
      .join("\n");

    const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TPA_Analytics_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "TPA Analytics Exported",
      description: `Downloaded operational metrics report for 6 major TPAs & Government Schemes. (${DELEGATION_STRING})`,
    });
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="TPA Operational &amp; Performance Reports"
          description="Provider-wise approval ratios, average turnaround times (TAT), rejection query Pareto analysis, and scheme compliance."
          crumbs={[{ label: "Finance" }, { label: "Insurance / TPA", href: "/hospital-admin/insurance-tpa" }, { label: "Reports" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="TPA Operational &amp; Performance Reports"
        description="Provider-wise approval ratios, average turnaround times (TAT), rejection query Pareto analysis, and scheme compliance."
        crumbs={[{ label: "Finance" }, { label: "Insurance / TPA", href: "/hospital-admin/insurance-tpa" }, { label: "Reports" }]}
        actions={
          <Button
            size="sm"
            className="h-8 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground"
            onClick={handleExportCSV}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" /> Export Analytics CSV
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="TPA Performance Intelligence Cockpit" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-primary" />
          <span>TPA Analytics • Feeds hospital-wide Finance category; benchmarks private TPAs against PM-JAY/CGHS</span>
        </div>
      </div>

      <InsuranceNav />

      {/* KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total TPA Claims Volume</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{totalClaimsAll} Claims</p>
          <span className="text-[10px] text-muted-foreground">Analyzed In Sample Period</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Mean Approval Ratio</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{avgHospitalApprovalRatio}%</p>
          <span className="text-[10px] text-emerald-600 font-medium">+2.8% vs National Benchmark</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Settled Revenue</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">{formatCurrency(totalSettledValue)}</p>
          <span className="text-[10px] text-muted-foreground">Across All TPAs</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Fastest Decision TAT</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">1.4 Days</p>
          <span className="text-[10px] text-cyan-600 font-medium">HDFC ERGO Leading</span>
        </Card>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CHART 1: APPROVAL RATIO BY PROVIDER */}
        <Card className="border-border shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-600" /> Approval Ratio by Provider (%)
            </CardTitle>
            <CardDescription className="text-xs">
              Percentage of claims approved vs rejected per TPA / scheme.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockTpaProviderMetrics} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="provider" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" />
                  <YAxis domain={[80, 100]} tick={{ fontSize: 10 }} />
                  <RechartsTooltip
                    formatter={(val: any) => [`${val}%`, "Approval Ratio"]}
                    contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Bar dataKey="approvalRatio" fill="#0d9488" radius={[4, 4, 0, 0]}>
                    {mockTpaProviderMetrics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* CHART 2: AVERAGE TURNAROUND TIME (DAYS) */}
        <Card className="border-border shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-600" /> Average Turnaround Time (TAT in Days)
            </CardTitle>
            <CardDescription className="text-xs">
              Average days from claim submission to final settlement decision.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockTpaProviderMetrics} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="provider" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" />
                  <YAxis domain={[0, 4]} tick={{ fontSize: 10 }} />
                  <RechartsTooltip
                    formatter={(val: any) => [`${val} Days`, "Average TAT"]}
                    contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Bar dataKey="avgTatDays" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* REJECTION REASON PARETO & SCHEME BREAKDOWN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* REJECTION REASONS TABLE */}
        <Card className="border-border shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-600" /> Rejection Query Root-Cause Pareto
            </CardTitle>
            <CardDescription className="text-xs">
              Breakdown of queries raised by TPA medical scrutiny desks.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-xs font-bold">Query / Rejection Category</TableHead>
                    <TableHead className="text-xs font-bold text-center w-[80px]">Count</TableHead>
                    <TableHead className="text-xs font-bold text-right w-[90px]">Share %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockRejectionReasonBreakdown.map((r, i) => (
                    <TableRow key={i} className="hover:bg-muted/30 text-xs">
                      <TableCell className="font-medium text-foreground">{r.reason}</TableCell>
                      <TableCell className="text-center font-mono font-bold text-rose-600">{r.count}</TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">{r.share}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* PROVIDER SCORECARD TABLE */}
        <Card className="border-border shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> Institutional TPA Performance Scorecard
            </CardTitle>
            <CardDescription className="text-xs">
              Summary table across volume, approval rates, and total settled receipts.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-xs font-bold">TPA Provider</TableHead>
                    <TableHead className="text-xs font-bold text-center">Approval %</TableHead>
                    <TableHead className="text-xs font-bold text-center">TAT (Days)</TableHead>
                    <TableHead className="text-xs font-bold text-right">Settled (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTpaProviderMetrics.map((m, i) => (
                    <TableRow key={i} className="hover:bg-muted/30 text-xs">
                      <TableCell className="font-medium text-foreground">{m.provider}</TableCell>
                      <TableCell className="text-center font-mono font-bold text-emerald-600">{m.approvalRatio}%</TableCell>
                      <TableCell className="text-center font-mono">{m.avgTatDays}d</TableCell>
                      <TableCell className="text-right font-mono font-medium">{formatCurrency(m.totalSettledAmount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
