"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import {
  toggleDoctorFeatured,
  updateDoctorBio,
  reorderDoctors,
} from "@/hospital-admin/store/slices/hospitalProfileSlice";
import { DoctorFeature } from "@/hospital-admin/lib/types/hospital-profile";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import {
  Users,
  CheckCircle2,
  AlertOctagon,
  ShieldCheck,
  ShieldAlert,
  Edit3,
  ExternalLink,
  Lock,
  Search,
  Stethoscope,
  Building2,
  Info,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/hospital-admin/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Button } from "@/hospital-admin/components/ui/button";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Switch } from "@/hospital-admin/components/ui/switch";
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/hospital-admin/components/ui/dialog";

export function DoctorsCurationTab() {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const doctorFeatures = useSelector((state: RootState) => state.hospitalProfile.doctorFeatures);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<DoctorFeature | null>(null);
  const [editBio, setEditBio] = useState("");
  const [editHighlight, setEditHighlight] = useState("");

  const filteredDocs = doctorFeatures.filter((doc) => {
    const matchesSearch =
      doc.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.registrationNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVerified = !filterVerifiedOnly || doc.isVerified;
    return matchesSearch && matchesVerified;
  });

  const verifiedCount = doctorFeatures.filter((d) => d.isVerified).length;
  const featuredCount = doctorFeatures.filter((d) => d.featured).length;

  const handleToggleFeatured = (doctor: DoctorFeature) => {
    // Enforcement of Rule CANNOT #2 & Dep Rule #3
    if (!doctor.isVerified) {
      toast({
        title: "Selection Blocked — Verification Required",
        description: `Cannot feature ${doctor.doctorName} because their status is "${doctor.publicSearchStatus}". Only verified physicians can be showcased.`,
        variant: "destructive",
      });
      return;
    }

    dispatch(toggleDoctorFeatured(doctor.doctorId));
    toast({
      title: doctor.featured ? "Doctor Unfeatured" : "Doctor Featured on Public Profile",
      description: `Public search visibility updated for ${doctor.doctorName}.`,
    });
  };

  const handleOpenEditBio = (doc: DoctorFeature) => {
    setEditingDoctor(doc);
    setEditBio(doc.publicBio);
    setEditHighlight(doc.specialtyHighlight || doc.specialty);
  };

  const handleSaveBio = () => {
    if (editingDoctor) {
      dispatch(
        updateDoctorBio({
          doctorId: editingDoctor.doctorId,
          publicBio: editBio,
          specialtyHighlight: editHighlight.trim() || undefined,
        })
      );
      toast({
        title: "Public Bio Saved",
        description: `Custom biography and specialty focus updated for ${editingDoctor.doctorName}.`,
      });
      setEditingDoctor(null);
    }
  };

  const handleOrderChange = (doctorId: string, newOrder: number) => {
    if (newOrder >= 1) {
      dispatch(reorderDoctors({ doctorId, newOrder }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Verification Gate & Boundary Notice (F24 CAN #8, CANNOT #2, #3, Dep Rule #3) */}
      <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-xs">
        <CardContent className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-emerald-950 dark:text-emerald-300">
                Module 13 Doctor Verification Gate Active ({verifiedCount}/{doctorFeatures.length} Doctors Verified)
              </p>
              <p className="text-emerald-800/90 dark:text-emerald-300/80 text-[11px] mt-0.5">
                Per Rule 13.1 &amp; F24 Rule 8: <strong>Only clinicians with verified medical credentials and confirmed hospital affiliations are selectable for public search featuring.</strong> Core degrees and council licenses are managed strictly inside Doctor Management.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/hospital-admin/doctors">
              <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1.5 border-emerald-500/30 text-emerald-800 dark:text-emerald-300">
                <Stethoscope className="h-3 w-3" />
                <span>Doctor Registry</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </Button>
            </Link>
            <Link href="/hospital-admin/verification/doctor-affiliations">
              <Button size="sm" className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-1.5">
                <ShieldCheck className="h-3 w-3" />
                <span>Verification Console</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search doctor name, specialty, or license..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Switch
              checked={filterVerifiedOnly}
              onCheckedChange={setFilterVerifiedOnly}
              id="verified-only-filter"
            />
            <Label htmlFor="verified-only-filter" className="text-xs cursor-pointer">
              Verified Clinicians Only ({verifiedCount})
            </Label>
          </div>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredDocs.map((doc) => {
          const canFeature = doc.isVerified;

          return (
            <Card
              key={doc.doctorId}
              className={`border transition-all ${
                doc.featured
                  ? "border-primary/40 bg-card shadow-xs"
                  : doc.isVerified
                  ? "border-border/80 bg-card/60"
                  : "border-destructive/30 bg-destructive/5 opacity-80"
              }`}
            >
              <CardContent className="p-3.5 space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <Avatar className="h-11 w-11 border border-border shrink-0">
                    <AvatarImage src={doc.avatarUrl} alt={doc.doctorName} />
                    <AvatarFallback className="text-xs font-bold bg-muted">
                      {doc.doctorName.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <h4 className="font-bold text-foreground text-xs sm:text-sm flex items-center gap-1.5">
                          {doc.doctorName}
                          {doc.isVerified ? (
                            <Badge className="bg-emerald-600 text-white text-[8px] px-1 py-0 h-3.5">
                              ✓ Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-rose-700 bg-rose-500/10 border-rose-500/30 text-[8px] px-1 py-0 h-3.5">
                              <Lock className="h-2 w-2 mr-0.5" /> Unverified
                            </Badge>
                          )}
                        </h4>
                        <p className="text-[11px] text-muted-foreground font-medium">{doc.specialty}</p>
                      </div>

                      {/* Featured Toggle with Verification Lock */}
                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {doc.featured ? "Featured" : "Hidden"}
                        </span>
                        <Switch
                          checked={doc.featured}
                          disabled={!canFeature}
                          onCheckedChange={() => handleToggleFeatured(doc)}
                          className="scale-80"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground font-mono">
                      <span>{doc.qualification}</span>
                      <span>•</span>
                      <span>Reg: {doc.registrationNo}</span>
                      <span>•</span>
                      <span>{doc.affiliationType}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badges & Warnings */}
                {!doc.isVerified && (
                  <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 flex items-center justify-between text-[10px] text-rose-800 dark:text-rose-300">
                    <div className="flex items-center gap-1.5 font-medium">
                      <AlertOctagon className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                      <span>Status: <strong>{doc.publicSearchStatus}</strong></span>
                    </div>
                    <span className="text-[9px] underline">Verification Required</span>
                  </div>
                )}

                {/* Public Biography Snippet */}
                <p className="text-muted-foreground text-[11px] leading-relaxed line-clamp-2 bg-muted/30 p-2 rounded border border-border/50">
                  &ldquo;{doc.publicBio}&rdquo;
                </p>

                {/* Card Actions & Ordering */}
                <div className="flex items-center justify-between pt-1 border-t border-border/60 text-[11px]">
                  <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                    <span>Order:</span>
                    <Input
                      type="number"
                      value={doc.displayOrder}
                      disabled={!doc.isVerified}
                      onChange={(e) => handleOrderChange(doc.doctorId, parseInt(e.target.value) || 1)}
                      className="h-6 w-12 text-[10px] font-mono text-center p-0"
                    />
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenEditBio(doc)}
                    className="h-6 text-[10px] px-2 gap-1 text-primary hover:bg-primary/10"
                  >
                    <Edit3 className="h-3 w-3" />
                    <span>Edit Public Bio</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Public Bio Dialog */}
      <Dialog open={!!editingDoctor} onOpenChange={(open) => !open && setEditingDoctor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-primary" />
              Edit Public Bio — {editingDoctor?.doctorName}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Craft the clinician&apos;s public bio for search cards and patient booking listings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="p-2.5 rounded-md bg-muted/40 border border-border space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Specialty:</span>
                <span className="font-semibold">{editingDoctor?.specialty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Registration:</span>
                <span className="font-mono">{editingDoctor?.registrationNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Affiliation:</span>
                <span>{editingDoctor?.affiliationType}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Specialty Focus / Clinical Sub-Interest</Label>
              <Input
                value={editHighlight}
                onChange={(e) => setEditHighlight(e.target.value)}
                placeholder="e.g. Interventional Cardiology, Complex Knee Arthroplasty"
                className="text-xs h-8.5"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Patient-Facing Biography</Label>
              <Textarea
                rows={4}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Write clinical experience, patient-care philosophy, notable achievements..."
                className="text-xs leading-relaxed"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button size="sm" variant="outline" onClick={() => setEditingDoctor(null)} className="h-8 text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveBio} className="h-8 text-xs bg-primary text-primary-foreground font-semibold">
              Save Doctor Bio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
