'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, ChevronDown, CheckCircle2, LayoutDashboard, Terminal } from 'lucide-react';
import { useNexus } from '@/lib/store/nexusContext';
import { UserAvatar } from '@/components/ui/UserAvatar';

interface TopbarProps {
  onOpenClosingModal: () => void;
  onToggleNotificationDrawer: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenClosingModal,
  onToggleNotificationDrawer,
}) => {
  const pathname = usePathname();
  const { currentUser, profiles, switchUser, notifications, areas, appMode, setAppMode, hasFinancialAccess } = useNexus();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const isAuthorizedForTerminal = hasFinancialAccess(currentUser);

  let contextTitle = 'Dashboard';
  let shortTitle = 'Dashboard';

  if (pathname === '/hub') {
    contextTitle = 'Central de Comando';
    shortTitle = 'Hub';
  } else if (pathname === '/areas') {
    contextTitle = 'Áreas Operacionais';
    shortTitle = 'Áreas';
  } else if (pathname?.startsWith('/areas/')) {
    const areaId = pathname.replace('/areas/', '');
    const foundArea = areas.find((a) => a.id === areaId);
    contextTitle = `Áreas / ${foundArea?.name || 'Detalhes'}`;
    shortTitle = foundArea?.name || 'Área';
  } else if (pathname === '/obligations') {
    contextTitle = 'Obrigações & Rituais';
    shortTitle = 'Rituais';
  } else if (pathname === '/alerts') {
    contextTitle = 'Central de Alertas';
    shortTitle = 'Alertas';
  } else if (pathname === '/chat') {
    contextTitle = 'Conversas Internas';
    shortTitle = 'Chat';
  } else if (pathname === '/financial') {
    contextTitle = 'Dashboard Financeiro';
    shortTitle = 'Finanças';
  } else if (pathname === '/terminal') {
    contextTitle = 'Terminal Bloomberg';
    shortTitle = 'Terminal';
  } else if (pathname === '/reports') {
    contextTitle = 'Relatórios Executivos';
    shortTitle = 'Relatórios';
  } else if (pathname === '/admin/simulacao') {
    contextTitle = 'Simulador Admin';
    shortTitle = 'Simulador';
  } else if (pathname === '/settings') {
    contextTitle = 'Configurações';
    shortTitle = 'Ajustes';
  }

  return (
    <header className="h-12 bg-slate-900 border-b border-slate-800 px-3 sm:px-4 flex items-center justify-between sticky top-0 z-30 select-none font-sans">
      {/* Left: Brand & Titles (Adaptive for Mobile/Desktop) */}
      <div className="flex items-center space-x-2.5 min-w-0">
        {/* Mobile Brand Icon */}
        <div className="md:hidden w-6 h-6 rounded bg-slate-800 border border-slate-700 text-sky-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
          NX
        </div>

        {/* Desktop Breadcrumbs */}
        <span className="hidden md:inline-block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider truncate">
          Nexus Operations / {appMode === 'FINANCIAL_TERMINAL' ? 'Terminal Bloomberg' : contextTitle}
        </span>

        {/* Mobile Short Title */}
        <span className="md:hidden text-xs font-bold text-slate-100 uppercase tracking-wider font-mono truncate">
          {shortTitle}
        </span>

        <span className="hidden lg:inline-block text-slate-700">|</span>

        {/* Desktop Dual Mode Switcher Button (Hidden on Mobile) */}
        <div className="hidden lg:flex items-center bg-slate-950 p-0.5 rounded border border-slate-800 text-xs font-mono font-medium">
          <button
            onClick={() => setAppMode('OPERATIONS')}
            className={`px-2.5 py-0.5 rounded transition-colors flex items-center space-x-1.5 cursor-pointer ${
              appMode === 'OPERATIONS'
                ? 'bg-slate-800 text-slate-100 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-3 h-3 text-sky-400" />
            <span>Modo Operacional</span>
          </button>

          <button
            onClick={() => setAppMode('FINANCIAL_TERMINAL')}
            className={`px-2.5 py-0.5 rounded transition-colors flex items-center space-x-1.5 cursor-pointer ${
              appMode === 'FINANCIAL_TERMINAL'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3 h-3 text-amber-400" />
            <span>Terminal Bloomberg</span>
            {isAuthorizedForTerminal && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1" />
            )}
          </button>
        </div>
      </div>

      {/* Right: Actions & User Dropdown */}
      <div className="flex items-center space-x-2 shrink-0">
        {/* Desktop-only Quick Closing Button (On mobile, it is in Bottom Nav) */}
        <button
          onClick={onOpenClosingModal}
          className="hidden sm:flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs px-2.5 py-1 rounded border border-slate-700 transition-colors cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Fechamento</span>
        </button>

        {/* Notifications Icon Button */}
        <button
          onClick={onToggleNotificationDrawer}
          className="relative p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Notificações"
          aria-label="Notificações"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
          )}
        </button>

        {/* User Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center space-x-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-xs text-slate-300 transition-colors hover:bg-slate-800 cursor-pointer"
          >
            <UserAvatar name={currentUser.name} size="sm" />
            <span className="font-medium text-xs hidden md:inline truncate max-w-[100px]">{currentUser.name}</span>
            <span className="px-1 py-0.2 text-[9px] font-mono font-semibold bg-slate-800 text-slate-400 rounded">
              {currentUser.role}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-1.5 w-60 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 border-b border-slate-800">
                <p className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                  Simular Perfil RLS
                </p>
              </div>
              <div className="max-h-56 overflow-y-auto py-0.5 divide-y divide-slate-800/40">
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      switchUser(p.id);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs hover:bg-slate-800 transition-colors cursor-pointer ${
                      p.id === currentUser.id ? 'bg-slate-800 text-slate-100 font-bold' : 'text-slate-300'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <p className="truncate font-medium text-xs">{p.name}</p>
                      <p className="text-[9px] font-mono text-slate-500 truncate">{p.department}</p>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 font-mono shrink-0">
                      {p.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
