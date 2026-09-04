"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Ambulance,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Globe,
  HeartPulse,
  Lock,
  Mail,
  MapPin,
  Phone,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
  Star,
  Stethoscope,
  Users,
  Zap,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/hospital-admin/components/ui/avatar";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/hospital-admin/components/ui/tabs";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { VerificationNav } from "@/hospital-admin/components/verification/verification-nav";
import { BookConsultationModal } from "@/hospital-admin/components/verification/BookConsultationModal";
import { mockPublicHospitalProfile, mockDoctorAffiliations } from "@/hospital-admin/lib/mock-data/verification-cases";
import { DoctorAffiliationVerification } from "@/hospital-admin/lib/types";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { useSelector } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";

export default function PublicProfilePreviewPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("hospital-card");
  const profileState = useSelector((state: RootState) => state.hospitalProfile);

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<DoctorAffiliationVerification | null>(null);

  const hospitalName = profileState?.basicInfo?.hospitalName || mockPublicHospitalProfile.hospitalName;
  const tagline = profileState?.basicInfo?.tagline || mockPublicHospitalProfile.tagline;
  const address = profileState?.contactInfo?.address
    ? `${profileState.contactInfo.address}, ${profileState.contactInfo.city || ""} ${profileState.contactInfo.postalCode || ""}`.trim()
    : mockPublicHospitalProfile.address;
  const contactPhone = profileState?.contactInfo?.generalPhone || mockPublicHospitalProfile.contactPhone;
  const emergencyHelpline = profileState?.contactInfo?.emergencyHelpline || mockPublicHospitalProfile.emergencyHelpline;
  const accreditations = profileState?.basicInfo?.accreditationBadges?.length
    ? profileState.basicInfo.accreditationBadges
    : mockPublicHospitalProfile.accreditations;
  const verifiedCapabilities = profileState?.facilityHighlights?.length
    ? profileState.facilityHighlights.map((f) => f.name)
    : mockPublicHospitalProfile.verifiedCapabilities;
  const specialties = profileState?.departmentFeatures?.filter((d) => d.featured)?.length
    ? profileState.departmentFeatures.filter((d) => d.featured).map((d) => d.name)
    : mockPublicHospitalProfile.specialties;

  const liveDoctors = mockDoctorAffiliations.filter((d) => d.publicSearchStatus === "Live / Searchable");

  const handleOpenDoctorBooking = (doctor: DoctorAffiliationVerification) => {
    setSelectedDoctorForBooking(doctor);
    setIsBookingModalOpen(true);
  };

  const handleOpenHospitalBooking = () => {
    setSelectedDoctorForBooking(liveDoctors[0] || null);
    setIsBookingModalOpen(true);
  };

  const handleBookingConfirm = (details: {
    doctorName: string;
    specialty: string;
    patientName: string;
    phone: string;
    consultationType: string;
    date: string;
    timeSlot: string;
    fee: number;
  }) => {
    toast({
      title: "Consultation Booked Successfully",
      description: `Appointment confirmed with ${details.doctorName} (${details.specialty}) for ${details.patientName} on ${details.date} at ${details.timeSlot}.`,
    });
  };

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Public Profile &amp; Search Preview Workstation"
        description="Simulate exactly how verified institution and doctor credentials appear in Qlyno Public Search, enforcing strict data-leak prevention and privacy standards."
        crumbs={[{ label: "Administration" }, { label: "Verifications", href: "/hospital-admin/verification" }, { label: "Public Preview" }]}
      />

      <VerificationNav />

      {/* Scope Indicator & Privacy Guards */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Public Search &amp; Data Privacy Simulator" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Data Protection Gate: Strict public sanitization active across all endpoints</span>
        </div>
      </div>

      {/* Mandatory Data Leak Sanitization Verification Checklist */}
      <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-xs">
        <CardHeader className="p-3.5 pb-2">
          <CardTitle className="text-xs font-bold text-emerald-950 dark:text-emerald-300 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Mandatory Public Data Sanitization Audit (Pre-Publish Verification)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3.5 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 p-2 rounded bg-card/80 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Zero Private Patient Data (Protected PHI Policy)</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded bg-card/80 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Zero Internal Staffing / Shifts (Internal Duty Policy)</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded bg-card/80 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Zero Bed-Level Details (Inpatient Privacy Policy)</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded bg-card/80 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Zero Internal Triage Logs (Clinical Triage Policy)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Viewport Switcher */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 max-w-lg">
          <TabsTrigger value="hospital-card" className="text-xs">
            Qlyno Hospital Search Card
          </TabsTrigger>
          <TabsTrigger value="full-profile" className="text-xs">
            Verified Public Profile Page
          </TabsTrigger>
          <TabsTrigger value="doctor-cards" className="text-xs">
            Doctor Search Results ({liveDoctors.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: HOSPITAL SEARCH CARD PREVIEW */}
        <TabsContent value="hospital-card" className="space-y-4">
          <div className="max-w-2xl mx-auto p-4 rounded-xl border border-border bg-card shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border text-[11px] text-muted-foreground font-mono">
              <span className="flex items-center gap-1">
                <Globe className="h-3.5 w-3.5 text-primary" /> https://qlyno.com/hospitals/mumbai/qlyno-multispecialty
              </span>
              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[9px] gap-1">
                <CheckCircle2 className="h-2.5 w-2.5" /> Verified Listing
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="h-28 w-28 rounded-lg bg-muted flex items-center justify-center text-primary font-bold text-2xl shrink-0 border border-border">
                <Building2 className="h-12 w-12 text-primary/70" />
              </div>

              <div className="space-y-1.5 flex-1 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
                      {hospitalName}
                      <Badge className="bg-emerald-600 text-white text-[9px] px-1.5 py-0">
                        ✓ Verified
                      </Badge>
                    </h3>
                    <p className="text-muted-foreground text-xs">{tagline}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded font-bold text-xs">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> 4.9 (1,240 Reviews)
                  </div>
                </div>

                <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span>{address}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {accreditations.map((acc, idx) => (
                    <Badge key={idx} variant="outline" className="text-[10px] bg-muted/30">
                      {acc}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/20 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <HeartPulse className="h-4 w-4 text-rose-600" />
                <span>24/7 Emergency Helpline: <strong>{emergencyHelpline}</strong></span>
              </div>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground text-xs font-semibold h-8"
                onClick={handleOpenHospitalBooking}
              >
                Book Hospital Appointment
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: FULL VERIFIED PROFILE PAGE */}
        <TabsContent value="full-profile" className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2 border-b border-border">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                    {hospitalName}
                    <Badge className="bg-emerald-600 text-white text-[10px]">
                      ✓ Qlyno Verified Institution
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {address} • Phone: {contactPhone}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-mono">
                    24/7 Level-1 Trauma
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              {/* Verified Capabilities */}
              <div className="space-y-2">
                <span className="font-bold text-foreground text-xs uppercase tracking-wide block">
                  Verified Clinical Capabilities &amp; Infrastructure
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {verifiedCapabilities.map((cap, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg border border-border bg-card flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="font-medium text-foreground">{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified Specialties */}
              <div className="space-y-2 pt-2 border-t border-border">
                <span className="font-bold text-foreground text-xs uppercase tracking-wide block">
                  Accredited Clinical Specialties
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {specialties.map((spec, idx) => (
                    <div key={idx} className="p-2 rounded bg-muted/20 border border-border flex items-center gap-1.5">
                      <Stethoscope className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: DOCTOR SEARCH RESULTS */}
        <TabsContent value="doctor-cards" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {liveDoctors.map((doc) => (
              <Card key={doc.id} className="border-border shadow-xs">
                <CardContent className="p-3.5 flex items-start gap-3 text-xs">
                  <Avatar className="h-12 w-12 border border-border shrink-0">
                    <AvatarImage src={doc.avatarUrl} alt={doc.doctorName} />
                    <AvatarFallback className="text-xs font-bold bg-muted">
                      {doc.doctorName.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <h4 className="font-bold text-foreground text-xs flex items-center gap-1">
                          {doc.doctorName}
                          <Badge className="bg-emerald-600 text-white text-[8px] px-1 py-0 h-3.5">
                            ✓ Verified
                          </Badge>
                        </h4>
                        <p className="text-[11px] text-muted-foreground">{doc.specialty}</p>
                      </div>
                      <Badge variant="outline" className="text-[9px] font-mono">
                        {doc.qualification}
                      </Badge>
                    </div>

                    <div className="text-[10px] text-muted-foreground flex items-center gap-1 pt-0.5">
                      <Building2 className="h-3 w-3 text-primary" />
                      <span>Affiliated with <strong>Qlyno Multispecialty Hospital</strong> ({doc.affiliationType})</span>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-border mt-1">
                      <span className="font-mono text-[9px] text-muted-foreground">
                        Reg: {doc.registrationNo}
                      </span>
                      <Button
                        size="sm"
                        className="h-6 text-[10px] bg-primary text-primary-foreground font-semibold px-2.5 hover:bg-primary/90 transition-colors"
                        onClick={() => handleOpenDoctorBooking(doc)}
                      >
                        Book Consultation
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Book Consultation Modal */}
      <BookConsultationModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedDoctorForBooking(null);
        }}
        doctor={selectedDoctorForBooking}
        onConfirm={handleBookingConfirm}
      />
    </div>
  );
}
