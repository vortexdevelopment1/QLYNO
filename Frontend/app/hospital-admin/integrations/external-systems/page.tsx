"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import {
  Cpu,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Radio,
  Clock,
  Fingerprint,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/hospital-admin/components/ui/card";
import { IntegrationsNav } from "@/hospital-admin/components/integrations/integrations-nav";
import { mockConnectors, mockABDMMilestones } from "@/hospital-admin/lib/mock-data/integrations";

export default function ExternalSystemsIntegrationPage() {
  const connectors = useSelector(
    (s: RootState) => s.integrations?.connectors || mockConnectors
  );
  const abdmMilestones = useSelector(
    (s: RootState) => s.integrations?.abdmMilestones || mockABDMMilestones
  );

  const extConnectors = connectors.filter((c) => c.category === "External Systems");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                Ecosystem Interoperability
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                External Systems & Statutory Interoperability Gateway
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Ayushman Bharat Digital Mission (ABDM M1/M2/M3), HL7/FHIR R4 interoperability, Radiology PACS DICOM routing, Ambulance GPS, and Biometric attendance hardware.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Menu */}
      <IntegrationsNav />

      {/* Main Body */}
      <div className="flex-1 space-y-6 p-6">
        {/* ABDM / ABHA Statutory Milestones Card */}
        <Card className="border-border/80 shadow-sm bg-card">
          <CardHeader className="p-4 pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  <span>Ayushman Bharat Digital Mission (ABDM / ABHA) Compliance Matrix</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  National Health Authority (NHA) certified endpoints for citizen health records interoperability.
                </CardDescription>
              </div>

              <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-semibold">
                NHA Certified HIP / HIU
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {abdmMilestones.map((m) => (
                <div
                  key={m.milestone}
                  className="rounded-lg border border-border/80 p-3.5 bg-card space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="font-mono text-[10px] font-bold">
                        Milestone {m.milestone}
                      </Badge>
                      <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px]">
                        {m.status}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-foreground text-xs">{m.title}</h4>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      {m.description}
                    </p>
                  </div>

                  <div className="border-t border-border/60 pt-2 text-[11px] text-muted-foreground space-y-0.5 font-mono">
                    <div className="flex justify-between">
                      <span>Records Linked:</span>
                      <span className="font-bold text-foreground">{m.recordsPushedCount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Audit Validated:</span>
                      <span>{m.lastAuditDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Other External Technical Connectors */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {extConnectors.map((conn) => (
            <Card key={conn.id} className="border-border/80 shadow-sm bg-card flex flex-col justify-between">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
                      <Cpu className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold text-foreground">
                        {conn.name}
                      </CardTitle>
                      <p className="text-[10px] text-muted-foreground font-mono">{conn.provider}</p>
                    </div>
                  </div>

                  <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px]">
                    {conn.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-2.5 text-xs text-muted-foreground">
                <div className="grid grid-cols-2 gap-2 border-t border-border/60 pt-2">
                  <div>
                    <span>Uptime:</span>
                    <span className="font-bold text-foreground font-mono block">
                      {conn.uptimePercentage}%
                    </span>
                  </div>
                  <div>
                    <span>Latency:</span>
                    <span className="font-mono text-emerald-600 font-bold block">
                      {conn.latencyMs} ms
                    </span>
                  </div>
                  <div>
                    <span>Protocol:</span>
                    <span className="font-mono text-foreground block">{conn.securityProtocol}</span>
                  </div>
                  <div>
                    <span>Daily Packets:</span>
                    <span className="font-mono text-foreground block">
                      {conn.dailyQuotaUsed.toLocaleString()} ops
                    </span>
                  </div>
                </div>

                <div className="p-2 rounded bg-muted/40 font-mono text-[10px] text-foreground border border-border/60 truncate">
                  Socket: {conn.endpointUrl}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
