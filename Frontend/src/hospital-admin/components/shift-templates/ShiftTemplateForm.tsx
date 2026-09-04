import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/hospital-admin/components/ui/dialog';
import { Button } from '@/hospital-admin/components/ui/button';
import { Input } from '@/hospital-admin/components/ui/input';
import { Label } from '@/hospital-admin/components/ui/label';
import { ShiftTemplate } from '@/hospital-admin/lib/mock/nursing';
import { Checkbox } from '@/hospital-admin/components/ui/checkbox';

interface ShiftTemplateFormProps {
  isOpen: boolean;
  onClose: () => void;
  template?: ShiftTemplate;
}

export function ShiftTemplateForm({ isOpen, onClose, template }: ShiftTemplateFormProps) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    startTime: template?.startTime || '',
    endTime: template?.endTime || '',
    isDefault: template?.isDefault || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{template ? 'Edit Shift Template' : 'Create Shift Template'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name</Label>
            <Input 
              id="name" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Morning Shift"
              required 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input 
                id="startTime" 
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input 
                id="endTime" 
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required 
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="isDefault" 
              checked={formData.isDefault}
              onCheckedChange={(checked) => setFormData({ ...formData, isDefault: !!checked })}
            />
            <label
              htmlFor="isDefault"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Set as hospital-wide default
            </label>
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Template</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
