"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Download,
  Filter,
  History,
  QrCode,
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
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { formatDateTime, formatCurrency, cn } from "@/hospital-admin/lib/utils";

export default function UpiPaymentsPage() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const upiTransactions = useMemo(() => {
    return mockExtendedPaymentTransactions.filter((t) => t.paymentMethod === "UPI/QR");
  }, []);

  const filtered = useMemo(() => {
    return upiTransactions.filter((t) => {
      return (
        t.receiptNo.toLowerCase().includes(search.toLowerCase()) ||
        t.patientName.toLowerCase().includes(search.toLowerCase()) ||
        t.invoiceId.toLowerCase().includes(search.toLowerCase()) ||
        (t.gatewayRefId && t.gatewayRefId.toLowerCase().includes(search.toLowerCase())) ||
        (t.terminalId && t.terminalId.toLowerCase().includes(search.toLowerCase()))
      );
    });
  }, [upiTransactions, search]);

  const totalUpiToday = useMemo(
    () => upiTransactions.reduce((sum, t) => sum + t.amount, 0),
    [upiTransactions]
  );

  const handleRecheckGateway = () => {
    toast({
      title: "Gateway Settlement Polled",
      description: "Synchronized latest webhook settlements from HDFC/ICICI UPI Gateways. 100% Verified.",
    });
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="UPI &amp; Dynamic QR Collections"
          description="Instant bank UPI transactions, counter dynamic QR scan ledgers, and gateway settlement verification."
          crumbs={[{ label: "Finance" }, { label: "Payments", href: "/hospital-admin/payments" }, { label: "UPI" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading UPI ledger...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="UPI &amp; Dynamic QR Collections"
        description="Instant bank UPI transactions, counter dynamic QR scan ledgers, and gateway settlement verification."
        crumbs={[{ label: "Finance" }, { label: "Payments", href: "/hospital-admin/payments" }, { label: "UPI" }]}
        actions={
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs font-semibold gap-1.5"
            onClick={handleRecheckGateway}
          >
            <RefreshCw className="h-3.5 w-3.5 text-primary" /> Re-sync Gateway Batches
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="UPI &amp; QR Gateway Monitor" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-cyan-600" />
          <span>UPI &amp; Instant Pay Gateway • Real-time VPA / Bank Reference ID tracking with gateway reconciliation</span>
        </div>
      </div>

      <PaymentsNav />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">UPI Inflow Today</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">{formatCurrency(totalUpiToday)}</p>
          <span className="text-[10px] text-muted-foreground">{upiTransactions.length} UPI Transactions</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Instant Settlement Rate</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">98.8%</p>
          <span className="text-[10px] text-emerald-600 font-medium">T+0 Bank Credit</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Active QR Terminals</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">4 Terminals</p>
          <span className="text-[10px] text-muted-foreground">Dynamic Soundbox Active</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Gateway Variance</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">₹0.00</p>
          <span className="text-[10px] text-emerald-600 font-medium">Zero Gateway Mismatch</span>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <QrCode className="h-4 w-4 text-cyan-600" /> UPI &amp; QR Payment Transactions
            </CardTitle>
            <CardDescription className="text-xs">
              Every transaction completed via GPay, PhonePe, Paytm, or BHIM QR scan.
            </CardDescription>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search UPI ref, patient, invoice..."
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
                  <TableHead className="text-xs font-bold">Linked Invoice</TableHead>
                  <TableHead className="text-xs font-bold">Gateway Reference (UTR)</TableHead>
                  <TableHead className="text-xs font-bold">QR Terminal</TableHead>
                  <TableHead className="text-xs font-bold text-right">Amount</TableHead>
                  <TableHead className="text-xs font-bold text-center">Settlement Status</TableHead>
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
                      <Badge variant="outline" className="font-mono text-[10px] bg-cyan-500/5 text-cyan-800 dark:text-cyan-300">
                        {tx.gatewayRefId || "UPI-REF-PENDING"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">{tx.terminalId || "QR-GENERAL"}</TableCell>
                    <TableCell className="text-right font-mono font-bold text-cyan-600">
                      {formatCurrency(tx.amount)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={cn(
                          "text-[9px]",
                          tx.reconciliationStatus === "Reconciled"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                        )}
                      >
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
