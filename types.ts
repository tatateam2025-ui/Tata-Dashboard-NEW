
export interface Lead {
  id: string;
  source: string;
  category: string;
  status: 'Hot' | 'Warm' | 'Cold' | 'Closed' | 'Lost';
  mrcValue: number;
  dateAdded: string;
  clientName: string;
  lastContacted: string;
  nextFollowUp: string; // Date string
  owner: string;        // Lead owner/manager
}

export interface ManpowerStats {
  total: number;
  active: number;    // Currently assigned
  present: number;   // At office/on duty
  available: number; // Present but not assigned
}

export interface DashboardData {
  leads: Lead[];
  manpower: ManpowerStats;
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
