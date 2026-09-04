"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import {
  Activity,
  AlertCircle,
  ArrowRightLeft,
  Bookmark,
  CheckCircle2,
  Clock,
  Cpu,
  Filter,
  Grid,
  HeartPulse,
  Layers,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  User,
  UserCheck,
  Wrench,
  X,
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
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { WardsBedsNav } from "@/hospital-admin/components/wards-beds/wards-beds-nav";
import { allocateBed, releaseBed } from "@/hospital-admin/store/slices/wardsBedsSlice";
import { Bed, BedStatus } from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";

export default function BedMapPage() {
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { wards, beds } = useSelector((state: RootState) => state.wardsBeds);

  const [selectedWardId, setSelectedWardId] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Drawer / Selection State
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);

  // Quick Allocation Modal State
  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [doctorName, setDoctorName] = useState("Dr. Ananya Patel");
  const [admissionType, setAdmissionType] = useState<"Emergency" | "Elective IPD" | "OT Post-Op" | "Direct Transfer">("Elective IPD");
  const [isolationPrecaution, setIsolationPrecaution] = useState<"Droplet" | "Airborne" | "Contact" | "None">("None");

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredBeds = useMemo(() => {
    return beds.filter((b) => {
      const matchesWard = selectedWardId === "all" || b.wardId === selectedWardId;
      const matchesStatus = statusFilter === "all" || b.status === statusFilter;
      const matchesSearch =
        b.bedNumber.toLowerCase().includes(search.toLowerCase()) ||
        b.wardName.toLowerCase().includes(search.toLowerCase()) ||
        (b.currentPatientName && b.currentPatientName.toLowerCase().includes(search.toLowerCase()));
      return matchesWard && matchesStatus && matchesSearch;
    });
  }, [beds, selectedWardId, statusFilter, search]);

  const handleBedClick = (bed: Bed) => {
    setSelectedBed(bed);
    if (bed.status === "Available") {
      setPatientName("");
      setPatientId(`P-${Math.floor(1000 + Math.random() * 9000)}`);
      setIsolationPrecaution(bed.isolationFlags || "None");
      setAllocateModalOpen(true);
    }
  };

  const handleExecuteAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBed) return;

    // Guard: Clinical Tier Matching (Rule F12-CANNOT-2 & CANNOT-3)
    if (isolationPrecaution !== "None" && selectedBed.tier !== "Isolation") {
      toast({
        title: "Clinical Isolation Guard",
        description: "Patients requiring droplet/airborne precautions must be allocated to an Isolation-tier bed.",
        variant: "destructive",
      });
      return;
    }

    dispatch(
      allocateBed({
        bedId: selectedBed.id,
        patientId: patientId || `P-${Math.floor(1000 + Math.random() * 9000)}`,
        patientName,
        doctorName,
        admissionType,
        isolationPrecautions: isolationPrecaution,
      })
    );

    toast({
      title: "Bed Allocated Successfully",
      description: `${selectedBed.bedNumber} (${selectedBed.wardName}) assigned to ${patientName}.`,
    });
    setAllocateModalOpen(false);
    setSelectedBed(null);
  };

  const handleDischargePatient = (bed: Bed) => {
    dispatch(
      releaseBed({
        bedId: bed.id,
        releasedBy: "Hospital Admin",
        reason: "Patient discharged following clinical clearance.",
      })
    );

    toast({
      title: "Patient Discharged",
      description: `${bed.bedNumber} released and auto-transitioned to Cleaning Turnaround.`,
    });
    setSelectedBed(null);
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Interactive Floor Bed Map &amp; Spatial Grid"
          description="Real-time live occupancy layout across all hospital floors, critical care bays, and isolation suites."
          crumbs={[{ label: "Clinical Operations" }, { label: "Wards & Beds", href: "/hospital-admin/wards-beds" }, { label: "Bed Map" }]}
        />
        <WardsBedsNav />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading interactive spatial bed grid...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Interactive Floor Bed Map &amp; Spatial Grid"
        description="Real-time live occupancy layout across all hospital floors, critical care bays, and isolation suites."
        crumbs={[{ label: "Clinical Operations" }, { label: "Wards & Beds", href: "/hospital-admin/wards-beds" }, { label: "Bed Map" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" asChild className="gap-1.5 font-semibold text-xs">
              <Link href="/hospital-admin/wards-beds/available">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> View Available Beds List
              </Link>
            </Button>
          </div>
        }
      />

      <WardsBedsNav />

      {/* Legend & Filter Bar */}
      <Card className="border-border shadow-xs">
        <CardContent className="p-3 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Status Color Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
              <span className="font-medium text-muted-foreground">Available ({beds.filter((b) => b.status === "Available").length})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-rose-500 ring-2 ring-rose-500/20" />
              <span className="font-medium text-muted-foreground">Occupied ({beds.filter((b) => b.status === "Occupied").length})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-amber-500 ring-2 ring-amber-500/20" />
              <span className="font-medium text-muted-foreground">Reserved ({beds.filter((b) => b.status === "Reserved").length})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-cyan-500 ring-2 ring-cyan-500/20" />
              <span className="font-medium text-muted-foreground">Cleaning ({beds.filter((b) => b.status === "Cleaning").length})</span>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select value={selectedWardId} onValueChange={setSelectedWardId}>
              <SelectTrigger className="w-[180px] text-xs h-8">
                <SelectValue placeholder="Ward Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Hospital-Wide View</SelectItem>
                {wards.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] text-xs h-8">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Occupied">Occupied</SelectItem>
                <SelectItem value="Reserved">Reserved</SelectItem>
                <SelectItem value="Cleaning">Cleaning</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Spatial Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {wards
          .filter((w) => selectedWardId === "all" || w.id === selectedWardId)
          .map((ward) => {
            const wardBeds = filteredBeds.filter((b) => b.wardId === ward.id);
            if (wardBeds.length === 0 && selectedWardId !== "all") return null;

            return (
              <Card key={ward.id} className="border-border shadow-xs flex flex-col">
                <CardHeader className="p-3.5 pb-2 border-b border-border/60 bg-muted/20">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xs font-bold text-foreground">{ward.name}</CardTitle>
                      <CardDescription className="text-[10px] text-muted-foreground">
                        {ward.floor} • {ward.type} Tier
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {wardBeds.filter((b) => b.status === "Occupied").length} / {ward.totalBeds} Occ
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-3 flex-1">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {wardBeds.map((bed) => {
                      const isAvailable = bed.status === "Available";
                      const isOccupied = bed.status === "Occupied";
                      const isReserved = bed.status === "Reserved";
                      const isCleaning = bed.status === "Cleaning";

                      return (
                        <div
                          key={bed.id}
                          onClick={() => handleBedClick(bed)}
                          className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xs relative flex flex-col justify-between min-h-[90px] ${
                            isAvailable
                              ? "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500"
                              : isOccupied
                              ? "border-rose-500/30 bg-rose-500/5 hover:border-rose-500"
                              : isReserved
                              ? "border-amber-500/30 bg-amber-500/5 hover:border-amber-500"
                              : "border-cyan-500/30 bg-cyan-500/5 hover:border-cyan-500"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-foreground">{bed.bedNumber}</span>
                            <div
                              className={`h-2 w-2 rounded-full ${
                                isAvailable
                                  ? "bg-emerald-500 ring-2 ring-emerald-500/20"
                                  : isOccupied
                                  ? "bg-rose-500 ring-2 ring-rose-500/20"
                                  : isReserved
                                  ? "bg-amber-500 ring-2 ring-amber-500/20"
                                  : "bg-cyan-500 ring-2 ring-cyan-500/20"
                              }`}
                            />
                          </div>

                          <div className="my-1">
                            {isOccupied ? (
                              <div>
                                <p className="text-[11px] font-semibold text-foreground truncate">
                                  {bed.currentPatientName}
                                </p>
                                <p className="text-[9px] text-muted-foreground font-mono">
                                  {bed.currentPatientId} • {bed.lengthOfStayDays}d LOS
                                </p>
                              </div>
                            ) : isReserved ? (
                              <div>
                                <p className="text-[10px] font-medium text-amber-700 dark:text-amber-300 truncate">
                                  {bed.reservedForPatientName || "Reserved"}
                                </p>
                                <p className="text-[9px] text-muted-foreground">Holding for intake</p>
                              </div>
                            ) : isCleaning ? (
                              <div>
                                <p className="text-[10px] font-medium text-cyan-700 dark:text-cyan-300">Sanitizing</p>
                                <p className="text-[9px] text-muted-foreground">{bed.turnoverETA || "Turnaround in prog"}</p>
                              </div>
                            ) : (
                              <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                                <Plus className="h-3 w-3" /> Ready for Intake
                              </div>
                            )}
                          </div>

                          <div className="pt-1 border-t border-border/40 flex items-center justify-between text-[9px] text-muted-foreground">
                            <span>{bed.tier}</span>
                            {bed.negativePressure && <span className="text-amber-600 font-bold">Neg Pres</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Bed Detail Drawer for Occupied / Cleaning / Reserved Beds */}
      {selectedBed && selectedBed.status !== "Available" && (
        <Dialog open={!!selectedBed} onOpenChange={() => setSelectedBed(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <span className="font-mono text-primary">{selectedBed.bedNumber}</span> Details ({selectedBed.wardName})
              </DialogTitle>
              <DialogDescription className="text-xs">
                {selectedBed.floor} • {selectedBed.tier} Tier Accommodation
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2 text-xs">
              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Current Status:</span>
                  <Badge
                    className={
                      selectedBed.status === "Occupied"
                        ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px]"
                        : selectedBed.status === "Reserved"
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                        : "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 text-[10px]"
                    }
                  >
                    {selectedBed.status}
                  </Badge>
                </div>

                {selectedBed.status === "Occupied" && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Admitted Patient:</span>
                      <span className="font-semibold text-foreground">{selectedBed.currentPatientName} ({selectedBed.currentPatientId})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Attending Physician:</span>
                      <span className="font-medium">{selectedBed.admittingDoctor || "Dr. Ananya Patel"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Admission Date &amp; LOS:</span>
                      <span className="font-mono">{selectedBed.admissionDate} ({selectedBed.lengthOfStayDays} Days)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Nurse-to-Patient Ratio:</span>
                      <span className="font-mono font-bold text-primary">{selectedBed.nurseToPatientRatio || "1:4"}</span>
                    </div>
                  </>
                )}

                {selectedBed.attachedEquipment && selectedBed.attachedEquipment.length > 0 && (
                  <div className="pt-1.5 border-t border-border/40">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Attached Equipment:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedBed.attachedEquipment.map((eq) => (
                        <Badge key={eq} variant="secondary" className="text-[10px]">
                          {eq}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className="gap-2">
              {selectedBed.status === "Occupied" && (
                <>
                  <Button size="sm" variant="outline" asChild className="text-xs">
                    <Link href="/hospital-admin/wards-beds/transfer">
                      <ArrowRightLeft className="h-3.5 w-3.5 mr-1" /> Transfer Patient
                    </Link>
                  </Button>
                  <Button size="sm" variant="destructive" className="text-xs" onClick={() => handleDischargePatient(selectedBed)}>
                    Discharge &amp; Sanitize
                  </Button>
                </>
              )}
              {selectedBed.status === "Cleaning" && (
                <Button size="sm" asChild className="text-xs">
                  <Link href="/hospital-admin/wards-beds/cleaning">
                    <Sparkles className="h-3.5 w-3.5 mr-1" /> View Cleaning Task
                  </Link>
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Quick Bed Allocation Modal for Available Beds (Rule F12-CAN-8 & CAN-16) */}
      <Dialog open={allocateModalOpen} onOpenChange={setAllocateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleExecuteAllocation}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Allocate Bed {selectedBed?.bedNumber}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Assign {selectedBed?.wardName} ({selectedBed?.tier} Tier) to an admitted patient.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-3 text-xs">
              <div className="grid gap-1">
                <Label htmlFor="al-pat">Patient Full Name *</Label>
                <Input
                  id="al-pat"
                  required
                  placeholder="e.g. Ramesh Deshmukh"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="al-id">Patient UHID / ID</Label>
                  <Input
                    id="al-id"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="al-doc">Attending Doctor</Label>
                  <Input
                    id="al-doc"
                    required
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="al-type">Admission Source</Label>
                  <Select value={admissionType} onValueChange={(val: any) => setAdmissionType(val)}>
                    <SelectTrigger id="al-type" className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Elective IPD">Elective IPD Admission</SelectItem>
                      <SelectItem value="Emergency">Emergency Case Disposition</SelectItem>
                      <SelectItem value="OT Post-Op">OT Post-Op PACU Handoff</SelectItem>
                      <SelectItem value="Direct Transfer">Direct Hospital Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="al-iso">Isolation Precautions</Label>
                  <Select value={isolationPrecaution} onValueChange={(val: any) => setIsolationPrecaution(val)}>
                    <SelectTrigger id="al-iso" className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="None">Standard (No Isolation)</SelectItem>
                      <SelectItem value="Droplet">Droplet Precautions</SelectItem>
                      <SelectItem value="Airborne">Airborne / Negative Pressure</SelectItem>
                      <SelectItem value="Contact">Contact Isolation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setAllocateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Confirm &amp; Allocate Bed
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
