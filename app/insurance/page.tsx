"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FilterBar } from "@/components/ui/FilterBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { PermissionGuard } from "@/components/billing/PermissionGuard";
import { InsuranceClaimDocsModal } from "@/components/billing/InsuranceClaimDocsModal";
import { InsuranceClaim } from "@/types";
import { formatINR, formatDateTime } from "@/lib/utils";

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Pending Verification", value: "pending_verification" },
  { label: "Pre-auth Pending", value: "preauth_pending" },
  { label: "Under Review", value: "under_review" },
  { label: "Partially Settled", value: "partially_settled" },
  { label: "Settled", value: "settled" },
  { label: "Rejected", value: "rejected" },
];

export default function InsurancePage() {
  const { currentOrg, currentUser, insuranceClaims, invoices, patients, payers } = useApp();
  const [filter, setFilter] = useState("all");
  const [selectedClaim, setSelectedClaim] = useState<InsuranceClaim | null>(null);

  const claims = useMemo(
    () => insuranceClaims.filter((c) => c.organizationId === currentOrg.id).filter((c) => filter === "all" || c.status === filter),
    [insuranceClaims, currentOrg.id, filter]
  );

  if (!currentOrg.insuranceEnabled) {
    return (
      <div>
        <PageHeader title="Insurance / TPA" />
        <EmptyState title="Insurance/TPA is not enabled" description="This organization has not enabled insurance/TPA billing." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Insurance / TPA" description="Payer details, verification, pre-authorization, claims and settlement — visible only where scope permits." />
      <PermissionGuard permission="insuranceTpa">
        <div className="mb-4"><FilterBar options={FILTERS} active={filter} onChange={setFilter} /></div>
        {claims.length === 0 ? (
          <EmptyState title="No insurance claims found" />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {claims.map((c) => {
              const invoice = invoices.find((i) => i.id === c.invoiceId);
              const patient = patients.find((p) => p.id === c.patientId);
              const payer = payers.find((p) => p.id === c.payerId);
              return (
                <div key={c.id} className="rounded-xl border border-ink-100 bg-white p-4 shadow-card">
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-ink-800">{patient?.name}</p>
                      <p className="text-xs text-ink-500">{invoice?.invoiceNumber} · {payer?.name}</p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-xs text-ink-400">Policy: {c.policyNumber}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-ink-50 px-3 py-2"><p className="text-ink-400">Claimed</p><p className="font-medium text-ink-800">{formatINR(c.claimedAmount)}</p></div>
                    {c.approvedAmount !== undefined && <div className="rounded-lg bg-ink-50 px-3 py-2"><p className="text-ink-400">Approved</p><p className="font-medium text-ink-800">{formatINR(c.approvedAmount)}</p></div>}
                    {c.settledAmount !== undefined && <div className="rounded-lg bg-ink-50 px-3 py-2"><p className="text-ink-400">Settled</p><p className="font-medium text-ink-800">{formatINR(c.settledAmount)}</p></div>}
                    <div className="rounded-lg bg-ink-50 px-3 py-2"><p className="text-ink-400">Patient responsibility</p><p className="font-medium text-ink-800">{formatINR(c.patientResponsibility)}</p></div>
                    <div className="rounded-lg bg-ink-50 px-3 py-2"><p className="text-ink-400">Payer outstanding</p><p className="font-medium text-ink-800">{formatINR(c.payerOutstanding)}</p></div>
                  </div>
                  <div className="mt-3 text-xs">
                    <div className="flex items-center justify-between">
                      <p className="text-ink-400">Documents attached ({c.documentsAttached.length}/{c.requiredDocuments.length})</p>
                      <button
                        onClick={() => setSelectedClaim(c)}
                        className="text-xs font-medium text-brand-600 hover:underline"
                      >
                        Manage / Attach Docs
                      </button>
                    </div>
                    <ul className="mt-1 flex flex-wrap gap-1.5">
                      {c.requiredDocuments.map((doc) => (
                        <li key={doc} className={`rounded-full px-2 py-0.5 ${c.documentsAttached.includes(doc) ? "bg-emerald-50 text-emerald-700 font-medium" : "bg-ink-100 text-ink-500"}`}>
                          {c.documentsAttached.includes(doc) ? "✓ " : ""}{doc}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="mt-3 text-[11px] text-ink-400">Last updated {formatDateTime(c.lastUpdated)}</p>
                </div>
              );
            })}
          </div>
        )}
      </PermissionGuard>
      <InsuranceClaimDocsModal open={!!selectedClaim} onClose={() => setSelectedClaim(null)} claim={selectedClaim} />
    </div>
  );
}
