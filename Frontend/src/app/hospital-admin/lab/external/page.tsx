"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertOctagon,
  Building2,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  Globe,
  Plus,
  Printer,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Upload,
  User,
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
import { LabNav } from "@/hospital-admin/components/lab/lab-nav";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { mockExternalLabReports } from "@/hospital-admin/lib/mock-data/lab-extended-operations";
import { ExternalLabReport } from "@/hospital-admin/lib/types";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Reference Lab Intake workflow";

export default function ExternalLabReportsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [reports, setReports] = useState<ExternalLabReport[]>(mockExternalLabReports);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Verification Modal State (Rule F13-CANNOT-2)
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ExternalLabReport | null>(null);
  const [pathologistName, setPathologistName] = useState("Dr. Sunita Kulkarni (Senior Consultant Pathologist)");
  const [verificationNotes, setVerificationNotes] = useState("Verified findings with external reference laboratory methodology. Countersigned for hospital EMR chart.");

  // Upload Intake Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [uhid, setUhid] = useState("");
  const [referenceLab, setReferenceLab] = useState("Metropolis Healthcare Central Reference Lab");
  const [testName, setTestName] = useState("Onco-Genetics Comprehensive Panel");
  const [sampleType, setSampleType] = useState("Whole Blood EDTA");

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesSearch =
        r.patientName.toLowerCase().includes(search.toLowerCase()) ||
        r.uhid.toLowerCase().includes(search.toLowerCase()) ||
        r.referenceLabName.toLowerCase().includes(search.toLowerCase()) ||
        r.testName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || r.verificationStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [reports, search, statusFilter]);

  const handleOpenVerify = (report: ExternalLabReport) => {
    setSelectedReport(report);
    setVerifyModalOpen(true);
  };

  const handleConfirmVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    // Rule F13-CANNOT-2: Pathologist verification gate
    const timestamp = new Date().toISOString();

    setReports((prev) =>
      prev.map((r) =>
        r.id === selectedReport.id
          ? {
              ...r,
              verificationStatus: "Verified",
              verifyingPathologist: pathologistName,
              verificationNotes,
              verifiedAt: timestamp,
            }
          : r
      )
    );

    toast({
      title: "External Report Verified & Published to Chart",
      description: `${selectedReport.testName} (${selectedReport.referenceLabName}) verified by ${pathologistName}. Now active in patient record. (${DELEGATION_STRING})`,
    });
    setVerifyModalOpen(false);
    setSelectedReport(null);
  };

  const handleSaveUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const newReport: ExternalLabReport = {
      id: `ext_${Date.now()}`,
      patientId: `P-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName,
      uhid: uhid || `UHID-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      referenceLabName: referenceLab,
      testName,
      sampleType,
      receivedAt: new Date().toISOString(),
      reportFileUrl: `/reports/external/EXT-${Date.now().toString().slice(-4)}.pdf`,
      verificationStatus: "Pending Verification",
      verificationNotes: "Awaiting Pathologist review & countersignature.",
    };

    setReports((prev) => [newReport, ...prev]);
    toast({
      title: "External Report Uploaded (Pending Verification)",
      description: `${newReport.testName} uploaded from ${newReport.referenceLabName}. Queued for Pathologist countersignature. (${DELEGATION_STRING})`,
    });
    setUploadModalOpen(false);
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="External &amp; Reference Lab Reports"
          description="Intake for outsourced diagnostic investigations, reference laboratory verification gates, and countersignatures."
          crumbs={[{ label: "Clinical Operations" }, { label: "Laboratory" }, { label: "External Reports" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading reference lab reports...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="External &amp; Reference Lab Reports"
        description="Intake for outsourced diagnostic investigations, reference laboratory verification gates, and countersignatures."
        crumbs={[{ label: "Clinical Operations" }, { label: "Laboratory" }, { label: "External Reports" }]}
        actions={
          <Button size="sm" className="gap-1.5 font-semibold text-xs" onClick={() => setUploadModalOpen(true)}>
            <Upload className="h-4 w-4" /> Upload Reference Lab Report
          </Button>
        }
      />

      <LabNav />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Outsourced Reference Diagnostic Desk" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
          <span>Click any row to open the complete reference report page with functional Print &amp; Download PDF</span>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Total Outsourced Reports</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{reports.length} Studies</p>
          <span className="text-[10px] text-muted-foreground">Specialized genetic/flow panels</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Pending Verification</span>
          <p className="text-xl font-bold font-mono text-amber-600 mt-0.5">
            {reports.filter((r) => r.verificationStatus === "Pending Verification").length} Awaiting
          </p>
          <span className="text-[10px] text-amber-600 font-medium">Blocked from official chart</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Verified &amp; Published</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
            {reports.filter((r) => r.verificationStatus === "Verified").length} Verified
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Countersigned in EMR</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-bold">Partner Reference Labs</span>
          <p className="text-xl font-bold font-mono text-cyan-600 mt-0.5">3 Labs</p>
          <span className="text-[10px] text-cyan-600 font-medium">Metropolis, Lal, Oncquest</span>
        </Card>
      </div>

      {/* External Reports Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Outsourced Reference Diagnostics Register</CardTitle>
          <CardDescription className="text-xs">
            Click on any row or click "View Report" to open the dedicated report page with full Print and Download PDF controls.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patient, reference lab, test..."
                className="pl-8 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] text-xs h-9">
                  <SelectValue placeholder="Verification Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending Verification">Pending Verification</SelectItem>
                  <SelectItem value="Verified">Verified &amp; Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Patient Details</TableHead>
                  <TableHead className="text-xs font-bold">Specialized Test Name</TableHead>
                  <TableHead className="text-xs font-bold">External Reference Laboratory</TableHead>
                  <TableHead className="text-xs font-bold">Received Date</TableHead>
                  <TableHead className="text-xs font-bold">Verification Gate Status</TableHead>
                  <TableHead className="text-xs font-bold">Pathologist Sign-Off</TableHead>
                  <TableHead className="text-xs font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow
                    key={report.id}
                    className="hover:bg-muted/40 transition-colors cursor-pointer"
                    onClick={() => router.push(`/hospital-admin/lab/external/${report.id}`)}
                  >
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground">{report.patientName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{report.uhid}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-medium text-foreground">{report.testName}</div>
                      <div className="text-[10px] text-muted-foreground">{report.sampleType}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-medium text-foreground flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate max-w-[200px]">{report.referenceLabName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {new Date(report.receivedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          report.verificationStatus === "Verified"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                        }
                      >
                        {report.verificationStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {report.verifyingPathologist ? (
                        <span className="text-foreground font-medium">{report.verifyingPathologist.split(" ")[0]} {report.verifyingPathologist.split(" ")[1]}</span>
                      ) : (
                        <span className="text-amber-600 italic">Awaiting Sign-Off</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="h-7 text-xs font-semibold text-primary border-primary/30 hover:bg-primary hover:text-primary-foreground"
                      >
                        <Link href={`/hospital-admin/lab/external/${report.id}`}>
                          <Eye className="h-3.5 w-3.5 mr-1" /> View Report
                        </Link>
                      </Button>
                      {report.verificationStatus === "Pending Verification" && (
                        <Button
                          size="sm"
                          className="h-7 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => handleOpenVerify(report)}
                        >
                          <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Verify
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

      {/* Verify & Countersign Modal */}
      <Dialog open={verifyModalOpen} onOpenChange={setVerifyModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleConfirmVerification}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-emerald-600">
                <ShieldCheck className="h-5 w-5 text-emerald-600" /> Verify External Reference Lab Report
              </DialogTitle>
              <DialogDescription className="text-xs">
                Countersign and officially publish {selectedReport?.testName} from {selectedReport?.referenceLabName}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-3 text-xs">
              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Patient:</span>
                  <span className="font-semibold text-foreground">{selectedReport?.patientName} ({selectedReport?.uhid})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Reference Lab:</span>
                  <span className="font-medium text-foreground">{selectedReport?.referenceLabName}</span>
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="v-path">Verifying Hospital Pathologist *</Label>
                <Select value={pathologistName} onValueChange={setPathologistName}>
                  <SelectTrigger id="v-path" className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr. Sunita Kulkarni (Senior Consultant Pathologist)">Dr. Sunita Kulkarni (Senior Consultant Pathologist)</SelectItem>
                    <SelectItem value="Dr. Arvind Rao (Consultant Biochemist)">Dr. Arvind Rao (Consultant Biochemist)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="v-notes">Pathologist Countersignature &amp; Clinical Audit Notes *</Label>
                <Input
                  id="v-notes"
                  required
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                />
              </div>

              <div className="p-2.5 rounded-md border border-emerald-500/30 bg-emerald-500/5 text-emerald-800 dark:text-emerald-200 text-[11px]">
                Upon countersignature, this external report will be permanently unlocked and integrated into the patient's official EMR chart.
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setVerifyModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Certify &amp; Publish to Chart
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upload External Report Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSaveUpload}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" /> Intake External Reference Lab Report
              </DialogTitle>
              <DialogDescription className="text-xs">
                Upload a report file from an outsourced laboratory for pathologist validation.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-3 text-xs">
              <div className="grid gap-1">
                <Label htmlFor="u-pat">Patient Full Name *</Label>
                <Input
                  id="u-pat"
                  required
                  placeholder="e.g. Vikram Singhania"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="u-uhid">UHID</Label>
                  <Input
                    id="u-uhid"
                    placeholder="e.g. UHID-2026-8812"
                    value={uhid}
                    onChange={(e) => setUhid(e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="u-lab">Reference Laboratory</Label>
                  <Select value={referenceLab} onValueChange={setReferenceLab}>
                    <SelectTrigger id="u-lab" className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Metropolis Healthcare Central Reference Lab">Metropolis Healthcare</SelectItem>
                      <SelectItem value="Dr. Lal PathLabs Central Reference Lab">Dr. Lal PathLabs</SelectItem>
                      <SelectItem value="Oncquest Laboratories Reference Core">Oncquest Laboratories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="u-test">Test Name *</Label>
                  <Input
                    id="u-test"
                    required
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="u-samp">Specimen Type</Label>
                  <Input
                    id="u-samp"
                    required
                    value={sampleType}
                    onChange={(e) => setSampleType(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-3 border border-dashed rounded-lg text-center bg-muted/20">
                <FileText className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                <span className="text-xs font-medium text-foreground">Attach Reference Lab PDF Document</span>
                <p className="text-[10px] text-muted-foreground">PDF, Scanned Image up to 10MB</p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setUploadModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Queue for Verification
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
