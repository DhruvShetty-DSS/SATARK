import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TrendingUp, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export const PredictiveAnalyticsView: React.FC = () => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const res = await api.get('/predictions');
        setPredictions(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPredictions();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <span>Predictive Analytics Studio</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">Machine learning trajectory forecasts for completion delays, cost variance, and budget exhaustion risks</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Running predictive completion models...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {predictions.map((p, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4">
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs text-blue-400 font-bold">{p.work_id}</span>
                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-semibold rounded border border-slate-700">
                  {p.district_name}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-100 line-clamp-2">{p.project_name}</h4>

              <div className="space-y-3 pt-2 text-xs border-t border-slate-800">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Delay Probability:</span>
                    <span className="font-bold text-rose-400">{p.delay_probability_pct}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full" style={{ width: `${p.delay_probability_pct}%` }}></div>
                  </div>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Projected Completion:</span>
                  <span className="font-semibold text-slate-200">{p.projected_completion_date}</span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Est. Final Expenditure:</span>
                  <span className="font-semibold text-emerald-400">₹{p.estimated_final_expenditure?.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Budget Exhaustion Risk:</span>
                  <span className={`font-semibold ${
                    p.budget_exhaustion_risk === 'High' ? 'text-rose-400' : 'text-slate-300'
                  }`}>{p.budget_exhaustion_risk}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
