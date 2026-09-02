"use client";

import { useMemo, useState, useRef, useEffect } from "react";
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
  const {
    organizations,
    staffUsers,
    currentOrg,
    currentUser,
    currentScope,
    dispatch,
    patients,
    invoices,
    receipts,
    insuranceClaims,
    payers,
    serviceCatalog,
  } = useApp();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [dailyCollectionOpen, setDailyCollectionOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const orgStaff = staffUsers.filter((u) => u.organizationId === currentOrg.id);
  const showScopeSwitcher = currentOrg.type === "hospital" && currentUser.scopes.length > 1;

  // Global hotkey Ctrl+K / Cmd+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        // Keep query, but click outside will be handled by container
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    const q = query.trim().toLowerCase();

    // 1. Patients matching name, UHID, phone, email, address
    const pt = patients.filter(
      (p) =>
        p.organizationId === currentOrg.id &&
        (p.name.toLowerCase().includes(q) ||
          p.uhid.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          (p.email && p.email.toLowerCase().includes(q)) ||
          (p.address && p.address.toLowerCase().includes(q)))
    );

    // 2. Invoices matching invoice number, patient name, status, payer, items
    const inv = invoices.filter((i) => {
      if (i.organizationId !== currentOrg.id) return false;
      if (i.invoiceNumber.toLowerCase().includes(q)) return true;
      if (i.status.toLowerCase().includes(q)) return true;
      if (q === "outstanding" && i.outstanding > 0) return true;
      if (q === "paid" && i.status === "paid") return true;
      const patient = patients.find((p) => p.id === i.patientId);
      if (patient && (patient.name.toLowerCase().includes(q) || patient.uhid.toLowerCase().includes(q))) return true;
      const payer = payers.find((p) => p.id === i.payerId);
      if (payer && payer.name.toLowerCase().includes(q)) return true;
      if (i.items.some((item) => item.description.toLowerCase().includes(q))) return true;
      return false;
    });

    // 3. Receipts matching receipt number, payment method, reference, patient, invoice
    const rc = receipts.filter((r) => {
      if (r.organizationId !== currentOrg.id) return false;
      if (r.receiptNumber.toLowerCase().includes(q)) return true;
      if (r.method.toLowerCase().includes(q)) return true;
      if (r.referenceNumber && r.referenceNumber.toLowerCase().includes(q)) return true;
      const invoice = invoices.find((i) => i.id === r.invoiceId);
      if (invoice) {
        if (invoice.invoiceNumber.toLowerCase().includes(q)) return true;
        const patient = patients.find((p) => p.id === invoice.patientId);
        if (patient && (patient.name.toLowerCase().includes(q) || patient.uhid.toLowerCase().includes(q))) return true;
      }
      return false;
    });

    // 4. Insurance Claims matching claim id, policy number, preauth number, payer name, status
    const cl = insuranceClaims.filter((c) => {
      if (c.organizationId !== currentOrg.id) return false;
      if (c.id.toLowerCase().includes(q)) return true;
      if (c.policyNumber.toLowerCase().includes(q)) return true;
      if (c.preAuthNumber && c.preAuthNumber.toLowerCase().includes(q)) return true;
      if (c.status.toLowerCase().includes(q)) return true;
      const payer = payers.find((p) => p.id === c.payerId);
      if (payer && payer.name.toLowerCase().includes(q)) return true;
      return false;
    });

    // 5. Service Catalog matching name, category, service code
    const sc = serviceCatalog.filter(
      (s) =>
        s.organizationId === currentOrg.id &&
        (s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          (s.code && s.code.toLowerCase().includes(q)))
    );

    const totalCount = pt.length + inv.length + rc.length + cl.length + sc.length;

    return {
      pt: pt.slice(0, 4),
      inv: inv.slice(0, 4),
      rc: rc.slice(0, 4),
      cl: cl.slice(0, 4),
      sc: sc.slice(0, 4),
      totalCount,
    };
  }, [query, patients, invoices, receipts, insuranceClaims, serviceCatalog, payers, currentOrg.id]);

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

  function renderSearchResults(isMobile = false) {
    if (!results) return null;
    if (results.totalCount === 0) {
      return (
        <div className="px-4 py-6 text-center">
          <p className="text-sm font-medium text-ink-700">No records found for &ldquo;{query}&rdquo;</p>
          <p className="text-xs text-ink-400 mt-1">
            Try searching by patient name, UHID, invoice #, receipt #, policy #, or service name.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3 p-1">
        {/* Patients */}
        {results.pt.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Patients</span>
              <span className="text-[10px] font-semibold text-brand-600">{results.pt.length} found</span>
            </div>
            {results.pt.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  router.push(`/patients/${p.id}`);
                  setQuery("");
                  if (isMobile) setMobileSearchOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs hover:bg-brand-50 transition-colors"
              >
                <div>
                  <p className="font-semibold text-ink-900">{p.name}</p>
                  <p className="text-[11px] text-ink-400">{p.phone} · {p.address || "No address"}</p>
                </div>
                <span className="font-mono text-xs font-medium text-ink-600 bg-ink-100/70 px-1.5 py-0.5 rounded">
                  UHID: {p.uhid}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Invoices */}
        {results.inv.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-2 py-1 border-t border-ink-50 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Invoices</span>
              <span className="text-[10px] font-semibold text-brand-600">{results.inv.length} found</span>
            </div>
            {results.inv.map((i) => {
              const pt = patients.find((p) => p.id === i.patientId);
              return (
                <button
                  key={i.id}
                  onClick={() => {
                    router.push(`/billing/invoices/${i.id}`);
                    setQuery("");
                    if (isMobile) setMobileSearchOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs hover:bg-brand-50 transition-colors"
                >
                  <div>
                    <span className="font-mono font-bold text-brand-700">{i.invoiceNumber}</span>
                    <span className="text-ink-500 ml-2">({pt?.name || "Patient"})</span>
                    <span
                      className={`ml-2 text-[10px] font-semibold px-1.5 py-0.2 rounded uppercase ${
                        i.status === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      {i.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-ink-900 block">{formatINR(i.total)}</span>
                    {i.outstanding > 0 && (
                      <span className="text-[10px] font-medium text-red-600 block">Due: {formatINR(i.outstanding)}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Receipts */}
        {results.rc.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-2 py-1 border-t border-ink-50 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Receipts &amp; Payments</span>
              <span className="text-[10px] font-semibold text-emerald-600">{results.rc.length} found</span>
            </div>
            {results.rc.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  router.push(`/receipts/${r.id}`);
                  setQuery("");
                  if (isMobile) setMobileSearchOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs hover:bg-emerald-50/60 transition-colors"
              >
                <div>
                  <span className="font-mono font-bold text-emerald-700">{r.receiptNumber}</span>
                  <span className="text-ink-500 ml-2">via {r.method}</span>
                  {r.referenceNumber && <span className="text-[10px] text-ink-400 ml-1">({r.referenceNumber})</span>}
                </div>
                <span className="font-mono text-xs font-bold text-ink-900">{formatINR(r.amount)}</span>
              </button>
            ))}
          </div>
        )}

        {/* Insurance Claims */}
        {results.cl.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-2 py-1 border-t border-ink-50 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Insurance &amp; TPA Claims</span>
              <span className="text-[10px] font-semibold text-indigo-600">{results.cl.length} found</span>
            </div>
            {results.cl.map((c) => {
              const payer = payers.find((p) => p.id === c.payerId);
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    router.push(`/insurance`);
                    setQuery("");
                    if (isMobile) setMobileSearchOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs hover:bg-indigo-50/60 transition-colors"
                >
                  <div>
                    <span className="font-semibold text-indigo-900">{payer?.name || "TPA Payer"}</span>
                    <span className="text-[11px] text-ink-500 ml-2">Pol: {c.policyNumber}</span>
                    {c.preAuthNumber && <span className="text-[10px] text-indigo-700 ml-1 font-mono">PA: {c.preAuthNumber}</span>}
                  </div>
                  <span className="font-mono text-xs font-bold text-ink-900">{formatINR(c.claimedAmount)}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Services */}
        {results.sc.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-2 py-1 border-t border-ink-50 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Services Catalog</span>
              <span className="text-[10px] font-semibold text-amber-700">{results.sc.length} found</span>
            </div>
            {results.sc.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  router.push(`/settings`);
                  setQuery("");
                  if (isMobile) setMobileSearchOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs hover:bg-amber-50/60 transition-colors"
              >
                <div>
                  <span className="font-semibold text-ink-900">{s.name}</span>
                  <span className="text-[10px] text-ink-400 ml-2">({s.category})</span>
                </div>
                <span className="font-mono text-xs font-semibold text-ink-900">{formatINR(s.unitRate)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="flex items-center justify-between gap-1.5 px-2.5 py-2 sm:gap-2 sm:px-4 sm:py-3 lg:px-6">

        {/* Left: Mobile Toggle & Organization Context */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={onOpenMobileNav}
            aria-label="Open navigation"
            className="rounded-lg p-1.5 text-ink-600 hover:bg-ink-100 hover:text-ink-900 lg:hidden shrink-0"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex flex-col min-w-0 flex-1 pr-1 sm:pr-0">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="text-xs sm:text-sm font-bold text-ink-900 leading-tight truncate">
                {currentOrg.name}
              </span>
              <span className="rounded-md bg-brand-50 border border-brand-100 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold text-brand-700 uppercase tracking-wider shrink-0">
                {ORG_TYPE_LABEL[currentOrg.type]}
              </span>
            </div>
            <span className="truncate text-[10px] sm:text-xs font-medium text-ink-500 leading-tight mt-0.5">
              {currentOrg.city} · {scopeDisplay}
            </span>
          </div>
        </div>

        {/* Hospital Scope Switcher (Desktop) */}
        {showScopeSwitcher && (
          <div className="hidden items-center gap-2 border-l border-ink-100 pl-4 lg:flex">
            <label htmlFor="scope-select-desktop" className="text-xs font-semibold text-ink-600">Scope:</label>
            <select
              id="scope-select-desktop"
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

        {/* Center: Global Search Bar (Desktop) */}
        <div ref={searchContainerRef} className="hidden max-w-md flex-1 md:block">
          <div className="relative">
            <SearchBar
              inputRef={searchInputRef}
              value={query}
              onChange={setQuery}
              placeholder="Search patient, UHID, invoice #, receipt #, policy #…"
              ariaLabel="Global billing search"
            />
            {results && (
              <div className="absolute left-0 right-0 top-full z-40 mt-1.5 max-h-96 overflow-y-auto rounded-xl border border-ink-100 bg-white p-2 shadow-2xl">
                {renderSearchResults(false)}
              </div>
            )}
          </div>
        </div>

        {/* Right Utilities */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Mobile Search Button */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen((v) => !v)}
            aria-label="Search"
            className="rounded-lg p-1.5 text-ink-600 hover:bg-ink-100 hover:text-ink-900 md:hidden transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => setDailyCollectionOpen(true)}
            title="Quick View Daily Collection"
            aria-label="Quick View Daily Collection"
            className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 sm:px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
          >
            <span className="font-mono font-black text-emerald-600">₹</span>
            <span className="hidden sm:inline">Daily</span>
          </button>

          {/* Notifications Bell */}
          <button
            type="button"
            onClick={() => setNotifOpen(true)}
            aria-label="Notifications"
            className="relative rounded-lg p-1.5 sm:p-2 text-ink-600 hover:bg-ink-100 hover:text-ink-900 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute right-1 top-1 sm:right-1.5 sm:top-1.5 h-2 w-2 rounded-full bg-brand-600 ring-2 ring-white" />
          </button>

          {/* Help Popover */}
          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => { setHelpOpen((v) => !v); setUserMenuOpen(false); }}
              aria-label="Help and support"
              className="rounded-lg p-1.5 sm:p-2 text-ink-600 hover:bg-ink-100 hover:text-ink-900 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            {helpOpen && (
              <div role="dialog" aria-label="Help and support" className="absolute right-0 top-full z-50 mt-2 w-[calc(100vw-1.5rem)] sm:w-72 max-w-xs rounded-xl border border-ink-100 bg-white p-4 text-left text-sm shadow-2xl">
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

          {/* User Profile */}
          <div className="relative border-l border-ink-100 pl-1.5 sm:pl-3">
            <button
              type="button"
              onClick={() => { setUserMenuOpen((v) => !v); setHelpOpen(false); }}
              className="flex items-center gap-2 rounded-lg p-0.5 sm:p-1 text-left hover:bg-ink-50 transition-colors focus:outline-none"
            >
              <div className="hidden text-right md:block">
                <p className="text-xs sm:text-sm font-bold text-ink-900 leading-tight">{currentUser.name}</p>
                <p className="text-[11px] font-medium text-ink-500">{userPermissionText}</p>
              </div>
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 items-center justify-center rounded-full bg-gradient-to-tr from-brand-600 to-brand-500 text-xs sm:text-sm font-bold text-white shadow-sm ring-2 ring-brand-100 shrink-0">
                {currentUser.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-[calc(100vw-1.5rem)] sm:w-80 max-w-sm rounded-2xl border border-ink-100 bg-white p-4 shadow-2xl">
                <div className="border-b border-ink-100 pb-3 mb-3">
                  <p className="font-bold text-ink-900">{currentUser.name}</p>
                  <p className="text-xs text-ink-500">{currentUser.email}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
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

                <div className="mb-3 border-b border-ink-100 pb-3 sm:hidden">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-ink-900 mb-1">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-[10px]">?</span>
                    <span>Qlyno Rules &amp; Support</span>
                  </div>
                  <p className="text-[11px] text-ink-500 leading-relaxed">
                    Billing workflows, discount caps, refund approvals, and audit trails are managed within organization policy.
                  </p>
                </div>

                {showScopeSwitcher && (
                  <div className="mb-3 border-b border-ink-100 pb-3 lg:hidden">
                    <label htmlFor="scope-select-mobile" className="text-xs font-semibold text-ink-600 block mb-1">
                      Billing Scope Context:
                    </label>
                    <select
                      id="scope-select-mobile"
                      value={currentScope}
                      onChange={(e) => switchScope(e.target.value as BillingScope)}
                      className="w-full rounded-lg border border-brand-200 bg-brand-50/50 px-2.5 py-1.5 text-xs font-semibold text-brand-900 focus:border-brand-500"
                    >
                      {currentUser.scopes.map((s) => (
                        <option key={s} value={s}>{SCOPE_LABELS[s]}</option>
                      ))}
                    </select>
                  </div>
                )}

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

      {/* Mobile Search Overlay */}
      {mobileSearchOpen && (
        <div className="border-t border-ink-100 bg-white p-3 md:hidden animate-in slide-in-from-top-2 duration-150">
          <div className="relative">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search patient, UHID, invoice #, receipt #, policy #…"
              ariaLabel="Mobile global billing search"
            />
            {results && (
              <div className="mt-2 max-h-80 overflow-y-auto rounded-xl border border-ink-100 bg-white p-2 shadow-xl">
                {renderSearchResults(true)}
              </div>
            )}
          </div>
        </div>
      )}

      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
      <QuickDailyCollectionModal open={dailyCollectionOpen} onClose={() => setDailyCollectionOpen(false)} />
    </header>
  );
}
