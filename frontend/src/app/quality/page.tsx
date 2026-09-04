"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { MetricCard } from "@/components/ui/Card";
import { ShieldCheck, AlertTriangle, ClipboardList, FileText, Users, ShieldAlert } from "lucide-react";
import { MOCK_QC_RUNS, MOCK_NONCONFORMANCES, MOCK_CAPAS } from "@/data/mock/quality";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function QualityPage() {
  const outOfControl = MOCK_QC_RUNS.filter((q) => q.status === "out_of_control").length;
  const openNc = MOCK_NONCONFORMANCES.filter((n) => n.status !== "closed").length;
  const openCapa = MOCK_CAPAS.filter((c) => c.stage !== "closed").length;

  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 8 · Quality Management" title="Quality Overview" subtitle="This portal supports quality workflows — it does not itself certify ISO 15189 or NABL accreditation." />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="QC out of control" value={outOfControl} icon={AlertTriangle} tone={3} href="/quality/qc" />
        <MetricCard label="Open nonconformances" value={openNc} icon={ShieldAlert} tone={1} href="/quality/nonconformance" />
        <MetricCard label="Open CAPAs" value={openCapa} icon={ClipboardList} tone={2} href="/quality/capa" />
        <MetricCard label="Accreditation evidence items" value={12} icon={ShieldCheck} tone={0} href="/quality/documents" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { href: "/quality/qc", label: "QC Runs", icon: ShieldCheck, desc: "Levey–Jennings charts and Westgard rule status" },
          { href: "/quality/nonconformance", label: "Nonconformance", icon: AlertTriangle, desc: "Root-cause investigation workflow" },
          { href: "/quality/capa", label: "CAPA", icon: ClipboardList, desc: "Corrective and preventive action tracking" },
          { href: "/quality/documents", label: "Documents", icon: FileText, desc: "SOP register and approval status" },
          { href: "/quality/audits", label: "Audits", icon: ShieldCheck, desc: "Internal audit schedule and findings" },
          { href: "/quality/competency", label: "Competency", icon: Users, desc: "Staff training and competency matrix" },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded-card">
            <Card className="flex items-start gap-3 p-4 transition-shadow hover:shadow-md">
              <item.icon className="mt-0.5 h-5 w-5 text-brand-blue" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-text-main">{item.label}</p>
                <p className="text-xs text-text-muted">{item.desc}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
