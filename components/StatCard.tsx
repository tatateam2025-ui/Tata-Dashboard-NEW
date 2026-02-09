
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isUp: boolean;
  };
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red';
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  green: 'bg-green-50 text-green-600 border-green-100',
  orange: 'bg-orange-50 text-orange-600 border-orange-100',
  purple: 'bg-purple-50 text-purple-600 border-purple-100',
  red: 'bg-red-50 text-red-600 border-red-100',
};

const iconBackgrounds = {
  blue: 'bg-blue-100',
  green: 'bg-green-100',
  orange: 'bg-orange-100',
  purple: 'bg-purple-100',
  red: 'bg-red-100',
};

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, trend, color }) => {
  return (
    <div className={`p-6 bg-white rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${iconBackgrounds[color]} ${colorClasses[color].split(' ')[1]}`}>
          {icon}
        </div>
        {trend && (
          <div className={`text-xs font-semibold px-2 py-1 rounded-full ${trend.isUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {trend.isUp ? '↑' : '↓'} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-bold text-slate-900 mt-1">{value}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};
