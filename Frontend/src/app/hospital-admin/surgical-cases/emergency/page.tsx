"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Building,
  CheckCircle2,
  Clock,
  HeartPulse,
  Radio,
  Scissors,
  Send,
  Shield,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/hospital-admin/components/ui/button";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/hospital-admin/components/ui/select";
import { Checkbox } from "@/hospital-admin/components/ui/checkbox";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { SurgicalNav } from "@/hospital-admin/components/surgical/surgical-nav";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { createEmergencySurgery } from "@/hospital-admin/store/slices/surgicalSlice";
import { cn } from "@/hospital-admin/lib/utils";

export default function EmergencySurgeryPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { toast } = useToast();
  const { otRooms, surgeons } = useSelector((state: RootState) => state.surgical);

  // Form State
  const [patientName, setPatientName] = useState("Kunal Singhania");
  const [emergencyUHID, setEmergencyUHID] = useState("EMG-2026-8812");
  const [procedureType, setProcedureType] = useState("Emergency Exploratory Laparotomy & Hemostasis");
  const [department, setDepartment] = useState("Emergency");
  const [selectedRoomId, setSelectedRoomId] = useState(
    otRooms.find((r) => r.status === "Available")?.id || "OT-202"
  );
  const [authorizingDoctor, setAuthorizingDoctor] = useState("Dr. Rohan Mehta (Trauma Lead)");
  const [overrideReason, setOverrideReason] = useState(
    "Active intra-abdominal hemorrhage with hemodynamic instability. Immediate life-saving surgical intervention mandated."
  );
  const [leadSurgeon, setLeadSurgeon] = useState("Dr. Rohan Mehta");
  const [leadAnesthetist, setLeadAnesthetist] = useState("Dr. Arvind Joshi");
  const [leadScrubNurse, setLeadScrubNurse] = useState("Sister Anjali Bhosale");

  // Checklist acknowledgments
  const [bloodVerified, setBloodVerified] = useState(true);
  const [anesthesiaVerified, setAnesthesiaVerified] = useState(true);
  const [waiverAcknowledged, setWaiverAcknowledged] = useState(true);

  // Available Rooms for Priority Search
  const availableRooms = otRooms.filter((r) => r.status === "Available");

  const handleLaunchEmergencySurgery = (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientName.trim() || !procedureType.trim() || !authorizingDoctor.trim()) {
      toast({ title: "Missing Required Fields", description: "Fill in all emergency parameters.", variant: "destructive" });
      return;
    }

    if (!bloodVerified || !anesthesiaVerified) {
      toast({
        title: "Life-Critical Verification Required",
        description: "Patient Safety Standard: Blood availability and Anesthesia clearance cannot be bypassed.",
        variant: "destructive",
      });
      return;
    }

    if (!waiverAcknowledged || !overrideReason.trim()) {
      toast({
        title: "Mandatory Waiver Reason",
        description: "Emergency Override Protocol: You must record both a clinical justification and the authorizing senior clinician.",
        variant: "destructive",
      });
      return;
    }

    dispatch(
      createEmergencySurgery({
        patientName: patientName.trim(),
        procedureType: procedureType.trim(),
        department,
        roomId: selectedRoomId,
        authorizingDoctor: authorizingDoctor.trim(),
        overrideReason: overrideReason.trim(),
        team: [leadSurgeon, leadAnesthetist, leadScrubNurse],
      })
    );

    toast({
      title: "🚨 EMERGENCY SURGERY LAUNCHED",
      description: `Suite ${selectedRoomId} reserved. Auto-notifications dispatched to Trauma Team, Anesthesia & OT Coordinator.`,
    });

    router.push("/hospital-admin/ot-scheduling");
  };

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Emergency Fast-Track Surgery Desk"
        description="Immediate clinical override & rapid OT allocation for life-threatening and Priority-1 trauma cases."
        crumbs={[{ label: "OT & Surgeries" }, { label: "Emergency Surgery" }]}
        actions={
          <Badge className="bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40 text-xs px-3 py-1 animate-pulse">
            🚨 Code Red • Priority 1 Fast-Track
          </Badge>
        }
      />

      <SurgicalNav />

      {/* Emergency Warning Banner */}
      <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-950 dark:text-rose-200 flex items-start gap-3">
        <AlertOctagon className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <strong className="text-sm font-bold text-rose-700 dark:text-rose-300 block">
            Emergency Surgical Override Protocol Active
          </strong>
          <p className="leading-relaxed">
            This fast-track pipeline bypasses standard elective pre-op waiting queues. Non-life-critical diagnostics and paperwork are logged as <strong>Waived — Emergency Override</strong> with clinical audit timestamps.
          </p>
        </div>
      </div>

      <form onSubmit={handleLaunchEmergencySurgery} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Column 1: Patient & Case Intake */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="p-4 pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-rose-600" /> Patient Emergency Intake
              </CardTitle>
              <CardDescription className="text-xs">
                Link to Emergency Department case or new trauma admission.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Patient Full Name *</Label>
                <Input
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Patient Name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Emergency UHID</Label>
                  <Input value={emergencyUHID} onChange={(e) => setEmergencyUHID(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Specialty</Label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Emergency">Emergency Trauma</SelectItem>
                      <SelectItem value="General Surgery">General Surgery</SelectItem>
                      <SelectItem value="Cardiology">Cardiothoracic</SelectItem>
                      <SelectItem value="Neurology">Neurosurgery</SelectItem>
                      <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Emergency Surgical Procedure *</Label>
                <Input
                  value={procedureType}
                  onChange={(e) => setProcedureType(e.target.value)}
                  placeholder="e.g. Emergency Craniotomy, Laparotomy"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Column 2: Priority Room & Surgical Team */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="p-4 pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Building className="h-4 w-4 text-primary" /> Priority Room &amp; Team
              </CardTitle>
              <CardDescription className="text-xs">
                Surfaces nearest available OT suite and rapid response roster.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Target Operating Suite *</Label>
                <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                  <SelectTrigger className="h-9 text-xs font-semibold">
                    <SelectValue placeholder="Select Available Room" />
                  </SelectTrigger>
                  <SelectContent>
                    {otRooms.map((r) => (
                      <SelectItem key={r.id} value={r.id} className="text-xs">
                        {r.name} — {r.status} {r.status === "Available" ? "⚡ (Ready)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableRooms.length > 0 ? (
                  <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
                    <CheckCircle2 className="h-3 w-3" /> {availableRooms.length} suites currently ready for immediate entry.
                  </p>
                ) : (
                  <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3 w-3" /> All ORs occupied; expedited turnover required.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Lead Trauma Surgeon</Label>
                <Input value={leadSurgeon} onChange={(e) => setLeadSurgeon(e.target.value)} required />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Anesthesiologist</Label>
                  <Input value={leadAnesthetist} onChange={(e) => setLeadAnesthetist(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Scrub Nurse</Label>
                  <Input value={leadScrubNurse} onChange={(e) => setLeadScrubNurse(e.target.value)} required />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Column 3: Clinical Override & Mandatory Checklist */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="p-4 pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-600" /> Life-Critical Checklist &amp; Waiver
              </CardTitle>
              <CardDescription className="text-xs">
                Strict governance per Emergency Surgery Clinical Safety Protocols.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {/* Life Critical Checkboxes */}
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block">
                  Mandatory Life-Critical (Cannot Be Waived)
                </span>
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <Checkbox
                    checked={bloodVerified}
                    onCheckedChange={(val) => setBloodVerified(!!val)}
                  />
                  <span>Emergency Uncrossed / O-Neg Blood Verified</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <Checkbox
                    checked={anesthesiaVerified}
                    onCheckedChange={(val) => setAnesthesiaVerified(!!val)}
                  />
                  <span>Rapid Sequence Induction PAC Clearance</span>
                </label>
              </div>

              {/* Clinical Waiver Justification */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Authorizing Specialist *</Label>
                <Input
                  value={authorizingDoctor}
                  onChange={(e) => setAuthorizingDoctor(e.target.value)}
                  placeholder="e.g. Dr. Rohan Mehta (Trauma Head)"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Waiver Clinical Justification *</Label>
                <Textarea
                  rows={2}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <label className="flex items-start gap-2 text-xs font-medium cursor-pointer pt-1">
                <Checkbox
                  checked={waiverAcknowledged}
                  onCheckedChange={(val) => setWaiverAcknowledged(!!val)}
                  className="mt-0.5"
                />
                <span className="text-muted-foreground text-[11px]">
                  I confirm this emergency override is authorized by the attending consultant under hospital emergency protocols.
                </span>
              </label>
            </CardContent>
          </Card>
        </div>

        {/* Action Button Strip */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" type="button" asChild>
            <Link href="/hospital-admin/ot-scheduling">Cancel</Link>
          </Button>
          <Button
            type="submit"
            size="lg"
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold gap-2 shadow-md"
          >
            <Zap className="h-4 w-4" /> Launch Emergency Surgery &amp; Broadcast Alert
          </Button>
        </div>
      </form>
    </div>
  );
}
