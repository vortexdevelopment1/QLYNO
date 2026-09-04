import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, CalendarDays, CheckCircle2, MapPin, Star, Users } from "lucide-react";
import { Card, Pill, SectionHeading } from "@/components/ui";
import { doctors } from "@/lib/mock-data";
import { doctorAffiliations, getOrganization, getService } from "@/lib/discovery-data";

export default function ClinicProfilePage({ params }: { params: { id: string } }) {
  const clinic = getOrganization(params.id);
  if (!clinic || clinic.type !== "Clinic") notFound();

  const clinicAffiliations = doctorAffiliations.filter(
    (affiliation) => affiliation.organizationId === clinic.id && affiliation.status === "Active"
  );
  const clinicDoctors = clinicAffiliations
    .map((affiliation) => doctors.find((doctor) => doctor.id === affiliation.doctorId))
    .filter(Boolean);

  return (
    <div>
      <SectionHeading
        eyebrow="Public Clinic Profile"
        title={clinic.name}
        description={clinic.description}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Pill tone="sage">
                    <CheckCircle2 size={11} /> Verified clinic
                  </Pill>
                  <Pill tone="neutral">
                    <MapPin size={11} /> {clinic.location}
                  </Pill>
                  <Pill tone="neutral">
                    <Star size={11} className="fill-clay-400 text-clay-400" /> {clinic.rating}
                  </Pill>
                </div>
                <p className="text-sm text-ink-soft leading-relaxed max-w-2xl">
                  This clinic profile represents the shared organization layer. Patients can discover the clinic, compare
                  eligible doctors and services, then book a specific doctor without duplicating patient or doctor identity.
                </p>
              </div>
              <Link href="/discover?type=clinic" className="btn-secondary shrink-0">
                Find care <ArrowUpRight size={14} />
              </Link>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg text-ink">Doctors at this clinic</h2>
              <Pill tone="brand">
                <Users size={11} /> {clinicDoctors.length} doctors
              </Pill>
            </div>
            <div className="space-y-3">
              {clinicAffiliations.map((affiliation) => {
                const doctor = doctors.find((item) => item.id === affiliation.doctorId);
                if (!doctor) return null;
                return (
                  <div key={affiliation.id} className="rounded-md border border-line bg-paper p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-ink">{doctor.name}</p>
                        <p className="text-xs text-ink-muted mt-0.5">
                          {doctor.specialty} - {affiliation.department} - INR {affiliation.fee}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Pill tone="sage">{affiliation.nextAvailable}</Pill>
                        <Link href={`/doctors/${doctor.id}`} className="btn-secondary text-xs py-1.5">
                          Profile
                        </Link>
                        <Link href={`/book?affiliation=${affiliation.id}`} className="btn-primary text-xs py-1.5">
                          <CalendarDays size={13} /> Book
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="font-display text-lg text-ink mb-4">Clinic services</h2>
            <div className="flex flex-wrap gap-2">
              {clinic.services.map((service) => (
                <Pill key={service} tone="neutral">{service}</Pill>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-lg text-ink mb-4">Bookable Qlyno services</h2>
            <div className="space-y-2.5">
              {Array.from(new Set(clinicAffiliations.flatMap((affiliation) => affiliation.serviceIds))).map((serviceId) => {
                const service = getService(serviceId);
                return (
                  <div key={serviceId} className="rounded-md border border-line px-3 py-2">
                    <p className="text-sm font-medium text-ink-soft">{service?.name}</p>
                    <p className="text-[11px] text-ink-muted">{service?.category}</p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
