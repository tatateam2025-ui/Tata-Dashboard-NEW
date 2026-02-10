
import { DashboardData, Lead } from '../types';
import { MOCK_LEADS, MOCK_MANPOWER } from '../constants';

export class DataService {
  static async fetchDashboardData(): Promise<DashboardData> {
    // In a real scenario, this would use the Microsoft Graph API or a proxy for the SharePoint link.
    // We simulate the fetch latency and dynamic nature of the data.
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      leads: [...MOCK_LEADS],
      manpower: { ...MOCK_MANPOWER },
      lastUpdated: new Date().toISOString(),
    };
  }

  static parseLeadsFromCSV(csvText: string): Lead[] {
    const lines = csvText.split(/\r?\n/);
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    return lines.slice(1).filter(line => line.trim()).map((line, i) => {
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const lead: any = { id: `tata-${i}-${Date.now()}` };

      headers.forEach((header, index) => {
        const val = values[index];
        // Adaptive Mapping for Tata Sheet
        if (header.includes('client') || header.includes('customer')) lead.clientName = val;
        else if (header.includes('source')) lead.source = val;
        else if (header.includes('category') || header.includes('type')) lead.category = val;
        else if (header.includes('status')) lead.status = val as any;
        else if (header.includes('mrc') || header.includes('value')) lead.mrcValue = parseFloat(val) || 0;
        else if (header.includes('follow') || header.includes('next')) lead.nextFollowUp = val;
        else if (header.includes('owner') || header.includes('manager')) lead.owner = val;
        else if (header.includes('added') || header.includes('date')) lead.dateAdded = val;
        else if (header.includes('contacted') || header.includes('last')) lead.lastContacted = val;
      });

      // Defaulting and normalization
      return {
        id: lead.id,
        clientName: lead.clientName || 'Unnamed Client',
        source: lead.source || 'Direct',
        category: lead.category || 'Standard',
        status: (['Hot', 'Warm', 'Cold', 'Closed', 'Lost'].includes(lead.status) ? lead.status : 'Warm') as any,
        mrcValue: lead.mrcValue || 0,
        dateAdded: lead.dateAdded || new Date().toISOString(),
        lastContacted: lead.lastContacted || new Date().toISOString(),
        nextFollowUp: lead.nextFollowUp || new Date().toISOString(),
        owner: lead.owner || 'Unassigned'
      } as Lead;
    });
  }

  static isOverdue(dateString: string): boolean {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  static exportToCSV(data: any[], filename: string) {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${(row[h] || '').toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
