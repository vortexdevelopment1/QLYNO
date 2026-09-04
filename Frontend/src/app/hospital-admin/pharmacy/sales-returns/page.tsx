"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  Pill,
  Plus,
  QrCode,
  Receipt,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  Trash2,
  User,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/hospital-admin/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/hospital-admin/components/ui/tabs";
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { PharmacyNav } from "@/hospital-admin/components/pharmacy/pharmacy-nav";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import {
  mockPharmacySalesRecords,
  mockPharmacyReturnRecords,
} from "@/hospital-admin/lib/mock-data/pharmacy-extended-operations";
import { PharmacySalesRecord, PharmacyReturnRecord } from "@/hospital-admin/lib/types";
import { formatDateTime } from "@/hospital-admin/lib/utils";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Pharmacy Operational workflow";

export default function PharmacySalesReturnsPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("sales");
  const [sales, setSales] = useState<PharmacySalesRecord[]>(mockPharmacySalesRecords);
  const [returns, setReturns] = useState<PharmacyReturnRecord[]>(mockPharmacyReturnRecords);

  // New OTC Sale Modal State
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [saleItemName, setSaleItemName] = useState("Paracetamol 650mg Tablets");
  const [saleQty, setSaleQty] = useState(20);
  const [salePrice, setSalePrice] = useState(3.5);
  const [paymentMode, setPaymentMode] = useState<any>("UPI");

  // New Return Modal State
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnType, setReturnType] = useState<any>("Patient Return");
  const [retMedName, setRetMedName] = useState("Enoxaparin 60mg Pre-filled Syringe");
  const [retBatch, setRetBatch] = useState("ENOX-442");
  const [retQty, setRetQty] = useState(4);
  const [retUnitRefund, setRetUnitRefund] = useState(160);
  const [retReason, setRetReason] = useState("Unused sealed post-op discharge medicine returned.");
  const [retLinkedRx, setRetLinkedRx] = useState("RX-2026-8804");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCreateSale = (e: React.FormEvent) => {
    e.preventDefault();
    const total = saleQty * salePrice;
    const newSale: PharmacySalesRecord = {
      id: `sale_${Date.now()}`,
      receiptNumber: `OTC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: custName || "Walk-in Patient",
      customerPhone: custPhone || "+91 98000 00000",
      items: [
        {
          medicineId: "MED-009",
          medicineName: saleItemName,
          quantity: Number(saleQty),
          unitPrice: Number(salePrice),
          totalPrice: total,
        },
      ],
      subtotal: total,
      taxAmount: Math.round(total * 0.05),
      discountAmount: 0,
      totalPaid: total + Math.round(total * 0.05),
      paymentMode,
      dispensingPharmacist: "Rekha Joshi",
      timestamp: new Date().toISOString(),
    };

    setSales((prev) => [newSale, ...prev]);
    toast({
      title: "OTC Sale Processed",
      description: `Receipt ${newSale.receiptNumber} created (₹${newSale.totalPaid}). Inventory deducted and billing revenue accrued. (${DELEGATION_STRING})`,
    });
    setSaleModalOpen(false);
    setCustName("");
    setCustPhone("");
  };

  const handleCreateReturn = (e: React.FormEvent) => {
    e.preventDefault();
    const refundTotal = returnType === "Expired / Damaged Write-Off" ? 0 : retQty * retUnitRefund;

    const newReturn: PharmacyReturnRecord = {
      id: `ret_${Date.now()}`,
      returnNumber: `RET-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      returnType,
      medicineId: "MED-004",
      medicineName: retMedName,
      batchNumber: retBatch,
      quantity: Number(retQty),
      unitPrice: Number(retUnitRefund),
      totalRefundAmount: refundTotal,
      reason: retReason,
      linkedPrescriptionId: returnType === "Patient Return" ? retLinkedRx : undefined,
      patientName: returnType === "Patient Return" ? "Kavita R. Nair" : undefined,
      supplierName: returnType === "Supplier Return" ? "Apex Pharma Distributors Ltd" : undefined,
      processedBy: "Rekha Joshi (Chief Pharmacist)",
      timestamp: new Date().toISOString(),
      status:
        returnType === "Patient Return"
          ? "Restocked & Refunded"
          : returnType === "Supplier Return"
          ? "Returned to Vendor"
          : "Written Off",
    };

    setReturns((prev) => [newReturn, ...prev]);
    toast({
      title: `${returnType} Processed`,
      description: `${newReturn.returnNumber}: ${retQty} units of ${retMedName} adjusted in inventory. Refund ₹${refundTotal} linked to Billing. (${DELEGATION_STRING})`,
    });
    setReturnModalOpen(false);
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="OTC Walk-in Sales &amp; Medication Returns Governance"
          description="Direct over-the-counter sales register and 3-way medication returns (Patient, Supplier, Expired Write-Off)."
          crumbs={[{ label: "Operations" }, { label: "Pharmacy", href: "/hospital-admin/pharmacy" }, { label: "Sales & Returns" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading sales &amp; returns...
        </div>
      </div>
    );
  }

  const totalOTCSalesRevenue = sales.reduce((acc, s) => acc + s.totalPaid, 0);
  const totalPatientRefunds = returns
    .filter((r) => r.returnType === "Patient Return")
    .reduce((acc, r) => acc + r.totalRefundAmount, 0);

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="OTC Walk-in Sales &amp; Medication Returns Governance"
        description="Direct over-the-counter sales register and 3-way medication returns (Patient, Supplier, Expired Write-Off)."
        crumbs={[{ label: "Operations" }, { label: "Pharmacy", href: "/hospital-admin/pharmacy" }, { label: "Sales & Returns" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 font-semibold text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => setReturnModalOpen(true)}
            >
              <RotateCcw className="h-4 w-4" /> Process Return / Write-Off
            </Button>
            <Button
              size="sm"
              className="gap-1.5 font-semibold text-xs bg-primary text-primary-foreground"
              onClick={() => setSaleModalOpen(true)}
            >
              <Plus className="h-4 w-4" /> New OTC Sale
            </Button>
          </div>
        }
      />

      <PharmacyNav />

      {/* Scope Indicator & Integration */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Retail Pharmacy Counter &amp; Returns Desk" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Integration: OTC sales &amp; patient returns synchronize directly with /billing/pharmacy ledgers</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">OTC Sales Revenue</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">₹{totalOTCSalesRevenue.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Auto-accrued to revenue</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Patient Refunds</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">₹{totalPatientRefunds.toLocaleString()}</p>
          <span className="text-[10px] text-amber-600 font-medium">Routed to Billing refunds</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Processed Returns</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">{returns.length} Records</p>
          <span className="text-[10px] text-muted-foreground">Patient, Supplier, Write-Off</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Inventory Sync</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">100% Synced</p>
          <span className="text-[10px] text-primary font-medium">Single source of truth</span>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 max-w-sm">
          <TabsTrigger value="sales" className="text-xs">OTC Walk-in Sales</TabsTrigger>
          <TabsTrigger value="returns" className="text-xs">Medication Returns &amp; Write-Offs</TabsTrigger>
        </TabsList>

        {/* TAB 1: OTC SALES */}
        <TabsContent value="sales" className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Over-the-Counter Sales Ledger</CardTitle>
              <CardDescription className="text-xs">
                Non-prescription retail sales for walk-in patients and emergency over-the-counter consumables.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-bold w-[140px]">Receipt # &amp; Time</TableHead>
                      <TableHead className="text-xs font-bold w-[180px]">Customer / Patient</TableHead>
                      <TableHead className="text-xs font-bold w-[240px]">Purchased Items</TableHead>
                      <TableHead className="text-xs font-bold w-[120px]">Payment Mode</TableHead>
                      <TableHead className="text-xs font-bold w-[140px]">Pharmacist</TableHead>
                      <TableHead className="text-xs font-bold text-right w-[110px]">Total Paid</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.map((s) => (
                      <TableRow key={s.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="font-mono text-xs font-bold text-primary">{s.receiptNumber}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {formatDateTime(s.timestamp)}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="font-semibold text-xs text-foreground">{s.customerName}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{s.customerPhone}</div>
                        </TableCell>

                        <TableCell>
                          <div className="text-xs font-medium text-foreground">
                            {s.items.map((i) => `${i.medicineName} (${i.quantity}x)`).join(", ")}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {s.paymentMode}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-xs text-muted-foreground">
                          {s.dispensingPharmacist}
                        </TableCell>

                        <TableCell className="text-right font-mono text-xs font-bold text-foreground">
                          ₹{s.totalPaid}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: MEDICATION RETURNS */}
        <TabsContent value="returns" className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">3-Way Medication Returns &amp; Write-Off Audit Trail</CardTitle>
              <CardDescription className="text-xs">
                Patient returns (refunded via Billing), supplier defect returns, and expired batch scrap write-offs.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-bold w-[140px]">Return # &amp; Type</TableHead>
                      <TableHead className="text-xs font-bold w-[200px]">Medicine &amp; Batch</TableHead>
                      <TableHead className="text-xs font-bold w-[90px]">Qty</TableHead>
                      <TableHead className="text-xs font-bold w-[110px]">Refund Amount</TableHead>
                      <TableHead className="text-xs font-bold w-[240px]">Mandatory Stated Reason</TableHead>
                      <TableHead className="text-xs font-bold w-[130px]">Processed Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {returns.map((r) => (
                      <TableRow key={r.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="font-mono text-xs font-bold text-primary">{r.returnNumber}</div>
                          <Badge
                            className={
                              r.returnType === "Patient Return"
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[9px] mt-0.5"
                                : r.returnType === "Supplier Return"
                                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[9px] mt-0.5"
                                : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[9px] mt-0.5"
                            }
                          >
                            {r.returnType}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="font-semibold text-xs text-foreground">{r.medicineName}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            Batch: {r.batchNumber} {r.linkedPrescriptionId ? `• ${r.linkedPrescriptionId}` : ""}
                          </div>
                        </TableCell>

                        <TableCell className="font-mono text-xs font-bold text-foreground">
                          {r.quantity} Units
                        </TableCell>

                        <TableCell className="font-mono text-xs font-bold text-foreground">
                          {r.totalRefundAmount > 0 ? `₹${r.totalRefundAmount}` : "₹0 (Write-Off)"}
                        </TableCell>

                        <TableCell>
                          <p className="text-xs text-foreground italic leading-relaxed line-clamp-2">
                            &ldquo;{r.reason}&rdquo;
                          </p>
                          <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                            By {r.processedBy.split(" ")[0]} on {formatDateTime(r.timestamp)}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={
                              r.status === "Restocked & Refunded"
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                                : r.status === "Returned to Vendor"
                                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                                : "bg-muted text-muted-foreground text-[10px]"
                            }
                          >
                            {r.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MODAL: NEW OTC SALE */}
      <Dialog open={saleModalOpen} onOpenChange={setSaleModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateSale}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" /> Process Over-the-Counter Sale
              </DialogTitle>
              <DialogDescription className="text-xs">
                Walk-in retail checkout. Auto-deducts stock and adds to pharmacy billing ledger.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-1">
                  <Label htmlFor="s-cname">Customer Name</Label>
                  <Input
                    id="s-cname"
                    placeholder="e.g. Ramesh Kulkarni"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="s-cphone">Phone Number</Label>
                  <Input
                    id="s-cphone"
                    placeholder="+91 98000 00000"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="s-item">Medicine / Product *</Label>
                <Input
                  id="s-item"
                  required
                  value={saleItemName}
                  onChange={(e) => setSaleItemName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-1">
                  <Label htmlFor="s-qty">Quantity</Label>
                  <Input
                    id="s-qty"
                    type="number"
                    value={saleQty}
                    onChange={(e) => setSaleQty(Number(e.target.value))}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="s-uprice">Unit Price (₹)</Label>
                  <Input
                    id="s-uprice"
                    type="number"
                    step="0.1"
                    value={salePrice}
                    onChange={(e) => setSalePrice(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="s-pay">Payment Method</Label>
                <Select value={paymentMode} onValueChange={(val: any) => setPaymentMode(val)}>
                  <SelectTrigger id="s-pay" className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPI">UPI (QR Code / Instant)</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Credit/Debit Card">Credit/Debit Card POS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-2.5 rounded bg-muted/40 border border-border flex justify-between font-mono font-bold text-xs">
                <span>Total Amount Due:</span>
                <span className="text-primary">₹{(saleQty * salePrice + (saleQty * salePrice * 0.05)).toFixed(2)}</span>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setSaleModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold">
                Generate Receipt &amp; Pay
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: PROCESS RETURN / WRITE-OFF */}
      <Dialog open={returnModalOpen} onOpenChange={setReturnModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateReturn}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-destructive" /> Process Medication Return / Write-Off
              </DialogTitle>
              <DialogDescription className="text-xs">
                Adjust stock levels and generate billing refunds or audit write-off entries.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-3 text-xs">
              <div className="grid gap-1">
                <Label htmlFor="r-type">Return Classification *</Label>
                <Select value={returnType} onValueChange={(val: any) => setReturnType(val)}>
                  <SelectTrigger id="r-type" className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Patient Return">Patient Return (Triggers Billing Refund)</SelectItem>
                    <SelectItem value="Supplier Return">Supplier Return (Defective Batch)</SelectItem>
                    <SelectItem value="Expired / Damaged Write-Off">Expired / Damaged Write-Off (Incineration)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="r-med">Medicine Name *</Label>
                <Input
                  id="r-med"
                  required
                  value={retMedName}
                  onChange={(e) => setRetMedName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-1">
                  <Label htmlFor="r-batch">Batch #</Label>
                  <Input
                    id="r-batch"
                    required
                    value={retBatch}
                    onChange={(e) => setRetBatch(e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="r-qty">Quantity</Label>
                  <Input
                    id="r-qty"
                    type="number"
                    value={retQty}
                    onChange={(e) => setRetQty(Number(e.target.value))}
                  />
                </div>
              </div>

              {returnType === "Patient Return" && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-1">
                    <Label htmlFor="r-rx">Linked Rx #</Label>
                    <Input
                      id="r-rx"
                      value={retLinkedRx}
                      onChange={(e) => setRetLinkedRx(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="r-urefund">Unit Refund (₹)</Label>
                    <Input
                      id="r-urefund"
                      type="number"
                      value={retUnitRefund}
                      onChange={(e) => setRetUnitRefund(Number(e.target.value))}
                    />
                  </div>
                </div>
              )}

              <div className="grid gap-1">
                <Label htmlFor="r-reason">Mandatory Audit Stated Reason *</Label>
                <Textarea
                  id="r-reason"
                  required
                  rows={2}
                  value={retReason}
                  onChange={(e) => setRetReason(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setReturnModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="destructive" className="font-semibold">
                Confirm Return &amp; Adjust Stock
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
