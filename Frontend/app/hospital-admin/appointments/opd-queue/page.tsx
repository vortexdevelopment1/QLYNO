"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Flame,
  HeartPulse,
  History,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Stethoscope,
  TrendingUp,
  UserCheck,
  Users,
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

// Initial OPD Queue Data
const initialOpdQueue = [
  {
    token: "T-01",
    patientName: "Aarav Shah",
    uhid: "QLY-PAT-2024-00841",
    age: 42,
    gender: "Male",
    doctorName: "Dr. Ananya Rao",
    doctorId: "doc_001",
    room: "Room 101",
    department: "Cardiology",
    time: "09:30 AM",
    waitTime: "8 mins",
    vitals: { bp: "128/82", pulse: 74, temp: "98.4°F", spo2: "99%" },
    status: "in-consultation",
    complaint: "Routine blood pressure review & palpitations",
  },
  {
    token: "T-02",
    patientName: "Meera Nambiar",
    uhid: "QLY-PAT-2023-00412",
    age: 29,
    gender: "Female",
    doctorName: "Dr. Neha Kulkarni",
    doctorId: "doc_005",
    room: "Room 104",
    department: "Gynecology",
    time: "09:45 AM",
    waitTime: "14 mins",
    vitals: { bp: "110/70", pulse: 80, temp: "98.6°F", spo2: "98%" },
    status: "called",
    complaint: "Prenatal ultrasound review (Week 24)",
  },
  {
    token: "T-03",
    patientName: "Kabir Malhotra",
    uhid: "QLY-PAT-2024-01190",
    age: 51,
    gender: "Male",
    doctorName: "Dr. Kavya Iyer",
    doctorId: "doc_003",
    room: "Room 102",
    department: "Neurology",
    time: "10:00 AM",
    waitTime: "22 mins",
    vitals: { bp: "135/88", pulse: 78, temp: "99.1°F", spo2: "97%" },
    status: "waiting",
    complaint: "Migraine headaches with visual auras",
  },
  {
    token: "T-04",
    patientName: "Devansh Pandey",
    uhid: "QLY-PAT-2025-02241",
    age: 64,
    gender: "Male",
    doctorName: "Dr. Rohan Mehta",
    doctorId: "doc_002",
    room: "Room 103",
    department: "Orthopedics",
    time: "10:15 AM",
    waitTime: "18 mins",
    vitals: { bp: "140/90", pulse: 72, temp: "98.2°F", spo2: "98%" },
    status: "waiting",
    complaint: "Right knee post-op stiffness",
  },
  {
    token: "T-05",
    patientName: "Fatima Ansari",
    uhid: "QLY-PAT-2023-00975",
    age: 36,
    gender: "Female",
    doctorName: "Dr. Ananya Rao",
    doctorId: "doc_001",
    room: "Room 101",
    department: "Cardiology",
    time: "10:30 AM",
    waitTime: "5 mins",
    vitals: { bp: "118/76", pulse: 70, temp: "98.6°F", spo2: "99%" },
    status: "waiting",
    complaint: "Holter monitor follow-up result",
  },
  {
    token: "T-06",
    patientName: "Ibrahim Sheikh",
    uhid: "QLY-PAT-2022-00187",
    age: 58,
    gender: "Male",
    doctorName: "Dr. Simran Kaur",
    doctorId: "doc_007",
    room: "Room 105",
    department: "General Medicine",
    time: "08:45 AM",
    waitTime: "0 mins",
    vitals: { bp: "130/84", pulse: 76, temp: "98.4°F", spo2: "98%" },
    status: "completed",
    complaint: "Type-2 diabetes glycemic control review",
  },
];

// Historical OPD Data
const initialOpdHistory = [
  {
    visitId: "OPD-2026-0813-01",
    date: "2026-08-13",
    patientName: "Suresh Kulkarni",
    uhid: "QLY-PAT-2022-00341",
    doctorName: "Dr. Kavya Iyer",
    department: "Neurology",
    diagnosis: "Tension-type Cephalea",
    prescriptions: "Tab Naproxen 500mg, Tab Amitriptyline 10mg",
    fee: 800,
    status: "Completed",
  },
  {
    visitId: "OPD-2026-0813-02",
    date: "2026-08-13",
    patientName: "Pooja Hegde",
    uhid: "QLY-PAT-2023-01004",
    doctorName: "Dr. Neha Kulkarni",
    department: "Gynecology",
    diagnosis: "PCOS Lifestyle Counseling",
    prescriptions: "Tab Myo-Inositol, Metformin 500mg",
    fee: 1000,
    status: "Completed",
  },
  {
    visitId: "OPD-2026-0812-01",
    date: "2026-08-12",
    patientName: "Rohan Deshmukh",
    uhid: "QLY-PAT-2024-00992",
    doctorName: "Dr. Rohan Mehta",
    department: "Orthopedics",
    diagnosis: "Lumbar Disc Herniation L4-L5",
    prescriptions: "Physiotherapy Indent, Tab Etoricoxib 90mg",
    fee: 1200,
    status: "Completed",
  },
];

export default function OPDQueuePage() {
  const { toast } = useToast();
  const [queue, setQueue] = useState(initialOpdQueue);
  const [history, setHistory] = useState(initialOpdHistory);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("all");

  // Check-in Modal State
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkInName, setCheckInName] = useState("");
  const [checkInAge, setCheckInAge] = useState("35");
  const [checkInGender, setCheckInGender] = useState("Male");
  const [checkInDoctorId, setCheckInDoctorId] = useState("doc_001");
  const [checkInComplaint, setCheckInComplaint] = useState("");
  const [checkInBP, setCheckInBP] = useState("120/80");
  const [checkInPulse, setCheckInPulse] = useState("72");
  const [checkInTemp, setCheckInTemp] = useState("98.6°F");
  const [checkInSpO2, setCheckInSpO2] = useState("99%");

  // Filtered Queue
  const filteredQueue = queue.filter((q) => {
    const matchesSearch =
      q.patientName.toLowerCase().includes(search.toLowerCase()) ||
      q.uhid.toLowerCase().includes(search.toLowerCase()) ||
      q.token.toLowerCase().includes(search.toLowerCase());
    const matchesDoc = doctorFilter === "all" || q.doctorId === doctorFilter;
    return matchesSearch && matchesDoc;
  });

  const inConsultation = queue.filter((q) => q.status === "in-consultation");
  const called = queue.filter((q) => q.status === "called");
  const waiting = queue.filter((q) => q.status === "waiting");
  const completed = queue.filter((q) => q.status === "completed");

  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInName.trim()) {
      toast({ title: "Validation Error", description: "Patient name is required.", variant: "destructive" });
      return;
    }

    if (!checkInBP.trim() || !checkInPulse.trim() || !checkInTemp.trim() || !checkInSpO2.trim()) {
      toast({
        title: "Triage Vitals Mandatory",
        description: "BP, Pulse, Temperature, and SpO2 must be recorded before issuing an OPD queue token.",
        variant: "destructive",
      });
      return;
    }

    const doc = doctors.find((d) => d.id === checkInDoctorId) || doctors[0];
    const nextTokenNum = queue.length + 1;
    const newToken = `T-${String(nextTokenNum).padStart(2, "0")}`;

    const newEntry = {
      token: newToken,
      patientName: checkInName.trim(),
      uhid: `QLY-PAT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      age: Number(checkInAge) || 30,
      gender: checkInGender,
      doctorName: doc.name,
      doctorId: doc.id,
      room: `Room ${doc.id.replace("doc_00", "10")}`,
      department: doc.department,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      waitTime: "0 mins",
      vitals: { bp: checkInBP.trim(), pulse: Number(checkInPulse) || 72, temp: checkInTemp.trim(), spo2: checkInSpO2.trim() },
      status: "waiting" as const,
      complaint: checkInComplaint.trim() || "OPD Consultation",
    };

    setQueue([...queue, newEntry]);
    setCheckInOpen(false);
    setCheckInName("");
    setCheckInComplaint("");
    toast({
      title: "Patient Checked-in Successfully",
      description: `Issued Token ${newToken} for ${newEntry.patientName} (Assigned to ${newEntry.doctorName}, ${newEntry.room}).`,
    });
  };

  const updateStatus = (token: string, newStatus: "waiting" | "called" | "in-consultation" | "completed") => {
    setQueue((prev) =>
      prev.map((item) => {
        if (item.token === token) {
          return { ...item, status: newStatus };
        }
        return item;
      })
    );
    toast({
      title: `Token ${token} Status Updated`,
      description: `Progressed to ${newStatus.replace("-", " ").toUpperCase()}.`,
    });
  };

  const handleExportRegister = () => {
    const csvRows = [
      ["Visit ID", "Date", "Patient Name", "UHID", "Doctor", "Department", "Diagnosis", "Prescriptions", "Fee", "Status"],
      ...history.map((h) => [
        h.visitId,
        h.date,
        `"${h.patientName}"`,
        h.uhid,
        `"${h.doctorName}"`,
        h.department,
        `"${h.diagnosis}"`,
        `"${h.prescriptions}"`,
        h.fee,
        h.status,
      ]),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `opd_history_register_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "OPD Register Exported",
      description: "Downloaded CSV report of past outpatient consultations.",
    });
  };

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="OPD Management & Live Token Queue"
        description="Outpatient reception check-ins, doctor consultation rooms, token telemetry & OPD records."
        crumbs={[{ label: "Patient Care" }, { label: "OPD Management" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/hospital-admin/appointments">
                <Calendar className="h-4 w-4 mr-1.5" /> Appointments Schedule
              </Link>
            </Button>
            <Dialog open={checkInOpen} onOpenChange={setCheckInOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="font-semibold gap-1.5">
                  <UserCheck className="h-4 w-4" /> Patient Check-in
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[540px]">
                <DialogHeader>
                  <DialogTitle>OPD Patient Check-in &amp; Triage</DialogTitle>
                  <DialogDescription>
                    Issue queue token, record baseline vitals &amp; assign consulting doctor room.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCheckInSubmit} className="space-y-3.5 py-2">
                  <div className="space-y-1.5">
                    <Label>Patient Name</Label>
                    <Input
                      placeholder="e.g. Alok Verma"
                      value={checkInName}
                      onChange={(e) => setCheckInName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Age</Label>
                      <Input
                        type="number"
                        value={checkInAge}
                        onChange={(e) => setCheckInAge(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Gender</Label>
                      <Select value={checkInGender} onValueChange={setCheckInGender}>
                        <SelectTrigger>
                          <SelectValue placeholder="Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Assign Doctor &amp; Room</Label>
                    <Select value={checkInDoctorId} onValueChange={setCheckInDoctorId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name} — Room {d.id.replace("doc_00", "10")} ({d.department})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Chief Complaints / Symptoms</Label>
                    <Input
                      placeholder="e.g. Acute abdominal pain, dizziness"
                      value={checkInComplaint}
                      onChange={(e) => setCheckInComplaint(e.target.value)}
                    />
                  </div>

                  {/* Triage Vitals Section */}
                  <div className="p-3 bg-muted/40 rounded-lg border border-border/80 space-y-2">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <HeartPulse className="h-3.5 w-3.5 text-rose-500" /> Triage Vitals at Check-in
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <Label className="text-[10px] text-muted-foreground">BP (mmHg) *</Label>
                        <Input
                          className="h-8 text-xs font-mono"
                          value={checkInBP}
                          onChange={(e) => setCheckInBP(e.target.value)}
                          placeholder="120/80"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Pulse (bpm) *</Label>
                        <Input
                          className="h-8 text-xs font-mono"
                          value={checkInPulse}
                          onChange={(e) => setCheckInPulse(e.target.value)}
                          placeholder="72"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Temp (°F) *</Label>
                        <Input
                          className="h-8 text-xs font-mono"
                          value={checkInTemp}
                          onChange={(e) => setCheckInTemp(e.target.value)}
                          placeholder="98.6°F"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground">SpO2 (%) *</Label>
                        <Input
                          className="h-8 text-xs font-mono"
                          value={checkInSpO2}
                          onChange={(e) => setCheckInSpO2(e.target.value)}
                          placeholder="99%"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="pt-2">
                    <Button type="button" variant="outline" onClick={() => setCheckInOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Issue Token &amp; Enqueue</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Main Tabs: OPD Dashboard / Today's Queue / Doctor-wise Rooms / OPD History */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 max-w-2xl bg-muted/60 p-1">
          <TabsTrigger value="dashboard" className="text-xs font-semibold">
            <Activity className="h-3.5 w-3.5 mr-1.5" /> OPD Dashboard
          </TabsTrigger>
          <TabsTrigger value="queue" className="text-xs font-semibold">
            <Users className="h-3.5 w-3.5 mr-1.5" /> Today&apos;s Queue ({queue.length})
          </TabsTrigger>
          <TabsTrigger value="rooms" className="text-xs font-semibold">
            <Stethoscope className="h-3.5 w-3.5 mr-1.5" /> Doctor Rooms
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs font-semibold">
            <History className="h-3.5 w-3.5 mr-1.5" /> OPD History
          </TabsTrigger>
        </TabsList>

        {/* ========================================================================= */}
        {/* TAB 1: OPD DASHBOARD                                                      */}
        {/* ========================================================================= */}
        <TabsContent value="dashboard" className="space-y-4 mt-4">
          {/* Top KPI ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <Card className="p-4 border-border bg-card shadow-sm">
              <p className="text-xs text-muted-foreground font-medium">Total OPD Arrivals</p>
              <p className="text-2xl font-bold font-mono text-foreground mt-1">{queue.length + 12}</p>
              <span className="text-[11px] font-semibold text-emerald-600">84% of daily target</span>
            </Card>
            <Card className="p-4 border-border bg-card shadow-sm">
              <p className="text-xs text-muted-foreground font-medium">In Consultation</p>
              <p className="text-2xl font-bold font-mono text-primary mt-1">{inConsultation.length}</p>
              <span className="text-[11px] font-semibold text-muted-foreground">across active rooms</span>
            </Card>
            <Card className="p-4 border-border bg-card shadow-sm">
              <p className="text-xs text-muted-foreground font-medium">Waiting in Lounge</p>
              <p className="text-2xl font-bold font-mono text-amber-600 mt-1">{waiting.length}</p>
              <span className="text-[11px] font-semibold text-amber-600">Avg wait: 14 mins</span>
            </Card>
            <Card className="p-4 border-border bg-card shadow-sm">
              <p className="text-xs text-muted-foreground font-medium">Completed Visits</p>
              <p className="text-2xl font-bold font-mono text-emerald-600 mt-1">{completed.length + 12}</p>
              <span className="text-[11px] font-semibold text-emerald-600">Discharged / Prescribed</span>
            </Card>
            <Card className="p-4 border-border bg-card shadow-sm">
              <p className="text-xs text-muted-foreground font-medium">OPD Revenue Today</p>
              <p className="text-2xl font-bold font-mono text-foreground mt-1">₹1,24,000</p>
              <span className="text-[11px] font-semibold text-emerald-600">₹800 - ₹1200 per consult</span>
            </Card>
          </div>

          {/* Quick Doctor Room Summary & Live Alert */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 border-border bg-card shadow-sm">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold">Active Consultation Rooms</CardTitle>
                <CardDescription className="text-xs">Live status of doctors currently seeing patients</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {doctors.slice(0, 4).map((doc) => {
                  const currentPatient = queue.find((q) => q.doctorId === doc.id && q.status === "in-consultation");
                  const nextInLine = queue.filter((q) => q.doctorId === doc.id && q.status === "waiting");

                  return (
                    <div key={doc.id} className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <strong className="text-xs text-foreground block">{doc.name}</strong>
                          <span className="text-[10px] text-muted-foreground">Room {doc.id.replace("doc_00", "10")} • {doc.department}</span>
                        </div>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 text-[10px] font-semibold">
                          Active
                        </Badge>
                      </div>
                      <div className="text-[11px] p-2 rounded bg-card border border-border/60">
                        <span className="text-muted-foreground text-[10px] block">Currently with:</span>
                        <strong className="text-foreground">{currentPatient ? currentPatient.patientName : "No active patient"}</strong>
                        {currentPatient && <span className="font-mono text-primary ml-2">({currentPatient.token})</span>}
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-1">
                        <span>Waiting in queue: <strong>{nextInLine.length}</strong></span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[10px] text-primary p-0"
                          onClick={() => {
                            if (nextInLine[0]) updateStatus(nextInLine[0].token, "called");
                          }}
                        >
                          Call Next Token →
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm flex flex-col justify-between">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold">OPD Operational Guidelines</CardTitle>
                <CardDescription className="text-xs">Standard operating benchmarks</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-3 text-xs">
                <div className="p-2.5 rounded-lg border border-primary/20 bg-primary/5 space-y-1">
                  <strong className="text-primary block font-semibold">Token Turnaround SLA</strong>
                  <p className="text-muted-foreground text-[11px]">Target wait time from check-in to consultation is &lt; 20 minutes.</p>
                </div>
                <div className="p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 space-y-1">
                  <strong className="text-amber-700 dark:text-amber-300 block font-semibold">Vitals Capture</strong>
                  <p className="text-muted-foreground text-[11px]">All OPD arrivals above 40 years must have BP &amp; Pulse captured at triage.</p>
                </div>
              </CardContent>
              <div className="p-3 border-t border-border/80 text-center">
                <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setActiveTab("queue")}>
                  View Live Queue Board
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 2: TODAY'S QUEUE                                                      */}
        {/* ========================================================================= */}
        <TabsContent value="queue" className="space-y-4 mt-4">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">Today&apos;s Live OPD Queue</CardTitle>
                <CardDescription className="text-xs">Real-time consultation status, triage vitals &amp; tokens</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-48">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search token, patient, UHID..."
                    className="pl-8 h-8 text-xs"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                  <SelectTrigger className="h-8 text-xs w-36">
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
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Token</TableHead>
                    <TableHead>Patient Details</TableHead>
                    <TableHead>Doctor &amp; Room</TableHead>
                    <TableHead>Vitals</TableHead>
                    <TableHead>Complaint</TableHead>
                    <TableHead>Time &amp; Wait</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQueue.map((item) => (
                    <TableRow key={item.token}>
                      <TableCell className="font-mono font-bold text-primary text-sm">
                        {item.token}
                      </TableCell>
                      <TableCell>
                        <div>
                          <strong className="text-xs font-semibold text-foreground block">{item.patientName}</strong>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {item.uhid} • {item.age}y/{item.gender[0]}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <strong className="text-foreground block">{item.doctorName}</strong>
                          <span className="text-[10px] text-muted-foreground">{item.room} • {item.department}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-muted-foreground">
                        BP: {item.vitals.bp} | HR: {item.vitals.pulse}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">
                        {item.complaint}
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className="font-mono block">{item.time}</span>
                        <span className="text-[10px] text-amber-600 font-semibold">{item.waitTime}</span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs">
                            {item.status === "waiting" && (
                              <DropdownMenuItem onClick={() => updateStatus(item.token, "called")}>
                                📢 Call to Room
                              </DropdownMenuItem>
                            )}
                            {item.status === "called" && (
                              <DropdownMenuItem onClick={() => updateStatus(item.token, "in-consultation")}>
                                🩺 Start Consultation
                              </DropdownMenuItem>
                            )}
                            {item.status === "in-consultation" && (
                              <DropdownMenuItem onClick={() => updateStatus(item.token, "completed")}>
                                ✓ Mark Completed
                              </DropdownMenuItem>
                            )}
                            {item.status === "completed" && (
                              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                                ✓ Visit Completed (Archived)
                              </div>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 3: DOCTOR-WISE ROOMS                                                  */}
        {/* ========================================================================= */}
        <TabsContent value="rooms" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map((doc) => {
              const activePatient = queue.find((q) => q.doctorId === doc.id && q.status === "in-consultation");
              const waitingList = queue.filter((q) => q.doctorId === doc.id && q.status === "waiting");
              const calledPatient = queue.find((q) => q.doctorId === doc.id && q.status === "called");

              return (
                <Card key={doc.id} className="border-border bg-card shadow-sm flex flex-col justify-between">
                  <CardHeader className="p-4 pb-3 border-b border-border/80">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{getInitials(doc.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-sm font-bold">{doc.name}</CardTitle>
                          <CardDescription className="text-xs">{doc.department} • Room {doc.id.replace("doc_00", "10")}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {waitingList.length} Waiting
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3 text-xs flex-1">
                    {/* Active In-Consultation Box */}
                    <div className="p-2.5 rounded-lg border border-primary/30 bg-primary/5 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-primary block tracking-wider">
                        ● In Consultation Room
                      </span>
                      {activePatient ? (
                        <div>
                          <strong className="text-sm text-foreground block font-bold">{activePatient.patientName}</strong>
                          <span className="font-mono text-[11px] text-muted-foreground">Token {activePatient.token} • {activePatient.complaint}</span>
                        </div>
                      ) : (
                        <p className="text-muted-foreground italic text-[11px]">Room available • No active patient</p>
                      )}
                    </div>

                    {/* Next Called or Waiting */}
                    {calledPatient && (
                      <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-[11px]">
                        <span className="font-bold text-amber-700 dark:text-amber-300">Called:</span> {calledPatient.patientName} ({calledPatient.token})
                      </div>
                    )}

                    {/* Waiting List Preview */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Next in Line:</span>
                      {waitingList.length > 0 ? (
                        waitingList.slice(0, 3).map((w) => (
                          <div key={w.token} className="flex justify-between items-center p-1.5 rounded bg-muted/40 text-[11px]">
                            <span className="font-medium text-foreground">{w.patientName}</span>
                            <span className="font-mono text-primary font-bold">{w.token}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground italic text-[11px]">Queue clear</p>
                      )}
                    </div>
                  </CardContent>
                  <div className="p-3 border-t border-border/80 flex items-center gap-2">
                    <Button
                      size="sm"
                      className="w-full text-xs font-semibold"
                      disabled={Boolean(activePatient) || waitingList.length === 0}
                      onClick={() => {
                        if (activePatient) {
                          toast({
                            title: "Room Occupied",
                            description: `Dr. ${doc.name} is currently with ${activePatient.patientName}. Complete active visit before calling next patient.`,
                            variant: "destructive",
                          });
                          return;
                        }
                        if (waitingList[0]) updateStatus(waitingList[0].token, "in-consultation");
                      }}
                    >
                      {activePatient ? "Room Occupied" : waitingList.length === 0 ? "Queue Clear" : "Call Next Patient"}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 4: OPD HISTORY                                                        */}
        {/* ========================================================================= */}
        <TabsContent value="history" className="space-y-4 mt-4">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">Past OPD Consultations Log</CardTitle>
                <CardDescription className="text-xs">Archive of outpatient visits, diagnoses &amp; issued prescriptions</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={handleExportRegister}>
                <Download className="h-3.5 w-3.5" /> Export Register
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Visit ID &amp; Date</TableHead>
                    <TableHead>Patient Details</TableHead>
                    <TableHead>Doctor &amp; Department</TableHead>
                    <TableHead>Clinical Diagnosis</TableHead>
                    <TableHead>Prescription Summary</TableHead>
                    <TableHead className="text-right">Consultation Fee</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((h) => (
                    <TableRow key={h.visitId}>
                      <TableCell>
                        <strong className="font-mono text-xs text-foreground block">{h.visitId}</strong>
                        <span className="text-[10px] text-muted-foreground">{h.date}</span>
                      </TableCell>
                      <TableCell>
                        <strong className="text-xs font-semibold text-foreground block">{h.patientName}</strong>
                        <span className="font-mono text-[10px] text-muted-foreground">{h.uhid}</span>
                      </TableCell>
                      <TableCell className="text-xs">
                        <strong className="text-foreground block">{h.doctorName}</strong>
                        <span className="text-[10px] text-muted-foreground">{h.department}</span>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-foreground">
                        {h.diagnosis}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[220px] truncate">
                        {h.prescriptions}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-xs text-foreground">
                        ₹{h.fee}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
