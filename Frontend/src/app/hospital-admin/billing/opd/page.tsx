"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  IndianRupee,
  MoreHorizontal,
  Plus,
  Receipt,
  Search,
  Stethoscope,
  User,
  Users,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/hospital-admin/components/ui/dropdown-menu";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { BillingNav } from "@/hospital-admin/components/billing/billing-nav";
import { invoices as initialInvoices } from "@/hospital-admin/lib/mock-data/invoices";
import { Invoice } from "@/hospital-admin/lib/types";
import { formatCurrency, formatDate } from "@/hospital-admin/lib/utils";
import { useToast } from "@/hospital-admin/hooks/use-toast";

export default function OPDBillingPage() {
  const [mounted, setMounted] = useState(false);
  const [invoicesList, setInvoicesList] = useState<Invoice[]>(initialInvoices);
  const [search, setSearch] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form State
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [service, setService] = useState("General Medicine Specialist Consultation");
  const [doctorName, setDoctorName] = useState("Dr. Ananya Patel");
  const [amount, setAmount] = useState(1200);
  const [method, setMethod] = useState<"Cash" | "Card" | "UPI" | "Insurance" | "Online">("UPI");

  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter invoices for OPD / Daycare encounter types (Rule F11-CANNOT-7: single underlying store)
  const opdInvoices = useMemo(() => {
    return invoicesList.filter(
      (i) =>
        (i.encounterType === "OPD" || i.encounterType === "Daycare" || !i.encounterType) &&
        (i.patientName.toLowerCase().includes(search.toLowerCase()) ||
          i.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
          i.service.toLowerCase().includes(search.toLowerCase()))
    );
  }, [invoicesList, search]);

  const opdCollections = opdInvoices.reduce((sum, i) => sum + i.paid, 0);
  const opdPending = opdInvoices.reduce((sum, i) => sum + i.outstanding, 0);
  const opdPaidCount = opdInvoices.filter((i) => i.status === "paid").length;

  const handleCreateOPDInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const newInv: Invoice = {
      id: `inv_opd_${Date.now().toString().slice(-4)}`,
      invoiceNo: `INV-2026-OPD-${Date.now().toString().slice(-4)}`,
      patientName,
      patientId: patientId || `P-${Math.floor(1000 + Math.random() * 9000)}`,
      service,
      encounterType: "OPD",
      serviceCategory: "Consultation",
      department: "Outpatient Department",
      doctorName,
      amount,
      paid: amount,
      outstanding: 0,
      status: "paid",
      issuedOn: new Date().toISOString().split("T")[0],
      method,
      lineItems: [
        {
          id: `li-${Date.now()}`,
          name: service,
          category: "Consultation",
          sacCode: "999311",
          quantity: 1,
          unitPrice: amount,
          taxRate: 0,
          total: amount,
        },
      ],
    };

    setInvoicesList((prev) => [newInv, ...prev]);
    toast({
      title: "OPD Invoice Generated",
      description: `Invoice ${newInv.invoiceNo} generated for ${patientName}. Receipt settled.`,
    });
    setCreateModalOpen(false);
    setPatientName("");
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="OPD &amp; Daycare Billing"
          description="Outpatient consultations, investigation tokens, day-care procedures, and quick cashier receipts."
          crumbs={[{ label: "Finance" }, { label: "Billing", href: "/hospital-admin/billing" }, { label: "OPD Billing" }]}
        />
        <BillingNav />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading OPD billing...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="OPD &amp; Daycare Billing"
        description="Outpatient consultations, investigation tokens, day-care procedures, and quick cashier receipts."
        crumbs={[{ label: "Finance" }, { label: "Billing", href: "/hospital-admin/billing" }, { label: "OPD Billing" }]}
        actions={
          <Button size="sm" className="gap-1.5 font-semibold text-xs" onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4" /> Quick OPD Invoice
          </Button>
        }
      />

      <BillingNav />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Today&apos;s OPD Collections</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{formatCurrency(opdCollections)}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Counter 1 &amp; POS Receipts</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Pending OPD Invoices</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{formatCurrency(opdPending)}</p>
          <span className="text-[10px] text-amber-600 font-medium">Awaiting Token Clearance</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">OPD Settlement Rate</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">
            {opdInvoices.length > 0 ? Math.round((opdPaidCount / opdInvoices.length) * 100) : 100}%
          </p>
          <span className="text-[10px] text-primary font-medium">{opdPaidCount} Settled Consultations</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Auto-Sync Integration</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">Active</p>
          <span className="text-[10px] text-cyan-600 font-medium">Linked to OPD Queue Module</span>
        </Card>
      </div>

      {/* OPD Invoices List */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Outpatient Invoices &amp; Receipts Ledger</CardTitle>
          <CardDescription className="text-xs">
            Showing all consultation bills and day-care procedure packages.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patient, invoice #, or service..."
                className="pl-8 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Invoice #</TableHead>
                  <TableHead className="text-xs font-bold">Patient Details</TableHead>
                  <TableHead className="text-xs font-bold">Consultation / Service</TableHead>
                  <TableHead className="text-xs font-bold">Doctor</TableHead>
                  <TableHead className="text-xs font-bold">Billed Amount</TableHead>
                  <TableHead className="text-xs font-bold">Payment Mode</TableHead>
                  <TableHead className="text-xs font-bold">Status</TableHead>
                  <TableHead className="text-xs font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {opdInvoices.map((inv) => (
                  <TableRow key={inv.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-foreground">
                      <Link href={`/hospital-admin/billing/${inv.id}`} className="hover:underline hover:text-primary">
                        {inv.invoiceNo}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground">{inv.patientName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{inv.patientId}</div>
                    </TableCell>
                    <TableCell className="text-xs font-medium">{inv.service}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {inv.doctorName || "Dr. Ananya Patel"}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-foreground">
                      {formatCurrency(inv.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px]">
                        {inv.method || "Cash"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          inv.status === "paid"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                            : inv.status === "partially-paid"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                            : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px]"
                        }
                      >
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" asChild className="h-7 text-xs">
                        <Link href={`/hospital-admin/billing/${inv.id}`}>
                          <Eye className="h-3.5 w-3.5 mr-1" /> View Tax Invoice
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Quick OPD Invoice Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateOPDInvoice}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" /> Create Quick OPD Invoice
              </DialogTitle>
              <DialogDescription className="text-xs">
                Generate and settle an outpatient consultation or daycare package voucher.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-3 text-xs">
              <div className="grid gap-1">
                <Label htmlFor="opd-pat">Patient Full Name</Label>
                <Input
                  id="opd-pat"
                  required
                  placeholder="e.g. Ramesh Deshmukh"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="opd-service">Clinical Service / Package</Label>
                <Select value={service} onValueChange={setService}>
                  <SelectTrigger id="opd-service" className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General Medicine Specialist Consultation">General Medicine Consultation (₹1,000)</SelectItem>
                    <SelectItem value="Senior Cardiology Comprehensive Consultation">Cardiology Comprehensive Consultation (₹1,500)</SelectItem>
                    <SelectItem value="Pediatric Wellness & Vaccination Review">Pediatric Wellness Review (₹800)</SelectItem>
                    <SelectItem value="Orthopedic Knee & Spine Clinical Assessment">Orthopedic Specialist Assessment (₹1,200)</SelectItem>
                    <SelectItem value="Daycare Chemotherapy Session Package">Daycare Chemotherapy Session Package (₹12,000)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="opd-amt">Billed Amount (₹)</Label>
                  <Input
                    id="opd-amt"
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="opd-mode">Payment Mode</Label>
                  <Select value={method} onValueChange={(val: any) => setMethod(val)}>
                    <SelectTrigger id="opd-mode" className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UPI">UPI / QR Code</SelectItem>
                      <SelectItem value="Card">Credit / Debit Card</SelectItem>
                      <SelectItem value="Cash">Cash Drawer</SelectItem>
                      <SelectItem value="Insurance">TPA Insurance Pre-Auth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Generate &amp; Print Receipt
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
