import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'MP' | 'District Authority' | 'State Nodal Authority' | 'Ministry Admin';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  state?: string;
  district?: string;
  constituency?: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_USERS: Record<UserRole, User> = {
  'Ministry Admin': {
    id: 1,
    email: 'admin@mplads.gov.in',
    full_name: 'Rajesh Kumar (Ministry Admin)',
    role: 'Ministry Admin',
    state: 'All',
    district: 'All'
  },
  'State Nodal Authority': {
    id: 2,
    email: 'state@mplads.gov.in',
    full_name: 'Priya Sharma (State Nodal Officer)',
    role: 'State Nodal Authority',
    state: 'Maharashtra',
    district: 'All'
  },
  'District Authority': {
    id: 3,
    email: 'district@mplads.gov.in',
    full_name: 'Sanjay Patil (District Collector)',
    role: 'District Authority',
    state: 'Maharashtra',
    district: 'Pune'
  },
  'MP': {
    id: 4,
    email: 'mp@mplads.gov.in',
    full_name: 'Pralhad Venkatesh Joshi (Hon\'ble MP)',
    role: 'MP',
    state: 'Karnataka',
    district: 'DHARWAD',
    constituency: 'DHARWAD'
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(DEMO_USERS['Ministry Admin']);
  const [role, setRole] = useState<UserRole>('Ministry Admin');

  const login = (email: string, targetRole: UserRole) => {
    const selected = DEMO_USERS[targetRole] || DEMO_USERS['Ministry Admin'];
    setUser(selected);
    setRole(targetRole);
    localStorage.setItem('mplads_user_role', targetRole);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mplads_user_role');
  };

  const switchRole = (newRole: UserRole) => {
    const selected = DEMO_USERS[newRole];
    setUser(selected);
    setRole(newRole);
    localStorage.setItem('mplads_user_role', newRole);
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
