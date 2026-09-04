"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  AlertOctagon,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Cpu,
  Edit2,
  FileSpreadsheet,
  Filter,
  Layers,
  MapPin,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Wrench,
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
import { RadiologyNav } from "@/hospital-admin/components/radiology/radiology-nav";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { mockImagingSuites } from "@/hospital-admin/lib/mock-data/radiology-extended-operations";
import { ImagingSuite, RadiologyModality, SuiteStatus, PacsConnectivityStatus } from "@/hospital-admin/lib/types";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Radiology Equipment Management workflow";

export default function RadiologyEquipmentPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [suites, setSuites] = useState<ImagingSuite[]>(mockImagingSuites);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalityFilter, setModalityFilter] = useState("all");

  // Suite Edit / Add Modal State
  const [suiteModalOpen, setSuiteModalOpen] = useState(false);
  const [editingSuite, setEditingSuite] = useState<ImagingSuite | null>(null);
  const [name, setName] = useState("");
  const [modalityType, setModalityType] = useState<RadiologyModality>("CT Scan");
  const [location, setLocation] = useState("");
  const [floor, setFloor] = useState("Ground Floor");
  const [status, setStatus] = useState<SuiteStatus>("Available");
  const [pacsConnectivityStatus, setPacsConnectivityStatus] = useState<PacsConnectivityStatus>("Connected");
  const [maintenanceNotes, setMaintenanceNotes] = useState("");

  // Planned Maintenance Modal State
  const [maintModalOpen, setMaintModalOpen] = useState(false);
  const [selectedSuiteForMaint, setSelectedSuiteForMaint] = useState<ImagingSuite | null>(null);
  const [maintDate, setMaintDate] = useState("2026-09-05");
  const [maintDesc, setMaintDesc] = useState("Preventive maintenance calibration & radiation safety audit");

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredSuites = useMemo(() => {
    return suites.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.suiteId.toLowerCase().includes(search.toLowerCase()) ||
        s.location.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      const matchesModality = modalityFilter === "all" || s.modalityType === modalityFilter;
      return matchesSearch && matchesStatus && matchesModality;
    });
  }, [suites, search, statusFilter, modalityFilter]);

  const handleOpenAdd = () => {
    setEditingSuite(null);
    setName("");
    setModalityType("CT Scan");
    setLocation("Diagnostic Block A, Ground Floor");
    setFloor("Ground Floor");
    setStatus("Available");
    setPacsConnectivityStatus("Connected");
    setMaintenanceNotes("");
    setSuiteModalOpen(true);
  };

  const handleOpenEdit = (suite: ImagingSuite) => {
    setEditingSuite(suite);
    setName(suite.name);
    setModalityType(suite.modalityType);
    setLocation(suite.location);
    setFloor(suite.floor);
    setStatus(suite.status);
    setPacsConnectivityStatus(suite.pacsConnectivityStatus);
    setMaintenanceNotes(suite.maintenanceNotes || "");
    setSuiteModalOpen(true);
  };

  const handleSaveSuite = (e: React.FormEvent) => {
    e.preventDefault();

    // Rule F14-CANNOT-11: Safety lock preventing Available status while scan is active
    if (editingSuite && editingSuite.status === "In Use" && status === "Available" && editingSuite.currentActiveOrderId) {
      toast({
        title: "Active Scan Safety Lock",
        description: "Cannot set suite to Available while an active scan (In Progress) is linked to this scanner. Complete or abort the scan first.",
        variant: "destructive",
      });
      return;
    }

    if (editingSuite) {
      setSuites((prev) =>
        prev.map((s) =>
          s.id === editingSuite.id
            ? {
                ...s,
                name,
                modalityType,
                location,
                floor,
                status,
                pacsConnectivityStatus,
                maintenanceNotes,
              }
            : s
        )
      );
      toast({
        title: "Imaging Suite Updated",
        description: `${name} configuration saved. (${DELEGATION_STRING})`,
      });
    } else {
      const newSuite: ImagingSuite = {
        id: `suite_${Date.now()}`,
        suiteId: `SUITE-${modalityType.toUpperCase().slice(0, 3)}-0${suites.length + 1}`,
        name,
        modalityType,
        location,
        floor,
        status,
        pacsConnectivityStatus,
        lastMaintenanceDate: new Date().toISOString().split("T")[0],
        nextMaintenanceDate: "2026-11-01",
        maintenanceNotes,
      };
      setSuites((prev) => [newSuite, ...prev]);
      toast({
        title: "Imaging Suite Registered",
        description: `${newSuite.name} (${newSuite.suiteId}) registered in hospital machine registry. (${DELEGATION_STRING})`,
      });
    }
    setSuiteModalOpen(false);
  };

  const handleOpenMaintenanceSchedule = (suite: ImagingSuite) => {
    setSelectedSuiteForMaint(suite);
    setMaintDate(suite.nextMaintenanceDate || "2026-09-05");
    setMaintDesc("Planned quarterly QA calibration and beam geometry alignment");
    setMaintModalOpen(true);
  };

  const handleSaveMaintenanceSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSuiteForMaint) return;

    setSuites((prev) =>
      prev.map((s) =>
        s.id === selectedSuiteForMaint.id
          ? {
              ...s,
              nextMaintenanceDate: maintDate,
              maintenanceNotes: maintDesc,
            }
          : s
      )
    );

    toast({
      title: "Planned Maintenance Scheduled",
      description: `Maintenance window booked for ${selectedSuiteForMaint.name} on ${maintDate}. (${DELEGATION_STRING})`,
    });
    setMaintModalOpen(false);
    setSelectedSuiteForMaint(null);
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Imaging Suites &amp; Equipment Registry"
          description="Manage CT/MRI/X-Ray machine bays, per-suite DICOM PACS connectivity status, and planned maintenance windows."
          crumbs={[{ label: "Clinical Operations" }, { label: "Radiology", href: "/hospital-admin/radiology" }, { label: "Equipment" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading imaging suites registry...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Imaging Suites &amp; Equipment Registry"
        description="Manage CT/MRI/X-Ray machine bays, per-suite DICOM PACS connectivity status, and planned maintenance windows."
        crumbs={[{ label: "Clinical Operations" }, { label: "Radiology", href: "/hospital-admin/radiology" }, { label: "Equipment" }]}
        actions={
          <Button size="sm" className="gap-1.5 font-semibold text-xs" onClick={handleOpenAdd}>
            <Plus className="h-4 w-4" /> Register Imaging Suite
          </Button>
        }
      />

      <RadiologyNav />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Radiology Biomedical Equipment Console" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
          <span>Suite Safety Lock: Offline/Maintenance suites cannot be booked • Active scans lock suite availability</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Imaging Suites</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{suites.length} Suites</p>
          <span className="text-[10px] text-muted-foreground">CT, MRI, Digital X-Ray, Echo</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Operational / Available</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
            {suites.filter((s) => s.status === "Available").length} Ready
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Open for slot bookings</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Currently Scanning</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">
            {suites.filter((s) => s.status === "In Use").length} Active
          </p>
          <span className="text-[10px] text-cyan-600 font-medium">Scans in progress</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Under Maintenance</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">
            {suites.filter((s) => s.status === "Maintenance" || s.status === "Offline").length} Blocked
          </p>
          <span className="text-[10px] text-amber-600 font-medium">Slot booking locked</span>
        </Card>
      </div>

      {/* Suites Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Configured Machine Bays &amp; Modality Suites</CardTitle>
          <CardDescription className="text-xs">
            Review live operational readiness, per-suite DICOM network connectivity, and calibration dates.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search suite name, ID, or location..."
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

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] text-xs h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="In Use">In Use</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold w-[120px]">Suite ID</TableHead>
                  <TableHead className="text-xs font-bold w-[240px]">Machine Suite Name</TableHead>
                  <TableHead className="text-xs font-bold w-[130px]">Modality</TableHead>
                  <TableHead className="text-xs font-bold w-[200px]">Physical Location</TableHead>
                  <TableHead className="text-xs font-bold w-[120px]">Operating Status</TableHead>
                  <TableHead className="text-xs font-bold w-[130px]">PACS Link</TableHead>
                  <TableHead className="text-xs font-bold w-[130px]">Next Maintenance</TableHead>
                  <TableHead className="text-xs font-bold text-right w-[180px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuites.map((suite) => (
                  <TableRow key={suite.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {suite.suiteId}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground">{suite.name}</div>
                      {suite.maintenanceNotes && (
                        <div className="text-[10px] text-muted-foreground truncate max-w-[220px]">
                          {suite.maintenanceNotes}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-medium">
                        {suite.modalityType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="truncate max-w-[180px]">{suite.location}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">{suite.floor}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          suite.status === "Available"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                            : suite.status === "In Use"
                            ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 text-[10px]"
                            : suite.status === "Maintenance"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                            : "bg-destructive/15 text-destructive border-destructive/30 text-[10px]"
                        }
                      >
                        {suite.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            suite.pacsConnectivityStatus === "Connected"
                              ? "bg-emerald-500"
                              : suite.pacsConnectivityStatus === "Degraded"
                              ? "bg-amber-500 animate-pulse"
                              : "bg-destructive"
                          }`}
                        />
                        <span className="text-xs font-mono">{suite.pacsConnectivityStatus}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {suite.nextMaintenanceDate}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs font-medium"
                        onClick={() => handleOpenMaintenanceSchedule(suite)}
                      >
                        <Wrench className="h-3 w-3 mr-1" /> Service
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs font-medium text-primary"
                        onClick={() => handleOpenEdit(suite)}
                      >
                        <Edit2 className="h-3 w-3 mr-1" /> Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit Suite Modal */}
      <Dialog open={suiteModalOpen} onOpenChange={setSuiteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSaveSuite}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Cpu className="h-5 w-5 text-primary" /> {editingSuite ? "Edit Imaging Suite" : "Register New Imaging Suite"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Configure scanner hardware bay parameters, DICOM PACS link, and location.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-3 text-xs">
              <div className="grid gap-1">
                <Label htmlFor="s-name">Suite / Machine Name *</Label>
                <Input
                  id="s-name"
                  required
                  placeholder="e.g. 128-Slice Multi-Detector CT Suite"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="s-mod">Modality Type</Label>
                  <Select value={modalityType} onValueChange={(v) => setModalityType(v as RadiologyModality)}>
                    <SelectTrigger id="s-mod" className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CT Scan">CT Scan</SelectItem>
                      <SelectItem value="MRI">3.0T MRI</SelectItem>
                      <SelectItem value="X-Ray">Digital X-Ray</SelectItem>
                      <SelectItem value="Ultrasound">Ultrasound / Echo</SelectItem>
                      <SelectItem value="PET-CT">PET-CT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="s-floor">Building Floor</Label>
                  <Select value={floor} onValueChange={setFloor}>
                    <SelectTrigger id="s-floor" className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Basement 1">Basement 1 (Shielded Core)</SelectItem>
                      <SelectItem value="Ground Floor">Ground Floor (Emergency Wing)</SelectItem>
                      <SelectItem value="1st Floor">1st Floor (Trauma &amp; Ortho)</SelectItem>
                      <SelectItem value="2nd Floor">2nd Floor (Cardiology)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="s-loc">Location Description *</Label>
                <Input
                  id="s-loc"
                  required
                  placeholder="e.g. Diagnostic Block A, Ground Floor"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="s-stat">Operating Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as SuiteStatus)}>
                    <SelectTrigger id="s-stat" className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="In Use">In Use</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="s-pacs">PACS / DICOM Network</Label>
                  <Select value={pacsConnectivityStatus} onValueChange={(v) => setPacsConnectivityStatus(v as PacsConnectivityStatus)}>
                    <SelectTrigger id="s-pacs" className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Connected">Connected (Sync Active)</SelectItem>
                      <SelectItem value="Degraded">Degraded (High Latency)</SelectItem>
                      <SelectItem value="Offline">Offline (Link Down)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="s-notes">Maintenance &amp; Calibration Notes</Label>
                <Input
                  id="s-notes"
                  placeholder="e.g. Helium level normal, tube cooling QA passed"
                  value={maintenanceNotes}
                  onChange={(e) => setMaintenanceNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setSuiteModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Suite Configuration
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Schedule Planned Maintenance Modal */}
      <Dialog open={maintModalOpen} onOpenChange={setMaintModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSaveMaintenanceSchedule}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Wrench className="h-5 w-5 text-amber-600" /> Schedule Machine Maintenance
              </DialogTitle>
              <DialogDescription className="text-xs">
                Book a preventive maintenance window for {selectedSuiteForMaint?.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-3 text-xs">
              <div className="p-2.5 rounded-lg border border-border bg-muted/20">
                <span className="text-muted-foreground block text-[10px]">Machine Suite:</span>
                <span className="font-semibold text-foreground">{selectedSuiteForMaint?.name} ({selectedSuiteForMaint?.suiteId})</span>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="m-date">Scheduled Maintenance Date *</Label>
                <Input
                  id="m-date"
                  type="date"
                  required
                  value={maintDate}
                  onChange={(e) => setMaintDate(e.target.value)}
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="m-desc">Scope of Service &amp; Calibration Protocol *</Label>
                <Input
                  id="m-desc"
                  required
                  value={maintDesc}
                  onChange={(e) => setMaintDesc(e.target.value)}
                />
              </div>

              <div className="p-2 rounded-md border border-amber-500/30 bg-amber-500/5 text-amber-800 dark:text-amber-200 text-[11px]">
                Maintenance Protocol: During maintenance windows, this suite will be locked from patient slot allocations.
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setMaintModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Confirm Maintenance Window
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
