"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Eye,
  FileSpreadsheet,
  FileText,
  FlaskConical,
  IndianRupee,
  MoreHorizontal,
  Plus,
  Receipt,
  Scan,
  Search,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { BillingNav } from "@/hospital-admin/components/billing/billing-nav";
import { invoices as initialInvoices } from "@/hospital-admin/lib/mock-data/invoices";
import { Invoice } from "@/hospital-admin/lib/types";
import { formatCurrency, formatDate } from "@/hospital-admin/lib/utils";

export default function LabBillingPage() {
  const [mounted, setMounted] = useState(false);
  const [invoicesList, setInvoicesList] = useState<Invoice[]>(initialInvoices);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter invoices for Diagnostics / Lab test line items (Rule F11-CANNOT-7)
  const labInvoices = useMemo(() => {
    return invoicesList.filter(
      (i) =>
        (i.serviceCategory === "Diagnostics" ||
          i.service.toLowerCase().includes("panel") ||
          i.service.toLowerCase().includes("scan") ||
          i.service.toLowerCase().includes("ultrasound") ||
          i.service.toLowerCase().includes("mri") ||
          i.department === "Laboratory" ||
          i.department === "Radiology") &&
        (i.patientName.toLowerCase().includes(search.toLowerCase()) ||
          i.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
          i.service.toLowerCase().includes(search.toLowerCase()))
    );
  }, [invoicesList, search]);

  const totalLabRevenue = labInvoices.reduce((sum, i) => sum + i.paid, 0);
  const pendingLabRevenue = labInvoices.reduce((sum, i) => sum + i.outstanding, 0);

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Diagnostics &amp; Lab Billing"
          description="Pathology test panels, imaging investigation line items, and diagnostic center settlements."
          crumbs={[{ label: "Finance" }, { label: "Billing", href: "/hospital-admin/billing" }, { label: "Lab Billing" }]}
        />
        <BillingNav />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading lab billing...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Diagnostics &amp; Lab Billing"
        description="Pathology test panels, imaging investigation line items, and diagnostic center settlements."
        crumbs={[{ label: "Finance" }, { label: "Billing", href: "/hospital-admin/billing" }, { label: "Lab Billing" }]}
      />

      <BillingNav />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Diagnostics Revenue</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{formatCurrency(totalLabRevenue)}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Pathology &amp; Radiology billed</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Pending Diagnostic Invoices</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{formatCurrency(pendingLabRevenue)}</p>
          <span className="text-[10px] text-amber-600 font-medium">Awaiting sample validation/payment</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Diagnostics Order Link</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">Active</p>
          <span className="text-[10px] text-primary font-medium">Synced with Central Diagnostics</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Average Diagnostic Ticket</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">₹2,800</p>
          <span className="text-[10px] text-cyan-600 font-medium">Per investigation panel</span>
        </Card>
      </div>

      {/* Lab Invoices Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Diagnostics &amp; Lab Invoices Ledger</CardTitle>
          <CardDescription className="text-xs">
            Showing diagnostic investigation charges, blood test panels, and radiology imaging bills.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patient, test name, or invoice #..."
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
                  <TableHead className="text-xs font-bold">Diagnostic Investigation / Panel</TableHead>
                  <TableHead className="text-xs font-bold">Department</TableHead>
                  <TableHead className="text-xs font-bold">Billed Amount</TableHead>
                  <TableHead className="text-xs font-bold">Payment Mode</TableHead>
                  <TableHead className="text-xs font-bold">Status</TableHead>
                  <TableHead className="text-xs font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {labInvoices.map((inv) => (
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
                    <TableCell className="text-xs font-medium max-w-[240px] truncate">{inv.service}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {inv.department || "Laboratory"}
                      </Badge>
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
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                        }
                      >
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" asChild className="h-7 text-xs">
                        <Link href={`/hospital-admin/billing/${inv.id}`}>
                          <Eye className="h-3.5 w-3.5 mr-1" /> View Invoice
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
    </div>
  );
}
