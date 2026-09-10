import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  color?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendType = 'neutral',
  color = 'blue'
}) => {
  return (
    <div className="bg-slate-800/80 backdrop-blur border border-slate-700/60 rounded-xl p-5 shadow-lg relative overflow-hidden transition-all hover:border-slate-600 hover:shadow-slate-900/50">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-100 mt-1 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-500/10 border border-${color}-500/20 text-${color}-400`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-700/40 flex items-center text-xs">
          <span className={`font-semibold ${
            trendType === 'positive' ? 'text-emerald-400' :
            trendType === 'negative' ? 'text-rose-400' : 'text-slate-400'
          }`}>
            {trend}
          </span>
          <span className="text-slate-500 ml-1.5">vs previous period</span>
        </div>
      )}
    </div>
  );
};
