"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowRightLeft,
  Bed,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileCheck,
  FileText,
  HeartPulse,
  History,
  MoreHorizontal,
  Plus,
  Printer,
  Search,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  UserPlus,
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
import { cn, formatCurrency, getInitials } from "@/hospital-admin/lib/utils";

// Initial Current Inpatients Census Data
const initialInpatients = [
  {
    ipdId: "IPD-2026-0842",
    uhid: "QLY-PAT-2024-00841",
    patientName: "Aarav Shah",
    age: 42,
    gender: "Male",
    ward: "ICU",
    bedNumber: "ICU-04",
    attendingDoctor: "Dr. Vikram Seth",
    department: "Cardiology",
    admitDate: "2026-08-10",
    los: 4,
    diagnosis: "Acute Coronary Syndrome (NSTEMI) Post-PCI",
    diet: "Low Sodium Cardiac Diet",
    deposit: 50000,
    status: "Stable (Step-down Due)",
    vitals: { bp: "124/78", pulse: 72, temp: "98.4°F", spo2: "98%" },
  },
  {
    ipdId: "IPD-2026-0851",
    uhid: "QLY-PAT-2023-00412",
    patientName: "Meera Nambiar",
    age: 29,
    gender: "Female",
    ward: "Maternity Ward",
    bedNumber: "MAT-08",
    attendingDoctor: "Dr. Neha Kulkarni",
    department: "Gynecology",
    admitDate: "2026-08-12",
    los: 2,
    diagnosis: "Elective Lower Segment Caesarean Section (LSCS)",
    diet: "Normal Post-Op Diet",
    deposit: 40000,
    status: "Recovering",
    vitals: { bp: "116/74", pulse: 76, temp: "98.6°F", spo2: "99%" },
  },
  {
    ipdId: "IPD-2026-0839",
    uhid: "QLY-PAT-2024-01190",
    patientName: "Kabir Malhotra",
    age: 51,
    gender: "Male",
    ward: "Deluxe Suite",
    bedNumber: "DLX-201",
    attendingDoctor: "Dr. Arvind Joshi",
    department: "Orthopedics",
    admitDate: "2026-08-08",
    los: 6,
    diagnosis: "Right Total Knee Arthroplasty (TKA)",
    diet: "High Protein Diabetic Diet",
    deposit: 120000,
    status: "Discharge Scheduled",
    vitals: { bp: "130/82", pulse: 70, temp: "98.2°F", spo2: "98%" },
  },
  {
    ipdId: "IPD-2026-0860",
    uhid: "QLY-PAT-2025-02241",
    patientName: "Devansh Pandey",
    age: 64,
    gender: "Male",
    ward: "General Ward B",
    bedNumber: "GWB-14",
    attendingDoctor: "Dr. Simran Kaur",
    department: "General Medicine",
    admitDate: "2026-08-13",
    los: 1,
    diagnosis: "Community Acquired Pneumonia with Hypoxia",
    diet: "Soft Diabetic Diet",
    deposit: 25000,
    status: "Under Observation",
    vitals: { bp: "138/86", pulse: 84, temp: "99.4°F", spo2: "95%" },
  },
];

// Initial Ward & Bed Matrix Data
const initialWards = [
  {
    name: "ICU & Critical Care",
    totalBeds: 12,
    occupiedBeds: 10,
    beds: [
      { id: "ICU-01", status: "occupied", patient: "Rohan Verma" },
      { id: "ICU-02", status: "occupied", patient: "Sunita Rao" },
      { id: "ICU-03", status: "occupied", patient: "Deepak Mehta" },
      { id: "ICU-04", status: "occupied", patient: "Aarav Shah" },
      { id: "ICU-05", status: "cleaning", patient: "" },
      { id: "ICU-06", status: "occupied", patient: "Gaurav Bhatt" },
      { id: "ICU-07", status: "available", patient: "" },
      { id: "ICU-08", status: "occupied", patient: "Anita Desai" },
      { id: "ICU-09", status: "occupied", patient: "Rajesh Varma" },
      { id: "ICU-10", status: "occupied", patient: "Smita Patil" },
      { id: "ICU-11", status: "occupied", patient: "Karan S." },
      { id: "ICU-12", status: "available", patient: "" },
    ],
  },
  {
    name: "General Ward A (Male)",
    totalBeds: 16,
    occupiedBeds: 13,
    beds: [
      { id: "GWA-01", status: "occupied", patient: "Prakash J." },
      { id: "GWA-02", status: "occupied", patient: "Manoj T." },
      { id: "GWA-03", status: "available", patient: "" },
      { id: "GWA-04", status: "occupied", patient: "Suresh K." },
      { id: "GWA-05", status: "occupied", patient: "Vikram N." },
      { id: "GWA-06", status: "occupied", patient: "Alok R." },
      { id: "GWA-07", status: "available", patient: "" },
      { id: "GWA-08", status: "occupied", patient: "Harish M." },
      { id: "GWA-09", status: "cleaning", patient: "" },
      { id: "GWA-10", status: "occupied", patient: "Dinesh S." },
      { id: "GWA-11", status: "occupied", patient: "Anil P." },
      { id: "GWA-12", status: "occupied", patient: "Naveen G." },
      { id: "GWA-13", status: "occupied", patient: "Rajiv K." },
      { id: "GWA-14", status: "occupied", patient: "Bipin D." },
      { id: "GWA-15", status: "occupied", patient: "Sachin T." },
      { id: "GWA-16", status: "available", patient: "" },
    ],
  },
  {
    name: "Deluxe Private Suites",
    totalBeds: 8,
    occupiedBeds: 5,
    beds: [
      { id: "DLX-201", status: "occupied", patient: "Kabir Malhotra" },
      { id: "DLX-202", status: "occupied", patient: "Ramesh C." },
      { id: "DLX-203", status: "available", patient: "" },
      { id: "DLX-204", status: "occupied", patient: "Pooja Hegde" },
      { id: "DLX-205", status: "cleaning", patient: "" },
      { id: "DLX-206", status: "occupied", patient: "Sonia G." },
      { id: "DLX-207", status: "occupied", patient: "Kavita Patil" },
      { id: "DLX-208", status: "available", patient: "" },
    ],
  },
  {
    name: "Maternity & NICU",
    totalBeds: 10,
    occupiedBeds: 8,
    beds: [
      { id: "MAT-01", status: "occupied", patient: "Sneha R." },
      { id: "MAT-02", status: "occupied", patient: "Divya N." },
      { id: "MAT-03", status: "occupied", patient: "Ananya S." },
      { id: "MAT-04", status: "available", patient: "" },
      { id: "MAT-05", status: "occupied", patient: "Fatima A." },
      { id: "MAT-06", status: "occupied", patient: "Ritu B." },
      { id: "MAT-07", status: "occupied", patient: "Swati M." },
      { id: "MAT-08", status: "occupied", patient: "Meera Nambiar" },
      { id: "MAT-09", status: "cleaning", patient: "" },
      { id: "MAT-10", status: "available", patient: "" },
    ],
  },
];

// Historical Inpatient Records
const initialIpdHistory = [
  {
    ipdId: "IPD-2026-0798",
    uhid: "QLY-PAT-2023-00122",
    patientName: "Karan Singhania",
    admitDate: "2026-08-01",
    dischargeDate: "2026-08-06",
    los: 5,
    doctorName: "Dr. Vikram Seth",
    ward: "Semi-Private",
    diagnosis: "Coronary Angioplasty",
    outcome: "Discharged Recovered",
    totalBill: 185000,
  },
  {
    ipdId: "IPD-2026-0805",
    uhid: "QLY-PAT-2024-00431",
    patientName: "Divya Nair",
    admitDate: "2026-08-03",
    dischargeDate: "2026-08-07",
    los: 4,
    doctorName: "Dr. Neha Kulkarni",
    ward: "Deluxe Suite",
    diagnosis: "Laparoscopic Ovarian Cystectomy",
    outcome: "Discharged Recovered",
    totalBill: 95000,
  },
  {
    ipdId: "IPD-2026-0812",
    uhid: "QLY-PAT-2022-00892",
    patientName: "Rajesh Varma",
    admitDate: "2026-08-04",
    dischargeDate: "2026-08-09",
    los: 5,
    doctorName: "Dr. Kavya Iyer",
    ward: "ICU",
    diagnosis: "Ischemic Stroke",
    outcome: "Discharged Stable",
    totalBill: 245000,
  },
];

export default function IPDPage() {
  const { toast } = useToast();
  const [inpatients, setInpatients] = useState(initialInpatients);
  const [wards, setWards] = useState(initialWards);
  const [history, setHistory] = useState(initialIpdHistory);
  const [search, setSearch] = useState("");
  const [wardFilter, setWardFilter] = useState("all");

  // Admission Modal State
  const [admitOpen, setAdmitOpen] = useState(false);
  const [admitName, setAdmitName] = useState("");
  const [admitAge, setAdmitAge] = useState("45");
  const [admitGender, setAdmitGender] = useState("Male");
  const [admitDoctor, setAdmitDoctor] = useState("Dr. Vikram Seth");
  const [admitWard, setAdmitWard] = useState("General Ward A (Male)");
  const [admitBed, setAdmitBed] = useState("GWA-03");
  const [admitDiagnosis, setAdmitDiagnosis] = useState("");
  const [admitDeposit, setAdmitDeposit] = useState("25000");

  // Transfer Modal State
  const [transferOpen, setTransferOpen] = useState(false);
  const [selectedPatientForTransfer, setSelectedPatientForTransfer] = useState<any>(null);
  const [targetWard, setTargetWard] = useState("Deluxe Private Suites");
  const [targetBed, setTargetBed] = useState("DLX-203");
  const [transferReason, setTransferReason] = useState("Patient requested upgraded room");

  // Discharge Summary Modal State
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [selectedPatientForSummary, setSelectedPatientForSummary] = useState<any>(null);

  const filteredPatients = inpatients.filter((p) => {
    const matchesSearch =
      p.patientName.toLowerCase().includes(search.toLowerCase()) ||
      p.uhid.toLowerCase().includes(search.toLowerCase()) ||
      p.ipdId.toLowerCase().includes(search.toLowerCase()) ||
      p.bedNumber.toLowerCase().includes(search.toLowerCase());
    const matchesWard = wardFilter === "all" || p.ward === wardFilter;
    return matchesSearch && matchesWard;
  });

  const handleAdmitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!admitName.trim()) {
      toast({ title: "Validation Error", description: "Patient name is required", variant: "destructive" });
      return;
    }

    const nextId = `IPD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newInpatient = {
      ipdId: nextId,
      uhid: `QLY-PAT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: admitName.trim(),
      age: Number(admitAge) || 40,
      gender: admitGender,
      ward: admitWard,
      bedNumber: admitBed,
      attendingDoctor: admitDoctor,
      department: "Internal Medicine",
      admitDate: new Date().toISOString().split("T")[0],
      los: 0,
      diagnosis: admitDiagnosis.trim() || "Acute Admission",
      diet: "Normal Diet",
      deposit: Number(admitDeposit) || 25000,
      status: "Admitted",
      vitals: { bp: "120/80", pulse: 74, temp: "98.6°F", spo2: "98%" },
    };

    setInpatients([newInpatient, ...inpatients]);
    setAdmitOpen(false);
    setAdmitName("");
    setAdmitDiagnosis("");
    toast({
      title: "Inpatient Admitted Successfully",
      description: `${newInpatient.patientName} admitted to ${newInpatient.ward} (${newInpatient.bedNumber}) under ${newInpatient.attendingDoctor}.`,
    });
  };

  const handleTransferSubmit = () => {
    if (!selectedPatientForTransfer) return;

    if (!targetWard || !targetBed.trim() || !transferReason.trim()) {
      toast({
        title: "Transfer Incomplete",
        description: "Destination ward, new bed number, and transfer reason are required to transfer an inpatient.",
        variant: "destructive",
      });
      return;
    }

    setInpatients((prev) =>
      prev.map((p) => {
        if (p.ipdId === selectedPatientForTransfer.ipdId) {
          return { ...p, ward: targetWard, bedNumber: targetBed.trim(), status: `Transferred to ${targetBed.trim()}` };
        }
        return p;
      })
    );

    setTransferOpen(false);
    toast({
      title: "Patient Transferred Successfully",
      description: `${selectedPatientForTransfer.patientName} shifted to ${targetWard} (${targetBed}). Reason: ${transferReason}.`,
    });
  };

  const handleExportIpdRegister = () => {
    const csvRows = [
      ["IPD ID", "UHID", "Patient Name", "Admit Date", "Discharge Date", "LOS (Days)", "Doctor", "Ward", "Diagnosis", "Outcome", "Settled Bill"],
      ...history.map((h) => [
        h.ipdId,
        h.uhid,
        `"${h.patientName}"`,
        h.admitDate,
        h.dischargeDate,
        h.los,
        `"${h.doctorName}"`,
        `"${h.ward}"`,
        `"${h.diagnosis}"`,
        `"${h.outcome}"`,
        h.totalBill,
      ]),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ipd_history_register_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "IPD Register Exported",
      description: "Downloaded CSV report of past inpatient discharge records.",
    });
  };

  const handleDischarge = (patient: any) => {
    setInpatients((prev) => prev.filter((p) => p.ipdId !== patient.ipdId));
    const historyEntry = {
      ipdId: patient.ipdId,
      uhid: patient.uhid,
      patientName: patient.patientName,
      admitDate: patient.admitDate,
      dischargeDate: new Date().toISOString().split("T")[0],
      los: Math.max(1, patient.los),
      doctorName: patient.attendingDoctor,
      ward: patient.ward,
      diagnosis: patient.diagnosis,
      outcome: "Discharged Recovered",
      totalBill: patient.deposit + 35000,
    };
    setHistory([historyEntry, ...history]);
    toast({
      title: "Patient Discharged Successfully",
      description: `${patient.patientName} clearance complete. Shifted to IPD history register.`,
    });
  };

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Inpatient Department (IPD) Management"
        description="Inpatient admissions, ward & bed allocation matrix, inter-ward transfers, and clinical discharge summaries."
        crumbs={[{ label: "Patient Care" }, { label: "IPD" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/hospital-admin/wards-beds">
                <Bed className="h-4 w-4 mr-1.5" /> Wards &amp; Beds
              </Link>
            </Button>
            <Dialog open={admitOpen} onOpenChange={setAdmitOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="font-semibold gap-1.5">
                  <UserPlus className="h-4 w-4" /> New Admission
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[540px]">
                <DialogHeader>
                  <DialogTitle>New Inpatient Admission Intake</DialogTitle>
                  <DialogDescription>
                    Assign ward, allocate bed, record provisional diagnosis and initial deposit.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAdmitSubmit} className="space-y-3.5 py-2">
                  <div className="space-y-1.5">
                    <Label>Patient Full Name</Label>
                    <Input
                      placeholder="e.g. Sumanth Narang"
                      value={admitName}
                      onChange={(e) => setAdmitName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Age</Label>
                      <Input
                        type="number"
                        value={admitAge}
                        onChange={(e) => setAdmitAge(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Gender</Label>
                      <Select value={admitGender} onValueChange={setAdmitGender}>
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
                    <Label>Attending Physician</Label>
                    <Select value={admitDoctor} onValueChange={setAdmitDoctor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((d) => (
                          <SelectItem key={d.id} value={d.name}>
                            {d.name} ({d.department})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Ward Category</Label>
                      <Select value={admitWard} onValueChange={setAdmitWard}>
                        <SelectTrigger>
                          <SelectValue placeholder="Ward" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ICU">ICU &amp; Critical Care</SelectItem>
                          <SelectItem value="General Ward A (Male)">General Ward A (Male)</SelectItem>
                          <SelectItem value="General Ward B (Female)">General Ward B (Female)</SelectItem>
                          <SelectItem value="Deluxe Private Suites">Deluxe Private Suites</SelectItem>
                          <SelectItem value="Maternity &amp; NICU">Maternity &amp; NICU</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Bed Allocation</Label>
                      <Input
                        placeholder="e.g. GWA-03, ICU-07"
                        value={admitBed}
                        onChange={(e) => setAdmitBed(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Provisional Diagnosis &amp; Admitting Reason</Label>
                    <Input
                      placeholder="e.g. Acute appendicitis, COPD exacerbation"
                      value={admitDiagnosis}
                      onChange={(e) => setAdmitDiagnosis(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Initial Admission Deposit (₹)</Label>
                    <Input
                      type="number"
                      value={admitDeposit}
                      onChange={(e) => setAdmitDeposit(e.target.value)}
                    />
                  </div>
                  <DialogFooter className="pt-2">
                    <Button type="button" variant="outline" onClick={() => setAdmitOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Confirm Admission &amp; Allocate Bed</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Main Tabs: Inpatient Census / Ward Matrix / Discharge Summary / IPD History */}
      <Tabs defaultValue="census" className="w-full">
        <TabsList className="grid grid-cols-4 max-w-2xl bg-muted/60 p-1">
          <TabsTrigger value="census" className="text-xs font-semibold">
            <Users className="h-3.5 w-3.5 mr-1.5" /> Current Patients ({inpatients.length})
          </TabsTrigger>
          <TabsTrigger value="beds" className="text-xs font-semibold">
            <Bed className="h-3.5 w-3.5 mr-1.5" /> Ward &amp; Bed Allocation
          </TabsTrigger>
          <TabsTrigger value="discharge" className="text-xs font-semibold">
            <FileCheck className="h-3.5 w-3.5 mr-1.5" /> Discharge Clearances
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs font-semibold">
            <History className="h-3.5 w-3.5 mr-1.5" /> IPD History
          </TabsTrigger>
        </TabsList>

        {/* ========================================================================= */}
        {/* TAB 1: CURRENT INPATIENT CENSUS                                           */}
        {/* ========================================================================= */}
        <TabsContent value="census" className="space-y-4 mt-4">
          {/* Top KPI ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <Card className="p-4 border-border bg-card shadow-sm">
              <p className="text-xs text-muted-foreground font-medium">Total Inpatients Admitted</p>
              <p className="text-2xl font-bold font-mono text-foreground mt-1">36 Patients</p>
              <span className="text-[11px] font-semibold text-emerald-600">84% Occupancy</span>
            </Card>
            <Card className="p-4 border-border bg-card shadow-sm">
              <p className="text-xs text-muted-foreground font-medium">ICU / Critical Care</p>
              <p className="text-2xl font-bold font-mono text-rose-600 mt-1">10 / 12 Beds</p>
              <span className="text-[11px] font-semibold text-rose-600">High Occupancy</span>
            </Card>
            <Card className="p-4 border-border bg-card shadow-sm">
              <p className="text-xs text-muted-foreground font-medium">Discharges Planned Today</p>
              <p className="text-2xl font-bold font-mono text-amber-600 mt-1">6 Patients</p>
              <span className="text-[11px] font-semibold text-muted-foreground">Clearance pending</span>
            </Card>
            <Card className="p-4 border-border bg-card shadow-sm">
              <p className="text-xs text-muted-foreground font-medium">Avg Length of Stay (ALOS)</p>
              <p className="text-2xl font-bold font-mono text-foreground mt-1">4.2 Days</p>
              <span className="text-[11px] font-semibold text-emerald-600">Within NABH standard</span>
            </Card>
          </div>

          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">Active Inpatient Census Register</CardTitle>
                <CardDescription className="text-xs">Live ward occupancy, clinical diagnoses, LOS &amp; vitals</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-48">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search patient, bed, diagnosis..."
                    className="pl-8 h-8 text-xs"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select value={wardFilter} onValueChange={setWardFilter}>
                  <SelectTrigger className="h-8 text-xs w-36">
                    <SelectValue placeholder="All Wards" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Wards</SelectItem>
                    <SelectItem value="ICU">ICU</SelectItem>
                    <SelectItem value="Maternity Ward">Maternity</SelectItem>
                    <SelectItem value="Deluxe Suite">Deluxe Suite</SelectItem>
                    <SelectItem value="General Ward B">General Ward</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IPD ID &amp; UHID</TableHead>
                    <TableHead>Patient Details</TableHead>
                    <TableHead>Ward &amp; Bed</TableHead>
                    <TableHead>Attending Doctor</TableHead>
                    <TableHead>Clinical Diagnosis</TableHead>
                    <TableHead>LOS (Days)</TableHead>
                    <TableHead>Status &amp; Vitals</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((p) => (
                    <TableRow key={p.ipdId}>
                      <TableCell>
                        <strong className="font-mono text-xs text-primary block">{p.ipdId}</strong>
                        <span className="text-[10px] font-mono text-muted-foreground">{p.uhid}</span>
                      </TableCell>
                      <TableCell>
                        <strong className="text-xs font-semibold text-foreground block">{p.patientName}</strong>
                        <span className="text-[10px] text-muted-foreground">{p.age}y / {p.gender}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs font-mono font-bold bg-muted/40">
                          {p.bedNumber}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground block mt-0.5">{p.ward}</span>
                      </TableCell>
                      <TableCell className="text-xs">
                        <strong className="text-foreground block">{p.attendingDoctor}</strong>
                        <span className="text-[10px] text-muted-foreground">{p.department}</span>
                      </TableCell>
                      <TableCell className="text-xs text-foreground max-w-[200px] truncate">
                        {p.diagnosis}
                      </TableCell>
                      <TableCell className="font-mono font-bold text-xs">
                        {p.los} d
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className="text-emerald-700 dark:text-emerald-300 font-semibold block">{p.status}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">BP: {p.vitals.bp} | {p.vitals.spo2}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPatientForTransfer(p);
                                setTransferOpen(true);
                              }}
                            >
                              <ArrowRightLeft className="h-3.5 w-3.5 mr-1.5" /> Transfer Bed / Ward
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPatientForSummary(p);
                                setSummaryOpen(true);
                              }}
                            >
                              <FileText className="h-3.5 w-3.5 mr-1.5" /> Discharge Summary
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDischarge(p)} className="text-rose-600 font-semibold">
                              ✓ Final Discharge Clearance
                            </DropdownMenuItem>
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
        {/* TAB 2: WARD & BED ALLOCATION MATRIX                                       */}
        {/* ========================================================================= */}
        <TabsContent value="beds" className="space-y-4 mt-4">
          <div className="space-y-4">
            {wards.map((w) => (
              <Card key={w.name} className="border-border bg-card shadow-sm">
                <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between border-b border-border/80">
                  <div>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" /> {w.name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {w.occupiedBeds} of {w.totalBeds} Beds Occupied (
                      {Math.round((w.occupiedBeds / w.totalBeds) * 100)}% utilization)
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Occupied
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Available
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Sanitizing
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
                  {w.beds.map((b) => (
                    <div
                      key={b.id}
                      className={cn(
                        "p-2.5 rounded-lg border text-center text-xs space-y-1 transition-all",
                        b.status === "occupied" && "bg-blue-500/10 border-blue-500/30 text-blue-950 dark:text-blue-200",
                        b.status === "available" && "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200 hover:border-emerald-500 cursor-pointer",
                        b.status === "cleaning" && "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200"
                      )}
                      onClick={() => {
                        if (b.status === "available") {
                          setAdmitWard(w.name);
                          setAdmitBed(b.id);
                          setAdmitOpen(true);
                        } else if (b.status === "occupied") {
                          toast({
                            title: `Bed ${b.id} is Occupied`,
                            description: `Currently occupied by ${b.patient}. Select an available green bed.`,
                            variant: "destructive",
                          });
                        } else {
                          toast({
                            title: `Bed ${b.id} is Sanitizing`,
                            description: "Bed is undergoing terminal sanitization. Cannot admit patient.",
                          });
                        }
                      }}
                    >
                      <span className="font-mono font-bold block text-[11px]">{b.id}</span>
                      <strong className="text-[10px] block truncate">
                        {b.status === "occupied" ? b.patient : b.status === "available" ? "Click to Admit" : "Sanitizing"}
                      </strong>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 3: DISCHARGE CLEARANCE DESK                                           */}
        {/* ========================================================================= */}
        <TabsContent value="discharge" className="space-y-4 mt-4">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-sm font-bold">Inpatient Multi-Step Discharge Checklist</CardTitle>
              <CardDescription className="text-xs">
                Ensure pharmacy clearance, physician summary, nursing handover &amp; financial settlement
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Details</TableHead>
                    <TableHead>Bed &amp; Ward</TableHead>
                    <TableHead>Pharmacy Clearance</TableHead>
                    <TableHead>Clinical Summary</TableHead>
                    <TableHead>Billing Settlement</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inpatients.map((p) => (
                    <TableRow key={p.ipdId}>
                      <TableCell>
                        <strong className="text-xs font-semibold text-foreground block">{p.patientName}</strong>
                        <span className="font-mono text-[10px] text-muted-foreground">{p.ipdId}</span>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {p.bedNumber} ({p.ward})
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 text-[10px]">
                          ✓ Cleared
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-700 text-[10px]">
                          ✓ Doctor Signed
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 text-[10px]">
                          ✓ Deposit Settled
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          className="h-7 text-xs font-semibold"
                          onClick={() => handleDischarge(p)}
                        >
                          Complete Discharge
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
        {/* TAB 4: IPD HISTORY                                                        */}
        {/* ========================================================================= */}
        <TabsContent value="history" className="space-y-4 mt-4">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">Historical Inpatient Admissions Archive</CardTitle>
                <CardDescription className="text-xs">Past discharges, lengths of stay &amp; final hospitalization outcomes</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={handleExportIpdRegister}>
                <Download className="h-3.5 w-3.5" /> Export Register
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IPD No. &amp; UHID</TableHead>
                    <TableHead>Patient Details</TableHead>
                    <TableHead>Admit / Discharge Dates</TableHead>
                    <TableHead>Attending Doctor</TableHead>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead className="text-right">Total Billed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((h) => (
                    <TableRow key={h.ipdId}>
                      <TableCell>
                        <strong className="font-mono text-xs text-foreground block">{h.ipdId}</strong>
                        <span className="text-[10px] font-mono text-muted-foreground">{h.uhid}</span>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-foreground">
                        {h.patientName}
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className="font-mono block">{h.admitDate} ➔ {h.dischargeDate}</span>
                        <span className="text-[10px] text-muted-foreground">{h.los} Days Total</span>
                      </TableCell>
                      <TableCell className="text-xs text-foreground">
                        {h.doctorName}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {h.diagnosis}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 text-[10px]">
                          {h.outcome}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-xs text-foreground">
                        {formatCurrency(h.totalBill)}
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
      {/* MODAL: INTER-WARD / BED TRANSFER                                          */}
      {/* ========================================================================= */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Transfer Inpatient Bed / Ward</DialogTitle>
            <DialogDescription>
              Shift patient to another bed or ward category with reason logging.
            </DialogDescription>
          </DialogHeader>
          {selectedPatientForTransfer && (
            <div className="space-y-3.5 py-2">
              <div className="p-2.5 rounded bg-muted/40 text-xs">
                <p>
                  Patient: <strong>{selectedPatientForTransfer.patientName}</strong> ({selectedPatientForTransfer.ipdId})
                </p>
                <p className="text-muted-foreground">
                  Current Location: {selectedPatientForTransfer.ward} ({selectedPatientForTransfer.bedNumber})
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Destination Ward</Label>
                <Select value={targetWard} onValueChange={setTargetWard}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Destination Ward" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ICU & Critical Care">ICU &amp; Critical Care</SelectItem>
                    <SelectItem value="General Ward A (Male)">General Ward A (Male)</SelectItem>
                    <SelectItem value="Deluxe Private Suites">Deluxe Private Suites</SelectItem>
                    <SelectItem value="Maternity & NICU">Maternity &amp; NICU</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Destination Bed Number</Label>
                <Input
                  value={targetBed}
                  onChange={(e) => setTargetBed(e.target.value)}
                  placeholder="e.g. DLX-203, ICU-07"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Reason for Transfer</Label>
                <Input
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder="e.g. Step-down from ICU, Deluxe room upgrade"
                  required
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTransferSubmit}>Confirm Patient Transfer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: PRINTABLE DISCHARGE SUMMARY                                        */}
      {/* ========================================================================= */}
      <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Clinical Discharge Summary</DialogTitle>
            <DialogDescription>
              Hospitalization summary report, discharge advice &amp; review instructions.
            </DialogDescription>
          </DialogHeader>
          {selectedPatientForSummary && (
            <div className="p-4 border border-border rounded-lg bg-card space-y-4 text-xs">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-border pb-3">
                <div>
                  <h3 className="font-bold text-sm text-foreground">QLYNO MULTISPECIALTY HOSPITAL</h3>
                  <p className="text-muted-foreground text-[10px]">Department of Inpatient Clinical Services</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {selectedPatientForSummary.ipdId}
                  </Badge>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Date: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Patient Demographics */}
              <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded bg-muted/20 border border-border/60">
                <div>
                  <span className="text-muted-foreground">Patient:</span> <strong>{selectedPatientForSummary.patientName}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">UHID:</span> <span className="font-mono">{selectedPatientForSummary.uhid}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Admit Date:</span> {selectedPatientForSummary.admitDate}
                </div>
                <div>
                  <span className="text-muted-foreground">Attending:</span> <strong>{selectedPatientForSummary.attendingDoctor}</strong>
                </div>
              </div>

              {/* Clinical Details */}
              <div className="space-y-2">
                <div>
                  <strong className="text-foreground block">Final Diagnosis:</strong>
                  <p className="text-muted-foreground">{selectedPatientForSummary.diagnosis}</p>
                </div>
                <div>
                  <strong className="text-foreground block">Course in Hospital:</strong>
                  <p className="text-muted-foreground">
                    Patient admitted with acute symptoms. Successfully managed with IV protocols and daily clinical rounding. Vitals stabilized upon discharge.
                  </p>
                </div>
                <div>
                  <strong className="text-foreground block">Discharge Medications &amp; Dosage:</strong>
                  <p className="text-muted-foreground">
                    1. Tab Amoxicillin-Clav 625mg (1-0-1 x 5 days)<br />
                    2. Tab Pantoprazole 40mg (1-0-0 before breakfast x 7 days)<br />
                    3. Tab Paracetamol 650mg (SOS for pain/fever)
                  </p>
                </div>
                <div>
                  <strong className="text-foreground block">Advice on Discharge &amp; Follow-up:</strong>
                  <p className="text-muted-foreground">
                    Follow-up after 7 days in OPD. Report immediately to Emergency in case of severe pain, chest tightness or high fever.
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSummaryOpen(false)}>
              Close
            </Button>
            <Button
              className="gap-1.5"
              onClick={() => {
                toast({ title: "Discharge Summary Printed", description: "Sent to hospital laser printer." });
                setSummaryOpen(false);
              }}
            >
              <Printer className="h-4 w-4" /> Print Discharge Summary
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
