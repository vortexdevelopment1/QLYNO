"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Users,
  Layers,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Switch } from "@/hospital-admin/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/hospital-admin/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { useToast } from "@/hospital-admin/hooks/use-toast";

interface DepartmentItem {
  id: string;
  code: string;
  name: string;
  category: "Clinical" | "Diagnostic" | "Surgical" | "Administrative" | "Support";
  hod: string;
  location: string;
  bedsAllocated: number;
  staffCount: number;
  isActive: boolean;
}

const initialDepartments: DepartmentItem[] = [
  {
    id: "dept-1",
    code: "CARDIO",
    name: "Cardiology & Cath Lab",
    category: "Clinical",
    hod: "Dr. Rajesh Sharma, MD",
    location: "Block A - 2nd Floor",
    bedsAllocated: 24,
    staffCount: 18,
    isActive: true,
  },
  {
    id: "dept-2",
    code: "ORTHO",
    name: "Orthopedics & Joint Replacement",
    category: "Surgical",
    hod: "Dr. Vikram Sethi, MS",
    location: "Block B - 3rd Floor",
    bedsAllocated: 30,
    staffCount: 15,
    isActive: true,
  },
  {
    id: "dept-3",
    code: "EMERG",
    name: "Emergency & Trauma Services",
    category: "Clinical",
    hod: "Dr. Priya Deshmukh, MD",
    location: "Ground Floor - Bay 1-4",
    bedsAllocated: 16,
    staffCount: 28,
    isActive: true,
  },
  {
    id: "dept-4",
    code: "RAD",
    name: "Radiology & Advanced Imaging",
    category: "Diagnostic",
    hod: "Dr. Arvind Menon, DMRD",
    location: "Basement 1 - Wing C",
    bedsAllocated: 0,
    staffCount: 12,
    isActive: true,
  },
  {
    id: "dept-5",
    code: "PATH",
    name: "Pathology & Clinical Lab",
    category: "Diagnostic",
    hod: "Dr. Sunita Rao, MD",
    location: "Basement 1 - Wing A",
    bedsAllocated: 0,
    staffCount: 14,
    isActive: true,
  },
  {
    id: "dept-6",
    code: "PED",
    name: "Pediatrics & Neonatal ICU",
    category: "Clinical",
    hod: "Dr. Neha Kulkarni, MD",
    location: "Block A - 4th Floor",
    bedsAllocated: 20,
    staffCount: 16,
    isActive: true,
  },
  {
    id: "dept-7",
    code: "PHARM",
    name: "Central Inpatient Pharmacy",
    category: "Support",
    hod: "Mr. Ramesh Joshi, M.Pharm",
    location: "Ground Floor - Lobby",
    bedsAllocated: 0,
    staffCount: 8,
    isActive: true,
  },
];

export function DepartmentsSettingsTab() {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<DepartmentItem[]>(initialDepartments);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Add Department Form State
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<DepartmentItem["category"]>("Clinical");
  const [newHod, setNewHod] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newBeds, setNewBeds] = useState(0);

  const toggleStatus = (id: string) => {
    setDepartments((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const updatedStatus = !d.isActive;
          toast({
            title: `Department ${updatedStatus ? "Activated" : "Deactivated"}`,
            description: `${d.name} (${d.code}) is now ${updatedStatus ? "Active" : "Inactive"}.`,
          });
          return { ...d, isActive: updatedStatus };
        }
        return d;
      })
    );
  };

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName || !newHod) {
      toast({
        title: "Validation Error",
        description: "Please fill in all mandatory department fields.",
        variant: "destructive",
      });
      return;
    }

    const created: DepartmentItem = {
      id: `dept-${Date.now()}`,
      code: newCode.toUpperCase().trim(),
      name: newName.trim(),
      category: newCategory,
      hod: newHod.trim(),
      location: newLocation.trim() || "Main Campus",
      bedsAllocated: Number(newBeds) || 0,
      staffCount: 1,
      isActive: true,
    };

    setDepartments((prev) => [created, ...prev]);
    setIsAddOpen(false);
    setNewCode("");
    setNewName("");
    setNewHod("");
    setNewLocation("");
    setNewBeds(0);

    toast({
      title: "Department Created",
      description: `${created.name} (${created.code}) has been added to hospital configuration.`,
    });
  };

  const filteredDepts = departments.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase()) ||
      d.hod.toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCategory === "ALL" || d.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Building2 className="h-5 w-5 text-primary" /> Hospital Departments Registry
            </CardTitle>
            <CardDescription className="text-xs">
              Configure specialty departments, HOD designations, ward bed allocation, and operational status.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="gap-1.5 text-xs font-semibold"
            >
              <Link href="/hospital-admin/departments">
                <ExternalLink className="h-3.5 w-3.5" /> Department Operations Hub
              </Link>
            </Button>
            <Button
              size="sm"
              onClick={() => setIsAddOpen(true)}
              className="gap-1.5 text-xs font-semibold"
            >
              <Plus className="h-4 w-4" /> Add Department
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by code, title, or HOD..."
                className="pl-8 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Category:</span>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[150px] text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  <SelectItem value="Clinical">Clinical</SelectItem>
                  <SelectItem value="Surgical">Surgical</SelectItem>
                  <SelectItem value="Diagnostic">Diagnostic</SelectItem>
                  <SelectItem value="Support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-[110px] text-xs font-bold">Code</TableHead>
                  <TableHead className="text-xs font-bold">Department Name</TableHead>
                  <TableHead className="text-xs font-bold">Category</TableHead>
                  <TableHead className="text-xs font-bold">Head of Dept (HOD)</TableHead>
                  <TableHead className="text-xs font-bold">Location / Ward</TableHead>
                  <TableHead className="text-xs font-bold text-center">Beds</TableHead>
                  <TableHead className="text-xs font-bold text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-28 text-center text-xs text-muted-foreground">
                      No departments found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDepts.map((d) => (
                    <TableRow key={d.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-xs font-bold text-primary">
                        {d.code}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-foreground">
                        {d.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            d.category === "Clinical"
                              ? "border-blue-500/30 text-blue-600 bg-blue-500/10 text-[10px]"
                              : d.category === "Surgical"
                              ? "border-purple-500/30 text-purple-600 bg-purple-500/10 text-[10px]"
                              : d.category === "Diagnostic"
                              ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10 text-[10px]"
                              : "text-[10px]"
                          }
                        >
                          {d.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {d.hod}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {d.location}
                      </TableCell>
                      <TableCell className="text-xs text-center font-mono font-semibold">
                        {d.bedsAllocated > 0 ? d.bedsAllocated : "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Switch
                            checked={d.isActive}
                            onCheckedChange={() => toggleStatus(d.id)}
                          />
                          <span className="text-[11px] font-semibold text-muted-foreground">
                            {d.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Department Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" /> Create Hospital Department
            </DialogTitle>
            <DialogDescription className="text-xs">
              Add a new medical specialty or diagnostic unit to the hospital directory.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddDepartment} className="space-y-3.5 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="code" className="text-xs">Department Code</Label>
                <Input
                  id="code"
                  placeholder="e.g. NEURO"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="font-mono uppercase text-xs"
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="category" className="text-xs">Category</Label>
                <Select
                  value={newCategory}
                  onValueChange={(val: any) => setNewCategory(val)}
                >
                  <SelectTrigger id="category" className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Clinical">Clinical</SelectItem>
                    <SelectItem value="Surgical">Surgical</SelectItem>
                    <SelectItem value="Diagnostic">Diagnostic</SelectItem>
                    <SelectItem value="Administrative">Administrative</SelectItem>
                    <SelectItem value="Support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="name" className="text-xs">Department Title</Label>
              <Input
                id="name"
                placeholder="e.g. Neurology & Stroke Care Unit"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="text-xs"
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="hod" className="text-xs">Head of Department (HOD)</Label>
              <Input
                id="hod"
                placeholder="e.g. Dr. Anand Verma, DM"
                value={newHod}
                onChange={(e) => setNewHod(e.target.value)}
                className="text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="location" className="text-xs">Building / Floor Location</Label>
                <Input
                  id="location"
                  placeholder="e.g. Block C - 5th Floor"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="beds" className="text-xs">Dedicated Inpatient Beds</Label>
                <Input
                  id="beds"
                  type="number"
                  min={0}
                  value={newBeds}
                  onChange={(e) => setNewBeds(Number(e.target.value))}
                  className="text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save & Register
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
