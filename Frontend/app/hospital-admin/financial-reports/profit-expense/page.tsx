"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  Plus,
  Receipt,
  Scale,
  Search,
  ShoppingCart,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/hospital-admin/components/ui/dialog";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { FinancialReportsNav } from "@/hospital-admin/components/financial-reports/financial-reports-nav";
import {
  mockExpenseRecords,
  mockRevenueStreams,
  getScaledRevenueStreams,
  getScaledExpenses,
} from "@/hospital-admin/lib/mock-data/financial-reports";
import { ExpenseRecord, ExpenseCategory } from "@/hospital-admin/lib/types/financial-reports";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { cn } from "@/hospital-admin/lib/utils";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Operating Financial Reports workflow";

export default function ProfitExpenseReportPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [period, setPeriod] = useState("This Month");
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(mockExpenseRecords);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Record Expense Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [category, setCategory] = useState<ExpenseCategory>("Procurement/Supplies");
  const [amount, setAmount] = useState(250000);
  const [department, setDepartment] = useState("Central Store & Pharmacy");
  const [vendorName, setVendorName] = useState("Smith & Nephew Medical");
  const [linkedPoId, setLinkedPoId] = useState("PO-2026-8804");
  const [paymentMethod, setPaymentMethod] = useState<any>("Bank Transfer");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

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
  const scaledRevenue = getScaledRevenueStreams(multiplier);
  const scaledExpensesList = getScaledExpenses(multiplier);

  if (!mounted) return null;

  const totalGrossRevenue = scaledRevenue.reduce((acc, curr) => acc + curr.grossAmount, 0);
  const totalOperatingExpenses = (period === "This Month" ? expenses : scaledExpensesList).reduce(
    (acc, curr) => acc + curr.amount,
    0
  );
  const netOperationalSurplus = totalGrossRevenue - totalOperatingExpenses;
  const netMarginPercent = ((netOperationalSurplus / totalGrossRevenue) * 100).toFixed(1);

  const displayExpenses = period === "This Month" ? expenses : scaledExpensesList;
  const filteredExpenses = displayExpenses.filter((exp) => {
    const matchesSearch =
      exp.expenseNo.toLowerCase().includes(search.toLowerCase()) ||
      exp.department.toLowerCase().includes(search.toLowerCase()) ||
      (exp.vendorName && exp.vendorName.toLowerCase().includes(search.toLowerCase())) ||
      exp.notes.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || exp.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const newExp: ExpenseRecord = {
      id: `exp_${Date.now()}`,
      expenseNo: `EXP-2026-${Math.floor(100 + Math.random() * 900)}`,
      category,
      amount: Number(amount),
      department,
      date: new Date().toISOString().split("T")[0],
      approvedBy: Number(amount) > 1000000 ? "Medical Board / Director" : "Hospital Admin",
      vendorName,
      linkedPoId: linkedPoId ? linkedPoId : undefined,
      notes: notes || "Operating expenditure record logged.",
      status: Number(amount) > 2000000 ? "Pending Approval" : "Approved",
      paymentMethod,
    };

    setExpenses((prev) => [newExp, ...prev]);
    toast({
      title: "Operating Expense Recorded",
      description: `${newExp.expenseNo} for ₹${Number(amount).toLocaleString()} added to financial ledger. (${DELEGATION_STRING})`,
    });
    setAddModalOpen(false);
  };

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
              title="Profit / Expense &amp; Operational P&amp;L Analysis"
              description="Operating expenditure recording (Payroll, Utilities, Procurement POs), threshold authorizations, and net P&amp;L calculation."
              crumbs={[
                { label: "Finance" },
                { label: "Financial Reports", href: "/hospital-admin/financial-reports" },
                { label: "Profit / Expense" },
              ]}
            />
          </div>
          <Button size="sm" className="gap-1.5 font-semibold text-xs" onClick={() => setAddModalOpen(true)}>
            <Plus className="h-4 w-4" /> Record Operating Expense
          </Button>
        </div>
      </div>

      <FinancialReportsNav period={period} onPeriodChange={setPeriod} />

      {/* Operational P&L Executive Summary Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4 border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase">1. Gross Hospital Revenue</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-600 mt-1">
            ₹{(totalGrossRevenue / 100000).toFixed(2)} L
          </p>
          <span className="text-[10px] text-muted-foreground">Billed across all clinical departments</span>
        </Card>

        <Card className="p-4 border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase">2. Operating Expenditures</span>
            <TrendingDown className="h-4 w-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-rose-600 mt-1">
            -₹{(totalOperatingExpenses / 100000).toFixed(2)} L
          </p>
          <span className="text-[10px] text-muted-foreground">Payroll, Utilities, PO Supplies, Maintenance</span>
        </Card>

        <Card className="p-4 border-border bg-card shadow-xs bg-linear-to-br from-card to-emerald-500/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase">3. Net Operational Surplus</span>
            <Scale className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold font-mono text-foreground mt-1">
            ₹{(netOperationalSurplus / 100000).toFixed(2)} L
          </p>
          <span className="text-[10px] text-emerald-600 font-bold">{netMarginPercent}% Operating Margin</span>
        </Card>
      </div>

      {/* Expense Management Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-3 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold">Operating Expenses Ledger</CardTitle>
              <CardDescription className="text-xs">
                Hospital operating expenditures categorized and linked directly to Procurement Purchase Orders.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter expense ledger..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-8 text-xs w-44">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Payroll">Payroll</SelectItem>
                  <SelectItem value="Procurement/Supplies">Procurement/Supplies</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 text-xs">
                <TableHead className="font-bold">Expense #</TableHead>
                <TableHead className="font-bold">Category</TableHead>
                <TableHead className="font-bold">Department / Beneficiary</TableHead>
                <TableHead className="font-bold">Linked Procurement PO</TableHead>
                <TableHead className="font-bold">Date &amp; Pay Method</TableHead>
                <TableHead className="font-bold text-right">Amount</TableHead>
                <TableHead className="font-bold text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((exp) => (
                <TableRow key={exp.id} className="hover:bg-muted/30 text-xs transition-colors">
                  <TableCell className="font-mono font-bold text-primary">{exp.expenseNo}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {exp.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-foreground block">{exp.department}</span>
                    {exp.vendorName && <span className="text-[10px] text-muted-foreground">{exp.vendorName}</span>}
                  </TableCell>
                  <TableCell>
                    {exp.linkedPoId ? (
                      <Link
                        href={`/hospital-admin/procurement`}
                        className="inline-flex items-center gap-1 font-mono text-[10px] text-primary hover:underline bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20"
                      >
                        <ShoppingCart className="h-2.5 w-2.5" />
                        {exp.linkedPoId}
                      </Link>
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic">Direct Expense</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    <div>{exp.date}</div>
                    <span className="text-[10px] opacity-80">{exp.paymentMethod}</span>
                  </TableCell>
                  <TableCell className="font-mono font-bold text-right text-rose-600">
                    ₹{exp.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={
                        exp.status === "Approved"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                      }
                    >
                      {exp.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* RECORD OPERATING EXPENSE MODAL */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSaveExpense}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" /> Record Operating Expenditure
              </DialogTitle>
              <DialogDescription className="text-xs">
                Log hospital operating expenses or link to an existing Procurement Purchase Order.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="exp-cat">Expense Category *</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as any)}>
                    <SelectTrigger id="exp-cat" className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Payroll">Payroll</SelectItem>
                      <SelectItem value="Procurement/Supplies">Procurement/Supplies</SelectItem>
                      <SelectItem value="Utilities">Utilities</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="exp-amt">Amount (₹) *</Label>
                  <Input
                    id="exp-amt"
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="exp-dept">Attributed Department *</Label>
                  <Input
                    id="exp-dept"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="exp-po">Linked Procurement PO (Optional)</Label>
                  <Input
                    id="exp-po"
                    placeholder="e.g. PO-2026-8801"
                    value={linkedPoId}
                    onChange={(e) => setLinkedPoId(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="exp-vendor">Vendor / Payee Name</Label>
                  <Input
                    id="exp-vendor"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="exp-paymethod">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
                    <SelectTrigger id="exp-paymethod" className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank Transfer">Bank Transfer (NEFT/RTGS)</SelectItem>
                      <SelectItem value="Cheque">Corporate Cheque</SelectItem>
                      <SelectItem value="Corporate Card">Corporate Card</SelectItem>
                      <SelectItem value="Direct Debit">Direct Debit / Auto-Pay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="exp-notes">Description / Accounting Notes</Label>
                <Textarea
                  id="exp-notes"
                  rows={2}
                  placeholder="Justification and invoice remarks..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold">
                Save &amp; Post to Ledger
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
