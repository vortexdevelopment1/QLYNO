"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import {
  ArrowRight,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  Filter,
  Layers,
  Plus,
  Search,
  ShieldCheck,
  User,
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
import { WardsBedsNav } from "@/hospital-admin/components/wards-beds/wards-beds-nav";
import { executeBedTransfer } from "@/hospital-admin/store/slices/wardsBedsSlice";
import { Bed, BedTransferRequest } from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";

export default function BedTransferPage() {
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { beds, transferRequests } = useSelector((state: RootState) => state.wardsBeds);

  // New Transfer Request Modal State
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedFromBedId, setSelectedFromBedId] = useState("");
  const [selectedToBedId, setSelectedToBedId] = useState("");
  const [transferReason, setTransferReason] = useState("ICU Step-down to General Ward following stabilization");
  const [requestedBy, setRequestedBy] = useState("Dr. Kavita Verma");

  useEffect(() => {
    setMounted(true);
  }, []);

  const occupiedBeds = beds.filter((b) => b.status === "Occupied");
  const availableBeds = beds.filter((b) => b.status === "Available");

  const handleOpenTransferModal = () => {
    if (occupiedBeds.length > 0) {
      setSelectedFromBedId(occupiedBeds[0].id);
    }
    if (availableBeds.length > 0) {
      setSelectedToBedId(availableBeds[0].id);
    }
    setTransferModalOpen(true);
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const fromBed = beds.find((b) => b.id === selectedFromBedId);
    const toBed = beds.find((b) => b.id === selectedToBedId);

    if (!fromBed || !toBed) return;

    if (toBed.status !== "Available") {
      toast({
        title: "Transfer Blocked",
        description: "Destination bed must be in Available status.",
        variant: "destructive",
      });
      return;
    }

    // Atomic Execution (Rule F12-CANNOT-9)
    dispatch(
      executeBedTransfer({
        requestId: `trf_${Date.now()}`,
        fromBedId: fromBed.id,
        toBedId: toBed.id,
        patientId: fromBed.currentPatientId || "P-1000",
        patientName: fromBed.currentPatientName || "Patient",
        transferredBy: requestedBy,
      })
    );

    toast({
      title: "Bed Transfer Executed",
      description: `${fromBed.currentPatientName} transferred from ${fromBed.bedNumber} to ${toBed.bedNumber}. Origin moved to Cleaning.`,
    });
    setTransferModalOpen(false);
  };

  const handleDirectExecutePending = (req: BedTransferRequest) => {
    const toBed = beds.find((b) => b.id === req.toBedId);
    if (!toBed || toBed.status !== "Available") {
      toast({
        title: "Transfer Blocked",
        description: `Destination bed ${req.toBedNumber} is no longer available.`,
        variant: "destructive",
      });
      return;
    }

    dispatch(
      executeBedTransfer({
        requestId: req.id,
        fromBedId: req.fromBedId,
        toBedId: req.toBedId,
        patientId: req.patientId,
        patientName: req.patientName,
        transferredBy: "Hospital Admin",
      })
    );

    toast({
      title: "Bed Transfer Completed",
      description: `Atomic transfer executed for ${req.patientName}.`,
    });
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Inter-Ward Bed Transfer Desk"
          description="Acuity escalation, ICU step-down de-escalations, and atomic origin-release destination-occupy execution."
          crumbs={[{ label: "Clinical Operations" }, { label: "Wards & Beds", href: "/hospital-admin/wards-beds" }, { label: "Transfer Desk" }]}
        />
        <WardsBedsNav />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading transfer desk...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Inter-Ward Bed Transfer Desk"
        description="Acuity escalation, ICU step-down de-escalations, and atomic origin-release destination-occupy execution."
        crumbs={[{ label: "Clinical Operations" }, { label: "Wards & Beds", href: "/hospital-admin/wards-beds" }, { label: "Transfer Desk" }]}
        actions={
          <Button size="sm" className="gap-1.5 font-semibold text-xs" onClick={handleOpenTransferModal}>
            <Plus className="h-4 w-4" /> Request Bed Transfer
          </Button>
        }
      />

      <WardsBedsNav />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Transfer Requests</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{transferRequests.length} Total</p>
          <span className="text-[10px] text-muted-foreground">Hospital-wide movement queue</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Pending Execution</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">
            {transferRequests.filter((r) => r.status === "Approved" || r.status === "Pending").length} Pending
          </p>
          <span className="text-[10px] text-amber-600 font-medium">Approved &amp; awaiting porter</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Atomic Execution</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">Enforced</p>
          <span className="text-[10px] text-emerald-600 font-medium">Origin Cleaning + Destination Occ</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">IPD Module Alignment</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">Unified</p>
          <span className="text-[10px] text-cyan-600 font-medium">Single transfer workflow</span>
        </Card>
      </div>

      {/* Transfer Queue Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Inter-Ward Transfer Requests &amp; Handover Queue</CardTitle>
          <CardDescription className="text-xs">
            Review clinical transfer justifications and atomically execute patient relocation.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Patient Details</TableHead>
                  <TableHead className="text-xs font-bold">Origin Bed</TableHead>
                  <TableHead className="text-xs font-bold"></TableHead>
                  <TableHead className="text-xs font-bold">Destination Bed</TableHead>
                  <TableHead className="text-xs font-bold min-w-[200px]">Transfer Justification Reason</TableHead>
                  <TableHead className="text-xs font-bold">Requested By</TableHead>
                  <TableHead className="text-xs font-bold">Status</TableHead>
                  <TableHead className="text-xs font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transferRequests.map((req) => (
                  <TableRow key={req.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground">{req.patientName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{req.patientId}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-xs font-bold text-rose-600">{req.fromBedNumber}</div>
                      <div className="text-[10px] text-muted-foreground">{req.fromWard}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <ArrowRight className="h-4 w-4 text-primary mx-auto" />
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-xs font-bold text-emerald-600">{req.toBedNumber}</div>
                      <div className="text-[10px] text-muted-foreground">{req.toWard}</div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-normal break-words max-w-[280px] leading-relaxed">
                      {req.reason}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-foreground">{req.requestedBy}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          req.status === "Completed"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                            : req.status === "Approved"
                            ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 text-[10px]"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                        }
                      >
                        {req.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {req.status === "Approved" ? (
                        <Button
                          size="sm"
                          className="h-7 text-xs font-semibold"
                          onClick={() => handleDirectExecutePending(req)}
                        >
                          Execute Transfer
                        </Button>
                      ) : (
                        <span className="text-[11px] text-muted-foreground font-mono">Transferred</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* New Transfer Request Modal */}
      <Dialog open={transferModalOpen} onOpenChange={setTransferModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleExecuteTransfer}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-primary" /> Request Patient Bed Transfer
              </DialogTitle>
              <DialogDescription className="text-xs">
                Select an admitted patient and an available destination bed across hospital wards.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-3 text-xs">
              <div className="grid gap-1">
                <Label htmlFor="trf-from">Origin Occupied Bed (Patient)</Label>
                <Select value={selectedFromBedId} onValueChange={setSelectedFromBedId}>
                  <SelectTrigger id="trf-from" className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {occupiedBeds.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.bedNumber} — {b.currentPatientName} ({b.wardName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="trf-to">Destination Available Bed</Label>
                <Select value={selectedToBedId} onValueChange={setSelectedToBedId}>
                  <SelectTrigger id="trf-to" className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBeds.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.bedNumber} — {b.wardName} ({b.tier} Tier)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="trf-reason">Clinical / Operational Justification</Label>
                <Input
                  id="trf-reason"
                  required
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder="e.g. ICU Step-down following clinical stabilization"
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="trf-doc">Ordering Physician / Clinician</Label>
                <Input
                  id="trf-doc"
                  required
                  value={requestedBy}
                  onChange={(e) => setRequestedBy(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setTransferModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Authorize &amp; Execute Transfer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
