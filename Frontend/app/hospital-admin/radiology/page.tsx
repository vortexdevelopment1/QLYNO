"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  AlertOctagon,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Filter,
  Layers,
  MapPin,
  Plus,
  Radio,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { RadiologyNav } from "@/hospital-admin/components/radiology/radiology-nav";
import { mockExtendedRadiologyOrders, mockImagingSuites } from "@/hospital-admin/lib/mock-data/radiology-extended-operations";
import { RadiologyOrder, RadiologyModality } from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Radiology Coordination workflow";

export default function RadiologyPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [orders, setOrders] = useState<RadiologyOrder[]>(mockExtendedRadiologyOrders);
  const [search, setSearch] = useState("");
  const [modalityFilter, setModalityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  // Selected Order Drawer / Modal
  const [selectedOrder, setSelectedOrder] = useState<RadiologyOrder | null>(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduledTime, setScheduledTime] = useState("2026-08-24T16:00");
  const [selectedRoom, setSelectedRoom] = useState("128-Slice Multi-Detector CT Suite");

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.orderNo.toLowerCase().includes(search.toLowerCase()) ||
        o.patientName.toLowerCase().includes(search.toLowerCase()) ||
        (o.uhid && o.uhid.toLowerCase().includes(search.toLowerCase())) ||
        o.bodyPart.toLowerCase().includes(search.toLowerCase()) ||
        o.orderingDoctor.toLowerCase().includes(search.toLowerCase());
      const matchesModality = modalityFilter === "all" || o.modality === modalityFilter;
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      const matchesSource = sourceFilter === "all" || o.source === sourceFilter;
      return matchesSearch && matchesModality && matchesStatus && matchesSource;
    });
  }, [orders, search, modalityFilter, statusFilter, sourceFilter]);

  const criticalOrders = useMemo(() => orders.filter((o) => o.criticalFinding), [orders]);

  const handleOpenSchedule = (order: RadiologyOrder) => {
    setSelectedOrder(order);
    setSelectedRoom(order.roomName || "128-Slice Multi-Detector CT Suite");
    setScheduleModalOpen(true);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    // Check if target suite is in Maintenance
    const targetSuite = mockImagingSuites.find((s) => s.name === selectedRoom);
    if (targetSuite && (targetSuite.status === "Maintenance" || targetSuite.status === "Offline")) {
      toast({
        title: "Suite Maintenance Lock",
        description: `${selectedRoom} is currently under Maintenance. Slot allocation blocked.`,
        variant: "destructive",
      });
      return;
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrder.id
          ? {
              ...o,
              status: "Scheduled",
              scheduledAt: new Date(scheduledTime).toISOString(),
              roomName: selectedRoom,
            }
          : o
      )
    );

    toast({
      title: "Imaging Slot Confirmed",
      description: `${selectedOrder.orderNo} scheduled in ${selectedRoom} for ${selectedOrder.patientName}. (${DELEGATION_STRING})`,
    });
    setScheduleModalOpen(false);
    setSelectedOrder(null);
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Radiology &amp; Imaging (PACS/RIS)"
          description="Modality worklist (MWL), CT/MRI scan scheduling, PACS imaging links, and critical radiological findings."
          crumbs={[{ label: "Clinical Operations" }, { label: "Radiology & Imaging" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading radiology workstation...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Radiology &amp; Imaging (PACS/RIS)"
        description="Modality worklist (MWL), CT/MRI scan scheduling, PACS imaging links, and critical radiological findings."
        crumbs={[{ label: "Clinical Operations" }, { label: "Radiology & Imaging" }]}
      />

      <RadiologyNav />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Central Radiology &amp; PACS Console" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
          <span>Operational Schedule Coordination • Clinical reporting authorized by licensed Radiologists</span>
        </div>
      </div>

      {/* Critical Finding Alert Banner (Rule F14-CANNOT-5) */}
      {criticalOrders.length > 0 && (
        <Card className="border-destructive/40 bg-destructive/5 shadow-xs">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5">
            <div className="flex items-center gap-3">
              <AlertOctagon className="h-5 w-5 text-destructive shrink-0" />
              <div>
                <div className="text-xs font-bold text-destructive flex items-center gap-1.5">
                  <span>{criticalOrders.length} Critical Radiological Finding(s) Requiring Immediate Clinician Alert</span>
                  <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4">Panic Values</Badge>
                </div>
                <p className="text-[11px] text-foreground mt-0.5">
                  {criticalOrders[0].patientName} ({criticalOrders[0].modality} {criticalOrders[0].bodyPart}) —{" "}
                  <span className="font-semibold text-destructive">{criticalOrders[0].criticalDetails}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="destructive"
                asChild
                className="text-xs font-semibold"
              >
                <Link href="/hospital-admin/radiology/critical-findings">
                  Open Critical Findings Log
                </Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => setSelectedOrder(criticalOrders[0])}
              >
                Review Scan Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Scans Ordered</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{orders.length} Studies</p>
          <span className="text-[10px] text-muted-foreground">Today's imaging volume</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">In Progress / Pending</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">
            {orders.filter((o) => o.status === "In Progress" || o.status === "Report Pending").length} Scans
          </p>
          <span className="text-[10px] text-amber-600 font-medium">On auto-analyzers &amp; PACS</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Reports Authorized</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
            {orders.filter((o) => o.status === "Report Ready").length} Signed
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Delivered to clinician EMR</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">PACS / DICOM Web</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">Online</p>
          <span className="text-[10px] text-cyan-600 font-medium">100% DICOM MWL sync</span>
        </Card>
      </div>

      {/* Radiology Orders Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Radiology &amp; Modality Worklist (MWL)</CardTitle>
          <CardDescription className="text-xs">
            Manage imaging slots, track radiologist reporting turnaround, and access DICOM studies.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search order #, patient, or body part..."
                className="pl-8 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={modalityFilter} onValueChange={setModalityFilter}>
                <SelectTrigger className="w-[130px] text-xs h-9">
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

              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[120px] text-xs h-9">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="OPD">OPD</SelectItem>
                  <SelectItem value="IPD">IPD</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                  <SelectItem value="OT">OT Pre-Op</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] text-xs h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Requested">Requested</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Report Pending">Report Pending</SelectItem>
                  <SelectItem value="Report Ready">Report Ready</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold w-[120px]">Order #</TableHead>
                  <TableHead className="text-xs font-bold w-[220px]">Patient Details &amp; Bed</TableHead>
                  <TableHead className="text-xs font-bold w-[220px]">Modality &amp; Study</TableHead>
                  <TableHead className="text-xs font-bold w-[160px]">Ordering Physician</TableHead>
                  <TableHead className="text-xs font-bold w-[220px]">Scheduled Suite &amp; Time</TableHead>
                  <TableHead className="text-xs font-bold w-[130px]">Priority</TableHead>
                  <TableHead className="text-xs font-bold w-[130px]">Status</TableHead>
                  <TableHead className="text-xs font-bold text-right w-[180px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="hover:bg-muted/40 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {order.orderNo}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground">{order.patientName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {order.uhid || order.patientId} • <span className="font-sans font-medium text-primary">{order.patientLocation}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px]">
                          {order.modality}
                        </Badge>
                        <span className="truncate max-w-[160px]">{order.bodyPart}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">Source: {order.source}</div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-medium">
                      {order.orderingDoctor}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-medium">{order.roomName.split(" ")[0]} Suite</div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {new Date(order.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
                    <TableCell>
                      <Badge
                        className={
                          order.status === "Report Ready"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                            : order.status === "In Progress"
                            ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 text-[10px]"
                            : order.status === "Report Pending"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                            : "bg-muted text-muted-foreground text-[10px]"
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-primary"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" /> View Study
                      </Button>
                      {order.status === "Requested" && (
                        <Button
                          size="sm"
                          className="h-7 text-xs font-semibold"
                          onClick={() => handleOpenSchedule(order)}
                        >
                          <Clock className="h-3.5 w-3.5 mr-1" /> Schedule
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Detail & PACS Viewer Drawer */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" /> {selectedOrder.modality} Study ({selectedOrder.orderNo})
              </DialogTitle>
              <DialogDescription className="text-xs">
                {selectedOrder.bodyPart} • {selectedOrder.patientName} ({selectedOrder.uhid || selectedOrder.patientId})
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2 text-xs">
              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Assigned Suite:</span>
                  <span className="font-semibold text-foreground">{selectedOrder.roomName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Reporting Radiologist:</span>
                  <span className="font-medium text-foreground">{selectedOrder.radiologistName || "Awaiting Assignment"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Clinical Ordering Doctor:</span>
                  <span className="font-medium">{selectedOrder.orderingDoctor} ({selectedOrder.source})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Patient Location / Bed:</span>
                  <span className="font-mono text-primary font-semibold">{selectedOrder.patientLocation}</span>
                </div>
              </div>

              {selectedOrder.criticalFinding && (
                <div className="p-2.5 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-[11px] font-medium space-y-0.5">
                  <div className="font-bold flex items-center gap-1">
                    <AlertOctagon className="h-3.5 w-3.5" /> Critical Finding Alerted to Clinician
                  </div>
                  <p>{selectedOrder.criticalDetails}</p>
                </div>
              )}

              {selectedOrder.reportNotes && (
                <div className="p-3 rounded-lg border border-border bg-card space-y-1">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase">Authorized Findings / Summary:</span>
                  <p className="text-xs text-foreground leading-relaxed">{selectedOrder.reportNotes}</p>
                </div>
              )}

              {selectedOrder.impressionNotes && (
                <div className="p-3 rounded-lg border border-border bg-card space-y-1">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase">Clinical Impression:</span>
                  <p className="text-xs text-foreground leading-relaxed">{selectedOrder.impressionNotes}</p>
                </div>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
              {selectedOrder.dicomViewerUrl && (
                <Button size="sm" asChild className="gap-1.5 text-xs bg-slate-950 text-white hover:bg-slate-900 hover:text-white border border-slate-800">
                  <Link href={`/hospital-admin/radiology/viewer/${selectedOrder.id}`}>
                    <Eye className="h-3.5 w-3.5 text-cyan-400" /> Open Web DICOM PACS
                  </Link>
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Schedule Imaging Slot Modal */}
      <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSaveSchedule}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> Schedule Imaging Slot
              </DialogTitle>
              <DialogDescription className="text-xs">
                Allocate room and slot for {selectedOrder?.patientName} ({selectedOrder?.modality}).
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-3 text-xs">
              <div className="grid gap-1">
                <Label htmlFor="sc-room">Imaging Room / Machine Bay</Label>
                <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                  <SelectTrigger id="sc-room" className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockImagingSuites.map((s) => (
                      <SelectItem key={s.id} value={s.name} disabled={s.status === "Maintenance" || s.status === "Offline"}>
                        {s.name} ({s.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="sc-time">Scheduled Slot Time</Label>
                <Input
                  id="sc-time"
                  type="datetime-local"
                  required
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setScheduleModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Confirm Slot Allocation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
