"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useDemo } from "@/state/demo-context";
import ProviderAppShell from "@/components/provider-layout/AppShell";

const providerShellPrefixes = ["/doctor", "/clinic", "/book", "/discover", "/clinics", "/doctors", "/sign-in"];
const selfManagedShellPrefixes = ["/billing-staff", "/hospital-admin", "/receptionist"];

function startsWithAny(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, sessionReady } = useDemo();
  const isProviderShellRoute = startsWithAny(pathname, providerShellPrefixes);
  const isSelfManagedShellRoute = startsWithAny(pathname, selfManagedShellPrefixes);

  useEffect(() => {
    if (isProviderShellRoute || isSelfManagedShellRoute) return;
    if (sessionReady && !session && pathname !== "/login") router.replace("/login");
    const legacyLabManagementRoutes: Record<string, string> = {
      "/administration/users": "/lab-management/team",
      "/administration/roles": "/lab-management/roles",
      "/administration/organization": "/lab-management/access-scope",
      "/administration/audit-log": "/lab-management/audit",
    };
    if (legacyLabManagementRoutes[pathname]) router.replace(legacyLabManagementRoutes[pathname]);
  }, [isProviderShellRoute, isSelfManagedShellRoute, session, sessionReady, pathname, router]);

  if (isProviderShellRoute) return <ProviderAppShell>{children}</ProviderAppShell>;
  if (isSelfManagedShellRoute) return <>{children}</>;
  if (pathname === "/login") return <>{children}</>;
  if (!sessionReady || !session) return <div className="flex min-h-screen items-center justify-center bg-app-bg text-sm text-text-muted">Loading laboratory workspace...</div>;

  return (
    <div className="flex min-h-[100dvh] bg-app-bg">
      <Sidebar />
      <div className="flex min-h-[100dvh] min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="min-w-0 flex-1 px-4 py-7 sm:px-7 lg:px-9 lg:py-8">
          <div className="mx-auto w-full max-w-[1480px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
