"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { HospitalProfileHeader } from "@/hospital-admin/components/hospital-profile/hospital-profile-header";
import { HospitalProfileNav } from "@/hospital-admin/components/hospital-profile/hospital-profile-nav";
import { ServicesPortfolioTab } from "@/hospital-admin/components/hospital-profile/services-portfolio-tab";

export default function ServicesPage() {
  const router = useRouter();

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <HospitalProfileHeader />
      <HospitalProfileNav
        activeTab="services"
        onTabChange={(tab) => router.push(`/hospital-admin/hospital-profile/${tab}`)}
      />
      <div className="pt-1">
        <ServicesPortfolioTab />
      </div>
    </div>
  );
}
