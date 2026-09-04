"use client";

import React, { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Download,
  FileText,
  Globe,
  Printer,
  ShieldAlert,
  ShieldCheck,
  User,
} from "lucide-react";
import jsPDF from "jspdf";

import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { mockExternalLabReports } from "@/hospital-admin/lib/mock-data/lab-extended-operations";
import { ExternalLabReport } from "@/hospital-admin/lib/types";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Reference Lab Validation workflow";

export default function ExternalLabReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { toast } = useToast();

  const report: ExternalLabReport | undefined =
    mockExternalLabReports.find((r) => r.id === id) || {
      id,
      patientId: "P-7701",
      patientName: "Specialized Patient",
      uhid: "UHID-2026-9910",
      referenceLabName: "Metropolis Healthcare Central Reference Laboratory",
      testName: "Oncogenetics Comprehensive Reference Panel",
      sampleType: "Whole Blood EDTA",
      receivedAt: "2026-08-22T10:30:00Z",
      reportFileUrl: "/reports/external/METRO-REF-9910.pdf",
      verifyingPathologist: "Dr. Sunita Kulkarni (Senior Consultant Pathologist)",
      verificationStatus: "Verified",
      verificationNotes: "Verified findings consistent with reference laboratory baseline. Countersigned for hospital EMR chart.",
      verifiedAt: "2026-08-22T11:15:00Z",
    };

  const handlePrint = () => {
    window.print();
    toast({
      title: "Print Command Sent",
      description: `Sent external reference report for ${report.patientName} (${report.testName}) to printer. (${DELEGATION_STRING})`,
    });
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. Top Header Banner
    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(0, 0, pageWidth, 28, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("OUTSOURCED REFERENCE DIAGNOSTIC INVESTIGATION REPORT", 14, 11);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(203, 213, 225);
    doc.text(`Reference Laboratory: ${report.referenceLabName}`, 14, 17);
    doc.text("Qlyno Health Network • Outsourced Specialized Diagnostics Gateway • CAP & ISO 15189 Accredited", 14, 22);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(255, 255, 255);
    doc.text(report.id.toUpperCase(), pageWidth - 14, 12, { align: "right" });
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text(`Gate Status: ${report.verificationStatus.toUpperCase()}`, pageWidth - 14, 17, { align: "right" });
    doc.text(`Received: ${new Date(report.receivedAt).toLocaleDateString()}`, pageWidth - 14, 22, { align: "right" });

    let y = 34;

    // 2. Patient Demographics Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, y, pageWidth - 28, 24, 2, 2, "FD");

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text("Patient Full Name:", 18, y + 6);
    doc.setFont("helvetica", "bold");
    doc.text(report.patientName, 50, y + 6);

    doc.setFont("helvetica", "normal");
    doc.text("UHID / Registration:", 18, y + 12);
    doc.setFont("helvetica", "bold");
    doc.text(report.uhid, 50, y + 12);

    doc.setFont("helvetica", "normal");
    doc.text("Specimen Type:", 18, y + 18);
    doc.setFont("helvetica", "normal");
    doc.text(report.sampleType, 50, y + 18);

    doc.text("Partner Reference Lab:", 110, y + 6);
    doc.setFont("helvetica", "bold");
    doc.text(report.referenceLabName, 145, y + 6);

    doc.setFont("helvetica", "normal");
    doc.text("Received Date:", 110, y + 12);
    doc.text(new Date(report.receivedAt).toLocaleString(), 145, y + 12);

    doc.text("Verification Gate:", 110, y + 18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(report.verificationStatus === "Verified" ? 22 : 180, report.verificationStatus === "Verified" ? 101 : 83, report.verificationStatus === "Verified" ? 52 : 9);
    doc.text(report.verificationStatus, 145, y + 18);

    y += 30;

    // 3. Test Title Banner
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, y, pageWidth - 28, 8, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text(`SPECIALIZED INVESTIGATION: ${report.testName.toUpperCase()}`, 18, y + 5.5);

    y += 12;

    // 4. Clinical Findings / Interpretation Block
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, pageWidth - 28, 36, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text("REFERENCE LABORATORY DIAGNOSTIC SUMMARY:", 18, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`This specialized test (${report.testName}) was outsourced to ${report.referenceLabName} using certified Next-Gen Sequencing / Flow Cytometry / Real-Time PCR methodologies.`, 18, y + 12);
    doc.text("Quality assurance indices, genetic allele variants, and baseline reference controls were validated against international CAP/NABL thresholds.", 18, y + 18);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("PATHOLOGIST COUNTERSIGNATURE & AUDIT NOTES:", 18, y + 26);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    const splitNotes = doc.splitTextToSize(report.verificationNotes || "Awaiting Pathologist review.", pageWidth - 36);
    doc.text(splitNotes, 18, y + 31);

    y += 42;

    // 5. Verification & Countersignature Block
    doc.setDrawColor(203, 213, 225);
    doc.line(14, y, pageWidth - 14, y);

    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text("Hospital Pathology Quality Gate Certification", 14, y + 4);
    doc.text("Certified in compliance with Clinical Establishments Act and NABL standards.", 14, y + 8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(report.verifyingPathologist || "Pending Pathologist Sign-Off", pageWidth - 14, y + 4, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(report.verifiedAt ? `Verified: ${new Date(report.verifiedAt).toLocaleString()}` : "Awaiting Verification Gate", pageWidth - 14, y + 8, { align: "right" });

    // Save
    doc.save(`External_${report.patientName.replace(/\s+/g, "_")}_${report.testName.replace(/\s+/g, "_")}.pdf`);

    toast({
      title: "External Diagnostic Report PDF Downloaded",
      description: `Downloaded reference laboratory report for ${report.patientName} (${report.testName}). (${DELEGATION_STRING})`,
    });
  };

  return (
    <div className="space-y-4 print:space-y-0 print:m-0 print:p-0">
      {/* 1. Navigation & Action Bar - HIDDEN ON PRINT */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 print:hidden">
        <Button variant="ghost" size="sm" asChild className="-ml-2 gap-1 text-muted-foreground hover:text-foreground">
          <Link href="/hospital-admin/lab/external">
            <ArrowLeft className="h-4 w-4" /> Back to External Reports
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 shadow-sm">
            <Printer className="h-4 w-4" /> Print Report
          </Button>
          <Button size="sm" onClick={handleDownloadPDF} className="gap-1.5 shadow-sm bg-primary text-primary-foreground">
            <Download className="h-4 w-4" /> Download PDF Report
          </Button>
        </div>
      </div>

      {/* 2. PageHeader & Breadcrumbs - HIDDEN ON PRINT */}
      <div className="print:hidden">
        <PageHeader
          title={`Outsourced Report: ${report.testName}`}
          description={`Reference Laboratory Investigation from ${report.referenceLabName} • Patient: ${report.patientName} (${report.uhid})`}
          crumbs={[
            { label: "Clinical Operations" },
            { label: "Laboratory", href: "/hospital-admin/lab" },
            { label: "External Reports", href: "/hospital-admin/lab/external" },
            { label: report.id.toUpperCase() },
          ]}
        />
        <div className="mt-2">
          <ScopeIndicator scope="Hospital Admin" stationName="Outsourced Reference Laboratory Gateway" />
        </div>
      </div>

      {/* 3. A4 Clean Vector Document View */}
      <Card className="border border-border shadow-sm print:border-none print:shadow-none bg-card max-w-4xl mx-auto">
        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Top Banner */}
          <div className="border-b border-border pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <h2 className="text-base font-bold text-foreground tracking-tight uppercase">
                  {report.referenceLabName}
                </h2>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Outsourced Specialized Reference Diagnostics • CAP &amp; ISO 15189 Accredited Quality Core
              </p>
            </div>
            <div className="text-left sm:text-right">
              <Badge
                className={
                  report.verificationStatus === "Verified"
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs"
                    : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-xs"
                }
              >
                {report.verificationStatus}
              </Badge>
              <p className="text-[11px] text-muted-foreground font-mono mt-1">
                Received: {new Date(report.receivedAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Demographics Box */}
          <div className="p-4 rounded-lg border border-border bg-muted/20 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Patient Name:</span>
              <span className="font-bold text-sm text-foreground">{report.patientName}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">UHID / Registration:</span>
              <span className="font-mono font-semibold text-primary">{report.uhid}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Specimen Type:</span>
              <span className="font-medium text-foreground">{report.sampleType}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Partner Reference Lab:</span>
              <span className="font-medium text-foreground">{report.referenceLabName}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Report ID:</span>
              <span className="font-mono text-foreground">{report.id.toUpperCase()}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Verification Status:</span>
              <span className="font-semibold text-emerald-600">{report.verificationStatus}</span>
            </div>
          </div>

          {/* Test Investigation Section */}
          <div className="space-y-3">
            <div className="bg-muted/40 p-2.5 rounded-md border border-border flex items-center justify-between">
              <span className="text-xs font-bold text-foreground uppercase tracking-wide">
                Investigation: {report.testName}
              </span>
              <Badge variant="outline" className="text-[10px] font-mono">
                Advanced Molecular / Genetic Panel
              </Badge>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card space-y-3 text-xs">
              <div>
                <span className="text-[11px] text-muted-foreground font-bold uppercase block">Methodology &amp; Technology Scope:</span>
                <p className="text-xs text-foreground mt-1 leading-relaxed">
                  Conducted via automated Next-Generation Sequencing (NGS), high-sensitivity real-time PCR, and multi-laser flow cytometry at {report.referenceLabName}. Target gene exons and genomic allele variants were mapped against standard ClinVar / NCBI human reference assemblies.
                </p>
              </div>

              <div className="pt-3 border-t border-border">
                <span className="text-[11px] text-muted-foreground font-bold uppercase block">Pathologist Clinical Interpretation &amp; Countersignature:</span>
                <p className="text-xs text-foreground mt-1 leading-relaxed">
                  {report.verificationNotes || "Awaiting Pathologist review and countersignature."}
                </p>
              </div>
            </div>
          </div>

          {/* Signature & Quality Audit Footer */}
          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div>
              <p className="text-[11px] font-semibold text-foreground">Hospital Pathology Quality Gate Certification</p>
              <p className="text-[10px] text-muted-foreground">Certified in compliance with NABL / CAP Digital Pathology standards.</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="font-bold text-foreground flex items-center gap-1 sm:justify-end">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                {report.verifyingPathologist || "Dr. Sunita Kulkarni, MD (Senior Pathologist)"}
              </p>
              <p className="text-[10px] text-muted-foreground font-mono">
                {report.verifiedAt ? `Countersigned: ${new Date(report.verifiedAt).toLocaleString()}` : "Pending Verification Gate"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
