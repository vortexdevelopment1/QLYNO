"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  GitMerge,
  MoreHorizontal,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/hospital-admin/components/ui/avatar";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/hospital-admin/components/ui/dropdown-menu";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/hospital-admin/components/ui/tabs";
import { EmptyState } from "@/hospital-admin/components/shared/empty-state";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { StatusBadge } from "@/hospital-admin/components/shared/status-badge";
import { Toolbar } from "@/hospital-admin/components/shared/toolbar";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { patients } from "@/hospital-admin/lib/mock-data/patients";
import type { Patient } from "@/hospital-admin/lib/types";
import { getInitials } from "@/hospital-admin/lib/utils";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Patient Management workflow";

interface OpdQueueItem {
  id: string;
  token: string;
  patientName: string;
  qlynoId: string;
  doctor: string;
  department: string;
  waitTime: string;
  status: "Registered" | "Waiting" | "In Consultation" | "Follow-up Scheduled" | "Completed";
}

const initialOpdQueue: OpdQueueItem[] = [
  { id: "q1", token: "OPD-101", patientName: "Aarav Shah", qlynoId: "QLY-PAT-2024-00841", doctor: "Dr. Rajesh Sharma", department: "Cardiology", waitTime: "12 mins", status: "In Consultation" },
  { id: "q2", token: "OPD-102", patientName: "Meera Nambiar", qlynoId: "QLY-PAT-2023-00412", doctor: "Dr. Ananya Rao", department: "Obstetrics", waitTime: "25 mins", status: "Waiting" },
  { id: "q3", token: "OPD-103", patientName: "Rohan Verma", qlynoId: "QLY-PAT-2024-00918", doctor: "Dr. Vikram Patel", department: "Orthopedics", waitTime: "5 mins", status: "Registered" },
  { id: "q4", token: "OPD-104", patientName: "Pooja Hegde", qlynoId: "QLY-PAT-2022-00109", doctor: "Dr. Sunita Deshmukh", department: "Dermatology", waitTime: "—", status: "Follow-up Scheduled" },
  { id: "q5", token: "OPD-105", patientName: "Kabir Mehta", qlynoId: "QLY-PAT-2024-00331", doctor: "Dr. Rajesh Sharma", department: "Cardiology", waitTime: "Completed", status: "Completed" },
];

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const [relationshipStatus, setRelationshipStatus] = useState("all");
  const [globalStatus, setGlobalStatus] = useState("all");
  const [open, setOpen] = useState(false);
  const [duplicateCheckResults, setDuplicateCheckResults] = useState<typeof patients>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  
  // Search & Connect tab state
  const [searchIdQuery, setSearchIdQuery] = useState("");
  const [searchNameQuery, setSearchNameQuery] = useState("");
  const [searchPhoneQuery, setSearchPhoneQuery] = useState("");
  const [searchEmailQuery, setSearchEmailQuery] = useState("");
  const [searchTabResults, setSearchTabResults] = useState<typeof patients | null>(null);

  // Merge Dialog state
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [selectedPatientForMerge, setSelectedPatientForMerge] = useState<Patient | null>(null);

  // Consent Dialog state
  const [consentDialogOpen, setConsentDialogOpen] = useState(false);
  const [selectedPatientForConsent, setSelectedPatientForConsent] = useState<Patient | null>(null);
  const [consentStatus, setConsentStatus] = useState("granted");

  // OPD Queue state
  const [opdQueue, setOpdQueue] = useState<OpdQueueItem[]>(initialOpdQueue);

  const { toast } = useToast();

  const filtered = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.qlynoPatientId.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search);
    const matchesRelationship =
      relationshipStatus === "all" ||
      p.hospitalRelationships?.[0]?.status === relationshipStatus;
    const matchesGlobal = globalStatus === "all" || p.globalStatus === globalStatus;
    return matchesSearch && matchesRelationship && matchesGlobal;
  });

  const handleDuplicateCheck = (formElement: HTMLFormElement) => {
    const formData = new FormData(formElement);
    const searchName = formData.get("name") as string;
    const results = patients.filter((p) => p.name.toLowerCase().includes(searchName.toLowerCase()));
    setDuplicateCheckResults(results);
    setSearchPerformed(true);

    if (results.length > 0) {
      toast({
        title: "Potential duplicates found",
        description: `Found ${results.length} patient(s) with similar name. Confirm to proceed. (${DELEGATION_STRING})`,
      });
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    setSearchPerformed(false);
    setDuplicateCheckResults([]);
    toast({
      title: "Patient registered",
      description: `A new Qlyno Patient ID has been created and hospital relationship established. (${DELEGATION_STRING})`,
    });
  };

  const handleSearchTab = () => {
    const results = patients.filter((p) => {
      const matchId = !searchIdQuery || p.qlynoPatientId.toLowerCase().includes(searchIdQuery.toLowerCase());
      const matchName = !searchNameQuery || p.name.toLowerCase().includes(searchNameQuery.toLowerCase());
      const matchPhone = !searchPhoneQuery || p.phone.includes(searchPhoneQuery);
      const matchEmail = !searchEmailQuery || p.email.toLowerCase().includes(searchEmailQuery.toLowerCase());
      return matchId && matchName && matchPhone && matchEmail;
    });
    setSearchTabResults(results);
    toast({
      title: "Search executed",
      description: `Lookup returned ${results.length} patient record(s). (${DELEGATION_STRING})`,
    });
  };

  const handleConnectPatient = (patientName: string) => {
    toast({
      title: "Patient connected",
      description: `Established hospital relationship and access rights for ${patientName}. (${DELEGATION_STRING})`,
    });
  };

  const handleMergeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMergeDialogOpen(false);
    toast({
      title: "Records merged successfully",
      description: `Audited merge completed for ${selectedPatientForMerge?.name} retaining primary Qlyno ID. (${DELEGATION_STRING})`,
    });
  };

  const handleConsentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConsentDialogOpen(false);
    toast({
      title: "Consent controls updated",
      description: `Updated data-sharing consent status to '${consentStatus}' for ${selectedPatientForConsent?.name}. (${DELEGATION_STRING})`,
    });
  };

  const handleQueueStatusChange = (id: string, newStatus: OpdQueueItem["status"]) => {
    setOpdQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    toast({
      title: "Queue status updated",
      description: `Token status moved to ${newStatus}. (${DELEGATION_STRING})`,
    });
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Patient & Treatment Management"
        description="One persistent Qlyno Patient ID across all hospitals. Search first to prevent duplicate identities."
        crumbs={[{ label: "Care Delivery" }, { label: "Patients" }]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Register Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleRegister}>
                <DialogHeader>
                  <DialogTitle>Register a new patient</DialogTitle>
                  <DialogDescription>
                    Qlyno checks for existing Patient IDs first. If potential matches are found, confirm to proceed.
                  </DialogDescription>
                </DialogHeader>

                {!searchPerformed ? (
                  <div className="space-y-4 py-4">
                    <div className="grid gap-1.5">
                      <Label htmlFor="pat-name">Patient Name</Label>
                      <Input id="pat-name" name="name" placeholder="Full name (e.g. Aarav Shah)" required />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={(e) => {
                        const form = (e.currentTarget as HTMLButtonElement).closest("form") as HTMLFormElement;
                        handleDuplicateCheck(form);
                      }}
                    >
                      <Search className="mr-2 h-4 w-4" /> Check for existing Qlyno ID
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 py-4">
                    {duplicateCheckResults.length > 0 && (
                      <Card className="border-orange-200 bg-orange-50 dark:border-orange-950 dark:bg-orange-950/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-base text-orange-900 dark:text-orange-200">
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                            Potential Duplicates Found ({duplicateCheckResults.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="mb-3 text-xs text-muted-foreground">
                            Similar patient identities exist. Please verify carefully before creating a new duplicate record.
                          </p>
                          <div className="space-y-2">
                            {duplicateCheckResults.map((p) => (
                              <div key={p.id} className="flex items-center justify-between rounded border bg-card p-2 text-sm">
                                <div>
                                  <p className="font-medium text-foreground">{p.name}</p>
                                  <p className="text-xs text-muted-foreground">{p.qlynoPatientId} • {p.phone}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="border-orange-300 text-orange-700 dark:text-orange-300">
                                    Duplicate Risk: High
                                  </Badge>
                                  <StatusBadge status={p.hospitalRelationships?.[0]?.status || "new"} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="grid gap-1.5">
                      <Label htmlFor="pat-phone">Phone</Label>
                      <Input id="pat-phone" placeholder="+91 98220 11009" required />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="pat-dob">Date of Birth</Label>
                      <Input id="pat-dob" type="date" required />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="pat-channel">Acquisition Channel (Discovery Avenue)</Label>
                      <Select defaultValue="Self-Referral">
                        <SelectTrigger id="pat-channel">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Self-Referral">Self-Referral</SelectItem>
                          <SelectItem value="Doctor Referral">Doctor Referral (External Consultant)</SelectItem>
                          <SelectItem value="Insurance Network">Insurance Network / TPA</SelectItem>
                          <SelectItem value="Online Booking">Online Booking / Mobile App</SelectItem>
                          <SelectItem value="Walk-in">Walk-in Direct Registration</SelectItem>
                          <SelectItem value="Corporate Health Partner">Corporate Health Partner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="pat-consent">Initial Consent Status</Label>
                      <Select defaultValue="granted">
                        <SelectTrigger id="pat-consent">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="granted">Granted (Full care sharing)</SelectItem>
                          <SelectItem value="restricted">Restricted (Selective records)</SelectItem>
                          <SelectItem value="revoked">Revoked (Emergency access only)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      setSearchPerformed(false);
                      setDuplicateCheckResults([]);
                    }}
                  >
                    Cancel
                  </Button>
                  {searchPerformed && (
                    <>
                      <Button type="button" variant="outline" onClick={() => setSearchPerformed(false)}>
                        Back
                      </Button>
                      <Button type="submit">Confirm & Register New Identity</Button>
                    </>
                  )}
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Patient & Treatment Management" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-warning" />
          <span>Operational coordination only • Clinical decisions reserved for licensed clinicians</span>
        </div>
      </div>

      <Tabs defaultValue="all-patients" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all-patients">All Patients</TabsTrigger>
          <TabsTrigger value="search">Search & Connect</TabsTrigger>
          <TabsTrigger value="opd-queue">OPD Queue Board</TabsTrigger>
        </TabsList>

        {/* TAB 1: ALL PATIENTS */}
        <TabsContent value="all-patients" className="space-y-4">
          <Toolbar
            searchValue={search}
            onSearchChange={setSearch}
            placeholder="Search by name, Qlyno ID or phone"
          >
            <Select value={relationshipStatus} onValueChange={setRelationshipStatus}>
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All relationships</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="duplicate-flagged">Duplicate-flagged</SelectItem>
              </SelectContent>
            </Select>
            <Select value={globalStatus} onValueChange={setGlobalStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Global" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </Toolbar>

          <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
            {filtered.length === 0 ? (
              <EmptyState icon={Users} title="No patients found" description="Adjust your search or filters." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Qlyno ID</TableHead>
                    <TableHead>Hospital Relationship</TableHead>
                    <TableHead>Consent</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead>Global Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => {
                    const relationship = p.hospitalRelationships?.[0];
                    const isDuplicate = relationship?.status === "duplicate-flagged";
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <Link href={`/hospital-admin/patients/${p.id}`} className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={p.avatarUrl} alt={p.name} />
                              <AvatarFallback>{getInitials(p.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-foreground hover:text-primary">{p.name}</p>
                              <p className="text-xs text-muted-foreground">{p.phone}</p>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {p.qlynoPatientId}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={relationship?.status || "new"} />
                            {isDuplicate && (
                              <Badge variant="outline" className="border-destructive text-xs text-destructive">
                                Merge Needed
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              relationship?.consent.status === "granted"
                                ? "success"
                                : relationship?.consent.status === "restricted"
                                ? "warning"
                                : "destructive"
                            }
                          >
                            {relationship?.consent.status || "granted"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {relationship?.billingStatus?.totalOutstanding ? (
                            <span className="flex items-center gap-1 font-medium text-destructive">
                              <AlertTriangle className="h-3 w-3" />
                              ₹{relationship.billingStatus.totalOutstanding.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={p.globalStatus} />
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/hospital-admin/patients/${p.id}`}>View details & timeline</Link>
                              </DropdownMenuItem>
                              {(!relationship || relationship.status === "new") && (
                                <DropdownMenuItem onClick={() => handleConnectPatient(p.name)}>
                                  <UserCheck className="mr-2 h-4 w-4" /> Connect to hospital
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedPatientForConsent(p);
                                  setConsentStatus(relationship?.consent?.status || "granted");
                                  setConsentDialogOpen(true);
                                }}
                              >
                                <Shield className="mr-2 h-4 w-4" /> Manage consent records
                              </DropdownMenuItem>
                              {isDuplicate && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-primary font-medium"
                                    onClick={() => {
                                      setSelectedPatientForMerge(p);
                                      setMergeDialogOpen(true);
                                    }}
                                  >
                                    <GitMerge className="mr-2 h-4 w-4" /> Merge duplicate records
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* TAB 2: SEARCH & CONNECT */}
        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Identity Lookup & Duplicate Risk Check</CardTitle>
              <CardDescription>
                Search across Qlyno network by Patient ID, name, phone, or email before initiating new registrations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="s-id">Qlyno Patient ID</Label>
                  <Input id="s-id" placeholder="QLY-PAT-..." value={searchIdQuery} onChange={(e) => setSearchIdQuery(e.target.value)} />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="s-name">Patient Name</Label>
                  <Input id="s-name" placeholder="Name" value={searchNameQuery} onChange={(e) => setSearchNameQuery(e.target.value)} />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="s-phone">Phone Number</Label>
                  <Input id="s-phone" placeholder="Phone" value={searchPhoneQuery} onChange={(e) => setSearchPhoneQuery(e.target.value)} />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="s-email">Email Address</Label>
                  <Input id="s-email" placeholder="Email" value={searchEmailQuery} onChange={(e) => setSearchEmailQuery(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSearchTab}>
                  <Search className="mr-2 h-4 w-4" /> Search Qlyno Registry
                </Button>
                <Button variant="outline" onClick={() => { setSearchIdQuery(""); setSearchNameQuery(""); setSearchPhoneQuery(""); setSearchEmailQuery(""); setSearchTabResults(null); }}>
                  Reset
                </Button>
              </div>

              {searchTabResults !== null && (
                <div className="space-y-3 pt-4 border-t border-border">
                  <h4 className="font-medium text-foreground">Search Results ({searchTabResults.length})</h4>
                  {searchTabResults.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No matching identities found. You may safely proceed to register this as a new patient.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {searchTabResults.map((p) => {
                        const rel = p.hospitalRelationships?.[0];
                        const hasActiveRel = rel && rel.status === "active";
                        return (
                          <div key={p.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border border-border p-3 gap-3 bg-card">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={p.avatarUrl} alt={p.name} />
                                <AvatarFallback>{getInitials(p.name)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-foreground">{p.name}</p>
                                <p className="text-xs text-muted-foreground font-mono">{p.qlynoPatientId} • {p.phone} • {p.bloodGroup}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="border-warning text-warning">
                                Duplicate Risk: Identified
                              </Badge>
                              {hasActiveRel ? (
                                <Button size="sm" variant="outline" asChild>
                                  <Link href={`/hospital-admin/patients/${p.id}`}>View Record</Link>
                                </Button>
                              ) : (
                                <Button size="sm" onClick={() => handleConnectPatient(p.name)}>
                                  <UserCheck className="mr-2 h-4 w-4" /> Connect Patient
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: OPD QUEUE BOARD */}
        <TabsContent value="opd-queue" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>OPD Queue & Registration Board</CardTitle>
                <CardDescription>Live outpatient queue tracking across all department consultation rooms.</CardDescription>
              </div>
              <Button size="sm" onClick={() => toast({ title: "Walk-in registered", description: `Added walk-in token to queue. (${DELEGATION_STRING})` })}>
                <Plus className="mr-2 h-4 w-4" /> Quick Token Check-In
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token ID</TableHead>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Consulting Doctor</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Wait Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {opdQueue.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono font-medium">{item.token}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{item.patientName}</p>
                          <p className="text-xs text-muted-foreground">{item.qlynoId}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{item.doctor}</TableCell>
                      <TableCell className="text-sm">{item.department}</TableCell>
                      <TableCell className="text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" /> {item.waitTime}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === "In Consultation"
                              ? "default"
                              : item.status === "Waiting"
                              ? "warning"
                              : item.status === "Completed"
                              ? "success"
                              : "secondary"
                          }
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Update <MoreHorizontal className="ml-1 h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleQueueStatusChange(item.id, "Waiting")}>
                              Mark Waiting
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleQueueStatusChange(item.id, "In Consultation")}>
                              Mark In Consultation
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleQueueStatusChange(item.id, "Follow-up Scheduled")}>
                              Mark Follow-up Scheduled
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleQueueStatusChange(item.id, "Completed")}>
                              Mark Completed
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MERGE RECORDS DIALOG */}
      <Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
        <DialogContent className="max-w-lg">
          <form onSubmit={handleMergeSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GitMerge className="h-5 w-5 text-primary" /> Merge Duplicate Patient Records
              </DialogTitle>
              <DialogDescription>
                Explicit, audited reconciliation of duplicate records into a unified Qlyno Patient ID.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-3">
              <div className="rounded-lg border border-border p-3 bg-muted/30 text-sm">
                <p className="font-semibold text-foreground">Target Record to Retain:</p>
                <p className="text-muted-foreground">{selectedPatientForMerge?.name} ({selectedPatientForMerge?.qlynoPatientId})</p>
                <p className="mt-2 text-xs text-muted-foreground">All treatment histories, visits, and documents will be consolidated under this primary ID.</p>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="merge-reason">Audited Merge Justification</Label>
                <Input id="merge-reason" placeholder="e.g. Identity verified via Aadhaar & phone match" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setMergeDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Confirm & Complete Merge</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MANAGE CONSENT DIALOG */}
      <Dialog open={consentDialogOpen} onOpenChange={setConsentDialogOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleConsentSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" /> Manage Patient Consent Controls
              </DialogTitle>
              <DialogDescription>
                Set data-sharing permissions and enforce patient privacy boundaries.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-3">
              <div>
                <p className="text-sm font-medium">{selectedPatientForConsent?.name}</p>
                <p className="text-xs text-muted-foreground">{selectedPatientForConsent?.qlynoPatientId}</p>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="c-status">Consent Status</Label>
                <Select value={consentStatus} onValueChange={setConsentStatus}>
                  <SelectTrigger id="c-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="granted">Granted (Share OPD, Prescriptions, Summaries)</SelectItem>
                    <SelectItem value="restricted">Restricted (Apply sensitive data filters)</SelectItem>
                    <SelectItem value="revoked">Revoked (Emergency care only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg border border-border p-3 text-xs text-muted-foreground bg-muted/30">
                <p className="font-semibold text-foreground">Enforced Rule:</p>
                Admin cannot bypass or override patient consent controls to expose restricted clinical categories.
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setConsentDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Consent Settings</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
