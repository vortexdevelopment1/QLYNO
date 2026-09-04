"use client";

import React, { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertOctagon,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileText,
  FlaskConical,
  Printer,
  ShieldAlert,
} from "lucide-react";
import jsPDF from "jspdf";

import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { StatusBadge } from "@/hospital-admin/components/shared/status-badge";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { mockLabReports, LabReportDetail } from "@/hospital-admin/lib/mock-data/lab-reports";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Lab Management workflow";

export default function LabReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { toast } = useToast();
  const report: LabReportDetail | undefined = mockLabReports[id];

  if (!report) {
    notFound();
  }

  const handlePrint = () => {
    window.print();
    toast({
      title: "Print Command Sent",
      description: `Sent diagnostic report for ${report.patientName} (${report.orderNo}) to printer. (${DELEGATION_STRING})`,
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
    doc.setFillColor(15, 23, 42); // slate-900 / dark navy
    doc.rect(0, 0, pageWidth, 28, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("QLYNO CENTRAL PATHOLOGY & DIAGNOSTIC LABORATORIES", 14, 11);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text("NABL & CAP Accredited Diagnostic Center • License # NABL-MED-88910 • ISO 15189 Certified", 14, 17);
    doc.text("Main Campus: Andheri West, Mumbai, Maharashtra 400053 • Contact: +91 98200 44552", 14, 22);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(255, 255, 255);
    doc.text(report.orderNo, pageWidth - 14, 12, { align: "right" });
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text(`Status: ${report.status.toUpperCase()}`, pageWidth - 14, 17, { align: "right" });
    doc.text(report.authorizedAt, pageWidth - 14, 22, { align: "right" });

    let y = 34;

    // 2. Patient Demographics Box
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(203, 213, 225); // slate-300
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
    doc.text(report.uhid, 42, y + 11.5);

    doc.setFont("helvetica", "normal");
    doc.text("Age / Gender:", 18, y + 17.5);
    doc.setFont("helvetica", "bold");
    doc.text(`${report.age} Yrs / ${report.gender}`, 42, y + 17.5);

    doc.setFont("helvetica", "normal");
    doc.text("Ordering Doctor:", 110, y + 5.5);
    doc.setFont("helvetica", "bold");
    doc.text(report.orderingDoctor, 138, y + 5.5);

    doc.setFont("helvetica", "normal");
    doc.text("Specimen Type:", 110, y + 11.5);
    doc.setFont("helvetica", "bold");
    doc.text(report.sampleType, 138, y + 11.5);

    doc.setFont("helvetica", "normal");
    doc.text("Collection Time:", 110, y + 17.5);
    doc.setFont("helvetica", "bold");
    doc.text(report.collectedAt, 138, y + 17.5);

    y += 29;

    // 3. Test Heading Strip
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, pageWidth - 28, 7.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`TEST REPORT: ${report.test}`, 18, y + 5);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text(`Sample Barcode: ${report.sampleId}`, pageWidth - 18, y + 5, { align: "right" });

    y += 10;

    // 4. Test Results Table Header
    doc.setFillColor(226, 232, 240);
    doc.rect(14, y, pageWidth - 28, 6.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);

    doc.text("TEST PARAMETER / COMPONENT", 18, y + 4.5);
    doc.text("OBSERVED RESULT", 90, y + 4.5);
    doc.text("UNIT", 122, y + 4.5);
    doc.text("REFERENCE RANGE", 142, y + 4.5);
    doc.text("STATUS", pageWidth - 18, y + 4.5, { align: "right" });

    y += 6.5;

    // 5. Test Parameter Rows
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);

    report.results.forEach((res, i) => {
      if (i % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y, pageWidth - 28, 6.5, "F");
      }

      doc.setDrawColor(241, 245, 249);
      doc.line(14, y + 6.5, pageWidth - 14, y + 6.5);

      doc.setTextColor(15, 23, 42);
      doc.text(res.parameter, 18, y + 4.5);

      if (res.status === "Critical") {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(220, 38, 38);
      } else if (res.status === "High" || res.status === "Low") {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(217, 119, 6);
      } else {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
      }
      doc.text(res.observedValue, 90, y + 4.5);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(res.unit, 122, y + 4.5);
      doc.text(res.referenceRange, 142, y + 4.5);

      if (res.status === "Critical") {
        doc.setTextColor(220, 38, 38);
        doc.setFont("helvetica", "bold");
      } else if (res.status === "High" || res.status === "Low") {
        doc.setTextColor(217, 119, 6);
        doc.setFont("helvetica", "bold");
      } else {
        doc.setTextColor(22, 101, 52);
        doc.setFont("helvetica", "normal");
      }
      doc.text(res.status, pageWidth - 18, y + 4.5, { align: "right" });

      y += 7;
    });

    y += 5;

    // 6. Pathologist Clinical Interpretation Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, y, pageWidth - 28, 26, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text("Pathologist Clinical Interpretation & Remarks:", 18, y + 5.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    const splitImpression = doc.splitTextToSize(report.clinicalImpression, pageWidth - 36);
    doc.text(splitImpression, 18, y + 10.5);

    if (report.critical) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(220, 38, 38);
      doc.text(`CRITICAL ALERT: ${report.findingsSummary}`, 18, y + 22);
    }

    y += 32;

    // 7. Footer / Sign-off
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.4);
    doc.line(14, y, pageWidth - 14, y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`Verified & Released by: ${report.pathologist}`, 14, y + 4.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Medical Registration: MMC-PATH-771290 • Authorized on ${report.authorizedAt}`, 14, y + 8.5);

    doc.text("Qlyno Health Network Diagnostics • Official Electronic Health Record (EHR)", pageWidth - 14, y + 4.5, {
      align: "right",
    });
    doc.text("This report is validated electronically under digital pathology guidelines.", pageWidth - 14, y + 8.5, {
      align: "right",
    });

    const filename = `LabReport_${report.orderNo}_${report.patientName.replace(/\s+/g, "_")}.pdf`;
    doc.save(filename);

    toast({
      title: "PDF Diagnostic Report Downloaded",
      description: `Downloaded ${filename} successfully. (${DELEGATION_STRING})`,
    });
  };

  return (
    <div className="space-y-4 print:space-y-0 print:m-0 print:p-0">
      {/* 1. Navigation & Action Bar - HIDDEN ON PRINT */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 print:hidden">
        <Button variant="ghost" size="sm" asChild className="-ml-2 gap-1 text-muted-foreground hover:text-foreground">
          <Link href="/hospital-admin/lab">
            <ArrowLeft className="h-4 w-4" /> Back to Lab Orders
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 shadow-sm">
            <Printer className="h-4 w-4" /> Print Report
          </Button>
          <Button size="sm" onClick={handleDownloadPDF} className="gap-1.5 shadow-sm">
            <Download className="h-4 w-4" /> Download PDF Report
          </Button>
        </div>
      </div>

      {/* 2. PageHeader & Breadcrumbs - HIDDEN ON PRINT */}
      <div className="print:hidden">
        <PageHeader
          title={`Diagnostic Report: ${report.test}`}
          description={`Order #${report.orderNo} • Authorized by ${report.pathologist}`}
          crumbs={[
            { label: "Care Delivery" },
            { label: "Lab Orders", href: "/hospital-admin/lab" },
            { label: report.orderNo },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <StatusBadge status={report.status} />
              {report.critical && (
                <Badge variant="destructive" className="text-xs">
                  CRITICAL RESULT
                </Badge>
              )}
            </div>
          }
        />
      </div>

      {/* 3. ScopeIndicator Banner - HIDDEN ON PRINT */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 print:hidden">
        <ScopeIndicator scope="Hospital Admin" stationName="Central Pathology & Diagnostics" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-warning" />
          <span>Verified laboratory diagnostic report • Official medical record</span>
        </div>
      </div>

      {/* 4. On-Screen Critical Alert Banner - HIDDEN ON PRINT */}
      {report.critical && (
        <Card className="border-destructive/40 bg-destructive/10 print:hidden">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertOctagon className="h-6 w-6 text-destructive shrink-0" />
            <div>
              <p className="text-sm font-bold text-destructive">CRITICAL VALUE ALERT FLAGGED</p>
              <p className="text-xs text-foreground mt-0.5">{report.findingsSummary}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 5. MAIN OFFICIAL CLINICAL LAB REPORT CONTAINER */}
      <Card className="border-border bg-card shadow-sm print:border-none print:shadow-none print:bg-white print:text-black print:p-0 print:m-0 print:w-full print:block">
        <CardHeader className="border-b pb-4 bg-muted/20 print:bg-transparent print:border-b-2 print:border-black print:px-0 print:pt-0 print:pb-2.5">
          <div className="flex flex-row items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold print:border print:border-black print:text-black">
                <FlaskConical className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-foreground print:text-black print:text-base">
                  Qlyno Central Pathology & Diagnostic Laboratories
                </CardTitle>
                <CardDescription className="text-xs print:text-gray-600 print:text-[11px]">
                  NABL & CAP Accredited Diagnostic Center • License # NABL-MED-88910 • ISO 15189 Certified
                </CardDescription>
              </div>
            </div>
            <div className="text-right font-mono text-xs print:text-black">
              <p className="font-bold text-primary print:text-black print:text-sm">{report.orderNo}</p>
              <p className="text-muted-foreground print:text-gray-600 print:text-[11px]">{report.authorizedAt}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4 print:p-0 print:pt-3 print:space-y-3">
          {/* Patient & Sample Demographics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-muted/30 border border-border text-xs print:bg-gray-50 print:border-gray-300 print:text-black print:p-2.5">
            <div>
              <span className="text-muted-foreground print:text-gray-600 text-[11px]">Patient Name:</span>
              <p className="font-bold text-sm text-foreground print:text-black mt-0.5">{report.patientName}</p>
              <p className="text-[11px] text-muted-foreground print:text-gray-600 font-mono">UHID: {report.uhid}</p>
            </div>
            <div>
              <span className="text-muted-foreground print:text-gray-600 text-[11px]">Age & Gender:</span>
              <p className="font-bold text-sm text-foreground print:text-black mt-0.5">
                {report.age} Yrs • {report.gender}
              </p>
              <p className="text-[11px] text-muted-foreground print:text-gray-600">Source: {report.source}</p>
            </div>
            <div>
              <span className="text-muted-foreground print:text-gray-600 text-[11px]">Ordering Clinician:</span>
              <p className="font-bold text-sm text-foreground print:text-black mt-0.5">{report.orderingDoctor}</p>
              <p className="text-[11px] text-muted-foreground print:text-gray-600">Clinical Department</p>
            </div>
            <div>
              <span className="text-muted-foreground print:text-gray-600 text-[11px]">Specimen Barcode & Type:</span>
              <p className="font-bold text-sm font-mono text-primary print:text-black mt-0.5">{report.sampleId}</p>
              <p className="text-[11px] text-muted-foreground print:text-gray-600 truncate">{report.sampleType}</p>
            </div>
          </div>

          {/* Test Parameter Results Table (Full Width & Balanced Proportions) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground print:text-black flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary print:hidden" /> Test: {report.test}
              </h3>
              <Badge variant="outline" className="font-mono text-xs print:border-none print:text-gray-600 print:text-[11px]">
                Collected: {report.collectedAt}
              </Badge>
            </div>

            <div className="w-full border rounded-xl overflow-hidden shadow-none print:border print:border-gray-300 print:w-full">
              <table className="w-full table-fixed text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 print:bg-gray-100 border-b border-border print:border-gray-300">
                    <th className="w-[34%] px-3.5 py-2 text-xs font-semibold text-foreground print:text-black uppercase tracking-wider">
                      Test Parameter / Component
                    </th>
                    <th className="w-[18%] px-3.5 py-2 text-xs font-semibold text-foreground print:text-black uppercase tracking-wider">
                      Observed Result
                    </th>
                    <th className="w-[14%] px-3.5 py-2 text-xs font-semibold text-foreground print:text-black uppercase tracking-wider">
                      Unit
                    </th>
                    <th className="w-[20%] px-3.5 py-2 text-xs font-semibold text-foreground print:text-black uppercase tracking-wider">
                      Biological Reference Range
                    </th>
                    <th className="w-[14%] px-3.5 py-2 text-xs font-semibold text-foreground print:text-black uppercase tracking-wider text-right">
                      Status Flag
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border print:divide-gray-200 text-xs">
                  {report.results.map((res, index) => (
                    <tr key={index} className="hover:bg-muted/30 transition-colors print:hover:bg-transparent">
                      <td className="px-3.5 py-2.5 font-semibold text-foreground print:text-black break-words">
                        {res.parameter}
                      </td>
                      <td
                        className={`px-3.5 py-2.5 font-bold font-mono break-words ${
                          res.status === "Critical"
                            ? "text-destructive print:text-black"
                            : res.status === "High" || res.status === "Low"
                            ? "text-warning print:text-black font-semibold"
                            : "text-foreground print:text-black"
                        }`}
                      >
                        {res.observedValue}
                      </td>
                      <td className="px-3.5 py-2.5 text-muted-foreground font-mono print:text-black break-words">
                        {res.unit}
                      </td>
                      <td className="px-3.5 py-2.5 text-muted-foreground font-mono print:text-black break-words">
                        {res.referenceRange}
                      </td>
                      <td className="px-3.5 py-2.5 text-right">
                        <Badge
                          variant={
                            res.status === "Critical"
                              ? "destructive"
                              : res.status === "High" || res.status === "Low"
                              ? "warning"
                              : "success"
                          }
                          className="text-[10px] print:border print:border-black print:bg-transparent print:text-black"
                        >
                          {res.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pathologist Clinical Remarks & Interpretation */}
          <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-1.5 text-xs print:bg-gray-50 print:border-gray-300 print:text-black print:p-2.5">
            <h4 className="font-bold text-foreground print:text-black text-xs flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary print:hidden" /> Pathologist Clinical Interpretation
            </h4>
            <p className="text-muted-foreground print:text-black leading-relaxed">{report.clinicalImpression}</p>
            {report.critical && (
              <p className="text-destructive print:text-black font-bold pt-1">
                Note: {report.findingsSummary}
              </p>
            )}
          </div>

          {/* Verified Sign-off Footer */}
          <div className="flex flex-row items-center justify-between border-t-2 border-border print:border-black pt-3 text-xs text-muted-foreground print:text-black gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-foreground print:text-black font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5 text-success print:hidden" />
                <span>Verified & Released by: <strong>{report.pathologist}</strong></span>
              </div>
              <p className="text-[11px] text-muted-foreground print:text-gray-600 mt-0.5">
                Medical Registration: MMC-PATH-771290 • Authorized on {report.authorizedAt}
              </p>
            </div>

            <div className="text-right font-mono text-[11px] print:text-black">
              <p className="text-foreground print:text-black font-semibold">Qlyno Health Diagnostics</p>
              <p className="text-muted-foreground print:text-gray-600">Official Electronic Health Record</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
