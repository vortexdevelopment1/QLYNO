import { ReceptionistModulePage } from "@/components/receptionist-portal";

export default function ReceptionistSearchPage({
  searchParams,
}: {
  searchParams?: { q?: string | string[] };
}) {
  const query = Array.isArray(searchParams?.q) ? searchParams?.q[0] ?? "" : searchParams?.q ?? "";
  return <ReceptionistModulePage moduleId="search" initialSearchQuery={query} />;
}
