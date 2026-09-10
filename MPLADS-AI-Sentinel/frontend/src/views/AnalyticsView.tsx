import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BarChart3, Building, Award, TrendingUp } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const [states, setStates] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [stRes, catRes] = await Promise.all([
          api.get('/analytics/states'),
          api.get('/analytics/categories')
        ]);
        setStates(stRes.data);
        setCategories(catRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-indigo-400" />
          <span>Hierarchical Analytics Matrix</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">National → State → District comparative performance and risk distribution breakdown</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Computing state and category analytics...</div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* State Performance Comparison */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-slate-200">State-wise Fund & Risk Overview</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">State</th>
                    <th className="p-3">Projects</th>
                    <th className="p-3">Sanctioned (₹ Cr)</th>
                    <th className="p-3">Utilization</th>
                    <th className="p-3">Avg Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {states.map((st, i) => (
                    <tr key={i} className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-slate-200">{st.state_name}</td>
                      <td className="p-3 text-slate-300">{st.total_projects}</td>
                      <td className="p-3 text-slate-300">₹{(st.total_sanctioned / 10000000).toFixed(1)}</td>
                      <td className="p-3 font-semibold text-emerald-400">{st.utilization_pct}%</td>
                      <td className="p-3 font-bold text-amber-400">{st.avg_risk_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category Expenditure & Risk */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-slate-200">Work Category Distribution</h3>
            <div className="space-y-3">
              {categories.map((cat, i) => (
                <div key={i} className="p-3.5 bg-slate-800/40 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-200">{cat.category}</span>
                    <span className="text-blue-400">{cat.project_count} Works</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Sanctioned: ₹{(cat.sanctioned_amount / 100000).toFixed(1)} Lakhs</span>
                    <span className="text-amber-400 font-bold">Avg Risk: {cat.avg_risk_score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
