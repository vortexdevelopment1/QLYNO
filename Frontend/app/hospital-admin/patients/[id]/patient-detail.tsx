"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRightLeft,
  Bed,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Lock,
  Plus,
  RefreshCw,
  Shield,
  ShieldAlert,
  Stethoscope,
  Trash2,
  UserCheck,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/hospital-admin/components/ui/avatar";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/hospital-admin/components/ui/alert";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/hospital-admin/components/ui/tabs";
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import { StatusBadge } from "@/hospital-admin/components/shared/status-badge";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { patients } from "@/hospital-admin/lib/mock-data/patients";
import type { Patient } from "@/hospital-admin/lib/types";
import { getInitials } from "@/hospital-admin/lib/utils";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Patient Management workflow";

interface PatientDetailProps {
  patientId: string;
}

export function PatientDetail({ patientId }: PatientDetailProps) {
  const patient = patients.find((p) => p.id === patientId);
  const { toast } = useToast();
  
  const [admitDialogOpen, setAdmitDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [dischargeDialogOpen, setDischargeDialogOpen] = useState(false);

  if (!patient) return <div className="p-8 text-center text-muted-foreground">Patient not found</div>;

  const relationship = patient.hospitalRelationships[0];
  const recentOPD = relationship?.opdHistory?.[0];
  const recentIPD = relationship?.ipdHistory?.[0];
  const hasUnsettledBills = (relationship?.billingStatus?.totalOutstanding ?? 0) > 0;

  const handleConnect = () => {
    toast({
      title: "Patient connected to hospital",
      description: `Hospital relationship established with consent tracking. (${DELEGATION_STRING})`,
    });
  };

  const handleAdmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdmitDialogOpen(false);
    toast({
      title: "IPD Admission initiated",
      description: `Patient admitted to IPD and bed allocated. (${DELEGATION_STRING})`,
    });
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferDialogOpen(false);
    toast({
      title: "IPD Transfer requested",
      description: `Department transfer request logged and assigned to ward supervisor. (${DELEGATION_STRING})`,
    });
  };

  const handleDischarge = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasUnsettledBills) {
      toast({
        title: "Discharge blocked",
        description: `Cannot discharge while billing is unsettled (₹${relationship?.billingStatus.totalOutstanding.toLocaleString()}). (${DELEGATION_STRING})`,
        variant: "destructive",
      });
      return;
    }
    setDischargeDialogOpen(false);
    toast({
      title: "Discharge processed",
      description: `Patient discharge completed, documents generated, and follow-up coordinated. (${DELEGATION_STRING})`,
    });
  };

  const handleBedShortageSimulation = () => {
    toast({
      title: "Bed shortage alert broadcasted",
      description: `Triggered operational escalation to Admin and Admissions/Emergency team. (${DELEGATION_STRING})`,
    });
  };

  const handleSettlePayment = () => {
    toast({
      title: "Financial settlement coordinated",
      description: `Coordinated financial clearance with hospital billing desk. (${DELEGATION_STRING})`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={patient.avatarUrl} alt={patient.name} />
              <AvatarFallback>{getInitials(patient.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-semibold text-foreground">{patient.name}</h2>
              <p className="text-sm font-mono text-muted-foreground">{patient.qlynoPatientId}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge>{patient.bloodGroup}</Badge>
                <Badge variant="outline">{patient.gender}</Badge>
                <StatusBadge status={relationship?.status || "new"} />
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => setAdmitDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Admit to IPD
            </Button>
            <Button variant="outline" onClick={handleConnect}>
              <RefreshCw className="mr-2 h-4 w-4" /> Connect Patient
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Patient & Treatment Scope" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-warning" />
          <span>Operational timeline & logistics • Clinical authorship reserved for clinicians</span>
        </div>
      </div>

      {/* Consent Indicator */}
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-950 dark:bg-blue-950/20">
        <CardContent className="flex items-center gap-3 pt-4">
          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                Consent Status: {relationship?.consent.status.toUpperCase()}
              </p>
              <Badge variant="outline" className="text-xs border-blue-300 text-blue-800 dark:border-blue-800 dark:text-blue-300">
                Active Policy
              </Badge>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
              Consented Categories: {relationship?.consent.dataSharing.join(", ") || "None"}
            </p>
          </div>
          {relationship?.consent.restrictions && relationship.consent.restrictions.length > 0 && (
            <div className="flex items-center gap-1.5 bg-orange-100 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 px-2.5 py-1 rounded-md text-xs font-medium border border-orange-200 dark:border-orange-900">
              <Lock className="h-3.5 w-3.5 text-orange-600" />
              <span>{relationship.consent.restrictions.length} privacy restriction(s)</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="opd">OPD</TabsTrigger>
          <TabsTrigger value="ipd">IPD</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="billing">Billing & Discharge</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Demographic & Contact Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Date of Birth</p>
                  <p className="text-sm font-medium">{patient.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">{patient.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{patient.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="text-sm font-medium">{patient.address}</p>
                </div>
                {patient.emergencyContact && (
                  <div>
                    <p className="text-xs text-muted-foreground">Emergency Contact</p>
                    <p className="text-sm font-medium">
                      {patient.emergencyContact.name} ({patient.emergencyContact.relationship}) • {patient.emergencyContact.phone}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Hospital Treatment Relationship</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Relationship Status</p>
                  <StatusBadge status={relationship?.status || "new"} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Established On</p>
                  <p className="text-sm font-medium">{relationship?.relationshipEstablishedOn}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total OPD Consultations</p>
                  <p className="text-sm font-medium">{relationship?.opdHistory?.length || 0} visits</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total IPD Admissions</p>
                  <p className="text-sm font-medium">{relationship?.ipdHistory?.length || 0} admissions</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {recentOPD && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Latest Outpatient Coordination</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Consulting Doctor</p>
                    <p className="text-sm font-medium">{recentOPD.doctor}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Department</p>
                    <p className="text-sm font-medium">{recentOPD.department}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Reason for Visit</p>
                  <p className="text-sm font-medium">{recentOPD.visitReason}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TIMELINE TAB */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3">
              <div>
                <CardTitle className="text-base font-bold">19.1 Cross-Module Longitudinal Care Timeline</CardTitle>
                <CardDescription className="text-xs">
                  Stitched event trail integrating Reception (Mod 6), Clinical OPD (Mod 7), Nursing (Mod 5), OT (Mod 10), Diagnostics/Pharmacy (Mod 12), and Invoices.
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-xs font-semibold" asChild>
                <Link href="/hospital-admin/care-coordination/patient-journey">
                  <ExternalLink className="h-3 w-3 mr-1" /> Open Core Workflows Console &rarr;
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              {/* 1. DISCOVERY & CONSENT */}
              <div className="flex gap-3 border-l-2 border-emerald-500 pl-4 relative">
                <div className="absolute -left-[9px] top-0.5 h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[9px] font-bold">
                  ✓
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">Identity Verified &amp; Consent Logged (Mod 7)</span>
                    <Badge variant="outline" className="text-[9px] font-mono">Qlyno Master Identity</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{relationship?.consent.recordedOn || "Initial Registration"} • UHID: {patient.qlynoPatientId}</p>
                  <p className="mt-1 text-muted-foreground bg-muted/20 p-2 rounded border border-border/50">Data sharing consent status verified as &lsquo;{relationship?.consent.status}&rsquo;. Master Qlyno profile verified without duplicate identity conflict.</p>
                </div>
              </div>

              {/* 2. RECEPTION & TOKEN */}
              <div className="flex gap-3 border-l-2 border-blue-500 pl-4 relative">
                <div className="absolute -left-[9px] top-0.5 h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[9px] font-bold">
                  ✓
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">Reception Check-In &amp; Token Issuance (Mod 6)</span>
                    <Badge variant="outline" className="text-[9px] font-mono">Counter 1</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Checked in at 09:18 AM • Token: #OPD-24</p>
                  <p className="mt-1 text-muted-foreground bg-muted/20 p-2 rounded border border-border/50">Receptionist verified identity, issued priority token, and routed patient to OPD waiting zone.</p>
                </div>
              </div>

              {/* 3. OPD CONSULTATION */}
              {recentOPD && (
                <div className="flex gap-3 border-l-2 border-primary pl-4 relative">
                  <div className="absolute -left-[9px] top-0.5 h-4 w-4 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[9px] font-bold">
                    ✓
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">Clinical OPD Consultation &amp; Plan (Mod 2 &amp; 7)</span>
                      <Badge variant="outline" className="text-[9px] font-mono">{recentOPD.department}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{recentOPD.registrationDate} • Consultant: {recentOPD.doctor}</p>
                    <p className="mt-1 text-muted-foreground bg-muted/20 p-2 rounded border border-border/50">Consultation reason: &ldquo;{recentOPD.visitReason}&rdquo;. Doctor signed digital clinical encounter notes and ordered pre-op diagnostics.</p>
                  </div>
                </div>
              )}

              {/* 4. DIAGNOSTICS & PHARMACY */}
              <div className="flex gap-3 border-l-2 border-amber-500 pl-4 relative">
                <div className="absolute -left-[9px] top-0.5 h-4 w-4 rounded-full bg-amber-500 flex items-center justify-center text-white text-[9px] font-bold">
                  ✓
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">Diagnostic Workup &amp; Pharmacy Dispensing (Mod 12)</span>
                    <Badge variant="outline" className="text-[9px] font-mono">Central Lab &amp; PACS</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Completed 2 hours post-OPD</p>
                  <p className="mt-1 text-muted-foreground bg-muted/20 p-2 rounded border border-border/50">Pre-op blood panel (CBC, Coagulation) released; 128-Slice CT scan verified; pre-anesthetic medications dispensed from central pharmacy.</p>
                </div>
              </div>

              {/* 5. IPD ADMISSION & BED */}
              {recentIPD && (
                <div className="flex gap-3 border-l-2 border-cyan-500 pl-4 relative">
                  <div className="absolute -left-[9px] top-0.5 h-4 w-4 rounded-full bg-cyan-500 flex items-center justify-center text-white text-[9px] font-bold">
                    ✓
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">IPD Admission &amp; Bed Allocation (Mod 7 &amp; Wards)</span>
                      <Badge variant="outline" className="text-[9px] font-mono">{recentIPD.bedAssignment}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{recentIPD.admissionDate} • Ward: {recentIPD.department}</p>
                    <p className="mt-1 text-muted-foreground bg-muted/20 p-2 rounded border border-border/50">Admitted under provisional diagnosis &lsquo;{recentIPD.diagnosis}&rsquo;. Bed assigned with 1:4 nursing care ratio.</p>
                  </div>
                </div>
              )}

              {/* 6. SURGERY & OT */}
              <div className="flex gap-3 border-l-2 border-purple-500 pl-4 relative">
                <div className="absolute -left-[9px] top-0.5 h-4 w-4 rounded-full bg-purple-500 flex items-center justify-center text-white text-[9px] font-bold">
                  ✓
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">Surgical Case Dossier &amp; OT Complex (Mod 10)</span>
                    <Badge variant="outline" className="text-[9px] font-mono">Case #CASE-409</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Main OR 1 • Lead Surgeon: Dr. Ramesh Sharma</p>
                  <p className="mt-1 text-muted-foreground bg-muted/20 p-2 rounded border border-border/50">Procedure: Total Knee Arthroplasty. Readiness verified at 100% with Orthotech implant delivery and PAC clearance.</p>
                </div>
              </div>

              {/* 7. BILLING & SETTLEMENT */}
              <div className="flex gap-3 border-l-2 border-emerald-500 pl-4 relative">
                <div className="absolute -left-[9px] top-0.5 h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[9px] font-bold">
                  $
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">Billing Invoices &amp; Insurance Cashless Clearance (Mod 12)</span>
                    <Badge variant="outline" className="text-[9px] font-mono">Ledger Settled</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Cumulative Billed: ₹{relationship?.billingStatus.totalSpent.toLocaleString()} • Outstanding: ₹{relationship?.billingStatus.totalOutstanding.toLocaleString()}</p>
                  <p className="mt-1 text-muted-foreground bg-muted/20 p-2 rounded border border-border/50">85% TPA cashless approval settled with Star Health; 15% patient copay collected at Counter 3.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* OPD TAB */}
        <TabsContent value="opd" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>OPD Registrations & Appointments</CardTitle>
                <CardDescription>Patient's outpatient consultations, queue tokens, and follow-ups.</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                Logistics & Scheduling Scope Only
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              {relationship?.opdHistory && relationship.opdHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Visit Reason</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {relationship.opdHistory.map((opd) => (
                      <TableRow key={opd.id}>
                        <TableCell className="text-sm font-medium">{opd.registrationDate}</TableCell>
                        <TableCell className="text-sm">{opd.doctor}</TableCell>
                        <TableCell className="text-sm">{opd.department}</TableCell>
                        <TableCell className="text-sm">{opd.visitReason}</TableCell>
                        <TableCell>
                          <StatusBadge status={opd.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No OPD history recorded for this patient.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* IPD TAB */}
        <TabsContent value="ipd" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setAdmitDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> New Admission
              </Button>
              <Button size="sm" variant="outline" onClick={() => setTransferDialogOpen(true)}>
                <ArrowRightLeft className="mr-2 h-4 w-4" /> Transfer Request
              </Button>
            </div>
            <Button size="sm" variant="outline" onClick={handleBedShortageSimulation}>
              <Bed className="mr-2 h-4 w-4" /> Simulate Bed Shortage Alert
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>IPD Admissions & Bed Assignments</CardTitle>
              <CardDescription>Inpatient ward allocations, room transfers, and treatment progress tracking.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {relationship?.ipdHistory && relationship.ipdHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Admission Date</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Clinical Diagnosis</TableHead>
                      <TableHead>Bed / Ward</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {relationship.ipdHistory.map((ipd) => (
                      <TableRow key={ipd.id}>
                        <TableCell className="text-sm font-medium">{ipd.admissionDate}</TableCell>
                        <TableCell className="text-sm">{ipd.department}</TableCell>
                        <TableCell className="text-sm">{ipd.diagnosis}</TableCell>
                        <TableCell className="text-sm font-mono">{ipd.bedAssignment}</TableCell>
                        <TableCell>
                          <StatusBadge status={ipd.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No IPD admissions recorded for this patient.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* DOCUMENTS TAB */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hospital-Generated Documents & Records</CardTitle>
              <CardDescription>Consent records, discharge summaries, and administrative certificates.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {relationship?.documents && relationship.documents.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Generated By</TableHead>
                      <TableHead>Date Uploaded</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {relationship.documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="text-sm font-medium">{doc.name}</TableCell>
                        <TableCell className="text-sm">{doc.type}</TableCell>
                        <TableCell className="text-sm">{doc.generatedBy}</TableCell>
                        <TableCell className="text-sm">{doc.uploadedOn}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toast({ title: "Downloading document", description: `${doc.name} downloaded. (${DELEGATION_STRING})` })}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No documents uploaded for this patient.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* BILLING & DISCHARGE TAB */}
        <TabsContent value="billing" className="space-y-4">
          {hasUnsettledBills && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Discharge Blocker Identified</AlertTitle>
              <AlertDescription>
                Patient has an outstanding balance of ₹{relationship?.billingStatus.totalOutstanding.toLocaleString()}. Discharge cannot be completed until financial settlement is coordinated.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Billing Coordination</CardTitle>
                <CardDescription>Financial clearance overview (Admin view only — not full billing engine).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Total Cumulative Spent</p>
                  <p className="text-2xl font-bold">₹{relationship?.billingStatus.totalSpent.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Current Outstanding Balance</p>
                  <p className={`text-lg font-semibold ${hasUnsettledBills ? "text-destructive" : "text-success"}`}>
                    ₹{relationship?.billingStatus.totalOutstanding.toLocaleString()}
                  </p>
                </div>
                {hasUnsettledBills ? (
                  <Button variant="destructive" className="w-full" onClick={handleSettlePayment}>
                    <AlertTriangle className="mr-2 h-4 w-4" /> Coordinate Payment Settlement
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    <CheckCircle2 className="mr-2 h-4 w-4 text-success" /> All Accounts Settled
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Discharge Readiness Checklist</CardTitle>
                <CardDescription>Gate condition enforcement for inpatient discharge.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  {!hasUnsettledBills ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <X className="h-4 w-4 text-destructive" />
                  )}
                  <span className="text-sm font-medium">Financial settlement complete</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium">Discharge documents attached by clinician</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium">Post-discharge follow-up scheduled</span>
                </div>
                <Button
                  className="mt-4 w-full"
                  disabled={hasUnsettledBills}
                  onClick={() => setDischargeDialogOpen(true)}
                >
                  {hasUnsettledBills ? "Blocked (Settle Balance First)" : "Proceed to Discharge Gate"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ADMISSION DIALOG */}
      <Dialog open={admitDialogOpen} onOpenChange={setAdmitDialogOpen}>
        <DialogContent>
          <form onSubmit={handleAdmit}>
            <DialogHeader>
              <DialogTitle>Admit Patient to IPD</DialogTitle>
              <DialogDescription>Register patient for inpatient treatment and allocate bed resource.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="dept">Department</Label>
                <Select defaultValue="cardiology">
                  <SelectTrigger id="dept">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="general-surgery">General Surgery</SelectItem>
                    <SelectItem value="obstetrics">Obstetrics & Gynecology</SelectItem>
                    <SelectItem value="orthopedics">Orthopedics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="diagnosis">Provisional Diagnosis</Label>
                <Input id="diagnosis" placeholder="Primary diagnosis" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="doctor">Admitting Doctor</Label>
                <Input id="doctor" placeholder="e.g. Dr. Rajesh Sharma" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bed">Bed & Ward Allocation</Label>
                <Input id="bed" placeholder="e.g. Ward A - Bed 14" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAdmitDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Confirm Admission</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* TRANSFER DIALOG */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent>
          <form onSubmit={handleTransfer}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-primary" /> Request IPD Patient Transfer
              </DialogTitle>
              <DialogDescription>Reassign bed, ward, or department location.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="t-dept">Target Department</Label>
                <Select defaultValue="icu">
                  <SelectTrigger id="t-dept">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="icu">ICU / Critical Care</SelectItem>
                    <SelectItem value="general-ward">General Ward</SelectItem>
                    <SelectItem value="step-down">Step-Down Unit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="t-bed">New Bed Assignment</Label>
                <Input id="t-bed" placeholder="e.g. ICU Bed 04" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="t-reason">Operational Transfer Reason</Label>
                <Input id="t-reason" placeholder="e.g. Upgraded to intensive monitoring" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setTransferDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Log Transfer Request</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DISCHARGE DIALOG */}
      <Dialog open={dischargeDialogOpen} onOpenChange={setDischargeDialogOpen}>
        <DialogContent>
          <form onSubmit={handleDischarge}>
            <DialogHeader>
              <DialogTitle>Complete Patient Discharge</DialogTitle>
              <DialogDescription>Process logistical discharge and verify required records.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Discharge Readiness Checklist</h4>
                <div className="space-y-1.5 rounded-lg border border-border p-3 bg-muted/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-sm">Billing accounts settled (₹0.00 outstanding)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-sm">Clinical discharge summary attached</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-sm">Follow-up appointment coordinated</span>
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="summary">Discharge Summary & Instructions (Clinician Authored)</Label>
                <Textarea
                  id="summary"
                  disabled
                  value="[Read-Only / Clinician Authored] Summary and clinical discharge instructions must be generated and signed off by the attending clinician. Hospital Admin oversees document attachment and logistical discharge execution."
                  className="bg-muted text-muted-foreground text-xs h-20"
                />
                <p className="text-xs text-muted-foreground">Admin cannot modify or author clinical medical content.</p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDischargeDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Complete Logistical Discharge</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
