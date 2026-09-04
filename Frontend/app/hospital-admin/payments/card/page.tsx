"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  CreditCard,
  Download,
  Filter,
  History,
  Layers,
  Receipt,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Zap,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { PaymentsNav } from "@/hospital-admin/components/payments/PaymentsNav";
import { mockExtendedPaymentTransactions } from "@/hospital-admin/lib/mock-data/payments-extended";
import { PaymentTransaction } from "@/hospital-admin/lib/types";
import { formatDateTime, formatCurrency, cn } from "@/hospital-admin/lib/utils";

export default function CardPaymentsPage() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const cardTransactions = useMemo(() => {
    return mockExtendedPaymentTransactions.filter((t) => t.paymentMethod === "Credit/Debit Card");
  }, []);

  const filtered = useMemo(() => {
    return cardTransactions.filter((t) => {
      return (
        t.receiptNo.toLowerCase().includes(search.toLowerCase()) ||
        t.patientName.toLowerCase().includes(search.toLowerCase()) ||
        t.invoiceId.toLowerCase().includes(search.toLowerCase()) ||
        (t.terminalId && t.terminalId.toLowerCase().includes(search.toLowerCase())) ||
        (t.cardType && t.cardType.toLowerCase().includes(search.toLowerCase())) ||
        (t.cardLast4 && t.cardLast4.includes(search))
      );
    });
  }, [cardTransactions, search]);

  const totalCardToday = useMemo(
    () => cardTransactions.reduce((sum, t) => sum + t.amount, 0),
    [cardTransactions]
  );

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Credit &amp; Debit Card POS Collections"
          description="Counter POS terminal transaction batching, merchant bank settlement tracking, and charge slip reconciliation."
          crumbs={[{ label: "Finance" }, { label: "Payments", href: "/hospital-admin/payments" }, { label: "Card" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading POS card ledger...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Credit &amp; Debit Card POS Collections"
        description="Counter POS terminal transaction batching, merchant bank settlement tracking, and charge slip reconciliation."
        crumbs={[{ label: "Finance" }, { label: "Payments", href: "/hospital-admin/payments" }, { label: "Card" }]}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Merchant POS Terminal Gateway" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-blue-600" />
          <span>Card &amp; POS Terminals • Terminal IDs and batch settlements tracked per physical swipe terminal</span>
        </div>
      </div>

      <PaymentsNav />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">POS Card Inflow</span>
          <p className="text-xl font-bold font-mono text-blue-600 mt-0.5">{formatCurrency(totalCardToday)}</p>
          <span className="text-[10px] text-muted-foreground">{cardTransactions.length} Swipes / Taps</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">POS Terminal Status</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">4 Online</p>
          <span className="text-[10px] text-emerald-600 font-medium">HDFC &amp; ICICI Terminals</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Active Batch</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">Batch #104</p>
          <span className="text-[10px] text-muted-foreground">Auto-closing @ 23:59</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">MDR Surcharge Status</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">0% Cost to Patient</p>
          <span className="text-[10px] text-muted-foreground">Hospital Absorbed</span>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-blue-600" /> POS Card Transactions
            </CardTitle>
            <CardDescription className="text-xs">
              Credit, debit, and corporate cards processed through counter card readers.
            </CardDescription>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search terminal, card, patient, invoice..."
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
                  <TableHead className="text-xs font-bold">Card Network &amp; Last 4</TableHead>
                  <TableHead className="text-xs font-bold">POS Terminal ID</TableHead>
                  <TableHead className="text-xs font-bold">Linked Invoice</TableHead>
                  <TableHead className="text-xs font-bold text-right">Amount</TableHead>
                  <TableHead className="text-xs font-bold text-center">Batch Status</TableHead>
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
                      <div className="font-medium text-foreground">{tx.cardType || "Credit Card"}</div>
                      <span className="text-[10px] font-mono text-muted-foreground">•••• •••• •••• {tx.cardLast4 || "0000"}</span>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{tx.terminalId || "POS-TERM-01"}</TableCell>
                    <TableCell>
                      <Link href="/hospital-admin/billing" className="font-mono text-primary hover:underline">
                        {tx.invoiceId}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-blue-600">
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
