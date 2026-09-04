"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Phone,
  Siren,
  MapPin,
  Stethoscope,
  FileText,
  AlertTriangle,
  Play,
  Ambulance,
  ArrowRightLeft,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Send,
  UserCheck,
  Building,
  Check,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/hospital-admin/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/hospital-admin/components/ui/dialog";
import { Label } from "@/hospital-admin/components/ui/label";
import { Input } from "@/hospital-admin/components/ui/input";
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import { Checkbox } from "@/hospital-admin/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/hospital-admin/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { StatusBadge } from "@/hospital-admin/components/shared/status-badge";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { RootState } from "@/hospital-admin/store/store";
import {
  acknowledgeCase,
  updateCaseStatus,
  triggerFallback,
  escalateCase,
  EmergencyStatus,
} from "@/hospital-admin/store/slices/emergencySlice";
import { DispatchCreationModal } from "@/hospital-admin/components/ambulance/DispatchCreationModal";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { formatDateTime } from "@/hospital-admin/lib/utils";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Emergency workflow";

const TIMELINE_STEPS = [
  { status: "SOS Created", label: "SOS Alert Activated", icon: Siren },
  { status: "Hospital Notified", label: "Hospital Notified", icon: Building },
  { status: "Acknowledged", label: "Admin Receipt Acknowledged", icon: CheckCircle2 },
  { status: "Ambulance Dispatched", label: "Ambulance Dispatched", icon: Ambulance },
  { status: "Pre-Arrival", label: "Pre-Arrival Preparation", icon: Stethoscope },
  { status: "Arrived", label: "Patient Arrived at ER", icon: MapPin },
  { status: "Closed", label: "Case Handed Off & Closed", icon: FileText },
];

const PRE_APPROVED_FAMILY_TEMPLATES = [
  { id: "tmpl-1", title: "Ambulance En Route", text: "Emergency update: Ambulance has been dispatched to patient location. Tracking is active." },
  { id: "tmpl-2", title: "Arrived at Emergency Room", text: "Emergency update: Patient has arrived safely at Qlyno Emergency Room. Triage team is attending." },
  { id: "tmpl-3", title: "Under Treatment / Stabilized", text: "Emergency update: Patient is admitted to emergency care under observation. Attending staff will provide further updates." },
  { id: "tmpl-4", title: "Hospital Transfer Notice", text: "Emergency update: Patient is being transferred to connected partner facility for specialized care." },
];

export default function EmergencyCaseDetail() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const emergencyCase = useSelector((state: RootState) => state.emergency.cases.find((c) => c.id === id));
  const auditLogs = useSelector((state: RootState) => state.emergency.auditLogs.filter((l) => l.caseId === id));

  const [showAckModal, setShowAckModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showFallbackModal, setShowFallbackModal] = useState(false);

  // Modals state
  const [closeReason, setCloseReason] = useState("");
  const [escalateReason, setEscalateReason] = useState("");
  const [escalateRole, setEscalateRole] = useState("Clinical Lead (Dr. Ananya Rao)");
  const [fallbackHospitalName, setFallbackHospitalName] = useState("Apollo Spectra Hospital (Chembur)");
  const [fallbackReason, setFallbackReason] = useState("ER at 100% capacity - No ICU bed available");
  const [handoffConfirmed, setHandoffConfirmed] = useState(false);

  // Family alerts state
  const [selectedFamilyTemplate, setSelectedFamilyTemplate] = useState(PRE_APPROVED_FAMILY_TEMPLATES[0].id);
  const [familyLogs, setFamilyLogs] = useState([
    {
      id: 1,
      template: "SOS Initial Dispatch",
      message: "Initial SOS Alert Received. Response unit mobilized.",
      status: "Delivered",
      time: emergencyCase ? new Date(emergencyCase.createdAt).toLocaleTimeString() : "10:00 AM",
      recipient: emergencyCase?.emergencyContact?.phone || "+91 98201 44550",
    },
  ]);

  if (!emergencyCase) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Emergency Case Not Found</h2>
        <p className="text-sm text-muted-foreground">The requested SOS identifier does not exist or has been archived.</p>
        <Button variant="outline" onClick={() => router.push("/hospital-admin/emergency")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Return to Emergency Command
        </Button>
      </div>
    );
  }

  const isDispatchActive =
    emergencyCase.status === "Ambulance Dispatched" || emergencyCase.status === "Pre-Arrival";

  const handleAcknowledge = () => {
    dispatch(
      acknowledgeCase({
        id: emergencyCase.id,
        actor: "Performed by Hospital Admin • acting within Emergency workflow",
      })
    );
    toast({
      title: "Case Receipt Acknowledged",
      description: `SLA timer halted. Case routed to clinical emergency team. (${DELEGATION_STRING})`,
    });
    setShowAckModal(false);
  };

  const handleAdvanceStatus = (nextStatus: EmergencyStatus) => {
    dispatch(
      updateCaseStatus({
        id: emergencyCase.id,
        status: nextStatus,
        actor: "Performed by Hospital Admin • acting within Emergency workflow",
      })
    );
    toast({
      title: `Status Updated to ${nextStatus}`,
      description: `Emergency workflow advanced to '${nextStatus}'. (${DELEGATION_STRING})`,
    });
  };

  const handleCloseCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoffConfirmed) {
      toast({
        title: "Handoff Confirmation Required",
        description: "You must confirm that the clinical handoff is complete before closing.",
        variant: "destructive",
      });
      return;
    }

    if (isDispatchActive) {
      toast({
        title: "Closure Blocked — Active Dispatch",
        description: "Ambulance transport is still in progress. Wait for patient arrival or reassign before closing.",
        variant: "destructive",
      });
      return;
    }

    dispatch(
      updateCaseStatus({
        id: emergencyCase.id,
        status: "Closed",
        actor: "Performed by Hospital Admin • acting within Emergency workflow",
        details: `Closed by Admin. Reason: ${closeReason}. Clinical handoff verified.`,
      })
    );
    toast({
      title: "Case Closed & Handed Off",
      description: `Case ${emergencyCase.id} successfully finalized. (${DELEGATION_STRING})`,
    });
    setShowCloseModal(false);
  };

  const handleEscalate = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(
      escalateCase({
        id: emergencyCase.id,
        targetRole: escalateRole,
        reason: escalateReason,
        actor: "Performed by Hospital Admin • acting within Emergency workflow",
      })
    );
    toast({
      title: "Emergency Case Escalated",
      description: `Escalated to ${escalateRole}. (${DELEGATION_STRING})`,
      variant: "destructive",
    });
    setShowEscalateModal(false);
  };

  const handleTriggerFallback = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(
      triggerFallback({
        id: emergencyCase.id,
        fallbackHospital: fallbackHospitalName,
        reason: fallbackReason,
        actor: "Performed by Hospital Admin • acting within Emergency workflow",
      })
    );
    toast({
      title: "Fallback Routing Activated",
      description: `Patient re-routed to ${fallbackHospitalName}. Original destination retained in audit trail. (${DELEGATION_STRING})`,
    });
    setShowFallbackModal(false);
  };

  const handleSendFamilyAlert = () => {
    const template = PRE_APPROVED_FAMILY_TEMPLATES.find((t) => t.id === selectedFamilyTemplate);
    if (!template) return;

    setFamilyLogs((prev) => [
      ...prev,
      {
        id: Date.now(),
        template: template.title,
        message: template.text,
        status: "Delivered (SMS/WhatsApp)",
        time: new Date().toLocaleTimeString(),
        recipient: emergencyCase.emergencyContact?.phone || "+91 98201 44550",
      },
    ]);

    toast({
      title: "Approved Family Notification Sent",
      description: `Delivered '${template.title}' to ${emergencyCase.emergencyContact?.name || "Emergency Contact"}. (${DELEGATION_STRING})`,
    });
  };

  // Determine current timeline progress index
  const currentStepIndex = TIMELINE_STEPS.findIndex((s) => s.status === emergencyCase.status);

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/hospital-admin/emergency">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Emergency Case {emergencyCase.id}
              </h1>
              <StatusBadge status={emergencyCase.priority} />
              <Badge
                variant="outline"
                className={`text-xs ${
                  emergencyCase.flowType.includes("Flow A")
                    ? "border-blue-400 text-blue-700 dark:text-blue-300"
                    : "border-purple-400 text-purple-700 dark:text-purple-300"
                }`}
              >
                {emergencyCase.flowType}
              </Badge>
              <Badge
                variant={
                  emergencyCase.status === "Hospital Notified"
                    ? "destructive"
                    : emergencyCase.status === "Closed"
                    ? "outline"
                    : "secondary"
                }
              >
                {emergencyCase.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5" suppressHydrationWarning>
              Initiated on {formatDateTime(emergencyCase.createdAt)} • Assigned to{" "}
              <strong className="text-foreground">{emergencyCase.assignedTeam || "Triage Desk"}</strong>
            </p>
          </div>
        </div>

        {/* Action Buttons Header */}
        <div className="flex flex-wrap items-center gap-2">
          {emergencyCase.status === "Hospital Notified" && (
            <Button
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => setShowAckModal(true)}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" /> Acknowledge Alert
            </Button>
          )}

          {emergencyCase.status === "Acknowledged" && !emergencyCase.ambulanceId && (
            <Button onClick={() => setShowDispatchModal(true)}>
              <Ambulance className="mr-2 h-4 w-4" /> Dispatch Ambulance
            </Button>
          )}

          {emergencyCase.status === "Ambulance Dispatched" && (
            <Button variant="outline" onClick={() => handleAdvanceStatus("Pre-Arrival")}>
              <Stethoscope className="mr-2 h-4 w-4" /> Trigger Pre-Arrival Prep
            </Button>
          )}

          {emergencyCase.status === "Pre-Arrival" && (
            <Button onClick={() => handleAdvanceStatus("Arrived")}>
              <MapPin className="mr-2 h-4 w-4" /> Mark Patient Arrived
            </Button>
          )}

          <Button variant="outline" onClick={() => setShowFallbackModal(true)}>
            <ArrowRightLeft className="mr-2 h-4 w-4" /> Fallback / Transfer
          </Button>

          <Button variant="outline" onClick={() => setShowEscalateModal(true)}>
            <AlertTriangle className="mr-2 h-4 w-4 text-warning" /> Escalate
          </Button>

          {emergencyCase.status !== "Closed" && (
            <Button variant="secondary" onClick={() => setShowCloseModal(true)}>
              <Check className="mr-2 h-4 w-4" /> Finalize & Close
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Emergency Case Management" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-warning" />
          <span>Non-clinical operational routing • Clinical handoff required before closure</span>
        </div>
      </div>

      {/* Pre-Arrival Readiness Banner */}
      {emergencyCase.status === "Pre-Arrival" && (
        <Alert className="border-blue-400 bg-blue-50/70 dark:border-blue-900 dark:bg-blue-950/30">
          <Stethoscope className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-950 dark:text-blue-200 font-semibold">
            Pre-Arrival Readiness Protocol Activated
          </AlertTitle>
          <AlertDescription className="text-xs text-blue-900 dark:text-blue-300">
            Resuscitation Bay 1 has been pre-allocated. Clinical Emergency Lead and Trauma Response Team are on standby for immediate intake.
          </AlertDescription>
        </Alert>
      )}

      {/* Fallback Dual Hospital Notice (Edge Case #2) */}
      {emergencyCase.fallbackTriggered && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive">
          <ArrowRightLeft className="h-4 w-4" />
          <AlertTitle className="font-semibold">Fallback Routing Triggered Mid-Flow</AlertTitle>
          <AlertDescription className="text-xs">
            <strong>Original Destination:</strong> {emergencyCase.originalHospital || "Qlyno Multispecialty Hospital"} →{" "}
            <strong>Fallback Partner:</strong> {emergencyCase.fallbackHospital}. All audit entries preserve both facilities.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Details, Timeline, Family Alerts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Details Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Patient Demographics & Incident Location</span>
                <span className="text-xs font-normal text-muted-foreground">
                  Contact: {emergencyCase.phone || "Not Provided"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Patient Name</p>
                <p className="font-medium text-foreground">
                  {emergencyCase.patientName} {emergencyCase.age ? `• ${emergencyCase.age} yrs (${emergencyCase.gender})` : ""}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Incident Location</p>
                <p className="font-medium text-foreground flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-destructive" /> {emergencyCase.location}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Destination Facility</p>
                <p className="font-medium text-foreground">{emergencyCase.destinationHospital}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Emergency Contact (Family)</p>
                <p className="font-medium text-foreground">
                  {emergencyCase.emergencyContact?.name} ({emergencyCase.emergencyContact?.relation}) • {emergencyCase.emergencyContact?.phone}
                </p>
              </div>
              <div className="sm:col-span-2 p-2.5 rounded bg-muted/40 border border-border">
                <p className="text-xs font-semibold text-foreground">Chief Complaint / Triage Note:</p>
                <p className="text-xs text-muted-foreground mt-0.5 italic">
                  "{emergencyCase.chiefComplaint || "Emergency SOS beacon triggered without voice description."}"
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Module 22: Emergency Pre-Arrival Packet & Care Continuity Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Feature 2: Emergency Pre-Arrival Packet */}
            <Card className="border-rose-500/30 bg-rose-500/5 shadow-xs">
              <CardHeader className="p-3.5 pb-2 border-b border-rose-500/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                    <Stethoscope className="h-3.5 w-3.5" /> Pre-Arrival Telemetry Packet
                  </CardTitle>
                  <Badge variant="outline" className="text-[9px] bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30">
                    PROPOSED (PRD 22)
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-3.5 space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-card border border-border">
                    <span className="text-[10px] text-muted-foreground block">Telemetry Vitals</span>
                    <span className="font-mono font-bold text-foreground">HR: 114 | SpO2: 93%</span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">BP: 168/102 mmHg</span>
                  </div>
                  <div className="p-2 rounded bg-card border border-border">
                    <span className="text-[10px] text-muted-foreground block">Trauma Bay Prep</span>
                    <span className="font-semibold text-primary">Bay 01 (Pre-Cleared)</span>
                    <span className="text-[10px] text-rose-600 block mt-0.5 font-bold">ETA: ~7 Mins</span>
                  </div>
                </div>
                <div className="p-2 rounded bg-muted/40 border border-border text-[10px] text-muted-foreground">
                  <strong>Known Allergies:</strong> <span className="text-rose-600 font-semibold">Penicillin, NSAIDs</span> • Blood Group: <span className="font-bold text-foreground">O+</span>
                </div>
              </CardContent>
            </Card>

            {/* Feature 5: Care Continuity Card */}
            <Card className="border-blue-500/30 bg-blue-500/5 shadow-xs">
              <CardHeader className="p-3.5 pb-2 border-b border-blue-500/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" /> Care Continuity & Treatment History
                  </CardTitle>
                  <Badge variant="outline" className="text-[9px] bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30">
                    PROPOSED (PRD 22)
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-3.5 space-y-2 text-xs">
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Primary Treating Doctor:</span>
                    <span className="font-semibold text-foreground">Dr. Arvind Swaminathan</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Specialty / Unit:</span>
                    <span className="text-primary font-medium">Interventional Cardiology</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Care Case:</span>
                    <span className="font-mono text-[10px] text-foreground">CARE-2026-0891 (CAD Post-PTCA)</span>
                  </div>
                </div>
                <div className="p-1.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-800 dark:text-blue-200">
                  ✓ Qlyno Patient Consent Authenticated: Clinical history auto-unmasked for attending emergency physician.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stepper / Visual Case Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Emergency Lifecycle Timeline</span>
                <Badge variant="outline" className="text-xs">Logged Event Sequence</Badge>
              </CardTitle>
              <CardDescription>
                Chronological progression from SOS creation through acknowledgment, transport, and closure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-border">
                {TIMELINE_STEPS.map((step, index) => {
                  const isCompleted = currentStepIndex >= index;
                  const isCurrent = currentStepIndex === index;
                  const Icon = step.icon;

                  return (
                    <div key={step.status} className="relative flex items-start gap-4 pl-1">
                      <div
                        className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors z-10 ${
                          isCurrent
                            ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                            : isCompleted
                            ? "bg-success text-success-foreground"
                            : "bg-muted text-muted-foreground border border-border"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 pt-0.5">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-semibold ${isCurrent ? "text-primary" : "text-foreground"}`}>
                            {step.label}
                          </p>
                          {isCompleted && (
                            <span className="text-xs text-muted-foreground">Completed</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {step.status === "SOS Created" && "Alert generated via app/call."}
                          {step.status === "Hospital Notified" && "High-priority routing dispatched to Hospital Emergency Desk."}
                          {step.status === "Acknowledged" && "Admin receipt confirmed. Routed to attending clinical team."}
                          {step.status === "Ambulance Dispatched" && (emergencyCase.ambulanceId ? `Fleet vehicle ${emergencyCase.ambulanceId} en route.` : "Transport mobilized.")}
                          {step.status === "Pre-Arrival" && "ER bay and trauma team on standby."}
                          {step.status === "Arrived" && "Patient arrived at hospital ER bay."}
                          {step.status === "Closed" && "Clinical handoff completed and case archived."}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Approved Family Notification Panel */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Family Status Notification Panel</span>
                <Badge variant="outline" className="text-xs">Pre-Approved Templates Only (Rule 41.3)</Badge>
              </CardTitle>
              <CardDescription>
                Send pre-configured operational status updates to registered emergency contacts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3 items-end">
                <div className="sm:col-span-2 grid gap-1.5">
                  <Label htmlFor="family-tmpl">Select Approved Template</Label>
                  <Select value={selectedFamilyTemplate} onValueChange={setSelectedFamilyTemplate}>
                    <SelectTrigger id="family-tmpl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRE_APPROVED_FAMILY_TEMPLATES.map((tmpl) => (
                        <SelectItem key={tmpl.id} value={tmpl.id}>
                          {tmpl.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSendFamilyAlert} className="w-full">
                  <Send className="mr-2 h-4 w-4" /> Trigger Family SMS
                </Button>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Transmission Delivery Log
                </h4>
                <div className="space-y-2">
                  {familyLogs.map((log) => (
                    <div key={log.id} className="text-xs p-2.5 rounded border border-border bg-muted/20 flex items-center justify-between gap-2">
                      <div>
                        <span className="font-semibold text-foreground">{log.template}: </span>
                        <span className="text-muted-foreground">{log.message}</span>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          Sent to {log.recipient} at {log.time}
                        </div>
                      </div>
                      <Badge variant="success" className="text-[10px] shrink-0">
                        {log.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Case Audit Trail & Escalation Log */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Case Audit Trail</span>
                <Badge variant="secondary" className="text-xs">{auditLogs.length} events</Badge>
              </CardTitle>
              <CardDescription>Immutable event log for this emergency case</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-y-auto divide-y divide-border">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground font-mono">
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span className="truncate max-w-[140px]">{log.actor.split("•")[0]}</span>
                    </div>
                    <p className="font-medium text-foreground">{log.action}</p>
                    {log.details && (
                      <p className="text-muted-foreground text-[11px]">{log.details}</p>
                    )}
                  </div>
                ))}
                {auditLogs.length === 0 && (
                  <div className="p-6 text-center text-xs text-muted-foreground">
                    No audit records logged yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SLA Response Metric */}
          <Card className="bg-muted/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" /> Accountability Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2 text-muted-foreground">
              <div className="flex justify-between">
                <span>Priority SLA Target:</span>
                <span className="font-medium text-foreground">
                  {emergencyCase.priority === "Critical" ? "5 Mins" : emergencyCase.priority === "High" ? "15 Mins" : "30 Mins"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>SLA Status:</span>
                <span className={emergencyCase.slaBreached ? "text-destructive font-bold" : "text-success font-semibold"}>
                  {emergencyCase.slaBreached ? "Breached & Escalated" : "Compliant / Active"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Accountable Owner:</span>
                <span className="font-medium text-foreground">{emergencyCase.assignedTeam || "Triage Desk"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ACKNOWLEDGE MODAL */}
      <Dialog open={showAckModal} onOpenChange={setShowAckModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" /> Confirm Administrative Acknowledgment
            </DialogTitle>
            <DialogDescription>
              Acknowledge receipt to stop the SLA timer and hand off alert notification to clinical emergency triage.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-sm">
            <div className="p-3 bg-muted/40 rounded-lg border border-border space-y-1">
              <p className="font-semibold text-foreground">Patient: {emergencyCase.patientName}</p>
              <p className="text-xs text-muted-foreground">Location: {emergencyCase.location}</p>
              <p className="text-xs text-muted-foreground">Priority: {emergencyCase.priority}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              This action verifies that an operational administrator has accepted the alert. It does not replace medical diagnosis.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAckModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAcknowledge}>
              Acknowledge & Notify Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ESCALATE MODAL */}
      <Dialog open={showEscalateModal} onOpenChange={setShowEscalateModal}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleEscalate}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" /> Escalate Emergency Case
              </DialogTitle>
              <DialogDescription>
                Manually push alert to higher supervisory authority in the escalation ladder.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-3">
              <div className="grid gap-1.5">
                <Label htmlFor="esc-role">Target Escalation Role</Label>
                <Select value={escalateRole} onValueChange={setEscalateRole}>
                  <SelectTrigger id="esc-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Emergency Coordinator (Suresh Menon)">Emergency Coordinator (Suresh Menon)</SelectItem>
                    <SelectItem value="Clinical Lead (Dr. Ananya Rao)">Clinical Lead (Dr. Ananya Rao)</SelectItem>
                    <SelectItem value="Hospital Admin Director">Hospital Admin Director (Pager Broadcast)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="esc-reason">Escalation Justification</Label>
                <Input
                  id="esc-reason"
                  placeholder="e.g. Inbound trauma requiring second surgical team"
                  value={escalateReason}
                  onChange={(e) => setEscalateReason(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEscalateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive">
                Escalate Alert
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* FALLBACK MODAL */}
      <Dialog open={showFallbackModal} onOpenChange={setShowFallbackModal}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleTriggerFallback}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-primary" /> Trigger Fallback / Transfer Routing
              </DialogTitle>
              <DialogDescription>
                Re-route incoming emergency to connected partner hospital when local capacity is unavailable.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-3">
              <div className="grid gap-1.5">
                <Label htmlFor="fb-hosp">Partner Fallback Hospital</Label>
                <Select value={fallbackHospitalName} onValueChange={setFallbackHospitalName}>
                  <SelectTrigger id="fb-hosp">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Apollo Spectra Hospital (Chembur)">Apollo Spectra Hospital (Chembur)</SelectItem>
                    <SelectItem value="Fortis Hospital (Mulund)">Fortis Hospital (Mulund)</SelectItem>
                    <SelectItem value="Hinduja Healthcare (Khar)">Hinduja Healthcare (Khar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="fb-reason">Reason for Fallback</Label>
                <Input
                  id="fb-reason"
                  value={fallbackReason}
                  onChange={(e) => setFallbackReason(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground bg-muted/40 p-2 rounded">
                <strong>PRD Edge Case Rule:</strong> Both the primary hospital ({emergencyCase.destinationHospital}) and fallback hospital will be preserved in the timeline and audit log.
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowFallbackModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Confirm Fallback Re-route
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CLOSURE MODAL (WITH HANDOFF GATE) */}
      <Dialog open={showCloseModal} onOpenChange={setShowCloseModal}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleCloseCase}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" /> Finalize & Close Emergency Event
              </DialogTitle>
              <DialogDescription>
                Close emergency tracking only after responsible clinical handoff is complete.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-3">
              {isDispatchActive && (
                <Alert variant="destructive" className="text-xs">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="font-semibold">Closure Blocked (Active Transport)</AlertTitle>
                  <AlertDescription>
                    Ambulance dispatch is still in progress. You must wait for patient arrival before closing.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-1.5">
                <Label htmlFor="close-reason">Closure Reason & Handoff Summary</Label>
                <Textarea
                  id="close-reason"
                  placeholder="e.g. Patient received at ER Triage, handoff completed to Dr. Rajesh Sharma."
                  value={closeReason}
                  onChange={(e) => setCloseReason(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-start space-x-2 pt-2">
                <Checkbox
                  id="handoff"
                  checked={handoffConfirmed}
                  onCheckedChange={(checked) => setHandoffConfirmed(Boolean(checked))}
                />
                <div className="grid gap-1 leading-none">
                  <label
                    htmlFor="handoff"
                    className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground"
                  >
                    Confirm clinical handoff is complete
                  </label>
                  <p className="text-[11px] text-muted-foreground">
                    Required per Rule #41.2 before closing administrative workflow.
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCloseModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!handoffConfirmed || isDispatchActive}>
                Confirm Case Closure
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DISPATCH AMBULANCE MODAL INTEGRATION */}
      {showDispatchModal && (
        <DispatchCreationModal
          open={showDispatchModal}
          onOpenChange={setShowDispatchModal}
          caseId={emergencyCase.id}
        />
      )}
    </div>
  );
}
