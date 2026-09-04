"use client";

import { EntityHeader } from "@/components/ui/EntityHeader";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { MOCK_MANIFESTS } from "@/data/mock/specimens";

export default function LogisticsRoutesPage() {
  const routes = Array.from(new Set(MOCK_MANIFESTS.map((m) => m.route)));

  return (
    <div className="space-y-6">
      <EntityHeader eyebrow="Module 5 · Logistics & Referrals" title="Routes" subtitle="Active courier routes and their current manifest status." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {routes.map((route) => {
          const manifests = MOCK_MANIFESTS.filter((m) => m.route === route);
          return (
            <Card key={route} className="p-5">
              <h3 className="text-sm font-semibold text-text-main">{route}</h3>
              <ul className="mt-3 space-y-2">
                {manifests.map((m) => (
                  <li key={m.id} className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">{m.id} · {m.courier}</span>
                    <StatusBadge status={m.status} />
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
