"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowRightLeft,
  Bed,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  FileCheck,
  FileText,
  Flame,
  Info,
  Layers,
  Lock,
  Play,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Siren,
  Sparkles,
  Stethoscope,
  Truck,
  Unlock,
  User,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";

import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/hospital-admin/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/hospital-admin/components/ui/alert";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import {
  mockPatientTreatmentWorkflow,
  mockEmergencySosWorkflow,
  mockSurgeryVendorWorkflow,
  validatePatientDischarge,
  validateAmbulanceDispatch,
  validateOtScheduling,
  WorkflowStep,
  CoreWorkflowEpisode,
} from "@/hospital-admin/lib/workflows/workflow-sequencing-guard";
import { cn, formatDateTime } from "@/hospital-admin/lib/utils";

export default function PatientJourneyPage() {
  const { toast } = useToast();

  const [activeWorkflowTab, setActiveWorkflowTab] = useState<"19.1" | "19.2" | "19.3" | "audit">("19.1");

  // Workflow 19.1 State (Patient -> Treatment)
  const [patientWorkflow, setPatientWorkflow] = useState<CoreWorkflowEpisode>(mockPatientTreatmentWorkflow);
  const [patientOutstanding, setPatientOutstanding] = useState(14500);
  const [patientClinicalSignoff, setPatientClinicalSignoff] = useState(false);

  // Workflow 19.2 State (Emergency SOS)
  const [sosWorkflow, setSosWorkflow] = useState<CoreWorkflowEpisode>(mockEmergencySosWorkflow);
  const [alertAck, setAlertAck] = useState(true);

  // Workflow 19.3 State (Surgery -> Vendor)
  const [surgeryWorkflow, setSurgeryWorkflow] = useState<CoreWorkflowEpisode>(mockSurgeryVendorWorkflow);
  const [surgeryReadiness, setSurgeryReadiness] = useState(75); // 75% blocked -> 100% when vendor delivers

  // 19.1 Handlers
  const handleCompleteLabMedication = () => {
    setPatientWorkflow((prev) => ({
      ...prev,
      currentStep: 7,
      steps: prev.steps.map((s) => (s.stepNumber === 6 ? { ...s, status: "completed", completedAt: new Date().toISOString(), completedBy: "Nurse Station & Central Lab" } : s.stepNumber === 7 ? { ...s, status: "in-progress" } : s)),
    }));
    toast({
      title: "Step 6 Completed: Lab & Medications Verified",
      description: "Pre-op diagnostics and clinical tasks generated for Ward lead.",
    });
  };

  const handleTestDischarge = () => {
    const validation = validatePatientDischarge(patientOutstanding, patientClinicalSignoff);
    if (!validation.canDischarge) {
      toast({
        variant: "destructive",
        title: "Discharge Blocked by Sequencing Guard (19.1 Rule 3)",
        description: validation.errorReason,
      });
      return;
    }
    setPatientWorkflow((prev) => ({
      ...prev,
      currentStep: 10,
      status: "Completed",
      steps: prev.steps.map((s) => (s.stepNumber === 9 ? { ...s, status: "completed", completedAt: new Date().toISOString(), completedBy: "Attending Consultant" } : s.stepNumber === 10 ? { ...s, status: "completed", completedAt: new Date().toISOString(), completedBy: "Care Coordinator" } : s)),
    }));
    toast({
      title: "Discharge Completed Successfully",
      description: "Financial settlement verified and post-discharge follow-up care plan activated.",
    });
  };

  // 19.2 Handlers
  const handleDispatchAmbulance = () => {
    const validation = validateAmbulanceDispatch(alertAck, false);
    if (!validation.canDispatch) {
      toast({
        variant: "destructive",
        title: "Ambulance Dispatch Blocked (Emergency Sequencing Protocol)",
        description: validation.errorReason,
      });
      return;
    }
    setSosWorkflow((prev) => ({
      ...prev,
      currentStep: 7,
      steps: prev.steps.map((s) => (s.stepNumber === 5 ? { ...s, status: "completed", completedAt: new Date().toISOString(), completedBy: "Trauma Nurse Lead" } : s.stepNumber === 6 ? { ...s, status: "completed", completedAt: new Date().toISOString(), completedBy: "Ambulance Dispatcher" } : s.stepNumber === 7 ? { ...s, status: "in-progress" } : s)),
    }));
    toast({
      title: "Ambulance #AMB-04 Dispatched",
      description: "Paramedic crew en-route to Lokhandwala GPS coordinates with active telemetry stream.",
    });
  };

  // 19.3 Handlers
  const handleResolveVendorImplant = () => {
    setSurgeryReadiness(100);
    setSurgeryWorkflow((prev) => ({
      ...prev,
      status: "Active",
      blockerReason: undefined,
      currentStep: 8,
      steps: prev.steps.map((s) => (s.stepNumber === 6 ? { ...s, status: "completed", completedAt: new Date().toISOString(), completedBy: "Orthotech Logistics (Delivered)" } : s.stepNumber === 7 ? { ...s, status: "completed", completedAt: new Date().toISOString(), completedBy: "OT Coordinator (100% Ready)" } : s.stepNumber === 8 ? { ...s, status: "in-progress" } : s)),
    }));
    toast({
      title: "Vendor Implant Delivered & Verified",
      description: "Readiness score reached 100%. OT Room Scheduling is now unlocked!",
    });
  };

  const handleScheduleOtRoom = () => {
    const validation = validateOtScheduling(surgeryReadiness);
    if (!validation.canSchedule) {
      toast({
        variant: "destructive",
        title: "OT Scheduling Blocked by Sequencing Guard (19.3 Rule 1)",
        description: validation.errorReason,
      });
      return;
    }
    setSurgeryWorkflow((prev) => ({
      ...prev,
      currentStep: 9,
      status: "Completed",
      steps: prev.steps.map((s) => (s.stepNumber === 8 ? { ...s, status: "completed", completedAt: new Date().toISOString(), completedBy: "OT Manager (Main OR 1)" } : s.stepNumber === 9 ? { ...s, status: "in-progress" } : s)),
    }));
    toast({
      title: "Main OR 1 Scheduled & Locked",
      description: "Case #CASE-409 booked from 14:30 - 17:00. Post-op PACU handover pathway instantiated.",
    });
  };

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Core Hospital Workflows (Cross-Module Sequences)"
        description="End-to-end multi-module operational sequence engine enforcing mandatory ordering, readiness gates, and cross-departmental traceability."
        crumbs={[{ label: "Care Coordination" }, { label: "Patient Journey" }, { label: "Core Workflows" }]}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Cross-Module Workflow Sequencing Engine" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
          <span>PRD Section 19 • 3 Core Sequences • Enforcing Zero Out-of-Order Execution</span>
        </div>
      </div>

      <Tabs value={activeWorkflowTab} onValueChange={(v) => setActiveWorkflowTab(v as any)} className="w-full">
        <TabsList className="grid grid-cols-4 w-full h-11 max-w-4xl p-1 bg-muted/60">
          <TabsTrigger value="19.1" className="text-xs font-semibold flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5 text-primary" />
            <span className="hidden sm:inline">19.1: Patient ➔ Treatment</span>
            <span className="sm:hidden">19.1 Treatment</span>
          </TabsTrigger>
          <TabsTrigger value="19.2" className="text-xs font-semibold flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-rose-600" />
            <span className="hidden sm:inline">19.2: Emergency SOS</span>
            <span className="sm:hidden">19.2 SOS</span>
          </TabsTrigger>
          <TabsTrigger value="19.3" className="text-xs font-semibold flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-purple-600" />
            <span className="hidden sm:inline">19.3: Surgery ➔ Vendor</span>
            <span className="sm:hidden">19.3 Surgery</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="text-xs font-semibold flex items-center gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
            <span className="hidden sm:inline">Sequencing Rules Matrix</span>
            <span className="sm:hidden">Rules</span>
          </TabsTrigger>
        </TabsList>

        {/* ========================================================================= */}
        {/* TAB 1: 19.1 PATIENT -> HOSPITAL -> TREATMENT                              */}
        {/* ========================================================================= */}
        <TabsContent value="19.1" className="space-y-4 mt-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-3 border-b border-border/60 bg-muted/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-bold text-foreground">
                      19.1 Patient ➔ Hospital ➔ Treatment Care Pathway
                    </CardTitle>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-mono text-[10px]">
                      10-STEP SEQUENCE
                    </Badge>
                    <Badge variant={patientWorkflow.status === "Completed" ? "default" : "secondary"} className="text-[10px]">
                      {patientWorkflow.status.toUpperCase()}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs mt-0.5">
                    Patient: <strong>{patientWorkflow.patientName}</strong> ({patientWorkflow.qlynoPatientId}) • Case Ref: <strong>{patientWorkflow.caseId}</strong>
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="h-8 text-xs font-semibold" asChild>
                    <Link href="/hospital-admin/patients">
                      <Users className="h-3.5 w-3.5 mr-1" /> Open Patient Hub
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {/* INTERACTIVE CONTROLS FOR SEQUENCING SIMULATION */}
              <div className="p-3 bg-muted/20 rounded-xl border border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-foreground block">Simulate Stage Transitions &amp; Rule Enforcement:</span>
                  <p className="text-muted-foreground text-[11px]">
                    Test the guard against out-of-order execution (e.g. attempting discharge with unsettled billing balance).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {patientWorkflow.currentStep === 6 && (
                    <Button size="sm" onClick={handleCompleteLabMedication} className="h-8 text-xs font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Complete Lab &amp; Tasks (Step 6)
                    </Button>
                  )}

                  <div className="flex items-center gap-2 bg-background p-1 rounded-lg border border-border">
                    <span className="text-[11px] font-mono px-2 text-muted-foreground">
                      Outstanding: ₹{patientOutstanding.toLocaleString("en-IN")}
                    </span>
                    <Button
                      size="sm"
                      variant={patientOutstanding > 0 ? "outline" : "secondary"}
                      className="h-6 text-[10px] px-2"
                      onClick={() => setPatientOutstanding((prev) => (prev > 0 ? 0 : 14500))}
                    >
                      {patientOutstanding > 0 ? "Clear Dues (₹0)" : "Add Dues (₹14.5k)"}
                    </Button>
                    <Button
                      size="sm"
                      variant={patientClinicalSignoff ? "secondary" : "outline"}
                      className="h-6 text-[10px] px-2"
                      onClick={() => setPatientClinicalSignoff((prev) => !prev)}
                    >
                      {patientClinicalSignoff ? "Sign-off: Yes" : "Sign-off: No"}
                    </Button>
                  </div>

                  <Button
                    size="sm"
                    variant={patientWorkflow.status === "Completed" ? "secondary" : "default"}
                    onClick={handleTestDischarge}
                    className="h-8 text-xs font-semibold"
                  >
                    Execute Step 9: Discharge
                  </Button>
                </div>
              </div>

              {/* 10-STEP SEQUENCE TIMELINE CARDS */}
              <div className="space-y-2">
                {patientWorkflow.steps.map((step) => {
                  const isDone = step.status === "completed";
                  const isCurrent = step.status === "in-progress";

                  return (
                    <div
                      key={step.stepNumber}
                      className={cn(
                        "p-3 rounded-lg border text-xs transition-all flex items-start justify-between gap-3",
                        isDone && "bg-teal-500/[0.03] border-teal-500/30",
                        isCurrent && "bg-primary/[0.04] border-primary shadow-xs ring-1 ring-primary/20",
                        step.status === "pending" && "bg-background border-border/60 opacity-70"
                      )}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={cn(
                            "h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5",
                            isDone && "bg-teal-600 text-white",
                            isCurrent && "bg-primary text-primary-foreground animate-pulse",
                            step.status === "pending" && "bg-muted text-muted-foreground"
                          )}
                        >
                          {step.stepNumber}
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground text-sm">{step.title}</span>
                            <Badge variant="outline" className="text-[10px] font-mono">
                              {step.module}
                            </Badge>
                            <Badge
                              variant={isDone ? "default" : isCurrent ? "secondary" : "outline"}
                              className={cn(
                                "text-[9px] uppercase font-mono",
                                isDone && "bg-teal-600 text-white hover:bg-teal-600"
                              )}
                            >
                              {step.status}
                            </Badge>
                          </div>

                          <p className="text-muted-foreground text-xs">{step.description}</p>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground pt-1">
                            <span>Role: <strong>{step.responsibleRole}</strong></span>
                            {step.completedBy && <span>Signed By: <strong>{step.completedBy}</strong></span>}
                            {step.completedAt && <span>Timestamp: <strong>{formatDateTime(step.completedAt)}</strong></span>}
                          </div>
                        </div>
                      </div>

                      <Button size="sm" variant="ghost" className="h-7 text-xs font-semibold shrink-0" asChild>
                        <Link href={step.moduleRoute}>
                          Open Module &rarr;
                        </Link>
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 2: 19.2 EMERGENCY SOS -> HOSPITAL RESPONSE                            */}
        {/* ========================================================================= */}
        <TabsContent value="19.2" className="space-y-4 mt-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-3 border-b border-border/60 bg-rose-500/[0.03]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-bold text-rose-600 flex items-center gap-1.5">
                      <Flame className="h-4 w-4" /> 19.2 Emergency SOS ➔ Treating Hospital Sequence
                    </CardTitle>
                    <Badge variant="outline" className="bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30 font-mono text-[10px]">
                      10-STEP SEQUENCE
                    </Badge>
                    <Badge variant="destructive" className="text-[10px]">
                      CODE RED ACTIVE
                    </Badge>
                  </div>
                  <CardDescription className="text-xs mt-0.5">
                    Case #<strong>{sosWorkflow.caseId}</strong> • Patient: <strong>{sosWorkflow.patientName}</strong> ({sosWorkflow.qlynoPatientId}) • GPS: Lokhandwala Complex
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="h-8 text-xs font-semibold text-destructive border-destructive/30" asChild>
                    <Link href="/hospital-admin/emergency">
                      <Siren className="h-3.5 w-3.5 mr-1" /> Open Emergency Board
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {/* EMERGENCY CONTROLS & SLA MONITOR */}
              <div className="p-3 bg-rose-500/[0.05] rounded-xl border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-300">
                    <Clock className="h-4 w-4" />
                    <span>ER Acknowledgment SLA Target: &lt; 120s • Acknowledged in 32s (PASSED)</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    Sequencing Rule 19.2.1: Ambulance dispatch is strictly gated until formal alert acknowledgment is verified.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={alertAck ? "secondary" : "outline"}
                    className="h-8 text-xs font-semibold"
                    onClick={() => setAlertAck((prev) => !prev)}
                  >
                    {alertAck ? "Alert Ack: Verified" : "Alert Ack: Pending"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleDispatchAmbulance}
                    className="h-8 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white"
                  >
                    <Truck className="h-3.5 w-3.5 mr-1" /> Step 6: Dispatch Ambulance
                  </Button>
                </div>
              </div>

              {/* 10-STEP EMERGENCY TIMELINE */}
              <div className="space-y-2">
                {sosWorkflow.steps.map((step) => {
                  const isDone = step.status === "completed";
                  const isCurrent = step.status === "in-progress";

                  return (
                    <div
                      key={step.stepNumber}
                      className={cn(
                        "p-3 rounded-lg border text-xs transition-all flex items-start justify-between gap-3",
                        isDone && "bg-rose-500/[0.03] border-rose-500/30",
                        isCurrent && "bg-rose-500/[0.08] border-rose-500 shadow-xs ring-1 ring-rose-500/30",
                        step.status === "pending" && "bg-background border-border/60 opacity-70"
                      )}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={cn(
                            "h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5",
                            isDone && "bg-rose-600 text-white",
                            isCurrent && "bg-rose-600 text-white animate-pulse",
                            step.status === "pending" && "bg-muted text-muted-foreground"
                          )}
                        >
                          {step.stepNumber}
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground text-sm">{step.title}</span>
                            <Badge variant="outline" className="text-[10px] font-mono">
                              {step.module}
                            </Badge>
                            <Badge
                              variant={isDone ? "default" : isCurrent ? "destructive" : "outline"}
                              className={cn(
                                "text-[9px] uppercase font-mono",
                                isDone && "bg-rose-600 text-white hover:bg-rose-600"
                              )}
                            >
                              {step.status}
                            </Badge>
                          </div>

                          <p className="text-muted-foreground text-xs">{step.description}</p>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground pt-1">
                            <span>Role: <strong>{step.responsibleRole}</strong></span>
                            {step.completedBy && <span>Operator: <strong>{step.completedBy}</strong></span>}
                            {step.completedAt && <span>Timestamp: <strong>{formatDateTime(step.completedAt)}</strong></span>}
                          </div>
                        </div>
                      </div>

                      <Button size="sm" variant="ghost" className="h-7 text-xs font-semibold shrink-0" asChild>
                        <Link href={step.moduleRoute}>
                          Open Module &rarr;
                        </Link>
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 3: 19.3 SURGERY -> SURGEON + VENDOR                                   */}
        {/* ========================================================================= */}
        <TabsContent value="19.3" className="space-y-4 mt-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-3 border-b border-border/60 bg-purple-500/[0.03]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                      <Zap className="h-4 w-4" /> 19.3 Surgery ➔ Surgeon + Vendor Dependency Sequence
                    </CardTitle>
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30 font-mono text-[10px]">
                      9-STEP SEQUENCE
                    </Badge>
                    <Badge
                      variant={surgeryReadiness === 100 ? "default" : "destructive"}
                      className={cn(
                        "text-[10px] font-mono",
                        surgeryReadiness === 100 ? "bg-teal-600 text-white" : ""
                      )}
                    >
                      READINESS: {surgeryReadiness}% ({surgeryReadiness === 100 ? "READY" : "BLOCKED"})
                    </Badge>
                  </div>
                  <CardDescription className="text-xs mt-0.5">
                    Case #<strong>{surgeryWorkflow.caseId}</strong> • Total Knee Arthroplasty • Lead Surgeon: <strong>Dr. Ramesh Sharma</strong>
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="h-8 text-xs font-semibold" asChild>
                    <Link href="/hospital-admin/surgical-cases">
                      <ExternalLink className="h-3.5 w-3.5 mr-1" /> Open Surgical Desk
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {/* DEPENDENCY GATING ALERT */}
              {surgeryReadiness < 100 ? (
                <Alert className="border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="font-bold text-xs">OT Scheduling Lock Active (Sequencing Rule 19.3.1)</AlertTitle>
                  <AlertDescription className="text-xs mt-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <span>
                      Missing Dependency: <strong>Titanium Knee Implant Set (PO-2026-8801 from Orthotech Implants)</strong>.
                      OT slot booking is blocked until 100% readiness is resolved.
                    </span>
                    <Button
                      size="sm"
                      onClick={handleResolveVendorImplant}
                      className="h-7 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shrink-0"
                    >
                      <ShoppingBag className="h-3 w-3 mr-1" /> Receive Vendor Delivery (Unblock)
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-teal-500/40 bg-teal-500/10 text-teal-900 dark:text-teal-200">
                  <ShieldCheck className="h-4 w-4 text-teal-600" />
                  <AlertTitle className="font-bold text-xs">All Surgical Dependencies Resolved (100% Ready)</AlertTitle>
                  <AlertDescription className="text-xs mt-1 flex items-center justify-between">
                    <span>Surgeon locked, blood cross-matched, implant delivered, consent verified. Ready for OT Scheduling.</span>
                    <Button
                      size="sm"
                      onClick={handleScheduleOtRoom}
                      className="h-7 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      <Zap className="h-3 w-3 mr-1" /> Step 8: Book &amp; Lock OT-201
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {/* 9-STEP SURGERY TIMELINE */}
              <div className="space-y-2">
                {surgeryWorkflow.steps.map((step) => {
                  const isDone = step.status === "completed";
                  const isCurrent = step.status === "in-progress";
                  const isBlocked = step.status === "blocked";

                  return (
                    <div
                      key={step.stepNumber}
                      className={cn(
                        "p-3 rounded-lg border text-xs transition-all flex items-start justify-between gap-3",
                        isDone && "bg-purple-500/[0.03] border-purple-500/30",
                        isCurrent && "bg-purple-500/[0.08] border-purple-500 shadow-xs ring-1 ring-purple-500/30",
                        isBlocked && "bg-amber-500/[0.06] border-amber-500/40",
                        step.status === "pending" && "bg-background border-border/60 opacity-70"
                      )}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={cn(
                            "h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5",
                            isDone && "bg-purple-600 text-white",
                            isCurrent && "bg-purple-600 text-white animate-pulse",
                            isBlocked && "bg-amber-600 text-white",
                            step.status === "pending" && "bg-muted text-muted-foreground"
                          )}
                        >
                          {step.stepNumber}
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground text-sm">{step.title}</span>
                            <Badge variant="outline" className="text-[10px] font-mono">
                              {step.module}
                            </Badge>
                            <Badge
                              variant={isDone ? "default" : isBlocked ? "destructive" : "outline"}
                              className={cn(
                                "text-[9px] uppercase font-mono",
                                isDone && "bg-purple-600 text-white hover:bg-purple-600"
                              )}
                            >
                              {step.status}
                            </Badge>
                          </div>

                          <p className="text-muted-foreground text-xs">{step.description}</p>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground pt-1">
                            <span>Role: <strong>{step.responsibleRole}</strong></span>
                            {step.completedBy && <span>Signed By: <strong>{step.completedBy}</strong></span>}
                            {step.completedAt && <span>Timestamp: <strong>{formatDateTime(step.completedAt)}</strong></span>}
                          </div>
                        </div>
                      </div>

                      <Button size="sm" variant="ghost" className="h-7 text-xs font-semibold shrink-0" asChild>
                        <Link href={step.moduleRoute}>
                          Open Module &rarr;
                        </Link>
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 4: SEQUENCING RULES AUDIT MATRIX                                      */}
        {/* ========================================================================= */}
        <TabsContent value="audit" className="space-y-4 mt-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-600" /> Module 19: Sequencing Violation Prevention Matrix
              </CardTitle>
              <CardDescription className="text-xs">
                Formal constraints governing state transitions between Modules 5 through 18.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 19.1 VIOLATIONS */}
                <div className="p-3 bg-muted/20 rounded-xl border border-border/70 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                    <UserCheck className="h-4 w-4 text-primary" />
                    <span>19.1 Patient Violations Prevented</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                    <li className="flex items-start gap-1.5">
                      <span className="text-destructive font-bold">❌</span>
                      <span>Creating new patient identity before searching master Qlyno registry.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-destructive font-bold">❌</span>
                      <span>Entering OPD/IPD/ER care before reception check-in is complete.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-destructive font-bold">❌</span>
                      <span>Executing patient discharge before billing &amp; clinical sign-off conclude.</span>
                    </li>
                  </ul>
                </div>

                {/* 19.2 VIOLATIONS */}
                <div className="p-3 bg-muted/20 rounded-xl border border-border/70 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                    <Flame className="h-4 w-4 text-rose-600" />
                    <span>19.2 SOS Violations Prevented</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                    <li className="flex items-start gap-1.5">
                      <span className="text-destructive font-bold">❌</span>
                      <span>Dispatching ambulance before alert is formally acknowledged by ER.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-destructive font-bold">❌</span>
                      <span>Closing emergency event before clinical trauma handoff is complete.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-destructive font-bold">❌</span>
                      <span>Closing event without binding emergency record to patient master file.</span>
                    </li>
                  </ul>
                </div>

                {/* 19.3 VIOLATIONS */}
                <div className="p-3 bg-muted/20 rounded-xl border border-border/70 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                    <Zap className="h-4 w-4 text-purple-600" />
                    <span>19.3 Surgery Violations Prevented</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                    <li className="flex items-start gap-1.5">
                      <span className="text-destructive font-bold">❌</span>
                      <span>Scheduling OT suite before readiness dependencies are 100% complete.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-destructive font-bold">❌</span>
                      <span>Dispatching surgeon/vendor RFQs without evaluating readiness dependencies.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-destructive font-bold">❌</span>
                      <span>Skipping post-op PACU &amp; nursing task creation upon surgery completion.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
