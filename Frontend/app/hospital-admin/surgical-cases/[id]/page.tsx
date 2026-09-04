"use client";

import React, { useState, use } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/hospital-admin/store/store";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/hospital-admin/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/hospital-admin/components/ui/tabs";
import { Button } from "@/hospital-admin/components/ui/button";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { format } from "date-fns";
import { 
  updateChecklistItem, 
  assignInternalSurgeon, 
  allocateOT,
  togglePostOpTask,
  SurgicalCase,
  ChecklistItemStatus
} from "@/hospital-admin/store/slices/surgicalSlice";
import { StatusBadge } from "@/hospital-admin/components/shared/StatusBadge";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import Link from "next/link";
import { ArrowLeft, Clock, ShieldAlert, CheckCircle2, User, Building, Stethoscope, AlertCircle, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/hospital-admin/components/ui/dialog";
import { Label } from "@/hospital-admin/components/ui/label";
import { Input } from "@/hospital-admin/components/ui/input";
import { SurgicalNav } from "@/hospital-admin/components/surgical/surgical-nav";

export default function SurgicalCaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: caseId } = use(params);
  const dispatch = useDispatch();
  const router = useRouter();
  const { toast } = useToast();
  
  const surgicalCase = useSelector((state: RootState) => 
    state.surgical.cases.find(c => c.id === caseId)
  );
  
  const { surgeons, otRooms, surgeonRequests } = useSelector((state: RootState) => state.surgical);
  const { requests: procurementRequests } = useSelector((state: RootState) => state.procurement);

  const [otAllocModalOpen, setOtAllocModalOpen] = useState(false);
  const [otRoomId, setOtRoomId] = useState("");
  const [otDate, setOtDate] = useState("");
  const [otTime, setOtTime] = useState("");
  const [otTeam, setOtTeam] = useState("");
  const [otResources, setOtResources] = useState("");

  if (!surgicalCase) {
    return <div className="p-8 text-center">Case not found.</div>;
  }

  const blockers = surgicalCase.checklist.filter(i => i.status === 'Missing' || i.status === 'Overdue');
  const assignedSurgeon = surgeons.find(s => s.id === surgicalCase.assignedSurgeonId);
  
  const handleChecklistStatusUpdate = (itemId: string, status: ChecklistItemStatus) => {
    dispatch(updateChecklistItem({ caseId, itemId, status }));
    
    // Simulate notification if missing/overdue
    if (status === 'Missing' || status === 'Overdue') {
      toast({
        title: "Surgery Blocker Logged",
        description: "Notified: Responsible surgeon + OT coordinator + Admin",
        variant: "destructive"
      });
    }
  };

  const handleOTAllocation = () => {
    if (surgicalCase.status !== 'Ready') {
      // Allow but visibly warn (UI will show warning, but we still allow it)
      toast({
        title: "Warning: Case Not Ready",
        description: "OT scheduled, but case still has blockers.",
        variant: "destructive"
      });
    }

    const startDateTime = `${otDate}T${otTime}:00Z`;
    // Hardcoding a 2 hour end time for demo purposes
    const endDateTime = new Date(new Date(startDateTime).getTime() + 1000 * 60 * 60 * 2).toISOString();

    dispatch(allocateOT({
      caseId,
      roomId: otRoomId,
      startDateTime,
      endDateTime,
      team: otTeam.split(',').map(s => s.trim()).filter(Boolean),
      resources: otResources.split(',').map(s => s.trim()).filter(Boolean)
    }));
    setOtAllocModalOpen(false);
    toast({ title: "OT Slot Allocated", description: "OT scheduling confirmed." });
  };

  const handleInternalSurgeonAssign = (surgeonId: string) => {
    dispatch(assignInternalSurgeon({ caseId, surgeonId }));
    toast({ title: "Surgeon Assigned", description: "Internal surgeon linked to case." });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/hospital-admin/surgical-cases">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{surgicalCase.id} - {surgicalCase.patientName}</h1>
            <p className="text-muted-foreground">{surgicalCase.procedureType} • {surgicalCase.department}</p>
          </div>
        </div>
        <StatusBadge status={surgicalCase.status} />
      </div>

      <SurgicalNav />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center">
            <div className="text-sm text-muted-foreground mb-1">Readiness</div>
            <div className="text-3xl font-bold">{surgicalCase.readinessPercent}%</div>
            {surgicalCase.readinessPercent === 100 && <CheckCircle2 className="w-5 h-5 text-green-500 mt-2" />}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center">
            <div className="text-sm text-muted-foreground mb-1">Blockers</div>
            <div className={`text-3xl font-bold ${blockers.length > 0 ? 'text-destructive' : ''}`}>
              {blockers.length}
            </div>
            {blockers.length > 0 && <AlertCircle className="w-5 h-5 text-destructive mt-2" />}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center">
            <div className="text-sm text-muted-foreground mb-1">OT Slot</div>
            <div className="text-lg font-semibold text-center">
              {surgicalCase.allocatedOT ? 
                otRooms.find(r => r.id === surgicalCase.allocatedOT?.roomId)?.name || surgicalCase.allocatedOT.roomId 
                : "Unscheduled"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center">
            <div className="text-sm text-muted-foreground mb-1">Surgeon</div>
            <div className="text-lg font-semibold text-center">
              {assignedSurgeon ? assignedSurgeon.name : "Unassigned"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="checklist">
            Readiness Checklist
            {blockers.length > 0 && <Badge variant="destructive" className="ml-2">{blockers.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="blockers">Blockers</TabsTrigger>
          <TabsTrigger value="surgeon">Surgeon</TabsTrigger>
          <TabsTrigger value="vendor">Vendor Dependencies</TabsTrigger>
          <TabsTrigger value="postop">Post-op</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Case Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Patient</div>
                    <div className="font-medium">{surgicalCase.patientName} (ID: {surgicalCase.patientId})</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Procedure</div>
                    <div className="font-medium">{surgicalCase.procedureType}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Department</div>
                    <div className="font-medium">{surgicalCase.department}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Preferred Date</div>
                    <div className="font-medium">{format(new Date(surgicalCase.preferredDateTime), "PPP")}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Assigned Surgeon</div>
                    <div className="font-medium">{assignedSurgeon ? assignedSurgeon.name : "Unassigned"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Current Status</div>
                    <div className="font-medium"><StatusBadge status={surgicalCase.status} /></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>OT Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                {surgicalCase.allocatedOT ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg flex items-start gap-4">
                      <Building className="w-8 h-8 text-primary mt-1" />
                      <div>
                        <div className="font-semibold text-lg">
                          {otRooms.find(r => r.id === surgicalCase.allocatedOT?.roomId)?.name}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {format(new Date(surgicalCase.allocatedOT.startDateTime), "PPP p")} - {format(new Date(surgicalCase.allocatedOT.endDateTime), "p")}
                        </div>
                      </div>
                    </div>
                    <Dialog open={otAllocModalOpen} onOpenChange={setOtAllocModalOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">Edit OT Allocation</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Allocate OT Slot</DialogTitle>
                          <DialogDescription>Assign an operating theater and schedule this case.</DialogDescription>
                        </DialogHeader>
                        {surgicalCase.status !== 'Ready' && (
                          <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm mb-4">
                            <strong>Warning:</strong> This case is not yet 100% Ready. Scheduling is allowed, but strongly discouraged until all blockers are resolved.
                          </div>
                        )}
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Operating Room</Label>
                            <Select value={otRoomId} onValueChange={setOtRoomId}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select OT Room" />
                              </SelectTrigger>
                              <SelectContent>
                                {otRooms.map(r => (
                                  <SelectItem key={r.id} value={r.id}>{r.name} ({r.status})</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Date</Label>
                              <Input type="date" value={otDate} onChange={(e) => setOtDate(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                              <Label>Time</Label>
                              <Input type="time" value={otTime} onChange={(e) => setOtTime(e.target.value)} />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Team (comma separated)</Label>
                              <Input placeholder="e.g. Dr. Iyer, Nurse Kamala" value={otTeam} onChange={(e) => setOtTeam(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                              <Label>Resources (comma separated)</Label>
                              <Input placeholder="e.g. C-Arm, Ventilator" value={otResources} onChange={(e) => setOtResources(e.target.value)} />
                            </div>
                          </div>
                          <Button onClick={handleOTAllocation} className="w-full">Confirm Slot</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No OT slot scheduled yet.</p>
                    <Dialog open={otAllocModalOpen} onOpenChange={setOtAllocModalOpen}>
                      <DialogTrigger asChild>
                        <Button>Allocate OT Slot</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Allocate OT Slot</DialogTitle>
                          <DialogDescription>Assign an operating theater and schedule this case.</DialogDescription>
                        </DialogHeader>
                        {surgicalCase.status !== 'Ready' && (
                          <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm mb-4 flex gap-2 items-start">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <div>
                              <strong>Warning:</strong> This case is not yet 100% Ready. Scheduling is allowed, but strongly discouraged until all blockers are resolved.
                            </div>
                          </div>
                        )}
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Operating Room</Label>
                            <Select value={otRoomId} onValueChange={setOtRoomId}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select OT Room" />
                              </SelectTrigger>
                              <SelectContent>
                                {otRooms.map(r => (
                                  <SelectItem key={r.id} value={r.id}>{r.name} ({r.status})</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Date</Label>
                              <Input type="date" value={otDate} onChange={(e) => setOtDate(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                              <Label>Time</Label>
                              <Input type="time" value={otTime} onChange={(e) => setOtTime(e.target.value)} />
                            </div>
                          </div>
                          <Button onClick={handleOTAllocation} className="w-full">Confirm Slot</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="checklist" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Readiness Checklist</CardTitle>
              <CardDescription>Track pre-op assessments, investigations, consent, blood/implants, and other configured dependencies.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {surgicalCase.checklist.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="capitalize">{item.category}</TableCell>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell>{item.owner}</TableCell>
                      <TableCell>{format(new Date(item.deadline), "MMM d, HH:mm")}</TableCell>
                      <TableCell>
                        <Badge variant={
                          item.status === 'Done' ? 'default' :
                          item.status === 'Pending' ? 'secondary' :
                          'destructive'
                        }>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Select 
                          value={item.status} 
                          onValueChange={(val) => handleChecklistStatusUpdate(item.id, val as ChecklistItemStatus)}
                        >
                          <SelectTrigger className="w-[120px] ml-auto">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Done">Done</SelectItem>
                            <SelectItem value="Missing">Missing</SelectItem>
                            <SelectItem value="Overdue">Overdue</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blockers" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Case Blockers</CardTitle>
              <CardDescription>Auto-derived missing or overdue dependencies that block case readiness.</CardDescription>
            </CardHeader>
            <CardContent>
              {blockers.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-700">No active blockers</h3>
                  <p className="text-muted-foreground">All required dependencies are met or pending.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {blockers.map(blocker => (
                    <div key={blocker.id} className="p-4 border-l-4 border-destructive bg-destructive/5 rounded-md flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <AlertCircle className="w-4 h-4 text-destructive" />
                          <h4 className="font-semibold text-destructive">{blocker.description}</h4>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-4">
                          <span>Owner: <strong>{blocker.owner}</strong></span>
                          <span>Deadline: <strong>{format(new Date(blocker.deadline), "MMM d, HH:mm")}</strong></span>
                        </div>
                      </div>
                      <Badge variant="destructive">{blocker.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="surgeon" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Assigned Surgeon</CardTitle>
              </CardHeader>
              <CardContent>
                {assignedSurgeon ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <Stethoscope className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{assignedSurgeon.name}</h3>
                        <p className="text-muted-foreground">{assignedSurgeon.specialty}</p>
                      </div>
                    </div>
                    {surgicalCase.isExternalSurgeon && surgicalCase.surgeonAccessExpiresAt && (
                      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-md text-sm flex items-start gap-2">
                        <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                        <div>
                          <strong>External Surgeon: Case-Specific Limited Access Only</strong>
                          <br />
                          Access expires: {format(new Date(surgicalCase.surgeonAccessExpiresAt), "MMM d, yyyy HH:mm")}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-muted-foreground mb-4">No surgeon assigned yet.</p>
                    <div className="space-y-2">
                      <Label>Assign Internal Surgeon</Label>
                      <Select onValueChange={(val) => handleInternalSurgeonAssign(val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select internal surgeon" />
                        </SelectTrigger>
                        <SelectContent>
                          {surgeons.filter(s => s.isInternal && s.specialty === surgicalCase.department).map(s => (
                            <SelectItem key={s.id} value={s.id}>{s.name} ({s.specialty}) - {s.availability}</SelectItem>
                          ))}
                          {surgeons.filter(s => s.isInternal && s.specialty === surgicalCase.department).length === 0 && (
                            <div className="p-2 text-sm text-muted-foreground">No internal surgeons available in this specialty.</div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="relative py-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or</span>
                      </div>
                    </div>
                    <Link href="/hospital-admin/surgical-cases/surgeon-requests" className="block text-center text-sm text-primary hover:underline">
                      Create an external surgeon request when internal is unavailable
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>External Requests</CardTitle>
                <CardDescription>Track surgeon sourcing requests</CardDescription>
              </CardHeader>
              <CardContent>
                {surgeonRequests.filter(r => r.caseId === caseId).length === 0 ? (
                  <p className="text-muted-foreground text-sm">No external requests linked to this case.</p>
                ) : (
                  <div className="space-y-3">
                    {surgeonRequests.filter(r => r.caseId === caseId).map(req => (
                      <div key={req.id} className="p-3 border rounded-md">
                        <div className="flex justify-between items-start mb-2">
                          <Link href="/hospital-admin/surgical-cases/surgeon-requests" className="font-semibold text-primary hover:underline">
                            {req.id}
                          </Link>
                          <Badge variant="outline">{req.status}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {req.responses.length} network surgeons notified.
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vendor" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Dependencies</CardTitle>
              <CardDescription>Linked procurement requests for implants, equipment, or consumables.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Link href="/hospital-admin/procurement/create">
                  <Button variant="outline" size="sm">Request Missing Equipment (Mod 11)</Button>
                </Link>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Req ID</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Urgency</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {surgicalCase.linkedProcurementIds.map(prId => {
                    const pr = procurementRequests.find(p => p.id === prId);
                    return pr ? (
                      <TableRow key={prId}>
                        <TableCell>
                          <Link href={`/hospital-admin/procurement/${pr.id}`} className="text-primary hover:underline">
                            {pr.id}
                          </Link>
                        </TableCell>
                        <TableCell>{pr.item}</TableCell>
                        <TableCell>{pr.urgency}</TableCell>
                        <TableCell>
                          <StatusBadge status={pr.status} />
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow key={prId}>
                        <TableCell colSpan={4} className="text-muted-foreground">{prId} (Not Found)</TableCell>
                      </TableRow>
                    );
                  })}
                  {surgicalCase.linkedProcurementIds.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-4">No vendor dependencies linked.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="postop" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Post-Op Care & Nursing</CardTitle>
              <CardDescription>Recovery tasks and documents.</CardDescription>
            </CardHeader>
            <CardContent>
              {surgicalCase.postOpTasks.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No post-op tasks defined yet. They will appear after surgery completion.
                </div>
              ) : (
                <div className="space-y-3">
                  {surgicalCase.postOpTasks.map(task => (
                    <div key={task.id} className="flex justify-between items-center p-4 border rounded-md hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => dispatch(togglePostOpTask({ caseId, taskId: task.id }))}>
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${task.status === 'Completed' ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                          {task.status === 'Completed' && <CheckCircle2 className="w-3 h-3" />}
                        </div>
                        <span className={task.status === 'Completed' ? 'line-through text-muted-foreground' : 'font-medium'}>{task.task}</span>
                      </div>
                      <Badge variant={task.status === 'Completed' ? 'default' : 'secondary'}>{task.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
