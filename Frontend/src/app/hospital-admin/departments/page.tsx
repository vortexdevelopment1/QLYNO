"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Baby,
  Brain,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Edit2,
  Eye,
  FolderPlus,
  HeartPulse,
  Layers,
  MapPin,
  MoreVertical,
  Palette,
  Plus,
  Scissors,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Tag,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/hospital-admin/components/ui/avatar";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/hospital-admin/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/hospital-admin/components/ui/dropdown-menu";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/hospital-admin/components/ui/select";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { StatusBadge } from "@/hospital-admin/components/shared/status-badge";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import {
  detailedDepartments,
  DEPARTMENT_CATEGORIES,
  DepartmentCategory,
  DepartmentData,
} from "@/hospital-admin/lib/mock-data/departments";
import { cn, getInitials } from "@/hospital-admin/lib/utils";

const DELEGATION_STRING = "Performed by Hospital Admin • acting within Department Management workflow";

// Theme presets for categories
const THEME_OPTIONS = [
  { id: "blue", label: "Blue / Indigo (Clinical & Medical)", themeColor: "text-blue-600 bg-blue-500/10 border-blue-500/20", gradient: "from-blue-600 to-indigo-600" },
  { id: "rose", label: "Rose / Pink (Surgical Specialties)", themeColor: "text-rose-600 bg-rose-500/10 border-rose-500/20", gradient: "from-rose-600 to-pink-600" },
  { id: "amber", label: "Amber / Orange (Maternal & Child)", themeColor: "text-amber-600 bg-amber-500/10 border-amber-500/20", gradient: "from-amber-600 to-orange-600" },
  { id: "emerald", label: "Emerald / Teal (Head, Neck & Sensory)", themeColor: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20", gradient: "from-emerald-600 to-teal-600" },
  { id: "purple", label: "Purple / Violet (Mental Health & Rehab)", themeColor: "text-purple-600 bg-purple-500/10 border-purple-500/20", gradient: "from-purple-600 to-violet-600" },
  { id: "cyan", label: "Cyan / Sky (Ancillary & Preventive)", themeColor: "text-cyan-600 bg-cyan-500/10 border-cyan-500/20", gradient: "from-cyan-600 to-sky-600" },
  { id: "red", label: "Red / Crimson (Emergency & Critical Care)", themeColor: "text-red-600 bg-red-500/10 border-red-500/20", gradient: "from-red-600 to-rose-600" },
  { id: "teal", label: "Teal / Emerald (Diagnostic & Imaging)", themeColor: "text-teal-600 bg-teal-500/10 border-teal-500/20", gradient: "from-teal-600 to-emerald-600" },
];

const ICON_OPTIONS = [
  { id: "Stethoscope", label: "Stethoscope (Internal Medicine & Clinics)", icon: Stethoscope },
  { id: "Scissors", label: "Scissors (Surgical & OT Specialties)", icon: Scissors },
  { id: "Baby", label: "Baby (Women, OB-GYN & Pediatrics)", icon: Baby },
  { id: "Eye", label: "Eye (Sensory, Ophthalmology & ENT)", icon: Eye },
  { id: "Brain", label: "Brain (Mental Health & Neurology)", icon: Brain },
  { id: "ShieldCheck", label: "ShieldCheck (Preventive & Wellness)", icon: ShieldCheck },
  { id: "HeartPulse", label: "HeartPulse (Cardiology & Critical Care)", icon: HeartPulse },
  { id: "Activity", label: "Activity (Emergency & Acute Care)", icon: Activity },
  { id: "Building2", label: "Building (General Division)", icon: Building2 },
];

function getCategoryIcon(iconName: string, className = "h-5 w-5") {
  switch (iconName) {
    case "Stethoscope":
      return <Stethoscope className={className} />;
    case "Scissors":
      return <Scissors className={className} />;
    case "Baby":
      return <Baby className={className} />;
    case "Eye":
      return <Eye className={className} />;
    case "Brain":
      return <Brain className={className} />;
    case "ShieldCheck":
      return <ShieldCheck className={className} />;
    case "HeartPulse":
      return <HeartPulse className={className} />;
    case "Activity":
      return <Activity className={className} />;
    default:
      return <Building2 className={className} />;
  }
}

export default function DepartmentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [categoriesList, setCategoriesList] = useState<DepartmentCategory[]>(DEPARTMENT_CATEGORIES);
  const [departmentsList, setDepartmentsList] = useState<DepartmentData[]>(detailedDepartments);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Modals state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DepartmentCategory | null>(null);
  const [deleteCatConfirmOpen, setDeleteCatConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<DepartmentCategory | null>(null);

  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentData | null>(null);
  const [deleteDeptConfirmOpen, setDeleteDeptConfirmOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState<DepartmentData | null>(null);

  const [selectedScopeDept, setSelectedScopeDept] = useState<DepartmentData | null>(null);
  const [scopeModalOpen, setScopeModalOpen] = useState(false);

  // Form State: Add/Edit Department Category
  const [catName, setCatName] = useState("");
  const [catShortName, setCatShortName] = useState("");
  const [catDescription, setCatDescription] = useState("");
  const [catIcon, setCatIcon] = useState<string>("Stethoscope");
  const [catThemeId, setCatThemeId] = useState<string>("blue");
  const [catKeySpecialties, setCatKeySpecialties] = useState("");

  // Form State: Add/Edit Department (Sub-department)
  const [deptName, setDeptName] = useState("");
  const [deptCategory, setDeptCategory] = useState<string>("cat_medicine");
  const [deptFloor, setDeptFloor] = useState("2nd Floor · Wing A");
  const [deptHead, setDeptHead] = useState("Dr. Sunita Patel");
  const [deptDescription, setDeptDescription] = useState("");
  const [deptHours, setDeptHours] = useState("08:30 AM – 06:30 PM (Mon–Sat)");
  const [deptBeds, setDeptBeds] = useState("12");
  const [deptStatus, setDeptStatus] = useState<DepartmentData["status"]>("active");

  // Active Category Data
  const activeCategory = useMemo(() => {
    if (!selectedCategoryId) return null;
    return categoriesList.find((c) => c.id === selectedCategoryId) || null;
  }, [categoriesList, selectedCategoryId]);

  // Matching Categories for Level 1 Search
  const matchingCategories = useMemo(() => {
    if (!search.trim()) return categoriesList;
    const q = search.toLowerCase();
    return categoriesList.filter((cat) => {
      const catMatches =
        cat.name.toLowerCase().includes(q) ||
        cat.description.toLowerCase().includes(q) ||
        cat.shortName.toLowerCase().includes(q);
      const hasMatchingDepts = departmentsList.some(
        (d) =>
          d.categoryId === cat.id &&
          (d.name.toLowerCase().includes(q) ||
            d.description?.toLowerCase().includes(q) ||
            d.headName.toLowerCase().includes(q) ||
            d.type.toLowerCase().includes(q))
      );
      return catMatches || hasMatchingDepts;
    });
  }, [categoriesList, departmentsList, search]);

  // Global search results across all departments when searching on Level 1
  const globalMatchingDepartments = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return departmentsList.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q) ||
        d.headName.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q) ||
        d.categoryName?.toLowerCase().includes(q)
    );
  }, [departmentsList, search]);

  // Filtered sub-departments under the active category
  const displayedDepartments = useMemo(() => {
    let list = departmentsList;
    if (selectedCategoryId) {
      list = list.filter((d) => d.categoryId === selectedCategoryId);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.description?.toLowerCase().includes(q) ||
          d.headName.toLowerCase().includes(q) ||
          d.type.toLowerCase().includes(q)
      );
    }
    return list;
  }, [departmentsList, selectedCategoryId, search]);

  // -------------------------------------------------------------
  // OPEN MODAL HANDLERS FOR CATEGORY
  // -------------------------------------------------------------
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCatName("");
    setCatShortName("");
    setCatDescription("");
    setCatIcon("Stethoscope");
    setCatThemeId("blue");
    setCatKeySpecialties("");
    setCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: DepartmentCategory, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatShortName(cat.shortName);
    setCatDescription(cat.description);
    setCatIcon(cat.iconName);
    const matchedTheme = THEME_OPTIONS.find((t) => t.themeColor === cat.themeColor) || THEME_OPTIONS[0];
    setCatThemeId(matchedTheme.id);
    setCatKeySpecialties(cat.keySpecialties ? cat.keySpecialties.join(", ") : "");
    setCategoryModalOpen(true);
  };

  const handleSaveCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      toast({ title: "Validation Error", description: "Category full name is required.", variant: "destructive" });
      return;
    }
    if (!catDescription.trim()) {
      toast({ title: "Validation Error", description: "Clinical overview description is required.", variant: "destructive" });
      return;
    }

    const selectedTheme = THEME_OPTIONS.find((t) => t.id === catThemeId) || THEME_OPTIONS[0];
    const keySpecsList = catKeySpecialties
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (editingCategory) {
      // Edit existing category
      setCategoriesList((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? {
                ...c,
                name: catName.trim(),
                shortName: catShortName.trim() || catName.trim().split(" ")[0],
                description: catDescription.trim(),
                iconName: catIcon,
                themeColor: selectedTheme.themeColor,
                gradient: selectedTheme.gradient,
                keySpecialties: keySpecsList.length > 0 ? keySpecsList : undefined,
              }
            : c
        )
      );
      // Update category names on existing sub-departments
      setDepartmentsList((prev) =>
        prev.map((d) =>
          d.categoryId === editingCategory.id
            ? { ...d, categoryName: catName.trim(), type: catShortName.trim() || catName.trim().split(" ")[0] }
            : d
        )
      );
      toast({
        title: "Category Updated",
        description: `Category "${catName.trim()}" has been updated successfully.`,
      });
    } else {
      // Add new category
      const newCategory: DepartmentCategory = {
        id: `cat_custom_${Date.now()}`,
        name: catName.trim(),
        shortName: catShortName.trim() || catName.trim().split(" ")[0],
        description: catDescription.trim(),
        iconName: catIcon,
        themeColor: selectedTheme.themeColor,
        gradient: selectedTheme.gradient,
        departmentCount: 0,
        departments: [],
        keySpecialties: keySpecsList.length > 0 ? keySpecsList : undefined,
      };
      setCategoriesList((prev) => [...prev, newCategory]);
      toast({
        title: "Department Category Created",
        description: `Category "${newCategory.name}" has been registered successfully.`,
      });
    }

    setCategoryModalOpen(false);
  };

  const handleDeleteCategoryConfirm = () => {
    if (!categoryToDelete) return;
    const catId = categoryToDelete.id;
    setCategoriesList((prev) => prev.filter((c) => c.id !== catId));
    setDepartmentsList((prev) => prev.filter((d) => d.categoryId !== catId));
    if (selectedCategoryId === catId) {
      setSelectedCategoryId(null);
    }
    setDeleteCatConfirmOpen(false);
    toast({
      title: "Category Removed",
      description: `Category "${categoryToDelete.name}" and its sub-departments have been removed.`,
    });
  };

  // -------------------------------------------------------------
  // OPEN MODAL HANDLERS FOR DEPARTMENT
  // -------------------------------------------------------------
  const handleOpenAddDepartment = () => {
    setEditingDept(null);
    setDeptName("");
    setDeptCategory(selectedCategoryId || categoriesList[0]?.id || "cat_medicine");
    setDeptFloor("2nd Floor · Wing A");
    setDeptHead("Dr. Sunita Patel");
    setDeptDescription("");
    setDeptHours("08:30 AM – 06:30 PM (Mon–Sat)");
    setDeptBeds("12");
    setDeptStatus("active");
    setDeptModalOpen(true);
  };

  const handleOpenEditDepartment = (dept: DepartmentData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingDept(dept);
    setDeptName(dept.name);
    setDeptCategory(dept.categoryId || "cat_medicine");
    setDeptFloor(dept.floor);
    setDeptHead(dept.headName);
    setDeptDescription(dept.description || "");
    setDeptHours(dept.operatingHours);
    setDeptBeds(String(dept.bedCapacity || 12));
    setDeptStatus(dept.status);
    setDeptModalOpen(true);
  };

  const handleSaveDepartmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) {
      toast({ title: "Validation Error", description: "Department name is required.", variant: "destructive" });
      return;
    }

    const targetCatId = deptCategory || selectedCategoryId || categoriesList[0].id;
    const cat = categoriesList.find((c) => c.id === targetCatId) || categoriesList[0];

    if (editingDept) {
      // Edit existing department
      setDepartmentsList((prev) =>
        prev.map((d) =>
          d.id === editingDept.id
            ? {
                ...d,
                name: deptName.trim(),
                type: cat.shortName,
                categoryId: cat.id,
                categoryName: cat.name,
                description: deptDescription.trim(),
                floor: deptFloor,
                headName: deptHead,
                headTitle: `Head of ${deptName.trim()}`,
                bedCapacity: Number(deptBeds) || 12,
                operatingHours: deptHours,
                status: deptStatus,
              }
            : d
        )
      );
      toast({
        title: "Department Updated",
        description: `Department "${deptName.trim()}" has been updated.`,
      });
    } else {
      // Add new department
      const newDept: DepartmentData = {
        id: `dep_custom_${Date.now()}`,
        name: deptName.trim(),
        type: cat.shortName,
        categoryId: cat.id,
        categoryName: cat.name,
        description: deptDescription.trim() || `Specialized clinical outpatient services under ${cat.name}.`,
        location: "Qlyno Multispecialty Hospital - Main Campus",
        floor: deptFloor,
        headName: deptHead,
        headTitle: `Head of ${deptName.trim()}`,
        activePatients: 0,
        bedCapacity: Number(deptBeds) || 12,
        occupiedBeds: 0,
        status: deptStatus,
        operatingHours: deptHours,
        shiftModel: "General OPD Shifts",
        nurseStations: [`Station ${deptName.slice(0, 4).toUpperCase()}-1`],
        scope: {
          clinicalProcedures: ["Specialist Clinical Consultations", "Diagnostic Evaluations", "Outpatient Follow-ups"],
          bedAllocationRights: "Day-care consultation and observation rooms",
          equipmentReady: ["Vital Sign Monitors", "Diagnostic Console", "Mobile Emergency Cart"],
          supervisionLevel: "Attending Consultant Level",
          delegationLimits: "Hospital Admin coordinates token queues, nurse assignment, and scheduling.",
        },
        activePatientsList: [],
        activeDoctorsList: [{ id: `doc_${Date.now()}`, name: deptHead, specialty: deptName.trim(), qualification: "MBBS, MD", experience: "10 yrs", availability: "Consulting", rating: 4.8 }],
        activeNursesList: [{ id: `nur_${Date.now()}`, name: "Staff Nurse Lead", station: "Station 1", role: "Specialty Nurse", shift: "Morning", status: "On-Duty" }],
        supportStaffList: [{ id: `sup_${Date.now()}`, name: "Clinic Coordinator", role: "Assistant", taskScope: "General support", shift: "Morning", status: "Active" }],
      };

      setDepartmentsList((prev) => [newDept, ...prev]);
      toast({
        title: "Department Created Successfully",
        description: `${newDept.name} added under ${cat.name}.`,
      });
    }

    setDeptModalOpen(false);
  };

  const handleDeleteDeptConfirm = () => {
    if (!deptToDelete) return;
    setDepartmentsList((prev) => prev.filter((d) => d.id !== deptToDelete.id));
    setDeleteDeptConfirmOpen(false);
    toast({
      title: "Department Removed",
      description: `Department "${deptToDelete.name}" has been deleted.`,
    });
  };

  const handleScopeClick = (e: React.MouseEvent, dept: DepartmentData) => {
    e.stopPropagation();
    setSelectedScopeDept(dept);
    setScopeModalOpen(true);
  };

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      {/* Level 1 / Level 2 Page Header with dynamic breadcrumbs & Actions */}
      <PageHeader
        title={
          selectedCategoryId && activeCategory
            ? activeCategory.name
            : "Hospital Clinical Departments"
        }
        description={
          selectedCategoryId && activeCategory
            ? activeCategory.description
            : "Categorized clinical outpatient departments, specialized consultation suites & multidisciplinary care units."
        }
        crumbs={
          selectedCategoryId && activeCategory
            ? [
                { label: "Clinical Services" },
                { label: "Departments", href: "/hospital-admin/departments" },
                { label: activeCategory.shortName },
              ]
            : [{ label: "Clinical Services" }, { label: "Departments" }]
        }
        actions={
          <div className="flex items-center gap-2">
            {selectedCategoryId ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs font-semibold"
                  onClick={() => {
                    setSelectedCategoryId(null);
                    setSearch("");
                  }}
                >
                  <ArrowLeft className="h-4 w-4" /> All Categories
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5 font-semibold"
                  onClick={handleOpenAddDepartment}
                >
                  <Plus className="h-4 w-4" /> Add Department
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs font-semibold"
                  onClick={handleOpenAddCategory}
                >
                  <FolderPlus className="h-4 w-4 text-primary" /> Add Category
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5 font-semibold"
                  onClick={handleOpenAddDepartment}
                >
                  <Plus className="h-4 w-4" /> Add Department
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Categories</span>
          <p className="text-xl font-bold font-mono text-primary mt-0.5">{categoriesList.length} Divisions</p>
          <span className="text-[10px] text-muted-foreground">Standard OPD Structure</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Clinical Departments</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">{departmentsList.length} Active</p>
          <span className="text-[10px] text-emerald-600 font-medium">100% Operational</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Consulting Doctors</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">84+ Specialists</p>
          <span className="text-[10px] text-muted-foreground">On-Duty &amp; Consulting</span>
        </Card>
        <Card className="p-3.5 border-border bg-card shadow-xs">
          <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Daily OPD Capacity</span>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">650+ Patients</p>
          <span className="text-[10px] text-primary font-medium">Across all suites</span>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* LEVEL 1: DEPARTMENT CATEGORIES CARDS VIEW                                 */}
      {/* ========================================================================= */}
      {!selectedCategoryId && (
        <div className="space-y-4">
          {/* Section Heading & Search Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" /> Hospital Clinical Divisions
              </h2>
              <p className="text-xs text-muted-foreground">
                Select a category below to explore its active outpatient departments, consulting clinics &amp; specialized suites.
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search department, specialty, doctor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs bg-background"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-2 text-[10px] text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* If Search is Active: Show Direct Matching Departments Section */}
          {search.trim() !== "" && (
            <div className="space-y-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Search className="h-3.5 w-3.5 text-primary" /> Search Results ({globalMatchingDepartments.length} matching departments)
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-primary p-0"
                  onClick={() => setSearch("")}
                >
                  Reset Search
                </Button>
              </div>

              {globalMatchingDepartments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {globalMatchingDepartments.map((dept) => (
                    <Card
                      key={dept.id}
                      onClick={() => router.push(`/hospital-admin/departments/${dept.id}`)}
                      className="p-3.5 border-border bg-card hover:border-primary/50 transition-all cursor-pointer group shadow-2xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <strong className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                            {dept.name}
                          </strong>
                          <Badge variant="outline" className="text-[9px] py-0">
                            {dept.categoryName?.split(" ")[0]}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
                          {dept.description}
                        </p>
                      </div>
                      <div className="pt-2 mt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                        <span>{dept.headName}</span>
                        <span className="text-primary font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                          View Console →
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic py-2">
                  No specific department matching &quot;{search}&quot;. Try checking the category divisions below.
                </p>
              )}
            </div>
          )}

          {/* Category Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matchingCategories.map((category) => {
              const catDepts = departmentsList.filter((d) => d.categoryId === category.id);
              const matchingInCat = search.trim()
                ? catDepts.filter(
                    (d) =>
                      d.name.toLowerCase().includes(search.toLowerCase()) ||
                      d.description?.toLowerCase().includes(search.toLowerCase()) ||
                      d.headName.toLowerCase().includes(search.toLowerCase())
                  ).length
                : catDepts.length;
              const totalPatients = catDepts.reduce((acc, d) => acc + d.activePatients, 0);

              // Sub-specialties pills preview
              const keySpecialtiesList =
                category.keySpecialties ||
                catDepts.map((d) => d.name.split("/")[0].trim());

              return (
                <Card
                  key={category.id}
                  onClick={() => {
                    setSelectedCategoryId(category.id);
                  }}
                  className="border-border bg-card hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between overflow-hidden relative"
                >
                  <div className={cn("h-1.5 w-full bg-linear-to-r", category.gradient)} />
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className={cn("p-2.5 rounded-xl border flex items-center justify-center shadow-xs", category.themeColor)}>
                        {getCategoryIcon(category.iconName, "h-6 w-6")}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="secondary" className="font-mono text-xs font-bold px-2 py-0.5">
                          {search.trim() ? `${matchingInCat} matching` : `${catDepts.length} Departments`}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs">
                            <DropdownMenuItem onClick={(e) => handleOpenEditCategory(category, e)}>
                              <Edit2 className="h-3.5 w-3.5 mr-2 text-primary" /> Edit Category
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCategoryToDelete(category);
                                setDeleteCatConfirmOpen(true);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Category
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors mt-3">
                      {category.name}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mt-1">
                      {category.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-3">
                    {/* Sub-departments pill preview */}
                    <div className="pt-2 border-t border-border/60">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1.5">
                        Key Specialties:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {keySpecialtiesList.slice(0, 4).map((spec, i) => (
                          <span
                            key={i}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground font-medium truncate max-w-[140px]"
                          >
                            {spec}
                          </span>
                        ))}
                        {keySpecialtiesList.length > 4 && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold">
                            +{keySpecialtiesList.length - 4} more
                          </span>
                        )}
                        {keySpecialtiesList.length === 0 && (
                          <span className="text-[11px] text-muted-foreground italic">No sub-departments yet</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border/60">
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Users className="h-3.5 w-3.5 text-primary" /> {totalPatients} Active Consultations
                      </span>
                      <span className="text-primary font-semibold flex items-center gap-1 text-xs group-hover:translate-x-0.5 transition-transform">
                        Explore Departments <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {matchingCategories.length === 0 && (
            <Card className="p-8 text-center border-dashed">
              <p className="text-sm font-semibold text-foreground">No categories or departments matched &quot;{search}&quot;</p>
              <p className="text-xs text-muted-foreground mt-1">Try a different keyword like Medicine, Surgery, Pediatric, Eye, etc.</p>
              <Button variant="outline" size="sm" className="mt-3 text-xs" onClick={() => setSearch("")}>
                Reset Search
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 2: DRILL-DOWN CATEGORY SUB-DEPARTMENTS VIEW                         */}
      {/* ========================================================================= */}
      {selectedCategoryId && activeCategory && (
        <div className="space-y-4">
          {/* Category Switcher Pill Tabs Bar */}
          <div className="p-1.5 bg-muted/40 rounded-xl border border-border/80 flex items-center gap-1.5 overflow-x-auto">
            <Button
              variant={selectedCategoryId === null ? "default" : "ghost"}
              size="sm"
              className="h-8 text-xs font-semibold whitespace-nowrap shrink-0"
              onClick={() => {
                setSelectedCategoryId(null);
                setSearch("");
              }}
            >
              <Building2 className="h-3.5 w-3.5 mr-1.5" /> All Categories
            </Button>
            <div className="h-4 w-px bg-border shrink-0" />
            {categoriesList.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategoryId(cat.id);
                  setSearch("");
                }}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0",
                  selectedCategoryId === cat.id
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {getCategoryIcon(cat.iconName, "h-3.5 w-3.5")}
                <span>{cat.shortName}</span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold",
                    selectedCategoryId === cat.id
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {departmentsList.filter((d) => d.categoryId === cat.id).length}
                </span>
              </button>
            ))}
          </div>

          {/* Active Category Banner */}
          <Card className="border-border bg-card shadow-xs overflow-hidden">
            <div className={cn("h-1 w-full bg-linear-to-r", activeCategory.gradient)} />
            <CardHeader className="p-4 pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={cn("p-2.5 rounded-xl border", activeCategory.themeColor)}>
                  {getCategoryIcon(activeCategory.iconName, "h-6 w-6")}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-bold text-foreground">{activeCategory.name}</CardTitle>
                    <Badge variant="outline" className="font-mono text-xs text-primary font-bold">
                      {displayedDepartments.length} Departments
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    {activeCategory.description}
                  </CardDescription>
                </div>
              </div>

              {/* Search Bar within Category */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder={`Search in ${activeCategory.shortName}...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-xs bg-background"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-2 text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Sub-Departments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedDepartments.map((dept) => (
              <Card
                key={dept.id}
                onClick={() => router.push(`/hospital-admin/departments/${dept.id}`)}
                className="border-border bg-card hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
              >
                <CardHeader className="p-4 pb-2.5 border-b border-border/70">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {dept.name}
                      </CardTitle>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-primary" /> {dept.floor}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-[10px] font-semibold shrink-0">
                        {dept.type}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-xs">
                          <DropdownMenuItem onClick={(e) => handleOpenEditDepartment(dept, e)}>
                            <Edit2 className="h-3.5 w-3.5 mr-2 text-primary" /> Edit Department
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeptToDelete(dept);
                              setDeleteDeptConfirmOpen(true);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Department
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  {/* Clinical Description / Function */}
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 text-xs">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-0.5">
                      Clinical Scope &amp; OPD Role:
                    </span>
                    <p className="text-foreground leading-relaxed text-[11px]">
                      {dept.description || "Outpatient specialist consults, triage diagnostics & care coordination."}
                    </p>
                  </div>

                  {/* Physician & Operational Details */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                            {getInitials(dept.headName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <strong className="text-foreground text-[11px] block">{dept.headName}</strong>
                          <span className="text-[10px] text-muted-foreground">{dept.headTitle}</span>
                        </div>
                      </div>
                      <StatusBadge status={dept.status} />
                    </div>

                    <div className="pt-2 border-t border-border/60 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground font-mono">
                      <div>
                        <span>Doctors: </span>
                        <strong className="text-foreground">{dept.activeDoctorsList.length || 2} On-Duty</strong>
                      </div>
                      <div>
                        <span>Queue: </span>
                        <strong className="text-primary">{dept.activePatients} Patients</strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-border/80 flex items-center justify-between gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[11px] text-muted-foreground hover:text-foreground px-2"
                      onClick={(e) => handleScopeClick(e, dept)}
                    >
                      <Shield className="h-3 w-3 mr-1" /> Clinical Scope
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 text-xs font-semibold group-hover:bg-primary"
                    >
                      Open Console <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {displayedDepartments.length === 0 && (
            <Card className="p-8 text-center border-dashed">
              <p className="text-sm font-semibold text-foreground">No departments match your search</p>
              <p className="text-xs text-muted-foreground mt-1">Try clearing your search query to see all departments under {activeCategory.shortName}.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 text-xs"
                onClick={() => setSearch("")}
              >
                Clear Search
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT DEPARTMENT CATEGORY                                     */}
      {/* ========================================================================= */}
      <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5 text-primary" />
              {editingCategory ? "Edit Department Category" : "Add Department Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update clinical category details, icon branding, and specialty overview."
                : "Create a major hospital clinical division to group specialized outpatient clinics."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveCategorySubmit} className="space-y-4 py-2">
            {/* Category Full Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Category Full Name *</Label>
              <Input
                placeholder="e.g. Critical Care & Emergency Specialties"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                required
              />
            </div>

            {/* Short Name & Icon Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Short Name / Pill Badge *</Label>
                <Input
                  placeholder="e.g. Critical Care"
                  value={catShortName}
                  onChange={(e) => setCatShortName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Category Icon</Label>
                <Select value={catIcon} onValueChange={setCatIcon}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select Icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((opt) => {
                      const IconCmp = opt.icon;
                      return (
                        <SelectItem key={opt.id} value={opt.id} className="text-xs">
                          <div className="flex items-center gap-2">
                            <IconCmp className="h-3.5 w-3.5 text-primary" />
                            <span>{opt.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Color Accent & Theme Gradient */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Color Theme &amp; Gradient Accent</Label>
              <Select value={catThemeId} onValueChange={setCatThemeId}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select Color Theme" />
                </SelectTrigger>
                <SelectContent>
                  {THEME_OPTIONS.map((t) => (
                    <SelectItem key={t.id} value={t.id} className="text-xs">
                      <div className="flex items-center gap-2">
                        <div className={cn("h-3 w-6 rounded border", t.themeColor)} />
                        <span>{t.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clinical Overview Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Clinical Description &amp; Scope Overview *</Label>
              <Textarea
                placeholder="e.g. Comprehensive intensive care units, trauma resuscitation, high-dependency recovery and acute medical stabilization..."
                value={catDescription}
                onChange={(e) => setCatDescription(e.target.value)}
                rows={3}
                className="text-xs leading-relaxed"
                required
              />
            </div>

            {/* Key Specialties Preview */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Key Specialties / Sub-specialties (Comma Separated)
              </Label>
              <Input
                placeholder="e.g. Medical ICU, Surgical ICU, Acute Resuscitation, Trauma Bay"
                value={catKeySpecialties}
                onChange={(e) => setCatKeySpecialties(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">
                These tags will appear directly on the Category Card as key specialties preview.
              </p>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setCategoryModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingCategory ? "Save Changes" : "Create Category Card"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: DELETE CATEGORY CONFIRMATION                                       */}
      {/* ========================================================================= */}
      <Dialog open={deleteCatConfirmOpen} onOpenChange={setDeleteCatConfirmOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Remove Category Division
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete category <strong>{categoryToDelete?.name}</strong>? All associated sub-departments will also be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setDeleteCatConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCategoryConfirm}>
              Yes, Delete Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT CLINICAL DEPARTMENT (Sub-department)                    */}
      {/* ========================================================================= */}
      <Dialog open={deptModalOpen} onOpenChange={setDeptModalOpen}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              {editingDept ? "Edit Clinical Department" : "Add Clinical Department"}
            </DialogTitle>
            <DialogDescription>
              {editingDept
                ? "Update outpatient department details, HOD, and location parameters."
                : "Register a new outpatient clinical department under a parent category."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveDepartmentSubmit} className="space-y-3.5 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Department Name *</Label>
              <Input
                placeholder="e.g. Pediatric Cardiology"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Parent Clinical Category *</Label>
              <Select
                value={deptCategory}
                onValueChange={setDeptCategory}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categoriesList.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Clinical Function &amp; OPD Role *</Label>
              <Input
                placeholder="e.g. Consultations for congenital and pediatric heart defects, routine pediatric echo follow-ups"
                value={deptDescription}
                onChange={(e) => setDeptDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Floor / Location</Label>
                <Input
                  value={deptFloor}
                  onChange={(e) => setDeptFloor(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Head of Department / Lead</Label>
                <Input
                  value={deptHead}
                  onChange={(e) => setDeptHead(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Operating Hours</Label>
                <Input
                  value={deptHours}
                  onChange={(e) => setDeptHours(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Bed / Rooms</Label>
                <Input
                  type="number"
                  value={deptBeds}
                  onChange={(e) => setDeptBeds(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Operational Status</Label>
                <Select
                  value={deptStatus}
                  onValueChange={(val: any) => setDeptStatus(val)}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setDeptModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingDept ? "Save Department" : "Add Department"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: DELETE DEPARTMENT CONFIRMATION                                     */}
      {/* ========================================================================= */}
      <Dialog open={deleteDeptConfirmOpen} onOpenChange={setDeleteDeptConfirmOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Remove Clinical Department
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete department <strong>{deptToDelete?.name}</strong>? Active patient and doctor allocations will be unassigned.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setDeleteDeptConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDeptConfirm}>
              Yes, Delete Department
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: CLINICAL SCOPE & DELEGATION LIMITS                                 */}
      {/* ========================================================================= */}
      <Dialog open={scopeModalOpen} onOpenChange={setScopeModalOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Clinical Scope &amp; Delegation Boundaries
            </DialogTitle>
            <DialogDescription>
              {selectedScopeDept?.name} ({selectedScopeDept?.categoryName || "Specialist Department"})
            </DialogDescription>
          </DialogHeader>
          {selectedScopeDept && (
            <div className="space-y-3.5 py-2 text-xs">
              <div className="p-2.5 rounded bg-muted/40 border border-border/80">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Clinical Role</span>
                <p className="text-foreground font-medium mt-0.5">{selectedScopeDept.description}</p>
              </div>

              <div className="space-y-1.5">
                <strong className="text-foreground block">Key Clinical Procedures:</strong>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
                  {selectedScopeDept.scope.clinicalProcedures.map((proc, i) => (
                    <li key={i}>{proc}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded bg-muted/20 border border-border space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Supervision Level</span>
                  <p className="text-foreground font-semibold">{selectedScopeDept.scope.supervisionLevel}</p>
                </div>
                <div className="p-2.5 rounded bg-muted/20 border border-border space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Bed &amp; Room Rights</span>
                  <p className="text-foreground font-semibold">{selectedScopeDept.scope.bedAllocationRights}</p>
                </div>
              </div>

              <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-950 dark:text-amber-200">
                <strong className="block font-semibold mb-0.5">Delegation Boundary:</strong>
                <p className="text-[11px] leading-relaxed">{selectedScopeDept.scope.delegationLimits}</p>
              </div>

              <div className="text-[10px] font-mono text-muted-foreground text-center border-t border-border/60 pt-2">
                {DELEGATION_STRING}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setScopeModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
