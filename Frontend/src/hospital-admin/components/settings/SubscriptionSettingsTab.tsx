"use client";

import React, { useState } from "react";
import {
  Crown,
  Check,
  Zap,
  HardDrive,
  Users,
  ArrowUpRight,
  Download,
  CreditCard,
  Sparkles,
  Building2,
  Bed,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Progress } from "@/hospital-admin/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/hospital-admin/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/hospital-admin/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { useToast } from "@/hospital-admin/hooks/use-toast";

interface SubscriptionInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  plan: string;
  amount: string;
  status: "Paid" | "Pending";
}

const initialInvoices: SubscriptionInvoice[] = [
  {
    id: "sub-inv-1",
    invoiceNumber: "QLY-SUB-2026-0891",
    date: "15 Jan 2026",
    plan: "Qlyno Enterprise Hospital Tier (Annual)",
    amount: "₹ 4,80,000",
    status: "Paid",
  },
  {
    id: "sub-inv-2",
    invoiceNumber: "QLY-SUB-2025-0422",
    date: "15 Jan 2025",
    plan: "Qlyno Enterprise Hospital Tier (Annual)",
    amount: "₹ 4,20,000",
    status: "Paid",
  },
  {
    id: "sub-inv-3",
    invoiceNumber: "QLY-ADD-2025-0911",
    date: "10 Aug 2025",
    plan: "Add-on: +50 Inpatient Bed Pack & DICOM Cloud",
    amount: "₹ 65,000",
    status: "Paid",
  },
];

export function SubscriptionSettingsTab() {
  const { toast } = useToast();
  const [invoices] = useState<SubscriptionInvoice[]>(initialInvoices);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState("doctors");
  const [addonQuantity, setAddonQuantity] = useState("10");

  const [capacity, setCapacity] = useState({
    doctorsUsed: 42,
    doctorsTotal: 50,
    nursesUsed: 128,
    nursesTotal: 150,
    bedsUsed: 280,
    bedsTotal: 300,
    storageUsedGb: 680,
    storageTotalGb: 1000,
  });

  const handleDownloadInvoice = (invoice: SubscriptionInvoice) => {
    toast({
      title: "Opening Tax Invoice PDF",
      description: `Preparing official invoice ${invoice.invoiceNumber} for download/print.`,
    });

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({
        title: "Popup Blocked",
        description: "Please allow popups to view and download the invoice PDF.",
        variant: "destructive",
      });
      return;
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tax Invoice - ${invoice.invoiceNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    body { padding: 40px; color: #1e293b; background: #ffffff; font-size: 13px; line-height: 1.5; }
    .invoice-box { max-width: 800px; margin: auto; border: 1px solid #e2e8f0; padding: 36px; border-radius: 12px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 24px; }
    .logo-title { font-size: 24px; font-weight: 800; color: #2563eb; letter-spacing: -0.5px; }
    .badge-paid { display: inline-block; padding: 4px 12px; background: #dcfce7; color: #166534; font-weight: 700; border-radius: 9999px; font-size: 11px; text-transform: uppercase; border: 1px solid #86efac; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
    .meta-title { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; margin-bottom: 4px; }
    .meta-value { font-size: 13px; font-weight: 600; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { background: #f8fafc; color: #475569; font-weight: 700; text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; }
    td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    .text-right { text-align: right; }
    .summary-table { width: 300px; margin-left: auto; margin-bottom: 24px; }
    .summary-table td { padding: 6px 12px; }
    .total-row { font-size: 15px; font-weight: 800; color: #2563eb; border-top: 2px solid #e2e8f0; }
    .footer { border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 32px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b; }
    .stamp-box { border: 1px dashed #cbd5e1; padding: 12px 20px; border-radius: 8px; text-align: center; }
    @media print {
      body { padding: 0; background: none; }
      .invoice-box { border: none; padding: 0; max-width: 100%; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px; text-align: center;">
    <button onclick="window.print()" style="background: #2563eb; color: white; border: none; padding: 10px 24px; font-size: 14px; font-weight: 600; border-radius: 8px; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">🖨️ Print / Save as PDF</button>
  </div>
  <div class="invoice-box">
    <div class="header">
      <div>
        <div class="logo-title">QLYNO HEALTHCARE</div>
        <p style="font-size: 11px; color: #64748b; margin-top: 2px;">Qlyno Technologies Cloud Services Pvt Ltd</p>
        <p style="font-size: 11px; color: #64748b;">GSTIN: 27AABCQ9876K1Z4 · PAN: AABCQ9876K</p>
        <p style="font-size: 11px; color: #64748b;">Level 14, Tower 3, Cyber Tech Park, Mumbai 400076</p>
      </div>
      <div style="text-align: right;">
        <span class="badge-paid">Payment Received</span>
        <h2 style="font-size: 16px; font-weight: 800; margin-top: 8px; color: #0f172a;">TAX INVOICE</h2>
        <p style="font-size: 12px; font-family: monospace; font-weight: 700; color: #2563eb;">${invoice.invoiceNumber}</p>
      </div>
    </div>

    <div class="grid-2">
      <div>
        <p class="meta-title">Billed To (Hospital Entity):</p>
        <p class="meta-value">Qlyno Multispecialty Hospital &amp; Research Center</p>
        <p style="color: #475569; font-size: 12px;">Qlyno Healthcare Services Pvt Ltd</p>
        <p style="color: #475569; font-size: 12px;">GSTIN: 27AABCQ1234F1Z8</p>
        <p style="color: #475569; font-size: 12px;">Healthcare City, Mumbai, Maharashtra 400076</p>
      </div>
      <div style="text-align: right;">
        <p class="meta-title">Invoice Details:</p>
        <p style="font-size: 12px; color: #475569;">Invoice Date: <strong style="color: #0f172a;">${invoice.date}</strong></p>
        <p style="font-size: 12px; color: #475569;">Payment Method: <strong>Corporate Net Banking / Razorpay</strong></p>
        <p style="font-size: 12px; color: #475569;">Status: <strong style="color: #166534;">Settled (Paid)</strong></p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Description / Service Item</th>
          <th>Billing Cycle</th>
          <th>SAC Code</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>
            <strong>${invoice.plan}</strong>
            <p style="font-size: 11px; color: #64748b;">Enterprise Hospital Cloud Management Suite with 24x7 SLA, NABH Modules, and Secure Data Storage</p>
          </td>
          <td>Annual Subscription</td>
          <td>998313</td>
          <td class="text-right font-mono font-bold">${invoice.amount}</td>
        </tr>
      </tbody>
    </table>

    <table class="summary-table">
      <tr>
        <td style="color: #64748b;">Subtotal:</td>
        <td class="text-right font-mono font-bold">${invoice.amount}</td>
      </tr>
      <tr>
        <td style="color: #64748b;">Integrated GST (IGST 18%):</td>
        <td class="text-right font-mono">Included</td>
      </tr>
      <tr class="total-row">
        <td>Total Paid:</td>
        <td class="text-right font-mono">${invoice.amount}</td>
      </tr>
    </table>

    <div class="footer">
      <div>
        <p><strong>Terms:</strong> This is a computer-generated tax invoice and requires no physical signature.</p>
        <p>Support: enterprise@qlyno.health · Phone: +91 22 4000 1200</p>
      </div>
      <div class="stamp-box">
        <p style="font-size: 10px; font-weight: 700; color: #166534; text-transform: uppercase;">Digitally Certified</p>
        <p style="font-size: 9px; color: #64748b;">Qlyno Billing Clearinghouse</p>
      </div>
    </div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
    };
  </script>
</body>
</html>`;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleAddCapacity = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(addonQuantity, 10) || 5;

    if (selectedAddon === "doctors") {
      setCapacity((prev) => ({ ...prev, doctorsTotal: prev.doctorsTotal + qty }));
    } else if (selectedAddon === "nurses") {
      setCapacity((prev) => ({ ...prev, nursesTotal: prev.nursesTotal + qty }));
    } else if (selectedAddon === "beds") {
      setCapacity((prev) => ({ ...prev, bedsTotal: prev.bedsTotal + qty }));
    } else if (selectedAddon === "storage") {
      setCapacity((prev) => ({ ...prev, storageTotalGb: prev.storageTotalGb + qty * 50 }));
    }

    setUpgradeModalOpen(false);
    toast({
      title: "Capacity Added Successfully",
      description: `Hospital resource quotas expanded. Immediate activation completed.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Active Plan Banner */}
      <Card className="border-primary/40 bg-gradient-to-br from-card via-card to-primary/5 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500 fill-amber-500/20" />
                <h3 className="text-lg font-bold text-foreground">
                  Qlyno Enterprise Hospital Tier
                </h3>
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs">
                  Active · Annual
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Dedicated cloud instance with high-availability failover, NABH clinical modules, and 24x7 SLA support.
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-primary" /> Renews on: <strong>15 Jan 2027</strong>
                </span>
                <span className="flex items-center gap-1">
                  <CreditCard className="h-3.5 w-3.5 text-primary" /> Auto-Renewal: <strong>Enabled</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setUpgradeModalOpen(true)}
                className="gap-1.5 text-xs font-semibold shadow-xs"
              >
                <Sparkles className="h-4 w-4 text-amber-300" /> Add Resource Capacity
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Resource Quotas & Utilization Meters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Zap className="h-5 w-5 text-primary" /> Real-time System Capacity &amp; Resource Allocation
          </CardTitle>
          <CardDescription className="text-xs">
            Current staff license seats, registered bed counts, and cloud medical imaging storage.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Doctor Licenses */}
          <div className="space-y-2 rounded-xl border border-border p-4 bg-muted/20">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
                <Users className="h-4 w-4 text-blue-600" /> Doctor Seats
              </span>
              <span className="font-mono font-bold text-foreground">
                {capacity.doctorsUsed} / {capacity.doctorsTotal}
              </span>
            </div>
            <Progress value={(capacity.doctorsUsed / capacity.doctorsTotal) * 100} className="h-2" />
            <p className="text-[11px] text-muted-foreground">
              {capacity.doctorsTotal - capacity.doctorsUsed} seats available
            </p>
          </div>

          {/* Nursing Workforce */}
          <div className="space-y-2 rounded-xl border border-border p-4 bg-muted/20">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
                <Users className="h-4 w-4 text-emerald-600" /> Nursing Licenses
              </span>
              <span className="font-mono font-bold text-foreground">
                {capacity.nursesUsed} / {capacity.nursesTotal}
              </span>
            </div>
            <Progress value={(capacity.nursesUsed / capacity.nursesTotal) * 100} className="h-2" />
            <p className="text-[11px] text-muted-foreground">
              {capacity.nursesTotal - capacity.nursesUsed} seats available
            </p>
          </div>

          {/* Inpatient Bed Registry */}
          <div className="space-y-2 rounded-xl border border-border p-4 bg-muted/20">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
                <Bed className="h-4 w-4 text-cyan-600" /> Inpatient Bed Capacity
              </span>
              <span className="font-mono font-bold text-foreground">
                {capacity.bedsUsed} / {capacity.bedsTotal}
              </span>
            </div>
            <Progress value={(capacity.bedsUsed / capacity.bedsTotal) * 100} className="h-2" />
            <p className="text-[11px] text-muted-foreground">
              {capacity.bedsTotal - capacity.bedsUsed} beds unallocated
            </p>
          </div>

          {/* Cloud Storage */}
          <div className="space-y-2 rounded-xl border border-border p-4 bg-muted/20">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
                <HardDrive className="h-4 w-4 text-purple-600" /> Cloud PACS / Storage
              </span>
              <span className="font-mono font-bold text-foreground">
                {capacity.storageUsedGb} GB / {capacity.storageTotalGb} GB
              </span>
            </div>
            <Progress value={(capacity.storageUsedGb / capacity.storageTotalGb) * 100} className="h-2" />
            <p className="text-[11px] text-muted-foreground">
              {capacity.storageTotalGb - capacity.storageUsedGb} GB free vault
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 3. Subscription Invoices & Billing History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <CreditCard className="h-5 w-5 text-primary" /> Software Subscription Invoices
          </CardTitle>
          <CardDescription className="text-xs">
            Official tax invoices and payment receipts for your hospital's Qlyno Enterprise subscription.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Invoice Number</TableHead>
                  <TableHead className="text-xs font-bold">Billing Date</TableHead>
                  <TableHead className="text-xs font-bold">Plan Details</TableHead>
                  <TableHead className="text-xs font-bold">Amount Paid</TableHead>
                  <TableHead className="text-xs font-bold">Status</TableHead>
                  <TableHead className="text-xs font-bold text-right">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {inv.invoiceNumber}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{inv.date}</TableCell>
                    <TableCell className="text-xs font-medium text-foreground">{inv.plan}</TableCell>
                    <TableCell className="text-xs font-mono font-semibold">{inv.amount}</TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]">
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadInvoice(inv)}
                        className="h-8 gap-1.5 text-xs text-primary hover:text-primary hover:bg-primary/10 font-semibold"
                      >
                        <Download className="h-3.5 w-3.5" /> PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Capacity Modal */}
      <Dialog open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Expand Hospital Capacity
            </DialogTitle>
            <DialogDescription className="text-xs">
              Instantly provision additional doctor seats, nursing workforce licenses, or bed allowances.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddCapacity} className="space-y-4 py-2">
            <div className="grid gap-1.5">
              <Label className="text-xs">Resource Type</Label>
              <Select value={selectedAddon} onValueChange={setSelectedAddon}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="doctors">Doctor Seats (+₹1,200/seat/mo)</SelectItem>
                  <SelectItem value="nurses">Nursing Licenses (+₹400/nurse/mo)</SelectItem>
                  <SelectItem value="beds">Inpatient Bed Monitoring (+₹300/bed/mo)</SelectItem>
                  <SelectItem value="storage">Cloud DICOM Imaging Storage Pack (+50GB)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label className="text-xs">Quantity to Add</Label>
              <Input
                type="number"
                min={1}
                max={500}
                value={addonQuantity}
                onChange={(e) => setAddonQuantity(e.target.value)}
                className="text-xs"
                required
              />
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">Pro-rated billing applies</p>
              <p>Charges will be adjusted automatically on your next annual billing cycle.</p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setUpgradeModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Confirm &amp; Provision
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
