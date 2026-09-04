export type StationStatus = 'Active' | 'Inactive';
export type StaffStatus = 'On Duty' | 'Off Duty' | 'On Leave' | 'Late' | 'Absent' | 'Unassigned';
export type SupportStaffType = 'Attendant' | 'Housekeeping' | 'Assistant';
export type ShiftChangeStatus = 'Pending' | 'Approved' | 'Rejected';
export type RosterStatus = 'Scheduled' | 'Confirmed' | 'Swapped' | 'Cancelled';

export interface NurseStation {
  id: string;
  name: string;
  department: string;
  location: string;
  leadId: string | null;
  status: StationStatus;
}

export interface Nurse {
  id: string;
  name: string;
  stationId: string | null;
  department: string;
  roleScope: string;
  status: StaffStatus;
  qualifications: string[];
}

export interface SupportStaff {
  id: string;
  name: string;
  type: SupportStaffType;
  stationId: string | null;
  status: StaffStatus;
}

export interface ShiftTemplate {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  isDefault?: boolean;
}

export interface RosterEntry {
  id: string;
  staffId: string;
  staffType: 'Nurse' | 'SupportStaff';
  shiftTemplateId: string;
  date: string; // YYYY-MM-DD
  stationId: string;
  status: RosterStatus;
}

export interface ShiftChangeRequest {
  id: string;
  staffId: string;
  rosterEntryId: string;
  targetShiftTemplateId: string;
  targetDate: string;
  status: ShiftChangeStatus;
  reason: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  entity: string;
  before: string;
  after: string;
  timestamp: string;
  reason: string;
  stationScope?: string;
}

// Mock Data

export const mockStations: NurseStation[] = [
  { id: 'st-1', name: 'ICU Central', department: 'Intensive Care', location: 'Block A, Floor 2', leadId: 'n-1', status: 'Active' },
  { id: 'st-2', name: 'Pediatrics Wing A', department: 'Pediatrics', location: 'Block B, Floor 1', leadId: 'n-2', status: 'Active' },
  { id: 'st-3', name: 'ER Front Desk', department: 'Emergency', location: 'Ground Floor, Main Bldg', leadId: 'n-3', status: 'Inactive' },
];

export const mockNurses: Nurse[] = [
  { id: 'n-1', name: 'Priya Sharma', stationId: 'st-1', department: 'Intensive Care', roleScope: 'Head Nurse', status: 'On Duty', qualifications: ['RN', 'ICU Certified'] },
  { id: 'n-2', name: 'Rahul Verma', stationId: 'st-2', department: 'Pediatrics', roleScope: 'Charge Nurse', status: 'Off Duty', qualifications: ['RN', 'Pediatric Specialist'] },
  { id: 'n-3', name: 'Anjali Desai', stationId: 'st-3', department: 'Emergency', roleScope: 'Triage Nurse', status: 'On Leave', qualifications: ['RN', 'Trauma Certified'] },
  { id: 'n-4', name: 'Amit Patel', stationId: 'st-1', department: 'Intensive Care', roleScope: 'Staff Nurse', status: 'On Duty', qualifications: ['RN'] },
  { id: 'n-5', name: 'Neha Gupta', stationId: null, department: 'General', roleScope: 'Staff Nurse', status: 'Unassigned', qualifications: ['LPN'] },
];

export const mockSupportStaff: SupportStaff[] = [
  { id: 'ss-1', name: 'Ravi Kumar', type: 'Attendant', stationId: 'st-1', status: 'On Duty' },
  { id: 'ss-2', name: 'Sunita Reddy', type: 'Housekeeping', stationId: 'st-1', status: 'Off Duty' },
  { id: 'ss-3', name: 'Vikram Singh', type: 'Assistant', stationId: 'st-2', status: 'On Duty' },
];

export const mockShiftTemplates: ShiftTemplate[] = [
  { id: 'shift-1', name: 'Morning Shift', startTime: '06:00', endTime: '14:00', isDefault: true },
  { id: 'shift-2', name: 'Evening Shift', startTime: '14:00', endTime: '22:00', isDefault: false },
  { id: 'shift-3', name: 'Night Shift', startTime: '22:00', endTime: '06:00', isDefault: false },
];

export const mockRoster: RosterEntry[] = [
  { id: 'r-1', staffId: 'n-1', staffType: 'Nurse', shiftTemplateId: 'shift-1', date: new Date().toISOString().split('T')[0], stationId: 'st-1', status: 'Confirmed' },
  { id: 'r-2', staffId: 'n-4', staffType: 'Nurse', shiftTemplateId: 'shift-1', date: new Date().toISOString().split('T')[0], stationId: 'st-1', status: 'Scheduled' },
  { id: 'r-3', staffId: 'ss-1', staffType: 'SupportStaff', shiftTemplateId: 'shift-1', date: new Date().toISOString().split('T')[0], stationId: 'st-1', status: 'Confirmed' },
];

export const mockShiftChangeRequests: ShiftChangeRequest[] = [
  { id: 'req-1', staffId: 'n-4', rosterEntryId: 'r-2', targetShiftTemplateId: 'shift-2', targetDate: new Date().toISOString().split('T')[0], status: 'Pending', reason: 'Personal appointment in the morning.' },
];

export const mockAuditLogs: AuditLog[] = [
  { id: 'log-1', actor: 'System Admin', action: 'CREATE_STATION', entity: 'Nurse Station (ICU Central)', before: '-', after: 'Created', timestamp: new Date(Date.now() - 86400000).toISOString(), reason: 'Hospital expansion', stationScope: 'All' },
  { id: 'log-2', actor: 'Priya Sharma', action: 'ASSIGN_SHIFT', entity: 'Roster (n-4)', before: 'None', after: 'Morning Shift', timestamp: new Date(Date.now() - 3600000).toISOString(), reason: 'Weekly planning', stationScope: 'ICU Central' },
];
