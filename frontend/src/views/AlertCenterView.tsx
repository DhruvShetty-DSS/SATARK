import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { AlertTriangle, CheckCircle, Clock, Filter, UserCheck } from 'lucide-react';

export const AlertCenterView: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts', { params: { status: statusFilter } });
      setAlerts(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [statusFilter]);

  const updateAlertStatus = async (alertId: number, status: string) => {
    try {
      await api.put(`/alerts/${alertId}`, {
        status,
        assigned_to: 'District Collector',
        notes: `Updated status to ${status}`
      });
      fetchAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>Risk Alert Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Automated early-warning risk alerts requiring administrative investigation</p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 px-3 py-1.5 rounded-lg"
          >
            <option value="All">All Alerts</option>
            <option value="New">New</option>
            <option value="Under Review">Under Review</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading alert stream...</div>
      ) : alerts.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          No active alerts matching the selected filter.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {alerts.map((alt) => (
            <div key={alt.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-blue-400 font-bold">{alt.alert_code}</span>
                <RiskBadge level={alt.risk_level} score={alt.risk_score} />
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-200">{alt.project_name}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{alt.district_name}, {alt.state_name}</p>
              </div>

              <div className="p-3 bg-slate-800/50 border border-slate-800 rounded-xl text-xs text-amber-300">
                <span className="font-semibold block text-[10px] text-amber-400 uppercase">Alert Trigger Reason:</span>
                {alt.reason}
              </div>

              <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-800">
                <span className="text-slate-400">Status: <strong className="text-slate-200">{alt.status}</strong></span>
                <div className="flex items-center space-x-2">
                  {alt.status !== 'Under Review' && (
                    <button
                      onClick={() => updateAlertStatus(alt.id, 'Under Review')}
                      className="px-2.5 py-1 bg-amber-600/20 text-amber-300 border border-amber-500/40 rounded text-xs"
                    >
                      Review
                    </button>
                  )}
                  {alt.status !== 'Resolved' && (
                    <button
                      onClick={() => updateAlertStatus(alt.id, 'Resolved')}
                      className="px-2.5 py-1 bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 rounded text-xs"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
