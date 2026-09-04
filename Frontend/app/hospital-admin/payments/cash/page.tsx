"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Banknote,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  History,
  Layers,
  Receipt,
  Search,
  ShieldAlert,
  Sparkles,
  User,
  Wallet,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { PaymentsNav } from "@/hospital-admin/components/payments/PaymentsNav";
import {
  mockExtendedPaymentTransactions,
  mockExtendedCashDrawers,
} from "@/hospital-admin/lib/mock-data/payments-extended";
import { PaymentTransaction, CashDrawerReport } from "@/hospital-admin/lib/types";
import { formatDateTime, formatCurrency, cn } from "@/hospital-admin/lib/utils";

export default function CashPaymentsPage() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const cashTransactions = useMemo(() => {
    return mockExtendedPaymentTransactions.filter((t) => t.paymentMethod === "Cash");
  }, []);

  const filtered = useMemo(() => {
    return cashTransactions.filter((t) => {
      return (
        t.receiptNo.toLowerCase().includes(search.toLowerCase()) ||
        t.patientName.toLowerCase().includes(search.toLowerCase()) ||
        t.invoiceId.toLowerCase().includes(search.toLowerCase()) ||
        t.cashierName.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [cashTransactions, search]);

  const totalCashToday = useMemo(
    () => cashTransactions.reduce((sum, t) => sum + t.amount, 0),
    [cashTransactions]
  );

  const totalCashInDrawers = useMemo(
    () => mockExtendedCashDrawers.reduce((sum, d) => sum + d.closingBalance, 0),
    []
  );

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Cash Collections &amp; Drawer Ledgers"
          description="Physical cash inflows across billing counters, opening floats, and drawer reconciliations."
          crumbs={[{ label: "Finance" }, { label: "Payments", href: "/hospital-admin/payments" }, { label: "Cash" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading cash collection ledger...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Cash Collections &amp; Drawer Ledgers"
        description="Physical cash inflows across billing counters, opening floats, and drawer reconciliations."
        crumbs={[{ label: "Finance" }, { label: "Payments", href: "/hospital-admin/payments" }, { label: "Cash" }]}
        actions={
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs font-semibold gap-1.5"
            asChild
          >
            <Link href="/hospital-admin/payments">
              <Banknote className="h-3.5 w-3.5 text-emerald-600" /> Cash Drawers Console
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Physical Cash Counter Registry" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-emerald-600" />
          <span>Physical Cash Office • Counter collection register linked directly to cashier shift drawers</span>
        </div>
      </div>

      <PaymentsNav />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Cash Inflow Today</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{formatCurrency(totalCashToday)}</p>
          <span className="text-[10px] text-muted-foreground">{cashTransactions.length} Cash Receipts</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Physical Cash In Drawers</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">{formatCurrency(totalCashInDrawers)}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Includes Initial Floats</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Active Cash Desks</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">4 Desks</p>
          <span className="text-[10px] text-muted-foreground">OPD, Lab, IPD, ER</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Reconciliation Health</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">100% Balanced</p>
          <span className="text-[10px] text-emerald-600 font-medium">Zero Variance Recorded</span>
        </Card>
      </div>

      {/* Cash Drawers Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {mockExtendedCashDrawers.map((drawer) => (
          <Card key={drawer.counterId} className="p-3 border-border bg-muted/10 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground truncate">{drawer.counterName.split("(")[0]}</span>
              <Badge variant="outline" className="text-[8px] font-mono">{drawer.status}</Badge>
            </div>
            <p className="text-muted-foreground text-[10px] mt-0.5">{drawer.cashierName}</p>
            <div className="mt-2 pt-2 border-t border-border flex justify-between font-mono">
              <span className="text-muted-foreground">Drawer Balance:</span>
              <span className="font-bold text-emerald-600">{formatCurrency(drawer.closingBalance)}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Cash Receipts Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Banknote className="h-4 w-4 text-emerald-600" /> Cash Payment Receipts
            </CardTitle>
            <CardDescription className="text-xs">
              Every payment transaction completed via physical cash across counters.
            </CardDescription>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search cash receipts..."
              className="pl-8 text-xs h-8 w-60"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2">
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Receipt #</TableHead>
                  <TableHead className="text-xs font-bold">Patient &amp; UHID</TableHead>
                  <TableHead className="text-xs font-bold">Invoice #</TableHead>
                  <TableHead className="text-xs font-bold">Counter &amp; Cashier</TableHead>
                  <TableHead className="text-xs font-bold text-right">Amount</TableHead>
                  <TableHead className="text-xs font-bold text-center">Status</TableHead>
                  <TableHead className="text-xs font-bold">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((tx) => (
                  <TableRow key={tx.id} className="hover:bg-muted/30 text-xs">
                    <TableCell className="font-mono font-bold">{tx.receiptNo}</TableCell>
                    <TableCell>
                      <div className="font-semibold">{tx.patientName}</div>
                      <span className="text-[10px] font-mono text-muted-foreground">{tx.patientId}</span>
                    </TableCell>
                    <TableCell>
                      <Link href="/hospital-admin/billing" className="font-mono text-primary hover:underline">
                        {tx.invoiceId}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div>{tx.counterNo}</div>
                      <span className="text-[10px] text-muted-foreground">{tx.cashierName}</span>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-emerald-600">
                      {formatCurrency(tx.amount)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[9px]">
                        {tx.reconciliationStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">{formatDateTime(tx.timestamp)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
