"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  Lock,
  Pill,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
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
import { mockDispensingLogs } from "@/hospital-admin/lib/mock-data/section12-operations";
import { mockPharmacyPrescriptions } from "@/hospital-admin/lib/mock-data/pharmacy-extended-operations";
import { DispensingRecord, PharmacyPrescription } from "@/hospital-admin/lib/types";
import { formatDateTime } from "@/hospital-admin/lib/utils";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Pharmacy Operational workflow";

export default function PharmacyDispensingPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [dispensingRecords, setDispensingRecords] = useState<DispensingRecord[]>(mockDispensingLogs);
  const [prescriptions] = useState<PharmacyPrescription[]>(mockPharmacyPrescriptions);
  const [search, setSearch] = useState("");

  // Dispensing Wizard Modal State
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedRxId, setSelectedRxId] = useState(mockPharmacyPrescriptions[0].id);
  const [pharmacistName, setPharmacistName] = useState("Rekha Joshi (Chief Pharmacist)");
  const [councilRegNo, setCouncilRegNo] = useState("PCI-MAH-1994-04412");
  const [verifiedScheduleH1, setVerifiedScheduleH1] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeRx = prescriptions.find((r) => r.id === selectedRxId) || prescriptions[0];
  const hasScheduleH1 = activeRx.items.some((i) => i.scheduleH1);

  const filteredLogs = dispensingRecords.filter((d) => {
    const rxNo = d.prescriptionNumber || d.prescriptionNo || "";
    return (
      rxNo.toLowerCase().includes(search.toLowerCase()) ||
      d.patientName.toLowerCase().includes(search.toLowerCase()) ||
      d.patientId.toLowerCase().includes(search.toLowerCase()) ||
      d.doctorName.toLowerCase().includes(search.toLowerCase()) ||
      d.pharmacistName.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleExecuteDispense = (e: React.FormEvent) => {
    e.preventDefault();

    if (hasScheduleH1 && !verifiedScheduleH1) {
      toast({
        title: "Schedule H1 Verification Required",
        description: "Controlled Drug Protocol: Controlled antibiotics and narcotics require verified licensed pharmacist sign-off.",
        variant: "destructive",
      });
      return;
    }

    const newRecord: DispensingRecord = {
      id: `disp_${Date.now()}`,
      prescriptionNo: activeRx.prescriptionNumber,
      prescriptionNumber: activeRx.prescriptionNumber,
      patientName: activeRx.patientName,
      patientId: activeRx.patientId,
      doctorName: activeRx.doctorName,
      pharmacistName,
      dispensedAt: new Date().toISOString(),
      timestamp: "Just now",
      status: "Dispensed",
      totalAmount: activeRx.totalAmount,
      items: activeRx.items.map((i) => ({
        medicineName: i.medicineName,
        quantity: i.quantity,
        dosage: i.dosage,
      })),
    };

    setDispensingRecords((prev) => [newRecord, ...prev]);

    toast({
      title: "Prescription Dispensed Successfully",
      description: `Fulfilled ${activeRx.prescriptionNumber} for ${activeRx.patientName}. Auto-deducted inventory stock & accrued billing line item. (${DELEGATION_STRING})`,
    });

    setWizardOpen(false);
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Pharmacy Dispensing &amp; Fulfillment Console"
          description="FEFO batch allocation, Schedule H1 antibiotic verification, and real-time inventory deduction."
          crumbs={[{ label: "Operations" }, { label: "Pharmacy", href: "/hospital-admin/pharmacy" }, { label: "Dispensing" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading dispensing console...
        </div>
      </div>
    );
  }

  const totalDispensedCount = dispensingRecords.length;
  const totalDispensedRevenue = dispensingRecords.reduce((acc, d) => acc + d.totalAmount, 0);

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Pharmacy Dispensing &amp; Fulfillment Console"
        description="FEFO batch allocation, Schedule H1 antibiotic verification, and real-time inventory deduction."
        crumbs={[{ label: "Operations" }, { label: "Pharmacy", href: "/hospital-admin/pharmacy" }, { label: "Dispensing" }]}
        actions={
          <Button
            size="sm"
            className="gap-1.5 font-semibold text-xs bg-primary text-primary-foreground"
            onClick={() => setWizardOpen(true)}
          >
            <Plus className="h-4 w-4" /> Dispense Prescription
          </Button>
        }
      />

      <PharmacyNav />

      {/* Scope Indicator & Section 12/15 Governance */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Dispensing &amp; Clinical Verification Counter" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
          <span>Dispensing Standard: Clinical dispensing decisions and Schedule H1 sign-offs strictly remain with authorized clinical pharmacists</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Dispensed Today</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{totalDispensedCount} Rx Fulfilled</p>
          <span className="text-[10px] text-emerald-600 font-medium">Auto-deducted from inventory</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Dispensed Billing Value</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">₹{totalDispensedRevenue.toLocaleString()}</p>
          <span className="text-[10px] text-primary font-medium">Accrued to /billing/pharmacy</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">FEFO Dispatch Compliance</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">100%</p>
          <span className="text-[10px] text-muted-foreground">Earliest expiry prioritized</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Schedule H1 Audit Trail</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">Verified</p>
          <span className="text-[10px] text-muted-foreground">Council Reg # recorded</span>
        </Card>
      </div>

      {/* Dispensing Activity Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold">Dispensing Fulfillment Audit Trail</CardTitle>
              <CardDescription className="text-xs">
                Immutable record of fulfilled medication orders linking doctor prescription, patient bed, dispensing pharmacist, and billing ledger.
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search fulfilled prescription..."
                className="pl-8 text-xs h-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2">
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold w-[140px]">Prescription #</TableHead>
                  <TableHead className="text-xs font-bold w-[180px]">Patient &amp; MRN</TableHead>
                  <TableHead className="text-xs font-bold w-[160px]">Prescribing Doctor</TableHead>
                  <TableHead className="text-xs font-bold w-[240px]">Dispensed Medication Line Items</TableHead>
                  <TableHead className="text-xs font-bold w-[160px]">Dispensing Pharmacist</TableHead>
                  <TableHead className="text-xs font-bold w-[110px]">Timestamp</TableHead>
                  <TableHead className="text-xs font-bold text-right w-[110px]">Bill Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((d) => (
                  <TableRow key={d.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {d.prescriptionNumber || d.prescriptionNo}
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-xs text-foreground">{d.patientName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{d.patientId}</div>
                    </TableCell>

                    <TableCell className="text-xs text-foreground">
                      {d.doctorName}
                    </TableCell>

                    <TableCell>
                      <div className="text-xs font-medium text-foreground">
                        {d.items.map((i) => `${i.medicineName} (${i.quantity}x)`).join(", ")}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                        <span>{d.pharmacistName}</span>
                      </div>
                    </TableCell>

                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {d.timestamp || d.dispensedAt}
                    </TableCell>

                    <TableCell className="text-right font-mono text-xs font-bold text-foreground">
                      ₹{d.totalAmount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* DISPENSING FULFILLMENT WIZARD MODAL */}
      <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleExecuteDispense}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Dispense Prescription Order
              </DialogTitle>
              <DialogDescription className="text-xs">
                Select prescription order, verify FEFO batch allocations, and record licensed pharmacist sign-off.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-3 text-xs">
              {/* Select Rx */}
              <div className="grid gap-1">
                <Label htmlFor="wz-rx">Select Inbound Prescription Order *</Label>
                <Select value={selectedRxId} onValueChange={setSelectedRxId}>
                  <SelectTrigger id="wz-rx" className="text-xs font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {prescriptions.map((rx) => (
                      <SelectItem key={rx.id} value={rx.id}>
                        {rx.prescriptionNumber} — {rx.patientName} ({rx.source} • ₹{rx.totalAmount})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Order Details Preview */}
              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span>Patient: <strong>{activeRx.patientName}</strong> ({activeRx.patientId})</span>
                  <span className="font-mono text-primary">{activeRx.wardBed || "OPD"}</span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Prescribed by: {activeRx.doctorName} ({activeRx.doctorSpecialty})
                </div>

                {/* Items */}
                <div className="pt-1 space-y-1">
                  <span className="font-bold text-foreground text-[11px] block">Medications to Dispense (FEFO Prioritized):</span>
                  {activeRx.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-1.5 rounded bg-card border border-border text-[11px]">
                      <div>
                        <span className="font-semibold block">{item.medicineName}</span>
                        <span className="text-[10px] text-muted-foreground">{item.dosage} • {item.frequency}</span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="font-bold text-foreground">{item.quantity} Units</span>
                        <span className="text-[10px] text-muted-foreground block">Batch: FEFO-B01</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedule H1 Governance Notice */}
              {hasScheduleH1 && (
                <div className="p-2.5 rounded border border-rose-500/30 bg-rose-500/10 text-rose-900 dark:text-rose-300 text-[11px] space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    <ShieldAlert className="h-3.5 w-3.5" /> Schedule H1 Controlled Substance Sign-Off Required
                  </span>
                  <p>
                    Controlled antibiotic or narcotic included. State Pharmacy Council registration must be verified before fulfillment.
                  </p>
                </div>
              )}

              {/* Pharmacist Sign-Off */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="grid gap-1">
                  <Label htmlFor="wz-ph">Dispensing Pharmacist *</Label>
                  <Input
                    id="wz-ph"
                    required
                    value={pharmacistName}
                    onChange={(e) => setPharmacistName(e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="wz-reg">Pharmacy Council Reg # *</Label>
                  <Input
                    id="wz-reg"
                    required
                    value={councilRegNo}
                    onChange={(e) => setCouncilRegNo(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setWizardOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold">
                Confirm Dispensing (₹{activeRx.totalAmount})
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
