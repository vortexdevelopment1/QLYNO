"use client";

import React from "react";
import { RoleGate } from "@/hospital-admin/components/nursing/role-gate";

export default function WardsBedsLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate
      allowed={["admin", "nurse_lead", "senior_nurse"]}
      message="Hospital-wide Wards and Beds configuration, interactive bed map, and bed transfer desks are restricted to Hospital Admin and Nurse Station Leads (PRD Section 12 & Section 20). Bedside staff nurses manage their assigned beds directly from their Bedside Workspace."
    >
      {children}
    </RoleGate>
  );
}
