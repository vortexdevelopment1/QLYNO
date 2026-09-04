"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  HeartPulse,
  History,
  MessageCircle,
  MessageSquare,
  MoreHorizontal,
  Phone,
  PhoneCall,
  Plus,
  RotateCcw,
  Search,
  Send,
  Stethoscope,
  UserCheck,
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
  DialogTrigger,
} from "@/hospital-admin/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/hospital-admin/components/ui/dropdown-menu";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/hospital-admin/components/ui/tabs";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { StatusBadge } from "@/hospital-admin/components/shared/status-badge";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { doctors } from "@/hospital-admin/lib/mock-data/doctors";
import { cn, getInitials } from "@/hospital-admin/lib/utils";

// Initial Follow-ups Dataset
const initialFollowups = [
  {
    id: "fol_001",
    patientName: "Rohan Verma",
    uhid: "QLY-PAT-2024-00128",
    phone: "+91 98201 55678",
    doctorName: "Dr. Vikram Seth",
    department: "Cardiology",
    dueDate: "2026-08-14",
    type: "Due Today",
    category: "Post-Angioplasty Day 7 Review",
    doctorInstructions: "Check resting ECG, verify dual-antiplatelet adherence (Aspirin + Ticagrelor), monitor femoral puncture site healing.",
    medications: "Tab Ticagrelor 90mg (1-0-1), Tab Rosuvastatin 20mg (0-0-1)",
    lastResponse: "Reminder Sent (WhatsApp)",
    responseStatus: "Pending",
    retryCount: 1,
  },
  {
    id: "fol_002",
    patientName: "Kavita Patil",
    uhid: "QLY-PAT-2023-00912",
    phone: "+91 98202 66789",
    doctorName: "Dr. Arvind Joshi",
    department: "Orthopedics",
    dueDate: "2026-08-14",
    type: "Due Today",
    category: "Total Knee Suture Removal",
    doctorInstructions: "Inspect surgical incision wound for erythema or discharge, remove surgical clips/sutures, assess active knee flexion range.",
    medications: "Tab Etoricoxib 90mg (1-0-0), Daily Physiotherapy",
    lastResponse: "Confirmed via Call (11:30 AM)",
    responseStatus: "Confirmed",
    retryCount: 0,
  },
  {
    id: "fol_003",
    patientName: "Deepak Mehta",
    uhid: "QLY-PAT-2024-00341",
    phone: "+91 98203 77890",
    doctorName: "Dr. Priya Sharma",
    department: "Diabetology",
    dueDate: "2026-08-10",
    type: "Overdue",
    overdueDays: 4,
    category: "HbA1c & Glycemic Recalibration",
    doctorInstructions: "Review fasting and post-prandial glucometer log, adjust basal insulin glargine dosage if fasting > 130 mg/dL.",
    medications: "Inj Glargine 16 units at bedtime, Tab Metformin 1000mg",
    lastResponse: "Unreachable (SMS Dispatched)",
    responseStatus: "Overdue",
    retryCount: 3,
  },
  {
    id: "fol_004",
    patientName: "Anita Desai",
    uhid: "QLY-PAT-2025-01042",
    phone: "+91 98204 88901",
    doctorName: "Dr. Sneha Roy",
    department: "Pediatrics",
    dueDate: "2026-08-18",
    type: "Upcoming",
    category: "9-Month Immunization Milestone",
    doctorInstructions: "Administer MMR-1 and Typhoid Conjugate Vaccine, record growth percentile charts (height, weight, head circumference).",
    medications: "Syrup Vitamin D3 drops (400 IU daily)",
    lastResponse: "Scheduled in System",
    responseStatus: "Upcoming",
    retryCount: 0,
  },
  {
    id: "fol_005",
    patientName: "Gaurav Bhatt",
    uhid: "QLY-PAT-2024-00781",
    phone: "+91 98205 99012",
    doctorName: "Dr. Rohan Mehta",
    department: "Orthopedics",
    dueDate: "2026-08-21",
    type: "Upcoming",
    category: "Ankle Sprain Immobilization Review",
    doctorInstructions: "Wean off Aircast splint, commence ankle eversion strengthening and proprioceptive balance exercises.",
    medications: "Cold compression BID, Tab Paracetamol SOS",
    lastResponse: "Scheduled in System",
    responseStatus: "Upcoming",
    retryCount: 0,
  },
  {
    id: "fol_006",
    patientName: "Suresh Kulkarni",
    uhid: "QLY-PAT-2022-00341",
    phone: "+91 98206 11234",
    doctorName: "Dr. Kavya Iyer",
    department: "Neurology",
    dueDate: "2026-08-08",
    type: "Overdue",
    overdueDays: 6,
    category: "Chronic Migraine Preventive Review",
    doctorInstructions: "Assess headache diary frequency reduction, review Topiramate tolerability and cognitive side-effects.",
    medications: "Tab Topiramate 25mg HS, Tab Rizatriptan 10mg SOS",
    lastResponse: "Call Not Answered",
    responseStatus: "Overdue",
    retryCount: 4,
  },
  {
    id: "fol_007",
    patientName: "Pooja Hegde",
    uhid: "QLY-PAT-2023-01004",
    phone: "+91 98207 22345",
    doctorName: "Dr. Neha Kulkarni",
    department: "Gynecology",
    dueDate: "Unscheduled",
    type: "Not Booked",
    category: "Post-Discharge LSCS Review (Flagged by Doctor)",
    doctorInstructions: "Required 2-week post-op wound healing check and neonatal lactation support review. No appointment on record.",
    medications: "Tab Calcium + Vit D3, Iron supplement",
    lastResponse: "No Appointment Booked",
    responseStatus: "Not Booked",
    retryCount: 1,
  },
];

export default function FollowUpsPage() {
  const { toast } = useToast();
  const [followups, setFollowups] = useState(initialFollowups);
  const [activeTab, setActiveTab] = useState("due-today");
  const [search, setSearch] = useState("");

  // Response Logger Modal State
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [selectedFollowup, setSelectedFollowup] = useState<any>(null);
  const [responseOutcome, setResponseOutcome] = useState("Confirmed Attendance");
  const [rescheduleDate, setRescheduleDate] = useState("2026-08-18");
  const [responseNotes, setResponseNotes] = useState("");

  // Doctor Instructions Drawer Modal
  const [instructionsModalOpen, setInstructionsModalOpen] = useState(false);
  const [selectedInstruction, setSelectedInstruction] = useState<any>(null);

  // Filtered lists
  const dueTodayList = followups.filter((f) => f.type === "Due Today");
  const upcomingList = followups.filter((f) => f.type === "Upcoming");
  const overdueList = followups.filter((f) => f.type === "Overdue");
  const notBookedList = followups.filter((f) => f.type === "Not Booked");

  const handleSendWhatsApp = (f: any) => {
    toast({
      title: "WhatsApp Reminder Dispatched",
      description: `Automated recall template sent to ${f.patientName} (${f.phone}).`,
    });
  };

  const handleLogResponseSubmit = () => {
    if (!selectedFollowup) return;

    if (responseOutcome === "Requested Reschedule" && !rescheduleDate) {
      toast({
        title: "Reschedule Date Required",
        description: "Please select a valid new follow-up date via the date picker.",
        variant: "destructive",
      });
      return;
    }

    setFollowups((prev) =>
      prev.map((item) => {
        if (item.id === selectedFollowup.id) {
          if (responseOutcome === "Requested Reschedule") {
            return {
              ...item,
              dueDate: rescheduleDate,
              type: "Upcoming",
              lastResponse: `Rescheduled to ${rescheduleDate} (${responseNotes || "Patient request"})`,
              responseStatus: "Rescheduled",
            };
          } else if (responseOutcome === "Confirmed Attendance") {
            return {
              ...item,
              lastResponse: `Confirmed Attendance (${responseNotes || "Logged by desk"})`,
              responseStatus: "Confirmed",
            };
          } else if (responseOutcome.includes("Unreachable")) {
            return {
              ...item,
              retryCount: (item.retryCount || 0) + 1,
              lastResponse: `Unreachable (${responseNotes || `Attempt #${(item.retryCount || 0) + 1}`})`,
              responseStatus: "Unreachable",
            };
          } else {
            return {
              ...item,
              lastResponse: `Refused (${responseNotes || "Patient declined review"})`,
              responseStatus: "Refused",
            };
          }
        }
        return item;
      })
    );

    setResponseModalOpen(false);
    toast({
      title: "Patient Outreach Recorded",
      description: `Response successfully logged for ${selectedFollowup.patientName}: ${responseOutcome}.`,
    });
  };

  const handleQuickBook = (f: any) => {
    setFollowups((prev) =>
      prev.map((item) =>
        item.id === f.id
          ? { ...item, type: "Upcoming", dueDate: "2026-08-16", lastResponse: "Booked in OPD Schedule", responseStatus: "Confirmed" }
          : item
      )
    );
    toast({
      title: "Follow-up Appointment Booked",
      description: `Slot reserved for ${f.patientName} with ${f.doctorName} on 16 Aug 2026.`,
    });
  };

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Patient Follow-up & Care Continuity Desk"
        description="Automated recall schedules, post-op milestone tracking, overdue patient outreach & clinical instructions."
        crumbs={[{ label: "Patient Care" }, { label: "Follow-ups" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-semibold"
              onClick={() =>
                toast({
                  title: "Mass Reminders Dispatched",
                  description: "Sent automated WhatsApp recall alerts to all 14 patients due today.",
                })
              }
            >
              <Send className="h-3.5 w-3.5 text-emerald-600" /> Send All Reminders Today
            </Button>
          </div>
        }
      />

      {/* Top KPI ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="p-4 border-border bg-card shadow-sm">
          <p className="text-xs text-muted-foreground font-medium">Due Today</p>
          <p className="text-2xl font-bold font-mono text-primary mt-1">{dueTodayList.length} Patients</p>
          <span className="text-[11px] font-semibold text-emerald-600">Recall alerts active</span>
        </Card>
        <Card className="p-4 border-border bg-card shadow-sm">
          <p className="text-xs text-muted-foreground font-medium">Upcoming (Next 14 Days)</p>
          <p className="text-2xl font-bold font-mono text-foreground mt-1">{upcomingList.length} Scheduled</p>
          <span className="text-[11px] font-semibold text-muted-foreground">Confirmed in calendar</span>
        </Card>
        <Card className="p-4 border-border bg-card shadow-sm">
          <p className="text-xs text-muted-foreground font-medium">Overdue &gt; 3 Days</p>
          <p className="text-2xl font-bold font-mono text-rose-600 mt-1">{overdueList.length} Overdue</p>
          <span className="text-[11px] font-semibold text-rose-600">Urgent follow-up required</span>
        </Card>
        <Card className="p-4 border-border bg-card shadow-sm">
          <p className="text-xs text-muted-foreground font-medium">Follow-up Not Booked</p>
          <p className="text-2xl font-bold font-mono text-amber-600 mt-1">{notBookedList.length} Flagged</p>
          <span className="text-[11px] font-semibold text-amber-600">Discharged without slot</span>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 max-w-2xl bg-muted/60 p-1">
          <TabsTrigger value="due-today" className="text-xs font-semibold">
            <CalendarClock className="h-3.5 w-3.5 mr-1.5" /> Due Today ({dueTodayList.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="text-xs font-semibold">
            <CalendarDays className="h-3.5 w-3.5 mr-1.5" /> Upcoming ({upcomingList.length})
          </TabsTrigger>
          <TabsTrigger value="overdue" className="text-xs font-semibold">
            <AlertTriangle className="h-3.5 w-3.5 mr-1.5 text-rose-500" /> Overdue ({overdueList.length})
          </TabsTrigger>
          <TabsTrigger value="not-booked" className="text-xs font-semibold">
            <RotateCcw className="h-3.5 w-3.5 mr-1.5 text-amber-500" /> Not Booked ({notBookedList.length})
          </TabsTrigger>
        </TabsList>

        {/* ========================================================================= */}
        {/* TAB 1: DUE TODAY                                                          */}
        {/* ========================================================================= */}
        <TabsContent value="due-today" className="space-y-4 mt-4">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-sm font-bold">Follow-ups Due Today</CardTitle>
              <CardDescription className="text-xs">Patients scheduled for clinical review, suture removal or medication check today</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Details</TableHead>
                    <TableHead>Consulting Doctor</TableHead>
                    <TableHead>Category / Purpose</TableHead>
                    <TableHead>Doctor Instructions</TableHead>
                    <TableHead>Communication Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dueTodayList.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell>
                        <strong className="text-xs font-semibold text-foreground block">{f.patientName}</strong>
                        <span className="font-mono text-[10px] text-muted-foreground">{f.phone}</span>
                      </TableCell>
                      <TableCell className="text-xs">
                        <strong className="text-foreground block">{f.doctorName}</strong>
                        <span className="text-[10px] text-muted-foreground">{f.department}</span>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-foreground">
                        {f.category}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 text-[10px] gap-1"
                          onClick={() => {
                            setSelectedInstruction(f);
                            setInstructionsModalOpen(true);
                          }}
                        >
                          <FileText className="h-3 w-3 text-primary" /> View Instructions
                        </Button>
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px]",
                            f.responseStatus === "Confirmed" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                            f.responseStatus === "Pending" && "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                          )}
                        >
                          {f.lastResponse}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7 text-emerald-600"
                            title="Send WhatsApp Reminder"
                            onClick={() => handleSendWhatsApp(f)}
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 text-xs font-semibold"
                            onClick={() => {
                              setSelectedFollowup(f);
                              setResponseModalOpen(true);
                            }}
                          >
                            Log Response
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 2: UPCOMING                                                           */}
        {/* ========================================================================= */}
        <TabsContent value="upcoming" className="space-y-4 mt-4">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-sm font-bold">Upcoming Follow-up Schedule (Next 14-30 Days)</CardTitle>
              <CardDescription className="text-xs">Future appointment recalls and milestone checkups</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Patient Details</TableHead>
                    <TableHead>Doctor &amp; Department</TableHead>
                    <TableHead>Recall Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingList.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-mono text-xs font-bold text-foreground">
                        {f.dueDate}
                      </TableCell>
                      <TableCell>
                        <strong className="text-xs font-semibold text-foreground block">{f.patientName}</strong>
                        <span className="font-mono text-[10px] text-muted-foreground">{f.phone}</span>
                      </TableCell>
                      <TableCell className="text-xs">
                        <strong>{f.doctorName}</strong>
                        <span className="text-[10px] text-muted-foreground block">{f.department}</span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {f.category}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-700 text-[10px]">
                          Scheduled
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            setSelectedInstruction(f);
                            setInstructionsModalOpen(true);
                          }}
                        >
                          Doctor Notes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 3: OVERDUE                                                            */}
        {/* ========================================================================= */}
        <TabsContent value="overdue" className="space-y-4 mt-4">
          <Card className="border-rose-500/30 bg-rose-500/5 shadow-sm">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> Overdue Patient Follow-up Alerts
              </CardTitle>
              <CardDescription className="text-xs">
                Patients who missed scheduled follow-up dates — requires administrative &amp; nursing escalation
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Overdue Since</TableHead>
                    <TableHead>Patient Details</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Critical Recall Reason</TableHead>
                    <TableHead>Retry Count</TableHead>
                    <TableHead className="text-right">Escalation Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdueList.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell>
                        <Badge variant="destructive" className="text-[10px] font-mono font-bold">
                          Overdue by {f.overdueDays}d
                        </Badge>
                        <span className="text-[10px] text-muted-foreground block mt-0.5">Due: {f.dueDate}</span>
                      </TableCell>
                      <TableCell>
                        <strong className="text-xs font-semibold text-foreground block">{f.patientName}</strong>
                        <span className="font-mono text-[10px] text-muted-foreground">{f.phone}</span>
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        {f.doctorName}
                      </TableCell>
                      <TableCell className="text-xs text-foreground max-w-[200px]">
                        {f.category}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-amber-600 font-bold">
                        {f.retryCount} Retries
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-7 text-xs font-semibold"
                            onClick={() => {
                              setSelectedFollowup(f);
                              setResponseModalOpen(true);
                            }}
                          >
                            <PhoneCall className="h-3 w-3 mr-1" /> Call Patient
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 4: FOLLOW-UP NOT BOOKED                                               */}
        {/* ========================================================================= */}
        <TabsContent value="not-booked" className="space-y-4 mt-4">
          <Card className="border-amber-500/30 bg-amber-500/5 shadow-sm">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-sm font-bold text-amber-700 dark:text-amber-300 flex items-center gap-2">
                <RotateCcw className="h-4 w-4" /> Discharged Patients with Unscheduled Follow-ups
              </CardTitle>
              <CardDescription className="text-xs">
                Inpatients flagged by clinical discharge summary requiring a mandatory review but without an appointment
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Details</TableHead>
                    <TableHead>Flagged By Doctor</TableHead>
                    <TableHead>Review Advice</TableHead>
                    <TableHead>Recommended Timeframe</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notBookedList.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell>
                        <strong className="text-xs font-semibold text-foreground block">{f.patientName}</strong>
                        <span className="font-mono text-[10px] text-muted-foreground">{f.phone}</span>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-foreground">
                        {f.doctorName} ({f.department})
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[240px]">
                        {f.doctorInstructions}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                        Within 7-14 Days
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          className="h-7 text-xs font-semibold gap-1.5"
                          onClick={() => handleQuickBook(f)}
                        >
                          <Plus className="h-3 w-3" /> Book Follow-up Slot
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ========================================================================= */}
      {/* MODAL: LOG PATIENT RESPONSE                                               */}
      {/* ========================================================================= */}
      <Dialog open={responseModalOpen} onOpenChange={setResponseModalOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Log Patient Outreach Response</DialogTitle>
            <DialogDescription>
              Record communication outcome and update follow-up roster.
            </DialogDescription>
          </DialogHeader>
          {selectedFollowup && (
            <div className="space-y-3.5 py-2">
              <div className="p-2.5 rounded bg-muted/40 text-xs">
                <p>
                  Patient: <strong>{selectedFollowup.patientName}</strong> ({selectedFollowup.phone})
                </p>
                <p className="text-muted-foreground">
                  Consulting: {selectedFollowup.doctorName} • {selectedFollowup.category}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Communication Outcome</Label>
                <Select value={responseOutcome} onValueChange={setResponseOutcome}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Confirmed Attendance">✓ Confirmed Attendance</SelectItem>
                    <SelectItem value="Requested Reschedule">📅 Requested Reschedule</SelectItem>
                    <SelectItem value="Call Not Answered / Unreachable">📞 Unreachable (Retry Logged)</SelectItem>
                    <SelectItem value="Refused / Consulting Elsewhere">❌ Refused / External Doctor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {responseOutcome === "Requested Reschedule" && (
                <div className="space-y-1.5">
                  <Label>New Rescheduled Date</Label>
                  <Input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Remarks / Patient Feedback</Label>
                <Input
                  placeholder="e.g. Patient feeling well, requested morning slot"
                  value={responseNotes}
                  onChange={(e) => setResponseNotes(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setResponseModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLogResponseSubmit}>Save Communication Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: DOCTOR CLINICAL INSTRUCTIONS PREVIEW                               */}
      {/* ========================================================================= */}
      <Dialog open={instructionsModalOpen} onOpenChange={setInstructionsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-primary" /> Doctor Clinical Instructions
            </DialogTitle>
            <DialogDescription>
              Physician discharge orders, recovery precautions and medication regimen.
            </DialogDescription>
          </DialogHeader>
          {selectedInstruction && (
            <div className="space-y-3 py-2 text-xs">
              <div className="p-2.5 rounded bg-muted/30 border border-border">
                <p className="font-semibold text-foreground">{selectedInstruction.patientName}</p>
                <p className="text-muted-foreground text-[11px]">Doctor: {selectedInstruction.doctorName} ({selectedInstruction.department})</p>
              </div>
              <div className="space-y-1">
                <strong className="text-foreground block">Clinical Review Instructions:</strong>
                <p className="p-2.5 rounded bg-card border border-border/80 text-muted-foreground leading-relaxed">
                  {selectedInstruction.doctorInstructions}
                </p>
              </div>
              <div className="space-y-1">
                <strong className="text-foreground block">Active Medication Regimen:</strong>
                <p className="p-2.5 rounded bg-card border border-border/80 font-mono text-[11px] text-primary">
                  {selectedInstruction.medications}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setInstructionsModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
