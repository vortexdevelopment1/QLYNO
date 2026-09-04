"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Check,
  CheckCircle2,
  Eye,
  Filter,
  KeyRound,
  Lock,
  Play,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import {
  CANONICAL_ADMIN_PERMISSION_MATRIX,
  AdminPermissionEntry,
  evaluateAdminAccess,
} from "@/hospital-admin/lib/security/admin-permission-matrix";
import { cn } from "@/hospital-admin/lib/utils";

export function AdminPermissionMatrixView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Policy Simulator State
  const [simModule, setSimModule] = useState<string>("OT/Surgery");
  const [simAction, setSimAction] = useState<"view" | "create_edit" | "approve_override" | "clinical_decision">("clinical_decision");
  const [simResult, setSimResult] = useState<any>(() => evaluateAdminAccess("OT/Surgery", "clinical_decision"));

  const handleRunSimulation = () => {
    const res = evaluateAdminAccess(simModule, simAction);
    setSimResult(res);
  };

  const filteredMatrix = CANONICAL_ADMIN_PERMISSION_MATRIX.filter((item) => {
    const matchQuery =
      !searchQuery.trim() ||
      item.moduleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.boundaryRule.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === "all" || item.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchQuery && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* Overview & Taxonomy Header */}
      <Card className="border-border shadow-xs bg-linear-to-br from-card via-card to-primary/5">
        <CardHeader className="p-4 pb-3 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Canonical Admin Permission Matrix
                </CardTitle>
                <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                  REFERENCE CHECKLIST
                </Badge>
              </div>
              <CardDescription className="text-xs mt-0.5">
                Defines runtime authorization levels for the Hospital Admin role across all 12 core functional areas.
              </CardDescription>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 rounded-md font-medium">
              <Lock className="h-3.5 w-3.5" />
              <span>Universal Invariant: Clinical Decision is ALWAYS No</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="p-2 rounded bg-muted/40 border border-border">
              <span className="font-bold text-foreground block">1. View Scope</span>
              <span className="text-muted-foreground">`Full` (unrestricted), `Operational` (daily tasks), or `Permitted/Scoped` (data-minimized).</span>
            </div>
            <div className="p-2 rounded bg-muted/40 border border-border">
              <span className="font-bold text-foreground block">2. Create / Edit Scope</span>
              <span className="text-muted-foreground">Direct resource configuration, staff allocation, and operational modifications.</span>
            </div>
            <div className="p-2 rounded bg-muted/40 border border-border">
              <span className="font-bold text-foreground block">3. Approve / Override</span>
              <span className="text-muted-foreground">Triggers 2FA Step-Up (Mod 14) and Override Confirmation Modal (Mod 15).</span>
            </div>
            <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-900 dark:text-rose-200">
              <span className="font-bold block flex items-center gap-1">
                <AlertOctagon className="h-3 w-3 text-rose-600" /> 4. Clinical Decision
              </span>
              <span className="text-[10px] text-rose-700 dark:text-rose-300">Strictly prohibited from medical diagnoses, prescription, or surgery.</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ============================================================== */}
      {/* 12-MODULE CANONICAL PERMISSION MATRIX TABLE                    */}
      {/* ============================================================== */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-3 border-b border-border/60 bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search module or boundary rule..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-8 text-xs w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All 12 Modules</SelectItem>
                <SelectItem value="Structure & Clinical">Structure &amp; Clinical</SelectItem>
                <SelectItem value="Workforce & Frontdesk">Workforce &amp; Frontdesk</SelectItem>
                <SelectItem value="Patient & Emergency">Patient &amp; Emergency</SelectItem>
                <SelectItem value="Resources & OT">Resources &amp; OT</SelectItem>
                <SelectItem value="Finance & Supply">Finance &amp; Supply</SelectItem>
                <SelectItem value="Analytics & Governance">Analytics &amp; Governance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 text-xs">
                <TableHead className="w-40 font-bold">Module</TableHead>
                <TableHead className="w-44 font-bold">View Access</TableHead>
                <TableHead className="w-48 font-bold">Create / Edit</TableHead>
                <TableHead className="w-56 font-bold">Approve / Override</TableHead>
                <TableHead className="w-36 font-bold text-center bg-rose-500/5">Clinical Decision</TableHead>
                <TableHead className="font-bold">Boundary Rule &amp; Scope</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMatrix.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/30 text-xs transition-colors">
                  <TableCell className="font-bold text-foreground">
                    <div>{row.moduleName}</div>
                    <span className="text-[10px] text-muted-foreground font-normal">{row.category}</span>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-medium",
                        row.viewScope === "Full" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
                        row.viewScope.includes("permitted") && "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
                        row.viewScope.includes("operational") && "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
                        row.viewScope.includes("scope") && "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30",
                        row.viewScope.includes("audit") && "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30"
                      )}
                    >
                      {row.viewScope}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary" className="text-[10px] font-medium">
                      {row.createEditScope}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-medium",
                          row.approveOverrideScope === "N/A"
                            ? "bg-muted text-muted-foreground"
                            : "bg-primary/10 text-primary border-primary/30"
                        )}
                      >
                        {row.approveOverrideScope}
                      </Badge>
                      {row.requiresStepUp && (
                        <span className="text-[9px] px-1 py-0 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                          Step-Up 2FA
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-center bg-rose-500/10">
                    <span className="inline-flex items-center justify-center gap-1 font-bold text-xs px-2.5 py-1 rounded-md bg-rose-600 text-white shadow-xs">
                      <Lock className="h-3 w-3 text-white shrink-0" />
                      <span className="font-bold text-white tracking-wide">No</span>
                    </span>
                  </TableCell>

                  <TableCell className="text-muted-foreground text-[11px]">
                    {row.boundaryRule}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ============================================================== */}
      {/* INTERACTIVE POLICY SIMULATION & TEST WORKBENCH                 */}
      {/* ============================================================== */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2 border-b border-border/60 bg-muted/20">
          <CardTitle className="text-xs font-bold flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" /> Live Policy Simulation &amp; Boundary Workbench
          </CardTitle>
          <CardDescription className="text-[11px]">
            Test runtime authorization decisions and verify clinical boundary guards before deploying RBAC policies.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px]">Select Module</Label>
              <Select value={simModule} onValueChange={setSimModule}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CANONICAL_ADMIN_PERMISSION_MATRIX.map((m) => (
                    <SelectItem key={m.id} value={m.moduleName}>
                      {m.moduleName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px]">Action Vector</Label>
              <Select value={simAction} onValueChange={(v) => setSimAction(v as any)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View Action</SelectItem>
                  <SelectItem value="create_edit">Create / Edit Action</SelectItem>
                  <SelectItem value="approve_override">Approve / Override Action</SelectItem>
                  <SelectItem value="clinical_decision">Clinical Decision Action (Rule 23.1)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button size="sm" className="h-8 text-xs w-full bg-primary text-primary-foreground gap-1.5" onClick={handleRunSimulation}>
                <Play className="h-3.5 w-3.5" /> Evaluate Permission
              </Button>
            </div>
          </div>

          {/* Result Card */}
          {simResult && (
            <div
              className={cn(
                "p-3 rounded-lg border text-xs space-y-1 transition-all",
                simResult.allowed
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200"
              )}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  {simResult.allowed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <AlertOctagon className="h-4 w-4 text-rose-600" />
                  )}
                  Access Evaluation: {simResult.allowed ? "AUTHORIZED" : "ACCESS BLOCKED"}
                </span>
                <Badge variant={simResult.allowed ? "default" : "destructive"} className="text-[9px]">
                  Scope: {simResult.scope}
                </Badge>
              </div>
              <p className="text-[11px] opacity-90">{simResult.message}</p>
              {simResult.requiresStepUp && (
                <div className="pt-1 text-[10px] text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1">
                  <KeyRound className="h-3 w-3" /> Step-Up 2FA &amp; Override Confirmation Modal Required
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
