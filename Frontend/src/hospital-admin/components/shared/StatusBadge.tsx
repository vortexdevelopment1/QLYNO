import React from 'react';
import { Badge } from '@/hospital-admin/components/ui/badge';
import { StationStatus, StaffStatus, ShiftChangeStatus, RosterStatus } from '@/hospital-admin/lib/mock/nursing';

type StatusType = StationStatus | StaffStatus | ShiftChangeStatus | RosterStatus | 'Pending' | 'Approved' | 'Rejected' | 'Active' | 'Inactive' | 'On Duty' | 'Off Duty' | 'On Leave' | 'Unassigned' | 'Late' | 'Absent' | 'Scheduled' | 'Confirmed' | 'Swapped' | 'Cancelled' | 'In Progress' | 'Closed' | 'Planning' | 'Draft' | 'Ready' | 'Submitted' | (string & {});

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';

  switch (status) {
    case 'Active':
    case 'On Duty':
    case 'Approved':
    case 'Confirmed':
    case 'In Progress':
    case 'Planning':
    case 'Ready':
      variant = 'default'; // Or a custom success variant if available
      break;
    case 'Inactive':
    case 'Off Duty':
    case 'Unassigned':
    case 'Cancelled':
    case 'Closed':
    case 'Draft':
    case 'Submitted':
      variant = 'secondary';
      break;
    case 'Late':
    case 'Absent':
    case 'Rejected':
      variant = 'destructive';
      break;
    case 'Pending':
    case 'On Leave':
    case 'Scheduled':
    case 'Swapped':
      variant = 'outline';
      break;
  }

  return (
    <Badge variant={variant} className={className}>
      {status}
    </Badge>
  );
}
