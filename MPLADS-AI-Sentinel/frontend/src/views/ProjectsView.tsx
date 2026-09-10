import React, { useState, useEffect } from 'react';
import { api, Project } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { ProjectDetailModal } from '../components/ProjectDetailModal';
import { Search, Download, Filter, ChevronLeft, ChevronRight, Eye, RefreshCw } from 'lucide-react';

export const ProjectsView: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects', {
        params: {
          search,
          state: stateFilter,
          risk_level: riskFilter,
          status: statusFilter,
          category: categoryFilter,
          page,
          page_size: 15
        }
      });
      setProjects(res.data.projects);
      setTotal(res.data.total);
      setTotalPages(res.data.total_pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [page, stateFilter, riskFilter, statusFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProjects();
  };

  const handleExportCSV = () => {
    window.open(`http://127.0.0.1:8000/api/v1/projects/export/csv?state=${stateFilter}&risk_level=${riskFilter}`, '_blank');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Project Monitoring Hub</h1>
          <p className="text-xs text-slate-400 mt-0.5">Comprehensive audit and status tracking across all MPLADS works</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg shadow-md transition self-start md:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Projects CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by project name, ID, MP name, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <select
              value={stateFilter}
              onChange={(e) => { setStateFilter(e.target.value); setPage(1); }}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-lg px-3 py-2"
            >
              <option value="All">All States</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Kerala">Kerala</option>
              <option value="Bihar">Bihar</option>
              <option value="West Bengal">West Bengal</option>
            </select>

            <select
              value={riskFilter}
              onChange={(e) => { setRiskFilter(e.target.value); setPage(1); }}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-lg px-3 py-2"
            >
              <option value="All">All Risk Levels</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-lg px-3 py-2"
            >
              <option value="All">All Statuses</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Delayed">Delayed</option>
            </select>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg px-4 py-2 flex items-center justify-center space-x-1.5"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Apply Filters</span>
            </button>
          </div>
        </form>
      </div>

      {/* Projects Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex justify-center items-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
            <span>Fetching project records...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Work ID & Name</th>
                  <th className="p-3.5">State & District</th>
                  <th className="p-3.5">Sanctioned</th>
                  <th className="p-3.5">Expenditure</th>
                  <th className="p-3.5">Physical / Fin</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Risk Score</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 max-w-xs">
                      <span className="font-mono text-[10px] text-blue-400 font-bold block">{p.work_id}</span>
                      <span className="font-medium text-slate-200 line-clamp-1">{p.project_name}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-medium text-slate-200 block">{p.district_name}</span>
                      <span className="text-[11px] text-slate-400">{p.state_name}</span>
                    </td>
                    <td className="p-3.5 font-medium">₹{p.sanctioned_amount?.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 font-medium text-blue-400">₹{p.actual_expenditure?.toLocaleString('en-IN')}</td>
                    <td className="p-3.5">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-400">Phys: {p.physical_progress_pct}%</span>
                          <span className="text-blue-400">Fin: {p.financial_progress_pct}%</span>
                        </div>
                        <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
                          <div className="bg-emerald-500 h-full" style={{ width: `${p.physical_progress_pct}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        p.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                        p.status === 'Delayed' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {p.status} {p.delay_days > 0 ? `(${p.delay_days}d)` : ''}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <RiskBadge level={p.risk_level} score={p.risk_score} />
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedProject(p)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 font-medium rounded border border-slate-700 transition inline-flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-800/40 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Showing page {page} of {totalPages} ({total} total records)</span>
          <div className="flex items-center space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-1.5 bg-slate-800 rounded border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-200 px-2">{page}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-1.5 bg-slate-800 rounded border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <ProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </div>
  );
};
