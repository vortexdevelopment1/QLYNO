"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, User, CalendarDays, FilePlus2, FlaskConical, X, ArrowUpRight } from "lucide-react";
import {
  patients,
  appointments,
  prescriptions,
  labOrders,
  matchesWorkContext,
  patientInWorkContext,
} from "@/lib/mock-data";
import { useMode } from "@/lib/mode-context";

type ResultKind = "patient" | "appointment" | "prescription" | "lab";

interface Result {
  kind: ResultKind;
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { workContext } = useMode();

  const results: Result[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const out: Result[] = [];

    patients
      .filter(
        (p) =>
          patientInWorkContext(p, workContext) &&
          (p.name.toLowerCase().includes(q) || p.mrn.toLowerCase().includes(q))
      )
      .slice(0, 4)
      .forEach((p) =>
        out.push({
          kind: "patient",
          id: p.id,
          title: p.name,
          subtitle: `${p.mrn} - ${p.age}${p.gender[0]}`,
          href: `/doctor/patients/${p.id}`,
        })
      );

    appointments
      .filter((a) => matchesWorkContext(a, workContext) && a.reason.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((a) => {
        const patient = patients.find((p) => p.id === a.patientId);
        out.push({
          kind: "appointment",
          id: a.id,
          title: a.reason,
          subtitle: `${patient?.name ?? "Unknown"} - ${a.time}`,
          href: `/doctor/appointments`,
        });
      });

    prescriptions
      .filter((rx) => {
        const patient = patients.find((p) => p.id === rx.patientId);
        return Boolean(patient && patientInWorkContext(patient, workContext)) && rx.medicines.some((m) => m.name.toLowerCase().includes(q));
      })
      .slice(0, 3)
      .forEach((rx) => {
        const patient = patients.find((p) => p.id === rx.patientId);
        out.push({
          kind: "prescription",
          id: rx.id,
          title: `Rx for ${patient?.name ?? "Unknown"}`,
          subtitle: rx.medicines.map((m) => m.name).join(", "),
          href: `/doctor/prescriptions`,
        });
      });

    labOrders
      .filter((l) => matchesWorkContext(l, workContext) && l.testName.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((l) => {
        const patient = patients.find((p) => p.id === l.patientId);
        out.push({
          kind: "lab",
          id: l.id,
          title: l.testName,
          subtitle: `${patient?.name ?? "Unknown"} - ${l.status}`,
          href: `/doctor/lab-orders`,
        });
      });

    return out;
  }, [query, workContext]);

  const icons: Record<ResultKind, typeof User> = {
    patient: User,
    appointment: CalendarDays,
    prescription: FilePlus2,
    lab: FlaskConical,
  };

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  function discover() {
    const next = query.trim() ? `/discover?q=${encodeURIComponent(query.trim())}` : "/discover";
    setOpen(false);
    setQuery("");
    router.push(next);
  }

  return (
    <div className="relative flex-1 max-w-md">
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={`Search ${workContext} patients, appointments, prescriptions, tests...`}
          className="w-full rounded-md border border-line bg-paper pl-9 pr-8 py-2 text-[13px] placeholder:text-ink-faint focus:bg-white focus:border-brand-400 focus:ring-1 focus:ring-brand-400 outline-none transition-colors"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-muted"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {open && query && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1.5 w-full card p-1.5 max-h-80 overflow-y-auto">
            {results.length === 0 ? (
              <div className="px-3 py-4 text-center">
                <p className="text-sm text-ink-muted">No clinical records match &quot;{query}&quot;</p>
                <button onClick={discover} className="btn-secondary text-xs mt-3">
                  Search public care <ArrowUpRight size={13} />
                </button>
              </div>
            ) : (
              <>
                {results.map((r) => {
                  const Icon = icons[r.kind];
                  return (
                    <button
                      key={`${r.kind}-${r.id}`}
                      onClick={() => go(r.href)}
                      className="w-full flex items-center gap-3 rounded-md px-2.5 py-2 text-left hover:bg-brand-50 transition-colors"
                    >
                      <span className="w-7 h-7 rounded-md bg-paper border border-line flex items-center justify-center shrink-0">
                        <Icon size={13} className="text-brand-600" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[13px] font-medium text-ink truncate">{r.title}</span>
                        <span className="block text-[11px] text-ink-muted truncate">{r.subtitle}</span>
                      </span>
                    </button>
                  );
                })}
                <button
                  onClick={discover}
                  className="w-full flex items-center justify-between rounded-md px-2.5 py-2 text-left text-[13px] font-medium text-brand-700 hover:bg-brand-50 transition-colors"
                >
                  Search doctors, clinics, labs and medicines
                  <ArrowUpRight size={13} />
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
