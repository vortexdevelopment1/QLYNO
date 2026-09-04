"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/hospital-admin/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { Button } from "@/hospital-admin/components/ui/button";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/hospital-admin/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/hospital-admin/components/ui/sheet";
import { createSurgeonRequest, assignExternalSurgeonFromRequest, updateSurgeonResponse, SurgeonRequestStatus } from "@/hospital-admin/store/slices/surgicalSlice";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import Link from "next/link";
import { MessageSquare, Check, X, ShieldAlert, ArrowLeft, Send } from "lucide-react";
import { PageHeader } from "@/hospital-admin/components/shared/page-header";
import { SurgicalNav } from "@/hospital-admin/components/surgical/surgical-nav";

export default function SurgeonRequestsPage() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { cases, surgeons, surgeonRequests } = useSelector((state: RootState) => state.surgical);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  // Create Request Form State
  const [formData, setFormData] = useState({
    caseId: "",
    specialty: "",
    subSpecialty: "",
    caseType: "",
    requiredTime: "",
    location: "",
    urgency: "Routine" as any
  });

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const c = cases.find(c => c.id === formData.caseId);
    if (!c) {
      toast({ title: "Error", description: "Invalid Case ID.", variant: "destructive" });
      return;
    }

    const eligibleSurgeonIds = surgeons.filter(s => !s.isInternal && s.specialty === formData.specialty).map(s => s.id);

    if (eligibleSurgeonIds.length === 0) {
      toast({ title: "No Eligible Surgeons", description: "No external surgeons found for this specialty.", variant: "destructive" });
      return;
    }

    dispatch(createSurgeonRequest({
      ...formData,
      eligibleSurgeonIds
    }));

    toast({
      title: "Surgeon Request Sent",
      description: `Notified ${eligibleSurgeonIds.length} eligible surgeon(s) + case owner.`
    });
    setCreateModalOpen(false);
  };

  const handleAssign = (requestId: string, surgeonId: string) => {
    dispatch(
      assignExternalSurgeonFromRequest({
        requestId,
        surgeonId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      })
    );
    toast({
      title: "Surgeon Assigned",
      description: "External surgeon linked with auto-expiring access.",
    });
  };

  // Simulate a response for testing
  const simulateResponse = (requestId: string, surgeonId: string, status: SurgeonRequestStatus) => {
    dispatch(
      updateSurgeonResponse({
        requestId,
        surgeonId,
        status,
        responseNotes: status === "Clarification Requested" ? "Can you provide the latest MRI scan?" : "",
      })
    );
    toast({ title: "Simulated Response Received", description: `Surgeon ${status}` });
  };

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      <PageHeader
        title="Surgeon Sourcing &amp; Dispatch Requests"
        description="Broadcast case requirements to credentialed visiting specialists and track real-time acceptance."
        crumbs={[{ label: "OT & Surgeries" }, { label: "Surgeon Requests" }]}
        actions={
          <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 font-semibold text-xs">
                <Send className="h-4 w-4" /> New Surgeon Request
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>New External Surgeon Request</DialogTitle>
              <DialogDescription>
                When internal surgeons are unavailable, blast a request to the external network.
                <br/><strong className="text-primary mt-2 block">Permitted case details and readiness info will be automatically attached.</strong>
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Linked Case ID *</Label>
                  <Select onValueChange={(val) => setFormData(p => ({ ...p, caseId: val }))} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select case..." />
                    </SelectTrigger>
                    <SelectContent>
                      {cases.filter(c => !c.assignedSurgeonId).map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.id} ({c.procedureType})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Required Time *</Label>
                  <Input type="time" onChange={(e) => setFormData(p => ({ ...p, requiredTime: e.target.value }))} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Specialty *</Label>
                  <Select onValueChange={(val) => setFormData(p => ({ ...p, specialty: val }))} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialty..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                      <SelectItem value="Cardiology">Cardiology</SelectItem>
                      <SelectItem value="Neurology">Neurology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sub-Specialty</Label>
                  <Input placeholder="e.g. Joint Replacement" onChange={(e) => setFormData(p => ({ ...p, subSpecialty: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-1">
                  <Label>Case Type</Label>
                  <Input placeholder="e.g. Elective" onChange={(e) => setFormData(p => ({ ...p, caseType: e.target.value }))} />
                </div>
                <div className="space-y-2 col-span-1">
                  <Label>Location</Label>
                  <Input placeholder="e.g. Main Campus OR-1" onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))} />
                </div>
                <div className="space-y-2 col-span-1">
                  <Label>Urgency *</Label>
                  <Select onValueChange={(val: any) => setFormData(p => ({ ...p, urgency: val }))} defaultValue="Routine">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Routine">Routine</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Blast Request to Network
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        }
      />

      <SurgicalNav />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Req ID</TableHead>
                <TableHead>Linked Case</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Sent-to (Responses)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {surgeonRequests.map(req => {
                const acceptedCount = req.responses.filter(r => r.status === 'Accepted').length;
                return (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.id}</TableCell>
                    <TableCell>
                      <Link href={`/hospital-admin/surgical-cases/${req.caseId}`} className="text-primary hover:underline">
                        {req.caseId}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {req.specialty}
                      <div className="text-xs text-muted-foreground">{req.subSpecialty}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={req.urgency === 'Emergency' ? 'destructive' : req.urgency === 'Urgent' ? 'default' : 'secondary'}>
                        {req.urgency}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {req.responses.length} Surgeons notified
                      </div>
                      <div className="text-xs text-green-600 font-medium">
                        {acceptedCount} Accepted
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={req.status === 'Assigned' ? 'default' : 'outline'}>
                        {req.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="ghost" size="sm">View Responses</Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[800px] sm:max-w-4xl overflow-y-auto">
                          <div className="py-6 space-y-6">
                            <SheetHeader>
                              <SheetTitle>Request Responses: {req.id}</SheetTitle>
                              <SheetDescription>
                                Track individual surgeon responses. Deduplication logic ensures only ONE surgeon can be assigned to {req.caseId}.
                              </SheetDescription>
                            </SheetHeader>
                            
                            <div className="px-4">
                              <div className="mb-6 p-4 bg-muted rounded-lg space-y-2">
                                <h3 className="font-semibold mb-2">Automatically Attached Info</h3>
                                <p className="text-sm"><strong>Details:</strong> {req.permittedCaseDetails}</p>
                                <p className="text-sm"><strong>Readiness:</strong> {req.readinessInfo}</p>
                              </div>

                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Surgeon</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Notes</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {req.responses.map(resp => (
                                    <TableRow key={resp.surgeonId}>
                                      <TableCell className="font-medium">
                                        {resp.surgeonName}
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant={
                                          resp.status === 'Accepted' ? 'default' : 
                                          resp.status === 'Declined' ? 'destructive' : 
                                          resp.status === 'Clarification Requested' ? 'secondary' :
                                          'outline'
                                        }>
                                          {resp.status}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-sm text-muted-foreground">
                                        {resp.responseNotes || "-"}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {req.status !== 'Assigned' ? (
                                          <div className="flex justify-end gap-2">
                                            {resp.status === 'Sent' && (
                                              <>
                                                <Button variant="outline" size="sm" onClick={() => simulateResponse(req.id, resp.surgeonId, 'Accepted')}>Simulate Accept</Button>
                                                <Button variant="outline" size="sm" onClick={() => simulateResponse(req.id, resp.surgeonId, 'Clarification Requested')}>Simulate Clarify</Button>
                                              </>
                                            )}
                                            {resp.status === 'Accepted' && (
                                              <Button size="sm" onClick={() => handleAssign(req.id, resp.surgeonId)}>
                                                Assign (Dedupe others)
                                              </Button>
                                            )}
                                          </div>
                                        ) : (
                                          resp.status === 'Assigned' && (
                                            <Badge variant="default">
                                              <ShieldAlert className="w-3 h-3 mr-1" />
                                              Assigned (Limited Access)
                                            </Badge>
                                          )
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </SheetContent>
                      </Sheet>
                    </TableCell>
                  </TableRow>
                );
              })}
              {surgeonRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No external surgeon requests.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
