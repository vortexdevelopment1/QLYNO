"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Layers,
  ListFilter,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Stethoscope,
  UserCheck,
  Users,
  Video,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/hospital-admin/components/ui/avatar";
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
  DialogTrigger,
} from "@/hospital-admin/components/ui/dialog";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/hospital-admin/components/ui/tabs";
import { EmptyState } from "@/hospital-admin/components/shared/empty-state";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { StatusBadge } from "@/hospital-admin/components/shared/status-badge";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { appointments as initialAppointments } from "@/hospital-admin/lib/mock-data/appointments";
import { doctors } from "@/hospital-admin/lib/mock-data/doctors";
import { cn, formatDate, getInitials } from "@/hospital-admin/lib/utils";

// Time slots from 08:00 AM to 06:00 PM
const TIME_SLOTS = [
  "08:30 AM",
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
];

const DEPARTMENTS = [
  "All Departments",
  "Cardiology",
  "Orthopedics",
  "Neurology",
  "Pediatrics",
  "Gynecology",
  "Dermatology",
  "General Medicine",
];

export default function AppointmentsPage() {
  const { toast } = useToast();
  const [appointmentsList, setAppointmentsList] = useState(initialAppointments);
  const [viewMode, setViewMode] = useState<"calendar" | "table" | "doctor-wise" | "queue">("calendar");
  const [calendarView, setCalendarView] = useState<"day" | "week" | "month">("day");
  const [selectedDate, setSelectedDate] = useState("2026-08-14");
  const [search, setSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Booking Modal State
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [newPatientName, setNewPatientName] = useState("");
  const [newDoctorId, setNewDoctorId] = useState("doc_001");
  const [newDate, setNewDate] = useState("2026-08-14");
  const [newTime, setNewTime] = useState("10:00 AM");
  const [newType, setNewType] = useState<"In-person" | "Video" | "Follow-up">("In-person");
  const [newReason, setNewReason] = useState("");

  const docMap = useMemo(() => new Map(doctors.map((d) => [d.id, d])), []);

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointmentsList.filter((a) => {
      const doc = docMap.get(a.doctorId);
      const docDept = doc?.department || "";
      const docSpecialty = doc?.specialty || "";
      const matchesSearch =
        a.patientName.toLowerCase().includes(search.toLowerCase()) ||
        a.doctorName.toLowerCase().includes(search.toLowerCase()) ||
        a.reason.toLowerCase().includes(search.toLowerCase());
      const matchesDoctor = selectedDoctor === "all" || a.doctorId === selectedDoctor;
      const matchesStatus = selectedStatus === "all" || a.status === selectedStatus;
      const matchesDepartment =
        selectedDepartment === "All Departments" ||
        docDept.toLowerCase() === selectedDepartment.toLowerCase() ||
        docSpecialty.toLowerCase() === selectedDepartment.toLowerCase();
      return matchesSearch && matchesDoctor && matchesStatus && matchesDepartment;
    });
  }, [appointmentsList, search, selectedDoctor, selectedStatus, selectedDepartment, docMap]);

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim()) {
      toast({ title: "Validation Error", description: "Patient name is required.", variant: "destructive" });
      return;
    }

    const doc = doctors.find((d) => d.id === newDoctorId) || doctors[0];
    const newApt = {
      id: `apt_${Date.now()}`,
      patientName: newPatientName.trim(),
      patientId: `pat_${Date.now()}`,
      qlynoPatientId: `QLY-PAT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      doctorName: doc.name,
      doctorId: doc.id,
      clinic: "Qlyno Multispecialty Hospital",
      date: newDate,
      time: newTime,
      type: newType,
      status: "confirmed" as const,
      reason: newReason.trim() || "Consultation",
    };

    setAppointmentsList([newApt, ...appointmentsList]);
    setBookModalOpen(false);
    setNewPatientName("");
    setNewReason("");
    toast({
      title: "Appointment Scheduled Successfully",
      description: `Appointment booked for ${newApt.patientName} with ${newApt.doctorName} at ${newApt.time}.`,
    });
  };

  const currentWeekDays = useMemo(() => {
    const curr = new Date(selectedDate);
    const day = curr.getDay(); // 0 Sunday, 1 Monday...
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(curr.setDate(diff));

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      return {
        date: dateStr,
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        label: d.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
        isToday: dateStr === "2026-08-14",
        isSelected: dateStr === selectedDate,
      };
    });
  }, [selectedDate]);

  const handlePrevDate = () => {
    const d = new Date(selectedDate);
    if (calendarView === "day") {
      d.setDate(d.getDate() - 1);
    } else {
      d.setDate(d.getDate() - 7);
    }
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleNextDate = () => {
    const d = new Date(selectedDate);
    if (calendarView === "day") {
      d.setDate(d.getDate() + 1);
    } else {
      d.setDate(d.getDate() + 7);
    }
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleCallPatient = (aptId: string, patientName: string) => {
    setAppointmentsList((prev) =>
      prev.map((apt) => {
        if (apt.id === aptId) {
          const nextStatus =
            apt.status === "in-consultation"
              ? ("completed" as const)
              : ("in-consultation" as const);
          return { ...apt, status: nextStatus };
        }
        return apt;
      })
    );

    toast({
      title: "Patient Called to Consultation",
      description: `${patientName} moved to IN CONSULTATION. Doctor room notified.`,
    });
  };

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Appointments & Scheduling Desk"
        description="Multi-doctor appointment calendar, live token queues, and department capacity planner."
        crumbs={[{ label: "Patient Care" }, { label: "Appointments" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/hospital-admin/appointments/opd-queue">
                <Users className="h-4 w-4 mr-1.5" /> OPD Live Queue
              </Link>
            </Button>
            <Dialog open={bookModalOpen} onOpenChange={setBookModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="font-semibold gap-1.5">
                  <Plus className="h-4 w-4" /> Book Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Book Patient Appointment</DialogTitle>
                  <DialogDescription>
                    Schedule an in-person clinic visit or video consultation slot.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleBookAppointment} className="space-y-3.5 py-2">
                  <div className="space-y-1.5">
                    <Label>Patient Full Name</Label>
                    <Input
                      placeholder="e.g. Ramesh Chandra"
                      value={newPatientName}
                      onChange={(e) => setNewPatientName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Doctor & Specialty</Label>
                      <Select value={newDoctorId} onValueChange={setNewDoctorId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.name} ({d.department})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Consultation Type</Label>
                      <Select value={newType} onValueChange={(v: any) => setNewType(v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="In-person">In-person Clinic</SelectItem>
                          <SelectItem value="Video">Video Telehealth</SelectItem>
                          <SelectItem value="Follow-up">Post-Op Follow-up</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Time Slot</Label>
                      <Select value={newTime} onValueChange={setNewTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Slot" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_SLOTS.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Reason / Chief Symptoms</Label>
                    <Input
                      placeholder="e.g. Chest discomfort, routine checkup, diabetes review"
                      value={newReason}
                      onChange={(e) => setNewReason(e.target.value)}
                    />
                  </div>
                  <DialogFooter className="pt-2">
                    <Button type="button" variant="outline" onClick={() => setBookModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Confirm Booking</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Control Bar: Views & Filters */}
      <Card className="border-border bg-card shadow-sm p-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* Main View Switcher */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/60">
            <Button
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              className="h-8 text-xs font-semibold"
              onClick={() => setViewMode("calendar")}
            >
              <CalendarIcon className="h-3.5 w-3.5 mr-1.5" /> Calendar
            </Button>
            <Button
              variant={viewMode === "doctor-wise" ? "default" : "ghost"}
              size="sm"
              className="h-8 text-xs font-semibold"
              onClick={() => setViewMode("doctor-wise")}
            >
              <Stethoscope className="h-3.5 w-3.5 mr-1.5" /> Doctor Schedule
            </Button>
            <Button
              variant={viewMode === "queue" ? "default" : "ghost"}
              size="sm"
              className="h-8 text-xs font-semibold"
              onClick={() => setViewMode("queue")}
            >
              <Users className="h-3.5 w-3.5 mr-1.5" /> Appointment Queue
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              className="h-8 text-xs font-semibold"
              onClick={() => setViewMode("table")}
            >
              <ListFilter className="h-3.5 w-3.5 mr-1.5" /> All Appointments
            </Button>
          </div>

          {/* Search & Doctor Filter */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-56">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search patient, doctor, reason..."
                className="pl-8 h-8 text-xs bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
              <SelectTrigger className="h-8 text-xs w-[160px]">
                <SelectValue placeholder="All Doctors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Doctors</SelectItem>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="h-8 text-xs w-[130px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="in-consultation">In Consultation</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Department Tabs Bar */}
        <div className="mt-3 pt-3 border-t border-border/60 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-muted-foreground font-semibold text-[11px] mr-1 uppercase">Department:</span>
          {DEPARTMENTS.map((dept) => {
            const count =
              dept === "All Departments"
                ? appointmentsList.length
                : appointmentsList.filter((a) => {
                    const doc = docMap.get(a.doctorId);
                    return (
                      doc?.department?.toLowerCase() === dept.toLowerCase() ||
                      doc?.specialty?.toLowerCase() === dept.toLowerCase()
                    );
                  }).length;

            return (
              <button
                key={dept}
                type="button"
                onClick={() => {
                  setSelectedDepartment(dept);
                  if (selectedDoctor !== "all") {
                    setSelectedDoctor("all");
                  }
                }}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5",
                  selectedDepartment === dept
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted"
                )}
              >
                <span>{dept}</span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full",
                    selectedDepartment === dept
                      ? "bg-primary-foreground/20 text-primary-foreground font-mono font-bold"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* VIEW 1: CALENDAR VIEW (DAY & 7-DAY WEEK VIEW)                             */}
      {/* ========================================================================= */}
      {viewMode === "calendar" && (
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="p-4 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/80">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-muted/60 rounded-md p-0.5 border border-border">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handlePrevDate}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleNextDate}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <CardTitle className="text-base font-bold">
                  {calendarView === "day"
                    ? formatDate(selectedDate, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
                    : `Week of ${currentWeekDays[0].label} – ${currentWeekDays[6].label} 2026`}
                </CardTitle>
                <CardDescription className="text-xs">
                  {calendarView === "day"
                    ? `${filteredAppointments.filter((a) => a.date === selectedDate).length} appointments scheduled today`
                    : `${filteredAppointments.filter((a) => currentWeekDays.some((d) => d.date === a.date)).length} total appointments across this week`}
                </CardDescription>
              </div>
            </div>

            {/* Day / Week Toggle */}
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border">
              <Button
                variant={calendarView === "day" ? "default" : "ghost"}
                size="sm"
                className="h-7 text-xs px-3 font-semibold"
                onClick={() => setCalendarView("day")}
              >
                Day View
              </Button>
              <Button
                variant={calendarView === "week" ? "default" : "ghost"}
                size="sm"
                className="h-7 text-xs px-3 font-semibold"
                onClick={() => setCalendarView("week")}
              >
                Week View
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* ======================= DAY VIEW ======================= */}
            {calendarView === "day" && (
              <div className="divide-y divide-border/60">
                {TIME_SLOTS.map((slot) => {
                  const slotAppointments = filteredAppointments.filter(
                    (a) => a.date === selectedDate && a.time === slot
                  );

                  return (
                    <div key={slot} className="flex min-h-[64px] hover:bg-muted/10 transition-colors">
                      {/* Time Column */}
                      <div className="w-24 shrink-0 p-3 border-r border-border/60 text-right">
                        <span className="font-mono text-xs font-semibold text-muted-foreground">{slot}</span>
                      </div>

                      {/* Appointments Column */}
                      <div className="flex-1 p-2 flex flex-wrap items-center gap-2.5">
                        {slotAppointments.length > 0 ? (
                          slotAppointments.map((apt) => (
                            <div
                              key={apt.id}
                              className={cn(
                                "p-2.5 rounded-lg border text-xs flex items-center justify-between gap-3 min-w-[280px] max-w-[360px] shadow-sm",
                                apt.status === "in-consultation" && "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200",
                                apt.status === "waiting" && "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200",
                                apt.status === "confirmed" && "bg-blue-500/10 border-blue-500/30 text-blue-950 dark:text-blue-200",
                                apt.status === "completed" && "bg-muted/60 border-border text-foreground",
                                apt.status === "cancelled" && "bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200 opacity-70"
                              )}
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5 font-bold text-foreground">
                                  {apt.type === "Video" && <Video className="h-3.5 w-3.5 text-info" />}
                                  <span>{apt.patientName}</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                  {apt.doctorName} • <span className="italic">{apt.reason}</span>
                                </p>
                              </div>
                              <StatusBadge status={apt.status} />
                            </div>
                          ))
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setNewDate(selectedDate);
                              setNewTime(slot);
                              setBookModalOpen(true);
                            }}
                            className="h-full w-full py-1 text-left text-xs text-muted-foreground/50 hover:text-primary transition-colors flex items-center gap-1.5"
                          >
                            <Plus className="h-3.5 w-3.5" /> Available Slot • Click to Book
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ======================= WEEK VIEW ======================= */}
            {calendarView === "week" && (
              <div className="overflow-x-auto">
                <div className="min-w-[900px]">
                  {/* Day Columns Header */}
                  <div className="grid grid-cols-8 border-b border-border bg-muted/30 text-xs font-semibold">
                    <div className="p-2.5 text-center border-r border-border text-muted-foreground">Time</div>
                    {currentWeekDays.map((day) => {
                      const dayCount = filteredAppointments.filter((a) => a.date === day.date).length;
                      return (
                        <div
                          key={day.date}
                          className={cn(
                            "p-2.5 text-center border-r border-border cursor-pointer transition-colors",
                            day.isSelected && "bg-primary/10 text-primary font-bold",
                            day.isToday && "border-b-2 border-b-primary"
                          )}
                          onClick={() => {
                            setSelectedDate(day.date);
                            setCalendarView("day");
                          }}
                        >
                          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{day.dayName}</div>
                          <div className="text-sm font-bold text-foreground">{day.label}</div>
                          <Badge variant="outline" className="mt-1 text-[9px] py-0">
                            {dayCount} Apt{dayCount === 1 ? "" : "s"}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>

                  {/* Time Slots Rows */}
                  <div className="divide-y divide-border/60">
                    {TIME_SLOTS.map((slot) => (
                      <div key={slot} className="grid grid-cols-8 min-h-[58px] hover:bg-muted/5 transition-colors">
                        {/* Time label */}
                        <div className="p-2 border-r border-border/60 text-center font-mono text-[11px] text-muted-foreground flex items-center justify-center">
                          {slot}
                        </div>

                        {/* 7 Days Cells */}
                        {currentWeekDays.map((day) => {
                          const slotApts = filteredAppointments.filter(
                            (a) => a.date === day.date && a.time === slot
                          );

                          return (
                            <div
                              key={day.date}
                              className={cn(
                                "p-1.5 border-r border-border/60 flex flex-col gap-1 justify-center relative group",
                                day.isSelected && "bg-primary/5"
                              )}
                            >
                              {slotApts.length > 0 ? (
                                slotApts.map((apt) => (
                                  <div
                                    key={apt.id}
                                    className={cn(
                                      "p-1.5 rounded border text-[10px] leading-tight transition-all shadow-xs cursor-pointer",
                                      apt.status === "in-consultation" && "bg-emerald-500/15 border-emerald-500/40 text-emerald-950 dark:text-emerald-200",
                                      apt.status === "waiting" && "bg-amber-500/15 border-amber-500/40 text-amber-950 dark:text-amber-200",
                                      apt.status === "confirmed" && "bg-blue-500/15 border-blue-500/40 text-blue-950 dark:text-blue-200",
                                      apt.status === "completed" && "bg-muted border-border text-foreground"
                                    )}
                                    title={`${apt.patientName} (${apt.doctorName}) - ${apt.reason}`}
                                  >
                                    <strong className="block truncate">{apt.patientName}</strong>
                                    <span className="text-[9px] text-muted-foreground block truncate">{apt.doctorName}</span>
                                  </div>
                                ))
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewDate(day.date);
                                    setNewTime(slot);
                                    setBookModalOpen(true);
                                  }}
                                  className="w-full h-full rounded hover:bg-primary/10 transition-colors flex items-center justify-center text-muted-foreground/30 hover:text-primary opacity-0 group-hover:opacity-100"
                                  title={`Book ${day.label} at ${slot}`}
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: DOCTOR-WISE SIDE-BY-SIDE SCHEDULE VIEW                            */}
      {/* ========================================================================= */}
      {viewMode === "doctor-wise" && (
        <div className="space-y-4">
          {doctors
            .filter((d) => selectedDoctor === "all" || d.id === selectedDoctor)
            .filter(
              (d) =>
                selectedDepartment === "All Departments" ||
                d.department.toLowerCase() === selectedDepartment.toLowerCase() ||
                d.specialty.toLowerCase() === selectedDepartment.toLowerCase()
            ).length === 0 ? (
            <Card className="p-8 text-center border-dashed bg-muted/20">
              <p className="text-sm font-semibold text-foreground">
                No doctors registered under {selectedDepartment}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Switch to &quot;All Departments&quot; to view all doctor schedules.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 text-xs"
                onClick={() => setSelectedDepartment("All Departments")}
              >
                Reset Department Filter
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors
                .filter((d) => selectedDoctor === "all" || d.id === selectedDoctor)
                .filter(
                  (d) =>
                    selectedDepartment === "All Departments" ||
                    d.department.toLowerCase() === selectedDepartment.toLowerCase() ||
                    d.specialty.toLowerCase() === selectedDepartment.toLowerCase()
                )
                .map((doc) => {
                  const docAppointments = filteredAppointments.filter((a) => a.doctorId === doc.id);

                  return (
                    <Card key={doc.id} className="border-border bg-card shadow-sm flex flex-col justify-between">
                      <CardHeader className="p-4 pb-3 border-b border-border">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{getInitials(doc.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-sm font-bold">{doc.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {doc.department} • Room {doc.id.replace("doc_00", "10")}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 space-y-2 flex-1">
                    {docAppointments.length > 0 ? (
                      docAppointments.map((apt) => (
                        <div
                          key={apt.id}
                          className="p-2.5 rounded-lg border border-border/80 bg-muted/20 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-mono text-[10px] text-muted-foreground block">{apt.time} • {apt.date}</span>
                            <strong className="text-foreground">{apt.patientName}</strong>
                            <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">{apt.reason}</p>
                          </div>
                          <StatusBadge status={apt.status} />
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-xs text-muted-foreground">
                        No appointments booked for this doctor today.
                      </div>
                    )}
                  </CardContent>
                  <div className="p-3 border-t border-border/80 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-primary font-semibold"
                      onClick={() => {
                        setNewDoctorId(doc.id);
                        setBookModalOpen(true);
                      }}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Slot for {doc.name.split(" ")[1]}
                    </Button>
                  </div>
                </Card>
              );
            })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: APPOINTMENT QUEUE (Token Sequence)                                */}
      {/* ========================================================================= */}
      {viewMode === "queue" && (
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="p-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Today&apos;s Appointment Queue</CardTitle>
                <CardDescription className="text-xs">
                  Chronological token queue order for patient consultation intake
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-primary font-mono font-bold">
                {filteredAppointments.length} Total Tokens
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Token</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Patient Details</TableHead>
                  <TableHead>Doctor &amp; Room</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((a, idx) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono font-bold text-primary">
                      #{String(idx + 1).padStart(2, "0")}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{a.time}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback>{getInitials(a.patientName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <strong className="text-xs font-semibold text-foreground block">{a.patientName}</strong>
                          <span className="text-[10px] font-mono text-muted-foreground">{a.qlynoPatientId}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <strong>{a.doctorName}</strong>
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="flex items-center gap-1">
                        {a.type === "Video" && <Video className="h-3.5 w-3.5 text-info" />}
                        {a.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                      {a.reason}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={a.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={a.status === "in-consultation" ? "default" : "outline"}
                        disabled={a.status === "completed"}
                        className={cn(
                          "h-7 text-xs font-semibold",
                          a.status === "in-consultation"
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : a.status === "completed"
                            ? "opacity-60 cursor-not-allowed text-muted-foreground"
                            : "text-primary"
                        )}
                        onClick={() => handleCallPatient(a.id, a.patientName)}
                      >
                        {a.status === "in-consultation"
                          ? "✓ Complete Visit"
                          : a.status === "completed"
                          ? "Completed"
                          : "Call Patient"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: TABLE / LIST VIEW                                                 */}
      {/* ========================================================================= */}
      {viewMode === "table" && (
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date &amp; Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback>{getInitials(a.patientName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{a.patientName}</p>
                          <p className="font-mono text-[10px] text-muted-foreground">{a.qlynoPatientId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{a.doctorName}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {a.date} • {a.time}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm">
                        {a.type === "Video" && <Video className="h-3.5 w-3.5 text-info" />}
                        {a.type}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate text-sm text-muted-foreground">{a.reason}</TableCell>
                    <TableCell>
                      <StatusBadge status={a.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
