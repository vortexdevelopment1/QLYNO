"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Banknote,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Globe,
  History,
  Layers,
  Plus,
  QrCode,
  Receipt,
  RefreshCw,
  RotateCcw,
  Scale,
  Search,
  ShieldAlert,
  Sparkles,
  User,
  Users,
  Wallet,
  Zap,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/hospital-admin/components/ui/tabs";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { PaymentsNav } from "@/hospital-admin/components/payments/PaymentsNav";
import {
  mockExtendedPaymentTransactions,
  mockExtendedCashDrawers,
} from "@/hospital-admin/lib/mock-data/payments-extended";
import { PaymentTransaction, CashDrawerReport, PaymentMethod } from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { cn, formatDateTime, formatCurrency } from "@/hospital-admin/lib/utils";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Billing Counter Reconciliation workflow";

export default function PaymentsPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"transactions" | "drawers">("transactions");
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(mockExtendedPaymentTransactions);
  const [drawerReports, setDrawerReports] = useState<CashDrawerReport[]>(mockExtendedCashDrawers);

  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [counterFilter, setCounterFilter] = useState("all");

  // Reconciliation Drawer State
  const [selectedDrawer, setSelectedDrawer] = useState<CashDrawerReport | null>(null);
  const [reconcileModalOpen, setReconcileModalOpen] = useState(false);
  const [countedCash, setCountedCash] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const todayTransactions = useMemo(() => {
    // Current day transactions (mocked for active date)
    return transactions.filter((t) => t.timestamp.startsWith("2026-08-25"));
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return todayTransactions.filter((t) => {
      const matchesSearch =
        t.receiptNo.toLowerCase().includes(search.toLowerCase()) ||
        t.patientName.toLowerCase().includes(search.toLowerCase()) ||
        t.invoiceId.toLowerCase().includes(search.toLowerCase()) ||
        t.cashierName.toLowerCase().includes(search.toLowerCase()) ||
        (t.gatewayRefId && t.gatewayRefId.toLowerCase().includes(search.toLowerCase())) ||
        (t.tpaClaimNo && t.tpaClaimNo.toLowerCase().includes(search.toLowerCase()));

      const matchesMethod = methodFilter === "all" || t.paymentMethod === methodFilter;
      const matchesCounter = counterFilter === "all" || t.counterNo.includes(counterFilter);
      return matchesSearch && matchesMethod && matchesCounter;
    });
  }, [todayTransactions, search, methodFilter, counterFilter]);

  const totalCollectedToday = useMemo(
    () => todayTransactions.reduce((sum, t) => sum + t.amount, 0),
    [todayTransactions]
  );

  const totalCash = useMemo(
    () => todayTransactions.filter((t) => t.paymentMethod === "Cash").reduce((sum, t) => sum + t.amount, 0),
    [todayTransactions]
  );

  const totalDigital = useMemo(
    () => todayTransactions.filter((t) => t.paymentMethod !== "Cash").reduce((sum, t) => sum + t.amount, 0),
    [todayTransactions]
  );

  const totalCashInHand = useMemo(
    () => drawerReports.reduce((sum, d) => sum + d.closingBalance, 0),
    [drawerReports]
  );

  const handleOpenReconcile = (drawer: CashDrawerReport) => {
    setSelectedDrawer(drawer);
    setCountedCash(drawer.closingBalance);
    setReconcileModalOpen(true);
  };

  const handleConfirmReconciliation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDrawer) return;

    const diff = countedCash - selectedDrawer.closingBalance;
    setDrawerReports((prev) =>
      prev.map((d) =>
        d.counterId === selectedDrawer.counterId
          ? {
              ...d,
              status: diff === 0 ? "Balanced" : "Variance Detected",
              variance: diff,
            }
          : d
      )
    );

    toast({
      title: "Counter Reconciled",
      description: `${selectedDrawer.counterName} shift closed with ${diff === 0 ? "Zero Variance (Balanced)" : `₹${diff} Variance`}. (${DELEGATION_STRING})`,
    });
    setReconcileModalOpen(false);
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Payments &amp; Daily Collections"
          description="Daily cash counter balancing, POS/card settlement reconciliation, digital payment ledgers, and cashier shift handovers."
          crumbs={[{ label: "Finance" }, { label: "Payments" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading payment ledger...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      {/* Page Header */}
      <PageHeader
        title="Payments &amp; Daily Collections"
        description="Daily cash counter balancing, POS/card settlement reconciliation, digital payment ledgers, and cashier shift handovers."
        crumbs={[{ label: "Finance" }, { label: "Payments" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs font-semibold gap-1.5"
              asChild
            >
              <Link href="/hospital-admin/payments/history">
                <History className="h-3.5 w-3.5 text-primary" /> Full Ledger Archive
              </Link>
            </Button>
          </div>
        }
      />

      {/* Scope Indicator & Integration Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Central Cash Office &amp; Collection Gateway" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-primary" />
          <span>Counter Ledger &amp; Cashier Reconciliation • Receipts mapped 1-to-1 with Billing Invoices</span>
        </div>
      </div>

      {/* Shared Sub-Navigation Bar */}
      <PaymentsNav />

      {/* Executive Collection KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Collected Today</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{formatCurrency(totalCollectedToday)}</p>
          <span className="text-[10px] text-emerald-600 font-medium">{todayTransactions.length} Transactions</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Cash in Hand (Drawers)</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{formatCurrency(totalCashInHand)}</p>
          <span className="text-[10px] text-muted-foreground">4 Active Physical Drawers</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Digital / POS / UPI Total</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">{formatCurrency(totalDigital)}</p>
          <span className="text-[10px] text-cyan-600 font-medium">Auto-settling Gateways</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Shift Balancing Health</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">100% Balanced</p>
          <span className="text-[10px] text-emerald-600 font-medium">Zero Variance Recorded</span>
        </Card>
      </div>

      {/* Main Tabs: Today's Collection Ledger vs Cash Drawers Balancing */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="space-y-4">
        <TabsList className="grid grid-cols-2 max-w-md">
          <TabsTrigger value="transactions" className="text-xs font-semibold flex items-center gap-1.5">
            <Receipt className="h-3.5 w-3.5 text-primary" /> Today&apos;s Collection Ledger
          </TabsTrigger>
          <TabsTrigger value="drawers" className="text-xs font-semibold flex items-center gap-1.5">
            <Banknote className="h-3.5 w-3.5 text-emerald-600" /> Cash Drawers Balancing
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: COLLECTION LEDGER */}
        <TabsContent value="transactions" className="space-y-3">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-primary" /> Hospital Real-Time Collection Feed (Today)
                </CardTitle>
                <CardDescription className="text-xs">
                  Live synchronized transaction stream across OPD, IPD, Diagnostics, Pharmacy, and Emergency counters.
                </CardDescription>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search receipt, patient, invoice, cashier..."
                    className="pl-8 text-xs h-8 w-60"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="h-8 text-xs w-36">
                    <SelectValue placeholder="All Methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="UPI/QR">UPI / QR</SelectItem>
                    <SelectItem value="Credit/Debit Card">Credit/Debit Card</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer / TPA</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={counterFilter} onValueChange={setCounterFilter}>
                  <SelectTrigger className="h-8 text-xs w-36">
                    <SelectValue placeholder="All Counters" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Counters</SelectItem>
                    <SelectItem value="Counter 1">Counter 1 (OPD)</SelectItem>
                    <SelectItem value="Counter 2">Counter 2 (Lab)</SelectItem>
                    <SelectItem value="Counter 3">Counter 3 (IPD)</SelectItem>
                    <SelectItem value="Counter 4">Counter 4 (ER)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent className="p-4 pt-2">
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-bold w-[130px]">Receipt #</TableHead>
                      <TableHead className="text-xs font-bold w-[160px]">Patient &amp; UHID</TableHead>
                      <TableHead className="text-xs font-bold w-[130px]">Linked Invoice</TableHead>
                      <TableHead className="text-xs font-bold w-[140px]">Payment Method</TableHead>
                      <TableHead className="text-xs font-bold w-[160px]">Counter / Cashier</TableHead>
                      <TableHead className="text-xs font-bold w-[100px] text-right">Amount</TableHead>
                      <TableHead className="text-xs font-bold w-[120px] text-center">Status</TableHead>
                      <TableHead className="text-xs font-bold w-[130px]">Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center text-xs text-muted-foreground">
                          No payment transactions match the selected criteria.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTransactions.map((tx) => (
                        <TableRow key={tx.id} className="hover:bg-muted/30 transition-colors text-xs">
                          <TableCell className="font-mono font-bold text-foreground">
                            {tx.receiptNo}
                          </TableCell>

                          <TableCell>
                            <div className="font-semibold text-foreground">{tx.patientName}</div>
                            <span className="text-[10px] font-mono text-muted-foreground">{tx.patientId}</span>
                          </TableCell>

                          <TableCell>
                            <Link
                              href={`/hospital-admin/billing`}
                              className="font-mono text-[11px] text-primary hover:underline"
                            >
                              {tx.invoiceId}
                            </Link>
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] font-medium gap-1",
                                tx.paymentMethod === "Cash"
                                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                                  : tx.paymentMethod === "UPI/QR"
                                  ? "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30"
                                  : tx.paymentMethod === "Credit/Debit Card"
                                  ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30"
                                  : "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30"
                              )}
                            >
                              {tx.paymentMethod === "Cash" && <Banknote className="h-3 w-3" />}
                              {tx.paymentMethod === "UPI/QR" && <QrCode className="h-3 w-3" />}
                              {tx.paymentMethod === "Credit/Debit Card" && <CreditCard className="h-3 w-3" />}
                              {tx.paymentMethod === "Bank Transfer" && <Globe className="h-3 w-3" />}
                              {tx.paymentMethod}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <div className="text-foreground font-medium">{tx.counterNo}</div>
                            <span className="text-[10px] text-muted-foreground">{tx.cashierName}</span>
                          </TableCell>

                          <TableCell className="text-right font-mono font-bold text-foreground">
                            {formatCurrency(tx.amount)}
                          </TableCell>

                          <TableCell className="text-center">
                            <Badge
                              className={cn(
                                "text-[9px]",
                                tx.reconciliationStatus === "Reconciled"
                                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                                  : tx.reconciliationStatus === "Pending Settlement"
                                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                                  : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
                              )}
                            >
                              {tx.reconciliationStatus}
                            </Badge>
                          </TableCell>

                          <TableCell className="font-mono text-muted-foreground">
                            {formatDateTime(tx.timestamp)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: CASH DRAWERS BALANCING CONSOLE */}
        <TabsContent value="drawers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drawerReports.map((drawer) => (
              <Card key={drawer.counterId} className="border-border shadow-xs">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-emerald-600" /> {drawer.counterName}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Duty Cashier: <strong>{drawer.cashierName}</strong>
                    </CardDescription>
                  </div>
                  <Badge
                    className={cn(
                      "text-[9px] font-mono",
                      drawer.status === "Balanced"
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                        : drawer.status === "Variance Detected"
                        ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
                        : "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30"
                    )}
                  >
                    {drawer.status}
                  </Badge>
                </CardHeader>

                <CardContent className="p-4 pt-2 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2 p-3 bg-muted/20 rounded-lg border border-border">
                    <div>
                      <span className="text-muted-foreground text-[11px]">Opening Float:</span>
                      <p className="font-mono font-bold">{formatCurrency(drawer.openingFloat)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-[11px]">Cash Inflow Today:</span>
                      <p className="font-mono font-bold text-emerald-600">+{formatCurrency(drawer.cashCollected)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-[11px]">POS / Card Batch:</span>
                      <p className="font-mono font-bold text-cyan-600">{formatCurrency(drawer.posCollected)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-[11px]">UPI / QR Ledger:</span>
                      <p className="font-mono font-bold text-primary">{formatCurrency(drawer.upiCollected)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-[11px]">Refunds Deducted:</span>
                      <p className="font-mono font-bold text-rose-600">-{formatCurrency(drawer.refundsDeducted)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-[11px]">Net Physical Balance:</span>
                      <p className="font-mono font-bold text-foreground text-sm">{formatCurrency(drawer.closingBalance)}</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs font-semibold"
                      onClick={() => handleOpenReconcile(drawer)}
                    >
                      <Sparkles className="h-3 w-3 text-primary mr-1" /> Reconcile &amp; Close Shift
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* SHIFT RECONCILIATION MODAL */}
      <Dialog open={reconcileModalOpen} onOpenChange={setReconcileModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleConfirmReconciliation}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-primary">
                <Banknote className="h-5 w-5 text-primary" /> Reconcile Cashier Shift &amp; Drawer
              </DialogTitle>
              <DialogDescription className="text-xs">
                Perform end-of-shift physical cash count verification for <strong>{selectedDrawer?.counterName}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div className="p-3 bg-muted/20 rounded-lg border border-border space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duty Cashier:</span>
                  <span className="font-bold text-foreground">{selectedDrawer?.cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected Physical Cash:</span>
                  <span className="font-mono font-bold text-foreground">
                    {formatCurrency(selectedDrawer?.closingBalance || 0)}
                  </span>
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="cash-count">Physical Cash Counted (₹) *</Label>
                <Input
                  id="cash-count"
                  type="number"
                  required
                  value={countedCash}
                  onChange={(e) => setCountedCash(Number(e.target.value))}
                />
              </div>

              {selectedDrawer && countedCash !== selectedDrawer.closingBalance && (
                <div className="p-2.5 rounded-lg border border-rose-500/30 bg-rose-500/[0.04] text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>
                    Variance detected: <strong>{formatCurrency(countedCash - selectedDrawer.closingBalance)}</strong>. Will be flagged in audit log.
                  </span>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setReconcileModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Sign-off &amp; Close Shift
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
