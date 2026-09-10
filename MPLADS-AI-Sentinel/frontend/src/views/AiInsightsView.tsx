import React from 'react';
import { Sparkles, AlertTriangle, CheckCircle2, TrendingUp, Cpu } from 'lucide-react';

export const AiInsightsView: React.FC = () => {
  const insights = [
    {
      type: 'warning',
      title: '12 Districts exhibit high expenditure velocity variance',
      desc: 'Statistical scan detected 12 district planning divisions where fund disbursements accelerated over 340% within the final 30 days of the reporting period.',
      action: 'Conduct routine administrative audit of final period payment vouchers.'
    },
    {
      type: 'danger',
      title: '37 Active works have crossed their expected completion date by >90 days',
      desc: 'Longest delay recorded in DHARWAD district (240 days overrun). Physical progress remains under 45%.',
      action: 'Issue formal status update notice to implementing agency.'
    },
    {
      type: 'warning',
      title: '18 Works show high financial progress (>80%) with low physical progress (<40%)',
      desc: 'Progress mismatch model identified potential milestone payment discrepancy across 4 state nodal regions.',
      action: 'Mandate geo-tagged physical photo upload prior to next fund release.'
    },
    {
      type: 'info',
      title: '15 Duplicate candidate proposal pairs identified by NLP TF-IDF vectorizer',
      desc: 'High textual description matching e.g. "Construction of community hall" with identical amounts and nearby geographic coordinates.',
      action: 'Review candidates in Duplicate Detection module.'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>Systemic AI Insights</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">Dynamically generated systemic implementation intelligence synthesized from continuous database scanning</p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {insights.map((ins, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-3">
            <div className="flex items-start space-x-3">
              <div className={`p-2.5 rounded-xl border ${
                ins.type === 'danger' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                ins.type === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                'bg-blue-500/10 text-blue-400 border-blue-500/30'
              }`}>
                <Cpu className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-100">{ins.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{ins.desc}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-xs text-slate-300 flex items-center space-x-2">
              <span className="font-semibold text-blue-400">Recommended Next Step:</span>
              <span>{ins.action}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
