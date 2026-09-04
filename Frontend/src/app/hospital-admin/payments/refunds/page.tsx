"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  FileCheck,
  FileSpreadsheet,
  Filter,
  History,
  QrCode,
  Receipt,
  RotateCcw,
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
import { mockRefundReconciliations } from "@/hospital-admin/lib/mock-data/payments-extended";
import { RefundReconciliationRecord } from "@/hospital-admin/lib/types";
import { formatDateTime, formatCurrency, cn } from "@/hospital-admin/lib/utils";

export default function RefundsPaymentsPage() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const filtered = useMemo(() => {
    return mockRefundReconciliations.filter((r) => {
      return (
        r.refundReceiptNo.toLowerCase().includes(search.toLowerCase()) ||
        r.patientName.toLowerCase().includes(search.toLowerCase()) ||
        r.invoiceId.toLowerCase().includes(search.toLowerCase()) ||
        r.cashierName.toLowerCase().includes(search.toLowerCase()) ||
        r.approvalReference.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [search]);

  const totalRefunds = useMemo(
    () => mockRefundReconciliations.reduce((sum, r) => sum + r.amount, 0),
    []
  );

  const cashRefunds = useMemo(
    () =>
      mockRefundReconciliations
        .filter((r) => r.reversalChannel === "Cash Drawer")
        .reduce((sum, r) => sum + r.amount, 0),
    []
  );

  const digitalRefunds = useMemo(
    () =>
      mockRefundReconciliations
        .filter((r) => r.reversalChannel !== "Cash Drawer")
        .reduce((sum, r) => sum + r.amount, 0),
    []
  );

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Refunds Payment-Method Reconciliation Lens"
          description="Reconciling processed patient refunds against cash drawers, merchant POS reversals, and UPI refund gateways."
          crumbs={[{ label: "Finance" }, { label: "Payments", href: "/hospital-admin/payments" }, { label: "Refunds" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading refund reconciliations...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Refunds Payment-Method Reconciliation Lens"
        description="Reconciling processed patient refunds against cash drawers, merchant POS reversals, and UPI refund gateways."
        crumbs={[{ label: "Finance" }, { label: "Payments", href: "/hospital-admin/payments" }, { label: "Refunds" }]}
        actions={
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs font-semibold gap-1.5"
            asChild
          >
            <Link href="/hospital-admin/billing/refunds">
              <RotateCcw className="h-3.5 w-3.5 text-primary" /> Billing Refund Approvals
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Cash-Office Refund Reconciliation Lens" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
          <span>Disbursement Audit • Reconciles how money left the hospital against authorized refund approvals</span>
        </div>
      </div>

      <PaymentsNav />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Processed Refunds</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">{formatCurrency(totalRefunds)}</p>
          <span className="text-[10px] text-muted-foreground">{mockRefundReconciliations.length} Approved Reversals</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Cash Drawer Deductions</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{formatCurrency(cashRefunds)}</p>
          <span className="text-[10px] text-muted-foreground">Subtracted from Drawer Float</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">POS &amp; UPI Reversals</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">{formatCurrency(digitalRefunds)}</p>
          <span className="text-[10px] text-cyan-600 font-medium">Gateway Batch Reversals</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Authorized Sign-off</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">100% Signed</p>
          <span className="text-[10px] text-emerald-600 font-medium">Authoritative Sign-Off</span>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-rose-600" /> Refund Disbursement &amp; Reversal Reconciliation
            </CardTitle>
            <CardDescription className="text-xs">
              Audit log of approved refund disbursements categorized by refund channel and drawer/gateway settlement.
            </CardDescription>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search refund #, patient, invoice, auth..."
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
                  <TableHead className="text-xs font-bold">Refund Receipt #</TableHead>
                  <TableHead className="text-xs font-bold">Patient &amp; UHID</TableHead>
                  <TableHead className="text-xs font-bold">Original Invoice</TableHead>
                  <TableHead className="text-xs font-bold">Reversal Channel</TableHead>
                  <TableHead className="text-xs font-bold">Approval Token</TableHead>
                  <TableHead className="text-xs font-bold text-right">Amount</TableHead>
                  <TableHead className="text-xs font-bold text-center">Drawer / Gateway Status</TableHead>
                  <TableHead className="text-xs font-bold">Disbursed At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id} className="hover:bg-muted/30 text-xs">
                    <TableCell className="font-mono font-bold text-rose-600">{r.refundReceiptNo}</TableCell>
                    <TableCell>
                      <div className="font-semibold">{r.patientName}</div>
                      <span className="text-[10px] font-mono text-muted-foreground">{r.patientId}</span>
                    </TableCell>
                    <TableCell>
                      <Link href="/hospital-admin/billing" className="font-mono text-primary hover:underline">
                        {r.invoiceId}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] font-medium gap-1",
                          r.reversalChannel === "Cash Drawer"
                            ? "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30"
                            : "bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-500/30"
                        )}
                      >
                        {r.reversalChannel === "Cash Drawer" ? (
                          <Banknote className="h-3 w-3" />
                        ) : (
                          <CreditCard className="h-3 w-3" />
                        )}
                        {r.reversalChannel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-[10px] text-foreground font-semibold">{r.approvalReference}</div>
                      <span className="text-[10px] text-muted-foreground">{r.approvedBy}</span>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-rose-600">
                      -{formatCurrency(r.amount)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={cn(
                          "text-[9px]",
                          r.reconciliationStatus === "Reconciled"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                        )}
                      >
                        {r.reconciliationStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">{formatDateTime(r.timestamp)}</TableCell>
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
