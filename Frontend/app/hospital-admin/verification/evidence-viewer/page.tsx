"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  Globe,
  Lock,
  Printer,
  ShieldCheck,
  Stethoscope,
  Truck,
  HeartPulse,
  Activity,
  Droplet,
} from "lucide-react";
import jsPDF from "jspdf";

import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent } from "@/hospital-admin/components/ui/card";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { useToast } from "@/hospital-admin/hooks/use-toast";

function EvidenceViewerContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const docName = searchParams.get("doc") || "RTO Commercial Ambulance Permits.pdf";
  const capTitle = searchParams.get("cap") || "24/7 Advanced Cardiac Life Support (ALS) Ambulance Dispatch";
  const fileSize = searchParams.get("size") || "1.8 MB";

  const isAmbulance = docName.toLowerCase().includes("ambulance") || docName.toLowerCase().includes("rto");
  const isCalibration = docName.toLowerCase().includes("calibration") || docName.toLowerCase().includes("defibrillator");
  const isNABH = docName.toLowerCase().includes("nabh") || docName.toLowerCase().includes("emergency");
  const isICU = docName.toLowerCase().includes("icu") || docName.toLowerCase().includes("hepa");

  let authority = "National Accreditation Board for Hospitals & Healthcare Providers (NABH)";
  let certificateNo = "NABH-2026-EMERG-99482";
  let validThrough = "31-Dec-2027";
  let auditCycle = "Annual Cycle 2026-2027";
  let documentCategory = "Institutional Accreditation Certificate";

  if (isAmbulance) {
    authority = "Regional Transport Authority (RTO) - Commercial Ambulance & Emergency Fleet Division";
    certificateNo = "RTO-MH-ALS-882190-2026";
    validThrough = "15-Aug-2027";
    auditCycle = "Fleet Fitness Cycle 2026-2027";
    documentCategory = "Motor Vehicle & Emergency Transport Fitness";
  } else if (isCalibration) {
    authority = "Biomedical Equipment Quality Assurance & Device Calibration Laboratory";
    certificateNo = "CAL-DEFB-2026-00412";
    validThrough = "28-Feb-2027";
    auditCycle = "Quarterly PPM Calibration 2026";
    documentCategory = "Life Support Calibration Manifest";
  } else if (isICU) {
    authority = "Cleanroom Air Quality & HEPA Environmental Testing Board";
    certificateNo = "HEPA-ICU-8821-V9";
    validThrough = "30-Nov-2027";
    auditCycle = "Bio-Aerosol Cleanliness Audit 2026";
    documentCategory = "Environmental Safety & Filtration Clearance";
  }

  // Print Action
  const handlePrint = () => {
    window.print();
    toast({
      title: "Print Job Initialized",
      description: `Printing document: "${docName}".`,
    });
  };

  // Download PDF Action
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
    doc.setFillColor(241, 245, 249); // slate-100
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
    doc.text(`Artifact: ${docName}`, 18, 46);

    // Metadata Table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text("VERIFICATION PARAMETERS", 14, 56);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(`Issuing Authority: ${authority}`, 14, 62);
    doc.text(`Certificate / License Number: ${certificateNo}`, 14, 67);
    doc.text(`Accreditation Subject / Capability: ${capTitle}`, 14, 72);
    doc.text(`Audit Cycle: ${auditCycle} • Validity Period: Through ${validThrough}`, 14, 77);
    doc.text(`Verification Status: Authenticated & Legally Affirmed (Qlyno Trust & Safety)`, 14, 82);

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 88, pageWidth - 14, 88);

    // Body Text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text("LEGAL ACCREDITATION ATTESTATION & EVIDENCE SUMMARY", 14, 96);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const bodyText = `This document serves as statutory verification evidence deposited in the Qlyno Institutional Registry. The facility equipment, technical workforce, and operating procedures documented herein have been inspected and confirmed to operate in full adherence with governing healthcare standards.`;
    const splitBody = doc.splitTextToSize(bodyText, pageWidth - 28);
    doc.text(splitBody, 14, 102);

    // Signatures
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text("Dr. Anirudh Sen, MD", 14, 135);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text("Medical Director & Compliance Officer", 14, 139);
    doc.text("Qlyno Multispecialty Hospital", 14, 143);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text("Dr. Meenakshi Joshi", pageWidth - 70, 135);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text("Lead Medical Auditor", pageWidth - 70, 139);
    doc.text("Institutional Review Board", pageWidth - 70, 143);

    // Save File
    doc.save(`${docName.replace(/\.[^/.]+$/, "")}_Verified.pdf`);

    toast({
      title: "Document Downloaded",
      description: `Downloaded "${docName}" as a verified PDF artifact.`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Navigation & Action Controls (Strictly hidden during window.print) */}
      <div className="print:hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link href="/hospital-admin/verification/capabilities">
            <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Capabilities
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-primary" />
              Evidence Document Viewer
            </h1>
            <p className="text-xs text-muted-foreground">
              Official compliance artifact viewer &amp; statutory audit dossier
            </p>
          </div>
        </div>

        {/* Top-Right Action Buttons: PRINT & DOWNLOAD */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <ScopeIndicator scope="Hospital Admin" stationName="Compliance Dossier Vault" />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="h-9 gap-1.5 text-xs font-semibold hover:bg-muted/80 shadow-xs"
          >
            <Printer className="h-4 w-4 text-foreground" />
            Print Certificate
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleDownload}
            className="h-9 gap-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Main Certificate / Document Presentation */}
      <div className="max-w-4xl mx-auto print:max-w-full print:m-0 print:p-0">
        <Card
          id="printable-certificate"
          className="border-2 border-border/90 shadow-md bg-card overflow-hidden print:border-none print:shadow-none"
        >
          {/* Certificate Header Banner */}
          <div className="bg-slate-900 text-white p-6 sm:p-8 space-y-3 print:bg-slate-900 print:text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                  <Building2 className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-wide">QLYNO MULTISPECIALTY HOSPITAL</h2>
                  <p className="text-xs text-slate-300">
                    Regulatory Compliance &amp; Healthcare Quality Assurance Division
                  </p>
                </div>
              </div>

              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs px-3 py-1 gap-1.5 font-semibold">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Tamper-Proof Verified
              </Badge>
            </div>

            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
              <span>Campus: Andheri West, Mumbai, MH • Reg #: HOSP-MH-2026-8819</span>
              <span>Electronic Vault ID: EVT-9921-X80</span>
            </div>
          </div>

          {/* Certificate Body Content */}
          <CardContent className="p-6 sm:p-8 space-y-6 text-xs bg-card">
            {/* Title Block */}
            <div className="text-center space-y-1.5 border-b border-border pb-5">
              <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-widest text-primary border-primary/30 bg-primary/5 px-3 py-0.5">
                {documentCategory}
              </Badge>
              <h3 className="text-xl font-bold text-foreground pt-1">{docName}</h3>
              <p className="text-xs text-muted-foreground max-w-xl mx-auto">
                Submitted in support of <strong>{capTitle}</strong>
              </p>
            </div>

            {/* Verification Key Values */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-lg border border-border bg-muted/20 space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                  Issuing Authority
                </span>
                <span className="font-semibold text-foreground text-xs leading-snug block">
                  {authority}
                </span>
              </div>

              <div className="p-3.5 rounded-lg border border-border bg-muted/20 space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                  Certificate / License #
                </span>
                <span className="font-mono font-bold text-foreground text-xs block">
                  {certificateNo}
                </span>
              </div>

              <div className="p-3.5 rounded-lg border border-border bg-muted/20 space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                  Audit Cycle
                </span>
                <span className="font-semibold text-foreground text-xs block">{auditCycle}</span>
              </div>

              <div className="p-3.5 rounded-lg border border-border bg-muted/20 space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                  Valid Through
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs block">
                  {validThrough}
                </span>
              </div>
            </div>

            {/* Attestation & Specifications Details */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-3">
              <h4 className="font-bold text-xs text-foreground uppercase tracking-wide flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Statutory Compliance &amp; Operational Attestation
              </h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                This certifies that the ambulances, medical devices, emergency transport rosters, and trauma care facilities meet all statutory criteria set forth under National Accreditation standards and Regional Transport Authority regulations. All emergency vehicles possess active commercial permits, GPS telematics connectivity, and calibrated life support systems.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-border/60 text-[11px]">
                <div className="flex items-center gap-2 p-2 rounded bg-muted/30 border border-border">
                  <Truck className="h-4 w-4 text-primary shrink-0" />
                  <span>Fleet GPS Link: <strong>Active 24/7</strong></span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-muted/30 border border-border">
                  <HeartPulse className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>Defibrillator PPM: <strong>Calibrated</strong></span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-muted/30 border border-border">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Paramedic BLS/ACLS: <strong>Certified</strong></span>
                </div>
              </div>
            </div>

            {/* Cryptographic Ledger & Security Footer */}
            <div className="p-3.5 rounded-lg border border-border bg-muted/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] font-mono">
              <div className="space-y-0.5">
                <span className="text-muted-foreground block text-[10px]">CRYPTOGRAPHIC VERIFICATION HASH</span>
                <span className="text-foreground font-bold">SHA-256: 8f92a47e11c990b76e2842fa910e4b10</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 font-sans font-semibold">
                <CheckCircle2 className="h-4 w-4" /> Validated by Trust &amp; Safety Node #4
              </div>
            </div>

            {/* Signatures & Approvals */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground block">INTERNAL MEDICAL GOVERNANCE:</span>
                <span className="font-bold text-xs text-foreground block">Dr. Anirudh Sen, MD</span>
                <span className="text-[11px] text-muted-foreground block">
                  Medical Director &amp; Quality Head • Qlyno Hospital
                </span>
              </div>

              <div className="space-y-1 text-right">
                <span className="text-[10px] text-muted-foreground block">AUDITOR SIGN-OFF:</span>
                <span className="font-bold text-xs text-foreground block">Dr. Meenakshi Joshi</span>
                <span className="text-[11px] text-muted-foreground block">
                  Lead Assessor • Institutional Accreditation Council
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Embedded Print CSS to guarantee clean output without header/navbar/layout */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            background: white !important;
            color: black !important;
          }
          nav, header, aside, .print-hidden, [data-sidebar], header, footer {
            display: none !important;
          }
          #printable-certificate {
            border: 1px solid #cbd5e1 !important;
            box-shadow: none !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function EvidenceViewerPage() {
  return (
    <Suspense
      fallback={
        <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
          Loading evidence document viewer...
        </div>
      }
    >
      <EvidenceViewerContent />
    </Suspense>
  );
}
