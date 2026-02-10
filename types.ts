
export interface Lead {
  id: string;
  source: string;
  category: string;
  status: 'Hot' | 'Warm' | 'Cold' | 'Closed' | 'Lost';
  mrcValue: number;
  dateAdded: string;
  clientName: string;
  lastContacted: string;
  nextFollowUp: string;
  owner: string;
}

export interface StaffMember {
  id: string;
  name: string;
  designation: string;
  isOnDuty: boolean;
  currentAssignment?: string;
  lastLocation?: string;
}

export interface OperationalTarget {
  category: string;
  mrcTarget: number;
  leadGoal: number;
}

export interface ManpowerStats {
  total: number;
  active: number;    
  present: number;   
  available: number; 
  roster?: StaffMember[];
}

export interface DashboardData {
  leads: Lead[];
  manpower: ManpowerStats;
  targets: OperationalTarget[];
  lastUpdated: string;
}

export enum ViewMode {
  OVERVIEW = 'OVERVIEW',
  FOLLOW_UPS = 'FOLLOW_UPS',
  LEADS = 'LEADS',
  MANPOWER = 'MANPOWER',
  TRENDS = 'TRENDS'
}

export interface FilterState {
  search: string;
  status: string;
  category: string;
  owner: string;
}
