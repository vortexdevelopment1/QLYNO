"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  Radio,
  CalendarCheck,
  FileCheck2,
  BellRing,
  FileText,
  Megaphone,
  BookTemplate,
  Activity,
} from "lucide-react";

interface CommunicationNavProps {
  unreadChatCount?: number;
  activeBroadcastCount?: number;
  pendingRemindersCount?: number;
}

export function CommunicationNav({
  unreadChatCount = 3,
  activeBroadcastCount = 1,
  pendingRemindersCount = 8,
}: CommunicationNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Overview",
      href: "/hospital-admin/care-coordination/communication",
      icon: Activity,
      exact: true,
    },
    {
      label: "Patient Chat",
      href: "/hospital-admin/care-coordination/communication/patient-chat",
      icon: MessageSquare,
      badge: unreadChatCount > 0 ? unreadChatCount : undefined,
      badgeColor: "bg-blue-500 text-white",
    },
    {
      label: "WhatsApp Gateway",
      href: "/hospital-admin/care-coordination/communication/whatsapp",
      icon: Radio,
      badge: "99.4%",
      badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
    },
    {
      label: "Appointment Messages",
      href: "/hospital-admin/care-coordination/communication/appointment-messages",
      icon: CalendarCheck,
    },
    {
      label: "Report Notifications",
      href: "/hospital-admin/care-coordination/communication/report-notifications",
      icon: FileCheck2,
    },
    {
      label: "Follow-up Reminders",
      href: "/hospital-admin/care-coordination/communication/follow-up-reminders",
      icon: BellRing,
      badge: pendingRemindersCount > 0 ? pendingRemindersCount : undefined,
      badgeColor: "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30",
    },
    {
      label: "Doctor Notes",
      href: "/hospital-admin/care-coordination/communication/doctor-notes",
      icon: FileText,
    },
    {
      label: "Broadcasts",
      href: "/hospital-admin/care-coordination/communication/broadcasts",
      icon: Megaphone,
      badge: activeBroadcastCount > 0 ? `${activeBroadcastCount} Live` : undefined,
      badgeColor: "bg-rose-500 text-white animate-pulse",
    },
    {
      label: "Templates",
      href: "/hospital-admin/care-coordination/communication/templates",
      icon: BookTemplate,
    },
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-border bg-card/60 px-4 py-2 backdrop-blur scrollbar-thin">
      {navItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={false}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <Icon className={`h-3.5 w-3.5 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
            <span>{item.label}</span>
            {item.badge !== undefined && (
              <span
                className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-semibold leading-tight ${
                  item.badgeColor || "bg-muted text-muted-foreground"
                }`}
              >
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
