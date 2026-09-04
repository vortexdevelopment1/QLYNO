"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  CreditCard,
  Flame,
  HeartPulse,
  Lock,
  Pill,
  Plus,
  Scissors,
  ScrollText,
  Search,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Timer,
  Truck,
  UserCheck,
  Users,
  UsersRound,
  Workflow,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/hospital-admin/components/ui/tabs";
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { DelegationActorBadge } from "@/hospital-admin/components/delegation/delegation-actor-badge";
import { ClinicalBoundaryGuard } from "@/hospital-admin/components/delegation/clinical-boundary-guard";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { formatDateTime } from "@/hospital-admin/lib/utils";
import {
  mockAdminDelegationGrants,
  mockDelegationActionLogs,
  mockModuleBoundaries,
} from "@/hospital-admin/lib/mock-data/admin-delegations";
import {
  AdminDelegationGrant,
  DelegationActionLog,
  DelegationCapabilityScope,
} from "@/hospital-admin/lib/types";

const ALL_CAPABILITY_SCOPES: DelegationCapabilityScope[] = [
  "Reception & OPD Routing",
  "Nurse Station & Shift Rostering",
  "Doctor Operational Schedules",
  "Billing & Financial Refunds",
  "Lab & Radiology Operational Status",
  "Pharmacy Inventory & Batches",
  "OT Scheduling & Theatre Logistics",
  "Emergency Escalation & Ambulance",
  "Vendor Procurement Requests",
  "Operational Reports",
];

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Admin Delegation workflow";

export default function AdminDelegationPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("active");
  const [grants, setGrants] = useState<AdminDelegationGrant[]>(mockAdminDelegationGrants);
  const [actionLogs, setActionLogs] = useState<DelegationActionLog[]>(mockDelegationActionLogs);

  // Grant Modal State
  const [grantModalOpen, setGrantModalOpen] = useState(false);
  const [delegateeName, setDelegateeName] = useState("Rajesh Kulkarni");
  const [delegateeRole, setDelegateeRole] = useState("Assistant Operations Manager");
  const [targetRole, setTargetRole] = useState("Reception & Billing Supervisor");
  const [selectedScopes, setSelectedScopes] = useState<DelegationCapabilityScope[]>([
    "Reception & OPD Routing",
    "Billing & Financial Refunds",
  ]);
  const [durationHours, setDurationHours] = useState("16");
  const [reason, setReason] = useState(
    "Weekend duty coverage for front office peak OPD volume and authorized dispute refunds up to ₹25,000."
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggleScope = (scope: DelegationCapabilityScope) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  const handleGrantDelegation = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedScopes.length === 0) {
      toast({
        title: "Capability Scope Required",
        description: "Select at least one scoped capability for this delegation grant.",
        variant: "destructive",
      });
      return;
    }

    if (!reason.trim()) {
      toast({
        title: "Mandatory Reason Required",
        description: "Rule 15-CANNOT-7: Administrative delegation grants require an explicit operational justification.",
        variant: "destructive",
      });
      return;
    }

    const hours = Number(durationHours);
    const expires = new Date(Date.now() + hours * 3600000).toISOString();

    const newGrant: AdminDelegationGrant = {
      id: `del_${Date.now()}`,
      grantToken: `DEL-2026-0${Math.floor(100 + Math.random() * 900)}`,
      grantorName: "Akash Sharma",
      grantorRole: "Hospital Administrator",
      delegateeId: `USR-MGR-0${Math.floor(1 + Math.random() * 9)}`,
      delegateeName,
      delegateeRole,
      targetRole,
      capabilityScopes: selectedScopes,
      reason,
      grantedAt: new Date().toISOString(),
      expiresAt: expires,
      durationHours: hours,
      status: "Active",
      actionsCount: 0,
    };

    setGrants((prev) => [newGrant, ...prev]);

    toast({
      title: "Scoped Capability Delegated",
      description: `Granted ${selectedScopes.length} scoped capabilities to ${delegateeName} for ${hours}h without credential sharing. (${DELEGATION_STRING})`,
    });

    setGrantModalOpen(false);
  };

  const handleRevokeGrant = (grantId: string) => {
    setGrants((prev) =>
      prev.map((g) =>
        g.id === grantId
          ? {
              ...g,
              status: "Revoked" as const,
              revokedAt: new Date().toISOString(),
            }
          : g
      )
    );

    const target = grants.find((g) => g.id === grantId);
    toast({
      title: "Delegation Grant Revoked",
      description: `Terminated operational delegation for ${target?.delegateeName}. Secondary credentials invalidated immediately. (${DELEGATION_STRING})`,
      variant: "destructive",
    });
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Hospital Admin Operational Capability &amp; Delegation Console"
          description="Enforces PRD Section 15: Hospital Admin operational super-role governance without credential sharing or hidden privilege."
          crumbs={[{ label: "Administration" }, { label: "Hospital Admin" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading Hospital Admin console...
        </div>
      </div>
    );
  }

  const activeGrantsCount = grants.filter((g) => g.status === "Active").length;
  const expiredGrantsCount = grants.filter((g) => g.status === "Expired").length;
  const totalActionsExecuted = actionLogs.length;

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Hospital Admin Operational Capability &amp; Delegation Console"
        description="Enforces PRD Section 15: Hospital Admin operational super-role governance without credential sharing or hidden privilege."
        crumbs={[{ label: "Administration" }, { label: "Hospital Admin" }]}
        actions={
          <Button
            size="sm"
            className="gap-1.5 font-semibold text-xs bg-primary text-primary-foreground"
            onClick={() => setGrantModalOpen(true)}
          >
            <Plus className="h-4 w-4" /> Delegate Capability to Manager
          </Button>
        }
      />

      {/* Scope Indicator & Section 15 Governing Principle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Delegated Capability Governance Engine" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Section 15: Recorded as delegated capability, never hidden/impersonated privilege</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Active Delegations</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{activeGrantsCount} Active</p>
          <span className="text-[10px] text-primary font-medium">Without credential sharing</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Clinical Boundaries</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">100% Guarded</p>
          <span className="text-[10px] text-emerald-600 font-medium">Doctor calls non-alterable</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Actions Under Delegation</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">{totalActionsExecuted} Logged</p>
          <span className="text-[10px] text-muted-foreground">Double-attribution tracked</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Expired / Revoked</span>
          <p className="text-xl font-bold font-mono text-muted-foreground mt-0.5">{expiredGrantsCount} Expired</p>
          <span className="text-[10px] text-muted-foreground">Hard auto-cutoff verified</span>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 max-w-lg">
          <TabsTrigger value="active" className="text-xs">Active Delegations</TabsTrigger>
          <TabsTrigger value="audit" className="text-xs">Double-Attribution Logs</TabsTrigger>
          <TabsTrigger value="boundaries" className="text-xs">10-Module Boundary Matrix</TabsTrigger>
        </TabsList>

        {/* TAB 1: ACTIVE DELEGATIONS */}
        <TabsContent value="active" className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Delegated Capability Grants Registry</CardTitle>
              <CardDescription className="text-xs">
                Time-limited capability grants assigned to trusted managers without sharing administrator passwords.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-bold w-[120px]">Grant Token</TableHead>
                      <TableHead className="text-xs font-bold w-[200px]">Delegatee &amp; Role</TableHead>
                      <TableHead className="text-xs font-bold w-[240px]">Delegated Capability Scopes</TableHead>
                      <TableHead className="text-xs font-bold w-[220px]">Mandatory Justification</TableHead>
                      <TableHead className="text-xs font-bold w-[140px]">Duration &amp; Expiry</TableHead>
                      <TableHead className="text-xs font-bold w-[110px]">Status</TableHead>
                      <TableHead className="text-xs font-bold text-right w-[110px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grants.map((g) => (
                      <TableRow key={g.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-mono text-xs font-bold text-primary">
                          {g.grantToken}
                        </TableCell>

                        <TableCell>
                          <div className="font-semibold text-xs text-foreground">{g.delegateeName}</div>
                          <div className="text-[10px] text-muted-foreground">{g.delegateeRole}</div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {g.capabilityScopes.map((scope, idx) => (
                              <Badge key={idx} variant="outline" className="text-[9px] bg-muted/20">
                                {scope}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>

                        <TableCell>
                          <p className="text-xs text-foreground leading-relaxed line-clamp-2 italic">
                            &ldquo;{g.reason}&rdquo;
                          </p>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-0.5 text-xs font-mono">
                            <div className="flex items-center gap-1 text-foreground">
                              <Timer className="h-3 w-3 text-primary" />
                              <span>{g.durationHours}h grant</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              Exp: {formatDateTime(g.expiresAt)}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={
                              g.status === "Active"
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                                : g.status === "Expired"
                                ? "bg-muted text-muted-foreground text-[10px]"
                                : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                            }
                          >
                            {g.status}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          {g.status === "Active" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 font-semibold"
                              onClick={() => handleRevokeGrant(g.id)}
                            >
                              Revoke
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
        </TabsContent>

        {/* TAB 2: DOUBLE-ATTRIBUTION LOGS */}
        <TabsContent value="audit" className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Double-Attribution Operational Action Log</CardTitle>
              <CardDescription className="text-xs">
                Enforces Rule 15 Mandatory Audit Labeling: Action is never falsely attributed to frontline staff or obscured.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-bold w-[140px]">Timestamp</TableHead>
                      <TableHead className="text-xs font-bold w-[180px]">Actor &amp; Context</TableHead>
                      <TableHead className="text-xs font-bold w-[260px]">Operational Action</TableHead>
                      <TableHead className="text-xs font-bold w-[180px]">Entity Target</TableHead>
                      <TableHead className="text-xs font-bold w-[280px]">Mandatory Attribution Label</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {actionLogs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {formatDateTime(log.timestamp)}
                        </TableCell>

                        <TableCell>
                          <div className="font-semibold text-xs text-foreground">{log.actorName}</div>
                          <div className="text-[10px] text-muted-foreground">{log.actorRole}</div>
                        </TableCell>

                        <TableCell>
                          <div className="text-xs font-medium text-foreground">{log.actionDescription}</div>
                          <div className="text-[10px] text-muted-foreground italic">Reason: &ldquo;{log.reason}&rdquo;</div>
                        </TableCell>

                        <TableCell>
                          <div className="text-xs font-medium text-foreground">{log.entity}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{log.entityId}</div>
                        </TableCell>

                        <TableCell>
                          <DelegationActorBadge
                            actorName={log.actorName}
                            workflowRole={log.module}
                            delegatedBy={log.delegatedBy}
                            variant="pill"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: 10-MODULE BOUNDARY MATRIX */}
        <TabsContent value="boundaries" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockModuleBoundaries.map((b) => (
              <Card key={b.module} className="border-border shadow-xs flex flex-col justify-between">
                <CardHeader className="p-3.5 pb-2 border-b border-border">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                      <Workflow className="h-4 w-4 text-primary" /> {b.module}
                    </CardTitle>
                    <Badge
                      className={
                        b.riskLevel === "Restricted Clinical Boundary"
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[9px]"
                          : b.riskLevel === "High Financial Risk"
                          ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[9px]"
                          : "bg-muted text-muted-foreground text-[9px]"
                      }
                    >
                      {b.riskLevel}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-3.5 space-y-3 text-xs flex-1">
                  {/* Admin CAN */}
                  <div className="space-y-1">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Admin Operational Capability (CAN):
                    </span>
                    <ul className="space-y-0.5 text-muted-foreground text-[11px] pl-4 list-disc">
                      {b.adminCanScope.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Admin CANNOT */}
                  <div className="space-y-1 pt-2 border-t border-border">
                    <span className="font-bold text-destructive text-[11px] flex items-center gap-1">
                      <AlertOctagon className="h-3 w-3" /> Strictly Prohibited Clinical Boundary (CANNOT):
                    </span>
                    <ul className="space-y-0.5 text-rose-900 dark:text-rose-300 text-[11px] pl-4 list-disc">
                      {b.adminCannotBoundary.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* MODAL: GRANT SCOPED CAPABILITY */}
      <Dialog open={grantModalOpen} onOpenChange={setGrantModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleGrantDelegation}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <UsersRound className="h-5 w-5 text-primary" /> Delegate Scoped Operational Capability
              </DialogTitle>
              <DialogDescription className="text-xs">
                Temporarily delegate specific capabilities to a manager without sharing credentials per PRD Section 15.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="del-name">Delegatee Manager Name *</Label>
                  <Input
                    id="del-name"
                    required
                    value={delegateeName}
                    onChange={(e) => setDelegateeName(e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="del-role">Delegatee Manager Role *</Label>
                  <Input
                    id="del-role"
                    required
                    value={delegateeRole}
                    onChange={(e) => setDelegateeRole(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="del-target">Operational Target Role</Label>
                  <Input
                    id="del-target"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="del-dur">Delegation Duration</Label>
                  <Select value={durationHours} onValueChange={setDurationHours}>
                    <SelectTrigger id="del-dur" className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 Hours (Half Shift)</SelectItem>
                      <SelectItem value="8">8 Hours (Full Shift)</SelectItem>
                      <SelectItem value="16">16 Hours (Extended Coverage)</SelectItem>
                      <SelectItem value="24">24 Hours (Weekend On-Call)</SelectItem>
                      <SelectItem value="72">72 Hours (Long Weekend)</SelectItem>
                      <SelectItem value="168">7 Days (Manager Leave Cover)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Scopes checklist */}
              <div className="space-y-1.5 pt-1">
                <Label>Allowed Scoped Capabilities ({selectedScopes.length} selected):</Label>
                <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-2 rounded border border-border bg-muted/20">
                  {ALL_CAPABILITY_SCOPES.map((scope) => {
                    const isChecked = selectedScopes.includes(scope);
                    return (
                      <label
                        key={scope}
                        className="flex items-center gap-2 text-[11px] p-1.5 rounded hover:bg-card cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleScope(scope)}
                          className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                        />
                        <span className={isChecked ? "font-semibold text-foreground" : "text-muted-foreground"}>
                          {scope}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Mandatory Reason */}
              <div className="grid gap-1">
                <Label htmlFor="del-reason">Mandatory Operational Justification *</Label>
                <Textarea
                  id="del-reason"
                  required
                  rows={2}
                  placeholder="e.g. Weekend duty coverage for front office peak OPD volume..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              {/* Attribution Preview */}
              <div className="p-2.5 rounded border border-primary/20 bg-primary/5 space-y-1">
                <span className="text-[10px] text-primary font-bold block">
                  Mandatory Double-Attribution Label (PRD S15):
                </span>
                <DelegationActorBadge
                  actorName={delegateeName}
                  workflowRole={selectedScopes[0] || "Operations"}
                  delegatedBy="Hospital Admin"
                  variant="pill"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setGrantModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold">
                Issue Scoped Delegation Token
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
