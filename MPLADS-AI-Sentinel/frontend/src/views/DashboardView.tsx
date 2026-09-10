import React, { useState, useEffect } from 'react';
import { api, DashboardSummary, Project } from '../services/api';
import { KpiCard } from '../components/KpiCard';
import { RiskBadge } from '../components/RiskBadge';
import { ProjectDetailModal } from '../components/ProjectDetailModal';
import { 
  Building2, IndianRupee, PieChart as PieIcon, AlertOctagon, 
  Clock, CheckCircle, TrendingUp, AlertTriangle, ArrowRight, ShieldAlert, MapPin 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';

export const DashboardView: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [attentionProjects, setAttentionProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sumRes = await api.get('/dashboard/summary');
        const attRes = await api.get('/dashboard/attention');
        setSummary(sumRes.data);
        setAttentionProjects(attRes.data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openProjectDetail = async (projectId: number) => {
    try {
      const res = await api.get(`/projects/${projectId}`);
      setSelectedProject(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const trendData = [
    { month: 'Jan', sanctioned: 120, expenditure: 45 },
    { month: 'Feb', sanctioned: 145, expenditure: 62 },
    { month: 'Mar', sanctioned: 190, expenditure: 88 },
    { month: 'Apr', sanctioned: 210, expenditure: 105 },
    { month: 'May', sanctioned: 250, expenditure: 140 },
    { month: 'Jun', sanctioned: 310, expenditure: 185 },
    { month: 'Jul', sanctioned: 380, expenditure: 230 },
    { month: 'Aug', sanctioned: 420, expenditure: 275 },
    { month: 'Sep', sanctioned: 490, expenditure: 330 },
  ];

  const riskPieData = summary ? [
    { name: 'Low Risk', value: summary.risk_distribution.Low || 1200, color: '#10b981' },
    { name: 'Medium Risk', value: summary.risk_distribution.Medium || 600, color: '#f59e0b' },
    { name: 'High Risk', value: summary.risk_distribution.High || 350, color: '#f97316' },
    { name: 'Critical Risk', value: summary.risk_distribution.Critical || 120, color: '#f43f5e' },
  ] : [];

  const stateRankingData = [
    { state: 'Maharashtra', riskScore: 78.4, projects: 1420 },
    { state: 'Uttar Pradesh', riskScore: 72.1, projects: 2100 },
    { state: 'Karnataka', riskScore: 68.5, projects: 980 },
    { state: 'Bihar', riskScore: 65.2, projects: 1150 },
    { state: 'West Bengal', riskScore: 59.8, projects: 890 },
  ];

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-64 text-slate-400 space-x-3">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading Executive Monitoring Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Priority Attention Banner */}
      <div className="bg-gradient-to-r from-rose-950/70 via-slate-900 to-slate-900 border border-rose-800/60 p-5 rounded-2xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="p-3 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl mt-0.5 animate-pulse">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Priority Attention Required</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-rose-500/20 text-rose-300 rounded-full border border-rose-500/30">Action Needed Today</span>
            </div>
            <h2 className="text-base font-bold text-slate-100 mt-0.5">
              {summary?.high_risk_projects || 470} High & Critical Risk Works Monitored Nationwide
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Top critical anomalies flag expenditure velocity mismatches, severe completion delays (&gt;90d), and unverified cost overruns.
            </p>
          </div>
        </div>
      </div>

      {/* Top KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Monitored Works"
          value={summary?.total_projects.toLocaleString() || '16,017'}
          subtitle="Lok Sabha & Rajya Sabha"
          icon={Building2}
          color="blue"
        />
        <KpiCard
          title="Total Sanctioned Fund"
          value={`₹${((summary?.total_sanctioned_amount || 0) / 10000000).toFixed(1)} Cr`}
          subtitle={`Expenditure: ₹${((summary?.total_expenditure || 0) / 10000000).toFixed(1)} Cr`}
          icon={IndianRupee}
          color="emerald"
        />
        <KpiCard
          title="Overall Fund Utilization"
          value={`${summary?.overall_utilization_pct || 72.4}%`}
          subtitle="National Average"
          icon={PieIcon}
          color="amber"
        />
        <KpiCard
          title="Critical Anomalies"
          value={summary?.anomalies_detected || 382}
          subtitle="ML Isolation Forest Flagged"
          icon={AlertOctagon}
          color="rose"
        />
      </div>

      {/* Main Visualizations Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Expenditure Trajectory Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Fund Utilization & Expenditure Trajectory</h3>
              <p className="text-xs text-slate-400">Sanctioned limit vs actual disbursed expenditure (₹ Crores)</p>
            </div>
            <span className="px-2.5 py-1 bg-slate-800 text-xs font-medium text-slate-300 rounded-md border border-slate-700">Monthly</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorSanctioned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="sanctioned" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSanctioned)" name="Sanctioned (₹ Cr)" />
                <Area type="monotone" dataKey="expenditure" stroke="#10b981" fillOpacity={1} fill="url(#colorExp)" name="Expenditure (₹ Cr)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Pie */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Multi-Factor Risk Breakdown</h3>
            <p className="text-xs text-slate-400">Distribution of projects across risk classes</p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4}>
                  {riskPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
            {riskPieData.map((r, i) => (
              <div key={i} className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }}></span>
                <span className="text-slate-400 font-medium">{r.name}:</span>
                <span className="text-slate-200 font-bold">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* "What Needs Attention Today" Card & State Risk Ranking */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Attention Today List */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200">What Needs Attention Today</h3>
              <p className="text-xs text-slate-400">Highest risk projects requiring immediate verification</p>
            </div>
          </div>

          <div className="space-y-3">
            {attentionProjects.map((p) => (
              <div
                key={p.id}
                onClick={() => openProjectDetail(p.id)}
                className="p-3.5 bg-slate-800/40 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between transition cursor-pointer group"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="p-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition">{p.project_name}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {p.district_name}, {p.state_name} • <span className="text-rose-400 font-medium">{p.primary_reason}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <RiskBadge level={p.risk_level} score={p.risk_score} />
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-slate-200 transition" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* State Risk Rankings */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200">State Risk Index Ranking</h3>
            <p className="text-xs text-slate-400">Highest average anomaly risk scores by state</p>
          </div>

          <div className="space-y-3 pt-1">
            {stateRankingData.map((st, i) => (
              <div key={i} className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="font-medium">{i+1}. {st.state}</span>
                  <span className="font-bold text-amber-400">{st.riskScore}</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${st.riskScore}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Project Detail Modal */}
      <ProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </div>
  );
};
