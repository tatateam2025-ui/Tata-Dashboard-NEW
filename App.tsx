
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Users, TrendingUp, Target, Database, RefreshCcw, 
  LayoutDashboard, Filter, Briefcase, Activity,
  Search, Download, Upload, CheckCircle2, XCircle, 
  AlertCircle, LineChart, Sparkles, Clock, Calendar, User
} from 'lucide-react';
import { StatCard } from './components/StatCard';
import { 
  SalesFunnelChart, 
  LeadsByCategoryChart, 
  ManpowerUtilization,
  LeadTrendsChart
} from './components/DashboardCharts';
import { AIInsightsModal } from './components/AIInsightsModal';
import { DashboardData, ViewMode, FilterState, Lead } from './types';
import { DataService } from './services/dataService';
import { AIService } from './services/aiService';

const App: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.OVERVIEW);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [uploadedLeads, setUploadedLeads] = useState<Lead[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI & Modals
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiInsights, setAIInsights] = useState("");
  const [isAILoading, setIsAILoading] = useState(false);

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'All',
    category: 'All',
    owner: 'All'
  });

  const refreshData = useCallback(async () => {
    if (uploadedLeads) return;
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
  }, [uploadedLeads]);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 300000); // Sync every 5 mins
    return () => clearInterval(interval);
  }, [refreshData]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = DataService.parseLeadsFromCSV(text);
      if (parsed.length > 0) {
        setUploadedLeads(parsed);
        setViewMode(ViewMode.LEADS);
      } else {
        alert("Invalid format. Please check your CSV headers.");
      }
    };
    reader.readAsText(file);
  };

  const currentLeads = useMemo(() => uploadedLeads || data?.leads || [], [uploadedLeads, data]);

  const filteredLeads = useMemo(() => {
    return currentLeads.filter(lead => {
      const matchesSearch = lead.clientName.toLowerCase().includes(filters.search.toLowerCase()) || 
                          lead.owner.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = filters.status === 'All' || lead.status === filters.status;
      const matchesCategory = filters.category === 'All' || lead.category === filters.category;
      const matchesOwner = filters.owner === 'All' || lead.owner === filters.owner;
      return matchesSearch && matchesStatus && matchesCategory && matchesOwner;
    });
  }, [currentLeads, filters]);

  const owners = useMemo(() => Array.from(new Set(currentLeads.map(l => l.owner))), [currentLeads]);
  const overdueCount = useMemo(() => currentLeads.filter(l => DataService.isOverdue(l.nextFollowUp) && l.status !== 'Closed' && l.status !== 'Lost').length, [currentLeads]);
  const totalMRC = filteredLeads.reduce((sum, l) => sum + l.mrcValue, 0);

  // Prioritize overdue items at the top
  const sortedFollowUps = useMemo(() => {
    return [...currentLeads]
      .filter(l => l.status !== 'Closed' && l.status !== 'Lost')
      .sort((a, b) => {
        const isOverdueA = DataService.isOverdue(a.nextFollowUp);
        const isOverdueB = DataService.isOverdue(b.nextFollowUp);
        
        // If one is overdue and the other isn't, the overdue one comes first
        if (isOverdueA && !isOverdueB) return -1;
        if (!isOverdueA && isOverdueB) return 1;
        
        // If both are in the same category (both overdue or both not), sort by date
        return new Date(a.nextFollowUp).getTime() - new Date(b.nextFollowUp).getTime();
      });
  }, [currentLeads]);

  const handleGenerateAIInsights = async () => {
    if (!data) return;
    setIsAIModalOpen(true);
    setIsAILoading(true);
    try {
      const insights = await AIService.generateExecutiveInsights(filteredLeads, data.manpower);
      setAIInsights(insights);
    } catch (error) {
      setAIInsights("AI Analysis Error.");
    } finally {
      setIsAILoading(false);
    }
  };

  if (loading && !uploadedLeads) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 font-bold text-slate-400 uppercase tracking-widest text-xs">Linking Tata Master Sheet...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-200">
              <Activity size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">TATA OPS <span className="text-blue-600">DASHBOARD</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Connected to Master Sheet
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Find lead or owner..."
                className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm w-full md:w-64 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-sm font-bold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <Upload size={16} /> Sync CSV
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileUpload} />

            <button 
              onClick={handleGenerateAIInsights}
              className="px-4 py-2 text-sm font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              <Sparkles size={16} /> AI Summary
            </button>
            
            <button 
              onClick={refreshData}
              disabled={isRefreshing}
              className="p-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"
            >
              <RefreshCcw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 space-y-6">
        
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Pipeline" 
            value={currentLeads.length} 
            subtitle="Active operational leads"
            icon={<Target size={20} />} 
            color="blue" 
          />
          <StatCard 
            title="Aggregated MRC" 
            value={`₹${totalMRC.toLocaleString()}`} 
            subtitle="Pipeline potential"
            icon={<TrendingUp size={20} />} 
            color="green" 
          />
          <StatCard 
            title="Overdue Action" 
            value={overdueCount} 
            subtitle="Needs immediate follow-up"
            icon={<AlertCircle size={20} />} 
            color="red" 
            trend={overdueCount > 0 ? { value: overdueCount, isUp: true } : undefined}
          />
          <StatCard 
            title="Force On-Duty" 
            value={`${data?.manpower.present}/${data?.manpower.total}`} 
            subtitle="Personnel available"
            icon={<Users size={20} />} 
            color="purple" 
          />
        </div>

        {/* Global Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase"><Filter size={14}/> Filters</div>
          <select 
            className="text-sm font-bold bg-slate-50 border-none rounded-lg px-3 py-1.5 outline-none"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="All">All Statuses</option>
            {['Hot', 'Warm', 'Cold', 'Closed', 'Lost'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select 
            className="text-sm font-bold bg-slate-50 border-none rounded-lg px-3 py-1.5 outline-none"
            value={filters.owner}
            onChange={(e) => setFilters({...filters, owner: e.target.value})}
          >
            <option value="All">All Owners</option>
            {owners.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: ViewMode.OVERVIEW, label: 'Analytics', icon: LayoutDashboard },
            { id: ViewMode.FOLLOW_UPS, label: 'Follow-ups', icon: Calendar },
            { id: ViewMode.LEADS, label: 'Master List', icon: Database },
            { id: ViewMode.MANPOWER, label: 'Personnel', icon: Users },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as ViewMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                viewMode === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <tab.icon size={16} /> {tab.label}
              {tab.id === ViewMode.FOLLOW_UPS && overdueCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center ml-1">
                  {overdueCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Dynamic Content Views */}
        <div className="grid grid-cols-1 gap-6">
          {viewMode === ViewMode.OVERVIEW && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Pipeline Funnel</h3>
                <SalesFunnelChart leads={filteredLeads} />
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Market Segments</h3>
                <LeadsByCategoryChart leads={filteredLeads} />
              </div>
            </div>
          )}

          {viewMode === ViewMode.LEADS && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Client</th>
                      <th className="px-6 py-4">Owner</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">MRC Potential</th>
                      <th className="px-6 py-4">Next Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredLeads.map(lead => (
                      <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{lead.clientName}</div>
                          <div className="text-[10px] text-slate-400">{lead.source}</div>
                        </td>
                        <td className="px-6 py-4 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px]"><User size={12}/></div>
                          {lead.owner}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            lead.status === 'Hot' ? 'bg-red-50 text-red-600' : 
                            lead.status === 'Warm' ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-black">₹{lead.mrcValue.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`flex items-center gap-1 text-[11px] ${DataService.isOverdue(lead.nextFollowUp) ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
                              <Clock size={12}/> {new Date(lead.nextFollowUp).toLocaleDateString()}
                            </span>
                            {DataService.isOverdue(lead.nextFollowUp) && (
                              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {viewMode === ViewMode.MANPOWER && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
                <h3 className="text-sm font-black text-slate-400 uppercase self-start mb-8">Utilization Breakdown</h3>
                <ManpowerUtilization active={data?.manpower.active || 0} total={data?.manpower.total || 1} />
                <div className="grid grid-cols-2 gap-4 w-full mt-8">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">In Field (Active)</p>
                    <p className="text-xl font-black">{data?.manpower.active}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Unassigned</p>
                    <p className="text-xl font-black text-blue-600">{data?.manpower.available}</p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-600 p-8 rounded-2xl text-white shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-black mb-2">Operational Readiness</h3>
                  <p className="text-blue-100 text-sm">Force capacity is at {Math.round(((data?.manpower.present || 0)/(data?.manpower.total || 1))*100)}%. Ready to ingest {Math.floor((data?.manpower.available || 0) * 1.5)} new leads.</p>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="flex items-center justify-between text-xs font-bold border-b border-white/10 pb-2">
                    <span>Recruitment Pipeline</span>
                    <span>12 Candidates</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold border-b border-white/10 pb-2">
                    <span>Training Phase</span>
                    <span>5 Staff</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {viewMode === ViewMode.FOLLOW_UPS && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Follow-up Schedule</h3>
                  <p className="text-xs text-slate-400 mt-1 font-medium italic">Showing pending actions, prioritized by urgency</p>
                </div>
                <div className="flex gap-2">
                   <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-black uppercase border border-red-100">
                     <AlertCircle size={14} />
                     {overdueCount} CRITICAL OVERDUE
                   </div>
                </div>
              </div>
              <div className="space-y-4">
                {sortedFollowUps.length > 0 ? (
                  sortedFollowUps.map(lead => {
                    const isOverdue = DataService.isOverdue(lead.nextFollowUp);
                    return (
                      <div key={lead.id} className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between transition-all gap-4 ${
                        isOverdue 
                          ? 'bg-red-50/60 border-red-200 shadow-sm shadow-red-100/50' 
                          : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-md'
                      }`}>
                        <div className="flex items-center gap-4">
                           <div className={`p-3 rounded-xl flex-shrink-0 relative ${isOverdue ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-slate-100 text-slate-500'}`}>
                             <Calendar size={20} />
                             {isOverdue && (
                               <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 border-2 border-white rounded-full"></span>
                             )}
                           </div>
                           <div>
                              <div className="flex items-center gap-2">
                                <p className={`text-sm font-black ${isOverdue ? 'text-red-900' : 'text-slate-900'}`}>{lead.clientName}</p>
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${
                                  lead.status === 'Hot' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {lead.status}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                <User size={10} className="text-slate-400" /> Lead Owner: <span className="text-slate-700 font-bold">{lead.owner}</span>
                              </p>
                           </div>
                        </div>
                        <div className="flex items-center justify-between sm:text-right sm:flex-col gap-1">
                           <div className="flex items-center gap-2 sm:justify-end">
                             {isOverdue && <span className="hidden sm:block text-[10px] font-black text-red-600 uppercase tracking-widest animate-pulse">ACTION OVERDUE</span>}
                             <p className={`text-sm font-black ${isOverdue ? 'text-red-600' : 'text-slate-600'}`}>
                               {new Date(lead.nextFollowUp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                             </p>
                           </div>
                           <p className={`text-[10px] uppercase tracking-widest font-black ${isOverdue ? 'text-red-400' : 'text-slate-400'}`}>
                             Target Follow-up
                           </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-20 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="text-slate-300" size={32} />
                    </div>
                    <p className="text-slate-400 font-bold">No pending follow-ups found.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <AIInsightsModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)} 
        content={aiInsights}
        isLoading={isAILoading}
      />
    </div>
  );
};

export default App;
