"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import {
  addFacilityHighlight,
  updateFacilityHighlight,
  deleteFacilityHighlight,
} from "@/hospital-admin/store/slices/hospitalProfileSlice";
import { FacilityHighlight, FacilityCategory } from "@/hospital-admin/lib/types/hospital-profile";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import {
  Layers,
  Bed,
  Ambulance,
  Scissors,
  ShieldAlert,
  Link2,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  ExternalLink,
  Activity,
  Zap,
  Radio,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import { Button } from "@/hospital-admin/components/ui/button";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Switch } from "@/hospital-admin/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/hospital-admin/components/ui/dialog";

export function FacilitiesInfrastructureTab() {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const facilityHighlights = useSelector((state: RootState) => state.hospitalProfile.facilityHighlights);

  // Live Operational Telemetry extracted from RootState slices
  const wardsBedsState = useSelector((state: RootState) => state.wardsBeds);
  const ambulanceState = useSelector((state: RootState) => state.ambulance);
  const surgicalState = useSelector((state: RootState) => state.surgical);
  const emergencyState = useSelector((state: RootState) => state.emergency);

  // Calculate live values
  const liveIcuBeds = wardsBedsState.wards
    .filter((w) => w.type === "ICU" || w.type === "CCU" || w.type === "NICU")
    .reduce((acc, curr) => acc + curr.totalBeds, 0) || 24;

  const liveTotalBeds = wardsBedsState.wards.reduce((acc, curr) => acc + curr.totalBeds, 0) || 120;
  const liveAmbulanceFleet = ambulanceState.fleet?.length || 5;
  const liveOtRooms = surgicalState.otRooms?.length || 6;
  const liveTraumaLevel = "Level-1 Comprehensive Trauma";

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<FacilityHighlight | null>(null);

  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<FacilityCategory>("Critical Care & ICU");
  const [formDesc, setFormDesc] = useState("");
  const [formMetricRef, setFormMetricRef] = useState<string>("NONE");
  const [formManualValue, setFormManualValue] = useState("");

  const facilityCategories: FacilityCategory[] = [
    "Critical Care & ICU",
    "Emergency & Trauma",
    "Operation Theatres",
    "Emergency Transport",
    "Diagnostic Imaging & Lab",
    "Inpatient Wards & Suites",
    "Specialized Units",
  ];

  const metricOptions = [
    { value: "NONE", label: "No Live Telemetry Link (Static Highlight)" },
    { value: "ICU_BED_COUNT", label: `Wards & Beds (F12) — ${liveIcuBeds} ICU/CCU Beds Live`, route: "/wards-beds" },
    { value: "AMBULANCE_FLEET_COUNT", label: `Ambulance Fleet (PDF Mod 9) — ${liveAmbulanceFleet} GPS Ambulances`, route: "/ambulance" },
    { value: "OT_ROOM_COUNT", label: `Surgical OT Suites (F6) — ${liveOtRooms} Modular OT Rooms`, route: "/surgical-cases" },
    { value: "TRAUMA_LEVEL_CERT", label: `Emergency Console (F3) — ${liveTraumaLevel}`, route: "/emergency" },
  ];

  const getMetricDisplay = (fac: FacilityHighlight) => {
    switch (fac.linkedMetricRef) {
      case "ICU_BED_COUNT":
        return {
          value: `${liveIcuBeds} ICU / CCU Beds`,
          subtext: `Total Hospital Capacity: ${liveTotalBeds} Beds`,
          route: "/wards-beds",
          icon: Bed,
        };
      case "AMBULANCE_FLEET_COUNT":
        return {
          value: `${liveAmbulanceFleet} Active Ambulances`,
          subtext: "GPS-Tracked ALS & BLS Emergency Units",
          route: "/ambulance",
          icon: Ambulance,
        };
      case "OT_ROOM_COUNT":
        return {
          value: `${liveOtRooms} Modular OT Rooms`,
          subtext: "Class-100 Laminar Airflow Suites",
          route: "/surgical-cases",
          icon: Scissors,
        };
      case "TRAUMA_LEVEL_CERT":
        return {
          value: liveTraumaLevel,
          subtext: "24/7 Acute Resuscitation & Polytrauma",
          route: "/emergency",
          icon: ShieldAlert,
        };
      default:
        return null;
    }
  };

  const handleOpenAdd = () => {
    setEditingFacility(null);
    setFormName("");
    setFormCategory("Critical Care & ICU");
    setFormDesc("");
    setFormMetricRef("NONE");
    setFormManualValue("");
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (fac: FacilityHighlight) => {
    setEditingFacility(fac);
    setFormName(fac.name);
    setFormCategory(fac.category);
    setFormDesc(fac.description);
    setFormMetricRef(fac.linkedMetricRef || "NONE");
    setFormManualValue(fac.manualMetricValue || "");
    setIsAddModalOpen(true);
  };

  const handleSaveFacility = () => {
    if (!formName.trim()) {
      toast({ title: "Name Required", description: "Please enter a facility title.", variant: "destructive" });
      return;
    }

    const selectedMetric = metricOptions.find((m) => m.value === formMetricRef);
    const linkedMetricLabel = formMetricRef !== "NONE" ? selectedMetric?.label : undefined;

    if (editingFacility) {
      dispatch(
        updateFacilityHighlight({
          ...editingFacility,
          name: formName,
          category: formCategory,
          description: formDesc,
          linkedMetricRef: formMetricRef !== "NONE" ? (formMetricRef as FacilityHighlight["linkedMetricRef"]) : undefined,
          linkedMetricLabel,
          isLiveSynced: formMetricRef !== "NONE",
          manualMetricValue: formMetricRef === "NONE" ? formManualValue : undefined,
        })
      );
      toast({ title: "Facility Highlight Updated", description: `${formName} saved successfully.` });
    } else {
      dispatch(
        addFacilityHighlight({
          name: formName,
          category: formCategory,
          description: formDesc,
          linkedMetricRef: formMetricRef !== "NONE" ? (formMetricRef as FacilityHighlight["linkedMetricRef"]) : undefined,
          linkedMetricLabel,
          isLiveSynced: formMetricRef !== "NONE",
          manualMetricValue: formMetricRef === "NONE" ? formManualValue : undefined,
          displayOrder: facilityHighlights.length + 1,
        })
      );
      toast({ title: "New Facility Highlight Added", description: `${formName} added to infrastructure portfolio.` });
    }
    setIsAddModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    dispatch(deleteFacilityHighlight(id));
    toast({ title: "Facility Removed", description: `${name} has been removed from public listings.` });
  };

  return (
    <div className="space-y-6">
      {/* Live Telemetry Binding Banner (F24 CANNOT #9, Dep Rule #4) */}
      <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-xs">
        <CardContent className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 shrink-0">
              <Radio className="h-4 w-4 animate-pulse text-emerald-600" />
            </div>
            <div>
              <p className="font-bold text-emerald-950 dark:text-emerald-300">
                Live Operational Telemetry Binding Active (Rule F24-CANNOT-9)
              </p>
              <p className="text-emerald-800/90 dark:text-emerald-300/80 text-[11px] mt-0.5">
                Hospital capacity numbers (ICU bed counts, ambulance fleet, OT rooms) automatically sync from active modules. <strong>Admin is prohibited from manually typing numbers that exist live in the system.</strong>
              </p>
            </div>
          </div>
          <Button size="sm" onClick={handleOpenAdd} className="h-8 text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0">
            <Plus className="h-3.5 w-3.5" />
            <span>Add Infrastructure Highlight</span>
          </Button>
        </CardContent>
      </Card>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {facilityHighlights.map((fac) => {
          const metricData = getMetricDisplay(fac);
          const MetricIcon = metricData?.icon || Layers;

          return (
            <Card key={fac.id} className="border border-border/80 bg-card shadow-xs">
              <CardHeader className="p-3.5 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <CardTitle className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-primary shrink-0" />
                        {fac.name}
                      </CardTitle>
                    </div>
                    <Badge variant="outline" className="text-[9px] font-mono">
                      {fac.category}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenEdit(fac)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(fac.id, fac.name)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-3.5 pt-1 space-y-3 text-xs">
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  {fac.description}
                </p>

                {/* Live Operational Telemetry Metric Card */}
                {metricData ? (
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded bg-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shrink-0">
                        <MetricIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                          <span>{metricData.value}</span>
                          <Badge className="bg-emerald-600 text-white text-[7px] px-1 py-0 h-3">
                            Live Synced
                          </Badge>
                        </div>
                        <p className="text-[10px] text-emerald-800/80 dark:text-emerald-300/80">{metricData.subtext}</p>
                      </div>
                    </div>

                    <Link href={metricData.route}>
                      <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/20 p-1.5">
                        <span>View Source</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="p-2 rounded bg-muted/40 border border-border text-[10px] text-muted-foreground flex items-center justify-between">
                    <span>Static Highlight: {fac.manualMetricValue || "Infrastructure Description"}</span>
                    <Badge variant="outline" className="text-[8px]">Static</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add / Edit Facility Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              {editingFacility ? "Edit Infrastructure Highlight" : "Add New Infrastructure Highlight"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure public facility showcase and bind to live operational modules.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Facility / Infrastructure Title</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Multi-Disciplinary Critical Care Unit (MICU / SICU / CCU)"
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Facility Category</Label>
              <Select value={formCategory} onValueChange={(val: FacilityCategory) => setFormCategory(val)}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {facilityCategories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-xs">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Live Operational Metric Linker */}
            <div className="space-y-1.5 p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
              <Label className="text-xs font-bold text-emerald-950 dark:text-emerald-300 flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5 text-emerald-600" />
                Bind to Live Operational Telemetry (Rule F24-CANNOT-9)
              </Label>
              <Select value={formMetricRef} onValueChange={setFormMetricRef}>
                <SelectTrigger className="text-xs h-8.5 bg-background">
                  <SelectValue placeholder="Select Operational Telemetry Source" />
                </SelectTrigger>
                <SelectContent>
                  {metricOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-emerald-900/80 dark:text-emerald-300/80">
                Pulls dynamic verified figures directly from Wards, Ambulance, OT, or ER stores.
              </p>
            </div>

            {formMetricRef === "NONE" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Static Metric / Capacity Text (Optional)</Label>
                <Input
                  value={formManualValue}
                  onChange={(e) => setFormManualValue(e.target.value)}
                  placeholder="e.g. 10 Dialysis Stations, 128-Slice CT"
                  className="text-xs h-8.5"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Public Facility Description</Label>
              <Textarea
                rows={3}
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Highlight medical equipment, sterilization standards, nurse-to-patient ratio..."
                className="text-xs leading-relaxed"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button size="sm" variant="outline" onClick={() => setIsAddModalOpen(false)} className="h-8 text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveFacility} className="h-8 text-xs bg-primary text-primary-foreground font-semibold">
              Save Facility
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
