import React, { useState } from 'react';
import { useAuth, UserRole, DEMO_USERS } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@mplads.gov.in');
  const [password, setPassword] = useState('admin123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Ministry Admin');

  const handleQuickFill = (r: UserRole) => {
    setSelectedRole(r);
    const demo = DEMO_USERS[r];
    setEmail(demo.email);
    setPassword('admin123');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, selectedRole);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-slate-100 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Branding Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3.5 bg-gradient-to-tr from-blue-700 to-indigo-600 rounded-2xl shadow-xl shadow-blue-900/40 text-white">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">MPLADS AI Sentinel</h1>
            <p className="text-xs text-amber-400 font-semibold tracking-wider uppercase mt-1">
              Ministry of Statistics & Programme Implementation (MoSPI)
            </p>
          </div>
          <p className="text-xs text-slate-400">
            AI-powered intelligence & early-warning platform for transparent, efficient and accountable MPLADS implementation.
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-2xl shadow-2xl backdrop-blur space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Role Portal</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="Ministry Admin">Ministry Admin (MoSPI HQ)</option>
                <option value="State Nodal Authority">State Nodal Authority</option>
                <option value="District Authority">District Authority (Collector)</option>
                <option value="MP">Member of Parliament (MP)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Government Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2 pt-3"
            >
              <span>Access Security Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <p className="text-[11px] text-slate-400 font-semibold flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Demo Role Fill:</span>
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {(['Ministry Admin', 'State Nodal Authority', 'District Authority', 'MP'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleQuickFill(r)}
                  className="p-2 bg-slate-800/60 hover:bg-slate-800 text-slate-300 rounded border border-slate-700 text-left transition"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 text-center">
          Problem Statement 26102 Demonstration • Smart Automation Category
        </p>
      </div>
    </div>
  );
};
