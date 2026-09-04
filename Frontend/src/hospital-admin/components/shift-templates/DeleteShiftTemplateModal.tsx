"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/hospital-admin/components/ui/dialog";
import { Button } from "@/hospital-admin/components/ui/button";
import { AlertTriangle, Clock, Trash2 } from "lucide-react";
import { ShiftTemplate } from "@/hospital-admin/lib/mock/nursing";
import { Badge } from "@/hospital-admin/components/ui/badge";

interface DeleteShiftTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  template: ShiftTemplate | null;
  stationName?: string;
  isUnassign?: boolean;
}

export function DeleteShiftTemplateModal({
  isOpen,
  onClose,
  onConfirm,
  template,
  stationName,
  isUnassign = false,
}: DeleteShiftTemplateModalProps) {
  if (!template) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-1">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle className="text-base font-bold text-foreground">
              {isUnassign ? "Unassign Shift Template" : "Delete Shift Template"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground pt-1">
            {isUnassign
              ? `Are you sure you want to unassign this shift template from ${stationName || "this station"}?`
              : "Are you sure you want to permanently delete this shift template from the hospital master library?"}
          </DialogDescription>
        </DialogHeader>

        <div className="p-3.5 my-2 rounded-lg border border-border bg-muted/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm text-foreground">{template.name}</span>
            {template.isDefault && (
              <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                Hospital Default
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span className="font-mono">
              {template.startTime} – {template.endTime}
            </span>
          </div>
          {stationName && (
            <div className="text-[11px] text-muted-foreground pt-1 border-t border-border/60">
              Target Station: <span className="font-medium text-foreground">{stationName}</span>
            </div>
          )}
        </div>

        <div className="p-2.5 rounded-md border border-destructive/20 bg-destructive/5 text-destructive text-[11px] leading-relaxed">
          {isUnassign
            ? "Staff members scheduled under this template for this station will retain existing roster entries, but new shifts will require reassignment."
            : "Active staff rosters currently utilizing this template will display an unmapped shift warning until updated."}
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-3">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {isUnassign ? "Confirm Unassign" : "Confirm Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
