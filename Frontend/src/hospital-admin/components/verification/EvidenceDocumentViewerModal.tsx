"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/hospital-admin/components/ui/dialog";
import { Button } from "@/hospital-admin/components/ui/button";
import { Badge } from "@/hospital-admin/components/ui/badge";
import {
  FileText,
  Download,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Calendar,
  Eye,
  Hash,
  ExternalLink,
  Printer,
} from "lucide-react";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import jsPDF from "jspdf";

interface EvidenceDocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileSize?: string;
  capabilityTitle?: string;
}

export function EvidenceDocumentViewerModal({
  isOpen,
  onClose,
  fileName,
  fileSize = "1.8 MB",
  capabilityTitle = "Ambulance & Emergency Service",
}: EvidenceDocumentViewerModalProps) {
  const { toast } = useToast();

  if (!fileName && !isOpen) return null;

  const isAmbulance = fileName.toLowerCase().includes("ambulance") || fileName.toLowerCase().includes("rto");
  const isCalibration = fileName.toLowerCase().includes("calibration") || fileName.toLowerCase().includes("defibrillator");
  const isNABH = fileName.toLowerCase().includes("nabh") || fileName.toLowerCase().includes("emergency");
  const isICU = fileName.toLowerCase().includes("icu") || fileName.toLowerCase().includes("hepa");

  let authority = "National Accreditation Board for Hospitals & Healthcare Providers (NABH)";
  let certificateNo = "CERT-2026-MED-99482";
  let validUntil = "31-Dec-2027";

  if (isAmbulance) {
    authority = "Regional Transport Authority (RTO) - Commercial Ambulance Division";
    certificateNo = "RTO-MH-ALS-882190";
    validUntil = "15-Aug-2027";
  } else if (isCalibration) {
    authority = "Biomedical Equipment Standards & Calibration Laboratory";
    certificateNo = "CAL-DEFB-2026-00412";
    validUntil = "28-Feb-2027";
  } else if (isICU) {
    authority = "Cleanroom Air Quality & HEPA Filtration Certification Bureau";
    certificateNo = "HEPA-ICU-8821-V9";
    validUntil = "30-Nov-2027";
  }

  const handleOpenInNewPage = () => {
    const params = new URLSearchParams({
      doc: fileName,
      cap: capabilityTitle,
      size: fileSize,
    });
    window.open(`/verification/evidence-viewer?${params.toString()}`, "_blank");
  };

  const handlePrint = () => {
    window.print();
    toast({
      title: "Print Job Started",
      description: `Sending "${fileName}" to printer.`,
    });
  };

  const handleDownload = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    // Top Header Banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 28, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("QLYNO MULTISPECIALTY HOSPITAL", 14, 11);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(203, 213, 225);
    doc.text("Regulatory Compliance, Quality Assurance & Statutory Accreditation Archive", 14, 17);
    doc.text("Plot 42, Health City Avenue, Andheri West, Mumbai, Maharashtra 400053 • Direct: +91 22 6123 4567", 14, 22);

    // Document Title Banner
    doc.setFillColor(241, 245, 249);
    doc.rect(14, 34, pageWidth - 28, 14, "F");
    doc.setDrawColor(203, 213, 225);
    doc.rect(14, 34, pageWidth - 28, 14, "S");

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("OFFICIAL COMPLIANCE EVIDENCE & AUDIT CERTIFICATE", 18, 42);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Artifact: ${fileName}`, 18, 46);

    // Metadata
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text("VERIFICATION PARAMETERS", 14, 56);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(`Issuing Authority: ${authority}`, 14, 62);
    doc.text(`Certificate / License Number: ${certificateNo}`, 14, 67);
    doc.text(`Accreditation Subject / Capability: ${capabilityTitle}`, 14, 72);
    doc.text(`Validity Period: Through ${validUntil}`, 14, 77);

    // Save
    doc.save(`${fileName.replace(/\.[^/.]+$/, "")}_Verified.pdf`);

    toast({
      title: "Document Downloaded",
      description: `Downloaded "${fileName}" (${fileSize}).`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <FileText className="h-5 w-5" />
              <DialogTitle className="text-base font-bold text-foreground">
                Document Preview &amp; Verification Manifest
              </DialogTitle>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1 font-semibold"
                onClick={handleOpenInNewPage}
              >
                <ExternalLink className="h-3 w-3" /> Open in New Page
              </Button>
              <Badge variant="outline" className="text-[10px] font-mono">
                {fileSize}
              </Badge>
            </div>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Inspecting certified compliance artifact submitted for {capabilityTitle}.
          </DialogDescription>
        </DialogHeader>

        {/* Document Metadata Header */}
        <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground truncate max-w-[340px]">
              {fileName}
            </span>
            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[9px] gap-1">
              <CheckCircle2 className="h-2.5 w-2.5" /> Authenticated Artifact
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-1 border-t border-border/50">
            <div>
              Issuing Authority: <span className="font-medium text-foreground block truncate">{authority}</span>
            </div>
            <div>
              Certificate / Reg #: <span className="font-mono font-medium text-foreground block">{certificateNo}</span>
            </div>
          </div>
        </div>

        {/* High-Fidelity Certificate / Document Preview Simulation */}
        <div className="p-6 rounded-xl border-2 border-border/80 bg-background shadow-inner space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-foreground block text-xs">Qlyno Multispecialty Hospital</span>
                <span className="text-[10px] text-muted-foreground">Clinical Governance &amp; Regulatory Division</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-mono text-muted-foreground block">SECURE ELECTRONIC RECORD</span>
              <span className="text-[9px] font-mono text-emerald-600 font-semibold flex items-center gap-1 justify-end">
                <ShieldCheck className="h-3 w-3" /> VERIFIED TAMPER-PROOF
              </span>
            </div>
          </div>

          <div className="space-y-2 py-2 text-center">
            <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20 uppercase tracking-widest px-2 py-0.5">
              Official Compliance Certificate
            </Badge>
            <h3 className="font-bold text-sm text-foreground">
              {fileName.replace(".pdf", "").replace(".docx", "")}
            </h3>
            <p className="text-[11px] text-muted-foreground max-w-md mx-auto leading-relaxed">
              This document certifies that the equipment, fleet vehicles, and clinical operating standards meet all statutory accreditation criteria prescribed by {authority}.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-muted/20 border border-border text-[10px] font-mono">
            <div>
              <span className="text-muted-foreground block">AUDIT CYCLE:</span>
              <span className="font-bold text-foreground">2026-2027</span>
            </div>
            <div>
              <span className="text-muted-foreground block">VALID THROUGH:</span>
              <span className="font-bold text-emerald-600">{validUntil}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">DIGITAL HASH:</span>
              <span className="font-bold text-foreground">SHA-256: 8f92a...e4b1</span>
            </div>
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Verified Officer: <strong>Dr. Anirudh Sen (Medical Director)</strong></span>
            <span>Recorded in Institutional Ledger</span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border flex justify-between items-center w-full">
          <Button type="button" variant="outline" size="sm" onClick={handleOpenInNewPage} className="gap-1.5 text-xs">
            <ExternalLink className="h-3.5 w-3.5" /> Open Full Page
          </Button>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
              <Printer className="h-3.5 w-3.5" /> Print
            </Button>
            <Button type="button" size="sm" className="gap-1.5 text-xs" onClick={handleDownload}>
              <Download className="h-3.5 w-3.5" /> Download PDF
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
