"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Plus, Trash2, ShieldAlert, Building, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Label } from "@/hospital-admin/components/ui/label";
import { Input } from "@/hospital-admin/components/ui/input";
import { Switch } from "@/hospital-admin/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { useToast } from "@/hospital-admin/hooks/use-toast";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Emergency workflow";

export default function EmergencyConfigPage() {
  const { toast } = useToast();

  const [totalBeds, setTotalBeds] = useState("18");
  const [availableBeds, setAvailableBeds] = useState("5");
  const [resusBays, setResusBays] = useState("4");
  const [icuAvailable, setIcuAvailable] = useState("2");
  const [is24x7, setIs24x7] = useState(true);

  // Capabilities
  const [traumaEnabled, setTraumaEnabled] = useState(true);
  const [strokeEnabled, setStrokeEnabled] = useState(true);
  const [pediatricEnabled, setPediatricEnabled] = useState(false);
  const [cathLabEnabled, setCathLabEnabled] = useState(true);

  // Escalation Ladder
  const [ladder, setLadder] = useState([
    { id: 1, role: "Reception / Triage Desk", threshold: 0 },
    { id: 2, role: "Emergency Coordinator (Suresh Menon)", threshold: 2 },
    { id: 3, role: "Clinical Lead (Dr. Ananya Rao)", threshold: 5 },
    { id: 4, role: "Hospital Admin Director", threshold: 10 },
  ]);

  // Fallback Rules
  const [fallbackRules, setFallbackRules] = useState([
    { id: 1, condition: "No Ack in 10 mins", hospital: "Apollo Spectra Hospital (Chembur)" },
    { id: 2, condition: "ER at 100% capacity", hospital: "Fortis Hospital (Mulund)" },
    { id: 3, condition: "No ICU beds available", hospital: "Hinduja Healthcare (Khar)" },
  ]);

  const handleAddLadderStep = () => {
    const nextId = Date.now();
    setLadder((prev) => [
      ...prev,
      { id: nextId, role: "Duty Medical Officer", threshold: 15 },
    ]);
  };

  const handleRemoveLadderStep = (id: number) => {
    setLadder((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddFallbackRule = () => {
    const nextId = Date.now();
    setFallbackRules((prev) => [
      ...prev,
      { id: nextId, condition: "Critical trauma diversion", hospital: "City Memorial ER" },
    ]);
  };

  const handleRemoveFallbackRule = (id: number) => {
    setFallbackRules((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSave = () => {
    toast({
      title: "Emergency Configuration Saved",
      description: `Hospital capacity, escalation ladders, and fallback routing updated. (${DELEGATION_STRING})`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/hospital-admin/emergency">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <PageHeader
            title="Emergency Settings & Routing Configuration"
            description="Manage live ER capacity, sequential escalation thresholds, and partner fallback routing rules."
            crumbs={[{ label: "Hospital Operations" }, { label: "Emergency Command" }, { label: "Config" }]}
          />
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" /> Save All Configurations
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <ScopeIndicator scope="Hospital Admin" stationName="Emergency Configuration" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-warning" />
          <span>Operational capacity & routing parameters only • Clinical protocols set by Medical Board</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Capacity Config */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building className="h-4 w-4 text-primary" /> Hospital Emergency Capacity & Resources
            </CardTitle>
            <CardDescription>
              Configure live resource availability broadcasted to the Qlyno Emergency Network.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="t-beds">Total ER Beds</Label>
                <Input id="t-beds" type="number" value={totalBeds} onChange={(e) => setTotalBeds(e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="a-beds">Available ER Beds</Label>
                <Input id="a-beds" type="number" value={availableBeds} onChange={(e) => setAvailableBeds(e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="r-bays">Resuscitation Bays</Label>
                <Input id="r-bays" type="number" value={resusBays} onChange={(e) => setResusBays(e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="i-beds">Available ICU Beds</Label>
                <Input id="i-beds" type="number" value={icuAvailable} onChange={(e) => setIcuAvailable(e.target.value)} />
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="network-signal" className="font-semibold text-xs text-foreground">
                      Publish Emergency Capacity Signal to Qlyno Network
                    </Label>
                    <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-1 rounded">
                      PROPOSED (PRD 22)
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Broadcast live ER/ICU capacity telemetry to Qlyno central router (last broadcast: Just now)</p>
                </div>
                <Switch id="network-signal" defaultChecked={true} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="24x7">24/7 Continuous Emergency Operations</Label>
                  <p className="text-xs text-muted-foreground">Always active for incoming SOS routing</p>
                </div>
                <Switch id="24x7" checked={is24x7} onCheckedChange={setIs24x7} />
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Clinical Capability Flags
              </h4>
              <div className="flex items-center justify-between">
                <Label htmlFor="trauma">Level 1 Trauma Center Active</Label>
                <Switch id="trauma" checked={traumaEnabled} onCheckedChange={setTraumaEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="stroke">Comprehensive Stroke Center (CT/tPA Ready)</Label>
                <Switch id="stroke" checked={strokeEnabled} onCheckedChange={setStrokeEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="ped">Pediatric Emergency Unit (Specialized PICU)</Label>
                <Switch id="ped" checked={pediatricEnabled} onCheckedChange={setPediatricEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="cath">24/7 Primary PCI / Cardiac Cath Lab</Label>
                <Switch id="cath" checked={cathLabEnabled} onCheckedChange={setCathLabEnabled} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Escalation Ladder Config */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" /> Auto-Escalation Ladder
              </CardTitle>
              <CardDescription>
                Sequential notification chain for unacknowledged incoming emergency alerts.
              </CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={handleAddLadderStep}>
              <Plus className="mr-1 h-3.5 w-3.5" /> Add Tier
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {ladder.map((step, index) => (
              <div
                key={step.id}
                className="flex items-center justify-between gap-3 p-3 border rounded-lg bg-card text-sm"
              >
                <div className="flex items-center gap-2 flex-1">
                  <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                    {index + 1}
                  </span>
                  <div className="grid gap-1 flex-1">
                    <Input
                      defaultValue={step.role}
                      className="h-8 text-xs font-medium"
                      onChange={(e) => {
                        step.role = e.target.value;
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      defaultValue={step.threshold}
                      className="w-16 h-8 text-xs text-right"
                      onChange={(e) => {
                        step.threshold = Number(e.target.value);
                      }}
                    />
                    <span className="text-xs text-muted-foreground">mins</span>
                  </div>
                  {ladder.length > 2 && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleRemoveLadderStep(step.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Fallback / Transfer Routing Rules */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Hospital Fallback & Transfer Routing Rules
              </CardTitle>
              <CardDescription>
                Automated re-routing policies when primary reception fails or capacity is fully exhausted.
              </CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={handleAddFallbackRule}>
              <Plus className="mr-1 h-3.5 w-3.5" /> Add Rule
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {fallbackRules.map((rule, idx) => (
              <div
                key={rule.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 border rounded-lg bg-card text-sm"
              >
                <div className="flex items-center gap-2 flex-1 w-full">
                  <span className="text-xs font-bold text-muted-foreground w-14">Rule #{idx + 1}:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                    <Input
                      defaultValue={rule.condition}
                      placeholder="Condition (e.g. No Ack in 10 mins)"
                      className="h-8 text-xs"
                      onChange={(e) => {
                        rule.condition = e.target.value;
                      }}
                    />
                    <Input
                      defaultValue={rule.hospital}
                      placeholder="Fallback Hospital Destination"
                      className="h-8 text-xs"
                      onChange={(e) => {
                        rule.hospital = e.target.value;
                      }}
                    />
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive self-end sm:self-center"
                  onClick={() => handleRemoveFallbackRule(rule.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
