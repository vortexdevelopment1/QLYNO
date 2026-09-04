"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";

import { Button } from "@/hospital-admin/components/ui/button";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { createRequest } from "@/hospital-admin/store/slices/procurementSlice";
import { useToast } from "@/hospital-admin/hooks/use-toast";

export default function CreateProcurementRequestPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    item: "",
    spec: "",
    category: "consumable",
    department: "",
    urgency: "Medium",
    linkedCaseId: "",
    linkedPatientId: "",
    preferredVendorId: "",
  });

  const handleSubmit = (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    dispatch(createRequest({
      item: formData.item,
      spec: formData.spec,
      category: formData.category as any,
      department: formData.department,
      urgency: formData.urgency as any,
      linkedCaseId: formData.linkedCaseId || undefined,
      linkedPatientId: formData.linkedPatientId || undefined,
      preferredVendorId: formData.preferredVendorId || undefined,
      requester: "Admin User", // Mock logged in user
      isDraft,
    }));
    
    toast({ title: isDraft ? "Draft Saved" : "Request Submitted", description: isDraft ? "Request saved as draft." : "Procurement request has been entered into the system." });
    router.push("/hospital-admin/procurement");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/hospital-admin/procurement">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title="Create Procurement Request"
          description="Initiate a formal request for equipment, supplies, or services."
        />
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
            <CardDescription>Specify exactly what is needed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5 col-span-2">
                <Label>Item / Service Name</Label>
                <Input required value={formData.item} onChange={e => setFormData({...formData, item: e.target.value})} placeholder="e.g. Titanium Femoral Stem" />
              </div>
              <div className="grid gap-1.5 col-span-2">
                <Label>Quantity / Specifications</Label>
                <Textarea required value={formData.spec} onChange={e => setFormData({...formData, spec: e.target.value})} placeholder="e.g. 10 boxes, Size 12, Standard Offset" />
              </div>
              
              <div className="grid gap-1.5">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="implant">Implant</SelectItem>
                    <SelectItem value="consumable">Consumable</SelectItem>
                    <SelectItem value="medicine">Medicine</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-1.5">
                <Label>Urgency</Label>
                <Select value={formData.urgency} onValueChange={v => setFormData({...formData, urgency: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-1.5 col-span-2">
                <Label>Department</Label>
                <Input required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} placeholder="e.g. Orthopedics" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Links & Vendor</CardTitle>
            <CardDescription>Optional linkages for case dependencies and preferred vendors.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label>Linked Surgical Case ID <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                <Input value={formData.linkedCaseId} onChange={e => setFormData({...formData, linkedCaseId: e.target.value})} placeholder="e.g. SURG-409" />
              </div>
              <div className="grid gap-1.5">
                <Label>Linked Patient ID <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                <Input value={formData.linkedPatientId} onChange={e => setFormData({...formData, linkedPatientId: e.target.value})} placeholder="e.g. P-8821" />
              </div>
              <div className="grid gap-1.5 col-span-2">
                <Label>Preferred Vendor <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                <Select value={formData.preferredVendorId} onValueChange={v => setFormData({...formData, preferredVendorId: v})}>
                  <SelectTrigger><SelectValue placeholder="None selected" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="V-001">MediTech Supplies Ltd</SelectItem>
                    <SelectItem value="V-002">Global Pharma</SelectItem>
                    <SelectItem value="V-003">SurgiImplant Inc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="pt-6 border-t flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={(e) => handleSubmit(e, true)}>
                Save as Draft
              </Button>
              <Button type="button" onClick={(e) => handleSubmit(e, false)}>
                <Save className="mr-2 h-4 w-4" /> Submit Request
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
