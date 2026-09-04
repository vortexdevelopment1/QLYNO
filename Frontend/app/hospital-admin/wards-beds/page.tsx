"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import {
  AlertCircle,
  Building,
  Building2,
  CheckCircle2,
  Edit,
  Eye,
  Filter,
  Layers,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Users,
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
import { addWard, updateWard, deactivateWard } from "@/hospital-admin/store/slices/wardsBedsSlice";
import { Ward, WardType } from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";

export default function AllWardsPage() {
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { wards, beds } = useSelector((state: RootState) => state.wardsBeds);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [floorFilter, setFloorFilter] = useState("all");

  // Create / Edit Ward Modal
  const [wardModalOpen, setWardModalOpen] = useState(false);
  const [editingWard, setEditingWard] = useState<Ward | null>(null);
  const [wardName, setWardName] = useState("");
  const [wardType, setWardType] = useState<WardType>("General");
  const [wardFloor, setWardFloor] = useState("2nd Floor - East Wing");
  const [wardDept, setWardDept] = useState("General Medicine");
  const [wardBeds, setWardBeds] = useState(6);

  // Deactivate Guard Modal
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [wardToDeactivate, setWardToDeactivate] = useState<Ward | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredWards = useMemo(() => {
    return wards.filter((w) => {
      const matchesSearch =
        w.name.toLowerCase().includes(search.toLowerCase()) ||
        w.department.toLowerCase().includes(search.toLowerCase()) ||
        w.floor.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || w.type === typeFilter;
      const matchesFloor = floorFilter === "all" || w.floor.includes(floorFilter);
      return matchesSearch && matchesType && matchesFloor;
    });
  }, [wards, search, typeFilter, floorFilter]);

  const totalCapacity = wards.reduce((sum, w) => sum + w.totalBeds, 0);
  const totalOccupied = beds.filter((b) => b.status === "Occupied").length;
  const totalAvailable = beds.filter((b) => b.status === "Available").length;
  const occupancyPercent = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

  const handleOpenAddWard = () => {
    setEditingWard(null);
    setWardName("");
    setWardType("General");
    setWardFloor("2nd Floor - East Wing");
    setWardDept("General Medicine");
    setWardBeds(6);
    setWardModalOpen(true);
  };

  const handleOpenEditWard = (ward: Ward) => {
    setEditingWard(ward);
    setWardName(ward.name);
    setWardType(ward.type);
    setWardFloor(ward.floor);
    setWardDept(ward.department);
    setWardBeds(ward.totalBeds);
    setWardModalOpen(true);
  };

  const handleSaveWard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wardName.trim()) return;

    if (editingWard) {
      dispatch(
        updateWard({
          ...editingWard,
          name: wardName.trim(),
          type: wardType,
          floor: wardFloor,
          department: wardDept,
          totalBeds: wardBeds,
        })
      );
      toast({
        title: "Ward Configuration Updated",
        description: `${wardName} parameters refreshed.`,
      });
    } else {
      dispatch(
        addWard({
          name: wardName.trim(),
          type: wardType,
          floor: wardFloor,
          department: wardDept,
          totalBeds: wardBeds,
          status: "Active",
        })
      );
      toast({
        title: "Ward Registered",
        description: `${wardName} added with ${wardBeds} bed capacity.`,
      });
    }
    setWardModalOpen(false);
  };

  const handlePromptDeactivate = (ward: Ward) => {
    setWardToDeactivate(ward);
    setDeactivateModalOpen(true);
  };

  const handleConfirmDeactivate = () => {
    if (!wardToDeactivate) return;

    // Rule F12-CANNOT-4: Zero-Occupancy Guard
    const activeBedsInWard = beds.filter(
      (b) => b.wardId === wardToDeactivate.id && (b.status === "Occupied" || b.status === "Reserved")
    );

    if (activeBedsInWard.length > 0) {
      toast({
        title: "Deactivation Blocked",
        description: `Cannot deactivate ${wardToDeactivate.name}: There are ${activeBedsInWard.length} occupied or reserved beds in this ward.`,
        variant: "destructive",
      });
      setDeactivateModalOpen(false);
      return;
    }

    dispatch(deactivateWard(wardToDeactivate.id));
    toast({
      title: "Ward Deactivated",
      description: `${wardToDeactivate.name} has been archived.`,
    });
    setDeactivateModalOpen(false);
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Wards &amp; Beds Management"
          description="Inpatient accommodation units, real-time spatial floor grids, ICU/HDU bed reservations, and cleaning turnaround."
          crumbs={[{ label: "Clinical Operations" }, { label: "Wards & Beds" }]}
        />
        <WardsBedsNav />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading wards &amp; beds infrastructure...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Wards &amp; Beds Management"
        description="Inpatient accommodation units, real-time spatial floor grids, ICU/HDU bed reservations, and cleaning turnaround."
        crumbs={[{ label: "Clinical Operations" }, { label: "Wards & Beds" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" asChild className="gap-1.5 font-semibold text-xs">
              <Link href="/hospital-admin/wards-beds/bed-map">
                <Eye className="h-4 w-4" /> Open Floor Bed Map
              </Link>
            </Button>
            <Button size="sm" className="gap-1.5 font-semibold text-xs" onClick={handleOpenAddWard}>
              <Plus className="h-4 w-4" /> Add Ward Unit
            </Button>
          </div>
        }
      />

      <WardsBedsNav />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Inpatient Capacity</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{totalCapacity} Beds</p>
          <span className="text-[10px] text-muted-foreground">Across {wards.length} Ward Units</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Hospital Occupancy</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{occupancyPercent}%</p>
          <span className="text-[10px] text-emerald-600 font-medium">{totalOccupied} Admitted Inpatients</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Immediate Available Beds</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">{totalAvailable} Beds Ready</p>
          <span className="text-[10px] text-cyan-600 font-medium">Cleaned &amp; Disinfected</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Bed Single Source of Truth</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">Live Sync</p>
          <span className="text-[10px] text-emerald-600 font-medium">Synced with IPD &amp; Emergency</span>
        </Card>
      </div>

      {/* Wards Directory Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Inpatient Ward Units Registry</CardTitle>
          <CardDescription className="text-xs">
            Manage physical wards, bed capacity boundaries, and clinical specialty assignments.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ward name, department, or floor..."
                className="pl-8 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px] text-xs h-9">
                  <SelectValue placeholder="Ward Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="General">General Ward</SelectItem>
                  <SelectItem value="ICU">ICU Tier</SelectItem>
                  <SelectItem value="CCU">CCU &amp; HDU</SelectItem>
                  <SelectItem value="Isolation">Isolation Unit</SelectItem>
                  <SelectItem value="Deluxe">Deluxe Suites</SelectItem>
                </SelectContent>
              </Select>

              <Select value={floorFilter} onValueChange={setFloorFilter}>
                <SelectTrigger className="w-[130px] text-xs h-9">
                  <SelectValue placeholder="Floor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Floors</SelectItem>
                  <SelectItem value="2nd Floor">2nd Floor</SelectItem>
                  <SelectItem value="3rd Floor">3rd Floor</SelectItem>
                  <SelectItem value="4th Floor">4th Floor</SelectItem>
                  <SelectItem value="5th Floor">5th Floor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Ward Name</TableHead>
                  <TableHead className="text-xs font-bold">Tier / Classification</TableHead>
                  <TableHead className="text-xs font-bold">Floor &amp; Location</TableHead>
                  <TableHead className="text-xs font-bold">Department</TableHead>
                  <TableHead className="text-xs font-bold">Bed Allocation (Occ / Total)</TableHead>
                  <TableHead className="text-xs font-bold">Available</TableHead>
                  <TableHead className="text-xs font-bold">Status</TableHead>
                  <TableHead className="text-xs font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWards.map((ward) => {
                  const wardOccupied = beds.filter((b) => b.wardId === ward.id && b.status === "Occupied").length;
                  const wardAvailable = beds.filter((b) => b.wardId === ward.id && b.status === "Available").length;
                  const pct = ward.totalBeds > 0 ? Math.round((wardOccupied / ward.totalBeds) * 100) : 0;

                  return (
                    <TableRow key={ward.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="font-semibold text-xs text-foreground">{ward.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{ward.id}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            ward.type === "ICU"
                              ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px]"
                              : ward.type === "Isolation"
                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                              : "text-[10px]"
                          }
                        >
                          {ward.type} Ward
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{ward.floor}</TableCell>
                      <TableCell className="text-xs font-medium text-muted-foreground">{ward.department}</TableCell>
                      <TableCell>
                        <div className="space-y-1 w-36">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span>{wardOccupied} / {ward.totalBeds}</span>
                            <span className="font-bold">{pct}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                pct >= 85 ? "bg-rose-500" : pct >= 60 ? "bg-amber-500" : "bg-emerald-500"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold text-emerald-600">
                        {wardAvailable} Ready
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            ward.status === "Active"
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                              : "bg-muted text-muted-foreground text-[10px]"
                          }
                        >
                          {ward.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-primary hover:text-primary"
                          onClick={() => handleOpenEditWard(ward)}
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handlePromptDeactivate(ward)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create / Edit Ward Modal */}
      <Dialog open={wardModalOpen} onOpenChange={setWardModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSaveWard}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" /> {editingWard ? "Edit Ward Configuration" : "Register New Inpatient Ward"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Configure physical ward dimensions, clinical category, and bed allocations.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-3 text-xs">
              <div className="grid gap-1">
                <Label htmlFor="w-name">Ward Unit Name *</Label>
                <Input
                  id="w-name"
                  required
                  placeholder="e.g. Pediatric Intensive Care Unit (PICU)"
                  value={wardName}
                  onChange={(e) => setWardName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="w-type">Ward Classification Tier</Label>
                  <Select value={wardType} onValueChange={(val: any) => setWardType(val)}>
                    <SelectTrigger id="w-type" className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General Ward</SelectItem>
                      <SelectItem value="ICU">Intensive Care Unit (ICU)</SelectItem>
                      <SelectItem value="CCU">Coronary Care &amp; HDU</SelectItem>
                      <SelectItem value="Isolation">Airborne / Isolation</SelectItem>
                      <SelectItem value="Maternity">Maternity &amp; Labor</SelectItem>
                      <SelectItem value="NICU">Neonatal ICU (NICU)</SelectItem>
                      <SelectItem value="Deluxe">Executive Deluxe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="w-beds">Total Bed Capacity</Label>
                  <Input
                    id="w-beds"
                    type="number"
                    min={1}
                    max={50}
                    required
                    value={wardBeds}
                    onChange={(e) => setWardBeds(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="w-floor">Floor &amp; Wing Location</Label>
                  <Input
                    id="w-floor"
                    required
                    value={wardFloor}
                    onChange={(e) => setWardFloor(e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="w-dept">Responsible Department</Label>
                  <Input
                    id="w-dept"
                    required
                    value={wardDept}
                    onChange={(e) => setWardDept(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setWardModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                {editingWard ? "Save Changes" : "Create Ward Unit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deactivate Ward Guard Modal (Rule F12-CANNOT-4) */}
      <Dialog open={deactivateModalOpen} onOpenChange={setDeactivateModalOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5 text-destructive" /> Deactivate Ward Unit
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to deactivate <strong>{wardToDeactivate?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 text-xs space-y-2">
            <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Department:</span>
                <span className="font-semibold text-foreground">{wardToDeactivate?.department}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Beds:</span>
                <span className="font-mono text-foreground">{wardToDeactivate?.totalBeds} Beds</span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Hospital governance strictly forbids deactivating wards with active or reserved patients. All beds must be vacant or transferred.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => setDeactivateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" size="sm" onClick={handleConfirmDeactivate}>
              Confirm Deactivation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
