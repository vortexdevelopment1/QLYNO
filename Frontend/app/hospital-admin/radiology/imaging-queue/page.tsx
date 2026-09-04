"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  AlertOctagon,
  Camera,
  CheckCircle2,
  Clock,
  Cpu,
  FileCheck2,
  FileText,
  Filter,
  Layers,
  MapPin,
  Play,
  Radio,
  RefreshCw,
  Search,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { RadiologyNav } from "@/hospital-admin/components/radiology/radiology-nav";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { mockExtendedRadiologyOrders } from "@/hospital-admin/lib/mock-data/radiology-extended-operations";
import { RadiologyOrder } from "@/hospital-admin/lib/types";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Imaging Table & Acquisition workflow";

export default function RadiologyImagingQueuePage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [orders, setOrders] = useState<RadiologyOrder[]>(mockExtendedRadiologyOrders);
  const [search, setSearch] = useState("");

  // Complete Acquisition Modal State
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedOrderForComplete, setSelectedOrderForComplete] = useState<RadiologyOrder | null>(null);
  const [technologistName, setTechnologistName] = useState("Pooja Verma (Senior Radiographer)");
  const [seriesCount, setSeriesCount] = useState(4);
  const [imageCount, setImageCount] = useState(420);
  const [technologistNotes, setTechnologistNotes] = useState("Image acquisition completed with good signal-to-noise ratio. Contrast phase timing verified.");

  useEffect(() => {
    setMounted(true);
  }, []);

  const inProgressOrders = useMemo(() => {
    return orders.filter((o) => {
      const isInProgress = o.status === "In Progress";
      const matchesSearch =
        o.orderNo.toLowerCase().includes(search.toLowerCase()) ||
        o.patientName.toLowerCase().includes(search.toLowerCase()) ||
        o.bodyPart.toLowerCase().includes(search.toLowerCase()) ||
        o.roomName.toLowerCase().includes(search.toLowerCase());
      return isInProgress && matchesSearch;
    });
  }, [orders, search]);

  const handleOpenComplete = (order: RadiologyOrder) => {
    setSelectedOrderForComplete(order);
    setTechnologistName(order.technologistName || "Pooja Verma (Senior Radiographer)");
    setCompleteModalOpen(true);
  };

  const handleConfirmComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForComplete) return;

    // Transition from In Progress to Report Pending
    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrderForComplete.id
          ? {
              ...o,
              status: "Report Pending",
              technologistName,
              reportNotes: `Scan completed: ${seriesCount} series (${imageCount} slices/images) transferred to PACS. ${technologistNotes}`,
            }
          : o
      )
    );

    toast({
      title: "Acquisition Complete — Transferred to PACS",
      description: `${selectedOrderForComplete.bodyPart} for ${selectedOrderForComplete.patientName} (${selectedOrderForComplete.orderNo}) sent to Radiologist reading worklist. (${DELEGATION_STRING})`,
    });
    setCompleteModalOpen(false);
    setSelectedOrderForComplete(null);
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Active Imaging Table Queue"
          description="Live right-now view of patient scans currently on scanner tables with elapsed timers and technologist monitoring."
          crumbs={[{ label: "Clinical Operations" }, { label: "Radiology", href: "/hospital-admin/radiology" }, { label: "Imaging Queue" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading active imaging queue...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Active Imaging Table Queue"
        description="Live right-now view of patient scans currently on scanner tables with elapsed timers and technologist monitoring."
        crumbs={[{ label: "Clinical Operations" }, { label: "Radiology", href: "/hospital-admin/radiology" }, { label: "Imaging Queue" }]}
      />

      <RadiologyNav />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Live Modality Table Workstation" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-cyan-600" />
          <span>Right-now operational view • Technologists physical table monitoring</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Active On Scanner Tables</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">{inProgressOrders.length} Scans</p>
          <span className="text-[10px] text-cyan-600 font-medium">Acquisition in progress</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Avg Scan Duration</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">14.5 Mins</p>
          <span className="text-[10px] text-muted-foreground">Across CT, MRI &amp; X-Ray</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">On-Duty Technologists</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">4 Staff</p>
          <span className="text-[10px] text-emerald-600 font-medium">From Technicians Category</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">PACS Live Push Sync</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">100% OK</p>
          <span className="text-[10px] text-emerald-600 font-medium">Auto-DICOM upload</span>
        </Card>
      </div>

      {/* Active Scans Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Live Scanner Table Queue (In Progress)</CardTitle>
          <CardDescription className="text-xs">
            Monitor real-time scan elapsed times, assigned technologist operators, and complete imaging acquisitions.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search active scan, patient, suite..."
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
                  <TableHead className="text-xs font-bold w-[220px]">Modality &amp; Study</TableHead>
                  <TableHead className="text-xs font-bold w-[240px]">Imaging Suite Bay</TableHead>
                  <TableHead className="text-xs font-bold w-[180px]">Assigned Technologist</TableHead>
                  <TableHead className="text-xs font-bold w-[140px]">Elapsed Time</TableHead>
                  <TableHead className="text-xs font-bold text-right w-[160px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inProgressOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-xs text-muted-foreground">
                      No active scans currently on machine tables. All scheduled slots clear.
                    </TableCell>
                  </TableRow>
                ) : (
                  inProgressOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs font-bold text-primary">
                        {order.orderNo}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-xs text-foreground">{order.patientName}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {order.uhid} • <span className="font-sans font-medium text-primary">{order.patientLocation}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[10px]">
                            {order.modality}
                          </Badge>
                          <span className="truncate max-w-[160px]">{order.bodyPart}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">Dr: {order.orderingDoctor}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-xs text-foreground">{order.roomName}</div>
                        <div className="text-[10px] text-cyan-600 font-semibold flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-ping" /> Scanning Live
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-medium text-foreground flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{order.technologistName || "Pooja Verma"}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">Technician Roster</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-cyan-600">
                          <Timer className="h-3.5 w-3.5 text-cyan-600 animate-spin" style={{ animationDuration: "4s" }} />
                          <span>{order.elapsedScanMins || 12} mins</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">Started: 10:20 AM</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          className="h-7 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => handleOpenComplete(order)}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Complete &amp; Push to PACS
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

      {/* Complete Acquisition Modal */}
      <Dialog open={completeModalOpen} onOpenChange={setCompleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleConfirmComplete}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Complete Scan &amp; Transmit to PACS
              </DialogTitle>
              <DialogDescription className="text-xs">
                Certify scan execution for {selectedOrderForComplete?.patientName} ({selectedOrderForComplete?.modality} {selectedOrderForComplete?.bodyPart}).
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-3 text-xs">
              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Patient:</span>
                  <span className="font-semibold text-foreground">{selectedOrderForComplete?.patientName} ({selectedOrderForComplete?.uhid})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Scanner Bay:</span>
                  <span className="font-medium text-foreground">{selectedOrderForComplete?.roomName}</span>
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="c-tech">Executing Radiographer / Technologist *</Label>
                <Input
                  id="c-tech"
                  required
                  value={technologistName}
                  onChange={(e) => setTechnologistName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="c-ser">Acquired Series</Label>
                  <Input
                    id="c-ser"
                    type="number"
                    value={seriesCount}
                    onChange={(e) => setSeriesCount(Number(e.target.value))}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="c-img">Total Slices / Images</Label>
                  <Input
                    id="c-img"
                    type="number"
                    value={imageCount}
                    onChange={(e) => setImageCount(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="c-notes">Technologist Technical Notes</Label>
                <Input
                  id="c-notes"
                  required
                  value={technologistNotes}
                  onChange={(e) => setTechnologistNotes(e.target.value)}
                />
              </div>

              <div className="p-2.5 rounded-md border border-emerald-500/30 bg-emerald-500/5 text-emerald-800 dark:text-emerald-200 text-[11px]">
                Upon completion, this study will transition to <span className="font-bold">Report Pending</span> and land in the Radiologist Review Worklist.
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setCompleteModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Transmit to PACS &amp; Queue for Review
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
