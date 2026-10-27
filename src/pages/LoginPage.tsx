/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { UserRole } from '../types/index.ts';
import { GraduationCap, ShieldCheck, BookOpen, User, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, demoLogin, isLoading } = useAuth();
  const [email, setEmail] = useState('admin@college.edu');
  const [password, setPassword] = useState('AdminPassword123!');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    }
  };

  const handleQuickDemo = async (role: UserRole) => {
    setError(null);
    try {
      await demoLogin(role);
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* College Crest & Title */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-700 bg-slate-800 shadow-xl flex items-center justify-center mb-4">
            <img
              src="/src/assets/images/campus_crest_logo_1793112984074.jpg"
              alt="CampusCore Crest"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <GraduationCap className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">CampusCore SIS</h2>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise College Student Management & Academic Information System
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-800/90 backdrop-blur-md py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-slate-700">
          {error && (
            <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800 rounded-lg text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Institutional Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@college.edu"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Account Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-xs disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Sign In with Credentials</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Role Switcher for Evaluators */}
          <div className="mt-6 pt-5 border-t border-slate-700">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
              One-Click Portfolio Testing Roles
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="flex flex-col items-center justify-center p-2.5 bg-slate-900 hover:bg-slate-750 border border-slate-700 hover:border-indigo-500/60 rounded-xl transition-all text-center group"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-white">Dean</span>
                <span className="text-[10px] text-slate-400">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('teacher')}
                className="flex flex-col items-center justify-center p-2.5 bg-slate-900 hover:bg-slate-750 border border-slate-700 hover:border-emerald-500/60 rounded-xl transition-all text-center group"
              >
                <BookOpen className="w-4 h-4 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-white">Professor</span>
                <span className="text-[10px] text-slate-400">Teacher</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('student')}
                className="flex flex-col items-center justify-center p-2.5 bg-slate-900 hover:bg-slate-750 border border-slate-700 hover:border-blue-500/60 rounded-xl transition-all text-center group"
              >
                <GraduationCap className="w-4 h-4 text-blue-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-white">Arjun</span>
                <span className="text-[10px] text-slate-400">Student</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 text-center mt-3">
              Pre-configured for BSc IT evaluation. Click any role to test full RBAC permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
