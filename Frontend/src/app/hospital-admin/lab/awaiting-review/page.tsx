"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  AlertOctagon,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  FlaskConical,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
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
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { LabNav } from "@/hospital-admin/components/lab/lab-nav";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { mockExtendedLabOrders } from "@/hospital-admin/lib/mock-data/lab-extended-operations";
import { LabOrder } from "@/hospital-admin/lib/types";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Pathology Review workflow";

export default function ReportsAwaitingReviewPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [orders, setOrders] = useState<LabOrder[]>(mockExtendedLabOrders);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pathologistName, setPathologistName] = useState("Dr. Sunita Kulkarni (Senior Consultant Pathologist)");
  const [clinicalNotes, setClinicalNotes] = useState("Results verified and clinically correlated with baseline history.");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filtered view of LabOrder.status = 'awaiting-validation', sorted by longest-waiting first
  const awaitingOrders = useMemo(() => {
    return orders
      .filter((o) => o.status === "awaiting-validation")
      .filter((o) => {
        const matchesSearch =
          o.orderNo.toLowerCase().includes(search.toLowerCase()) ||
          o.patientName.toLowerCase().includes(search.toLowerCase()) ||
          (o.uhid && o.uhid.toLowerCase().includes(search.toLowerCase())) ||
          o.test.toLowerCase().includes(search.toLowerCase());
        return matchesSearch;
      })
      .sort((a, b) => new Date(a.orderedOn).getTime() - new Date(b.orderedOn).getTime());
  }, [orders, search]);

  const handleOpenAuth = (order: LabOrder) => {
    setSelectedOrder(order);
    setAuthModalOpen(true);
  };

  const handleAuthorizeReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    // Rule F13-CANNOT-1: Pathologist review gate transitions to Released
    const timestamp = new Date().toISOString();

    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrder.id
          ? {
              ...o,
              status: "released",
              verifiedBy: pathologistName,
              verifiedAt: timestamp,
            }
          : o
      )
    );

    toast({
      title: "Diagnostic Report Authorized & Released",
      description: `${selectedOrder.orderNo} signed off by ${pathologistName}. Published to EMR and auto-accrued in Lab Billing. (${DELEGATION_STRING})`,
    });
    setAuthModalOpen(false);
    setSelectedOrder(null);
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Reports Awaiting Pathologist Review"
          description="Pathologist clinical validation worklist, longest-waiting triage, panic-value review, and sign-off authorization."
          crumbs={[{ label: "Clinical Operations" }, { label: "Laboratory" }, { label: "Awaiting Review" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading pathologist worklist...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Reports Awaiting Pathologist Review"
        description="Pathologist clinical validation worklist, longest-waiting triage, panic-value review, and sign-off authorization."
        crumbs={[{ label: "Clinical Operations" }, { label: "Laboratory" }, { label: "Awaiting Review" }]}
      />

      <LabNav />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Pathologist Clinical Validation Desk" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
          <span>Pathologist Authorization Gate: Diagnostic reports cannot publish to chart without licensed Pathologist sign-off</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Pending Pathologist Review</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{awaitingOrders.length} Reports</p>
          <span className="text-[10px] text-amber-600 font-medium">Sorted by longest waiting</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Critical / Panic Reports</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">
            {awaitingOrders.filter((o) => o.critical).length} Panic Values
          </p>
          <span className="text-[10px] text-rose-600 font-medium">Emergency clinician alert</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Oldest In Queue</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">35 Mins</p>
          <span className="text-[10px] text-muted-foreground">Well within 1-hour SLA</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Sign-Off Status</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">Active</p>
          <span className="text-[10px] text-emerald-600 font-medium">Digital Signature Ready</span>
        </Card>
      </div>

      {/* Awaiting Review Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Pathologist Worklist (Longest-Waiting First)</CardTitle>
          <CardDescription className="text-xs">
            Review component values, verify reference ranges, and countersign reports for automated EMR publishing.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patient, order #, test..."
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
                  <TableHead className="text-xs font-bold">Order #</TableHead>
                  <TableHead className="text-xs font-bold">Patient Details &amp; Location</TableHead>
                  <TableHead className="text-xs font-bold">Investigation / Test</TableHead>
                  <TableHead className="text-xs font-bold">Ordering Physician</TableHead>
                  <TableHead className="text-xs font-bold">Processed On</TableHead>
                  <TableHead className="text-xs font-bold">Findings / Alert</TableHead>
                  <TableHead className="text-xs font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {awaitingOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {order.orderNo}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                        {order.patientName}
                        {order.critical && (
                          <Badge variant="destructive" className="text-[9px] px-1 py-0 h-4">
                            Panic Value
                          </Badge>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {order.uhid} • <span className="text-primary font-sans">{order.patientLocation}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-medium text-foreground">{order.test}</div>
                      <div className="text-[10px] text-muted-foreground">{order.department}</div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-medium">
                      {order.orderingDoctor}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {order.assignedAnalyzer}
                    </TableCell>
                    <TableCell>
                      {order.critical ? (
                        <div className="text-xs font-semibold text-destructive max-w-[240px] truncate">
                          {order.criticalDetails}
                        </div>
                      ) : (
                        <span className="text-xs text-emerald-600 font-medium">Within Normal Clinical Limits</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        size="sm"
                        className="h-7 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleOpenAuth(order)}
                      >
                        <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Authorize &amp; Release
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Authorize & Release Modal */}
      <Dialog open={authModalOpen} onOpenChange={setAuthModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleAuthorizeReport}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-emerald-600">
                <ShieldCheck className="h-5 w-5 text-emerald-600" /> Sign-Off &amp; Authorize Diagnostic Report
              </DialogTitle>
              <DialogDescription className="text-xs">
                Certify clinical validation for {selectedOrder?.orderNo} ({selectedOrder?.test}).
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-3 text-xs">
              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Patient:</span>
                  <span className="font-semibold text-foreground">{selectedOrder?.patientName} ({selectedOrder?.uhid})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Ordering Doctor:</span>
                  <span className="font-medium text-foreground">{selectedOrder?.orderingDoctor}</span>
                </div>
              </div>

              {selectedOrder?.critical && (
                <div className="p-2.5 rounded-md border border-destructive/40 bg-destructive/10 text-destructive text-[11px] font-medium">
                  {selectedOrder.criticalDetails}
                </div>
              )}

              <div className="grid gap-1">
                <Label htmlFor="p-name">Authorizing Pathologist *</Label>
                <Select value={pathologistName} onValueChange={setPathologistName}>
                  <SelectTrigger id="p-name" className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr. Sunita Kulkarni (Senior Consultant Pathologist)">Dr. Sunita Kulkarni (Senior Consultant Pathologist)</SelectItem>
                    <SelectItem value="Dr. Arvind Rao (Consultant Biochemist)">Dr. Arvind Rao (Consultant Biochemist)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="p-notes">Pathologist Clinical Comments / Interpretation</Label>
                <Input
                  id="p-notes"
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setAuthModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Release Report &amp; Sync EMR
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
