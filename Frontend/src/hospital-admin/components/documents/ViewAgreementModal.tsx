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
  Briefcase,
  Building2,
  Calendar,
  DollarSign,
  Download,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Clock,
} from "lucide-react";
import { ContractItem } from "@/hospital-admin/lib/types/documents";
import jsPDF from "jspdf";

interface ViewAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: ContractItem | null;
}

export function ViewAgreementModal({
  isOpen,
  onClose,
  contract,
}: ViewAgreementModalProps) {
  if (!contract) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    // Top Header Banner
    doc.setFillColor(30, 27, 75); // indigo-950
    doc.rect(0, 0, pageWidth, 28, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("QLYNO TERTIARY CARE HOSPITAL & RESEARCH INSTITUTE", 14, 11);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(224, 231, 255);
    doc.text("Office of Procurement, Vendor Governance & Legal Contracts Management", 14, 17);
    doc.text("Plot 42, Health City Avenue, Mumbai • Direct Legal: +91 22 6123 4599", 14, 22);

    // Contract Title Banner
    doc.setFillColor(238, 242, 255); // indigo-50
    doc.rect(14, 34, pageWidth - 28, 16, "F");
    doc.setDrawColor(199, 210, 254); // indigo-200
    doc.rect(14, 34, pageWidth - 28, 16, "S");

    doc.setTextColor(30, 27, 75);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`EXECUTED CONTRACT: ${contract.contractCode}`, 18, 41);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(79, 70, 229);
    doc.text(`${contract.contractType} • Status: ${contract.renewalStatus}`, 18, 46);

    // Contracting Parties Section
    let yPos = 58;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text("CONTRACTING PARTIES & GOVERNANCE", 14, yPos);

    yPos += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text("1. First Party (Hospital): Qlyno Tertiary Care Hospital & Research Institute", 14, yPos);
    yPos += 5.5;
    doc.text(`2. Second Party (Vendor): ${contract.vendorName} (Vendor Ref: ${contract.vendorId})`, 14, yPos);

    // Financial & Tenure Section
    yPos += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text("FINANCIAL TERMS & TENURE SCHEDULE", 14, yPos);

    yPos += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`Contract Title: ${contract.title}`, 14, yPos);
    yPos += 5.5;
    doc.text(`Effective Period: ${contract.startDate} to ${contract.endDate}`, 14, yPos);
    yPos += 5.5;
    doc.text(`Total Annual Value: ${formatCurrency(contract.annualValue)}`, 14, yPos);
    yPos += 5.5;
    doc.text(`Payment Milestones: ${contract.paymentTerms}`, 14, yPos);
    yPos += 5.5;
    doc.text(`SLA & Guaranteed Uptime: ${contract.slaUptimeCommitment}`, 14, yPos);
    yPos += 5.5;
    if (contract.assetName) {
      doc.text(`Covered Asset / Equipment: ${contract.assetName} (${contract.assetId || "Hospital Asset"})`, 14, yPos);
      yPos += 5.5;
    }

    // Standard Legal Clauses
    yPos += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text("TERMS, COMPLIANCE STIPULATIONS & SLA CONDITIONS", 14, yPos);

    yPos += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);

    const clauses = [
      "1. Comprehensive Maintenance: Contractor provides 24/7 technical breakdown support and scheduled quarterly PPM.",
      "2. SLA & Penalty Deductions: Breakdown response within 4 hours; downtime exceeding limits attracts penalty debits.",
      "3. OEM Genuine Spares Guarantee: All replacement modules must be original manufacturer certified with warranty.",
      "4. Confidentiality: Non-disclosure of proprietary clinical operations data and NABH audit records.",
      "5. Disbursement Release: Payments released exclusively upon biomedical department technical verification.",
    ];

    clauses.forEach((cl) => {
      doc.text(cl, 14, yPos);
      yPos += 5;
    });

    // Signature Block
    yPos += 6;
    doc.setFillColor(248, 250, 252);
    doc.rect(14, yPos, pageWidth - 28, 24, "F");
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, yPos, pageWidth - 28, 24, "S");

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("FOR QLYNO TERTIARY HOSPITAL", 18, yPos + 6);
    doc.text(`FOR ${contract.vendorName.toUpperCase()}`, 110, yPos + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Authorized Signatory: Medical Superintendent", 18, yPos + 12);
    doc.text("Head of Procurement & Legal Affairs", 18, yPos + 17);

    doc.text("Authorized Signatory: Director of Enterprise Support", 110, yPos + 12);
    doc.text("Corporate Enterprise Contracts Division", 110, yPos + 17);

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Generated on ${new Date().toLocaleString()} • Qlyno Contracts Management • Agreement Ref: ${contract.contractCode}`,
      14,
      285
    );

    doc.save(`${contract.contractCode}_Agreement.pdf`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono text-[10px] font-bold">
              {contract.contractCode}
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              {contract.contractType}
            </Badge>
            <Badge
              className={`text-[10px] ${
                contract.renewalStatus === "Active"
                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-600 border border-rose-500/20 animate-pulse"
              }`}
            >
              {contract.renewalStatus}
            </Badge>
          </div>
          <DialogTitle className="text-base font-bold text-foreground mt-1">
            {contract.title}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Executed Service Agreement with {contract.vendorName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-xs">
          {/* Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-muted/40 border border-border/60">
            <div>
              <span className="text-[10px] text-muted-foreground block">Vendor Partner</span>
              <span className="font-semibold text-foreground">{contract.vendorName}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">Annual Value</span>
              <span className="font-mono font-bold text-emerald-600">
                {formatCurrency(contract.annualValue)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">Tenure Dates</span>
              <span className="font-mono font-semibold text-foreground">
                {contract.startDate} to {contract.endDate}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] text-muted-foreground block">Payment Milestones</span>
              <span className="text-foreground">{contract.paymentTerms}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">SLA Commitment</span>
              <span className="font-semibold text-foreground">{contract.slaUptimeCommitment}</span>
            </div>
          </div>

          {/* Linked Asset */}
          {contract.assetName && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg border border-primary/20 bg-primary/5">
              <Building2 className="h-4 w-4 text-primary" />
              <div>
                <span className="text-muted-foreground">Covered Equipment: </span>
                <strong className="text-foreground">{contract.assetName}</strong>
                {contract.assetId && (
                  <span className="text-[10px] font-mono text-muted-foreground ml-1">
                    ({contract.assetId})
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Contract Clauses & Legal Terms */}
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span>Standard Contractual Clauses & Compliance Terms</span>
            </h4>
            <div className="rounded-lg border border-border/80 bg-card p-3.5 space-y-2 text-foreground/90 leading-relaxed font-sans">
              <p>
                <strong>1. Scope of Maintenance & Service:</strong> The contractor agrees to provide comprehensive preventive and corrective maintenance including OEM replacement parts, quarterly calibration, and 24/7 emergency breakdown support.
              </p>
              <p>
                <strong>2. Service Level Agreement (SLA):</strong> The contractor guarantees a minimum operational uptime of <strong>{contract.slaUptimeCommitment}</strong>. Failure to attend breakdown tickets within 4 hours incurs penalty deductions from quarterly disbursements.
              </p>
              <p>
                <strong>3. Regulatory Compliance:</strong> Service execution must comply with Atomic Energy Regulatory Board (AERB) and NABH clinical safety mandates.
              </p>
              <p>
                <strong>4. Sign-off & Milestone Billing:</strong> Payments shall be released only upon submission of authorized service engineer visit sheets verified by the Biomedical Engineering Department.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1 bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 border-indigo-500/30"
            onClick={handleDownloadPDF}
          >
            <Download className="h-3.5 w-3.5" />
            Download Executed Agreement (PDF)
          </Button>
          <Button type="button" size="sm" onClick={onClose} className="h-8 text-xs">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
