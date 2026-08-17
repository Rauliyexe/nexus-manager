'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileBottomNav } from './MobileBottomNav';
import { NotificationDrawer } from './NotificationDrawer';
import { DailyClosingModal } from '../modals/DailyClosingModal';
import { ModeTransitionOverlay } from './ModeTransitionOverlay';
import { BloombergTerminal } from '../terminal/BloombergTerminal';
import { PWAInstallPrompt } from '../pwa/PWAInstallPrompt';
import { useNexus } from '@/lib/store/nexusContext';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { appMode, isTransitioningMode, setAppMode } = useNexus();
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-slate-800 selection:text-slate-100">
      {/* Mode Transition CRT Animation Overlay */}
      {isTransitioningMode && <ModeTransitionOverlay />}

      {/* 100% Fullscreen Immersive Bloomberg Terminal Experience */}
      {appMode === 'FINANCIAL_TERMINAL' ? (
        <div className="fixed inset-0 z-40 bg-black overflow-y-auto p-2">
          {/* Header Exit Toolbar */}
          <div className="flex items-center justify-between p-2 bg-slate-950 border border-amber-500/40 rounded mb-2 font-mono text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-bold text-amber-300">NEXUS TERMINAL — FULLSCREEN BLOOMBERG SYSTEM</span>
            </div>

            <button
              onClick={() => setAppMode('OPERATIONS')}
              className="bg-slate-900 hover:bg-slate-800 text-sky-400 font-bold px-3 py-1 rounded border border-sky-500/40 transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <span>VOLTAR AO MODO OPERACIONAL</span>
            </button>
          </div>

          <BloombergTerminal />
        </div>
      ) : (
        /* Standard Operational Workspace Layout with Mobile-First Adaptability */
        <div className="flex flex-1 min-h-screen">
          <Sidebar />

          <div className="flex-1 flex flex-col min-w-0">
            <Topbar
              onOpenClosingModal={() => setIsClosingModalOpen(true)}
              onToggleNotificationDrawer={() =>
                setIsNotificationDrawerOpen(!isNotificationDrawerOpen)
              }
            />

            <main className="flex-1 p-2 sm:p-4 pb-20 md:pb-4 overflow-y-auto">{children}</main>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Visible only on mobile devices) */}
      <MobileBottomNav onOpenClosingModal={() => setIsClosingModalOpen(true)} />

      {/* PWA Floating Install Prompt for Android, iOS & Desktop */}
      <PWAInstallPrompt />

      {/* Global Modals & Drawers */}
      <DailyClosingModal
        isOpen={isClosingModalOpen}
        onClose={() => setIsClosingModalOpen(false)}
      />

      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
      />
    </div>
  );
}

export default AppShell;
