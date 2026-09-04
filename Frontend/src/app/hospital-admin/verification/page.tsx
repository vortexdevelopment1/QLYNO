"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  AlertOctagon,
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  Globe,
  Layers,
  Lock,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Trash2,
  Upload,
  User,
  UserCheck,
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
import { VerificationNav } from "@/hospital-admin/components/verification/verification-nav";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { mockVerificationCases } from "@/hospital-admin/lib/mock-data/verification-cases";
import { VerificationCase, VerificationType, VerificationStatus } from "@/hospital-admin/lib/types";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Trust & Safety Verification workflow";

export default function VerificationMasterPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [cases, setCases] = useState<VerificationCase[]>(mockVerificationCases);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // 1. Submit Hospital Verification Modal State
  const [hospitalModalOpen, setHospitalModalOpen] = useState(false);
  const [hospLegalName, setHospLegalName] = useState("Qlyno Healthcare Private Limited");
  const [hospRegNo, setHospRegNo] = useState("U85110MH2018PTC309112");
  const [hospAddress, setHospAddress] = useState("Plot 42, Healthcare City, Andheri East, Mumbai 400069");
  const [hospEmail, setHospEmail] = useState("legal@qlyno.health");
  const [hospPhone, setHospPhone] = useState("+91 22 6100 8800");
  const [hospOwnership, setHospOwnership] = useState("Private Limited Healthcare Corporation");
  const [hospArea, setHospArea] = useState(120000);

  // 2. Admin Identity Submission Modal State
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminName, setAdminName] = useState("Akash Sharma");
  const [adminEmail, setAdminEmail] = useState("akash.sharma@qlyno.health");
  const [adminPhone, setAdminPhone] = useState("+91 98200 44551");
  const [adminIdDoc, setAdminIdDoc] = useState("Aadhaar / Passport");
  const [adminAuthDoc, setAdminAuthDoc] = useState("Board Resolution / Authorization Letter");

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesSearch =
        c.subjectName.toLowerCase().includes(search.toLowerCase()) ||
        c.caseNo.toLowerCase().includes(search.toLowerCase()) ||
        c.type.toLowerCase().includes(search.toLowerCase()) ||
        (c.reviewerName && c.reviewerName.toLowerCase().includes(search.toLowerCase()));

      const matchesType = typeFilter === "all" || c.type === typeFilter;
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [cases, search, typeFilter, statusFilter]);

  // Handle New Hospital Verification Submission
  const handleSubmitHospitalVerification = (e: React.FormEvent) => {
    e.preventDefault();
    const newCase: VerificationCase = {
      id: `ver_case_${Date.now()}`,
      caseNo: `VER-2026-${Math.floor(100 + Math.random() * 900)}`,
      subjectName: hospLegalName,
      subjectId: "HOSP-001",
      subjectType: "Hospital",
      type: "Hospital Identity",
      status: "Pending",
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publicSearchVisible: false,
      documents: [
        {
          id: `doc_${Date.now()}_1`,
          name: "Certificate of Incorporation & Articles of Association",
          type: "Legal Entity Proof",
          documentNumber: hospRegNo,
          fileSize: "3.1 MB",
          uploadedAt: new Date().toISOString(),
          status: "Pending Review",
        },
        {
          id: `doc_${Date.now()}_2`,
          name: "Hospital Registered Facility Proof & Layout",
          type: "Facility Evidence",
          fileSize: "5.4 MB",
          uploadedAt: new Date().toISOString(),
          status: "Pending Review",
        },
      ],
      timeline: [
        {
          id: `tl_${Date.now()}`,
          status: "Pending",
          actorName: adminName,
          actorRole: "Hospital Admin",
          timestamp: new Date().toISOString(),
          notes: "Hospital legal identity and facility evidence package submitted for platform trust audit.",
        },
      ],
      metadata: {
        legalName: hospLegalName,
        registrationNo: hospRegNo,
        registeredAddress: hospAddress,
        contactEmail: hospEmail,
        contactPhone: hospPhone,
        ownershipType: hospOwnership,
        facilityAreaSqFt: hospArea,
      },
    };

    setCases((prev) => [newCase, ...prev]);
    toast({
      title: "Hospital Verification Submitted",
      description: `Verification Case ${newCase.caseNo} created. Sent to Platform Trust & Safety team for review. (${DELEGATION_STRING})`,
    });
    setHospitalModalOpen(false);
  };

  // Handle Admin Identity Submission
  const handleSubmitAdminIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    const newCase: VerificationCase = {
      id: `ver_case_${Date.now()}`,
      caseNo: `VER-2026-${Math.floor(200 + Math.random() * 800)}`,
      subjectName: `Hospital Admin — ${adminName}`,
      subjectId: `ADMIN-${Math.floor(100 + Math.random() * 900)}`,
      subjectType: "Admin",
      type: "Admin Identity",
      status: "Pending",
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publicSearchVisible: false,
      documents: [
        {
          id: `doc_${Date.now()}_1`,
          name: `Government Photo ID (${adminIdDoc})`,
          type: "Identity Proof",
          fileSize: "1.8 MB",
          uploadedAt: new Date().toISOString(),
          status: "Pending Review",
        },
        {
          id: `doc_${Date.now()}_2`,
          name: `Board Authorization Resolution (${adminAuthDoc})`,
          type: "Authorization Letter",
          fileSize: "1.4 MB",
          uploadedAt: new Date().toISOString(),
          status: "Pending Review",
        },
      ],
      timeline: [
        {
          id: `tl_${Date.now()}`,
          status: "Pending",
          actorName: adminName,
          actorRole: "Hospital Admin Applicant",
          timestamp: new Date().toISOString(),
          notes: "Admin identification documents uploaded for credentialing.",
        },
      ],
      metadata: {
        legalName: adminName,
        contactEmail: adminEmail,
        contactPhone: adminPhone,
      },
    };

    setCases((prev) => [newCase, ...prev]);
    toast({
      title: "Admin Identity Submitted",
      description: `Case ${newCase.caseNo} logged. Verification initiated for ${adminName}. (${DELEGATION_STRING})`,
    });
    setAdminModalOpen(false);
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Trust &amp; Safety Verification Gate"
          description="Trust &amp; safety lifecycle console for hospital identity, legal registrations, admin rights, doctor affiliations, and capability reviews."
          crumbs={[{ label: "Administration" }, { label: "Verifications" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading verification directory...
        </div>
      </div>
    );
  }

  // Summary Metrics
  const totalCases = cases.length;
  const verifiedCount = cases.filter((c) => c.status === "Verified").length;
  const needsInfoCount = cases.filter((c) => c.status === "Needs More Information").length;
  const pendingReviewCount = cases.filter((c) => c.status === "Pending" || c.status === "Under Review").length;
  const suspendedCount = cases.filter((c) => c.status === "Suspended").length;

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Trust &amp; Safety Verification Gate"
        description="Trust &amp; safety lifecycle console for hospital identity, legal registrations, admin rights, doctor affiliations, and capability reviews."
        crumbs={[{ label: "Administration" }, { label: "Verifications" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 font-semibold text-xs border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => setAdminModalOpen(true)}
            >
              <UserCheck className="h-4 w-4" /> Verify Admin Identity
            </Button>
            <Button
              size="sm"
              className="gap-1.5 font-semibold text-xs bg-primary text-primary-foreground"
              onClick={() => setHospitalModalOpen(true)}
            >
              <Plus className="h-4 w-4" /> Submit Hospital Verification
            </Button>
          </div>
        }
      />

      <VerificationNav />

      {/* Scope Indicator & PRD Section 13 Governing Principle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Hospital &amp; Doctor Trust Gatekeeper" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
          <span>Governing Principle (Section 13): Institutions remain unsearchable publicly until verification completes</span>
        </div>
      </div>

      {/* Needs More Information Notice (If present) */}
      {needsInfoCount > 0 && (
        <Card className="border-amber-500/40 bg-amber-500/10 shadow-xs">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-900 dark:text-amber-300">
                  ACTION REQUIRED: {needsInfoCount} Verification Case(s) Require Additional Information
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Platform auditors have flagged specific documents. Per Edge Case 2, you can replace only the missing/blurry items without restarting the full submission.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="text-xs font-semibold border-amber-500/30 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20"
              onClick={() => setStatusFilter("Needs More Information")}
            >
              View Flagged Cases
            </Button>
          </CardContent>
        </Card>
      )}

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Cases</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">{totalCases}</p>
          <span className="text-[10px] text-muted-foreground">All verification objects</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Verified &amp; Live</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{verifiedCount}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Searchable in Qlyno Directory</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Pending / In Review</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">{pendingReviewCount}</p>
          <span className="text-[10px] text-cyan-600 font-medium">Auditor review queued</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Action Required</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{needsInfoCount}</p>
          <span className="text-[10px] text-amber-600 font-medium">Needs More Information</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Suspended / Downgraded</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">{suspendedCount}</p>
          <span className="text-[10px] text-rose-600 font-medium">Immediate public block</span>
        </Card>
      </div>

      {/* Main Cases Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Verification Cases Directory</CardTitle>
          <CardDescription className="text-xs">
            Review document verification lifecycles, auditor decisions, and public search indexation status.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subject, case #, or reviewer..."
                className="pl-8 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px] text-xs h-9">
                  <SelectValue placeholder="Verification Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Verification Types</SelectItem>
                  <SelectItem value="Hospital Identity">Hospital Identity</SelectItem>
                  <SelectItem value="Hospital Registration">Hospital Registration</SelectItem>
                  <SelectItem value="Facility Evidence">Facility Evidence</SelectItem>
                  <SelectItem value="Admin Identity">Admin Identity</SelectItem>
                  <SelectItem value="Doctor Affiliation">Doctor Affiliation</SelectItem>
                  <SelectItem value="Specialty / Qualification">Specialty / Qualification</SelectItem>
                  <SelectItem value="Ambulance Capability">Ambulance Capability</SelectItem>
                  <SelectItem value="Emergency Capability">Emergency Capability</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] text-xs h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Verified">Verified</SelectItem>
                  <SelectItem value="Needs More Information">Needs More Info</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold w-[120px]">Case #</TableHead>
                  <TableHead className="text-xs font-bold w-[240px]">Subject / Entity</TableHead>
                  <TableHead className="text-xs font-bold w-[180px]">Verification Type</TableHead>
                  <TableHead className="text-xs font-bold w-[130px]">Status</TableHead>
                  <TableHead className="text-xs font-bold w-[140px]">Submitted Date</TableHead>
                  <TableHead className="text-xs font-bold w-[180px]">Assigned Reviewer</TableHead>
                  <TableHead className="text-xs font-bold w-[140px]">Public Visibility</TableHead>
                  <TableHead className="text-xs font-bold text-right w-[120px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-xs text-muted-foreground">
                      No verification cases match your active filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCases.map((c) => (
                    <TableRow key={c.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs font-bold text-primary">
                        {c.caseNo}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                          {c.subjectName}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          ID: {c.subjectId} • <span className="font-sans">{c.subjectType}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-medium border-border">
                          {c.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            c.status === "Verified"
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                              : c.status === "Under Review"
                              ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 text-[10px]"
                              : c.status === "Needs More Information"
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] animate-pulse"
                              : c.status === "Suspended" || c.status === "Rejected"
                              ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px]"
                              : "text-[10px]"
                          }
                        >
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {new Date(c.submittedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {c.reviewerName ? (
                          <div>
                            <div className="text-xs font-medium text-foreground">{c.reviewerName}</div>
                            <div className="text-[10px] text-muted-foreground truncate max-w-[170px]">{c.reviewerRole}</div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">Queue Assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {c.publicSearchVisible ? (
                          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[9px] gap-1">
                            <Globe className="h-2.5 w-2.5" /> Public Live
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[9px] text-muted-foreground border-border gap-1">
                            <Lock className="h-2.5 w-2.5" /> Hidden / Blocked
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" asChild className="h-7 text-xs font-semibold text-primary hover:bg-primary/10">
                          <Link href={`/hospital-admin/verification/${c.id}`}>
                            <Eye className="h-3 w-3 mr-1" /> View Case
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* MODAL 1: SUBMIT HOSPITAL VERIFICATION */}
      <Dialog open={hospitalModalOpen} onOpenChange={setHospitalModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <form onSubmit={handleSubmitHospitalVerification}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" /> Submit Hospital Verification
              </DialogTitle>
              <DialogDescription className="text-xs">
                Submit legal entity registration, ownership deed, and operational facility evidence for Trust &amp; Safety accreditation.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-3 text-xs">
              <div className="grid gap-1">
                <Label htmlFor="h-legal">Legal / Registered Corporate Entity Name *</Label>
                <Input
                  id="h-legal"
                  required
                  value={hospLegalName}
                  onChange={(e) => setHospLegalName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="h-cin">Registration / CIN / License # *</Label>
                  <Input
                    id="h-cin"
                    required
                    value={hospRegNo}
                    onChange={(e) => setHospRegNo(e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="h-own">Ownership Structure *</Label>
                  <Input
                    id="h-own"
                    required
                    value={hospOwnership}
                    onChange={(e) => setHospOwnership(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="h-addr">Registered Hospital Physical Address *</Label>
                <Input
                  id="h-addr"
                  required
                  value={hospAddress}
                  onChange={(e) => setHospAddress(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="h-mail">Official Legal Email *</Label>
                  <Input
                    id="h-mail"
                    type="email"
                    required
                    value={hospEmail}
                    onChange={(e) => setHospEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="h-phone">Official Hospital Phone *</Label>
                  <Input
                    id="h-phone"
                    required
                    value={hospPhone}
                    onChange={(e) => setHospPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="h-area">Hospital Facility Carpet Area (Sq. Ft.)</Label>
                <Input
                  id="h-area"
                  type="number"
                  value={hospArea}
                  onChange={(e) => setHospArea(Number(e.target.value))}
                />
              </div>

              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
                <span className="text-[11px] font-bold text-foreground flex items-center gap-1">
                  <Upload className="h-3.5 w-3.5 text-primary" /> Required Document Upload Attachments
                </span>
                <div className="space-y-1 text-[11px] text-muted-foreground">
                  <div className="flex items-center justify-between p-2 rounded bg-card border border-border">
                    <span>1. Certificate of Incorporation / Society Registration Deed</span>
                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[9px]">Attached (3.1 MB)</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-card border border-border">
                    <span>2. Clinical Establishments Act Registration Certificate</span>
                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[9px]">Attached (5.4 MB)</Badge>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setHospitalModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold">
                Submit for Verification Audit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: VERIFY ADMIN IDENTITY */}
      <Dialog open={adminModalOpen} onOpenChange={setAdminModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmitAdminIdentity}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" /> Verify Administrator Identity
              </DialogTitle>
              <DialogDescription className="text-xs">
                Lightweight identity verification sub-flow for individuals requesting Hospital Admin delegated authority.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-3 text-xs">
              <div className="grid gap-1">
                <Label htmlFor="a-name">Administrator Full Legal Name *</Label>
                <Input
                  id="a-name"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="a-mail">Admin Email *</Label>
                  <Input
                    id="a-mail"
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="a-phone">Mobile Number *</Label>
                  <Input
                    id="a-phone"
                    required
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="a-doc">Government Identity Document *</Label>
                <Input
                  id="a-doc"
                  required
                  value={adminIdDoc}
                  onChange={(e) => setAdminIdDoc(e.target.value)}
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="a-auth">Board Resolution / Hospital Signatory Letter *</Label>
                <Input
                  id="a-auth"
                  required
                  value={adminAuthDoc}
                  onChange={(e) => setAdminAuthDoc(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setAdminModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold">
                Submit Admin Identity Proof
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
