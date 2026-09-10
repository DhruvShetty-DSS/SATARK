import React from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import { Search, Bell, UserCheck, ShieldAlert, Sparkles, ChevronDown } from 'lucide-react';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const { user, role, switchRole } = useAuth();

  const roleOptions: UserRole[] = [
    'Ministry Admin',
    'State Nodal Authority',
    'District Authority',
    'MP'
  ];

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Search Input */}
      <div className="flex items-center space-x-4 w-1/3">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects, IDs, MPs, districts..."
            onChange={(e) => onSearch && onSearch(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/70 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* Right Controls: Role Switcher & Profile */}
      <div className="flex items-center space-x-4">
        {/* Demo Indicator Tag */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Demo Data Mode Enabled</span>
        </div>

        {/* Notification Bell */}
        <div className="relative p-2 text-slate-400 hover:text-slate-200 transition cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
        </div>

        {/* Role Switcher Dropdown */}
        <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 rounded-lg p-1">
          <span className="text-[11px] font-semibold text-slate-400 pl-2">Role:</span>
          <select
            value={role}
            onChange={(e) => switchRole(e.target.value as UserRole)}
            className="bg-slate-900 text-xs font-semibold text-blue-400 px-2 py-1 rounded focus:outline-none border border-slate-700 cursor-pointer"
          >
            {roleOptions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Active User Avatar */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-300 flex items-center justify-center font-bold text-xs">
            {user?.full_name?.charAt(0) || 'A'}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-200 leading-tight">{user?.full_name?.split(' ')[0]}</p>
            <p className="text-[10px] text-slate-400 leading-tight">{role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
