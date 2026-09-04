"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Overlay";
import { Timeline } from "@/components/ui/Timeline";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils/cn";
import { formatCurrencyINR, formatDateTime } from "@/lib/utils/format";
import type { BillingPostingStatus, HospitalBillingPosting, LaboratoryChargeLine } from "@/lib/types/laboratory-session";

const POSTING_TONE: Record<BillingPostingStatus, string> = { NOT_REQUIRED: "bg-gray-100 text-text-muted", READY_TO_POST: "bg-amber-50 text-status-warning", POSTING: "bg-blue-50 text-status-info", POSTED: "bg-green-50 text-status-success", FAILED: "bg-red-50 text-status-critical", REVERSED: "bg-gray-100 text-text-muted", RECONCILIATION_REQUIRED: "bg-amber-50 text-status-warning" };

export function BillingPostingBadge({ status }: { status: BillingPostingStatus }) { return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", POSTING_TONE[status])}>{status.replaceAll("_", " ")}</span>; }

export function ChargeLineTable({ lines }: { lines: LaboratoryChargeLine[] }) {
  return <div className="overflow-x-auto rounded-lg border border-app-border"><table className="w-full min-w-[760px] text-left text-xs"><thead className="bg-app-sidebar text-[10px] uppercase tracking-wide text-text-muted"><tr>{["Service", "Code", "Qty", "Base rate", "Adjustment", "Tax", "Gross", "Net"].map((h) => <th key={h} className="px-3 py-2.5">{h}</th>)}</tr></thead><tbody className="divide-y divide-app-border">{lines.map((line) => <tr key={line.id}><td className="px-3 py-3 font-medium">{line.description}</td><td className="px-3 py-3 text-text-muted">{line.serviceCode}</td><td className="px-3 py-3">{line.quantity}</td><td className="px-3 py-3">{formatCurrencyINR(line.unitPrice)}</td><td className="px-3 py-3">-{formatCurrencyINR(line.discountAmount)}</td><td className="px-3 py-3"><span>{line.taxCode ?? "Not set"}</span><span className="block text-text-muted">{line.taxRate ?? 0}% · {formatCurrencyINR(line.taxAmount)}</span></td><td className="px-3 py-3">{formatCurrencyINR(line.grossAmount)}</td><td className="px-3 py-3 font-semibold">{formatCurrencyINR(line.netAmount)}</td></tr>)}</tbody></table></div>;
}

export function BillingPostingTimeline({ posting }: { posting: HospitalBillingPosting }) { return <Timeline entries={[{ id: `${posting.id}-ready`, label: "Charge lines prepared", description: `Idempotency: ${posting.tenantId} + ${posting.laboratoryOrderId} + ${posting.postingVersion}`, tone: "default" }, { id: `${posting.id}-attempt`, label: posting.status === "POSTED" ? "Accepted by HMS central billing" : "Central billing response requires review", timestamp: posting.postedAt ?? posting.lastAttemptAt, description: posting.failureReason ?? posting.hmsBillNumber, tone: posting.status === "POSTED" ? "success" : "warning" }]} />; }

export function ReconciliationDialog({ open, onClose, posting }: { open: boolean; onClose: () => void; posting: HospitalBillingPosting }) {
  const { showToast } = useToast();
  return <Modal open={open} onClose={onClose} title="Request billing reconciliation" footer={<><Button size="sm" variant="outline" onClick={onClose}>Cancel</Button><Button size="sm" onClick={() => { showToast({ title: "Reconciliation request recorded", description: posting.laboratoryOrderId, tone: "success" }); onClose(); }}>Submit request</Button></>}><p className="text-text-muted">This preserves the original posting and asks hospital billing to reconcile posting version {posting.postingVersion}. No invoice or payment is created in the Laboratory Portal.</p><textarea aria-label="Reconciliation note" placeholder="Add a note for central billing" className="mt-4 min-h-24 w-full rounded-control border border-app-border p-3 text-sm outline-none focus:border-brand-blue" /></Modal>;
}

export function HmsBillingStatusCard({ lines, posting, canRetry = false }: { lines: LaboratoryChargeLine[]; posting?: HospitalBillingPosting; canRetry?: boolean }) {
  const [reconcileOpen, setReconcileOpen] = useState(false); const { showToast } = useToast();
  const gross = lines.reduce((sum, line) => sum + line.grossAmount, 0); const discount = lines.reduce((sum, line) => sum + line.discountAmount, 0); const tax = lines.reduce((sum, line) => sum + line.taxAmount, 0); const net = lines.reduce((sum, line) => sum + line.netAmount, 0);
  return <Card className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-text-muted">Central Billing Posting</p><h3 className="mt-1 font-display text-xl font-semibold">Charge Summary</h3><p className="mt-1 text-xs text-text-muted">Read-only calculation returned by HMS billing. This is not a laboratory invoice.</p></div>{posting && <BillingPostingBadge status={posting.status} />}</div>
    {lines.length ? <><div className="mt-5"><ChargeLineTable lines={lines} /></div><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"><Summary label="Gross amount" value={formatCurrencyINR(gross)} /><Summary label="Package / discount" value={`-${formatCurrencyINR(discount)}`} /><Summary label="Tax returned by HMS" value={formatCurrencyINR(tax)} /><Summary label="Net payable" value={formatCurrencyINR(net)} strong /></div></> : <p className="mt-5 rounded-lg bg-app-bg p-4 text-xs text-text-muted">No charge lines were returned for this order.</p>}
    {posting && <div className="mt-5 grid gap-4 border-t border-app-border pt-4 lg:grid-cols-2"><dl className="space-y-2 text-xs"><Meta label="Payer type" value="Patient / configured package" /><Meta label="Insurance / package" value={discount > 0 ? "Package adjustment applied" : "Not applied"} /><Meta label="HMS bill number" value={posting.hmsBillNumber ?? "Pending"} /><Meta label="Last synchronization" value={formatDateTime(posting.postedAt ?? posting.lastAttemptAt)} /></dl><BillingPostingTimeline posting={posting} /></div>}
    {posting && posting.status !== "POSTED" && <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3"><AlertTriangle className="h-4 w-4 text-status-warning" /><p className="mr-auto text-xs text-text-main">Posting needs central billing review. Clinical processing remains available.</p><Button size="sm" variant="outline" disabled={!canRetry} disabledReason="You do not have permission to retry charge posting" onClick={() => showToast({ title: "Posting retry queued", description: posting.laboratoryOrderId, tone: "info" })}><RefreshCw className="h-3.5 w-3.5" /> Retry</Button><Button size="sm" onClick={() => setReconcileOpen(true)}>Request reconciliation</Button></div>}
    {posting && <ReconciliationDialog open={reconcileOpen} onClose={() => setReconcileOpen(false)} posting={posting} />}
  </Card>;
}

export function FailedPostingAlert({ count }: { count: number }) { if (!count) return null; return <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3"><AlertTriangle className="h-5 w-5 text-status-warning" /><div><p className="text-sm font-semibold">{count} central billing posting requires reconciliation</p><p className="text-xs text-text-muted">Laboratory workflows are unaffected; financial posting remains preserved for review.</p></div></div>; }
function Summary({ label, value, strong }: { label: string; value: string; strong?: boolean }) { return <div className="rounded-lg bg-app-bg p-3"><p className="text-[10px] uppercase tracking-wide text-text-muted">{label}</p><p className={cn("mt-1 text-sm", strong ? "font-bold text-brand-blue" : "font-semibold")}>{value}</p></div>; }
function Meta({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-3 border-b border-app-border pb-2"><dt className="text-text-muted">{label}</dt><dd className="text-right font-medium">{value}</dd></div>; }
