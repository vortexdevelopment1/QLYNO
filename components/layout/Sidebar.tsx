"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { classNames } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  visible: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export function Sidebar({ mobileOpen, onCloseMobile }: { mobileOpen: boolean; onCloseMobile: () => void }) {
  const pathname = usePathname();
  const { currentOrg, currentUser } = useApp();
  const p = currentUser.permissions;
  const isAdminLike = currentUser.role === "billing_admin";

  const groups: NavGroup[] = [
    {
      title: "Overview",
      items: [{ href: "/dashboard", label: "Dashboard", icon: "▦", visible: true }],
    },
    {
      title: "Money In",
      items: [
        { href: "/billing/pending", label: "Pending Billing", icon: "◷", visible: p.viewBills },
        { href: "/billing/invoices", label: "Billing / Invoices", icon: "▤", visible: p.viewBills },
        { href: "/discharge", label: "Discharge Billing", icon: "⌂", visible: currentOrg.type === "hospital" && p.viewBills },
        { href: "/payments", label: "Payments", icon: "₹", visible: p.collectPayment },
        { href: "/outstanding", label: "Outstanding", icon: "!", visible: p.viewBills },
        { href: "/receipts", label: "Receipts", icon: "▥", visible: p.viewBills },
      ],
    },
    {
      title: "Money Back",
      items: [
        { href: "/refunds", label: "Refunds", icon: "↩", visible: p.requestRefund || p.approveRefund },
        { href: "/discounts", label: "Discounts / Approvals", icon: "%", visible: p.applyNormalDiscount || isAdminLike },
      ],
    },
    {
      title: "Clinical & Patients",
      items: [
        { href: "/patients", label: "Patients", icon: "☺", visible: true },
        { href: "/services", label: "Services", icon: "▧", visible: true },
      ],
    },
    {
      title: "Payer Services",
      items: [
        { href: "/insurance", label: "Insurance / TPA", icon: "◈", visible: currentOrg.insuranceEnabled && p.insuranceTpa },
      ],
    },
    {
      title: "Oversight & Intelligence",
      items: [
        { href: "/reports", label: "Reports", icon: "▲", visible: p.financialReports },
        { href: "/reconciliation", label: "Reconciliation", icon: "⇄", visible: p.reconciliation },
        { href: "/audit-logs", label: "Audit Logs", icon: "≡", visible: true },
        { href: "/ai-assistant", label: "AI Billing Assistant", icon: "✦", visible: true },
      ],
    },
    {
      title: "Administration",
      items: [
        { href: "/notifications", label: "Notifications", icon: "◔", visible: true },
        { href: "/staff", label: "Staff / Assignments", icon: "♟", visible: true },
        { href: "/settings", label: "Settings", icon: "⚙", visible: true },
      ],
    },
  ];

  const content = (
    <nav aria-label="Primary" className="flex min-h-full flex-col bg-white text-ink-800">
      {/* Brand Shell Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-ink-100 bg-gradient-to-r from-brand-50/50 via-white to-white">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 text-base font-black text-white shadow-sm ring-2 ring-brand-100">
          Q
        </div>
        <div>
          <p className="text-sm font-bold text-ink-900 tracking-tight">Qlyno Billing</p>
          <p className="text-[11px] font-semibold text-brand-600">Healthcare Staff Portal</p>
        </div>
      </div>

      {/* Grouped Navigation */}
      <div className="flex-1 space-y-5 px-3 py-4 overflow-y-auto no-scrollbar">
        {groups.map((group) => {
          const visibleItems = group.items.filter((i) => i.visible);
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-ink-400">
                {group.title}
              </p>
              <ul className="space-y-0.5">
                {visibleItems.map((item) => {
                  const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onCloseMobile}
                        aria-current={active ? "page" : undefined}
                        className={classNames(
                          "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-xs transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400",
                          active
                            ? "bg-brand-50 text-brand-700 font-bold border-l-4 border-brand-600 shadow-2xs"
                            : "text-ink-600 font-medium hover:bg-brand-50/60 hover:text-brand-700"
                        )}
                      >
                        <span
                          className={classNames(
                            "w-4 text-center text-xs transition-colors",
                            active ? "text-brand-600 font-bold" : "text-ink-400 group-hover:text-brand-600"
                          )}
                          aria-hidden="true"
                        >
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Footer System Status */}
      <div className="mt-auto border-t border-ink-100 bg-ink-50/60 px-4 py-3 text-[11px] text-ink-500">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-ink-800">Qlyno Engine v1.0</span>
        </div>
        <p className="mt-0.5 text-[10px] text-ink-400">Scoped healthcare fintech workspace</p>
      </div>
    </nav>
  );

  return (
    <>
      <div className="hidden w-64 shrink-0 lg:flex lg:flex-col lg:sticky lg:top-0 lg:h-screen lg:max-h-screen lg:overflow-y-auto no-scrollbar border-r border-ink-200/80 bg-white">
        {content}
      </div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="w-64 max-h-screen overflow-y-auto no-scrollbar shadow-2xl bg-white border-r border-ink-200">{content}</div>
          <div className="flex-1 bg-ink-900/30 backdrop-blur-xs" onClick={onCloseMobile} />
        </div>
      )}
    </>
  );
}
