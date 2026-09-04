import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, CheckCircle2, MapPin, Star, Stethoscope } from "lucide-react";
import { Card, Pill, SectionHeading } from "@/components/ui";
import { findDoctor, getDoctorAffiliations, getOrganization, getService } from "@/lib/discovery-data";

export default function DoctorProfilePage({ params }: { params: { id: string } }) {
  const doctor = findDoctor(params.id);
  if (!doctor) notFound();

  const affiliations = getDoctorAffiliations(doctor.id);

  return (
    <div>
      <SectionHeading
        eyebrow="Public Doctor Profile"
        title={doctor.name}
        description={`${doctor.specialty} - ${doctor.qualifications} - ${doctor.experienceYears} years experience`}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Pill tone="sage">
                    <CheckCircle2 size={11} /> Qlyno verified
                  </Pill>
                  <Pill tone="neutral">{doctor.specialty}</Pill>
                  <Pill tone="neutral">
                    <Star size={11} className="fill-clay-400 text-clay-400" /> {doctor.rating}
                  </Pill>
                </div>
                <p className="text-sm text-ink-soft leading-relaxed max-w-2xl">
                  {doctor.name} provides consultation, longitudinal patient follow-up and connected care across eligible
                  practice contexts. Patients choose the location and service before booking, so each appointment remains
                  tied to the correct clinic, hospital or solo-practice context.
                </p>
              </div>
              <Link href={`/book?doctor=${doctor.id}`} className="btn-primary shrink-0">
                <CalendarDays size={14} /> Book appointment
              </Link>
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-lg text-ink mb-4">Practice locations</h2>
            <div className="space-y-3">
              {affiliations.map((affiliation) => {
                const organization = getOrganization(affiliation.organizationId);
                return (
                  <div key={affiliation.id} className="rounded-md border border-line bg-paper p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-ink">{organization?.name}</p>
                        <p className="text-xs text-ink-muted mt-0.5">
                          {affiliation.department} - {affiliation.label}
                        </p>
                        <p className="text-xs text-ink-muted mt-1 flex items-center gap-1">
                          <MapPin size={12} /> {organization?.location}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Pill tone="neutral">INR {affiliation.fee}</Pill>
                        <Pill tone="sage">{affiliation.nextAvailable}</Pill>
                        <Link href={`/book?affiliation=${affiliation.id}`} className="btn-primary text-xs py-1.5">
                          Book here
                        </Link>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {affiliation.modes.map((mode) => (
                        <Pill key={mode} tone="neutral">{mode}</Pill>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="font-display text-lg text-ink mb-4">Services</h2>
            <div className="space-y-2.5">
              {Array.from(new Set(affiliations.flatMap((affiliation) => affiliation.serviceIds))).map((serviceId) => {
                const service = getService(serviceId);
                return (
                  <div key={serviceId} className="flex items-center gap-2.5 rounded-md border border-line px-3 py-2">
                    <Stethoscope size={14} className="text-brand-600" />
                    <div>
                      <p className="text-sm text-ink-soft">{service?.name}</p>
                      <p className="text-[11px] text-ink-muted">{service?.category}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-lg text-ink mb-3">Profile rules</h2>
            <div className="space-y-3 text-sm text-ink-soft">
              <p>One doctor identity can be linked to multiple active practice affiliations.</p>
              <p>Fees, slots and appointment ownership stay separate for each clinic, hospital or solo practice.</p>
              <p>Private clinical records remain inside authorized doctor-patient relationships.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
