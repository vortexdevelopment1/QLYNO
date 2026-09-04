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
  Layers,
  MoreHorizontal,
  Package,
  Plus,
  Receipt,
  Scissors,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
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

export default function ProcedureBillingPage() {
  const [mounted, setMounted] = useState(false);
  const [invoicesList, setInvoicesList] = useState<Invoice[]>(initialInvoices);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter invoices for Surgery / Procedure service category (Rule F11-CANNOT-7 & F11-CANNOT-8)
  const procedureInvoices = useMemo(() => {
    return invoicesList.filter(
      (i) =>
        (i.serviceCategory === "Surgery" || i.service.toLowerCase().includes("replacement") || i.service.toLowerCase().includes("surgery") || i.service.toLowerCase().includes("procedure")) &&
        (i.patientName.toLowerCase().includes(search.toLowerCase()) ||
          i.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
          i.service.toLowerCase().includes(search.toLowerCase()))
    );
  }, [invoicesList, search]);

  const totalProcedureRevenue = procedureInvoices.reduce((sum, i) => sum + i.paid, 0);
  const pendingProcedureRevenue = procedureInvoices.reduce((sum, i) => sum + i.outstanding, 0);
  const avgTicket = procedureInvoices.length > 0 ? Math.round(totalProcedureRevenue / procedureInvoices.length) : 0;

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Procedure &amp; OT Surgery Billing"
          description="Operating theatre packages, surgeon clinical fees, and auto-pulled procurement implant line items."
          crumbs={[{ label: "Finance" }, { label: "Billing", href: "/hospital-admin/billing" }, { label: "Procedure Billing" }]}
        />
        <BillingNav />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading procedure billing...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Procedure &amp; OT Surgery Billing"
        description="Operating theatre packages, surgeon clinical fees, and auto-pulled procurement implant line items."
        crumbs={[{ label: "Finance" }, { label: "Billing", href: "/hospital-admin/billing" }, { label: "Procedure Billing" }]}
      />

      <BillingNav />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Procedure Revenue</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{formatCurrency(totalProcedureRevenue)}</p>
          <span className="text-[10px] text-emerald-600 font-medium">OT &amp; Daycare surgeries</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Pending Package Settlements</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{formatCurrency(pendingProcedureRevenue)}</p>
          <span className="text-[10px] text-amber-600 font-medium">Awaiting TPA / Patient clearance</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Average Procedure Ticket</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{formatCurrency(avgTicket)}</p>
          <span className="text-[10px] text-primary font-medium">Per surgical case</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Procurement Auto-Pull</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">Synced</p>
          <span className="text-[10px] text-cyan-600 font-medium">Implants linked to Surgical Cases</span>
        </Card>
      </div>

      {/* Procurement Auto-Pull Highlight Banner */}
      <Card className="border-cyan-500/30 bg-cyan-500/5 shadow-xs">
        <CardContent className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-cyan-600 shrink-0" />
            <div>
              <div className="text-xs font-bold text-foreground flex items-center gap-2">
                OT Surgical Procurement Integration Active
                <Badge className="bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 text-[10px]">
                  OT &amp; Procurement Sync
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Approved implants (e.g. Titanium Femoral Stem from PR-1002 for Case CASE-409) automatically flow into patient invoices as verified line items without re-typing.
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" asChild className="text-xs font-semibold shrink-0">
            <Link href="/hospital-admin/procurement">View Procurement Orders</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Procedure Invoices Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Surgical &amp; Procedure Invoices Ledger</CardTitle>
          <CardDescription className="text-xs">
            Invoices containing operating theatre suite fees, surgeon honorariums, and biomedical implants.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search procedure, case #, or patient..."
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
                  <TableHead className="text-xs font-bold">Procedure Package</TableHead>
                  <TableHead className="text-xs font-bold">Linked Surgical Case</TableHead>
                  <TableHead className="text-xs font-bold">Implant Pull-Through</TableHead>
                  <TableHead className="text-xs font-bold">Total Billed</TableHead>
                  <TableHead className="text-xs font-bold">Status</TableHead>
                  <TableHead className="text-xs font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {procedureInvoices.map((inv) => (
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
                    <TableCell className="text-xs font-medium max-w-[200px] truncate">{inv.service}</TableCell>
                    <TableCell>
                      {inv.linkedCaseId ? (
                        <Badge variant="outline" className="text-[10px] font-mono text-primary">
                          {inv.linkedCaseId}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {inv.linkedProcurementItemIds && inv.linkedProcurementItemIds.length > 0 ? (
                        <Badge className="bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 text-[10px]">
                          {inv.linkedProcurementItemIds.join(", ")} (Auto-Pulled)
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Standard Consumables</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-foreground">
                      {formatCurrency(inv.amount)}
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
                          <Eye className="h-3.5 w-3.5 mr-1" /> View Line Items
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
