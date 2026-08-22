'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileBottomNav } from './MobileBottomNav';
import { NotificationDrawer } from './NotificationDrawer';
import { PersonalAgentDrawer } from '../agent/PersonalAgentDrawer';
import { DailyClosingModal } from '../modals/DailyClosingModal';
import { ModeTransitionOverlay } from './ModeTransitionOverlay';
import { BloombergTerminal } from '../terminal/BloombergTerminal';
import { PWAInstallPrompt } from '../pwa/PWAInstallPrompt';
import { IncomingTaskPopUpBanner } from './IncomingTaskPopUpBanner';
import { TaskDetailsPopUpModal } from '../modals/TaskDetailsPopUpModal';
import { OwnerCriticalAlertModal } from '../modals/OwnerCriticalAlertModal';
import { LoadingSplashScreen } from './LoadingSplashScreen';
import { LoginScreen } from '../auth/LoginScreen';
import { useNexus } from '@/lib/store/nexusContext';

export function AppShell({ children }: { children: React.ReactNode }) {
  const {
    appMode,
    isTransitioningMode,
    setAppMode,
    activePopUpTask,
    setActivePopUpTask,
    isAuthenticated,
    isAuthChecking,
  } = useNexus();
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isAgentDrawerOpen, setIsAgentDrawerOpen] = useState(false);
  
  // Controle rigoroso de splash screen para NUNCA reaparecer durante a navegação entre abas
  const [showSplash, setShowSplash] = useState<boolean>(false);

  React.useEffect(() => {
    try {
      const alreadyLoaded = sessionStorage.getItem('yggdron_session_splash_done');
      if (!alreadyLoaded) {
        setShowSplash(true);
      }
    } catch {
      // Caso localStorage/sessionStorage esteja desabilitado
      setShowSplash(false);
    }
  }, []);

  const handleFinishSplash = () => {
    setShowSplash(false);
    try {
      sessionStorage.setItem('yggdron_session_splash_done', 'true');
    } catch {
      // ignore
    }
  };

  // 1. Splash Screen Inicial (exibida no primeiro carregamento do navegador)
  if (showSplash) {
    return <LoadingSplashScreen onFinish={handleFinishSplash} />;
  }

  // 2. Enquanto verifica a sessão salva, mantém tela escura com loader seguro
  if (isAuthChecking) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0B120E] text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-[#76B38B] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-[#6F9580] uppercase tracking-wider">
          Validando Credenciais Yggdron...
        </span>
      </div>
    );
  }

  // 3. Bloqueio 100% rigoroso: se não estiver autenticado, exibe SEMPRE a tela de login
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="h-screen max-h-screen w-screen overflow-hidden bg-[#EEF2EE] dark:bg-[#0B120E] text-[#111D15] dark:text-[#F2F6F3] flex flex-col font-sans antialiased">
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
              className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold px-3 py-1 rounded border border-amber-500/40 transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <span>VOLTAR AO MODO OPERACIONAL</span>
            </button>
          </div>

          <BloombergTerminal />
        </div>
      ) : (
        /* Standard Operational Workspace Layout with Mobile-First Adaptability */
        <div className="flex flex-1 h-full min-h-0 overflow-hidden">
          {/* Static, Non-scrolling Sidebar */}
          <Sidebar />

          {/* Right Column with Topbar Fixed and Main scrollable */}
          <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
            <Topbar
              onOpenClosingModal={() => setIsClosingModalOpen(true)}
              onToggleNotificationDrawer={() =>
                setIsNotificationDrawerOpen(!isNotificationDrawerOpen)
              }
              onToggleAgentDrawer={() => setIsAgentDrawerOpen(!isAgentDrawerOpen)}
            />

            {/* ONLY this main area scrolls! */}
            <main className="flex-1 min-h-0 overflow-y-auto pb-20 md:pb-6 focus:outline-none scroll-smooth">
              {children}
            </main>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Visible only on mobile devices) */}
      <MobileBottomNav onOpenClosingModal={() => setIsClosingModalOpen(true)} />

      {/* PWA Floating Install Prompt for Android, iOS & Desktop */}
      <PWAInstallPrompt />

      {/* Global Modals, Drawers & Pop-ups */}
      <IncomingTaskPopUpBanner />

      <OwnerCriticalAlertModal />

      <TaskDetailsPopUpModal
        task={activePopUpTask}
        onClose={() => setActivePopUpTask(null)}
      />

      <DailyClosingModal
        isOpen={isClosingModalOpen}
        onClose={() => setIsClosingModalOpen(false)}
      />

      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
      />

      <PersonalAgentDrawer
        isOpen={isAgentDrawerOpen}
        onClose={() => setIsAgentDrawerOpen(false)}
      />
    </div>
  );
}

export default AppShell;
