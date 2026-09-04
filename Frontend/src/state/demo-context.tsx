"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { RoleId, TenantMode } from "@/lib/types/domain";
import type { LaboratorySession, LoginCredentials } from "@/lib/types/laboratory-session";
import { authenticateDemo } from "@/data/mock/laboratory-sessions";
import { ROLE_CONFIG } from "@/config/roles";

interface DemoState {
  session: LaboratorySession | null;
  sessionReady: boolean;
  login: (credentials: LoginCredentials, remember: boolean) => Promise<boolean>;
  logout: () => void;
  tenantMode: TenantMode; setTenantMode: (m: TenantMode) => void;
  roleId: RoleId; setRoleId: (r: RoleId) => void;
  siteId: string; setSiteId: (s: string) => void;
  sidebarCollapsed: boolean; setSidebarCollapsed: (b: boolean) => void;
  mobileNavOpen: boolean; setMobileNavOpen: (b: boolean) => void;
  billingEnabled: boolean;
}

const STORAGE_KEY = "qlyno-laboratory-session-v1";
const DemoContext = createContext<DemoState | null>(null);

function modeFromSession(session: LaboratorySession | null): TenantMode {
  if (session?.laboratoryProfile === "STANDALONE_PRIVATE") return "standalone";
  if (session?.laboratoryProfile === "REFERENCE_B2B") return "b2b";
  return "hospital";
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<LaboratorySession | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY) ?? window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as LaboratorySession;
        const permissions = new Set(parsed.permissions ?? []);
        if (parsed.userId === "USR-01" && parsed.tenantId === "TEN-SUNRISE") { permissions.add("specimen.view"); permissions.add("specimen.receive"); }
        const migrated = { ...parsed, permissions: Array.from(permissions), administrativeRoles: parsed.administrativeRoles ?? [], laboratoryRoles: parsed.laboratoryRoles ?? [] };
        setSession(migrated);
        if (window.localStorage.getItem(STORAGE_KEY)) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        if (window.sessionStorage.getItem(STORAGE_KEY)) window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      }
    } catch { /* ignore corrupt prototype storage */ }
    setSessionReady(true);
  }, []);

  async function login(credentials: LoginCredentials, remember: boolean) {
    await new Promise((resolve) => setTimeout(resolve, 650));
    const authenticated = authenticateDemo(credentials);
    if (!authenticated) return false;
    setSession(authenticated);
    const storage = remember ? window.localStorage : window.sessionStorage;
    storage.setItem(STORAGE_KEY, JSON.stringify(authenticated));
    (remember ? window.sessionStorage : window.localStorage).removeItem(STORAGE_KEY);
    return true;
  }

  function logout() {
    setSession(null);
    window.localStorage.removeItem(STORAGE_KEY);
    window.sessionStorage.removeItem(STORAGE_KEY);
  }

  const tenantMode = modeFromSession(session);
  const roleId = session?.role ?? "lab_director";
  const siteId = session?.activeSiteId ?? "SITE-01";
  const billingEnabled = session?.billingOwner === "LIS_INTERNAL" || session?.billingOwner === "B2B_CONTRACT";
  const noop = () => undefined;

  const value = useMemo(() => ({ session, sessionReady, login, logout, tenantMode, setTenantMode: noop, roleId, setRoleId: noop, siteId, setSiteId: noop, sidebarCollapsed, setSidebarCollapsed, mobileNavOpen, setMobileNavOpen, billingEnabled }), [session, sessionReady, tenantMode, roleId, siteId, sidebarCollapsed, mobileNavOpen, billingEnabled]);
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within DemoProvider");
  return ctx;
}

export function useCurrentRole() { return ROLE_CONFIG[useDemo().roleId]; }
