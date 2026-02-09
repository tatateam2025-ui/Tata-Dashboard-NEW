export interface Lead {
  id: string;
  source: string;
  category: string;
  status: 'Hot' | 'Warm' | 'Cold' | 'Closed' | 'Lost';
  mrcValue: number;
  dateAdded: string;
  clientName: string;
  lastContacted: string;
}

export interface ManpowerStats {
  total: number;
  active: number;
  present: number;
  onLeave: number;
}

export interface DashboardData {
  leads: Lead[];
  manpower: ManpowerStats;
  lastUpdated: string;
}

export enum ViewMode {
  OVERVIEW = 'OVERVIEW',
  SALES = 'SALES',
  LEADS = 'LEADS',
  MANPOWER = 'MANPOWER',
  TRENDS = 'TRENDS'
}

export interface FilterState {
  search: string;
  status: string;
  category: string;
  source: string;
}