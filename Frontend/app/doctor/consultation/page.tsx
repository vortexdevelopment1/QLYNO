import { ConsultationPatientWorkspace } from "@/components/consultation-patient-workspace";

export default function ConsultationPage({
  searchParams,
}: {
  searchParams?: { patient?: string | string[] };
}) {
  const patientParam = Array.isArray(searchParams?.patient)
    ? searchParams?.patient[0]
    : searchParams?.patient;

  return <ConsultationPatientWorkspace initialPatientId={patientParam} />;
}
