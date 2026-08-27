"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import { PatientCard } from "@/components/billing/PatientCard";
import { EmptyState } from "@/components/ui/EmptyState";

export default function PatientsPage() {
  const { currentOrg, patients } = useApp();
  const [query, setQuery] = useState("");

  const orgPatients = useMemo(() => patients.filter((p) => p.organizationId === currentOrg.id), [patients, currentOrg.id]);
  const filtered = orgPatients.filter((p) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.uhid.toLowerCase().includes(q) || p.phone.includes(q);
  });

  return (
    <div>
      <PageHeader title="Patients" description="Search by name, UHID or contact number." />
      <div className="mb-4 max-w-sm"><SearchBar value={query} onChange={setQuery} placeholder="Search patients…" ariaLabel="Search patients" /></div>
      {filtered.length === 0 ? (
        <EmptyState title="No patients found" description="Try a different search term." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PatientCard key={p.id} patient={p} />
          ))}
        </div>
      )}
    </div>
  );
}
