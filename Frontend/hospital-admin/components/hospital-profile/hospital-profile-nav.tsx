"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import {
  Building2,
  Stethoscope,
  Scissors,
  Users,
  Layers,
  Image,
  PhoneCall,
  Globe,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { cn } from "@/hospital-admin/lib/utils";

interface HospitalProfileNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function HospitalProfileNav({ activeTab, onTabChange }: HospitalProfileNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = activeTab || searchParams.get("tab") || "basic-information";

  const profileState = useSelector((state: RootState) => state.hospitalProfile);
  const { departmentFeatures, serviceOfferings, doctorFeatures, facilityHighlights, mediaAssets, qlynoSettings } = profileState;

  const featuredDeptCount = departmentFeatures.filter((d) => d.featured).length;
  const featuredDocCount = doctorFeatures.filter((d) => d.featured).length;
  const verifiedDocCount = doctorFeatures.filter((d) => d.isVerified).length;

  const navItems = [
    {
      id: "basic-information",
      label: "Basic Info",
      href: "/hospital-admin/hospital-profile/basic-information",
      icon: Building2,
      badge: "Core",
    },
    {
      id: "departments",
      label: "Departments",
      href: "/hospital-admin/hospital-profile/departments",
      icon: Stethoscope,
      badge: `${featuredDeptCount} Featured`,
    },
    {
      id: "services",
      label: "Services",
      href: "/hospital-admin/hospital-profile/services",
      icon: Scissors,
      badge: `${serviceOfferings.length}`,
    },
    {
      id: "doctors",
      label: "Doctors",
      href: "/hospital-admin/hospital-profile/doctors",
      icon: Users,
      badge: `${featuredDocCount}/${verifiedDocCount} Verified`,
    },
    {
      id: "facilities",
      label: "Facilities",
      href: "/hospital-admin/hospital-profile/facilities",
      icon: Layers,
      badge: "Live Telemetry",
    },
    {
      id: "photos",
      label: "Photos",
      href: "/hospital-admin/hospital-profile/photos",
      icon: Image,
      badge: `${mediaAssets.length}`,
    },
    {
      id: "contact",
      label: "Contact",
      href: "/hospital-admin/hospital-profile/contact",
      icon: PhoneCall,
    },
    {
      id: "qlyno-profile",
      label: "Qlyno Profile",
      href: "/hospital-admin/hospital-profile/qlyno-profile",
      icon: Globe,
      badge: qlynoSettings.verificationStatus === "Verified" ? "Verified" : "Draft",
    },
  ];

  const handleSelect = (id: string, href: string) => {
    if (onTabChange) {
      onTabChange(id);
    } else {
      router.push(`/hospital-admin/hospital-profile?tab=${id}`);
    }
  };

  return (
    <div className="border-b border-border/80 pb-1">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id || pathname === item.href;

          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id, item.href)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0",
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
              {item.badge && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-mono font-medium tracking-tight",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground border border-border/60"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
