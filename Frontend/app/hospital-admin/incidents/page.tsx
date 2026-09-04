"use client";

import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Filter,
  Flame,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  Wrench,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { mockOperationalIncidents } from "@/hospital-admin/lib/mock-data/proposed-features";
import {
  OperationalIncident,
  IncidentCategory,
  IncidentSeverity,
  IncidentStatus,
} from "@/hospital-admin/lib/types/proposed-features";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { cn, formatDateTime } from "@/hospital-admin/lib/utils";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Operational Incident Management";

export default function IncidentManagementPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [incidents, setIncidents] = useState<OperationalIncident[]>(mockOperationalIncidents);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Create Incident Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<IncidentCategory>("Equipment Failure");
  const [newSeverity, setNewSeverity] = useState<IncidentSeverity>("P2 - High");
  const [newDepartment, setNewDepartment] = useState("Emergency & Trauma");
  const [newLocation, setNewLocation] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImpact, setNewImpact] = useState("");
  const [newOwner, setNewOwner] = useState("Biomedical Engineering Team");

  // Inspect Modal State
  const [selectedIncident, setSelectedIncident] = useState<OperationalIncident | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) {
      toast({ title: "Missing Fields", description: "Title and description are required.", variant: "destructive" });
      return;
    }

    const newInc: OperationalIncident = {
      id: `inc_${Date.now()}`,
      code: `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title: newTitle.trim(),
      category: newCategory,
      severity: newSeverity,
      status: "Open",
      department: newDepartment,
      location: newLocation.trim() || "Main Campus",
      reporter: "Hospital Admin (Logged via Command Panel)",
      assignedOwner: newOwner,
      createdAt: new Date().toISOString(),
      slaDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      isBreached: false,
      description: newDescription.trim(),
      impact: newImpact.trim() || "Local operational disturbance",
      auditTrail: [
        {
          timestamp: new Date().toISOString(),
          actor: "Hospital Admin",
          action: "Incident Reported",
          note: DELEGATION_STRING,
        },
      ],
    };

    setIncidents((prev) => [newInc, ...prev]);
    setIsCreateOpen(false);
    setNewTitle("");
    setNewDescription("");
    setNewImpact("");
    setNewLocation("");

    toast({
      title: "Incident Logged Successfully",
      description: `${newInc.code} (${newInc.severity}) created and assigned to ${newInc.assignedOwner}. (${DELEGATION_STRING})`,
    });
  };

  const handleResolveIncident = (inc: OperationalIncident) => {
    setIncidents((prev) =>
      prev.map((item) =>
        item.id === inc.id
          ? {
              ...item,
              status: "Resolved",
              resolvedAt: new Date().toISOString(),
              resolutionNotes: resolutionNotes || "Mitigation verified by administrative team.",
              auditTrail: [
                ...item.auditTrail,
                {
                  timestamp: new Date().toISOString(),
                  actor: "Hospital Admin",
                  action: "Incident Resolved",
                  note: `${resolutionNotes || "Mitigation completed."} • ${DELEGATION_STRING}`,
                },
              ],
            }
          : item
      )
    );

    setSelectedIncident(null);
    setResolutionNotes("");

    toast({
      title: "Incident Resolved",
      description: `${inc.code} status marked as Resolved. (${DELEGATION_STRING})`,
    });
  };

  const filteredIncidents = incidents.filter((i) => {
    const matchQuery =
      !searchQuery.trim() ||
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSeverity = selectedSeverity === "all" || i.severity.includes(selectedSeverity);
    const matchStatus = selectedStatus === "all" || i.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchQuery && matchSeverity && matchStatus;
  });

  const p1Count = incidents.filter((i) => i.severity.startsWith("P1") && i.status !== "Resolved").length;
  const openCount = incidents.filter((i) => i.status !== "Resolved" && i.status !== "Closed").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Scope & Header */}
      <div className="flex flex-col gap-2">
        <ScopeIndicator scope="Hospital Admin" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <PageHeader
                title="Operational Incident Management"
                description="Track, triage, and resolve equipment failures, staffing shortages, security events, and patient-flow blockages."
              />
              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30 shrink-0">
                PROPOSED FEATURE (PRD 22)
              </Badge>
            </div>
          </div>

          <Button
            size="sm"
            className="h-8 text-xs bg-primary text-primary-foreground gap-1.5 shrink-0"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" /> Report Incident
          </Button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3 border-border shadow-xs">
          <span className="text-[10px] text-muted-foreground uppercase font-bold">Active P1 Criticals</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">{p1Count}</p>
          <span className="text-[10px] text-rose-600 font-medium">SLA: 1h Resolution Target</span>
        </Card>
        <Card className="p-3 border-border shadow-xs">
          <span className="text-[10px] text-muted-foreground uppercase font-bold">Open Incident Backlog</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{openCount}</p>
          <span className="text-[10px] text-emerald-600 font-medium">100% Assigned to Owners</span>
        </Card>
        <Card className="p-3 border-border shadow-xs">
          <span className="text-[10px] text-muted-foreground uppercase font-bold">Mean Resolution Time</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">38 mins</p>
          <span className="text-[10px] text-emerald-600 font-medium">-12m vs historical SLA</span>
        </Card>
        <Card className="p-3 border-border shadow-xs">
          <span className="text-[10px] text-muted-foreground uppercase font-bold">Auditability Compliance</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">100%</p>
          <span className="text-[10px] text-muted-foreground">Immutable audit stamps</span>
        </Card>
      </div>

      {/* Filter Bar & Incident Registry Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-3 border-b border-border/60 bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search code, title, department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger className="h-8 text-xs w-32">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="P1">P1 - Critical</SelectItem>
                  <SelectItem value="P2">P2 - High</SelectItem>
                  <SelectItem value="P3">P3 - Medium</SelectItem>
                  <SelectItem value="P4">P4 - Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-8 text-xs w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="mitigating">Mitigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 text-xs">
                <TableHead className="w-32">Code</TableHead>
                <TableHead>Incident Title &amp; Category</TableHead>
                <TableHead className="w-28">Severity</TableHead>
                <TableHead className="w-28">Status</TableHead>
                <TableHead>Location &amp; Owner</TableHead>
                <TableHead className="w-36">Reported At</TableHead>
                <TableHead className="text-right w-24">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncidents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-xs">
                    No operational incidents matching filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredIncidents.map((inc) => (
                  <TableRow key={inc.id} className="hover:bg-muted/30 text-xs transition-colors">
                    <TableCell className="font-mono font-bold text-primary">{inc.code}</TableCell>
                    <TableCell>
                      <div className="font-semibold text-foreground">{inc.title}</div>
                      <span className="text-[10px] text-muted-foreground">{inc.category} • {inc.department}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] px-1.5 py-0 h-4 font-semibold",
                          inc.severity.startsWith("P1") && "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 animate-pulse",
                          inc.severity.startsWith("P2") && "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
                          inc.severity.startsWith("P3") && "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
                          inc.severity.startsWith("P4") && "bg-muted text-muted-foreground"
                        )}
                      >
                        {inc.severity.split("-")[0].trim()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={inc.status === "Resolved" ? "secondary" : "default"}
                        className={cn(
                          "text-[9px] px-1.5 py-0 h-4",
                          inc.status === "Resolved" && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        )}
                      >
                        {inc.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-muted-foreground truncate max-w-48">{inc.location}</div>
                      <span className="text-[10px] text-primary font-medium">Owner: {inc.assignedOwner}</span>
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">
                      {formatDateTime(inc.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2"
                        onClick={() => setSelectedIncident(inc)}
                      >
                        Inspect
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog 1: Report Incident Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-rose-600" /> Report Operational Incident
            </DialogTitle>
            <DialogDescription className="text-xs">
              Log an equipment failure, staffing shortage, or flow blockage for immediate dispatch.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateIncident} className="space-y-3 text-xs">
            <div className="space-y-1">
              <Label className="text-[11px]">Incident Title</Label>
              <Input
                placeholder="e.g. ICU Telemetry Oxygen Pressure Drop"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="h-8 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[11px]">Category</Label>
                <Select value={newCategory} onValueChange={(v) => setNewCategory(v as IncidentCategory)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Equipment Failure">Equipment Failure</SelectItem>
                    <SelectItem value="Staffing Shortage">Staffing Shortage</SelectItem>
                    <SelectItem value="Security & Access Event">Security &amp; Access Event</SelectItem>
                    <SelectItem value="Patient Flow Blockage">Patient Flow Blockage</SelectItem>
                    <SelectItem value="Facility & Utilities">Facility &amp; Utilities</SelectItem>
                    <SelectItem value="IT / Network Downtime">IT / Network Downtime</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px]">Severity</Label>
                <Select value={newSeverity} onValueChange={(v) => setNewSeverity(v as IncidentSeverity)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="P1 - Critical">P1 - Critical (SLA: 1h)</SelectItem>
                    <SelectItem value="P2 - High">P2 - High (SLA: 4h)</SelectItem>
                    <SelectItem value="P3 - Medium">P3 - Medium (SLA: 12h)</SelectItem>
                    <SelectItem value="P4 - Low">P4 - Low (SLA: 24h)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[11px]">Department</Label>
                <Select value={newDepartment} onValueChange={setNewDepartment}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Critical Care / ICU">Critical Care / ICU</SelectItem>
                    <SelectItem value="Emergency & Trauma">Emergency &amp; Trauma</SelectItem>
                    <SelectItem value="Operation Theatres">Operation Theatres</SelectItem>
                    <SelectItem value="Reception & OPD">Reception &amp; OPD</SelectItem>
                    <SelectItem value="Central Pharmacy">Central Pharmacy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px]">Location / Room</Label>
                <Input
                  placeholder="e.g. Building B • 3rd Floor"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px]">Assigned Owner Team</Label>
              <Input
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[11px]">Description &amp; Observed Problem</Label>
              <Textarea
                placeholder="Detail the exact telemetry reading, error message, or blockage..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={2}
                className="text-xs resize-none"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[11px]">Operational Impact</Label>
              <Input
                placeholder="e.g. 12 beds on backup manifold; 0 clinical risk"
                value={newImpact}
                onChange={(e) => setNewImpact(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" size="sm" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground">
                Dispatch &amp; Log Incident
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog 2: Inspect & Resolve Modal */}
      {selectedIncident && (
        <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <Badge className="font-mono text-[10px]">{selectedIncident.code}</Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px]",
                    selectedIncident.severity.startsWith("P1") && "text-rose-600 border-rose-500/40",
                    selectedIncident.severity.startsWith("P2") && "text-amber-600 border-amber-500/40"
                  )}
                >
                  {selectedIncident.severity}
                </Badge>
              </div>
              <DialogTitle className="text-sm font-bold mt-1">{selectedIncident.title}</DialogTitle>
              <DialogDescription className="text-xs">
                {selectedIncident.department} • {selectedIncident.location}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded-lg border border-border bg-muted/20 space-y-1">
                <span className="text-[10px] text-muted-foreground font-mono uppercase">Problem Description</span>
                <p className="text-foreground">{selectedIncident.description}</p>
                <div className="pt-1 text-[10px] text-primary">
                  <strong>Impact:</strong> {selectedIncident.impact}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] p-2 bg-card rounded-md border border-border">
                <div>
                  <span className="text-muted-foreground">Reporter:</span>
                  <p className="font-medium">{selectedIncident.reporter}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Assigned Owner:</span>
                  <p className="font-medium text-primary">{selectedIncident.assignedOwner}</p>
                </div>
              </div>

              {/* Audit Timeline */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-muted-foreground font-mono uppercase">Audit &amp; Dispatch Trail</span>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {selectedIncident.auditTrail.map((trail, idx) => (
                    <div key={idx} className="p-1.5 rounded-md bg-muted/40 border border-border text-[10px] space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{trail.action}</span>
                        <span className="text-muted-foreground font-mono">{formatDateTime(trail.timestamp)}</span>
                      </div>
                      <span className="text-muted-foreground block">{trail.actor} {trail.note ? `• ${trail.note}` : ""}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedIncident.status !== "Resolved" && (
                <div className="space-y-1 pt-1">
                  <Label className="text-[11px]">Resolution &amp; Mitigation Notes</Label>
                  <Textarea
                    placeholder="Enter resolution actions, replacement part serial number, or verification findings..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    rows={2}
                    className="text-xs resize-none"
                  />
                </div>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedIncident(null)}>
                Close
              </Button>
              {selectedIncident.status !== "Resolved" && (
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                  onClick={() => handleResolveIncident(selectedIncident)}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Mark Resolved
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
