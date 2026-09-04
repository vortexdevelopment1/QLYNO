"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/hospital-admin/components/ui/tabs";
import {
  mockStations,
  mockNurses,
  mockSupportStaff,
  mockShiftTemplates,
  mockRoster,
  ShiftTemplate,
} from "@/hospital-admin/lib/mock/nursing";
import { ScopeIndicator } from "@/hospital-admin/components/shared/ScopeIndicator";
import { StatusBadge } from "@/hospital-admin/components/shared/StatusBadge";
import { RosterGrid } from "@/hospital-admin/components/roster/RosterGrid";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import { useToast } from "@/hospital-admin/hooks/use-toast";
import { PatientAssignmentOverride } from "@/hospital-admin/components/patient-assignment/PatientAssignmentOverride";
import { AssignShiftTemplateModal } from "@/hospital-admin/components/nurse-stations/AssignShiftTemplateModal";
import { DeleteShiftTemplateModal } from "@/hospital-admin/components/shift-templates/DeleteShiftTemplateModal";
import { Clock, Plus, Trash2, CalendarDays } from "lucide-react";

export default function NurseStationDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const stationId = params.id as string;
  const station = mockStations.find((s) => s.id === stationId);

  const [overrideOpen, setOverrideOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [stationTemplates, setStationTemplates] = useState<ShiftTemplate[]>(mockShiftTemplates);
  const [templateToDelete, setTemplateToDelete] = useState<ShiftTemplate | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const nurses = mockNurses.filter((n) => n.stationId === stationId);
  const supportStaff = mockSupportStaff.filter((s) => s.stationId === stationId);
  const roster = mockRoster.filter((r) => r.stationId === stationId);

  if (!station) return <div>Station not found</div>;

  const handleAssignTemplate = (template: ShiftTemplate) => {
    if (stationTemplates.some((t) => t.id === template.id)) {
      toast({
        title: "Template Already Assigned",
        description: `"${template.name}" is already linked to ${station.name}.`,
      });
      return;
    }

    setStationTemplates((prev) => [...prev, template]);
    toast({
      title: "Shift Template Assigned",
      description: `"${template.name}" (${template.startTime} – ${template.endTime}) has been assigned to ${station.name}.`,
    });
  };

  const handlePromptDelete = (template: ShiftTemplate) => {
    setTemplateToDelete(template);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmRemoveTemplate = () => {
    if (!templateToDelete) return;
    const { id, name } = templateToDelete;
    setStationTemplates((prev) => prev.filter((t) => t.id !== id));
    toast({
      title: "Template Unassigned",
      description: `"${name}" unlinked from ${station.name}.`,
      variant: "destructive",
    });
    setTemplateToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold tracking-tight">{station.name}</h1>
            <StatusBadge status={station.status} />
          </div>
          <p className="text-muted-foreground mt-1">
            {station.department} • {station.location}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="destructive" onClick={() => setOverrideOpen(true)}>
            Override Patient Assignment
          </Button>
          <ScopeIndicator scope="Hospital Admin" />
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="nurses">Nurses ({nurses.length})</TabsTrigger>
          <TabsTrigger value="support">Support Staff ({supportStaff.length})</TabsTrigger>
          <TabsTrigger value="shift-templates">Shift Templates ({stationTemplates.length})</TabsTrigger>
          <TabsTrigger value="roster">Roster</TabsTrigger>
          <TabsTrigger value="handover">Handover Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-md shadow-sm bg-background">
              <h3 className="text-sm font-medium text-muted-foreground">Station Lead</h3>
              <p className="text-xl font-bold mt-1">
                {mockNurses.find((n) => n.id === station.leadId)?.name || "Unassigned"}
              </p>
            </div>
            <div className="p-4 border rounded-md shadow-sm bg-background">
              <h3 className="text-sm font-medium text-muted-foreground">Active Nurses</h3>
              <p className="text-xl font-bold mt-1">{nurses.length}</p>
            </div>
            <div className="p-4 border rounded-md shadow-sm bg-background">
              <h3 className="text-sm font-medium text-muted-foreground">Support Staff</h3>
              <p className="text-xl font-bold mt-1">{supportStaff.length}</p>
            </div>
            <div className="p-4 border rounded-md shadow-sm bg-background">
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <p className="text-xl font-bold mt-1">{station.status}</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="nurses">
          <div className="rounded-md border p-4 bg-background">
            <h3 className="font-semibold text-lg mb-4">Assigned Nurses</h3>
            <ul className="space-y-2">
              {nurses.map((n) => (
                <li key={n.id} className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                  <span>
                    {n.name} <span className="text-sm text-muted-foreground">({n.roleScope})</span>
                  </span>
                  <StatusBadge status={n.status} />
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="support">
          <div className="rounded-md border p-4 bg-background">
            <h3 className="font-semibold text-lg mb-4">Assigned Support Staff</h3>
            <ul className="space-y-2">
              {supportStaff.map((s) => (
                <li key={s.id} className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                  <span>
                    {s.name} <span className="text-sm text-muted-foreground">({s.type})</span>
                  </span>
                  <StatusBadge status={s.status} />
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="shift-templates">
          <div className="rounded-md border p-4 bg-background">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  Station Shift Templates
                </h3>
                <p className="text-muted-foreground text-sm mt-0.5">
                  Shift templates actively configured for {station.name}. Default templates are inherited hospital-wide.
                </p>
              </div>
              <Button size="sm" onClick={() => setAssignModalOpen(true)} className="gap-1.5 shrink-0">
                <Plus className="h-4 w-4" /> Assign Template
              </Button>
            </div>

            {stationTemplates.length === 0 ? (
              <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground text-sm">
                No shift templates assigned to this station. Click &quot;Assign Template&quot; to configure shifts.
              </div>
            ) : (
              <ul className="space-y-2.5">
                {stationTemplates.map((t) => (
                  <li
                    key={t.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-muted/40 hover:bg-muted/60 border border-border rounded-lg transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-sm">{t.name}</span>
                        {t.isDefault ? (
                          <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                            Global Default
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-primary border-primary/30 bg-primary/5">
                            Station Specific
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-mono">
                          {t.startTime} – {t.endTime}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive gap-1"
                        onClick={() => handlePromptDelete(t)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>

        <TabsContent value="roster">
          <div className="bg-background rounded-md">
            <RosterGrid
              roster={roster}
              staffList={[...nurses, ...supportStaff]}
              shiftTemplates={stationTemplates}
            />
          </div>
        </TabsContent>

        <TabsContent value="handover">
          <div className="rounded-md border p-4 bg-background">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">
                  Handover Log{" "}
                  <span className="text-xs font-normal text-muted-foreground ml-2">
                    (Read-only Monitor)
                  </span>
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Hospital Admin can monitor handovers but cannot create them. This is primarily a Nurse workflow.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  toast({
                    title: "Handover Pending",
                    description: "Priya Sharma has an overdue handover for the Morning Shift.",
                  })
                }
              >
                Simulate Notification
              </Button>
            </div>
            <div className="space-y-4">
              <div className="p-3 border rounded-md">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>From: Priya Sharma (Morning Shift)</span>
                  <span>To: Rahul Verma (Evening Shift)</span>
                </div>
                <p className="text-sm">
                  Bed 4 needs IV fluid change at 15:00. Bed 6 patient complaining of mild pain.
                </p>
                <div className="mt-2">
                  <Badge variant="outline">Completed</Badge>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <PatientAssignmentOverride
        isOpen={overrideOpen}
        onClose={() => setOverrideOpen(false)}
        patientName="Amit Patel (Bed 4)"
        currentNurse="Priya Sharma"
      />

      <AssignShiftTemplateModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        stationName={station.name}
        assignedTemplates={stationTemplates}
        onAssign={handleAssignTemplate}
      />

      <DeleteShiftTemplateModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTemplateToDelete(null);
        }}
        onConfirm={handleConfirmRemoveTemplate}
        template={templateToDelete}
        stationName={station.name}
        isUnassign={true}
      />
    </div>
  );
}
