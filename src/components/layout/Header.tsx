/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { UserRole } from '../../types/index.ts';
import { LogOut, ChevronDown, ShieldCheck, GraduationCap, BookOpen, Menu } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onNavigate, onToggleMobileMenu }) => {
  const { user, role, switchRole, logout } = useAuth();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const roleLabels: Record<UserRole, { label: string; icon: React.ReactNode }> = {
    admin: { label: 'Administrator', icon: <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> },
    teacher: { label: 'Faculty / Teacher', icon: <BookOpen className="w-3.5 h-3.5 text-emerald-400" /> },
    student: { label: 'Enrolled Student', icon: <GraduationCap className="w-3.5 h-3.5 text-blue-400" /> },
  };

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'students', label: 'Students Directory' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'marks', label: 'Gradebook' },
    { id: 'courses', label: 'Curriculum' },
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-900 text-white border-b border-slate-800">
      {/* Zone 1: Single text wordmark with mobile hamburger */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <button
          onClick={() => onNavigate('dashboard')}
          className="text-base font-bold tracking-tight text-white hover:text-indigo-300 transition-colors whitespace-nowrap shrink-0 text-left"
        >
          CampusCore SIS
        </button>
      </div>

      {/* Zone 2: 4–5 clean single-line nav links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
        {navLinks.map(link => {
          const isActive = currentTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                isActive ? 'text-white border-b-2 border-indigo-500 font-semibold' : 'text-slate-400'
              }`}
            >
              {link.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: 1 primary action / account switcher */}
      <div className="flex items-center gap-3 shrink-0 relative">
        {/* Role Demo Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
            aria-expanded={isRoleDropdownOpen}
          >
            {roleLabels[role].icon}
            <span className="hidden sm:inline">{roleLabels[role].label}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-52 bg-white text-slate-900 rounded-lg shadow-xl border border-slate-200 py-1.5 z-50">
              <div className="px-3 py-1.5 border-b border-slate-100">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Switch Testing Role</p>
                <p className="text-xs font-medium text-slate-700 truncate">{user?.fullName}</p>
              </div>
              <button
                onClick={() => {
                  switchRole('admin');
                  setIsRoleDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                  role === 'admin' ? 'font-semibold text-indigo-600 bg-indigo-50/50' : 'text-slate-700'
                }`}
              >
                <span>Dean / Administrator</span>
                {role === 'admin' && <span className="text-[10px] text-indigo-600 font-mono">Active</span>}
              </button>
              <button
                onClick={() => {
                  switchRole('teacher');
                  setIsRoleDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                  role === 'teacher' ? 'font-semibold text-indigo-600 bg-indigo-50/50' : 'text-slate-700'
                }`}
              >
                <span>Faculty / Teacher</span>
                {role === 'teacher' && <span className="text-[10px] text-indigo-600 font-mono">Active</span>}
              </button>
              <button
                onClick={() => {
                  switchRole('student');
                  setIsRoleDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                  role === 'student' ? 'font-semibold text-indigo-600 bg-indigo-50/50' : 'text-slate-700'
                }`}
              >
                <span>Student Portal</span>
                {role === 'student' && <span className="text-[10px] text-indigo-600 font-mono">Active</span>}
              </button>
            </div>
          )}
        </div>

        {/* User initials & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-7 h-7 rounded-full bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center shrink-0">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
