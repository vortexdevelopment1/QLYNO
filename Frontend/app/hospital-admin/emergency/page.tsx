"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Siren,
  Ambulance as AmbulanceIcon,
  Clock,
  Filter,
  CheckCircle2,
  Settings,
  FileText,
  Plus,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  MapPin,
  Flame,
  Bed,
  Stethoscope,
  History,
  Activity,
  UserPlus,
  Users,
  Building2,
  Download,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/hospital-admin/components/ui/select";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/hospital-admin/components/ui/tabs";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { StatusBadge } from "@/hospital-admin/components/shared/status-badge";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { RootState } from "@/hospital-admin/store/store";
import {
  acknowledgeCase,
  markSlaBreached,
  triggerAlertSimulation,
  EmergencyCase,
} from "@/hospital-admin/store/slices/emergencySlice";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { cn, formatCurrency, getInitials } from "@/hospital-admin/lib/utils";

const SLA_LIMITS_MINUTES: Record<string, number> = { Critical: 5, High: 15, Medium: 30 };

function getSlaStatus(createdAt: string, status: string, priority: string) {
  const elapsedMinutes = (Date.now() - new Date(createdAt).getTime()) / 60000;
  const limit = SLA_LIMITS_MINUTES[priority] || 30;

  if (status !== "Hospital Notified" && status !== "SOS Created") {
    return { breached: false, timeRemaining: 0, text: "SLA Met / Acked" };
  }

  const remaining = limit - elapsedMinutes;
  return {
    breached: remaining < 0,
    timeRemaining: remaining,
    text:
      remaining < 0
        ? `Breached by ${Math.abs(Math.round(remaining))}m`
        : `${Math.max(1, Math.round(remaining))}m remaining`,
  };
}

// 12 Emergency Bays Matrix
const initialErBays = [
  { id: "BAY-01", type: "Resuscitation (Red)", status: "occupied", patient: "Rajesh Varma (Cardiac Arrest)", doctor: "Dr. K. N. Rao" },
  { id: "BAY-02", type: "Resuscitation (Red)", status: "occupied", patient: "Alok S. (Severe Polytrauma)", doctor: "Dr. Arvind Joshi" },
  { id: "BAY-03", type: "Trauma & Acute", status: "occupied", patient: "Siddharth Mehra (Fracture)", doctor: "Dr. Rohan Mehta" },
  { id: "BAY-04", type: "Trauma & Acute", status: "occupied", patient: "Vikram N. (Head Injury)", doctor: "Dr. Kavya Iyer" },
  { id: "BAY-05", type: "Trauma & Acute", status: "available", patient: "", doctor: "" },
  { id: "BAY-06", type: "Trauma & Acute", status: "cleaning", patient: "", doctor: "" },
  { id: "BAY-07", type: "Observation (Yellow)", status: "occupied", patient: "Fatima A. (Asthma Attack)", doctor: "Dr. Simran Kaur" },
  { id: "BAY-08", type: "Observation (Yellow)", status: "occupied", patient: "Harish M. (Chest Pain)", doctor: "Dr. Ananya Rao" },
  { id: "BAY-09", type: "Observation (Yellow)", status: "available", patient: "", doctor: "" },
  { id: "BAY-10", type: "Observation (Yellow)", status: "available", patient: "", doctor: "" },
  { id: "BAY-11", type: "Isolation Bay (Green)", status: "occupied", patient: "Dinesh P. (Fever / Rash)", doctor: "Dr. Simran Kaur" },
  { id: "BAY-12", type: "Isolation Bay (Green)", status: "available", patient: "", doctor: "" },
];

// ER Doctors & Trauma Roster
const initialErDoctors = [
  { id: "er_doc_1", name: "Dr. K. N. Rao", role: "Chief Emergency Medical Officer (EMO)", shift: "08:00 AM - 08:00 PM", status: "In Resuscitation", contact: "+91 98201 11223" },
  { id: "er_doc_2", name: "Dr. Arvind Joshi", role: "Consultant Trauma Surgeon", shift: "On-Call (10 min away)", status: "Active in ER", contact: "+91 98202 22334" },
  { id: "er_doc_3", name: "Dr. Sneha Roy", role: "Emergency Resident Physician", shift: "08:00 AM - 08:00 PM", status: "Available at Triage", contact: "+91 98203 33445" },
  { id: "er_doc_4", name: "Dr. Vikram Seth", role: "Interventional Cardiologist", shift: "On-Call Code STEMI", status: "Standby Alpha", contact: "+91 98204 44556" },
];

// Historical ER Dispositions
const initialErHistory = [
  { id: "EMG-2026-041", patientName: "Rohan Verma", age: 48, arrivalTime: "2026-08-14 06:30 AM", triage: "Priority 1 (Red)", complaint: "STEMI Anterior Wall", disposition: "Shifted to Cath Lab / ICU", doctor: "Dr. Vikram Seth" },
  { id: "EMG-2026-040", patientName: "Pooja Hegde", age: 31, arrivalTime: "2026-08-14 04:15 AM", triage: "Priority 2 (Yellow)", complaint: "Acute Appendicular Colic", disposition: "Shifted to Emergency OT", doctor: "Dr. Arvind Joshi" },
  { id: "EMG-2026-039", patientName: "Manoj Tiwari", age: 55, arrivalTime: "2026-08-13 11:20 PM", triage: "Priority 3 (Green)", complaint: "Laceration Suturing", disposition: "Discharged Post-Observation", doctor: "Dr. Sneha Roy" },
];

export default function EmergencyPage() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const cases = useSelector((state: RootState) => state.emergency.cases);
  const ambulances = useSelector((state: RootState) => state.ambulance.fleet);

  const [activeTab, setActiveTab] = useState("active-cases");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [erBays, setErBays] = useState(initialErBays);
  const [erDoctors] = useState(initialErDoctors);
  const [erHistory] = useState(initialErHistory);

  // Rapid Walk-In Emergency Modal State
  const [newEmergencyOpen, setNewEmergencyOpen] = useState(false);
  const [walkinName, setWalkinName] = useState("");
  const [walkinAge, setWalkinAge] = useState("45");
  const [walkinGender, setWalkinGender] = useState("Male");
  const [walkinPriority, setWalkinPriority] = useState<"Critical" | "High" | "Medium">("Critical");
  const [walkinComplaint, setWalkinComplaint] = useState("");
  const [walkinBay, setWalkinBay] = useState("BAY-05");
  const [walkinGcs, setWalkinGcs] = useState("15");

  const [ackModalOpen, setAckModalOpen] = useState(false);
  const [selectedCaseForAck, setSelectedCaseForAck] = useState<EmergencyCase | null>(null);

  const [, setTick] = useState(0);

  // Timer Tick
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 15000);
    return () => clearInterval(interval);
  }, []);

  // Check SLA Breaches
  useEffect(() => {
    cases.forEach((c) => {
      const sla = getSlaStatus(c.createdAt, c.status, c.priority);
      if (sla.breached && !c.slaBreached) {
        dispatch(markSlaBreached(c.id));
      }
    });
  }, [cases, dispatch]);

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      if (priorityFilter === "all") return true;
      return c.priority.toLowerCase() === priorityFilter.toLowerCase();
    });
  }, [cases, priorityFilter]);

  const criticalCases = cases.filter((c) => c.priority === "Critical" && c.status !== "Closed");

  const handleWalkinEmergencySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinName.trim()) {
      toast({ title: "Validation Error", description: "Patient name is required", variant: "destructive" });
      return;
    }

    const targetBay = erBays.find((b) => b.id === walkinBay);
    if (!targetBay || targetBay.status !== "available") {
      toast({
        title: "Bay Unavailable",
        description: `Bay ${walkinBay} is currently ${targetBay?.status || "occupied"}. Please select an available green bay.`,
        variant: "destructive",
      });
      return;
    }

    const newCase: EmergencyCase = {
      id: `SOS-${Math.floor(100 + Math.random() * 900)}`,
      patientName: walkinName.trim(),
      location: `Walk-in ER Arrival (${walkinBay})`,
      destinationHospital: "Qlyno Multispecialty Hospital",
      priority: walkinPriority,
      status: "Hospital Notified",
      deliveryState: "Pending Ack",
      flowType: "Flow A (Active Relationship)",
      createdAt: new Date().toISOString(),
      slaBreached: false,
      age: Number(walkinAge) || 45,
      gender: walkinGender,
      chiefComplaint: `${walkinComplaint.trim() || "Acute trauma/distress"} • GCS: ${walkinGcs}/15`,
    };

    dispatch(triggerAlertSimulation(newCase));

    // Occupy the bay
    setErBays((prev) =>
      prev.map((b) => (b.id === walkinBay ? { ...b, status: "occupied", patient: walkinName } : b))
    );

    setNewEmergencyOpen(false);
    setWalkinName("");
    setWalkinComplaint("");
    toast({
      title: "🚨 Emergency Patient Triage Enqueued",
      description: `${walkinName} admitted to ${walkinBay} as ${walkinPriority.toUpperCase()} priority.`,
    });
  };

  const handleAcknowledge = (c: EmergencyCase) => {
    dispatch(acknowledgeCase({ id: c.id, actor: "Hospital Admin • Emergency Desk" }));
    setAckModalOpen(false);
    toast({
      title: "Emergency Case Acknowledged",
      description: `Case ${c.id} received and dispatched to ER Clinical Lead.`,
    });
  };

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Emergency & Trauma Command Center"
        description="Live red-alert triage telemetry, trauma bay allocation, Code Blue readiness & critical patient queues."
        crumbs={[{ label: "Patient Care" }, { label: "Emergency Management" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/hospital-admin/emergency/audit">
                <FileText className="h-4 w-4 mr-1.5" /> Audit Log
              </Link>
            </Button>
            <Dialog open={newEmergencyOpen} onOpenChange={setNewEmergencyOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-destructive hover:bg-destructive/90 text-white font-bold gap-1.5 animate-pulse">
                  <Siren className="h-4 w-4" /> New Walk-In Emergency
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[540px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-destructive">
                    <Siren className="h-5 w-5" /> Rapid Walk-in Trauma &amp; Emergency Intake
                  </DialogTitle>
                  <DialogDescription>
                    Assign Manchester Triage classification, capture GCS and allocate ER Trauma Bay.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleWalkinEmergencySubmit} className="space-y-3.5 py-2">
                  <div className="space-y-1.5">
                    <Label>Patient Name</Label>
                    <Input
                      placeholder="e.g. Alok Sharma"
                      value={walkinName}
                      onChange={(e) => setWalkinName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Age</Label>
                      <Input
                        type="number"
                        value={walkinAge}
                        onChange={(e) => setWalkinAge(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Gender</Label>
                      <Select value={walkinGender} onValueChange={setWalkinGender}>
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

                  {/* Triage Level Selection */}
                  <div className="space-y-1.5">
                    <Label>Triage Priority Classification</Label>
                    <Select value={walkinPriority} onValueChange={(v: any) => setWalkinPriority(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Triage Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Critical" className="text-rose-600 font-bold">
                          🔴 Priority 1 (Red) — Resuscitation (Immediate)
                        </SelectItem>
                        <SelectItem value="High" className="text-amber-600 font-bold">
                          🟡 Priority 2 (Yellow) — Emergent (&lt; 15 mins)
                        </SelectItem>
                        <SelectItem value="Medium" className="text-emerald-600 font-bold">
                          🟢 Priority 3 (Green) — Urgent (&lt; 60 mins)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Glasgow Coma Scale (GCS)</Label>
                      <Select value={walkinGcs} onValueChange={setWalkinGcs}>
                        <SelectTrigger>
                          <SelectValue placeholder="GCS Score" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">GCS 15 (Fully Alert)</SelectItem>
                          <SelectItem value="13">GCS 13-14 (Mild Impairment)</SelectItem>
                          <SelectItem value="9">GCS 9-12 (Moderate Trauma)</SelectItem>
                          <SelectItem value="6">GCS 3-8 (Severe Coma / Intubate)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Allocate ER Bay</Label>
                      <Select value={walkinBay} onValueChange={setWalkinBay}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Bay" />
                        </SelectTrigger>
                        <SelectContent>
                          {erBays.map((b) => (
                            <SelectItem
                              key={b.id}
                              value={b.id}
                              disabled={b.status !== "available"}
                            >
                              {b.id} ({b.type}) — {b.status === "available" ? "AVAILABLE" : b.status.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Presenting Trauma / Chief Complaints</Label>
                    <Input
                      placeholder="e.g. Severe chest pain, crush injury, acute shortness of breath"
                      value={walkinComplaint}
                      onChange={(e) => setWalkinComplaint(e.target.value)}
                      required
                    />
                  </div>

                  <DialogFooter className="pt-2">
                    <Button type="button" variant="outline" onClick={() => setNewEmergencyOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-destructive hover:bg-destructive/90 text-white font-bold">
                      Admit to ER Bay &amp; Trigger Alert
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Main Tabs: Active Cases / Critical Patients / ER Beds / ER Doctors / History */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 max-w-3xl bg-muted/60 p-1">
          <TabsTrigger value="active-cases" className="text-xs font-semibold">
            <Flame className="h-3.5 w-3.5 mr-1.5 text-rose-500" /> Active Cases ({cases.length})
          </TabsTrigger>
          <TabsTrigger value="critical" className="text-xs font-semibold">
            <Siren className="h-3.5 w-3.5 mr-1.5 text-rose-600" /> Critical ({criticalCases.length})
          </TabsTrigger>
          <TabsTrigger value="beds" className="text-xs font-semibold">
            <Bed className="h-3.5 w-3.5 mr-1.5" /> ER Bays ({erBays.filter((b) => b.status === "occupied").length}/12)
          </TabsTrigger>
          <TabsTrigger value="doctors" className="text-xs font-semibold">
            <Stethoscope className="h-3.5 w-3.5 mr-1.5" /> ER Doctors ({erDoctors.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs font-semibold">
            <History className="h-3.5 w-3.5 mr-1.5" /> Dispositions
          </TabsTrigger>
        </TabsList>

        {/* ========================================================================= */}
        {/* TAB 1: ACTIVE CASES                                                       */}
        {/* ========================================================================= */}
        <TabsContent value="active-cases" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            {/* Triage Filter Pills */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground font-semibold uppercase text-[11px] mr-1">Triage Filter:</span>
              {(["all", "critical", "high", "medium"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriorityFilter(p)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium capitalize transition-colors",
                    priorityFilter === p
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted"
                  )}
                >
                  {p === "all" ? "All Priorities" : p}
                </button>
              ))}
            </div>
            <Badge variant="outline" className="text-xs font-mono font-bold">
              {filteredCases.length} Cases Listed
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredCases.map((c) => {
              const sla = getSlaStatus(c.createdAt, c.status, c.priority);

              return (
                <Card
                  key={c.id}
                  className={cn(
                    "border bg-card shadow-sm flex flex-col justify-between transition-all",
                    c.priority === "Critical" && "border-rose-500/40 bg-rose-500/5",
                    c.priority === "High" && "border-amber-500/40 bg-amber-500/5",
                    c.priority === "Medium" && "border-border"
                  )}
                >
                  <CardHeader className="p-4 pb-2.5 border-b border-border/60">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-sm font-bold text-foreground">{c.patientName}</CardTitle>
                        <span className="font-mono text-[10px] text-muted-foreground">{c.id}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-bold",
                          c.priority === "Critical" && "bg-rose-500/10 text-rose-600 border-rose-500/30",
                          c.priority === "High" && "bg-amber-500/10 text-amber-600 border-amber-500/30",
                          c.priority === "Medium" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                        )}
                      >
                        {c.priority} Priority
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2 text-xs flex-1">
                    <div>
                      <strong className="text-foreground block font-semibold">{c.chiefComplaint || "Acute trauma / emergency distress"}</strong>
                      <p className="text-muted-foreground text-[11px] flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" /> {c.location}
                      </p>
                    </div>

                    <div className="p-2 rounded bg-background/80 border border-border flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">SLA Countdown:</span>
                      <strong
                        className={cn(
                          "font-mono font-bold",
                          sla.breached ? "text-rose-600 animate-pulse" : "text-emerald-600"
                        )}
                      >
                        {sla.text}
                      </strong>
                    </div>
                  </CardContent>
                  <div className="p-3 border-t border-border/60 flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs flex-1"
                      onClick={() => {
                        setSelectedCaseForAck(c);
                        setAckModalOpen(true);
                      }}
                    >
                      Acknowledge
                    </Button>
                    <Button size="sm" className="h-7 text-xs flex-1 font-semibold" asChild>
                      <Link href={`/hospital-admin/emergency/${c.id}`}>View Console →</Link>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 2: CRITICAL PATIENTS (Priority 1 Red Resuscitation)                    */}
        {/* ========================================================================= */}
        <TabsContent value="critical" className="space-y-4 mt-4">
          <Card className="border-rose-500/40 bg-rose-500/5 shadow-sm">
            <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between border-b border-rose-500/20">
              <div>
                <CardTitle className="text-base font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                  <Siren className="h-5 w-5 animate-pulse" /> Resuscitation &amp; Priority 1 Critical Inpatients
                </CardTitle>
                <CardDescription className="text-xs">
                  Immediate trauma, cardiac arrest, intubated or severe polytrauma cases requiring emergency clinical lead
                </CardDescription>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="font-bold text-xs"
                onClick={() =>
                  toast({
                    title: "📢 Code Blue Broadcast Triggered",
                    description: "Trauma team and CPR responders notified via station sirens & pagers.",
                  })
                }
              >
                Broadcast Code Blue Alert
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {criticalCases.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-lg border border-rose-500/30 bg-card flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-bold text-foreground">{c.patientName}</strong>
                      <Badge variant="destructive" className="text-[10px]">Priority 1 Resus</Badge>
                    </div>
                    <p className="text-muted-foreground font-medium">{c.chiefComplaint || "Critical emergency case"}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">Location: {c.location} • Status: {c.status}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="h-7 text-xs text-rose-600" asChild>
                      <Link href={`/hospital-admin/emergency/${c.id}`}>Open Emergency Bay Console</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 3: EMERGENCY BAYS & TRAUMA BEDS                                       */}
        {/* ========================================================================= */}
        <TabsContent value="beds" className="space-y-4 mt-4">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">Emergency Department Trauma Bay Matrix</CardTitle>
                <CardDescription className="text-xs">12 Resuscitation, Trauma, Observation and Isolation ER Bays</CardDescription>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Occupied
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Available
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {erBays.map((bay) => (
                <div
                  key={bay.id}
                  className={cn(
                    "p-3 rounded-lg border text-xs space-y-1.5 transition-all",
                    bay.status === "occupied" && "bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200",
                    bay.status === "available" && "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200 hover:border-emerald-500 cursor-pointer",
                    bay.status === "cleaning" && "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200"
                  )}
                  onClick={() => {
                    if (bay.status === "available") {
                      setWalkinBay(bay.id);
                      setNewEmergencyOpen(true);
                    } else if (bay.status === "occupied") {
                      toast({
                        title: `${bay.id} is Occupied`,
                        description: `Occupied by ${bay.patient}. Select an available green bay for intake.`,
                        variant: "destructive",
                      });
                    } else {
                      toast({
                        title: `${bay.id} Under Terminal Cleaning`,
                        description: "Bay is currently undergoing sanitation. Cannot admit patient.",
                      });
                    }
                  }}
                >
                  <div className="flex justify-between items-center">
                    <strong className="font-mono font-bold text-sm">{bay.id}</strong>
                    <Badge variant="outline" className="text-[9px] py-0">{bay.status}</Badge>
                  </div>
                  <span className="text-[10px] text-muted-foreground block">{bay.type}</span>
                  <p className="font-semibold text-foreground text-[11px] truncate">
                    {bay.status === "occupied" ? bay.patient : bay.status === "available" ? "Click to Allocate" : "Sanitizing"}
                  </p>
                  {bay.doctor && <p className="text-[10px] text-muted-foreground">Attending: {bay.doctor}</p>}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 4: ER CLINICAL & NURSING TEAM                                         */}
        {/* ========================================================================= */}
        <TabsContent value="doctors" className="space-y-6 mt-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Attending Emergency Physicians &amp; Surgeons</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {erDoctors.map((doc) => (
                <Card key={doc.id} className="border-border bg-card shadow-sm p-4 space-y-2.5 text-xs">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{getInitials(doc.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <strong className="text-sm font-bold text-foreground block">{doc.name}</strong>
                      <span className="text-[11px] text-muted-foreground">{doc.role}</span>
                    </div>
                  </div>
                  <div className="space-y-1 pt-1 border-t border-border/60 text-[11px]">
                    <p className="text-muted-foreground">Shift: <strong>{doc.shift}</strong></p>
                    <p className="text-muted-foreground">Contact: <span className="font-mono">{doc.contact}</span></p>
                  </div>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold">
                    {doc.status}
                  </Badge>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Emergency Nursing Station On-Duty Roster</h3>
              <Button asChild size="sm" variant="ghost" className="h-6 text-xs text-primary font-semibold self-start sm:self-auto">
                <Link href="/hospital-admin/nurse-station">Manage Station in Nurse Module &rarr;</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {[
                { name: "Sister Anjali Desai", role: "Nurse Station Lead (Trauma Certified)", shift: "Morning (07:00-15:00)", status: "On Duty", contact: "+91 98206 66778", bays: "Bay 01 & 02 (Red Resuscitation)" },
                { name: "Nurse Vikram Nair", role: "Senior Triage Nurse (Manchester Specialist)", shift: "Morning (07:00-15:00)", status: "On Duty", contact: "+91 98207 77889", bays: "Bay 03 - 06 (Trauma & Acute)" },
                { name: "Nurse Pooja Sharma", role: "Emergency Staff Nurse (BLS/ACLS)", shift: "Morning (07:00-15:00)", status: "On Duty", contact: "+91 98208 88990", bays: "Bay 07 - 12 (Observation Yellow)" },
              ].map((n) => (
                <Card key={n.name} className="border-border bg-card shadow-sm p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <strong className="text-sm font-bold text-foreground">{n.name}</strong>
                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px]">{n.status}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{n.role}</p>
                  <div className="pt-2 border-t border-border/60 text-[11px] space-y-0.5">
                    <p className="text-muted-foreground">Assigned Area: <strong className="text-foreground">{n.bays}</strong></p>
                    <p className="text-muted-foreground">Shift: <span>{n.shift}</span></p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 5: ER DISPOSITIONS & HISTORY                                          */}
        {/* ========================================================================= */}
        <TabsContent value="history" className="space-y-4 mt-4">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">Emergency Dispositions History</CardTitle>
                <CardDescription className="text-xs">Past emergency arrivals, triage classifications &amp; hospital outcomes</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                <Download className="h-3.5 w-3.5" /> Export ER Register
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case ID &amp; Time</TableHead>
                    <TableHead>Patient Details</TableHead>
                    <TableHead>Triage Level</TableHead>
                    <TableHead>Emergency Complaint</TableHead>
                    <TableHead>Final Disposition</TableHead>
                    <TableHead className="text-right">Attending Physician</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {erHistory.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell>
                        <strong className="font-mono text-xs text-foreground block">{h.id}</strong>
                        <span className="text-[10px] text-muted-foreground">{h.arrivalTime}</span>
                      </TableCell>
                      <TableCell>
                        <strong className="text-xs font-semibold text-foreground block">{h.patientName}</strong>
                        <span className="text-[10px] text-muted-foreground">{h.age} years old</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-bold",
                            h.triage.includes("Red") && "bg-rose-500/10 text-rose-600 border-rose-500/30",
                            h.triage.includes("Yellow") && "bg-amber-500/10 text-amber-600 border-amber-500/30",
                            h.triage.includes("Green") && "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                          )}
                        >
                          {h.triage}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-foreground max-w-[200px] truncate">
                        {h.complaint}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-primary">
                        {h.disposition}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {h.doctor}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ACKNOWLEDGE MODAL */}
      <Dialog open={ackModalOpen} onOpenChange={setAckModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Acknowledge Emergency Receipt
            </DialogTitle>
            <DialogDescription>
              Confirms administrative receipt of alert and notifies trauma lead.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-sm">
            <div className="p-3 bg-muted/40 rounded-lg border border-border space-y-1">
              <p className="font-semibold text-foreground">Case: {selectedCaseForAck?.id} • {selectedCaseForAck?.patientName}</p>
              <p className="text-xs text-muted-foreground">{selectedCaseForAck?.location}</p>
              <p className="text-xs text-muted-foreground">Priority: {selectedCaseForAck?.priority}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAckModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => selectedCaseForAck && handleAcknowledge(selectedCaseForAck)}>
              Confirm Receipt &amp; Stop SLA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
