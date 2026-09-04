"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Award,
  Bed,
  Bell,
  Building,
  Building2,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  HeartPulse,
  Layers,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Send,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sparkles,
  Stethoscope,
  Trash2,
  TrendingUp,
  User,
  UserCheck,
  UserPlus,
  Users,
  Wrench,
  XCircle,
  Zap,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/hospital-admin/components/ui/avatar";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/hospital-admin/components/ui/dropdown-menu";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Progress } from "@/hospital-admin/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/hospital-admin/components/ui/tabs";
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { RoleGate } from "@/hospital-admin/components/nursing/role-gate";
import { RosterGrid } from "@/hospital-admin/components/roster/RosterGrid";
import { mockRoster } from "@/hospital-admin/lib/mock/nursing";

import {
  setActiveStation,
  updateTaskStatus,
  createNursingTask,
  assignPatientToNurse,
  createShiftHandover,
  acknowledgeShiftHandover,
  respondDoctorInstruction,
  reviewStaffRequest,
  registerNurse,
  registerSupportStaff,
  createShiftTemplate,
  sendAnnouncement,
  updateEscalationStatus,
  markNotificationRead,
} from "@/hospital-admin/store/slices/nursingOperationsSlice";

export default function OperationalNurseStationPage() {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const {
    currentRole,
    activeStationId,
    stations,
    nurses,
    supportStaff,
    shiftTemplates,
    roster,
    patientAssignments,
    tasks,
    handovers,
    doctorInstructions,
    staffRequests,
    notifications,
    escalations,
    auditLogs,
  } = useSelector((state: RootState) => state.nursingOperations);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isSeniorNurse = currentRole === "senior_nurse";

  const activeStation = stations.find((s) => s.station_id === activeStationId) || stations[0];
  const stationNurses = nurses.filter((n) => n.station_id === activeStation.station_id);
  const stationSupportStaff = supportStaff.filter((s) => s.station_id === activeStation.station_id);
  const stationPatients = patientAssignments.filter((p) => p.station_id === activeStation.station_id);
  const stationTasks = tasks.filter((t) => t.station_id === activeStation.station_id);
  const stationInstructions = doctorInstructions.filter((d) => d.station_id === activeStation.station_id);
  const stationEscalations = escalations.filter((e) => e.station_id === activeStation.station_id);
  const stationHandovers = handovers.filter((h) => h.station_id === activeStation.station_id);
  const myNotifications = notifications.filter((n) => n.station_id === activeStation.station_id);
  const unreadCount = myNotifications.filter((n) => n.status === "Unread").length;

  // Search & Filter State — GAP 2 (Tasks + Handover search)
  const [taskSearchQuery, setTaskSearchQuery] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState("all");
  const [handoverStatusFilter, setHandoverStatusFilter] = useState("all");
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  // Reports Filter & Export State (Section 13)
  const [reportShiftFilter, setReportShiftFilter] = useState("all");
  const [reportDateRange, setReportDateRange] = useState("today");

  const handleExportReports = (format: "csv" | "pdf") => {
    toast({
      title: `Operational Report Exported (${format.toUpperCase()})`,
      description: `${activeStation.name} shift performance, attendance, workload & SLA metrics compiled successfully.`,
    });
  };

  // Filtered derived data
  const filteredTasks = stationTasks.filter((t) => {
    const matchesSearch = !taskSearchQuery || t.title.toLowerCase().includes(taskSearchQuery.toLowerCase()) || (t.patient_name || "").toLowerCase().includes(taskSearchQuery.toLowerCase()) || t.owner_name.toLowerCase().includes(taskSearchQuery.toLowerCase());
    const matchesStatus = taskStatusFilter === "all" || (taskStatusFilter === "overdue" ? t.is_overdue : t.status === taskStatusFilter);
    return matchesSearch && matchesStatus;
  });
  const filteredHandovers = stationHandovers.filter((h) => handoverStatusFilter === "all" || h.status === handoverStatusFilter);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [isPatientAssignModalOpen, setIsPatientAssignModalOpen] = useState(false);
  const [isOnboardNurseModalOpen, setIsOnboardNurseModalOpen] = useState(false);
  const [isOnboardSupportStaffModalOpen, setIsOnboardSupportStaffModalOpen] = useState(false);
  const [isCreateShiftModalOpen, setIsCreateShiftModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isExceptionsModalOpen, setIsExceptionsModalOpen] = useState(false);

  // Form States for Quick Actions
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskType, setTaskType] = useState<any>("Medication");
  const [taskPriority, setTaskPriority] = useState<any>("High");
  const [taskDue, setTaskDue] = useState("12:00 PM");
  const [taskOwnerId, setTaskOwnerId] = useState(stationNurses[0]?.staff_id || "nurse-3");
  const [taskPatientId, setTaskPatientId] = useState(stationPatients[0]?.patient_id || "pat-101");

  // Handover Form State
  const [handoverIncomingNurse, setHandoverIncomingNurse] = useState(stationNurses[1]?.name || "Sister Sneha Kulkarni");
  const [handoverNotes, setHandoverNotes] = useState("");

  // Patient Reassign State
  const [selectedPatientId, setSelectedPatientId] = useState(stationPatients[0]?.patient_id || "pat-101");
  const [newNurseId, setNewNurseId] = useState(stationNurses[0]?.staff_id || "nurse-3");
  const [reassignReason, setReassignReason] = useState("");

  // Onboard Nurse Form State
  const [onboardName, setOnboardName] = useState("");
  const [onboardEmail, setOnboardEmail] = useState("");
  const [onboardCouncilId, setOnboardCouncilId] = useState("");
  const [onboardRole, setOnboardRole] = useState<any>("Nurse");
  const [onboardShift, setOnboardShift] = useState("Morning (07:00-15:00)");

  // Onboard Support Staff Form State
  const [onboardSupName, setOnboardSupName] = useState("");
  const [onboardSupPhone, setOnboardSupPhone] = useState("");
  const [onboardSupCategory, setOnboardSupCategory] = useState<any>("Ward / Patient-care Attendant");

  // Create Shift Form State
  const [shiftName, setShiftName] = useState<any>("Custom");
  const [shiftStartTime, setShiftStartTime] = useState("08:00");
  const [shiftEndTime, setShiftEndTime] = useState("16:00");

  // Broadcast Message State
  const [broadcastMsg, setBroadcastMsg] = useState("");

  // Action Listener for Header Quick Actions
  useEffect(() => {
    const handleAction = (actionName: string) => {
      if (actionName === "add-nurse") setIsOnboardNurseModalOpen(true);
      if (actionName === "add-support-staff") setIsOnboardSupportStaffModalOpen(true);
      if (actionName === "create-shift") setIsCreateShiftModalOpen(true);
      if (actionName === "assign-patient") setIsPatientAssignModalOpen(true);
      if (actionName === "assign-task") setIsTaskModalOpen(true);
      if (actionName === "start-handover") setIsHandoverModalOpen(true);
      if (actionName === "broadcast") setIsBroadcastModalOpen(true);
      if (actionName === "exceptions") setIsExceptionsModalOpen(true);
      if (actionName === "roster") setActiveTab("roster");
    };

    const onCustomEvent = (e: any) => {
      if (e.detail) handleAction(e.detail);
    };

    window.addEventListener("nurse-station-action", onCustomEvent);

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const action = params.get("action");
      if (action) handleAction(action);
    }

    return () => {
      window.removeEventListener("nurse-station-action", onCustomEvent);
    };
  }, []);

  // Handler: Create Task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const owner = stationNurses.find((n) => n.staff_id === taskOwnerId);
    const patient = stationPatients.find((p) => p.patient_id === taskPatientId);

    dispatch(
      createNursingTask({
        title: taskTitle,
        description: taskDesc,
        task_type: taskType,
        priority: taskPriority,
        due_at: taskDue,
        owner_id: taskOwnerId,
        owner_name: owner?.name || "Staff Nurse",
        owner_role: "Nurse",
        station_id: activeStation.station_id,
        patient_id: taskPatientId,
        patient_name: patient?.patient_name,
        bed_info: patient ? `${patient.ward} (${patient.bed})` : undefined,
        status: "Pending",
      })
    );

    setIsTaskModalOpen(false);
    setTaskTitle("");
    setTaskDesc("");
    toast({
      title: "Nursing Task Assigned",
      description: `Task assigned to ${owner?.name}. Updated across Station and Nurse workspace.`,
    });
  };

  // Handler: Reassign Patient
  const handleReassignPatient = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNurse = stationNurses.find((n) => n.staff_id === newNurseId);
    if (!targetNurse) return;

    dispatch(
      assignPatientToNurse({
        patientId: selectedPatientId,
        nurseId: newNurseId,
        nurseName: targetNurse.name,
        reason: reassignReason || "Workload rebalancing",
        actor: isSeniorNurse ? "Senior Nurse (Delegated)" : activeStation.lead_name,
      })
    );

    setIsPatientAssignModalOpen(false);
    setReassignReason("");
    toast({
      title: "Patient Care Reassigned",
      description: `Patient reassigned to ${targetNurse.name}. Logged in Station audit trail.`,
    });
  };

  // Handler: Submit Handover
  const handleStartHandover = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(
      createShiftHandover({
        station_id: activeStation.station_id,
        shift_id: "sh-1",
        shift_name: "Morning Shift (07:00-15:00)",
        outgoing_nurse_id: isSeniorNurse ? "nurse-2" : "nurse-1",
        outgoing_nurse_name: isSeniorNurse ? "Sister Sneha Kulkarni" : activeStation.lead_name,
        incoming_nurse_id: "nurse-4",
        incoming_nurse_name: handoverIncomingNurse,
        patients_count: stationPatients.length,
        patient_summaries: stationPatients.map((p) => ({
          patient_id: p.patient_id,
          patient_name: p.patient_name,
          bed: p.bed,
          key_updates: p.diagnosis_preview || "Stable post treatment",
          pending_tasks: stationTasks.filter((t) => t.patient_id === p.patient_id && t.status !== "Completed").map((t) => t.title),
          critical_alerts: p.vitals_status === "Critical" ? "Critical vitals observed" : undefined,
          medication_status: "Active MAR items scheduled",
          doctor_instructions: "Checked and acknowledged",
        })),
        structured_notes: handoverNotes || "Shift completed smoothly. All active infusions checked.",
        unresolved_items: stationTasks.filter((t) => t.is_overdue).map((t) => t.title),
      })
    );

    setIsHandoverModalOpen(false);
    setHandoverNotes("");
    toast({
      title: "Shift Handover Initiated",
      description: `Handover package created for ${handoverIncomingNurse}. Awaiting digital acknowledgement.`,
    });
  };

  // Handler: Onboard Nurse
  const handleOnboardNurse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardName || !onboardCouncilId) return;

    dispatch(
      registerNurse({
        name: onboardName,
        email: onboardEmail || `${onboardName.toLowerCase().replace(/\s+/g, ".")}@qlyno.health`,
        phone: "+91 98200 99881",
        employee_id: `NUR-${Date.now().toString().slice(-4)}`,
        organization_id: "org-qlyno-1",
        station_id: activeStation.station_id,
        station_name: activeStation.name,
        department_id: activeStation.department_id,
        department_name: activeStation.department_name,
        role: onboardRole,
        status: "Active",
        availability: "Available",
        qualifications: ["B.Sc Nursing", "BLS Certified"],
        councilRegistrationId: onboardCouncilId,
        defaultShiftPattern: onboardShift,
      })
    );

    setIsOnboardNurseModalOpen(false);
    setOnboardName("");
    setOnboardCouncilId("");
    toast({
      title: "Nurse Onboarded",
      description: `${onboardName} added to ${activeStation.name}. Credentials verified.`,
    });
  };

  // Handler: Onboard Support Staff
  const handleOnboardSupportStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardSupName) return;

    dispatch(
      registerSupportStaff({
        name: onboardSupName,
        category: onboardSupCategory,
        station_id: activeStation.station_id,
        station_name: activeStation.name,
        department_name: activeStation.department_name,
        status: "Active",
        availability: "Available",
        phone: onboardSupPhone || "+91 98111 00999",
        email: `${onboardSupName.toLowerCase().replace(/\s+/g, ".")}@qlyno.health`,
      })
    );

    setIsOnboardSupportStaffModalOpen(false);
    setOnboardSupName("");
    setOnboardSupPhone("");
    toast({
      title: "Support Staff Added",
      description: `${onboardSupName} assigned to ${activeStation.name}.`,
    });
  };

  // Handler: Create Shift
  const handleCreateShift = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(createShiftTemplate({
      name: shiftName,
      start_time: shiftStartTime,
      end_time: shiftEndTime,
      break_duration_mins: 30,
      grace_period_mins: 10,
      department_id: activeStation.department_id,
      actor: activeStation.lead_name,
    }));
    setIsCreateShiftModalOpen(false);
    toast({
      title: "Shift Created",
      description: `${shiftName} Shift (${shiftStartTime} – ${shiftEndTime}) configured for ${activeStation.name}.`,
    });
  };

  // Handler: Broadcast Message
  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMsg.trim()) return;
    dispatch(sendAnnouncement({
      stationId: activeStation.station_id,
      recipients: [...stationNurses, ...stationSupportStaff].filter((person) => person.status === "Active").map((person) => ({ id: person.staff_id, name: person.name })),
      message: broadcastMsg,
      actor: activeStation.lead_name,
    }));
    setIsBroadcastModalOpen(false);
    setBroadcastMsg("");
    toast({
      title: "Broadcast Dispatched",
      description: "Operational message sent to all active nurses and support staff on duty.",
    });
  };

  const overdueTasksCount = stationTasks.filter((t) => t.is_overdue).length;
  const criticalPatientsCount = stationPatients.filter((p) => p.vitals_status === "Critical" || p.vitals_status === "Attention").length;

  return (
    <RoleGate allowed={["admin", "nurse_lead", "senior_nurse"]}>
      <div className="space-y-5 animate-fade-in pb-12">
      {/* 1. Station Control Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HeartPulse className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                {activeStation.name}
                <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-500/10 border-emerald-500/30">
                  Live Operations
                </Badge>
              </h1>
              <p className="text-xs text-muted-foreground">
                {activeStation.location_name} · Lead: <strong>{activeStation.lead_name}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Station Switcher - Hospital Admin Oversight Only */}
          {mounted && currentRole === "admin" && (
            <Select value={activeStationId} onValueChange={(val) => dispatch(setActiveStation(val))}>
              <SelectTrigger className="h-8 text-xs font-semibold w-full sm:w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stations.map((st) => (
                  <SelectItem key={st.station_id} value={st.station_id}>
                    {st.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Scope Indicator - Locked to Assigned Unit for Station Lead */}
          <ScopeIndicator
            scope="Station Lead"
            stationName={isSeniorNurse ? `${activeStation.name} (Senior Nurse Restricted)` : activeStation.name}
          />

          {/* GAP 3: Notification Bell */}
          <div className="relative">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1.5 relative"
              onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
            >
              <Bell className="h-3.5 w-3.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[9px] font-bold text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
              Notifications
            </Button>
            {isNotificationPanelOpen && (
              <div className="absolute right-0 top-10 z-50 w-[calc(100vw-2.5rem)] sm:w-[340px] max-w-[340px] rounded-xl border border-border bg-card shadow-xl">
                <div className="flex items-center justify-between p-3 border-b border-border">
                  <span className="text-xs font-bold text-foreground">Station Notifications</span>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && <Badge className="bg-destructive/15 text-destructive text-[10px]">{unreadCount} Unread</Badge>}
                    <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => setIsNotificationPanelOpen(false)}>Close</Button>
                  </div>
                </div>
                <div className="max-h-[320px] overflow-y-auto divide-y divide-border">
                  {myNotifications.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">No notifications</p>
                  ) : (
                    myNotifications.slice(0, 12).map((notif) => (
                      <div
                        key={notif.notification_id}
                        className={`p-3 text-xs transition-colors cursor-pointer hover:bg-muted/30 ${notif.status === "Unread" ? "bg-primary/5" : ""}`}
                        onClick={() => dispatch(markNotificationRead({ notificationId: notif.notification_id, recipientId: notif.recipient_id }))}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-foreground">{notif.title}</span>
                          {notif.status === "Unread" && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">{new Date(notif.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Emergency & Trauma Station Header Banner */}
      {activeStation.department_name === "Emergency & Trauma" && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-destructive text-white flex items-center justify-center shrink-0">
              <Siren className="h-4 w-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-foreground">Emergency &amp; Trauma Resuscitation Command</span>
                <Badge className="bg-destructive text-white text-[10px] animate-pulse">24/7 Red Alert Active</Badge>
              </div>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                {stationPatients.filter(p => p.care_level === "Critical").length} Resuscitation Red Patients · {stationTasks.filter(t => t.priority === "High" && t.status !== "Completed").length} STAT Doctor Orders · Manchester Triage Live
              </p>
            </div>
          </div>
          <Button asChild size="sm" variant="outline" className="h-8 text-xs border-rose-500/40 text-rose-700 dark:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 font-bold gap-1.5 shrink-0">
            <Link href="/hospital-admin/emergency">
              <Siren className="h-3.5 w-3.5 text-destructive" /> Open ER Command Center &rarr;
            </Link>
          </Button>
        </div>
      )}

      {/* 2. Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-1 shadow-xs overflow-x-auto scrollbar-none">
          <TabsList className="flex h-auto w-max sm:w-full items-center justify-start sm:justify-between gap-1 bg-transparent p-0">
            <TabsTrigger value="dashboard" className="text-xs font-semibold px-3 py-1.5 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Activity className="h-3.5 w-3.5" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="nurses" className="text-xs font-semibold px-3 py-1.5 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="h-3.5 w-3.5" /> Nurses ({stationNurses.length})
            </TabsTrigger>
            <TabsTrigger value="support-staff" className="text-xs font-semibold px-3 py-1.5 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Sparkles className="h-3.5 w-3.5" /> Support Staff ({stationSupportStaff.length})
            </TabsTrigger>
            <TabsTrigger value="roster" className="text-xs font-semibold px-3 py-1.5 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Calendar className="h-3.5 w-3.5" /> Shifts &amp; Roster
            </TabsTrigger>
            <TabsTrigger value="patients" className="text-xs font-semibold px-3 py-1.5 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Bed className="h-3.5 w-3.5" /> Patients ({stationPatients.length})
            </TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs font-semibold px-3 py-1.5 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileCheck className="h-3.5 w-3.5" /> Tasks ({stationTasks.filter(t => t.status !== "Completed").length})
            </TabsTrigger>
            <TabsTrigger value="handover" className="text-xs font-semibold px-3 py-1.5 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ArrowRight className="h-3.5 w-3.5" /> Handover
            </TabsTrigger>
            <TabsTrigger value="communication" className="text-xs font-semibold px-3 py-1.5 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <MessageSquare className="h-3.5 w-3.5" /> Doctor Coord ({stationInstructions.length})
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-xs font-semibold px-3 py-1.5 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileSpreadsheet className="h-3.5 w-3.5" /> Reports
            </TabsTrigger>
            <TabsTrigger value="audit" className="text-xs font-semibold px-3 py-1.5 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ShieldCheck className="h-3.5 w-3.5" /> Audit Logs
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs font-semibold px-3 py-1.5 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Settings className="h-3.5 w-3.5" /> Settings
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: OPERATIONAL DASHBOARD (11 Required Sections) */}
        <TabsContent value="dashboard" className="space-y-4 focus-visible:outline-none">
          {/* Section 1: Today KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="p-3.5 border-border bg-card shadow-xs">
              <span className="text-[11px] text-muted-foreground uppercase font-bold">Active Shift</span>
              <p className="text-lg font-bold font-mono text-primary mt-0.5">Morning (07:00–15:00)</p>
              <span className="text-[10px] text-muted-foreground">ICU Ward 2nd Floor</span>
            </Card>
            <Card className="p-3.5 border-border bg-card shadow-xs">
              <span className="text-[11px] text-muted-foreground uppercase font-bold">Nurses On Duty</span>
              <p className="text-lg font-bold font-mono text-emerald-600 mt-0.5">
                {stationNurses.filter((n) => n.availability === "On Duty").length} / {stationNurses.length} Staff
              </p>
              <span className="text-[10px] text-emerald-600">Coverage 100% Optimal</span>
            </Card>
            <Card className="p-3.5 border-border bg-card shadow-xs">
              <span className="text-[11px] text-muted-foreground uppercase font-bold">Inpatient Care Load</span>
              <p className="text-lg font-bold font-mono text-cyan-600 mt-0.5">
                {activeStation.occupiedBeds} Beds ({stationPatients.length} Active)
              </p>
              <span className="text-[10px] text-cyan-600">2 Critical Attention</span>
            </Card>
            <Card className="p-3.5 border-border bg-card shadow-xs">
              <span className="text-[11px] text-muted-foreground uppercase font-bold">Pending Tasks / Overdue</span>
              <p className="text-lg font-bold font-mono text-amber-600 mt-0.5">
                {stationTasks.filter((t) => t.status === "Pending").length} Pending ({overdueTasksCount} Overdue)
              </p>
              <span className="text-[10px] text-amber-600 font-medium">Real-time Task Matrix</span>
            </Card>
          </div>

          {/* Section 2 & 3: Nurse Availability & Shift Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 2. Nurse Availability Chips */}
            <Card className="border-border shadow-xs">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span>Nurse Availability Roster</span>
                  <Badge variant="outline" className="text-[10px]">{stationNurses.length} Roster Assigned</Badge>
                </CardTitle>
                <CardDescription className="text-xs">Live duty status across ICU Station.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-2.5">
                <div className="divide-y divide-border">
                  {stationNurses.map((n) => (
                    <div key={n.staff_id} className="py-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7 border border-border">
                          <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                            {n.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">{n.name}</p>
                          <p className="text-[10px] text-muted-foreground">{n.role} · {n.councilRegistrationId}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            n.availability === "On Duty"
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                              : n.availability === "Break"
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                              : "bg-muted text-muted-foreground text-[10px]"
                          }
                        >
                          {n.availability}
                        </Badge>
                        <span className="text-[11px] font-mono text-muted-foreground">{n.assignedPatientsCount} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 3. Shift Status & Coverage */}
            <Card className="border-border shadow-xs">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span>Shift Status &amp; Coverage Tracking</span>
                  <Badge className="bg-primary/10 text-primary border-primary/30 text-[10px]">Morning Shift</Badge>
                </CardTitle>
                <CardDescription className="text-xs">Upcoming transitions and shift change requests.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-3">
                <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground">Current Shift: Morning (07:00 – 15:00)</span>
                    <span className="text-emerald-600 font-bold">4 Staff Assigned</span>
                  </div>
                  <Progress value={85} className="h-1.5" />
                  <p className="text-[11px] text-muted-foreground">
                    Next Shift Handover scheduled at <strong>14:45 PM</strong> to Evening Shift Lead (Sister Sneha).
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">Pending Staff Requests:</span>
                  {staffRequests.map((req) => (
                    <div key={req.request_id} className="flex items-center justify-between rounded-lg border border-border p-2.5 text-xs bg-card">
                      <div>
                        <p className="font-semibold text-foreground">{req.staff_name} ({req.type})</p>
                        <p className="text-[11px] text-muted-foreground">{req.details}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-[10px] text-emerald-600 hover:bg-emerald-50"
                          onClick={() => {
                            dispatch(reviewStaffRequest({ requestId: req.request_id, status: "Approved", reviewer: activeStation.lead_name }));
                            toast({ title: "Request Approved" });
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-[10px] text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            dispatch(reviewStaffRequest({ requestId: req.request_id, status: "Rejected", reviewer: activeStation.lead_name }));
                            toast({ title: "Request Rejected" });
                          }}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section 4 & 5: Patients Care Load & Live Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 4. Patients / Care Load */}
            <Card className="border-border shadow-xs">
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold">Assigned Patient Care Load</CardTitle>
                  <CardDescription className="text-xs">Bed locations, assigned nurses, and vitals status.</CardDescription>
                </div>
                <Button size="sm" variant="ghost" className="h-7 text-xs text-primary" onClick={() => setActiveTab("patients")}>
                  View All &rarr;
                </Button>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="divide-y divide-border">
                  {stationPatients.map((p) => (
                    <div key={p.assignment_id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{p.patient_name}</span>
                          <Badge variant="outline" className="text-[10px] font-mono">{p.bed}</Badge>
                          <Badge
                            className={
                              p.care_level === "Critical"
                                ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[9px]"
                                : "bg-blue-500/10 text-blue-600 text-[9px]"
                            }
                          >
                            {p.care_level}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate max-w-[280px]">{p.diagnosis_preview}</p>
                      </div>

                      <div className="text-right">
                        <span className="font-medium text-foreground">{p.nurse_name}</span>
                        <p className="text-[10px] text-muted-foreground">Vitals: {p.last_vitals_time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 5. Live Tasks & Overdue Escalations */}
            <Card className="border-border shadow-xs">
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold">Active Station Tasks &amp; Escalations</CardTitle>
                  <CardDescription className="text-xs">Medication schedules, care procedures, and status.</CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={() => setIsTaskModalOpen(true)} className="h-7 text-xs gap-1">
                  <Plus className="h-3 w-3" /> New Task
                </Button>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-2.5">
                <div className="divide-y divide-border">
                  {stationTasks.slice(0, 4).map((t) => (
                    <div key={t.task_id} className="py-2 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-foreground">{t.title}</span>
                          {t.is_overdue && (
                            <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-[9px]">
                              OVERDUE
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-[9px]">{t.priority}</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {t.patient_name ? `${t.patient_name} (${t.bed_info})` : t.bed_info} · Due: {t.due_at} · Owner: <strong>{t.owner_name}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Badge
                          className={
                            t.status === "Completed"
                              ? "bg-emerald-500/15 text-emerald-700 text-[10px]"
                              : t.status === "In Progress"
                              ? "bg-blue-500/15 text-blue-700 text-[10px]"
                              : "bg-amber-500/15 text-amber-700 text-[10px]"
                          }
                        >
                          {t.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section 6, 7 & 8: Handover, Critical Alerts & Doctor Coordination */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 6. Handover Summary */}
            <Card className="border-border shadow-xs">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>Shift Handover Status</span>
                  <ArrowRight className="h-3.5 w-3.5 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-2 text-xs">
                <div className="rounded-md border border-border p-2.5 bg-muted/20">
                  <p className="font-semibold text-foreground">Last Shift: Night Handover</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">David Dsouza &rarr; Anita Joseph</p>
                  <Badge className="mt-1.5 bg-emerald-500/15 text-emerald-700 text-[10px]">Acknowledged</Badge>
                </div>
                <Button size="sm" variant="outline" onClick={() => setIsHandoverModalOpen(true)} className="w-full h-7 text-xs">
                  Prepare Outgoing Handover
                </Button>
              </CardContent>
            </Card>

            {/* 7. Critical Alerts — GAP 5: Live from escalations[] state */}
            <Card className="border-rose-500/30 bg-rose-500/5 shadow-xs">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 flex items-center justify-between">
                  <span>Clinical Escalations &amp; Alerts</span>
                  <ShieldAlert className="h-4 w-4 text-destructive" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-2 text-xs">
                {/* Live escalation entries */}
                {stationEscalations.length > 0 ? (
                  stationEscalations.slice(0, 3).map((esc) => (
                    <div key={esc.escalation_id} className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-1.5 text-rose-800 dark:text-rose-200 flex-1 min-w-0">
                        <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold">{esc.patient_name}</span>
                          <span className="text-muted-foreground"> — {esc.reason}</span>
                          <p className="text-[10px] text-muted-foreground">Dr: {esc.responsible_doctor}</p>
                        </div>
                      </div>
                      <Badge className={esc.status === "Open" ? "bg-destructive/15 text-destructive text-[9px] shrink-0" : "bg-emerald-500/15 text-emerald-700 text-[9px] shrink-0"}>{esc.status}</Badge>
                    </div>
                  ))
                ) : (
                  /* Fall back to overdue task alerts if no escalations */
                  <>
                    {stationTasks.filter(t => t.is_overdue).map(t => (
                      <div key={t.task_id} className="flex items-start gap-1.5 text-rose-800 dark:text-rose-200">
                        <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                        <span>{t.patient_name ? `${t.patient_name} (${t.bed_info})` : t.bed_info}: {t.title} — OVERDUE</span>
                      </div>
                    ))}
                    {stationPatients.filter(p => p.vitals_status === "Critical").map(p => (
                      <div key={p.patient_id} className="flex items-start gap-1.5 text-rose-800 dark:text-rose-200">
                        <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                        <span>{p.patient_name} ({p.bed}): Critical vitals — {p.diagnosis_preview}</span>
                      </div>
                    ))}
                    {stationEscalations.length === 0 && stationTasks.filter(t => t.is_overdue).length === 0 && (
                      <p className="text-emerald-600 text-[11px] font-medium">No active escalations — station operating normally.</p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* 8. Doctor Instructions Coordination */}
            <Card className="border-border shadow-xs">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>Doctor Orders Coordination</span>
                  <Stethoscope className="h-3.5 w-3.5 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-2 text-xs">
                {stationInstructions.slice(0, 2).map((inst) => (
                  <div key={inst.instruction_id} className="rounded-md border border-border p-2 space-y-1 bg-card">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-foreground truncate max-w-[140px]">{inst.doctor_name}</span>
                      <Badge variant="outline" className="text-[9px]">{inst.status}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">{inst.instruction_text}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: NURSES MANAGEMENT */}
        <TabsContent value="nurses" className="space-y-4 focus-visible:outline-none">
          <Card className="border-border">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">Station Nursing Workforce</CardTitle>
                <CardDescription className="text-xs">Manage active nurse rosters, council registrations, and station credentials.</CardDescription>
              </div>
              {!isSeniorNurse && (
                <Button size="sm" onClick={() => setIsOnboardNurseModalOpen(true)} className="h-8 text-xs gap-1.5">
                  <UserPlus className="h-3.5 w-3.5" /> Onboard Nurse
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-bold">Nurse Profile</TableHead>
                      <TableHead className="text-xs font-bold">Role &amp; Grade</TableHead>
                      <TableHead className="text-xs font-bold">Council Registration</TableHead>
                      <TableHead className="text-xs font-bold">Shift Pattern</TableHead>
                      <TableHead className="text-xs font-bold">Duty Status</TableHead>
                      <TableHead className="text-xs font-bold text-center">Assigned Patients</TableHead>
                      <TableHead className="text-xs font-bold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stationNurses.map((n) => (
                      <TableRow key={n.staff_id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8 border border-border">
                              <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                                {n.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-xs font-bold text-foreground">{n.name}</p>
                              <p className="text-[11px] text-muted-foreground">{n.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">{n.role}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{n.councilRegistrationId}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{n.defaultShiftPattern}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              n.availability === "On Duty"
                                ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 text-[10px]"
                                : n.availability === "Break"
                                ? "bg-amber-500/15 text-amber-700 border-amber-500/30 text-[10px]"
                                : "bg-muted text-muted-foreground text-[10px]"
                            }
                          >
                            {n.availability}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-mono font-bold text-xs">{n.assignedPatientsCount}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-primary"
                            onClick={() => {
                              setSelectedPatientId(stationPatients[0]?.patient_id);
                              setNewNurseId(n.staff_id);
                              setIsPatientAssignModalOpen(true);
                            }}
                          >
                            Assign Pts
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: SUPPORT STAFF MANAGEMENT */}
        <TabsContent value="support-staff" className="space-y-4 focus-visible:outline-none">
          <Card className="border-border">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">Assigned Support Staff &amp; Attendants</CardTitle>
                <CardDescription className="text-xs">Ward attendants, housekeeping staff, and orderlies coordinated by this station.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-bold">Name &amp; Contact</TableHead>
                      <TableHead className="text-xs font-bold">Category</TableHead>
                      <TableHead className="text-xs font-bold">Station Assignment</TableHead>
                      <TableHead className="text-xs font-bold">Duty Status</TableHead>
                      <TableHead className="text-xs font-bold text-center">Active Tasks</TableHead>
                      <TableHead className="text-xs font-bold text-right">Task Assignment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stationSupportStaff.map((st) => (
                      <TableRow key={st.staff_id} className="hover:bg-muted/30">
                        <TableCell>
                          <p className="text-xs font-bold text-foreground">{st.name}</p>
                          <p className="text-[11px] text-muted-foreground">{st.phone}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] text-purple-600 bg-purple-500/10 border-purple-500/30">
                            {st.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{st.station_name}</TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 text-[10px]">{st.availability}</Badge>
                        </TableCell>
                        <TableCell className="text-center font-mono font-bold text-xs">{st.assignedTasksCount}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-primary"
                            onClick={() => {
                              setTaskTitle("Clean & Sanitize Bed Bay");
                              setTaskType("Bed Sanitation");
                              setIsTaskModalOpen(true);
                            }}
                          >
                            Assign Task
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: SHIFTS & ROSTER */}
        <TabsContent value="roster" className="space-y-4 focus-visible:outline-none">
          <Card className="border-border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Station Weekly Roster Matrix</CardTitle>
              <CardDescription className="text-xs">Active shift assignments, rotation coverage, and overlap guard.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <RosterGrid
                roster={mockRoster.filter((r) => r.stationId === activeStation.station_id || r.stationId === "st-1")}
                staffList={[
                  ...stationNurses.map((n) => ({
                    id: n.staff_id,
                    name: n.name,
                    department: n.department_name,
                    roleScope: (n.role === "Nurse Station Lead" ? "Nurse Lead" : n.role === "Senior Nurse" ? "Senior Nurse" : "Staff Nurse") as any,
                    status: "On Duty" as any,
                    qualifications: n.qualifications,
                    stationId: n.station_id,
                  })),
                  ...stationSupportStaff.map((s) => ({
                    id: s.staff_id,
                    name: s.name,
                    type: "Attendant" as any,
                    stationId: s.station_id,
                    status: "On Duty" as any,
                  })),
                ]}
                shiftTemplates={shiftTemplates.map((t) => ({
                  id: t.shift_id,
                  name: t.name,
                  startTime: t.start_time,
                  endTime: t.end_time,
                }))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: PATIENTS & CARE WORKLOAD */}
        <TabsContent value="patients" className="space-y-4 focus-visible:outline-none">
          <Card className="border-border">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">Station Inpatient Allocation</CardTitle>
                <CardDescription className="text-xs">Patient-to-nurse care allocation and acuity tracking.</CardDescription>
              </div>
              <Button size="sm" onClick={() => setIsPatientAssignModalOpen(true)} className="h-8 text-xs gap-1">
                <Users className="h-3.5 w-3.5" /> Reassign Patient
              </Button>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-bold">Patient Details</TableHead>
                      <TableHead className="text-xs font-bold">Bed Location</TableHead>
                      <TableHead className="text-xs font-bold">Acuity Level</TableHead>
                      <TableHead className="text-xs font-bold">Assigned Primary Nurse</TableHead>
                      <TableHead className="text-xs font-bold">Vitals Status</TableHead>
                      <TableHead className="text-xs font-bold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stationPatients.map((p) => (
                      <TableRow key={p.assignment_id} className="hover:bg-muted/30">
                        <TableCell>
                          <p className="text-xs font-bold text-foreground">{p.patient_name}</p>
                          <p className="text-[11px] text-muted-foreground">{p.qlyno_patient_id} · {p.age}y / {p.gender}</p>
                        </TableCell>
                        <TableCell className="font-mono text-xs font-semibold text-foreground">{p.ward} ({p.bed})</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              p.care_level === "Critical"
                                ? "bg-rose-500/15 text-rose-700 border-rose-500/30 text-[10px]"
                                : "bg-blue-500/10 text-blue-600 text-[10px]"
                            }
                          >
                            {p.care_level}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-foreground">{p.nurse_name}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              p.vitals_status === "Critical"
                                ? "bg-rose-500/15 text-rose-700 border-rose-500/30 text-[10px]"
                                : p.vitals_status === "Attention"
                                ? "bg-amber-500/15 text-amber-700 border-amber-500/30 text-[10px]"
                                : "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 text-[10px]"
                            }
                          >
                            {p.vitals_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-primary"
                            onClick={() => {
                              setSelectedPatientId(p.patient_id);
                              setIsPatientAssignModalOpen(true);
                            }}
                          >
                            Reassign
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 6: TASKS MANAGEMENT — GAP 2: Search + Filter */}
        <TabsContent value="tasks" className="space-y-4 focus-visible:outline-none">
          <Card className="border-border">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">Nursing &amp; Support Tasks</CardTitle>
                <CardDescription className="text-xs">Real-time task matrix across all station personnel.</CardDescription>
              </div>
              <Button size="sm" onClick={() => setIsTaskModalOpen(true)} className="h-8 text-xs gap-1">
                <Plus className="h-3.5 w-3.5" /> Create Task
              </Button>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
              {/* Search + Filter Bar */}
              <div className="flex flex-wrap gap-2">
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, patient or nurse..."
                    value={taskSearchQuery}
                    onChange={(e) => setTaskSearchQuery(e.target.value)}
                    className="h-8 text-xs pl-8"
                  />
                </div>
                <Select value={taskStatusFilter} onValueChange={setTaskStatusFilter}>
                  <SelectTrigger className="h-8 text-xs w-[160px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
                {(taskSearchQuery || taskStatusFilter !== "all") && (
                  <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => { setTaskSearchQuery(""); setTaskStatusFilter("all"); }}>
                    Clear
                  </Button>
                )}
              </div>
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-bold">Task Title &amp; Description</TableHead>
                      <TableHead className="text-xs font-bold">Type &amp; Priority</TableHead>
                      <TableHead className="text-xs font-bold">Patient / Bed</TableHead>
                      <TableHead className="text-xs font-bold">Assigned Owner</TableHead>
                      <TableHead className="text-xs font-bold">Due Time</TableHead>
                      <TableHead className="text-xs font-bold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-8">
                          No tasks match your search criteria.
                        </TableCell>
                      </TableRow>
                    ) : filteredTasks.map((t) => (
                      <TableRow key={t.task_id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <div>
                              <p className="text-xs font-bold text-foreground">{t.title}</p>
                              <p className="text-[11px] text-muted-foreground">{t.description}</p>
                            </div>
                            {t.is_overdue && <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-[9px]">OVERDUE</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="text-[10px]">{t.task_type}</Badge>
                            <Badge
                              className={
                                t.priority === "High"
                                  ? "bg-rose-500/15 text-rose-700 text-[10px]"
                                  : "bg-muted text-muted-foreground text-[10px]"
                              }
                            >
                              {t.priority}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-foreground font-medium">{t.patient_name || t.bed_info}</TableCell>
                        <TableCell className="text-xs font-semibold text-foreground">{t.owner_name}</TableCell>
                        <TableCell className="text-xs font-mono">{t.due_at}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              t.status === "Completed"
                                ? "bg-emerald-500/15 text-emerald-700 text-[10px]"
                                : t.status === "In Progress"
                                ? "bg-blue-500/15 text-blue-700 text-[10px]"
                                : "bg-amber-500/15 text-amber-700 text-[10px]"
                            }
                          >
                            {t.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 7: SHIFT HANDOVER — GAP 2: Status Filter */}
        <TabsContent value="handover" className="space-y-4 focus-visible:outline-none">
          <Card className="border-border">
            <CardHeader className="p-4 pb-2">
              <div className="flex flex-row items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-bold">Shift Handover Management</CardTitle>
                  <CardDescription className="text-xs">Structured SBAR shift-to-shift continuity records and acknowledgements.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={handoverStatusFilter} onValueChange={setHandoverStatusFilter}>
                    <SelectTrigger className="h-8 text-xs w-[160px]">
                      <SelectValue placeholder="All handovers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Handovers</SelectItem>
                      <SelectItem value="Pending Acknowledgement">Pending Review</SelectItem>
                      <SelectItem value="Acknowledged">Acknowledged</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={() => setIsHandoverModalOpen(true)} className="h-8 text-xs gap-1">
                    <ArrowRight className="h-3.5 w-3.5" /> Start Handover
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              {filteredHandovers.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-8">No handover records match the selected filter.</p>
              ) : (
                <div className="space-y-3">
                  {filteredHandovers.map((h) => (
                    <div key={h.handover_id} className="rounded-xl border border-border p-4 bg-card space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-foreground">{h.shift_name} Handover</span>
                            <Badge className={h.status === "Acknowledged" ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 text-[10px]" : "bg-amber-500/15 text-amber-700 border-amber-500/30 text-[10px]"}>{h.status}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Outgoing: <strong>{h.outgoing_nurse_name}</strong> &rarr; Incoming: <strong>{h.incoming_nurse_name}</strong>
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">{new Date(h.timestamp).toLocaleString()}</span>
                      </div>

                      {h.unresolved_items && h.unresolved_items.length > 0 && (
                        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-2.5 text-xs">
                          <p className="font-semibold text-amber-700 dark:text-amber-300 mb-1">Unresolved Items ({h.unresolved_items.length}):</p>
                          {h.unresolved_items.map((item, idx) => (
                            <p key={idx} className="text-[11px] text-amber-800 dark:text-amber-200">• {item}</p>
                          ))}
                        </div>
                      )}

                      <div className="space-y-1.5 text-xs">
                        <p className="font-semibold text-foreground">Shift Clinical Notes:</p>
                        <p className="text-muted-foreground bg-muted/20 p-2.5 rounded-lg border border-border">{h.structured_notes}</p>
                      </div>

                      {h.status !== "Acknowledged" && (
                        <div className="flex justify-end pt-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              dispatch(acknowledgeShiftHandover({ handoverId: h.handover_id, nurseName: "Sister Sneha Kulkarni" }));
                              toast({ title: "Handover Acknowledged" });
                            }}
                            className="h-8 text-xs gap-1.5"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Acknowledge Handover
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 8: DOCTOR COORDINATION */}
        {/* TAB 8: COMMUNICATION & NOTIFICATIONS — Section 11 & 19 */}
        <TabsContent value="communication" className="space-y-6 focus-visible:outline-none">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-border bg-card shadow-xs">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" /> Station Communication &amp; Notifications Hub
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Doctor-nurse coordination, station broadcast announcements, and automated multi-recipient notification matrix.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => setIsBroadcastModalOpen(true)}
                className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold shadow-xs"
              >
                <Radio className="h-3.5 w-3.5" /> Broadcast Announcement
              </Button>
            </div>
          </div>

          {/* Section 1: Doctor Orders & Clinical Coordination */}
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-primary" /> Doctor Orders &amp; Clinical Coordination
                </CardTitle>
                <CardDescription className="text-xs">Real-time instruction routing, nurse acknowledgement, and clarification request loops.</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs font-mono">{stationInstructions.length} Active Orders</Badge>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
              {stationInstructions.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">No active doctor instructions for this station.</div>
              ) : (
                stationInstructions.map((inst) => (
                  <div key={inst.instruction_id} className="rounded-xl border border-border p-4 bg-muted/10 space-y-2.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-primary" />
                          <span className="font-bold text-sm text-foreground">{inst.doctor_name}</span>
                          <Badge variant="outline" className="text-[10px] font-mono">{inst.bed}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">Patient: <strong>{inst.patient_name}</strong> · Assigned Nurse: <strong>{inst.assigned_nurse_name}</strong></p>
                      </div>
                      <Badge
                        className={
                          inst.urgency.includes("Urgent")
                            ? "bg-rose-500/15 text-rose-700 border-rose-500/30 text-[10px]"
                            : "bg-muted text-muted-foreground text-[10px]"
                        }
                      >
                        {inst.urgency}
                      </Badge>
                    </div>

                    <div className="rounded-lg bg-card p-3 border border-border text-xs text-foreground font-medium">
                      {inst.instruction_text}
                    </div>

                    {inst.clarification_note && (
                      <div className="rounded-lg bg-amber-500/10 p-2.5 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
                        <strong>Clarification Note:</strong> {inst.clarification_note}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-muted-foreground">Status: <strong className="text-foreground">{inst.status}</strong></span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            dispatch(respondDoctorInstruction({ instructionId: inst.instruction_id, status: "Clarification Requested", note: "Nurse requested dosage / timing clarification from doctor" }));
                            toast({ title: "Clarification Requested from Doctor" });
                          }}
                          className="h-7 text-xs"
                        >
                          Request Clarification
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            dispatch(respondDoctorInstruction({ instructionId: inst.instruction_id, status: "Completed" }));
                            toast({ title: "Order Marked as Executed & Completed" });
                          }}
                          className="h-7 text-xs"
                        >
                          Mark Executed
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Section 2: Broadcast Announcements & Staff Messages */}
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Radio className="h-4 w-4 text-primary" /> Station Announcements &amp; Staff Broadcasts
                </CardTitle>
                <CardDescription className="text-xs">Broadcast notices to on-duty staff, specific shifts, or the entire nursing station.</CardDescription>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={() => setIsBroadcastModalOpen(true)}>
                <Send className="h-3 w-3" /> New Broadcast
              </Button>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="space-y-2.5">
                {[
                  {
                    id: "ann-1",
                    sender: "Sister Anita Joseph (Lead)",
                    target: "All Station Staff (Morning & Evening)",
                    message: "NABH Hospital Accreditation Mock Drill scheduled today at 14:00. Please verify all crash cart checklists and drug registers.",
                    time: "Today, 08:00 AM",
                    scope: "All Staff",
                  },
                  {
                    id: "ann-2",
                    sender: "Hospital Infection Control Committee (HICC)",
                    target: "ICU & Critical Care Station",
                    message: "Quarterly environmental air sampling and endotracheal suction protocol audit today. Strict sterile barrier precautions required.",
                    time: "Yesterday, 18:30 PM",
                    scope: "Clinical Team",
                  },
                ].map((ann) => (
                  <div key={ann.id} className="p-3.5 rounded-xl border border-border bg-card space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <strong className="text-foreground">{ann.sender}</strong>
                        <Badge variant="outline" className="text-[10px]">{ann.scope}</Badge>
                      </div>
                      <span className="text-[11px] text-muted-foreground font-mono">{ann.time}</span>
                    </div>
                    <p className="text-foreground/90 leading-relaxed">{ann.message}</p>
                    <p className="text-[10px] text-muted-foreground">Target Recipients: <span className="font-semibold">{ann.target}</span></p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Section 11 Automated Event Notification Routing Matrix */}
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" /> Automated Event Notification Matrix (PRD Section 11)
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time mapping of operational nursing events to their configured primary recipient channels.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-bold">Event</TableHead>
                    <TableHead className="text-xs font-bold">Primary Recipients (PRD Section 11)</TableHead>
                    <TableHead className="text-xs font-bold">Trigger Condition</TableHead>
                    <TableHead className="text-xs font-bold">Notification Channel</TableHead>
                    <TableHead className="text-xs font-bold text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { event: "New nurse created/invited", recipients: "Nurse + Nurse Station", trigger: "Admin onboard / Invite nurse", channel: "In-App Notification + SMS/Email Invite", status: "Active" },
                    { event: "Shift assigned/changed", recipients: "Affected nurse + Nurse Station", trigger: "Roster publish / Shift edit", channel: "In-App Alert + Shift Schedule Sync", status: "Active" },
                    { event: "Shift swap request", recipients: "Nurse Station / Approver", trigger: "Nurse submits swap / leave request", channel: "Station In-Charge Action Queue", status: "Active" },
                    { event: "Patient assigned", recipients: "Assigned nurse + Nurse Station", trigger: "Bed allocation / Patient reassignment", channel: "Bedside Nurse Portal Alert", status: "Active" },
                    { event: "Task assigned", recipients: "Task owner + Nurse Station", trigger: "Task creation / Routine care schedule", channel: "Bedside Task Countdown Feed", status: "Active" },
                    { event: "Task overdue", recipients: "Nurse + Nurse Station + Configured Escalation Role", trigger: "Due time SLA breach", channel: "Persistent Red Warning + Sound Alert", status: "Active" },
                    { event: "Doctor instruction", recipients: "Relevant nurse / Station", trigger: "Doctor issues treatment order / STAT med", channel: "Direct Order Routing + Verification Loop", status: "Active" },
                    { event: "Critical escalation", recipients: "Responsible doctor + Clinical team + Nurse Station", trigger: "Bedside vitals deterioration / GCS drop", channel: "Emergency Broadcast + Audio-Visual Flag", status: "Active" },
                    { event: "Handover pending", recipients: "Outgoing/incoming nurse + Nurse Station", trigger: "Cross-shift handover initiation", channel: "SBAR Handover Continuity Queue", status: "Active" },
                    { event: "Handover completed", recipients: "Nurse Station + Relevant team", trigger: "Incoming nurse acknowledgement", channel: "Audit Log + Continuity Confirmation", status: "Active" },
                    { event: "Announcement", recipients: "Selected station / Team / Staff group", trigger: "Lead broadcast / Hospital notice", channel: "Station Broadcast Banner + Popup", status: "Active" },
                  ].map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-semibold text-xs text-foreground">{row.event}</TableCell>
                      <TableCell className="text-xs text-primary font-medium">{row.recipients}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.trigger}</TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">{row.channel}</TableCell>
                      <TableCell className="text-xs text-right">
                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px]">
                          {row.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 9: REPORTS — Section 13: 8 Operational Metric Suites */}
        <TabsContent value="reports" className="space-y-6 focus-visible:outline-none">
          {/* Header Controls & Export Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                <Filter className="h-3.5 w-3.5" /> Shift Filter:
              </div>
              <Select value={reportShiftFilter} onValueChange={setReportShiftFilter}>
                <SelectTrigger className="h-8 text-xs w-[160px]">
                  <SelectValue placeholder="All Shifts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shifts (24h)</SelectItem>
                  <SelectItem value="Morning">Morning (07:00-15:00)</SelectItem>
                  <SelectItem value="Evening">Evening (15:00-23:00)</SelectItem>
                  <SelectItem value="Night">Night (23:00-07:00)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={reportDateRange} onValueChange={setReportDateRange}>
                <SelectTrigger className="h-8 text-xs w-[140px]">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today (Live)</SelectItem>
                  <SelectItem value="week">Past 7 Days</SelectItem>
                  <SelectItem value="month">Past 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[11px] font-medium hidden md:inline-flex">
                {activeStation.name}
              </Badge>
              <Button size="sm" variant="outline" onClick={() => handleExportReports("csv")} className="h-8 text-xs gap-1.5">
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> Export CSV
              </Button>
              <Button size="sm" onClick={() => handleExportReports("pdf")} className="h-8 text-xs gap-1.5 font-semibold">
                <FileText className="h-3.5 w-3.5" /> Download PDF Report
              </Button>
            </div>
          </div>

          {/* Section 13.1: Shift Operational KPIs Card Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center justify-between">
              <span>1. Staffing Coverage &amp; Core KPIs</span>
              <span className="text-[10px] text-muted-foreground lowercase">real-time sync</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="p-4 border-border bg-card shadow-xs">
                <span className="text-xs font-semibold text-muted-foreground">Shift Staffing Coverage</span>
                <p className="text-xl font-bold font-mono text-primary mt-1">
                  {stationNurses.filter(n => n.availability === "On Duty").length > 0
                    ? Math.round((stationNurses.filter(n => n.availability === "On Duty").length / Math.max(stationNurses.length, 1)) * 100)
                    : 100}%
                </p>
                <Progress value={stationNurses.length > 0 ? Math.round((stationNurses.filter(n => n.availability === "On Duty").length / stationNurses.length) * 100) : 100} className="h-1.5 mt-2" />
                <p className="text-[10px] text-muted-foreground mt-1">{stationNurses.filter(n => n.availability === "On Duty").length} of {stationNurses.length} nurses on duty</p>
              </Card>

              <Card className="p-4 border-border bg-card shadow-xs">
                <span className="text-xs font-semibold text-muted-foreground">Task Completion Rate</span>
                {(() => {
                  const total = stationTasks.length;
                  const done = stationTasks.filter(t => t.status === "Completed").length;
                  const rate = total > 0 ? Math.round((done / total) * 100) : 0;
                  return (
                    <>
                      <p className="text-xl font-bold font-mono text-emerald-600 mt-1">{rate}%</p>
                      <Progress value={rate} className="h-1.5 mt-2" />
                      <p className="text-[10px] text-emerald-600 mt-1">{done} of {total} tasks completed</p>
                    </>
                  );
                })()}
              </Card>

              <Card className="p-4 border-border bg-card shadow-xs">
                <span className="text-xs font-semibold text-muted-foreground">Avg Medication Timeliness</span>
                <p className="text-xl font-bold font-mono text-cyan-600 mt-1">98.1%</p>
                <Progress value={98.1} className="h-1.5 mt-2" />
                <p className="text-[10px] text-cyan-600 mt-1">Verified on central eMAR</p>
              </Card>

              <Card className="p-4 border-border bg-card shadow-xs">
                <span className="text-xs font-semibold text-muted-foreground">Clinical Escalations</span>
                {(() => {
                  const total = stationEscalations.length;
                  const resolved = stationEscalations.filter(e => e.status !== "Open").length;
                  return (
                    <>
                      <p className="text-xl font-bold font-mono text-purple-600 mt-1">{resolved} / {total}</p>
                      <Progress value={total > 0 ? Math.round((resolved / total) * 100) : 100} className="h-1.5 mt-2" />
                      <p className="text-[10px] text-purple-600 mt-1">{total - resolved} open escalations</p>
                    </>
                  );
                })()}
              </Card>
            </div>
          </div>

          {/* Section 13.2: Attendance & Punctuality Tracker */}
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-primary" /> 2. Nurse Attendance &amp; Punctuality Tracker
                </span>
                <Badge variant="outline" className="text-[10px]">{stationNurses.length} Staff Enrolled</Badge>
              </CardTitle>
              <CardDescription className="text-xs">Daily presence status, shift patterns, punctuality and duty allocation.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-bold">Nurse</TableHead>
                      <TableHead className="text-xs font-bold">Role &amp; Registration</TableHead>
                      <TableHead className="text-xs font-bold">Shift Pattern</TableHead>
                      <TableHead className="text-xs font-bold">Duty Status</TableHead>
                      <TableHead className="text-xs font-bold text-center">Patients</TableHead>
                      <TableHead className="text-xs font-bold text-center">Tasks Completed</TableHead>
                      <TableHead className="text-xs font-bold text-right">Punctuality / Check-In</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stationNurses.map((n) => {
                      const nurseTasks = stationTasks.filter(t => t.owner_id === n.staff_id);
                      const doneCount = nurseTasks.filter(t => t.status === "Completed").length;
                      return (
                        <TableRow key={n.staff_id} className="hover:bg-muted/30">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6 border border-border">
                                <AvatarFallback className="text-[9px] font-bold bg-primary/10 text-primary">{n.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <span className="text-xs font-semibold text-foreground">{n.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <Badge variant="outline" className="text-[10px]">{n.role}</Badge>
                              <span className="text-[10px] text-muted-foreground ml-1 font-mono">{n.councilRegistrationId}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{n.defaultShiftPattern}</TableCell>
                          <TableCell>
                            <Badge className={
                              n.availability === "On Duty" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px]" :
                              n.availability === "Break" ? "bg-amber-500/15 text-amber-700 text-[10px]" :
                              n.availability === "Leave" ? "bg-blue-500/15 text-blue-700 text-[10px]" :
                              "bg-muted text-muted-foreground text-[10px]"
                            }>{n.availability}</Badge>
                          </TableCell>
                          <TableCell className="text-center text-xs font-mono font-bold">{n.assignedPatientsCount} pts</TableCell>
                          <TableCell className="text-center text-xs font-mono">{doneCount} / {nurseTasks.length}</TableCell>
                          <TableCell className="text-right text-xs">
                            <span className="text-emerald-600 font-medium">On-Time (06:55 AM)</span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Section 13.8: Support Staff Operations & Ward Sanitation */}
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> 3. Support Staff Operations &amp; Ward Sanitation
                </span>
                <Badge variant="outline" className="text-[10px]">{stationSupportStaff.length} Operational Staff</Badge>
              </CardTitle>
              <CardDescription className="text-xs">Ward attendants, housekeeping cleaning turnaround times, and patient escort requests.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-bold">Staff Member</TableHead>
                      <TableHead className="text-xs font-bold">Category</TableHead>
                      <TableHead className="text-xs font-bold">Duty Status</TableHead>
                      <TableHead className="text-xs font-bold">Active Tasks</TableHead>
                      <TableHead className="text-xs font-bold">Completed Tasks</TableHead>
                      <TableHead className="text-xs font-bold text-right">SLA Turnaround</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stationSupportStaff.map((s) => {
                      const staffTasks = stationTasks.filter(t => t.owner_id === s.staff_id);
                      const done = staffTasks.filter(t => t.status === "Completed").length;
                      return (
                        <TableRow key={s.staff_id} className="hover:bg-muted/30">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6 border border-border">
                                <AvatarFallback className="text-[9px] font-bold bg-muted text-foreground">{s.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <span className="text-xs font-semibold text-foreground">{s.name}</span>
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="outline" className="text-[10px]">{s.category}</Badge></TableCell>
                          <TableCell>
                            <Badge className={
                              s.availability === "On Duty" ? "bg-emerald-500/15 text-emerald-700 text-[10px]" : "bg-muted text-muted-foreground text-[10px]"
                            }>{s.availability}</Badge>
                          </TableCell>
                          <TableCell className="text-xs font-mono">{staffTasks.filter(t => t.status !== "Completed").length} Pending</TableCell>
                          <TableCell className="text-xs font-mono text-emerald-600 font-semibold">{done} Completed</TableCell>
                          <TableCell className="text-right text-xs">
                            <span className="text-emerald-600 font-medium">100% On-Time (&lt; 15 mins)</span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Section 13.3 & Section 13.4: Nurse Workload & Task Category Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 13.3: Nurse Workload Distribution */}
            <Card className="border-border shadow-xs">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> 4. Nurse Workload &amp; Equity Distribution
                </CardTitle>
                <CardDescription className="text-xs">Patient load balance and task equity distribution across station nurses.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-3">
                {stationNurses.map((n) => {
                  const load = n.assignedPatientsCount || 0;
                  const maxLoad = Math.max(...stationNurses.map(x => x.assignedPatientsCount || 0), 1);
                  const pct = Math.round((load / maxLoad) * 100);
                  const nurseTasks = stationTasks.filter(t => t.owner_id === n.staff_id);
                  return (
                    <div key={n.staff_id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">{n.name} ({n.role})</span>
                        <span className="font-mono text-muted-foreground">{load} patients · {nurseTasks.length} tasks</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={pct} className="h-2 flex-1" />
                        <span className="font-mono text-[11px] font-bold text-foreground w-12 text-right">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* 13.4: Task Performance by Category */}
            <Card className="border-border shadow-xs">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-primary" /> 5. Task Performance &amp; SLA Analysis
                </CardTitle>
                <CardDescription className="text-xs">Completion rate and SLA adherence across clinical and support categories.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-2.5">
                {[
                  { type: "Medication", count: stationTasks.filter(t => t.task_type === "Medication").length, done: stationTasks.filter(t => t.task_type === "Medication" && t.status === "Completed").length, sla: "98.1%" },
                  { type: "Vitals Check", count: stationTasks.filter(t => t.task_type === "Vitals Check").length, done: stationTasks.filter(t => t.task_type === "Vitals Check" && t.status === "Completed").length, sla: "100%" },
                  { type: "Doctor Order", count: stationTasks.filter(t => t.task_type === "Doctor Order").length, done: stationTasks.filter(t => t.task_type === "Doctor Order" && t.status === "Completed").length, sla: "94.5%" },
                  { type: "Bed Sanitation", count: stationTasks.filter(t => t.task_type === "Bed Sanitation").length, done: stationTasks.filter(t => t.task_type === "Bed Sanitation" && t.status === "Completed").length, sla: "100%" },
                  { type: "Patient Escort", count: stationTasks.filter(t => t.task_type === "Patient Escort").length, done: stationTasks.filter(t => t.task_type === "Patient Escort" && t.status === "Completed").length, sla: "96.0%" },
                ].map((item) => (
                  <div key={item.type} className="flex items-center justify-between p-2 rounded-lg border border-border bg-card text-xs">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-semibold">{item.type}</Badge>
                      <span className="text-muted-foreground">{item.count} scheduled</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-600 font-semibold">{item.done} Completed</span>
                      <span className="font-mono text-muted-foreground text-[11px]">SLA: {item.sla}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Section 13.6: Patient-Care & Inpatient Reassignments Matrix */}
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Bed className="h-4 w-4 text-primary" /> 6. Patient-Care Operations &amp; Bed Telemetry
                </span>
                <Badge variant="outline" className="text-[10px]">{stationPatients.length} Active Patients</Badge>
              </CardTitle>
              <CardDescription className="text-xs">Assigned care levels, vitals monitoring telemetry and active nursing owners.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-bold">Patient &amp; ID</TableHead>
                      <TableHead className="text-xs font-bold">Bed / Location</TableHead>
                      <TableHead className="text-xs font-bold">Care Level</TableHead>
                      <TableHead className="text-xs font-bold">Assigned Nurse</TableHead>
                      <TableHead className="text-xs font-bold">Clinical Preview</TableHead>
                      <TableHead className="text-xs font-bold">Vitals Status</TableHead>
                      <TableHead className="text-xs font-bold text-right">Last Vitals</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stationPatients.map((p) => (
                      <TableRow key={p.assignment_id} className="hover:bg-muted/30">
                        <TableCell>
                          <span className="text-xs font-bold text-foreground block">{p.patient_name}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{p.qlyno_patient_id}</span>
                        </TableCell>
                        <TableCell className="text-xs font-mono font-semibold">{p.bed}</TableCell>
                        <TableCell>
                          <Badge className={
                            p.care_level === "Critical" ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px]" : "bg-blue-500/10 text-blue-600 text-[10px]"
                          }>{p.care_level}</Badge>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-foreground">{p.nurse_name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[220px] truncate">{p.diagnosis_preview}</TableCell>
                        <TableCell>
                          <Badge className={
                            p.vitals_status === "Critical" ? "bg-rose-500/15 text-rose-700 text-[10px]" :
                            p.vitals_status === "Attention" ? "bg-amber-500/15 text-amber-700 text-[10px]" :
                            "bg-emerald-500/15 text-emerald-700 text-[10px]"
                          }>{p.vitals_status}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono">{p.last_vitals_time}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Section 13.7: Clinical Escalation Report */}
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-destructive" /> 7. Clinical Escalations &amp; Physician Response Log
              </CardTitle>
              <CardDescription className="text-xs">All active and resolved clinical escalations raised from bedside nurses to attending doctors.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              {stationEscalations.length === 0 ? (
                <p className="text-xs text-emerald-600 font-semibold text-center py-4">✓ No active clinical escalations — all patients stable.</p>
              ) : (
                <div className="rounded-md border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="text-xs font-bold">Patient / Bed</TableHead>
                        <TableHead className="text-xs font-bold">Clinical Reason</TableHead>
                        <TableHead className="text-xs font-bold">Raised By</TableHead>
                        <TableHead className="text-xs font-bold">Responsible Doctor</TableHead>
                        <TableHead className="text-xs font-bold">Priority</TableHead>
                        <TableHead className="text-xs font-bold text-right">Status &amp; Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stationEscalations.map((esc) => (
                        <TableRow key={esc.escalation_id} className="hover:bg-muted/30">
                          <TableCell className="text-xs font-bold text-foreground">{esc.patient_name}</TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[260px] truncate">{esc.reason}</TableCell>
                          <TableCell className="text-xs text-foreground font-medium">{esc.raised_by_name}</TableCell>
                          <TableCell className="text-xs text-foreground font-medium">{esc.responsible_doctor}</TableCell>
                          <TableCell>
                            <Badge className={esc.priority === "Urgent" ? "bg-rose-500/15 text-rose-700 text-[10px]" : "bg-amber-500/15 text-amber-700 text-[10px]"}>{esc.priority}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Badge className={esc.status === "Open" ? "bg-destructive/15 text-destructive text-[10px]" : "bg-emerald-500/15 text-emerald-700 text-[10px]"}>{esc.status}</Badge>
                              {esc.status === "Open" && (
                                <Button size="sm" variant="ghost" className="h-6 text-[10px] text-destructive hover:bg-destructive/10"
                                  onClick={() => {
                                    dispatch(updateEscalationStatus({ escalationId: esc.escalation_id, status: "Resolved", actor: activeStation.lead_name }));
                                    toast({ title: "Escalation Resolved" });
                                  }}
                                >Resolve</Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 13.5: Shift Performance & SBAR Handover Completion */}
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" /> 8. Shift Performance &amp; SBAR Handover Continuity
              </CardTitle>
              <CardDescription className="text-xs">Structured SBAR shift continuity records, acknowledgement timeliness and unresolved exceptions.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              {(() => {
                const total = stationHandovers.length;
                const acked = stationHandovers.filter(h => h.status === "Acknowledged").length;
                const pending = total - acked;
                const rate = total > 0 ? Math.round((acked / total) * 100) : 100;
                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground font-semibold">Handover Acknowledgement SLA</span>
                          <span className="font-bold font-mono text-primary">{rate}%</span>
                        </div>
                        <Progress value={rate} className="h-2" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="rounded-lg border border-border p-3 bg-card text-center shadow-xs">
                        <p className="text-xl font-bold font-mono text-foreground">{total}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Total Shift Handovers</p>
                      </div>
                      <div className="rounded-lg border border-emerald-500/30 p-3 bg-emerald-500/5 text-center shadow-xs">
                        <p className="text-xl font-bold font-mono text-emerald-600">{acked}</p>
                        <p className="text-[10px] text-emerald-600 mt-0.5">Acknowledged on Time</p>
                      </div>
                      <div className="rounded-lg border border-amber-500/30 p-3 bg-amber-500/5 text-center shadow-xs">
                        <p className="text-xl font-bold font-mono text-amber-600">{pending}</p>
                        <p className="text-[10px] text-amber-600 mt-0.5">Pending Acknowledgement</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 10: AUDIT LOGS */}
        <TabsContent value="audit" className="space-y-4 focus-visible:outline-none">
          <Card className="border-border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Station Audit &amp; Traceability Trail</CardTitle>
              <CardDescription className="text-xs">Immutable audit events for staff assignments, patient reallocations, and shift changes.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-bold">Actor &amp; Role</TableHead>
                      <TableHead className="text-xs font-bold">Action</TableHead>
                      <TableHead className="text-xs font-bold">Entity Details</TableHead>
                      <TableHead className="text-xs font-bold">Reason / Notes</TableHead>
                      <TableHead className="text-xs font-bold text-right">Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-muted/30">
                        <TableCell>
                          <p className="text-xs font-bold text-foreground">{log.actor}</p>
                          <p className="text-[10px] text-muted-foreground">{log.role}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] font-mono">{log.action}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-foreground">{log.entity}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{log.reason}</TableCell>
                        <TableCell className="text-right text-xs font-mono text-muted-foreground">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 11: STATION SETTINGS */}
        <TabsContent value="settings" className="space-y-4 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Station Profile & Department */}
            <Card className="border-border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" /> Station Profile &amp; Location
                </CardTitle>
                <CardDescription className="text-xs">
                  Physical station configuration and assigned department context.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-muted-foreground font-semibold">Station Name</span>
                    <p className="font-bold text-foreground">{activeStation.name}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground font-semibold">Location / Campus</span>
                    <p className="font-bold text-foreground">{activeStation.location_name}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-muted-foreground font-semibold">Assigned Department</span>
                    <p className="font-bold text-foreground">{activeStation.department_name}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground font-semibold">Station Lead</span>
                    <p className="font-bold text-foreground">{activeStation.lead_name}</p>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-3 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-foreground">Bed Capacity Allocation</span>
                    <p className="text-[11px] text-muted-foreground">{activeStation.totalBeds} Allocated Beds ({activeStation.occupiedBeds} Occupied)</p>
                  </div>
                  <Badge variant="outline" className="text-emerald-600 bg-emerald-500/10 border-emerald-500/30">Active Station</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Roles, Permissions & Notification Rules */}
            <Card className="border-border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Roles, Permissions &amp; Rules
                </CardTitle>
                <CardDescription className="text-xs">
                  Operational boundaries and automated escalation policies.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-2.5 text-xs">
                <div className="rounded-lg border border-border p-2.5 space-y-1 bg-card">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground">Station Lead Authority</span>
                    <Badge className="bg-primary/10 text-primary text-[10px]">Full Control</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Onboard nurses &amp; support staff, configure shifts, approve leave/swaps, broadcast alerts.</p>
                </div>

                <div className="rounded-lg border border-border p-2.5 space-y-1 bg-card">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground">Shift Handover &amp; Escalation Rules</span>
                    <Badge className="bg-emerald-500/10 text-emerald-600 text-[10px]">Enforced</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Mandatory SBAR acknowledgement; unacknowledged tasks auto-escalate to Station Lead after 30 mins.</p>
                </div>

                <div className="rounded-lg border border-border p-2.5 space-y-1 bg-card">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground">Non-Clinical Support Isolation</span>
                    <Badge className="bg-purple-500/10 text-purple-600 text-[10px]">Active Guard</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Support Staff restricted to operational task queues; zero access to clinical records or eMAR sheets.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* QUICK ACTION MODALS */}

      {/* 1. Assign Task Modal */}
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" /> Assign Operational Task
            </DialogTitle>
            <DialogDescription className="text-xs">
              Dispatch a clinical nursing procedure or support staff task with deadline.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-3.5 py-2 text-xs">
            <div className="grid gap-1.5">
              <Label className="text-xs">Task Title</Label>
              <Input
                placeholder="e.g. Administer IV Antibiotic / Check Hourly Vitals"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                required
                className="text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">Task Type</Label>
                <Select value={taskType} onValueChange={setTaskType}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Medication">Medication (MAR)</SelectItem>
                    <SelectItem value="Vitals Check">Vitals Observation</SelectItem>
                    <SelectItem value="Doctor Order">Doctor Instruction</SelectItem>
                    <SelectItem value="Wound Dressing">Wound Care</SelectItem>
                    <SelectItem value="Bed Sanitation">Bed Sanitation</SelectItem>
                    <SelectItem value="Patient Escort">Patient Escort</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Priority</Label>
                <Select value={taskPriority} onValueChange={setTaskPriority}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High (Stat / Urgent)</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Routine">Routine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">Assigned Owner</Label>
                <Select value={taskOwnerId} onValueChange={setTaskOwnerId}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stationNurses.map((n) => (
                      <SelectItem key={n.staff_id} value={n.staff_id}>{n.name} ({n.role})</SelectItem>
                    ))}
                    {stationSupportStaff.map((s) => (
                      <SelectItem key={s.staff_id} value={s.staff_id}>{s.name} ({s.category})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Target Patient / Bed</Label>
                <Select value={taskPatientId} onValueChange={setTaskPatientId}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stationPatients.map((p) => (
                      <SelectItem key={p.patient_id} value={p.patient_id}>{p.patient_name} ({p.bed})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Instructions &amp; Clinical Notes</Label>
              <Textarea
                placeholder="Dosage, precautions, or special steps..."
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                rows={2}
                className="text-xs"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsTaskModalOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm">Dispatch Task</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Reassign Patient Modal */}
      <Dialog open={isPatientAssignModalOpen} onOpenChange={setIsPatientAssignModalOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Reassign Patient Care
            </DialogTitle>
            <DialogDescription className="text-xs">
              Rebalance nurse workload with mandatory reassignment reason.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReassignPatient} className="space-y-3.5 py-2 text-xs">
            <div className="grid gap-1.5">
              <Label className="text-xs">Select Inpatient</Label>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stationPatients.map((p) => (
                    <SelectItem key={p.patient_id} value={p.patient_id}>
                      {p.patient_name} · {p.bed} (Current: {p.nurse_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Assign to Nurse</Label>
              <Select value={newNurseId} onValueChange={setNewNurseId}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stationNurses.map((n) => (
                    <SelectItem key={n.staff_id} value={n.staff_id}>
                      {n.name} ({n.assignedPatientsCount} patients)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Reassignment Reason (Mandatory Audit)</Label>
              <Input
                placeholder="e.g. ICU Acuity Spike / Break Coverage"
                value={reassignReason}
                onChange={(e) => setReassignReason(e.target.value)}
                required
                className="text-xs"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsPatientAssignModalOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm">Confirm Reassignment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 3. Start Handover Modal */}
      <Dialog open={isHandoverModalOpen} onOpenChange={setIsHandoverModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-primary" /> Shift Handover Protocol
            </DialogTitle>
            <DialogDescription className="text-xs">
              Aggregate open tasks and critical care statuses for the incoming shift team.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStartHandover} className="space-y-3.5 py-2 text-xs">
            <div className="grid gap-1.5">
              <Label className="text-xs">Incoming Shift Receiving Nurse</Label>
              <Select value={handoverIncomingNurse} onValueChange={setHandoverIncomingNurse}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stationNurses.map((n) => (
                    <SelectItem key={n.staff_id} value={n.name}>{n.name} ({n.role})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-1.5">
              <span className="font-semibold text-foreground">Auto-Aggregated Handover Summary:</span>
              <p className="text-[11px] text-muted-foreground">
                • {stationPatients.length} Active Patients across ICU Bays.<br />
                • {stationTasks.filter(t => t.status !== "Completed").length} Incomplete / Scheduled Tasks.<br />
                • {criticalPatientsCount} Critical Patients requiring close hemodynamic watch.
              </p>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Shift Summary &amp; Special Handover Instructions</Label>
              <Textarea
                placeholder="Key events, pending doctor rounds, ventilator adjustments..."
                value={handoverNotes}
                onChange={(e) => setHandoverNotes(e.target.value)}
                rows={3}
                className="text-xs"
                required
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsHandoverModalOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm">Transmit Handover</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 4. Onboard Nurse Modal */}
      <Dialog open={isOnboardNurseModalOpen} onOpenChange={setIsOnboardNurseModalOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" /> Onboard Nurse to Station
            </DialogTitle>
            <DialogDescription className="text-xs">
              Add a nurse to {activeStation.name} with verified Council ID and shift schedule.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleOnboardNurse} className="space-y-3.5 py-2 text-xs">
            <div className="grid gap-1.5">
              <Label className="text-xs">Full Name</Label>
              <Input
                placeholder="e.g. Sister Megha Patel"
                value={onboardName}
                onChange={(e) => setOnboardName(e.target.value)}
                required
                className="text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">Council Registration ID</Label>
                <Input
                  placeholder="e.g. MNC-RN-99412"
                  value={onboardCouncilId}
                  onChange={(e) => setOnboardCouncilId(e.target.value)}
                  required
                  className="font-mono text-xs"
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Role / Level</Label>
                <Select value={onboardRole} onValueChange={setOnboardRole}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nurse">Staff Nurse</SelectItem>
                    <SelectItem value="Senior Nurse">Senior Nurse</SelectItem>
                    <SelectItem value="Nurse Station Lead">Nurse Station Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Default Shift Pattern</Label>
              <Select value={onboardShift} onValueChange={setOnboardShift}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Morning (07:00-15:00)">Morning (07:00-15:00)</SelectItem>
                  <SelectItem value="Evening (15:00-23:00)">Evening (15:00-23:00)</SelectItem>
                  <SelectItem value="Night (23:00-07:00)">Night (23:00-07:00)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsOnboardNurseModalOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm">Register &amp; Activate</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 5. Broadcast Message Modal */}
      <Dialog open={isBroadcastModalOpen} onOpenChange={setIsBroadcastModalOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Radio className="h-5 w-5 text-primary" /> Station Broadcast Message
            </DialogTitle>
            <DialogDescription className="text-xs">
              Dispatch an immediate operational notice to all nurses and support staff in {activeStation.name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBroadcast} className="space-y-3.5 py-2 text-xs">
            <div className="grid gap-1.5">
              <Label className="text-xs">Message Text</Label>
              <Textarea
                placeholder="e.g. Code Orange Drill at 14:00. Ensure all crash carts are checked."
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                rows={3}
                required
                className="text-xs"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsBroadcastModalOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm">Send Broadcast</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 6. Operational Exceptions Modal */}
      <Dialog open={isExceptionsModalOpen} onOpenChange={setIsExceptionsModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Operational Exceptions &amp; Blockers
            </DialogTitle>
            <DialogDescription className="text-xs">
              Active staffing gaps, overdue care tasks, and clinical escalations.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2.5 py-2 text-xs">
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-1">
              <p className="font-bold text-destructive">Overdue Nursing Tasks ({overdueTasksCount}):</p>
              {stationTasks.filter(t => t.is_overdue).map(t => (
                <p key={t.task_id} className="text-[11px] text-destructive">
                  • <strong>{t.title}</strong> for {t.patient_name} ({t.bed_info}) — Owner: {t.owner_name} (Due: {t.due_at})
                </p>
              ))}
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-1">
              <p className="font-bold text-amber-700 dark:text-amber-300">Staffing &amp; Leave Notices:</p>
              <p className="text-[11px] text-amber-800 dark:text-amber-200">
                • Nurse David Dsouza is on scheduled leave. Night Shift relief required.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" onClick={() => setIsExceptionsModalOpen(false)}>Close Exceptions</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 7. Onboard Support Staff Modal */}
      <Dialog open={isOnboardSupportStaffModalOpen} onOpenChange={setIsOnboardSupportStaffModalOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" /> Add Support Staff to Station
            </DialogTitle>
            <DialogDescription className="text-xs">
              Assign a ward attendant, housekeeping cleaner, or assistant to {activeStation.name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleOnboardSupportStaff} className="space-y-3.5 py-2 text-xs">
            <div className="grid gap-1.5">
              <Label className="text-xs">Full Name</Label>
              <Input
                placeholder="e.g. Ramesh Pawar"
                value={onboardSupName}
                onChange={(e) => setOnboardSupName(e.target.value)}
                required
                className="text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">Phone Number</Label>
                <Input
                  placeholder="e.g. +91 98111 00112"
                  value={onboardSupPhone}
                  onChange={(e) => setOnboardSupPhone(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Support Category</Label>
                <Select value={onboardSupCategory} onValueChange={setOnboardSupCategory}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ward / Patient-care Attendant">Ward Attendant</SelectItem>
                    <SelectItem value="Housekeeping / Cleaning Staff">Housekeeping &amp; Cleaning</SelectItem>
                    <SelectItem value="Nursing Assistant">Nursing Assistant</SelectItem>
                    <SelectItem value="Other Support Staff">Other Support Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsOnboardSupportStaffModalOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm">Assign to Station</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 8. Create Shift Modal */}
      <Dialog open={isCreateShiftModalOpen} onOpenChange={setIsCreateShiftModalOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> Create Shift Pattern
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure shift timing and break rules for {activeStation.name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateShift} className="space-y-3.5 py-2 text-xs">
            <div className="grid gap-1.5">
              <Label className="text-xs">Shift Template Name</Label>
              <Select value={shiftName} onValueChange={setShiftName}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Morning">Morning Shift</SelectItem>
                  <SelectItem value="Evening">Evening Shift</SelectItem>
                  <SelectItem value="Night">Night Shift</SelectItem>
                  <SelectItem value="Custom">Custom Shift Window</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">Start Time</Label>
                <Input
                  type="time"
                  value={shiftStartTime}
                  onChange={(e) => setShiftStartTime(e.target.value)}
                  required
                  className="text-xs font-mono"
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">End Time</Label>
                <Input
                  type="time"
                  value={shiftEndTime}
                  onChange={(e) => setShiftEndTime(e.target.value)}
                  required
                  className="text-xs font-mono"
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateShiftModalOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm">Save Shift Template</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </RoleGate>
  );
}
