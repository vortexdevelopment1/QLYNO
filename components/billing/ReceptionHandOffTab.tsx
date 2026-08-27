"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { formatINR } from "@/lib/utils";

interface HandOffEvent {
  id: string;
  eventName: string;
  receptionRole: string;
  billingStaffRole: string;
  status: "active" | "completed" | "pending";
  patientName: string;
  uhid: string;
  actionUrl: string;
  actionLabel: string;
}

export function ReceptionHandOffTab() {
  const { currentOrg, pendingBillingItems, patients, invoices } = useApp();

  const orgPending = pendingBillingItems.filter(
    (p) => p.organizationId === currentOrg.id && p.status === "pending"
  );
  const orgInvoices = invoices.filter(
    (i) => i.organizationId === currentOrg.id && (i.status === "issued" || i.status === "partially_paid")
  );

  const events: HandOffEvent[] = [
    {
      id: "ev-1",
      eventName: "Patient Arrives",
      receptionRole: "Check-in patient and register visit in HMS",
      billingStaffRole: "View billable status & insurance pre-verification where permitted",
      status: "active",
      patientName: patients[0]?.name ?? "Ananya Verma",
      uhid: patients[0]?.uhid ?? "UHID-1001",
      actionUrl: `/patients/${patients[0]?.id ?? "p-1"}`,
      actionLabel: "View Billable Status",
    },
    {
      id: "ev-2",
      eventName: "Consultation / Service Complete",
      receptionRole: "Coordinate next step with patient & clinical department",
      billingStaffRole: "Receive billable item & generate/verify bill",
      status: orgPending.length > 0 ? "active" : "completed",
      patientName: orgPending[0] ? (patients.find((p) => p.id === orgPending[0].patientId)?.name ?? "Patient") : "Vikram Mehta",
      uhid: orgPending[0] ? (patients.find((p) => p.id === orgPending[0].patientId)?.uhid ?? "UHID-1002") : "UHID-1002",
      actionUrl: "/billing/pending",
      actionLabel: "Generate / Verify Bill",
    },
    {
      id: "ev-3",
      eventName: "Payment Due",
      receptionRole: "Direct patient to Billing Staff counter",
      billingStaffRole: "Collect full, partial or approved payment",
      status: orgInvoices.length > 0 ? "active" : "pending",
      patientName: orgInvoices[0] ? (patients.find((p) => p.id === orgInvoices[0].patientId)?.name ?? "Patient") : "Priya Nair",
      uhid: orgInvoices[0] ? (patients.find((p) => p.id === orgInvoices[0].patientId)?.uhid ?? "UHID-1003") : "UHID-1003",
      actionUrl: "/payments",
      actionLabel: `Collect Payment (${orgInvoices[0] ? formatINR(orgInvoices[0].outstanding) : "Pending"})`,
    },
    {
      id: "ev-4",
      eventName: "Payment Complete",
      receptionRole: "Continue clinical/discharge workflow",
      billingStaffRole: "Issue receipt & send WhatsApp confirmation",
      status: "completed",
      patientName: patients[1]?.name ?? "Rajesh Kumar",
      uhid: patients[1]?.uhid ?? "UHID-1004",
      actionUrl: "/receipts",
      actionLabel: "Issue / View Receipt",
    },
    {
      id: "ev-5",
      eventName: "Follow-up Scheduled",
      receptionRole: "Book appointment & assign doctor schedule",
      billingStaffRole: "Apply configured service charge if applicable",
      status: "pending",
      patientName: patients[2]?.name ?? "Sunita Sharma",
      uhid: patients[2]?.uhid ?? "UHID-1005",
      actionUrl: "/services",
      actionLabel: "Verify Charge Rules",
    },
    {
      id: "ev-6",
      eventName: "Refund Request",
      receptionRole: "Route patient to Billing Desk for billing adjustments",
      billingStaffRole: "Create/process refund according to permission limits",
      status: "pending",
      patientName: "Deepak Joshi",
      uhid: "UHID-1006",
      actionUrl: "/refunds",
      actionLabel: "Process Refund Request",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-4 text-xs text-brand-900">
        <p className="font-semibold text-brand-900">PRD Section 19 — Reception + Billing Staff Coordination Matrix</p>
        <p className="mt-1 text-brand-700">
          Reception and Billing are separate staff roles sharing the same organization workflow. Billing Staff consumes billable events handed off by Reception and clinical departments.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {events.map((ev) => (
          <div key={ev.id} className="rounded-xl border border-ink-100 bg-white p-4 shadow-card">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                {ev.eventName}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  ev.status === "active"
                    ? "bg-amber-100 text-amber-800"
                    : ev.status === "completed"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-ink-100 text-ink-600"
                }`}
              >
                {ev.status.toUpperCase()}
              </span>
            </div>

            <div className="mb-3 space-y-1 rounded-lg bg-ink-50 p-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-ink-500">Reception Action:</span>
                <span className="font-medium text-ink-800 text-right">{ev.receptionRole}</span>
              </div>
              <div className="flex justify-between border-t border-ink-200/60 pt-1">
                <span className="text-brand-700 font-medium">Billing Staff Action:</span>
                <span className="font-medium text-ink-900 text-right">{ev.billingStaffRole}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-xs font-semibold text-ink-800">{ev.patientName}</p>
                <p className="text-[11px] text-ink-400">{ev.uhid}</p>
              </div>
              <Link
                href={ev.actionUrl}
                className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700"
              >
                {ev.actionLabel} →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
