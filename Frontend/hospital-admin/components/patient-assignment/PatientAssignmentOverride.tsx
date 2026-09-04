import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/hospital-admin/components/ui/dialog';
import { Button } from '@/hospital-admin/components/ui/button';
import { Input } from '@/hospital-admin/components/ui/input';
import { Label } from '@/hospital-admin/components/ui/label';
import { AdminOverrideLogBanner } from '@/hospital-admin/components/shared/AdminOverrideLogBanner';

interface PatientAssignmentOverrideProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  currentNurse: string;
}

export function PatientAssignmentOverride({ isOpen, onClose, patientName, currentNurse }: PatientAssignmentOverrideProps) {
  const [targetNurse, setTargetNurse] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Override Patient Assignment</DialogTitle>
          <DialogDescription className="pt-2">
            This is an exception workflow to forcefully reassign a patient. It bypasses normal station logic.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <AdminOverrideLogBanner />
          
          <div className="space-y-1">
            <Label>Patient</Label>
            <div className="p-2 bg-muted rounded-md text-sm font-medium">{patientName}</div>
          </div>

          <div className="space-y-1">
            <Label>Current Assignment</Label>
            <div className="p-2 bg-muted rounded-md text-sm">{currentNurse}</div>
          </div>

          <div className="space-y-2 pt-2">
            <Label htmlFor="targetNurse">Reassign To (Nurse ID / Name)</Label>
            <Input 
              id="targetNurse" 
              value={targetNurse}
              onChange={(e) => setTargetNurse(e.target.value)}
              placeholder="Search nurse..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Override</Label>
            <Input 
              id="reason" 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Emergency redistribution"
              required
            />
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="destructive">Confirm Override</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
