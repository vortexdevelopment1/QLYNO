"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Bed,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  Eye,
  FileText,
  IndianRupee,
  MoreHorizontal,
  Plus,
  Receipt,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
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
import { BillingNav } from "@/hospital-admin/components/billing/billing-nav";
import { invoices as initialInvoices } from "@/hospital-admin/lib/mock-data/invoices";
import { Invoice, InterimDeposit } from "@/hospital-admin/lib/types";
import { formatCurrency, formatDate } from "@/hospital-admin/lib/utils";
import { useToast } from "@/hospital-admin/hooks/use-toast";

export default function IPDBillingPage() {
  const [mounted, setMounted] = useState(false);
  const [invoicesList, setInvoicesList] = useState<Invoice[]>(initialInvoices);
  const [search, setSearch] = useState("");

  // Interim Deposit Modal State (Rule F11-CAN-18)
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [depositAmount, setDepositAmount] = useState<number>(25000);
  const [depositMode, setDepositMode] = useState<"Cash" | "Card" | "UPI" | "Insurance" | "Online">("UPI");
  const [depositNotes, setDepositNotes] = useState("Mid-stay interim advance for OT & Bed charges");

  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter invoices for IPD encounter types (Rule F11-CANNOT-7: single underlying store)
  const ipdInvoices = useMemo(() => {
    return invoicesList.filter(
      (i) =>
        i.encounterType === "IPD" &&
        (i.patientName.toLowerCase().includes(search.toLowerCase()) ||
          i.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
          i.service.toLowerCase().includes(search.toLowerCase()))
    );
  }, [invoicesList, search]);

  const totalRunningCharges = ipdInvoices.reduce((sum, i) => sum + i.amount, 0);
  const totalInterimPaid = ipdInvoices.reduce((sum, i) => sum + i.paid, 0);
  const totalOutstanding = ipdInvoices.reduce((sum, i) => sum + i.outstanding, 0);
  const clearedCount = ipdInvoices.filter((i) => i.outstanding === 0).length;

  const handleOpenDepositModal = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setDepositAmount(inv.outstanding > 0 ? Math.min(inv.outstanding, 50000) : 25000);
    setDepositModalOpen(true);
  };

  const handleRecordInterimDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    const newDeposit: InterimDeposit = {
      id: `dep_${Date.now()}`,
      amount: Number(depositAmount),
      date: new Date().toISOString().split("T")[0],
      mode: depositMode,
      receiptNo: `REC-IPD-${Math.floor(1000 + Math.random() * 9000)}`,
      cashierName: "Meenakshi Sundaram (IPD Cashier)",
      notes: depositNotes,
    };

    setInvoicesList((prev) =>
      prev.map((i) => {
        if (i.id === selectedInvoice.id) {
          const newPaid = i.paid + Number(depositAmount);
          const newOutstanding = Math.max(0, i.amount - newPaid);
          const isCleared = newOutstanding === 0;
          return {
            ...i,
            paid: newPaid,
            outstanding: newOutstanding,
            status: isCleared ? "paid" : "partially-paid",
            dischargeCleared: isCleared,
            interimDeposits: [...(i.interimDeposits || []), newDeposit],
          };
        }
        return i;
      })
    );

    toast({
      title: "Interim Deposit Logged",
      description: `₹${depositAmount.toLocaleString("en-IN")} credited to ${selectedInvoice.invoiceNo}. Receipt ${newDeposit.receiptNo} issued.`,
    });
    setDepositModalOpen(false);
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="IPD Inpatient Billing &amp; Interim Deposits"
          description="Live running bills, interim deposit ledger, surgery package accrual, and discharge clearance gate."
          crumbs={[{ label: "Finance" }, { label: "Billing", href: "/hospital-admin/billing" }, { label: "IPD Billing" }]}
        />
        <BillingNav />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading IPD billing...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="IPD Inpatient Billing &amp; Interim Deposits"
        description="Live running bills, interim deposit ledger, surgery package accrual, and discharge clearance gate."
        crumbs={[{ label: "Finance" }, { label: "Billing", href: "/hospital-admin/billing" }, { label: "IPD Billing" }]}
      />

      <BillingNav />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total IPD Running Total</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{formatCurrency(totalRunningCharges)}</p>
          <span className="text-[10px] text-muted-foreground">Accrued bed &amp; surgery charges</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Interim Deposits Collected</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{formatCurrency(totalInterimPaid)}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Recorded mid-stay deposits</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Outstanding at Discharge</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">{formatCurrency(totalOutstanding)}</p>
          <span className="text-[10px] text-rose-600 font-medium">Pending settlement</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Discharge Cleared Patients</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">
            {clearedCount} / {ipdInvoices.length} Cleared
          </p>
          <span className="text-[10px] text-cyan-600 font-medium">Live sync with IPD Module</span>
        </Card>
      </div>

      {/* Main IPD Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Inpatient Admissions Billing Roster</CardTitle>
          <CardDescription className="text-xs">
            Tracking interim deposits vs. gross running total and discharge clearance gates.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patient, invoice #, or procedure..."
                className="pl-8 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Invoice #</TableHead>
                  <TableHead className="text-xs font-bold">Patient Details</TableHead>
                  <TableHead className="text-xs font-bold">Procedure / Ward Service</TableHead>
                  <TableHead className="text-xs font-bold">Running Total</TableHead>
                  <TableHead className="text-xs font-bold">Interim Paid</TableHead>
                  <TableHead className="text-xs font-bold">Outstanding</TableHead>
                  <TableHead className="text-xs font-bold">Discharge Gate</TableHead>
                  <TableHead className="text-xs font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ipdInvoices.map((inv) => (
                  <TableRow key={inv.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-foreground">
                      <Link href={`/hospital-admin/billing/${inv.id}`} className="hover:underline hover:text-primary">
                        {inv.invoiceNo}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground">{inv.patientName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {inv.patientId} • {inv.department}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium max-w-[220px] truncate">{inv.service}</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-foreground">
                      {formatCurrency(inv.amount)}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-emerald-600">
                      {formatCurrency(inv.paid)}
                    </TableCell>
                    <TableCell
                      className={`font-mono text-xs font-bold ${
                        inv.outstanding > 0 ? "text-rose-600" : "text-emerald-600"
                      }`}
                    >
                      {formatCurrency(inv.outstanding)}
                    </TableCell>
                    <TableCell>
                      {inv.outstanding === 0 ? (
                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Cleared for Discharge
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]">
                          <Clock className="h-3 w-3 mr-1" /> Settlement Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {inv.outstanding > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs font-semibold"
                          onClick={() => handleOpenDepositModal(inv)}
                        >
                          + Interim Deposit
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" asChild className="h-7 text-xs">
                        <Link href={`/hospital-admin/billing/${inv.id}`}>View Bill</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Record Interim Deposit Modal */}
      <Dialog open={depositModalOpen} onOpenChange={setDepositModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleRecordInterimDeposit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" /> Record IPD Interim Deposit
              </DialogTitle>
              <DialogDescription className="text-xs">
                Log a mid-stay advance deposit for {selectedInvoice?.patientName} ({selectedInvoice?.invoiceNo}).
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-3 text-xs">
              <div className="p-2.5 rounded-lg border border-border bg-muted/20 space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Gross Running Total:</span>
                  <span className="font-mono font-bold text-foreground">
                    {formatCurrency(selectedInvoice?.amount || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Current Outstanding Balance:</span>
                  <span className="font-mono font-bold text-rose-600">
                    {formatCurrency(selectedInvoice?.outstanding || 0)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="dep-amount">Deposit Amount (₹)</Label>
                  <Input
                    id="dep-amount"
                    type="number"
                    required
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="dep-mode">Payment Mode</Label>
                  <Select value={depositMode} onValueChange={(val: any) => setDepositMode(val)}>
                    <SelectTrigger id="dep-mode" className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UPI">UPI / QR Code</SelectItem>
                      <SelectItem value="Card">Credit / Debit Card</SelectItem>
                      <SelectItem value="Cash">Cash Drawer</SelectItem>
                      <SelectItem value="Insurance">TPA Pre-Auth Advance</SelectItem>
                      <SelectItem value="Online">NEFT / Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="dep-notes">Deposit Voucher Notes</Label>
                <Input
                  id="dep-notes"
                  value={depositNotes}
                  onChange={(e) => setDepositNotes(e.target.value)}
                  placeholder="e.g. Implant advance deposit"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setDepositModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Record Deposit &amp; Issue Receipt
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
