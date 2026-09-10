import React from 'react';

interface RiskBadgeProps {
  level: 'Low' | 'Medium' | 'High' | 'Critical' | string;
  score?: number;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score }) => {
  const normalized = level || 'Low';
  
  let styles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  if (normalized === 'Medium') styles = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  if (normalized === 'High') styles = 'bg-orange-500/10 text-orange-400 border-orange-500/30';
  if (normalized === 'Critical') styles = 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-lg shadow-rose-950/40 animate-pulse';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        normalized === 'Critical' ? 'bg-rose-400' :
        normalized === 'High' ? 'bg-orange-400' :
        normalized === 'Medium' ? 'bg-amber-400' : 'bg-emerald-400'
      }`}></span>
      {normalized} {score !== undefined ? `(${score})` : ''}
    </span>
  );
};
