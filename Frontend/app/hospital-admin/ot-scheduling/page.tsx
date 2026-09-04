"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/hospital-admin/components/ui/card";
import { Button } from "@/hospital-admin/components/ui/button";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/hospital-admin/components/ui/dialog";
import { allocateOT } from "@/hospital-admin/store/slices/surgicalSlice";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import Link from "next/link";
import { format, addDays } from "date-fns";
import { Calendar as CalendarIcon, Clock, AlertCircle, Building, Users, Zap, Plus } from "lucide-react";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { SurgicalNav } from "@/hospital-admin/components/surgical/surgical-nav";

export default function OTSchedulingPage() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { cases, otRooms, surgeons } = useSelector((state: RootState) => state.surgical);

  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [allocModalOpen, setAllocModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    caseId: "",
    roomId: "",
    time: "08:00",
    team: "",
    resources: ""
  });

  const selectedDateStart = new Date(`${date}T00:00:00Z`).getTime();
  const selectedDateEnd = new Date(`${date}T23:59:59Z`).getTime();

  const handleAllocate = (e: React.FormEvent) => {
    e.preventDefault();
    const c = cases.find(c => c.id === formData.caseId);
    if (!c) return;

    if (c.status !== 'Ready') {
      toast({
        title: "Warning: Case Not Ready",
        description: "OT scheduled, but case still has pre-op blockers pending clearance.",
        variant: "destructive"
      });
    }

    const startDateTime = `${date}T${formData.time}:00Z`;
    const endDateTime = new Date(new Date(startDateTime).getTime() + 1000 * 60 * 60 * 2).toISOString();

    dispatch(allocateOT({
      caseId: c.id,
      roomId: formData.roomId,
      startDateTime,
      endDateTime,
      team: formData.team.split(',').map(s => s.trim()).filter(Boolean),
      resources: formData.resources.split(',').map(s => s.trim()).filter(Boolean)
    }));

    toast({ title: "OT Slot Allocated", description: "OT scheduling confirmed from Control View." });
    setAllocModalOpen(false);
  };

  const getSurgeonName = (caseData: any) => {
    if (caseData.assignedSurgeonName) return caseData.assignedSurgeonName;
    if (!caseData.assignedSurgeonId) return "Unassigned";
    const surgeon = surgeons.find(s => s.id === caseData.assignedSurgeonId);
    return surgeon ? surgeon.name : caseData.assignedSurgeonId;
  };

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Surgical Control View &amp; OT Allocator"
        description="Room-by-room surgical control grid with pre-op readiness validation and surgical team assignments."
        crumbs={[{ label: "OT & Surgeries" }, { label: "OT Scheduling" }]}
        actions={
          <div className="flex items-center gap-2">
            <Input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              className="w-auto h-9 text-xs"
            />
            <Dialog open={allocModalOpen} onOpenChange={setAllocModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5 font-semibold text-xs">
                  <Plus className="h-4 w-4" /> Allocate OT Slot
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle>Allocate OT Slot</DialogTitle>
                  <DialogDescription>Assign a room and time for a case on {format(new Date(date), "MMM d, yyyy")}.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAllocate} className="space-y-3.5 py-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Select Case *</Label>
                    <Select onValueChange={(val) => setFormData(p => ({ ...p, caseId: val }))} required>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select a case" />
                      </SelectTrigger>
                      <SelectContent>
                        {cases.map(c => (
                          <SelectItem key={c.id} value={c.id} className="text-xs">
                            {c.id} - {c.patientName} ({c.procedureType}) - {c.status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Select OT Room *</Label>
                    <Select onValueChange={(val) => setFormData(p => ({ ...p, roomId: val }))} required>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select a room" />
                      </SelectTrigger>
                      <SelectContent>
                        {otRooms.filter(r => r.status !== 'Maintenance' && r.status !== 'Decommissioned').map(r => (
                          <SelectItem key={r.id} value={r.id} className="text-xs">
                            {r.name} ({r.department})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Start Time *</Label>
                    <Input 
                      type="time" 
                      value={formData.time} 
                      onChange={(e) => setFormData(p => ({ ...p, time: e.target.value }))} 
                      className="h-9 text-xs"
                      required 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Assigned Team (Comma Separated)</Label>
                    <Input 
                      placeholder="e.g. Dr. A (Lead), Dr. B (Anesth), Nurse C" 
                      value={formData.team} 
                      onChange={(e) => setFormData(p => ({ ...p, team: e.target.value }))}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Required Equipment (Comma Separated)</Label>
                    <Input 
                      placeholder="e.g. C-Arm, Laparoscopy Tower" 
                      value={formData.resources} 
                      onChange={(e) => setFormData(p => ({ ...p, resources: e.target.value }))}
                      className="h-9 text-xs"
                    />
                  </div>
                  <Button type="submit" className="w-full mt-2">Confirm Allocation</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <SurgicalNav />

      {/* Grid of rooms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {otRooms.map(room => {
          const roomCases = cases.filter(c => {
            if (!c.allocatedOT || c.allocatedOT.roomId !== room.id) return false;
            const start = new Date(c.allocatedOT.startDateTime).getTime();
            return start >= selectedDateStart && start <= selectedDateEnd;
          });

          return (
            <Card key={room.id} className="flex flex-col border-border shadow-xs">
              <CardHeader className="pb-3 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{room.name}</CardTitle>
                    <CardDescription>{room.department}</CardDescription>
                  </div>
                  <Badge variant={room.status === 'Available' ? 'success' : room.status === 'Occupied' ? 'destructive' : 'warning'}>
                    {room.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col pt-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Scheduled Cases ({roomCases.length})
                </h4>

                {roomCases.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center p-6 border border-dashed rounded-lg text-muted-foreground text-xs">
                    No cases scheduled for this date.
                  </div>
                ) : (
                  <div className="space-y-3 flex-1">
                    {roomCases.map(c => (
                      <div key={c.id} className="p-3 border rounded-lg bg-muted/40 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <Link href={`/hospital-admin/surgical-cases/${c.id}`} className="font-semibold text-xs hover:underline flex items-center gap-1">
                              {c.patientName} ({c.id})
                            </Link>
                            <div className="text-[11px] text-muted-foreground">{c.procedureType}</div>
                          </div>
                          <Badge variant={c.status === 'Ready' ? 'success' : c.status === 'Blocked' ? 'destructive' : 'outline'} className="text-[9px]">
                            {c.status}
                          </Badge>
                        </div>

                        <div className="text-[11px] space-y-1 text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                            <span>
                              {format(new Date(c.allocatedOT!.startDateTime), "HH:mm")} - {format(new Date(c.allocatedOT!.endDateTime), "HH:mm")}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-primary" />
                            <span>Surgeon: {getSurgeonName(c)}</span>
                          </div>
                        </div>

                        {c.allocatedOT!.team.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {c.allocatedOT!.team.map((t, idx) => (
                              <Badge key={idx} variant="secondary" className="text-[9px]">
                                {t}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
