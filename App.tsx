
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Users, TrendingUp, Target, Database, RefreshCcw, 
  LayoutDashboard, Filter, Briefcase, Activity,
  Search, Download, Info, ArrowUpRight, HelpCircle,
  Upload, FileText, CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';
import { StatCard } from './components/StatCard';
import { 
  SalesFunnelChart, 
  LeadsByCategoryChart, 
  ManpowerUtilization
} from './components/DashboardCharts';
import { DashboardData, ViewMode, FilterState, Lead } from './types';
import { DataService } from './services/dataService';

const App: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.OVERVIEW);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDeploymentHelp, setShowDeploymentHelp] = useState(false);
  
  // Custom Data State
  const [uploadedLeads, setUploadedLeads] = useState<Lead[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'All',
    category: 'All',
    source: 'All'
  });

  const refreshData = useCallback(async () => {
    // Only auto-sync if we aren't using an uploaded funnel
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
    const interval = setInterval(refreshData, 60000);
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
        setViewMode(ViewMode.LEADS); // Switch to leads view to verify
      } else {
        alert("Could not parse data. Ensure CSV has correct headers: clientName, source, category, status, mrcValue");
      }
    };
    reader.readAsText(file);
  };

  const clearUploadedData = () => {
    setUploadedLeads(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    refreshData();
  };

  const currentSourceLeads = useMemo(() => {
    return uploadedLeads || data?.leads || [];
  }, [uploadedLeads, data]);

  const filteredLeads = useMemo(() => {
    return currentSourceLeads.filter(lead => {
      const matchesSearch = lead.clientName.toLowerCase().includes(filters.search.toLowerCase()) || 
                          lead.source.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = filters.status === 'All' || lead.status === filters.status;
      const matchesCategory = filters.category === 'All' || lead.category === filters.category;
      const matchesSource = filters.source === 'All' || lead.source === filters.source;
      return matchesSearch && matchesStatus && matchesCategory && matchesSource;
    });
  }, [currentSourceLeads, filters]);

  const totalMRC = filteredLeads.reduce((sum, l) => sum + l.mrcValue, 0);
  const leadCount = filteredLeads.length;
  const hotLeadsCount = filteredLeads.filter(l => l.status === 'Hot').length;

  const handleExport = () => {
    if (filteredLeads.length) {
      DataService.exportToCSV(filteredLeads, `Navigant_Leads_Export_${new Date().toISOString().split('T')[0]}`);
    }
  };

  if (loading && !uploadedLeads) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Database className="text-blue-600 animate-pulse" size={24} />
          </div>
        </div>
        <h2 className="mt-6 text-xl font-bold text-slate-800">Booting Analytics Engine</h2>
        <p className="text-slate-500 mt-2">Connecting to Navigant Master Source...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 selection:bg-blue-100">
      {/* Executive Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <LayoutDashboard size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">NAVIGANT<span className="text-blue-600">OS</span></h1>
              <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mt-0.5">
                {uploadedLeads ? (
                  <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    <CheckCircle2 size={12} />
                    Active Source: Local CSV
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-green-600">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Master Sync Active
                  </span>
                )}
                <span className="bg-slate-100 px-2 py-0.5 rounded">Build 3.0.1</span>
                <span>Updated: {new Date(data!.lastUpdated).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
               <input 
                 type="text" 
                 placeholder="Search custom funnel..."
                 className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm w-full md:w-64 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                 value={filters.search}
                 onChange={(e) => setFilters({...filters, search: e.target.value})}
               />
            </div>

            {/* Upload Button */}
            <input 
              type="file" 
              accept=".csv" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all shadow-sm ${
                uploadedLeads 
                ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Upload size={18} />
              {uploadedLeads ? 'Change Funnel' : 'Upload Funnel'}
            </button>

            {uploadedLeads && (
              <button 
                onClick={clearUploadedData}
                className="p-2.5 text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-all border border-red-100"
                title="Reset to Master Data"
              >
                <XCircle size={18} />
              </button>
            )}

            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
            >
              <Download size={18} />
              Export
            </button>

            <button 
              onClick={refreshData}
              disabled={isRefreshing || !!uploadedLeads}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-200"
            >
              <RefreshCcw size={18} className={isRefreshing ? 'animate-spin' : ''} />
              Sync
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 space-y-8">
        
        {/* Source Alert */}
        {uploadedLeads && (
          <div className="bg-blue-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-xl shadow-blue-100">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-lg"><FileText size={20} /></div>
              <div>
                <p className="font-bold">Viewing Custom Uploaded Funnel</p>
                <p className="text-xs text-blue-100">All analytics below are calculated exclusively from the uploaded CSV file.</p>
              </div>
            </div>
            <button onClick={clearUploadedData} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all">
              Restore Master Sync
            </button>
          </div>
        )}

        {/* Global Filters Bar */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-4 shadow-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg text-slate-500 text-xs font-bold uppercase">
            <Filter size={14} /> Global Control
          </div>
          
          <select 
            className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer border-r border-slate-200 pr-4"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="All">All Statuses</option>
            <option value="Hot">Hot Leads</option>
            <option value="Warm">Warm Leads</option>
            <option value="Closed">Closed Deals</option>
            <option value="Lost">Lost Opportunity</option>
          </select>

          <select 
            className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer border-r border-slate-200 pr-4"
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
          >
            <option value="All">All Categories</option>
            <option value="Enterprise">Enterprise</option>
            <option value="SME">SME</option>
            <option value="Startup">Startup</option>
          </select>

          <div className="ml-auto text-xs font-semibold text-slate-400">
            Dashboarding {filteredLeads.length} total objects
          </div>
        </div>

        {/* Top KPI Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Funnel Lead Count" 
            value={leadCount}
            subtitle="Current active data sample"
            icon={<Target size={24} />}
            color="blue"
            trend={!uploadedLeads ? { value: 4.2, isUp: true } : undefined}
          />
          <StatCard 
            title="Net Funnel Value" 
            value={`$${totalMRC.toLocaleString()}`}
            subtitle="Aggregated MRC Projection"
            icon={<TrendingUp size={24} />}
            color="green"
            trend={!uploadedLeads ? { value: 12.5, isUp: true } : undefined}
          />
          <StatCard 
            title="High Intent (Hot)" 
            value={hotLeadsCount}
            subtitle="Priority conversion targets"
            icon={<AlertCircle size={24} />}
            color="red"
          />
          <StatCard 
            title="Force Capacity" 
            value={data ? `${data.manpower.present}/${data.manpower.total}` : '--'}
            subtitle="Total available manpower"
            icon={<Users size={24} />}
            color="purple"
          />
        </section>

        {/* Tab Navigation */}
        <div className="flex bg-white/50 backdrop-blur rounded-2xl p-1.5 border border-slate-200 w-fit">
          {[
            { id: ViewMode.OVERVIEW, label: 'Visual Overview', icon: LayoutDashboard },
            { id: ViewMode.SALES, label: 'Pipeline Funnel', icon: Briefcase },
            { id: ViewMode.LEADS, label: 'Data Registry', icon: Database },
            { id: ViewMode.MANPOWER, label: 'Team Analytics', icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${
                viewMode === tab.id 
                  ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' 
                  : 'text-slate-500 hover:bg-slate-200/50'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Views */}
        <div className="space-y-6">
          {viewMode === ViewMode.OVERVIEW && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-8 relative z-10">
                   <div>
                     <h3 className="text-xl font-black text-slate-900">Conversion Velocity</h3>
                     <p className="text-sm text-slate-500">Visualization of lead flow through funnel stages</p>
                   </div>
                </div>
                <SalesFunnelChart leads={filteredLeads} />
              </div>
              
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Lead Segment Mix</h3>
                  <LeadsByCategoryChart leads={filteredLeads} />
                </div>
                
                <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl">
                   <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Quick Analysis</h4>
                   <div className="space-y-5">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-white/10 rounded-lg"><Info size={18} /></div>
                        <div>
                          <p className="text-sm font-medium">Data Integrity</p>
                          <p className="text-xs text-slate-400">{uploadedLeads ? '100% User Defined' : 'Simulated Master Feed'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-green-500/20 rounded-lg text-green-400"><ArrowUpRight size={18} /></div>
                        <div>
                          <p className="text-sm font-medium">Funnel Efficiency</p>
                          <p className="text-xs text-slate-400">Calculating conversion probability...</p>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {viewMode === ViewMode.LEADS && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Source Registry</h3>
                  <p className="text-sm text-slate-500">Detailed breakdown of leads from current data source</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.1em]">
                    <tr>
                      <th className="px-8 py-5">Client Identity</th>
                      <th className="px-8 py-5">Pipeline Status</th>
                      <th className="px-8 py-5">Category</th>
                      <th className="px-8 py-5">Last Activity</th>
                      <th className="px-8 py-5 text-right">MRC Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} className="group hover:bg-blue-50/30 transition-all cursor-pointer">
                        <td className="px-8 py-6">
                          <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{lead.clientName}</div>
                          <div className="text-xs text-slate-400 font-medium">{lead.source}</div>
                        </td>
                        <td className="px-8 py-6">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                            lead.status === 'Hot' ? 'bg-red-50 text-red-600 ring-1 ring-red-100' :
                            lead.status === 'Warm' ? 'bg-orange-50 text-orange-600 ring-1 ring-orange-100' :
                            lead.status === 'Closed' ? 'bg-green-50 text-green-600 ring-1 ring-green-100' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            {lead.status === 'Hot' && <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>}
                            {lead.status}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-sm font-semibold text-slate-600">
                          {lead.category}
                        </td>
                        <td className="px-8 py-6 text-sm text-slate-500">
                          {lead.lastContacted}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="text-sm font-black text-slate-900">${lead.mrcValue.toLocaleString()}</div>
                        </td>
                      </tr>
                    ))}
                    {filteredLeads.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-8 py-20 text-center text-slate-400 italic">
                          No leads found matching current filter/source criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {viewMode === ViewMode.MANPOWER && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center">
                   <h3 className="text-xl font-black text-slate-900 mb-8 self-start">Team Utilization</h3>
                   {data && <ManpowerUtilization active={data.manpower.present} total={data.manpower.total} />}
                   <div className="grid grid-cols-2 gap-8 mt-12 w-full">
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                         <p className="text-xs font-bold text-slate-400 uppercase mb-2">Real-time Presence</p>
                         <p className="text-2xl font-black text-slate-900">{data ? Math.round((data.manpower.present/data.manpower.total)*100) : '0'}%</p>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                         <p className="text-xs font-bold text-slate-400 uppercase mb-2">Active Shifts</p>
                         <p className="text-2xl font-black text-slate-900">{data ? data.manpower.present : '0'}</p>
                      </div>
                   </div>
                </div>

                <div className="bg-blue-600 p-10 rounded-3xl text-white relative overflow-hidden shadow-2xl">
                   <div className="relative z-10">
                      <h3 className="text-2xl font-black mb-4">Capacity Forecast</h3>
                      <p className="text-blue-100 text-sm mb-12 max-w-sm">Current team size is sufficient to manage the current lead volume of {leadCount} records.</p>
                      
                      <div className="space-y-6">
                         {[
                           { label: 'Active Recruitment', value: 8, icon: Users },
                           { label: 'Operational Readiness', value: 'High', icon: Activity },
                         ].map((item, i) => (
                           <div key={i} className="flex items-center gap-6">
                              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                                 <item.icon size={20} />
                              </div>
                              <div>
                                 <p className="text-xs font-bold text-blue-200 uppercase">{item.label}</p>
                                 <p className="text-lg font-black">{item.value}</p>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                   <div className="absolute right-[-10%] bottom-[-10%] text-white/5 rotate-12">
                     <Users size={400} />
                   </div>
                </div>
             </div>
          )}
        </div>
      </main>

      <footer className="py-12 px-6 border-t border-slate-200 bg-white text-center">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="text-left">
             <h4 className="text-sm font-black text-slate-900">NAVIGANT Analytics</h4>
             <p className="text-xs text-slate-400 mt-1">Enterprise Grade CRM & Operational Intelligence</p>
           </div>
           <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">© 2024 Navigant Tech. Proprietary Asset.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
