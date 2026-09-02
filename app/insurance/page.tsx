"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FilterBar } from "@/components/ui/FilterBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { PermissionGuard } from "@/components/billing/PermissionGuard";
import { InsuranceClaimDocsModal } from "@/components/billing/InsuranceClaimDocsModal";
import { ManagePayerModal } from "@/components/billing/ManagePayerModal";
import { CreateClaimModal } from "@/components/billing/CreateClaimModal";
import { ClaimActionModal, ClaimActionMode } from "@/components/billing/ClaimActionModal";
import { InsuranceClaim, ClaimStatus } from "@/types";
import { formatINR, formatDateTime } from "@/lib/utils";
import Link from "next/link";

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Pending Verification", value: "pending_verification" },
  { label: "Verified", value: "verified" },
  { label: "Pre-auth Pending", value: "preauth_pending" },
  { label: "Approved / Pre-authorized", value: "approved" },
  { label: "Under Review", value: "under_review" },
  { label: "Partially Settled", value: "partially_settled" },
  { label: "Settled", value: "settled" },
  { label: "Rejected", value: "rejected" },
];

export default function InsurancePage() {
  const { currentOrg, currentUser, insuranceClaims, invoices, patients, payers, dispatch } = useApp();

  const [filter, setFilter] = useState("all");
  const [docsClaim, setDocsClaim] = useState<InsuranceClaim | null>(null);
  const [managePayersOpen, setManagePayersOpen] = useState(false);
  const [createClaimOpen, setCreateClaimOpen] = useState(false);

  // Action modal state
  const [actionClaim, setActionClaim] = useState<InsuranceClaim | null>(null);
  const [actionMode, setActionMode] = useState<ClaimActionMode>("verify");

  const claims = useMemo(
    () => insuranceClaims.filter((c) => c.organizationId === currentOrg.id).filter((c) => filter === "all" || c.status === filter),
    [insuranceClaims, currentOrg.id, filter]
  );

  function openAction(c: InsuranceClaim, mode: ClaimActionMode) {
    setActionClaim(c);
    setActionMode(mode);
  }

  function handleDirectStatusUpdate(claimId: string, status: ClaimStatus) {
    dispatch({ type: "UPDATE_CLAIM_STATUS", claimId, status, user: currentUser.name });
  }

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
      <PageHeader
        title="Insurance / TPA"
        description="Payer details, verification, pre-authorization, claims and settlement — visible only where scope permits."
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => setManagePayersOpen(true)}
              className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50 shadow-sm"
            >
              Manage Permitted Payers ({payers.length})
            </button>
            <PermissionGuard permission="insuranceTpa">
              <button
                onClick={() => setCreateClaimOpen(true)}
                className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 shadow-sm"
              >
                + Initiate Insurance Claim
              </button>
            </PermissionGuard>
          </div>
        }
      />

      <PermissionGuard permission="insuranceTpa">
        <div className="mb-4">
          <FilterBar options={FILTERS} active={filter} onChange={setFilter} />
        </div>

        {claims.length === 0 ? (
          <EmptyState title="No insurance claims found" description="Try selecting a different filter or initiate a new insurance claim." />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {claims.map((c) => {
              const invoice = invoices.find((i) => i.id === c.invoiceId);
              const patient = patients.find((p) => p.id === c.patientId);
              const payer = payers.find((p) => p.id === c.payerId);

              return (
                <div key={c.id} className="rounded-xl border border-ink-100 bg-white p-4 shadow-card flex flex-col justify-between">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-ink-800">{patient?.name}</p>
                        <p className="text-xs text-ink-500">
                          {invoice ? (
                            <Link href={`/billing/invoices/${invoice.id}`} className="font-medium text-brand-600 hover:underline">
                              {invoice.invoiceNumber}
                            </Link>
                          ) : (
                            "Invoice"
                          )}{" "}
                          · {payer?.name}
                        </p>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>

                    <div className="flex justify-between items-center text-xs text-ink-500 mb-2">
                      <span>Policy #: <strong className="text-ink-800 font-mono">{c.policyNumber}</strong></span>
                      {c.preAuthNumber && <span>Pre-Auth #: <strong className="text-brand-700 font-mono">{c.preAuthNumber}</strong></span>}
                    </div>

                    {c.verifierNotes && (
                      <p className="mb-2 rounded bg-blue-50/60 p-2 text-[11px] text-blue-900">
                        <strong className="font-medium">Verification Note:</strong> {c.verifierNotes}
                      </p>
                    )}

                    {c.settlementNotes && (
                      <p className="mb-2 rounded bg-emerald-50/60 p-2 text-[11px] text-emerald-900">
                        <strong className="font-medium">Settlement Note:</strong> {c.settlementNotes} (Ref: {c.settlementReference || "N/A"})
                      </p>
                    )}

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg bg-ink-50 px-3 py-2">
                        <p className="text-ink-400">Claimed Amount</p>
                        <p className="font-medium text-ink-800">{formatINR(c.claimedAmount)}</p>
                      </div>

                      {c.approvedAmount !== undefined && (
                        <div className="rounded-lg bg-ink-50 px-3 py-2">
                          <p className="text-ink-400">Approved Amount</p>
                          <p className="font-semibold text-emerald-700">{formatINR(c.approvedAmount)}</p>
                        </div>
                      )}

                      {c.settledAmount !== undefined && (
                        <div className="rounded-lg bg-ink-50 px-3 py-2">
                          <p className="text-ink-400">Settled Amount</p>
                          <p className="font-semibold text-blue-700">{formatINR(c.settledAmount)}</p>
                        </div>
                      )}

                      <div className="rounded-lg bg-ink-50 px-3 py-2">
                        <p className="text-ink-400">Patient Responsibility</p>
                        <p className="font-semibold text-red-600">{formatINR(c.patientResponsibility)}</p>
                      </div>

                      <div className="rounded-lg bg-ink-50 px-3 py-2">
                        <p className="text-ink-400">Payer Outstanding</p>
                        <p className="font-semibold text-amber-700">{formatINR(c.payerOutstanding)}</p>
                      </div>
                    </div>

                    <div className="mt-3 text-xs">
                      <div className="flex items-center justify-between">
                        <p className="text-ink-400">
                          Supporting Docs ({c.documentsAttached.length}/{c.requiredDocuments.length})
                        </p>
                        <button
                          onClick={() => setDocsClaim(c)}
                          className="text-xs font-medium text-brand-600 hover:underline"
                        >
                          Manage / Attach Docs
                        </button>
                      </div>

                      <ul className="mt-1.5 flex flex-wrap gap-1.5">
                        {c.requiredDocuments.map((doc) => {
                          const isAttached = c.documentsAttached.some((d) => d.includes(doc) || doc.includes(d));
                          return (
                            <li
                              key={doc}
                              className={`rounded-full px-2 py-0.5 text-[11px] ${
                                isAttached ? "bg-emerald-50 text-emerald-700 font-medium" : "bg-ink-100 text-ink-500"
                              }`}
                            >
                              {isAttached ? "✓ " : ""}{doc}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-ink-100 pt-3 flex items-center justify-between text-xs">
                    <p className="text-[11px] text-ink-400">Last updated {formatDateTime(c.lastUpdated)}</p>

                    <div className="flex gap-2">
                      {c.status === "pending_verification" && (
                        <button
                          onClick={() => openAction(c, "verify")}
                          className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700"
                        >
                          Verify Coverage
                        </button>
                      )}

                      {c.status === "preauth_pending" && (
                        <button
                          onClick={() => openAction(c, "preauth")}
                          className="rounded-md bg-purple-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-purple-700"
                        >
                          Record Pre-auth
                        </button>
                      )}

                      {(c.status === "verified" || c.status === "approved") && (
                        <button
                          onClick={() => handleDirectStatusUpdate(c.id, "claim_submitted")}
                          className="rounded-md bg-amber-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-amber-700"
                        >
                          Submit Claim
                        </button>
                      )}

                      {c.status === "claim_submitted" && (
                        <button
                          onClick={() => handleDirectStatusUpdate(c.id, "under_review")}
                          className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-700"
                        >
                          Mark Under Review
                        </button>
                      )}

                      {(c.status === "under_review" || c.status === "claim_submitted" || c.status === "partially_settled") && (
                        <button
                          onClick={() => openAction(c, "settlement")}
                          className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                        >
                          Record Settlement
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PermissionGuard>

      <InsuranceClaimDocsModal open={!!docsClaim} onClose={() => setDocsClaim(null)} claim={docsClaim} />
      <ManagePayerModal open={managePayersOpen} onClose={() => setManagePayersOpen(false)} />
      <CreateClaimModal open={createClaimOpen} onClose={() => setCreateClaimOpen(false)} />
      <ClaimActionModal open={!!actionClaim} onClose={() => setActionClaim(null)} claim={actionClaim} mode={actionMode} />
    </div>
  );
}
