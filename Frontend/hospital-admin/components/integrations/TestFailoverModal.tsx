"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/hospital-admin/components/ui/dialog";
import { Button } from "@/hospital-admin/components/ui/button";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { AlertTriangle, ShieldAlert, CheckCircle2, ArrowRight, RefreshCw } from "lucide-react";
import { ConnectorHealthItem } from "@/hospital-admin/lib/types/integrations";

interface TestFailoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  connector: ConnectorHealthItem | null;
  onToggleFailover: (id: string, active: boolean) => void;
}

export function TestFailoverModal({
  isOpen,
  onClose,
  connector,
  onToggleFailover,
}: TestFailoverModalProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);

  if (!connector) return null;

  const handleSimulate = () => {
    setIsSimulating(true);
    setSimulationLog([
      `[T+0ms] Injected mock latency spikes (3,400ms) on ${connector.provider}...`,
      `[T+120ms] HTTP 504 Gateway Timeout detected (Threshold exceeded: > 3 consecutive failures).`,
      `[T+250ms] Circuit Breaker tripped: Transitioned ${connector.name} to DEGRADED state.`,
      `[T+400ms] Automated Failover Triggered ➔ Re-routed outbound traffic to ${connector.failoverTarget || "Secondary Fallback Channel"}.`,
      `[T+550ms] Failover active: Zero packet loss, 100% dispatch continuity maintained.`,
    ]);
    setTimeout(() => {
      onToggleFailover(connector.id, !connector.failoverActive);
      setIsSimulating(false);
    }, 1200);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/10 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <DialogTitle className="text-base font-bold">
              Failover & Circuit Breaker Simulation
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Verifies automated switchover from degraded primary APIs to secondary fallback infrastructure without message or transaction loss.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5 text-xs">
          <div className="rounded-lg bg-muted/40 p-3 border border-border/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">{connector.name}</span>
              <Badge
                className={`text-[10px] ${
                  connector.failoverActive
                    ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                    : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                }`}
              >
                {connector.failoverActive ? "Failover Active" : "Primary Active"}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span>Primary Pipe: <strong className="text-foreground">{connector.provider}</strong></span>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <span>Fallback: <strong className="text-primary">{connector.failoverTarget || "F23 SMS Gateway"}</strong></span>
            </div>
          </div>

          {simulationLog.length > 0 && (
            <div className="rounded-lg bg-black/90 p-3 text-emerald-400 font-mono text-[11px] space-y-1 border border-emerald-500/30">
              {simulationLog.map((log, idx) => (
                <div key={idx} className="leading-tight">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button type="button" size="sm" variant="outline" onClick={onClose} className="h-8 text-xs">
            Close
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isSimulating}
            onClick={handleSimulate}
            className={`h-8 text-xs gap-1 ${
              connector.failoverActive
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-amber-600 hover:bg-amber-700 text-white"
            }`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSimulating ? "animate-spin" : ""}`} />
            {connector.failoverActive ? "Restore Primary Pipe" : "Trigger Failover Simulation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
