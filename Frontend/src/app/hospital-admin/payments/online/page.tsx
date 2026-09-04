"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock,
  Download,
  FileCheck,
  FileSpreadsheet,
  Filter,
  Globe,
  History,
  Receipt,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
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
import { mockExtendedPaymentTransactions } from "@/hospital-admin/lib/mock-data/payments-extended";
import { PaymentTransaction } from "@/hospital-admin/lib/types";
import { formatDateTime, formatCurrency, cn } from "@/hospital-admin/lib/utils";

export default function OnlinePaymentsPage() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const onlineTransactions = useMemo(() => {
    return mockExtendedPaymentTransactions.filter((t) => t.paymentMethod === "Bank Transfer");
  }, []);

  const filtered = useMemo(() => {
    return onlineTransactions.filter((t) => {
      return (
        t.receiptNo.toLowerCase().includes(search.toLowerCase()) ||
        t.patientName.toLowerCase().includes(search.toLowerCase()) ||
        t.invoiceId.toLowerCase().includes(search.toLowerCase()) ||
        (t.gatewayRefId && t.gatewayRefId.toLowerCase().includes(search.toLowerCase())) ||
        (t.tpaClaimNo && t.tpaClaimNo.toLowerCase().includes(search.toLowerCase())) ||
        (t.tpaProvider && t.tpaProvider.toLowerCase().includes(search.toLowerCase()))
      );
    });
  }, [onlineTransactions, search]);

  const totalBankInflow = useMemo(
    () => onlineTransactions.reduce((sum, t) => sum + t.amount, 0),
    [onlineTransactions]
  );

  const totalTpaSettlements = useMemo(
    () =>
      onlineTransactions
        .filter((t) => Boolean(t.tpaClaimNo))
        .reduce((sum, t) => sum + t.amount, 0),
    [onlineTransactions]
  );

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Online, NEFT / RTGS &amp; TPA Bank Settlements"
          description="Inpatient NEFT/RTGS wire transfers, patient web portal payments, and TPA cashless claim remittances."
          crumbs={[{ label: "Finance" }, { label: "Payments", href: "/hospital-admin/payments" }, { label: "Online" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading bank transfer ledger...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Online, NEFT / RTGS &amp; TPA Bank Settlements"
        description="Inpatient NEFT/RTGS wire transfers, patient web portal payments, and TPA cashless claim remittances."
        crumbs={[{ label: "Finance" }, { label: "Payments", href: "/hospital-admin/payments" }, { label: "Online" }]}
        actions={
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs font-semibold gap-1.5"
            asChild
          >
            <Link href="/hospital-admin/insurance-tpa">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Insurance Claims Desk
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Bank Wire &amp; TPA Cashless Remittances" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-purple-600" />
          <span>TPA &amp; Insurance Remittance • Settlements arriving via bank transfer are mapped directly to insurance claims</span>
        </div>
      </div>

      <PaymentsNav />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Direct Bank Inflow</span>
          <p className="text-xl font-bold font-mono text-purple-600 mt-0.5">{formatCurrency(totalBankInflow)}</p>
          <span className="text-[10px] text-muted-foreground">{onlineTransactions.length} Bank Deposits</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">TPA Cashless Settlements</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{formatCurrency(totalTpaSettlements)}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Star Health, HDFC ERGO</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">UTR Reference Matched</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">100% Matched</p>
          <span className="text-[10px] text-muted-foreground">Bank Statement Verified</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Pending Clearance</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{formatCurrency(50000)}</p>
          <span className="text-[10px] text-amber-600 font-medium">1 Inbound Transfer Pending</span>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Globe className="h-4 w-4 text-purple-600" /> Bank Transfers &amp; TPA Cashless Remittances
            </CardTitle>
            <CardDescription className="text-xs">
              Direct institutional RTGS/NEFT payments and TPA cashless claims settled directly into the hospital bank account.
            </CardDescription>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search UTR, claim #, TPA, patient, invoice..."
              className="pl-8 text-xs h-8 w-64"
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
                  <TableHead className="text-xs font-bold">Origin &amp; Category</TableHead>
                  <TableHead className="text-xs font-bold">Bank Reference (UTR)</TableHead>
                  <TableHead className="text-xs font-bold">Linked Invoice / Claim</TableHead>
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
                      {tx.tpaClaimNo ? (
                        <div>
                          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[9px]">
                            TPA Settlement ({tx.tpaProvider})
                          </Badge>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-[9px]">
                          Patient Direct Transfer
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px] bg-purple-500/5 text-purple-800 dark:text-purple-300">
                        {tx.gatewayRefId || "UTR-PENDING"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <Link href="/hospital-admin/billing" className="font-mono text-primary hover:underline block">
                          {tx.invoiceId}
                        </Link>
                        {tx.tpaClaimNo && (
                          <Link href="/hospital-admin/insurance-tpa" className="font-mono text-[10px] text-muted-foreground hover:underline block">
                            {tx.tpaClaimNo}
                          </Link>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-purple-600">
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
