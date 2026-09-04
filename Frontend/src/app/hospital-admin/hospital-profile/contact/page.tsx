"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { HospitalProfileHeader } from "@/hospital-admin/components/hospital-profile/hospital-profile-header";
import { HospitalProfileNav } from "@/hospital-admin/components/hospital-profile/hospital-profile-nav";
import { ContactInformationTab } from "@/hospital-admin/components/hospital-profile/contact-information-tab";

export default function ContactPage() {
  const router = useRouter();

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <HospitalProfileHeader />
      <HospitalProfileNav
        activeTab="contact"
        onTabChange={(tab) => router.push(`/hospital-admin/hospital-profile/${tab}`)}
      />
      <div className="pt-1">
        <ContactInformationTab />
      </div>
    </div>
  );
}
