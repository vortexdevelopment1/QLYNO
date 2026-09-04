"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  Search,
  TrendingUp,
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
  mockDepartmentRevenues,
  getScaledDepartmentRevenues,
} from "@/hospital-admin/lib/mock-data/financial-reports";

export default function DepartmentRevenueReportPage() {
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
  const scaledDepts = getScaledDepartmentRevenues(multiplier);

  const totalDeptGross = scaledDepts.reduce((acc, curr) => acc + curr.totalGrossRevenue, 0);
  const totalDirectExpenses = scaledDepts.reduce((acc, curr) => acc + curr.directExpenses, 0);
  const totalNetContribution = scaledDepts.reduce((acc, curr) => acc + curr.netOperatingContribution, 0);
  const avgMargin = ((totalNetContribution / totalDeptGross) * 100).toFixed(1);

  const filteredDepts = scaledDepts.filter((d) =>
    d.departmentName.toLowerCase().includes(search.toLowerCase()) ||
    d.headOfDept.toLowerCase().includes(search.toLowerCase())
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
              title="Department Revenue &amp; Contribution Analysis"
              description="Revenue attributed across clinical departments, direct departmental expenses, and net operating contribution margins."
              crumbs={[
                { label: "Finance" },
                { label: "Financial Reports", href: "/hospital-admin/financial-reports" },
                { label: "Department Revenue" },
              ]}
            />
          </div>
          <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30">
            Integrated Source: Department Revenue Allocation
          </Badge>
        </div>
      </div>

      <FinancialReportsNav period={period} onPeriodChange={setPeriod} />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Total Dept Revenue</span>
          <p className="text-xl font-bold font-mono text-foreground mt-1">₹{(totalDeptGross / 100000).toFixed(2)} L</p>
          <span className="text-[10px] text-muted-foreground">Across all active specialties</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Direct Dept Expenses</span>
          <p className="text-xl font-bold font-mono text-purple-600 mt-1">₹{(totalDirectExpenses / 100000).toFixed(2)} L</p>
          <span className="text-[10px] text-muted-foreground">Staffing &amp; Consumables</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Net Contribution</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-1">₹{(totalNetContribution / 100000).toFixed(2)} L</p>
          <span className="text-[10px] text-emerald-600 font-semibold">{avgMargin}% average margin</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Top Earning Unit</span>
          <p className="text-sm font-bold text-primary mt-1 truncate">Cardiology &amp; Cath Lab</p>
          <span className="text-[10px] text-emerald-600 font-semibold">₹59.1 L gross (47.2% margin)</span>
        </Card>
      </div>

      {/* Department Revenue Matrix Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-3 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold">Departmental Performance &amp; Margin Ledger</CardTitle>
              <CardDescription className="text-xs">
                Derived by joining invoice line items to clinical department hierarchies.
              </CardDescription>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Filter department..."
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
                <TableHead className="font-bold">Department Specialty</TableHead>
                <TableHead className="font-bold">Head of Department</TableHead>
                <TableHead className="font-bold text-right">OPD Revenue</TableHead>
                <TableHead className="font-bold text-right">IPD Revenue</TableHead>
                <TableHead className="font-bold text-right">Procedure / OT</TableHead>
                <TableHead className="font-bold text-right">Total Gross</TableHead>
                <TableHead className="font-bold text-right">Net Contribution</TableHead>
                <TableHead className="font-bold text-center">Margin %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDepts.map((dept) => (
                <TableRow key={dept.departmentId} className="hover:bg-muted/30 text-xs transition-colors">
                  <TableCell className="font-bold text-foreground flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                    {dept.departmentName}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{dept.headOfDept}</TableCell>
                  <TableCell className="font-mono text-right">₹{dept.opdRevenue.toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-right">₹{dept.ipdRevenue.toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-right">₹{dept.procedureRevenue.toLocaleString()}</TableCell>
                  <TableCell className="font-mono font-bold text-right text-foreground">
                    ₹{dept.totalGrossRevenue.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-mono font-bold text-right text-emerald-600">
                    ₹{dept.netOperatingContribution.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                      {dept.contributionMarginPercent}%
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
