/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types/index.ts';
import { api } from '../lib/api.ts';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  demoLogin: (role: UserRole) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_ADMIN_USER: UserProfile = {
  id: 'usr-admin-1',
  email: 'admin@college.edu',
  fullName: 'Dr. Eleanor Vance',
  role: 'admin',
  phone: '+1 (555) 234-5678',
  createdAt: '2024-01-10T08:00:00Z',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('campuscore_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_ADMIN_USER;
      }
    }
    return DEFAULT_ADMIN_USER;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('campuscore_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('campuscore_user');
    }
  }, [user]);

  const login = async (email: string, password: string, requestedRole?: UserRole) => {
    setIsLoading(true);
    try {
      const response = await api.login(email, password, requestedRole);
      setUser(response.user);
      localStorage.setItem('campuscore_user', JSON.stringify(response.user));
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (targetRole: UserRole) => {
    setIsLoading(true);
    try {
      const response = await api.demoLogin(targetRole);
      setUser(response.user);
      localStorage.setItem('campuscore_user', JSON.stringify(response.user));
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (targetRole: UserRole) => {
    await demoLogin(targetRole);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('campuscore_user');
  };

  const role: UserRole = user?.role || 'admin';
  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isLoading,
        login,
        demoLogin,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
