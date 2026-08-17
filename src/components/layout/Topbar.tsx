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
  if (pathname === '/hub') contextTitle = 'Central de Comando';
  else if (pathname === '/areas') contextTitle = 'Áreas Operacionais';
  else if (pathname?.startsWith('/areas/')) {
    const areaId = pathname.replace('/areas/', '');
    const foundArea = areas.find((a) => a.id === areaId);
    contextTitle = `Áreas / ${foundArea?.name || 'Detalhes'}`;
  } else if (pathname === '/obligations') contextTitle = 'Obrigações';
  else if (pathname === '/alerts') contextTitle = 'Central de Alertas';
  else if (pathname === '/chat') contextTitle = 'Conversas Internas';
  else if (pathname === '/financial') contextTitle = 'Dashboard Financeiro';
  else if (pathname === '/terminal') contextTitle = 'Terminal Bloomberg';
  else if (pathname === '/reports') contextTitle = 'Relatórios Executivos';
  else if (pathname === '/admin/simulacao') contextTitle = 'Simulador Admin';
  else if (pathname === '/settings') contextTitle = 'Configurações';

  return (
    <header className="h-12 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between sticky top-0 z-30 select-none font-sans">
      {/* Left: Breadcrumbs & Mode Switcher */}
      <div className="flex items-center space-x-3">
        <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
          Nexus Operations / {appMode === 'FINANCIAL_TERMINAL' ? 'Terminal Bloomberg' : contextTitle}
        </span>
        <span className="hidden md:inline-block text-slate-700">|</span>

        {/* Dual Mode Application Toggle Button */}
        <div className="flex items-center bg-slate-950 p-0.5 rounded border border-slate-800 text-xs font-mono font-medium">
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
            className={`px-2.5 py-0.5 rounded transition-colors flex items-center space-x-1.5 ${
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
      <div className="flex items-center space-x-2.5">
        <button
          onClick={onOpenClosingModal}
          className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs px-3 py-1 rounded border border-slate-700 transition-colors"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Registrar Fechamento</span>
        </button>

        <button
          onClick={onToggleNotificationDrawer}
          className="relative p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
          title="Notificações"
        >
          <Bell className="w-3.5 h-3.5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full" />
          )}
        </button>

        {/* User Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center space-x-2 bg-slate-950 px-2 py-1 rounded border border-slate-800 text-xs text-slate-300 transition-colors hover:bg-slate-800"
          >
            <UserAvatar name={currentUser.name} size="sm" />
            <span className="font-medium text-xs hidden sm:inline">{currentUser.name}</span>
            <span className="px-1 py-0.2 text-[9px] font-mono font-semibold bg-slate-800 text-slate-400 rounded">
              {currentUser.role}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-1 w-56 bg-slate-900 border border-slate-800 rounded shadow-xl py-1 z-50">
              <div className="px-3 py-1 border-b border-slate-800">
                <p className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                  Simular Perfil RLS
                </p>
              </div>
              <div className="max-h-52 overflow-y-auto py-0.5">
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      switchUser(p.id);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between text-xs hover:bg-slate-800 transition-colors ${
                      p.id === currentUser.id ? 'bg-slate-800 text-slate-100 font-bold' : 'text-slate-300'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <p className="truncate font-medium text-xs">{p.name}</p>
                      <p className="text-[9px] font-mono text-slate-500 truncate">{p.department}</p>
                    </div>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-slate-950 text-slate-400 font-mono">
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
