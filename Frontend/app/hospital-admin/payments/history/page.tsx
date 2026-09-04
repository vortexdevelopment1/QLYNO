"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Globe,
  History,
  QrCode,
  Receipt,
  Search,
  ShieldAlert,
  Sparkles,
  Wallet,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { PaymentsNav } from "@/hospital-admin/components/payments/PaymentsNav";
import { mockExtendedPaymentTransactions } from "@/hospital-admin/lib/mock-data/payments-extended";
import { PaymentTransaction } from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { formatDateTime, formatDate, formatCurrency, cn } from "@/hospital-admin/lib/utils";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Historical Collection Archive export workflow";

export default function PaymentHistoryPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [transactions, setTransactions] = useState<PaymentTransaction[]>(mockExtendedPaymentTransactions);
  const [search, setSearch] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [counterFilter, setCounterFilter] = useState("all");

  useEffect(() => {
    setMounted(true);
  }, []);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch =
        t.receiptNo.toLowerCase().includes(search.toLowerCase()) ||
        t.patientName.toLowerCase().includes(search.toLowerCase()) ||
        t.invoiceId.toLowerCase().includes(search.toLowerCase()) ||
        t.cashierName.toLowerCase().includes(search.toLowerCase()) ||
        (t.gatewayRefId && t.gatewayRefId.toLowerCase().includes(search.toLowerCase())) ||
        (t.tpaClaimNo && t.tpaClaimNo.toLowerCase().includes(search.toLowerCase()));

      const matchMethod = methodFilter === "all" || t.paymentMethod === methodFilter;
      const matchCounter = counterFilter === "all" || t.counterNo.includes(counterFilter);

      return matchSearch && matchMethod && matchCounter;
    });
  }, [transactions, search, methodFilter, counterFilter]);

  const totalFilteredAmount = useMemo(
    () => filtered.reduce((sum, t) => sum + t.amount, 0),
    [filtered]
  );

  const handleExportCSV = () => {
    const headers = "Receipt No,Patient Name,UHID,Invoice ID,Payment Method,Counter,Cashier,Amount,Status,Timestamp\n";
    const rows = filtered
      .map(
        (t) =>
          `"${t.receiptNo}","${t.patientName}","${t.patientId}","${t.invoiceId}","${t.paymentMethod}","${t.counterNo}","${t.cashierName}",${t.amount},"${t.reconciliationStatus}","${t.timestamp}"`
      )
      .join("\n");

    const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Hospital_Payment_History_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "CSV Export Complete",
      description: `Exported ${filtered.length} transaction records to CSV. (${DELEGATION_STRING})`,
    });
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(13, 148, 136);
    doc.text("QLYNO MULTISPECIALTY HOSPITAL & RESEARCH CENTRE", 15, 20);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("NABH Accredited • Central Cash Office & Daily Collections Audit Archive", 15, 26);
    doc.text(`Generated on: ${new Date().toLocaleString()} | Filter: ${methodFilter} | Scope: ${counterFilter}`, 15, 31);

    doc.setDrawColor(203, 213, 225);
    doc.line(15, 35, 195, 35);

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("HISTORICAL HOSPITAL COLLECTION LEDGER", 15, 43);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(`Total Transactions: ${filtered.length} | Gross Realized Value: ₹${totalFilteredAmount.toLocaleString("en-IN")}`, 15, 50);

    let y = 58;
    doc.setFillColor(241, 245, 249);
    doc.rect(15, y, 180, 7, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text("Receipt #", 17, y + 5);
    doc.text("Patient & UHID", 47, y + 5);
    doc.text("Invoice #", 87, y + 5);
    doc.text("Method", 120, y + 5);
    doc.text("Amount (₹)", 150, y + 5);
    doc.text("Status", 175, y + 5);

    y += 8;
    doc.setFont("helvetica", "normal");

    filtered.slice(0, 25).forEach((t) => {
      doc.text(t.receiptNo, 17, y + 4);
      doc.text(`${t.patientName.slice(0, 16)} (${t.patientId})`, 47, y + 4);
      doc.text(t.invoiceId, 87, y + 4);
      doc.text(t.paymentMethod, 120, y + 4);
      doc.text(t.amount.toLocaleString("en-IN"), 150, y + 4);
      doc.text(t.reconciliationStatus, 175, y + 4);
      y += 6;
    });

    y = 275;
    doc.setDrawColor(226, 232, 240);
    doc.line(15, y, 195, y);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("OFFICIAL FINANCIAL AUDIT LEDGER — HOSPITAL ACCOUNTING STANDARDS", 15, y + 5);
    doc.text("Authorized by Hospital Administration • Central Cash Office", 15, y + 9);

    doc.save(`Hospital_Payment_Ledger_${new Date().toISOString().split("T")[0]}.pdf`);

    toast({
      title: "PDF Ledger Exported",
      description: `Downloaded formatted collection ledger PDF. (${DELEGATION_STRING})`,
    });
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Payment History &amp; Collection Archive"
          description="Searchable historical payment transaction ledger beyond today with multi-format export."
          crumbs={[{ label: "Finance" }, { label: "Payments", href: "/hospital-admin/payments" }, { label: "History" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading archive...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Payment History &amp; Collection Archive"
        description="Searchable historical payment transaction ledger beyond today with multi-format export."
        crumbs={[{ label: "Finance" }, { label: "Payments", href: "/hospital-admin/payments" }, { label: "History" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs font-semibold gap-1.5"
              onClick={handleExportCSV}
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> Export CSV
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground"
              onClick={handleExportPDF}
            >
              <Download className="h-3.5 w-3.5" /> Export PDF
            </Button>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Historical Collection Ledger Archive" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-primary" />
          <span>Historical Collection Ledger • Multi-period historical records with complete audit trails</span>
        </div>
      </div>

      <PaymentsNav />

      {/* KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Filtered Transactions</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{filtered.length} Records</p>
          <span className="text-[10px] text-muted-foreground">Matching Active Filters</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Filtered Revenue Value</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{formatCurrency(totalFilteredAmount)}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Realized Bank Inflows</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Payment Methods</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">4 Methods</p>
          <span className="text-[10px] text-muted-foreground">Cash, UPI, Card, NEFT</span>
        </Card>

        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Audit Integrity</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">100% Reconciled</p>
          <span className="text-[10px] text-emerald-600 font-medium">Immutable Receipt Store</span>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <History className="h-4 w-4 text-primary" /> Multi-Period Payment Archive
            </CardTitle>
            <CardDescription className="text-xs">
              Complete historical transaction feed with cross-field search and filters.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search receipt, patient, invoice, UTR, cashier..."
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
                  <TableHead className="text-xs font-bold">Receipt #</TableHead>
                  <TableHead className="text-xs font-bold">Patient &amp; UHID</TableHead>
                  <TableHead className="text-xs font-bold">Linked Invoice</TableHead>
                  <TableHead className="text-xs font-bold">Payment Method</TableHead>
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
                      <div>{tx.counterNo}</div>
                      <span className="text-[10px] text-muted-foreground">{tx.cashierName}</span>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">
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
