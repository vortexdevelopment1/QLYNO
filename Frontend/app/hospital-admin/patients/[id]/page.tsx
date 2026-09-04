"use client";

import { notFound, useParams } from "next/navigation";
import { patients } from "@/hospital-admin/lib/mock-data/patients";
import { PatientDetail } from "./patient-detail";

export default function PatientDetailPage() {
  const params = useParams<{ id: string }>();
  const patient = patients.find((p) => p.id === params.id);

  if (!patient) {
    notFound();
  }

  return <PatientDetail patientId={params.id} />;
}

