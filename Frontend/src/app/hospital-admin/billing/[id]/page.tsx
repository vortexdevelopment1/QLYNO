"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  DollarSign,
  Download,
  FileText,
  IndianRupee,
  Printer,
  Receipt,
  RotateCcw,
  ShieldCheck,
  User,
  Wallet,
} from "lucide-react";

import { Button } from "@/hospital-admin/components/ui/button";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Card } from "@/hospital-admin/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
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
import { StatusBadge } from "@/hospital-admin/components/shared/status-badge";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { invoices as initialInvoices } from "@/hospital-admin/lib/mock-data/invoices";
import jsPDF from "jspdf";
import { formatCurrency, formatDate } from "@/hospital-admin/lib/utils";
import { Invoice } from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();

  const [invoicesList, setInvoicesList] = useState<Invoice[]>(initialInvoices);
  const invoice = invoicesList.find((i) => i.id === params.id || i.invoiceNo === params.id) || invoicesList[0];

  // Payment Recording Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(invoice?.outstanding || 0);
  const [payMethod, setPayMethod] = useState<"Cash" | "Card" | "UPI" | "Insurance" | "Online">("UPI");
  const [payRef, setPayRef] = useState(`TXN-${Math.floor(100000 + Math.random() * 900000)}`);

  // Refund Modal
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState("Patient requested cancellation / Clinical dispute");

  // Print Action
  const handlePrint = () => {
    window.print();
  };

  // Download PDF Action
  const handleDownload = () => {
    if (!invoice) return;

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
    doc.text(`Invoice No: ${invoice.invoiceNo}`, pageWidth - 14, 16.5, { align: "right" });
    doc.text(`Date: ${formatDate(invoice.issuedOn)}`, pageWidth - 14, 21, { align: "right" });
    doc.text(`Status: ${invoice.status.toUpperCase()}`, pageWidth - 14, 25.5, { align: "right" });

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
    doc.text(invoice.patientName, 18, y + 10);
    doc.setFont("helvetica", "normal");
    doc.text(invoice.patientId, 65, y + 10);
    doc.text("Outpatient Consultation", 110, y + 10);
    doc.text(invoice.service.split("-")[1]?.trim() || "Clinical Medicine", 155, y + 10);

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
    doc.text(formatDate(invoice.issuedOn), 18, y + 21);
    doc.text(invoice.method || "Pending / Bill on File", 65, y + 21);
    doc.setFont("helvetica", "bold");
    if (invoice.outstanding === 0) {
      doc.setTextColor(16, 185, 129); // emerald
      doc.text("Fully Settled", 110, y + 21);
    } else {
      doc.setTextColor(220, 38, 38); // red
      doc.text("Payment Due", 110, y + 21);
    }
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "normal");
    doc.text(invoice.id, 155, y + 21);

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
    doc.text(invoice.service, 26, y + 5.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Certified clinical healthcare service rendered at facility", 26, y + 9.5);

    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text("SAC-999312", 110, y + 6);
    doc.text("1", 136, y + 6, { align: "center" });
    doc.text(`INR ${invoice.amount.toLocaleString("en-IN")}`, 158, y + 6, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text(`INR ${invoice.amount.toLocaleString("en-IN")}`, pageWidth - 18, y + 6, { align: "right" });

    y += 12;

    // 4. Financial Summary Breakdown Rows
    const summaryRows = [
      { label: "Subtotal Amount", value: `INR ${invoice.amount.toLocaleString("en-IN")}`, bold: false },
      { label: "Healthcare CGST & SGST (0% GST Exemption Notification No. 12/2017)", value: "INR 0", bold: false },
      { label: "Gross Total Billed Amount", value: `INR ${invoice.amount.toLocaleString("en-IN")}`, bold: true },
      { label: `Amount Received ${invoice.method ? `(via ${invoice.method})` : ""}`, value: `INR ${invoice.paid.toLocaleString("en-IN")}`, bold: false, color: [5, 150, 105] },
      { label: "Net Balance Outstanding", value: `INR ${invoice.outstanding.toLocaleString("en-IN")}`, bold: true, color: invoice.outstanding > 0 ? [220, 38, 38] : [15, 23, 42] },
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
    const fileName = `${invoice.invoiceNo}_Tax_Invoice.pdf`;
    doc.save(fileName);

    toast({
      title: "PDF Invoice Downloaded",
      description: `Tax Invoice ${invoice.invoiceNo} downloaded successfully as PDF.`,
    });
  };

  // Record Payment
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice || payAmount <= 0) return;

    setInvoicesList((prev) =>
      prev.map((item) => {
        if (item.id === invoice.id) {
          const newPaid = item.paid + payAmount;
          const newOutstanding = Math.max(0, item.amount - newPaid);
          const newStatus = newOutstanding === 0 ? "paid" : "partially-paid";
          return {
            ...item,
            paid: newPaid,
            outstanding: newOutstanding,
            status: newStatus,
            method: payMethod,
          };
        }
        return item;
      })
    );

    toast({
      title: "Payment Recorded",
      description: `₹${payAmount.toLocaleString("en-IN")} received via ${payMethod} for ${invoice.invoiceNo}.`,
    });

    setShowPaymentModal(false);
  };

  // Process Refund
  const handleProcessRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    setInvoicesList((prev) =>
      prev.map((item) => (item.id === invoice.id ? { ...item, status: "refunded" } : item))
    );

    toast({
      title: "Refund Recorded",
      description: `Invoice ${invoice.invoiceNo} marked as refunded. Reason: ${refundReason}.`,
    });

    setShowRefundModal(false);
  };

  if (!invoice) {
    return (
      <div className="p-8 text-center space-y-4">
        <Receipt className="h-10 w-10 text-muted-foreground mx-auto" />
        <h2 className="text-base font-bold">Invoice Not Found</h2>
        <Link href="/hospital-admin/billing">
          <Button variant="outline" size="sm">
            Back to Invoices
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Controls (Hidden during Print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <Link href="/hospital-admin/billing">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <PageHeader
            title={`Tax Invoice — ${invoice.invoiceNo}`}
            description={`Certified tax invoice for patient ${invoice.patientName} (${invoice.patientId}).`}
            crumbs={[{ label: "Finance & Accounts", href: "/hospital-admin/billing" }, { label: "Billing & Invoices", href: "/hospital-admin/billing" }, { label: invoice.invoiceNo }]}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" className="gap-1.5 font-semibold" onClick={handlePrint}>
            <Printer className="h-4 w-4" /> Print Invoice
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDownload}>
            <Download className="h-4 w-4 text-muted-foreground" /> Download
          </Button>
          {invoice.outstanding > 0 && invoice.status !== "cancelled" && (
            <Button
              size="sm"
              variant="secondary"
              className="gap-1.5 font-semibold text-emerald-700 dark:text-emerald-300"
              onClick={() => {
                setPayAmount(invoice.outstanding);
                setShowPaymentModal(true);
              }}
            >
              <DollarSign className="h-4 w-4" /> Record Payment
            </Button>
          )}
          {invoice.status === "paid" && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-amber-700 dark:text-amber-300"
              onClick={() => setShowRefundModal(true)}
            >
              <RotateCcw className="h-4 w-4" /> Refund
            </Button>
          )}
        </div>
      </div>

      {/* Main Invoice Document Page (Targeted by @media print) */}
      <div className="flex justify-center">
        <div className="printable-invoice-page w-full max-w-4xl bg-card border border-border rounded-xl p-8 sm:p-10 shadow-sm space-y-6 text-xs text-foreground">
          {/* Header Strip */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b-2 border-border">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold print:border print:border-black">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-foreground uppercase">
                    Qlyno Multispecialty Hospital
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Tertiary Care & Research Center • NABH Accredited
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground pt-1.5">
                Plot 42, Health City Avenue, Andheri West, Mumbai - 400053
              </p>
              <p className="text-[11px] text-muted-foreground">
                Tel: <strong>+91 22 6123 4567</strong> • GSTIN: <strong className="font-mono">27AAACH2211R1Z8</strong>
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1.5 shrink-0">
              <Badge variant="outline" className="text-xs font-mono font-bold tracking-wider uppercase px-3 py-1 whitespace-nowrap inline-block">
                Original Tax Invoice
              </Badge>
              <div className="flex sm:justify-end items-center gap-2">
                <StatusBadge status={invoice.status} />
              </div>
              <p className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                Doc Ref: <strong>{invoice.id}</strong>
              </p>
            </div>
          </div>

          {/* Patient & Invoice Metadata (Unified 100% Full-Width Grid) */}
          <div className="w-full rounded-lg border border-border bg-muted/20 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Patient Full Name</span>
              <strong className="text-foreground text-sm font-semibold">{invoice.patientName}</strong>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Patient UHID / ID</span>
              <strong className="font-mono text-foreground">{invoice.patientId}</strong>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Invoice Number</span>
              <strong className="font-mono text-primary">{invoice.invoiceNo}</strong>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Date of Issue</span>
              <strong className="text-foreground">{formatDate(invoice.issuedOn)}</strong>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Encounter Type</span>
              <span className="text-foreground font-medium">Outpatient Consultation</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Department</span>
              <span className="text-foreground font-medium">{invoice.service.split("-")[1]?.trim() || "Clinical Medicine"}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Payment Mode</span>
              <span className="text-foreground font-medium">{invoice.method || "Pending / Bill on File"}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Payment Status</span>
              <strong className={invoice.outstanding === 0 ? "text-emerald-600 font-bold" : "text-destructive font-bold"}>
                {invoice.outstanding === 0 ? "Fully Settled" : "Payment Due"}
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
                    <p className="font-bold text-foreground text-xs">{invoice.service}</p>
                    <span className="text-[11px] text-muted-foreground block mt-0.5 leading-relaxed">
                      Certified clinical healthcare service rendered at facility
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-muted-foreground align-top">SAC-999312</td>
                  <td className="py-3 px-3 text-center font-mono font-medium align-top">1</td>
                  <td className="py-3 px-3 text-right font-mono align-top">{formatCurrency(invoice.amount)}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold align-top">{formatCurrency(invoice.amount)}</td>
                </tr>
              </tbody>

              {/* Integrated Financial Summary Rows (Labels Left, Amounts Right) */}
              <tfoot className="bg-muted/20 border-t-2 border-border font-medium divide-y divide-border/40">
                <tr>
                  <td colSpan={4} className="py-2 px-3 text-left text-muted-foreground">
                    Subtotal Amount
                  </td>
                  <td colSpan={2} className="py-2 px-3 text-right font-mono font-semibold">
                    {formatCurrency(invoice.amount)}
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
                    {formatCurrency(invoice.amount)}
                  </td>
                </tr>

                <tr className="text-emerald-700 dark:text-emerald-300">
                  <td colSpan={4} className="py-2 px-3 text-left">
                    Amount Received {invoice.method ? `(via ${invoice.method})` : ""}
                  </td>
                  <td colSpan={2} className="py-2 px-3 text-right font-mono font-bold">
                    ₹{invoice.paid.toLocaleString("en-IN")}
                  </td>
                </tr>

                <tr className={invoice.outstanding > 0 ? "bg-destructive/5 font-bold text-destructive" : "font-bold text-foreground"}>
                  <td colSpan={4} className="py-2.5 px-3 text-left">
                    Net Balance Outstanding
                  </td>
                  <td colSpan={2} className="py-2.5 px-3 text-right text-sm font-mono font-bold">
                    {formatCurrency(invoice.outstanding)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Block 1: Hospital Bank Settlement Details (Separate Block - Bank Name Only) */}
          <div className="w-full p-4 rounded-lg border border-border bg-muted/10 text-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
              Hospital Bank Settlement Details
            </span>
            <p className="text-xs text-muted-foreground">
              Bank: <strong>HDFC Bank Ltd (Healthcare Branch)</strong>
            </p>
          </div>

          {/* Block 2: Statutory Notice & Terms (Separate Block) */}
          <div className="w-full p-4 rounded-lg border border-border bg-muted/10 text-xs space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
              Statutory Notice & Terms
            </span>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              1. Invoices are computer-generated tax documents under the Clinical Establishments Act.
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              2. Inpatient and OPD healthcare services are exempt from Central & State GST.
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              3. For insurance/TPA claims, please quote UHID & Invoice No.
            </p>
          </div>

          {/* Signatures & Seal Verification Strip (100% Full-Width) */}
          <div className="w-full pt-6 flex items-end justify-between border-t border-border text-xs">
            <div className="space-y-6">
              <div className="w-48 border-b border-muted-foreground/60" />
              <p className="text-xs font-medium text-muted-foreground">
                Patient / Attendant Signature
              </p>
            </div>

            <div className="space-y-1 text-right">
              <div className="inline-flex items-center gap-1.5 p-1.5 px-3 rounded-lg border border-primary/30 bg-primary/5 text-primary text-xs font-semibold mb-1">
                <ShieldCheck className="h-4 w-4" />
                <span>Digitally Certified & Approved</span>
              </div>
              <p className="text-xs font-bold text-foreground">
                For Qlyno Multispecialty Hospital
              </p>
              <p className="text-[11px] text-muted-foreground">
                Authorized Billing Officer • Mumbai Jurisdiction
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RECORD PAYMENT MODAL */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleRecordPayment}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                <span>Record Invoice Payment</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Record payment for {invoice.invoiceNo} ({invoice.patientName}).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-3 text-xs">
              <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <strong className="font-mono">{formatCurrency(invoice.amount)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Already Paid:</span>
                  <strong className="font-mono text-emerald-600">{formatCurrency(invoice.paid)}</strong>
                </div>
                <div className="flex justify-between border-t border-border pt-1 font-bold">
                  <span className="text-destructive">Outstanding:</span>
                  <span className="font-mono text-destructive">{formatCurrency(invoice.outstanding)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold">Payment Amount (₹) *</Label>
                  <Input
                    type="number"
                    min={1}
                    max={invoice.outstanding}
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold">Payment Method</Label>
                  <Select value={payMethod} onValueChange={(val: any) => setPayMethod(val)}>
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
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="border-t pt-3">
              <Button type="button" variant="outline" onClick={() => setShowPaymentModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                Confirm Payment Receipt
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* REQUEST REFUND MODAL */}
      <Dialog open={showRefundModal} onOpenChange={setShowRefundModal}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleProcessRefund}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base text-amber-600">
                <RotateCcw className="h-5 w-5" />
                <span>Process Invoice Refund</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Refund collected amount of {formatCurrency(invoice.paid)} for {invoice.invoiceNo}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-3 text-xs">
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 space-y-1">
                <p><strong>Refundable Amount:</strong> {formatCurrency(invoice.paid)}</p>
                <p className="text-[11px]">Payment will be returned via original payment channel ({invoice.method || "Account"}).</p>
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
              <Button type="button" variant="outline" onClick={() => setShowRefundModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="default" className="bg-amber-600 hover:bg-amber-700 text-white">
                Confirm & Process Refund
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
