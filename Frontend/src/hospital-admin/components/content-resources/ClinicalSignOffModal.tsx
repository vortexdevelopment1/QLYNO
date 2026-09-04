"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/hospital-admin/components/ui/dialog";
import { Button } from "@/hospital-admin/components/ui/button";
import { Label } from "@/hospital-admin/components/ui/label";
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import { Badge } from "@/hospital-admin/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/hospital-admin/components/ui/select";
import { Checkbox } from "@/hospital-admin/components/ui/checkbox";
import {
  ShieldCheck,
  Stethoscope,
  AlertTriangle,
  FileCheck2,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { ClinicalReviewRecord, ContentCategory } from "@/hospital-admin/lib/types";

interface ClinicalSignOffModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
  contentTitle: string;
  contentType: ContentCategory;
  onApprove: (review: ClinicalReviewRecord) => void;
  onReject: (review: ClinicalReviewRecord) => void;
}

const REVIEWER_DOCTORS = [
  { id: "doc-101", name: "Dr. Arvind Kumar", specialty: "Cardiology & Interventional Sciences" },
  { id: "doc-102", name: "Dr. Sunita Rao", specialty: "Cardiovascular & Thoracic Surgery" },
  { id: "doc-103", name: "Dr. Rajeshwar Singh", specialty: "Orthopaedics & Joint Replacement" },
  { id: "doc-105", name: "Dr. Meenakshi Sundaram", specialty: "Neurosurgery & Spine" },
  { id: "doc-106", name: "Dr. Priya Deshmukh", specialty: "Endocrinology & Diabetology" },
  { id: "doc-107", name: "Dr. Farooq Abdullah", specialty: "Anesthesiology & Critical Care" },
];

export function ClinicalSignOffModal({
  isOpen,
  onClose,
  contentId,
  contentTitle,
  contentType,
  onApprove,
  onReject,
}: ClinicalSignOffModalProps) {
  const [selectedDocId, setSelectedDocId] = useState(REVIEWER_DOCTORS[0].id);
  const [medicalAccuracy, setMedicalAccuracy] = useState(true);
  const [referenceCitations, setReferenceCitations] = useState(true);
  const [clearDisclaimer, setClearDisclaimer] = useState(true);
  const [noExaggeratedClaims, setNoExaggeratedClaims] = useState(true);
  const [reviewNotes, setReviewNotes] = useState("");

  const selectedDoc =
    REVIEWER_DOCTORS.find((d) => d.id === selectedDocId) || REVIEWER_DOCTORS[0];

  const allChecklistPassed =
    medicalAccuracy && referenceCitations && clearDisclaimer && noExaggeratedClaims;

  const handleApprove = () => {
    if (!allChecklistPassed) return;

    const review: ClinicalReviewRecord = {
      id: `rev-${Date.now()}`,
      contentId,
      contentType,
      reviewerDoctorId: selectedDoc.id,
      reviewerDoctorName: selectedDoc.name,
      reviewerSpecialty: selectedDoc.specialty,
      status: "Approved",
      nabhChecklist: {
        medicalAccuracy,
        referenceCitations,
        clearDisclaimer,
        noExaggeratedClaims,
      },
      reviewNotes: reviewNotes.trim() || "Clinically verified and approved for public portal and patient dispatch.",
      reviewedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    onApprove(review);
    onClose();
  };

  const handleReject = () => {
    const review: ClinicalReviewRecord = {
      id: `rev-${Date.now()}`,
      contentId,
      contentType,
      reviewerDoctorId: selectedDoc.id,
      reviewerDoctorName: selectedDoc.name,
      reviewerSpecialty: selectedDoc.specialty,
      status: "Rejected",
      nabhChecklist: {
        medicalAccuracy,
        referenceCitations,
        clearDisclaimer,
        noExaggeratedClaims,
      },
      reviewNotes: reviewNotes.trim() || "Requires revisions for clinical precision and citation verification.",
      reviewedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    onReject(review);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                NABH Clinical Review & Sign-Off Gate
              </DialogTitle>
              <DialogDescription className="text-xs">
                Mandatory governance step prior to public website publication or targeted patient dispatch.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Target Content Banner */}
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-[10px]">
                {contentType}
              </Badge>
              <span className="font-mono text-[10px] text-muted-foreground">
                ID: {contentId}
              </span>
            </div>
            <h4 className="mt-1 font-semibold text-foreground">{contentTitle}</h4>
          </div>

          {/* Reviewing Clinician */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Reviewing Consultant / Specialist</Label>
            <Select value={selectedDocId} onValueChange={setSelectedDocId}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Select consultant" />
              </SelectTrigger>
              <SelectContent>
                {REVIEWER_DOCTORS.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id} className="text-xs">
                    {doc.name} — {doc.specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* NABH Clinical Accuracy Checklist */}
          <div className="rounded-lg border border-border/80 bg-card p-3 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              NABH Clinical Accuracy Protocol Checklist
            </span>

            <div className="space-y-2">
              <div className="flex items-start gap-2.5">
                <Checkbox
                  id="chk-acc"
                  checked={medicalAccuracy}
                  onCheckedChange={(c) => setMedicalAccuracy(!!c)}
                />
                <label
                  htmlFor="chk-acc"
                  className="text-xs text-foreground leading-tight cursor-pointer"
                >
                  <span className="font-semibold">Medical & Pharmacological Accuracy:</span> Clinical guidance, dosages, and procedural preparations conform to verified hospital guidelines.
                </label>
              </div>

              <div className="flex items-start gap-2.5">
                <Checkbox
                  id="chk-ref"
                  checked={referenceCitations}
                  onCheckedChange={(c) => setReferenceCitations(!!c)}
                />
                <label
                  htmlFor="chk-ref"
                  className="text-xs text-foreground leading-tight cursor-pointer"
                >
                  <span className="font-semibold">Peer Literature & Reference Citations:</span> Medical assertions cite standard clinical literature or specialty board standards.
                </label>
              </div>

              <div className="flex items-start gap-2.5">
                <Checkbox
                  id="chk-disc"
                  checked={clearDisclaimer}
                  onCheckedChange={(c) => setClearDisclaimer(!!c)}
                />
                <label
                  htmlFor="chk-disc"
                  className="text-xs text-foreground leading-tight cursor-pointer"
                >
                  <span className="font-semibold">Patient Safety Disclaimer:</span> Clear notice stating content is educational and does not replace emergency clinical triage.
                </label>
              </div>

              <div className="flex items-start gap-2.5">
                <Checkbox
                  id="chk-exag"
                  checked={noExaggeratedClaims}
                  onCheckedChange={(c) => setNoExaggeratedClaims(!!c)}
                />
                <label
                  htmlFor="chk-exag"
                  className="text-xs text-foreground leading-tight cursor-pointer"
                >
                  <span className="font-semibold">Zero Commercial Bias:</span> No exaggerated therapeutic claims, unapproved remedies, or non-peer-reviewed treatments.
                </label>
              </div>
            </div>
          </div>

          {/* Clinician Review Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Clinician Notes / Addendum Directives</Label>
            <Textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Add formal sign-off comments, feedback for the author, or specific patient dispatch criteria..."
              rows={2}
              className="text-xs"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleReject}
            className="gap-1 text-xs"
          >
            <XCircle className="h-3.5 w-3.5" />
            Reject & Request Revision
          </Button>

          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              disabled={!allChecklistPassed}
              onClick={handleApprove}
              className="gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Sign-Off & Approve
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
