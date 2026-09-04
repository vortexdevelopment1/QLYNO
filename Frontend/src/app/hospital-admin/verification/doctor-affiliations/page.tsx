"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileCheck,
  Globe,
  Lock,
  Search,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/hospital-admin/components/ui/avatar";
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
import { VerificationNav } from "@/hospital-admin/components/verification/verification-nav";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { mockDoctorAffiliations } from "@/hospital-admin/lib/mock-data/verification-cases";
import { DoctorAffiliationVerification } from "@/hospital-admin/lib/types";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Doctor Affiliation Confirmation workflow";

export default function DoctorAffiliationsVerificationPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [affiliations, setAffiliations] = useState<DoctorAffiliationVerification[]>(mockDoctorAffiliations);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredAffiliations = useMemo(() => {
    return affiliations.filter((doc) => {
      const matchesSearch =
        doc.doctorName.toLowerCase().includes(search.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(search.toLowerCase()) ||
        doc.registrationNo.toLowerCase().includes(search.toLowerCase()) ||
        doc.doctorId.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || doc.publicSearchStatus === statusFilter;
      const matchesType = typeFilter === "all" || doc.affiliationType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [affiliations, search, statusFilter, typeFilter]);

  // Handle Hospital-Side Affiliation Toggle (Admin's Action)
  const handleToggleHospitalAffiliation = (docId: string) => {
    setAffiliations((prev) =>
      prev.map((doc) => {
        if (doc.id !== docId) return doc;

        const newAffirmedState = !doc.hospitalAffiliationConfirmed;
        let newPublicStatus = doc.publicSearchStatus;

        if (newAffirmedState) {
          // If platform verified already, becomes Live. If not, becomes Blocked (Pending Platform Review).
          newPublicStatus = doc.platformCredentialsVerified
            ? "Live / Searchable"
            : "Blocked (Pending Platform Review)";
        } else {
          newPublicStatus = "Blocked (Unconfirmed Affiliation)";
        }

        return {
          ...doc,
          hospitalAffiliationConfirmed: newAffirmedState,
          hospitalAffirmedAt: newAffirmedState ? new Date().toISOString() : undefined,
          publicSearchStatus: newPublicStatus,
        };
      })
    );

    const targetDoc = affiliations.find((d) => d.id === docId);
    const willBeAffirmed = targetDoc ? !targetDoc.hospitalAffiliationConfirmed : false;

    toast({
      title: willBeAffirmed ? "Hospital Affiliation Confirmed" : "Affiliation Revoked",
      description: `${targetDoc?.doctorName}: Hospital affiliation has been ${
        willBeAffirmed ? "confirmed" : "revoked"
      }. (${DELEGATION_STRING})`,
    });
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Doctor Affiliation &amp; Credentialing Console"
          description="Two-step Trust &amp; Safety gate separating hospital affiliation confirmation from platform-level credential verification."
          crumbs={[{ label: "Administration" }, { label: "Verifications", href: "/hospital-admin/verification" }, { label: "Doctor Affiliations" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading affiliations console...
        </div>
      </div>
    );
  }

  const totalDoctors = affiliations.length;
  const livePublicCount = affiliations.filter((d) => d.publicSearchStatus === "Live / Searchable").length;
  const pendingPlatformCount = affiliations.filter((d) => d.publicSearchStatus === "Blocked (Pending Platform Review)").length;
  const unconfirmedCount = affiliations.filter((d) => !d.hospitalAffiliationConfirmed).length;

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Doctor Affiliation &amp; Credentialing Console"
        description="Two-step Trust &amp; Safety gate separating hospital affiliation confirmation from platform-level credential verification."
        crumbs={[{ label: "Administration" }, { label: "Verifications", href: "/hospital-admin/verification" }, { label: "Doctor Affiliations" }]}
      />

      <VerificationNav />

      {/* Scope Indicator & Rules 13-CANNOT-1 & 3 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Doctor Affiliation Gatekeeper" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
          <span>Rules 13-CANNOT-1 &amp; 3: Admin confirms affiliation; Platform verifies degrees. Both required for public search.</span>
        </div>
      </div>

      {/* Two-Step Workflow Explainer Banner */}
      <Card className="border-primary/20 bg-primary/5 shadow-xs">
        <CardContent className="p-3.5 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <UserCheck className="h-5 w-5 text-primary shrink-0" />
            <div className="space-y-0.5">
              <span className="font-bold text-foreground">Two-Step Trust Architecture (PRD Screen 5):</span>
              <p className="text-[11px] text-muted-foreground">
                <span className="font-semibold text-primary">Step 1 (Hospital Action):</span> Hospital confirms the doctor actively practices at this institution.
                {" • "}
                <span className="font-semibold text-primary">Step 2 (Platform Action):</span> Platform independently verifies MMC/NMC medical licenses and degrees before public discovery.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Affiliated Doctors</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">{totalDoctors} Specialists</p>
          <span className="text-[10px] text-muted-foreground">Roster candidates</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Live in Public Search</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{livePublicCount} Doctors</p>
          <span className="text-[10px] text-emerald-600 font-medium">Both Step 1 &amp; 2 Verified</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Awaiting Platform Review</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">{pendingPlatformCount} Doctors</p>
          <span className="text-[10px] text-amber-600 font-medium">Affiliated • Credentials Pending</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Unconfirmed Affiliations</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">{unconfirmedCount} Doctors</p>
          <span className="text-[10px] text-rose-600 font-medium">Requires Admin confirmation</span>
        </Card>
      </div>

      {/* Doctor Affiliations Master Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Doctor Affiliations &amp; Public Visibility Matrix</CardTitle>
          <CardDescription className="text-xs">
            Confirm hospital affiliations and monitor platform credentialing status per PRD Section 13.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search doctor, specialty, or license #..."
                className="pl-8 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px] text-xs h-9">
                  <SelectValue placeholder="Affiliation Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Affiliation Types</SelectItem>
                  <SelectItem value="Full-Time Consultant">Full-Time Consultant</SelectItem>
                  <SelectItem value="Visiting Specialist">Visiting Specialist</SelectItem>
                  <SelectItem value="Honorary Surgeon">Honorary Surgeon</SelectItem>
                  <SelectItem value="On-Call Emergency">On-Call Emergency</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px] text-xs h-9">
                  <SelectValue placeholder="Public Search Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Live / Searchable">Live / Searchable</SelectItem>
                  <SelectItem value="Blocked (Pending Platform Review)">Blocked (Pending Platform Review)</SelectItem>
                  <SelectItem value="Blocked (Unconfirmed Affiliation)">Blocked (Unconfirmed Affiliation)</SelectItem>
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
                  <TableHead className="text-xs font-bold w-[220px]">Doctor Details</TableHead>
                  <TableHead className="text-xs font-bold w-[180px]">Specialty &amp; Reg #</TableHead>
                  <TableHead className="text-xs font-bold w-[160px]">Step 1: Hospital Affiliation</TableHead>
                  <TableHead className="text-xs font-bold w-[180px]">Step 2: Platform Credentials</TableHead>
                  <TableHead className="text-xs font-bold w-[180px]">Public Search Status</TableHead>
                  <TableHead className="text-xs font-bold text-right w-[140px]">Admin Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAffiliations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                      No doctors match your active filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAffiliations.map((doc) => (
                    <TableRow key={doc.id} className="hover:bg-muted/30 transition-colors">
                      {/* Doctor Info */}
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8 border border-border">
                            <AvatarImage src={doc.avatarUrl} alt={doc.doctorName} />
                            <AvatarFallback className="text-[10px] bg-muted font-bold">
                              {doc.doctorName.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-bold text-xs text-foreground flex items-center gap-1">
                              <Link href={`/hospital-admin/doctors/${doc.doctorId}`} className="hover:underline text-foreground">
                                {doc.doctorName}
                              </Link>
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono">
                              {doc.doctorId} • {doc.affiliationType}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Specialty & Reg */}
                      <TableCell>
                        <div className="text-xs font-medium text-foreground">{doc.specialty}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{doc.registrationNo}</div>
                      </TableCell>

                      {/* Step 1: Hospital Affiliation (Admin) */}
                      <TableCell>
                        {doc.hospitalAffiliationConfirmed ? (
                          <div className="space-y-0.5">
                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] gap-1">
                              <CheckCircle2 className="h-2.5 w-2.5" /> Confirmed
                            </Badge>
                            <span className="text-[9px] text-muted-foreground block font-mono">
                              Hospital Verified
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <Badge variant="outline" className="text-rose-600 border-rose-500/30 bg-rose-500/5 text-[10px] gap-1">
                              <XCircle className="h-2.5 w-2.5" /> Unconfirmed
                            </Badge>
                            <span className="text-[9px] text-muted-foreground block">
                              Pending Admin Action
                            </span>
                          </div>
                        )}
                      </TableCell>

                      {/* Step 2: Platform Credentials (Platform Reviewer) */}
                      <TableCell>
                        {doc.platformCredentialsVerified ? (
                          <div className="space-y-0.5">
                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] gap-1">
                              <ShieldCheck className="h-2.5 w-2.5" /> Platform Verified
                            </Badge>
                            <span className="text-[9px] text-muted-foreground block truncate max-w-[170px]">
                              {doc.platformReviewerName || "Medical Council"}
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/5 text-[10px] gap-1">
                              <Clock className="h-2.5 w-2.5" /> Platform Pending
                            </Badge>
                            <span className="text-[9px] text-muted-foreground block">
                              Credentials in Audit Queue
                            </span>
                          </div>
                        )}
                      </TableCell>

                      {/* Public Search Status */}
                      <TableCell>
                        {doc.publicSearchStatus === "Live / Searchable" ? (
                          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] gap-1 font-semibold">
                            <Globe className="h-2.5 w-2.5" /> Live in Search
                          </Badge>
                        ) : doc.publicSearchStatus === "Blocked (Pending Platform Review)" ? (
                          <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/5 text-[9px] gap-1">
                            <Lock className="h-2.5 w-2.5" /> Blocked (Step 2 Req)
                          </Badge>
                        ) : doc.publicSearchStatus === "Suspended" ? (
                          <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[9px] gap-1">
                            <AlertOctagon className="h-2.5 w-2.5" /> Suspended
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground border-border text-[9px] gap-1">
                            <Lock className="h-2.5 w-2.5" /> Blocked (Step 1 Req)
                          </Badge>
                        )}
                      </TableCell>

                      {/* Admin Action: Toggle Affiliation */}
                      <TableCell className="text-right">
                        {doc.hospitalAffiliationConfirmed ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs text-rose-600 border-rose-500/30 hover:bg-rose-500/10 font-semibold"
                            onClick={() => handleToggleHospitalAffiliation(doc.id)}
                          >
                            Revoke Affiliation
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                            onClick={() => handleToggleHospitalAffiliation(doc.id)}
                          >
                            Confirm Affiliation
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
