import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area, Funnel, FunnelChart, LabelList
} from 'recharts';
import { Lead } from '../types';

interface ChartProps {
  leads: Lead[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

export const SalesFunnelChart: React.FC<ChartProps> = ({ leads }) => {
  const statusCounts = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const funnelData = [
    { name: 'Cold Leads', value: statusCounts['Cold'] || 0, fill: '#94a3b8' },
    { name: 'Warm Leads', value: statusCounts['Warm'] || 0, fill: '#fbbf24' },
    { name: 'Hot Leads', value: statusCounts['Hot'] || 0, fill: '#f87171' },
    { name: 'Closed Deals', value: statusCounts['Closed'] || 0, fill: '#34d399' },
  ].sort((a, b) => b.value - a.value);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <FunnelChart>
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Funnel dataKey="value" data={funnelData} isAnimationActive>
            <LabelList position="right" fill="#64748b" stroke="none" dataKey="name" />
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </div>
  );
};

export const LeadsByCategoryChart: React.FC<ChartProps> = ({ leads }) => {
  const categories = leads.reduce((acc, lead) => {
    acc[lead.category] = (acc[lead.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const data = Object.entries(categories).map(([name, value]) => ({ name, value }));
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
            {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
          </Pie>
          <Tooltip /><Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const LeadTrendsChart: React.FC<ChartProps> = ({ leads }) => {
  const groupedData = leads.reduce((acc, lead) => {
    const date = new Date(lead.dateAdded);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[month]) acc[month] = { month, count: 0, mrc: 0 };
    acc[month].count += 1;
    acc[month].mrc += lead.mrcValue;
    return acc;
  }, {} as Record<string, { month: string, count: number, mrc: number }>);
  const data = Object.values(groupedData).sort((a, b) => a.month.localeCompare(b.month));
  return (
    <div className="space-y-8">
      <div className="h-[300px] w-full bg-white p-4 rounded-2xl border border-slate-100">
        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Lead Volume Growth</h4>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
            <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="h-[300px] w-full bg-white p-4 rounded-2xl border border-slate-100">
        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">MRC Value Trend</h4>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorMrc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} />
            <Tooltip formatter={(val: number) => [`$${val.toLocaleString()}`, 'MRC Value']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
            <Area type="monotone" dataKey="mrc" stroke="#10b981" fillOpacity={1} fill="url(#colorMrc)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const ManpowerUtilization: React.FC<{ active: number, total: number }> = ({ active, total }) => {
  const data = [{ name: 'Active', value: active }, { name: 'Inactive', value: total - active }];
  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" startAngle={180} endAngle={0} innerRadius={60} outerRadius={80} paddingAngle={0} dataKey="value">
            <Cell fill="#10b981" /><Cell fill="#e2e8f0" />
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center -mt-16">
        <p className="text-2xl font-bold text-slate-800">{Math.round((active/total)*100)}%</p>
        <p className="text-xs text-slate-500 uppercase">Active</p>
      </div>
    </div>
  );
};