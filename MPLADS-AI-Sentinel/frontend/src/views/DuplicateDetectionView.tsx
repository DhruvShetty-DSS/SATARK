import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Copy, MapPin, CheckCircle, AlertTriangle, XCircle, ArrowRightLeft } from 'lucide-react';

export const DuplicateDetectionView: React.FC = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCandidates = async () => {
    try {
      const res = await api.get('/duplicates');
      setCandidates(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleReview = async (candidateId: number, status: string) => {
    try {
      await api.put(`/duplicates/${candidateId}`, {
        review_status: status,
        notes: `Reviewed by Ministry Official on ${new Date().toLocaleDateString()}`
      });
      fetchCandidates();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
          <Copy className="w-5 h-5 text-indigo-400" />
          <span>Duplicate Work Detection Hub</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          NLP TF-IDF text similarity and geospatial proximity matching engine identifying potential duplicate work proposals.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Scanning duplicate candidate pairs...</div>
      ) : candidates.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          No unreviewed duplicate work pairs found.
        </div>
      ) : (
        <div className="space-y-4">
          {candidates.map((c) => (
            <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              {/* Pair Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                <div className="flex items-center space-x-3">
                  <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs font-bold rounded-lg">
                    Pair ID #{c.id}
                  </span>
                  <span className="text-xs text-slate-400">
                    Location: <strong className="text-slate-200">{c.district_name}, {c.state_name}</strong>
                  </span>
                </div>

                <div className="flex items-center space-x-4 text-xs font-semibold">
                  <span className="text-slate-400">
                    TF-IDF Text Match: <strong className="text-amber-400">{c.text_similarity_pct}%</strong>
                  </span>
                  <span className="text-slate-400">
                    Overall Match Score: <strong className="text-rose-400">{c.overall_similarity_pct}%</strong>
                  </span>
                </div>
              </div>

              {/* Side-by-Side Comparison */}
              <div className="grid md:grid-cols-2 gap-4 text-xs">
                {/* Project A */}
                <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl space-y-2">
                  <span className="text-[10px] uppercase font-bold text-blue-400">Project Candidate A</span>
                  <h4 className="font-semibold text-slate-100">{c.project_a_name}</h4>
                  <p className="text-[11px] text-slate-400">District: {c.district_name}</p>
                </div>

                {/* Project B */}
                <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl space-y-2">
                  <span className="text-[10px] uppercase font-bold text-indigo-400">Project Candidate B</span>
                  <h4 className="font-semibold text-slate-100">{c.project_b_name}</h4>
                  <p className="text-[11px] text-slate-400">District: {c.district_name}</p>
                </div>
              </div>

              {/* Action Workflow Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-3">
                <div className="text-xs">
                  <span className="text-slate-400">Status: </span>
                  <span className={`font-semibold ${
                    c.review_status === 'Confirmed Duplicate' ? 'text-rose-400' :
                    c.review_status === 'Valid Separate Projects' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>{c.review_status}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleReview(c.id, 'Valid Separate Projects')}
                    className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-semibold transition"
                  >
                    Mark Valid Separate
                  </button>
                  <button
                    onClick={() => handleReview(c.id, 'Confirmed Duplicate')}
                    className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/40 rounded-lg text-xs font-semibold transition"
                  >
                    Confirm Duplicate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
