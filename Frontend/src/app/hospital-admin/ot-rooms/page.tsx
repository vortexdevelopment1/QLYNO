"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import {
  Activity,
  AlertTriangle,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  Cpu,
  Edit2,
  Layers,
  Plus,
  Radio,
  Shield,
  Trash2,
  Wrench,
  Zap,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/hospital-admin/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/hospital-admin/components/ui/select";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { SurgicalNav } from "@/hospital-admin/components/surgical/surgical-nav";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import {
  addOTRoom,
  updateOTRoom,
  deleteOTRoom,
  scheduleOTMaintenance,
  OTRoom,
  OTRoomStatus,
} from "@/hospital-admin/store/slices/surgicalSlice";
import { cn } from "@/hospital-admin/lib/utils";

export default function OTRoomsPage() {
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { otRooms, cases } = useSelector((state: RootState) => state.surgical);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Modals state
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<OTRoom | null>(null);
  const [maintModalOpen, setMaintModalOpen] = useState(false);
  const [selectedMaintRoom, setSelectedMaintRoom] = useState<OTRoom | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<OTRoom | null>(null);

  // Form state: Add / Edit Room
  const [roomName, setRoomName] = useState("");
  const [roomDept, setRoomDept] = useState("General Surgery");
  const [roomEquipment, setRoomEquipment] = useState("");
  const [roomStatus, setRoomStatus] = useState<OTRoomStatus>("Available");

  // Form state: Maintenance
  const [maintStart, setMaintStart] = useState(new Date().toISOString().split("T")[0]);
  const [maintEnd, setMaintEnd] = useState(
    new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString().split("T")[0]
  );
  const [maintReason, setMaintReason] = useState("HEPA Filter Replacement & Deep Sterilization");

  const handleOpenAddRoom = () => {
    setEditingRoom(null);
    setRoomName("");
    setRoomDept("General Surgery");
    setRoomEquipment("Electro-cautery Generator, Anesthesia Workstation, Vital Multipara");
    setRoomStatus("Available");
    setRoomModalOpen(true);
  };

  const handleOpenEditRoom = (room: OTRoom) => {
    setEditingRoom(room);
    setRoomName(room.name);
    setRoomDept(room.department);
    setRoomEquipment(room.baseEquipment.join(", "));
    setRoomStatus(room.status);
    setRoomModalOpen(true);
  };

  const handleSaveRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) {
      toast({ title: "Validation Error", description: "Room name is required.", variant: "destructive" });
      return;
    }

    const eqList = roomEquipment
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingRoom) {
      dispatch(
        updateOTRoom({
          ...editingRoom,
          name: roomName.trim(),
          department: roomDept,
          baseEquipment: eqList,
          status: roomStatus,
        })
      );
      toast({ title: "OT Room Updated", description: `${roomName.trim()} configuration saved.` });
    } else {
      dispatch(
        addOTRoom({
          name: roomName.trim(),
          department: roomDept,
          baseEquipment: eqList,
          status: roomStatus,
        })
      );
      toast({ title: "OT Room Registered", description: `${roomName.trim()} added to resource registry.` });
    }
    setRoomModalOpen(false);
  };

  const handleOpenScheduleMaint = (room: OTRoom) => {
    setSelectedMaintRoom(room);
    setMaintStart(new Date().toISOString().split("T")[0]);
    setMaintEnd(new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString().split("T")[0]);
    setMaintReason("Routine Autoclave & Laminar Flow Recalibration");
    setMaintModalOpen(true);
  };

  const handleSaveMaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaintRoom) return;

    // Guard: Check if room has an active scheduled surgery during maintenance
    const hasConflict = cases.some(
      (c) =>
        c.allocatedOT?.roomId === selectedMaintRoom.id &&
        (c.status === "Scheduled" || c.status === "In Progress")
    );

    if (hasConflict) {
      toast({
        title: "Active Booking Conflict",
        description: `Cannot schedule maintenance: ${selectedMaintRoom.name} has scheduled surgeries. Reassign slots first.`,
        variant: "destructive",
      });
      return;
    }

    dispatch(
      scheduleOTMaintenance({
        roomId: selectedMaintRoom.id,
        startDate: maintStart,
        endDate: maintEnd,
        reason: maintReason,
      })
    );

    toast({
      title: "Maintenance Scheduled",
      description: `${selectedMaintRoom.name} status updated to Under Maintenance.`,
    });
    setMaintModalOpen(false);
  };

  const handlePromptDeleteRoom = (room: OTRoom) => {
    setRoomToDelete(room);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDeleteRoom = () => {
    if (!roomToDelete) return;

    // Guard: Check if room has active bookings
    const hasConflict = cases.some(
      (c) =>
        c.allocatedOT?.roomId === roomToDelete.id &&
        (c.status === "Scheduled" || c.status === "In Progress")
    );

    if (hasConflict) {
      toast({
        title: "Deactivation Blocked",
        description: `Cannot deactivate ${roomToDelete.name}: Active or scheduled surgical bookings are assigned to this room.`,
        variant: "destructive",
      });
      setDeleteConfirmOpen(false);
      return;
    }

    dispatch(deleteOTRoom(roomToDelete.id));
    toast({ title: "Room Decommissioned", description: `${roomToDelete.name} removed from registry.` });
    setDeleteConfirmOpen(false);
    setRoomToDelete(null);
  };

  const getStatusBadge = (status: OTRoomStatus) => {
    switch (status) {
      case "Available":
        return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">Available</Badge>;
      case "Occupied":
        return <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30">Occupied (Live Surgery)</Badge>;
      case "Maintenance":
        return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30">Under Maintenance</Badge>;
      case "Cleaning-Turnover":
        return <Badge className="bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30">Cleaning / Turnover</Badge>;
      case "Decommissioned":
        return <Badge variant="secondary">Decommissioned</Badge>;
    }
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Operation Theatres & Rooms Registry"
          description="Master registry of hospital operating suites, base instrument inventories, and planned maintenance cycles."
          crumbs={[{ label: "OT & Surgeries" }, { label: "OT Rooms" }]}
        />
        <SurgicalNav />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading OT rooms registry...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Operation Theatres & Rooms Registry"
        description="Master registry of hospital operating suites, base instrument inventories, and planned maintenance cycles."
        crumbs={[{ label: "OT & Surgeries" }, { label: "OT Rooms" }]}
        actions={
          <Button size="sm" className="gap-1.5 font-semibold" onClick={handleOpenAddRoom}>
            <Plus className="h-4 w-4" /> Register OT Suite
          </Button>
        }
      />

      <SurgicalNav />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Total Theatres</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{otRooms.length} Suites</p>
          <span className="text-[10px] text-muted-foreground">Main Campus Block</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Available Now</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
            {otRooms.filter((r) => r.status === "Available").length} Rooms
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Ready for intake</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">In Surgery</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">
            {otRooms.filter((r) => r.status === "Occupied").length} Active
          </p>
          <span className="text-[10px] text-rose-600 font-medium">Live OT in progress</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Maintenance / Turnover</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">
            {otRooms.filter((r) => r.status === "Maintenance" || r.status === "Cleaning-Turnover").length} Rooms
          </p>
          <span className="text-[10px] text-amber-600 font-medium">Scheduled downtime</span>
        </Card>
      </div>

      {/* OT Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {otRooms.map((room) => (
          <Card key={room.id} className="border-border bg-card hover:border-primary/40 transition-all flex flex-col justify-between group shadow-xs">
            <CardHeader className="p-4 pb-3 border-b border-border/60">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-bold text-foreground">{room.name}</CardTitle>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {room.id}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Department: <strong className="text-foreground">{room.department}</strong>
                  </CardDescription>
                </div>
                {getStatusBadge(room.status)}
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
              {/* Base Equipment List */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                  <Cpu className="h-3 w-3 text-primary" /> Permanent Base Equipment:
                </span>
                <div className="flex flex-wrap gap-1">
                  {room.baseEquipment.map((eq, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-muted/60 text-foreground font-medium">
                      {eq}
                    </span>
                  ))}
                  {room.baseEquipment.length === 0 && (
                    <span className="text-[10px] text-muted-foreground italic">Standard general anesthesia set</span>
                  )}
                </div>
              </div>

              {/* Maintenance Notice if active */}
              {room.maintenanceWindow && (
                <div className="p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-950 dark:text-amber-200 text-xs space-y-0.5">
                  <div className="flex items-center gap-1 font-semibold text-[11px]">
                    <Wrench className="h-3.5 w-3.5" /> Maintenance Window:
                  </div>
                  <p className="text-[10px] font-mono">
                    {new Date(room.maintenanceWindow.startDate).toLocaleDateString()} – {new Date(room.maintenanceWindow.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-[10px]">{room.maintenanceWindow.reason}</p>
                </div>
              )}

              {/* Turnover ETA if Cleaning */}
              {room.status === "Cleaning-Turnover" && (
                <div className="p-2.5 rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-950 dark:text-cyan-200 text-xs">
                  <span className="font-semibold text-[11px] block">Turnover Sterilization in Progress:</span>
                  <p className="text-[10px]">Estimated ready in: <strong>{room.turnoverETA || "15 mins"}</strong></p>
                </div>
              )}

              {/* Utilization Statistics */}
              <div className="pt-2 border-t border-border/60 grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="p-1.5 rounded bg-muted/30">
                  <span className="text-[9px] text-muted-foreground uppercase block">Surgeries</span>
                  <strong className="text-foreground text-[11px]">{room.utilizationStats.totalSurgeries}</strong>
                </div>
                <div className="p-1.5 rounded bg-muted/30">
                  <span className="text-[9px] text-muted-foreground uppercase block">Avg Turn</span>
                  <strong className="text-foreground text-[11px]">{room.utilizationStats.avgTurnoverMins}m</strong>
                </div>
                <div className="p-1.5 rounded bg-muted/30">
                  <span className="text-[9px] text-muted-foreground uppercase block">Occupancy</span>
                  <strong className="text-primary text-[11px]">{room.utilizationStats.occupancyRate}%</strong>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-2 border-t border-border/80 flex items-center justify-between gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleOpenScheduleMaint(room)}
                >
                  <Wrench className="h-3 w-3 mr-1 text-amber-600" /> Maintenance
                </Button>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-primary"
                    onClick={() => handleOpenEditRoom(room)}
                  >
                    <Edit2 className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => handlePromptDeleteRoom(room)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT OT ROOM                                                 */}
      {/* ========================================================================= */}
      <Dialog open={roomModalOpen} onOpenChange={setRoomModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              {editingRoom ? "Edit OT Room Configuration" : "Register New Operation Theatre"}
            </DialogTitle>
            <DialogDescription>
              Configure theatre naming, specialty assignment, and permanent instrument installations.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveRoomSubmit} className="space-y-3.5 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Theatre Name *</Label>
              <Input
                placeholder="e.g. Main OR 4 (Cardiothoracic Suite)"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Specialty Department</Label>
                <Select value={roomDept} onValueChange={setRoomDept}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General Surgery">General Surgery</SelectItem>
                    <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                    <SelectItem value="Neurology">Neurology</SelectItem>
                    <SelectItem value="Cardiology">Cardiology</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                    <SelectItem value="Gynecology">Gynecology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Operational Status</Label>
                <Select value={roomStatus} onValueChange={(val: any) => setRoomStatus(val)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Occupied">Occupied</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Cleaning-Turnover">Cleaning-Turnover</SelectItem>
                    <SelectItem value="Decommissioned">Decommissioned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Permanent Base Equipment (Comma Separated)</Label>
              <Input
                placeholder="e.g. C-Arm Radiography, High-Speed Drill, Laparoscopy Tower"
                value={roomEquipment}
                onChange={(e) => setRoomEquipment(e.target.value)}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setRoomModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingRoom ? "Save Configuration" : "Register Theatre"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: SCHEDULE MAINTENANCE                                               */}
      {/* ========================================================================= */}
      <Dialog open={maintModalOpen} onOpenChange={setMaintModalOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <Wrench className="h-5 w-5" /> Schedule Planned Maintenance
            </DialogTitle>
            <DialogDescription>
              Mark {selectedMaintRoom?.name} under maintenance and block calendar bookings.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveMaintSubmit} className="space-y-3.5 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Start Date</Label>
                <Input type="date" value={maintStart} onChange={(e) => setMaintStart(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">End Date</Label>
                <Input type="date" value={maintEnd} onChange={(e) => setMaintEnd(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Maintenance Work Description</Label>
              <Input
                value={maintReason}
                onChange={(e) => setMaintReason(e.target.value)}
                placeholder="e.g. HEPA Filter Certification and Deep Gas Sterilization"
                required
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setMaintModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">
                Confirm Maintenance Downtime
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* 3. CONFIRM DELETE / DECOMMISSION ROOM MODAL                               */}
      {/* ========================================================================= */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5 text-destructive" /> Decommission &amp; Delete OT Room
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to permanently decommission and delete <strong>{roomToDelete?.name}</strong>?
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 text-xs space-y-2.5">
            <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Department:</span>
                <span className="font-semibold text-foreground">{roomToDelete?.department}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Current Status:</span>
                <span className="font-mono text-foreground">{roomToDelete?.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Surgeries Hosted:</span>
                <span className="font-mono text-primary font-bold">{roomToDelete?.utilizationStats.totalSurgeries}</span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground">
              This action will remove the operating theatre suite from active calendar scheduling and slot allocation engines.
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmDeleteRoom}
            >
              Confirm Decommission &amp; Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
