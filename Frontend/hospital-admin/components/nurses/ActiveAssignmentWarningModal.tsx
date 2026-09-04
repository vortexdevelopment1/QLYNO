import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/hospital-admin/components/ui/dialog';
import { Button } from '@/hospital-admin/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ActiveAssignmentWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  nurseName: string;
  activePatientsCount: number;
}

export function ActiveAssignmentWarningModal({
  isOpen,
  onClose,
  onConfirm,
  nurseName,
  activePatientsCount
}: ActiveAssignmentWarningModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center space-x-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle>Active Patient Assignments</DialogTitle>
          </div>
          <DialogDescription className="pt-4 text-base">
            <span className="font-semibold text-foreground">{nurseName}</span> currently has <span className="font-bold">{activePatientsCount} active patient assignments</span>. 
            Reassigning them will require you to transfer or clear these assignments first.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>Proceed with Reassignment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
