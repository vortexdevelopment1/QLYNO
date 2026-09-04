"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Flame,
  KeyRound,
  Lock,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Timer,
  Unlock,
  Zap,
} from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/hospital-admin/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { SecurityNav } from "@/hospital-admin/components/security/security-nav";
import { StepUpAuthModal } from "@/hospital-admin/components/security/step-up-auth-modal";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { formatDateTime } from "@/hospital-admin/lib/utils";
import { mockBreakGlassSessions } from "@/hospital-admin/lib/mock-data/security-operations";
import { BreakGlassSession } from "@/hospital-admin/lib/types";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Emergency Break-Glass Access workflow";

export default function BreakGlassSecurityPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [sessions, setSessions] = useState<BreakGlassSession[]>(mockBreakGlassSessions);

  // Request Form Modal State
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requesterName, setRequesterName] = useState("Dr. Arvind Swaminathan");
  const [requesterRole, setRequesterRole] = useState("Pulmonologist & Critical Care Attending");
  const [patientId, setPatientId] = useState("PAT-00918");
  const [patientName, setPatientName] = useState("Rameshwar Patil (Trauma Red Bay)");
  const [resourceScope, setResourceScope] = useState("Full Unrestricted EMR Chart & Prior Cardiac Angiogram PACS");
  const [reason, setReason] = useState("Massive acute hemothorax following road traffic collision. Immediate emergency thoracotomy required without prior TPA consent delay.");
  const [durationMinutes, setDurationMinutes] = useState("240");

  // Step-Up Modal State
  const [stepUpOpen, setStepUpOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenGrantModal = () => {
    setRequestModalOpen(true);
  };

  const handleProceedToStepUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast({
        title: "Mandatory Reason Required",
        description: "Break-Glass Policy: Emergency record override requires a recorded life-critical justification.",
        variant: "destructive",
      });
      return;
    }

    setRequestModalOpen(false);
    setStepUpOpen(true);
  };

  const handleCommitBreakGlass = (adminReason: string) => {
    const mins = Number(durationMinutes);
    const expires = new Date(Date.now() + mins * 60000).toISOString();

    const newSession: BreakGlassSession = {
      id: `bg_${Date.now()}`,
      tokenNo: `BG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      requesterId: `DOC-${Math.floor(100 + Math.random() * 900)}`,
      requesterName,
      requesterRole,
      targetPatientId: patientId,
      targetPatientName: patientName,
      resourceScope,
      reason,
      grantedAt: new Date().toISOString(),
      expiresAt: expires,
      durationMinutes: mins,
      status: "Active",
    };

    setSessions((prev) => [newSession, ...prev]);

    toast({
      title: "Break-Glass Token Issued",
      description: `Token ${newSession.tokenNo} active for ${mins / 60} hours. Hard auto-cutoff scheduled. (${DELEGATION_STRING})`,
    });
  };

  const handleRevokeEarly = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              status: "Revoked" as const,
              revokedAt: new Date().toISOString(),
              revokedBy: "Akash Sharma (Hospital Admin)",
            }
          : s
      )
    );

    const target = sessions.find((s) => s.id === sessionId);
    toast({
      title: "Break-Glass Access Revoked Early",
      description: `Emergency token ${target?.tokenNo} immediately terminated. EMR permissions restricted. (${DELEGATION_STRING})`,
      variant: "destructive",
    });
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Break-Glass Emergency Access Panel"
          description="Time-limited clinical access elevation for emergency triage and critical interventions with hard auto-cutoff."
          crumbs={[{ label: "Administration" }, { label: "Security", href: "/hospital-admin/roles" }, { label: "Break-Glass" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading break-glass console...
        </div>
      </div>
    );
  }

  const activeCount = sessions.filter((s) => s.status === "Active").length;
  const expiredCount = sessions.filter((s) => s.status === "Expired").length;
  const revokedCount = sessions.filter((s) => s.status === "Revoked").length;

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Break-Glass Emergency Access Panel"
        description="Time-limited clinical access elevation for emergency triage and critical interventions with hard auto-cutoff."
        crumbs={[{ label: "Administration" }, { label: "Security", href: "/hospital-admin/roles" }, { label: "Break-Glass" }]}
        actions={
          <Button
            size="sm"
            className="gap-1.5 font-semibold text-xs bg-rose-600 text-white hover:bg-rose-700 shadow-xs"
            onClick={handleOpenGrantModal}
          >
            <Flame className="h-4 w-4" /> Grant Break-Glass Override
          </Button>
        }
      />

      <SecurityNav />

      {/* Scope Indicator & Rules 14-CAN-22 to 25 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Emergency Override Governance Desk" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
          <span>Rules 14-CAN-22 to 25: Mandatory clinical reason + duration + hard auto-cutoff (Edge Case 2)</span>
        </div>
      </div>

      {/* Active Break-Glass Alert Banner */}
      {activeCount > 0 && (
        <Card className="border-rose-500/40 bg-rose-500/10 shadow-xs">
          <CardContent className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Flame className="h-6 w-6 text-rose-600 shrink-0 animate-pulse" />
              <div>
                <p className="text-xs font-bold text-rose-900 dark:text-rose-300">
                  ACTIVE BREAK-GLASS OVERRIDE: {activeCount} Emergency Access Channel(s) Open
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Elevated EMR and diagnostic permissions are currently active. All clinical reads, chart writes, and PACS exports are undergoing real-time audit logging.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Active Overrides</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">{activeCount} Sessions</p>
          <span className="text-[10px] text-rose-600 font-medium">Ticking countdown active</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Auto-Expired Sessions</span>
          <p className="text-xl font-bold font-mono text-muted-foreground mt-0.5">{expiredCount} Expired</p>
          <span className="text-[10px] text-muted-foreground">Hard cutoff enforced</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Early Revoked</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{revokedCount} Sessions</p>
          <span className="text-[10px] text-amber-600 font-medium">Manual admin termination</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Audit Immutability</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">100% Audited</p>
          <span className="text-[10px] text-emerald-600 font-medium">Mandatory reason logged</span>
        </Card>
      </div>

      {/* Break-Glass Sessions Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Break-Glass Emergency Access Audit Registry</CardTitle>
          <CardDescription className="text-xs">
            Review emergency access authorizations, target patients, clinical justifications, and hard auto-cutoff timestamps.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold w-[130px]">Token #</TableHead>
                  <TableHead className="text-xs font-bold w-[200px]">Requester &amp; Role</TableHead>
                  <TableHead className="text-xs font-bold w-[200px]">Target Patient / Subject</TableHead>
                  <TableHead className="text-xs font-bold w-[220px]">Mandatory Clinical Reason</TableHead>
                  <TableHead className="text-xs font-bold w-[150px]">Duration &amp; Expiry</TableHead>
                  <TableHead className="text-xs font-bold w-[120px]">Status</TableHead>
                  <TableHead className="text-xs font-bold text-right w-[120px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((s) => (
                  <TableRow
                    key={s.id}
                    className={`hover:bg-muted/30 transition-colors ${
                      s.status === "Active" ? "bg-rose-500/5" : ""
                    }`}
                  >
                    <TableCell className="font-mono text-xs font-bold text-rose-600">
                      {s.tokenNo}
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-xs text-foreground">{s.requesterName}</div>
                      <div className="text-[10px] text-muted-foreground">{s.requesterRole}</div>
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-xs text-foreground">{s.targetPatientName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{s.targetPatientId}</div>
                    </TableCell>

                    <TableCell>
                      <p className="text-xs text-foreground leading-relaxed line-clamp-2 italic">
                        &ldquo;{s.reason}&rdquo;
                      </p>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5 text-xs font-mono">
                        <div className="flex items-center gap-1 text-foreground">
                          <Timer className="h-3 w-3 text-rose-600" />
                          <span>{s.durationMinutes} mins total</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Exp: {formatDateTime(s.expiresAt)}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={
                          s.status === "Active"
                            ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px] animate-pulse"
                            : s.status === "Expired"
                            ? "bg-muted text-muted-foreground text-[10px]"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                        }
                      >
                        {s.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      {s.status === "Active" ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 text-xs font-semibold"
                          onClick={() => handleRevokeEarly(s.id)}
                        >
                          Revoke Early
                        </Button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">Closed</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* MODAL: GRANT BREAK-GLASS OVERRIDE */}
      <Dialog open={requestModalOpen} onOpenChange={setRequestModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleProceedToStepUp}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-rose-600">
                <Flame className="h-5 w-5" /> Grant Emergency Break-Glass Access
              </DialogTitle>
              <DialogDescription className="text-xs">
                Temporarily expands clinical EMR permissions for acute resuscitation per PRD Section 14.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-3 text-xs">
              <div className="p-2.5 rounded border border-rose-500/30 bg-rose-500/10 text-rose-900 dark:text-rose-300 text-[11px] space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <AlertOctagon className="h-3.5 w-3.5" /> Clinical Accountability &amp; Strict Audit Gate
                </span>
                <p>
                  Rules 14-CANNOT-1 &amp; 2: Reason and duration are mandatory. All chart views and actions during this window are highlighted in the audit log.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="bg-req">Requesting Clinician *</Label>
                  <Input
                    id="bg-req"
                    required
                    value={requesterName}
                    onChange={(e) => setRequesterName(e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="bg-role">Clinician Role *</Label>
                  <Input
                    id="bg-role"
                    required
                    value={requesterRole}
                    onChange={(e) => setRequesterRole(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="bg-pid">Patient ID / MRN *</Label>
                  <Input
                    id="bg-pid"
                    required
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="bg-pname">Patient Name / Triage Bay *</Label>
                  <Input
                    id="bg-pname"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="bg-dur">Override Duration (Hard Auto-Cutoff) *</Label>
                <Select value={durationMinutes} onValueChange={setDurationMinutes}>
                  <SelectTrigger id="bg-dur" className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">1 Hour (Acute Resuscitation)</SelectItem>
                    <SelectItem value="120">2 Hours (OT Surgical Window)</SelectItem>
                    <SelectItem value="240">4 Hours (Trauma ICU Stabilization)</SelectItem>
                    <SelectItem value="480">8 Hours (Full Shift Override)</SelectItem>
                    <SelectItem value="1440">24 Hours (Maximum Legal Limit)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="bg-reason">Mandatory Clinical Emergency Justification *</Label>
                <Textarea
                  id="bg-reason"
                  required
                  rows={3}
                  placeholder="Explicit clinical justification for bypassing normal consent gates..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setRequestModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="destructive" className="font-semibold">
                Proceed to Step-Up Security PIN
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* STEP-UP AUTH MODAL */}
      <StepUpAuthModal
        open={stepUpOpen}
        onOpenChange={setStepUpOpen}
        actionTitle="Authorize Emergency Break-Glass Access"
        actionDescription={`Authorizing ${durationMinutes} minutes emergency EMR override for patient ${patientName} (${patientId}).`}
        onConfirm={handleCommitBreakGlass}
      />
    </div>
  );
}
