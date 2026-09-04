"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Button } from "@/hospital-admin/components/ui/button";
import { Label } from "@/hospital-admin/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { createCase } from "@/hospital-admin/store/slices/surgicalSlice";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CreateSurgicalCasePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    procedureType: "",
    department: "",
    preferredDate: "",
    preferredTime: ""
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patientName || !formData.procedureType || !formData.department || !formData.preferredDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Combine date and time
    const dateTimeString = formData.preferredDate + "T" + (formData.preferredTime || "00:00") + ":00Z";

    dispatch(createCase({
      patientId: formData.patientId || `P-${Math.floor(Math.random() * 10000)}`,
      patientName: formData.patientName,
      procedureType: formData.procedureType,
      department: formData.department,
      preferredDateTime: dateTimeString
    }));

    toast({
      title: "Surgical Case Created",
      description: "The case has been initialized in Planning status."
    });

    router.push("/hospital-admin/surgical-cases");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/hospital-admin/surgical-cases">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Surgical Case</h1>
          <p className="text-muted-foreground">Initialize a new surgical workflow</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Case Details</CardTitle>
          <CardDescription>Enter patient and procedure information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Linked Patient ID</Label>
                <Input 
                  placeholder="e.g. P-12345" 
                  value={formData.patientId}
                  onChange={(e) => handleChange("patientId", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Patient Name *</Label>
                <Input 
                  placeholder="Patient Name" 
                  value={formData.patientName}
                  onChange={(e) => handleChange("patientName", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Procedure Type *</Label>
              <Input 
                placeholder="e.g. Total Knee Arthroplasty" 
                value={formData.procedureType}
                onChange={(e) => handleChange("procedureType", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Department *</Label>
              <Select value={formData.department} onValueChange={(val) => handleChange("department", val)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                  <SelectItem value="Neurology">Neurology</SelectItem>
                  <SelectItem value="Cardiology">Cardiology</SelectItem>
                  <SelectItem value="General Surgery">General Surgery</SelectItem>
                  <SelectItem value="Gynecology">Gynecology</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preferred Date *</Label>
                <Input 
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => handleChange("preferredDate", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Preferred Time</Label>
                <Input 
                  type="time"
                  value={formData.preferredTime}
                  onChange={(e) => handleChange("preferredTime", e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="button" variant="outline" className="mr-2" onClick={() => router.push("/hospital-admin/surgical-cases")}>
                Cancel
              </Button>
              <Button type="submit">
                Initialize Case
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
