"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  AlertOctagon,
  Camera,
  CheckCircle2,
  Clock,
  Cpu,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  Layers,
  Radio,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Timer,
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
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { RadiologyNav } from "@/hospital-admin/components/radiology/radiology-nav";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { mockExtendedRadiologyOrders } from "@/hospital-admin/lib/mock-data/radiology-extended-operations";
import { RadiologyOrder } from "@/hospital-admin/lib/types";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Radiologist Reporting & Authorization workflow";

export default function RadiologyAwaitingReviewPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [orders, setOrders] = useState<RadiologyOrder[]>(mockExtendedRadiologyOrders);
  const [search, setSearch] = useState("");
  const [modalityFilter, setModalityFilter] = useState("all");

  // Authorize Modal State (Rule F14-CANNOT-2)
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<RadiologyOrder | null>(null);
  const [radiologistName, setRadiologistName] = useState("Dr. Vikram Seth, MD (Radiology)");
  const [reportNotes, setReportNotes] = useState("Clear lung fields bilaterally. Cardiac silhouette and cardiothoracic ratio within normal limits. Normal bony thorax. No focal consolidation or effusion.");
  const [impressionNotes, setImpressionNotes] = useState("Normal study. Fit for elective surgical clearance from radiological perspective.");
  const [isCritical, setIsCritical] = useState(false);
  const [criticalDetails, setCriticalDetails] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const pendingOrders = useMemo(() => {
    return orders
      .filter((o) => {
        const isPending = o.status === "Report Pending";
        const matchesSearch =
          o.orderNo.toLowerCase().includes(search.toLowerCase()) ||
          o.patientName.toLowerCase().includes(search.toLowerCase()) ||
          o.bodyPart.toLowerCase().includes(search.toLowerCase()) ||
          o.orderingDoctor.toLowerCase().includes(search.toLowerCase());
        const matchesModality = modalityFilter === "all" || o.modality === modalityFilter;
        return isPending && matchesSearch && matchesModality;
      })
      .sort((a, b) => (a.priority === "Stat Emergency" ? -1 : 1));
  }, [orders, search, modalityFilter]);

  const handleOpenAuth = (order: RadiologyOrder) => {
    setSelectedOrder(order);
    setRadiologistName("Dr. Vikram Seth, MD (Radiology)");
    setIsCritical(order.criticalFinding || false);
    setCriticalDetails(order.criticalDetails || "");
    if (order.modality === "X-Ray") {
      setReportNotes("Visualized bony structures and soft tissues are unremarkable. No fracture, dislocation, or focal opacity detected.");
      setImpressionNotes("Radiologically clear. Suitable for pre-op surgical readiness.");
    } else if (order.modality === "CT Scan") {
      setReportNotes("Adequate contrast opacification achieved. Axial, coronal, and sagittal reconstructions reviewed.");
      setImpressionNotes("Findings clinically correlated. Direct notification dispatched if critical.");
    } else {
      setReportNotes("Multiplanar MRI sequences acquired. High tissue resolution achieved.");
      setImpressionNotes("Clinical correlation advised.");
    }
    setAuthModalOpen(true);
  };

  const handleConfirmAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    // Rule F14-CANNOT-2: Pathologist/Radiologist authorization gate
    const timestamp = new Date().toISOString();

    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrder.id
          ? {
              ...o,
              status: "Report Ready",
              radiologistName,
              reportNotes,
              impressionNotes,
              criticalFinding: isCritical,
              criticalDetails: isCritical ? criticalDetails : undefined,
              authorizedAt: timestamp,
            }
          : o
      )
    );

    toast({
      title: "Radiology Report Authorized & Published to EMR",
      description: `${selectedOrder.bodyPart} report for ${selectedOrder.patientName} (${selectedOrder.orderNo}) signed by ${radiologistName}. (${DELEGATION_STRING})`,
    });
    setAuthModalOpen(false);
    setSelectedOrder(null);
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Reports Awaiting Radiologist Review"
          description="Dedicated radiologist triage worklist for pending DICOM studies sorted by longest-waiting turnaround."
          crumbs={[{ label: "Clinical Operations" }, { label: "Radiology", href: "/hospital-admin/radiology" }, { label: "Awaiting Review" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading radiologist worklist...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Reports Awaiting Radiologist Review"
        description="Dedicated radiologist triage worklist for pending DICOM studies sorted by longest-waiting turnaround."
        crumbs={[{ label: "Clinical Operations" }, { label: "Radiology", href: "/hospital-admin/radiology" }, { label: "Awaiting Review" }]}
      />

      <RadiologyNav />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Radiology Reading &amp; Validation Worklist" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
          <span>Authorization Gate: Diagnostic reports require verified Radiologist digital authorization before release</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Awaiting Interpretation</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{pendingOrders.length} Studies</p>
          <span className="text-[10px] text-amber-600 font-medium">Scans completed on PACS</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Stat Emergency Triage</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">
            {pendingOrders.filter((o) => o.priority === "Stat Emergency").length} Stat
          </p>
          <span className="text-[10px] text-rose-600 font-medium">Top reading priority</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Pre-Op Clearance Studies</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">
            {pendingOrders.filter((o) => o.source === "OT").length} Studies
          </p>
          <span className="text-[10px] text-cyan-600 font-medium">Auto-syncs to OT checklist</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Target Reading TAT</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">&lt; 30 Mins</p>
          <span className="text-[10px] text-emerald-600 font-medium">NABH / NABL compliant</span>
        </Card>
      </div>

      {/* Worklist Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Radiologist Clinical Review Worklist (Report Pending)</CardTitle>
          <CardDescription className="text-xs">
            Review images on PACS, document findings, flag critical alerts, and electronically sign off diagnostic reports.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pending study, patient, doctor..."
                className="pl-8 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={modalityFilter} onValueChange={setModalityFilter}>
                <SelectTrigger className="w-[140px] text-xs h-9">
                  <SelectValue placeholder="Modality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modalities</SelectItem>
                  <SelectItem value="CT Scan">CT Scan</SelectItem>
                  <SelectItem value="MRI">3T MRI</SelectItem>
                  <SelectItem value="X-Ray">Digital X-Ray</SelectItem>
                  <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold w-[120px]">Order #</TableHead>
                  <TableHead className="text-xs font-bold w-[220px]">Patient Details</TableHead>
                  <TableHead className="text-xs font-bold w-[220px]">Modality &amp; Study</TableHead>
                  <TableHead className="text-xs font-bold w-[180px]">Ordering Physician</TableHead>
                  <TableHead className="text-xs font-bold w-[140px]">Acquired Bay</TableHead>
                  <TableHead className="text-xs font-bold w-[130px]">Priority</TableHead>
                  <TableHead className="text-xs font-bold text-right w-[200px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-xs text-muted-foreground">
                      All diagnostic reports are up to date. Zero pending studies in review worklist.
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs font-bold text-primary">
                        {order.orderNo}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-xs text-foreground">{order.patientName}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {order.uhid} • <span className="font-sans font-medium text-primary">{order.source}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[10px]">
                            {order.modality}
                          </Badge>
                          <span className="truncate max-w-[160px]">{order.bodyPart}</span>
                        </div>
                        {order.criticalFinding && (
                          <div className="text-[10px] text-destructive font-bold flex items-center gap-1 mt-0.5">
                            <AlertOctagon className="h-3 w-3 shrink-0" /> Critical Finding Flagged
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-medium">
                        {order.orderingDoctor}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-medium text-foreground">{order.roomName}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          Tech: {order.technologistName?.split(" ")[0]}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            order.priority === "Stat Emergency"
                              ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px] animate-pulse"
                              : order.priority === "Urgent"
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                              : "text-[10px]"
                          }
                        >
                          {order.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        {order.dicomViewerUrl && (
                          <Button size="sm" variant="ghost" asChild className="h-7 text-xs text-cyan-500 hover:text-cyan-400 font-semibold">
                            <Link href={`/hospital-admin/radiology/viewer/${order.id}`}>
                              <Eye className="h-3.5 w-3.5 mr-1" /> PACS
                            </Link>
                          </Button>
                        )}
                        <Button
                          size="sm"
                          className="h-7 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => handleOpenAuth(order)}
                        >
                          <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Authorize &amp; Sign
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Radiologist Authorize Modal */}
      <Dialog open={authModalOpen} onOpenChange={setAuthModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleConfirmAuth}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-emerald-600">
                <ShieldCheck className="h-5 w-5 text-emerald-600" /> Radiologist Sign-Off &amp; EMR Release
              </DialogTitle>
              <DialogDescription className="text-xs">
                Authorizing {selectedOrder?.modality} {selectedOrder?.bodyPart} for {selectedOrder?.patientName} ({selectedOrder?.orderNo}).
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-3 text-xs">
              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Patient:</span>
                  <span className="font-semibold text-foreground">{selectedOrder?.patientName} ({selectedOrder?.uhid})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Ordering Physician:</span>
                  <span className="font-medium text-foreground">{selectedOrder?.orderingDoctor}</span>
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="a-rad">Authorizing Radiologist (from Doctor Management) *</Label>
                <Select value={radiologistName} onValueChange={setRadiologistName}>
                  <SelectTrigger id="a-rad" className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr. Vikram Seth, MD (Radiology)">Dr. Vikram Seth, MD (Radiology)</SelectItem>
                    <SelectItem value="Dr. Sunita Kulkarni, MD (Neuroradiology)">Dr. Sunita Kulkarni, MD (Neuroradiology)</SelectItem>
                    <SelectItem value="Dr. Arvind Rao, MD (Musculoskeletal Radiology)">Dr. Arvind Rao, MD (Musculoskeletal Radiology)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="a-notes">Radiological Findings &amp; Summary *</Label>
                <Textarea
                  id="a-notes"
                  required
                  rows={3}
                  className="text-xs"
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="a-imp">Clinical Impression / Recommendation *</Label>
                <Input
                  id="a-imp"
                  required
                  value={impressionNotes}
                  onChange={(e) => setImpressionNotes(e.target.value)}
                />
              </div>

              {/* Critical Alert Checkbox */}
              <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-destructive">
                  <input
                    type="checkbox"
                    checked={isCritical}
                    onChange={(e) => setIsCritical(e.target.checked)}
                    className="rounded border-destructive text-destructive focus:ring-destructive"
                  />
                  <span>Flag as Life-Threatening Critical Finding (Immediate Doctor Escalation)</span>
                </label>
                {isCritical && (
                  <Input
                    placeholder="Describe panic finding for immediate clinician escalation..."
                    className="text-xs border-destructive/50 bg-background"
                    required
                    value={criticalDetails}
                    onChange={(e) => setCriticalDetails(e.target.value)}
                  />
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setAuthModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Authorize &amp; Release to EMR
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
