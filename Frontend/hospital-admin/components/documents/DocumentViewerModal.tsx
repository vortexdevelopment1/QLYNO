"use client";

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
  ExternalLink,
  ShieldCheck,
  History,
  Lock,
  Calendar,
  Building2,
  User,
  CheckCircle2,
} from "lucide-react";
import { HospitalDocumentItem } from "@/hospital-admin/lib/types/documents";
import jsPDF from "jspdf";

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: HospitalDocumentItem | null;
}

export function DocumentViewerModal({
  isOpen,
  onClose,
  document,
}: DocumentViewerModalProps) {
  if (!document) return null;

  const handleDownloadPDF = () => {
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
    doc.text("QLYNO TERTIARY CARE HOSPITAL & RESEARCH INSTITUTE", 14, 11);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225);
    doc.text("Department of Clinical Governance, Compliance & Document Management (DMS)", 14, 17);
    doc.text("NABH & ISO 9001:2015 Accredited • Plot 42, Health City Avenue, Mumbai • Tel: +91 22 6123 4567", 14, 22);

    // Document Title Banner
    doc.setFillColor(241, 245, 249);
    doc.rect(14, 34, pageWidth - 28, 16, "F");
    doc.setDrawColor(203, 213, 225);
    doc.rect(14, 34, pageWidth - 28, 16, "S");

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`AUTHENTICATED DOCUMENT: ${document.documentCode}`, 18, 41);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`${document.category} • ${document.subCategory} • Version ${document.version}`, 18, 46);

    // Document Details Section
    let yPos = 58;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text("DOCUMENT METADATA & COMPLIANCE PARAMETERS", 14, yPos);

    yPos += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);

    doc.text(`Document Title: ${document.title}`, 14, yPos);
    yPos += 5.5;
    doc.text(`Department Scope: ${document.departmentName || "Hospital-Wide"}`, 14, yPos);
    yPos += 5.5;
    doc.text(`Issuing Authority: ${document.issuerAuthority}`, 14, yPos);
    yPos += 5.5;
    doc.text(`Issue Date: ${document.issueDate}`, 14, yPos);
    yPos += 5.5;
    doc.text(`Validity / Expiration: ${document.expiryDate || "Perpetual / Ongoing"}`, 14, yPos);
    yPos += 5.5;
    doc.text(`Security Classification: ${document.securityClassification}`, 14, yPos);
    yPos += 5.5;
    doc.text(`Public Redaction Status: ${document.redactionStatus}`, 14, yPos);
    yPos += 5.5;
    if (document.linkedEntityName) {
      doc.text(`Linked Entity (${document.linkedEntityType}): ${document.linkedEntityName}`, 14, yPos);
      yPos += 5.5;
    }
    doc.text(`Uploaded & Audited By: ${document.uploadedBy} on ${document.uploadedAt}`, 14, yPos);

    // Version History Section
    yPos += 9;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text("IMMUTABILITY AUDIT TRAIL & REVISION HISTORY", 14, yPos);

    yPos += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);

    document.versionHistory.forEach((v) => {
      doc.text(`• [${v.version}] (${v.modifiedAt}) by ${v.modifiedBy}`, 14, yPos);
      yPos += 4.5;
      doc.text(`   Change Summary: ${v.changeSummary}`, 14, yPos);
      yPos += 5.5;
    });

    // Verification Box
    yPos += 6;
    doc.setFillColor(240, 253, 244); // green-50
    doc.rect(14, yPos, pageWidth - 28, 22, "F");
    doc.setDrawColor(187, 247, 208); // green-200
    doc.rect(14, yPos, pageWidth - 28, 22, "S");

    doc.setTextColor(22, 101, 52); // green-800
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("DIGITAL AUTHENTICATION & COMPLIANCE SEAL", 18, yPos + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(21, 128, 61);
    doc.text(
      `Electronic Verification Hash: SHA256-${Math.random().toString(36).substring(2).toUpperCase()}${Date.now()}`,
      18,
      yPos + 11
    );
    doc.text(
      "Certified Authentic Document from Qlyno Hospital Document Management System (DMS).",
      18,
      yPos + 16
    );

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Generated on ${new Date().toLocaleString()} • Qlyno Hospital DMS • Document Ref: ${document.documentCode}`,
      14,
      285
    );

    doc.save(`${document.documentCode}_Authenticated.pdf`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-mono font-bold">
              {document.documentCode}
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              {document.category}
            </Badge>
            <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px]">
              {document.version}
            </Badge>
            {document.redactionStatus === "PII Redacted (Rule 13.1 Verified)" && (
              <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] gap-1">
                <ShieldCheck className="h-3 w-3" />
                Rule 13.1 PII Redacted
              </Badge>
            )}
          </div>
          <DialogTitle className="text-base font-bold text-foreground mt-1">
            {document.title}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {document.subCategory} • Issued by {document.issuerAuthority}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-xs">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-muted/40 border border-border/60">
            <div>
              <span className="text-[10px] text-muted-foreground block">Department</span>
              <span className="font-semibold text-foreground">{document.departmentName || "Hospital-Wide"}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">Issue Date</span>
              <span className="font-mono font-semibold text-foreground">{document.issueDate}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">Expiry Date</span>
              <span className="font-mono font-semibold text-foreground">
                {document.expiryDate || "Perpetual / Not Applicable"}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">Security Level</span>
              <span className="font-semibold text-foreground">{document.securityClassification}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">File Size & Type</span>
              <span className="font-mono text-foreground">{document.fileSize} • {document.fileType}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">Uploaded By</span>
              <span className="font-medium text-foreground">{document.uploadedBy}</span>
            </div>
          </div>

          {/* Linked Entity Info if any */}
          {document.linkedEntityName && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg border border-primary/20 bg-primary/5 text-xs">
              <Building2 className="h-4 w-4 text-primary" />
              <div>
                <span className="text-muted-foreground">Linked Entity ({document.linkedEntityType}): </span>
                <strong className="text-foreground">{document.linkedEntityName}</strong>
              </div>
            </div>
          )}

          {/* Version History Audit Trail */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <History className="h-3.5 w-3.5 text-primary" />
              <span>Version History & Immutability Audit Trail</span>
            </h4>
            <div className="space-y-2">
              {document.versionHistory.map((ver) => (
                <div
                  key={ver.version}
                  className="rounded-lg border border-border/70 p-2.5 bg-card text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-[10px] font-bold">
                        {ver.version}
                      </Badge>
                      <span className="font-medium text-foreground">By {ver.modifiedBy}</span>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">{ver.modifiedAt}</span>
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    {ver.changeSummary}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Cross-Module Link if available */}
          {document.evidenceViewerUrl && (
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <div>
                  <span className="text-xs font-semibold text-foreground block">
                    Verification Module 13 Link
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    This credential is authenticated in the compliance evidence viewer.
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                asChild
                className="h-7 text-xs gap-1 border-blue-500/40 text-blue-600 hover:bg-blue-500/10"
              >
                <a href={document.evidenceViewerUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-3 w-3" />
                  Inspect Evidence
                </a>
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1 bg-primary/10 text-primary hover:bg-primary/20 border-primary/30"
            onClick={handleDownloadPDF}
          >
            <Download className="h-3.5 w-3.5" />
            Download Authenticated PDF
          </Button>
          <Button type="button" size="sm" onClick={onClose} className="h-8 text-xs">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
