import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/hospital-admin/components/ui/table';
import { Switch } from '@/hospital-admin/components/ui/switch';
import { Nurse } from '@/hospital-admin/lib/mock/nursing';
import { Button } from '@/hospital-admin/components/ui/button';
import { Badge } from '@/hospital-admin/components/ui/badge';

interface PermissionMatrixProps {
  staffList: Nurse[];
}

const PERMISSIONS = [
  { id: 'view_roster', label: 'View Roster' },
  { id: 'edit_roster', label: 'Edit Roster' },
  { id: 'manage_staff', label: 'Manage Staff' },
  { id: 'override_shifts', label: 'Override Shifts' },
  { id: 'view_audit', label: 'View Audit Logs' },
];

export function PermissionMatrix({ staffList }: PermissionMatrixProps) {
  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>({});
  const [isHospitalWide, setIsHospitalWide] = useState<Record<string, boolean>>({});

  // Initialize mock state
  React.useEffect(() => {
    const initialPerms: Record<string, Record<string, boolean>> = {};
    const initialScopes: Record<string, boolean> = {};
    
    staffList.forEach(staff => {
      initialPerms[staff.id] = {
        view_roster: true,
        edit_roster: staff.roleScope === 'Head Nurse' || staff.roleScope === 'Charge Nurse',
        manage_staff: staff.roleScope === 'Head Nurse',
        override_shifts: staff.roleScope === 'Head Nurse',
        view_audit: staff.roleScope === 'Head Nurse',
      };
      // Mock scope: only one person has hospital wide mock
      initialScopes[staff.id] = staff.name === 'Priya Sharma';
    });
    setPermissions(initialPerms);
    setIsHospitalWide(initialScopes);
  }, [staffList]);

  const handleToggle = (staffId: string, permId: string, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        [permId]: value
      }
    }));
  };

  const handleScopeToggle = (staffId: string, value: boolean) => {
    setIsHospitalWide(prev => ({
      ...prev,
      [staffId]: value
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Delegated Permissions</h3>
        <Button>Save Changes</Button>
      </div>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Staff Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="bg-muted/30">Hospital-wide Access</TableHead>
              {PERMISSIONS.map(p => (
                <TableHead key={p.id} className="text-center">{p.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffList.map((staff) => (
              <TableRow key={staff.id}>
                <TableCell className="font-medium">{staff.name}</TableCell>
                <TableCell className="text-muted-foreground">{staff.roleScope}</TableCell>
                <TableCell className="bg-muted/30 border-r">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={isHospitalWide[staff.id] || false}
                      onCheckedChange={(val) => handleScopeToggle(staff.id, val)}
                    />
                    {isHospitalWide[staff.id] ? <Badge>Hospital-Wide</Badge> : <Badge variant="outline">Station-Scoped</Badge>}
                  </div>
                </TableCell>
                {PERMISSIONS.map(p => (
                  <TableCell key={p.id} className="text-center">
                    <Switch 
                      checked={p.id === 'view_audit' ? true : (permissions[staff.id]?.[p.id] || false)}
                      onCheckedChange={(val) => handleToggle(staff.id, p.id, val)}
                      disabled={p.id === 'view_audit'}
                      title={p.id === 'view_audit' ? "Station audit visibility cannot be restricted (Admin Rule ❌3)" : ""}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
