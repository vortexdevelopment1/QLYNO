"use client";

import React, { useState } from "react";
import { mockNurses } from "@/hospital-admin/lib/mock/nursing";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { PermissionMatrix } from "@/hospital-admin/components/permissions/PermissionMatrix";
import { AdminPermissionMatrixView } from "@/hospital-admin/components/security/admin-permission-matrix-view";
import { ShieldCheck, Users } from "lucide-react";

import { RoleGate } from "@/hospital-admin/components/nursing/role-gate";

export default function StaffPermissionsPage() {
  const [activeTab, setActiveTab] = useState<"staff" | "admin_matrix">("staff");

  return (
    <RoleGate
      allowed={["admin"]}
      message="Staff and role permissions configuration is strictly restricted to Hospital Admin (PRD Section 12)."
    >
      <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff &amp; Role Permissions</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Configure delegated station-scoped access and audit canonical hospital authorization boundaries.
          </p>
        </div>
        <ScopeIndicator scope="Hospital Admin" />
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab("staff")}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === "staff"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          Station-Scoped Staff Access
        </button>
        <button
          onClick={() => setActiveTab("admin_matrix")}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === "admin_matrix"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Admin Permission Matrix
        </button>
      </div>

      {activeTab === "staff" ? (
        <div className="bg-background p-6 rounded-md border shadow-xs">
          <PermissionMatrix staffList={mockNurses} />
        </div>
      ) : (
        <AdminPermissionMatrixView />
      )}
    </div>
  </RoleGate>
);
}
