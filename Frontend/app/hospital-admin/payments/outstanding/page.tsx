"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileSpreadsheet,
  Filter,
  History,
  Receipt,
  Scale,
  Search,
  ShieldAlert,
  Sparkles,
  User,
  Wallet,
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
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { PaymentsNav } from "@/hospital-admin/components/payments/PaymentsNav";
import { invoices as f11Invoices } from "@/hospital-admin/lib/mock-data/invoices";
import { Invoice } from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { formatDateTime, formatDate, formatCurrency, cn } from "@/hospital-admin/lib/utils";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Outstanding Receivables Settlement workflow";

export default function OutstandingPaymentsPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [invoicesList, setInvoicesList] = useState<Invoice[]>(f11Invoices);
  const [search, setSearch] = useState("");
  const [agingFilter, setAgingFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");

  // Collect / Pay Dialog State
  const [collectModalOpen, setCollectModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [collectAmount, setCollectAmount] = useState(0);
  const [collectMethod, setCollectMethod] = useState("UPI/QR");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter for unpaid and partially paid invoices
  const outstandingInvoices = useMemo(() => {
    return invoicesList.filter((inv) => inv.outstanding > 0 || inv.status === "issued" || inv.status === "partially-paid");
  }, [invoicesList]);

  const filtered = useMemo(() => {
    return outstandingInvoices.filter((inv) => {
      const matchSearch =
        inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
        inv.patientName.toLowerCase().includes(search.toLowerCase()) ||
        inv.patientId.toLowerCase().includes(search.toLowerCase()) ||
        (inv.department && inv.department.toLowerCase().includes(search.toLowerCase()));

      const matchDept = deptFilter === "all" || (inv.department && inv.department.toLowerCase().includes(deptFilter.toLowerCase()));
      return matchSearch && matchDept;
    });
  }, [outstandingInvoices, search, deptFilter]);

  const totalOutstanding = useMemo(
    () => outstandingInvoices.reduce((sum, inv) => sum + inv.outstanding, 0),
    [outstandingInvoices]
  );

  const ipdOutstanding = useMemo(
    () => outstandingInvoices.filter((i) => i.encounterType === "IPD").reduce((sum, i) => sum + i.outstanding, 0),
    [outstandingInvoices]
  );

  const opdOutstanding = useMemo(
    () => outstandingInvoices.filter((i) => i.encounterType === "OPD").reduce((sum, i) => sum + i.outstanding, 0),
    [outstandingInvoices]
  );

  const handleOpenCollect = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setCollectAmount(inv.outstanding);
    setCollectModalOpen(true);
  };

  const handleConfirmCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    const remaining = selectedInvoice.outstanding - collectAmount;
    setInvoicesList((prev) =>
      prev.map((inv) =>
        inv.id === selectedInvoice.id
          ? {
              ...inv,
              paid: inv.paid + collectAmount,
              outstanding: Math.max(0, remaining),
              status: (remaining <= 0 ? "paid" : "partially-paid") as Invoice["status"],
            }
          : inv
      )
    );

    toast({
      title: "Payment Recorded Successfully",
      description: `Collected ${formatCurrency(collectAmount)} for ${selectedInvoice.invoiceNo} via ${collectMethod}. (${DELEGATION_STRING})`,
    });
    setCollectModalOpen(false);
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Outstanding Receivables &amp; Unpaid Balances"
          description="Live receivables tracking across inpatient admissions, OPD consultations, lab panels, and pharmacy invoices."
          crumbs={[{ label: "Finance" }, { label: "Payments", href: "/hospital-admin/payments" }, { label: "Outstanding" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading receivables...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Outstanding Receivables &amp; Unpaid Balances"
        description="Live receivables tracking across inpatient admissions, OPD consultations, lab panels, and pharmacy invoices."
        crumbs={[{ label: "Finance" }, { label: "Payments", href: "/hospital-admin/payments" }, { label: "Outstanding" }]}
        actions={
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs font-semibold gap-1.5"
            asChild
          >
            <Link href="/hospital-admin/billing">
              <Receipt className="h-3.5 w-3.5 text-primary" /> Central Billing Invoices
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Live Receivables &amp; Outstanding Ledger" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
          <span>Billing Synchronization • Real-time receivables ledger integrated directly with patient invoices</span>
        </div>
      </div>

      <PaymentsNav />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Receivables Due</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">{formatCurrency(totalOutstanding)}</p>
          <span className="text-[10px] text-muted-foreground">{outstandingInvoices.length} Unsettled Invoices</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">IPD Inpatient Dues</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{formatCurrency(ipdOutstanding)}</p>
          <span className="text-[10px] text-muted-foreground">Discharge Settlement Pending</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">OPD &amp; Diagnostics Dues</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">{formatCurrency(opdOutstanding)}</p>
          <span className="text-[10px] text-muted-foreground">Active Clinical Sessions</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Overdue (&gt;30 Days)</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">₹0.00</p>
          <span className="text-[10px] text-emerald-600 font-medium">100% Current Period</span>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Scale className="h-4 w-4 text-rose-600" /> Pending Receivables Registry
            </CardTitle>
            <CardDescription className="text-xs">
              Direct live feed of unpaid and partially settled patient hospital invoices.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search invoice #, patient, department..."
                className="pl-8 text-xs h-8 w-60"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="h-8 text-xs w-36">
                <SelectValue placeholder="All Depts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Depts</SelectItem>
                <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                <SelectItem value="Cardiology">Cardiology</SelectItem>
                <SelectItem value="Pathology">Pathology</SelectItem>
                <SelectItem value="Pharmacy">Pharmacy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2">
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Invoice #</TableHead>
                  <TableHead className="text-xs font-bold">Patient &amp; UHID</TableHead>
                  <TableHead className="text-xs font-bold">Department &amp; Service</TableHead>
                  <TableHead className="text-xs font-bold text-right">Total Billed</TableHead>
                  <TableHead className="text-xs font-bold text-right">Paid</TableHead>
                  <TableHead className="text-xs font-bold text-right">Outstanding Due</TableHead>
                  <TableHead className="text-xs font-bold text-center">Status</TableHead>
                  <TableHead className="text-xs font-bold text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-xs text-muted-foreground">
                      No outstanding receivables found matching the selected filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((inv) => (
                    <TableRow key={inv.id} className="hover:bg-muted/30 text-xs">
                      <TableCell className="font-mono font-bold">
                        <Link href="/hospital-admin/billing" className="text-primary hover:underline">
                          {inv.invoiceNo}
                        </Link>
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-foreground">{inv.patientName}</div>
                        <span className="text-[10px] font-mono text-muted-foreground">{inv.patientId}</span>
                      </TableCell>

                      <TableCell>
                        <div className="text-foreground">{inv.department}</div>
                        <span className="text-[10px] text-muted-foreground line-clamp-1">{inv.service}</span>
                      </TableCell>

                      <TableCell className="text-right font-mono font-medium">
                        {formatCurrency(inv.amount)}
                      </TableCell>

                      <TableCell className="text-right font-mono text-emerald-600 font-medium">
                        {formatCurrency(inv.paid)}
                      </TableCell>

                      <TableCell className="text-right font-mono font-bold text-rose-600">
                        {formatCurrency(inv.outstanding)}
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          className={cn(
                            "text-[9px] uppercase font-mono",
                            inv.status === "paid"
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                              : inv.status === "partially-paid"
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                              : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
                          )}
                        >
                          {inv.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          className="h-7 text-[11px] font-semibold bg-primary text-primary-foreground"
                          onClick={() => handleOpenCollect(inv)}
                        >
                          Collect / Pay
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* COLLECT / RECORD PAYMENT MODAL */}
      <Dialog open={collectModalOpen} onOpenChange={setCollectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleConfirmCollection}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-primary">
                <Receipt className="h-5 w-5 text-primary" /> Collect Outstanding Balance
              </DialogTitle>
              <DialogDescription className="text-xs">
                Record collection against invoice <strong>{selectedInvoice?.invoiceNo}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div className="p-3 bg-muted/20 rounded-lg border border-border space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patient:</span>
                  <span className="font-bold text-foreground">{selectedInvoice?.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Due:</span>
                  <span className="font-mono font-bold text-rose-600">
                    {formatCurrency(selectedInvoice?.outstanding || 0)}
                  </span>
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="col-amount">Amount to Collect (₹) *</Label>
                <Input
                  id="col-amount"
                  type="number"
                  required
                  max={selectedInvoice?.outstanding || 0}
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(Number(e.target.value))}
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="col-method">Payment Method</Label>
                <Select value={collectMethod} onValueChange={setCollectMethod}>
                  <SelectTrigger id="col-method" className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPI/QR">UPI / Dynamic QR</SelectItem>
                    <SelectItem value="Cash">Cash (Desk Drawer)</SelectItem>
                    <SelectItem value="Credit/Debit Card">Credit/Debit Card (POS)</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Wire / IMPS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setCollectModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Confirm &amp; Issue Receipt
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
