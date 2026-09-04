"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Ambulance,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Droplet,
  ExternalLink,
  FileCheck2,
  FileText,
  Globe,
  HeartPulse,
  Lock,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Upload,
  X,
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
import { VerificationNav } from "@/hospital-admin/components/verification/verification-nav";
import { DeleteEvidenceConfirmModal } from "@/hospital-admin/components/verification/DeleteEvidenceConfirmModal";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { mockCapabilityVerifications } from "@/hospital-admin/lib/mock-data/verification-cases";
import { CapabilityVerification } from "@/hospital-admin/lib/types";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Capability Verification workflow";

interface AttachedEvidenceFile {
  id: string;
  name: string;
  size: string;
  isNew?: boolean;
}

export default function CapabilitiesVerificationPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [capabilities, setCapabilities] = useState<CapabilityVerification[]>(mockCapabilityVerifications);

  // Submit Capability Evidence Modal State
  const [capModalOpen, setCapModalOpen] = useState(false);
  const [selectedCap, setSelectedCap] = useState<CapabilityVerification | null>(null);
  const [capTitle, setCapTitle] = useState("");
  const [capType, setCapType] = useState<any>("Ambulance Fleet");
  const [capDetails, setCapDetails] = useState("");
  const [capHours, setCapHours] = useState("24 Hours / 7 Days");
  const [attachedFiles, setAttachedFiles] = useState<AttachedEvidenceFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Document Delete Confirmation Modal State
  const [docToDelete, setDocToDelete] = useState<AttachedEvidenceFile | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenSubmit = (cap: CapabilityVerification) => {
    setSelectedCap(cap);
    setCapTitle(cap.title);
    setCapType(cap.capabilityType);
    setCapDetails(cap.serviceDetails);
    setCapHours(cap.operatingHours);

    // Populate existing docs
    const existingDocs: AttachedEvidenceFile[] = cap.evidenceDocs.map((doc, idx) => ({
      id: `existing-${idx}-${Date.now()}`,
      name: doc,
      size: "Verified PDF",
      isNew: false,
    }));
    setAttachedFiles(existingDocs);
    setCapModalOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: AttachedEvidenceFile[] = Array.from(files).map((f) => {
      const sizeMB = (f.size / (1024 * 1024)).toFixed(1);
      return {
        id: `file-${Date.now()}-${Math.random()}`,
        name: f.name,
        size: `${sizeMB} MB`,
        isNew: true,
      };
    });

    setAttachedFiles((prev) => [...prev, ...newFiles]);
    toast({
      title: "Files Attached",
      description: `Attached ${newFiles.length} compliance document(s). Click any file to open in a new tab.`,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const newFiles: AttachedEvidenceFile[] = Array.from(files).map((f) => {
      const sizeMB = (f.size / (1024 * 1024)).toFixed(1);
      return {
        id: `file-${Date.now()}-${Math.random()}`,
        name: f.name,
        size: `${sizeMB} MB`,
        isNew: true,
      };
    });

    setAttachedFiles((prev) => [...prev, ...newFiles]);
    toast({
      title: "Files Dropped & Attached",
      description: `Attached ${newFiles.length} compliance document(s).`,
    });
  };

  // Open file in dedicated full page in a new tab
  const handleOpenInNewPage = (fileName: string, fileSize?: string, contextTitle?: string) => {
    const params = new URLSearchParams({
      doc: fileName,
      cap: contextTitle || capTitle || "Ambulance & Emergency Service",
      size: fileSize || "1.8 MB",
    });
    window.open(`/verification/evidence-viewer?${params.toString()}`, "_blank");
  };

  const handlePromptDelete = (file: AttachedEvidenceFile) => {
    setDocToDelete(file);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!docToDelete) return;
    setAttachedFiles((prev) => prev.filter((f) => f.id !== docToDelete.id));
    toast({
      title: "Attachment Removed",
      description: `Removed "${docToDelete.name}" from submission manifest.`,
      variant: "destructive",
    });
    setDocToDelete(null);
  };

  const handleSaveCapability = (e: React.FormEvent) => {
    e.preventDefault();
    const docNames = attachedFiles.map((f) => f.name);

    setCapabilities((prev) =>
      prev.map((c) =>
        c.capabilityType === capType
          ? {
              ...c,
              title: capTitle,
              serviceDetails: capDetails,
              operatingHours: capHours,
              status: "Under Review",
              publicBadgeActive: false,
              evidenceDocs: docNames.length > 0 ? docNames : c.evidenceDocs,
            }
          : c
      )
    );

    toast({
      title: "Capability Evidence Updated",
      description: `Submitted evidence for ${capTitle} (${attachedFiles.length} file(s) attached). Case queued for platform transport/trauma inspection. (${DELEGATION_STRING})`,
    });

    setCapModalOpen(false);
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Ambulance &amp; Emergency Capability Verification"
          description="Verification of ambulance fleet, emergency operating hours, and trauma capabilities prior to public capability badge activation."
          crumbs={[{ label: "Administration" }, { label: "Verifications", href: "/hospital-admin/verification" }, { label: "Capabilities" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading capabilities...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Ambulance &amp; Emergency Capability Verification"
        description="Verification of ambulance fleet, emergency operating hours, and trauma capabilities prior to public capability badge activation."
        crumbs={[{ label: "Administration" }, { label: "Verifications", href: "/hospital-admin/verification" }, { label: "Capabilities" }]}
      />

      <VerificationNav />

      {/* Scope Indicator & Emergency Policy */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Emergency &amp; Fleet Capability Gate" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
          <span>Emergency Accreditation Policy: Ambulance &amp; trauma capabilities cannot be displayed publicly until verified</span>
        </div>
      </div>

      {/* Capabilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {capabilities.map((cap) => (
          <Card key={cap.id} className="border-border shadow-xs flex flex-col justify-between">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {cap.capabilityType === "Ambulance Fleet" && <Ambulance className="h-5 w-5" />}
                    {cap.capabilityType === "24/7 Emergency & Trauma" && <HeartPulse className="h-5 w-5 text-rose-600" />}
                    {cap.capabilityType === "ICU Critical Care" && <Activity className="h-5 w-5 text-cyan-600" />}
                    {cap.capabilityType === "Blood Bank Storage" && <Droplet className="h-5 w-5 text-rose-600" />}
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground">{cap.title}</CardTitle>
                    <CardDescription className="text-xs font-mono">{cap.capabilityType}</CardDescription>
                  </div>
                </div>

                <Badge
                  className={
                    cap.status === "Verified"
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                      : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                  }
                >
                  {cap.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-4 pt-2 text-xs space-y-3">
              <p className="text-muted-foreground leading-relaxed">{cap.serviceDetails}</p>

              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-sans">Operating Hours:</span>
                  <span className="font-bold text-foreground">{cap.operatingHours}</span>
                </div>
                {cap.fleetCount && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-sans">Verified Fleet Count:</span>
                    <span className="font-bold text-primary">{cap.fleetCount} ALS Ambulances</span>
                  </div>
                )}
                {cap.traumaLevel && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-sans">Trauma Accreditation:</span>
                    <span className="font-bold text-emerald-600">{cap.traumaLevel}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-sans">Public Badge Status:</span>
                  {cap.publicBadgeActive ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1 font-sans">
                      <Globe className="h-3 w-3" /> Live on Public Profile
                    </span>
                  ) : (
                    <span className="text-muted-foreground font-semibold flex items-center gap-1 font-sans">
                      <Lock className="h-3 w-3" /> Blocked from Public Display
                    </span>
                  )}
                </div>
              </div>

              {/* Verified Documents Previews */}
              {cap.evidenceDocs.length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">
                    Uploaded Compliance Documents (Click to open in new tab)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cap.evidenceDocs.map((doc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleOpenInNewPage(doc, "Verified PDF", cap.title)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted/40 hover:bg-muted/80 border border-border text-[11px] text-foreground transition-colors cursor-pointer group"
                      >
                        <FileText className="h-3 w-3 text-primary group-hover:scale-110 transition-transform" />
                        <span className="truncate max-w-[170px]">{doc}</span>
                        <ExternalLink className="h-2.5 w-2.5 text-muted-foreground opacity-60 group-hover:opacity-100 ml-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Compliance note */}
              <div className="text-[11px] text-muted-foreground italic border-l-2 border-primary/40 pl-2">
                &ldquo;{cap.complianceNotes}&rdquo;
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground font-mono">
                  {cap.evidenceDocs.length} Compliance Docs Attached
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs font-semibold text-primary hover:bg-primary/10"
                  onClick={() => handleOpenSubmit(cap)}
                >
                  <Upload className="h-3 w-3 mr-1" /> Update Evidence
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MODAL: UPDATE CAPABILITY EVIDENCE */}
      <Dialog open={capModalOpen} onOpenChange={setCapModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSaveCapability}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" /> Update Capability Evidence
              </DialogTitle>
              <DialogDescription className="text-xs">
                Submit updated certificates, calibration manifests, or operating hours configuration for {capTitle}.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-3 text-xs">
              <div className="grid gap-1">
                <Label htmlFor="cap-t" className="font-semibold text-xs">
                  Capability Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cap-t"
                  required
                  className="text-xs h-8"
                  value={capTitle}
                  onChange={(e) => setCapTitle(e.target.value)}
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="cap-h" className="font-semibold text-xs">
                  Verified Operating Hours <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cap-h"
                  required
                  className="text-xs h-8"
                  value={capHours}
                  onChange={(e) => setCapHours(e.target.value)}
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="cap-d" className="font-semibold text-xs">
                  Service Specifications &amp; Equipment Manifest <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="cap-d"
                  required
                  rows={3}
                  className="text-xs resize-none"
                  value={capDetails}
                  onChange={(e) => setCapDetails(e.target.value)}
                />
              </div>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                className="hidden"
                onChange={handleFileSelect}
                multiple
              />

              {/* Interactive File Dropzone */}
              <div className="space-y-2">
                <Label className="font-semibold text-xs">
                  Attach Verification Documents (PDF / Certs)
                </Label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`p-4 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-primary bg-primary/10 scale-[0.99]"
                      : "border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary"
                  }`}
                >
                  <Upload className="h-6 w-6 text-primary mx-auto mb-1 animate-bounce" />
                  <span className="font-bold text-xs text-primary block">
                    Click or Drag to Attach Calibration / Accreditation PDF
                  </span>
                  <span className="text-[11px] text-muted-foreground block mt-0.5">
                    Supports NABH accreditation, RTO commercial fitness, or medical device PPM certificates
                  </span>
                </div>
              </div>

              {/* Uploaded Documents List */}
              {attachedFiles.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                      Attached Evidence Files ({attachedFiles.length})
                    </span>
                    <span className="text-[10px] text-muted-foreground">Click any document to open in a new page</span>
                  </div>

                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {attachedFiles.map((file) => (
                      <div
                        key={file.id}
                        onClick={() => handleOpenInNewPage(file.name, file.size, capTitle)}
                        className="group flex items-center justify-between p-2.5 rounded-lg border border-border bg-card hover:bg-muted/50 hover:border-primary/40 text-xs transition-all cursor-pointer shadow-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-4 w-4 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                          <div className="min-w-0">
                            <span className="font-semibold text-foreground truncate max-w-[240px] block group-hover:text-primary transition-colors">
                              {file.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <ExternalLink className="h-2.5 w-2.5" /> Click to open document in new page
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge variant="outline" className="text-[9px] py-0 h-4 font-mono">
                            {file.size}
                          </Badge>
                          {file.isNew && (
                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[8px] py-0 h-4">
                              New
                            </Badge>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            title="Delete file"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ml-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePromptDelete(file);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setCapModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold">
                Submit Capability Audit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE ATTACHMENT CONFIRMATION MODAL */}
      <DeleteEvidenceConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setDocToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        fileName={docToDelete?.name || ""}
        fileSize={docToDelete?.size}
        capabilityTitle={capTitle}
      />
    </div>
  );
}
