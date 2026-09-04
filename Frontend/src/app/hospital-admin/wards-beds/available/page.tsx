"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import {
  Activity,
  CheckCircle2,
  Filter,
  Layers,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
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
import { allocateBed } from "@/hospital-admin/store/slices/wardsBedsSlice";
import { Bed } from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";

export default function AvailableBedsPage() {
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { beds } = useSelector((state: RootState) => state.wardsBeds);

  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");

  // Allocation Modal State
  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [doctorName, setDoctorName] = useState("Dr. Ananya Patel");
  const [admissionType, setAdmissionType] = useState<"Emergency" | "Elective IPD" | "OT Post-Op" | "Direct Transfer">("Elective IPD");

  useEffect(() => {
    setMounted(true);
  }, []);

  const availableBeds = useMemo(() => {
    return beds.filter((b) => {
      const isAvail = b.status === "Available";
      const matchesSearch =
        b.bedNumber.toLowerCase().includes(search.toLowerCase()) ||
        b.wardName.toLowerCase().includes(search.toLowerCase()) ||
        b.floor.toLowerCase().includes(search.toLowerCase());
      const matchesTier = tierFilter === "all" || b.tier === tierFilter;
      return isAvail && matchesSearch && matchesTier;
    });
  }, [beds, search, tierFilter]);

  const handleOpenAllocate = (bed: Bed) => {
    setSelectedBed(bed);
    setPatientName("");
    setPatientId(`P-${Math.floor(1000 + Math.random() * 9000)}`);
    setAllocateModalOpen(true);
  };

  const handleExecuteAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBed) return;

    dispatch(
      allocateBed({
        bedId: selectedBed.id,
        patientId: patientId || `P-${Math.floor(1000 + Math.random() * 9000)}`,
        patientName,
        doctorName,
        admissionType,
      })
    );

    toast({
      title: "Bed Allocated Successfully",
      description: `${selectedBed.bedNumber} assigned to ${patientName}.`,
    });
    setAllocateModalOpen(false);
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Available Beds Directory"
          description="Immediate ready-for-intake bed inventory across general, critical care, and private tiers."
          crumbs={[{ label: "Clinical Operations" }, { label: "Wards & Beds", href: "/hospital-admin/wards-beds" }, { label: "Available Beds" }]}
        />
        <WardsBedsNav />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading available beds...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Available Beds Directory"
        description="Immediate ready-for-intake bed inventory across general, critical care, and private tiers."
        crumbs={[{ label: "Clinical Operations" }, { label: "Wards & Beds", href: "/hospital-admin/wards-beds" }, { label: "Available Beds" }]}
      />

      <WardsBedsNav />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Available Beds</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{availableBeds.length} Ready</p>
          <span className="text-[10px] text-emerald-600 font-medium">Cleaned &amp; Disinfected</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">ICU / Critical Care Ready</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">
            {availableBeds.filter((b) => b.tier === "ICU" || b.tier === "CCU").length} Beds
          </p>
          <span className="text-[10px] text-rose-600 font-medium">Ventilator ready</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Isolation Units Ready</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">
            {availableBeds.filter((b) => b.tier === "Isolation").length} Beds
          </p>
          <span className="text-[10px] text-amber-600 font-medium">Negative pressure certified</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Cross-Module Feed</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">Active</p>
          <span className="text-[10px] text-primary font-medium">Single source query endpoint</span>
        </Card>
      </div>

      {/* Available Beds Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Ready-to-Occupy Inpatient Beds</CardTitle>
          <CardDescription className="text-xs">
            Query and allocate sanitized beds across all hospital floors.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bed number, ward, or floor..."
                className="pl-8 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="w-[150px] text-xs h-9">
                  <SelectValue placeholder="Tier Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="General">General Ward</SelectItem>
                  <SelectItem value="ICU">ICU Tier</SelectItem>
                  <SelectItem value="CCU">CCU &amp; HDU</SelectItem>
                  <SelectItem value="Isolation">Isolation</SelectItem>
                  <SelectItem value="Private Suite">Private Suite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Bed Number</TableHead>
                  <TableHead className="text-xs font-bold">Ward Unit</TableHead>
                  <TableHead className="text-xs font-bold">Tier / Classification</TableHead>
                  <TableHead className="text-xs font-bold">Floor &amp; Location</TableHead>
                  <TableHead className="text-xs font-bold">Attached Equipment</TableHead>
                  <TableHead className="text-xs font-bold">Nurse Ratio</TableHead>
                  <TableHead className="text-xs font-bold text-right">Quick Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availableBeds.map((bed) => (
                  <TableRow key={bed.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-emerald-600">
                      {bed.bedNumber}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-foreground">{bed.wardName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {bed.tier}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{bed.floor}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[240px]">
                        {bed.attachedEquipment && bed.attachedEquipment.length > 0 ? (
                          bed.attachedEquipment.map((eq) => (
                            <Badge key={eq} variant="secondary" className="text-[9px]">
                              {eq}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-[11px] text-muted-foreground">Standard Consoles</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {bed.nurseToPatientRatio || "1:4"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        className="h-7 text-xs font-semibold"
                        onClick={() => handleOpenAllocate(bed)}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" /> Allocate Bed
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Bed Allocation Modal (Rule F12-CAN-10 & CAN-16) */}
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
                <Label htmlFor="al-pat-2">Patient Full Name *</Label>
                <Input
                  id="al-pat-2"
                  required
                  placeholder="e.g. Ramesh Deshmukh"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="al-id-2">Patient UHID / ID</Label>
                  <Input
                    id="al-id-2"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="al-doc-2">Attending Doctor</Label>
                  <Input
                    id="al-doc-2"
                    required
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="al-src-2">Admission Source</Label>
                <Select value={admissionType} onValueChange={(val: any) => setAdmissionType(val)}>
                  <SelectTrigger id="al-src-2" className="text-xs">
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
