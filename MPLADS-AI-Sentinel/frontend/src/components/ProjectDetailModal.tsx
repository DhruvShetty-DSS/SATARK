import React from 'react';
import { Project } from '../services/api';
import { RiskBadge } from './RiskBadge';
import { X, CheckCircle2, AlertTriangle, Clock, Landmark, MapPin, Building, User, FileText, ArrowRight } from 'lucide-react';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose }) => {
  if (!project) return null;

  const costVariance = project.actual_expenditure - project.estimated_cost;
  const costVariancePct = project.estimated_cost > 0 ? (costVariance / project.estimated_cost) * 100 : 0;

  const reasons = project.risk_details?.explanation_text
    ? project.risk_details.explanation_text.split('; ')
    : ['Financial, timeline, and compliance metrics evaluated.'];

  const actions = project.risk_details?.recommended_actions_json || [
    'Verify physical progress photos on ground.',
    'Audit recent vendor disbursement receipts.',
    'Check administrative sanction order compliance.'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-slate-800/60 border-b border-slate-700/80 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-mono rounded">
                {project.work_id}
              </span>
              <RiskBadge level={project.risk_level} score={project.risk_score} />
              {project.is_demo_data && (
                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] rounded font-semibold uppercase">
                  Synthetic Demo Data
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-100">{project.project_name}</h2>
            <p className="text-xs text-slate-400 flex items-center space-x-2 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{project.district_name}, {project.state_name} ({project.constituency_name})</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Key Overview Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/40 border border-slate-800 p-3.5 rounded-xl">
              <p className="text-[11px] text-slate-400 font-medium uppercase">Recommending MP</p>
              <p className="text-xs font-semibold text-slate-200 mt-1">{project.mp_name}</p>
            </div>
            <div className="bg-slate-800/40 border border-slate-800 p-3.5 rounded-xl">
              <p className="text-[11px] text-slate-400 font-medium uppercase">Work Category</p>
              <p className="text-xs font-semibold text-slate-200 mt-1 truncate">{project.work_category}</p>
            </div>
            <div className="bg-slate-800/40 border border-slate-800 p-3.5 rounded-xl">
              <p className="text-[11px] text-slate-400 font-medium uppercase">Implementing Agency</p>
              <p className="text-xs font-semibold text-slate-200 mt-1 truncate">{project.implementing_agency || 'District PWD'}</p>
            </div>
            <div className="bg-slate-800/40 border border-slate-800 p-3.5 rounded-xl">
              <p className="text-[11px] text-slate-400 font-medium uppercase">Project Status</p>
              <p className="text-xs font-semibold text-slate-200 mt-1 flex items-center space-x-1.5">
                <span className={`w-2 h-2 rounded-full ${project.status === 'Completed' ? 'bg-emerald-400' : 'bg-blue-400'}`}></span>
                <span>{project.status} {project.delay_days > 0 ? `(${project.delay_days}d delay)` : ''}</span>
              </p>
            </div>
          </div>

          {/* Financial & Timeline Metrics */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Financial Overview */}
            <div className="bg-slate-800/50 border border-slate-700/60 p-5 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                <Landmark className="w-4 h-4 text-blue-400" />
                <span>Financial Trajectory</span>
              </h3>
              <div className="space-y-2 pt-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Sanctioned Amount:</span>
                  <span className="font-semibold text-slate-200">₹{project.sanctioned_amount?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Actual Expenditure:</span>
                  <span className="font-semibold text-blue-400">₹{project.actual_expenditure?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Utilization Rate:</span>
                  <span className="font-semibold text-emerald-400">{project.utilization_pct}%</span>
                </div>
                {costVariance > 0 && (
                  <div className="flex justify-between pt-2 border-t border-slate-700/60 text-rose-400 font-semibold">
                    <span>Cost Overrun Variance:</span>
                    <span>+₹{costVariance.toLocaleString('en-IN')} (+{costVariancePct.toFixed(1)}%)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Physical vs Financial Progress */}
            <div className="bg-slate-800/50 border border-slate-700/60 p-5 rounded-xl space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Ground Progress Alignment</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Physical Ground Work:</span>
                    <span className="font-bold text-emerald-400">{project.physical_progress_pct}%</span>
                  </div>
                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${project.physical_progress_pct}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Financial Disbursement:</span>
                    <span className="font-bold text-blue-400">{project.financial_progress_pct}%</span>
                  </div>
                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${project.financial_progress_pct}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Explainable AI Rationale Section */}
          <div className="bg-slate-800/70 border border-slate-700 p-5 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Explainable AI (XAI) Risk Rationale</span>
            </h3>
            <p className="text-xs text-slate-400">
              The multi-factor risk engine evaluated ML Isolation Forest scores and 10 compliance rules:
            </p>
            <ul className="space-y-2 pt-1">
              {reasons.map((r, i) => (
                <li key={i} className="flex items-start space-x-2.5 text-xs text-slate-200 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Actions */}
          <div className="bg-blue-950/30 border border-blue-800/50 p-5 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              <span>Recommended Administrative Action Plan</span>
            </h3>
            <div className="space-y-2">
              {actions.map((act, i) => (
                <div key={i} className="flex items-center space-x-3 text-xs text-blue-200">
                  <ArrowRight className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-800/80 border-t border-slate-700/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition"
          >
            Close Intelligence Profile
          </button>
        </div>
      </div>
    </div>
  );
};
