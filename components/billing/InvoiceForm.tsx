"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { InvoiceLineItem, PendingBillingItem } from "@/types";
import { formatINR, nextId } from "@/lib/utils";

interface DraftLine {
  key: string;
  serviceId: string;
  quantity: number;
  discountPercent: number;
  pendingItemId?: string;
  source: InvoiceLineItem["source"];
}

const NORMAL_DISCOUNT_CAP_PERCENT = 20;

export function InvoiceForm({
  onCancel, onCreated, prefillPending,
}: {
  onCancel: () => void; onCreated?: (invoiceId: string) => void; prefillPending?: PendingBillingItem | PendingBillingItem[];
}) {
  const pendingItems = useMemo<PendingBillingItem[]>(() => {
    if (!prefillPending) return [];
    return Array.isArray(prefillPending) ? prefillPending : [prefillPending];
  }, [prefillPending]);

  const { currentOrg, currentUser, currentScope, patients, encounters, serviceCatalog, payers, dispatch } = useApp();
  const orgPatients = patients.filter((p) => p.organizationId === currentOrg.id);
  const orgCatalog = serviceCatalog.filter((s) => s.organizationId === currentOrg.id);

  const initialPatientId = pendingItems[0]?.patientId ?? "";
  const initialEncounterId = pendingItems.length > 0 && pendingItems.every((i) => i.encounterId === pendingItems[0].encounterId)
    ? (pendingItems[0].encounterId ?? "")
    : "";

  const [patientId, setPatientId] = useState(initialPatientId);
  const [encounterId, setEncounterId] = useState(initialEncounterId);
  const [payerId, setPayerId] = useState("payer-self");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<DraftLine[]>(() =>
    pendingItems.length > 0
      ? pendingItems.map((item) => ({
          key: nextId("line"),
          serviceId: item.serviceId,
          quantity: 1,
          discountPercent: 0,
          pendingItemId: item.id,
          source: item.source === "doctor_opd" ? "doctor_opd" : (item.source as InvoiceLineItem["source"]),
        }))
      : []
  );
  const [error, setError] = useState("");

  const patientEncounters = encounters.filter((e) => e.patientId === patientId);

  function addLine() {
    if (orgCatalog.length === 0) return;
    setLines((l) => [...l, { key: nextId("line"), serviceId: orgCatalog[0].id, quantity: 1, discountPercent: 0, source: "other" }]);
  }
  function removeLine(key: string) {
    setLines((l) => l.filter((x) => x.key !== key));
  }
  function updateLine(key: string, patch: Partial<DraftLine>) {
    setLines((l) => l.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  }

  const computedLines: InvoiceLineItem[] = useMemo(
    () =>
      lines.map((l) => {
        const svc = orgCatalog.find((s) => s.id === l.serviceId);
        const rate = svc?.rate ?? 0;
        const gross = rate * l.quantity;
        const discountAmount = Math.round((gross * l.discountPercent) / 100);
        const taxable = gross - discountAmount;
        const taxAmount = Math.round((taxable * (svc?.taxPercent ?? 0)) / 100 * 100) / 100;
        return {
          id: l.key,
          serviceId: l.serviceId,
          serviceName: svc?.name ?? "Service",
          source: l.source,
          quantity: l.quantity,
          rate,
          discountAmount,
          taxAmount,
          total: taxable + taxAmount,
        };
      }),
    [lines, orgCatalog]
  );

  const subtotal = computedLines.reduce((s, l) => s + l.rate * l.quantity, 0);
  const discountTotal = computedLines.reduce((s, l) => s + l.discountAmount, 0);
  const taxTotal = computedLines.reduce((s, l) => s + l.taxAmount, 0);
  const total = computedLines.reduce((s, l) => s + l.total, 0);

  function handleSubmit(finalize: boolean) {
    setError("");
    if (!patientId) return setError("Select a patient before creating the invoice.");
    if (computedLines.length === 0) return setError("Add at least one service line item. An invoice cannot be empty.");
    if (computedLines.some((l) => l.quantity <= 0)) return setError("Quantity must be greater than zero for every line item.");

    const invoiceId = nextId("inv");
    const invoiceNumber = `${currentOrg.id === "org-solo" ? "SOLO" : currentOrg.id === "org-clinic" ? "SMC" : "VH"}-INV-2026-${Math.floor(1000 + Math.random() * 8999)}`;

    dispatch({
      type: "CREATE_INVOICE",
      invoice: {
        id: invoiceId,
        invoiceNumber,
        patientId,
        encounterId: encounterId || undefined,
        organizationId: currentOrg.id,
        scope: currentScope,
        date: new Date().toISOString().slice(0, 10),
        status: "draft",
        lineItems: computedLines,
        subtotal, discountTotal, taxTotal, total,
        paidTotal: 0,
        outstanding: total,
        payerId,
        notes: notes || undefined,
        createdBy: currentUser.name,
        createdAt: new Date().toISOString(),
      },
      consumedPendingIds: lines.filter((l) => l.pendingItemId).map((l) => l.pendingItemId!),
    });

    if (finalize) {
      dispatch({ type: "FINALIZE_INVOICE", invoiceId, user: currentUser.name });
    }
    onCreated?.(invoiceId);
  }

  return (
    <div className="space-y-5">
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="patient" className="mb-1 block text-xs font-medium text-ink-600">Patient <span aria-hidden="true">*</span></label>
          <select id="patient" value={patientId} onChange={(e) => { setPatientId(e.target.value); setEncounterId(""); }} className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100">
            <option value="">Select patient…</option>
            {orgPatients.map((p) => (
              <option key={p.id} value={p.id}>{p.name} · {p.uhid}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="encounter" className="mb-1 block text-xs font-medium text-ink-600">Encounter (optional)</label>
          <select id="encounter" value={encounterId} onChange={(e) => setEncounterId(e.target.value)} className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100">
            <option value="">No encounter link</option>
            {patientEncounters.map((e) => (
              <option key={e.id} value={e.id}>{e.type.toUpperCase()} · {e.department} · {e.date}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="payer" className="mb-1 block text-xs font-medium text-ink-600">Payer</label>
          <select id="payer" value={payerId} onChange={(e) => setPayerId(e.target.value)} className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100">
            {payers.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="notes" className="mb-1 block text-xs font-medium text-ink-600">Notes</label>
          <input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink-800">Line Items</h3>
          <button type="button" onClick={addLine} className="text-xs font-medium text-brand-600 hover:underline">+ Add service</button>
        </div>
        {lines.length === 0 ? (
          <p className="rounded-lg border border-dashed border-ink-200 px-4 py-6 text-center text-sm text-ink-500">No services added yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-ink-100 max-w-full touch-pan-x">
            <table className="w-full min-w-[580px] text-xs sm:text-sm">
              <thead className="bg-ink-50 text-left text-xs uppercase text-ink-500">
                <tr>
                  <th className="px-2.5 sm:px-3 py-2">Service</th>
                  <th className="px-2 sm:px-3 py-2">Qty</th>
                  <th className="px-2 sm:px-3 py-2">Rate</th>
                  <th className="px-2 sm:px-3 py-2">Discount %</th>
                  <th className="px-2 sm:px-3 py-2">Total</th>
                  <th className="px-2 sm:px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {lines.map((l, idx) => (
                  <tr key={l.key} className="border-t border-ink-50">
                    <td className="px-2.5 sm:px-3 py-2">
                      <select value={l.serviceId} onChange={(e) => updateLine(l.key, { serviceId: e.target.value })} aria-label={`Service for line ${idx + 1}`} className="w-full min-w-[140px] rounded-md border border-ink-200 px-2 py-1.5 text-xs sm:text-sm">
                        {orgCatalog.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 sm:px-3 py-2">
                      <input type="number" min={1} value={l.quantity} onChange={(e) => updateLine(l.key, { quantity: Number(e.target.value) })} aria-label={`Quantity for line ${idx + 1}`} className="w-14 sm:w-16 rounded-md border border-ink-200 px-2 py-1.5 text-xs sm:text-sm" />
                    </td>
                    <td className="px-2 sm:px-3 py-2 text-ink-600 whitespace-nowrap">{formatINR(orgCatalog.find((s) => s.id === l.serviceId)?.rate ?? 0)}</td>
                    <td className="px-2 sm:px-3 py-2">
                      <input
                        type="number" min={0} max={NORMAL_DISCOUNT_CAP_PERCENT} value={l.discountPercent}
                        onChange={(e) => updateLine(l.key, { discountPercent: Math.min(NORMAL_DISCOUNT_CAP_PERCENT, Number(e.target.value)) })}
                        aria-label={`Discount percent for line ${idx + 1}`} className="w-14 sm:w-16 rounded-md border border-ink-200 px-2 py-1.5 text-xs sm:text-sm"
                      />
                    </td>
                    <td className="px-2 sm:px-3 py-2 font-medium text-ink-800 whitespace-nowrap">{formatINR(computedLines[idx]?.total ?? 0)}</td>
                    <td className="px-2 sm:px-3 py-2">
                      <button type="button" onClick={() => removeLine(l.key)} aria-label={`Remove line ${idx + 1}`} className="p-1 rounded text-ink-400 hover:text-red-600 hover:bg-ink-100">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-1 text-[11px] text-ink-400">Line-item discounts are capped at {NORMAL_DISCOUNT_CAP_PERCENT}% (your configured normal limit). Higher discounts must be requested after the invoice is issued via the Discounts workflow.</p>
      </div>

      <div className="rounded-lg bg-ink-50 p-4 text-sm">
        <div className="flex justify-between py-0.5"><span className="text-ink-500">Subtotal</span><span>{formatINR(subtotal)}</span></div>
        <div className="flex justify-between py-0.5"><span className="text-ink-500">Discount</span><span>-{formatINR(discountTotal)}</span></div>
        <div className="flex justify-between py-0.5"><span className="text-ink-500">Tax / other charges</span><span>{formatINR(taxTotal)}</span></div>
        <div className="mt-1 flex justify-between border-t border-ink-200 pt-1.5 text-base font-semibold text-ink-900"><span>Total</span><span>{formatINR(total)}</span></div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 border-t border-ink-100 pt-4">
        <button type="button" onClick={onCancel} className="w-full sm:w-auto rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50">Cancel</button>
        <button type="button" onClick={() => handleSubmit(false)} className="w-full sm:w-auto rounded-lg border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-100">Save as Draft</button>
        <button type="button" onClick={() => handleSubmit(true)} className="w-full sm:w-auto rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">Save &amp; Issue Invoice</button>
      </div>
    </div>
  );
}
