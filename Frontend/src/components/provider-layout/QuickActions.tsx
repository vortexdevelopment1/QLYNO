"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Stethoscope,
  FilePlus2,
  FlaskConical,
  ScanLine,
  CalendarClock,
  UserPlus,
  Search,
  Building2,
  UserRound,
  CalendarPlus,
} from "lucide-react";

const publicActions = [
  { label: "Discover Care", icon: Search, href: "/discover" },
  { label: "Doctor Profile", icon: UserRound, href: "/doctors/doc-1" },
  { label: "Clinic Profile", icon: Building2, href: "/clinics/clinic-1" },
  { label: "Book Appointment", icon: CalendarPlus, href: "/book" },
];

const workspaceActions = [
  { label: "Start Consultation", icon: Stethoscope, href: "/doctor/consultation" },
  { label: "New Prescription", icon: FilePlus2, href: "/doctor/prescriptions" },
  { label: "Order Lab Test", icon: FlaskConical, href: "/doctor/lab-orders" },
  { label: "Order Radiology", icon: ScanLine, href: "/doctor/radiology-orders" },
  { label: "Schedule Follow-up", icon: CalendarClock, href: "/doctor/follow-up" },
  { label: "Add Patient", icon: UserPlus, href: "/doctor/patients" },
];

export default function QuickActions() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="btn-primary">
        <Plus size={15} strokeWidth={2.5} />
        Quick Actions
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1.5 w-64 card p-1.5">
            <div className="px-2.5 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
              Workspace
            </div>
            {workspaceActions.map((a) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.label}
                  onClick={() => {
                    setOpen(false);
                    router.push(a.href);
                  }}
                  className="w-full flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] font-medium text-ink-soft hover:bg-brand-50 hover:text-brand-700 transition-colors"
                >
                  <Icon size={15} />
                  {a.label}
                </button>
              );
            })}
            <div className="my-1 border-t border-line" />
            <div className="px-2.5 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
              Public Pages
            </div>
            {publicActions.map((a) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.label}
                  onClick={() => {
                    setOpen(false);
                    router.push(a.href);
                  }}
                  className="w-full flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] font-medium text-ink-soft hover:bg-brand-50 hover:text-brand-700 transition-colors"
                >
                  <Icon size={15} />
                  {a.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
