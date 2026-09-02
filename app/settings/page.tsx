"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { PermissionGuard } from "@/components/billing/PermissionGuard";
import { ManagePayerModal } from "@/components/billing/ManagePayerModal";

const SETTINGS_SECTIONS = [
  { title: "Billing Configuration", description: "Invoice numbering, tax defaults, encounter linking rules." },
  { title: "Payment Methods", description: "Enabled methods: Cash, Card, UPI, Online, Other." },
  { title: "Discount Limits", description: "Normal discount cap and higher/special-case approval thresholds." },
  { title: "Refund Limits", description: "Value threshold above which refunds require approval." },
  { title: "Notification Configuration", description: "WhatsApp events: invoice issued, payment, partial payment, outstanding, refund, insurance." },
  { title: "Insurance Settings", description: "Permitted payers, TPAs, and required documents per claim type.", isInsurance: true },
  { title: "Service Configuration", description: "Service catalog, rates and tax percentages." },
];

export default function SettingsPage() {
  const { currentUser } = useApp();
  const [payerModalOpen, setPayerModalOpen] = useState(false);

  return (
    <div>
      <PageHeader title="Settings" description="Billing configuration is accessible only to authorized admin users." />
      <PermissionGuard permission="billingSettings" fallbackLabel="Billing settings are restricted">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SETTINGS_SECTIONS.map((s) => (
            <div key={s.title} className="rounded-xl border border-ink-100 bg-white p-4 shadow-card">
              <h3 className="text-sm font-semibold text-ink-800">{s.title}</h3>
              <p className="mt-1 text-xs text-ink-500">{s.description}</p>
              <button
                onClick={() => {
                  if (s.isInsurance) setPayerModalOpen(true);
                }}
                className="mt-3 rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 hover:bg-ink-50"
              >
                {s.isInsurance ? "Configure Payers & TPAs" : "Configure (demo)"}
              </button>
            </div>
          ))}
        </div>
      </PermissionGuard>
      {currentUser.role !== "billing_admin" && (
        <p className="mt-4 text-xs text-ink-400">Signed in as Billing Staff — you can view permission restrictions here but cannot edit admin configuration.</p>
      )}

      <ManagePayerModal open={payerModalOpen} onClose={() => setPayerModalOpen(false)} />
    </div>
  );
}
