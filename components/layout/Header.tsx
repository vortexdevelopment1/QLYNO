"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { BillingScope, SCOPE_LABELS } from "@/types";
import { SearchBar } from "@/components/ui/SearchBar";
import { NotificationPanel } from "@/components/billing/NotificationPanel";
import { QuickDailyCollectionModal } from "@/components/billing/QuickDailyCollectionModal";
import { formatINR } from "@/lib/utils";

const ORG_TYPE_LABEL: Record<string, string> = {
  solo_doctor: "Solo Doctor",
  clinic: "Clinic",
  hospital: "Hospital",
};

export function Header({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const { organizations, staffUsers, currentOrg, currentUser, currentScope, dispatch, patients, invoices, receipts } = useApp();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [dailyCollectionOpen, setDailyCollectionOpen] = useState(false);

  const orgStaff = staffUsers.filter((u) => u.organizationId === currentOrg.id);
  const showScopeSwitcher = currentOrg.type === "hospital" && currentUser.scopes.length > 1;

  function switchOrg(orgId: string) {
    const defaultUser = staffUsers.find((u) => u.organizationId === orgId && u.status === "active")!;
    dispatch({ type: "SET_ORG", orgId, userId: defaultUser.id, scope: defaultUser.scopes[0] ?? "central" });
  }

  function switchUser(userId: string) {
    const u = staffUsers.find((s) => s.id === userId)!;
    dispatch({ type: "SET_ORG", orgId: u.organizationId, userId: u.id, scope: u.scopes[0] ?? "central" });
  }

  function switchScope(scope: BillingScope) {
    dispatch({ type: "SET_SCOPE", scope });
  }

  const results = useMemo(() => {
    if (query.trim().length < 2) return null;
    const q = query.toLowerCase();

    const pt = patients.filter(
      (p) => p.organizationId === currentOrg.id && (p.name.toLowerCase().includes(q) || p.uhid.toLowerCase().includes(q) || p.phone.includes(q))
    );

    const inv = invoices.filter(
      (i) => i.organizationId === currentOrg.id && (i.invoiceNumber.toLowerCase().includes(q) || (i.outstanding > 0 && "outstanding".includes(q)))
    );

    const rc = receipts.filter(
      (r) => r.organizationId === currentOrg.id && (r.receiptNumber.toLowerCase().includes(q) || r.method.toLowerCase().includes(q))
    );

    return { pt: pt.slice(0, 4), inv: inv.slice(0, 4), rc: rc.slice(0, 4) };
  }, [query, patients, invoices, receipts, currentOrg.id]);

  const scopeDisplay = useMemo(() => {
    if (currentOrg.type !== "hospital") return "Standard Billing";
    if (currentScope === "central") return "Central Billing View";
    return SCOPE_LABELS[currentScope] ?? currentScope.toUpperCase();
  }, [currentOrg.type, currentScope]);

  const userPermissionText = useMemo(() => {
    const roleText = currentUser.role === "billing_admin" ? "Billing Admin" : "Billing Staff";
    const scopeText =
      currentUser.scopes.length === 0 || currentUser.scopes.includes("central")
        ? "Full Access"
        : SCOPE_LABELS[currentUser.scopes[0]] ?? currentUser.scopes[0].toUpperCase();
    return `${roleText} · ${scopeText}`;
  }, [currentUser]);

  return (
    <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="flex items-center justify-between gap-4 px-4 py-3 lg:px-6">

        {/* Left: Mobile Toggle & Organization Context */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileNav}
            aria-label="Open navigation"
            className="rounded-lg p-2 text-ink-600 hover:bg-ink-100 hover:text-ink-900 lg:hidden"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-bold text-ink-900">{currentOrg.name}</span>
              <span className="rounded-md bg-brand-50 border border-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-700 uppercase tracking-wider">
                {ORG_TYPE_LABEL[currentOrg.type]}
              </span>
            </div>
            <span className="text-xs font-medium text-ink-500">{currentOrg.city} · {scopeDisplay}</span>
          </div>
        </div>

        {/* Hospital Scope Switcher (Conditional) */}
        {showScopeSwitcher && (
          <div className="hidden items-center gap-2 border-l border-ink-100 pl-4 lg:flex">
            <label htmlFor="scope-select" className="text-xs font-semibold text-ink-600">Scope:</label>
            <select
              id="scope-select"
              value={currentScope}
              onChange={(e) => switchScope(e.target.value as BillingScope)}
              aria-label="Switch hospital billing scope"
              className="rounded-lg border border-brand-200 bg-brand-50/50 px-2.5 py-1 text-xs font-semibold text-brand-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            >
              {currentUser.scopes.map((s) => (
                <option key={s} value={s}>{SCOPE_LABELS[s]}</option>
              ))}
            </select>
          </div>
        )}

        {/* Center: Global Search Bar */}
        <div className="hidden max-w-md flex-1 md:block">
          <div className="relative">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search patient, UHID, invoice #, receipt #…"
              ariaLabel="Global billing search"
            />
            {results && (
              <div className="absolute left-0 right-0 top-full z-40 mt-1.5 max-h-96 overflow-y-auto rounded-xl border border-ink-100 bg-white p-2 shadow-2xl">
                {results.pt.length === 0 && results.inv.length === 0 && results.rc.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm font-medium text-ink-700">No records found for &ldquo;{query}&rdquo;</p>
                    <p className="text-xs text-ink-400 mt-1">Try searching by UHID, patient name, or invoice number.</p>
                  </div>
                ) : (
                  <>
                    {results.pt.length > 0 && (
                      <div className="mb-2">
                        <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-400">Patients ({results.pt.length})</p>
                        {results.pt.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => { router.push(`/patients/${p.id}`); setQuery(""); }}
                            className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm hover:bg-brand-50 transition-colors"
                          >
                            <span className="font-semibold text-ink-900">{p.name}</span>
                            <span className="font-mono text-xs text-ink-500">UHID: {p.uhid}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {results.inv.length > 0 && (
                      <div className="mb-2">
                        <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-400">Invoices ({results.inv.length})</p>
                        {results.inv.map((i) => (
                          <button
                            key={i.id}
                            onClick={() => { router.push(`/billing/invoices/${i.id}`); setQuery(""); }}
                            className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm hover:bg-brand-50 transition-colors"
                          >
                            <span className="font-mono font-medium text-brand-700">{i.invoiceNumber}</span>
                            <span className="font-mono text-xs font-semibold text-ink-900">{formatINR(i.total)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {results.rc.length > 0 && (
                      <div>
                        <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-400">Receipts ({results.rc.length})</p>
                        {results.rc.map((r) => (
                          <button
                            key={r.id}
                            onClick={() => { router.push(`/receipts/${r.id}`); setQuery(""); }}
                            className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm hover:bg-brand-50 transition-colors"
                          >
                            <span className="font-mono font-medium text-emerald-700">{r.receiptNumber}</span>
                            <span className="font-mono text-xs font-semibold text-ink-900">{formatINR(r.amount)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Utilities: Quick Action, Notifications, Help & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setDailyCollectionOpen(true)}
            title="Quick View Daily Collection"
            aria-label="Quick View Daily Collection"
            className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
          >
            <span className="font-mono font-black text-emerald-600">₹</span>
            <span>Daily</span>
          </button>

          {/* Notifications Bell */}
          <button
            type="button"
            onClick={() => setNotifOpen(true)}
            aria-label="Notifications"
            className="relative rounded-lg p-2 text-ink-600 hover:bg-ink-100 hover:text-ink-900 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-600 ring-2 ring-white" />
          </button>

          {/* Help Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setHelpOpen((v) => !v); setUserMenuOpen(false); }}
              aria-label="Help and support"
              className="rounded-lg p-2 text-ink-600 hover:bg-ink-100 hover:text-ink-900 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            {helpOpen && (
              <div role="dialog" aria-label="Help and support" className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-ink-100 bg-white p-4 text-left text-sm shadow-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-xs font-bold">?</div>
                  <p className="font-bold text-ink-900">Qlyno Support &amp; Rules</p>
                </div>
                <p className="text-xs text-ink-600 leading-relaxed">
                  Billing workflows, discount controls, refund approvals, and audit trails are managed within your organization policy.
                </p>
                <div className="mt-3 border-t border-ink-100 pt-2 text-[11px] text-ink-400">
                  Active context: <strong className="text-ink-700">{currentOrg.name}</strong> ({ORG_TYPE_LABEL[currentOrg.type]})
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Demo Switcher Popover */}
          <div className="relative border-l border-ink-100 pl-3">
            <button
              type="button"
              onClick={() => { setUserMenuOpen((v) => !v); setHelpOpen(false); }}
              className="flex items-center gap-2.5 rounded-lg p-1 text-left hover:bg-ink-50 transition-colors focus:outline-none"
            >
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold text-ink-900 leading-tight">{currentUser.name}</p>
                <p className="text-xs font-medium text-ink-500">{userPermissionText}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-brand-600 to-brand-500 text-sm font-bold text-white shadow-sm ring-2 ring-brand-100">
                {currentUser.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
            </button>

            {/* Profile & Demo Switcher Dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-ink-100 bg-white p-4 shadow-2xl">
                <div className="border-b border-ink-100 pb-3 mb-3">
                  <p className="font-bold text-ink-900">{currentUser.name}</p>
                  <p className="text-xs text-ink-500">{currentUser.email}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="rounded bg-brand-50 border border-brand-200 px-2 py-0.5 text-[11px] font-bold text-brand-700">
                      {currentUser.role === "billing_admin" ? "Billing Admin" : "Billing Staff"}
                    </span>
                    <span className="rounded bg-ink-100 px-2 py-0.5 text-[11px] font-medium text-ink-700">
                      {currentUser.scopes.length === 0 || currentUser.scopes.includes("central")
                        ? "Full Scope Access"
                        : SCOPE_LABELS[currentUser.scopes[0]] ?? currentUser.scopes[0].toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Demo Workspace Controls */}
                <div className="space-y-3 pt-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Demo Environment Controls</p>

                  <div>
                    <label htmlFor="demo-org-select" className="text-xs font-semibold text-ink-600 block mb-1">
                      Organization Context:
                    </label>
                    <select
                      id="demo-org-select"
                      value={currentOrg.id}
                      onChange={(e) => switchOrg(e.target.value)}
                      className="w-full rounded-lg border border-ink-200 bg-ink-50/50 px-2.5 py-1.5 text-xs font-medium text-ink-800 focus:border-brand-500 focus:bg-white"
                    >
                      {organizations.map((o) => (
                        <option key={o.id} value={o.id}>{o.name} ({ORG_TYPE_LABEL[o.type]})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="demo-user-select" className="text-xs font-semibold text-ink-600 block mb-1">
                      Active Staff User:
                    </label>
                    <select
                      id="demo-user-select"
                      value={currentUser.id}
                      onChange={(e) => switchUser(e.target.value)}
                      className="w-full rounded-lg border border-ink-200 bg-ink-50/50 px-2.5 py-1.5 text-xs font-medium text-ink-800 focus:border-brand-500 focus:bg-white"
                    >
                      {orgStaff.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role === "billing_admin" ? "Admin" : "Staff"} · {u.scopes.length ? u.scopes.map((s) => SCOPE_LABELS[s]).join(", ") : "Full Access"})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 border-t border-ink-100 pt-2 text-[10px] text-ink-400 text-center">
                  Switch users to test scope &amp; permission views
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
      <QuickDailyCollectionModal open={dailyCollectionOpen} onClose={() => setDailyCollectionOpen(false)} />
    </header>
  );
}
