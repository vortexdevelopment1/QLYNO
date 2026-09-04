import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/hospital-admin/components/ui/dialog';
import { Button } from '@/hospital-admin/components/ui/button';
import { ShieldAlert } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/hospital-admin/components/ui/select';
import { mockStations } from '@/hospital-admin/lib/mock/nursing';

interface DeactivateStationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  stationName: string;
  activeRosterCount: number;
}

export function DeactivateStationModal({
  isOpen,
  onClose,
  onConfirm,
  stationName,
  activeRosterCount
}: DeactivateStationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center space-x-2 text-destructive">
            <ShieldAlert className="h-5 w-5" />
            <DialogTitle>Cannot Deactivate Station</DialogTitle>
          </div>
          <DialogDescription className="pt-4 text-base">
            The station <span className="font-semibold text-foreground">{stationName}</span> cannot be deactivated because it has <span className="font-bold">{activeRosterCount} active roster assignments</span>. 
            <br/><br/>
            You must clear the roster or force-reassign the staff before deactivating this station.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 text-left pt-2">
          <span className="text-sm font-medium text-foreground">Target Station for Reassignment:</span>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select target station..." />
            </SelectTrigger>
            <SelectContent>
              {mockStations.filter(s => s.name !== stationName && s.status === 'Active').map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>Force Reassign &amp; Deactivate</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
