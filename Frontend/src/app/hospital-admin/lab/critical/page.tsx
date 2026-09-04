"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  AlertOctagon,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Filter,
  PhoneCall,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { LabNav } from "@/hospital-admin/components/lab/lab-nav";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { mockExtendedLabOrders } from "@/hospital-admin/lib/mock-data/lab-extended-operations";
import { LabOrder } from "@/hospital-admin/lib/types";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Critical Alert Notification workflow";

export default function CriticalReportsLogPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [orders, setOrders] = useState<LabOrder[]>(mockExtendedLabOrders);
  const [search, setSearch] = useState("");
  const [ackModalOpen, setAckModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
  const [clinicianName, setClinicianName] = useState("Dr. Ananya Patel (Attending Physician)");
  const [contactMode, setContactMode] = useState("Phone Call (Spoke Directly)");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Persistent log of all orders with critical = true
  const criticalOrders = useMemo(() => {
    return orders
      .filter((o) => o.critical)
      .filter((o) => {
        const matchesSearch =
          o.orderNo.toLowerCase().includes(search.toLowerCase()) ||
          o.patientName.toLowerCase().includes(search.toLowerCase()) ||
          (o.uhid && o.uhid.toLowerCase().includes(search.toLowerCase())) ||
          o.test.toLowerCase().includes(search.toLowerCase()) ||
          o.orderingDoctor.toLowerCase().includes(search.toLowerCase());
        return matchesSearch;
      });
  }, [orders, search]);

  const handleOpenAck = (order: LabOrder) => {
    setSelectedOrder(order);
    setClinicianName(order.orderingDoctor || "Attending Clinician");
    setAckModalOpen(true);
  };

  const handleConfirmAck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const timestamp = new Date().toISOString();

    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrder.id
          ? {
              ...o,
              clinicianNotified: true,
              acknowledgedBy: clinicianName,
              acknowledgedAt: timestamp,
            }
          : o
      )
    );

    toast({
      title: "Critical Panic Value Acknowledged & Logged",
      description: `Notification confirmed with ${clinicianName} via ${contactMode}. Audit trail updated. (${DELEGATION_STRING})`,
    });
    setAckModalOpen(false);
    setSelectedOrder(null);
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Critical Reports Log &amp; Panic Alert Center"
          description="Persistent audit register of life-threatening panic values, clinician escalation logs, and verification timestamps."
          crumbs={[{ label: "Clinical Operations" }, { label: "Laboratory" }, { label: "Critical Reports" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading critical panic reports log...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Critical Reports Log &amp; Panic Alert Center"
        description="Persistent audit register of life-threatening panic values, clinician escalation logs, and verification timestamps."
        crumbs={[{ label: "Clinical Operations" }, { label: "Laboratory" }, { label: "Critical Reports" }]}
      />

      <LabNav />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Hospital-Wide Panic Alert Console" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-destructive" />
          <span>Critical Finding Protocol: Critical values permanently archived with mandatory clinician notification tracking</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Panic Alerts</span>
          <p className="text-xl font-bold font-mono text-destructive mt-0.5">{criticalOrders.length} Incidents</p>
          <span className="text-[10px] text-muted-foreground">Past 24 hours</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Clinician Acknowledged</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
            {criticalOrders.filter((o) => o.clinicianNotified).length} Confirmed
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Spoke with attending physician</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Pending Clinician Contact</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">
            {criticalOrders.filter((o) => !o.clinicianNotified).length} Unconfirmed
          </p>
          <span className="text-[10px] text-rose-600 font-medium">Immediate call required</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Average Escalation Time</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">&lt; 4.2 Mins</p>
          <span className="text-[10px] text-cyan-600 font-medium">Exceeds CAP standard (15m)</span>
        </Card>
      </div>

      {/* Critical Log Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Panic-Value Audit Trail &amp; Verification Register</CardTitle>
          <CardDescription className="text-xs">
            Persistent log of every abnormal result exceeding defined physiological panic thresholds.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patient, order, finding..."
                className="pl-8 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold w-[120px]">Order #</TableHead>
                  <TableHead className="text-xs font-bold w-[220px]">Patient Details &amp; Location</TableHead>
                  <TableHead className="text-xs font-bold w-[200px]">Investigation / Test</TableHead>
                  <TableHead className="text-xs font-bold min-w-[260px] max-w-[340px]">Critical Panic Finding</TableHead>
                  <TableHead className="text-xs font-bold w-[180px]">Ordering Physician</TableHead>
                  <TableHead className="text-xs font-bold w-[160px]">Notification Status</TableHead>
                  <TableHead className="text-xs font-bold text-right w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {criticalOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-destructive">
                      {order.orderNo}
                    </TableCell>
                    <TableCell className="max-w-[220px]">
                      <div className="font-semibold text-xs text-foreground truncate">{order.patientName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono truncate">
                        {order.uhid} • <span className="text-destructive font-sans font-semibold">{order.patientLocation}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="text-xs font-medium text-foreground truncate">{order.test}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{order.department}</div>
                    </TableCell>
                    <TableCell className="min-w-[260px] max-w-[340px]">
                      <div className="text-xs font-bold text-destructive break-words whitespace-normal leading-relaxed">
                        {order.criticalDetails || "Life-threatening abnormal value"}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-medium max-w-[180px]">
                      <span className="truncate block">{order.orderingDoctor}</span>
                    </TableCell>
                    <TableCell>
                      {order.clinicianNotified ? (
                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] flex items-center gap-1 w-fit">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" /> Confirmed
                        </Badge>
                      ) : (
                        <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px] animate-pulse">
                          Pending Contact
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {!order.clinicianNotified ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 text-xs font-semibold"
                          onClick={() => handleOpenAck(order)}
                        >
                          <PhoneCall className="h-3 w-3 mr-1" /> Log Clinician Contact
                        </Button>
                      ) : (
                        <span className="text-[10px] text-emerald-600 font-medium">Logged &amp; Audited</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Log Clinician Contact Modal */}
      <Dialog open={ackModalOpen} onOpenChange={setAckModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleConfirmAck}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-destructive">
                <PhoneCall className="h-5 w-5 text-destructive" /> Record Clinician Notification
              </DialogTitle>
              <DialogDescription className="text-xs">
                Log direct communication for <strong>{selectedOrder?.patientName}</strong> ({selectedOrder?.test}).
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-3 text-xs">
              <div className="p-3 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-[11px] font-medium">
                {selectedOrder?.criticalDetails}
              </div>

              <div className="grid gap-1">
                <Label htmlFor="ack-doc">Spoke With Clinician / Resident *</Label>
                <Input
                  id="ack-doc"
                  required
                  value={clinicianName}
                  onChange={(e) => setClinicianName(e.target.value)}
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="ack-mode">Communication Channel *</Label>
                <Input
                  id="ack-mode"
                  required
                  value={contactMode}
                  onChange={(e) => setContactMode(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setAckModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" size="sm">
                Confirm &amp; Audit Log
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
