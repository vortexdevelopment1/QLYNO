"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Eye,
  Gauge,
  Mail,
  MapPin,
  MoreHorizontal,
  PencilLine,
  Phone,
  Plus,
  RefreshCcw,
  Shield,
  ShieldCheck,
  User,
  Users,
  Workflow,
  Clock,
  Play,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/hospital-admin/components/ui/avatar";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/hospital-admin/components/ui/alert";
import { Checkbox } from "@/hospital-admin/components/ui/checkbox";
import { Switch } from "@/hospital-admin/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/hospital-admin/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/hospital-admin/components/ui/dropdown-menu";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/hospital-admin/components/ui/tabs";
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import { EmptyState } from "@/hospital-admin/components/shared/empty-state";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { StatusBadge } from "@/hospital-admin/components/shared/status-badge";
import { Toolbar } from "@/hospital-admin/components/shared/toolbar";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { receptionists } from "@/hospital-admin/lib/mock-data/staff";
import type { Receptionist } from "@/hospital-admin/lib/types";
import { getInitials } from "@/hospital-admin/lib/utils";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Reception workflow";

const routingRules = [
  { condition: "Walk-in OPD patient", department: "OPD", destination: "Triage desk", priority: 1, status: "Routed" },
  { condition: "Emergency patient", department: "Emergency", destination: "Emergency intake", priority: 1, status: "Escalated" },
  { condition: "Discharge request", department: "Admissions", destination: "Discharge desk", priority: 2, status: "Pending Route" },
  { condition: "Diagnostics referral", department: "Diagnostics", destination: "Lab registration", priority: 3, status: "Routed" },
];

const permissionMatrix = [
  { action: "Register patient", organization: true, location: true, department: true, dataScope: "Registration only" },
  { action: "Update appointment", organization: true, location: true, department: true, dataScope: "Appointments + queue" },
  { action: "Route to department", organization: true, location: true, department: true, dataScope: "Routing + triage" },
  { action: "View clinical report", organization: false, location: false, department: false, dataScope: "Blocked" },
  { action: "Modify clinical order", organization: false, location: false, department: false, dataScope: "Blocked" },
];

const performanceData = [
  { name: "Priya", workload: 86, wait: 8, volume: 92, errors: 3 },
  { name: "Sana", workload: 74, wait: 11, volume: 81, errors: 2 },
  { name: "Aditi", workload: 63, wait: 15, volume: 68, errors: 5 },
  { name: "Manoj", workload: 41, wait: 12, volume: 36, errors: 1 },
];

const announcements = [
  { title: "New OPD token policy", channel: "Hospital-wide", audience: "Front desk + doctors", createdAt: "Today, 09:30" },
  { title: "Emergency routing update", channel: "WhatsApp", audience: "Reception desk", createdAt: "Today, 08:15" },
  { title: "Diagnostics schedule alert", channel: "Email", audience: "Diagnostics + front desk", createdAt: "Yesterday, 18:45" },
];

const templates = [
  { name: "Check-in confirmation", channel: "WhatsApp" },
  { name: "Doctor delay notice", channel: "SMS" },
  { name: "Discharge instructions", channel: "Email" },
];

export default function ReceptionistsPage() {
  const [search, setSearch] = useState("");
  const [branch, setBranch] = useState("all");
  const [department, setDepartment] = useState("all");
  const [desk, setDesk] = useState("all");
  const [status, setStatus] = useState("all");
  const [staffList, setStaffList] = useState<Receptionist[]>(receptionists);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedReceptionist, setSelectedReceptionist] = useState<Receptionist | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingReceptionist, setViewingReceptionist] = useState<Receptionist | null>(null);

  // Suspend Dialog State
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [suspendTarget, setSuspendTarget] = useState<Receptionist | null>(null);
  const [suspendReason, setSuspendReason] = useState("Administrative review");

  // Replace Dialog State
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(false);
  const [replaceTarget, setReplaceTarget] = useState<Receptionist | null>(null);
  const [incomingStaffId, setIncomingStaffId] = useState<string>("");
  const [replaceReason, setReplaceReason] = useState("Shift rotation");

  // Remove Dialog State
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Receptionist | null>(null);

  const { toast } = useToast();

  const branchOptions = useMemo(() => ["all", ...Array.from(new Set(staffList.map((r) => r.branch)))], [staffList]);
  const departmentOptions = useMemo(() => ["all", ...Array.from(new Set(staffList.map((r) => r.department)))], [staffList]);
  const deskOptions = useMemo(() => ["all", ...Array.from(new Set(staffList.map((r) => r.desk)))], [staffList]);
  const statusOptions = ["all", "active", "suspended", "invited", "replaced"];

  const filtered = useMemo(
    () =>
      staffList.filter((r) => {
        const matchesSearch =
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.email.toLowerCase().includes(search.toLowerCase()) ||
          r.desk.toLowerCase().includes(search.toLowerCase());
        const matchesBranch = branch === "all" || r.branch === branch;
        const matchesDepartment = department === "all" || r.department === department;
        const matchesDesk = desk === "all" || r.desk === desk;
        const matchesStatus = status === "all" || r.status === status;
        return matchesSearch && matchesBranch && matchesDepartment && matchesDesk && matchesStatus;
      }),
    [branch, department, desk, search, status, staffList]
  );

  const openCreateDialog = () => {
    setSelectedReceptionist(null);
    setDialogOpen(true);
  };

  const openEditDialog = (receptionist: Receptionist) => {
    setSelectedReceptionist(receptionist);
    setDialogOpen(true);
  };

  const openViewDialog = (receptionist: Receptionist) => {
    setViewingReceptionist(receptionist);
    setViewDialogOpen(true);
  };

  const openSuspendDialog = (receptionist: Receptionist) => {
    setSuspendTarget(receptionist);
    setSuspendReason("Administrative review");
    setSuspendDialogOpen(true);
  };

  const handleConfirmSuspend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspendTarget) return;

    const newStatus = suspendTarget.status === "suspended" ? "active" : "suspended";
    setStaffList((prev) =>
      prev.map((item) => (item.id === suspendTarget.id ? { ...item, status: newStatus } : item))
    );

    toast({
      title: newStatus === "suspended" ? "Receptionist Suspended" : "Receptionist Reactivated",
      description: `${suspendTarget.name} status updated to ${newStatus}. Reason: ${suspendReason}. (${DELEGATION_STRING})`,
    });

    setSuspendDialogOpen(false);
  };

  const openReplaceDialog = (receptionist?: Receptionist) => {
    const target = receptionist || staffList[0];
    setReplaceTarget(target);
    const available = staffList.find((s) => s.id !== target?.id && s.status === "active") || staffList[1];
    if (available) setIncomingStaffId(available.id);
    setReplaceReason("Shift rotation");
    setReplaceDialogOpen(true);
  };

  const handleConfirmReplace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replaceTarget) return;
    const incoming = staffList.find((s) => s.id === incomingStaffId);

    setStaffList((prev) =>
      prev.map((item) => {
        if (item.id === replaceTarget.id) {
          return { ...item, status: "replaced" as any };
        }
        if (item.id === incomingStaffId) {
          return { ...item, desk: replaceTarget.desk, department: replaceTarget.department };
        }
        return item;
      })
    );

    toast({
      title: "Receptionist Replacement Executed",
      description: `${replaceTarget.name} at ${replaceTarget.desk} replaced by ${incoming?.name || "Assigned Staff"}. Reason: ${replaceReason}. (${DELEGATION_STRING})`,
    });

    setReplaceDialogOpen(false);
  };

  const openRemoveDialog = (receptionist: Receptionist) => {
    setRemoveTarget(receptionist);
    setRemoveDialogOpen(true);
  };

  const handleConfirmRemove = () => {
    if (!removeTarget) return;
    setStaffList((prev) => prev.filter((item) => item.id !== removeTarget.id));
    toast({
      title: "Receptionist Removed",
      description: `${removeTarget.name} has been removed from front desk pool. (${DELEGATION_STRING})`,
    });
    setRemoveDialogOpen(false);
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setDialogOpen(false);
    toast({
      title: selectedReceptionist ? "Receptionist updated" : "Receptionist created",
      description: selectedReceptionist 
        ? `Front desk assignment and workflow scope were adjusted. (${DELEGATION_STRING})` 
        : `A new receptionist profile has been added to the desk pool. (${DELEGATION_STRING})`,
    });
  }

  return (
    <div>
      <PageHeader
        title="Reception Management"
        description="Front-desk workforce, routing rules, permissions and communication guardrails for hospital operations."
        crumbs={[{ label: "Clinic Staff" }, { label: "Receptionists" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => openReplaceDialog()}>
              <RefreshCcw className="h-4 w-4" /> Replace Receptionist
            </Button>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4" /> Add Receptionist
            </Button>
          </div>
        }
      />

      <div className="mt-4">
        <ScopeIndicator scope="Hospital Admin" stationName="Reception Management" />
      </div>

      <Tabs defaultValue="overview" className="mt-4">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="routing">Routing</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="replace">Replacement</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Staffing Gap Alert</AlertTitle>
            <AlertDescription>Front Desk E (Radiology) currently has no assigned receptionist. Please assign operational staff to this desk.</AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Today&apos;s registrations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-display text-2xl font-semibold">142</p>
                <p className="mt-2 flex items-center gap-1 text-xs text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" /> 12% above target
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-display text-2xl font-semibold">86</p>
                <p className="mt-2 flex items-center gap-1 text-xs text-info">
                  <CalendarClock className="h-3.5 w-3.5" /> 18 check-ins pending
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Check-ins</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-display text-2xl font-semibold">53</p>
                <p className="mt-2 flex items-center gap-1 text-xs text-warning">
                  <Users className="h-3.5 w-3.5" /> 6 waiting at desk
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Routing status</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-display text-2xl font-semibold">7</p>
                <p className="mt-2 flex items-center gap-1 text-xs text-destructive">
                  <AlertTriangle className="h-3.5 w-3.5" /> 2 escalations
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Queue & Token Monitor</CardTitle>
                <CardDescription>Live tracking of patient queue statuses.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => toast({ title: "Check-in performed", description: DELEGATION_STRING })}>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Manual Check-in
                </Button>
                <Button size="sm" onClick={() => toast({ title: "Next token called", description: DELEGATION_STRING })}>
                  <Bell className="mr-2 h-4 w-4" /> Call Next Token
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token ID</TableHead>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Wait Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">T-104</TableCell>
                    <TableCell>Rajesh Kumar</TableCell>
                    <TableCell>OPD</TableCell>
                    <TableCell><StatusBadge status="in-progress" /></TableCell>
                    <TableCell>12 mins</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">T-105</TableCell>
                    <TableCell>Amit Patel</TableCell>
                    <TableCell>Diagnostics</TableCell>
                    <TableCell><StatusBadge status="waiting" /></TableCell>
                    <TableCell>5 mins</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">T-101</TableCell>
                    <TableCell>Sunita Sharma</TableCell>
                    <TableCell>Emergency</TableCell>
                    <TableCell><StatusBadge status="completed" /></TableCell>
                    <TableCell>0 mins</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">T-106</TableCell>
                    <TableCell>Vikram Singh</TableCell>
                    <TableCell>OPD</TableCell>
                    <TableCell><StatusBadge status="no-show" /></TableCell>
                    <TableCell>--</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-base font-semibold text-foreground">Receptionists</h3>
                <p className="text-sm text-muted-foreground">Operational staff only; no clinical decision actions in this module.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={branch} onValueChange={setBranch}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branchOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option === "all" ? "All branches" : option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option === "all" ? "All departments" : option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={desk} onValueChange={setDesk}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Desk" />
                  </SelectTrigger>
                  <SelectContent>
                    {deskOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option === "all" ? "All desks" : option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option === "all" ? "All status" : option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Toolbar searchValue={search} onSearchChange={setSearch} placeholder="Search by name, email or desk" />

            <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
              {filtered.length === 0 ? (
                <EmptyState icon={ClipboardList} title="No receptionists found" description="No staff matches the current filter combination." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Desk</TableHead>
                      <TableHead>Branch / Location</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="cursor-pointer" onClick={() => openViewDialog(r)}>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={r.avatarUrl} alt={r.name} />
                              <AvatarFallback>{getInitials(r.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-foreground hover:text-primary transition-colors">{r.name}</p>
                              <p className="text-xs text-muted-foreground">{r.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{r.desk}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{r.branch}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{r.department}</TableCell>
                        <TableCell>
                          <StatusBadge status={r.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openViewDialog(r)}>
                                <Eye className="mr-2 h-4 w-4 text-primary" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(r)}>
                                <PencilLine className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openSuspendDialog(r)}>
                                {r.status === "suspended" ? (
                                  <>
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-success" /> Reactivate
                                  </>
                                ) : (
                                  <>
                                    <AlertTriangle className="mr-2 h-4 w-4 text-warning" /> Suspend
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openReplaceDialog(r)}>
                                <RefreshCcw className="mr-2 h-4 w-4 text-primary" /> Replace
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => openRemoveDialog(r)}>
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="routing" className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle>Routing configuration</CardTitle>
                <CardDescription>Rules for OPD, walk-in, emergency, admission, diagnostics and discharge routing.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Condition</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {routingRules.map((rule) => (
                      <TableRow key={rule.condition}>
                        <TableCell>{rule.condition}</TableCell>
                        <TableCell>{rule.department}</TableCell>
                        <TableCell>{rule.destination}</TableCell>
                        <TableCell>{rule.priority}</TableCell>
                        <TableCell>
                          <StatusBadge status={rule.status.toLowerCase().replace(/\s+/g, "-")} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Rule builder</CardTitle>
                <CardDescription>Condition → destination queue/team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Patient type / Workflow</Label>
                  <Select defaultValue="opd">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="opd">OPD</SelectItem>
                      <SelectItem value="walk-in">Walk-in</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="admission">Admission</SelectItem>
                      <SelectItem value="diagnostics">Diagnostics</SelectItem>
                      <SelectItem value="discharge">Discharge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Department</Label>
                  <Select defaultValue="opd">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="opd">OPD</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="diagnostics">Diagnostics</SelectItem>
                      <SelectItem value="ward">Ward</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Destination queue / team</Label>
                  <Input placeholder="Triage desk / Admissions desk / Ward fast-track" />
                </div>
                <div className="grid gap-2">
                  <Label>Priority</Label>
                  <Input type="number" defaultValue={2} />
                </div>
                <Button onClick={() => toast({ title: "Routing rule saved", description: DELEGATION_STRING })}>Save routing rule</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permission configuration matrix</CardTitle>
              <CardDescription>Receptionist × organization + location + department + action + data scope</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Data scope</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissionMatrix.map((row) => {
                    const isClinical = row.action === "View clinical report" || row.action === "Modify clinical order";
                    return (
                      <TableRow key={row.action}>
                        <TableCell className={isClinical ? "text-muted-foreground line-through" : "font-medium"}>
                          {row.action}
                        </TableCell>
                        <TableCell>
                          <Switch disabled={isClinical} defaultChecked={row.organization} />
                        </TableCell>
                        <TableCell>
                          <Switch disabled={isClinical} defaultChecked={row.location} />
                        </TableCell>
                        <TableCell>
                          <Switch disabled={isClinical} defaultChecked={row.department} />
                        </TableCell>
                        <TableCell>
                          <Input 
                            className="h-8 text-sm" 
                            disabled={isClinical} 
                            defaultValue={row.dataScope} 
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <div className="p-4 border-t border-border flex justify-end">
                <Button onClick={() => toast({ title: "Permissions updated", description: DELEGATION_STRING })}>Save Permissions</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="replace" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Replace receptionist flow</CardTitle>
              <CardDescription>Keep patient ownership and history intact while changing resolution ownership.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-border p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Step 1</p>
                  <p className="mt-2 font-medium">Select outgoing receptionist</p>
                  <Select defaultValue="priya">
                    <SelectTrigger className="mt-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="priya">Priya Deshmukh</SelectItem>
                      <SelectItem value="sana">Sana Sheikh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Step 2</p>
                  <p className="mt-2 font-medium">Select replacement</p>
                  <Select defaultValue="manoj">
                    <SelectTrigger className="mt-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manoj">Manoj Pillai</SelectItem>
                      <SelectItem value="aditi">Aditi Nair</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Step 3</p>
                  <p className="mt-2 font-medium">Verify edge cases</p>
                  <div className="mt-3 flex items-start space-x-2">
                    <Checkbox id="terms" />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Acknowledge active queue
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Outgoing receptionist has active patients waiting.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-success">
                    <ShieldCheck className="h-4 w-4" /> Patient ownership stays untouched
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => toast({ title: "Replacement confirmed", description: `Ownership and history preserved. (${DELEGATION_STRING})` })}>Confirm replacement</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Workload per receptionist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performanceData.map((item) => (
                    <div key={item.name}>
                      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{item.name}</span>
                        <span>{item.workload}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${item.workload}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg. wait time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-display text-2xl font-semibold">11 min</p>
                <p className="mt-2 text-xs text-muted-foreground">down from 14 min last week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Registration volume</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-display text-2xl font-semibold">3,482</p>
                <p className="mt-2 text-xs text-success">+18% this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Exceptions / errors</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-display text-2xl font-semibold">12</p>
                <p className="mt-2 text-xs text-warning">4 require escalation</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="communication" className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Hospital announcements</CardTitle>
                  <CardDescription>Front-desk announcements and operational updates.</CardDescription>
                </div>
                <Button size="sm" onClick={() => toast({ title: "Doctor delay simulated", description: `Triggered routing escalation protocol. (${DELEGATION_STRING})` })}>
                  Simulate Doctor Delay Alert
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {announcements.map((item) => (
                  <div key={item.title} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-foreground">{item.title}</p>
                      <Badge variant="secondary">{item.channel}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">Audience: {item.audience}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.createdAt}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Create announcement</CardTitle>
                <CardDescription>Broadcast operational communication.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Title</Label>
                  <Input placeholder="Front desk staffing update" />
                </div>
                <div className="grid gap-2">
                  <Label>Audience</Label>
                  <Select defaultValue="front-desk">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="front-desk">Front desk</SelectItem>
                      <SelectItem value="all">All staff</SelectItem>
                      <SelectItem value="hospital">Hospital-wide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Message</Label>
                  <Textarea placeholder="Share front desk update or operational notice" />
                </div>
                <Button onClick={() => toast({ title: "Announcement broadcasted", description: DELEGATION_STRING })}>Send announcement</Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Transactional communication templates</CardTitle>
                <CardDescription>Manage WhatsApp and notification templates without allowing clinical decision actions.</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => toast({ title: "Template editor opened", description: DELEGATION_STRING })}>
                <PencilLine className="mr-2 h-4 w-4" /> Manage Templates
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.name}>
                      <TableCell>{template.name}</TableCell>
                      <TableCell>{template.channel}</TableCell>
                      <TableCell>
                        <StatusBadge status="active" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{selectedReceptionist ? "Edit receptionist" : "Create receptionist"}</DialogTitle>
              <DialogDescription>
                Capture personal information, desk assignment, department and workflow scope for front-desk operations.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-1.5">
                <Label htmlFor="rec-name">Full name</Label>
                <Input id="rec-name" defaultValue={selectedReceptionist?.name ?? ""} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="rec-email">Email</Label>
                  <Input id="rec-email" type="email" defaultValue={selectedReceptionist?.email ?? ""} required />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="rec-phone">Phone</Label>
                  <Input id="rec-phone" defaultValue={selectedReceptionist?.phone ?? ""} required />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rec-desk">Assigned Desk(s)</Label>
                <Select defaultValue={selectedReceptionist?.desk ?? "Front Desk A"}>
                  <SelectTrigger id="rec-desk">
                    <SelectValue placeholder="Select desk(s)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Front Desk A">Front Desk A (Multiple)</SelectItem>
                    <SelectItem value="Front Desk B">Front Desk B</SelectItem>
                    <SelectItem value="Front Desk C">Front Desk C</SelectItem>
                    <SelectItem value="Front Desk D">Front Desk D</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Mocking multi-select functionality</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rec-dept">Department(s)</Label>
                <Select defaultValue={selectedReceptionist?.department ?? "OPD"}>
                  <SelectTrigger id="rec-dept">
                    <SelectValue placeholder="Select department(s)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPD">OPD (Multiple)</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                    <SelectItem value="Diagnostics">Diagnostics</SelectItem>
                    <SelectItem value="Admissions">Admissions</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Mocking multi-select functionality</p>
              </div>
              <div className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="rec-status">Status</Label>
                  <Select defaultValue={selectedReceptionist?.status ?? "active"}>
                    <SelectTrigger id="rec-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="replaced">Replaced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="rec-branch">Branch / location</Label>
                  <Input id="rec-branch" defaultValue={selectedReceptionist?.branch ?? "Main Hospital"} required />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="rec-department">Department</Label>
                  <Input id="rec-department" defaultValue={selectedReceptionist?.department ?? "OPD"} required />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="rec-workflow">Workflow scope</Label>
                <Textarea id="rec-workflow" defaultValue={selectedReceptionist?.workflowScope?.join(", ") ?? "Appointments, Check-in, Routing"} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{selectedReceptionist ? "Save changes" : "Create receptionist"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* RECEPTIONIST DETAILS VIEW MODAL */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          {viewingReceptionist && (
            <div className="space-y-4">
              <DialogHeader className="border-b pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border border-border">
                    <AvatarImage src={viewingReceptionist.avatarUrl} alt={viewingReceptionist.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {getInitials(viewingReceptionist.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <DialogTitle className="text-base font-bold">{viewingReceptionist.name}</DialogTitle>
                      <StatusBadge status={viewingReceptionist.status} />
                    </div>
                    <DialogDescription className="text-xs mt-0.5">
                      Staff ID: <span className="font-mono font-semibold text-foreground">{viewingReceptionist.id.toUpperCase()}</span> • Joined {viewingReceptionist.createdAt}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* Contact Details */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/30 border border-border text-xs">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary shrink-0" />
                  <div className="truncate">
                    <span className="text-muted-foreground text-[11px]">Email Address</span>
                    <p className="font-medium text-foreground truncate">{viewingReceptionist.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <div>
                    <span className="text-muted-foreground text-[11px]">Phone Number</span>
                    <p className="font-medium text-foreground">{viewingReceptionist.phone}</p>
                  </div>
                </div>
              </div>

              {/* Operational Assignment */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Operational Assignment & Desk Allocation
                </h4>
                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border border-border bg-muted/20 text-xs">
                  <div>
                    <span className="text-muted-foreground">Assigned Desk:</span>
                    <p className="font-bold text-foreground mt-0.5">{viewingReceptionist.desk}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Department:</span>
                    <p className="font-bold text-foreground mt-0.5">{viewingReceptionist.department}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Hospital Branch:</span>
                    <p className="font-semibold text-foreground mt-0.5">{viewingReceptionist.branch}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Facility Location:</span>
                    <p className="font-semibold text-foreground mt-0.5 truncate">{viewingReceptionist.location}</p>
                  </div>
                </div>
              </div>

              {/* Performance & Workload Metrics */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Workload & Throughput
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-lg border border-border bg-muted/30">
                    <span className="text-muted-foreground text-[11px]">Total Handled</span>
                    <p className="font-bold text-sm text-foreground mt-0.5 font-mono">
                      {viewingReceptionist.appointmentsHandled.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg border border-border bg-muted/30">
                    <span className="text-muted-foreground text-[11px]">Context</span>
                    <p className="font-bold text-sm text-foreground mt-0.5">
                      {viewingReceptionist.assignedContext}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg border border-border bg-muted/30">
                    <span className="text-muted-foreground text-[11px]">Status</span>
                    <p className="font-bold text-sm text-success mt-0.5 capitalize">
                      {viewingReceptionist.status}
                    </p>
                  </div>
                </div>
              </div>

              {/* Workflow & Access Governance Scope */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Workflow & Governance Scope
                </h4>
                <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2 text-xs">
                  <div>
                    <span className="text-muted-foreground font-medium">Assigned Workflow Scope:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {viewingReceptionist.workflowScope.map((scope, idx) => (
                        <Badge key={idx} variant="secondary" className="text-[10px]">
                          {scope}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-medium">Permission Capabilities:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {viewingReceptionist.scope.map((s, idx) => (
                        <Badge key={idx} variant="outline" className="text-[10px] bg-background">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="pt-1 border-t border-border flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-success" />
                    <span>Non-clinical operational staff • EHR modification privileges restricted</span>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex flex-row items-center justify-between gap-2 border-t pt-3">
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    const currentRec = viewingReceptionist;
                    setViewDialogOpen(false);
                    openEditDialog(currentRec);
                  }}
                >
                  <PencilLine className="mr-1.5 h-3.5 w-3.5" /> Edit Profile
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* SUSPEND / REACTIVATE RECEPTIONIST DIALOG */}
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent className="max-w-md">
          {suspendTarget && (
            <form onSubmit={handleConfirmSuspend}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {suspendTarget.status === "suspended" ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-success" /> Reactivate Receptionist
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5 text-warning" /> Suspend Receptionist Access
                    </>
                  )}
                </DialogTitle>
                <DialogDescription>
                  {suspendTarget.status === "suspended"
                    ? `Restore operational desk queue access and token management permissions for ${suspendTarget.name}.`
                    : `Temporarily revoke desk queue access and token calling privileges for ${suspendTarget.name}.`}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-3 text-xs">
                <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1">
                  <p><strong>Staff Member:</strong> {suspendTarget.name} ({suspendTarget.email})</p>
                  <p><strong>Assigned Desk:</strong> {suspendTarget.desk} • {suspendTarget.department}</p>
                  <p><strong>Current Status:</strong> <span className="capitalize font-semibold">{suspendTarget.status}</span></p>
                </div>

                {suspendTarget.status !== "suspended" && (
                  <div className="grid gap-1.5">
                    <Label htmlFor="suspend-reason">Suspension Reason</Label>
                    <Select value={suspendReason} onValueChange={setSuspendReason}>
                      <SelectTrigger id="suspend-reason">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Administrative review">Administrative review</SelectItem>
                        <SelectItem value="Unscheduled absence">Unscheduled absence</SelectItem>
                        <SelectItem value="Temporary desk re-allocation">Temporary desk re-allocation</SelectItem>
                        <SelectItem value="Disciplinary inquiry">Disciplinary inquiry</SelectItem>
                        <SelectItem value="Shift rotation leave">Shift rotation leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSuspendDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant={suspendTarget.status === "suspended" ? "default" : "destructive"}
                >
                  {suspendTarget.status === "suspended" ? "Confirm Reactivation" : "Confirm Suspension"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* REPLACE RECEPTIONIST DIALOG */}
      <Dialog open={replaceDialogOpen} onOpenChange={setReplaceDialogOpen}>
        <DialogContent className="max-w-md">
          {replaceTarget && (
            <form onSubmit={handleConfirmReplace}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <RefreshCcw className="h-5 w-5 text-primary" /> Replace Receptionist Handover
                </DialogTitle>
                <DialogDescription>
                  Reassign {replaceTarget.desk} responsibilities and active token queue to a replacement front-desk staff member.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-3 text-xs">
                {/* Outgoing Details */}
                <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Outgoing Receptionist:
                  </span>
                  <p className="font-semibold text-foreground">{replaceTarget.name} ({replaceTarget.desk})</p>
                  <p className="text-muted-foreground">Department: {replaceTarget.department} • Branch: {replaceTarget.branch}</p>
                </div>

                {/* Incoming Selection */}
                <div className="grid gap-1.5">
                  <Label htmlFor="incoming-staff">Select Replacement Staff</Label>
                  <Select value={incomingStaffId} onValueChange={setIncomingStaffId}>
                    <SelectTrigger id="incoming-staff">
                      <SelectValue placeholder="Select replacement receptionist" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffList
                        .filter((s) => s.id !== replaceTarget.id)
                        .map((staff) => (
                          <SelectItem key={staff.id} value={staff.id}>
                            {staff.name} — Current: {staff.desk} ({staff.status})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Handover Reason */}
                <div className="grid gap-1.5">
                  <Label htmlFor="replace-reason">Replacement Reason</Label>
                  <Select value={replaceReason} onValueChange={setReplaceReason}>
                    <SelectTrigger id="replace-reason">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Shift rotation">Shift rotation & handover</SelectItem>
                      <SelectItem value="Emergency desk cover">Emergency desk cover</SelectItem>
                      <SelectItem value="Long-term re-allocation">Long-term re-allocation</SelectItem>
                      <SelectItem value="Workload balancing">Workload balancing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <Checkbox id="auto-tokens" defaultChecked />
                  <Label htmlFor="auto-tokens" className="text-xs font-normal">
                    Auto-transfer active waiting tokens & queue ownership
                  </Label>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setReplaceDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Execute Replacement Handover</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* REMOVE RECEPTIONIST CONFIRMATION DIALOG */}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent className="max-w-sm">
          {removeTarget && (
            <div>
              <DialogHeader>
                <DialogTitle className="text-destructive">Remove Receptionist</DialogTitle>
                <DialogDescription>
                  Are you sure you want to remove <strong className="text-foreground">{removeTarget.name}</strong> from the front desk staff pool?
                </DialogDescription>
              </DialogHeader>

              <div className="py-3 text-xs text-muted-foreground">
                This will unassign <strong className="text-foreground">{removeTarget.desk}</strong>. Active patients must be re-routed.
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setRemoveDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleConfirmRemove}>
                  Confirm Remove
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
