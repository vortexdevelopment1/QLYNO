"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  AlertOctagon,
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Filter,
  Layers,
  MapPin,
  PhoneCall,
  Radio,
  Search,
  ShieldAlert,
  ShieldCheck,
  User,
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
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { RadiologyNav } from "@/hospital-admin/components/radiology/radiology-nav";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { mockCriticalFindingLogs } from "@/hospital-admin/lib/mock-data/radiology-extended-operations";
import { CriticalFindingLog } from "@/hospital-admin/lib/types";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Critical Findings Escalation workflow";

export default function RadiologyCriticalFindingsPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [logs, setLogs] = useState<CriticalFindingLog[]>(mockCriticalFindingLogs);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Clinician Acknowledgment Modal State
  const [ackModalOpen, setAckModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<CriticalFindingLog | null>(null);
  const [acknowledgedBy, setAcknowledgedBy] = useState("Dr. Arvind Swaminathan (Attending Intensivist)");
  const [notificationMethod, setNotificationMethod] = useState<"Phone" | "Direct Consultation" | "Emergency Escalation Center">("Phone");
  const [escalationNotes, setEscalationNotes] = useState("Spoke directly with attending doctor. Emergency medical intervention initiated.");

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchesSearch =
        l.orderNo.toLowerCase().includes(search.toLowerCase()) ||
        l.patientName.toLowerCase().includes(search.toLowerCase()) ||
        l.uhid.toLowerCase().includes(search.toLowerCase()) ||
        l.criticalDetails.toLowerCase().includes(search.toLowerCase()) ||
        l.orderingDoctor.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "acknowledged" && l.acknowledged) ||
        (statusFilter === "unacknowledged" && !l.acknowledged);
      return matchesSearch && matchesStatus;
    });
  }, [logs, search, statusFilter]);

  const handleOpenAck = (log: CriticalFindingLog) => {
    setSelectedLog(log);
    setAcknowledgedBy(`Dr. ${log.orderingDoctor.replace(/^Dr\.\s*/, "")} (Attending Physician)`);
    setAckModalOpen(true);
  };

  const handleConfirmAck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLog) return;

    const timestamp = new Date().toISOString();

    setLogs((prev) =>
      prev.map((l) =>
        l.id === selectedLog.id
          ? {
              ...l,
              acknowledged: true,
              acknowledgedBy,
              acknowledgedAt: timestamp,
              clinicianNotified: true,
              notificationMethod,
              escalationNotes,
            }
          : l
      )
    );

    toast({
      title: "Clinician Notification Acknowledged & Logged",
      description: `Critical alert for ${selectedLog.patientName} (${selectedLog.orderNo}) confirmed with ${acknowledgedBy}. Audit trail updated. (${DELEGATION_STRING})`,
    });
    setAckModalOpen(false);
    setSelectedLog(null);
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Critical Radiological Findings Audit Log"
          description="Persistent audit trail of life-threatening radiological panic findings, escalation tracking, and clinician acknowledgments."
          crumbs={[{ label: "Clinical Operations" }, { label: "Radiology", href: "/hospital-admin/radiology" }, { label: "Critical Findings" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading critical findings audit log...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Critical Radiological Findings Audit Log"
        description="Persistent audit trail of life-threatening radiological panic findings, escalation tracking, and clinician acknowledgments."
        crumbs={[{ label: "Clinical Operations" }, { label: "Radiology", href: "/hospital-admin/radiology" }, { label: "Critical Findings" }]}
      />

      <RadiologyNav />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Emergency Diagnostic Escalation Desk" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-destructive" />
          <span>STAT Critical Protocol: Critical findings are permanently logged and alert through Emergency escalation</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Panic Findings</span>
          <p className="text-xl font-bold font-mono text-destructive mt-0.5">{logs.length} Incidents</p>
          <span className="text-[10px] text-muted-foreground">Past 48 hours</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Clinician Confirmed</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
            {logs.filter((l) => l.acknowledged).length} Confirmed
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Direct verbal confirmation</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Pending Clinician Contact</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">
            {logs.filter((l) => !l.acknowledged).length} Awaiting
          </p>
          <span className="text-[10px] text-rose-600 font-medium">Immediate escalation required</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Average Escalation Time</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">&lt; 3.8 Mins</p>
          <span className="text-[10px] text-cyan-600 font-medium">NABH benchmark (&lt; 15 mins)</span>
        </Card>
      </div>

      {/* Findings Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Persistent Emergency Panic Findings Register</CardTitle>
          <CardDescription className="text-xs">
            Review detailed radiological findings, communication logs, and confirm direct physician acknowledgments.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patient, finding, doctor..."
                className="pl-8 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] text-xs h-9">
                  <SelectValue placeholder="Notification Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Incidents</SelectItem>
                  <SelectItem value="acknowledged">Clinician Confirmed</SelectItem>
                  <SelectItem value="unacknowledged">Pending Contact</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold w-[120px]">Order #</TableHead>
                  <TableHead className="text-xs font-bold w-[220px]">Patient Details &amp; Location</TableHead>
                  <TableHead className="text-xs font-bold w-[200px]">Modality &amp; Study</TableHead>
                  <TableHead className="text-xs font-bold min-w-[260px] max-w-[340px]">Critical Panic Finding</TableHead>
                  <TableHead className="text-xs font-bold w-[180px]">Ordering Physician</TableHead>
                  <TableHead className="text-xs font-bold w-[160px]">Escalation Status</TableHead>
                  <TableHead className="text-xs font-bold text-right w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-destructive">
                      {log.orderNo}
                    </TableCell>
                    <TableCell className="max-w-[220px]">
                      <div className="font-semibold text-xs text-foreground truncate">{log.patientName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono truncate">
                        {log.uhid} • <span className="text-destructive font-sans font-semibold">{log.patientLocation}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="text-xs font-medium text-foreground truncate">{log.bodyPart}</div>
                      <div className="text-[10px] text-muted-foreground">{log.modality} • {log.reportingRadiologist.split(",")[0]}</div>
                    </TableCell>
                    <TableCell className="min-w-[260px] max-w-[340px]">
                      <div className="text-xs font-bold text-destructive break-words whitespace-normal leading-relaxed">
                        {log.criticalDetails}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-medium max-w-[180px]">
                      <span className="truncate block">{log.orderingDoctor}</span>
                    </TableCell>
                    <TableCell>
                      {log.acknowledged ? (
                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] flex items-center gap-1 w-fit">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" /> Confirmed
                        </Badge>
                      ) : (
                        <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px] animate-pulse">
                          Pending Contact
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!log.acknowledged ? (
                        <Button
                          size="sm"
                          className="h-7 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white"
                          onClick={() => handleOpenAck(log)}
                        >
                          <PhoneCall className="h-3.5 w-3.5 mr-1" /> Confirm Contact
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-muted-foreground font-medium"
                          onClick={() => handleOpenAck(log)}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" /> View Audit
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Confirm Clinician Contact Modal */}
      <Dialog open={ackModalOpen} onOpenChange={setAckModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleConfirmAck}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-destructive">
                <AlertOctagon className="h-5 w-5 text-destructive" /> Clinician Emergency Notification Audit
              </DialogTitle>
              <DialogDescription className="text-xs">
                Log critical panic finding communication for {selectedLog?.patientName} ({selectedLog?.orderNo}).
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-3 text-xs">
              <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Patient &amp; Bed:</span>
                  <span className="font-bold text-foreground">{selectedLog?.patientName} ({selectedLog?.patientLocation})</span>
                </div>
                <div className="text-[11px] text-destructive font-semibold mt-1">
                  {selectedLog?.criticalDetails}
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="ack-by">Acknowledging Clinician / Physician *</Label>
                <Input
                  id="ack-by"
                  required
                  value={acknowledgedBy}
                  onChange={(e) => setAcknowledgedBy(e.target.value)}
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="ack-met">Escalation Communication Channel *</Label>
                <Select value={notificationMethod} onValueChange={(v) => setNotificationMethod(v as any)}>
                  <SelectTrigger id="ack-met" className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Phone">Direct Emergency Phone Call</SelectItem>
                    <SelectItem value="Direct Consultation">Bedside / In-Person Consultation</SelectItem>
                    <SelectItem value="Emergency Escalation Center">Hospital Emergency Notification Center (Module 16)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="ack-not">Clinical Escalation Notes *</Label>
                <Input
                  id="ack-not"
                  required
                  value={escalationNotes}
                  onChange={(e) => setEscalationNotes(e.target.value)}
                />
              </div>

              <div className="p-2.5 rounded-md border border-border bg-muted/20 text-muted-foreground text-[11px]">
                Audit Protocol: Critical clinician communication timestamps are permanently logged in the electronic audit trail.
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setAckModalOpen(false)}>
                Close
              </Button>
              <Button type="submit" size="sm" className="bg-destructive text-destructive-foreground">
                Confirm &amp; Audit Alert
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
