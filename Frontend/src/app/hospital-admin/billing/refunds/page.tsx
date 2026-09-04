"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  IndianRupee,
  MoreHorizontal,
  Plus,
  Receipt,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  XCircle,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { BillingNav } from "@/hospital-admin/components/billing/billing-nav";
import { refundRequestsQueue as initialRefunds } from "@/hospital-admin/lib/mock-data/invoices";
import { RefundRecord } from "@/hospital-admin/lib/types";
import { formatCurrency, formatDate } from "@/hospital-admin/lib/utils";
import { useToast } from "@/hospital-admin/hooks/use-toast";

export default function RefundsQueuePage() {
  const [mounted, setMounted] = useState(false);
  const [refunds, setRefunds] = useState<RefundRecord[]>(initialRefunds);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reasonFilter, setReasonFilter] = useState("all");

  // Approval Dialog State
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<RefundRecord | null>(null);
  const [supervisorNotes, setSupervisorNotes] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredRefunds = useMemo(() => {
    return refunds.filter((r) => {
      const matchesSearch =
        r.patientName.toLowerCase().includes(search.toLowerCase()) ||
        r.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
        r.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      const matchesReason = reasonFilter === "all" || r.reasonCategory === reasonFilter;
      return matchesSearch && matchesStatus && matchesReason;
    });
  }, [refunds, search, statusFilter, reasonFilter]);

  const totalProcessed = refunds.filter((r) => r.status === "Processed").reduce((sum, r) => sum + r.amount, 0);
  const pendingApprovalAmount = refunds.filter((r) => r.status === "Requested").reduce((sum, r) => sum + r.amount, 0);

  const handleOpenApprove = (refund: RefundRecord) => {
    setSelectedRefund(refund);
    setSupervisorNotes("Authorized after clinical verification and superintendent sign-off.");
    setApprovalModalOpen(true);
  };

  const handleApproveRefund = () => {
    if (!selectedRefund) return;

    setRefunds((prev) =>
      prev.map((r) =>
        r.id === selectedRefund.id
          ? {
              ...r,
              status: "Approved",
              approvedBy: "Hospital Admin (Supervisor Authorized)",
            }
          : r
      )
    );

    toast({
      title: "Refund Request Approved",
      description: `Refund ${selectedRefund.id} (₹${selectedRefund.amount.toLocaleString("en-IN")}) approved for disbursement.`,
    });
    setApprovalModalOpen(false);
  };

  const handleRejectRefund = (refundId: string) => {
    setRefunds((prev) =>
      prev.map((r) => (r.id === refundId ? { ...r, status: "Rejected" } : r))
    );
    toast({
      title: "Refund Request Rejected",
      description: "Dispute marked as invalid or service non-refundable.",
      variant: "destructive",
    });
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Hospital-Wide Refunds Queue &amp; Approvals"
          description="Central ledger of clinical cancellations, billing dispute refunds, and supervisor authorization queues."
          crumbs={[{ label: "Finance" }, { label: "Billing", href: "/hospital-admin/billing" }, { label: "Refunds" }]}
        />
        <BillingNav />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading refunds queue...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Hospital-Wide Refunds Queue &amp; Approvals"
        description="Central ledger of clinical cancellations, billing dispute refunds, and supervisor authorization queues."
        crumbs={[{ label: "Finance" }, { label: "Billing", href: "/hospital-admin/billing" }, { label: "Refunds" }]}
      />

      <BillingNav />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Refunded (Settled)</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">{formatCurrency(totalProcessed)}</p>
          <span className="text-[10px] text-rose-600 font-medium">Credited back to patients</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Pending Supervisor Sign-Off</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{formatCurrency(pendingApprovalAmount)}</p>
          <span className="text-[10px] text-amber-600 font-medium">Exceeds cashier refund limits</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Audit Governance</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">100% Verified</p>
          <span className="text-[10px] text-primary font-medium">Mandatory justifications logged</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Refund Requests</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">{refunds.length} Requests</p>
          <span className="text-[10px] text-cyan-600 font-medium">Hospital-wide queue</span>
        </Card>
      </div>

      {/* Refunds Queue Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Refund Requests &amp; Disbursements Ledger</CardTitle>
          <CardDescription className="text-xs">
            Review refund justifications, issuing cashier details, and authorize above-limit transactions.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patient, invoice #, or refund ID..."
                className="pl-8 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] text-xs h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Requested">Requested</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Processed">Processed</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={reasonFilter} onValueChange={setReasonFilter}>
                <SelectTrigger className="w-[170px] text-xs h-9">
                  <SelectValue placeholder="Reason Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reasons</SelectItem>
                  <SelectItem value="Clinical Cancellation">Clinical Cancellation</SelectItem>
                  <SelectItem value="Duplicate Payment">Duplicate Payment</SelectItem>
                  <SelectItem value="Billing Dispute">Billing Dispute</SelectItem>
                  <SelectItem value="Service Dissatisfaction">Service Dissatisfaction</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Refund ID &amp; Time</TableHead>
                  <TableHead className="text-xs font-bold">Linked Invoice</TableHead>
                  <TableHead className="text-xs font-bold">Patient Details</TableHead>
                  <TableHead className="text-xs font-bold">Mandatory Justification Reason</TableHead>
                  <TableHead className="text-xs font-bold">Amount</TableHead>
                  <TableHead className="text-xs font-bold">Requested By</TableHead>
                  <TableHead className="text-xs font-bold">Status</TableHead>
                  <TableHead className="text-xs font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRefunds.map((refund) => (
                  <TableRow key={refund.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="text-xs font-mono font-bold text-foreground">{refund.id}</div>
                      <div className="text-[10px] text-muted-foreground">{formatDate(refund.timestamp)}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-primary">
                      <Link href={`/hospital-admin/billing/${refund.invoiceId}`} className="hover:underline">
                        {refund.invoiceNo}
                      </Link>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-foreground">{refund.patientName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[280px]">
                      <div className="font-medium text-foreground">{refund.reasonCategory}</div>
                      <div className="text-[11px] truncate">{refund.reason}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-rose-600">
                      {formatCurrency(refund.amount)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{refund.requestedBy}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          refund.status === "Processed"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                            : refund.status === "Approved"
                            ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 text-[10px]"
                            : refund.status === "Requested"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                            : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px]"
                        }
                      >
                        {refund.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {refund.status === "Requested" ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/10"
                            onClick={() => handleOpenApprove(refund)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs font-semibold text-rose-600 hover:bg-rose-500/10"
                            onClick={() => handleRejectRefund(refund.id)}
                          >
                            Reject
                          </Button>
                        </>
                      ) : (
                        <span className="text-[11px] text-muted-foreground font-mono">{refund.approvedBy || "Settled"}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Supervisor Refund Approval Modal (Rule F11-CANNOT-3) */}
      <Dialog open={approvalModalOpen} onOpenChange={setApprovalModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> Authorize High-Value Refund
            </DialogTitle>
            <DialogDescription className="text-xs">
              Review and approve refund request of {formatCurrency(selectedRefund?.amount || 0)} for {selectedRefund?.patientName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3 text-xs">
            <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Original Invoice:</span>
                <span className="font-mono font-bold text-primary">{selectedRefund?.invoiceNo}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Refund Reason:</span>
                <span className="font-medium text-foreground">{selectedRefund?.reason}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Disbursement Mode:</span>
                <span className="font-mono font-semibold">{selectedRefund?.paymentMode}</span>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="sup-notes">Supervisor Audit Justification Notes</Label>
              <Input
                id="sup-notes"
                value={supervisorNotes}
                onChange={(e) => setSupervisorNotes(e.target.value)}
                placeholder="e.g. Authorized after medical superintendent review"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => setApprovalModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleApproveRefund}>
              Sign-Off &amp; Authorize Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
