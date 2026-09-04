"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Globe,
  Laptop,
  Lock,
  LogOut,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Trash2,
  UserX,
  Zap,
} from "lucide-react";

import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
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
import { SecurityNav } from "@/hospital-admin/components/security/security-nav";
import { AccessRevocationModal } from "@/hospital-admin/components/security/access-revocation-modal";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { mockSecuritySessions } from "@/hospital-admin/lib/mock-data/security-operations";
import { SecuritySession } from "@/hospital-admin/lib/types";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Session Security & Invalidation workflow";

export default function SecuritySessionsPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [sessions, setSessions] = useState<SecuritySession[]>(mockSecuritySessions);
  const [search, setSearch] = useState("");
  const [inactivityTimeout, setInactivityTimeout] = useState("30");

  // Access Revocation Modal State (Edge Case 1)
  const [revocationModalOpen, setRevocationModalOpen] = useState(false);
  const [targetUserToRevoke, setTargetUserToRevoke] = useState<{
    name: string;
    id: string;
    role: string;
  }>({ name: "", id: "", role: "" });

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      return (
        s.userName.toLowerCase().includes(search.toLowerCase()) ||
        s.userRole.toLowerCase().includes(search.toLowerCase()) ||
        s.ipAddress.toLowerCase().includes(search.toLowerCase()) ||
        s.location.toLowerCase().includes(search.toLowerCase()) ||
        s.device.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [sessions, search]);

  const suspiciousSessions = useMemo(() => {
    return sessions.filter((s) => s.isSuspicious && s.status !== "Revoked");
  }, [sessions]);

  const handleRevokeSingleSession = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: "Revoked" as const } : s))
    );

    const target = sessions.find((s) => s.id === sessionId);
    toast({
      title: "Session Terminated",
      description: `Session for ${target?.userName} from ${target?.ipAddress} was immediately revoked. (${DELEGATION_STRING})`,
      variant: "destructive",
    });
  };

  const handleRevokeAllSuspicious = () => {
    setSessions((prev) =>
      prev.map((s) => (s.isSuspicious ? { ...s, status: "Revoked" as const } : s))
    );

    toast({
      title: "All Suspicious Sessions Revoked",
      description: `Terminated ${suspiciousSessions.length} flagged anomalous login sessions. (${DELEGATION_STRING})`,
      variant: "destructive",
    });
  };

  const handleOpenMultiPathRevocation = (s: SecuritySession) => {
    setTargetUserToRevoke({
      name: s.userName,
      id: s.userId,
      role: s.userRole,
    });
    setRevocationModalOpen(true);
  };

  const handleTimeoutChange = (val: string) => {
    setInactivityTimeout(val);
    toast({
      title: "Inactivity Timeout Configured",
      description: `Global hospital terminal session idle timeout set to ${val} minutes.`,
    });
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Active Sessions &amp; Device Governance"
          description="Real-time device registry, idle inactivity timeout controls, and suspicious login anomaly alerts."
          crumbs={[{ label: "Administration" }, { label: "Security", href: "/hospital-admin/roles" }, { label: "Session Management" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading active sessions...
        </div>
      </div>
    );
  }

  const activeCount = sessions.filter((s) => s.status === "Active").length;
  const idleCount = sessions.filter((s) => s.status === "Idle").length;
  const revokedCount = sessions.filter((s) => s.status === "Revoked").length;

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Active Sessions &amp; Device Governance"
        description="Real-time device registry, idle inactivity timeout controls, and suspicious login anomaly alerts."
        crumbs={[{ label: "Administration" }, { label: "Security", href: "/hospital-admin/roles" }, { label: "Session Management" }]}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-card border border-border px-2.5 py-1 rounded-md text-xs">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground font-medium">Idle Timeout:</span>
              <Select value={inactivityTimeout} onValueChange={handleTimeoutChange}>
                <SelectTrigger className="w-[100px] h-6 text-xs border-0 p-0 shadow-none font-bold text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 Minutes</SelectItem>
                  <SelectItem value="30">30 Minutes</SelectItem>
                  <SelectItem value="60">60 Minutes</SelectItem>
                  <SelectItem value="120">120 Minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        }
      />

      <SecurityNav />

      {/* Scope Indicator & Rules 14-CAN-9 to 12 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Device &amp; Session Guard" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
          <span>Rules 14-CAN-9 to 12: Real-time session monitoring &amp; instant token invalidation</span>
        </div>
      </div>

      {/* Suspicious Login Detection Alert Banner */}
      {suspiciousSessions.length > 0 && (
        <Card className="border-rose-500/40 bg-rose-500/10 shadow-xs">
          <CardContent className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertOctagon className="h-6 w-6 text-rose-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-rose-900 dark:text-rose-300">
                  SECURITY ALERT: {suspiciousSessions.length} Suspicious / Anomalous Login Session(s) Detected
                </p>
                <div className="text-[11px] text-muted-foreground mt-0.5 space-y-0.5">
                  {suspiciousSessions.map((s) => (
                    <div key={s.id}>
                      • <strong>{s.userName}</strong> ({s.ipAddress} - {s.location}): {s.suspiciousReason}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <Button
              size="sm"
              variant="destructive"
              className="text-xs font-semibold shrink-0 gap-1"
              onClick={handleRevokeAllSuspicious}
            >
              <LogOut className="h-3.5 w-3.5" /> Terminate Anomalous Sessions
            </Button>
          </CardContent>
        </Card>
      )}

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Active Sessions</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{activeCount} Online</p>
          <span className="text-[10px] text-emerald-600 font-medium">Live hospital workstations</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Idle / Standby</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{idleCount} Devices</p>
          <span className="text-[10px] text-amber-600 font-medium">Approaching timeout cutoff</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Revoked Today</span>
          <p className="text-xl font-bold font-mono text-muted-foreground mt-0.5">{revokedCount} Sessions</p>
          <span className="text-[10px] text-muted-foreground">Terminated &amp; invalidated</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Inactivity Hard Cutoff</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{inactivityTimeout} Mins</p>
          <span className="text-[10px] text-primary font-medium">Automatic session lock</span>
        </Card>
      </div>

      {/* Sessions Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-bold">Active Device &amp; Terminal Registry</CardTitle>
              <CardDescription className="text-xs">
                Inspect active JWT tokens, hardware footprints, and trigger multi-path access purges.
              </CardDescription>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search user, device, or IP address..."
                className="pl-8 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2">
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold w-[220px]">User &amp; Role</TableHead>
                  <TableHead className="text-xs font-bold w-[200px]">Device &amp; Browser</TableHead>
                  <TableHead className="text-xs font-bold w-[180px]">IP &amp; Physical Location</TableHead>
                  <TableHead className="text-xs font-bold w-[120px]">Last Active</TableHead>
                  <TableHead className="text-xs font-bold w-[120px]">Status</TableHead>
                  <TableHead className="text-xs font-bold text-right w-[180px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((s) => (
                  <TableRow
                    key={s.id}
                    className={`hover:bg-muted/30 transition-colors ${
                      s.isSuspicious && s.status !== "Revoked" ? "bg-rose-500/5" : ""
                    }`}
                  >
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                        {s.userName}
                        {s.isSuspicious && (
                          <Badge variant="destructive" className="text-[8px] px-1 py-0 h-3.5">
                            Anomaly
                          </Badge>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">{s.userRole}</div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs font-medium text-foreground flex items-center gap-1.5">
                        <Laptop className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{s.device}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">{s.browser}</div>
                    </TableCell>

                    <TableCell>
                      <div className="font-mono text-xs text-foreground">{s.ipAddress}</div>
                      <div className="text-[10px] text-muted-foreground truncate max-w-[170px]">{s.location}</div>
                    </TableCell>

                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {s.lastActive}
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={
                          s.status === "Active"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                            : s.status === "Idle"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                            : "bg-muted text-muted-foreground text-[10px]"
                        }
                      >
                        {s.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      {s.status !== "Revoked" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 font-semibold"
                            onClick={() => handleRevokeSingleSession(s.id)}
                          >
                            <LogOut className="h-3 w-3 mr-1" /> Revoke
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-rose-600 hover:bg-rose-500/10"
                            title="Full Access Purge (Edge Case 1)"
                            onClick={() => handleOpenMultiPathRevocation(s)}
                          >
                            <UserX className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">Terminated</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* MULTI-PATH ACCESS REVOCATION MODAL (EDGE CASE 1) */}
      <AccessRevocationModal
        open={revocationModalOpen}
        onOpenChange={setRevocationModalOpen}
        targetUser={targetUserToRevoke}
        onRevoked={() => {
          setSessions((prev) =>
            prev.map((s) =>
              s.userName === targetUserToRevoke.name ? { ...s, status: "Revoked" as const } : s
            )
          );
        }}
      />
    </div>
  );
}
