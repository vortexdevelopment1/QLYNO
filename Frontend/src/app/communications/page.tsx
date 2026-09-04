"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Badge";
import { MessageSquare, Mail, Bell } from "lucide-react";
import { HospitalWorkflowCard } from "@/components/domain/HospitalWorkflowCard";
import { useDemo } from "@/state/demo-context";

const CHANNELS = [
  { id: "sms", label: "SMS", icon: MessageSquare, sent: 214, failed: 3 },
  { id: "email", label: "Email", icon: Mail, sent: 189, failed: 1 },
  { id: "whatsapp", label: "WhatsApp", icon: MessageSquare, sent: 302, failed: 8 },
  { id: "push", label: "Push (Portal)", icon: Bell, sent: 96, failed: 0 },
];

export default function CommunicationsPage() {
  const { session } = useDemo();
  return (
    <div className="space-y-6">
      {session?.billingOwner === "HMS_CENTRAL" && <HospitalWorkflowCard compact />}
      <EntityHeader eyebrow="Module 11 · Portals & Communication" title="Communications" subtitle="Channel delivery overview across notification templates." />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CHANNELS.map((c) => (
          <Card key={c.id} className="p-4">
            <div className="flex items-center gap-2">
              <c.icon className="h-4 w-4 text-brand-blue" aria-hidden="true" />
              <p className="text-sm font-semibold text-text-main">{c.label}</p>
            </div>
            <p className="mt-2 text-2xl font-semibold text-text-main">{c.sent}</p>
            <p className="text-xs text-text-muted">sent today</p>
            {c.failed > 0 && <Chip tone="critical" className="mt-2">{c.failed} failed — retry available</Chip>}
          </Card>
        ))}
      </div>
      <Card className="p-5">
        <h3 className="mb-2 text-sm font-semibold text-text-main">Report-ready notification preview</h3>
        <p className="mb-3 text-xs text-text-muted">Clinical values are never shown inside an ordinary SMS/WhatsApp preview — only a secure report-available message.</p>
        <div className="max-w-sm rounded-xl border border-app-border bg-app-bg p-3 text-sm text-text-main">
          &ldquo;Your lab report from HMS Diagnostics is ready. View it securely via the patient portal or contact your care team for details.&rdquo;
        </div>
      </Card>
    </div>
  );
}
