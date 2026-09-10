import React from 'react';
import { 
  LayoutDashboard, FolderGit2, Copy, AlertTriangle, TrendingUp, MapPin, 
  BarChart3, Sparkles, MessageSquareCode, Database, History, Settings, ShieldCheck 
} from 'lucide-react';

export type ViewType = 
  | 'dashboard' | 'projects' | 'duplicates' | 'alerts' 
  | 'predictive' | 'geospatial' | 'analytics' | 'insights' 
  | 'assistant' | 'datamgmt' | 'audit' | 'settings';

interface SidebarProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onSelectView }) => {
  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects Registry', icon: FolderGit2 },
    { id: 'duplicates', label: 'Duplicate Detection', icon: Copy, badge: 'AI' },
    { id: 'alerts', label: 'Alert Center', icon: AlertTriangle },
    { id: 'predictive', label: 'Predictive Analytics', icon: TrendingUp },
    { id: 'geospatial', label: 'Geospatial Intelligence', icon: MapPin },
    { id: 'analytics', label: 'State & District Matrix', icon: BarChart3 },
    { id: 'insights', label: 'System AI Insights', icon: Sparkles },
    { id: 'assistant', label: 'Intelligence Assistant', icon: MessageSquareCode, badge: 'NL' },
    { id: 'datamgmt', label: 'Data & ML Management', icon: Database },
    { id: 'audit', label: 'Audit Trail', icon: History },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 z-30">
      <div>
        {/* Government Header Branding */}
        <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-blue-700 to-indigo-600 rounded-xl shadow-lg shadow-blue-900/30 text-white">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-sm tracking-tight">MPLADS AI Sentinel</h1>
            <p className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold">MoSPI DIID Platform</p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id as ViewType)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Tagline */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-500 text-center">
        <p className="font-medium text-slate-400">Problem ID 26102</p>
        <p className="text-[10px] text-slate-600 mt-0.5">Government Monitoring Prototype</p>
      </div>
    </aside>
  );
};
