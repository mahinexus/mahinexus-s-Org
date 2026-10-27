/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Award,
  BookOpen,
  UserCheck,
  History,
  Settings,
  HelpCircle,
  FileEdit,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigate,
  mobileOpen,
  onCloseMobile,
}) => {
  const { role, user } = useAuth();

  const handleNavClick = (tabId: string) => {
    onNavigate(tabId);
    onCloseMobile();
  };

  const adminNavItems = [
    { id: 'dashboard', label: 'Admin Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'students', label: 'Students Directory', icon: <Users className="w-4 h-4" /> },
    { id: 'attendance', label: 'Attendance Sessions', icon: <CalendarCheck className="w-4 h-4" /> },
    { id: 'marks', label: 'Marks & Grading', icon: <Award className="w-4 h-4" /> },
    { id: 'courses', label: 'Courses & Curriculum', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'users', label: 'User Management', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'audit', label: 'Activity Audit Log', icon: <History className="w-4 h-4" /> },
    { id: 'settings', label: 'System Diagnostics & Setup', icon: <Settings className="w-4 h-4" /> },
  ];

  const teacherNavItems = [
    { id: 'dashboard', label: 'Teacher Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'students', label: 'Assigned Students', icon: <Users className="w-4 h-4" /> },
    { id: 'attendance', label: 'Mark Attendance', icon: <CalendarCheck className="w-4 h-4" /> },
    { id: 'marks', label: 'Record Marks', icon: <Award className="w-4 h-4" /> },
    { id: 'courses', label: 'Curriculum & Syllabi', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'settings', label: 'System Information', icon: <Settings className="w-4 h-4" /> },
  ];

  const studentNavItems = [
    { id: 'dashboard', label: 'My Student Portal', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'attendance', label: 'My Attendance', icon: <CalendarCheck className="w-4 h-4" /> },
    { id: 'marks', label: 'My Grades & Marks', icon: <Award className="w-4 h-4" /> },
    { id: 'courses', label: 'Course Curriculum', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'correction', label: 'Request Profile Correction', icon: <FileEdit className="w-4 h-4" /> },
    { id: 'settings', label: 'System Information', icon: <Settings className="w-4 h-4" /> },
  ];

  const navItems = role === 'admin' ? adminNavItems : role === 'teacher' ? teacherNavItems : studentNavItems;

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-0 -translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo / College Brand */}
          <div className="p-5 border-b border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-700 bg-slate-800 shrink-0 flex items-center justify-center">
              <img
                src="/src/assets/images/campus_crest_logo_1793112984074.jpg"
                alt="University Crest"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback to stylized SVG icon if image fails
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <GraduationCap className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-white tracking-tight truncate">CampusCore SIS</h1>
              <p className="text-[11px] text-slate-400 truncate">Academic Year 2026–27</p>
            </div>
          </div>

          {/* User Role Banner */}
          <div className="mx-3 mt-4 px-3 py-2 bg-slate-800/80 rounded-lg border border-slate-750 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Access Tier</p>
              <p className="text-xs font-semibold text-indigo-300 capitalize">{role}</p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded">
              Verified
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map(item => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className={`${isActive ? 'text-white' : 'text-slate-400'}`}>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User footer profile summary */}
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white truncate">{user?.fullName}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
