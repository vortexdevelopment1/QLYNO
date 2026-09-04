"use client";

import React, { useState, useEffect } from "react";
import {
  AlertOctagon,
  AlertTriangle,
  Check,
  CheckCircle2,
  Eye,
  KeyRound,
  Lock,
  Plus,
  Save,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Undo2,
  Users,
  X,
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
  DialogTrigger,
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
import { Switch } from "@/hospital-admin/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { SecurityNav } from "@/hospital-admin/components/security/security-nav";
import { StepUpAuthModal } from "@/hospital-admin/components/security/step-up-auth-modal";
import { AdminPermissionMatrixView } from "@/hospital-admin/components/security/admin-permission-matrix-view";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { mockRBACRoles } from "@/hospital-admin/lib/mock-data/security-operations";
import { RBACRole, RBACPermission, DataScope } from "@/hospital-admin/lib/types";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Security & RBAC Configuration workflow";

export default function RolesPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"rbac" | "admin_matrix">("rbac");

  const [rolesList, setRolesList] = useState<RBACRole[]>(mockRBACRoles);
  const [selectedRoleId, setSelectedRoleId] = useState<string>(mockRBACRoles[0].id);

  // Active Role Permissions State
  const activeRole = rolesList.find((r) => r.id === selectedRoleId) || rolesList[0];
  const [editablePermissions, setEditablePermissions] = useState<RBACPermission[]>(activeRole.permissions);

  // Create Role Modal
  const [createRoleOpen, setCreateRoleOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [newRoleBranch, setNewRoleBranch] = useState("Main Campus & West Wing");
  const [newRoleDept, setNewRoleDept] = useState("Assigned Clinical Department");

  // Pre-Save Diff Preview Modal (Edge Case 3)
  const [diffModalOpen, setDiffModalOpen] = useState(false);

  // Step-Up Auth Modal State
  const [stepUpOpen, setStepUpOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setEditablePermissions(activeRole.permissions);
  }, [selectedRoleId, activeRole]);

  const handleTogglePermission = (moduleIndex: number, actionKey: keyof RBACPermission) => {
    setEditablePermissions((prev) => {
      const copy = [...prev];
      const target = { ...copy[moduleIndex] };
      // @ts-ignore
      target[actionKey] = !target[actionKey];
      copy[moduleIndex] = target;
      return copy;
    });
  };

  const handleScopeChange = (moduleIndex: number, newScope: DataScope) => {
    setEditablePermissions((prev) => {
      const copy = [...prev];
      copy[moduleIndex] = { ...copy[moduleIndex], dataScope: newScope };
      return copy;
    });
  };

  // Open Pre-Save Diff Modal (Edge Case 3)
  const handleInitiateSave = () => {
    setDiffModalOpen(true);
  };

  // Confirm Diff -> Trigger Step-Up Challenge
  const handleProceedToStepUp = () => {
    setDiffModalOpen(false);
    setStepUpOpen(true);
  };

  // Step-Up PIN Verified -> Commit Changes
  const handleCommitRoleChanges = (reason: string) => {
    setRolesList((prev) =>
      prev.map((r) => (r.id === activeRole.id ? { ...r, permissions: editablePermissions } : r))
    );

    toast({
      title: "RBAC Permissions Committed",
      description: `Updated 6D authorization matrix for ${activeRole.name}. Reason: "${reason}". (${DELEGATION_STRING})`,
    });
  };

  const handleCreateNewRole = (e: React.FormEvent) => {
    e.preventDefault();
    const newRole: RBACRole = {
      id: `role_${Date.now()}`,
      name: newRoleName,
      description: newRoleDesc || "Custom hospital staff role with configured module scopes.",
      userCount: 1,
      system: false,
      branchScope: newRoleBranch,
      departmentScope: newRoleDept,
      mfaEnforced: false,
      permissions: [
        { module: "Dashboard & Analytics", view: true, create: false, edit: false, delete: false, approve: false, export: false, emergencyOverride: false, dataScope: "Department Wide" },
        { module: "Patient Records & EMR", view: true, create: true, edit: false, delete: false, approve: false, export: false, emergencyOverride: false, dataScope: "Department Wide" },
        { module: "Clinical & OT Operations", view: false, create: false, edit: false, delete: false, approve: false, export: false, emergencyOverride: false, dataScope: "Self Only" },
        { module: "Pharmacy & Formulary", view: false, create: false, edit: false, delete: false, approve: false, export: false, emergencyOverride: false, dataScope: "Self Only" },
        { module: "Radiology & PACS Viewer", view: false, create: false, edit: false, delete: false, approve: false, export: false, emergencyOverride: false, dataScope: "Self Only" },
        { module: "Billing & Finance", view: false, create: false, edit: false, delete: false, approve: false, export: false, emergencyOverride: false, dataScope: "Self Only" },
        { module: "Roles & Security Controls", view: false, create: false, edit: false, delete: false, approve: false, export: false, emergencyOverride: false, dataScope: "Self Only" },
      ],
    };

    setRolesList((prev) => [...prev, newRole]);
    setSelectedRoleId(newRole.id);
    toast({
      title: "Custom Role Created",
      description: `${newRoleName} created and ready for 6D permission configuration. (${DELEGATION_STRING})`,
    });
    setCreateRoleOpen(false);
    setNewRoleName("");
    setNewRoleDesc("");
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Roles &amp; 6D Permissions (RBAC) Manager"
          description="Server-side enforced 6-dimensional authorization: Role + Organization + Branch + Department + Action + Data Scope."
          crumbs={[{ label: "Administration" }, { label: "Roles & Permissions" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading RBAC permissions matrix...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Roles &amp; 6D Permissions (RBAC) Manager"
        description="Server-side enforced 6-dimensional authorization: Role + Organization + Branch + Department + Action + Data Scope."
        crumbs={[{ label: "Administration" }, { label: "Roles & Permissions" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 font-semibold text-xs text-primary border-primary/30 hover:bg-primary/10"
              onClick={() => setCreateRoleOpen(true)}
            >
              <Plus className="h-4 w-4" /> Create Custom Role
            </Button>
            <Button
              size="sm"
              className="gap-1.5 font-semibold text-xs bg-primary text-primary-foreground"
              onClick={handleInitiateSave}
            >
              <Save className="h-4 w-4" /> Save RBAC Changes
            </Button>
          </div>
        }
      />

      <SecurityNav />

      {/* Tab Navigation: 6D RBAC vs Admin Permission Matrix */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab("rbac")}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeTab === "rbac"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          6D Custom Roles &amp; Permissions
        </button>
        <button
          onClick={() => setActiveTab("admin_matrix")}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === "admin_matrix"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Admin Permission Matrix
        </button>
      </div>

      {activeTab === "admin_matrix" ? (
        <AdminPermissionMatrixView />
      ) : (
        <>
          {/* Scope Indicator & Section 14 Governing Principle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <ScopeIndicator scope="Hospital Admin" stationName="Central RBAC Policy Engine" />
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Section 14: Broad operational power without bypassing audit or clinical accountability</span>
            </div>
          </div>

          {/* Main Grid: Roles List Left (1 Col), 6D Permission Matrix Right (3 Cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Column: Roles Selector */}
        <Card className="lg:col-span-1 border-border shadow-xs flex flex-col justify-between">
          <CardHeader className="p-3.5 pb-2 border-b border-border">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary" /> Configured Roles ({rolesList.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 space-y-1">
            {rolesList.map((r) => {
              const isSelected = r.id === selectedRoleId;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRoleId(r.id)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex flex-col gap-1 border ${
                    isSelected
                      ? "bg-primary/10 border-primary/40 text-foreground font-semibold shadow-xs"
                      : "border-transparent hover:bg-muted/60 text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground truncate">{r.name}</span>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-mono">
                      {r.userCount} users
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <Badge
                      variant="secondary"
                      className={`text-[8px] px-1 py-0 h-3.5 ${
                        r.system ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary"
                      }`}
                    >
                      {r.system ? "System" : "Custom"}
                    </Badge>
                    {r.mfaEnforced && (
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[8px] px-1 py-0 h-3.5 border-emerald-500/30">
                        MFA Enforced
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Right Column (3 Cols): 6D Permission Matrix */}
        <Card className="lg:col-span-3 border-border shadow-xs">
          <CardHeader className="p-4 pb-2 border-b border-border">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                  <ShieldCheck className="h-5 w-5 text-primary" /> {activeRole.name}
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">{activeRole.description}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-mono">
                  Branch: {activeRole.branchScope}
                </Badge>
                <Badge variant="outline" className="text-[10px] font-mono">
                  Dept: {activeRole.departmentScope}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 pt-3 space-y-4">
            {/* Explainer Bar */}
            <div className="p-2.5 rounded-lg border border-border bg-muted/20 text-[11px] text-muted-foreground flex items-center justify-between">
              <span>
                <strong>6D Matrix:</strong> Role × Organization × Branch × Dept × Action Perms × Data Scope.
              </span>
              <span className="text-primary font-semibold">Changes require Step-Up Auth on Save</span>
            </div>

            {/* Matrix Table */}
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-xs font-bold w-[200px]">Functional Module</TableHead>
                    <TableHead className="text-xs font-bold text-center w-[60px]">View</TableHead>
                    <TableHead className="text-xs font-bold text-center w-[60px]">Create</TableHead>
                    <TableHead className="text-xs font-bold text-center w-[60px]">Edit</TableHead>
                    <TableHead className="text-xs font-bold text-center w-[60px]">Delete</TableHead>
                    <TableHead className="text-xs font-bold text-center w-[60px]">Approve</TableHead>
                    <TableHead className="text-xs font-bold text-center w-[60px]">Export</TableHead>
                    <TableHead className="text-xs font-bold text-center w-[80px]">Override</TableHead>
                    <TableHead className="text-xs font-bold text-right w-[160px]">Data Scope</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {editablePermissions.map((perm, idx) => (
                    <TableRow key={perm.module} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-semibold text-xs text-foreground">
                        {perm.module}
                      </TableCell>

                      {/* View */}
                      <TableCell className="text-center">
                        <input
                          type="checkbox"
                          checked={perm.view}
                          onChange={() => handleTogglePermission(idx, "view")}
                          className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                        />
                      </TableCell>

                      {/* Create */}
                      <TableCell className="text-center">
                        <input
                          type="checkbox"
                          checked={perm.create}
                          onChange={() => handleTogglePermission(idx, "create")}
                          className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                        />
                      </TableCell>

                      {/* Edit */}
                      <TableCell className="text-center">
                        <input
                          type="checkbox"
                          checked={perm.edit}
                          onChange={() => handleTogglePermission(idx, "edit")}
                          className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                        />
                      </TableCell>

                      {/* Delete */}
                      <TableCell className="text-center">
                        <input
                          type="checkbox"
                          checked={perm.delete}
                          onChange={() => handleTogglePermission(idx, "delete")}
                          className="rounded border-border text-destructive focus:ring-destructive h-4 w-4 cursor-pointer"
                        />
                      </TableCell>

                      {/* Approve */}
                      <TableCell className="text-center">
                        <input
                          type="checkbox"
                          checked={perm.approve}
                          onChange={() => handleTogglePermission(idx, "approve")}
                          className="rounded border-border text-emerald-600 focus:ring-emerald-600 h-4 w-4 cursor-pointer"
                        />
                      </TableCell>

                      {/* Export */}
                      <TableCell className="text-center">
                        <input
                          type="checkbox"
                          checked={perm.export}
                          onChange={() => handleTogglePermission(idx, "export")}
                          className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                        />
                      </TableCell>

                      {/* Emergency Override */}
                      <TableCell className="text-center">
                        <input
                          type="checkbox"
                          checked={perm.emergencyOverride}
                          onChange={() => handleTogglePermission(idx, "emergencyOverride")}
                          className="rounded border-border text-rose-600 focus:ring-rose-600 h-4 w-4 cursor-pointer"
                        />
                      </TableCell>

                      {/* Data Scope Dropdown */}
                      <TableCell className="text-right">
                        <Select
                          value={perm.dataScope}
                          onValueChange={(val: DataScope) => handleScopeChange(idx, val)}
                        >
                          <SelectTrigger className="w-[140px] text-[11px] h-7">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Self Only">Self Only</SelectItem>
                            <SelectItem value="Department Wide">Dept Wide</SelectItem>
                            <SelectItem value="Branch Wide">Branch Wide</SelectItem>
                            <SelectItem value="Organization Wide">Org Wide</SelectItem>
                            <SelectItem value="Restricted Clinical">Restricted Clinical</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MODAL 1: PRE-SAVE DIFF PREVIEW (EDGE CASE 3) */}
      <Dialog open={diffModalOpen} onOpenChange={setDiffModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-600" /> Pre-Save RBAC Impact &amp; Diff Preview
            </DialogTitle>
            <DialogDescription className="text-xs">
              Edge Case 3 Enforcement: Review proposed changes for <strong>{activeRole.name}</strong> to prevent accidental administrator or clinical lockout.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-3 text-xs">
            <div className="p-3 rounded border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-300 text-[11px] space-y-1">
              <span className="font-bold flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" /> High-Impact Security Change
              </span>
              <p>
                Proceeding will update access policies for {activeRole.userCount} assigned users across {activeRole.branchScope}.
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-foreground text-xs block">Matrix Configuration Summary:</span>
              <div className="rounded border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 text-[11px]">
                      <TableHead className="py-1.5 font-bold">Module</TableHead>
                      <TableHead className="py-1.5 font-bold text-center">Perms (V/C/E/D/A/X/O)</TableHead>
                      <TableHead className="py-1.5 font-bold text-right">Data Scope</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editablePermissions.map((p) => (
                      <TableRow key={p.module} className="text-[11px]">
                        <TableCell className="py-1.5 font-medium">{p.module}</TableCell>
                        <TableCell className="py-1.5 text-center font-mono">
                          {p.view ? "V" : "-"}{p.create ? "C" : "-"}{p.edit ? "E" : "-"}{p.delete ? "D" : "-"}{p.approve ? "A" : "-"}{p.export ? "X" : "-"}{p.emergencyOverride ? "O" : "-"}
                        </TableCell>
                        <TableCell className="py-1.5 text-right font-mono text-[10px]">
                          {p.dataScope}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => setDiffModalOpen(false)}>
              Back to Editor
            </Button>
            <Button size="sm" className="bg-primary text-primary-foreground font-semibold" onClick={handleProceedToStepUp}>
              Proceed to Step-Up Auth Challenge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: CREATE CUSTOM ROLE */}
      <Dialog open={createRoleOpen} onOpenChange={setCreateRoleOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateNewRole}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" /> Define Custom Staff Role
              </DialogTitle>
              <DialogDescription className="text-xs">
                Create a scoped role with organizational boundaries.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-3 text-xs">
              <div className="grid gap-1">
                <Label htmlFor="cr-name">Role Title *</Label>
                <Input
                  id="cr-name"
                  required
                  placeholder="e.g. Front Office Supervisor"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="cr-desc">Role Description</Label>
                <Textarea
                  id="cr-desc"
                  rows={2}
                  placeholder="Operational responsibilities and duties..."
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="cr-branch">Branch Scope</Label>
                  <Input
                    id="cr-branch"
                    value={newRoleBranch}
                    onChange={(e) => setNewRoleBranch(e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="cr-dept">Department Scope</Label>
                  <Input
                    id="cr-dept"
                    value={newRoleDept}
                    onChange={(e) => setNewRoleDept(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setCreateRoleOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold">
                Create Role
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* REUSABLE STEP-UP AUTH MODAL */}
      <StepUpAuthModal
        open={stepUpOpen}
        onOpenChange={setStepUpOpen}
        actionTitle="Commit 6D RBAC Changes"
        actionDescription={`Authorizing updated permission matrix for role "${activeRole.name}".`}
        onConfirm={handleCommitRoleChanges}
      />
        </>
      )}
    </div>
  );
}
