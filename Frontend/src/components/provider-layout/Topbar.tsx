"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Bell, Building2, FileWarning, Hospital, ListTodo, LogOut, Menu, Siren } from "lucide-react";
import GlobalSearch from "./GlobalSearch";
import QuickActions from "./QuickActions";
import { allNavItems } from "./nav-config";
import { signOutToRoot } from "@/lib/client-session";
import { clinicalAlerts, getPatient, matchesWorkContext } from "@/lib/mock-data";
import { useMode } from "@/lib/mode-context";
import { useDoctorWorkflow } from "@/lib/doctor-workflow-context";
import { ClinicalAlert } from "@/lib/types";

const categoryIcon: Record<ClinicalAlert["category"], typeof AlertTriangle> = {
  Allergy: AlertTriangle,
  "Abnormal Report": FileWarning,
  Emergency: Siren,
  Task: ListTodo,
};

export default function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { selectedWorkplaceId, workContext } = useMode();
  const { getWorkplace } = useDoctorWorkflow();
  const current = allNavItems.find((n) => pathname?.startsWith(n.href));
  const selectedWorkplace = getWorkplace(selectedWorkplaceId);
  const unacknowledgedAlerts = clinicalAlerts.filter((a) => matchesWorkContext(a, workContext) && !a.acknowledged);
  const unacknowledged = unacknowledgedAlerts.length;
  const showBackButton = Boolean(
    pathname &&
      pathname !== "/" &&
      pathname !== "/doctor/dashboard" &&
      pathname !== "/clinic/dashboard"
  );

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(pathname?.startsWith("/clinic") ? "/clinic/dashboard" : "/doctor/dashboard");
  };

  const goToAlerts = () => {
    setNotificationsOpen(false);
    router.push("/doctor/alerts");
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-line bg-surface/86 backdrop-blur-xl flex items-center gap-3 px-4 lg:px-6">
      <button className="lg:hidden text-ink-muted" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={20} />
      </button>

      {showBackButton && (
        <button
          type="button"
          onClick={handleBack}
          className="w-9 h-9 rounded-md border border-line flex items-center justify-center text-ink-muted hover:bg-paper hover:text-ink transition-colors"
          aria-label="Go back to previous page"
          title="Go back"
        >
          <ArrowLeft size={17} />
        </button>
      )}

      <div className="hidden lg:block min-w-40">
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-muted">Current view</p>
        <p className="text-sm font-semibold text-ink whitespace-nowrap">{current?.label ?? "Qlyno"}</p>
      </div>

      <GlobalSearch />

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden md:inline-flex items-center gap-1.5 rounded-md border border-line bg-paper px-2.5 py-1.5 text-xs font-semibold text-ink-muted">
          {selectedWorkplace?.type === "hospital" ? <Hospital size={13} /> : <Building2 size={13} />}
          {selectedWorkplace
            ? `${selectedWorkplace.name}${selectedWorkplace.location ? ` - ${selectedWorkplace.location}` : ""}`
            : workContext}
        </span>
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen((v) => !v)}
            className="relative w-9 h-9 rounded-md border border-line flex items-center justify-center text-ink-muted hover:bg-paper transition-colors"
            aria-label="Open notifications"
            aria-expanded={notificationsOpen}
          >
            <Bell size={16} />
            {unacknowledged > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-alert-400 text-white text-[10px] font-semibold flex items-center justify-center">
                {unacknowledged}
              </span>
            )}
          </button>
          {notificationsOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotificationsOpen(false)} />
              <div className="absolute right-0 z-20 mt-1.5 w-80 max-w-[calc(100vw-2rem)] card p-1.5">
                <div className="flex items-center justify-between px-2.5 pb-1 pt-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
                    Notifications
                  </span>
                  <span className="text-[11px] font-medium text-ink-muted">
                    {unacknowledged} open
                  </span>
                </div>
                {unacknowledgedAlerts.length === 0 ? (
                  <div className="px-2.5 py-4 text-sm text-ink-muted">No new clinical alerts.</div>
                ) : (
                  unacknowledgedAlerts.slice(0, 4).map((alert) => {
                    const Icon = categoryIcon[alert.category];
                    const patient = alert.patientId ? getPatient(alert.patientId) : undefined;
                    return (
                      <button
                        key={alert.id}
                        type="button"
                        onClick={goToAlerts}
                        className="w-full flex items-start gap-2.5 rounded-md px-2.5 py-2 text-left hover:bg-brand-50 transition-colors"
                      >
                        <span
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                            alert.severity === "Critical"
                              ? "bg-alert-50 text-alert-500"
                              : alert.severity === "Warning"
                                ? "bg-clay-50 text-clay-600"
                                : "bg-brand-50 text-brand-600"
                          }`}
                        >
                          <Icon size={14} />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-semibold text-ink">
                            {patient ? patient.name : alert.category}
                          </span>
                          <span className="line-clamp-2 text-xs leading-5 text-ink-soft">{alert.message}</span>
                          <span className="mt-0.5 block text-[11px] text-ink-faint">{alert.time}</span>
                        </span>
                      </button>
                    );
                  })
                )}
                <div className="my-1 border-t border-line" />
                <button
                  type="button"
                  onClick={goToAlerts}
                  className="w-full rounded-md px-2.5 py-2 text-left text-[13px] font-semibold text-brand-700 hover:bg-brand-50 transition-colors"
                >
                  View all clinical alerts
                </button>
              </div>
            </>
          )}
        </div>
        <QuickActions />
        <button type="button" onClick={() => signOutToRoot(router.push)} className="btn-secondary hidden text-xs sm:inline-flex">
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </header>
  );
}
