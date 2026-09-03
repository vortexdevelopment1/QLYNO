"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Patient } from "@/types";

export default function PatientsPage() {
  const { currentOrg, patients } = useApp();
  const [query, setQuery] = useState("");
  const router = useRouter();

  const orgPatients = useMemo(() => patients.filter((p) => p.organizationId === currentOrg.id), [patients, currentOrg.id]);
  const filtered = orgPatients.filter((p) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.uhid.toLowerCase().includes(q) || p.phone.includes(q);
  });

  const columns: Column<Patient>[] = [
    {
      header: "Patient",
      accessor: (p) => (
        <div>
          <div className="font-bold">{p.name}</div>
          <div className="text-[10px] text-ink-500">{p.uhid}</div>
        </div>
      ),
    },
    {
      header: "Demographics",
      accessor: (p) => `${p.age} yrs · ${p.gender}`,
    },
    {
      header: "Contact",
      accessor: (p) => p.phone,
    },
    {
      header: "Action",
      accessor: (p) => (
        <button 
          onClick={(e) => { e.stopPropagation(); router.push(`/patients/${p.id}`); }}
          className="rounded bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100"
        >
          View Profile
        </button>
      ),
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Patients" description="Search by name, UHID or contact number." />
      
      <div className="rounded-xl border border-ink-200 bg-white p-4 shadow-sm space-y-4">
        <div className="max-w-sm">
          <SearchBar value={query} onChange={setQuery} placeholder="Search patients…" ariaLabel="Search patients" />
        </div>
        
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(p) => p.id}
          emptyTitle="No patients found"
          emptyDescription="Try a different search term."
          onRowClick={(p) => router.push(`/patients/${p.id}`)}
          pagination={true}
          pageSize={10}
        />
      </div>
    </div>
  );
}
