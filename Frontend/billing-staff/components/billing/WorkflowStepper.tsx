"use client";

import React from "react";
import { InvoiceStatus } from "@/billing-staff/types";

const STEPS = [
  { step: 1, title: "Service Created", desc: "Consultation / procedure recorded" },
  { step: 2, title: "Billable Item Received", desc: "Pending charge visible to staff" },
  { step: 3, title: "Patient Identified", desc: "Linked to UHID & encounter" },
  { step: 4, title: "Price Applied", desc: "Configured tariff/rate applied" },
  { step: 5, title: "Discount/Insurance", desc: "Rule-based discount / TPA rules" },
  { step: 6, title: "Invoice Generated", desc: "Unique invoice # created" },
  { step: 7, title: "Payment Recorded", desc: "Full, partial or approved payment" },
  { step: 8, title: "Receipt Issued", desc: "Proof of payment generated" },
  { step: 9, title: "Outstanding Tracked", desc: "Remaining balance tracked" },
  { step: 10, title: "Settled", desc: "Invoice settled when balance is zero" },
  { step: 11, title: "Notification Sent", desc: "WhatsApp communication sent" },
  { step: 12, title: "Audited", desc: "Action logged in audit trail" },
];

export function determineActiveStep(status: InvoiceStatus): number {
  switch (status) {
    case "draft":
      return 5;
    case "issued":
      return 6;
    case "partially_paid":
      return 7;
    case "paid":
      return 10;
    case "cancelled":
      return 12;
    case "refunded":
      return 12;
    case "adjusted":
      return 12;
    default:
      return 6;
  }
}

export function WorkflowStepper({ status }: { status: InvoiceStatus }) {
  const currentStep = determineActiveStep(status);

  return (
    <div className="rounded-xl border border-ink-100 bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between border-b border-ink-100 pb-2">
        <h3 id="workflow-stepper-heading" className="text-xs font-bold uppercase tracking-wider text-ink-500">
          12-Step Billing Lifecycle
        </h3>
        <span className="text-xs font-semibold text-brand-600">
          Step {currentStep} of 12 ({STEPS[currentStep - 1]?.title})
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {STEPS.map((s) => {
          const isDone = s.step <= currentStep;
          const isCurrent = s.step === currentStep;

          return (
            <div
              key={s.step}
              className={`rounded-lg p-1.5 sm:p-2 text-xs border min-w-0 ${
                isCurrent
                  ? "border-brand-500 bg-brand-50/80 text-brand-900 ring-2 ring-brand-100"
                  : isDone
                  ? "border-emerald-200 bg-emerald-50/50 text-emerald-900"
                  : "border-ink-100 bg-ink-50/40 text-ink-400"
              }`}
            >
              <div className="flex items-center gap-1 font-semibold min-w-0">
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] sm:text-[10px] ${
                    isCurrent
                      ? "bg-brand-600 text-white"
                      : isDone
                      ? "bg-emerald-600 text-white"
                      : "bg-ink-200 text-ink-600"
                  }`}
                >
                  {s.step}
                </span>
                <span className="truncate text-[11px] sm:text-xs">{s.title}</span>
              </div>
              <p className="mt-1 line-clamp-1 text-[9px] sm:text-[10px] text-ink-500">{s.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
