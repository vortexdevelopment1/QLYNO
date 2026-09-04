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
import { AlertTriangle, FileText, Trash2 } from "lucide-react";
import { Badge } from "@/hospital-admin/components/ui/badge";

interface DeleteEvidenceConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fileName: string;
  fileSize?: string;
  capabilityTitle?: string;
}

export function DeleteEvidenceConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  fileName,
  fileSize = "Verified PDF",
  capabilityTitle,
}: DeleteEvidenceConfirmModalProps) {
  if (!fileName && !isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-1">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle className="text-base font-bold text-foreground">
              Remove Attached Evidence
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground pt-1">
            Are you sure you want to remove this document from the capability verification submission?
          </DialogDescription>
        </DialogHeader>

        <div className="p-3 my-2 rounded-lg border border-border bg-muted/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-4 w-4 text-primary shrink-0" />
            <span className="font-semibold text-foreground truncate max-w-[220px]">
              {fileName}
            </span>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono shrink-0">
            {fileSize}
          </Badge>
        </div>

        <div className="p-2.5 rounded-md border border-destructive/20 bg-destructive/5 text-destructive text-[11px] leading-relaxed">
          Removing this document will exclude it from the audit dossier submitted to accreditation reviewers.
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
            Confirm Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
