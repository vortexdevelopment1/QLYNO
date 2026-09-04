"use client";

import { useState } from "react";

import { SidebarNav } from "@/hospital-admin/components/layout/sidebar";
import { Topbar } from "@/hospital-admin/components/layout/topbar";
import { RouteRoleGuard } from "@/hospital-admin/components/nursing/route-role-guard";
import { Providers } from "@/hospital-admin/store/provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isPinned, setIsPinned] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const collapsed = !isPinned && !isHovered;

  return (
    <Providers>
      <div className="flex min-h-screen bg-background print:bg-white print:min-h-0">
        <aside
          className="hidden shrink-0 border-r border-sidebar-border lg:block transition-[width] duration-300 ease-out print:hidden"
          style={{ width: collapsed ? 78 : 248 }}
          onMouseEnter={() => !isPinned && setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            className="fixed h-screen transition-[width] duration-300 ease-out print:hidden"
            style={{ width: collapsed ? 78 : 248 }}
          >
            <SidebarNav
              collapsed={collapsed}
              onToggleCollapse={() => {
                setIsPinned((prev) => !prev);
                setIsHovered(false);
              }}
            />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col print:w-full print:p-0">
          <Topbar />

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 print:p-0 print:m-0 print:w-full">
            <div className="mx-auto max-w-[1600px] print:max-w-none print:w-full print:p-0">
              <RouteRoleGuard>{children}</RouteRoleGuard>
            </div>
          </main>
        </div>
      </div>
    </Providers>
  );
}
