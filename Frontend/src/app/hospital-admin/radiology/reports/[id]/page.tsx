"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertOctagon,
  ArrowLeft,
  Camera,
  CheckCircle2,
  Download,
  Eye,
  FileText,
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
import { mockExtendedRadiologyOrders } from "@/hospital-admin/lib/mock-data/radiology-extended-operations";
import { RadiologyOrder } from "@/hospital-admin/lib/types";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Radiology Records Archival workflow";

export default function RadiologyReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const report: RadiologyOrder =
    mockExtendedRadiologyOrders.find((o) => o.id === id) || {
      id,
      orderNo: "RAD-2026-8801",
      patientId: "P-1001",
      patientName: "Ramesh Sharma",
      uhid: "UHID-2026-1001",
      age: 54,
      gender: "Male",
      modality: "CT Scan",
      bodyPart: "High-Resolution Chest (HRCT)",
      orderingDoctor: "Dr. Arvind Swaminathan",
      source: "IPD",
      scheduledAt: "2026-08-24T11:00:00Z",
      status: "Report Ready",
      priority: "Urgent",
      roomName: "128-Slice Multi-Detector CT Suite",
      radiologistName: "Dr. Vikram Seth, MD (Radiology)",
      technologistName: "Pooja Verma (Senior Radiographer)",
      dicomViewerUrl: `/radiology/viewer/${id}`,
      authorizedAt: "2026-08-24T11:30:00Z",
    };

  const handlePrint = () => {
    window.print();
    toast({
      title: "Print Command Sent",
      description: `Sent radiology report for ${report.patientName} (${report.orderNo}) to printer. (${DELEGATION_STRING})`,
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
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 28, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("QLYNO CENTRAL RADIOLOGY & IMAGING SERVICES", 14, 11);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(203, 213, 225);
    doc.text("AERB & NABH Certified Diagnostic Imaging Center • Advanced PACS/RIS Network", 14, 17);
    doc.text("Main Campus: Andheri West, Mumbai, Maharashtra 400053 • Direct RIS: +91 98200 44553", 14, 22);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(255, 255, 255);
    doc.text(report.orderNo, pageWidth - 14, 12, { align: "right" });
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text(`Status: REPORT READY`, pageWidth - 14, 17, { align: "right" });
    doc.text(new Date(report.scheduledAt).toLocaleDateString(), pageWidth - 14, 22, { align: "right" });

    let y = 34;

    // 2. Patient Demographics Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, y, pageWidth - 28, 24, 2, 2, "FD");

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text("Patient Name:", 18, y + 5.5);
    doc.setFont("helvetica", "bold");
    doc.text(report.patientName, 42, y + 5.5);

    doc.setFont("helvetica", "normal");
    doc.text("UHID / ID:", 18, y + 11.5);
    doc.setFont("helvetica", "bold");
    doc.text(report.uhid || "UHID-2026-8812", 42, y + 11.5);

    doc.setFont("helvetica", "normal");
    doc.text("Age / Gender:", 18, y + 17.5);
    doc.setFont("helvetica", "normal");
    doc.text(`${report.age || 48} Yrs / ${report.gender || "Male"}`, 42, y + 17.5);

    doc.text("Ordering Doctor:", 110, y + 5.5);
    doc.setFont("helvetica", "bold");
    doc.text(report.orderingDoctor, 140, y + 5.5);

    doc.setFont("helvetica", "normal");
    doc.text("Modality & Suite:", 110, y + 11.5);
    doc.setFont("helvetica", "bold");
    doc.text(`${report.modality} (${report.roomName.split(" ")[0]} Suite)`, 140, y + 11.5);

    doc.setFont("helvetica", "normal");
    doc.text("Patient Location:", 110, y + 17.5);
    doc.setFont("helvetica", "normal");
    doc.text(report.patientLocation || "IPD Ward", 140, y + 17.5);

    y += 29;

    // 3. Study Title Banner
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, y, pageWidth - 28, 8, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text(`EXAMINATION: ${report.modality.toUpperCase()} — ${report.bodyPart.toUpperCase()}`, 18, y + 5.5);

    y += 13;

    // 4. Clinical Findings Block
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, pageWidth - 28, 36, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text("RADIOLOGICAL FINDINGS & OBSERVATIONS:", 18, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    const splitFindings = doc.splitTextToSize(
      report.reportNotes || "Examination performed on calibrated multi-slice system. No focal lesion identified.",
      pageWidth - 36
    );
    doc.text(splitFindings, 18, y + 12);

    y += 42;

    // 5. Impression Box
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, y, pageWidth - 28, 22, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text("CLINICAL IMPRESSION / CONCLUSION:", 18, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    const splitImpression = doc.splitTextToSize(
      report.impressionNotes || "Study correlated clinically with presenting complaints.",
      pageWidth - 36
    );
    doc.text(splitImpression, 18, y + 12);

    y += 28;

    // 6. Signature Block
    doc.setDrawColor(203, 213, 225);
    doc.line(14, y, pageWidth - 14, y);

    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text("Validated on Hospital PACS/RIS Interface • Electronic Signature Certified", 14, y + 4);
    doc.text("This is an authenticated computer-generated radiological diagnostic report.", 14, y + 8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(report.radiologistName || "Dr. Vikram Seth, MD (Radiology)", pageWidth - 14, y + 4, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text("Consultant Radiologist • Sign-Off Verified", pageWidth - 14, y + 8, { align: "right" });

    // Save
    doc.save(`${report.orderNo}_${report.patientName.replace(/\s+/g, "_")}_Radiology.pdf`);

    toast({
      title: "Radiology Report PDF Downloaded",
      description: `Downloaded official vector PDF report for ${report.patientName} (${report.orderNo}). (${DELEGATION_STRING})`,
    });
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Radiology Report"
          description="Loading diagnostic report and study parameters..."
          crumbs={[{ label: "Clinical Operations" }, { label: "Radiology", href: "/hospital-admin/radiology" }, { label: "Reports Archive", href: "/hospital-admin/radiology/reports" }]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading report...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 print:space-y-0 print:m-0 print:p-0">
      {/* 1. Navigation & Action Bar - HIDDEN ON PRINT */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 print:hidden">
        <Button variant="ghost" size="sm" asChild className="-ml-2 gap-1 text-muted-foreground hover:text-foreground">
          <Link href="/hospital-admin/radiology/reports">
            <ArrowLeft className="h-4 w-4" /> Back to Reports Archive
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          {report.dicomViewerUrl && (
            <Button size="sm" asChild className="gap-1.5 shadow-sm text-xs bg-slate-900 text-white hover:bg-slate-800 hover:text-white border border-slate-700">
              <Link href={`/hospital-admin/radiology/viewer/${report.id}`}>
                <Eye className="h-4 w-4 text-cyan-400" /> Launch Web DICOM PACS
              </Link>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 shadow-sm text-xs">
            <Printer className="h-4 w-4" /> Print Report
          </Button>
          <Button size="sm" onClick={handleDownloadPDF} className="gap-1.5 shadow-sm text-xs bg-primary text-primary-foreground">
            <Download className="h-4 w-4" /> Download PDF Report
          </Button>
        </div>
      </div>

      {/* 2. PageHeader & Breadcrumbs - HIDDEN ON PRINT */}
      <div className="print:hidden">
        <PageHeader
          title={`Radiology Report: ${report.modality} — ${report.bodyPart}`}
          description={`Report #${report.orderNo} • Patient: ${report.patientName} (${report.uhid || report.patientId}) • Suite: ${report.roomName}`}
          crumbs={[
            { label: "Clinical Operations" },
            { label: "Radiology", href: "/hospital-admin/radiology" },
            { label: "Reports Archive", href: "/hospital-admin/radiology/reports" },
            { label: report.orderNo },
          ]}
        />
        <div className="mt-2">
          <ScopeIndicator scope="Hospital Admin" stationName="Central Radiology Diagnostic Archive" />
        </div>
      </div>

      {/* 3. A4 Clean Vector Document View */}
      <Card className="border border-border shadow-sm print:border-none print:shadow-none bg-card max-w-4xl mx-auto">
        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Top Banner */}
          <div className="border-b border-border pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                <h2 className="text-base font-bold text-foreground tracking-tight uppercase">
                  QLYNO CENTRAL RADIOLOGY &amp; IMAGING SERVICES
                </h2>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                AERB &amp; NABH Certified Diagnostic Imaging Center • Advanced Digital PACS/RIS Network
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs font-mono font-bold text-foreground">
                Order #{report.orderNo}
              </p>
              <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                Date: {new Date(report.scheduledAt).toLocaleDateString()}
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
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">UHID / ID:</span>
              <span className="font-mono font-semibold text-primary">{report.uhid || report.patientId}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Age / Gender:</span>
              <span className="font-medium text-foreground">{report.age || 48} Yrs / {report.gender || "Male"}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Ordering Physician:</span>
              <span className="font-medium text-foreground">{report.orderingDoctor} ({report.source})</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Imaging Suite:</span>
              <span className="font-medium text-foreground">{report.roomName}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Patient Location / Bed:</span>
              <span className="font-mono font-semibold text-primary">{report.patientLocation}</span>
            </div>
          </div>

          {/* Examination Title Header */}
          <div className="bg-muted/40 p-3 rounded-md border border-border flex items-center justify-between">
            <span className="text-xs font-bold text-foreground uppercase tracking-wide">
              Examination: {report.modality} — {report.bodyPart}
            </span>
            <Badge variant="outline" className="text-[10px] font-mono">
              Certified Diagnostic Study
            </Badge>
          </div>

          {/* Critical Alert Box (If Flagged) */}
          {report.criticalFinding && (
            <div className="p-3.5 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-xs space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-sm">
                <AlertOctagon className="h-4 w-4" /> EMERGENCY CRITICAL FINDING ALERT
              </span>
              <p className="font-medium leading-relaxed">{report.criticalDetails}</p>
            </div>
          )}

          {/* Observations & Findings */}
          <div className="p-4 rounded-lg border border-border bg-card space-y-3 text-xs">
            <div>
              <span className="text-[11px] text-muted-foreground font-bold uppercase block">
                Radiological Findings &amp; Observations:
              </span>
              <p className="text-xs text-foreground mt-1 leading-relaxed whitespace-pre-line">
                {report.reportNotes}
              </p>
            </div>

            <div className="pt-3 border-t border-border">
              <span className="text-[11px] text-muted-foreground font-bold uppercase block">
                Clinical Impression / Conclusion:
              </span>
              <p className="text-xs text-foreground font-semibold mt-1 leading-relaxed">
                {report.impressionNotes}
              </p>
            </div>
          </div>

          {/* Signature & Audit Footer */}
          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div>
              <p className="text-[11px] font-semibold text-foreground">Hospital PACS/RIS Quality Certification</p>
              <p className="text-[10px] text-muted-foreground">Authenticated electronic signature under digital health imaging guidelines.</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="font-bold text-foreground flex items-center gap-1 sm:justify-end">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                {report.radiologistName || "Dr. Vikram Seth, MD (Radiology)"}
              </p>
              <p className="text-[10px] text-muted-foreground font-mono">
                Consultant Radiologist • Authorized: {report.authorizedAt ? new Date(report.authorizedAt).toLocaleString() : "Electronically Signed"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
