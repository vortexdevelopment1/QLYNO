"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import {
  Pill,
  ExternalLink,
  CheckCircle2,
  Cpu,
  Layers,
  Activity,
  ShieldCheck,
  Building2,
  Scan,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/hospital-admin/components/ui/card";
import { IntegrationsNav } from "@/hospital-admin/components/integrations/integrations-nav";
import { mockConnectors } from "@/hospital-admin/lib/mock-data/integrations";

export default function PharmacyIntegrationsPage() {
  const connectors = useSelector(
    (s: RootState) => s.integrations?.connectors || mockConnectors
  );

  const pharmacyConnectors = connectors.filter((c) => c.category === "Pharmacy");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-xs font-semibold text-purple-600 dark:text-purple-400">
                Hardware & Drug Index
              </span>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Pharmacy Scanners & National Drug Database Interfacing
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Technical connection health for dispensing counter barcode/RFID scanning hardware and external Schedule H1 drug pricing database synchronization — feeding Pharmacy (F15).
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            asChild
            className="h-8 gap-1 text-xs"
          >
            <a href="/hospital-admin/pharmacy">
              <span>Open Pharmacy Dispensing</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </div>

      {/* Navigation Sub-Menu */}
      <IntegrationsNav />

      {/* Main Body */}
      <div className="flex-1 space-y-6 p-6">
        {/* Pharmacy Hardware & Drug Database Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {pharmacyConnectors.map((conn) => (
            <Card key={conn.id} className="border-border/80 shadow-sm bg-card flex flex-col justify-between">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600">
                      <Scan className="h-4.5 w-4.5" />
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
                <div className="space-y-1 border-t border-border/60 pt-2">
                  <div className="flex justify-between">
                    <span>Connection Protocol:</span>
                    <span className="font-mono text-foreground font-semibold">{conn.securityProtocol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Scan Latency:</span>
                    <span className="font-mono text-emerald-600 font-bold">{conn.latencyMs} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Scans / Lookups Today:</span>
                    <span className="font-mono text-foreground font-semibold">
                      {conn.dailyQuotaUsed.toLocaleString()} operations
                    </span>
                  </div>
                </div>

                <div className="p-2 rounded bg-muted/40 font-mono text-[10px] text-foreground border border-border/60 truncate">
                  Ingress: {conn.endpointUrl}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Counter Hardware Subnet Status */}
        <Card className="border-border/80 shadow-sm bg-card">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-purple-600" />
              <span>Dispensing Counter Hardware Subnet Telemetry</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Live loopback connection status for physical barcode scanners at outpatient pharmacy counters.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((counter) => (
                <div
                  key={counter}
                  className="rounded-lg border border-border/80 p-3 bg-muted/20 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-foreground block">
                      Counter #{counter} Scanner
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      USB-HID (Zebra DS2208)
                    </span>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px]">
                    Online (12ms)
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
