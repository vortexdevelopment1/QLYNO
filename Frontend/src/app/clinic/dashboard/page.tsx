import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading, Card, Avatar, AvailabilityDot, StatusBadge, Pill } from "@/components/ui";
import { clinic, doctors, appointments, staff, tasks, getPatient, getDoctor } from "@/lib/mock-data";
import { CURRENT_DATE_ISO } from "@/lib/app-time";

const TODAY = CURRENT_DATE_ISO;

export default function ClinicDashboard() {
  const todays = appointments.filter((a) => a.date === TODAY).sort((a, b) => a.time.localeCompare(b.time));
  const waiting = todays.filter((a) => a.status === "Checked In").length;
  const cancelled = appointments.filter((a) => a.status === "Cancelled" || a.status === "No Show").length;

  return (
    <div>
      <SectionHeading
        eyebrow="Clinic Operations · Clinic Dashboard"
        title={clinic.name}
        description={`${clinic.locations.length} locations · ${doctors.length} doctors · ${clinic.timings}`}
      />

      <div className="vitals-strip mb-8">
        <div className="vitals-cell">
          <span className="vitals-label">Appointments Today</span>
          <span className="vitals-value">
            {todays.length}
            <span className="vitals-unit">clinic-wide</span>
          </span>
        </div>
        <div className="vitals-cell">
          <span className="vitals-label">Waiting Now</span>
          <span className="vitals-value">
            {waiting}
            <span className="vitals-unit">patients</span>
          </span>
        </div>
        <div className="vitals-cell">
          <span className="vitals-label">Doctors Available</span>
          <span className="vitals-value">
            {doctors.filter((d) => d.availability === "Available").length}
            <span className="vitals-unit">of {doctors.length}</span>
          </span>
        </div>
        <div className="vitals-cell">
          <span className="vitals-label">Cancellations</span>
          <span className="vitals-value">
            {cancelled}
            <span className="vitals-unit">this month</span>
          </span>
        </div>
        <div className="vitals-cell">
          <span className="vitals-label">Staff Tasks Open</span>
          <span className="vitals-value">
            {tasks.filter((t) => t.status !== "Done").length}
            <span className="vitals-unit">pending</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card padded={false}>
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="font-display text-lg text-ink">Clinic Today — All Doctors</h2>
              <Link href="/clinic/schedules" className="btn-ghost text-xs">
                Schedules <ArrowUpRight size={13} />
              </Link>
            </div>
            <table className="w-full table-clean">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {todays.map((a) => {
                  const patient = getPatient(a.patientId);
                  const doctor = getDoctor(a.doctorId);
                  return (
                    <tr key={a.id}>
                      <td className="font-mono text-xs">{a.time}</td>
                      <td>{patient?.name}</td>
                      <td>{doctor?.name}</td>
                      <td>
                        <StatusBadge status={a.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          <Card>
            <h2 className="font-display text-lg text-ink mb-4">Clinic Performance (Last 30 Days)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Appointments", value: "312" },
                { label: "Utilization Rate", value: "78%" },
                { label: "Avg. Wait Time", value: "9 min" },
                { label: "Patient Satisfaction", value: "4.7 / 5" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-mono text-2xl text-ink">{s.value}</p>
                  <p className="text-[11px] text-ink-muted mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg text-ink">Doctor Availability</h2>
              <Link href="/clinic/doctors" className="btn-ghost text-xs">
                Manage <ArrowUpRight size={13} />
              </Link>
            </div>
            <div className="space-y-3">
              {doctors.map((d) => (
                <div key={d.id} className="flex items-center gap-2.5">
                  <Avatar initials={d.avatarInitials} size={30} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-ink truncate">{d.name}</p>
                    <p className="text-xs text-ink-muted truncate">{d.specialty}</p>
                  </div>
                  <AvailabilityDot status={d.availability} />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg text-ink">Staff Tasks</h2>
              <Link href="/clinic/staff" className="btn-ghost text-xs">
                Staff <ArrowUpRight size={13} />
              </Link>
            </div>
            <div className="space-y-3">
              {tasks.map((t) => (
                <div key={t.id} className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-ink-soft leading-snug">{t.title}</p>
                    <p className="text-[11px] text-ink-faint mt-0.5">{t.ownerName}</p>
                  </div>
                  <Pill tone={t.status === "Done" ? "sage" : t.priority === "High" ? "alert" : "clay"}>
                    {t.status === "Done" ? "Done" : t.priority}
                  </Pill>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
