"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  FlaskConical,
  MapPin,
  Pill as PillIcon,
  Search,
  Stethoscope,
} from "lucide-react";
import { Card, Pill, SectionHeading } from "@/components/ui";
import { doctors } from "@/lib/mock-data";
import {
  discoveryServices,
  doctorAffiliations,
  getDoctorAffiliations,
  getOrganization,
  labTests,
  medicineListings,
  organizations,
} from "@/lib/discovery-data";

type Filter = "All" | "Doctors" | "Clinics" | "Hospitals" | "Labs" | "Medicines" | "Services";

const filters: Filter[] = ["All", "Doctors", "Clinics", "Hospitals", "Labs", "Medicines", "Services"];

function normalized(value: string) {
  return value.toLowerCase().trim();
}

function DiscoverExperience() {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "cardiologist near me");
  const [filter, setFilter] = useState<Filter>("All");
  const q = normalized(query);

  const doctorResults = useMemo(() => {
    return doctors
      .map((doctor) => {
        const affiliations = getDoctorAffiliations(doctor.id);
        const haystack = normalized(
          [
            doctor.name,
            doctor.specialty,
            doctor.qualifications,
            ...affiliations.flatMap((affiliation) => {
              const organization = getOrganization(affiliation.organizationId);
              return [affiliation.label, affiliation.department, organization?.name, organization?.type];
            }),
          ]
            .filter(Boolean)
            .join(" ")
        );
        return { doctor, affiliations, matches: !q || haystack.includes(q) };
      })
      .filter((result) => result.matches || ["doctor", "cardiologist", "near me", "consultation"].some((term) => q.includes(term)))
      .sort((a, b) => b.affiliations.length - a.affiliations.length);
  }, [q]);

  const organizationResults = useMemo(() => {
    return organizations.filter((organization) => {
      const haystack = normalized([organization.name, organization.type, organization.description, organization.location, ...organization.services].join(" "));
      return !q || haystack.includes(q) || (q.includes("hospital") && organization.type === "Hospital") || (q.includes("clinic") && organization.type === "Clinic");
    });
  }, [q]);

  const testResults = labTests.filter((test) => normalized(test.name).includes(q) || q.includes("blood") || q.includes("test"));
  const medicineResults = medicineListings.filter((medicine) => normalized(medicine.name).includes(q) || q.includes("medicine") || q.includes("pharmacy"));
  const serviceResults = discoveryServices.filter((service) =>
    normalized([service.name, service.category, ...service.keywords].join(" ")).includes(q)
  );

  const showDoctors = filter === "All" || filter === "Doctors";
  const showOrganizations = filter === "All" || filter === "Clinics" || filter === "Hospitals" || filter === "Labs";
  const showMedicines = filter === "All" || filter === "Medicines";
  const showServices = filter === "All" || filter === "Services";

  const visibleOrganizations = organizationResults.filter((organization) => {
    if (filter === "Clinics") return organization.type === "Clinic";
    if (filter === "Hospitals") return organization.type === "Hospital";
    if (filter === "Labs") return organization.type === "Lab";
    return true;
  });

  return (
    <div>
      <SectionHeading
        eyebrow="Unified Discovery"
        title="Search care by intent"
        description="Find doctors, clinics, hospitals, labs, medicines and services while keeping doctor identity separate from practice location."
      />

      <Card className="mb-6">
        <div className="relative">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="input-field pl-10"
            placeholder="Search doctors, hospitals, clinics, medicines, lab tests..."
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {filters.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`badge border ${
                filter === item ? "bg-brand-500 text-white border-brand-500" : "border-line text-ink-muted hover:bg-paper"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </Card>

      <div className="space-y-6">
        {showDoctors && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg text-ink">Doctors first for provider intent</h2>
              <Pill tone="brand">Doctor identity stays primary</Pill>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {doctorResults.map(({ doctor, affiliations }) => (
                <Card key={doctor.id}>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="text-lg font-display text-ink">{doctor.name}</p>
                      <p className="text-sm text-ink-muted">
                        {doctor.specialty} - {doctor.experienceYears} yrs - {doctor.qualifications}
                      </p>
                    </div>
                    <Pill tone="sage">
                      <CheckCircle2 size={11} /> Verified
                    </Pill>
                  </div>

                  <div className="space-y-2.5">
                    {affiliations.map((affiliation) => {
                      const organization = getOrganization(affiliation.organizationId);
                      return (
                        <div key={affiliation.id} className="rounded-md border border-line bg-paper px-3 py-2.5">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-ink">{organization?.name}</p>
                              <p className="text-xs text-ink-muted">
                                {organization?.type} - {affiliation.label} - INR {affiliation.fee}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-sage-500">{affiliation.nextAvailable}</span>
                              <Link href={`/book?affiliation=${affiliation.id}`} className="btn-primary text-xs py-1.5">
                                <CalendarDays size={13} /> Book
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Link href={`/doctors/${doctor.id}`} className="btn-secondary text-xs mt-4">
                    View doctor profile <ArrowUpRight size={13} />
                  </Link>
                </Card>
              ))}
            </div>
          </section>
        )}

        {showOrganizations && visibleOrganizations.length > 0 && (
          <section>
            <h2 className="font-display text-lg text-ink mb-3">Organizations and care venues</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {visibleOrganizations.map((organization) => (
                <Card key={organization.id}>
                  <div className="flex items-start gap-3">
                    <span className="w-10 h-10 rounded-md bg-brand-50 flex items-center justify-center shrink-0">
                      {organization.type === "Lab" ? (
                        <FlaskConical size={17} className="text-brand-600" />
                      ) : (
                        <Building2 size={17} className="text-brand-600" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">{organization.name}</p>
                      <p className="text-xs text-ink-muted mt-0.5">{organization.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <Pill tone="neutral">{organization.type}</Pill>
                    <Pill tone="neutral">
                      <MapPin size={11} /> {organization.distanceKm} km
                    </Pill>
                    <Pill tone="sage">{organization.rating} rating</Pill>
                  </div>
                  {organization.type === "Clinic" && (
                    <Link href={`/clinics/${organization.id}`} className="btn-secondary text-xs mt-4">
                      View clinic <ArrowUpRight size={13} />
                    </Link>
                  )}
                </Card>
              ))}
            </div>
          </section>
        )}

        {showOrganizations && testResults.length > 0 && (
          <section>
            <h2 className="font-display text-lg text-ink mb-3">Diagnostics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {testResults.map((test) => {
                const lab = getOrganization(test.labOrganizationId);
                return (
                  <Card key={test.id}>
                    <p className="text-sm font-medium text-ink">{test.name}</p>
                    <p className="text-xs text-ink-muted mt-1">{lab?.name}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <Pill tone="neutral">INR {test.price}</Pill>
                      <Pill tone={test.homeCollection ? "sage" : "neutral"}>
                        {test.homeCollection ? "Home collection" : "Lab visit"}
                      </Pill>
                    </div>
                    <p className="text-xs text-sage-500 mt-3">{test.nextAvailable}</p>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {showMedicines && medicineResults.length > 0 && (
          <section>
            <h2 className="font-display text-lg text-ink mb-3">Medicines</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {medicineResults.map((medicine) => {
                const pharmacy = getOrganization(medicine.pharmacyOrganizationId);
                return (
                  <Card key={medicine.id}>
                    <p className="text-sm font-medium text-ink flex items-center gap-2">
                      <PillIcon size={14} className="text-clay-500" /> {medicine.name}
                    </p>
                    <p className="text-xs text-ink-muted mt-1">{pharmacy?.name}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <Pill tone="neutral">{medicine.form}</Pill>
                      <Pill tone={medicine.available ? "sage" : "alert"}>{medicine.available ? "Available" : "Unavailable"}</Pill>
                    </div>
                    <p className="text-xs text-ink-muted mt-3">{medicine.priceRange}</p>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {showServices && serviceResults.length > 0 && (
          <section>
            <h2 className="font-display text-lg text-ink mb-3">Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {serviceResults.map((service) => (
                <Card key={service.id}>
                  <Stethoscope size={16} className="text-brand-600 mb-2" />
                  <p className="text-sm font-medium text-ink">{service.name}</p>
                  <p className="text-xs text-ink-muted mt-1">{service.category}</p>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={null}>
      <DiscoverExperience />
    </Suspense>
  );
}
