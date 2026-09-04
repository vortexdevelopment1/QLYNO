"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/hospital-admin/components/ui/dialog";
import { Button } from "@/hospital-admin/components/ui/button";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Checkbox } from "@/hospital-admin/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/hospital-admin/components/ui/tabs";
import { ShiftTemplate } from "@/hospital-admin/lib/mock/nursing";
import { Clock, Plus, Check, CalendarDays, Sparkles } from "lucide-react";

// Master library of shift templates available hospital-wide
export const masterShiftTemplateLibrary: ShiftTemplate[] = [
  { id: "shift-1", name: "Morning Shift", startTime: "06:00", endTime: "14:00", isDefault: true },
  { id: "shift-2", name: "Evening Shift", startTime: "14:00", endTime: "22:00", isDefault: false },
  { id: "shift-3", name: "Night Shift", startTime: "22:00", endTime: "06:00", isDefault: false },
  { id: "shift-4", name: "General Day Shift", startTime: "09:00", endTime: "17:30", isDefault: false },
  { id: "shift-5", name: "12-Hour Critical Care (Day)", startTime: "08:00", endTime: "20:00", isDefault: false },
  { id: "shift-6", name: "12-Hour Critical Care (Night)", startTime: "20:00", endTime: "08:00", isDefault: false },
  { id: "shift-7", name: "Emergency On-Call Duty", startTime: "18:00", endTime: "06:00", isDefault: false },
  { id: "shift-8", name: "Twilight Support Shift", startTime: "16:00", endTime: "00:00", isDefault: false },
];

interface AssignShiftTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  stationName: string;
  assignedTemplates: ShiftTemplate[];
  onAssign: (template: ShiftTemplate) => void;
}

export function AssignShiftTemplateModal({
  isOpen,
  onClose,
  stationName,
  assignedTemplates,
  onAssign,
}: AssignShiftTemplateModalProps) {
  const [activeTab, setActiveTab] = useState<"library" | "custom">("library");
  const [selectedLibraryId, setSelectedLibraryId] = useState<string>("");

  // Custom Form State
  const [customName, setCustomName] = useState("");
  const [customStartTime, setCustomStartTime] = useState("07:00");
  const [customEndTime, setCustomEndTime] = useState("15:30");
  const [isGlobalDefault, setIsGlobalDefault] = useState(false);

  const assignedIds = new Set(assignedTemplates.map((t) => t.id));

  const handleAssignFromLibrary = () => {
    const template = masterShiftTemplateLibrary.find((t) => t.id === selectedLibraryId);
    if (!template) return;
    onAssign(template);
    setSelectedLibraryId("");
    onClose();
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newTemplate: ShiftTemplate = {
      id: `shift-custom-${Date.now()}`,
      name: customName.trim(),
      startTime: customStartTime,
      endTime: customEndTime,
      isDefault: isGlobalDefault,
    };

    onAssign(newTemplate);
    // Reset form
    setCustomName("");
    setCustomStartTime("07:00");
    setCustomEndTime("15:30");
    setIsGlobalDefault(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <CalendarDays className="h-4 w-4 text-primary" />
            Assign Shift Template — {stationName}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Link standard hospital shift schedules or create a custom station-specific timing template.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full mt-2">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="library" className="text-xs">
              Hospital Template Library
            </TabsTrigger>
            <TabsTrigger value="custom" className="text-xs">
              Create Station Template
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: LIBRARY */}
          <TabsContent value="library" className="space-y-3 pt-3">
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {masterShiftTemplateLibrary.map((template) => {
                const isAssigned = assignedIds.has(template.id);
                const isSelected = selectedLibraryId === template.id;

                return (
                  <div
                    key={template.id}
                    onClick={() => !isAssigned && setSelectedLibraryId(template.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border text-xs transition-all cursor-pointer ${
                      isAssigned
                        ? "opacity-60 bg-muted/40 border-border cursor-not-allowed"
                        : isSelected
                        ? "bg-primary/10 border-primary shadow-xs ring-1 ring-primary/30"
                        : "hover:bg-muted/50 border-border bg-card"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{template.name}</span>
                        {template.isDefault && (
                          <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-normal">
                            Global Default
                          </Badge>
                        )}
                        {isAssigned && (
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-emerald-600 border-emerald-500/30 bg-emerald-500/10">
                            Already Assigned
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
                        <Clock className="h-3 w-3" />
                        <span>
                          {template.startTime} – {template.endTime}
                        </span>
                      </div>
                    </div>

                    {!isAssigned && (
                      <div className="h-5 w-5 rounded-full border flex items-center justify-center border-border">
                        {isSelected && <Check className="h-3 w-3 text-primary stroke-[3]" />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!selectedLibraryId}
                onClick={handleAssignFromLibrary}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Assign Selected Template
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* TAB 2: CUSTOM TEMPLATE */}
          <TabsContent value="custom" className="pt-3">
            <form onSubmit={handleCreateCustom} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-name" className="text-xs font-semibold">
                  Shift Template Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="custom-name"
                  placeholder="e.g. ICU 12h Rotational Shift, Weekend Cover"
                  className="text-xs h-8"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="start-time" className="text-xs font-semibold">
                    Start Time <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="start-time"
                    type="time"
                    className="text-xs h-8"
                    value={customStartTime}
                    onChange={(e) => setCustomStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="end-time" className="text-xs font-semibold">
                    End Time <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="end-time"
                    type="time"
                    className="text-xs h-8"
                    value={customEndTime}
                    onChange={(e) => setCustomEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <Checkbox
                  id="custom-default"
                  checked={isGlobalDefault}
                  onCheckedChange={(checked) => setIsGlobalDefault(!!checked)}
                />
                <label
                  htmlFor="custom-default"
                  className="text-xs text-muted-foreground leading-none cursor-pointer"
                >
                  Mark as Hospital-Wide Default Template
                </label>
              </div>

              <div className="p-2.5 rounded-md border border-border bg-muted/20 text-muted-foreground text-[11px] flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Station-specific shift templates allow localized rostering while preserving master scheduling compliance.</span>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={!customName.trim()}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Create &amp; Assign Template
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
