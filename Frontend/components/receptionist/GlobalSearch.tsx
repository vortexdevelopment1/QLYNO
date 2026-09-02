"use client";

import * as React from "react";
import { Search, User, CalendarCheck, BedDouble, BadgeCheck } from "lucide-react";
import { Card, SectionHeader, Input, Badge, Mono, EmptyState } from "./ui";
import { useReceptionistData } from "./data-context";

export function GlobalSearch({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (query: string) => void;
}) {
  const { patients, appointments, admissions, visitors } = useReceptionistData();

  const q = query.trim().toLowerCase();
  const patientResults = q ? patients.filter((p) => p.name.toLowerCase().includes(q) || p.uhid.toLowerCase().includes(q)) : [];
  const appointmentResults = q ? appointments.filter((a) => a.patient.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)) : [];
  const admissionResults = q ? admissions.filter((a) => a.patient.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)) : [];
  const visitorResults = q ? visitors.filter((v) => v.name.toLowerCase().includes(q) || v.id.toLowerCase().includes(q)) : [];

  const totalResults = patientResults.length + appointmentResults.length + admissionResults.length + visitorResults.length;

  return (
    <div>
      <SectionHeader
        eyebrow="Front desk · Search"
        title="Global search"
        description="Search patients, appointments, visitors, doctors, admissions, registrations and tokens instantly from a centralized search module."
      />

      <Card>
        <div className="relative mb-5">
          <Search size={16} className="rp-input-icon" />
          <Input
            className="!pl-9 !text-base !py-3"
            placeholder="Search anything — name, UHID, appointment ID, token…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            autoFocus
          />
        </div>

        {!q && <EmptyState title="Start typing to search" description="Results across patients, appointments, admissions and visitors appear here." />}

        {q && totalResults === 0 && (
          <EmptyState title="No results found" description={`Nothing matches "${query}" across patients, appointments, admissions or visitors.`} />
        )}

        {patientResults.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2"><User size={14} /><h3 className="rp-h3">Patients</h3></div>
            <ul className="rp-list">
              {patientResults.map((p) => (
                <li key={p.uhid} className="rp-list-row">
                  <div className="flex-1 min-w-0">
                    <p className="rp-list-title">{p.name}</p>
                    <p className="rp-list-sub"><Mono>{p.uhid}</Mono> · {p.department}</p>
                  </div>
                  <Badge tone="pine">{p.status}</Badge>
                </li>
              ))}
            </ul>
          </div>
        )}

        {appointmentResults.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2"><CalendarCheck size={14} /><h3 className="rp-h3">Appointments</h3></div>
            <ul className="rp-list">
              {appointmentResults.map((a) => (
                <li key={a.id} className="rp-list-row">
                  <Mono>{a.id}</Mono>
                  <div className="flex-1 min-w-0">
                    <p className="rp-list-title">{a.patient}</p>
                    <p className="rp-list-sub">{a.doctor} · {a.date}, {a.time}</p>
                  </div>
                  <Badge tone="slate">{a.status}</Badge>
                </li>
              ))}
            </ul>
          </div>
        )}

        {admissionResults.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2"><BedDouble size={14} /><h3 className="rp-h3">Admissions</h3></div>
            <ul className="rp-list">
              {admissionResults.map((a) => (
                <li key={a.id} className="rp-list-row">
                  <Mono>{a.id}</Mono>
                  <div className="flex-1 min-w-0">
                    <p className="rp-list-title">{a.patient}</p>
                    <p className="rp-list-sub">{a.ward} · {a.bed}</p>
                  </div>
                  <Badge tone="slate">{a.status}</Badge>
                </li>
              ))}
            </ul>
          </div>
        )}

        {visitorResults.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2"><BadgeCheck size={14} /><h3 className="rp-h3">Visitors</h3></div>
            <ul className="rp-list">
              {visitorResults.map((v) => (
                <li key={v.id} className="rp-list-row">
                  <Mono>{v.id}</Mono>
                  <div className="flex-1 min-w-0">
                    <p className="rp-list-title">{v.name}</p>
                    <p className="rp-list-sub">Visiting {v.visiting}</p>
                  </div>
                  <Badge tone="slate">{v.status}</Badge>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}
