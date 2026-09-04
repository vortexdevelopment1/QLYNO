"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import {
  Activity,
  ArrowRight,
  Building,
  Calendar,
  Clock,
  Eye,
  Layers,
  MapPin,
  RefreshCw,
  Scissors,
  Shield,
  Stethoscope,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/hospital-admin/components/ui/button";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
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
import { Label } from "@/hospital-admin/components/ui/label";
import { Input } from "@/hospital-admin/components/ui/input";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { SurgicalNav } from "@/hospital-admin/components/surgical/surgical-nav";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { reassignOTSlot, SurgicalCase } from "@/hospital-admin/store/slices/surgicalSlice";
import { formatDistanceToNow, format } from "date-fns";

export default function UpcomingSurgeriesPage() {
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { cases, otRooms } = useSelector((state: RootState) => state.surgical);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reassign Modal State
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<SurgicalCase | null>(null);
  const [targetRoomId, setTargetRoomId] = useState("");
  const [targetTime, setTargetTime] = useState("");

  // Team View Modal State
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [viewingCase, setViewingCase] = useState<SurgicalCase | null>(null);

  // Derived list of scheduled/planning cases
  const scheduledCases = cases
    .filter((c) => c.status === "Scheduled" || c.status === "Ready" || c.status === "Planning")
    .sort((a, b) => new Date(a.preferredDateTime).getTime() - new Date(b.preferredDateTime).getTime());

  const handleOpenReassign = (c: SurgicalCase) => {
    setSelectedCase(c);
    setTargetRoomId(c.allocatedOT?.roomId || otRooms[0]?.id || "OT-101");
    setTargetTime(c.preferredDateTime);
    setReassignModalOpen(true);
  };

  const handleSaveReassignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    dispatch(
      reassignOTSlot({
        caseId: selectedCase.id,
        roomId: targetRoomId,
        startDateTime: targetTime,
      })
    );

    toast({
      title: "OT Room Reassigned",
      description: `Case ${selectedCase.id} transferred to ${targetRoomId}.`,
    });
    setReassignModalOpen(false);
  };

  const handleOpenTeamModal = (c: SurgicalCase) => {
    setViewingCase(c);
    setTeamModalOpen(true);
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Upcoming Scheduled Surgeries"
          description="Priority surgical timeline for confirmed and pending procedures with live countdowns."
          crumbs={[{ label: "OT & Surgeries" }, { label: "Upcoming Surgeries" }]}
        />
        <SurgicalNav />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading upcoming surgeries...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Upcoming Scheduled Surgeries"
        description="Priority surgical timeline for confirmed and pending procedures with live countdowns."
        crumbs={[{ label: "OT & Surgeries" }, { label: "Upcoming Surgeries" }]}
        actions={
          <Button size="sm" asChild className="gap-1.5 font-semibold">
            <Link href="/hospital-admin/surgical-cases/create">
              <Scissors className="h-4 w-4" /> Book New Surgery
            </Link>
          </Button>
        }
      />

      <SurgicalNav />

      {/* Upcoming Grid */}
      <div className="space-y-3">
        {scheduledCases.map((c) => {
          const caseDate = new Date(c.preferredDateTime);
          const isPast = caseDate.getTime() < Date.now();
          const countdown = isPast
            ? "Imminent / Today"
            : `Starts ${formatDistanceToNow(caseDate, { addSuffix: true })}`;

          return (
            <Card
              key={c.id}
              className="border-border bg-card hover:border-primary/40 transition-all p-4 shadow-xs"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* Left: Patient & Procedure */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-primary font-bold">{c.id}</span>
                    <Badge
                      variant={
                        c.status === "Scheduled"
                          ? "default"
                          : c.status === "Ready"
                          ? "outline"
                          : "secondary"
                      }
                      className="text-[10px]"
                    >
                      {c.status}
                    </Badge>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted/60 text-muted-foreground">
                      {c.department}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground">{c.patientName}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{c.procedureType}</span>
                    <span>•</span>
                    <span className="font-mono text-foreground">{c.patientId}</span>
                  </p>
                </div>

                {/* Middle: Timing & Location */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs">
                  <div className="p-2.5 rounded-lg bg-muted/30 border border-border/60 min-w-[140px]">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
                      <Clock className="h-3 w-3 text-primary" /> Target Schedule:
                    </span>
                    <p className="font-semibold text-foreground mt-0.5">
                      {format(caseDate, "MMM d, yyyy • HH:mm")}
                    </p>
                    <span className="text-[10px] text-primary font-medium">{countdown}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-muted/30 border border-border/60 min-w-[140px]">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
                      <Building className="h-3 w-3 text-primary" /> Allocated Suite:
                    </span>
                    <p className="font-semibold text-foreground mt-0.5">
                      {c.allocatedOT ? c.allocatedOT.roomId : "Unallocated"}
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      Surgeon: {c.assignedSurgeonName || "Assigned Specialist"}
                    </span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1"
                    onClick={() => handleOpenTeamModal(c)}
                  >
                    <Users className="h-3.5 w-3.5 text-primary" /> Team
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1"
                    onClick={() => handleOpenReassign(c)}
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Reassign Room
                  </Button>
                  <Button size="sm" asChild className="h-8 text-xs gap-1">
                    <Link href={`/hospital-admin/surgical-cases/${c.id}`}>
                      <Eye className="h-3.5 w-3.5" /> View Case
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}

        {scheduledCases.length === 0 && (
          <div className="p-12 text-center border border-dashed rounded-xl text-muted-foreground text-xs">
            No upcoming surgical cases scheduled.
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: VIEW SURGICAL TEAM                                                 */}
      {/* ========================================================================= */}
      <Dialog open={teamModalOpen} onOpenChange={setTeamModalOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Assigned Surgical Team
            </DialogTitle>
            <DialogDescription>
              Clinical personnel assigned to Case {viewingCase?.id} ({viewingCase?.procedureType}).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2.5 py-2 text-xs">
            <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Lead Operating Surgeon</span>
              <p className="font-semibold text-foreground text-sm">
                {viewingCase?.assignedSurgeonName || "Dr. Ramesh Sharma"}
              </p>
            </div>
            {viewingCase?.allocatedOT?.team.map((member, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-muted/20 border border-border flex items-center justify-between">
                <span className="font-medium text-foreground">{member}</span>
                <Badge variant="outline" className="text-[10px]">Active Team</Badge>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => setTeamModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: REASSIGN OT ROOM                                                   */}
      {/* ========================================================================= */}
      <Dialog open={reassignModalOpen} onOpenChange={setReassignModalOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" /> Reassign Operation Theatre
            </DialogTitle>
            <DialogDescription>
              Transfer Case {selectedCase?.id} ({selectedCase?.patientName}) to another available OR.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveReassignSubmit} className="space-y-3.5 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Select Target OT Room</Label>
              <Select value={targetRoomId} onValueChange={setTargetRoomId}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select Room" />
                </SelectTrigger>
                <SelectContent>
                  {otRooms
                    .filter((r) => r.status !== "Maintenance" && r.status !== "Decommissioned")
                    .map((r) => (
                      <SelectItem key={r.id} value={r.id} className="text-xs">
                        {r.name} ({r.department}) — {r.status}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Target Start Time</Label>
              <Input
                type="datetime-local"
                value={targetTime.slice(0, 16)}
                onChange={(e) => setTargetTime(new Date(e.target.value).toISOString())}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setReassignModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Confirm Reassignment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
