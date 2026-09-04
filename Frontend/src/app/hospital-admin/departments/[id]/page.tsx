"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Bed,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  HeartPulse,
  Info,
  MapPin,
  Plus,
  Shield,
  ShieldAlert,
  Stethoscope,
  Trash2,
  User,
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
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/hospital-admin/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/hospital-admin/components/ui/tabs";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { StatusBadge } from "@/hospital-admin/components/shared/status-badge";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { detailedDepartments, DepartmentData } from "@/hospital-admin/lib/mock-data/departments";
import { getInitials } from "@/hospital-admin/lib/utils";

export default function DepartmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();

  const initialDept = detailedDepartments.find((d) => d.id === id);
  if (!initialDept) {
    notFound();
  }

  const [deptData, setDeptData] = useState<DepartmentData>(initialDept);

  // Edit Department Modal State
  const [editDeptModalOpen, setEditDeptModalOpen] = useState(false);
  const [deptName, setDeptName] = useState(deptData.name);
  const [deptHead, setDeptHead] = useState(deptData.headName);
  const [deptHeadTitle, setDeptHeadTitle] = useState(deptData.headTitle);
  const [deptFloor, setDeptFloor] = useState(deptData.floor);
  const [deptOperatingHours, setDeptOperatingHours] = useState(deptData.operatingHours);
  const [deptShiftModel, setDeptShiftModel] = useState(deptData.shiftModel);
  const [deptBedCapacity, setDeptBedCapacity] = useState(String(deptData.bedCapacity || 15));
  const [deptStatus, setDeptStatus] = useState<DepartmentData["status"]>(deptData.status);

  // Doctor Modals State
  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);
  const [docName, setDocName] = useState("");
  const [docSpecialty, setDocSpecialty] = useState("");
  const [docQual, setDocQual] = useState("");
  const [docExp, setDocExp] = useState("");
  const [docAvail, setDocAvail] = useState<any>("On-Duty");
  const [docRating, setDocRating] = useState("4.8");

  // Nurse Modals State
  const [nurseModalOpen, setNurseModalOpen] = useState(false);
  const [editingNurse, setEditingNurse] = useState<any>(null);
  const [nurName, setNurName] = useState("");
  const [nurStation, setNurStation] = useState("");
  const [nurRole, setNurRole] = useState("");
  const [nurShift, setNurShift] = useState("Morning");
  const [nurStatus, setNurStatus] = useState<any>("On-Duty");

  // Support Staff Modals State
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [editingSupport, setEditingSupport] = useState<any>(null);
  const [supName, setSupName] = useState("");
  const [supRole, setSupRole] = useState("");
  const [supTask, setSupTask] = useState("");
  const [supShift, setSupShift] = useState("Morning");
  const [supStatus, setSupStatus] = useState<any>("Active");

  // Patient Modals State
  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [patName, setPatName] = useState("");
  const [patUhid, setPatUhid] = useState("");
  const [patAge, setPatAge] = useState("35");
  const [patGender, setPatGender] = useState("Male");
  const [patBed, setPatBed] = useState("");
  const [patDoc, setPatDoc] = useState(deptData.headName);
  const [patCondition, setPatCondition] = useState("");
  const [patStatus, setPatStatus] = useState<any>("Stable");

  const occupancyRate =
    deptData.bedCapacity && deptData.occupiedBeds
      ? Math.round((deptData.occupiedBeds / deptData.bedCapacity) * 100)
      : null;

  // -------------------------------------------------------------
  // HANDLERS: EDIT DEPARTMENT DETAILS
  // -------------------------------------------------------------
  const handleSaveDeptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) return;

    setDeptData((prev) => ({
      ...prev,
      name: deptName.trim(),
      headName: deptHead.trim(),
      headTitle: deptHeadTitle.trim(),
      floor: deptFloor.trim(),
      operatingHours: deptOperatingHours.trim(),
      shiftModel: deptShiftModel.trim(),
      bedCapacity: Number(deptBedCapacity) || 15,
      status: deptStatus,
    }));

    setEditDeptModalOpen(false);
    toast({
      title: "Department Updated",
      description: `Details for ${deptName.trim()} have been successfully saved.`,
    });
  };

  // -------------------------------------------------------------
  // HANDLERS: DOCTOR CRUD
  // -------------------------------------------------------------
  const handleOpenAddDoctor = () => {
    setEditingDoctor(null);
    setDocName("");
    setDocSpecialty(deptData.type);
    setDocQual("MBBS, MD");
    setDocExp("8 yrs");
    setDocAvail("On-Duty");
    setDocRating("4.8");
    setDoctorModalOpen(true);
  };

  const handleOpenEditDoctor = (doc: any) => {
    setEditingDoctor(doc);
    setDocName(doc.name);
    setDocSpecialty(doc.specialty);
    setDocQual(doc.qualification);
    setDocExp(doc.experience);
    setDocAvail(doc.availability);
    setDocRating(String(doc.rating));
    setDoctorModalOpen(true);
  };

  const handleSaveDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;

    if (editingDoctor) {
      setDeptData((prev) => ({
        ...prev,
        activeDoctorsList: prev.activeDoctorsList.map((d) =>
          d.id === editingDoctor.id
            ? {
                ...d,
                name: docName.trim(),
                specialty: docSpecialty.trim(),
                qualification: docQual.trim(),
                experience: docExp.trim(),
                availability: docAvail,
                rating: Number(docRating) || 4.8,
              }
            : d
        ),
      }));
      toast({ title: "Doctor Profile Updated", description: `${docName.trim()} profile modified.` });
    } else {
      const newDoc = {
        id: `doc_${Date.now()}`,
        name: docName.trim(),
        specialty: docSpecialty.trim(),
        qualification: docQual.trim(),
        experience: docExp.trim(),
        availability: docAvail,
        rating: Number(docRating) || 4.8,
      };
      setDeptData((prev) => ({
        ...prev,
        activeDoctorsList: [newDoc, ...prev.activeDoctorsList],
      }));
      toast({ title: "Doctor Assigned", description: `${docName.trim()} assigned to ${deptData.name}.` });
    }
    setDoctorModalOpen(false);
  };

  const handleRemoveDoctor = (docId: string, docNameStr: string) => {
    setDeptData((prev) => ({
      ...prev,
      activeDoctorsList: prev.activeDoctorsList.filter((d) => d.id !== docId),
    }));
    toast({
      title: "Doctor Removed",
      description: `${docNameStr} unassigned from ${deptData.name}.`,
    });
  };

  // -------------------------------------------------------------
  // HANDLERS: NURSE CRUD
  // -------------------------------------------------------------
  const handleOpenAddNurse = () => {
    setEditingNurse(null);
    setNurName("");
    setNurStation(deptData.nurseStations[0] || "Station 1");
    setNurRole("Staff Nurse");
    setNurShift("Morning");
    setNurStatus("On-Duty");
    setNurseModalOpen(true);
  };

  const handleOpenEditNurse = (nur: any) => {
    setEditingNurse(nur);
    setNurName(nur.name);
    setNurStation(nur.station);
    setNurRole(nur.role);
    setNurShift(nur.shift);
    setNurStatus(nur.status);
    setNurseModalOpen(true);
  };

  const handleSaveNurseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nurName.trim()) return;

    if (editingNurse) {
      setDeptData((prev) => ({
        ...prev,
        activeNursesList: prev.activeNursesList.map((n) =>
          n.id === editingNurse.id
            ? {
                ...n,
                name: nurName.trim(),
                station: nurStation.trim(),
                role: nurRole.trim(),
                shift: nurShift.trim(),
                status: nurStatus,
              }
            : n
        ),
      }));
      toast({ title: "Nurse Details Updated", description: `${nurName.trim()} record modified.` });
    } else {
      const newNurse = {
        id: `nur_${Date.now()}`,
        name: nurName.trim(),
        station: nurStation.trim(),
        role: nurRole.trim(),
        shift: nurShift.trim(),
        status: nurStatus,
      };
      setDeptData((prev) => ({
        ...prev,
        activeNursesList: [newNurse, ...prev.activeNursesList],
      }));
      toast({ title: "Nurse Deployed", description: `${nurName.trim()} deployed to ${deptData.name}.` });
    }
    setNurseModalOpen(false);
  };

  const handleRemoveNurse = (nurId: string, nurNameStr: string) => {
    setDeptData((prev) => ({
      ...prev,
      activeNursesList: prev.activeNursesList.filter((n) => n.id !== nurId),
    }));
    toast({
      title: "Nurse Removed",
      description: `${nurNameStr} removed from department roster.`,
    });
  };

  // -------------------------------------------------------------
  // HANDLERS: SUPPORT STAFF CRUD
  // -------------------------------------------------------------
  const handleOpenAddSupport = () => {
    setEditingSupport(null);
    setSupName("");
    setSupRole("Ward Assistant");
    setSupTask("General department & clinical assistance");
    setSupShift("Morning");
    setSupStatus("Active");
    setSupportModalOpen(true);
  };

  const handleOpenEditSupport = (sup: any) => {
    setEditingSupport(sup);
    setSupName(sup.name);
    setSupRole(sup.role);
    setSupTask(sup.taskScope);
    setSupShift(sup.shift);
    setSupStatus(sup.status);
    setSupportModalOpen(true);
  };

  const handleSaveSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName.trim()) return;

    if (editingSupport) {
      setDeptData((prev) => ({
        ...prev,
        supportStaffList: prev.supportStaffList.map((s) =>
          s.id === editingSupport.id
            ? {
                ...s,
                name: supName.trim(),
                role: supRole.trim(),
                taskScope: supTask.trim(),
                shift: supShift.trim(),
                status: supStatus,
              }
            : s
        ),
      }));
      toast({ title: "Support Staff Updated", description: `${supName.trim()} record modified.` });
    } else {
      const newSup = {
        id: `sup_${Date.now()}`,
        name: supName.trim(),
        role: supRole.trim(),
        taskScope: supTask.trim(),
        shift: supShift.trim(),
        status: supStatus,
      };
      setDeptData((prev) => ({
        ...prev,
        supportStaffList: [newSup, ...prev.supportStaffList],
      }));
      toast({ title: "Support Staff Added", description: `${supName.trim()} assigned to ${deptData.name}.` });
    }
    setSupportModalOpen(false);
  };

  const handleRemoveSupport = (supId: string, supNameStr: string) => {
    setDeptData((prev) => ({
      ...prev,
      supportStaffList: prev.supportStaffList.filter((s) => s.id !== supId),
    }));
    toast({
      title: "Staff Removed",
      description: `${supNameStr} removed from department.`,
    });
  };

  // -------------------------------------------------------------
  // HANDLERS: PATIENTS CRUD
  // -------------------------------------------------------------
  const handleOpenAddPatient = () => {
    setEditingPatient(null);
    setPatName("");
    setPatUhid(`QLY-PAT-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    setPatAge("40");
    setPatGender("Male");
    setPatBed(`Bed ${deptData.name.slice(0, 3).toUpperCase()}-0${deptData.activePatientsList.length + 1}`);
    setPatDoc(deptData.headName);
    setPatCondition("Specialist Clinical Evaluation");
    setPatStatus("Stable");
    setPatientModalOpen(true);
  };

  const handleOpenEditPatient = (p: any) => {
    setEditingPatient(p);
    setPatName(p.name);
    setPatUhid(p.qlynoId);
    setPatAge(String(p.age));
    setPatGender(p.gender);
    setPatBed(p.bedNumber);
    setPatDoc(p.admittingDoctor);
    setPatCondition(p.condition);
    setPatStatus(p.status);
    setPatientModalOpen(true);
  };

  const handleSavePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patName.trim()) return;

    if (editingPatient) {
      setDeptData((prev) => ({
        ...prev,
        activePatientsList: prev.activePatientsList.map((p) =>
          p.id === editingPatient.id
            ? {
                ...p,
                name: patName.trim(),
                age: Number(patAge) || 35,
                gender: patGender,
                bedNumber: patBed.trim(),
                admittingDoctor: patDoc.trim(),
                condition: patCondition.trim(),
                status: patStatus,
              }
            : p
        ),
      }));
      toast({ title: "Patient Record Updated", description: `Record for ${patName.trim()} modified.` });
    } else {
      const newPat = {
        id: `pat_${Date.now()}`,
        name: patName.trim(),
        qlynoId: patUhid.trim(),
        age: Number(patAge) || 35,
        gender: patGender,
        bedNumber: patBed.trim(),
        admittingDoctor: patDoc.trim(),
        admissionDate: "2026-08-21",
        condition: patCondition.trim(),
        status: patStatus,
      };
      setDeptData((prev) => ({
        ...prev,
        activePatients: prev.activePatients + 1,
        occupiedBeds: (prev.occupiedBeds || 0) + 1,
        activePatientsList: [newPat, ...prev.activePatientsList],
      }));
      toast({ title: "Patient Admitted", description: `${patName.trim()} admitted to ${deptData.name}.` });
    }
    setPatientModalOpen(false);
  };

  const handleDischargePatient = (patId: string, patNameStr: string) => {
    setDeptData((prev) => ({
      ...prev,
      activePatients: Math.max(0, prev.activePatients - 1),
      occupiedBeds: Math.max(0, (prev.occupiedBeds || 1) - 1),
      activePatientsList: prev.activePatientsList.filter((p) => p.id !== patId),
    }));
    toast({
      title: "Patient Discharged",
      description: `${patNameStr} has been successfully discharged/removed from department roster.`,
    });
  };

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="-ml-2 gap-1 text-muted-foreground hover:text-foreground">
          <Link href="/hospital-admin/departments">
            <ArrowLeft className="h-4 w-4" /> Back to Departments
          </Link>
        </Button>
      </div>

      <PageHeader
        title={deptData.name}
        description={
          deptData.description
            ? `${deptData.description} • ${deptData.location} (${deptData.floor})`
            : `Operational clinical unit • ${deptData.location} (${deptData.floor})`
        }
        crumbs={[
          { label: "Clinical Services" },
          { label: "Departments", href: "/hospital-admin/departments" },
          ...(deptData.categoryName ? [{ label: deptData.categoryName }] : []),
          { label: deptData.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-semibold"
              onClick={() => setEditDeptModalOpen(true)}
            >
              <Edit2 className="h-3.5 w-3.5 text-primary" /> Edit Department Details
            </Button>
            <Badge variant="outline" className="text-xs font-semibold">
              {deptData.type}
            </Badge>
            <StatusBadge status={deptData.status} />
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName={deptData.name} />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-warning" />
          <span>Department Operational Oversight • Clinical governance under {deptData.headName}</span>
        </div>
      </div>

      {/* Key Metric Overview Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="p-3 bg-card border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Department Head</span>
            <User className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-1 font-bold text-sm text-foreground">{deptData.headName}</p>
          <p className="text-[11px] text-muted-foreground truncate">{deptData.headTitle}</p>
        </Card>

        <Card className="p-3 bg-card border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Active Patients</span>
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-1 font-bold text-lg text-primary">{deptData.activePatientsList.length}</p>
          <p className="text-[11px] text-muted-foreground">Under active care</p>
        </Card>

        <Card className="p-3 bg-card border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Bed Occupancy</span>
            <Bed className="h-4 w-4 text-primary" />
          </div>
          {deptData.bedCapacity !== undefined ? (
            <div>
              <p className="mt-1 font-bold text-sm text-foreground">
                {deptData.occupiedBeds || deptData.activePatientsList.length} / {deptData.bedCapacity} ({occupancyRate || 0}%)
              </p>
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden mt-1">
                <div
                  className={`h-full rounded-full ${
                    (occupancyRate || 0) > 85
                      ? "bg-destructive"
                      : (occupancyRate || 0) > 60
                      ? "bg-warning"
                      : "bg-success"
                  }`}
                  style={{ width: `${Math.min(100, occupancyRate || 0)}%` }}
                />
              </div>
            </div>
          ) : (
            <div>
              <p className="mt-1 font-bold text-sm text-foreground">Day-Care Bays</p>
              <p className="text-[11px] text-muted-foreground">Outpatient triage</p>
            </div>
          )}
        </Card>

        <Card className="p-3 bg-card border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Clinical Doctors</span>
            <Stethoscope className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-1 font-bold text-lg text-foreground">{deptData.activeDoctorsList.length}</p>
          <p className="text-[11px] text-muted-foreground">Assigned &amp; on-duty</p>
        </Card>

        <Card className="p-3 bg-card border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Nursing &amp; Support</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-1 font-bold text-sm text-foreground">
            {deptData.activeNursesList.length} Nurses • {deptData.supportStaffList.length} Support
          </p>
          <p className="text-[11px] text-muted-foreground">Shift active</p>
        </Card>
      </div>

      {/* Operating Schedule & Stations Banner */}
      <div className="rounded-lg border border-border bg-muted/20 p-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Clock className="h-4 w-4 text-primary shrink-0" />
          <div>
            <span className="text-muted-foreground">Operating Schedule:</span>
            <p className="font-semibold text-foreground">{deptData.operatingHours}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Calendar className="h-4 w-4 text-primary shrink-0" />
          <div>
            <span className="text-muted-foreground">Shift Model:</span>
            <p className="font-semibold text-foreground">{deptData.shiftModel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <MapPin className="h-4 w-4 text-primary shrink-0" />
          <div>
            <span className="text-muted-foreground">Assigned Nurse Stations:</span>
            <p className="font-semibold text-foreground">{deptData.nurseStations.join(", ")}</p>
          </div>
        </div>
      </div>

      {/* Detail Tabs */}
      <Tabs defaultValue="doctors" className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full">
          <TabsTrigger value="doctors" className="text-xs">
            Active Doctors ({deptData.activeDoctorsList.length})
          </TabsTrigger>
          <TabsTrigger value="nurses" className="text-xs">
            Active Nurses ({deptData.activeNursesList.length})
          </TabsTrigger>
          <TabsTrigger value="support" className="text-xs">
            Support Staff ({deptData.supportStaffList.length})
          </TabsTrigger>
          <TabsTrigger value="patients" className="text-xs">
            Active Patients ({deptData.activePatientsList.length})
          </TabsTrigger>
          <TabsTrigger value="scope" className="text-xs">
            Department Scope
          </TabsTrigger>
        </TabsList>

        {/* ========================================================================= */}
        {/* TAB 1: ACTIVE DOCTORS                                                     */}
        {/* ========================================================================= */}
        <TabsContent value="doctors" className="space-y-3 pt-3">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Assigned &amp; Consulting Doctors</CardTitle>
                <CardDescription>
                  Attending physicians, surgeons, and specialists assigned to {deptData.name}.
                </CardDescription>
              </div>
              <Button size="sm" className="gap-1.5 text-xs font-semibold" onClick={handleOpenAddDoctor}>
                <Plus className="h-4 w-4" /> Add Doctor
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Doctor Name</TableHead>
                    <TableHead>Specialty &amp; Qualification</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Duty Availability</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deptData.activeDoctorsList.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8 rounded-full">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                              {getInitials(doc.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-xs text-foreground">{doc.name}</p>
                            <p className="text-[11px] text-muted-foreground">{deptData.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <p className="font-medium text-foreground">{doc.specialty}</p>
                        <p className="text-[11px] text-muted-foreground">{doc.qualification}</p>
                      </TableCell>
                      <TableCell className="text-xs">{doc.experience}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            doc.availability === "On-Duty" || doc.availability === "Consulting"
                              ? "success"
                              : doc.availability === "In-Surgery"
                              ? "warning"
                              : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {doc.availability}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-primary">★ {doc.rating}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => handleOpenEditDoctor(doc)}
                          >
                            <Edit2 className="h-3.5 w-3.5 text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveDoctor(doc.id, doc.name)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {deptData.activeDoctorsList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-28 text-center text-xs text-muted-foreground">
                        No doctors currently assigned. Click &quot;Add Doctor&quot; to assign specialists.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 2: ACTIVE NURSES                                                      */}
        {/* ========================================================================= */}
        <TabsContent value="nurses" className="space-y-3 pt-3">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Deployed Nursing Workforce</CardTitle>
                <CardDescription>
                  Staff nurses, leads, and triage specialists active across department nurse stations.
                </CardDescription>
              </div>
              <Button size="sm" className="gap-1.5 text-xs font-semibold" onClick={handleOpenAddNurse}>
                <Plus className="h-4 w-4" /> Add Nurse
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nurse Name</TableHead>
                    <TableHead>Assigned Station</TableHead>
                    <TableHead>Clinical Role</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deptData.activeNursesList.map((nur) => (
                    <TableRow key={nur.id}>
                      <TableCell className="font-semibold text-xs text-foreground">{nur.name}</TableCell>
                      <TableCell className="text-xs text-primary font-medium">{nur.station}</TableCell>
                      <TableCell className="text-xs">{nur.role}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{nur.shift}</TableCell>
                      <TableCell>
                        <Badge
                          variant={nur.status === "On-Duty" ? "success" : "secondary"}
                          className="text-[10px]"
                        >
                          {nur.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => handleOpenEditNurse(nur)}
                          >
                            <Edit2 className="h-3.5 w-3.5 text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveNurse(nur.id, nur.name)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {deptData.activeNursesList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-28 text-center text-xs text-muted-foreground">
                        No nursing staff currently allocated. Click &quot;Add Nurse&quot; to assign.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 3: SUPPORT STAFF                                                      */}
        {/* ========================================================================= */}
        <TabsContent value="support" className="space-y-3 pt-3">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Allied Support Workforce</CardTitle>
                <CardDescription>
                  Technicians, ward attendants, and clinic coordinators operating in {deptData.name}.
                </CardDescription>
              </div>
              <Button size="sm" className="gap-1.5 text-xs font-semibold" onClick={handleOpenAddSupport}>
                <Plus className="h-4 w-4" /> Add Support Staff
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Task Scope</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deptData.supportStaffList.map((sup) => (
                    <TableRow key={sup.id}>
                      <TableCell className="font-semibold text-xs text-foreground">{sup.name}</TableCell>
                      <TableCell className="text-xs font-medium text-foreground">{sup.role}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{sup.taskScope}</TableCell>
                      <TableCell className="text-xs">{sup.shift}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {sup.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => handleOpenEditSupport(sup)}
                          >
                            <Edit2 className="h-3.5 w-3.5 text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveSupport(sup.id, sup.name)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {deptData.supportStaffList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-28 text-center text-xs text-muted-foreground">
                        No support staff allocated. Click &quot;Add Support Staff&quot; to assign.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 4: ACTIVE PATIENTS                                                    */}
        {/* ========================================================================= */}
        <TabsContent value="patients" className="space-y-3 pt-3">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Active Inpatients &amp; Clinic Visits</CardTitle>
                <CardDescription>
                  Live patient tracking roster and active bed/room assignments for {deptData.name}.
                </CardDescription>
              </div>
              <Button size="sm" className="gap-1.5 text-xs font-semibold" onClick={handleOpenAddPatient}>
                <Plus className="h-4 w-4" /> Admit / Add Patient
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Details</TableHead>
                    <TableHead>Bed / Location</TableHead>
                    <TableHead>Admitting Doctor</TableHead>
                    <TableHead>Diagnosis / Condition</TableHead>
                    <TableHead>Admission Date</TableHead>
                    <TableHead>Clinical Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deptData.activePatientsList.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-xs text-foreground">{p.name}</p>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            {p.qlynoId} • {p.age}y ({p.gender})
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono font-medium text-primary">
                        {p.bedNumber}
                      </TableCell>
                      <TableCell className="text-xs">{p.admittingDoctor}</TableCell>
                      <TableCell className="text-xs font-medium">{p.condition}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{p.admissionDate}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            p.status === "Critical"
                              ? "destructive"
                              : p.status === "Under Observation"
                              ? "warning"
                              : "success"
                          }
                          className="text-[10px]"
                        >
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => handleOpenEditPatient(p)}
                          >
                            <Edit2 className="h-3.5 w-3.5 text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-destructive hover:text-destructive px-2"
                            onClick={() => handleDischargePatient(p.id, p.name)}
                          >
                            Discharge
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {deptData.activePatientsList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                        No active patients currently admitted. Click &quot;Admit / Add Patient&quot; to register visits.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 5: DEPARTMENT SCOPE                                                   */}
        {/* ========================================================================= */}
        <TabsContent value="scope" className="space-y-4 pt-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" /> Department Clinical Scope &amp; Boundaries
              </CardTitle>
              <CardDescription>
                Defined operational protocols, supervision standards, and admin delegation limits for {deptData.name}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 p-3.5 rounded-lg border border-border bg-muted/20">
                  <h4 className="text-xs font-bold text-foreground">Authorized Clinical Procedures:</h4>
                  <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground pl-1">
                    {deptData.scope.clinicalProcedures.map((proc, i) => (
                      <li key={i}>{proc}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2 p-3.5 rounded-lg border border-border bg-muted/20">
                  <h4 className="text-xs font-bold text-foreground">Emergency &amp; Diagnostic Equipment:</h4>
                  <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground pl-1">
                    {deptData.scope.equipmentReady.map((eq, i) => (
                      <li key={i}>{eq}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-950 dark:text-amber-200 space-y-1 text-xs">
                <strong className="font-semibold block">Administrative Delegation Boundary:</strong>
                <p className="leading-relaxed">{deptData.scope.delegationLimits}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ========================================================================= */}
      {/* MODAL: EDIT DEPARTMENT DETAILS                                            */}
      {/* ========================================================================= */}
      <Dialog open={editDeptModalOpen} onOpenChange={setEditDeptModalOpen}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-4 w-4 text-primary" /> Edit Department Configuration
            </DialogTitle>
            <DialogDescription>
              Update operational parameters, leadership, and room capacity for {deptData.name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveDeptSubmit} className="space-y-3.5 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Department Name *</Label>
              <Input
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Head of Department *</Label>
                <Input
                  value={deptHead}
                  onChange={(e) => setDeptHead(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Head Title</Label>
                <Input
                  value={deptHeadTitle}
                  onChange={(e) => setDeptHeadTitle(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Floor / Location</Label>
                <Input
                  value={deptFloor}
                  onChange={(e) => setDeptFloor(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Bed / Room Capacity</Label>
                <Input
                  type="number"
                  value={deptBedCapacity}
                  onChange={(e) => setDeptBedCapacity(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Operating Schedule</Label>
                <Input
                  value={deptOperatingHours}
                  onChange={(e) => setDeptOperatingHours(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Status</Label>
                <Select
                  value={deptStatus}
                  onValueChange={(val: any) => setDeptStatus(val)}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setEditDeptModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Department Details</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT DOCTOR                                                  */}
      {/* ========================================================================= */}
      <Dialog open={doctorModalOpen} onOpenChange={setDoctorModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-primary" />
              {editingDoctor ? "Edit Doctor Profile" : "Assign Doctor to Department"}
            </DialogTitle>
            <DialogDescription>
              Configure doctor specialty, qualifications, and duty schedule.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveDoctorSubmit} className="space-y-3.5 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Doctor Full Name *</Label>
              <Input
                placeholder="e.g. Dr. Priya Sharma"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Specialty</Label>
                <Input
                  value={docSpecialty}
                  onChange={(e) => setDocSpecialty(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Qualification</Label>
                <Input
                  value={docQual}
                  onChange={(e) => setDocQual(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Experience</Label>
                <Input
                  placeholder="e.g. 10 yrs"
                  value={docExp}
                  onChange={(e) => setDocExp(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Duty Availability</Label>
                <Select value={docAvail} onValueChange={(val: any) => setDocAvail(val)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="On-Duty">On-Duty</SelectItem>
                    <SelectItem value="Consulting">Consulting</SelectItem>
                    <SelectItem value="In-Surgery">In-Surgery</SelectItem>
                    <SelectItem value="On-Call">On-Call</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Rating (out of 5)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={docRating}
                  onChange={(e) => setDocRating(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setDoctorModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingDoctor ? "Save Doctor Profile" : "Assign Doctor"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT NURSE                                                   */}
      {/* ========================================================================= */}
      <Dialog open={nurseModalOpen} onOpenChange={setNurseModalOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary" />
              {editingNurse ? "Edit Nurse Allocation" : "Deploy Nurse to Department"}
            </DialogTitle>
            <DialogDescription>
              Assign nurse station, clinical shift, and duty status.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveNurseSubmit} className="space-y-3.5 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Nurse Full Name *</Label>
              <Input
                placeholder="e.g. Pooja Hegde"
                value={nurName}
                onChange={(e) => setNurName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Nurse Station</Label>
                <Input
                  value={nurStation}
                  onChange={(e) => setNurStation(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Role / Designation</Label>
                <Input
                  value={nurRole}
                  onChange={(e) => setNurRole(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Shift Schedule</Label>
                <Select value={nurShift} onValueChange={setNurShift}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select Shift" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Morning">Morning (07:00–15:30)</SelectItem>
                    <SelectItem value="Evening">Evening (15:00–23:00)</SelectItem>
                    <SelectItem value="Night">Night (22:30–07:30)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Duty Status</Label>
                <Select value={nurStatus} onValueChange={(val: any) => setNurStatus(val)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="On-Duty">On-Duty</SelectItem>
                    <SelectItem value="Break">Break</SelectItem>
                    <SelectItem value="Standby">Standby</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setNurseModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingNurse ? "Save Nurse Record" : "Deploy Nurse"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT SUPPORT STAFF                                           */}
      {/* ========================================================================= */}
      <Dialog open={supportModalOpen} onOpenChange={setSupportModalOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              {editingSupport ? "Edit Support Staff" : "Add Support Staff Member"}
            </DialogTitle>
            <DialogDescription>
              Assign technician, attendant, or coordinator duties.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveSupportSubmit} className="space-y-3.5 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Staff Member Name *</Label>
              <Input
                placeholder="e.g. Ramesh Pawar"
                value={supName}
                onChange={(e) => setSupName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Role / Job Title</Label>
                <Input
                  value={supRole}
                  onChange={(e) => setSupRole(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Shift</Label>
                <Input
                  value={supShift}
                  onChange={(e) => setSupShift(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Task Scope &amp; Responsibilities</Label>
              <Input
                value={supTask}
                onChange={(e) => setSupTask(e.target.value)}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setSupportModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingSupport ? "Save Staff Record" : "Add Staff"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: ADMIT / EDIT PATIENT                                               */}
      {/* ========================================================================= */}
      <Dialog open={patientModalOpen} onOpenChange={setPatientModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" />
              {editingPatient ? "Edit Patient Roster Record" : "Admit / Register Patient"}
            </DialogTitle>
            <DialogDescription>
              Assign patient bed, attending physician, and admission condition.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSavePatientSubmit} className="space-y-3.5 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Patient Full Name *</Label>
              <Input
                placeholder="e.g. Rohan Verma"
                value={patName}
                onChange={(e) => setPatName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">UHID</Label>
                <Input
                  value={patUhid}
                  onChange={(e) => setPatUhid(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Age</Label>
                <Input
                  type="number"
                  value={patAge}
                  onChange={(e) => setPatAge(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Gender</Label>
                <Select value={patGender} onValueChange={setPatGender}>
                  <SelectTrigger className="h-9 text-xs">
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Bed / Location</Label>
                <Input
                  value={patBed}
                  onChange={(e) => setPatBed(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Admitting Doctor</Label>
                <Input
                  value={patDoc}
                  onChange={(e) => setPatDoc(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Condition / Diagnosis</Label>
                <Input
                  value={patCondition}
                  onChange={(e) => setPatCondition(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Clinical Status</Label>
                <Select value={patStatus} onValueChange={(val: any) => setPatStatus(val)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Stable">Stable</SelectItem>
                    <SelectItem value="Under Observation">Under Observation</SelectItem>
                    <SelectItem value="Pre-Op">Pre-Op</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setPatientModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingPatient ? "Save Patient Record" : "Admit Patient"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
