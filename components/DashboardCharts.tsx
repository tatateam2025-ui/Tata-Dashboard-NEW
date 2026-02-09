
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
          <Funnel
            dataKey="value"
            data={funnelData}
            isAnimationActive
          >
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
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const SourceWisePerformance: React.FC<ChartProps> = ({ leads }) => {
  const sources = leads.reduce((acc, lead) => {
    if (!acc[lead.source]) {
      acc[lead.source] = { name: lead.source, count: 0, value: 0 };
    }
    acc[lead.source].count += 1;
    acc[lead.source].value += lead.mrcValue;
    return acc;
  }, {} as Record<string, { name: string, count: number, value: number }>);

  // Fix: Explicitly cast Object.values to the correct type to resolve "Property 'value' does not exist on type 'unknown'"
  const data = (Object.values(sources) as Array<{ name: string, count: number, value: number }>).sort((a, b) => b.value - a.value);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
          <Tooltip 
             formatter={(value: number) => [`$${value.toLocaleString()}`, 'MRC Value']}
             contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ManpowerUtilization: React.FC<{ active: number, total: number }> = ({ active, total }) => {
  const data = [
    { name: 'Active', value: active },
    { name: 'Inactive', value: total - active },
  ];

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={0}
            dataKey="value"
          >
            <Cell fill="#10b981" />
            <Cell fill="#e2e8f0" />
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
