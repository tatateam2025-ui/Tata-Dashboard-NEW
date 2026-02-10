
import { DashboardData, Lead, StaffMember, OperationalTarget, ManpowerStats } from '../types';
import { MOCK_LEADS, MOCK_MANPOWER } from '../constants';

export class DataService {
  static async fetchDashboardData(): Promise<DashboardData> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      leads: [...MOCK_LEADS],
      manpower: { ...MOCK_MANPOWER },
      targets: [
        { category: 'Enterprise', mrcTarget: 500000, leadGoal: 20 },
        { category: 'SME', mrcTarget: 150000, leadGoal: 50 },
      ],
      lastUpdated: new Date().toISOString(),
    };
  }

  static getTemplate(type: 'leads' | 'staff' | 'targets'): string {
    if (type === 'leads') {
      return [
        "Client Name,Source,Category,Status,MRC Value,Next Follow-up Date,Owner,Date Added",
        "Tata Steel,LinkedIn,Enterprise,Hot,45000,2024-05-20,Gulzar Khan,2024-01-01"
      ].join('\n');
    }
    if (type === 'staff') {
      return [
        "Staff Name,Designation,On Duty (Yes/No),Current Assignment,Last Location",
        "Gulzar Khan,Manager,Yes,Tata Steel HQ,Mumbai",
        "Amit Singh,Executive,No,,Delhi"
      ].join('\n');
    }
    return [
      "Category,Monthly Target MRC,Lead Goal",
      "Enterprise,500000,20",
      "SME,150000,50"
    ].join('\n');
  }

  static downloadTemplate(type: 'leads' | 'staff' | 'targets') {
    const csvContent = this.getTemplate(type);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `tata_${type}_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static parseCSV(csvText: string): { type: 'leads' | 'staff' | 'targets' | 'unknown', data: any[] } {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim());
    if (lines.length < 1) return { type: 'unknown', data: [] };

    const headers = lines[0].toLowerCase();
    
    if (headers.includes('client') || headers.includes('mrc value')) {
      return { type: 'leads', data: this.parseLeads(lines) };
    }
    if (headers.includes('staff') || headers.includes('designation')) {
      return { type: 'staff', data: this.parseStaff(lines) };
    }
    if (headers.includes('target') || headers.includes('goal')) {
      return { type: 'targets', data: this.parseTargets(lines) };
    }

    return { type: 'unknown', data: [] };
  }

  private static parseLeads(lines: string[]): Lead[] {
    const rawHeaders = lines[0].split(',').map(h => h.trim().toLowerCase());
    return lines.slice(1).map((line, i) => {
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const lead: any = { id: `lead-${i}-${Date.now()}` };
      rawHeaders.forEach((h, idx) => {
        const val = values[idx] || '';
        if (h.match(/client|name/)) lead.clientName = val;
        else if (h.includes('source')) lead.source = val;
        else if (h.includes('category')) lead.category = val;
        else if (h.includes('status')) lead.status = this.normalizeStatus(val);
        else if (h.match(/mrc|value/)) lead.mrcValue = parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
        else if (h.match(/follow|next/)) lead.nextFollowUp = this.normalizeDate(val);
        else if (h.includes('owner')) lead.owner = val;
        else if (h.includes('added')) lead.dateAdded = this.normalizeDate(val);
      });
      return lead as Lead;
    });
  }

  private static parseStaff(lines: string[]): StaffMember[] {
    const rawHeaders = lines[0].split(',').map(h => h.trim().toLowerCase());
    return lines.slice(1).map((line, i) => {
      const values = line.split(',').map(v => v.trim());
      const staff: any = { id: `staff-${i}-${Date.now()}` };
      rawHeaders.forEach((h, idx) => {
        const val = values[idx] || '';
        if (h.includes('name')) staff.name = val;
        else if (h.includes('designation')) staff.designation = val;
        else if (h.includes('duty')) staff.isOnDuty = val.toLowerCase() === 'yes';
        else if (h.includes('assignment')) staff.currentAssignment = val;
        else if (h.includes('location')) staff.lastLocation = val;
      });
      return staff as StaffMember;
    });
  }

  private static parseTargets(lines: string[]): OperationalTarget[] {
    const rawHeaders = lines[0].split(',').map(h => h.trim().toLowerCase());
    return lines.slice(1).map((line) => {
      const values = line.split(',').map(v => v.trim());
      const target: any = {};
      rawHeaders.forEach((h, idx) => {
        const val = values[idx] || '';
        if (h.includes('category')) target.category = val;
        else if (h.includes('mrc')) target.mrcTarget = parseFloat(val) || 0;
        else if (h.includes('goal')) target.leadGoal = parseInt(val) || 0;
      });
      return target as OperationalTarget;
    });
  }

  private static normalizeStatus(s: string): string {
    const val = s.toLowerCase();
    if (val.includes('hot')) return 'Hot';
    if (val.includes('warm')) return 'Warm';
    if (val.includes('cold')) return 'Cold';
    if (val.includes('close') || val.includes('won')) return 'Closed';
    if (val.includes('lost')) return 'Lost';
    return 'Warm';
  }

  private static normalizeDate(dateStr: string): string {
    if (!dateStr) return new Date().toISOString();
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
  }

  static isOverdue(dateString: string): boolean {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }
}
