"use client";

import { useState } from "react";
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
import { Textarea } from "@/hospital-admin/components/ui/textarea";
import { Badge } from "@/hospital-admin/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/hospital-admin/components/ui/select";
import { BookTemplate, Plus, X, Variable } from "lucide-react";
import { MessageTemplate, MessageTemplateCategory, MessageChannel, MessageTemplateStatus } from "@/hospital-admin/lib/types";

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateCreated: (template: MessageTemplate) => void;
}

const AVAILABLE_VARIABLES = [
  "patient_name",
  "patient_uhid",
  "doctor_name",
  "department",
  "appointment_date",
  "appointment_time",
  "test_name",
  "due_date",
  "portal_link",
  "location_room",
];

export function CreateTemplateModal({
  isOpen,
  onClose,
  onTemplateCreated,
}: CreateTemplateModalProps) {
  const [templateId, setTemplateId] = useState(`TPL-${Math.random().toString(36).substring(2, 7).toUpperCase()}`);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<MessageTemplateCategory>("Appointment");
  const [channel, setChannel] = useState<MessageChannel>("WhatsApp");
  const [content, setContent] = useState("");
  const [variables, setVariables] = useState<string[]>(["patient_name", "doctor_name"]);
  const [status, setStatus] = useState<MessageTemplateStatus>("Active");

  const insertVariable = (varName: string) => {
    setContent((prev) => `${prev} {{${varName}}}`);
    if (!variables.includes(varName)) {
      setVariables([...variables, varName]);
    }
  };

  const removeVariable = (varName: string) => {
    setVariables(variables.filter((v) => v !== varName));
  };

  const handleSubmit = () => {
    if (!name.trim() || !content.trim()) return;

    const newTemplate: MessageTemplate = {
      id: `tpl-${Date.now()}`,
      templateId,
      name,
      category,
      channel,
      content,
      variables,
      status,
      createdBy: "Care Coordination Lead",
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      usageCount: 0,
    };

    onTemplateCreated(newTemplate);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BookTemplate className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Create Message Template</DialogTitle>
              <DialogDescription className="text-xs">
                Build a standardized, pre-approved multi-channel message template with dynamic variable tokens.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Template Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Pre-Procedure Fasting Reminder"
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Template Code / ID</Label>
              <Input
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                placeholder="TPL-APT-001"
                className="h-9 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as MessageTemplateCategory)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Appointment" className="text-xs">Appointment</SelectItem>
                  <SelectItem value="Report" className="text-xs">Report Notice</SelectItem>
                  <SelectItem value="Follow-up" className="text-xs">Follow-up Recall</SelectItem>
                  <SelectItem value="Broadcast" className="text-xs">Hospital Broadcast</SelectItem>
                  <SelectItem value="Clinical" className="text-xs">Clinical / Panic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Channel</Label>
              <Select value={channel} onValueChange={(v) => setChannel(v as MessageChannel)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WhatsApp" className="text-xs">WhatsApp Business</SelectItem>
                  <SelectItem value="SMS" className="text-xs">Standard SMS</SelectItem>
                  <SelectItem value="Portal" className="text-xs">Patient Portal</SelectItem>
                  <SelectItem value="Broadcast" className="text-xs">PA / Screen Broadcast</SelectItem>
                  <SelectItem value="Phone Call" className="text-xs">Automated Voice IVR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Initial Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as MessageTemplateStatus)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active" className="text-xs">Active (Ready to Use)</SelectItem>
                  <SelectItem value="Draft" className="text-xs">Draft (Under Review)</SelectItem>
                  <SelectItem value="Archived" className="text-xs">Archived (Retired)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Variable Insertion Chips */}
          <div className="space-y-1.5 rounded-lg border border-border/80 bg-muted/30 p-3">
            <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <Variable className="h-3.5 w-3.5 text-primary" />
              <span>Click to Insert Variable Token into Content:</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {AVAILABLE_VARIABLES.map((varName) => (
                <button
                  key={varName}
                  type="button"
                  onClick={() => insertVariable(varName)}
                  className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 text-[11px] font-mono font-medium text-primary hover:bg-primary/10 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  {`{{${varName}}}`}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Message Body Content</Label>
              <span className="text-[10px] text-muted-foreground">{content.length} characters</span>
            </div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="e.g. Dear {{patient_name}}, your appointment with {{doctor_name}} is confirmed..."
              rows={4}
              className="text-xs resize-none font-mono"
            />
          </div>

          {/* Extracted Variables Preview */}
          {variables.length > 0 && (
            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground font-medium">Active Template Tokens:</span>
              <div className="flex flex-wrap gap-1.5">
                {variables.map((v) => (
                  <Badge key={v} variant="secondary" className="gap-1 text-[10px] font-mono">
                    {v}
                    <button type="button" onClick={() => removeVariable(v)}>
                      <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!name.trim() || !content.trim()}
            className="text-xs"
          >
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
