/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './Header.tsx';
import { Sidebar } from './Sidebar.tsx';
import { ToastProvider } from '../common/Toast.tsx';

interface AppLayoutProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ currentTab, onNavigate, children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
        <Header
          currentTab={currentTab}
          onNavigate={onNavigate}
          onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
        />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar
            currentTab={currentTab}
            onNavigate={onNavigate}
            mobileOpen={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
          />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
};
