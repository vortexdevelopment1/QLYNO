"use client";

import { ShieldX } from "lucide-react";
import { useDemo } from "@/state/demo-context";
import { canManageLabUsers } from "@/lib/laboratory-permissions";

export default function LabManagementLayout({ children }: { children: React.ReactNode }) {
  const { session } = useDemo();
  if (!session || !canManageLabUsers(session)) return <div className="flex min-h-[55vh] flex-col items-center justify-center rounded-card border border-app-border bg-app-surface p-8 text-center"><ShieldX className="h-9 w-9 text-status-critical" /><h1 className="mt-4 font-display text-2xl font-semibold">Access denied</h1><p className="mt-2 max-w-md text-sm text-text-muted">Lab Management is available only to delegated Hospital Admins, Lab Owners and Lab Admins. Administrative access does not grant clinical authorization.</p></div>;
  return <>{children}</>;
}
