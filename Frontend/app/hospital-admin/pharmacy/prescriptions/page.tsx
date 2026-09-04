"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Filter,
  Flame,
  Layers,
  Pill,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
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
import { PharmacyNav } from "@/hospital-admin/components/pharmacy/pharmacy-nav";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { mockPharmacyPrescriptions } from "@/hospital-admin/lib/mock-data/pharmacy-extended-operations";
import { PharmacyPrescription } from "@/hospital-admin/lib/types";
import { formatDateTime } from "@/hospital-admin/lib/utils";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Pharmacy Operational workflow";

export default function PharmacyPrescriptionsPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [prescriptions, setPrescriptions] = useState<PharmacyPrescription[]>(mockPharmacyPrescriptions);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Inspect Modal State
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [selectedRx, setSelectedRx] = useState<PharmacyPrescription | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((rx) => {
      const matchesSearch =
        rx.prescriptionNumber.toLowerCase().includes(search.toLowerCase()) ||
        rx.patientName.toLowerCase().includes(search.toLowerCase()) ||
        rx.patientId.toLowerCase().includes(search.toLowerCase()) ||
        rx.doctorName.toLowerCase().includes(search.toLowerCase()) ||
        (rx.wardBed && rx.wardBed.toLowerCase().includes(search.toLowerCase()));

      const matchesSource = sourceFilter === "all" || rx.source === sourceFilter;
      const matchesPriority = priorityFilter === "all" || rx.priority === priorityFilter;
      const matchesStatus = statusFilter === "all" || rx.status === statusFilter;

      return matchesSearch && matchesSource && matchesPriority && matchesStatus;
    });
  }, [prescriptions, search, sourceFilter, priorityFilter, statusFilter]);

  const handleOpenInspect = (rx: PharmacyPrescription) => {
    setSelectedRx(rx);
    setInspectModalOpen(true);
  };

  const handleUpdateStatus = (rxId: string, nextStatus: any) => {
    setPrescriptions((prev) =>
      prev.map((r) => (r.id === rxId ? { ...r, status: nextStatus } : r))
    );
    toast({
      title: "Prescription Status Updated",
      description: `Order status changed to ${nextStatus}. (${DELEGATION_STRING})`,
    });
    setInspectModalOpen(false);
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Doctor Prescriptions Order Queue"
          description="Inbound medication order stream from OPD, IPD, and Emergency triage with Stat prioritization."
          crumbs={[{ label: "Operations" }, { label: "Pharmacy", href: "/hospital-admin/pharmacy" }, { label: "Prescriptions" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading prescriptions queue...
        </div>
      </div>
    );
  }

  const statCount = prescriptions.filter((r) => r.priority === "Stat Emergency" && r.status !== "Dispensed").length;
  const newCount = prescriptions.filter((r) => r.status === "New").length;
  const inProgressCount = prescriptions.filter((r) => r.status === "In Progress").length;

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Doctor Prescriptions Order Queue"
        description="Inbound medication order stream from OPD, IPD, and Emergency triage with Stat prioritization."
        crumbs={[{ label: "Operations" }, { label: "Pharmacy", href: "/hospital-admin/pharmacy" }, { label: "Prescriptions" }]}
        actions={
          <Link href="/hospital-admin/pharmacy/dispensing">
            <Button size="sm" className="gap-1.5 font-semibold text-xs bg-primary text-primary-foreground">
              <CheckCircle2 className="h-4 w-4" /> Go to Dispensing Console
            </Button>
          </Link>
        }
      />

      <PharmacyNav />

      {/* Scope Indicator & Source Integration */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Central Prescription Dispatch Desk" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <Stethoscope className="h-3.5 w-3.5 text-primary" />
          <span>Integration: Doctors prescribe in OPD/IPD/ER $\rightarrow$ Orders land in Pharmacy queue in real-time</span>
        </div>
      </div>

      {/* Stat Emergency Banner */}
      {statCount > 0 && (
        <Card className="border-rose-500/40 bg-rose-500/10 shadow-xs">
          <CardContent className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Flame className="h-6 w-6 text-rose-600 shrink-0 animate-pulse" />
              <div>
                <p className="text-xs font-bold text-rose-900 dark:text-rose-300">
                  STAT EMERGENCY ORDERS: {statCount} High-Priority Prescription(s) Awaiting Dispensing
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Critical trauma and ICU medication orders require immediate pharmacist verification and rapid bed delivery.
                </p>
              </div>
            </div>
            <Link href="/hospital-admin/pharmacy/dispensing">
              <Button size="sm" variant="destructive" className="text-xs font-semibold shrink-0 gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> Fulfill Stat Orders
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">New Pending Orders</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">{newCount} Orders</p>
          <span className="text-[10px] text-rose-600 font-medium">Awaiting verification</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">In Progress Dispensing</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{inProgressCount} Orders</p>
          <span className="text-[10px] text-amber-600 font-medium">FEFO batch pulling</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Stat Priority</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{statCount} Emergency</p>
          <span className="text-[10px] text-primary font-medium">Fast-track delivery</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Orders Today</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">{prescriptions.length} Total</p>
          <span className="text-[10px] text-muted-foreground">OPD, IPD &amp; Emergency</span>
        </Card>
      </div>

      {/* Prescriptions Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold">Prescriptions Dispatch Queue</CardTitle>
              <CardDescription className="text-xs">
                Inspect items, verify Schedule H1 antibiotic warnings, and route orders to the dispensing console.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative w-full sm:w-52">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search patient, doctor, or Rx..."
                  className="pl-8 text-xs h-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[110px] text-xs h-8">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="OPD">OPD</SelectItem>
                  <SelectItem value="IPD">IPD</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[120px] text-xs h-8">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="Stat Emergency">Stat Emergency</SelectItem>
                  <SelectItem value="Routine">Routine</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px] text-xs h-8">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Ready for Pickup">Ready</SelectItem>
                  <SelectItem value="Dispensed">Dispensed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2">
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold w-[130px]">Rx # &amp; Source</TableHead>
                  <TableHead className="text-xs font-bold w-[180px]">Patient &amp; Location</TableHead>
                  <TableHead className="text-xs font-bold w-[160px]">Prescribing Doctor</TableHead>
                  <TableHead className="text-xs font-bold w-[220px]">Prescribed Medicines</TableHead>
                  <TableHead className="text-xs font-bold w-[110px]">Priority</TableHead>
                  <TableHead className="text-xs font-bold w-[110px]">Status</TableHead>
                  <TableHead className="text-xs font-bold text-right w-[140px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrescriptions.map((rx) => {
                  const hasScheduleH1 = rx.items.some((i) => i.scheduleH1);
                  return (
                    <TableRow key={rx.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="font-mono text-xs font-bold text-primary">{rx.prescriptionNumber}</div>
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 mt-0.5">
                          {rx.source}
                        </Badge>
                      </TableCell>

                      <TableCell className="whitespace-normal">
                        <div className="font-semibold text-xs text-foreground">{rx.patientName}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {rx.patientId} • {rx.patientAge}y/{rx.patientGender[0]}
                        </div>
                        {rx.wardBed && (
                          <div className="text-[9px] text-primary font-medium">
                            {rx.wardBed}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="whitespace-normal">
                        <div className="text-xs font-medium text-foreground">{rx.doctorName}</div>
                        <div className="text-[10px] text-muted-foreground">{rx.doctorSpecialty}</div>
                      </TableCell>

                      <TableCell className="whitespace-normal">
                        <div className="text-xs font-medium text-foreground break-words">
                          {rx.items.map((i) => `${i.medicineName} (${i.quantity}x)`).join(", ")}
                        </div>
                        {hasScheduleH1 && (
                          <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 text-[8px] px-1 py-0 h-3.5 mt-0.5">
                            Schedule H1 Regulated
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={
                            rx.priority === "Stat Emergency"
                              ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px] animate-pulse"
                              : "text-[10px]"
                          }
                        >
                          {rx.priority}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={
                            rx.status === "New"
                              ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px]"
                              : rx.status === "In Progress"
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                              : rx.status === "Ready for Pickup"
                              ? "bg-primary/15 text-primary border-primary/30 text-[10px]"
                              : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                          }
                        >
                          {rx.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/hospital-admin/pharmacy/prescriptions/${rx.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs font-semibold text-primary hover:bg-primary/10 gap-1"
                            >
                              <Eye className="h-3 w-3" /> View
                            </Button>
                          </Link>
                          <Link href="/hospital-admin/pharmacy/dispensing">
                            <Button size="sm" className="h-7 text-xs font-semibold bg-primary text-primary-foreground">
                              Dispense
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* MODAL: INSPECT PRESCRIPTION ORDER */}
      <Dialog open={inspectModalOpen} onOpenChange={setInspectModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Doctor Prescription #{selectedRx?.prescriptionNumber}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Prescribed by {selectedRx?.doctorName} ({selectedRx?.doctorSpecialty}) on {selectedRx?.prescribedAt ? formatDateTime(selectedRx.prescribedAt) : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-3 text-xs">
            {/* Patient Header */}
            <div className="p-3 rounded-lg border border-border bg-muted/20 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-muted-foreground block">Patient Name:</span>
                <span className="font-bold text-foreground">{selectedRx?.patientName} ({selectedRx?.patientId})</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Location / Bed:</span>
                <span className="font-mono text-primary font-semibold">{selectedRx?.wardBed || "OPD Consultation Room"}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground block font-bold text-foreground">Clinical Diagnosis:</span>
                <p className="text-foreground italic mt-0.5">{selectedRx?.clinicalDiagnosis || "Clinical consultation."}</p>
              </div>
            </div>

            {/* Prescribed Items Table */}
            <div className="space-y-1.5">
              <span className="font-bold text-foreground text-xs block">Prescribed Medication Items:</span>
              <div className="rounded border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 text-[11px]">
                      <TableHead className="py-1.5 font-bold">Medicine</TableHead>
                      <TableHead className="py-1.5 font-bold">Dosage &amp; Freq</TableHead>
                      <TableHead className="py-1.5 font-bold">Duration</TableHead>
                      <TableHead className="py-1.5 font-bold text-center">Qty</TableHead>
                      <TableHead className="py-1.5 font-bold text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedRx?.items.map((item, idx) => (
                      <TableRow key={idx} className="text-[11px]">
                        <TableCell className="py-1.5 font-medium">
                          <div>{item.medicineName}</div>
                          {item.scheduleH1 && (
                            <span className="text-[9px] text-rose-600 font-semibold block">
                              Schedule H1 Regulated
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="py-1.5 text-muted-foreground">{item.dosage} • {item.frequency}</TableCell>
                        <TableCell className="py-1.5 text-muted-foreground">{item.duration}</TableCell>
                        <TableCell className="py-1.5 text-center font-mono font-bold">{item.quantity}</TableCell>
                        <TableCell className="py-1.5 text-right font-mono font-semibold">₹{item.unitPrice * item.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUpdateStatus(selectedRx!.id, "In Progress")}
              >
                Mark In Progress
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setInspectModalOpen(false)}>
                Close
              </Button>
              <Link href="/hospital-admin/pharmacy/dispensing">
                <Button size="sm" className="bg-primary text-primary-foreground font-semibold">
                  Proceed to Dispense
                </Button>
              </Link>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
