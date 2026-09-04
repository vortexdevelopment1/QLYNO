"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cpu,
  Edit2,
  Eye,
  Filter,
  Layers,
  Lock,
  MapPin,
  Plus,
  Radio,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
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
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { RadiologyNav } from "@/hospital-admin/components/radiology/radiology-nav";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import {
  mockExtendedRadiologyOrders,
  mockImagingSuites,
} from "@/hospital-admin/lib/mock-data/radiology-extended-operations";
import { RadiologyOrder, ImagingSuite } from "@/hospital-admin/lib/types";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Radiology Scheduling workflow";

const TIME_SLOTS = [
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

const getSlotHour = (timeStr: string): number => {
  const [time, period] = timeStr.split(" ");
  let hour = parseInt(time.split(":")[0], 10);
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return hour;
};

const formatHourToSlot = (hour: number): string => {
  if (hour === 0) return "12:00 AM";
  if (hour < 12) return `${hour.toString().padStart(2, "0")}:00 AM`;
  if (hour === 12) return "12:00 PM";
  return `${(hour - 12).toString().padStart(2, "0")}:00 PM`;
};

export default function RadiologySchedulingPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [orders, setOrders] = useState<RadiologyOrder[]>(mockExtendedRadiologyOrders);
  const [suites] = useState<ImagingSuite[]>(mockImagingSuites);
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [selectedDate, setSelectedDate] = useState("2026-08-24");

  // 1. New Slot Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingSuiteId, setBookingSuiteId] = useState("suite_01");
  const [bookingDate, setBookingDate] = useState("2026-08-24");
  const [bookingSlotTime, setBookingSlotTime] = useState("10:00 AM");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [uhid, setUhid] = useState("");
  const [bodyPart, setBodyPart] = useState("Chest CT with Contrast");
  const [doctorName, setDoctorName] = useState("Dr. Arvind Swaminathan");
  const [priority, setPriority] = useState<"Routine" | "Urgent" | "Stat Emergency">("Routine");
  const [patientLocation, setPatientLocation] = useState("Ward B, Bed 12 (IPD)");

  // 2. Booked Slot Details Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [inspectedOrder, setInspectedOrder] = useState<RadiologyOrder | null>(null);

  // 3. Edit Slot Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editPatientName, setEditPatientName] = useState("");
  const [editUhid, setEditUhid] = useState("");
  const [editBodyPart, setEditBodyPart] = useState("");
  const [editDoctorName, setEditDoctorName] = useState("");
  const [editPriority, setEditPriority] = useState<"Routine" | "Urgent" | "Stat Emergency">("Routine");
  const [editPatientLocation, setEditPatientLocation] = useState("");

  // 4. Reschedule Modal State
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("2026-08-24");
  const [rescheduleSlotTime, setRescheduleSlotTime] = useState("10:00 AM");
  const [rescheduleSuiteId, setRescheduleSuiteId] = useState("suite_01");

  // 5. Delete / Cancel Confirmation State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const requestedOrders = useMemo(() => {
    return orders.filter((o) => o.status === "Requested");
  }, [orders]);

  // Date Navigation Handlers
  const handlePrevDate = () => {
    const current = new Date(selectedDate);
    const offset = viewMode === "week" ? 7 : 1;
    current.setDate(current.getDate() - offset);
    setSelectedDate(current.toISOString().split("T")[0]);
  };

  const handleNextDate = () => {
    const current = new Date(selectedDate);
    const offset = viewMode === "week" ? 7 : 1;
    current.setDate(current.getDate() + offset);
    setSelectedDate(current.toISOString().split("T")[0]);
  };

  const handleToday = () => {
    setSelectedDate("2026-08-24");
  };

  const formattedDateDisplay = useMemo(() => {
    const d = new Date(selectedDate);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return d.toLocaleDateString("en-US", options);
  }, [selectedDate]);

  // Calculate 7 days of the week for Week View
  const weekDays = useMemo(() => {
    const curr = new Date(selectedDate);
    const dayIndex = curr.getDay(); // 0 = Sun, 1 = Mon...
    const diffToMonday = (dayIndex + 6) % 7;
    const monday = new Date(curr);
    monday.setDate(curr.getDate() - diffToMonday);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      return {
        dateStr,
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        dateFormatted: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        isToday: dateStr === "2026-08-24",
        isSelected: dateStr === selectedDate,
      };
    });
  }, [selectedDate]);

  const handleSelectRequestedOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    const ord = orders.find((o) => o.id === orderId);
    if (ord) {
      setPatientName(ord.patientName);
      setUhid(ord.uhid || "");
      setBodyPart(ord.bodyPart);
      setDoctorName(ord.orderingDoctor);
      setPriority(ord.priority);
      setPatientLocation(ord.patientLocation || "OPD Waiting Area");
    }
  };

  // Open New Slot Booking Form
  const handleOpenSlotBooking = (suite: ImagingSuite, slotTime: string, targetDate?: string) => {
    if (suite.status === "Maintenance" || suite.status === "Offline") {
      toast({
        title: "Suite Unavailable for Booking",
        description: `${suite.name} is currently in ${suite.status} status. Booking slots in non-operational suites is locked.`,
        variant: "destructive",
      });
      return;
    }

    setBookingSuiteId(suite.id);
    setBookingDate(targetDate || selectedDate);
    setBookingSlotTime(slotTime);

    if (requestedOrders.length > 0) {
      handleSelectRequestedOrder(requestedOrders[0].id);
    } else {
      setSelectedOrderId("");
      setPatientName("");
      setUhid("");
      setBodyPart(`${suite.modalityType} Specialized Study`);
      setDoctorName("Dr. Arvind Swaminathan");
      setPriority("Routine");
      setPatientLocation("OPD Waiting Area");
    }

    setBookingModalOpen(true);
  };

  // Open Booked Slot Details Modal (Inspection)
  const handleInspectBookedSlot = (order: RadiologyOrder) => {
    setInspectedOrder(order);
    setDetailModalOpen(true);
  };

  // Open Edit Modal from Inspection
  const handleOpenEditFromDetail = () => {
    if (!inspectedOrder) return;
    setEditPatientName(inspectedOrder.patientName);
    setEditUhid(inspectedOrder.uhid || "");
    setEditBodyPart(inspectedOrder.bodyPart);
    setEditDoctorName(inspectedOrder.orderingDoctor);
    setEditPriority(inspectedOrder.priority);
    setEditPatientLocation(inspectedOrder.patientLocation || "Ward B, Bed 12");
    setDetailModalOpen(false);
    setEditModalOpen(true);
  };

  // Save Edit Details
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectedOrder) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === inspectedOrder.id
          ? {
              ...o,
              patientName: editPatientName,
              uhid: editUhid,
              bodyPart: editBodyPart,
              orderingDoctor: editDoctorName,
              priority: editPriority,
              patientLocation: editPatientLocation,
            }
          : o
      )
    );

    toast({
      title: "Booking Details Updated",
      description: `Updated details for ${editPatientName} (${inspectedOrder.orderNo}). (${DELEGATION_STRING})`,
    });
    setEditModalOpen(false);
    setInspectedOrder(null);
  };

  // Open Reschedule Modal from Inspection
  const handleOpenRescheduleFromDetail = () => {
    if (!inspectedOrder) return;
    const oDate = inspectedOrder.scheduledAt ? inspectedOrder.scheduledAt.slice(0, 10) : selectedDate;
    const oHour = inspectedOrder.scheduledAt ? new Date(inspectedOrder.scheduledAt).getUTCHours() : 10;
    setRescheduleDate(oDate);
    setRescheduleSlotTime(formatHourToSlot(oHour));
    setRescheduleSuiteId(inspectedOrder.suiteId || suites[0].id);
    setDetailModalOpen(false);
    setRescheduleModalOpen(true);
  };

  // Save Rescheduled Slot
  const handleSaveReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectedOrder) return;

    const targetSuite = suites.find((s) => s.id === rescheduleSuiteId) || suites[0];
    if (targetSuite.status === "Maintenance" || targetSuite.status === "Offline") {
      toast({
        title: "Suite Locked for Service",
        description: `${targetSuite.name} is in ${targetSuite.status} status. Cannot reschedule into a locked suite.`,
        variant: "destructive",
      });
      return;
    }

    const hour = getSlotHour(rescheduleSlotTime);
    const hourStr = hour.toString().padStart(2, "0");
    const newScheduledAt = `${rescheduleDate}T${hourStr}:00:00Z`;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === inspectedOrder.id
          ? {
              ...o,
              scheduledAt: newScheduledAt,
              suiteId: targetSuite.id,
              roomName: targetSuite.name,
              modality: targetSuite.modalityType,
            }
          : o
      )
    );

    toast({
      title: "Imaging Slot Rescheduled",
      description: `${inspectedOrder.patientName} (${inspectedOrder.orderNo}) moved to ${targetSuite.name} on ${rescheduleDate} at ${rescheduleSlotTime}. (${DELEGATION_STRING})`,
    });
    setRescheduleModalOpen(false);
    setInspectedOrder(null);
  };

  // Open Cancel / Delete Confirmation
  const handleOpenDeleteConfirm = () => {
    setDetailModalOpen(false);
    setDeleteConfirmOpen(true);
  };

  // Confirm Delete / Cancel Booking
  const handleConfirmDelete = () => {
    if (!inspectedOrder) return;

    setOrders((prev) => prev.filter((o) => o.id !== inspectedOrder.id));

    toast({
      title: "Booking Cancelled & Slot Freed",
      description: `Cancelled slot booking for ${inspectedOrder.patientName} (${inspectedOrder.orderNo}). Slot is now available for new bookings. (${DELEGATION_STRING})`,
    });
    setDeleteConfirmOpen(false);
    setInspectedOrder(null);
  };

  // Check if chosen slot has existing booking in Booking Modal
  const selectedBookingSuite = useMemo(() => {
    return suites.find((s) => s.id === bookingSuiteId) || suites[0];
  }, [suites, bookingSuiteId]);

  const existingBookingInChosenSlot = useMemo(() => {
    const targetHour = getSlotHour(bookingSlotTime);
    return orders.find((o) => {
      if (!o.scheduledAt) return false;
      const oDate = o.scheduledAt.slice(0, 10);
      if (oDate !== bookingDate) return false;
      if (o.suiteId !== bookingSuiteId && o.roomName !== selectedBookingSuite?.name) return false;
      if (
        o.status !== "Scheduled" &&
        o.status !== "In Progress" &&
        o.status !== "Report Ready" &&
        o.status !== "Report Pending"
      )
        return false;
      const oHour = new Date(o.scheduledAt).getUTCHours();
      return oHour === targetHour;
    });
  }, [orders, bookingSuiteId, bookingDate, bookingSlotTime, selectedBookingSuite]);

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingSuite) return;

    if (selectedBookingSuite.status === "Maintenance" || selectedBookingSuite.status === "Offline") {
      toast({
        title: "Suite Unavailable",
        description: `${selectedBookingSuite.name} is in ${selectedBookingSuite.status} status. Cannot allocate slot.`,
        variant: "destructive",
      });
      return;
    }

    const hour = getSlotHour(bookingSlotTime);
    const hourStr = hour.toString().padStart(2, "0");
    const scheduledAtIso = `${bookingDate}T${hourStr}:00:00Z`;

    if (selectedOrderId) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrderId
            ? {
                ...o,
                status: "Scheduled",
                roomName: selectedBookingSuite.name,
                suiteId: selectedBookingSuite.id,
                modality: selectedBookingSuite.modalityType,
                scheduledAt: scheduledAtIso,
                patientLocation,
                priority,
                bodyPart,
              }
            : o
        )
      );
      toast({
        title: "Imaging Slot Allocated & Scheduled",
        description: `Order ${selectedOrderId} scheduled in ${selectedBookingSuite.name} for ${bookingDate} at ${bookingSlotTime}. (${DELEGATION_STRING})`,
      });
    } else {
      const newOrder: RadiologyOrder = {
        id: `rad_${Date.now()}`,
        orderNo: `RAD-2026-${Math.floor(8800 + Math.random() * 1000)}`,
        patientId: `P-${Math.floor(1000 + Math.random() * 9000)}`,
        patientName,
        uhid: uhid || `UHID-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        modality: selectedBookingSuite.modalityType,
        bodyPart,
        orderingDoctor: doctorName,
        source: "IPD",
        scheduledAt: scheduledAtIso,
        status: "Scheduled",
        priority,
        roomName: selectedBookingSuite.name,
        suiteId: selectedBookingSuite.id,
        patientLocation,
        price: 3500,
        tariffId: "TAR-RAD-GEN",
      };

      setOrders((prev) => [newOrder, ...prev]);
      toast({
        title: "New Scan Scheduled",
        description: `${newOrder.patientName} (${newOrder.orderNo}) booked in ${selectedBookingSuite.name} on ${bookingDate} at ${bookingSlotTime}. (${DELEGATION_STRING})`,
      });
    }

    setBookingModalOpen(false);
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Radiology Suite Scheduling"
          description="Interactive suite-column calendar for modality slot allocations, room scheduling, and patient transport routing."
          crumbs={[{ label: "Clinical Operations" }, { label: "Radiology", href: "/hospital-admin/radiology" }, { label: "Scheduling" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading scheduling calendar...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Radiology Suite Scheduling"
        description="Interactive suite-column calendar for modality slot allocations, room scheduling, and patient transport routing."
        crumbs={[{ label: "Clinical Operations" }, { label: "Radiology", href: "/hospital-admin/radiology" }, { label: "Scheduling" }]}
        actions={
          <div className="flex items-center gap-2">
            {/* Functional Day / Week View Mode Switcher */}
            <div className="flex items-center bg-muted p-0.5 rounded-lg border border-border">
              <Button
                size="sm"
                variant={viewMode === "day" ? "default" : "ghost"}
                className="h-7 text-xs px-3 font-semibold"
                onClick={() => setViewMode("day")}
              >
                Day View
              </Button>
              <Button
                size="sm"
                variant={viewMode === "week" ? "default" : "ghost"}
                className="h-7 text-xs px-3 font-semibold"
                onClick={() => setViewMode("week")}
              >
                Week View
              </Button>
            </div>
            <Button
              size="sm"
              className="gap-1.5 font-semibold text-xs bg-primary text-primary-foreground"
              onClick={() => handleOpenSlotBooking(suites[0], "10:00 AM")}
            >
              <Plus className="h-4 w-4" /> Book Imaging Slot
            </Button>
          </div>
        }
      />

      <RadiologyNav />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Radiology Resource &amp; Suite Dispatch" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
          <span>Suite Locking Protocol: Suites under Maintenance or Offline status are locked from bookings</span>
        </div>
      </div>

      {/* Date Header Ribbon */}
      <Card className="p-3 border-border bg-card shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 hover:bg-primary/10 transition-colors"
              onClick={handlePrevDate}
              title={viewMode === "week" ? "Previous Week" : "Previous Day"}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-bold text-sm text-foreground">
                {viewMode === "day" ? (
                  <>
                    {formattedDateDisplay}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      {selectedDate === "2026-08-24" ? "(Today • Live)" : "(Historical / Future)"}
                    </span>
                  </>
                ) : (
                  <>
                    Week of {weekDays[0].dateFormatted} – {weekDays[6].dateFormatted}, 2026{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (7-Day Modality Schedule Matrix)
                    </span>
                  </>
                )}
              </span>
            </div>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 hover:bg-primary/10 transition-colors"
              onClick={handleNextDate}
              title={viewMode === "week" ? "Next Week" : "Next Day"}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            {selectedDate !== "2026-08-24" && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-primary font-semibold hover:bg-primary/10"
                onClick={handleToday}
              >
                Today
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Available Slot
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" /> Booked / Scheduled
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Maintenance Lock
            </span>
          </div>
        </div>
      </Card>

      {/* VIEW MODE 1: DAY VIEW (Suite Columns & Hourly Slots) */}
      {viewMode === "day" && (
        <div className="border border-border rounded-lg bg-card overflow-x-auto shadow-xs">
          <div className="min-w-[950px]">
            {/* Suite Headers */}
            <div className="grid grid-cols-6 border-b border-border bg-muted/50 text-xs font-bold divide-x divide-border">
              <div className="p-3 text-center text-muted-foreground w-24 flex items-center justify-center font-mono">
                Time Slot
              </div>
              {suites.map((suite) => (
                <div key={suite.id} className="p-3 text-left space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-foreground font-semibold">{suite.name}</span>
                    <Badge
                      className={
                        suite.status === "Available"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[9px]"
                          : suite.status === "In Use"
                          ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 text-[9px]"
                          : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[9px]"
                      }
                    >
                      {suite.status}
                    </Badge>
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                    <span>{suite.floor}</span> • <span>{suite.modalityType}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Time Slot Rows Dynamically Populated by selectedDate */}
            <div className="divide-y divide-border text-xs">
              {TIME_SLOTS.map((time, idx) => {
                const slotHour = getSlotHour(time);

                return (
                  <div key={idx} className="grid grid-cols-6 divide-x divide-border min-h-[72px]">
                    <div className="p-2.5 text-center font-mono font-semibold text-muted-foreground bg-muted/20 flex items-center justify-center">
                      {time}
                    </div>
                    {suites.map((suite) => {
                      const isMaintenance = suite.status === "Maintenance" || suite.status === "Offline";

                      // Find order scheduled on this specific date, suite, and hour
                      const matchingOrder = orders.find((o) => {
                        if (!o.scheduledAt) return false;
                        const oDate = o.scheduledAt.slice(0, 10);
                        if (oDate !== selectedDate) return false;
                        if (o.suiteId !== suite.id && o.roomName !== suite.name) return false;
                        if (
                          o.status !== "Scheduled" &&
                          o.status !== "In Progress" &&
                          o.status !== "Report Ready" &&
                          o.status !== "Report Pending"
                        )
                          return false;
                        const oHour = new Date(o.scheduledAt).getUTCHours();
                        return oHour === slotHour;
                      });

                      if (isMaintenance) {
                        return (
                          <div
                            key={suite.id}
                            className="p-2 bg-amber-500/5 border border-dashed border-amber-500/30 flex items-center justify-center gap-1.5 text-amber-700 dark:text-amber-300 cursor-not-allowed"
                            onClick={() => handleOpenSlotBooking(suite, time, selectedDate)}
                          >
                            <Lock className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-semibold">Maintenance Lock</span>
                          </div>
                        );
                      }

                      if (matchingOrder) {
                        return (
                          <div
                            key={suite.id}
                            className="p-2 bg-primary/10 border-l-4 border-primary rounded-r-md m-1 flex flex-col justify-between hover:bg-primary/20 hover:shadow-xs transition-all cursor-pointer"
                            onClick={() => handleInspectBookedSlot(matchingOrder)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-foreground truncate">{matchingOrder.patientName}</span>
                              <Badge
                                className={
                                  matchingOrder.priority === "Stat Emergency"
                                    ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[9px]"
                                    : "text-[9px]"
                                }
                              >
                                {matchingOrder.priority}
                              </Badge>
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate font-medium">
                              {matchingOrder.bodyPart}
                            </div>
                            <div className="text-[9px] text-primary font-medium flex items-center gap-1 mt-1">
                              <MapPin className="h-2.5 w-2.5" />
                              <span className="truncate">{matchingOrder.patientLocation || "IPD Ward"}</span>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={suite.id}
                          className="p-2 hover:bg-muted/40 transition-colors cursor-pointer flex items-center justify-center group"
                          onClick={() => handleOpenSlotBooking(suite, time, selectedDate)}
                        >
                          <span className="text-[11px] text-muted-foreground opacity-0 group-hover:opacity-100 font-semibold text-primary flex items-center gap-1">
                            <Plus className="h-3 w-3" /> Book Slot
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: WEEK VIEW (7 Days as Columns, Suites as Rows) */}
      {viewMode === "week" && (
        <div className="border border-border rounded-lg bg-card overflow-x-auto shadow-xs">
          <div className="min-w-[950px]">
            {/* Day Header Row */}
            <div className="grid grid-cols-8 border-b border-border bg-muted/50 text-xs font-bold divide-x divide-border">
              <div className="p-3 text-center text-muted-foreground w-40 flex items-center justify-center">
                Imaging Suite
              </div>
              {weekDays.map((day) => (
                <div
                  key={day.dateStr}
                  className={`p-3 text-center cursor-pointer transition-colors ${
                    day.isSelected
                      ? "bg-primary/10 text-primary font-extrabold border-b-2 border-primary"
                      : "hover:bg-muted/60"
                  }`}
                  onClick={() => {
                    setSelectedDate(day.dateStr);
                    setViewMode("day");
                  }}
                  title="Click to view detailed Day Schedule"
                >
                  <div className="text-[10px] text-muted-foreground uppercase">{day.dayName}</div>
                  <div className="text-xs text-foreground font-bold">{day.dateFormatted}</div>
                  {day.isToday && (
                    <Badge variant="outline" className="text-[9px] mt-0.5 px-1 py-0 border-primary text-primary">
                      Today
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            {/* Suite Rows for Week View */}
            <div className="divide-y divide-border text-xs">
              {suites.map((suite) => {
                const isMaintenance = suite.status === "Maintenance" || suite.status === "Offline";

                return (
                  <div key={suite.id} className="grid grid-cols-8 divide-x divide-border min-h-[95px]">
                    <div className="p-3 bg-muted/20 flex flex-col justify-center">
                      <div className="font-bold text-xs text-foreground truncate">{suite.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{suite.floor}</div>
                      <Badge
                        className={
                          suite.status === "Available"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[9px] mt-1 w-fit"
                            : suite.status === "In Use"
                            ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 text-[9px] mt-1 w-fit"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[9px] mt-1 w-fit"
                        }
                      >
                        {suite.status}
                      </Badge>
                    </div>

                    {weekDays.map((day) => {
                      if (isMaintenance) {
                        return (
                          <div
                            key={day.dateStr}
                            className="p-2 bg-amber-500/5 flex flex-col items-center justify-center text-amber-700 dark:text-amber-300 cursor-not-allowed"
                          >
                            <Lock className="h-3.5 w-3.5 mb-1 opacity-70" />
                            <span className="text-[9px] font-semibold text-center">Maintenance Lock</span>
                          </div>
                        );
                      }

                      // Find all orders booked on this suite + date
                      const dayOrders = orders.filter((o) => {
                        if (!o.scheduledAt) return false;
                        const oDate = o.scheduledAt.slice(0, 10);
                        return (
                          oDate === day.dateStr &&
                          (o.suiteId === suite.id || o.roomName === suite.name) &&
                          (o.status === "Scheduled" || o.status === "In Progress" || o.status === "Report Ready" || o.status === "Report Pending")
                        );
                      });

                      return (
                        <div
                          key={day.dateStr}
                          className="p-2 hover:bg-muted/20 transition-colors flex flex-col justify-between"
                        >
                          {/* Booked Slots List */}
                          <div className="space-y-1">
                            {dayOrders.length === 0 ? (
                              <div className="text-[10px] text-muted-foreground text-center py-2 italic opacity-60">
                                Open Slot
                              </div>
                            ) : (
                              dayOrders.slice(0, 2).map((ord) => {
                                const hour = ord.scheduledAt ? new Date(ord.scheduledAt).getUTCHours() : 10;
                                return (
                                  <div
                                    key={ord.id}
                                    className="p-1.5 rounded bg-primary/10 border border-primary/25 hover:bg-primary/20 transition-colors cursor-pointer text-[10px] leading-tight"
                                    onClick={() => handleInspectBookedSlot(ord)}
                                    title="Click to view full booking details & actions"
                                  >
                                    <div className="font-bold text-foreground truncate">{ord.patientName}</div>
                                    <div className="text-[9px] text-primary font-mono flex items-center justify-between mt-0.5">
                                      <span>{formatHourToSlot(hour)}</span>
                                      <span className="text-muted-foreground text-[8px] truncate max-w-[55px]">{ord.priority}</span>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                            {dayOrders.length > 2 && (
                              <div className="text-[9px] text-muted-foreground font-semibold text-center">
                                +{dayOrders.length - 2} more
                              </div>
                            )}
                          </div>

                          {/* Distinct Book a Slot Button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-[11px] font-semibold text-primary hover:bg-primary/15 w-full mt-1.5 border border-primary/20"
                            onClick={() => handleOpenSlotBooking(suite, "10:00 AM", day.dateStr)}
                          >
                            <Plus className="h-3 w-3 mr-0.5" /> Book a slot
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 1. BOOKED SLOT DETAILS INSPECTION MODAL */}
      {inspectedOrder && (
        <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>Scheduled Slot Details</span>
                </div>
                <Badge
                  className={
                    inspectedOrder.priority === "Stat Emergency"
                      ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-xs"
                      : "text-xs"
                  }
                >
                  {inspectedOrder.priority}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Order #{inspectedOrder.orderNo} • Status: <span className="font-semibold text-foreground">{inspectedOrder.status}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              {/* Demographics Summary */}
              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Patient Name:</span>
                  <span className="font-bold text-foreground text-sm">{inspectedOrder.patientName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">UHID / ID:</span>
                  <span className="font-mono font-semibold text-primary">{inspectedOrder.uhid || inspectedOrder.patientId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Modality &amp; Study:</span>
                  <span className="font-medium text-foreground">{inspectedOrder.modality} — {inspectedOrder.bodyPart}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Machine Bay / Suite:</span>
                  <span className="font-medium text-foreground">{inspectedOrder.roomName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Scheduled Date &amp; Time:</span>
                  <span className="font-mono text-primary font-bold">
                    {inspectedOrder.scheduledAt
                      ? `${new Date(inspectedOrder.scheduledAt).toLocaleDateString()} at ${formatHourToSlot(
                          new Date(inspectedOrder.scheduledAt).getUTCHours()
                        )}`
                      : "Not Scheduled"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Ordering Doctor:</span>
                  <span className="font-medium text-foreground">{inspectedOrder.orderingDoctor} ({inspectedOrder.source || "OPD"})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Patient Location / Bed:</span>
                  <span className="font-mono text-primary font-semibold">{inspectedOrder.patientLocation || "OPD Waiting Area"}</span>
                </div>
              </div>

              {inspectedOrder.criticalFinding && (
                <div className="p-2.5 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-[11px] font-medium space-y-0.5">
                  <span className="font-bold flex items-center gap-1">
                    <AlertOctagon className="h-3.5 w-3.5" /> Critical Finding Alert Flagged
                  </span>
                  <p>{inspectedOrder.criticalDetails}</p>
                </div>
              )}
            </div>

            {/* Functional Action Buttons: Edit, Reschedule, Delete */}
            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 mr-auto"
                onClick={handleOpenDeleteConfirm}
              >
                <Trash2 className="h-3.5 w-3.5" /> Cancel Booking
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs text-primary border-primary/30 hover:bg-primary/10"
                onClick={handleOpenRescheduleFromDetail}
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reschedule Slot
              </Button>
              <Button
                type="button"
                size="sm"
                className="gap-1.5 text-xs bg-primary text-primary-foreground"
                onClick={handleOpenEditFromDetail}
              >
                <Edit2 className="h-3.5 w-3.5" /> Edit Details
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 2. EDIT BOOKING DETAILS MODAL */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSaveEdit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-primary" /> Edit Scheduled Booking Details
              </DialogTitle>
              <DialogDescription className="text-xs">
                Update patient demographic or clinical parameters for Order #{inspectedOrder?.orderNo}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-3 text-xs">
              <div className="grid gap-1">
                <Label htmlFor="e-pat">Patient Name *</Label>
                <Input
                  id="e-pat"
                  required
                  value={editPatientName}
                  onChange={(e) => setEditPatientName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="e-uhid">UHID</Label>
                  <Input
                    id="e-uhid"
                    value={editUhid}
                    onChange={(e) => setEditUhid(e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="e-prio">Priority</Label>
                  <Select value={editPriority} onValueChange={(v) => setEditPriority(v as any)}>
                    <SelectTrigger id="e-prio" className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Routine">Routine</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                      <SelectItem value="Stat Emergency">Stat Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="e-part">Study / Body Part *</Label>
                <Input
                  id="e-part"
                  required
                  value={editBodyPart}
                  onChange={(e) => setEditBodyPart(e.target.value)}
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="e-doc">Ordering Physician *</Label>
                <Input
                  id="e-doc"
                  required
                  value={editDoctorName}
                  onChange={(e) => setEditDoctorName(e.target.value)}
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="e-loc">Patient Location / Bed *</Label>
                <Input
                  id="e-loc"
                  required
                  value={editPatientLocation}
                  onChange={(e) => setEditPatientLocation(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 3. RESCHEDULE SLOT MODAL */}
      <Dialog open={rescheduleModalOpen} onOpenChange={setRescheduleModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSaveReschedule}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-primary" /> Reschedule Imaging Slot
              </DialogTitle>
              <DialogDescription className="text-xs">
                Select a new date, time slot, or operational machine suite for {inspectedOrder?.patientName}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-3 text-xs">
              <div className="p-2.5 rounded-lg border border-border bg-muted/20 space-y-1">
                <span className="text-[10px] text-muted-foreground block">Currently Booked:</span>
                <span className="font-semibold text-foreground">
                  {inspectedOrder?.roomName} • {inspectedOrder?.scheduledAt ? new Date(inspectedOrder.scheduledAt).toLocaleDateString() : ""}
                </span>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="r-suite">Target Machine Bay / Suite *</Label>
                <Select value={rescheduleSuiteId} onValueChange={setRescheduleSuiteId}>
                  <SelectTrigger id="r-suite" className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {suites.map((s) => (
                      <SelectItem
                        key={s.id}
                        value={s.id}
                        disabled={s.status === "Maintenance" || s.status === "Offline"}
                      >
                        {s.name} ({s.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="r-date">New Scheduled Date *</Label>
                  <Input
                    id="r-date"
                    type="date"
                    required
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="r-time">New Slot Time *</Label>
                  <Select value={rescheduleSlotTime} onValueChange={setRescheduleSlotTime}>
                    <SelectTrigger id="r-time" className="text-xs">
                      <SelectValue />
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
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setRescheduleModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground">
                Confirm Reschedule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 4. CANCEL / DELETE CONFIRMATION DIALOG */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5 text-destructive" /> Cancel Imaging Booking
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to cancel and remove the booked slot for{" "}
              <span className="font-bold text-foreground">{inspectedOrder?.patientName}</span> ({inspectedOrder?.orderNo})?
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 text-xs text-muted-foreground space-y-2">
            <p>
              This action will release the slot in <span className="font-semibold text-foreground">{inspectedOrder?.roomName}</span>,
              making it immediately available for other patients.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setDeleteConfirmOpen(false)}>
              Keep Booking
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold"
              onClick={handleConfirmDelete}
            >
              Yes, Cancel &amp; Free Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 5. NEW SLOT BOOKING MODAL */}
      <Dialog open={bookingModalOpen} onOpenChange={setBookingModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleConfirmBooking}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> Allocate Suite Slot &amp; Schedule
              </DialogTitle>
              <DialogDescription className="text-xs">
                Select target machine suite, scheduled date, and available time slot.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-3 text-xs">
              {/* Target Suite Dropdown */}
              <div className="grid gap-1">
                <Label htmlFor="b-suite">Target Imaging Suite *</Label>
                <Select value={bookingSuiteId} onValueChange={setBookingSuiteId}>
                  <SelectTrigger id="b-suite" className="text-xs">
                    <SelectValue placeholder="Select machine bay..." />
                  </SelectTrigger>
                  <SelectContent>
                    {suites.map((s) => (
                      <SelectItem
                        key={s.id}
                        value={s.id}
                        disabled={s.status === "Maintenance" || s.status === "Offline"}
                      >
                        {s.name} ({s.modalityType}) — {s.status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date & Slot Time Dropdowns */}
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="b-date">Scheduled Date *</Label>
                  <Input
                    id="b-date"
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="b-time">Available Slot Time *</Label>
                  <Select value={bookingSlotTime} onValueChange={setBookingSlotTime}>
                    <SelectTrigger id="b-time" className="text-xs">
                      <SelectValue placeholder="Choose time..." />
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

              {/* Slot Availability Live Indicator */}
              <div className="p-2.5 rounded-lg border border-border bg-muted/20 flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Slot Status:</span>
                {existingBookingInChosenSlot ? (
                  <span className="text-amber-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> Booked: {existingBookingInChosenSlot.patientName}
                  </span>
                ) : (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Available Slot
                  </span>
                )}
              </div>

              {requestedOrders.length > 0 && (
                <div className="grid gap-1">
                  <Label htmlFor="b-req">Select from Requested Orders</Label>
                  <Select value={selectedOrderId} onValueChange={handleSelectRequestedOrder}>
                    <SelectTrigger id="b-req" className="text-xs">
                      <SelectValue placeholder="Choose pending order..." />
                    </SelectTrigger>
                    <SelectContent>
                      {requestedOrders.map((ro) => (
                        <SelectItem key={ro.id} value={ro.id}>
                          {ro.patientName} ({ro.modality} {ro.bodyPart}) — {ro.priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-1">
                <Label htmlFor="b-pat">Patient Name *</Label>
                <Input
                  id="b-pat"
                  required
                  placeholder="e.g. Ramesh Sharma"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="b-uhid">UHID</Label>
                  <Input
                    id="b-uhid"
                    placeholder="e.g. UHID-2026-1001"
                    value={uhid}
                    onChange={(e) => setUhid(e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="b-prio">Priority</Label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                    <SelectTrigger id="b-prio" className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Routine">Routine</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                      <SelectItem value="Stat Emergency">Stat Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="b-part">Anatomical Region / Study Type *</Label>
                <Input
                  id="b-part"
                  required
                  value={bodyPart}
                  onChange={(e) => setBodyPart(e.target.value)}
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="b-loc">Patient Location (Wards &amp; Beds / OPD Clinic) *</Label>
                <Input
                  id="b-loc"
                  required
                  placeholder="e.g. Ward B, Bed 12 (IPD Transport)"
                  value={patientLocation}
                  onChange={(e) => setPatientLocation(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setBookingModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground">
                Confirm Slot Booking
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
