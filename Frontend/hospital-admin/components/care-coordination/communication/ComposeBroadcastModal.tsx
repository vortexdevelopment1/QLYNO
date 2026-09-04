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
import {
  Megaphone,
  AlertTriangle,
  Radio,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { BroadcastRecord, BroadcastType, BroadcastScope, BroadcastChannel } from "@/hospital-admin/lib/types";
import { mockMessageTemplates } from "@/hospital-admin/lib/mock-data/communication-hub";

interface ComposeBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBroadcastCreated: (broadcast: BroadcastRecord) => void;
}

export function ComposeBroadcastModal({
  isOpen,
  onClose,
  onBroadcastCreated,
}: ComposeBroadcastModalProps) {
  const [type, setType] = useState<BroadcastType>("Operational");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetScope, setTargetScope] = useState<BroadcastScope>("Department");
  const [targetDetail, setTargetDetail] = useState("ICU, OT Complex, Emergency");
  const [channels, setChannels] = useState<BroadcastChannel[]>(["PA Screens", "App Push"]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  
  // Rule F23-CANNOT-9: Explicit Confirmation Step for Hospital-wide broadcasts
  const [showWideScopeConfirmation, setShowWideScopeConfirmation] = useState(false);

  const toggleChannel = (channel: BroadcastChannel) => {
    if (channels.includes(channel)) {
      if (channels.length > 1) {
        setChannels(channels.filter((c) => c !== channel));
      }
    } else {
      setChannels([...channels, channel]);
    }
  };

  const handleTemplateSelect = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const tpl = mockMessageTemplates.find((t) => t.id === tplId || t.templateId === tplId);
    if (tpl) {
      setTitle(tpl.name);
      setMessage(tpl.content);
      if (tpl.category === "Broadcast" && tpl.templateId.includes("CODE-BLUE")) {
        setType("Code Blue");
      }
    }
  };

  const handleSubmit = () => {
    if (!title || !message) return;

    // If targeting Hospital-wide or Code Blue, enforce double confirmation
    if ((targetScope === "Hospital-wide" || type === "Code Blue" || type === "Emergency") && !showWideScopeConfirmation) {
      setShowWideScopeConfirmation(true);
      return;
    }

    const newBroadcast: BroadcastRecord = {
      id: `bcast-${Date.now()}`,
      broadcastId: `BC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      type,
      title,
      message,
      channels,
      targetScope,
      targetDetail: targetScope === "Department" || targetScope === "Floor" ? targetDetail : undefined,
      triggeredBy: "Dr. Arvind Kumar (Duty Officer)",
      triggeredByRole: "Care Operations Admin",
      triggeredAt: "Just now",
      status: "Active",
      acknowledgedCount: 0,
      targetAudienceSize: targetScope === "Hospital-wide" ? 140 : 45,
    };

    onBroadcastCreated(newBroadcast);
    setShowWideScopeConfirmation(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Compose Hospital Broadcast</DialogTitle>
              <DialogDescription className="text-xs">
                Broadcast operational alerts, facility maintenance notices, or emergency escalations across hospital channels.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {showWideScopeConfirmation ? (
          <div className="space-y-4 rounded-xl border border-rose-500/40 bg-rose-500/5 p-4 dark:bg-rose-950/20">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-6 w-6 text-rose-600 dark:text-rose-400" />
              <div>
                <h4 className="text-sm font-semibold text-rose-900 dark:text-rose-200">
                  Rule F23-CANNOT-9: Explicit Scope Confirmation
                </h4>
                <p className="mt-1 text-xs text-rose-800/90 dark:text-rose-300/90">
                  You are preparing to trigger a <strong>{type.toUpperCase()}</strong> broadcast targeting{" "}
                  <strong>{targetScope}</strong> via <strong>{channels.join(", ")}</strong>. This will push real-time alerts to all active devices, terminals, and PA systems.
                </p>
                <div className="mt-3 rounded-lg border border-border/80 bg-background/90 p-2.5 text-xs">
                  <div className="font-semibold text-foreground">{title}</div>
                  <p className="mt-1 text-muted-foreground">{message}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWideScopeConfirmation(false)}
                className="text-xs"
              >
                Back to Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleSubmit}
                className="text-xs"
              >
                Confirm & Dispatch Alert
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Quick Template Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Use Shared Template (Optional)</Label>
              <Select value={selectedTemplateId} onValueChange={handleTemplateSelect}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select pre-approved broadcast template..." />
                </SelectTrigger>
                <SelectContent>
                  {mockMessageTemplates
                    .filter((t) => t.category === "Broadcast" || t.category === "Clinical")
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id} className="text-xs">
                        [{t.templateId}] {t.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Broadcast Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as BroadcastType)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Operational" className="text-xs">Operational Notice</SelectItem>
                    <SelectItem value="Clinical Alert" className="text-xs">Clinical Advisory</SelectItem>
                    <SelectItem value="Code Blue" className="text-xs text-rose-600 font-medium">Code Blue (Emergency)</SelectItem>
                    <SelectItem value="Emergency" className="text-xs text-amber-600 font-medium">Facility Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Target Scope</Label>
                <Select value={targetScope} onValueChange={(v) => setTargetScope(v as BroadcastScope)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hospital-wide" className="text-xs">Hospital-wide (All Staff)</SelectItem>
                    <SelectItem value="Department" className="text-xs">Specific Department(s)</SelectItem>
                    <SelectItem value="Floor" className="text-xs">Specific Floor / Wing</SelectItem>
                    <SelectItem value="ICU / OT Complex" className="text-xs">ICU & OT Complex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(targetScope === "Department" || targetScope === "Floor") && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Target Details (Departments / Floors)</Label>
                <Input
                  value={targetDetail}
                  onChange={(e) => setTargetDetail(e.target.value)}
                  placeholder="e.g. ICU, Emergency, Floor 3 Ward"
                  className="h-9 text-xs"
                />
              </div>
            )}

            {/* Delivery Channels */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Delivery Channels</Label>
              <div className="flex flex-wrap gap-2">
                {(["PA Screens", "App Push", "SMS", "WhatsApp"] as BroadcastChannel[]).map((ch) => {
                  const isSelected = channels.includes(ch);
                  return (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => toggleChannel(ch)}
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      <Radio className="h-3 w-3" />
                      {ch}
                      {isSelected && <CheckCircle2 className="h-3 w-3 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Broadcast Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief descriptive headline..."
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Broadcast Message</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type complete alert message..."
                rows={3}
                className="text-xs resize-none"
              />
            </div>
          </div>
        )}

        {!showWideScopeConfirmation && (
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!title.trim() || !message.trim()}
              className="text-xs"
            >
              {targetScope === "Hospital-wide" || type === "Code Blue" || type === "Emergency"
                ? "Review Scope & Dispatch"
                : "Dispatch Broadcast"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
