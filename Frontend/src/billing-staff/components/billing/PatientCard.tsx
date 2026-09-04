import Link from "next/link";
import { Patient } from "@/billing-staff/types";

export function PatientCard({ patient }: { patient: Patient }) {
  return (
    <Link href={`/billing-staff/patients/${patient.id}`} className="block rounded-xl border border-ink-100 bg-white p-4 shadow-card hover:border-brand-300">
      <p className="text-sm font-semibold text-ink-800">{patient.name}</p>
      <p className="text-xs text-ink-500">{patient.uhid} · {patient.age} yrs · {patient.gender}</p>
      <p className="mt-1 text-xs text-ink-500">{patient.phone}</p>
    </Link>
  );
}
