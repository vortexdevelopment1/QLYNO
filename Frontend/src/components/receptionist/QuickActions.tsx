"use client";

import * as React from "react";
import { UserPlus, CalendarPlus, TicketCheck, Siren, BadgeCheck, Search } from "lucide-react";
import { Card, SectionHeader } from "./ui";
import type { ModuleId } from "./nav-config";

const actions: { id: ModuleId; label: string; description: string; icon: React.ReactNode; tone: "pine" | "coral" }[] = [
  { id: "patient-directory", label: "Register patient", description: "Open patients and add a new UHID", icon: <UserPlus size={20} />, tone: "pine" },
  { id: "appointments", label: "Book appointment", description: "Schedule against doctor availability", icon: <CalendarPlus size={20} />, tone: "pine" },
  { id: "check-in", label: "Check-in", description: "Issue a token and notify the doctor", icon: <TicketCheck size={20} />, tone: "pine" },
  { id: "emergency", label: "Emergency registration", description: "Fast-track a critical arrival", icon: <Siren size={20} />, tone: "coral" },
  { id: "visitors", label: "Issue visitor pass", description: "Register a ward visitor", icon: <BadgeCheck size={20} />, tone: "pine" },
  { id: "search", label: "Global search", description: "Find any patient, token or record", icon: <Search size={20} />, tone: "pine" },
];

export function QuickActions({ onNavigate }: { onNavigate: (id: ModuleId) => void }) {
  return (
    <div>
      <SectionHeader
        eyebrow="Front desk · Quick actions"
        title="Quick actions"
        description="Quickly access common reception tasks such as patient registration, appointment booking, check-in, and emergency registration."
      />

      <div className="rp-quick-grid">
        {actions.map((a) => (
          <button key={a.id} className={`rp-quick-card rp-quick-card-${a.tone}`} onClick={() => onNavigate(a.id)}>
            <span className={`rp-quick-icon rp-quick-icon-${a.tone}`}>{a.icon}</span>
            <span className="rp-quick-label">{a.label}</span>
            <span className="rp-quick-desc">{a.description}</span>
          </button>
        ))}
      </div>

      <Card className="mt-5">
        <p className="rp-sub">
          Quick actions jump straight into the relevant module with a ready-to-fill form, so the front desk can
          move through registration, booking, check-in and emergency intake without extra navigation.
        </p>
      </Card>
    </div>
  );
}
