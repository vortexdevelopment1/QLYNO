"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  HeartPulse,
  MapPin,
  Phone,
  Pill,
  Printer,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  User,
  Zap,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { mockPharmacyPrescriptions } from "@/hospital-admin/lib/mock-data/pharmacy-extended-operations";
import { PharmacyPrescription } from "@/hospital-admin/lib/types";
import { formatDateTime } from "@/hospital-admin/lib/utils";
import jsPDF from "jspdf";

export default function PrescriptionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  const [prescriptions] = useState<PharmacyPrescription[]>(mockPharmacyPrescriptions);
  const rx = prescriptions.find((r) => r.id === params.id || r.prescriptionNumber === params.id) || prescriptions[0];

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(24, 43, 73);
      doc.text("QLYNO MULTISPECIALTY HOSPITAL", 105, 18, { align: "center" });

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("NABH & NABL ACCREDITED TERTIARY CARE CENTRE", 105, 23, { align: "center" });
      doc.text("Plot 12, Medical Enclave, Sector 4, Mumbai, MH 400076 | Tel: +91 22 6899 4400", 105, 27, { align: "center" });

      doc.setDrawColor(203, 213, 225);
      doc.line(15, 31, 195, 31);

      // Prescription Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(`OFFICIAL MEDICAL PRESCRIPTION — #${rx.prescriptionNumber}`, 15, 38);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(`Date & Time: ${formatDateTime(rx.prescribedAt)}`, 140, 38);
      doc.text(`Department: ${rx.source} | Priority: ${rx.priority}`, 15, 43);
      if (rx.wardBed) {
        doc.text(`Inpatient Location: ${rx.wardBed}`, 140, 43);
      }

      doc.line(15, 46, 195, 46);

      // Patient Details Box
      doc.setFillColor(248, 250, 252);
      doc.rect(15, 49, 180, 22, "F");
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, 49, 180, 22, "S");

      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("PATIENT INFORMATION", 18, 54);
      doc.setFont("helvetica", "normal");
      doc.text(`Name: ${rx.patientName}`, 18, 59);
      doc.text(`Age/Sex: ${rx.patientAge} Years / ${rx.patientGender}`, 18, 64);
      doc.text(`UHID / Patient ID: ${rx.patientId}`, 105, 59);
      doc.text(`Status: ${rx.status}`, 105, 64);

      // Doctor Details Box
      doc.setFillColor(248, 250, 252);
      doc.rect(15, 74, 180, 22, "F");
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, 74, 180, 22, "S");

      doc.setFont("helvetica", "bold");
      doc.text("PRESCRIBING PHYSICIAN", 18, 79);
      doc.setFont("helvetica", "normal");
      doc.text(`Doctor: ${rx.doctorName}`, 18, 84);
      doc.text(`Specialty: ${rx.doctorSpecialty}`, 18, 89);
      doc.text(`Diagnosis: ${rx.clinicalDiagnosis || "Clinical Consultation"}`, 105, 84);
      doc.text(`Doctor ID: ${rx.doctorId}`, 105, 89);

      // Rx Symbol
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(14, 116, 144);
      doc.text("Rx", 15, 104);

      // Medication Items Table Header
      let y = 108;
      doc.setFillColor(241, 245, 249);
      doc.rect(15, y, 180, 8, "F");
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("#", 18, y + 5);
      doc.text("Medicine / Composition", 26, y + 5);
      doc.text("Dosage & Frequency", 95, y + 5);
      doc.text("Duration", 145, y + 5);
      doc.text("Qty", 175, y + 5);

      y += 8;
      doc.setFont("helvetica", "normal");

      rx.items.forEach((item, idx) => {
        doc.setFont("helvetica", "bold");
        doc.text(`${idx + 1}`, 18, y + 5);
        doc.text(`${item.medicineName}`, 26, y + 5);
        doc.setFont("helvetica", "normal");
        doc.text(`${item.dosage} — ${item.frequency}`, 95, y + 5);
        doc.text(`${item.duration}`, 145, y + 5);
        doc.text(`${item.quantity}`, 175, y + 5);

        if (item.instructions) {
          y += 5;
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text(`* ${item.instructions}`, 26, y + 4);
          doc.setFontSize(9);
          doc.setTextColor(15, 23, 42);
        }

        if (item.scheduleH1) {
          y += 4;
          doc.setFontSize(8);
          doc.setTextColor(225, 29, 72);
          doc.text("[Schedule H1 Controlled Drug - Regulated]", 26, y + 4);
          doc.setFontSize(9);
          doc.setTextColor(15, 23, 42);
        }

        y += 8;
        doc.setDrawColor(241, 245, 249);
        doc.line(15, y, 195, y);
      });

      // Special Clinical Advice
      y += 6;
      doc.setFont("helvetica", "bold");
      doc.text("SPECIAL INSTRUCTIONS & DIETARY ADVICE:", 15, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text("1. Take all medications exactly as directed. Complete the full antibiotic course.", 15, y);
      y += 5;
      doc.text("2. Report any allergic rash, breathlessness, or unusual swelling immediately to ER.", 15, y);
      y += 5;
      doc.text("3. Follow up in OPD after 5 days with repeat CBC and vitals chart.", 15, y);

      // Signatures
      y = 250;
      doc.line(20, y, 75, y);
      doc.text("Authorized Pharmacist Sign", 25, y + 5);

      doc.line(135, y, 190, y);
      doc.text("Prescribing Doctor Signature", 140, y + 5);

      // Save PDF
      doc.save(`Prescription_${rx.prescriptionNumber}.pdf`);

      toast({
        title: "Prescription PDF Downloaded",
        description: `Exported official clinical prescription ${rx.prescriptionNumber} as PDF.`,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Download Failed",
        description: "An error occurred while generating the PDF document.",
        variant: "destructive",
      });
    }
  };

  if (!mounted) {
    return (
      <div className="space-y-4 animate-fade-in pb-12">
        <PageHeader
          title="Clinical Prescription Viewer"
          description="Detailed hospital medical order and dispensing instructions."
          crumbs={[
            { label: "Operations" },
            { label: "Pharmacy", href: "/hospital-admin/pharmacy" },
            { label: "Prescriptions", href: "/hospital-admin/pharmacy/prescriptions" },
            { label: rx?.prescriptionNumber || "Prescription" },
          ]}
        />
        <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
          Loading prescription...
        </div>
      </div>
    );
  }

  const hasScheduleH1 = rx.items.some((i) => i.scheduleH1);

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/hospital-admin/pharmacy/prescriptions">
            <Button size="sm" variant="outline" className="h-8 gap-1 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Queue
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Prescription #{rx.prescriptionNumber}
            </h1>
            <p className="text-xs text-muted-foreground">
              Prescribed on {formatDateTime(rx.prescribedAt)} • {rx.source} Care Unit
            </p>
          </div>
        </div>

        {/* Top-Right Functional Print and Download Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 font-semibold text-xs text-foreground hover:bg-muted/80 shadow-xs"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4 text-primary" /> Print Prescription
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 font-semibold text-xs text-foreground hover:bg-muted/80 shadow-xs"
            onClick={handleDownloadPDF}
          >
            <Download className="h-4 w-4 text-emerald-600" /> Download PDF
          </Button>

          <Link href="/hospital-admin/pharmacy/dispensing">
            <Button size="sm" className="gap-1.5 font-semibold text-xs bg-primary text-primary-foreground shadow-xs">
              <CheckCircle2 className="h-4 w-4" /> Proceed to Dispense
            </Button>
          </Link>
        </div>
      </div>

      {/* Scope Indicator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 print:hidden">
        <ScopeIndicator scope="Hospital Admin" stationName="Clinical Medication Order Verification" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>NABH Electronic Prescription Standard — Verified Digital Record</span>
        </div>
      </div>

      {/* SCHEDULE H1 ALERT BANNER (IF APPLICABLE) */}
      {hasScheduleH1 && (
        <Card className="border-rose-500/40 bg-rose-500/10 shadow-xs print:hidden">
          <CardContent className="p-3.5 flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-rose-900 dark:text-rose-300 block">
                Schedule H1 Controlled Medication Included
              </span>
              <span className="text-muted-foreground text-[11px]">
                Under Drugs &amp; Cosmetics Rules, physical dispensing requires authorized pharmacist sign-off with State Pharmacy Council registration recording.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PRINTABLE PRESCRIPTION DOCUMENT CONTAINER */}
      <div className="border border-border bg-card rounded-xl p-6 sm:p-8 shadow-sm space-y-6 w-full max-w-5xl mx-auto print:border-none print:shadow-none print:p-0 print:m-0">
        {/* Hospital Letterhead Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="text-lg font-black tracking-tight text-foreground uppercase">
                Qlyno Multispecialty Hospital &amp; Research Centre
              </span>
            </div>
            <p className="text-xs font-medium text-muted-foreground">
              NABH &amp; NABL Accredited Tertiary Healthcare Facility • 500-Bed Super Specialty
            </p>
            <p className="text-[11px] text-muted-foreground flex items-center gap-3">
              <span>Plot 12, Medical Enclave, Sector 4, Mumbai, MH 400076</span>
              <span>• Tel: +91 22 6899 4400</span>
              <span>• Lic #: MH-HOSP-2018-0994</span>
            </p>
          </div>

          <div className="flex flex-col items-end gap-1 font-mono text-xs">
            <div className="p-2 rounded bg-muted/30 border border-border flex items-center gap-2">
              <QrCode className="h-10 w-10 text-foreground" />
              <div className="text-right">
                <span className="text-[9px] text-muted-foreground block">DIGITAL RX ID</span>
                <span className="font-bold text-primary">{rx.prescriptionNumber}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Prescription Metadata Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-muted/20 border border-border text-xs">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Prescription No.</span>
            <span className="font-mono font-bold text-foreground text-sm">{rx.prescriptionNumber}</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Date &amp; Time</span>
            <span className="font-mono text-foreground">{formatDateTime(rx.prescribedAt)}</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Care Source</span>
            <Badge variant="outline" className="text-[10px] font-mono mt-0.5">
              {rx.source}
            </Badge>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Clinical Priority</span>
            <Badge
              className={
                rx.priority === "Stat Emergency"
                  ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px]"
                  : "text-[10px]"
              }
            >
              {rx.priority}
            </Badge>
          </div>
        </div>

        {/* Two Columns: Patient & Doctor Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Patient Details */}
          <Card className="border-border bg-card shadow-none">
            <CardHeader className="p-3.5 pb-2 border-b border-border/60">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-primary" /> Patient Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Full Name:</span>
                <span className="font-bold text-foreground">{rx.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Age / Gender:</span>
                <span className="font-semibold text-foreground">{rx.patientAge} Years / {rx.patientGender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">UHID / Patient ID:</span>
                <span className="font-mono text-foreground">{rx.patientId}</span>
              </div>
              {rx.wardBed && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Inpatient Bed:</span>
                  <span className="font-mono text-primary font-bold">{rx.wardBed}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prescribing Doctor Details */}
          <Card className="border-border bg-card shadow-none">
            <CardHeader className="p-3.5 pb-2 border-b border-border/60">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Stethoscope className="h-3.5 w-3.5 text-primary" /> Prescribing Physician
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Doctor Name:</span>
                <span className="font-bold text-foreground">{rx.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Specialty / Department:</span>
                <span className="font-semibold text-foreground">{rx.doctorSpecialty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Doctor ID / Reg #:</span>
                <span className="font-mono text-foreground">{rx.doctorId} • MCI-99412</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground shrink-0">Clinical Diagnosis:</span>
                <span className="font-medium text-foreground italic text-right pl-2 break-words">
                  {rx.clinicalDiagnosis || "Primary Consultation"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rx Symbol & Medication Table */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-serif font-black text-primary">℞</span>
            <span className="text-sm font-bold text-foreground">Prescribed Medications &amp; Dosage Instructions</span>
          </div>

          <div className="rounded-lg border border-border overflow-hidden w-full">
            <table className="w-full text-left text-xs border-collapse table-fixed">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-xs font-bold text-muted-foreground">
                  <th className="w-[5%] px-3 py-2.5 text-center font-bold">#</th>
                  <th className="w-[32%] px-3 py-2.5 font-bold">Medicine / Composition</th>
                  <th className="w-[20%] px-3 py-2.5 font-bold">Dosage &amp; Route</th>
                  <th className="w-[18%] px-3 py-2.5 font-bold">Frequency</th>
                  <th className="w-[12%] px-3 py-2.5 font-bold">Duration</th>
                  <th className="w-[6%] px-3 py-2.5 text-center font-bold">Qty</th>
                  <th className="w-[7%] px-3 py-2.5 text-right font-bold">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rx.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-muted/20 text-xs transition-colors">
                    <td className="px-3 py-2.5 font-mono font-bold text-muted-foreground text-center align-top">
                      {idx + 1}
                    </td>

                    <td className="px-3 py-2.5 align-top">
                      <div className="font-semibold text-foreground break-words">{item.medicineName}</div>
                      {item.instructions && (
                        <div className="text-[10px] text-muted-foreground italic mt-0.5 break-words">
                          Instructions: {item.instructions}
                        </div>
                      )}
                      {item.scheduleH1 && (
                        <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[8px] px-1.5 py-0.5 h-auto mt-0.5 font-semibold">
                          Schedule H1 Controlled Drug
                        </Badge>
                      )}
                    </td>

                    <td className="px-3 py-2.5 text-foreground font-medium align-top break-words">
                      {item.dosage}
                    </td>

                    <td className="px-3 py-2.5 text-muted-foreground align-top break-words">
                      {item.frequency}
                    </td>

                    <td className="px-3 py-2.5 text-muted-foreground align-top break-words">
                      {item.duration}
                    </td>

                    <td className="px-3 py-2.5 text-center font-mono font-bold text-foreground align-top">
                      {item.quantity}
                    </td>

                    <td className="px-3 py-2.5 text-right font-mono font-semibold text-foreground align-top">
                      ₹{item.unitPrice * item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Clinical Advice & Follow-Up */}
        <div className="p-4 rounded-lg bg-muted/20 border border-border text-xs space-y-2">
          <span className="font-bold text-foreground block">Physician Special Instructions &amp; Dietary Advice:</span>
          <ul className="list-disc pl-4 space-y-1 text-muted-foreground text-[11px] leading-relaxed">
            <li>Take oral medications with plenty of water after meals unless specifically marked empty stomach.</li>
            <li>Maintain fluid hydration (minimum 2.5 litres/day) and low-sodium diet.</li>
            <li>Complete the entire prescribed antibiotic course. Do not stop midway upon symptom improvement.</li>
            <li>In case of emergency adverse reaction, contact Qlyno Emergency SOS or visit nearest ER counter immediately.</li>
          </ul>
        </div>

        {/* Doctor Signature Block */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-end justify-between gap-6 text-xs">
          <div className="space-y-1 text-muted-foreground text-[11px]">
            <p>• Dispensed from Central Pharmacy Dispensary.</p>
            <p>• Verified with FEFO batch rotation protocol.</p>
            <p>• All narcotic/Schedule H1 entries are recorded in state registry.</p>
          </div>

          <div className="text-center space-y-1 w-56">
            <div className="h-10 border-b border-foreground/40 flex items-center justify-center italic text-muted-foreground font-serif">
              Digital Signature Verified
            </div>
            <span className="font-bold text-foreground block">{rx.doctorName}</span>
            <span className="text-[10px] text-muted-foreground block">{rx.doctorSpecialty} (Reg: MCI-99412)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
