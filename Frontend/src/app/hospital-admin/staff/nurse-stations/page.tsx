"use client";

import { HeartPulse, Plus } from "lucide-react";

import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { StatusBadge } from "@/hospital-admin/components/shared/status-badge";
import { nurseStations } from "@/hospital-admin/lib/mock-data/hospital-operations";

export default function NurseStationsPage() {
  return (
    <div>
      <PageHeader
        title="Nurse Stations"
        description="Operational nursing units, department coverage and shift-level staffing visibility."
        crumbs={[{ label: "Hospital Operations" }, { label: "Nurse Stations" }]}
        actions={
          <Button>
            <Plus /> Add station
          </Button>
        }
      />

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        {nurseStations.map((station) => (
          <Card key={station.id}>
            <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
              <div>
                <CardTitle className="text-base">{station.name}</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">{station.department} · {station.location}</p>
              </div>
              <StatusBadge status={station.status} />
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Lead</span>
                <span className="font-medium text-foreground">{station.leadName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Capacity</span>
                <span className="font-medium text-foreground">{station.occupancy}/{station.capacity}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shift coverage</span>
                <span className="font-medium text-foreground">{station.shiftCoverage}</span>
              </div>
              <div className="pt-1">
                <Badge variant="outline" className="flex items-center gap-1.5">
                  <HeartPulse className="h-3.5 w-3.5" /> Nursing command
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
