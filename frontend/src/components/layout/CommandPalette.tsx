"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Search, User, ClipboardList, TestTube, FlaskConical, FileText, Receipt, X } from "lucide-react";
import { MOCK_PATIENTS } from "@/data/mock/patients";
import { MOCK_ORDERS } from "@/data/mock/orders";
import { MOCK_SPECIMENS } from "@/data/mock/specimens";
import { MOCK_REPORT_VERSIONS } from "@/data/mock/results";
import { MOCK_INVOICES } from "@/data/mock/billing";
import { useDemo } from "@/state/demo-context";
import { useHospitalWorkflow } from "@/state/hospital-workflow-context";

interface ResultGroup {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: { id: string; label: string; sublabel: string; href: string }[];
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { billingEnabled } = useDemo();
  const { activeSpecimens } = useHospitalWorkflow();

  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const groups: ResultGroup[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = <T,>(items: T[], test: (item: T) => string[]) =>
      q === "" ? items.slice(0, 4) : items.filter((item) => test(item).some((s) => s.toLowerCase().includes(q))).slice(0, 6);

    const result: ResultGroup[] = [
      {
        id: "patients",
        label: "Patients",
        icon: <User className="h-3.5 w-3.5" aria-hidden="true" />,
        items: matches(MOCK_PATIENTS, (p) => [p.name, p.mrn ?? "", p.id]).map((p) => ({
          id: p.id,
          label: p.name,
          sublabel: p.mrn ? `${p.mrn} · ${p.id}` : p.id,
          href: `/patients/${p.id}`,
        })),
      },
      {
        id: "orders",
        label: "Orders",
        icon: <ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />,
        items: matches(MOCK_ORDERS, (o) => [o.id, o.patientName, o.accessionId ?? ""]).map((o) => ({
          id: o.id,
          label: o.id,
          sublabel: o.patientName,
          href: `/orders/${o.id}`,
        })),
      },
      {
        id: "accessions",
        label: "Accessions",
        icon: <ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />,
        items: matches(
          MOCK_ORDERS.filter((o) => o.accessionId),
          (o) => [o.accessionId ?? ""]
        ).map((o) => ({ id: o.accessionId!, label: o.accessionId!, sublabel: o.patientName, href: `/orders/${o.id}` })),
      },
      {
        id: "specimens",
        label: "Specimens",
        icon: <TestTube className="h-3.5 w-3.5" aria-hidden="true" />,
        items: matches([...activeSpecimens, ...MOCK_SPECIMENS.filter((candidate) => !activeSpecimens.some((current) => current.id === candidate.id))], (s) => [s.id, s.orderId, s.patientName, s.mrn ?? ""]).map((s) => ({
          id: s.id,
          label: s.id,
          sublabel: `${s.patientName} · ${s.type}`,
          href: `/specimens/${s.id}`,
        })),
      },
      {
        id: "reports",
        label: "Reports",
        icon: <FileText className="h-3.5 w-3.5" aria-hidden="true" />,
        items: matches(MOCK_REPORT_VERSIONS, (r) => [r.id, r.patientName]).map((r) => ({
          id: r.id,
          label: `${r.orderId} report v${r.version}`,
          sublabel: r.patientName,
          href: `/reports/${r.orderId}`,
        })),
      },
    ];

    if (billingEnabled) {
      result.push({
        id: "invoices",
        label: "Invoices",
        icon: <Receipt className="h-3.5 w-3.5" aria-hidden="true" />,
        items: matches(MOCK_INVOICES, (inv) => [inv.id, inv.patientName]).map((inv) => ({
          id: inv.id,
          label: inv.id,
          sublabel: inv.patientName,
          href: `/billing/invoices/${inv.id}`,
        })),
      });
    }

    return result.filter((g) => g.items.length > 0);
  }, [query, billingEnabled, activeSpecimens]);

  if (typeof document === "undefined" || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-20 sm:pt-28">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-label="Global search" className="relative flex max-h-[70vh] w-full max-w-xl flex-col rounded-card bg-app-surface shadow-xl">
        <div className="flex items-center gap-2 border-b border-app-border px-4 py-3">
          <Search className="h-4 w-4 text-text-muted" aria-hidden="true" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patients, orders, accessions, specimens, reports…"
            aria-label="Global search input"
            className="h-8 flex-1 bg-transparent text-sm text-text-main placeholder:text-text-muted focus:outline-none"
          />
          <button type="button" onClick={onClose} aria-label="Close search" className="rounded p-1 text-text-muted hover:bg-app-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {groups.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-text-muted">No matches. Try a patient name, order ID or accession number.</p>
          ) : (
            groups.map((group) => (
              <div key={group.id} className="mb-2">
                <p className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                  {group.icon}
                  {group.label}
                </p>
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      router.push(item.href);
                      onClose();
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-app-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                  >
                    <span className="font-medium text-text-main">{item.label}</span>
                    <span className="text-xs text-text-muted">{item.sublabel}</span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
