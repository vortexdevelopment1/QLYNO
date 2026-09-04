"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import {
  AlertTriangle,
  Building,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Layers,
  Plus,
  ShieldAlert,
  Stethoscope,
  Users,
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
import { allocateOT, SurgicalCase } from "@/hospital-admin/store/slices/surgicalSlice";
import { format, addDays, subDays } from "date-fns";
import { cn } from "@/hospital-admin/lib/utils";

const TIME_SLOTS = [
  "08:00 AM",
  "09:30 AM",
  "11:00 AM",
  "12:30 PM",
  "02:00 PM",
  "03:30 PM",
  "05:00 PM",
  "06:30 PM",
];

export default function SurgerySchedulePage() {
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { cases, otRooms, surgeons } = useSelector((state: RootState) => state.surgical);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"Day" | "Week">("Day");
  const [allocModalOpen, setAllocModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("08:00 AM");
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [leadSurgeon, setLeadSurgeon] = useState("Dr. Ramesh Sharma");
  const [anesthetist, setAnesthetist] = useState("Dr. Rajesh Menon");
  const [scrubNurse, setScrubNurse] = useState("Sister Kamala Rao");

  const formattedDateStr = format(selectedDate, "yyyy-MM-dd");

  const activeRooms = otRooms.filter((r) => r.status !== "Decommissioned");

  const handleOpenSlotAlloc = (roomId: string, timeSlot: string) => {
    const room = otRooms.find((r) => r.id === roomId);
    if (room?.status === "Maintenance") {
      toast({
        title: "Room Under Maintenance",
        description: `${room.name} is currently blocked for planned maintenance.`,
        variant: "destructive",
      });
      return;
    }

    setSelectedRoomId(roomId);
    setSelectedTimeSlot(timeSlot);
    const readyCase = cases.find((c) => c.status === "Ready" || c.status === "Planning");
    setSelectedCaseId(readyCase ? readyCase.id : cases[0]?.id || "");
    setAllocModalOpen(true);
  };

  const handleSaveAllocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetCase = cases.find((c) => c.id === selectedCaseId);
    if (!targetCase) return;

    // Readiness Warning Guard
    if (targetCase.status === "Blocked") {
      toast({
        title: "Warning: Unresolved Blockers",
        description: `Case ${targetCase.id} has missing pre-op dependencies. Please ensure items are resolved prior to incision.`,
        variant: "destructive",
      });
    }

    const startDateTime = `${formattedDateStr}T${selectedTimeSlot.includes("PM") && !selectedTimeSlot.startsWith("12") ? parseInt(selectedTimeSlot) + 12 : selectedTimeSlot.slice(0, 2)}:00:00Z`;
    const endDateTime = new Date(new Date(startDateTime).getTime() + 1000 * 60 * 120).toISOString();

    dispatch(
      allocateOT({
        caseId: targetCase.id,
        roomId: selectedRoomId,
        startDateTime,
        endDateTime,
        team: [leadSurgeon, anesthetist, scrubNurse],
        resources: ["Standard Operating Instruments", "Vital Multipara Monitor"],
      })
    );

    toast({
      title: "OT Slot Allocated",
      description: `Slot reserved in ${selectedRoomId} for ${targetCase.patientName}.`,
    });
    setAllocModalOpen(false);
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Operating Theatre Surgery Schedule"
          description="Room-by-room surgical timeline, live OR slot allocations, and surgical team assignments."
          crumbs={[{ label: "OT & Surgeries" }, { label: "Surgery Schedule" }]}
        />
        <SurgicalNav />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading surgery schedule...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Operating Theatre Surgery Schedule"
        description="Room-by-room surgical timeline, live OR slot allocations, and surgical team assignments."
        crumbs={[{ label: "OT & Surgeries" }, { label: "Surgery Schedule" }]}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-lg p-0.5 bg-muted/40">
              <button
                type="button"
                onClick={() => setViewMode("Day")}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded-md transition-colors",
                  viewMode === "Day" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                )}
              >
                Day
              </button>
              <button
                type="button"
                onClick={() => setViewMode("Week")}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded-md transition-colors",
                  viewMode === "Week" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                )}
              >
                Week
              </button>
            </div>
            <Button
              size="sm"
              className="gap-1.5 font-semibold"
              onClick={() => handleOpenSlotAlloc(activeRooms[0]?.id || "OT-101", "08:00 AM")}
            >
              <Plus className="h-4 w-4" /> Book OT Slot
            </Button>
          </div>
        }
      />

      <SurgicalNav />

      {/* Date Navigation Strip */}
      <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card shadow-xs">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSelectedDate((prev) => subDays(prev, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-primary" />
            <strong className="text-sm font-bold text-foreground">
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </strong>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSelectedDate((prev) => addDays(prev, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="text-xs font-semibold"
          onClick={() => setSelectedDate(new Date())}
        >
          Today
        </Button>
      </div>

      {/* Room Column Schedule Grid */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Header Row: Rooms as Columns */}
          <div className="grid grid-cols-5 border-b border-border/80 bg-muted/30">
            <div className="p-3 text-xs font-bold text-muted-foreground border-r border-border/60">
              Time Slot
            </div>
            {activeRooms.map((room) => (
              <div key={room.id} className="p-3 border-r border-border/60 last:border-r-0">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-bold text-foreground">{room.name}</strong>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px]",
                      room.status === "Available"
                        ? "text-emerald-600 border-emerald-500/30"
                        : room.status === "Occupied"
                        ? "text-rose-600 border-rose-500/30"
                        : "text-amber-600 border-amber-500/30"
                    )}
                  >
                    {room.status}
                  </Badge>
                </div>
                <span className="text-[10px] text-muted-foreground block mt-0.5">{room.department}</span>
              </div>
            ))}
          </div>

          {/* Time Slot Rows */}
          {TIME_SLOTS.map((slot, slotIdx) => (
            <div key={slot} className="grid grid-cols-5 border-b border-border/60 last:border-b-0 hover:bg-muted/10 transition-colors">
              {/* Time Label */}
              <div className="p-3 text-xs font-mono font-medium text-muted-foreground border-r border-border/60 flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-primary" /> {slot}
              </div>

              {/* Room Columns */}
              {activeRooms.map((room) => {
                // Find case allocated in this room
                const scheduledCase = cases.find(
                  (c) =>
                    c.allocatedOT?.roomId === room.id &&
                    (c.status === "Scheduled" || c.status === "In Progress" || c.status === "Blocked")
                );

                const isOccupiedHere = scheduledCase && (slotIdx === 1 || slotIdx === 0);

                return (
                  <div
                    key={room.id}
                    className="p-2.5 border-r border-border/60 last:border-r-0 min-h-[85px] flex flex-col justify-center"
                  >
                    {isOccupiedHere && scheduledCase ? (
                      <div className="p-2 rounded-lg border border-primary/30 bg-primary/10 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <strong className="text-[11px] font-bold text-foreground truncate">
                            {scheduledCase.patientName}
                          </strong>
                          <Badge variant="outline" className="text-[9px] py-0">
                            {scheduledCase.status}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">{scheduledCase.procedureType}</p>
                        <span className="text-[9px] font-mono text-primary block">
                          Surgeon: {scheduledCase.assignedSurgeonName || "Dr. Ramesh Sharma"}
                        </span>
                      </div>
                    ) : room.status === "Maintenance" ? (
                      <div className="p-2 rounded-lg border border-dashed border-amber-500/30 bg-amber-500/5 text-center text-xs text-amber-700 dark:text-amber-300">
                        <span className="text-[10px] font-semibold">Under Maintenance</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenSlotAlloc(room.id, slot)}
                        className="w-full h-full min-h-[50px] border border-dashed border-border/80 rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center text-xs text-muted-foreground hover:text-primary gap-1 group"
                      >
                        <Plus className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px]">Available Slot</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: OT SLOT ALLOCATION DESK                                            */}
      {/* ========================================================================= */}
      <Dialog open={allocModalOpen} onOpenChange={setAllocModalOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" /> Allocate Surgery OT Slot
            </DialogTitle>
            <DialogDescription>
              Assign surgical case to {selectedRoomId} for {selectedTimeSlot} on {formattedDateStr}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveAllocSubmit} className="space-y-3.5 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Select Surgical Case *</Label>
              <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select Case" />
                </SelectTrigger>
                <SelectContent>
                  {cases.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span>{c.id} — {c.patientName} ({c.procedureType})</span>
                        <Badge variant="outline" className="text-[9px]">
                          {c.readinessPercent}% Ready
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Lead Operating Surgeon</Label>
                <Input value={leadSurgeon} onChange={(e) => setLeadSurgeon(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Lead Anesthesiologist</Label>
                <Input value={anesthetist} onChange={(e) => setAnesthetist(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Assigned Scrub Nurse</Label>
              <Input value={scrubNurse} onChange={(e) => setScrubNurse(e.target.value)} required />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAllocModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Confirm OT Allocation</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
