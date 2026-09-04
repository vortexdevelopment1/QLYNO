"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Filter,
  FlaskConical,
  MapPin,
  QrCode,
  RefreshCw,
  Search,
  ShieldAlert,
  TestTube,
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
import {
  mockSampleCollectionTasks,
  mockRejectionReasons,
} from "@/hospital-admin/lib/mock-data/lab-extended-operations";
import { SampleCollectionTask } from "@/hospital-admin/lib/types";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Phlebotomy Collection workflow";

export default function SampleCollectionPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [tasks, setTasks] = useState<SampleCollectionTask[]>(mockSampleCollectionTasks);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Collect Modal State
  const [collectModalOpen, setCollectModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<SampleCollectionTask | null>(null);
  const [assignedCollector, setAssignedCollector] = useState("Santosh Kumar (Phlebotomist)");
  const [barcodeId, setBarcodeId] = useState("");

  // Reject / Recollection Modal State
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("HEM-01");
  const [rejectionNotes, setRejectionNotes] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch =
        t.taskId.toLowerCase().includes(search.toLowerCase()) ||
        t.patientName.toLowerCase().includes(search.toLowerCase()) ||
        t.uhid.toLowerCase().includes(search.toLowerCase()) ||
        t.patientLocation.toLowerCase().includes(search.toLowerCase()) ||
        t.testName.toLowerCase().includes(search.toLowerCase());
      const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [tasks, search, priorityFilter]);

  const pendingTasks = useMemo(() => tasks.filter((t) => t.status === "Pending"), [tasks]);

  const handleOpenCollect = (task: SampleCollectionTask) => {
    setSelectedTask(task);
    setBarcodeId(task.barcodeId || `BC-SAMP-${Math.floor(10000 + Math.random() * 90000)}`);
    setCollectModalOpen(true);
  };

  const handleConfirmCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    // Rule F13-CANNOT-3: Cannot mark sample collected without collector & timestamp
    const timestamp = new Date().toISOString();

    setTasks((prev) =>
      prev.map((t) =>
        t.taskId === selectedTask.taskId
          ? {
              ...t,
              status: "Collected",
              assignedCollector,
              barcodeId,
              collectedAt: timestamp,
            }
          : t
      )
    );

    toast({
      title: "Sample Collected & Transferred to Processing",
      description: `${selectedTask.testName} (${barcodeId}) collected by ${assignedCollector}. Status updated to Processing. (${DELEGATION_STRING})`,
    });
    setCollectModalOpen(false);
    setSelectedTask(null);
  };

  const handleOpenReject = (task: SampleCollectionTask) => {
    setSelectedTask(task);
    setRejectionModalOpen(true);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    setTasks((prev) =>
      prev.map((t) =>
        t.taskId === selectedTask.taskId
          ? {
              ...t,
              status: "Rejected",
              rejectionReason: `[${rejectionReason}] ${rejectionNotes || "Specimen failed intake QC."}`,
            }
          : t
      )
    );

    toast({
      title: "Specimen Rejected & Re-Draw Alert Dispatched",
      description: `${selectedTask.taskId} rejected (${rejectionReason}). Phlebotomy dispatch sent to ${selectedTask.patientLocation}. (${DELEGATION_STRING})`,
    });
    setRejectionModalOpen(false);
    setSelectedTask(null);
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Sample Collection Desk"
          description="Phlebotomy collection queue, ward/bed routing, barcode verification, and intake quality control."
          crumbs={[{ label: "Clinical Operations" }, { label: "Laboratory" }, { label: "Sample Collection" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading sample collection queue...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Sample Collection Desk"
        description="Phlebotomy collection queue, ward/bed routing, barcode verification, and intake quality control."
        crumbs={[{ label: "Clinical Operations" }, { label: "Laboratory" }, { label: "Sample Collection" }]}
      />

      <LabNav />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Phlebotomy &amp; Specimen Intake Hub" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
          <span>Patient Location Sync: Locations synchronized live with Inpatient Wards &amp; Beds and OPD Clinic Desks</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Pending Collections</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{pendingTasks.length} Specimens</p>
          <span className="text-[10px] text-amber-600 font-medium">Awaiting phlebotomist draw</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Stat Emergency Orders</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">
            {tasks.filter((t) => t.priority === "Stat" && t.status === "Pending").length} Stat
          </p>
          <span className="text-[10px] text-rose-600 font-medium">Immediate bedside draw</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Collected Today</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
            {tasks.filter((t) => t.status === "Collected").length} Tubes
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Transferred to Analyzers</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Intake QC Rejections</span>
          <p className="text-xl font-bold font-mono text-destructive mt-0.5">
            {tasks.filter((t) => t.status === "Rejected").length} Rejected
          </p>
          <span className="text-[10px] text-destructive font-medium">Re-collection re-dispatched</span>
        </Card>
      </div>

      {/* Collection Queue Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Phlebotomy Worklist &amp; Bedside Draw Queue</CardTitle>
          <CardDescription className="text-xs">
            Review pending sample collection orders with accurate physical ward/bed and OPD desk locations.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patient, location, barcode..."
                className="pl-8 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px] text-xs h-9">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="Stat">Stat Emergency</SelectItem>
                  <SelectItem value="Routine">Routine</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Task #</TableHead>
                  <TableHead className="text-xs font-bold">Patient Details</TableHead>
                  <TableHead className="text-xs font-bold">Current Physical Location</TableHead>
                  <TableHead className="text-xs font-bold">Test &amp; Required Specimen</TableHead>
                  <TableHead className="text-xs font-bold">Barcode ID</TableHead>
                  <TableHead className="text-xs font-bold">Priority</TableHead>
                  <TableHead className="text-xs font-bold">Status</TableHead>
                  <TableHead className="text-xs font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.taskId} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {task.taskId}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground">{task.patientName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{task.uhid}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        <span>{task.patientLocation}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-medium text-foreground">{task.testName}</div>
                      <div className="text-[10px] text-muted-foreground">{task.sampleType}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {task.barcodeId || "Generate on Draw"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          task.priority === "Stat"
                            ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[9px]"
                            : "text-[9px]"
                        }
                      >
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          task.status === "Collected"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                            : task.status === "Pending"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                            : "bg-destructive/15 text-destructive border-destructive/30 text-[10px]"
                        }
                      >
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {task.status === "Pending" ? (
                        <>
                          <Button
                            size="sm"
                            className="h-7 text-xs font-semibold"
                            onClick={() => handleOpenCollect(task)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Mark Collected
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs font-semibold text-destructive border-destructive/30"
                            onClick={() => handleOpenReject(task)}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" /> Reject QC
                          </Button>
                        </>
                      ) : (
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {task.status === "Collected" ? `By: ${task.assignedCollector?.split(" ")[0]}` : "Rejected"}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Mark Collected Modal */}
      <Dialog open={collectModalOpen} onOpenChange={setCollectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleConfirmCollection}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <TestTube className="h-5 w-5 text-primary" /> Confirm Sample Collection
              </DialogTitle>
              <DialogDescription className="text-xs">
                Record collection for {selectedTask?.patientName} at {selectedTask?.patientLocation}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-3 text-xs">
              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Investigation:</span>
                  <span className="font-semibold text-foreground">{selectedTask?.testName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tube Type:</span>
                  <span className="font-medium text-foreground">{selectedTask?.sampleType}</span>
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="c-phleb">Assigned Phlebotomist / Collector *</Label>
                <Select value={assignedCollector} onValueChange={setAssignedCollector}>
                  <SelectTrigger id="c-phleb" className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Santosh Kumar (Phlebotomist)">Santosh Kumar (Phlebotomist)</SelectItem>
                    <SelectItem value="Priya Sharma (Phlebotomist)">Priya Sharma (Phlebotomist)</SelectItem>
                    <SelectItem value="Sister Alphonsa (ICU Staff Nurse)">Sister Alphonsa (ICU Staff Nurse)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="c-bc">Sample Barcode ID *</Label>
                <Input
                  id="c-bc"
                  required
                  placeholder="e.g. BC-SAMP-99210"
                  value={barcodeId}
                  onChange={(e) => setBarcodeId(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setCollectModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Confirm &amp; Transition to Processing
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reject Specimen Modal */}
      <Dialog open={rejectionModalOpen} onOpenChange={setRejectionModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleConfirmReject}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-destructive">
                <RefreshCw className="h-5 w-5 text-destructive" /> Reject Specimen at Intake QC
              </DialogTitle>
              <DialogDescription className="text-xs">
                Log QC rejection and dispatch an automated re-draw alert.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-3 text-xs">
              <div className="grid gap-1">
                <Label htmlFor="q-rej">Rejection Reason *</Label>
                <Select value={rejectionReason} onValueChange={setRejectionReason}>
                  <SelectTrigger id="q-rej" className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockRejectionReasons.map((r) => (
                      <SelectItem key={r.id} value={r.code}>
                        [{r.code}] {r.reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="q-notes">Intake Notes</Label>
                <Input
                  id="q-notes"
                  placeholder="e.g. Underfilled tube / QNS"
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setRejectionModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" size="sm">
                Reject &amp; Request Redraw
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
