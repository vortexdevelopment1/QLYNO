"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Download,
  Eye,
  FileText,
  IndianRupee,
  MoreHorizontal,
  Plus,
  Printer,
  Receipt,
  Receipt as ReceiptIcon,
  RotateCcw,
  Search,
  ShieldCheck,
  User,
  Wallet,
  XCircle,
} from "lucide-react";

import { Button } from "@/hospital-admin/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/hospital-admin/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/hospital-admin/components/ui/dropdown-menu";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { EmptyState } from "@/hospital-admin/components/shared/empty-state";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { StatCard } from "@/hospital-admin/components/shared/stat-card";
import { StatusBadge } from "@/hospital-admin/components/shared/status-badge";
import { Toolbar } from "@/hospital-admin/components/shared/toolbar";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { invoices as initialInvoices } from "@/hospital-admin/lib/mock-data/invoices";
import { formatCurrency, formatDate } from "@/hospital-admin/lib/utils";
import { Invoice } from "@/hospital-admin/lib/types";
import { BillingNav } from "@/hospital-admin/components/billing/billing-nav";

export default function BillingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [invoicesList, setInvoicesList] = useState<Invoice[]>(initialInvoices);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  // Create Invoice Modal State
  const [openCreate, setOpenCreate] = useState(false);
  const [newPatient, setNewPatient] = useState("");
  const [newService, setNewService] = useState("");
  const [newAmount, setNewAmount] = useState<number>(1000);
  const [newMethod, setNewMethod] = useState<"Cash" | "Card" | "UPI" | "Insurance" | "Online">("UPI");

  // View Invoice Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // Record Payment Modal State
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Card" | "UPI" | "Insurance" | "Online">("UPI");
  const [paymentRef, setPaymentRef] = useState("");

  // Refund Modal State
  const [refundInvoice, setRefundInvoice] = useState<Invoice | null>(null);
  const [refundReason, setRefundReason] = useState("Patient requested cancellation / Clinical dispute");

  const filtered = useMemo(() => {
    return invoicesList.filter((i) => {
      const matchesSearch =
        i.patientName.toLowerCase().includes(search.toLowerCase()) ||
        i.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
        i.service.toLowerCase().includes(search.toLowerCase()) ||
        i.patientId.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "all" || i.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [invoicesList, search, status]);

  const totals = useMemo(() => {
    const collected = invoicesList.reduce((sum, i) => sum + i.paid, 0);
    const outstanding = invoicesList.reduce((sum, i) => sum + i.outstanding, 0);
    const paidCount = invoicesList.filter((i) => i.status === "paid").length;
    return { collected, outstanding, paidCount };
  }, [invoicesList]);

  // Open Details (navigates to dedicated page)
  const handleOpenView = (inv: Invoice) => {
    router.push(`/hospital-admin/billing/${inv.id}`);
  };

  // Open Payment Modal
  const handleOpenPayment = (inv: Invoice) => {
    setPaymentInvoice(inv);
    setPaymentAmount(inv.outstanding > 0 ? inv.outstanding : inv.amount);
    setPaymentMethod(inv.method || "UPI");
    setPaymentRef(`TXN-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  // Confirm Payment
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentInvoice || paymentAmount <= 0) return;

    setInvoicesList((prev) =>
      prev.map((item) => {
        if (item.id === paymentInvoice.id) {
          const newPaid = item.paid + paymentAmount;
          const newOutstanding = Math.max(0, item.amount - newPaid);
          const newStatus = newOutstanding === 0 ? "paid" : "partially-paid";
          return {
            ...item,
            paid: newPaid,
            outstanding: newOutstanding,
            status: newStatus,
            method: paymentMethod,
          };
        }
        return item;
      })
    );

    toast({
      title: "Payment Recorded Successfully",
      description: `₹${paymentAmount.toLocaleString("en-IN")} received via ${paymentMethod} for ${paymentInvoice.invoiceNo}.`,
    });

    if (selectedInvoice && selectedInvoice.id === paymentInvoice.id) {
      setSelectedInvoice((prev) =>
        prev
          ? {
              ...prev,
              paid: prev.paid + paymentAmount,
              outstanding: Math.max(0, prev.amount - (prev.paid + paymentAmount)),
              status: Math.max(0, prev.amount - (prev.paid + paymentAmount)) === 0 ? "paid" : "partially-paid",
              method: paymentMethod,
            }
          : null
      );
    }

    setPaymentInvoice(null);
  };

  // Open Refund Modal
  const handleOpenRefund = (inv: Invoice) => {
    setRefundInvoice(inv);
  };

  // Confirm Refund
  const handleConfirmRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundInvoice) return;

    setInvoicesList((prev) =>
      prev.map((item) => {
        if (item.id === refundInvoice.id) {
          return {
            ...item,
            status: "refunded",
          };
        }
        return item;
      })
    );

    toast({
      title: "Refund Processed",
      description: `Invoice ${refundInvoice.invoiceNo} marked as refunded. Reason: ${refundReason}.`,
    });

    if (selectedInvoice && selectedInvoice.id === refundInvoice.id) {
      setSelectedInvoice((prev) => (prev ? { ...prev, status: "refunded" } : null));
    }

    setRefundInvoice(null);
  };

  // Cancel / Void Invoice
  const handleCancelInvoice = (inv: Invoice) => {
    setInvoicesList((prev) =>
      prev.map((item) => (item.id === inv.id ? { ...item, status: "cancelled", outstanding: 0 } : item))
    );
    toast({
      title: "Invoice Cancelled",
      description: `Invoice ${inv.invoiceNo} has been marked as void/cancelled.`,
      variant: "destructive",
    });
    if (selectedInvoice && selectedInvoice.id === inv.id) {
      setSelectedInvoice((prev) => (prev ? { ...prev, status: "cancelled", outstanding: 0 } : null));
    }
  };

  // Create Invoice
  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.trim() || !newService.trim() || newAmount <= 0) return;

    const newInv: Invoice = {
      id: `inv_${Date.now().toString().slice(-4)}`,
      invoiceNo: `INV-2026-08-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: newPatient.trim(),
      patientId: `pat_${Math.floor(100 + Math.random() * 900)}`,
      service: newService.trim(),
      amount: Number(newAmount),
      paid: Number(newAmount),
      outstanding: 0,
      status: "paid",
      issuedOn: new Date().toISOString().split("T")[0],
      method: newMethod,
    };

    setInvoicesList([newInv, ...invoicesList]);
    setOpenCreate(false);
    setNewPatient("");
    setNewService("");
    setNewAmount(1000);

    toast({
      title: "Invoice Created",
      description: `Tax invoice ${newInv.invoiceNo} generated for ${newInv.patientName}.`,
    });
  };

  // Print Invoice
  const handlePrint = (inv?: Invoice | null) => {
    const target = inv || selectedInvoice;
    if (!target) return;
    window.print();
    toast({
      title: "Printing Invoice",
      description: `Preparing print dialog for ${target.invoiceNo}...`,
    });
  };

  // Download PDF Invoice
  const handleDownload = (inv: Invoice) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. Top Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 28, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("QLYNO MULTISPECIALTY HOSPITAL", 14, 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text("Tertiary Care & Research Center • NABH Accredited", 14, 15);
    doc.text("Plot 42, Health City Avenue, Andheri West, Mumbai - 400053", 14, 19.5);
    doc.text("Tel: +91 22 6123 4567 • GSTIN: 27AAACH2211R1Z8", 14, 24);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text("TAX INVOICE", pageWidth - 14, 11, { align: "right" });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice No: ${inv.invoiceNo}`, pageWidth - 14, 16.5, { align: "right" });
    doc.text(`Date: ${formatDate(inv.issuedOn)}`, pageWidth - 14, 21, { align: "right" });
    doc.text(`Status: ${inv.status.toUpperCase()}`, pageWidth - 14, 25.5, { align: "right" });

    let y = 34;

    // 2. Patient & Invoice Meta Grid Box
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.roundedRect(14, y, pageWidth - 28, 24, 2, 2, "FD");

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("PATIENT NAME", 18, y + 5);
    doc.text("PATIENT UHID / ID", 65, y + 5);
    doc.text("ENCOUNTER TYPE", 110, y + 5);
    doc.text("DEPARTMENT", 155, y + 5);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(inv.patientName, 18, y + 10);
    doc.setFont("helvetica", "normal");
    doc.text(inv.patientId, 65, y + 10);
    doc.text("Outpatient Consultation", 110, y + 10);
    doc.text(inv.service.split("-")[1]?.trim() || "Clinical Medicine", 155, y + 10);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE DATE", 18, y + 16);
    doc.text("PAYMENT MODE", 65, y + 16);
    doc.text("PAYMENT STATUS", 110, y + 16);
    doc.text("DOC REF", 155, y + 16);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(formatDate(inv.issuedOn), 18, y + 21);
    doc.text(inv.method || "Pending / Bill on File", 65, y + 21);
    doc.setFont("helvetica", "bold");
    if (inv.outstanding === 0) {
      doc.setTextColor(16, 185, 129); // emerald
      doc.text("Fully Settled", 110, y + 21);
    } else {
      doc.setTextColor(220, 38, 38); // red
      doc.text("Payment Due", 110, y + 21);
    }
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "normal");
    doc.text(inv.id, 155, y + 21);

    y += 30;

    // 3. Services Table Header
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.rect(14, y, pageWidth - 28, 8, "FD");

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text("#", 17, y + 5.5);
    doc.text("Service Item & Clinical Description", 26, y + 5.5);
    doc.text("SAC / Code", 110, y + 5.5);
    doc.text("Qty", 136, y + 5.5, { align: "center" });
    doc.text("Unit Rate", 158, y + 5.5, { align: "right" });
    doc.text("Total Amount", pageWidth - 18, y + 5.5, { align: "right" });

    y += 8;

    // Table Body Row
    doc.setFillColor(255, 255, 255);
    doc.rect(14, y, pageWidth - 28, 12, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text("1", 17, y + 5.5);
    doc.setFont("helvetica", "bold");
    doc.text(inv.service, 26, y + 5.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Certified clinical healthcare service rendered at facility", 26, y + 9.5);

    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text("SAC-999312", 110, y + 6);
    doc.text("1", 136, y + 6, { align: "center" });
    doc.text(`INR ${inv.amount.toLocaleString("en-IN")}`, 158, y + 6, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text(`INR ${inv.amount.toLocaleString("en-IN")}`, pageWidth - 18, y + 6, { align: "right" });

    y += 12;

    // 4. Financial Summary Breakdown Rows
    const summaryRows = [
      { label: "Subtotal Amount", value: `INR ${inv.amount.toLocaleString("en-IN")}`, bold: false },
      { label: "Healthcare CGST & SGST (0% GST Exemption Notification No. 12/2017)", value: "INR 0", bold: false },
      { label: "Gross Total Billed Amount", value: `INR ${inv.amount.toLocaleString("en-IN")}`, bold: true },
      { label: `Amount Received ${inv.method ? `(via ${inv.method})` : ""}`, value: `INR ${inv.paid.toLocaleString("en-IN")}`, bold: false, color: [5, 150, 105] },
      { label: "Net Balance Outstanding", value: `INR ${inv.outstanding.toLocaleString("en-IN")}`, bold: true, color: inv.outstanding > 0 ? [220, 38, 38] : [15, 23, 42] },
    ];

    summaryRows.forEach((row) => {
      doc.setFillColor(row.bold ? 241 : 248, row.bold ? 245 : 250, row.bold ? 249 : 252);
      doc.rect(14, y, pageWidth - 28, 7, "FD");

      doc.setFont("helvetica", row.bold ? "bold" : "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(row.label, 18, y + 4.8);

      if (row.color) {
        doc.setTextColor(row.color[0], row.color[1], row.color[2]);
      }
      doc.text(row.value, pageWidth - 18, y + 4.8, { align: "right" });

      y += 7;
    });

    y += 4;

    // 5. Block 1: Hospital Bank Settlement Details
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, y, pageWidth - 28, 12, 1.5, 1.5, "FD");

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.text("HOSPITAL BANK SETTLEMENT DETAILS", 18, y + 4.5);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text("Bank: ", 18, y + 9);
    doc.setFont("helvetica", "bold");
    doc.text("HDFC Bank Ltd (Healthcare Branch)", 27, y + 9);

    y += 15;

    // 6. Block 2: Statutory Notice & Terms
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, y, pageWidth - 28, 18, 1.5, 1.5, "FD");

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.text("STATUTORY NOTICE & TERMS", 18, y + 4.5);

    doc.setTextColor(71, 85, 105);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.text("1. Invoices are computer-generated tax documents under the Clinical Establishments Act.", 18, y + 8.5);
    doc.text("2. Inpatient and OPD healthcare services are exempt from Central & State GST.", 18, y + 12.5);
    doc.text("3. For insurance/TPA claims, please quote UHID & Invoice Number.", 18, y + 16.5);

    y += 24;

    // 7. Signatory & Digital Certification Strip
    doc.setDrawColor(203, 213, 225);
    doc.line(14, y, pageWidth - 14, y);

    y += 8;
    doc.line(18, y + 8, 70, y + 8);
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7);
    doc.text("Patient / Attendant Signature", 18, y + 12);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text("For Qlyno Multispecialty Hospital", pageWidth - 18, y + 5, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Authorized Billing Officer • Digitally Certified & Approved", pageWidth - 18, y + 9.5, { align: "right" });
    doc.text("Subject to Mumbai Jurisdiction", pageWidth - 18, y + 13.5, { align: "right" });

    // Save PDF
    const fileName = `${inv.invoiceNo}_Tax_Invoice.pdf`;
    doc.save(fileName);

    toast({
      title: "PDF Invoice Downloaded",
      description: `Tax Invoice ${inv.invoiceNo} downloaded successfully as PDF.`,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & Invoices"
        description="Integrated billing engine supporting solo consultation, clinic procedures, IPD/OPD packages, and third-party insurance claims."
        crumbs={[{ label: "Finance & Accounts" }, { label: "Billing & Invoices" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button className="gap-1.5 font-semibold" onClick={() => setOpenCreate(true)}>
              <Plus className="h-4 w-4" /> Create Invoice
            </Button>
          </div>
        }
      />

      <BillingNav />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Collected Revenue" value={formatCurrency(totals.collected)} icon={IndianRupee} tone="success" />
        <StatCard label="Outstanding Balance" value={formatCurrency(totals.outstanding)} icon={Wallet} tone="warning" />
        <StatCard label="Paid Invoices" value={`${totals.paidCount} / ${invoicesList.length}`} icon={CheckCircle2} tone="primary" />
      </div>

      {/* Filter Toolbar */}
      <div className="mt-4">
        <Toolbar searchValue={search} onSearchChange={setSearch} placeholder="Search by patient name, UHID, invoice no, or service...">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px] text-xs">
              <SelectValue placeholder="Status Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="issued">Issued</SelectItem>
              <SelectItem value="partially-paid">Partially Paid</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </Toolbar>
      </div>

      {/* Main Invoices Table */}
      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
        {filtered.length === 0 ? (
          <EmptyState icon={Receipt} title="No invoices found" description="Try adjusting search or status filter." />
        ) : (
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="font-semibold text-xs">Invoice No</TableHead>
                <TableHead className="font-semibold text-xs">Patient & UHID</TableHead>
                <TableHead className="font-semibold text-xs">Service Description</TableHead>
                <TableHead className="font-semibold text-xs">Total Amount</TableHead>
                <TableHead className="font-semibold text-xs">Paid</TableHead>
                <TableHead className="font-semibold text-xs">Outstanding</TableHead>
                <TableHead className="font-semibold text-xs">Issued On</TableHead>
                <TableHead className="font-semibold text-xs">Status</TableHead>
                <TableHead className="text-right font-semibold text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((inv) => (
                <TableRow
                  key={inv.id}
                  className="hover:bg-muted/40 transition-colors cursor-pointer"
                  onClick={() => handleOpenView(inv)}
                >
                  <TableCell className="font-mono text-xs font-bold text-foreground">
                    <div className="flex items-center gap-1.5">
                      <ReceiptIcon className="h-3.5 w-3.5 text-primary" />
                      <span>{inv.invoiceNo}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <p className="text-xs font-bold text-foreground hover:text-primary transition-colors">{inv.patientName}</p>
                    <span className="text-[10px] font-mono text-muted-foreground">{inv.patientId}</span>
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{inv.service}</TableCell>
                  
                  <TableCell className="text-xs font-bold text-foreground">{formatCurrency(inv.amount)}</TableCell>

                  <TableCell className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    {formatCurrency(inv.paid)}
                    {inv.method && <span className="text-[10px] text-muted-foreground block font-normal">via {inv.method}</span>}
                  </TableCell>

                  <TableCell className="text-xs">
                    {inv.outstanding > 0 ? (
                      <span className="font-bold text-destructive">{formatCurrency(inv.outstanding)}</span>
                    ) : (
                      <span className="text-muted-foreground text-[11px]">₹0 (Cleared)</span>
                    )}
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">{formatDate(inv.issuedOn)}</TableCell>

                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <StatusBadge status={inv.status} />
                  </TableCell>

                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="text-xs">
                        <DropdownMenuLabel>Invoice Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleOpenView(inv)}>
                          <Eye className="mr-2 h-3.5 w-3.5 text-primary" /> View Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(inv)}>
                          <Download className="mr-2 h-3.5 w-3.5 text-muted-foreground" /> Download Receipt
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePrint(inv)}>
                          <Printer className="mr-2 h-3.5 w-3.5 text-muted-foreground" /> Print Invoice
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {inv.status !== "paid" && inv.status !== "cancelled" && inv.status !== "refunded" && (
                          <DropdownMenuItem onClick={() => handleOpenPayment(inv)}>
                            <DollarSign className="mr-2 h-3.5 w-3.5 text-emerald-600" /> Record Payment
                          </DropdownMenuItem>
                        )}
                        {inv.status === "paid" && (
                          <DropdownMenuItem onClick={() => handleOpenRefund(inv)}>
                            <RotateCcw className="mr-2 h-3.5 w-3.5 text-amber-600" /> Request Refund
                          </DropdownMenuItem>
                        )}
                        {inv.status !== "cancelled" && (
                          <DropdownMenuItem onClick={() => handleCancelInvoice(inv)} className="text-destructive">
                            <XCircle className="mr-2 h-3.5 w-3.5" /> Cancel / Void
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* 1. VIEW INVOICE MODAL (Unified Tax Invoice Document Format & A4 Print Layout) */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 [&>button.absolute]:print:hidden border-border bg-card">
          {selectedInvoice && (
            <div className="printable-invoice-card p-6 sm:p-8 space-y-5 text-xs text-foreground bg-background">
              {/* Document Header & Hospital Info */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b-2 border-border">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold print:border print:border-black">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold tracking-tight text-foreground uppercase">
                        Qlyno Multispecialty Hospital
                      </h2>
                      <p className="text-[11px] text-muted-foreground">
                        Tertiary Care & Research Center • NABH Accredited
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground pt-1">
                    Plot 42, Health City Avenue, Andheri West, Mumbai - 400053
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Tel: <strong>+91 22 6123 4567</strong> • GSTIN: <strong className="font-mono">27AAACH2211R1Z8</strong>
                  </p>
                </div>

                <div className="text-left sm:text-right space-y-1 shrink-0">
                  <Badge variant="outline" className="text-xs font-mono font-bold tracking-wider uppercase px-2.5 py-1 mb-1 whitespace-nowrap inline-block">
                    Original Tax Invoice
                  </Badge>
                  <div className="flex sm:justify-end items-center gap-2">
                    <StatusBadge status={selectedInvoice.status} />
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono whitespace-nowrap">
                    Doc Ref: <strong>{selectedInvoice.id}</strong>
                  </p>
                </div>
              </div>

              {/* Patient & Invoice Metadata Box (Unified 100% Full Width 4-Column Grid) */}
              <div className="w-full rounded-lg border border-border bg-muted/20 p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Patient Name</span>
                  <strong className="text-foreground text-sm font-semibold">{selectedInvoice.patientName}</strong>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Patient UHID / ID</span>
                  <strong className="font-mono text-foreground">{selectedInvoice.patientId}</strong>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Invoice Number</span>
                  <strong className="font-mono text-primary">{selectedInvoice.invoiceNo}</strong>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Invoice Date</span>
                  <strong className="text-foreground">{formatDate(selectedInvoice.issuedOn)}</strong>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Encounter Type</span>
                  <span className="text-foreground font-medium">Outpatient Consultation</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Department / Billing Head</span>
                  <span className="text-foreground font-medium">{selectedInvoice.service.split("-")[1]?.trim() || "General Medicine"}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Payment Mode</span>
                  <span className="text-foreground font-medium">{selectedInvoice.method || "Pending / Bill on File"}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Payment Status</span>
                  <strong className={selectedInvoice.outstanding === 0 ? "text-emerald-600 font-bold" : "text-destructive font-bold"}>
                    {selectedInvoice.outstanding === 0 ? "Fully Settled" : "Payment Due"}
                  </strong>
                </div>
              </div>

              {/* Itemized Services Table with Integrated Full-Width Totals (No-Truncate Layout) */}
              <div className="w-full rounded-lg border border-border overflow-hidden">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-muted/40 text-foreground border-b border-border">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center font-bold">#</th>
                      <th className="py-2.5 px-3 font-bold text-left">Service Item & Clinical Description</th>
                      <th className="py-2.5 px-3 w-28 font-bold text-left">SAC / Code</th>
                      <th className="py-2.5 px-3 w-16 font-bold text-center">Qty</th>
                      <th className="py-2.5 px-3 w-28 font-bold text-right">Unit Rate (₹)</th>
                      <th className="py-2.5 px-3 w-32 font-bold text-right">Total Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    <tr>
                      <td className="py-3 px-3 text-center font-mono align-top">1</td>
                      <td className="py-3 px-3 font-medium align-top">
                        <p className="font-bold text-foreground text-xs">{selectedInvoice.service}</p>
                        <span className="text-[11px] text-muted-foreground block mt-0.5 leading-relaxed">
                          Certified clinical healthcare service rendered at facility
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-muted-foreground align-top">SAC-999312</td>
                      <td className="py-3 px-3 text-center font-mono font-medium align-top">1</td>
                      <td className="py-3 px-3 text-right font-mono align-top">{formatCurrency(selectedInvoice.amount)}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold align-top">{formatCurrency(selectedInvoice.amount)}</td>
                    </tr>
                  </tbody>

                  {/* Integrated Full-Width Financial Summary Table Rows (Labels Left, Amounts Right) */}
                  <tfoot className="bg-muted/20 border-t-2 border-border font-medium divide-y divide-border/40">
                    <tr>
                      <td colSpan={4} className="py-2 px-3 text-left text-muted-foreground">
                        Subtotal Amount
                      </td>
                      <td colSpan={2} className="py-2 px-3 text-right font-mono font-semibold">
                        {formatCurrency(selectedInvoice.amount)}
                      </td>
                    </tr>

                    <tr>
                      <td colSpan={4} className="py-2 px-3 text-left text-muted-foreground">
                        Healthcare CGST & SGST (0% GST Exemption Notification No. 12/2017)
                      </td>
                      <td colSpan={2} className="py-2 px-3 text-right font-mono">
                        ₹0
                      </td>
                    </tr>

                    <tr className="bg-muted/40 font-bold border-y-2 border-border text-foreground">
                      <td colSpan={4} className="py-2.5 px-3 text-left">
                        Gross Total Billed Amount
                      </td>
                      <td colSpan={2} className="py-2.5 px-3 text-right text-sm font-mono font-bold">
                        {formatCurrency(selectedInvoice.amount)}
                      </td>
                    </tr>

                    <tr className="text-emerald-700 dark:text-emerald-300">
                      <td colSpan={4} className="py-2.5 px-3 text-left">
                        Amount Received {selectedInvoice.method ? `(via ${selectedInvoice.method})` : ""}
                      </td>
                      <td colSpan={2} className="py-2.5 px-3 text-right font-mono font-bold">
                        ₹{selectedInvoice.paid.toLocaleString("en-IN")}
                      </td>
                    </tr>

                    <tr className={selectedInvoice.outstanding > 0 ? "bg-destructive/5 font-bold text-destructive" : "font-bold text-foreground"}>
                      <td colSpan={4} className="py-2.5 px-3 text-left">
                        Net Balance Outstanding
                      </td>
                      <td colSpan={2} className="py-2.5 px-3 text-right text-sm font-mono font-bold">
                        {formatCurrency(selectedInvoice.outstanding)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Block 1: Hospital Bank Settlement Details (Separate Block - Bank Name Only) */}
              <div className="w-full p-3.5 rounded-lg border border-border bg-muted/10 text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  Hospital Bank Settlement Details
                </span>
                <p className="text-xs text-muted-foreground">
                  Bank: <strong>HDFC Bank Ltd (Healthcare Branch)</strong>
                </p>
              </div>

              {/* Block 2: Statutory Notice & Terms (Separate Block) */}
              <div className="w-full p-3.5 rounded-lg border border-border bg-muted/10 text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  Statutory Notice & Terms
                </span>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  1. Invoices are computer-generated tax documents under the Clinical Establishments Act.
                </p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  2. Inpatient and OPD services are exempt from Central & State GST.
                </p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  3. For insurance/TPA claims, please quote UHID & Invoice No.
                </p>
              </div>

              {/* Signatures & Seal Verification Strip (100% Full Width) */}
              <div className="w-full pt-4 flex items-end justify-between border-t border-border text-xs">
                <div className="space-y-6">
                  <div className="w-48 border-b border-muted-foreground/60" />
                  <p className="text-[11px] font-medium text-muted-foreground">
                    Patient / Attendant Signature
                  </p>
                </div>

                <div className="space-y-1 text-right">
                  <div className="inline-flex items-center gap-1.5 p-1.5 px-3 rounded-lg border border-primary/30 bg-primary/5 text-primary text-[11px] font-semibold mb-1">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Digitally Certified & Approved</span>
                  </div>
                  <p className="text-[11px] font-bold text-foreground">
                    For Qlyno Multispecialty Hospital
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Authorized Billing Officer • Mumbai Jurisdiction
                  </p>
                </div>
              </div>

              {/* Modal Action Buttons (Hidden on Print) */}
              <div className="print:hidden border-t pt-4 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="gap-1.5 text-xs font-semibold"
                    onClick={() => handlePrint(selectedInvoice)}
                  >
                    <Printer className="h-4 w-4" /> Print Full Page Invoice
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => handleDownload(selectedInvoice)}
                  >
                    <Download className="h-4 w-4 text-muted-foreground" /> Download Text Receipt
                  </Button>
                  {selectedInvoice.outstanding > 0 && selectedInvoice.status !== "cancelled" && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
                      onClick={() => {
                        setShowViewModal(false);
                        handleOpenPayment(selectedInvoice);
                      }}
                    >
                      <DollarSign className="h-4 w-4" /> Record Payment
                    </Button>
                  )}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowViewModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 2. CREATE INVOICE MODAL */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleCreateInvoice}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <Receipt className="h-5 w-5 text-primary" />
                <span>Create New Invoice</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Generate a tax invoice for chargeable OPD consultation, lab diagnostics, or inpatient procedure.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3.5 py-3 text-xs">
              <div className="grid gap-1.5">
                <Label className="text-xs font-semibold">Patient Full Name / UHID *</Label>
                <Input
                  required
                  placeholder="e.g. Aarav Shah (pat_001)"
                  value={newPatient}
                  onChange={(e) => setNewPatient(e.target.value)}
                />
              </div>

              <div className="grid gap-1.5">
                <Label className="text-xs font-semibold">Clinical Service / Procedure *</Label>
                <Input
                  required
                  placeholder="e.g. Consultation - Cardiology + ECG"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold">Amount (₹) *</Label>
                  <Input
                    required
                    type="number"
                    min={1}
                    value={newAmount}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold">Payment Mode</Label>
                  <Select value={newMethod} onValueChange={(val: any) => setNewMethod(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UPI">UPI / QR</SelectItem>
                      <SelectItem value="Card">Debit / Credit Card</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Insurance">Insurance / TPA</SelectItem>
                      <SelectItem value="Online">Online Gateway</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter className="border-t pt-3">
              <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>
                Cancel
              </Button>
              <Button type="submit">Generate Invoice</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 3. RECORD PAYMENT MODAL */}
      <Dialog open={!!paymentInvoice} onOpenChange={(open) => !open && setPaymentInvoice(null)}>
        <DialogContent className="max-w-md">
          {paymentInvoice && (
            <form onSubmit={handleRecordPayment}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                  <span>Record Invoice Payment</span>
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Record collected balance for {paymentInvoice.invoiceNo} ({paymentInvoice.patientName}).
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3.5 py-3 text-xs">
                <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Billed:</span>
                    <strong className="font-mono">{formatCurrency(paymentInvoice.amount)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Already Paid:</span>
                    <strong className="font-mono text-emerald-600">{formatCurrency(paymentInvoice.paid)}</strong>
                  </div>
                  <div className="flex justify-between border-t border-border pt-1 font-bold">
                    <span className="text-destructive">Outstanding Balance:</span>
                    <span className="font-mono text-destructive">{formatCurrency(paymentInvoice.outstanding)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label className="text-xs font-semibold">Payment Amount (₹) *</Label>
                    <Input
                      type="number"
                      min={1}
                      max={paymentInvoice.outstanding > 0 ? paymentInvoice.outstanding : paymentInvoice.amount}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <Label className="text-xs font-semibold">Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={(val: any) => setPaymentMethod(val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UPI">UPI / QR</SelectItem>
                        <SelectItem value="Card">Debit / Credit Card</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Insurance">Insurance / TPA</SelectItem>
                        <SelectItem value="Online">Online Gateway</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold">Transaction / Reference ID</Label>
                  <Input
                    placeholder="e.g. UPI-99218274 or Bank Auth Code"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter className="border-t pt-3">
                <Button type="button" variant="outline" onClick={() => setPaymentInvoice(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                  Confirm Payment Receipt
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* 4. REQUEST REFUND MODAL */}
      <Dialog open={!!refundInvoice} onOpenChange={(open) => !open && setRefundInvoice(null)}>
        <DialogContent className="max-w-md">
          {refundInvoice && (
            <form onSubmit={handleConfirmRefund}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base text-amber-600">
                  <RotateCcw className="h-5 w-5" />
                  <span>Process Invoice Refund</span>
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Refund collected funds for {refundInvoice.invoiceNo} ({refundInvoice.patientName}).
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3.5 py-3 text-xs">
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 space-y-1">
                  <p><strong>Refundable Amount:</strong> {formatCurrency(refundInvoice.paid)}</p>
                  <p className="text-[11px]">Payment will be returned via original payment channel ({refundInvoice.method || "Account"}).</p>
                </div>

                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold">Reason for Refund *</Label>
                  <Select value={refundReason} onValueChange={setRefundReason}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Patient requested cancellation / Clinical dispute">Patient requested cancellation / Clinical dispute</SelectItem>
                      <SelectItem value="Doctor unavailable / appointment rescheduled">Doctor unavailable / appointment rescheduled</SelectItem>
                      <SelectItem value="Duplicate billing entry / accounting correction">Duplicate billing entry / accounting correction</SelectItem>
                      <SelectItem value="Insurance claim approved directly by TPA">Insurance claim approved directly by TPA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="border-t pt-3">
                <Button type="button" variant="outline" onClick={() => setRefundInvoice(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="default" className="bg-amber-600 hover:bg-amber-700 text-white">
                  Confirm & Process Refund
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
