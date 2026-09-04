import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/hospital-admin/components/ui/dialog';
import { Button } from '@/hospital-admin/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { AdminOverrideLogBanner } from '@/hospital-admin/components/shared/AdminOverrideLogBanner';

interface ShiftOverlapWarningProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  staffName: string;
  overlapDetails: string;
}

export function ShiftOverlapWarning({
  isOpen,
  onClose,
  onConfirm,
  staffName,
  overlapDetails
}: ShiftOverlapWarningProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="mb-4 text-left">
            <AdminOverrideLogBanner />
          </div>
          <div className="flex items-center space-x-2 text-warning">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <DialogTitle>Shift Overlap Detected</DialogTitle>
          </div>
          <DialogDescription className="pt-4 text-base">
            The new shift assignment for <span className="font-semibold text-foreground">{staffName}</span> overlaps with an existing shift:
            <span className="block mt-2 p-2 bg-muted rounded-md text-sm border border-border">
              {overlapDetails}
            </span>
            <span className="block mt-2">Are you sure you want to save this assignment?</span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="default" onClick={onConfirm} className="bg-yellow-600 hover:bg-yellow-700 text-white">Save Anyway</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
