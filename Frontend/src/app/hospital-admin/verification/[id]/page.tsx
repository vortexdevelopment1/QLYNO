"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Globe,
  Lock,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Upload,
  User,
  XCircle,
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
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { mockVerificationCases } from "@/hospital-admin/lib/mock-data/verification-cases";
import { VerificationCase, VerificationStatus, VerificationDocument } from "@/hospital-admin/lib/types";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Trust & Safety Verification workflow";

export default function VerificationCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  const [caseData, setCaseData] = useState<VerificationCase | null>(null);

  // Reviewer Decision Modal State
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [decisionType, setDecisionType] = useState<"Approve" | "Reject" | "Needs More Information" | "Suspend">("Approve");
  const [decisionReason, setDecisionReason] = useState("");
  const [reviewerNameInput, setReviewerNameInput] = useState("Dr. Meenakshi Joshi");

  // Partial Document Resubmission Modal State (Edge Case 2)
  const [resubmitModalOpen, setResubmitModalOpen] = useState(false);
  const [selectedDocToReplace, setSelectedDocToReplace] = useState<VerificationDocument | null>(null);
  const [newDocName, setNewDocName] = useState("");

  useEffect(() => {
    setMounted(true);
    const found = mockVerificationCases.find((c) => c.id === id) || mockVerificationCases[0];
    setCaseData(found);
  }, [id]);

  if (!mounted || !caseData) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Verification Case Review"
          description="Loading verification audit details, documents, and decision timeline..."
          crumbs={[{ label: "Administration" }, { label: "Verifications", href: "/hospital-admin/verification" }, { label: "Case Review" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading case...
        </div>
      </div>
    );
  }

  // Open Decision Dialog
  const handleOpenDecision = (type: "Approve" | "Reject" | "Needs More Information" | "Suspend") => {
    setDecisionType(type);
    if (type === "Approve") {
      setDecisionReason("All uploaded documentation, accreditation numbers, and physical facility evidence verified in full compliance.");
    } else if (type === "Needs More Information") {
      setDecisionReason("Uploaded document is blurry / missing page 2. Please upload a clear high-resolution scanned copy.");
    } else if (type === "Reject") {
      setDecisionReason("Submitted registration numbers do not match State Medical Council records. Application rejected.");
    } else if (type === "Suspend") {
      setDecisionReason("Immediate suspension triggered: License validity expired or compliance breach detected.");
    }
    setDecisionModalOpen(true);
  };

  // Submit Reviewer Decision
  const handleConfirmDecision = (e: React.FormEvent) => {
    e.preventDefault();
    let newStatus: VerificationStatus = "Verified";
    let isPublic = true;

    if (decisionType === "Approve") {
      newStatus = "Verified";
      isPublic = true;
    } else if (decisionType === "Needs More Information") {
      newStatus = "Needs More Information";
      isPublic = false;
    } else if (decisionType === "Reject") {
      newStatus = "Rejected";
      isPublic = false;
    } else if (decisionType === "Suspend") {
      newStatus = "Suspended";
      isPublic = false;
    }

    const newTimelineEvent = {
      id: `tl_${Date.now()}`,
      status: newStatus,
      actorName: reviewerNameInput,
      actorRole: "Platform Trust & Safety Auditor",
      timestamp: new Date().toISOString(),
      notes: decisionReason,
    };

    setCaseData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        status: newStatus,
        reviewerName: reviewerNameInput,
        reviewerRole: "Platform Trust Auditor",
        reviewerDecision: decisionType === "Approve" ? "Approved" : decisionType === "Reject" ? "Rejected" : "Needs More Information",
        decisionReason,
        publicSearchVisible: isPublic,
        updatedAt: new Date().toISOString(),
        timeline: [newTimelineEvent, ...prev.timeline],
      };
    });

    toast({
      title: `Verification Decision: ${newStatus}`,
      description: `Case ${caseData.caseNo} status updated to ${newStatus}. Public visibility: ${isPublic ? "Active" : "Revoked / Blocked"}. (${DELEGATION_STRING})`,
      variant: newStatus === "Verified" ? "default" : "destructive",
    });

    setDecisionModalOpen(false);
  };

  // Edge Case 2: Partial Resubmission for flagged document
  const handleOpenPartialResubmit = (doc: VerificationDocument) => {
    setSelectedDocToReplace(doc);
    setNewDocName(`${doc.name} (High-Res Scanned Version)`);
    setResubmitModalOpen(true);
  };

  const handleConfirmPartialResubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocToReplace) return;

    setCaseData((prev) => {
      if (!prev) return prev;
      const updatedDocs = prev.documents.map((d) =>
        d.id === selectedDocToReplace.id
          ? {
              ...d,
              name: newDocName,
              status: "Pending Review" as const,
              uploadedAt: new Date().toISOString(),
              fileSize: "4.8 MB",
              rejectionReason: undefined,
            }
          : d
      );

      const resubmitTimelineEvent = {
        id: `tl_${Date.now()}`,
        status: "Under Review" as const,
        actorName: "Hospital Admin",
        actorRole: "Hospital Admin",
        timestamp: new Date().toISOString(),
        notes: `Partial resubmission: Replaced flagged document '${selectedDocToReplace.name}' with new high-res scan.`,
      };

      return {
        ...prev,
        status: "Under Review" as const,
        documents: updatedDocs,
        timeline: [resubmitTimelineEvent, ...prev.timeline],
      };
    });

    toast({
      title: "Document Replaced & Case Resubmitted",
      description: `Replaced ${selectedDocToReplace.name}. Case updated to Under Review without restarting the entire submission (Edge Case 2). (${DELEGATION_STRING})`,
    });

    setResubmitModalOpen(false);
    setSelectedDocToReplace(null);
  };

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      {/* 1. Header & Back Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <Button variant="ghost" size="sm" asChild className="-ml-2 gap-1 text-muted-foreground hover:text-foreground">
          <Link href="/hospital-admin/verification">
            <ArrowLeft className="h-4 w-4" /> Back to Verification Cases
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          {caseData.status === "Verified" ? (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs text-rose-600 border-rose-500/30 hover:bg-rose-500/10"
              onClick={() => handleOpenDecision("Suspend")}
            >
              <Lock className="h-3.5 w-3.5" /> Suspend Verification (Compliance Breach)
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs text-amber-600 border-amber-500/30 hover:bg-amber-500/10"
                onClick={() => handleOpenDecision("Needs More Information")}
              >
                <AlertTriangle className="h-3.5 w-3.5" /> Request More Info
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => handleOpenDecision("Reject")}
              >
                <XCircle className="h-3.5 w-3.5" /> Reject Case
              </Button>
              <Button
                size="sm"
                className="gap-1.5 text-xs bg-emerald-600 text-white hover:bg-emerald-700 font-semibold"
                onClick={() => handleOpenDecision("Approve")}
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Approve &amp; Verify
              </Button>
            </>
          )}
        </div>
      </div>

      <PageHeader
        title={`Verification Case: ${caseData.caseNo}`}
        description={`Subject: ${caseData.subjectName} • Type: ${caseData.type} • Status: ${caseData.status}`}
        crumbs={[
          { label: "Administration" },
          { label: "Verifications", href: "/hospital-admin/verification" },
          { label: caseData.caseNo },
        ]}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Verification Audit Console" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Regulatory Protocol: Platform credentials verified independently from hospital affiliation</span>
        </div>
      </div>

      {/* Main Grid: Subject Details + Document Viewer on Left, Reviewer Decision + Timeline on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column (2 Cols): Subject Info & Documents */}
        <div className="lg:col-span-2 space-y-4">
          {/* Subject Metadata Card */}
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" /> Subject Information &amp; Legal Identity
                </CardTitle>
                <Badge
                  className={
                    caseData.status === "Verified"
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs"
                      : caseData.status === "Under Review"
                      ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 text-xs"
                      : caseData.status === "Needs More Information"
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-xs"
                      : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-xs"
                  }
                >
                  {caseData.status}
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Submitted on {new Date(caseData.submittedAt).toLocaleDateString()} • Last updated {new Date(caseData.updatedAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 text-xs space-y-3">
              <div className="p-3 rounded-lg border border-border bg-muted/20 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Subject Name:</span>
                  <span className="font-bold text-foreground text-sm">{caseData.subjectName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Subject ID &amp; Type:</span>
                  <span className="font-mono text-primary font-semibold">{caseData.subjectId} ({caseData.subjectType})</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Verification Type:</span>
                  <span className="font-medium text-foreground">{caseData.type}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Public Search Indexation:</span>
                  {caseData.publicSearchVisible ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <Globe className="h-3 w-3" /> Live &amp; Searchable
                    </span>
                  ) : (
                    <span className="text-muted-foreground font-semibold flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Blocked / Unverified
                    </span>
                  )}
                </div>

                {caseData.metadata.registrationNo && (
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Registration / License #:</span>
                    <span className="font-mono font-bold text-foreground">{caseData.metadata.registrationNo}</span>
                  </div>
                )}
                {caseData.metadata.registeredAddress && (
                  <div className="col-span-2">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Registered Address:</span>
                    <span className="text-foreground">{caseData.metadata.registeredAddress}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Document Viewer / List Card */}
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Uploaded Evidence &amp; Verification Documents ({caseData.documents.length})
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Official certificates, government registration proofs, and compliance deeds uploaded for audit.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
              <div className="space-y-2.5">
                {caseData.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`p-3 rounded-lg border text-xs space-y-2 transition-all ${
                      doc.status === "Flagged / Rejected"
                        ? "border-destructive/40 bg-destructive/5"
                        : doc.status === "Verified"
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="font-bold text-foreground flex items-center gap-2">
                          <FileCheck2 className="h-4 w-4 text-primary shrink-0" />
                          <span>{doc.name}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          Type: {doc.type} • Size: {doc.fileSize} • Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                          {doc.documentNumber && ` • Doc #: ${doc.documentNumber}`}
                        </div>
                      </div>

                      <Badge
                        className={
                          doc.status === "Verified"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                            : doc.status === "Flagged / Rejected"
                            ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px]"
                            : "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 text-[10px]"
                        }
                      >
                        {doc.status}
                      </Badge>
                    </div>

                    {/* Rejection / Flagged reason with Partial Resubmission Action (Edge Case 2) */}
                    {doc.rejectionReason && (
                      <div className="p-2.5 rounded border border-destructive/30 bg-destructive/10 text-destructive text-[11px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div>
                          <span className="font-bold block">Auditor Note / Defect:</span>
                          <span>{doc.rejectionReason}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 text-xs font-semibold shrink-0 gap-1"
                          onClick={() => handleOpenPartialResubmit(doc)}
                        >
                          <Upload className="h-3 w-3" /> Resubmit This Document
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 Col): Decision Panel & Audit Timeline */}
        <div className="space-y-4">
          {/* Reviewer Decision Card */}
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Reviewer Decision &amp; Audit Notes
              </CardTitle>
              <CardDescription className="text-xs">
                Platform Trust &amp; Safety adjudication details.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 text-xs space-y-3">
              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1.5">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Assigned Auditor:</span>
                  <span className="font-semibold text-foreground">{caseData.reviewerName || "Unassigned"}</span>
                  <span className="text-[10px] text-muted-foreground block">{caseData.reviewerRole || "Platform Trust Team"}</span>
                </div>
                {caseData.reviewerDecision && (
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Latest Decision:</span>
                    <Badge variant="outline" className="text-xs font-bold mt-0.5">
                      {caseData.reviewerDecision}
                    </Badge>
                  </div>
                )}
                {caseData.decisionReason && (
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Decision Rationale:</span>
                    <p className="text-xs text-foreground leading-relaxed italic mt-0.5">
                      &ldquo;{caseData.decisionReason}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status History Timeline Card */}
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Status History Timeline
              </CardTitle>
              <CardDescription className="text-xs">
                Immutable audit trail of state transitions.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 text-xs">
              <div className="relative pl-4 space-y-4 border-l-2 border-border/80">
                {caseData.timeline.map((evt, idx) => (
                  <div key={evt.id} className="relative">
                    <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background" />
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[9px] font-bold">
                          {evt.status}
                        </Badge>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {new Date(evt.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="font-semibold text-foreground text-xs">{evt.actorName} ({evt.actorRole})</div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{evt.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MODAL 1: REVIEWER DECISION DIALOG */}
      <Dialog open={decisionModalOpen} onOpenChange={setDecisionModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleConfirmDecision}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-primary" /> Reviewer Adjudication: {decisionType}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Record official Trust &amp; Safety decision for Case #{caseData.caseNo}.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-3 text-xs">
              <div className="grid gap-1">
                <Label htmlFor="rev-name">Auditor Name *</Label>
                <Input
                  id="rev-name"
                  required
                  value={reviewerNameInput}
                  onChange={(e) => setReviewerNameInput(e.target.value)}
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="rev-reason">Decision Reason / Required Action (Mandatory) *</Label>
                <Textarea
                  id="rev-reason"
                  required
                  rows={3}
                  placeholder="Provide explicit clinical/legal rationale..."
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                />
              </div>

              {decisionType === "Suspend" && (
                <div className="p-2.5 rounded border border-destructive/40 bg-destructive/10 text-destructive text-[11px] font-medium space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    <AlertOctagon className="h-3.5 w-3.5" /> Mandatory Immediate Compliance Enforcement
                  </span>
                  <p>Suspending this case will instantly downgrade and revoke its public verified badge in real time.</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setDecisionModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className={
                  decisionType === "Approve"
                    ? "bg-emerald-600 text-white hover:bg-emerald-700 font-semibold"
                    : "bg-destructive text-destructive-foreground font-semibold"
                }
              >
                Confirm {decisionType}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: PARTIAL DOCUMENT RESUBMISSION (EDGE CASE 2) */}
      <Dialog open={resubmitModalOpen} onOpenChange={setResubmitModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleConfirmPartialResubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" /> Partial Document Resubmission
              </DialogTitle>
              <DialogDescription className="text-xs">
                Per Edge Case 2, replace only the specific flagged document without restarting the entire application.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-3 text-xs">
              <div className="p-2.5 rounded border border-border bg-muted/20 space-y-1">
                <span className="text-[10px] text-muted-foreground block">Replacing Document:</span>
                <span className="font-bold text-foreground">{selectedDocToReplace?.name}</span>
                <span className="text-[10px] text-destructive block">Defect: {selectedDocToReplace?.rejectionReason}</span>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="resub-name">Updated Document Title / Scan Label *</Label>
                <Input
                  id="resub-name"
                  required
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                />
              </div>

              <div className="p-3 border-2 border-dashed border-primary/40 rounded-lg text-center bg-primary/5 space-y-1 cursor-pointer">
                <Upload className="h-6 w-6 text-primary mx-auto" />
                <span className="font-bold text-xs text-primary block">Click or Drag &amp; Drop High-Resolution PDF/Scan</span>
                <span className="text-[10px] text-muted-foreground">PDF, PNG, JPG up to 10 MB</span>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setResubmitModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold">
                Upload &amp; Resubmit Document
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
