"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import {
  addServiceOffering,
  updateServiceOffering,
  deleteServiceOffering,
} from "@/hospital-admin/store/slices/hospitalProfileSlice";
import { ServiceOffering, ServiceCategory } from "@/hospital-admin/lib/types/hospital-profile";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import {
  Scissors,
  Plus,
  Link2,
  Trash2,
  Edit3,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Activity,
  HeartPulse,
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

export function ServicesPortfolioTab() {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const serviceOfferings = useSelector((state: RootState) => state.hospitalProfile.serviceOfferings);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceOffering | null>(null);

  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<ServiceCategory>("Centers of Excellence");
  const [formDesc, setFormDesc] = useState("");
  const [formCapabilityRef, setFormCapabilityRef] = useState<string>("NONE");
  const [formIsFeatured, setFormIsFeatured] = useState(true);

  const serviceCategories: ServiceCategory[] = [
    "Centers of Excellence",
    "Surgical Specialties",
    "Medical Specialties",
    "Diagnostic & Imaging",
    "Emergency & Critical Care",
    "Rehabilitation & Wellness",
  ];

  const capabilityOptions = [
    { value: "NONE", label: "No Live Capability Link (Static Specialty)" },
    { value: "OT_SURGERY", label: "OT & Surgeries Management (F6 Surgical Suites)", route: "/surgical-cases" },
    { value: "EMERGENCY_TRAUMA", label: "Emergency & Trauma Resuscitation Bay (F3)", route: "/emergency" },
    { value: "AMBULANCE_DISPATCH", label: "ALS / BLS Ambulance Fleet Telemetry (PDF Mod 9)", route: "/ambulance" },
    { value: "ICU_CRITICAL_CARE", label: "Wards & Beds ICU Critical Care (F12)", route: "/wards-beds" },
    { value: "DIAGNOSTIC_RADIOLOGY", label: "Radiology & Imaging Workstation (F14)", route: "/radiology" },
  ];

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormName("");
    setFormCategory("Centers of Excellence");
    setFormDesc("");
    setFormCapabilityRef("NONE");
    setFormIsFeatured(true);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (srv: ServiceOffering) => {
    setEditingService(srv);
    setFormName(srv.name);
    setFormCategory(srv.category);
    setFormDesc(srv.description);
    setFormCapabilityRef(srv.linkedCapabilityRef || "NONE");
    setFormIsFeatured(srv.isFeatured);
    setIsAddModalOpen(true);
  };

  const handleSaveService = () => {
    if (!formName.trim()) {
      toast({ title: "Name Required", description: "Please enter a service name.", variant: "destructive" });
      return;
    }

    const selectedCap = capabilityOptions.find((c) => c.value === formCapabilityRef);
    const linkedCapabilityName = formCapabilityRef !== "NONE" ? selectedCap?.label : undefined;

    if (editingService) {
      dispatch(
        updateServiceOffering({
          ...editingService,
          name: formName,
          category: formCategory,
          description: formDesc,
          linkedCapabilityRef: formCapabilityRef !== "NONE" ? (formCapabilityRef as ServiceOffering["linkedCapabilityRef"]) : undefined,
          linkedCapabilityName,
          isFeatured: formIsFeatured,
        })
      );
      toast({ title: "Service Offering Updated", description: `${formName} updated successfully.` });
    } else {
      dispatch(
        addServiceOffering({
          name: formName,
          category: formCategory,
          description: formDesc,
          linkedCapabilityRef: formCapabilityRef !== "NONE" ? (formCapabilityRef as ServiceOffering["linkedCapabilityRef"]) : undefined,
          linkedCapabilityName,
          isFeatured: formIsFeatured,
          displayOrder: serviceOfferings.length + 1,
        })
      );
      toast({ title: "New Service Added", description: `${formName} added to public portfolio.` });
    }
    setIsAddModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    dispatch(deleteServiceOffering(id));
    toast({ title: "Service Removed", description: `${name} has been removed from public listings.` });
  };

  return (
    <div className="space-y-6">
      {/* Capability Linkage Architecture Notice (F24 CAN #7, Dep Rule #4) */}
      <Card className="border-border shadow-xs bg-muted/20">
        <CardHeader className="p-4 pb-3 border-b border-border/70">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Scissors className="h-4 w-4 text-primary" />
                Clinical Services &amp; Centers of Excellence Portfolio
              </CardTitle>
              <CardDescription className="text-xs">
                Public service offerings link to live tracked capabilities (OT suites, Emergency trauma ratings, Ambulance dispatch) to ensure clinical accuracy without stale manual claims.
              </CardDescription>
            </div>
            <Button size="sm" onClick={handleOpenAdd} className="h-8 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground">
              <Plus className="h-3.5 w-3.5" />
              <span>Add Service Offering</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {serviceOfferings.map((srv) => (
              <Card key={srv.id} className="border border-border/80 bg-card shadow-xs">
                <CardHeader className="p-3.5 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <CardTitle className="text-xs sm:text-sm font-bold text-foreground">
                          {srv.name}
                        </CardTitle>
                        {srv.isFeatured && (
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] px-1.5 py-0">
                            Featured Offering
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="text-[9px] font-mono">
                        {srv.category}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenEdit(srv)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(srv.id, srv.name)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-3.5 pt-1 space-y-2.5 text-xs">
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    {srv.description}
                  </p>

                  {/* Capability Telemetry Sync Badge */}
                  {srv.linkedCapabilityRef ? (
                    <div className="flex items-center justify-between p-2 rounded bg-emerald-500/5 border border-emerald-500/20 text-[10px] text-emerald-800 dark:text-emerald-300">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Link2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>Live Linked: <strong>{srv.linkedCapabilityName || srv.linkedCapabilityRef}</strong></span>
                      </div>
                      <Badge className="bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[8px] px-1 py-0">
                        Operational Sync
                      </Badge>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
                      <span>Static catalog description (No live operational telemetry linked)</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit Service Dialog */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Scissors className="h-4 w-4 text-primary" />
              {editingService ? "Edit Public Service Offering" : "Add New Clinical Service Offering"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure the public presentation and optional linkage to real hospital capability telemetry.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Service / Specialty Title</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Comprehensive Interventional Cardiology & Cath Lab"
                className="text-xs h-9"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Service Category</Label>
                <Select value={formCategory} onValueChange={(val: ServiceCategory) => setFormCategory(val)}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCategories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-xs">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 flex flex-col justify-end">
                <div className="flex items-center justify-between p-2 rounded border border-border">
                  <Label htmlFor="srv-featured" className="text-xs cursor-pointer font-medium">
                    Feature on Public Home
                  </Label>
                  <Switch
                    id="srv-featured"
                    checked={formIsFeatured}
                    onCheckedChange={setFormIsFeatured}
                  />
                </div>
              </div>
            </div>

            {/* Live Capability Link Dropdown */}
            <div className="space-y-1.5 p-3 rounded-lg border border-primary/20 bg-primary/5">
              <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5 text-primary" />
                Link to Live Tracked Clinical Capability
              </Label>
              <Select value={formCapabilityRef} onValueChange={setFormCapabilityRef}>
                <SelectTrigger className="text-xs h-8.5 bg-background">
                  <SelectValue placeholder="Select Capability Source" />
                </SelectTrigger>
                <SelectContent>
                  {capabilityOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">
                Binds public clinical claims directly to active operational modules.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Public Service Description</Label>
              <Textarea
                rows={3}
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Detail procedures, specialized equipment, team credentials, and clinical scope..."
                className="text-xs leading-relaxed"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button size="sm" variant="outline" onClick={() => setIsAddModalOpen(false)} className="h-8 text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveService} className="h-8 text-xs bg-primary text-primary-foreground font-semibold">
              Save Service Offering
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
