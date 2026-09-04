import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/hospital-admin/components/ui/dialog';
import { Button } from '@/hospital-admin/components/ui/button';
import { Input } from '@/hospital-admin/components/ui/input';
import { Label } from '@/hospital-admin/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/hospital-admin/components/ui/select';
import { Nurse, mockStations, mockShiftTemplates } from '@/hospital-admin/lib/mock/nursing';
import { ActiveAssignmentWarningModal } from '@/hospital-admin/components/nurses/ActiveAssignmentWarningModal';
import { AdminOverrideLogBanner } from '@/hospital-admin/components/shared/AdminOverrideLogBanner';

interface NurseFormProps {
  isOpen: boolean;
  onClose: () => void;
  nurse?: Nurse;
}

export function NurseForm({ isOpen, onClose, nurse }: NurseFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    roleScope: '',
    status: 'On Duty',
    stationId: 'none',
    qualifications: '',
    shiftId: 'none',
  });

  const [warningOpen, setWarningOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: nurse?.name || '',
        department: nurse?.department || '',
        roleScope: nurse?.roleScope || '',
        status: nurse?.status || 'On Duty',
        stationId: nurse?.stationId || 'none',
        qualifications: nurse?.qualifications.join(', ') || '',
        shiftId: 'none', // Mock initial shift
      });
    }
  }, [isOpen, nurse]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate checking if nurse is being reassigned while having active patients
    // In mock, if we edit an existing nurse and change station, trigger warning.
    if (nurse && nurse.stationId && nurse.stationId !== formData.stationId && nurse.stationId !== 'none') {
      setWarningOpen(true);
      return;
    }
    
    onClose();
  };

  const handleConfirmReassign = () => {
    setWarningOpen(false);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen && !warningOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{nurse ? 'Edit Nurse' : 'Register New Nurse'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <AdminOverrideLogBanner />
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="qualifications">Qualifications (comma separated)</Label>
              <Input 
                id="qualifications" 
                value={formData.qualifications}
                onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                placeholder="e.g. RN, ICU Certified"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select 
                  value={formData.department}
                  onValueChange={(val) => setFormData({ ...formData, department: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select dept" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Intensive Care">Intensive Care</SelectItem>
                    <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="roleScope">Role / Scope</Label>
                <Select 
                  value={formData.roleScope}
                  onValueChange={(val) => setFormData({ ...formData, roleScope: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Head Nurse">Head Nurse</SelectItem>
                    <SelectItem value="Charge Nurse">Charge Nurse</SelectItem>
                    <SelectItem value="Staff Nurse">Staff Nurse</SelectItem>
                    <SelectItem value="Triage Nurse">Triage Nurse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stationId">Station Assignment</Label>
                <Select 
                  value={formData.stationId}
                  onValueChange={(val) => setFormData({ ...formData, stationId: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Station" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {mockStations.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shiftId">Default Shift / Schedule</Label>
                <Select 
                  value={formData.shiftId}
                  onValueChange={(val) => setFormData({ ...formData, shiftId: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Shift" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Default Shift</SelectItem>
                    {mockShiftTemplates.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name} ({t.startTime}-{t.endTime})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Current Status</Label>
              <Select 
                value={formData.status}
                onValueChange={(val: any) => setFormData({ ...formData, status: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="On Duty">On Duty</SelectItem>
                  <SelectItem value="Off Duty">Off Duty</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                  <SelectItem value="Late">Late</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="Unassigned">Unassigned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">Save Nurse</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {nurse && (
        <ActiveAssignmentWarningModal 
          isOpen={warningOpen}
          onClose={() => setWarningOpen(false)}
          onConfirm={handleConfirmReassign}
          nurseName={nurse.name}
          activePatientsCount={3} // Mock active patients count
        />
      )}
    </>
  );
}
