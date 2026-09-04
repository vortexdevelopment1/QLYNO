"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bed,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  HeartPulse,
  MapPin,
  MessageSquare,
  Pill,
  Plus,
  Send,
  ShieldAlert,
  Stethoscope,
  Thermometer,
  User,
  Users,
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
} from "@/hospital-admin/components/ui/dialog";
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

import {
  updateTaskStatus,
  createNursingTask,
  acknowledgeShiftHandover,
  respondDoctorInstruction,
  createClinicalEscalation,
  recordClinicalActivity,
  markNotificationRead,
} from "@/hospital-admin/store/slices/nursingOperationsSlice";

export default function IndividualNurseWorkspacePage() {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const {
    currentRole,
    currentUserId,
    currentUserName,
    activeStationId,
    stations,
    roster,
    shiftTemplates,
    patientAssignments,
    tasks,
    handovers,
    doctorInstructions,
    notifications,
  } = useSelector((state: RootState) => state.nursingOperations);

  // Active nurse context: defaulted to Rahul Shinde (nurse-3) or logged in nurse user
  const isNurseUser = currentRole === "nurse" || currentRole === "senior_nurse";
  const nurseId = isNurseUser && currentUserId ? currentUserId : "nurse-3";
  const nurseName = isNurseUser && currentUserName && !currentUserName.includes("Dr.") ? currentUserName : "Nurse Rahul Shinde";

  const activeStation = stations.find((s) => s.station_id === activeStationId) || stations[0];
  const myAssignedPatients = patientAssignments.filter((p) => p.nurse_id === nurseId || p.nurse_name.includes("Rahul Shinde"));
  const myTasks = tasks.filter((t) => t.owner_id === nurseId || t.owner_name.includes("Rahul Shinde"));
  const myInstructions = doctorInstructions.filter((d) => d.assigned_nurse_id === nurseId || d.assigned_nurse_name?.includes("Rahul Shinde"));
  // GAP 4: Nurse's own roster assignments
  const myRosterEntries = roster.filter((r) => r.staff_id === nurseId || r.staff_id === "nurse-3");

  const myNotifications = (notifications || []).filter(
    (n) => n.recipient_id === nurseId || n.recipient_id === "nurse-3" || n.station_id === activeStationId
  );
  const unreadCount = myNotifications.filter((n) => n.status === "Unread").length;
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  const [activeTab, setActiveTab] = useState("my-patients");
  const [selectedPatientId, setSelectedPatientId] = useState(myAssignedPatients[0]?.patient_id || "pat-101");

  // Vitals Observation Modal State
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [vitalBp, setVitalBp] = useState("120/80");
  const [vitalPulse, setVitalPulse] = useState("78");
  const [vitalSpo2, setVitalSpo2] = useState("98%");
  const [vitalTemp, setVitalTemp] = useState("98.4°F");

  // MAR Modal State
  const [isMarModalOpen, setIsMarModalOpen] = useState(false);
  const [marMedName, setMarMedName] = useState("IV Meropenem 1g");
  const [marDoseNotes, setMarDoseNotes] = useState("");

  // Nursing Note State
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [nursingNoteText, setNursingNoteText] = useState("");

  // Clinical Escalation State
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [escalateDoctor, setEscalateDoctor] = useState("Dr. Rajesh Sharma (Cardiologist)");
  const [escalateReason, setEscalateReason] = useState("");

  // Action Listener for Header Quick Actions
  useEffect(() => {
    const handleAction = (actionName: string) => {
      if (actionName === "vitals") setIsVitalsModalOpen(true);
      if (actionName === "emar") setIsMarModalOpen(true);
      if (actionName === "note") setIsNoteModalOpen(true);
      if (actionName === "handover") setActiveTab("handover");
      if (actionName === "escalate") setIsEscalateModalOpen(true);
    };

    const onCustomEvent = (e: any) => {
      if (e.detail) handleAction(e.detail);
    };

    window.addEventListener("nurse-action", onCustomEvent);

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const action = params.get("action");
      if (action) handleAction(action);
    }

    return () => {
      window.removeEventListener("nurse-action", onCustomEvent);
    };
  }, []);

  const activePatient = myAssignedPatients.find((p) => p.patient_id === selectedPatientId) || myAssignedPatients[0];

  const handleRecordVitals = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;
    dispatch(recordClinicalActivity({ patient_id: activePatient.patient_id, station_id: activePatient.station_id, nurse_id: nurseId, nurse_name: nurseName, type: "Vitals", summary: `BP ${vitalBp}; HR ${vitalPulse}; SpO2 ${vitalSpo2}; temperature ${vitalTemp}.` }));
    setIsVitalsModalOpen(false);
    toast({
      title: "Vitals Observation Recorded",
      description: `Vitals logged for ${activePatient?.patient_name} (BP: ${vitalBp}, HR: ${vitalPulse}, SpO2: ${vitalSpo2}).`,
    });
  };

  const handleAdministerMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;
    dispatch(recordClinicalActivity({ patient_id: activePatient.patient_id, station_id: activePatient.station_id, nurse_id: nurseId, nurse_name: nurseName, type: "Medication Administration", summary: `${marMedName}${marDoseNotes ? ` — ${marDoseNotes}` : ""}` }));
    setIsMarModalOpen(false);
    toast({
      title: "Medication Administered (eMAR)",
      description: `${marMedName} dose verified and logged on bedside eMAR record.`,
    });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient || !nursingNoteText.trim()) return;
    dispatch(recordClinicalActivity({ patient_id: activePatient.patient_id, station_id: activePatient.station_id, nurse_id: nurseId, nurse_name: nurseName, type: "Nursing Note", summary: nursingNoteText }));
    setIsNoteModalOpen(false);
    setNursingNoteText("");
    toast({
      title: "Nursing Care Note Saved",
      description: `Clinical entry saved for ${activePatient?.patient_name}. Included in shift handover summary.`,
    });
  };

  const handleEscalateClinicalConcern = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient || !escalateReason.trim()) return;
    dispatch(createClinicalEscalation({ patient_id: activePatient.patient_id, patient_name: activePatient.patient_name, station_id: activePatient.station_id, raised_by_id: nurseId, raised_by_name: nurseName, responsible_doctor: escalateDoctor, reason: escalateReason, priority: "Urgent" }));
    setIsEscalateModalOpen(false);
    setEscalateReason("");
    toast({
      title: "Clinical Concern Escalated",
      description: `Emergency notice dispatched to ${escalateDoctor} and Nurse Station Lead.`,
    });
  };

  return (
    <RoleGate allowed={["nurse", "senior_nurse"]}>
      <div className="space-y-5 animate-fade-in pb-12">
      {/* 1. Nurse Profile & Shift Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
              {nurseName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              {nurseName}
              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]">
                On Duty · Staff Nurse
              </Badge>
            </h1>
            <p className="text-xs text-muted-foreground">
              {activeStation.name} · Assigned Shift: <strong>Morning (07:00 – 15:00)</strong> · Council: <strong>MNC-RN-10492</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Bedside Notification Bell */}
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
              Alerts
            </Button>
            {isNotificationPanelOpen && (
              <div className="absolute right-0 top-10 z-50 w-[calc(100vw-2.5rem)] sm:w-[340px] max-w-[340px] rounded-xl border border-border bg-card shadow-xl">
                <div className="flex items-center justify-between p-3 border-b border-border">
                  <span className="text-xs font-bold text-foreground">My Alerts &amp; Announcements</span>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && <Badge className="bg-destructive/15 text-destructive text-[10px]">{unreadCount} Unread</Badge>}
                    <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => setIsNotificationPanelOpen(false)}>Close</Button>
                  </div>
                </div>
                <div className="max-h-[300px] overflow-y-auto divide-y divide-border">
                  {myNotifications.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">No notifications</p>
                  ) : (
                    myNotifications.slice(0, 10).map((notif) => (
                      <div
                        key={notif.notification_id}
                        className={`p-3 text-xs transition-colors cursor-pointer hover:bg-muted/30 ${notif.status === "Unread" ? "bg-primary/5" : ""}`}
                        onClick={() => dispatch(markNotificationRead({ notificationId: notif.notification_id, recipientId: notif.recipient_id }))}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-foreground">{notif.title}</span>
                          {notif.status === "Unread" && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{notif.message}</p>
                        <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground/80">
                          <Badge variant="outline" className="text-[9px] py-0">{notif.event}</Badge>
                          <span>{new Date(notif.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <Button
            size="sm"
            variant="destructive"
            onClick={() => setIsEscalateModalOpen(true)}
            className="h-8 text-xs gap-1.5 shadow-xs"
          >
            <ShieldAlert className="h-4 w-4" /> Escalate Concern
          </Button>
          <ScopeIndicator scope="Station Lead" stationName={`${activeStation.name} · My Bedside Workload`} />
        </div>
      </div>

      {/* 2. Workload Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Assigned Inpatients</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{myAssignedPatients.length} Patients</p>
          <span className="text-[10px] text-muted-foreground">ICU Beds 04 &amp; 06</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">My Pending Tasks</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">
            {myTasks.filter((t) => t.status === "Pending" || t.status === "In Progress").length} Tasks
          </p>
          <span className="text-[10px] text-amber-600">1 Medication Due Soon</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Doctor Orders</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">{myInstructions.length} Active</p>
          <span className="text-[10px] text-cyan-600">Cardiology &amp; Intensivist</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Shift Completion</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">75%</p>
          <span className="text-[10px] text-emerald-600">Handover at 14:45 PM</span>
        </Card>
      </div>

      {/* 3. Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-1 shadow-xs overflow-x-auto scrollbar-none">
          <TabsList className="flex h-auto w-max sm:w-full items-center justify-start sm:justify-between gap-1 bg-transparent p-0">
            <TabsTrigger value="my-patients" className="text-xs font-semibold px-3.5 py-1.5 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Bed className="h-3.5 w-3.5" /> Assigned Patients ({myAssignedPatients.length})
            </TabsTrigger>
            <TabsTrigger value="my-tasks" className="text-xs font-semibold px-3.5 py-1.5 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileCheck className="h-3.5 w-3.5" /> Care Tasks &amp; MAR ({myTasks.length})
            </TabsTrigger>
            <TabsTrigger value="doctor-instructions" className="text-xs font-semibold px-3.5 py-1.5 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Stethoscope className="h-3.5 w-3.5" /> Doctor Orders ({myInstructions.length})
            </TabsTrigger>
            <TabsTrigger value="my-handover" className="text-xs font-semibold px-3.5 py-1.5 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ArrowRight className="h-3.5 w-3.5" /> Shift Handover
            </TabsTrigger>
            {/* GAP 4: My Shift Schedule tab */}
            <TabsTrigger value="my-shift" className="text-xs font-semibold px-3.5 py-1.5 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Calendar className="h-3.5 w-3.5" /> My Shift Schedule
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: MY PATIENTS */}
        <TabsContent value="my-patients" className="space-y-4 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Patient Selector List */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">My Bed Allocation</h3>
              {myAssignedPatients.map((p) => (
                <Card
                  key={p.patient_id}
                  onClick={() => setSelectedPatientId(p.patient_id)}
                  className={`p-3.5 border cursor-pointer transition-all ${
                    selectedPatientId === p.patient_id
                      ? "ring-2 ring-primary bg-primary/5 border-primary"
                      : "bg-card border-border hover:bg-muted/30"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-foreground">{p.patient_name}</span>
                        <Badge variant="outline" className="text-[10px] font-mono">{p.bed}</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{p.qlyno_patient_id} · {p.age}y / {p.gender}</p>
                    </div>
                    <Badge
                      className={
                        p.care_level === "Critical"
                          ? "bg-rose-500/15 text-rose-700 border-rose-500/30 text-[9px]"
                          : "bg-blue-500/10 text-blue-600 text-[9px]"
                      }
                    >
                      {p.care_level}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2 line-clamp-1">{p.diagnosis_preview}</p>
                </Card>
              ))}
            </div>

            {/* Selected Patient Bedside Cockpit */}
            <div className="lg:col-span-2 space-y-4">
              {activePatient ? (
                <Card className="border-border shadow-xs">
                  <CardHeader className="p-4 pb-3 border-b border-border">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base font-bold">{activePatient.patient_name}</CardTitle>
                          <Badge variant="outline" className="font-mono text-xs">{activePatient.ward}</Badge>
                          <Badge className="bg-emerald-500/15 text-emerald-700 text-[10px]">Vitals: Normal</Badge>
                        </div>
                        <CardDescription className="text-xs mt-0.5">{activePatient.diagnosis_preview}</CardDescription>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => setIsVitalsModalOpen(true)} className="h-7 text-xs gap-1">
                          <Thermometer className="h-3.5 w-3.5" /> Record Vitals
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setIsMarModalOpen(true)} className="h-7 text-xs gap-1">
                          <Pill className="h-3.5 w-3.5" /> Administer Med
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setIsNoteModalOpen(true)} className="h-7 text-xs gap-1">
                          <FileText className="h-3.5 w-3.5" /> Add Note
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    {/* Vitals Snapshot */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="rounded-lg border border-border p-2.5 bg-muted/20 text-xs">
                        <span className="text-muted-foreground text-[10px] uppercase font-bold">Blood Pressure</span>
                        <p className="text-base font-bold font-mono text-foreground mt-0.5">{vitalBp} mmHg</p>
                        <span className="text-[9px] text-emerald-600">Within Target MAP</span>
                      </div>
                      <div className="rounded-lg border border-border p-2.5 bg-muted/20 text-xs">
                        <span className="text-muted-foreground text-[10px] uppercase font-bold">Heart Rate</span>
                        <p className="text-base font-bold font-mono text-foreground mt-0.5">{vitalPulse} bpm</p>
                        <span className="text-[9px] text-muted-foreground">Sinus Rhythm</span>
                      </div>
                      <div className="rounded-lg border border-border p-2.5 bg-muted/20 text-xs">
                        <span className="text-muted-foreground text-[10px] uppercase font-bold">SpO2 Oxygen</span>
                        <p className="text-base font-bold font-mono text-cyan-600 mt-0.5">{vitalSpo2}</p>
                        <span className="text-[9px] text-muted-foreground">On 4L Nasal Prongs</span>
                      </div>
                      <div className="rounded-lg border border-border p-2.5 bg-muted/20 text-xs">
                        <span className="text-muted-foreground text-[10px] uppercase font-bold">Temperature</span>
                        <p className="text-base font-bold font-mono text-foreground mt-0.5">{vitalTemp}</p>
                        <span className="text-[9px] text-emerald-600">Afebrile</span>
                      </div>
                    </div>

                    {/* Patient Tasks */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase">Scheduled Bedside Tasks for this Patient:</h4>
                      <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                        {myTasks
                          .filter((t) => t.patient_id === activePatient.patient_id)
                          .map((t) => (
                            <div key={t.task_id} className="p-2.5 flex items-center justify-between text-xs bg-card">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-foreground">{t.title}</span>
                                  <Badge variant="outline" className="text-[9px]">{t.task_type}</Badge>
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-0.5">{t.description} · Due: {t.due_at}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {t.status !== "Completed" ? (
                                  <Button
                                    size="sm"
                                    className="h-6 text-[10px]"
                                    onClick={() => {
                                      dispatch(updateTaskStatus({ taskId: t.task_id, status: "Completed" }));
                                      toast({ title: "Task Completed & Verified" });
                                    }}
                                  >
                                    Mark Done
                                  </Button>
                                ) : (
                                  <Badge className="bg-emerald-500/15 text-emerald-700 text-[10px]">Completed</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: MY TASKS & MAR */}
        <TabsContent value="my-tasks" className="space-y-4 focus-visible:outline-none">
          <Card className="border-border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Bedside Care Tasks &amp; eMAR Administration</CardTitle>
              <CardDescription className="text-xs">
                All clinical procedures, vital checks, and medication doses assigned to you for this shift.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-bold">Procedure / MAR Task</TableHead>
                      <TableHead className="text-xs font-bold">Patient &amp; Bed</TableHead>
                      <TableHead className="text-xs font-bold">Type &amp; Priority</TableHead>
                      <TableHead className="text-xs font-bold">Scheduled Due</TableHead>
                      <TableHead className="text-xs font-bold">Current State</TableHead>
                      <TableHead className="text-xs font-bold text-right">Execution Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myTasks.map((t) => (
                      <TableRow key={t.task_id} className="hover:bg-muted/30">
                        <TableCell>
                          <p className="text-xs font-bold text-foreground">{t.title}</p>
                          <p className="text-[11px] text-muted-foreground">{t.description}</p>
                        </TableCell>
                        <TableCell className="text-xs text-foreground font-semibold">
                          {t.patient_name} ({t.bed_info})
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-[10px]">{t.task_type}</Badge>
                            <Badge
                              className={
                                t.priority === "High"
                                  ? "bg-rose-500/15 text-rose-700 text-[9px]"
                                  : "bg-muted text-muted-foreground text-[9px]"
                              }
                            >
                              {t.priority}
                            </Badge>
                          </div>
                        </TableCell>
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
                        <TableCell className="text-right">
                          {t.status !== "Completed" ? (
                            <Button
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => {
                                dispatch(updateTaskStatus({ taskId: t.task_id, status: "Completed" }));
                                toast({ title: "Task Completed", description: `${t.title} updated in real time.` });
                              }}
                            >
                              Complete
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">Done at {t.completed_at || "11:00 AM"}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: DOCTOR INSTRUCTIONS */}
        <TabsContent value="doctor-instructions" className="space-y-4 focus-visible:outline-none">
          <Card className="border-border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Attending Doctor Instructions</CardTitle>
              <CardDescription className="text-xs">Review doctor orders, acknowledge execution, or send questions.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
              {myInstructions.map((inst) => (
                <div key={inst.instruction_id} className="rounded-xl border border-border p-4 bg-card space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-primary" />
                        <span className="font-bold text-sm text-foreground">{inst.doctor_name}</span>
                        <Badge variant="outline" className="text-[10px] font-mono">{inst.bed}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Patient: <strong>{inst.patient_name}</strong></p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{inst.urgency}</Badge>
                  </div>

                  <div className="rounded-lg bg-muted/20 p-3 border border-border text-xs text-foreground font-medium">
                    {inst.instruction_text}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-muted-foreground">Status: <strong>{inst.status}</strong></span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          dispatch(respondDoctorInstruction({ instructionId: inst.instruction_id, status: "Clarification Requested", note: "Need clarification on fluid titration." }));
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
                          toast({ title: "Doctor Instruction Executed" });
                        }}
                        className="h-7 text-xs"
                      >
                        Acknowledge &amp; Complete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: SHIFT HANDOVER */}
        <TabsContent value="my-handover" className="space-y-4 focus-visible:outline-none">
          <Card className="border-border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Shift Handover Protocol</CardTitle>
              <CardDescription className="text-xs">
                Incoming and outgoing handover continuity records for your assigned patients.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
              {handovers.map((h) => (
                <div key={h.handover_id} className="rounded-xl border border-border p-4 bg-card space-y-2.5">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-sm text-foreground">{h.shift_name} Handover</span>
                      <p className="text-xs text-muted-foreground">
                        From: <strong>{h.outgoing_nurse_name}</strong> &rarr; To: <strong>{h.incoming_nurse_name}</strong>
                      </p>
                    </div>
                    <Badge className="bg-emerald-500/15 text-emerald-700 text-[10px]">{h.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground bg-muted/20 p-2.5 rounded-lg border border-border">
                    {h.structured_notes}
                  </p>
                  {h.status !== "Acknowledged" && (
                    <Button
                      size="sm"
                      onClick={() => {
                        dispatch(acknowledgeShiftHandover({ handoverId: h.handover_id, nurseName }));
                        toast({ title: "Handover Acknowledged" });
                      }}
                      className="h-8 text-xs gap-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Acknowledge Handover
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: MY SHIFT SCHEDULE — GAP 4 */}
        <TabsContent value="my-shift" className="space-y-4 focus-visible:outline-none">
          {/* Current Shift Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="p-3.5 border-border bg-card shadow-xs">
              <span className="text-[11px] text-muted-foreground uppercase font-bold">Active Shift</span>
              <p className="text-base font-bold font-mono text-primary mt-0.5">Morning (07:00 – 15:00)</p>
              <span className="text-[10px] text-muted-foreground">{activeStation.name}</span>
            </Card>
            <Card className="p-3.5 border-border bg-card shadow-xs">
              <span className="text-[11px] text-muted-foreground uppercase font-bold">This Week Shifts</span>
              <p className="text-base font-bold font-mono text-emerald-600 mt-0.5">{myRosterEntries.length > 0 ? myRosterEntries.length : 5} Scheduled</p>
              <span className="text-[10px] text-emerald-600">Mon – Fri Morning Rotation</span>
            </Card>
            <Card className="p-3.5 border-border bg-card shadow-xs">
              <span className="text-[11px] text-muted-foreground uppercase font-bold">Next Day Off</span>
              <p className="text-base font-bold font-mono text-cyan-600 mt-0.5">Saturday</p>
              <span className="text-[10px] text-cyan-600">Weekend — Not rostered</span>
            </Card>
          </div>

          {/* Roster Grid */}
          <Card className="border-border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" /> My Shift Roster — This Week
              </CardTitle>
              <CardDescription className="text-xs">
                Your assigned shift pattern, dates, and attendance status for the current roster period.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              {myRosterEntries.length > 0 ? (
                <div className="rounded-md border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="text-xs font-bold">Date</TableHead>
                        <TableHead className="text-xs font-bold">Shift</TableHead>
                        <TableHead className="text-xs font-bold">Timing</TableHead>
                        <TableHead className="text-xs font-bold">Station</TableHead>
                        <TableHead className="text-xs font-bold text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myRosterEntries.map((r) => {
                        const shift = shiftTemplates.find(s => s.shift_id === r.shift_id);
                        return (
                          <TableRow key={r.roster_id} className="hover:bg-muted/30">
                            <TableCell className="text-xs font-mono font-bold text-foreground">{r.date}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[10px]">{shift?.name || r.shift_id}</Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground font-mono">
                              {shift ? `${shift.start_time} – ${shift.end_time}` : "07:00 – 15:00"}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{activeStation.name}</TableCell>
                            <TableCell className="text-right">
                              <Badge className={
                                r.status === "Confirmed" ? "bg-emerald-500/15 text-emerald-700 text-[10px]" :
                                r.status === "Scheduled" ? "bg-amber-500/15 text-amber-700 text-[10px]" :
                                "bg-muted text-muted-foreground text-[10px]"
                              }>{r.status}</Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                /* Fallback demo roster if no entries in state */
                <div className="rounded-md border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="text-xs font-bold">Date</TableHead>
                        <TableHead className="text-xs font-bold">Shift</TableHead>
                        <TableHead className="text-xs font-bold">Timing</TableHead>
                        <TableHead className="text-xs font-bold">Station</TableHead>
                        <TableHead className="text-xs font-bold text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {["Mon, 01 Sep", "Tue, 02 Sep", "Wed, 03 Sep", "Thu, 04 Sep", "Fri, 05 Sep"].map((day, idx) => (
                        <TableRow key={day} className="hover:bg-muted/30">
                          <TableCell className="text-xs font-mono font-bold text-foreground">{day}</TableCell>
                          <TableCell><Badge variant="outline" className="text-[10px]">Morning</Badge></TableCell>
                          <TableCell className="text-xs text-muted-foreground font-mono">07:00 – 15:00</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{activeStation.name}</TableCell>
                          <TableCell className="text-right">
                            <Badge className={idx === 0 ? "bg-blue-500/15 text-blue-700 text-[10px]" : "bg-emerald-500/15 text-emerald-700 text-[10px]"}>
                              {idx === 0 ? "Today" : "Confirmed"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shift Change Request Card */}
          <Card className="border-border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" /> Request Shift Change
              </CardTitle>
              <CardDescription className="text-xs">Submit a shift swap or temporary reassignment request to your Station Lead.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="rounded-lg border border-border bg-muted/20 p-4 text-xs space-y-3">
                <p className="text-muted-foreground">Use the form below to request a schedule change. Your Station Lead will review and approve or reject the request.</p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">
                    <ArrowRight className="h-3.5 w-3.5" /> Request Shift Swap
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> Request Leave
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">Note: Approved leave and swap requests automatically update the roster calendar visible to your Station Lead.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MODALS */}

      {/* 1. Record Vitals Modal */}
      <Dialog open={isVitalsModalOpen} onOpenChange={setIsVitalsModalOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-primary" /> Bedside Vitals Observation
            </DialogTitle>
            <DialogDescription className="text-xs">
              Record observation parameters for {activePatient?.patient_name} ({activePatient?.bed}).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRecordVitals} className="space-y-3 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">Blood Pressure (mmHg)</Label>
                <Input value={vitalBp} onChange={(e) => setVitalBp(e.target.value)} required className="font-mono text-xs" />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Heart Rate (bpm)</Label>
                <Input value={vitalPulse} onChange={(e) => setVitalPulse(e.target.value)} required className="font-mono text-xs" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">SpO2 Oxygen (%)</Label>
                <Input value={vitalSpo2} onChange={(e) => setVitalSpo2(e.target.value)} required className="font-mono text-xs" />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Temperature (°F)</Label>
                <Input value={vitalTemp} onChange={(e) => setVitalTemp(e.target.value)} required className="font-mono text-xs" />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsVitalsModalOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm">Save Observation</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Administer Medication Modal */}
      <Dialog open={isMarModalOpen} onOpenChange={setIsMarModalOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" /> Medication Administration Record (eMAR)
            </DialogTitle>
            <DialogDescription className="text-xs">
              Confirm 5 Rights of Medication Administration for {activePatient?.patient_name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdministerMedication} className="space-y-3 py-2 text-xs">
            <div className="grid gap-1.5">
              <Label className="text-xs">Medication Order</Label>
              <Input value={marMedName} onChange={(e) => setMarMedName(e.target.value)} required className="text-xs font-semibold" />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Administration Notes / Infusion Site</Label>
              <Input
                placeholder="e.g. Left forearm peripheral cannula. Flushed with saline."
                value={marDoseNotes}
                onChange={(e) => setMarDoseNotes(e.target.value)}
                className="text-xs"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsMarModalOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm">Confirm &amp; Chart Dose</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 3. Add Care Note Modal */}
      <Dialog open={isNoteModalOpen} onOpenChange={setIsNoteModalOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Clinical Nursing Care Note
            </DialogTitle>
            <DialogDescription className="text-xs">
              Record nursing observation, patient response, and intake/output for {activePatient?.patient_name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddNote} className="space-y-3 py-2 text-xs">
            <div className="grid gap-1.5">
              <Label className="text-xs">Clinical Note Entry</Label>
              <Textarea
                placeholder="Patient resting comfortably post nebulization. Urine output adequate..."
                value={nursingNoteText}
                onChange={(e) => setNursingNoteText(e.target.value)}
                rows={4}
                required
                className="text-xs"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsNoteModalOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm">Save Note</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 4. Clinical Escalation Modal */}
      <Dialog open={isEscalateModalOpen} onOpenChange={setIsEscalateModalOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5" /> Escalate Clinical Emergency
            </DialogTitle>
            <DialogDescription className="text-xs">
              Immediate statutory escalation to attending physician &amp; Station Lead.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEscalateClinicalConcern} className="space-y-3 py-2 text-xs">
            <div className="grid gap-1.5">
              <Label className="text-xs">Responsible Doctor / Team</Label>
              <Select value={escalateDoctor} onValueChange={setEscalateDoctor}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dr. Rajesh Sharma (Cardiologist)">Dr. Rajesh Sharma (Cardiologist)</SelectItem>
                  <SelectItem value="Dr. Priya Deshmukh (Intensivist)">Dr. Priya Deshmukh (Intensivist)</SelectItem>
                  <SelectItem value="Trauma Emergency Response Team">Trauma Emergency Response Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Reason for Immediate Escalation</Label>
              <Textarea
                placeholder="Sudden acute desaturation / drop in blood pressure..."
                value={escalateReason}
                onChange={(e) => setEscalateReason(e.target.value)}
                rows={3}
                required
                className="text-xs"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEscalateModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="destructive" size="sm">Dispatch Escalation</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </RoleGate>
  );
}
