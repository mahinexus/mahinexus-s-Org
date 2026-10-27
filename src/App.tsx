/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { AppLayout } from './components/layout/AppLayout.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { AdminDashboard } from './pages/AdminDashboard.tsx';
import { TeacherDashboard } from './pages/TeacherDashboard.tsx';
import { StudentDashboard } from './pages/StudentDashboard.tsx';
import { StudentsListPage } from './pages/StudentsListPage.tsx';
import { CoursesPage } from './pages/CoursesPage.tsx';
import { AttendancePage } from './pages/AttendancePage.tsx';
import { MarksPage } from './pages/MarksPage.tsx';
import { UsersManagementPage } from './pages/UsersManagementPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';

function MainRouter() {
  const { isAuthenticated, role } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        if (role === 'admin') return <AdminDashboard onNavigate={setCurrentTab} />;
        if (role === 'teacher') return <TeacherDashboard onNavigate={setCurrentTab} />;
        return <StudentDashboard />;

      case 'students':
        return <StudentsListPage />;

      case 'attendance':
        return <AttendancePage />;

      case 'marks':
        return <MarksPage />;

      case 'courses':
        return <CoursesPage />;

      case 'users':
      case 'audit':
        return <UsersManagementPage />;

      case 'settings':
        return <SettingsPage />;

      case 'correction':
        return <StudentDashboard />;

      default:
        if (role === 'admin') return <AdminDashboard onNavigate={setCurrentTab} />;
        if (role === 'teacher') return <TeacherDashboard onNavigate={setCurrentTab} />;
        return <StudentDashboard />;
    }
  };

  return (
    <AppLayout currentTab={currentTab} onNavigate={setCurrentTab}>
      {renderContent()}
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainRouter />
    </AuthProvider>
  );
}
