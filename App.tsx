
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Users, TrendingUp, Target, Database, RefreshCcw, 
  LayoutDashboard, Filter, Briefcase, Activity,
  Search, Download, Upload, CheckCircle2, XCircle, 
  AlertCircle, LineChart, Sparkles, Clock, Calendar, User, FileSpreadsheet, ChevronDown, ClipboardList
} from 'lucide-react';
import { StatCard } from './components/StatCard';
import { 
  SalesFunnelChart, 
  LeadsByCategoryChart, 
  ManpowerUtilization,
  LeadTrendsChart
} from './components/DashboardCharts';
import { AIInsightsModal } from './components/AIInsightsModal';
import { DashboardData, ViewMode, FilterState, Lead, StaffMember, OperationalTarget } from './types';
import { DataService } from './services/dataService';
import { AIService } from './services/aiService';

const App: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.OVERVIEW);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  
  // Custom uploaded data
  const [uploadedLeads, setUploadedLeads] = useState<Lead[] | null>(null);
  const [uploadedStaff, setUploadedStaff] = useState<StaffMember[] | null>(null);
  const [uploadedTargets, setUploadedTargets] = useState<OperationalTarget[] | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiInsights, setAIInsights] = useState("");
  const [isAILoading, setIsAILoading] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    search: '', status: 'All', category: 'All', owner: 'All'
  });

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const dashboardData = await DataService.fetchDashboardData();
      setData(dashboardData);
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 300000); 
    return () => clearInterval(interval);
  }, [refreshData]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = DataService.parseCSV(text);
      
      if (result.type === 'leads') {
        setUploadedLeads(result.data);
        setViewMode(ViewMode.LEADS);
      } else if (result.type === 'staff') {
        setUploadedStaff(result.data);
        setViewMode(ViewMode.MANPOWER);
      } else if (result.type === 'targets') {
        setUploadedTargets(result.data);
        setViewMode(ViewMode.OVERVIEW);
      } else {
        alert("Unknown file format. Please use the templates.");
      }
    };
    reader.readAsText(file);
    if (event.target) event.target.value = '';
  };

  const currentLeads = useMemo(() => uploadedLeads || data?.leads || [], [uploadedLeads, data]);
  
  const currentManpower = useMemo(() => {
    if (uploadedStaff) {
      const present = uploadedStaff.filter(s => s.isOnDuty).length;
      const active = uploadedStaff.filter(s => s.isOnDuty && s.currentAssignment).length;
      return {
        total: uploadedStaff.length,
        present,
        active,
        available: present - active,
        roster: uploadedStaff
      };
    }
    return data?.manpower || { total: 0, active: 0, present: 0, available: 0 };
  }, [uploadedStaff, data]);

  const filteredLeads = useMemo(() => {
    return currentLeads.filter(lead => {
      const matchesSearch = lead.clientName.toLowerCase().includes(filters.search.toLowerCase()) || 
                          lead.owner.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = filters.status === 'All' || lead.status === filters.status;
      const matchesOwner = filters.owner === 'All' || lead.owner === filters.owner;
      return matchesSearch && matchesStatus && matchesOwner;
    });
  }, [currentLeads, filters]);

  const owners = useMemo(() => Array.from(new Set(currentLeads.map(l => l.owner))), [currentLeads]);
  const overdueCount = useMemo(() => currentLeads.filter(l => DataService.isOverdue(l.nextFollowUp) && l.status !== 'Closed' && l.status !== 'Lost').length, [currentLeads]);
  const totalMRC = filteredLeads.reduce((sum, l) => sum + l.mrcValue, 0);

  const sortedFollowUps = useMemo(() => {
    return [...currentLeads]
      .filter(l => l.status !== 'Closed' && l.status !== 'Lost')
      .sort((a, b) => {
        const isOverdueA = DataService.isOverdue(a.nextFollowUp);
        const isOverdueB = DataService.isOverdue(b.nextFollowUp);
        if (isOverdueA && !isOverdueB) return -1;
        if (!isOverdueA && isOverdueB) return 1;
        return new Date(a.nextFollowUp).getTime() - new Date(b.nextFollowUp).getTime();
      });
  }, [currentLeads]);

  const handleGenerateAIInsights = async () => {
    setIsAIModalOpen(true);
    setIsAILoading(true);
    try {
      const insights = await AIService.generateExecutiveInsights(filteredLeads, currentManpower);
      setAIInsights(insights);
    } catch (error) {
      setAIInsights("AI Analysis Error.");
    } finally {
      setIsAILoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 font-bold text-slate-400 uppercase tracking-widest text-xs">Linking Tata Master...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-200">
              <Activity size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">TATA OPS <span className="text-blue-600">DASHBOARD</span></h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${(uploadedLeads || uploadedStaff) ? 'bg-blue-500' : 'bg-green-500'} animate-pulse`}></span>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {(uploadedLeads || uploadedStaff) ? 'DIRECT CUSTOM DATA ACTIVE' : 'CONNECTED TO MASTER MOCK'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search anything..."
                className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm w-full md:w-64 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowTemplateMenu(!showTemplateMenu)}
                className="px-4 py-2 text-sm font-bold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                <Download size={16} /> Templates <ChevronDown size={14} className={showTemplateMenu ? 'rotate-180' : ''} />
              </button>
              {showTemplateMenu && (
                <div className="absolute top-full mt-2 right-0 w-48 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-[100]">
                  <button onClick={() => { DataService.downloadTemplate('leads'); setShowTemplateMenu(false); }} className="w-full px-4 py-3 text-left text-xs font-bold hover:bg-slate-50 border-b border-slate-100 flex items-center gap-2"><Database size={14}/> Leads Master</button>
                  <button onClick={() => { DataService.downloadTemplate('staff'); setShowTemplateMenu(false); }} className="w-full px-4 py-3 text-left text-xs font-bold hover:bg-slate-50 border-b border-slate-100 flex items-center gap-2"><Users size={14}/> Staff Roster</button>
                  <button onClick={() => { DataService.downloadTemplate('targets'); setShowTemplateMenu(false); }} className="w-full px-4 py-3 text-left text-xs font-bold hover:bg-slate-50 flex items-center gap-2"><Target size={14}/> Op Targets</button>
                </div>
              )}
            </div>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-sm font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100"
            >
              <Upload size={16} /> Sync Master CSV
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileUpload} />

            <button 
              onClick={handleGenerateAIInsights}
              className="px-4 py-2 text-sm font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
            >
              <Sparkles size={16} /> AI Summary
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Pipeline" value={currentLeads.length} subtitle="Active operational leads" icon={<Target size={20} />} color="blue" />
          <StatCard title="Aggregated MRC" value={`₹${totalMRC.toLocaleString()}`} subtitle="Pipeline potential" icon={<TrendingUp size={20} />} color="green" />
          <StatCard title="Overdue Action" value={overdueCount} subtitle="Immediate attention required" icon={<AlertCircle size={20} />} color="red" trend={overdueCount > 0 ? { value: overdueCount, isUp: true } : undefined} />
          <StatCard title="Force On-Duty" value={`${currentManpower.present}/${currentManpower.total}`} subtitle="Personnel currently synced" icon={<Users size={20} />} color="purple" />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: ViewMode.OVERVIEW, label: 'Analytics', icon: LayoutDashboard },
            { id: ViewMode.FOLLOW_UPS, label: 'Follow-ups', icon: Calendar },
            { id: ViewMode.LEADS, label: 'Master List', icon: Database },
            { id: ViewMode.MANPOWER, label: 'Personnel', icon: Users },
          ].map(tab => (
            <button key={tab.id} onClick={() => setViewMode(tab.id as ViewMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${viewMode === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
            >
              <tab.icon size={16} /> {tab.label}
              {tab.id === ViewMode.FOLLOW_UPS && overdueCount > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center ml-1">{overdueCount}</span>}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6">
          {viewMode === ViewMode.OVERVIEW && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Pipeline Funnel</h3><SalesFunnelChart leads={filteredLeads} /></div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Market Segments</h3><LeadsByCategoryChart leads={filteredLeads} /></div>
            </div>
          )}

          {viewMode === ViewMode.LEADS && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <tr><th className="px-6 py-4">Client</th><th className="px-6 py-4">Owner</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">MRC Potential</th><th className="px-6 py-4">Next Action</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredLeads.map(lead => (
                      <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4"><div><div className="font-bold text-slate-900">{lead.clientName}</div><div className="text-[10px] text-slate-400">{lead.source}</div></div></td>
                        <td className="px-6 py-4 flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px]"><User size={12}/></div>{lead.owner}</td>
                        <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${lead.status === 'Hot' ? 'bg-red-50 text-red-600' : lead.status === 'Warm' ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>{lead.status}</span></td>
                        <td className="px-6 py-4 font-black">₹{lead.mrcValue.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`text-[11px] font-bold ${DataService.isOverdue(lead.nextFollowUp) ? 'text-red-500' : 'text-slate-500'}`}>
                            {new Date(lead.nextFollowUp).toLocaleDateString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {viewMode === ViewMode.MANPOWER && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 flex flex-col items-center justify-center">
                    <h3 className="text-xs font-black text-slate-400 uppercase mb-4 self-start">Utilization</h3>
                    <ManpowerUtilization active={currentManpower.active} total={currentManpower.total} />
                 </div>
                 <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                       <h3 className="text-sm font-black text-slate-900 uppercase">Field Force Roster</h3>
                       <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded-full">{currentManpower.total} Staff Linked</span>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                      <table className="w-full text-left text-xs">
                        <thead className="sticky top-0 bg-white shadow-sm font-black text-slate-400 uppercase tracking-tighter">
                          <tr><th className="px-6 py-3">Personnel</th><th className="px-6 py-3">Duty Status</th><th className="px-6 py-3">Current Task</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {currentManpower.roster ? (
                            currentManpower.roster.map(staff => (
                              <tr key={staff.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4"><div className="font-bold">{staff.name}</div><div className="text-[10px] text-slate-400">{staff.designation}</div></td>
                                <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${staff.isOnDuty ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{staff.isOnDuty ? 'Present' : 'Absent'}</span></td>
                                <td className="px-6 py-4 font-medium text-slate-600">{staff.currentAssignment || 'Unassigned / Available'}</td>
                              </tr>
                            ))
                          ) : (
                            <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic">No individual roster synced. Staff counts are based on master summary.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {viewMode === ViewMode.FOLLOW_UPS && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div><h3 className="text-xl font-black text-slate-900">Task Timeline</h3><p className="text-xs text-slate-400 mt-1 font-medium italic">Chronological follow-up list</p></div>
                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-black uppercase"><AlertCircle size={14} />{overdueCount} Overdue</div>
              </div>
              <div className="space-y-3">
                {sortedFollowUps.map(lead => (
                  <div key={lead.id} className={`p-4 rounded-xl border flex items-center justify-between transition-all ${DataService.isOverdue(lead.nextFollowUp) ? 'bg-red-50 border-red-100' : 'bg-white border-slate-100 hover:border-blue-200'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${DataService.isOverdue(lead.nextFollowUp) ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}><Calendar size={18}/></div>
                      <div>
                        <div className="flex items-center gap-2 font-bold text-sm">{lead.clientName} <span className="text-[10px] font-black text-blue-600 uppercase opacity-60 tracking-widest">{lead.owner}</span></div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">{lead.status} Lead • Potential: ₹{lead.mrcValue.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-black ${DataService.isOverdue(lead.nextFollowUp) ? 'text-red-600 animate-pulse' : 'text-slate-900'}`}>{new Date(lead.nextFollowUp).toLocaleDateString()}</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Scheduled Date</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <AIInsightsModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} content={aiInsights} isLoading={isAILoading} />
    </div>
  );
};

export default App;
