"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import {
  toggleDepartmentFeatured,
  updateDepartmentDescription,
  reorderDepartments,
} from "@/hospital-admin/store/slices/hospitalProfileSlice";
import { DepartmentFeature } from "@/hospital-admin/lib/types/hospital-profile";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import {
  Stethoscope,
  Building2,
  CheckCircle2,
  ExternalLink,
  Edit3,
  Star,
  ArrowUpDown,
  Lock,
  Search,
  Sparkles,
  Info,
} from "lucide-react";
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

export function DepartmentsCurationTab() {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const departmentFeatures = useSelector((state: RootState) => state.hospitalProfile.departmentFeatures);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterFeaturedOnly, setFilterFeaturedOnly] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentFeature | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editTag, setEditTag] = useState("");

  const filteredDepts = departmentFeatures.filter((dept) => {
    const matchesSearch =
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFeatured = !filterFeaturedOnly || dept.featured;
    return matchesSearch && matchesFeatured;
  });

  const handleToggleFeatured = (deptId: string, currentFeatured: boolean) => {
    dispatch(toggleDepartmentFeatured(deptId));
    toast({
      title: currentFeatured ? "Department Unfeatured" : "Department Featured on Public Profile",
      description: `Public search visibility updated for ${departmentFeatures.find((d) => d.departmentId === deptId)?.name}.`,
    });
  };

  const handleOpenEdit = (dept: DepartmentFeature) => {
    setEditingDept(dept);
    setEditDesc(dept.publicDescription);
    setEditTag(dept.highlightTag || "");
  };

  const handleSaveEdit = () => {
    if (editingDept) {
      dispatch(
        updateDepartmentDescription({
          departmentId: editingDept.departmentId,
          publicDescription: editDesc,
          highlightTag: editTag.trim() || undefined,
        })
      );
      toast({
        title: "Public Description Updated",
        description: `Custom public description saved for ${editingDept.name}.`,
      });
      setEditingDept(null);
    }
  };

  const handleOrderChange = (deptId: string, newOrder: number) => {
    if (newOrder >= 1) {
      dispatch(reorderDepartments({ departmentId: deptId, newOrder }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Boundary & Ownership Rule Banner (F24 CANNOT #1, Dep Rule #2) */}
      <Card className="border-primary/20 bg-primary/5 shadow-xs">
        <CardContent className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0">
              <Info className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-foreground">
                Curation Layer Boundary Notice (PDF Module 1/2 $\leftrightarrow$ Hospital Profile)
              </p>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                This workstation decides which departments are showcased publicly. <strong>Admin CANNOT create, modify internal clinical scopes, or delete departments from this screen</strong> — all source clinical records remain governed by the Departments module.
              </p>
            </div>
          </div>
          <Link href="/hospital-admin/departments">
            <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1.5 shrink-0 border-primary/30 text-primary">
              <Building2 className="h-3 w-3" />
              <span>Manage Clinical Departments</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search departments or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Switch
              checked={filterFeaturedOnly}
              onCheckedChange={setFilterFeaturedOnly}
              id="featured-filter"
            />
            <Label htmlFor="featured-filter" className="text-xs cursor-pointer">
              Featured Only ({departmentFeatures.filter((d) => d.featured).length})
            </Label>
          </div>
        </div>
      </div>

      {/* Department Curation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredDepts.map((dept) => (
          <Card
            key={dept.departmentId}
            className={`border transition-all ${
              dept.featured ? "border-primary/40 bg-card shadow-xs" : "border-border/70 bg-muted/20 opacity-80"
            }`}
          >
            <CardHeader className="p-3.5 pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <CardTitle className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                      <Stethoscope className="h-3.5 w-3.5 text-primary shrink-0" />
                      {dept.name}
                    </CardTitle>
                    {dept.highlightTag && (
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] px-1.5 py-0">
                        {dept.highlightTag}
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline" className="text-[9px] font-mono">
                    {dept.categoryName}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {dept.featured ? "Publicly Featured" : "Hidden"}
                    </span>
                    <Switch
                      checked={dept.featured}
                      onCheckedChange={() => handleToggleFeatured(dept.departmentId, dept.featured)}
                      className="scale-85"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-3.5 pt-1 space-y-3 text-xs">
              <p className="text-muted-foreground text-[11px] leading-relaxed line-clamp-2 bg-muted/30 p-2 rounded border border-border/50">
                &ldquo;{dept.publicDescription}&rdquo;
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-border/60 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span>Beds: <strong className="text-foreground">{dept.bedCount || 15}</strong></span>
                  {dept.headName && <span>HOD: <strong className="text-foreground">{dept.headName}</strong></span>}
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 text-[10px] font-mono">
                    <span>Order:</span>
                    <Input
                      type="number"
                      value={dept.displayOrder}
                      onChange={(e) => handleOrderChange(dept.departmentId, parseInt(e.target.value) || 1)}
                      className="h-6 w-12 text-[10px] font-mono text-center p-0"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenEdit(dept)}
                    className="h-6 text-[10px] px-2 gap-1 text-primary hover:bg-primary/10"
                  >
                    <Edit3 className="h-3 w-3" />
                    <span>Edit Bio</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Public Description Modal */}
      <Dialog open={!!editingDept} onOpenChange={(open) => !open && setEditingDept(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-primary" />
              Edit Public Description — {editingDept?.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Customize the patient-facing summary and highlight tag for public search directories and the hospital landing page.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Highlight Badge / Tag (Optional)</Label>
              <Input
                value={editTag}
                onChange={(e) => setEditTag(e.target.value)}
                placeholder="e.g. Center of Excellence, 24/7 Primary Care, Level-1 Trauma"
                className="text-xs h-8.5"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Public Department Description</Label>
              <Textarea
                rows={4}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Write an engaging, patient-friendly description of clinical services, diagnostic capabilities, and specialized treatments..."
                className="text-xs leading-relaxed"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button size="sm" variant="outline" onClick={() => setEditingDept(null)} className="h-8 text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveEdit} className="h-8 text-xs bg-primary text-primary-foreground font-semibold">
              Save Description
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
