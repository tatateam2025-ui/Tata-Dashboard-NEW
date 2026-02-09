import { DashboardData, Lead } from '../types';
import { MOCK_LEADS, MOCK_MANPOWER } from '../constants';

export class DataService {
  static async fetchDashboardData(): Promise<DashboardData> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const fluctuation = Math.floor(Math.random() * 5) - 2;
    return {
      leads: MOCK_LEADS.map(l => ({
        ...l,
        mrcValue: l.mrcValue + (Math.random() > 0.8 ? fluctuation * 100 : 0)
      })),
      manpower: {
        ...MOCK_MANPOWER,
        present: Math.min(MOCK_MANPOWER.total, MOCK_MANPOWER.present + fluctuation)
      },
      lastUpdated: new Date().toISOString(),
    };
  }

  static parseLeadsFromCSV(csvText: string): Lead[] {
    const lines = csvText.split(/\r?\n/);
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const leads: Lead[] = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const lead: any = { id: `up-${i}-${Date.now()}` };
      headers.forEach((header, index) => {
        const val = values[index];
        if (header.includes('client')) lead.clientName = val;
        else if (header.includes('source')) lead.source = val;
        else if (header.includes('category')) lead.category = val;
        else if (header.includes('status')) lead.status = val as any;
        else if (header.includes('mrc')) lead.mrcValue = parseFloat(val) || 0;
        else if (header.includes('added')) lead.dateAdded = val;
        else if (header.includes('contacted')) lead.lastContacted = val;
      });
      lead.clientName = lead.clientName || 'Unknown Client';
      lead.source = lead.source || 'Direct';
      lead.category = lead.category || 'SME';
      lead.status = lead.status || 'Warm';
      lead.mrcValue = lead.mrcValue || 0;
      lead.dateAdded = lead.dateAdded || new Date().toISOString();
      lead.lastContacted = lead.lastContacted || new Date().toISOString();
      leads.push(lead as Lead);
    }
    return leads;
  }

  static exportToCSV(data: any[], filename: string) {
    if (!data || data.length === 0) return;
    const csvRows = [];
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(','));
    for (const row of data) {
      const values = headers.map(header => {
        const escaped = ('' + (row[header] || '')).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}